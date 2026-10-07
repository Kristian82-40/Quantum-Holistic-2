# CLAUDE.md — reglas fijas de Quantum Holistic

Lo lee cualquier sesión de Claude (chat, Claude Code o Kimiko Cloud) **antes de tocar nada**.
El estado vivo está en [`ESTADO.md`](ESTADO.md). Si este archivo y la memoria de una sesión no coinciden, manda este.

## 1. Quién manda
- **Kristian** decide. Aprueba cambios fusionando PRs (desde Telegram o GitHub en el móvil).
- **Kimiko** es el responsable operativo del proyecto: publica, vigila y avisa.
- **Claude Code / chat** ayuda a Kimiko cuando algo le supera, y deja todo escrito aquí y en `ESTADO.md`.

## 2. Arquitectura congelada (aprobada el 7-oct-2026)
No se cambia de plataforma sin un "sí" explícito de Kristian en el chat.

| Pieza | Dónde vive | Código |
|---|---|---|
| Web q-h.com | Vercel, proyecto `quantum-holistic-2`, rama `main` | este repo (Next.js 14) |
| Base de datos y memoria | Supabase `vctetjugbvyllwjpxcxh` | tablas `kimiko_*`, `blog_posts`, `plants` |
| Trabajo diario (blog + redes + vigilancia) | Supabase Edge Function `kimiko-diario`, lanzada por `pg_cron` | `supabase/functions/kimiko-diario` + `_kimiko/` |
| Imágenes | Edge Functions `kimiko-imagen` (Workers AI flux) y `kimiko-ficha` (SVG→PNG) | `supabase/functions/` |
| Entrada de Telegram | Cloudflare Worker `kimiko` (solo webhook) | pendiente de subir al repo (ver ESTADO) |
| Órdenes que tocan la web | GitHub Actions `Kimiko Cloud` → rama + PR | `.github/workflows/kimiko-cloud.yml`, `kimiko/PROMPT.md` |

## 3. Reglas de trabajo
1. **Nada es "hecho" sin prueba.** Cada línea de `ESTADO.md` lleva cómo se comprobó (consulta, URL, log). Si no se ha comprobado, se escribe "sin verificar".
2. **Comprobar antes de proponer.** Antes de dar un arreglo, mirar el código o la configuración desplegada, no la memoria.
3. **Lo que Kristian puede hacer desde el móvil.** Nunca darle tareas que exijan el Mac sin avisar de que las exigen.
4. **Coste 0 €.** Solo capas gratuitas (Gemini free, Workers AI 10.000 neuronas/día, Supabase Free, Vercel Hobby, Actions en repo público). Cualquier gasto se propone con importe y se espera el sí.
5. **Cambios pequeños y en PR.** `main` solo por PR. Editar solo las líneas necesarias.
6. **El repo es público.** Nunca secretos en el código, en los logs ni en los PR. Los secretos van a Supabase Secrets, Cloudflare o GitHub Secrets.
7. **Lo desplegado = lo del repo.** Si se despliega algo, el mismo código entra en el repo en el mismo PR.
8. **Contenido de salud.** Sin promesas de curar, sin dosis, con contraindicaciones y aviso de consultar con un profesional. Todo contenido nuevo nace como borrador.
9. **Cerrar cada sesión** actualizando `ESTADO.md` (qué cambió y con qué prueba) y, si hubo trabajo largo, una nota en `kimiko/bitacora/`.

## 4. Skills (7-oct-2026)
Cada skill es una forma de trabajar ligada a una herramienta real. Si la herramienta no está, se dice "pendiente", no se finge.

| Skill | Qué significa aquí | Herramienta real | Estado |
|---|---|---|---|
| **UI UX to Max!** | Diseño y conversión de q-h.com: capturas reales, 2–3 propuestas, cambios en PR con vista previa de Vercel | skill `frontend-design` + Vercel Preview | activa |
| **Claude Mem** | No perder el hilo: decisiones en `ESTADO.md`, diario en `KIMIKO_MEMORIA.md` y `kimiko/bitacora/`, memoria del proyecto en claude.ai | estos archivos + Supabase `kimiko_learnings` | activa |
| **n8n MCP** | Flujos omnicanal (Telegram, leads, alertas) | n8n no está instalado ni conectado; hoy lo hacen `pg_cron` + Edge Functions + el worker de Telegram | pendiente: necesita servidor propio (coste) y decisión de Kristian |
| **Light Tag** | Etiquetas estructuradas para plantas, leads y servicios en Supabase | columnas `tags` en Supabase vía migración | pendiente de diseñar el esquema |
| **Diff-Only** | Cambiar solo las líneas necesarias y enseñar solo el diff | edición por bloques + PR | activa |

## 5. Conectores
- Activos y probados (7-oct): Supabase, Vercel, Cloudflare (lectura), GitHub (repo y Actions). Telegram, a través de Kimiko.
- Disponibles pero sin probar en este proyecto: Gmail, Google Drive, Google Calendar, Notion.
- No conectados: n8n, Instagram Graph API (faltan llaves de cuenta Business), Stripe en vivo.
- Plantillas o skills de GitHub de terceros: leer el código antes de instalarlas; ninguna que envíe tokens a servidores ajenos.
- Revisor automático de PRs con IA: retirado el 7-oct (necesitaba API de pago). La revisión la hace la sesión que abre el PR.
