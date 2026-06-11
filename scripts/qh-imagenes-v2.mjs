/**
 * qh-imagenes-v2.mjs
 * Descarga ilustraciones botánicas de Wikimedia Commons para los slugs
 * de Supabase que no tienen imagen en public/images/plants/.
 *
 * Plantas peligrosas → public/images/plants/_pending-approval/
 *   (requieren revisión visual antes de servirse en producción)
 * Resto → public/images/plants/{slug}-cientifica.jpg
 *
 * NUNCA usa Pollinations (402 confirmado).
 * NUNCA genera nombres plant-XX.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, createWriteStream, renameSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import https from 'node:https';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PLANTS_DIR    = resolve(ROOT, 'public/images/plants');
const PENDING_DIR   = resolve(ROOT, 'public/images/plants/_pending-approval');

// Lee .env.local manualmente (no hay dotenv en scripts)
const env = Object.fromEntries(
  readFileSync(resolve(ROOT, '.env.local'), 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Plantas que requieren aprobación visual antes de publicarse
const DANGEROUS = new Set([
  'aconito', 'datura', 'datura-metel', 'amanita-muscaria',
  'cannabis', 'cornezuelo-centeno', 'beleno-negro', 'tejo', 'hierba-mora',
]);

// ── Supabase fetch ──────────────────────────────────────────────────────────
async function getPlants() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/plants?select=id,slug,nombre_es,nombre_latino&order=nombre_es&limit=200`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
  return res.json();
}

// ── Wikimedia Commons search ────────────────────────────────────────────────
async function wikimediaSearch(query) {
  const params = new URLSearchParams({
    action:      'query',
    generator:   'search',
    gsrnamespace: '6',          // File namespace
    gsrsearch:   query,
    gsrlimit:    '8',
    prop:        'imageinfo',
    iiprop:      'url|mime|size',
    format:      'json',
    origin:      '*',
  });
  const url = `https://commons.wikimedia.org/w/api.php?${params}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'QuantumHolistic/1.0 (hola@quantumholistic.com)' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Wikimedia API error: ${res.status}`);
  const data = await res.json();
  const pages = Object.values(data.query?.pages ?? {});
  // Filtra sólo imágenes JPEG/PNG de tamaño razonable (>50KB, <8MB)
  return pages
    .flatMap(p => p.imageinfo ?? [])
    .filter(ii =>
      ii.mime && (ii.mime === 'image/jpeg' || ii.mime === 'image/png') &&
      ii.size > 50_000 && ii.size < 8_000_000 &&
      ii.url
    )
    .map(ii => ii.url);
}

// ── HTTP download (escritura atómica: temp → rename) ───────────────────────
function downloadFile(url, dest) {
  const tmp = dest + '.tmp';
  const cleanup = () => { try { unlinkSync(tmp); } catch {} };
  return new Promise((resolve, reject) => {
    const file = createWriteStream(tmp);
    const get = (u, redirects = 0) => {
      if (redirects > 5) { file.destroy(); cleanup(); reject(new Error('Too many redirects')); return; }
      https.get(u, { headers: { 'User-Agent': 'QuantumHolistic/1.0' } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          res.resume();
          get(res.headers.location, redirects + 1);
          return;
        }
        if (res.statusCode !== 200) {
          file.destroy(); cleanup();
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        res.pipe(file);
        file.on('finish', () => { file.close(); renameSync(tmp, dest); resolve(); });
        file.on('error', (err) => { cleanup(); reject(err); });
      }).on('error', (err) => { cleanup(); reject(err); });
    };
    get(url);
  });
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  mkdirSync(PLANTS_DIR,  { recursive: true });
  mkdirSync(PENDING_DIR, { recursive: true });

  console.log('Cargando plantas desde Supabase...');
  const plants = await getPlants();
  console.log(`  ${plants.length} plantas en Supabase\n`);

  const missing = plants.filter(p =>
    !existsSync(resolve(PLANTS_DIR, `${p.slug}-cientifica.jpg`))
  );

  if (missing.length === 0) {
    console.log('✅ Todas las plantas ya tienen imagen. Nada que hacer.');
    return;
  }

  console.log(`Faltantes: ${missing.length} imágenes\n${'─'.repeat(60)}`);

  const results = { ok: [], pending: [], notFound: [], error: [] };

  for (const plant of missing) {
    const isDangerous = DANGEROUS.has(plant.slug);
    const targetDir   = isDangerous ? PENDING_DIR : PLANTS_DIR;
    const destFile    = resolve(targetDir, `${plant.slug}-cientifica.jpg`);

    // Si ya descargado en pending, skip
    if (existsSync(destFile)) {
      console.log(`  ⏭  ${plant.slug} ya existe en ${isDangerous ? '_pending-approval' : 'plants'}`);
      (isDangerous ? results.pending : results.ok).push(plant.slug);
      continue;
    }

    const nombreLatino = plant.nombre_latino || plant.nombre_es;
    const queries = [
      `${nombreLatino} botanical illustration`,
      `${nombreLatino} plant engraving`,
      `${nombreLatino}`,
    ];

    let downloaded = false;
    for (const q of queries) {
      try {
        console.log(`  🔍 ${plant.slug} — buscando: "${q}"`);
        const urls = await wikimediaSearch(q);
        if (urls.length === 0) continue;

        await downloadFile(urls[0], destFile);
        const label = isDangerous ? '⚠  PENDIENTE APROBACIÓN' : '✅ OK';
        console.log(`  ${label} → ${plant.slug} (${isDangerous ? '_pending-approval/' : 'plants/'})`);
        (isDangerous ? results.pending : results.ok).push(plant.slug);
        downloaded = true;
        break;
      } catch (err) {
        console.log(`     ↳ error en "${q}": ${err.message}`);
      }
      // Pausa entre búsquedas para no saturar la API
      await new Promise(r => setTimeout(r, 2000));
    }

    if (!downloaded) {
      console.log(`  ✗  ${plant.slug} — sin resultado en Wikimedia`);
      results.notFound.push(plant.slug);
    }

    // Pausa entre plantas
    await new Promise(r => setTimeout(r, 3000));
  }

  // ── Resumen ──────────────────────────────────────────────────────────────
  console.log(`\n${'═'.repeat(60)}`);
  console.log('RESUMEN');
  console.log(`${'─'.repeat(60)}`);

  if (results.ok.length) {
    console.log(`✅ Generadas OK (${results.ok.length}):`);
    results.ok.forEach(s => console.log(`   public/images/plants/${s}-cientifica.jpg`));
  }

  if (results.pending.length) {
    console.log(`\n⚠  Pendientes de aprobación (${results.pending.length}):`);
    results.pending.forEach(s =>
      console.log(`   public/images/plants/_pending-approval/${s}-cientifica.jpg`)
    );
    console.log('\n   → Revisa visualmente, luego mueve con:');
    results.pending.forEach(s =>
      console.log(`     mv public/images/plants/_pending-approval/${s}-cientifica.jpg public/images/plants/`)
    );
  }

  if (results.notFound.length) {
    console.log(`\n✗  Sin imagen en Wikimedia (${results.notFound.length}):`);
    results.notFound.forEach(s => console.log(`   ${s} — el placeholder del frontend lo cubre`));
  }

  if (results.error.length) {
    console.log(`\n❌ Errores (${results.error.length}):`);
    results.error.forEach(s => console.log(`   ${s}`));
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
