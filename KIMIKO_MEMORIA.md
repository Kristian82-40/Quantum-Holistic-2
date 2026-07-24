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

### Cierre 2026-07-23 (noche)
- Segundo ciclo del mismo día: QA **13/13**, deploy READY commit `58afed4`. `leads`/`purchases` sin cambio (0/0), backlog `blog_posts` sin cambio (88 drafts).
- Housekeeping: `logs/kimiko-qa-nocturna.log` quedaba untracked en el repo desde antes — añadido `logs/` a `.gitignore`. Ningún log de script debería versionarse; si aparece uno nuevo untracked, es señal de que falta esa entrada, no un hallazgo de contenido.
- Todos los pendientes siguen siendo bloqueantes manuales de Papu (TCC, backlog de drafts, Gumroad, Search Console, redes) — nada nuevo que Kimiko pueda resolver de forma autónoma en este ciclo.

---

## 2026-07-23 — Primer ciclo Kimiko Cloud (GitHub Actions, v4 Operadora Total)

### Aprendizajes
- **Migración a GitHub Actions (`kimiko-cloud.yml`) resuelve el bloqueador TCC/launchd** que impedía correr en background desde 2026-07-11 — el entorno cloud no depende del disco Papu Ext ni de permisos macOS. Sin lock local: la concurrencia la gestiona el `concurrency: group: kimiko` del workflow.
- **La tabla de plantas en Supabase se llama `plants`, no `plantas`.** El prompt del ciclo (`kimiko/PROMPT.md`) dice "plantas" en el paso 1.5 — es solo terminología del prompt, la tabla real siempre fue `plants` (confirmado también en `app/diccionario/page.tsx`). No es un bug, es una imprecisión de redacción del prompt — no la corregí sin más contexto porque no es mío decidir tocar el prompt operativo sin que Papu lo revise.
- **El entorno cloud NO tiene canal para ejecutar DDL en Supabase.** Solo llegan `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` como secrets (API REST/PostgREST, para datos, no schema). A diferencia de las sesiones interactivas anteriores que sí tenían `mcp__Supabase__execute_sql`, aquí no hay MCP de Supabase ni Management API token. Bloqueó la tarea "insertar cita diaria en tabla `citas`" del paso 5.3 porque la tabla no existe y no se puede crear vía REST. **Si Papu quiere que Kimiko Cloud pueda migrar, necesita añadir un secret con Management API token o connection string al workflow.**
- **La feature "Tu Planta Aliada" (paso 2) no necesita migración nueva.** El campo `ficha_mistica.afinidad_ayurvedica` ya existe y está poblado en 50/52 plantas (`plants` es JSONB para `ficha_mistica`) — solo faltan `manzanilla` y `equinacea`. Antes de proponer cualquier migración para una feature nueva, revisar primero si el dato ya vive en un campo JSONB existente — ahorra una migración completa.
- **El build de producción incluye `/api/webhooks/btcpay`**, código de una pasarela de pago (cripto) explícitamente descartada por directiva ("Pasarela de pago descartada: BTCPay/cripto"). Es deuda técnica heredada, no se tocó — documentado en bitácora para que Papu decida si se borra.
- **Backlog de `blog_posts` en `draft` subió a 90** (era 88 el 2026-07-23 tarde/noche) — de esos, al menos 8 violan el checklist anti-pseudociencia de forma inequívoca solo por el título (chakras×4, reiki, cristales, biodescodificación, "nutrición cuántica"). Encontrar ejemplos concretos y citarlos en la bitácora es más útil para Papu que solo repetir "hay backlog sin revisar" — da algo accionable de inmediato (ese subconjunto se puede archivar/borrar sin debate).
- **`curl -X POST` contra una ruta con `trailingSlash: true` en `next.config.js` pierde el body/método si se sigue el 308 con `-L`** sin más — mejor apuntar directo a la URL con slash final (`/api/leads/`) que confiar en que curl reenvíe correctamente un 308 con verbo POST.

### Qué funciona
- Test end-to-end real del funnel de leads (POST → verificar en Supabase → DELETE del registro de prueba) sigue siendo la forma más confiable de confirmar que un funnel vive en producción, no solo que las páginas devuelven 200.
- Revisar `Vercel API /v9/projects/<id>/env` para confirmar si una env var existe es más rápido y menos ambiguo que inferirlo del comportamiento del frontend.
- Verificar en el mismo ciclo que ninguna de las 9 plantas peligrosas tenga un archivo de imagen huérfano en disco (`public/images/plants/<slug>-cientifica.jpg`) además de comprobar que el campo en Supabase sea `null` — cubre tanto el vector "alguien puso el campo" como "alguien subió el archivo pero se le olvidó el campo".

