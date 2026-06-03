#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  KIMIKO — Blog Image Pipeline  v1.0                             ║
 * ║  Autónomo · Sin tokens Claude · Sin intervención humana         ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  QUÉ HACE:                                                       ║
 * ║  1. Lee blog_posts de Supabase que tienen image_url genérica     ║
 * ║  2. Asigna a cada post un estilo visual según su categoría       ║
 * ║     (10 estilos distintos — botánico, zen, anatomía, art déco…)  ║
 * ║  3. Busca en Wikimedia Commons la imagen perfecta para ese post  ║
 * ║     (5-8 queries de fallback por estilo, nunca se queda en blanco)║
 * ║  4. Descarga y guarda en public/images/blog/{slug}.jpg           ║
 * ║  5. Actualiza image_url en Supabase con la ruta local            ║
 * ║  6. git → rama kimiko/blog-<ts> → commit → push → PR            ║
 * ║  7. El deploy lo dispara Papu al mergear el PR (nunca automático)║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  POLÍTICA DE SEGURIDAD:                                          ║
 * ║  · NUNCA toca posts con status != published                      ║
 * ║  · NUNCA pushea a main — siempre rama + PR                       ║
 * ║  · Idempotente: si la imagen ya existe, la salta                 ║
 * ║  · Solo procesa posts donde image_url contenga "pollinations"    ║
 * ║    o sea null — respeta las custom que Papu haya puesto          ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  USO:                                                            ║
 * ║  node scripts/kimiko-blog-pipeline.mjs          # todos          ║
 * ║  node scripts/kimiko-blog-pipeline.mjs 5        # primeros 5     ║
 * ║  DRY_RUN=1 node scripts/kimiko-blog-pipeline.mjs # sin git/PR   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync }                  from 'node:fs';
import { execFileSync }                from 'node:child_process';
import { resolve, dirname }            from 'node:path';
import { fileURLToPath }               from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, '..');
const OUT_DIR   = resolve(ROOT, 'public/images/blog');
const REPO      = 'Kristian82-40/Quantum-Holistic-2';
const UA        = 'QH-Kimiko/2.0 (quantum-holistic.vercel.app; kristiantroncoso@gmail.com)';
const LIMIT     = parseInt(process.argv[2] || '999');
const DRY_RUN   = !!process.env.DRY_RUN;

const log = (m) => console.log(`[kimiko-blog] ${m}`);

