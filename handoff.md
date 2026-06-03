# Handoff — 2026-06-03

## Estado del proyecto
- **Deploy Vercel:** commit `99ef0ca` pusheado → desplegando.
- Módulo cerrado: imágenes botánicas + columna verificación + Kimiko.

## Completado en esta sesión (Claude Code)
1. **21 imágenes generadas** vía Wikimedia Commons (Pollinations bloqueado HTTP 402 / x402 payment protocol).
2. **50 renombres** plant-XX-*-cientifica.jpg → {slug}-cientifica.jpg (20 manifest + 30 legacy).
3. **Gate prebuild** `scripts/check-plants.ts` — (a) rename OK, (b) residuales prohibidos; dangerous/pending = warning.
4. **Schema Zod** `lib/schemas/plant.ts` — añade nombre_es, nombre_latino, image_cientifica_url (opcionales).
5. **Playwright** `tests/e2e/site-health.spec.ts` — cards diccionario + prohibición src plant-XX.
6. **LaunchAgent** `com.qh.weekend-agent` → `com.qh.kimiko` (unload/load activo).
7. `data/pending-images.json` vaciado (0 pendientes).

## Próximos pasos (Cowork, ordenados)
1. **UPDATE Supabase Fase 1:** 20 plants del manifest status="rename" → `image_cientifica_url = '/images/plants/{slug}-cientifica.jpg'`
2. **UPDATE/INSERT Supabase Fase 2:** 21 plants nuevas (sidr, hinojo, milenrama, etc.) con URL correcta
3. Verificar `/diccionario` en Vercel tras el deploy
4. Aprobación manual 9 dangerous (beleno-negro, hierba-mora, tejo, aconito, cornezuelo, cannabis, datura, datura-metel, amanita-muscaria)
5. Playwright E2E contra prod cuando esté up

## Decisiones técnicas
- **Pollinations HTTP 402:** tier gratuito activa x402 micropagos (Base L2). IP Cloudflare compartida. → **Provider default ahora Wikimedia Commons** (ilustraciones botánicas dominio público, calidad superior).
- **50 renombres (no 20):** gate (b) es general — cualquier plant-XX no-dangerous → ERROR. Se limpiaron todos los legacy.
- **Schema Zod opcional:** compatibilidad con `page.tsx` que valida solo `{id, slug, categoria}`.

## Otros pendientes vivos (sin cambios)
1. RESEND_API_KEY sin configurar en Vercel.
2. Dominio quantumholistic.com → Vercel.
3. Stripe keys live → producción.
4. n8n `Auto-Bitacora Inactividad` — credenciales nodo `UltimaActividad` caducadas.

## Referencias
- Script Kimiko: `scripts/qh-generar-imagenes.mjs` (PROVIDER=wikimedia default)
- LaunchAgent: `~/Library/LaunchAgents/com.qh.kimiko.plist` (Label: com.qh.kimiko, interval 14400s)
- Notion Bitácora 2026-06-03: https://app.notion.com/p/37437a0e7b4581c8a57af064a2788a81
