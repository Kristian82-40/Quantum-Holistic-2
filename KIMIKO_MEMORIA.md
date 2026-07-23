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

---

## 2026-07-10 — Ciclo tarde (QA · checkout · contenido · blog SEO · leads)

### Aprendizajes
- **`scripts/kimiko-qa-nocturna.mjs` no carga `.env.local` automáticamente** (no usa `dotenv`) — al correrlo a mano sin `source .env.local` primero, los checks de Vercel API y Supabase fallan con 403 / "key not set", que parece un bug real pero es solo el entorno del shell sin las vars. Siempre `set -a && source .env.local && set +a` antes de correr el script manualmente.
- **`RitualCheckout.tsx` ya es agnóstico de proveedor de pago** — usa `NEXT_PUBLIC_GUMROAD_URL` como un link de checkout genérico (funciona igual para Gumroad o Lemon Squeezy, no hay lock-in). No hace falta tocar código para soportar ambas plataformas, solo pasar la URL que Papu genere.
- **El CTA `/regalo/primera-noche` sigue bloqueado** (la página no existe) pero el PDF del lead magnet (`assets/primera-noche-tranquila.pdf`) ya está en disco desde antes — solo falta construir la landing. Mientras tanto, los borradores sociales usan CTA a páginas live (`/producto/ritual-descanso`, `/diccionario`) en vez de enlazar una URL rota.
- **`leads` y `purchases` siguen en 0 filas** — sin actividad de usuarios reales todavía (checkout de pago no está activo, solo waitlist).

### Qué funciona
- Insertar blog posts directo en `blog_posts` vía SQL (status `draft`, slug con timestamp, categoría `Herbología`, `tags` como array) es más rápido que pasar por Ollama/papu-pro para un solo artículo puntual — sigue el mismo schema que usa el agente nocturno.
- Revisar un post `published` existente antes de escribir uno nuevo para calibrar tono (dual Sage+Magician, disclaimer médico al final) da consistencia sin tener que releer el Brand Bible completo cada vez.

### Cierre 2026-07-10 (tarde)
- QA: **12/13 checks OK** (único fallo esperado: `/regalo/primera-noche`, heredado, no es regresión).
- Checkout ritual-descanso: sin cambios de código, ya estaba listo — solo falta la cuenta de pago (tarea de Papu).
- 3 borradores sociales redactados (2 Instagram + 1 LinkedIn), CTA ajustado a páginas live, sin publicar.
- 1 borrador de blog SEO creado (`nutricion-km0-herbologia-plantas-medicinales-de-proximidad-1783698312`), keywords nutrición km0/herbología/plantas medicinales, status `draft`.
- Tabla `leads`: 0 filas nuevas, nada que reportar. `purchases`: 0 filas.
- Bitácora Notion del ciclo: https://app.notion.com/p/39937a0e7b4581958476c2ae0d1925e1
- Pendiente próxima sesión: decisión de Papu sobre construir `/regalo/primera-noche` (PDF ya listo, falta landing), purga de historial del PDF de pago, cuenta Gumroad/Lemon Squeezy, aprobación de los 3 borradores sociales y del borrador de blog.

---

## 2026-07-11 — Sesión v3 headless: /regalo/primera-noche construida, funnel completo

### Aprendizajes
- **Arquitectura de autostart migró a v3 headless tras 3 incidentes de "runaway"** (múltiples ventanas de Terminal/Kimiko sin trabajo real). Causa raíz: `StartOnMount` disparaba ráfagas de eventos en cada remontaje del volumen. v3 elimina `StartOnMount`, usa `StartInterval` 4h + lock atómico por `mkdir` (`~/bin/qh/kimiko.lockdir`, más fiable que `pgrep` de argv) + cooldown 3h + watchdog que mata la sesión a las 3h si cuelga. Logs por sesión en `~/bin/qh/kimiko-session-YYYYMMDD-HHMM.log`. Antes de tocar nada al iniciar una run: verificar `ps aux | grep remote-control` y el contenido de `kimiko.lockdir/pid` contra el propio PID — evita duplicar trabajo si ya hay una sesión legítima corriendo.
- **Mandato "modo operadora total" (Papu, 2026-07-11 16:30): cada run ejecuta el ciclo completo (salud → QA → monetización → contenido → bitácora) sin esperar aprobación nueva.** La run anterior (16:07) rompió esto al terminar en 1 minuto solo con una pregunta ("¿apruebas construir /regalo/primera-noche?") en vez de ejecutar — quedó corregido explícitamente por la nueva directiva. Las decisiones que ya están declaradas como parte del ciclo estándar (ej. "funnel /regalo/primera-noche → leads → producto verificado extremo a extremo" listado en el paso 3 de monetización) no requieren preguntar de nuevo, se ejecutan directo.
- **El directorio `/regalo/` no existía como ruta pero el plan maestro de monetización lo daba por "ya live" desde el 2026-07-04** — la bitácora de negocio (Notion) puede quedar desactualizada respecto al código real igual que el handoff técnico; verificar siempre contra `find`/`curl`, no contra lo que dice la documentación de producto.
- **Un lead magnet gratuito no necesita el mismo tratamiento de seguridad que un producto de pago**: el PDF (`primera-noche-tranquila.pdf`) se copia a `public/downloads/` y se sirve estático sin gating adicional — el único "gate" es el formulario de email. Esto es intencionalmente distinto de `ritual-descanso.pdf` (pago), que sigue fuera de `public/` y de git.
- **El patrón de captura de lead (`RitualCheckout.tsx` → `POST /api/leads`) es completamente reutilizable sin tocar backend**: el endpoint ya acepta cualquier `source` arbitrario. Construir un segundo punto de captura del funnel fue solo frontend (page.tsx + client component + reusar page.module.css con un estilo extra para el link secundario).
- **`trailingSlash: true` en `next.config.js` hace que TODA ruta (páginas y API routes) devuelva 308 → redirect con slash final** — esto es comportamiento global esperado del sitio, no un bug de la ruta nueva. Verificar con `curl -sL` (sigue redirects) en vez de leer el primer status code a secas, si no, cualquier ruta nueva parece "rota" cuando no lo está.