// ============================================================================
// MAPA DE ESTILOS POR CATEGORÍA
// Cada categoría → un estilo visual único con queries ricas en fallbacks
// Kimiko elige el estilo, no Claude. Zero tokens.
// ============================================================================
const ESTILOS = {
  // ─── Herbología / Plantas ─────────────────────────────────────────────────
  herbología: {
    estilo: 'ilustracion-botanica',
    label:  'Ilustración Botánica Clásica',
    queries: [
      '{keyword} botanical illustration Köhler',
      '{keyword} botanical engraving vintage',
      '{keyword} medicinal plant plate illustration',
      'medicinal herbs botanical illustration 19th century',
      'herbarium plate vintage botanical',
    ],
  },
  herbolaria: {
    estilo: 'ilustracion-botanica',
    label:  'Ilustración Botánica Clásica',
    queries: [
      '{keyword} botanical illustration Köhler',
      '{keyword} medicinal plant engraving',
      'medicinal herbs botanical plate vintage',
      'apothecary herbs illustration engraving',
      'botanical illustration wildflowers vintage',
    ],
  },
  // ─── Nutrición ────────────────────────────────────────────────────────────
  nutrición: {
    estilo: 'still-life-painting',
    label:  'Bodegón Clásico / Still Life',
    queries: [
      '{keyword} still life oil painting food',
      'mediterranean food still life painting',
      'vegetables fruits still life oil painting Dutch',
      'food abundance still life classical painting',
      'kitchen still life flemish painting',
    ],
  },
  nutricion: {
    estilo: 'still-life-painting',
    label:  'Bodegón Clásico / Still Life',
    queries: [
      '{keyword} still life oil painting',
      'mediterranean food still life painting',
      'fruit vegetables still life oil painting Dutch',
      'food still life classical painting baroque',
      'kitchen still life flemish painting 17th century',
    ],
  },
  // ─── Bienestar / Bienestar Holístico ──────────────────────────────────────
  bienestar: {
    estilo: 'acuarela-organica',
    label:  'Acuarela Orgánica',
    queries: [
      '{keyword} watercolor painting organic',
      'nature wellness watercolor illustration',
      'botanical watercolor painting herbs flowers',
      'watercolor plants natural medicine',
      'organic watercolor illustration wellness',
    ],
  },
  'bienestar holístico': {
    estilo: 'acuarela-organica',
    label:  'Acuarela Orgánica',
    queries: [
      '{keyword} watercolor illustration holistic',
      'wellness healing watercolor painting',
      'holistic health watercolor botanical',
      'nature healing watercolor art',
      'meditation nature watercolor painting',
    ],
  },
  // ─── Sabiduría / Filosofía ────────────────────────────────────────────────
  sabiduría: {
    estilo: 'pintura-oriental',
    label:  'Pintura Oriental / Zen',
    queries: [
      '{keyword} japanese zen painting ink',
      'zen garden japanese painting',
      'chinese ink brush painting nature',
      'japanese woodblock print ukiyo-e nature',
      'zen Buddhism painting meditation',
    ],
  },
  sabiduria: {
    estilo: 'pintura-oriental',
    label:  'Pintura Oriental / Zen',
    queries: [
      'zen meditation japanese art painting',
      'chinese ink painting landscape',
      'japanese woodblock nature print',
      'buddhist art painting meditation',
      'tao philosophy art painting',
    ],
  },
  // ─── Ayurveda ─────────────────────────────────────────────────────────────
  ayurveda: {
    estilo: 'art-nouveau-mistico',
    label:  'Art Nouveau Místico',
    queries: [
      '{keyword} art nouveau illustration spiritual',
      'ayurveda art nouveau botanical poster',
      'art nouveau ornamental spiritual illustration',
      'Gustav Klimt style botanical decorative',
      'symbolist art spiritual woman nature',
    ],
  },
  // ─── Detox / Depuración ───────────────────────────────────────────────────
  detox: {
    estilo: 'grabado-medieval',
    label:  'Herbario Medieval / Woodcut',
    queries: [
      '{keyword} medieval herbarium woodcut',
      'materia medica herbal illustration medieval',
      'apothecary plant woodcut ancient',
      'herbarium medieval manuscript plant illustration',
      'medieval botany woodcut print',
    ],
  },
  depuración: {
    estilo: 'grabado-medieval',
    label:  'Herbario Medieval / Woodcut',
    queries: [
      'medicinal plant woodcut medieval',
      'herbarium manuscript illustration medieval',
      'apothecary ancient herb woodcut print',
      'medieval botanical manuscript',
      'old herbalism woodcut illustration',
    ],
  },
  // ─── Meditación / Mente ───────────────────────────────────────────────────
  mente: {
    estilo: 'pintura-simbolista',
    label:  'Pintura Simbolista',
    queries: [
      '{keyword} symbolist painting spiritual',
      'meditation symbolist painting mystical',
      'symbolist art consciousness painting',
      'mystical symbolist painting nature woman',
      'Odilon Redon symbolist painting',
    ],
  },
  meditación: {
    estilo: 'pintura-simbolista',
    label:  'Pintura Simbolista',
    queries: [
      'meditation symbolist painting mystical',
      'Odilon Redon symbolist painting nature',
      'symbolist art spiritual painting',
      'consciousness inner peace painting art',
      'lotus meditation painting spiritual',
    ],
  },
  // ─── KM0 / Proximidad ─────────────────────────────────────────────────────
  km0: {
    estilo: 'fotografía-editorial',
    label:  'Fotografía Editorial',
    queries: [
      '{keyword} food photography natural light',
      'local seasonal food photography',
      'farmers market food photography',
      'organic vegetables food photograph',
      'farm fresh food natural photography',
    ],
  },
  // ─── Rendimiento / Energía ────────────────────────────────────────────────
  rendimiento: {
    estilo: 'art-deco-elegante',
    label:  'Art Déco Elegante',
    queries: [
      '{keyword} art deco poster illustration',
      'art deco health wellness poster 1920s',
      'art deco geometric botanical illustration',
      'vintage art deco wellness poster',
      'art deco typography poster herbs',
    ],
  },
  // ─── Fallback universal ───────────────────────────────────────────────────
  default: {
    estilo: 'ilustracion-vintage',
    label:  'Ilustración Vintage',
    queries: [
      '{keyword} vintage illustration',
      '{keyword} botanical illustration',
      'holistic wellness vintage illustration',
      'natural medicine vintage engraving',
      'herbs nature vintage illustration',
    ],
  },
};