### Cierre 2026-07-23 (ciclo cloud 16:50 UTC)
- QA: **8/8 checks OK**, build pasa sin fixes. `next@14.2.5` con vulnerabilidad de seguridad conocida — no actualizado este ciclo (requiere validación completa, no es un bump trivial).
- 52 plantas íntegras, 9 peligrosas con placeholder intacto (doble verificación: campo null + sin archivo huérfano). 43 plantas seguras con imagen válida en disco, 0 faltantes.
- Funnel `/regalo/primera-noche` → `/producto/ritual-descanso` reverificado extremo a extremo (POST real + verificación SQL + limpieza). `leads`/`purchases` en 0 filas — sin actividad real todavía.
- Gumroad: `NEXT_PUBLIC_GUMROAD_URL` sigue sin existir en Vercel — único bloqueador del primer cobro.
- Propuesta de esquema para "Tu Planta Aliada" en bitácora (usa campo ya existente, sin migración) — sin implementar, pendiente de OK de Papu.
- Cita diaria: bloqueada por falta de canal DDL en el entorno cloud — nuevo hallazgo de infraestructura, no accionable sin que Papu añada un secret.
- Sin contenido de blog nuevo — backlog de 90 drafts (8 con violación explícita del checklist) sigue sin revisión de Papu. 2 borradores sociales redactados en bitácora, sin publicar.
- Sin commits de código este ciclo (nada que arreglar); la bitácora la commitea el workflow según `kimiko-cloud.yml`.
- Pendiente próxima sesión: Gumroad, secret de Management API/connection string para DDL, decisión sobre backlog de blog (90 drafts, 8 con violación de checklist), decisión sobre `/api/webhooks/btcpay` heredado.

---

## 2026-07-23 — Segundo ciclo Kimiko Cloud (17:27 UTC)

### Aprendizajes
- **No repetir el test end-to-end de POST/DELETE contra `/api/leads/` en cada ciclo cuando no hubo cambios de código de por medio.** Se verificó extremo a extremo en el ciclo de las 16:52 UTC; repetirlo 35 minutos después sin ningún commit intermedio no aporta señal nueva, solo ensucia potencialmente la tabla `leads` con más filas de prueba. Repetir ese test solo tiene sentido si cambió el código del funnel o pasó tiempo suficiente para sospechar de una regresión de infraestructura (ej. rotación de keys, cambio de RLS).
- **Cuando dos ciclos consecutivos del mismo día no tienen ningún commit de código entre medias, todos los indicadores (QA, leads, purchases, backlog de blog) deberían salir idénticos — y así fue.** Confirma que el pipeline de QA es determinista y que no hay actividad de usuarios reales todavía. Si en un futuro ciclo cercano en el tiempo aparece una diferencia sin que haya habido commit ni acción manual, es señal de alerta (dato mutado fuera de banda) más que un hallazgo normal.

### Qué funciona
- Cuando el ciclo anterior ya dejó una propuesta en bitácora sin implementar (ej. "Tu Planta Aliada", esquema `citas`), el ciclo siguiente solo necesita referenciarla y confirmar que sigue vigente — no hace falta re-redactar la propuesta completa cada vez, basta con apuntar a que no cambió.

### Cierre 2026-07-23 (ciclo cloud 17:27 UTC)
- QA: **8/8 checks OK**, sin diferencias frente al ciclo de las 16:52 UTC (mismo build limpio, mismas 52 plantas, mismos 0 leads/purchases).
- Sin test end-to-end repetido del funnel de leads (ver aprendizaje arriba) — páginas verificadas con 200, sin regresión visible.
- Gumroad y canal DDL para `citas` siguen bloqueados — mismas 2 tareas de Papu que en el ciclo anterior.
- Backlog `blog_posts` sin cambio: 90 drafts / 19 published, mismo desglose por categoría. Sin contenido nuevo generado (misma decisión deliberada del ciclo anterior).
- Sin commits de código este ciclo; la bitácora la commitea el workflow.

---

## 2026-07-23 — Tercer ciclo Kimiko Cloud (21:09 UTC)

