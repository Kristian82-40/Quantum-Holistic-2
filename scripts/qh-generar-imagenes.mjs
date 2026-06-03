#!/usr/bin/env node
/**
 * qh-generar-imagenes — generación autónoma de imágenes botánicas (Kimiko)
 *
 * Lee data/pending-images.json → genera {slug}-cientifica.jpg en public/images/plants
 * Provider variable: PROVIDER=wikimedia (default) | pollinations | modelslab
 *
 * Uso:
 *   node scripts/qh-generar-imagenes.mjs              # genera todo el pending
 *   node scripts/qh-generar-imagenes.mjs sidr hinojo  # solo esos slugs
 *   PROVIDER=pollinations node scripts/qh-generar-imagenes.mjs
 *
 * Regla de oro: archivo = {slug}-cientifica.jpg, SIN número secuencial.
 * NUNCA genera las plantas peligrosas (data/dangerous-plants.json).
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PENDING = resolve(ROOT, 'data/pending-images.json');
const DANGEROUS = resolve(ROOT, 'data/dangerous-plants.json');
const OUT_DIR = resolve(ROOT, 'public/images/plants');

const PROVIDER = (process.env.PROVIDER || 'wikimedia').toLowerCase();
const ARGS = process.argv.slice(2);
const UA = 'QH-Kimiko/2.0 (quantum-holistic.vercel.app; kristiantroncoso@gmail.com)';

// ---------------------------------------------------------------------------
// Provider: Wikimedia Commons — ilustraciones botánicas de dominio público
// ---------------------------------------------------------------------------
async function fetchWikimedia({ nombre_latino }) {
  // Términos de búsqueda en orden de preferencia
  const queries = [
    `${nombre_latino} botanical illustration`,
    `${nombre_latino} Koehler`,
    `${nombre_latino} plate`,
    nombre_latino,
  ];

  for (const q of queries) {
    const searchUrl =
      `https://commons.wikimedia.org/w/api.php?action=query&list=search` +
      `&srsearch=${encodeURIComponent(q)}&srnamespace=6&srlimit=10&format=json&origin=*`;
    const srRes = await fetch(searchUrl, { headers: { 'User-Agent': UA } });
    if (!srRes.ok) continue;
    const srData = await srRes.json();
    const results = srData?.query?.search ?? [];

    for (const result of results) {
      const title = result.title; // "File:Foeniculum_vulgare_Koehler.jpg"
      const ext = title.split('.').pop().toLowerCase();
      if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) continue;

      const infoUrl =
        `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}` +
        `&prop=imageinfo&iiprop=url|size&iiurlwidth=1024&format=json&origin=*`;
      const infoRes = await fetch(infoUrl, { headers: { 'User-Agent': UA } });
      if (!infoRes.ok) continue;
      const infoData = await infoRes.json();
      const pages = Object.values(infoData?.query?.pages ?? {});
      const imgInfo = pages[0]?.imageinfo?.[0];
      if (!imgInfo) continue;

      const imgUrl = imgInfo.thumburl || imgInfo.url;
      const imgRes = await fetch(imgUrl, { headers: { 'User-Agent': UA } });
      if (!imgRes.ok) continue;
      const buf = Buffer.from(await imgRes.arrayBuffer());
      if (buf.length < 10000) continue; // imagen demasiado pequeña

      console.log(`    ↳ Wikimedia: ${title.replace('File:', '')} (${(buf.length / 1024).toFixed(0)} KB)`);
      return buf;
    }
  }
  throw new Error(`No se encontró imagen en Wikimedia Commons para "${nombre_latino}"`);
}

// ---------------------------------------------------------------------------
// Provider: Pollinations — generación IA keyless
// ---------------------------------------------------------------------------
function buildPrompt({ nombre_latino, familia }) {
  return [
    `Botanical scientific illustration of ${nombre_latino} (family ${familia})`,
    'watercolor on aged paper, acuarela botánica científica',
    'full plant with leaves, flowers and roots, scientifically accurate morphology',
    'soft natural daylight, muted earthy palette, fine ink linework',
    'vintage herbarium plate style, no text, no labels, no watermark, centered composition',
  ].join(', ');
}

async function fetchPollinations(plant) {
  const prompt = buildPrompt(plant);
  const seed = Math.floor(Math.random() * 1e9);
  // model=turbo es el tier gratuito; flux requiere plan de pago (HTTP 402)
  const url =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=1024&height=1024&model=turbo&nologo=true&seed=${seed}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Pollinations HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 5000) throw new Error(`Pollinations devolvió ${buf.length} bytes (sospechoso)`);
  return buf;
}

// ---------------------------------------------------------------------------
// Provider: ModelsLab (requiere MODELSLAB_API_KEY)
// ---------------------------------------------------------------------------
async function fetchModelsLab(plant) {
  const key = process.env.MODELSLAB_API_KEY;
  if (!key) throw new Error('MODELSLAB_API_KEY no configurada');
  const prompt = buildPrompt(plant);
  const res = await fetch('https://modelslab.com/api/v6/realtime/text2img', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, prompt, width: 1024, height: 1024, samples: 1, safety_checker: false }),
  });
  if (!res.ok) throw new Error(`ModelsLab HTTP ${res.status}`);
  const data = await res.json();
  const imgUrl = data?.output?.[0];
  if (!imgUrl) throw new Error(`ModelsLab sin output: ${JSON.stringify(data).slice(0, 200)}`);
  const img = await fetch(imgUrl);
  return Buffer.from(await img.arrayBuffer());
}

// ---------------------------------------------------------------------------
const PROVIDERS = {
  wikimedia: fetchWikimedia,
  pollinations: fetchPollinations,
  modelslab: fetchModelsLab,
};

async function generateOne(plant) {
  const primary = PROVIDERS[PROVIDER] ?? fetchWikimedia;
  let buf;
  try {
    buf = await primary(plant);
  } catch (e) {
    // Fallback: si el provider primario falla y hay alternativa disponible
    if (PROVIDER !== 'wikimedia') {
      console.warn(`  ⚠ ${PROVIDER} falló (${e.message}), fallback Wikimedia`);
      buf = await fetchWikimedia(plant);
    } else if (process.env.MODELSLAB_API_KEY) {
      console.warn(`  ⚠ Wikimedia falló (${e.message}), fallback ModelsLab`);
      buf = await fetchModelsLab(plant);
    } else {
      throw e;
    }
  }
  const target = resolve(OUT_DIR, `${plant.slug}-cientifica.jpg`);
  await writeFile(target, buf);
  return { target, bytes: buf.length };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const pending = JSON.parse(await readFile(PENDING, 'utf8'));
  const dangerous = new Set(
    (JSON.parse(await readFile(DANGEROUS, 'utf8')).plants || []).map((p) => p.slug)
  );

  let work = ARGS.length ? pending.filter((p) => ARGS.includes(p.slug)) : pending;
  work = work.filter((p) => {
    if (dangerous.has(p.slug)) {
      console.warn(`  ⛔ ${p.slug} es PELIGROSA — saltada (requiere aprobación manual)`);
      return false;
    }
    return true;
  });

  console.log(`Provider: ${PROVIDER} · a generar: ${work.length}\n`);
  const done = [];
  const failed = [];

  for (const plant of work) {
    const out = resolve(OUT_DIR, `${plant.slug}-cientifica.jpg`);
    if (existsSync(out) && !process.env.FORCE) {
      console.log(`  ⏭ ${plant.slug} ya existe (FORCE=1 para regenerar)`);
      done.push(plant.slug);
      continue;
    }
    try {
      const { bytes } = await generateOne(plant);
      console.log(`  ✓ ${plant.slug}-cientifica.jpg (${(bytes / 1024).toFixed(0)} KB)`);
      done.push(plant.slug);
    } catch (e) {
      console.error(`  ✗ ${plant.slug}: ${e.message}`);
      failed.push(plant.slug);
    }
    // pausa cortés entre requests
    if (work.indexOf(plant) < work.length - 1) await new Promise(r => setTimeout(r, 1500));
  }

  // Limpia del pending los que aterrizaron
  const remaining = pending.filter((p) => !done.includes(p.slug));
  await writeFile(PENDING, JSON.stringify(remaining, null, 2) + '\n');

  console.log(`\nHecho: ${done.length} · fallidos: ${failed.length} · pending restante: ${remaining.length}`);
  if (failed.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
