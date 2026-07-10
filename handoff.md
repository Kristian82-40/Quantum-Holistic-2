# Handoff — 2026-07-10

## Estado del proyecto
- Directiva Cowork 2026-07-10 ejecutada en orden estricto (6 prioridades). Producción al día (`quantum-holistic.com`).
- Build local: ✓ 36 rutas, 0 errores. QA nocturna: 12/13 checks OK (el único que falla, `/regalo/primera-noche`, es esperado — la página no existe todavía).
- Commits del día (main, todos pusheados y deployados): `3b7c152` (P0 SEO), `fc617a3` (mitigación PDF expuesto), `195d299` (landing ritual-descanso + QA script), `4326566` (migración `especialidades`).

## Módulos completados esta sesión
1. **P0 SEO**: `canonical`/`og:url`/`sitemap.ts`/`robots.ts`/`config.ts` corregidos de `quantumholistic.com` → `https://quantum-holistic.com`. Verificado en producción con curl.
2. **Autostart Kimiko**: `StartOnMount` no disparaba en remontajes repetidos (`runs=1` desde el 5-jul). Cambiado a `WatchPaths` sobre `/Volumes/Papu Ext` + logging real (antes se silenciaba stderr de `osascript`). Backup del plist/script original en `~/bin/qh/backup/`.
3. **QA nocturna ampliada**: `scripts/kimiko-qa-nocturna.mjs` +check #10 (middleware.ts en raíz + `/admin` redirige) +check #11 (canonical/og:url en prod). Bug corregido: `PRODUCTION_URL` apuntaba al alias `*.vercel.app` con SSO activo → falsos positivos en los 3 checks de rutas desde que el script existe.
4. **Checkout "El Ritual del Descanso"**: landing `/producto/ritual-descanso` (19€, copy, CTA con fallback a lead capture). Fila en `products`. Hallazgo crítico: el PDF de pago era descargable gratis vía `raw.githubusercontent.com` (repo público) — mitigado parcialmente (`git rm --cached` + `.gitignore`); purga completa del historial pendiente de aprobación de Papu.
5. **Migración `profiles.especialidad` → `especialidades text[]`**: aplicada directo (0 filas con dato real), código actualizado en `/terapeuta` y `/terapeutas`.
6. **3 borradores de contenido social** redactados en la bitácora Notion del día — sin publicar.

## Decisiones técnicas tomadas
- No se usó patrón de 2 fases para la migración `especialidades` — columna no UNIQUE, blast radius cero (solo 1 fila real).
- PDF de pago desvinculado de git tracking pero mantenido en disco local — purga de historial (`filter-repo`/BFG + force-push) es acción irreversible sobre repo compartido, requiere OK explícito de Papu.
- Checkout usa `NEXT_PUBLIC_GUMROAD_URL` como interruptor: si no está seteada, cae a captura de lead (`leads.source=ritual_descanso_waitlist`); en cuanto Papu cree la cuenta y pase la URL, el botón se activa sin tocar código.

## Pendiente / deuda técnica detectada (no tocada esta sesión)
1. `app/` sigue conteniendo el scaffolding duplicado (`app/package.json`, `app/next.config.js`, etc.) — deuda técnica conocida, no tocar sin auditoría.
2. `/regalo/primera-noche` (lead magnet) no existe — bloquea el CTA de los 3 borradores sociales de hoy y el funnel completo `regalo → lead → producto`.
3. Purga de historial de git del PDF de pago — pendiente de aprobación explícita de Papu.
4. Cuenta Gumroad/Lemon Squeezy — pendiente de que Papu la cree (paso manual, ver bitácora Notion).
5. Proceso `claude --remote-control` (PID 954, tty s001, corriendo desde las 10:25 del 2026-07-10) detectado al iniciar sesión — origen sin confirmar, no se tocó.
6. Heredado de sesiones anteriores sin tocar: PR #2 (equinácea), agente nocturno n8n (`PPchw62Xzdnvf9pT`), imágenes `_pending-approval/` (cannabis, cornezuelo, datura).

## Próximos pasos (ordenados por prioridad)
1. Decisión de Papu: purga de historial del PDF + cuenta Gumroad/Lemon Squeezy (ver "Tareas manuales de Papu hoy" en la bitácora Notion del día).
2. Construir `/regalo/primera-noche` — desbloquea el funnel y los borradores sociales.
3. Dar de alta `quantum-holistic.com` en Google Search Console + enviar sitemap (ahora que el canonical es correcto).
4. Confirmar en un remontaje real del disco que el fix de `WatchPaths` dispara el autostart correctamente (el test de hoy fue manual, no vía mount real).

## Scripts disponibles
| Script | Función |
|---|---|
| `node scripts/kimiko-qa-nocturna.mjs` | QA 11+ checks: build, rutas, Supabase, assets, middleware, canonical/og:url. `env -u NOTION_API_KEY` para correr sin postear bitácora. |
| `node scripts/qh-imagenes-v2.mjs` | Descarga imágenes Wikimedia para slugs faltantes |
| `bash scripts/kimiko-run-all.sh` | Pipeline Kimiko: genera blog posts + imágenes |
| `bash scripts/auto-flow-state.sh` | Estado del proyecto |
