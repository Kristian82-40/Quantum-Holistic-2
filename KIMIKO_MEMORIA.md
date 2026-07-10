# KIMIKO_MEMORIA.md

Diario de aprendizaje de Kimiko (Claude Code). Leer al inicio de cada sesión, actualizar al final: aprendizajes, errores→checks, qué funciona.

---

## 2026-07-05 — Sesión Bloque Auth

### Aprendizajes
- **`profiles` YA EXISTE en Supabase** (proyecto `vctetjugbvyllwjpxcxh`) con casi todas las columnas que el handoff de Notion pedía crear: `id, created_at, updated_at, email, full_name, avatar_url, plan, plan_expires_at, stripe_customer_id, role (user/terapeuta/admin), verified, bio, especialidad, dosha`. RLS activado. 8 migraciones ya aplicadas sobre esta tabla (última: `20260526140842_add_categoria_plants`).
- **Antes de redactar cualquier migración nueva: correr `list_tables` / `list_migrations` primero.** El handoff puede estar desactualizado respecto al estado real de Supabase — pasó en esta sesión (Paso 1 del Bloque Auth asumía que `profiles` no existía).
- **Auth actual usa email+password**, no magic link: `app/login/page.tsx` (`signInWithPassword`), `app/registro/page.tsx` (`signUp` + upsert manual en `profiles`), `app/registro/terapeuta/page.tsx`. El nuevo handoff pide migrar a magic link — es un cambio de UX, no un complemento.
- **`app/middleware.ts` estaba mal ubicado — confirmado y corregido.** Next.js App Router requiere `middleware.ts` en la raíz del proyecto (junto a `package.json`), no dentro de `app/`. Antes del build no aparecía `ƒ Middleware` en el output; tras moverlo a la raíz sí aparece, y `curl` confirma el redirect 307 `/cuenta → /login?redirect=...`. Es decir: la protección de `/terapeuta` y `/admin` estuvo inactiva en producción hasta este commit (`e6cb074`). Vale la pena revisar si hubo acceso indebido mientras estuvo roto.
- **`app/` contiene un scaffolding de proyecto duplicado** (`app/package.json`, `app/next.config.js`, `app/tsconfig.json`, `app/vercel.json`, `app/node_modules`, `app/.vercel`, `app/CLAUDE.md`). Next.js los ignora porque el App Router solo lee `page.tsx`/`layout.tsx`/`route.ts`, pero es deuda técnica — no tocar sin auditoría, no es parte del Bloque Auth.
- **Regla de checks:** antes de ejecutar un "Bloque" completo de un handoff de Notion, contrastar cada paso contra el estado real (schema Supabase, código existente) según CLAUDE.md § Validación Cruzada. Si un paso choca con lo ya implementado, detener ese paso puntual y proponer opciones — no bloquear los demás pasos.

### Qué funciona
- Notion search + fetch para localizar el handoff activo cuando el título de la página no coincide con el contenido (la página se edita in-place, el título queda desactualizado).
- `list_tables` con `verbose:true` da todo el schema + FKs en una sola llamada — mejor que iterar columnas a mano.
- Migraciones incrementales pequeñas (trigger, luego ajuste del trigger) son más seguras que una migración monolítica — permitió corregir el mapeo de `role` sin tocar lo ya aplicado.
- `curl -sL -o /dev/null -w "%{http_code}"` en bucle sobre `npm start` (puerto alterno) es la forma más rápida de verificar rutas 200 antes de dar por cerrado un bloque grande de páginas nuevas.

### Cierre Bloque Auth (2026-07-05)
- Commit `e6cb074` → push `main` → Vercel `dpl_99yqqVLgwAeRWiw7nh6jMqFUnAwF` **READY** en producción (`quantum-holistic.com`).
- Pasos 1-5 completos. Pendiente para la próxima sesión: checks de QA nocturna para rutas auth, y decidir si auditar accesos a `/terapeuta`/`/admin` durante la ventana en que el middleware estuvo inactivo.

---

## 2026-07-10 — Sesión puesta al día (directiva Cowork, 6 prioridades en orden estricto)

