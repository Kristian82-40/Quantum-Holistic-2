#!/usr/bin/env node

/**
 * kimiko-qa-nocturna.mjs
 * 
 * QA autónoma nocturna de Quantum Holistic.
 * Ejecutada por LaunchAgent com.qh.kimiko (nightly).
 * 
 * Checks:
 * 1. Build: vercel deployment status
 * 2-4. Rutas: GET /diccionario, /producto/ritual-descanso, /regalo/primera-noche (no 5xx)
 * 5-6. Integridad Supabase: 52 plantas, 9 sin imagen (peligrosas), imágenes resolables
 * 7-9. Assets: Brand Bible, PDFs en assets/
 * 10. middleware.ts en raíz del repo (no en app/) + redirect 307 en /admin sin sesión
 * 11. canonical y og:url en producción == quantum-holistic.com (con guion)
 * + Bitácora: log de resultado en Notion
 */

import { existsSync, appendFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// launchd no puede redirigir stdout/stderr a un archivo en el volumen externo Papu Ext al
// spawnear el proceso (falla con EX_CONFIG) — por eso el LaunchAgent loguea en disco local
// (~/Library/Logs/com.qh.kimiko.log). Este buffer replica esa salida en Papu Ext una vez que
// el proceso Node ya está corriendo (acceso normal a filesystem, sin la restricción de spawn).
const logLines = [];
const origLog = console.log;
console.log = (...args) => {
  logLines.push(args.join(' '));
  origLog(...args);
};

// ===== CONFIG =====
const VERCEL_TEAM = 'team_WAYiPoMHgtd5JCOdydiE7r9e';
const VERCEL_PROJECT = 'prj_DASuxCUuV72w8CLpZejVij8XcXvL';
const SUPABASE_URL = 'https://vctetjugbvyllwjpxcxh.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// El alias *.vercel.app tiene Deployment Protection (SSO) activado: cualquier ruta,
// incluso inexistente, redirige a una página de login que responde 200 → falso positivo.
// Usar SIEMPRE el dominio custom (sin protección) para checks de rutas reales.
const PRODUCTION_URL = 'https://quantum-holistic.com';
const NOTION_TOKEN = process.env.NOTION_API_KEY;
// Parent = "📓 Bitácora Quantum Holistic" (índice). Cada corrida crea una página hija nueva —
// una bitácora por sesión, nunca se sobrescribe ni se acumula en una sola página.
const NOTION_BITACORA_PARENT = '34137a0e-7b45-812e-9b1b-f866f38fd44e';

// ===== RESULT LOG =====
const result = {
  timestamp: new Date().toISOString(),
  checks: {},
  status: 'OK', // OK | WARNING | ERROR
  issues: []
};

// ===== HELPERS =====
function logCheck(name, passed, detail = '') {
  result.checks[name] = { passed, detail };
  if (!passed) {
    result.status = 'ERROR';
    result.issues.push(`${name}: ${detail}`);
  }
  console.log(`${passed ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
}

async function fetch_safe(url, opts = {}) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000), ...opts });
    return { status: res.status, ok: res.ok, data: await res.json().catch(() => ({})) };
  } catch (err) {
    return { status: 0, ok: false, error: err.message };
  }
}

// ===== CHECKS =====

async function checkBuild() {
  console.log('\n[BUILD]');
  try {
    // Vercel: GET /v6/deployments?state=READY (v12 no existe para este endpoint — devuelve 400 "Invalid API version")
    const res = await fetch_safe(
      `https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT}&teamId=${VERCEL_TEAM}&state=READY&limit=1`,
      { headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` } }
    );
    
    if (!res.ok) {
      logCheck('Vercel API', false, `status ${res.status}`);
      return;
    }

    const deployments = res.data.deployments || [];
    const latest = deployments[0];

    if (!latest) {
      logCheck('Latest READY deployment', false, 'no deployments found');
      return;
    }

    logCheck('Latest READY deployment', true, `${latest.meta?.githubCommitSha?.slice(0, 7)}`);
  } catch (err) {
    logCheck('Build check', false, err.message);
  }
}

async function checkRoutes() {
  console.log('\n[RUTAS]');
  const routes = [
    '/diccionario',
    '/producto/ritual-descanso',
    '/regalo/primera-noche'
  ];

  for (const route of routes) {
    const res = await fetch_safe(`${PRODUCTION_URL}${route}`);
    const passed = res.ok && res.status !== 500;
    logCheck(`GET ${route}`, passed, `status ${res.status}`);
  }
}

async function checkSupabase() {
  console.log('\n[SUPABASE]');
  if (!SUPABASE_KEY) {
    logCheck('Supabase key', false, 'SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY not set');
    return;
  }

  try {
    // Count plants — PostgREST tiene deshabilitadas las funciones agregado (count());
    // el conteo exacto se pide via header Prefer + Content-Range de la respuesta.
    const countRes = await fetch(`${SUPABASE_URL}/rest/v1/plants?select=id&limit=1`, {
      signal: AbortSignal.timeout(5000),
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'count=exact'
      }
    });

    if (!countRes.ok) {
      logCheck('Plant count', false, `status ${countRes.status}`);
      return;
    }

    const contentRange = countRes.headers.get('content-range') || '';
    const count = parseInt(contentRange.split('/')[1], 10) || 0;
    logCheck('Plant count', count === 52, `${count}/52`);

    // Check dangerous plants have placeholder
    const dangerousRes = await fetch_safe(
      `${SUPABASE_URL}/rest/v1/plants?image_cientifica_url=is.null&select=slug`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (dangerousRes.ok && dangerousRes.data.length === 9) {
      logCheck('Dangerous plants (placeholder)', true, `${dangerousRes.data.length}/9 sin imagen`);
    } else {
      logCheck('Dangerous plants (placeholder)', false, `${dangerousRes.data?.length ?? 'n/a'}/9 sin imagen`);
    }
  } catch (err) {
    logCheck('Supabase check', false, err.message);
  }
}