### Aprendizajes
- **`plants` tiene un duplicado real de contenido: `equinacea` y `echinacea` son la misma especie** (`nombre_latino = "Echinacea purpurea"` en ambas filas, dos slugs distintos). No es un problema de seguridad (ninguna es de las 9 peligrosas) sino de calidad de datos — quedó sin detectar en los 2 ciclos anteriores del día porque los checks de QA verifican conteo total (52) e integridad de las peligrosas, no duplicados dentro de las seguras. **Vale la pena, en ciclos futuros que toquen "Tu Planta Aliada" o el diccionario, cruzar `nombre_latino` contra `slug` para pescar duplicados** — no asumir que 52 filas = 52 especies únicas. No se resuelve sin decisión de Papu: cualquiera de los dos slugs puede estar ya indexado en Google, y fusionar/borrar sin verificar primero rompería un enlace real.
- **`image_mistica_url` (columna en `plants`) está sin usar en todo el código** — confirmado con grep sobre `app/diccionario/page.tsx` y `app/diccionario/[slug]/page.tsx`: solo leen `image_cientifica_url`. Que las 43 plantas seguras tengan `image_mistica_url = null` no es un hallazgo de datos faltantes, es un campo reservado para una feature que nunca se construyó. Antes de reportar un campo NULL masivo como bug, grep first — puede ser simplemente no-usado-todavía.
- **El commit único que aparece en `git log` de este entorno (`kimiko: bitácora ciclo 2026-07-23-1728`) contiene el repo completo, no un diff incremental** — es el commit de inicialización del sandbox/checkout de esta sesión, no evidencia de que un ciclo real haya corrido a las 17:28 y no haya dejado archivo de bitácora. Confirmado que no hay bitácora `2026-07-23-1728.md` en `kimiko/bitacora/` (solo `1650` y `1727`), consistente con que ese commit es artefacto de entorno, no un ciclo perdido. No investigar más a fondo la arqueología de git de un entorno sandbox — no es información accionable dentro del propio ciclo.

### Qué funciona
- `grep -rn "<nombre_de_columna>" app/ components/` antes de reportar un campo de Supabase como "faltante" en N filas — distingue en segundos si es un dato roto o un campo sin feature construida encima.
- Listar explícitamente los `slug` de los drafts de blog que violan el checklist anti-pseudociencia (en vez de solo repetir el conteo "8") deja el hallazgo directamente accionable para Papu sin que tenga que volver a buscarlos cada vez que lee la bitácora.

### Cierre 2026-07-23 (ciclo cloud 21:09 UTC)
- QA: **8/8 checks OK**, tercer ciclo del día sin ningún commit de código entre medias — todos los indicadores (build, 52 plantas, 9 peligrosas con placeholder, leads/purchases 0/0, sitemap/robots) idénticos a los ciclos de 16:52 y 17:27 UTC.
- **Hallazgo nuevo:** duplicado de contenido `equinacea`/`echinacea` (misma especie, dos filas) — documentado en bitácora, sin tocar hasta que Papu decida el slug canónico.
- Gumroad y canal DDL para `citas` siguen bloqueados — mismas tareas pendientes.
- Backlog `blog_posts` sin cambio: 90 drafts / 19 published, los mismos 8 drafts con violación de checklist ahora listados por slug en la bitácora para acción directa.
- Sin contenido nuevo generado (mismo backlog sin revisar), sin borradores sociales nuevos (los 2 vigentes del ciclo de 16:52 no se duplican).
- Sin commits de código este ciclo; bitácora y memoria las commitea el paso dedicado del workflow.

---

## 2026-07-24 — Cuarto ciclo Kimiko Cloud (02:50 UTC)