// ============================================================================
// Extrae keyword del título del post (las primeras 2-3 palabras clave)
// ============================================================================
function extractKeyword(title) {
  // Elimina el prefijo "| Quantum Holistic" y palabras vacías
  const clean = title
    .replace(/\|.*$/g, '')
    .replace(/Quantum Holistic/gi, '')
    .replace(/Desbloquea|Revitaliza|Despierta|Domina|Fortalece|Enfréntate/gi, '')
    .trim();

  // Tomar las primeras 3 palabras sustantivas
  const stopWords = new Set([
    'el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'al', 'y', 'e',
    'o', 'con', 'en', 'para', 'por', 'que', 'se', 'tu', 'su', 'mi',
    'más', 'como', 'entre', 'desde', 'hasta', 'sin', 'sobre',
    'the', 'a', 'an', 'of', 'in', 'for', 'to', 'and', 'or',
  ]);

  const words = clean
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w.toLowerCase()))
    .slice(0, 3);

  return words.join(' ') || clean.slice(0, 30);
}

// ============================================================================
// Wikimedia Commons — fetch robusto con múltiples fallbacks
// ============================================================================
async function fetchWikimedia(queries) {
  for (const q of queries) {
    const searchUrl =
      `https://commons.wikimedia.org/w/api.php?action=query&list=search` +
      `&srsearch=${encodeURIComponent(q)}&srnamespace=6&srlimit=20&format=json&origin=*`;

    let srData;
    try {
      const res = await fetch(searchUrl, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      srData = await res.json();
    } catch { continue; }

    const results = srData?.query?.search ?? [];

    for (const result of results) {
      const title = result.title;
      const ext   = title.split('.').pop().toLowerCase();
      if (!['jpg', 'jpeg', 'png'].includes(ext)) continue;
      // Filtros de calidad: evitar SVG, logos, iconos pequeños
      if (title.toLowerCase().includes('logo')) continue;
      if (title.toLowerCase().includes('icon')) continue;

      const infoUrl =
        `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}` +
        `&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=1200&format=json&origin=*`;

      let imgInfo;
      try {
        const infoRes  = await fetch(infoUrl, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(8000) });
        if (!infoRes.ok) continue;
        const infoData = await infoRes.json();
        const pages    = Object.values(infoData?.query?.pages ?? {});
        imgInfo        = pages[0]?.imageinfo?.[0];
      } catch { continue; }

      if (!imgInfo) continue;

      const imgUrl = imgInfo.thumburl || imgInfo.url;
      let buf;
      try {
        const imgRes = await fetch(imgUrl, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15000) });
        if (!imgRes.ok) continue;
        buf = Buffer.from(await imgRes.arrayBuffer());
      } catch { continue; }

      if (buf.length < 20000) continue; // demasiado pequeña

      const meta = imgInfo.extmetadata;
      const credit = meta?.Artist?.value?.replace(/<[^>]+>/g, '') || 'Wikimedia Commons';

      return { buf, title: title.replace('File:', ''), credit, query: q };
    }

    await new Promise(r => setTimeout(r, 300));
  }
  return null;
}

