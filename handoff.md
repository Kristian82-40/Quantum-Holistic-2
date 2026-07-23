# Handoff — 2026-07-23 (ciclo interactivo, tarde)

## Ciclo ejecutado hoy (Directiva v3.1 — salud → QA → monetización → contenido)
Corrido de forma **interactiva** (no headless/launchd) porque el bloqueador TCC descrito abajo sigue sin resolver. Esto confirma el diagnóstico: el problema es específico del contexto de `launchd`, no del acceso a Papu Ext en general — esta sesión leyó/escribió en el disco externo sin ningún problema.

1. **Salud:** disco Papu Ext montado (1.6Ti libres), repo `main` limpio, sin cambios pendientes.
2. **QA:** `kimiko-qa-nocturna.mjs` → **13/13 checks OK**. Deploy en producción confirmado READY, commit `a51c4db`.
   - Nota técnica: `node` no estaba en el `$PATH` de este shell (`/usr/bin:/bin:/usr/sbin:/sbin` únicamente) — está en `/opt/homebrew/bin/node`. Hubo que exportar el PATH a mano para correr el script. Si esto se repite en otras sesiones interactivas, puede ser señal de un perfil de shell no cargado correctamente.
3. **Monetización:** funnel `/regalo/primera-noche` → `/producto/ritual-descanso` sigue live (200 OK ambas rutas vía QA). `NEXT_PUBLIC_GUMROAD_URL` sigue sin valor en `.env.local` — `RitualCheckout.tsx` ya listo para activarse en cuanto exista la URL real, sin tocar código. `leads`: 0 filas. `purchases`: 0 filas — sigue sin actividad real de usuarios.
4. **Contenido — HALLAZGO IMPORTANTE:** `blog_posts` tiene **88 borradores sin revisar** (`status='draft'`), no solo el 1 que registraba el handoff anterior:
   - 85 de ellos son de abril–mayo 2026 (categorías "sabiduría" 33+4, "nutrición" 10, "Bienestar Holístico" 11, "herbología"/"bienestar"/"ayurveda"/"detox" 6-9 c/u) — generados por el agente nocturno viejo, nunca aprobados ni descartados.
   - Los otros 3 son "Herbología" (capitalizado, convención del agente-plantas actual): `echinacea-guia` y `sidr-espino-de-cristo-guia` (28-may) + `nutricion-km0-herbologia...` (10-jul, el que ya estaba en el handoff).
   - **Decisión tomada esta sesión: NO generar contenido nuevo este ciclo.** Con 88 borradores acumulados sin que nadie los revise, sumar más no aporta — el cuello de botella real es la revisión de Papu, no la generación. Los 3 borradores sociales ya redactados el 2026-07-11 (bitácora Notion) siguen vigentes porque el funnel no cambió.
   - **Pendiente de decisión de Papu:** ¿revisar/publicar/borrar el backlog de 85 drafts viejos? Si no se van a usar nunca, hay que decidir si vale la pena seguir corriendo el agente nocturno de contenido genérico o pausarlo hasta aclarar el flujo de aprobación.

## Directiva v3.1 — "Modo Operadora Total" (Papu, 2026-07-23) — sigue vigente
1. **Pasarela de pago: Gumroad** (decidido). Placeholder sin valor real — sin cambios de código pendientes.
2. **Funnel regalo→email→ritual (€19)**: reverificado hoy, sigue live extremo a extremo.
3. **QA cada ciclo**: hecho hoy, 13/13.
4. **Contenido cada ciclo**: este ciclo se saltó deliberadamente por el backlog sin revisar (ver hallazgo arriba) — no es incumplimiento, es la decisión más útil dado el estado real.

### Bloqueantes manuales de Papu (Kimiko no puede resolverlos)
1. Crear cuenta Gumroad → pasar URL del producto.
2. Registrar `quantum-holistic.com` en Google Search Console + enviar sitemap.
3. Confirmar perfiles IG/LinkedIn para publicar los borradores acumulados.
4. **Nuevo:** decidir qué hacer con los 85 borradores de blog viejos sin revisar (revisar / archivar / borrar / pausar el agente nocturno que los generó).

