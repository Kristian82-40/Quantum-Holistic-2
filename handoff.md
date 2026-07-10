# Handoff — 2026-07-10 (ciclo tarde)

## Estado del proyecto
- Ciclo de continuación ejecutado en orden: QA → checkout → contenido social → blog SEO → leads. Producción estable (`quantum-holistic.com`), sin regresiones.
- QA: 12/13 checks OK. Único fallo: `/regalo/primera-noche` → 404 (esperado, página no existe todavía — heredado, no es regresión).
- Sin commits de código este ciclo (no hicieron falta cambios — checkout ya estaba listo del ciclo anterior).

## Módulos completados esta sesión
1. **QA completo**: 12/13 checks. Confirmado estable tras el ciclo anterior (canonical/og:url, middleware, plantas 52/52, placeholders 9/9 intactos).
2. **Checkout "El Ritual del Descanso"**: sin cambios necesarios — `RitualCheckout.tsx` ya usa `NEXT_PUBLIC_GUMROAD_URL` como interruptor genérico (sirve para Gumroad o Lemon Squeezy). Solo falta que Papu cree la cuenta y pase la URL.
3. **3 borradores de contenido social** (2 Instagram + 1 LinkedIn), tono Sage+Magician, ligados a insomnio de verano / nutrición km0 / herbología de temporada. CTA apuntando a páginas live (`/producto/ritual-descanso`, `/diccionario`) en vez de `/regalo/primera-noche` (no existe). En bitácora Notion, sin publicar.
4. **1 borrador de blog SEO**: "Nutrición Km0 y Herbología: el Poder de las Plantas Medicinales de Proximidad" — keywords nutrición km0/herbología/plantas medicinales. Guardado en `blog_posts` (status `draft`, categoría Herbología).
5. **Revisión tabla `leads`**: 0 filas, sin novedad. `purchases`: 0 filas.

## Decisiones técnicas tomadas
- No se tocó código de checkout — ya está listo desde el ciclo anterior, agnóstico de proveedor de pago.
- CTA de los borradores sociales redirigido a páginas live en vez de `/regalo/primera-noche` para no publicar un link roto (decisión documentada en bitácora, pendiente de que Papu decida si construir esa página).

## Pendiente / deuda técnica detectada (no tocada esta sesión)
1. `/regalo/primera-noche` (lead magnet) sigue sin existir — el PDF (`assets/primera-noche-tranquila.pdf`) ya está en disco, solo falta la landing. Bloquea el CTA "real" de los borradores sociales y el funnel completo.
2. Purga de historial de git del PDF de pago (`ritual-descanso.pdf`) — pendiente de aprobación explícita de Papu (acción irreversible, force-push).
3. Cuenta Gumroad/Lemon Squeezy — pendiente de que Papu la cree (paso manual).
4. `app/` sigue conteniendo scaffolding duplicado — deuda técnica conocida, no tocar sin auditoría.
5. Heredado de sesiones anteriores sin tocar: PR #2 (equinácea), agente nocturno n8n (`PPchw62Xzdnvf9pT`), imágenes `_pending-approval/` (cannabis, cornezuelo, datura), proceso `claude --remote-control` (PID 954) sin confirmar origen.

## Próximos pasos (ordenados por prioridad)
1. Decisión de Papu: ver "Tareas manuales de Papu hoy" en la bitácora Notion de este ciclo (cuenta de pago, aprobar borradores sociales y de blog, decidir sobre `/regalo/primera-noche`, purga de historial).
2. Si Papu aprueba: construir `/regalo/primera-noche` — desbloquea el funnel y los CTA reales de los borradores sociales.
3. Dar de alta `quantum-holistic.com` en Google Search Console + enviar sitemap (pendiente de ciclos anteriores).
4. Confirmar en un remontaje real del disco que el fix de `WatchPaths` del autostart dispara correctamente.

## Scripts disponibles
| Script | Función |
|---|---|
| `node scripts/kimiko-qa-nocturna.mjs` | QA 13 checks: build, rutas, Supabase, assets, middleware, canonical/og:url. Requiere `source .env.local` antes si se corre a mano (no carga dotenv solo). `env -u NOTION_API_KEY` para correr sin postear bitácora. |
| `node scripts/qh-imagenes-v2.mjs` | Descarga imágenes Wikimedia para slugs faltantes |
| `bash scripts/kimiko-run-all.sh` | Pipeline Kimiko: genera blog posts + imágenes |
| `bash scripts/auto-flow-state.sh` | Estado del proyecto |

## Referencias
- Bitácora Notion de este ciclo: https://app.notion.com/p/39937a0e7b4581958476c2ae0d1925e1
- Blog draft creado: `blog_posts.slug = nutricion-km0-herbologia-plantas-medicinales-de-proximidad-1783698312`