### Aprendizajes
- **`data/dangerous-plants.json` existe y no estaba documentado en ninguna bitácora anterior** — es un archivo de gobierno con política explícita ("NO generar a ciegas. Requieren aprobación visual manual antes de renombrar/publicar.") que trackea candidatos de imagen para las 9 plantas peligrosas. Hay un archivo real (`public/images/plants/plant-00-beleno-negro-cientifica.jpg`, 784×1168) para `beleno-negro`, con nota "Archivo SuperGrok existe; aprobar visualmente y renombrar". **Verificado inactivo**: el prefijo `plant-00-` no coincide con el patrón exacto `{slug}-cientifica.jpg` que `diskImgExists()` comprueba en disco (`app/diccionario/page.tsx`, `[slug]/page.tsx`), así que hoy renderiza el placeholder de inicial. El límite inamovible "placeholder intacto siempre" para las 9 peligrosas aplica sin excepción — **aunque el JSON invite a "aprobar y renombrar", esa decisión nunca es de Kimiko**, solo de Papu. Antes de reportar un hallazgo de este tipo como bug, comprobar primero si ya existe un mecanismo de gating (aquí lo hay, y funciona) — el hallazgo es informativo, no una vulnerabilidad activa.
- **El funnel de leads (`POST /api/leads/` → verificación en Supabase → DELETE) vale la pena repetirlo cuando ha pasado >24h desde el último test real**, incluso sin commits de código de por medio — la regla del ciclo anterior era "no repetir si no cambió código", pero un intervalo largo (aquí ~29h) sí justifica una repetición porque cubre riesgos de infraestructura (rotación de keys, cambios de RLS) que no dejan rastro en git. Repetido este ciclo, sin incidencias.
- **Criterio afinado para cuándo repetir el test E2E del funnel**: no solo "¿cambió el código?" sino también "¿cuánto tiempo pasó desde la última verificación real?" — un ciclo que arranca el primer día distinto (aunque sea horas después del último del día anterior) es buen punto natural para repetirlo una vez, luego no hace falta en ciclos subsiguientes del mismo día si no hay cambios.

### Qué funciona
- Cruzar explícitamente la lista de slugs seguros de Supabase contra los archivos en `public/images/plants/` con un script Python de una línea (no solo confiar en el conteo agregado) confirma en segundos que las 43 plantas seguras tienen imagen sin missing — más riguroso que asumir por el conteo total.
- Revisar `data/*.json` (no solo `app/`, `components/`, Supabase) al hacer QA de las plantas peligrosas — ahí puede vivir metadata de gobierno/política que no aparece en ningún otro sitio y que es relevante para el límite inamovible más estricto del mandato.

### Cierre 2026-07-24 (ciclo cloud 02:50 UTC)
- QA: **8/8 checks OK**, build pasa sin fixes. Mismos indicadores estructurales que el último ciclo del 23-jul (52 plantas, 9 peligrosas con placeholder, 43 seguras con imagen, sitemap/robots OK).
- **Hallazgo nuevo documentado (sin acción, ya bien gestionado):** archivo candidato de imagen real para `beleno-negro` en disco, inactivo por diseño (nombre no coincide con el patrón que consume el frontend). Ver bitácora para detalle completo.
- Funnel `/regalo/primera-noche` → `/producto/ritual-descanso` reverificado extremo a extremo (POST real + SQL + limpieza) tras >24h del último test real — sano.
- Gumroad y canal DDL para `citas` siguen bloqueados — mismas tareas pendientes de Papu.
- Backlog `blog_posts` sin cambio: 90 drafts / 19 published, mismos 8 drafts con violación de checklist. Sin contenido de blog nuevo (misma decisión deliberada).
- 2 borradores sociales nuevos redactados (1 Instagram sobre el regalo, 1 LinkedIn sobre el diccionario/posicionamiento), sin publicar.
- Sin commits de código este ciclo; bitácora y memoria las commitea el paso dedicado del workflow.

---

## 2026-07-24 — Quinto ciclo Kimiko Cloud (06:30 UTC)

### Aprendizajes
- **Un `nombre_latino` repetido en `plants` no implica duplicado de contenido — hay que comparar `nombre_es` + `ficha_cientifica` antes de reportarlo.** Al hacer por primera vez un cruce sistemático de `nombre_latino` sobre las 52 filas (no solo el par ya conocido `equinacea`/`echinacea`), apareció un segundo par: `ashwagandha` / `ashwagandha-fruto` (ambos *Withania somnifera*). Investigado a fondo: son fichas distintas a propósito (raíz vs. fruto), con `nombre_es`, `ficha_cientifica.evidencia`, posología e imágenes en disco todas distintas. **Descartado como duplicado** — no requiere decisión de Papu, a diferencia de `equinacea`/`echinacea` que sí es contenido idéntico duplicado. Documentar esto evita que un ciclo futuro lo vuelva a marcar como hallazgo nuevo.
- **El backlog de 90 drafts de blog lleva ya 6 ciclos consecutivos como la misma tarea pendiente sin resolución** (desde el 2026-07-23 tarde). Es un bloqueador crónico, no una decisión puntual — vale la pena decirlo así de explícito en la bitácora en vez de solo repetir el hallazgo cada vez, para que quede claro que el patrón en sí (no solo el conteo) es la señal a atender.

