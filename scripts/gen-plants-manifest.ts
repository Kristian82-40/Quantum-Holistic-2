import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { PlantsSchema } from '../lib/schemas/plant'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

;(async () => {
  const sb = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { data, error } = await sb.from('plants').select('id, slug, categoria').order('id')
  if (error) throw error
  const plants = PlantsSchema.parse(data)
  mkdirSync('data', { recursive: true })
  writeFileSync('data/plants-manifest.json', JSON.stringify(plants, null, 2))
  if (!existsSync('data/pending-images.json')) {
    const pend = plants
      .filter(p => !existsSync(`public/images/plants/${p.slug}-cientifica.jpg`))
      .map(p => p.slug)
    writeFileSync('data/pending-images.json', JSON.stringify(pend, null, 2))
  }
  console.log(`✅ manifest: ${plants.length} plantas`)
})()
