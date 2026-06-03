# HANDOFF — 2026-06-03

## 🔑 PUNTO DE RETORNO
Palabra clave: **"EMPEZAMOS DESDE DONDE LO DEJAMOS HACE 5 MINUTOS"**
Al volver: Cowork ya cerró manifest + Skill + Notion. Lo siguiente es ejecutar el prompt de Code (generar 21 imágenes + renombrar 20 + FAENA A + commit/push) y luego UPDATE Supabase.

## Estado del proyecto
- **Deploy Vercel: READY** ✅ — commit `97994fc` (limpieza workflows) en producción.
- Workflows GitHub Actions redundantes borrados (`deploy.yml`, `nextjs.yml`). Solo queda `claude-review.yml`. Deploy 100% vía integración Git nativa de Vercel.

## Cerrado hoy por Cowork
- **Manifest** regenerado desde Supabase (única fuente de verdad): `data/plants-manifest.json` enriquecido (slug, nombre_latino, familia, status, source, target).
- **Worklists:** `data/pending-images.json` (21 a generar, objetos) + `data/dangerous-plants.json` (9 peligrosas).
- **Skill `qh-generar-imagenes`** (`skills/qh-generar-imagenes/SKILL.md`) + `scripts/qh-generar-imagenes.mjs` — provider variable, default Pollinations keyless, fallback ModelsLab, prompt botánico F2. Sintaxis validada.
- **Notion:** página "Lecciones/Issues — Integridad de imágenes" (6 reglas) + bitácora del día.
- **Agente fin de semana → Kimiko** (referencias actualizadas; plist a renombrar por Code).

## Clasificación 50 plantas
- **20 rename** (archivo botánico correcto en disco → migrar a `{slug}-cientifica.jpg`).
- **21 generate** (Kimiko/Pollinations).
- **9 dangerous** (backlog, aprobación visual manual).

## PENDIENTE — mano a Claude Code
1. `node scripts/qh-generar-imagenes.mjs` (red local) → 21 imágenes.
2. Renombrar las 20 fuentes a `{slug}-cientifica.jpg` (ver `source`→`target` en manifest).
3. FAENA A: Zod `lib/schemas/plant.ts`, gate prebuild `scripts/check-plants.ts` (OFFLINE, lee manifest + pending), Husky/lint-staged, Playwright site-health, frontend diccionario derivando ruta del slug con placeholder.
4. Renombrar LaunchAgent `com.qh.weekend-agent` → `com.qh.kimiko`.
5. UPDATE Supabase `image_cientifica_url` → `/images/plants/{slug}-cientifica.jpg` (2 fases).
6. git commit + push.

## Patrón / reglas de oro
- Archivo = `{slug}-cientifica.jpg`, SIN número secuencial.
- Slug Supabase = nombre de archivo.
- Peligrosas nunca a ciegas. Rename/generación en masa → rama + PR + revisión visual.
- Legacy `app/fichas-*.json` + `QH_ASSETS_MASTER.txt` = solo-lectura.

## Otros pendientes vivos
1. RESEND_API_KEY sin configurar en Vercel.
2. Dominio quantumholistic.com → Vercel.
3. Stripe keys live → producción.
4. n8n `Auto-Bitacora Inactividad` — credenciales nodo `UltimaActividad` caducadas.

## Notion
- Lecciones/Issues: https://app.notion.com/p/37437a0e7b4581478899dfef65124ba8
- Bitácora 2026-06-03: https://app.notion.com/p/37437a0e7b4581c8a57af064a2788a81