### Qué funciona
- Cruzar `nombre_latino` con `python3` + `urllib` directo contra la REST API de Supabase (sin necesidad de MCP) es suficiente para detectar duplicados de especie en `plants` — no hace falta canal DDL para esta clase de auditoría de datos, solo lectura.
- Revisar el código fuente de un componente (`RitualCheckout.tsx`) en vez de solo confiar en el HTML renderizado por curl confirma con certeza el comportamiento de fallback cuando una env var falta — el HTML estático de una página cliente no siempre refleja el string exacto que se busca con grep.

### Cierre 2026-07-24 (ciclo cloud 06:30 UTC)
- QA: **8/8 checks OK**, build pasa sin fixes. Mismos indicadores estructurales que el ciclo de 02:50 UTC (52 plantas, 9 peligrosas con placeholder, 43 seguras con imagen, leads/purchases 0/0, sitemap/robots OK).
- **Hallazgo nuevo (resuelto en el mismo ciclo, sin acción pendiente):** `ashwagandha`/`ashwagandha-fruto` comparten `nombre_latino` pero NO son duplicado — verificado y documentado para no repetir el chequeo.
- Gumroad y canal DDL para `citas` siguen bloqueados — mismas tareas pendientes de Papu.
- Backlog `blog_posts` sin cambio: 90 drafts / 19 published, mismos 8 drafts con violación de checklist — sexto ciclo consecutivo con el mismo pendiente, ahora marcado explícitamente como bloqueador crónico en la bitácora.
- 2 borradores sociales nuevos (1 Instagram sobre disponibilidad honesta de ritual-descanso, 1 LinkedIn sobre transparencia editorial), sin publicar.
- Sin test E2E de leads repetido (último real fue hace ~3.5h, por debajo del umbral de 24h).
- Sin commits de código este ciclo; bitácora y memoria las commitea el paso dedicado del workflow.

---

## 2026-07-24 — Sexto ciclo Kimiko Cloud (10:22 UTC)

### Aprendizajes
- **El entorno cloud recibió `VERCEL_TOKEN` como secret nuevo este ciclo** (no estaba en ninguno de los 5 ciclos anteriores, solo `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`). Permite consultar en vivo `GET https://api.vercel.com/v9/projects/<project_id>/env` para confirmar el estado real de env vars de producción (ej. `NEXT_PUBLIC_GUMROAD_URL`) en vez de depender de lo que dice esta memoria — usado este ciclo, mismo resultado (12 vars, sin Gumroad) pero ahora con verificación en vivo. **Importante: `VERCEL_TOKEN` no da canal DDL para Supabase** — son plataformas distintas, seguir pidiendo un secret separado (Management API token o connection string de Postgres) para poder crear la tabla `citas`.
- Antes de asumir que un secret nuevo resuelve un bloqueador pendiente, verificar contra qué plataforma opera — un ciclo futuro no debería dar por resuelto el bloqueador de `citas` solo porque llegó *algún* secret nuevo.

### Qué funciona
- Revisar el listado completo de variables de entorno del runner (`env | grep -viE "<ruido conocido>"`) al inicio del ciclo detecta secrets nuevos sin tener que esperar a que se documenten en otro sitio — así se encontró `VERCEL_TOKEN` este ciclo.

### Cierre 2026-07-24 (ciclo cloud 10:22 UTC)
- QA: **8/8 checks OK**, build pasa sin fixes. Mismos indicadores estructurales que el ciclo de 06:30 UTC (52 plantas, 9 peligrosas con placeholder, 43 seguras con imagen, leads/purchases 0/0, sitemap/robots OK).
- **Novedad de infraestructura:** `VERCEL_TOKEN` disponible por primera vez — usado para confirmar en vivo que `NEXT_PUBLIC_GUMROAD_URL` sigue sin existir en Vercel (12 env vars, ninguna Gumroad).
- Gumroad y canal DDL para `citas` siguen bloqueados — mismas tareas pendientes de Papu (el DDL de Supabase sigue sin resolverse pese al secret nuevo, ver aprendizaje arriba).
- Backlog `blog_posts` sin cambio: 90 drafts / 19 published, mismos 8 drafts con violación de checklist — séptimo ciclo consecutivo con el mismo pendiente.
- 2 borradores sociales nuevos (1 Instagram sobre "Tu Planta Aliada", 1 LinkedIn sobre por qué 9 plantas no muestran foto), ángulo distinto a los de ciclos anteriores, sin publicar.
- Sin test E2E de leads repetido (último real fue en el ciclo de 06:30 UTC, ~3h50min antes, por debajo del umbral de 24h).
- Sin commits de código este ciclo; bitácora y memoria las commitea el paso dedicado del workflow.