### Qué funciona
- Verificar el lock (`~/bin/qh/kimiko.lockdir/pid`) contra el propio PID de proceso al iniciar una run headless es un chequeo de 10 segundos que evita todo el problema de runaway — hacerlo siempre antes de tocar código.
- Revisar la página de bitácora "raíz" del proyecto en Notion (la que acumula directivas prependeadas cronológicamente) en vez de solo la última bitácora de cierre — ahí es donde Papu deja mandatos nuevos que pueden reemplazar o superar lo que dice `handoff.md`. En este ciclo, `handoff.md` decía "pendiente decisión de Papu sobre /regalo/primera-noche" pero la bitácora Notion de hoy ya traía la decisión tomada (construirlo, sin preguntar más).
- `mcp__Supabase__execute_sql` para verificar de punta a punta que un lead insertado vía API realmente llegó a la tabla — mejor que asumir por el código 200 de la respuesta. Borrar el registro de prueba inmediatamente después evita ensuciar `leads` con datos ficticios.

### Cierre 2026-07-11 (v3 headless)
- **QA 13/13 checks OK** — primera vez que pasa completo, todos los checks incluido `/regalo/primera-noche`.
- **`/regalo/primera-noche` construida y en producción** (commit `dcb76bf`): landing + captura de lead (`source=primera_noche_regalo`) + entrega inmediata de PDF + CTA a `/producto/ritual-descanso`. Funnel completo verificado extremo a extremo en producción (curl + SQL directo).
- **3 borradores sociales** con CTA real a `/regalo/primera-noche` (ya no a páginas sustitutas), sin publicar.
- **Blog SEO**: sin borrador nuevo — el de ayer sigue pendiente de aprobación, cadencia semanal respetada.
- Bitácora Notion: https://app.notion.com/p/39a37a0e7b4581eb8e3fd99033817de2
- Pendiente próxima sesión: cuenta Gumroad/Lemon Squeezy (único bloqueador del primer €), aprobación de borradores sociales/blog, Google Search Console, purga de historial del PDF de pago (pendiente de OK explícito, irreversible).

---

## 2026-07-23 — Ciclo interactivo (salud → QA → monetización → contenido)

### Aprendizajes
- **En esta sesión interactiva el shell arrancó con `$PATH=/usr/bin:/bin:/usr/sbin:/sbin` únicamente** — ni `node` ni `npx` (usado por el hook `husky` pre-commit) estaban disponibles hasta exportar `/opt/homebrew/bin` a mano. Esto es distinto del bloqueador TCC/launchd ya documentado (ese impide leer el prompt; esto solo afecta qué binarios ve el shell). Si un comando simple como `node` o `git commit` falla con "not found", revisar el PATH antes de asumir un problema de permisos o de instalación.
- **`blog_posts` tenía 88 filas en `status='draft'`, no 1 como registraba el handoff anterior.** El handoff solo trackeaba el último draft SEO relevante; nunca se había hecho un `count(*) group by category` sobre todo lo acumulado. 85 son restos del agente nocturno viejo (abril–mayo 2026, categorías genéricas "sabiduría"/"nutrición"/"bienestar"/etc.) que nadie revisó ni descartó nunca. **Antes de generar contenido nuevo en un ciclo, correr un conteo de drafts existentes** — si hay backlog grande sin tocar, generar más no ayuda, lo que hace falta es que Papu decida qué hacer con lo acumulado.
- **Decisión tomada sin preguntar (autoridad ya concedida):** saltar la generación de contenido de este ciclo dado el backlog, y en vez de eso escalar el hallazgo con datos concretos (conteo por categoría, fechas) en el handoff. Coherente con la regla de Validación Cruzada del CLAUDE.md: cuando lo pedido por una directiva choca con el estado real, exponer el conflicto en vez de ejecutar a ciegas.

### Qué funciona
- Correr el ciclo completo de forma interactiva (no headless) cuando el bloqueador TCC de `launchd` sigue sin resolver — el acceso a Papu Ext funciona perfecto en sesión interactiva, solo falla dentro del proceso lanzado por `launchd`. Sirve como mitigación temporal mientras Papu resuelve el permiso de sistema.
- `select category, count(*), min(created_at), max(created_at) group by category` sobre `blog_posts` da en una sola query todo lo necesario para diagnosticar un backlog de contenido — más rápido que revisar `/admin/blog` a mano.

### Cierre 2026-07-23 (tarde)
- QA: **13/13 checks OK**, deploy READY commit `a51c4db`.
- Funnel `/regalo/primera-noche` → `/producto/ritual-descanso` reverificado live, sin regresión.
- `leads`/`purchases`: 0 filas, sin actividad todavía.
- **Sin contenido nuevo generado** — decisión deliberada por backlog de 88 drafts sin revisar.
- Commit `e56967a` (solo handoff, ningún cambio de código).
- Pendiente próxima sesión: TCC/Full Disk Access (Papu), decisión sobre backlog de 85 drafts viejos (Papu), Gumroad, Search Console, aprobación de borradores existentes.
