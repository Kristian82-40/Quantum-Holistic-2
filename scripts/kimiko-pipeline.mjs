#!/usr/bin/env node
/**
 * kimiko-pipeline — autonomía end-to-end de Kimiko
 *
 *   generar → UPDATE Supabase → git rama/commit/push → abrir PR
 *
 * Encadena scripts/qh-generar-imagenes.mjs con la integración web completa.
 * Kimiko hace el 100% del trabajo mecánico; Papu/Cowork solo aprueban el PR.
 *
 * Política de seguridad:
 *   - NUNCA toca plantas peligrosas (las excluye el generador).
 *   - NUNCA pushea a main: siempre rama kimiko/images-<ts> + PR.
 *   - El deploy a producción ocurre solo al hacer merge del PR (decisión humana).
 *
 * Requiere en .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GITHUB_TOKEN
 *
 * Uso:
 *   node scripts/kimiko-pipeline.mjs            # ciclo completo
 *   node scripts/kimiko-pipeline.mjs sidr       # solo ese slug
 *   DRY_RUN=1 node scripts/kimiko-pipeline.mjs  # genera+update, NO git/PR
 */
import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PENDING = resolve(ROOT, 'data/pending-images.json');
const GEN = resolve(ROOT, 'scripts/qh-generar-imagenes.mjs');
const REPO = 'Kristian82-40/Quantum-Holistic-2';
const ARGS = process.argv.slice(2);

function log(m) { console.log(`[kimiko] ${m}`); }

// --- cargar .env.local (sin dependencias) -----------------------------------
async function loadEnv() {
  try {
    const raw = await readFile(resolve(ROOT, '.env.local'), 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch { /* sin .env.local: confiamos en el entorno */ }
}

function sh(cmd, args) {
  return execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf8' }).trim();
}

async function readPendingSlugs() {
  try {
    const arr = JSON.parse(await readFile(PENDING, 'utf8'));
    return new Set(arr.map((p) => p.slug));
  } catch { return new Set(); }
}

async function main() {
  await loadEnv();

  // 1) snapshot del pending ANTES
  const before = await readPendingSlugs();
  if (before.size === 0 && ARGS.length === 0) {
    log('pending vacío — nada que generar. Fin.');
    return;
  }

  // 2) generar (el generador excluye peligrosas y limpia el pending)
  log(`generando (${ARGS.length ? ARGS.join(',') : before.size + ' pendientes'})…`);
  try {
    sh('node', [GEN, ...ARGS]);
  } catch (e) {
    log(`generador terminó con avisos: ${e.message.split('\n')[0]}`);
  }

  // 3) slugs que aterrizaron = los que salieron del pending
  const after = await readPendingSlugs();
  const landed = [...before].filter((s) => !after.has(s));
  if (landed.length === 0) {
    log('0 imágenes nuevas generadas. Fin (sin cambios).');
    return;
  }
  log(`generadas: ${landed.length} → ${landed.join(', ')}`);

  // 4) UPDATE Supabase image_cientifica_url por cada slug nuevo
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  const sb = createClient(url, key, { auth: { persistSession: false } });

  const updated = [];
  for (const slug of landed) {
    const target = `/images/plants/${slug}-cientifica.jpg`;
    const { error } = await sb.from('plants').update({ image_cientifica_url: target }).eq('slug', slug);
    if (error) { log(`  ✗ Supabase ${slug}: ${error.message}`); continue; }
    updated.push(slug);
  }
  log(`Supabase actualizado: ${updated.length}/${landed.length}`);

  if (process.env.DRY_RUN) {
    log('DRY_RUN=1 → omito git/PR. Cambios locales listos para revisar.');
    return;
  }

  // 5) git: rama + commit + push (NUNCA main)
  const ts = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 16);
  const branch = `kimiko/images-${ts}`;
  const base = sh('git', ['rev-parse', '--abbrev-ref', 'HEAD']) || 'main';
  sh('git', ['checkout', '-b', branch]);
  sh('git', ['add', 'public/images/plants', 'data/pending-images.json']);
  const staged = sh('git', ['diff', '--cached', '--name-only']);
  if (!staged) {
    log('Imágenes ya presentes en HEAD — Supabase actualizado, sin cambios nuevos en git. Fin.');
    sh('git', ['checkout', base === branch ? 'main' : base]);
    sh('git', ['branch', '-d', branch]);
    return;
  }
  const msg = `feat(kimiko): ${landed.length} imágenes botánicas + Supabase URLs\n\n${landed.map((s) => `- ${s}`).join('\n')}\n\nGenerado autónomamente por Kimiko. Revisión visual antes de merge.`;
  sh('git', ['commit', '-m', msg]);
  sh('git', ['push', '-u', 'origin', branch]);
  log(`push OK → ${branch}`);

  // 6) PR vía GitHub REST API (sin gh CLI)
  const token = process.env.GITHUB_TOKEN;
  if (!token) { log('Sin GITHUB_TOKEN → push hecho, abre el PR a mano.'); return; }
  const res = await fetch(`https://api.github.com/repos/${REPO}/pulls`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'QH-Kimiko/2.0',
    },
    body: JSON.stringify({
      title: `Kimiko: ${landed.length} imágenes botánicas (${ts})`,
      head: branch,
      base: base === branch ? 'main' : base,
      body: `Generación autónoma de Kimiko.\n\n**Slugs:** ${landed.join(', ')}\n\n**Supabase:** ${updated.length} URLs actualizadas.\n\n⚠️ Revisión visual de las imágenes antes de merge. El merge dispara el deploy de Vercel.`,
    }),
  });
  if (!res.ok) {
    log(`PR no creado (HTTP ${res.status}): ${(await res.text()).slice(0, 200)}`);
    log(`Push hecho en ${branch} — abre el PR a mano.`);
    return;
  }
  const pr = await res.json();
  log(`PR abierto: ${pr.html_url}`);
}

main().catch((e) => { console.error('[kimiko] FATAL:', e.message); process.exit(1); });
