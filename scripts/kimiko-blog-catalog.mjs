#!/usr/bin/env node
/**
 * kimiko-blog-catalog.mjs — Catálogo de estilos de imagen para el blog QH
 *
 * Cada post recibe UN estilo visual único y diferente.
 * 10 posts = 10 estilos distintos → catálogo para elegir el look definitivo del site.
 *
 * Guarda imágenes en public/images/blog/catalog/{slug}-{estilo}.jpg
 * Genera página HTML en public/blog-catalog.html
 *
 * Uso: node scripts/kimiko-blog-catalog.mjs
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, '..');
const OUT_DIR   = resolve(ROOT, 'public/images/blog/catalog');
const UA        = 'QH-Kimiko/2.0 (quantum-holistic.vercel.app; kristiantroncoso@gmail.com)';

// ---------------------------------------------------------------------------
// 10 posts × 10 estilos ÚNICOS
// Cada post lleva el estilo visual que mejor encaja con su temática
// ---------------------------------------------------------------------------
const CATALOG = [
  {
    slug:     'plantas-depurativas',
    title:    'Plantas Depurativas de Temporada',
    categoria:'Herbolaria',
    estilo:   {
      id:          'ilustracion-botanica',
      label:       '🌿 Ilustración Botánica Clásica',
      descripcion: 'Grabados científicos estilo Köhler — fondo blanco, detalle taxonómico, rigor botánico',
      queries:     [
        'urtica dioica botanical illustration Köhler',
        'dandelion taraxacum botanical engraving',
        'milk thistle silybum botanical plate',
        'medicinal plants botanical illustration vintage',
      ],
    },
  },
  {
    slug:     'ayuno-intermitente',
    title:    'Ayuno Intermitente y Salud Digestiva',
    categoria:'Nutrición',
    estilo:   {
      id:          'anatomia-cientifica',
      label:       '🔬 Anatomía Científica',
      descripcion: 'Diagramas médicos y anatómicos — estilo enciclopedia, precisión científica, didáctico',
      queries:     [
        'human digestive system anatomy illustration',
        'stomach intestine anatomy diagram vintage',
        'gastric digestion medical illustration',
        'human body anatomy encyclopaedia',
      ],
    },
  },
  {
    slug:     'microbiota-intestinal',
    title:    'Microbiota: el Segundo Cerebro',
    categoria:'Bienestar',
    estilo:   {
      id:          'microscopia-arte',
      label:       '🧫 Microscopía como Arte',
      descripcion: 'Imágenes microscópicas de bacterias y células — belleza científica invisible al ojo',
      queries:     [
        'bacteria microscope colorized scanning electron',
        'microorganism microscopy art colorful',
        'lactobacillus bacteria electron microscope',
        'cell biology microscopy colorized',
      ],
    },
  },
  {
    slug:     'curcuma-antiinflamatorio',
    title:    'Cúrcuma y Pimienta: Antiinflamatorio Natural',
    categoria:'Nutrición',
    estilo:   {
      id:          'acuarela-botanica',
      label:       '🎨 Acuarela Botánica',
      descripcion: 'Pinturas en acuarela — orgánico, cálido, artístico, colores suaves sobre fondo blanco',
      queries:     [
        'turmeric curcuma longa watercolor painting',
        'spices herbs watercolor illustration',
        'curcuma ginger botanical watercolor',
        'herbs spices aquarelle painting',
      ],
    },
  },
  {
    slug:     'plantas-adaptogenas',
    title:    'Adaptógenas: Ashwagandha, Rhodiola, Ginseng',
    categoria:'Herbología',
    estilo:   {
      id:          'grabado-medieval',
      label:       '📜 Grabado Medieval / Herbarium',
      descripcion: 'Woodcuts y grabados de herbarios medievales — austero, místico, sabiduría antigua',
      queries:     [
        'herbarium medieval woodcut plant illustration',
        'materia medica ancient herbal illustration',
        'ginseng root medieval herbarium engraving',
        'apothecary herbs medieval manuscript illustration',
      ],
    },
  },
  {
    slug:     'meditacion-mindfulness',
    title:    'Meditación y Mindfulness',
    categoria:'Mente',
    estilo:   {
      id:          'pintura-oriental',
      label:       '🖌️ Pintura Oriental / Ukiyo-e',
      descripcion: 'Arte japonés y budista — xilografías ukiyo-e, tinta china, zen, vacío y naturaleza',
      queries:     [
        'japanese zen buddhism painting ukiyo-e',
        'chinese ink painting landscape meditation',
        'japanese woodblock print nature',
        'zen garden painting japanese art',
      ],
    },
  },
  {
    slug:     'ayurveda-doshas',
    title:    'Ayurveda y los Tres Doshas',
    categoria:'Sabiduría',
    estilo:   {
      id:          'art-nouveau',
      label:       '✨ Art Nouveau / Simbolista',
      descripcion: 'Ilustraciones Art Nouveau y simbolistas — ornamental, místico, líneas fluidas, espiritualidad',
      queries:     [
        'art nouveau botanical poster illustration',
        'symbolist painting spiritual woman nature',
        'art nouveau ornamental floral design',
        'Gustav Klimt style botanical illustration',
      ],
    },
  },
  {
    slug:     'fermentados-probioticos',
    title:    'Fermentados: Kéfir, Kombucha, Chucrut',
    categoria:'Nutrición',
    estilo:   {
      id:          'fotografia-editorial',
      label:       '📷 Fotografía Editorial',
      descripcion: 'Fotografías reales de alimentos — composición editorial, texturas, luz natural, color honesto',
      queries:     [
        'fermented food jar photograph kombucha',
        'fermentation food photography natural light',
        'kefir yogurt fermented food photo',
        'food photography natural ingredients',
      ],
    },
  },
  {
    slug:     'dieta-mediterranea',
    title:    'Dieta Mediterránea Km0',
    categoria:'Nutrición',
    estilo:   {
      id:          'pintura-oleo',
      label:       '🖼️ Pintura al Óleo Clásica',
      descripcion: 'Bodegones y naturalezas muertas clásicas — profundidad cromática, tradición pictórica europea',
      queries:     [
        'mediterranean food still life oil painting',
        'olive oil bread fruit still life painting',
        'flemish still life vegetables fruit painting',
        'classical still life food painting European',
      ],
    },
  },
  {
    slug:     'aromaterapia-aceites',
    title:    'Aromaterapia y Aceites Esenciales',
    categoria:'Bienestar Holístico',
    estilo:   {
      id:          'art-deco',
      label:       '💎 Art Déco / Poster Vintage',
      descripcion: 'Carteles Art Déco y pósters de los años 20-30 — geometría, elegancia, lujo sobrio',
      queries:     [
        'art deco perfume poster vintage illustration',
        'vintage pharmacy apothecary label poster',
        'art deco botanical poster 1920s',
        'lavender essential oil vintage label art',
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Wikimedia fetch
// ---------------------------------------------------------------------------
async function fetchWikimedia(query) {
  const searchUrl =
    `https://commons.wikimedia.org/w/api.php?action=query&list=search` +
    `&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=15&format=json&origin=*`;

  const srRes = await fetch(searchUrl, { headers: { 'User-Agent': UA } });
  if (!srRes.ok) return null;
  const srData = await srRes.json();
  const results = srData?.query?.search ?? [];

  for (const result of results) {
    const title = result.title;
    const ext   = title.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png'].includes(ext)) continue;

    const infoUrl =
      `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}` +
      `&prop=imageinfo&iiprop=url|size&iiurlwidth=900&format=json&origin=*`;
    const infoRes  = await fetch(infoUrl, { headers: { 'User-Agent': UA } });
    if (!infoRes.ok) continue;
    const infoData = await infoRes.json();
    const pages    = Object.values(infoData?.query?.pages ?? {});
    const imgInfo  = pages[0]?.imageinfo?.[0];
    if (!imgInfo) continue;

    const imgUrl = imgInfo.thumburl || imgInfo.url;
    const imgRes = await fetch(imgUrl, { headers: { 'User-Agent': UA } });
    if (!imgRes.ok) continue;
    const buf = Buffer.from(await imgRes.arrayBuffer());
    if (buf.length < 15000) continue;

    return { buf, title: title.replace('File:', ''), url: imgUrl };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const results = [];

  for (const item of CATALOG) {
    const { slug, title, categoria, estilo } = item;
    console.log(`\n📄 ${title}  [${estilo.label}]`);

    const outPath = resolve(OUT_DIR, `${slug}-${estilo.id}.jpg`);

    if (existsSync(outPath)) {
      console.log(`  ✓ ya existe`);
      results.push({ slug, title, categoria, estilo, path: `/images/blog/catalog/${slug}-${estilo.id}.jpg`, source: '(cached)', ok: true });
      continue;
    }

    let found = null;
    for (const q of estilo.queries) {
      console.log(`  🔍 "${q}"`);
      found = await fetchWikimedia(q);
      if (found) break;
      await new Promise(r => setTimeout(r, 400));
    }

    if (found) {
      await writeFile(outPath, found.buf);
      const kb = (found.buf.length / 1024).toFixed(0);
      console.log(`  ✅ ${found.title} (${kb} KB)`);
      results.push({ slug, title, categoria, estilo, path: `/images/blog/catalog/${slug}-${estilo.id}.jpg`, source: found.title, ok: true });
    } else {
      console.log(`  ❌ no encontrada`);
      results.push({ slug, title, categoria, estilo, path: null, source: null, ok: false });
    }

    await new Promise(r => setTimeout(r, 600));
  }

  // HTML catálogo
  const html = buildHtml(results);
  await writeFile(resolve(ROOT, 'public/blog-catalog.html'), html, 'utf8');

  const ok = results.filter(r => r.ok).length;
  console.log(`\n✅ ${ok}/${results.length} imágenes generadas`);
  console.log(`📊 Catálogo: public/blog-catalog.html`);
  console.log(`🌐 En Vercel: https://quantum-holistic-2.vercel.app/blog-catalog.html`);
}

// ---------------------------------------------------------------------------
// HTML
// ---------------------------------------------------------------------------
function buildHtml(results) {
  const timestamp = new Date().toLocaleString('es-ES');

  const cards = results.map(r => {
    const img = r.ok
      ? `<img src="${r.path}" alt="${r.estilo.label} — ${r.title}" loading="lazy" />`
      : `<div class="no-img">❌ No encontrada en Wikimedia</div>`;

    return `
    <article class="card">
      <div class="card-header">
        <span class="badge">${r.categoria}</span>
        <span class="estilo-tag">${r.estilo.label}</span>
      </div>
      <div class="img-wrap">${img}</div>
      <div class="card-body">
        <h2>${r.title}</h2>
        <p class="desc">${r.estilo.descripcion}</p>
        <code>${r.slug}</code>
        ${r.source ? `<span class="source">© Wikimedia Commons</span>` : ''}
      </div>
    </article>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kimiko — Catálogo 10 Estilos · Quantum Holistic</title>
  <style>
    :root {
      --verde:#2d6a4f; --verde2:#52b788; --crema:#fdf6ec;
      --gris:#6b7280; --borde:#e5e7eb;
    }
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--crema);color:#1f2937;padding:2rem 1rem 5rem}
    header{max-width:960px;margin:0 auto 2.5rem;border-bottom:3px solid var(--verde);padding-bottom:1.5rem}
    header h1{font-size:1.8rem;color:var(--verde);margin-bottom:.4rem}
    header p{color:var(--gris);font-size:.9rem}
    .intro{max-width:960px;margin:0 auto 2rem;background:white;border:1px solid var(--borde);border-radius:10px;padding:1.2rem 1.5rem;font-size:.9rem;line-height:1.6;color:#374151}
    .intro strong{color:var(--verde)}
    .grid{max-width:960px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem}
    .card{background:white;border-radius:12px;border:1px solid var(--borde);overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.07);transition:transform .2s}
    .card:hover{transform:translateY(-3px)}
    .card-header{padding:.7rem 1rem;background:var(--verde);display:flex;align-items:center;justify-content:space-between;gap:.5rem;flex-wrap:wrap}
    .badge{background:var(--verde2);color:white;font-size:.7rem;font-weight:700;padding:.2rem .6rem;border-radius:20px}
    .estilo-tag{font-size:.75rem;color:rgba(255,255,255,.9);font-weight:600}
    .img-wrap{width:100%;aspect-ratio:4/3;overflow:hidden;background:#f3f4f6}
    .img-wrap img{width:100%;height:100%;object-fit:cover;display:block}
    .no-img{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--gris);font-size:.85rem;border:2px dashed var(--borde)}
    .card-body{padding:1rem}
    .card-body h2{font-size:.95rem;font-weight:700;margin-bottom:.4rem;line-height:1.3}
    .desc{font-size:.78rem;color:var(--gris);line-height:1.5;margin-bottom:.6rem}
    .card-body code{font-size:.68rem;background:#f3f4f6;padding:.2rem .4rem;border-radius:3px;display:block;margin-bottom:.4rem;color:#374151}
    .source{font-size:.65rem;color:#9ca3af;font-style:italic}
    footer{text-align:center;color:var(--gris);font-size:.78rem;margin-top:3rem}
  </style>
</head>
<body>
  <header>
    <h1>🌿 Kimiko — Catálogo de Estilos Visuales</h1>
    <p>Generado ${timestamp} · Quantum Holistic · 10 posts × 10 estilos únicos</p>
  </header>

  <div class="intro">
    <strong>Objetivo:</strong> cada artículo muestra un estilo visual diferente. Revisa el catálogo y decide cuál define mejor la identidad visual de Quantum Holistic.<br/>
    Estilos probados: <strong>Ilustración Botánica · Anatomía Científica · Microscopía · Acuarela · Grabado Medieval · Pintura Oriental · Art Nouveau · Fotografía Editorial · Pintura al Óleo · Art Déco</strong>
  </div>

  <div class="grid">${cards}</div>

  <footer>Imágenes de Wikimedia Commons (dominio público / CC). Kimiko pipeline · Quantum Holistic 2026</footer>
</body>
</html>`;
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