## ⚠️ Bloqueador crítico de infraestructura — Kimiko sin correr en background desde 2026-07-11
Sin cambios desde el diagnóstico anterior — sigue pendiente de acción de Papu:
- Guard de disco montado pasa OK, pero `cat "$PROMPT"` dentro de un proceso lanzado por `launchd` falla con `Operation not permitted` (funciona igual en sesión interactiva de Terminal).
- Causa más probable: restricción TCC de macOS sobre procesos de `launchd` accediendo a un volumen externo.
- **Acción requerida de Papu (GUI):** System Settings → Privacy & Security → Full Disk Access → añadir `/bin/bash` y/o el binario `claude`.
- No ejecutado `launchctl kickstart` todavía — probablemente reproduce el mismo fallo.

## Estado del proyecto
- Producción estable (`quantum-holistic.com`), deploy READY commit `a51c4db`. QA 13/13 (2026-07-23).
- Funnel de monetización completo y live: `/regalo/primera-noche` → `leads` → `/producto/ritual-descanso` (€19, checkout listo salvo cuenta de pago).
- `leads` y `purchases` en 0 filas — sin actividad real todavía.
- Backlog de contenido sin revisar: 88 borradores en `blog_posts` (ver hallazgo arriba) + 3 borradores sociales (2 IG + 1 LinkedIn) en bitácora Notion del 2026-07-11.

## Archivos modificados esta sesión
- `handoff.md` — reescrito con resultado del ciclo de hoy + hallazgo del backlog de 88 borradores.
- Ningún archivo de código tocado (no hacía falta — QA limpio, funnel verificado, sin regresiones).

## Próximos pasos (ordenados por prioridad)
1. **Papu: resolver el permiso Full Disk Access/TCC** para que Kimiko vuelva a correr en background.
2. **Papu: decidir qué hacer con los 85 borradores de blog viejos** (nuevo hallazgo de hoy).
3. Papu: crear cuenta Gumroad → pasar URL del producto.
4. Papu: Google Search Console + envío de sitemap.
5. Papu: confirmar perfiles IG/LinkedIn para los borradores ya redactados.
6. Papu: aprobar/rechazar los 3 borradores sociales y el borrador de blog SEO de nutrición km0 (10-jul).
7. Una vez resuelto el permiso TCC, próxima run headless: ciclo estándar completo según Directiva v3.1.

## Decisiones técnicas tomadas
- No se generó contenido nuevo este ciclo por el backlog de 88 drafts sin revisar — se prioriza flagear el hallazgo sobre seguir acumulando borradores.
- Gumroad sigue siendo la pasarela elegida — sin cambios de código, `RitualCheckout.tsx` ya agnóstico de proveedor.

## Pendiente / deuda técnica heredada (no tocada esta sesión)
1. Purga de historial de git del PDF de pago (`ritual-descanso.pdf`) — pendiente de aprobación explícita de Papu (irreversible, force-push).
2. `app/` sigue conteniendo scaffolding duplicado — deuda técnica conocida, no tocar sin auditoría.
3. Heredado sin tocar: PR #2 (equinácea), agente nocturno n8n (`PPchw62Xzdnvf9pT`), imágenes `_pending-approval/` (cannabis, cornezuelo, datura).

## Scripts disponibles
| Script | Función |
|---|---|
| `node scripts/kimiko-qa-nocturna.mjs` | QA 13 checks: build, rutas, Supabase, assets, middleware, canonical/og:url. Requiere `source .env.local` antes si se corre a mano, y PATH con `/opt/homebrew/bin` si `node` no está en el PATH del shell. `env -u NOTION_API_KEY` para correr sin postear bitácora. |
| `node scripts/qh-imagenes-v2.mjs` | Descarga imágenes Wikimedia para slugs faltantes |
| `bash scripts/kimiko-run-all.sh` | Pipeline Kimiko: genera blog posts + imágenes |
| `bash scripts/auto-flow-state.sh` | Estado del proyecto |

## Referencias
- Bitácora "raíz" con mandatos de Papu (leer siempre, se prependea cronológicamente): https://app.notion.com/p/36c37a0e7b45812f8628f31630109924
- Última bitácora de cierre (2026-07-11): https://app.notion.com/p/39a37a0e7b4581eb8e3fd99033817de2
- Log de autostart: `~/bin/qh/kimiko-autostart.log`
