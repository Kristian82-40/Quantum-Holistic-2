# Handoff — 2026-07-11 (v3 headless)

## Estado del proyecto
- Run v3 headless ejecutada en modo operadora total (mandato Papu 2026-07-11 16:30): ciclo completo salud → QA → monetización → contenido → bitácora, sin esperar aprobación adicional.
- Producción estable (`quantum-holistic.com`), deploy READY (`dpl_GkKaziEAMzrpsJQ434bWxj2Um6Gg`, commit `dcb76bf`). QA **13/13 checks OK** (primera vez completo).
- **Funnel de monetización completo y en producción**: `/regalo/primera-noche` (lead magnet gratis) → `leads` → `/producto/ritual-descanso` (€19, checkout listo salvo cuenta de pago).

## Módulos completados esta sesión
1. **Salud v3**: instancia única confirmada (lock `mkdir` en orden, sin runaway), registrado en bitácora.
2. **QA completa**: 13/13 checks OK, incluye por primera vez `/regalo/primera-noche`.
3. **`/regalo/primera-noche` construida** (commit `dcb76bf`): landing con formulario de email → `POST /api/leads` (`source=primera_noche_regalo`, mismo endpoint que ya existía, sin cambios de backend) → entrega inmediata del PDF `primera-noche-tranquila.pdf` (copiado a `public/downloads/` para servir estático) → CTA final a `/producto/ritual-descanso`. Añadida al sitemap.
4. **Funnel verificado extremo a extremo en producción**: página 200 (tras redirect 308 esperado por `trailingSlash:true`), lead insertado y confirmado por SQL directo en Supabase (luego borrado, era de prueba), PDF descargable, CTA al producto de pago.
5. **3 borradores sociales** (2 Instagram + 1 LinkedIn) con CTA real a `/regalo/primera-noche` — ya no apuntan a páginas sustitutas. Sin publicar.
6. **Blog SEO**: sin borrador nuevo — el de ayer ("Nutrición Km0 y Herbología") sigue en `draft` pendiente de aprobación en `/admin/blog`, cadencia semanal respetada.

## Decisiones técnicas tomadas
- `/regalo/primera-noche` se construyó sin pedir aprobación adicional: el mandato de Papu del 2026-07-11 (16:30, "modo operadora total") lista explícitamente el funnel completo como parte del ciclo estándar de cada run — reemplaza el pendiente de sesiones anteriores de "esperar decisión".
- PDF del lead magnet gratuito servido desde `public/downloads/` sin gating adicional (distinto del PDF de pago, que sigue fuera de `public/` y de git por la mitigación de seguridad de ciclos anteriores).

## Pendiente / deuda técnica detectada (no tocada esta sesión)
1. Cuenta Gumroad/Lemon Squeezy — único bloqueador restante del primer € del funnel (tarea manual de Papu).
2. Purga de historial de git del PDF de pago (`ritual-descanso.pdf`) — pendiente de aprobación explícita de Papu (acción irreversible, force-push).
3. `quantum-holistic.com` en Google Search Console + enviar sitemap actualizado (ya incluye `/regalo/primera-noche`) — pendiente de ciclos anteriores.
4. `app/` sigue conteniendo scaffolding duplicado — deuda técnica conocida, no tocar sin auditoría.
5. Heredado sin tocar: PR #2 (equinácea), agente nocturno n8n (`PPchw62Xzdnvf9pT`), imágenes `_pending-approval/` (cannabis, cornezuelo, datura).

## Próximos pasos (ordenados por prioridad)
1. Papu: crear cuenta de pago y pasar `NEXT_PUBLIC_GUMROAD_URL` en Vercel — activa el botón de compra sin tocar código.
2. Papu: aprobar los 3 borradores sociales y el borrador de blog pendiente.
3. Dar de alta `quantum-holistic.com` en Google Search Console + enviar sitemap.
4. Próxima run v3: seguir el ciclo estándar (salud → QA → monetización → contenido → bitácora) sin esperar directiva nueva, salvo que Papu indique lo contrario.

## Scripts disponibles
| Script | Función |
|---|---|
| `node scripts/kimiko-qa-nocturna.mjs` | QA 13 checks: build, rutas, Supabase, assets, middleware, canonical/og:url. Requiere `source .env.local` antes si se corre a mano. `env -u NOTION_API_KEY` para correr sin postear bitácora. |
| `node scripts/qh-imagenes-v2.mjs` | Descarga imágenes Wikimedia para slugs faltantes |
| `bash scripts/kimiko-run-all.sh` | Pipeline Kimiko: genera blog posts + imágenes |
| `bash scripts/auto-flow-state.sh` | Estado del proyecto |

## Referencias
- Bitácora Notion de este ciclo: https://app.notion.com/p/39a37a0e7b4581eb8e3fd99033817de2
- Bitácora "raíz" con mandatos de Papu (leer siempre, se prependea cronológicamente): https://app.notion.com/p/36c37a0e7b45812f8628f31630109924
- Deploy producción: `dpl_GkKaziEAMzrpsJQ434bWxj2Um6Gg` (commit `dcb76bf`)