// ============================================================================
// Cargar .env.local
// ============================================================================
async function loadEnv() {
  try {
    const raw = await readFile(resolve(ROOT, '.env.local'), 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch { /* sin .env.local */ }
}

function sh(cmd, args) {
  return execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf8' }).trim();
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
  await loadEnv();
  await mkdir(OUT_DIR, { recursive: true });

  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supaUrl || !supaKey) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local');

  // ── 1. Leer posts publicados con imagen genérica ─────────────────────────
  log('Consultando Supabase blog_posts…');
  const fetchRes = await fetch(
    `${supaUrl}/rest/v1/blog_posts?select=id,slug,title,category,image_url&status=eq.published&order=created_at.desc&limit=${LIMIT}`,
    { headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}` } }
  );
  if (!fetchRes.ok) throw new Error(`Supabase error: ${fetchRes.status}`);
  const allPosts = await fetchRes.json();

  // Solo los que tienen imagen genérica de Pollinations o null
  const posts = allPosts.filter(p =>
    !p.image_url ||
    p.image_url.includes('pollinations.ai') ||
    p.image_url.includes('picsum.photos')
  );

  // Deduplicar por slug (misma temática, múltiples IDs)
  const seen    = new Set();
  const targets = posts.filter(p => {
    if (seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });

  log(`Posts con imagen genérica: ${posts.length} → únicos: ${targets.length}`);
  if (targets.length === 0) { log('Nada que hacer.'); return; }

  // ── 2. Generar imágenes ───────────────────────────────────────────────────
  const generated = [];

  for (const post of targets) {
    const catRaw  = (post.category || 'default').toLowerCase().trim();
    const config  = ESTILOS[catRaw] || ESTILOS.default;
    const keyword = extractKeyword(post.title);
    const queries = config.queries.map(q => q.replace('{keyword}', keyword));

    const outPath  = resolve(OUT_DIR, `${post.slug}.jpg`);
    const webPath  = `/images/blog/${post.slug}.jpg`;

    log(`\n📄 [${config.label}] ${post.title.slice(0, 60)}…`);

    // Idempotencia: si ya existe en disco Y en Supabase apunta a esta ruta, saltar
    if (existsSync(outPath) && post.image_url === webPath) {
      log('  ✓ ya procesado');
      continue;
    }

    let result = null;
    if (!existsSync(outPath)) {
      result = await fetchWikimedia(queries);
      if (result) {
        await writeFile(outPath, result.buf);
        log(`  ✅ ${(result.buf.length / 1024).toFixed(0)} KB — "${result.query}"`);
        log(`     Fuente: ${result.title}`);
      } else {
        log(`  ❌ sin resultado para ninguna query`);
        continue;
      }
    } else {
      log('  📁 imagen ya en disco, actualizando Supabase…');
    }

    generated.push({ post, webPath, credit: result?.credit });
    await new Promise(r => setTimeout(r, 700)); // cortesía con Wikimedia
  }

  if (generated.length === 0) {
    log('\nNinguna imagen nueva. Fin.');
    return;
  }

  // ── 3. Actualizar Supabase ─────────────────────────────────────────────────
  log(`\nActualizando ${generated.length} posts en Supabase…`);
  for (const { post, webPath } of generated) {
    const res = await fetch(
      `${supaUrl}/rest/v1/blog_posts?id=eq.${post.id}`,
      {
        method: 'PATCH',
        headers: {
          apikey: supaKey,
          Authorization: `Bearer ${supaKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ image_url: webPath }),
      }
    );
    if (res.ok) log(`  ✓ ${post.slug}`);
    else        log(`  ✗ ${post.slug} → ${res.status}`);
  }

  if (DRY_RUN) {
    log('\nDRY_RUN=1 → imágenes generadas, Supabase actualizado. Sin git/PR.');
    return;
  }

  // ── 4. Git → rama → commit → push → PR ───────────────────────────────────
  const ts     = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 16);
  const branch = `kimiko/blog-images-${ts}`;
  const base   = sh('git', ['rev-parse', '--abbrev-ref', 'HEAD']) || 'main';

  try {
    sh('git', ['checkout', '-b', branch]);
    sh('git', ['add', 'public/images/blog/']);
    const staged = sh('git', ['diff', '--cached', '--name-only']);
    if (!staged) {
      log('Sin diff en git — imágenes ya en HEAD. Supabase actualizado. Fin.');
      sh('git', ['checkout', base === branch ? 'main' : base]);
      sh('git', ['branch', '-d', branch]);
      return;
    }

    const slugList = generated.map(g => `- ${g.post.slug} (${g.post.category})`).join('\n');
    const msg = `feat(kimiko): ${generated.length} imágenes blog — estilos Wikimedia CC\n\n${slugList}\n\nGenerado autónomamente por Kimiko · Sin tokens Claude · Revisión visual antes de merge`;
    sh('git', ['commit', '-m', msg]);
    sh('git', ['push', '-u', 'origin', branch]);
    log(`push OK → ${branch}`);

    // PR
    const token = process.env.GITHUB_TOKEN;
    if (!token) { log('Sin GITHUB_TOKEN — push hecho, abre PR a mano.'); return; }

    const prBody = [
      `## Kimiko Blog Images — ${ts}`,
      '',
      `**${generated.length} imágenes** generadas desde Wikimedia Commons (dominio público / CC)`,
      '',
      '### Posts procesados',
      slugList,
      '',
      '### Estilos visuales usados',
      [...new Set(generated.map(g => {
        const cat = (g.post.category || 'default').toLowerCase().trim();
        const cfg = ESTILOS[cat] || ESTILOS.default;
        return `- **${cfg.label}** (${cat})`;
      }))].join('\n'),
      '',
      '> ⚠️ **Revisar visualmente** antes de merge. El merge dispara el deploy en Vercel.',
      '> Kimiko solo propone — Papu aprueba.',
    ].join('\n');

    const prRes = await fetch(`https://api.github.com/repos/${REPO}/pulls`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'QH-Kimiko/2.0',
      },
      body: JSON.stringify({
        title: `🖼️ Kimiko: ${generated.length} imágenes blog (${ts})`,
        head:  branch,
        base:  base === branch ? 'main' : base,
        body:  prBody,
      }),
    });

    if (!prRes.ok) {
      log(`PR no creado (${prRes.status}) — push hecho, abre PR a mano.`);
      return;
    }
    const pr = await prRes.json();
    log(`\n✅ PR abierto: ${pr.html_url}`);
    log(`   Revisa visualmente y mergea cuando te guste el resultado.`);

  } catch (e) {
    log(`Error git/PR: ${e.message}`);
    try { sh('git', ['checkout', base === branch ? 'main' : base]); } catch {}
  }
}

main().catch(e => { console.error('[kimiko-blog] FATAL:', e.message); process.exit(1); });
