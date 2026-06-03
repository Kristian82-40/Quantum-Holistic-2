#!/usr/bin/env tsx
/**
 * check-plants — gate OFFLINE prebuild
 *
 * Falla el build si:
 *   (a) un slug status="rename" no tiene su {slug}-cientifica.jpg en public/images/plants
 *   (b) hay archivo plant-XX-*-cientifica.jpg residual (numeración secuencial prohibida)
 *       excepto si está en dangerous-plants.json (→ warning) o pending-images.json (→ warning)
 *
 * Las dangerous y las pending NO rompen el build, se reportan como warnings.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const PLANTS_DIR = join(ROOT, 'public/images/plants');

interface ManifestEntry {
  id: number;
  slug: string;
  status: 'rename' | 'generate' | 'dangerous';
  source: string | null;
  target: string;
}

interface DangerousEntry {
  slug: string;
}

// Load data files
const manifest: ManifestEntry[] = JSON.parse(
  readFileSync(join(ROOT, 'data/plants-manifest.json'), 'utf8')
);
const pendingRaw: Array<{ slug: string }> = JSON.parse(
  readFileSync(join(ROOT, 'data/pending-images.json'), 'utf8')
);
const dangerousRaw: { plants: DangerousEntry[] } = JSON.parse(
  readFileSync(join(ROOT, 'data/dangerous-plants.json'), 'utf8')
);

const pendingSlugs = new Set(pendingRaw.map((p) => p.slug));
const dangerousSlugs = new Set(dangerousRaw.plants.map((p) => p.slug));

const errors: string[] = [];
const warnings: string[] = [];

// ── (a) Slugs status="rename" deben tener su {slug}-cientifica.jpg ──────────
const renameEntries = manifest.filter((e) => e.status === 'rename');
for (const entry of renameEntries) {
  const targetPath = join(PLANTS_DIR, entry.target);
  if (!existsSync(targetPath)) {
    errors.push(`(a) Falta imagen renombrada: ${entry.target}  (slug: ${entry.slug})`);
  }
  // Además verificar que el source ya NO existe (fue renombrado correctamente)
  if (entry.source && existsSync(join(PLANTS_DIR, entry.source))) {
    errors.push(`(a) Source no renombrado todavía: ${entry.source} → ${entry.target}`);
  }
}

// ── (b) Archivos plant-XX-*-cientifica.jpg residuales ───────────────────────
const SEQUENTIAL_RE = /^plant-\d{2}-.+-cientifica\.(jpg|jpeg|png|webp)$/i;
const filesInDir = readdirSync(PLANTS_DIR);

for (const file of filesInDir) {
  if (!SEQUENTIAL_RE.test(file)) continue;

  // Extraer slug del nombre: plant-00-beleno-negro-cientifica.jpg → beleno-negro
  const slugMatch = file.match(/^plant-\d{2}-(.+)-cientifica\./i);
  const slug = slugMatch?.[1] ?? file;

  if (dangerousSlugs.has(slug)) {
    warnings.push(`(b) Dangerous plant-XX residual (aprobación manual pendiente): ${file}`);
  } else if (pendingSlugs.has(slug)) {
    warnings.push(`(b) Pending plant-XX residual (generación pendiente): ${file}`);
  } else {
    errors.push(`(b) Residual numeración secuencial PROHIBIDA: ${file} → renombrar a ${slug}-cientifica.jpg`);
  }
}

// ── Reporte de pending/dangerous como INFO ───────────────────────────────────
const pendingInfo = manifest.filter((e) => e.status === 'generate' && pendingSlugs.has(e.slug));
if (pendingInfo.length) {
  warnings.push(`INFO pending (${pendingInfo.length} sin imagen aún): ${pendingInfo.map((e) => e.slug).join(', ')}`);
}

// ── Salida ───────────────────────────────────────────────────────────────────
const renameOK = renameEntries.length - errors.filter((e) => e.startsWith('(a)')).length;

if (warnings.length) {
  console.warn('⚠️  WARNINGS:');
  warnings.forEach((w) => console.warn('   ', w));
}

if (errors.length) {
  console.error('\n❌ ERRORES (build bloqueado):');
  errors.forEach((e) => console.error('   ', e));
  process.exit(1);
}

console.log(
  `✅ Gate OK — rename: ${renameOK}/${renameEntries.length} · residuales: 0 · pending: ${pendingInfo.length} (warning)`
);