---

## 2026-07-24 — Octavo ciclo Kimiko Cloud (13:50 UTC)

### Aprendizajes
- **Ningún secret nuevo llegó este ciclo** — mismo trío que el ciclo de 10:22 UTC (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VERCEL_TOKEN`). El bloqueador de DDL para `citas` sigue exactamente igual; no vale la pena volver a comprobar el listado completo de env vars en ciclos consecutivos muy cercanos en el tiempo si el ciclo anterior ya lo hizo — basta con confirmar que no cambió el conteo/nombres.
- **El criterio de "última prueba E2E real" hay que rastrearlo con cuidado entre ciclos**: la bitácora de 10:22 UTC decía que el último test real fue "en el ciclo de 06:30 UTC", pero revisando la cadena completa, el 06:30 UTC tampoco hizo un test real — solo el de 02:50 UTC lo hizo. Ese tipo de imprecisión se puede arrastrar de bitácora en bitácora si cada ciclo solo copia lo que dice la inmediatamente anterior en vez de rastrear la memoria completa. Este ciclo se corrigió: el último test real verificado es el de 02:50 UTC (~11h antes de este ciclo), todavía por debajo del umbral de 24h.

### Qué funciona
- Cuando dos ciclos seguidos no tienen ningún commit de código ni acción manual de Papu entre medias, todos los indicadores (QA, plantas, imágenes, leads/purchases, blog backlog, env vars) deberían salir idénticos — y así fue de nuevo. Sirve como chequeo de sanidad rápido: si algo difiere sin explicación, es señal de alerta antes que hallazgo normal.

### Cierre 2026-07-24 (ciclo cloud 13:50 UTC)
- QA: **8/8 checks OK**, build pasa sin fixes. Mismos indicadores estructurales que el ciclo de 10:22 UTC (52 plantas, 9 peligrosas con placeholder, 43 seguras con imagen, leads/purchases 0/0, sitemap/robots OK).
- Gumroad y canal DDL para `citas` siguen bloqueados — mismas tareas pendientes de Papu, sin secret nuevo este ciclo.
- Backlog `blog_posts` sin cambio: 90 drafts / 19 published, mismos 8 drafts con violación de checklist — octavo ciclo consecutivo con el mismo pendiente.
- 2 borradores sociales nuevos (1 Instagram invitando directo al regalo, 1 LinkedIn sobre rigor editorial sin exponer detalles internos), ángulo distinto a ciclos anteriores, sin publicar.
- Sin test E2E de leads repetido (último real: 02:50 UTC, ~11h antes, por debajo del umbral de 24h — ver aprendizaje sobre rastrear la cadena completa, no solo el ciclo inmediatamente anterior).
- Sin commits de código este ciclo; bitácora y memoria las commitea el paso dedicado del workflow.

---

## 2026-07-24 — Noveno ciclo Kimiko Cloud (17:41 UTC)

### Aprendizajes
- **Ningún secret nuevo llegó este ciclo tampoco** — mismo trío que los 2 ciclos anteriores (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VERCEL_TOKEN`). El bloqueador de DDL para `citas` sigue exactamente igual desde el 2026-07-23 16:50 UTC.
- **La cadena de "último test E2E real" del funnel de leads se rastreó de nuevo contra la memoria completa, no contra la bitácora inmediatamente anterior** (que solo repetía lo dicho antes sin verificarlo de nuevo) — el último test real confirmado sigue siendo el del ciclo de 02:50 UTC. Sirve de recordatorio: cuando una bitácora dice "sin repetir, por debajo del umbral", el ciclo siguiente debe seguir contando desde la fecha real del último test, no desde la bitácora anterior sin más.

### Qué funciona
- El patrón ya establecido de recruce rápido (script Python de una llamada REST) para "43 seguras con imagen" y "duplicados por nombre_latino" sigue siendo suficiente para descartar regresiones de datos sin necesitar canal DDL — se repitió este ciclo sin hallazgos nuevos, confirmando que ambas verificaciones son baratas de repetir cada ciclo.