### Aprendizajes
- **`StartOnMount` de launchd no dispara de forma fiable en remontajes repetidos** del mismo volumen ya visto por el LaunchAgent — `launchctl print` mostraba `runs = 1` desde el 5-jul pese a que el disco se había remontado varias veces desde entonces. `WatchPaths` sobre la ruta de montaje es el mecanismo correcto y más fiable; lo dejé como trigger primario (mantuve `StartOnMount` de refuerzo, no hace daño). Backup del plist/script original en `~/bin/qh/backup/` antes de tocar nada.
- **Nunca silenciar stderr de `osascript` en un script de autostart** (`>/dev/null 2>&1` original) — si el AppleScript falla por permisos de Automation, el error desaparece y el diagnóstico se vuelve imposible. Ahora todo queda logueado con timestamp en `~/bin/qh/kimiko-autostart.log`.
- **Testear un script de autostart a mano puede spawnear un `claude --remote-control` real** contra el mismo repo — me pasó al probar el fix. Maté el proceso de inmediato (PID confirmado como propio por timestamp/tty), pero hay que revisar `ps aux | grep remote-control` antes y después de cualquier prueba manual.
- **Un QA script que apunta a un alias `*.vercel.app` en vez del dominio custom puede dar falsos positivos silenciosos** si ese alias tiene Deployment Protection (SSO) activo — cualquier ruta, incluso inexistente, redirige a un login que responde 200. `scripts/kimiko-qa-nocturna.mjs` tenía este bug desde su creación (los 3 checks de rutas nunca fallaban, pasara lo que pasara). Corregido: `PRODUCTION_URL` ahora usa `quantum-holistic.com`.
- **Antes de construir un checkout, verificar que el producto no esté ya expuesto gratis en otro sitio.** `assets/ritual-descanso.pdf` (oferta 19€) llevaba desde el 4-jul descargable sin auth vía `raw.githubusercontent.com` por estar en un repo público — reportado en `QH_MASTER_VERIFIED.md` bloqueo #0 pero nunca mitigado hasta hoy. `git rm --cached` + `.gitignore` corta el acceso sobre `main` actual; el SHA histórico (`7858379`) lo sigue sirviendo hasta purgar el historial — eso requiere `git filter-repo`/BFG + force-push, acción irreversible sobre repo compartido que dejé pendiente de aprobación explícita de Papu.
- **Migrar `especialidad` (text) → `especialidades` (text[])** no necesitó patrón de 2 fases: la columna no era UNIQUE y solo había 1 fila real en `profiles` (el admin, con el campo en null). El patrón de 2 fases del CLAUDE.md es para cuando SÍ hay riesgo real de dato o constraint — no aplicarlo por rutina cuando el blast radius es cero.

### Qué funciona
- `curl -sI` + `grep -oE` sobre el HTML de producción es la forma más rápida de verificar canonical/og:url/sitemap tras un deploy — más confiable que confiar en el build log.
- Revisar `list_tables(verbose:true)` antes de cualquier migración sigue siendo el paso que evita sorpresas — confirmó que `products`/`purchases`/`leads` ya existían con schema listo para el checkout, sin necesitar crear nada nuevo.
- Ejecutar el script de QA con `env -u NOTION_API_KEY` cuando ya se va a escribir una bitácora manual al cierre — evita que el script cree una página de Notion duplicada.

### Cierre 2026-07-10
- **P0 SEO resuelto y verificado en producción**: canonical/og:url/sitemap/robots → `quantum-holistic.com`. Commit `3b7c152`.
- **Autostart diagnosticado y corregido**: `WatchPaths` + logging real. Sin probar aún en un remontaje real del disco (solo test manual).
- **QA 12/13 checks OK** (el único que falla, `/regalo/primera-noche`, es una página que aún no existe — esperado, no es regresión).
- **Landing `/producto/ritual-descanso` construida y en producción** (commit `195d299`), con captura de lead como fallback hasta que exista cuenta Gumroad/Lemon Squeezy.
- **Mitigación parcial de la exposición del PDF de pago** (commit `fc617a3`) — purga completa del historial pendiente de aprobación de Papu.
- **Migración `especialidades text[]` aplicada** (commit `4326566`), código actualizado en `/terapeuta` y `/terapeutas`.
- **3 borradores de contenido social redactados**, NO publicados, en la bitácora Notion del día — su CTA depende de `/regalo/primera-noche`, que todavía no existe.
- Pendiente próxima sesión: construir `/regalo/primera-noche` (lead magnet, falta para cerrar el funnel), decisión de Papu sobre purga de historial + cuenta Gumroad, y confirmar si el proceso `claude --remote-control` (PID 954) detectado al iniciar la sesión era legítimo.
