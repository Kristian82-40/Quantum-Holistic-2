# Handoff — 2026-07-23

## Directiva v3.1 — "Modo Operadora Total" (Papu, 2026-07-23)
Kimiko ejecuta esto en su próximo ciclo de 4h, sin esperar aprobación adicional, dentro del ciclo estándar (salud → QA → monetización → contenido → bitácora):

1. **Pasarela de pago: Gumroad** (decidido, merchant of record). Completar integración técnica con placeholder — `NEXT_PUBLIC_GUMROAD_URL` sin valor real todavía. El botón de checkout (`RitualCheckout.tsx`, ya agnóstico de proveedor) debe quedar listo para activarse en cuanto Papu pase la URL real, sin tocar código de nuevo.
2. **Funnel regalo→email→ritual (€19)**: `/regalo/primera-noche` → captura de email → `/producto/ritual-descanso`. Ya construido y verificado extremo a extremo en producción desde 2026-07-11 (commit `dcb76bf`) — este ciclo: reverificar que sigue live, no reconstruir salvo regresión real.
3. **QA cada ciclo**: correr `kimiko-qa-nocturna.mjs`, verificar salud del deploy, corregir inconsistencias reversibles encontradas sin pedir aprobación.
4. **Contenido cada ciclo**: borradores IG/LinkedIn + blog SEO. Publicación autónoma sigue PROHIBIDA — todo queda en `draft`/sin publicar para revisión de Papu.

### Bloqueantes manuales de Papu (Kimiko no puede resolverlos)
1. Crear cuenta Gumroad → pasar URL del producto (activa `NEXT_PUBLIC_GUMROAD_URL` en Vercel).
2. Registrar `quantum-holistic.com` en Google Search Console + enviar sitemap.
3. Confirmar qué perfiles IG/LinkedIn se usarán para publicar los borradores acumulados.

## ⚠️ Bloqueador crítico de infraestructura — Kimiko sin correr desde 2026-07-11
Diagnosticado hoy revisando `~/bin/qh/kimiko-autostart.log` y las sesiones del 2026-07-22 (16:31 y 20:32):
- El guard de disco montado + archivo legible pasa correctamente (`[ -r "$PROMPT" ]` OK).
- Pero al ejecutar `cat "$PROMPT"` **dentro del proceso lanzado por `launchd`**, falla con `Operation not permitted` — el mismo archivo se lee sin problema desde una sesión interactiva de Terminal con el mismo usuario.
- Consecuencia: `claude -p "$(cat "$PROMPT")"` recibe un prompt vacío → `Error: Input must be provided either through stdin or as a prompt argument when using --print` → la sesión termina en ~1 minuto sin ejecutar nada.
- Causa más probable: restricción TCC de macOS (Privacy & Security) sobre procesos de `launchd` accediendo a un volumen externo — `/bin/bash` lanzado como agente en background no hereda el mismo permiso de "Full Disk Access" / acceso a volúmenes extraíbles que tiene Terminal.app en uso interactivo.
- **Acción requerida de Papu (GUI, no ejecutable por CLI):** System Settings → Privacy & Security → Full Disk Access (o el apartado de acceso a volúmenes extraíbles según versión de macOS) → añadir `/bin/bash` y/o el binario `claude` con permiso explícito.
- Hasta resolver esto, forzar el ciclo con `launchctl kickstart -k gui/$(id -u)/com.qh.kimiko-autostart` probablemente reproduce el mismo fallo — no ejecutado todavía a la espera de confirmación de Papu.

## Estado del proyecto
- Producción estable (`quantum-holistic.com`), último deploy verificado READY (`dpl_GkKaziEAMzrpsJQ434bWxj2Um6Gg`, commit `dcb76bf`/`ec24aba`). QA: 13/13 checks OK la última vez que corrió (2026-07-11).
- Funnel de monetización completo y en producción: `/regalo/primera-noche` (lead magnet gratis) → `leads` → `/producto/ritual-descanso` (€19, checkout listo salvo cuenta de pago).
- `leads` y `purchases` siguen en 0 filas reales — sin actividad de usuarios todavía (checkout de pago no activo).
- 3 borradores sociales (2 IG + 1 LinkedIn) y 1 borrador de blog SEO ("Nutrición Km0 y Herbología") pendientes de aprobación en `/admin/blog` y en la bitácora Notion del 2026-07-11 — nadie los ha revisado aún.

## Archivos modificados esta sesión
- `handoff.md` — reescrito con Directiva v3.1 + diagnóstico del bloqueador de infraestructura.
- `~/.claude/settings.json` — eliminada regla inválida `Write(/Users/juliafenton/*)` (generaba warning en cada sesión de Kimiko; `Edit(/Users/juliafenton/*)` ya cubre el caso).

## Próximos pasos (ordenados por prioridad)
1. **Papu: resolver el permiso Full Disk Access/TCC** para que Kimiko vuelva a correr en background — bloquea todo lo demás.
2. Papu: crear cuenta Gumroad → pasar URL del producto.
3. Papu: Google Search Console + envío de sitemap.
4. Papu: confirmar perfiles IG/LinkedIn para los borradores ya redactados.
5. Papu: aprobar/rechazar los 3 borradores sociales y el borrador de blog pendientes desde 2026-07-11.
6. Una vez resuelto el permiso, próxima run de Kimiko: ciclo estándar completo según Directiva v3.1 (sin esperar mandato nuevo).

## Decisiones técnicas tomadas
- Gumroad elegido como pasarela de pago (merchant of record) — sin cambios de código necesarios, `RitualCheckout.tsx` ya es agnóstico de proveedor vía `NEXT_PUBLIC_GUMROAD_URL`.
- Se deja documentado el diagnóstico TCC en vez de intentar workarounds por CLI (p. ej. mover el prompt al disco interno) — el fix correcto es el permiso de sistema, no un rodeo que oculte el síntoma.

## Pendiente / deuda técnica heredada (no tocada esta sesión)
1. Purga de historial de git del PDF de pago (`ritual-descanso.pdf`) — pendiente de aprobación explícita de Papu (acción irreversible, force-push).
2. `app/` sigue conteniendo scaffolding duplicado — deuda técnica conocida, no tocar sin auditoría.
3. Heredado sin tocar: PR #2 (equinácea), agente nocturno n8n (`PPchw62Xzdnvf9pT`), imágenes `_pending-approval/` (cannabis, cornezuelo, datura).

## Scripts disponibles
| Script | Función |
|---|---|
| `node scripts/kimiko-qa-nocturna.mjs` | QA 13 checks: build, rutas, Supabase, assets, middleware, canonical/og:url. Requiere `source .env.local` antes si se corre a mano. `env -u NOTION_API_KEY` para correr sin postear bitácora. |
| `node scripts/qh-imagenes-v2.mjs` | Descarga imágenes Wikimedia para slugs faltantes |
| `bash scripts/kimiko-run-all.sh` | Pipeline Kimiko: genera blog posts + imágenes |
| `bash scripts/auto-flow-state.sh` | Estado del proyecto |

## Referencias
- Bitácora "raíz" con mandatos de Papu (leer siempre, se prependea cronológicamente): https://app.notion.com/p/36c37a0e7b45812f8628f31630109924
- Última bitácora de cierre (2026-07-11): https://app.notion.com/p/39a37a0e7b4581eb8e3fd99033817de2
- Log de autostart: `~/bin/qh/kimiko-autostart.log`