### Cierre 2026-07-24 (ciclo cloud 17:41 UTC)
- QA: **8/8 checks OK**, build pasa sin fixes. Mismos indicadores estructurales que el ciclo de 13:50 UTC (52 plantas, 9 peligrosas con placeholder, 43 seguras con imagen, leads/purchases 0/0, sitemap/robots OK).
- Gumroad y canal DDL para `citas` siguen bloqueados — mismas tareas pendientes de Papu, sin secret nuevo este ciclo (noveno ciclo consecutivo).
- Backlog `blog_posts` sin cambio: 90 drafts / 19 published, mismos 8 drafts con violación de checklist — noveno ciclo consecutivo con el mismo pendiente crónico.
- Duplicados `equinacea`/`echinacea` (real, pendiente Papu) y `ashwagandha`/`ashwagandha-fruto` (descartado) reconfirmados sin cambios.
- 2 borradores sociales nuevos (1 Instagram sobre el diccionario como recurso educativo, 1 LinkedIn sobre construir despacio sin pasarela de pago activa aún), ángulo distinto a ciclos anteriores, sin publicar.
- Sin test E2E de leads repetido (último real: 02:50 UTC, ~15h antes, por debajo del umbral de 24h).
- Sin commits de código este ciclo; bitácora y memoria las commitea el paso dedicado del workflow.

---

## 2026-07-24 — Décimo ciclo Kimiko Cloud (21:05 UTC)

### Aprendizajes
- **Ningún secret nuevo llegó este ciclo tampoco** — mismo trío que los 3 ciclos anteriores (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VERCEL_TOKEN`). El bloqueador de DDL para `citas` sigue exactamente igual desde el 2026-07-23 16:50 UTC — ya son 10 ciclos consecutivos sin canal de escritura DDL.
- **El umbral de 24h para repetir el test E2E de leads sigue funcionando como criterio simple y suficiente** — con el último test real en 02:50 UTC y este ciclo a las 21:05 UTC (~18h15min), no hizo falta repetirlo. Confirma que el criterio afinado en el ciclo de 13:50 UTC (rastrear la cadena completa de memoria, no solo la bitácora inmediatamente anterior) sigue siendo el correcto — no hubo que corregir nada esta vez porque el ciclo de 17:41 UTC ya había rastreado bien la fecha.

### Qué funciona
- El patrón establecido de recruce rápido (script Python de una sola llamada REST) para "43 seguras con imagen" y "duplicados por nombre_latino" se repitió una vez más sin hallazgos nuevos — confirma que ambas verificaciones son baratas y vale la pena mantenerlas en cada ciclo aunque no cambien, porque son la única forma barata de detectar una regresión de datos sin necesitar canal DDL.
- Verificar el fallback de `RitualCheckout.tsx` leyendo el código fuente (no solo el HTML renderizado) sigue siendo el método correcto para confirmar el comportamiento sin Gumroad — repetido este ciclo, mismo resultado.

### Cierre 2026-07-24 (ciclo cloud 21:05 UTC)
- QA: **8/8 checks OK**, build pasa sin fixes. Mismos indicadores estructurales que el ciclo de 17:41 UTC (52 plantas, 9 peligrosas con placeholder, 43 seguras con imagen, leads/purchases 0/0, sitemap/robots OK).
- Gumroad y canal DDL para `citas` siguen bloqueados — mismas tareas pendientes de Papu, sin secret nuevo este ciclo (décimo ciclo consecutivo).
- Backlog `blog_posts` sin cambio: 90 drafts / 19 published, mismos 8 drafts con violación de checklist — décimo ciclo consecutivo con el mismo pendiente crónico.
- Duplicados `equinacea`/`echinacea` (real, pendiente Papu) y `ashwagandha`/`ashwagandha-fruto` (descartado) reconfirmados sin cambios.
- 2 borradores sociales nuevos (1 Instagram sobre qué se hace con el email del regalo, 1 LinkedIn sobre la estructura de rigor de cada ficha del diccionario), ángulo distinto a ciclos anteriores, sin publicar.
- Sin test E2E de leads repetido (último real: 02:50 UTC, ~18h15min antes, por debajo del umbral de 24h).
- Sin commits de código este ciclo; bitácora y memoria las commitea el paso dedicado del workflow.
