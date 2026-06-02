import { readFileSync, existsSync } from 'node:fs'
const plants = JSON.parse(readFileSync('data/plants-manifest.json','utf8'))
const pending = new Set(JSON.parse(readFileSync('data/pending-images.json','utf8')))
const missing: string[] = [], ready: string[] = []
for (const p of plants) {
  const has = existsSync(`public/images/plants/${p.slug}-cientifica.jpg`)
  if (!has && !pending.has(p.slug)) missing.push(p.slug)   // regresión → bloquea
  if (has && pending.has(p.slug)) ready.push(p.slug)        // ya está → quitar de pending
}
if (ready.length) console.warn('⚠️  ya tienen imagen, quítalos de data/pending-images.json:', ready.join(', '))
if (missing.length) { console.error('❌ FALTAN (regresión, no en backlog):', missing.join(', ')); process.exit(1) }
console.log(`✅ ${plants.length} plantas | ${pending.size} en backlog conocido | 0 regresiones`)