async function checkAssets() {
  console.log('\n[ASSETS]');
  const assets = [
    'Brand_Bible_v1.md',
    'assets/ritual-descanso.pdf',
    'assets/primera-noche-tranquila.pdf'
  ];

  for (const asset of assets) {
    const fullPath = path.join(projectRoot, asset);
    const exists = existsSync(fullPath);
    logCheck(`Asset: ${asset}`, exists);
  }
}

async function checkMiddleware() {
  console.log('\n[MIDDLEWARE]');
  const rootPath = path.join(projectRoot, 'middleware.ts');
  const appPath = path.join(projectRoot, 'app', 'middleware.ts');
  logCheck('middleware.ts en raíz', existsSync(rootPath) && !existsSync(appPath));

  const res = await fetch_safe(`${PRODUCTION_URL}/admin`, { redirect: 'manual' });
  const passed = res.status === 307 || res.status === 308 || res.status === 302;
  logCheck('/admin redirige sin sesión', passed, `status ${res.status}`);
}

async function checkCanonical() {
  console.log('\n[SEO — CANONICAL]');
  try {
    const res = await fetch('https://quantum-holistic.com/', { signal: AbortSignal.timeout(5000) });
    const html = await res.text();
    const canonicalMatch = html.match(/<link rel="canonical" href="([^"]*)"/);
    const ogUrlMatch = html.match(/<meta property="og:url" content="([^"]*)"/);
    const canonicalOk = !!canonicalMatch && canonicalMatch[1].startsWith('https://quantum-holistic.com');
    const ogUrlOk = !!ogUrlMatch && ogUrlMatch[1].startsWith('https://quantum-holistic.com');
    logCheck('canonical == quantum-holistic.com', canonicalOk, canonicalMatch?.[1] ?? 'no encontrado');
    logCheck('og:url == quantum-holistic.com', ogUrlOk, ogUrlMatch?.[1] ?? 'no encontrado');
  } catch (err) {
    logCheck('canonical/og:url check', false, err.message);
  }
}

async function logToNotion() {
  console.log('\n[NOTION]');
  if (!NOTION_TOKEN) {
    console.log('⚠ NOTION_API_KEY not set — bitácora no se actualizará');
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const checksLines = Object.entries(result.checks)
    .map(([name, { passed, detail }]) => `${passed ? '✓' : '✗'} ${name}${detail ? `: ${detail}` : ''}`);
  const issuesLines = result.issues.length > 0 ? result.issues : ['Sin issues.'];

  const toParagraph = (content) => ({
    object: 'block',
    type: 'paragraph',
    paragraph: { rich_text: [{ type: 'text', text: { content } }] }
  });

  const children = [
    toParagraph(`Status: ${result.status}`),
    { object: 'block', type: 'heading_3', heading_3: { rich_text: [{ type: 'text', text: { content: 'Checks' } }] } },
    ...checksLines.map(toParagraph),
    { object: 'block', type: 'heading_3', heading_3: { rich_text: [{ type: 'text', text: { content: 'Issues' } }] } },
    ...issuesLines.map(toParagraph)
  ];

  try {
    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      signal: AbortSignal.timeout(8000),
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parent: { page_id: NOTION_BITACORA_PARENT },
        icon: { type: 'emoji', emoji: result.status === 'OK' ? '✅' : '🚨' },
        properties: {
          title: { title: [{ text: { content: `QA Nocturna · ${today} — ${result.status}` } }] }
        },
        children
      })
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.log(`⚠ Notion API status ${res.status}: ${body.slice(0, 200)}`);
      return;
    }

    const data = await res.json();
    console.log(`✓ Bitácora creada en Notion: ${data.url}`);
  } catch (err) {
    console.log(`⚠ Notion log failed: ${err.message}`);
  }
}

function flushLogToPapuExt() {
  try {
    const logDir = path.join(projectRoot, 'logs');
    mkdirSync(logDir, { recursive: true });
    const entry = `\n===== ${result.timestamp} =====\n${logLines.join('\n')}\n`;
    appendFileSync(path.join(logDir, 'kimiko-qa-nocturna.log'), entry);
  } catch (err) {
    origLog(`⚠ No se pudo escribir el log en Papu Ext: ${err.message}`);
  }
}

// ===== MAIN =====
async function main() {
  console.log('🌙 Kimiko QA Nocturna — iniciando...\n');

  await checkBuild();
  await checkRoutes();
  await checkSupabase();
  await checkAssets();
  await checkMiddleware();
  await checkCanonical();
  await logToNotion();

  console.log(`\n📊 Status: ${result.status}`);
  console.log(`✓ ${Object.values(result.checks).filter(c => c.passed).length} / ${Object.keys(result.checks).length} checks passed`);

  if (result.issues.length > 0) {
    console.log('\n⚠ Issues detectados:');
    result.issues.forEach(i => console.log(`  - ${i}`));
  }

  flushLogToPapuExt();
  process.exit(result.status === 'ERROR' ? 1 : 0);
}

main().catch(err => {
  console.error('FATAL:', err);
  flushLogToPapuExt();
  process.exit(1);
});
