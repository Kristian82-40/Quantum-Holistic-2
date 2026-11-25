# CLAUDE.md — reglas fijas de Quantum Holistic

Estado vivo → `ESTADO.md` · Encargo → `kimiko/plan/` · Fallos → `LIBRO_FALLOS.md`
Contradicción con otra memoria → manda este archivo.

## 1. Quién decide
Kristian decide. PRs de `claude/*` y `kimiko/*` se fusionan solos cuando las pruebas están en verde
(`kimiko-fusion.yml`; verificar: `gh workflow view kimiko-fusion.yml`).
Kristian aprueba DB, pagos, reglas de Kimiko y el fusionador. Llega por Telegram.

## 2. Arquitectura congelada (aprobada 7-oct-2026)
Sin cambios de plataforma sin "sí" explícito de Kristian.

| Pieza | Plataforma | Código |
|---|---|---|
| Web quantum-holistic.com | Vercel · rama `main` · proyecto `quantum-holistic-2` | Next.js 14, este repo |
| Base de datos | Supabase `vctetjugbvyllwjpxcxh` | tablas `kimiko_*`, `blog_posts`, `plants` |
| Trabajo diario Kimiko | Edge Function `kimiko-diario` vía `pg_cron` | `supabase/functions/kimiko-diario` |
| Imágenes | Edge Functions `kimiko-imagen`, `kimiko-ficha` | `supabase/functions/` |
| Telegram + comandos | Cloudflare Worker `kimiko` | `kimiko/worker` |
| Órdenes a la web | GitHub Actions `Kimiko Cloud` | `.github/workflows/kimiko-cloud.yml` |

## 3. Reglas de trabajo
1. **Nada es "hecho" sin prueba.** `ESTADO.md`: cada línea lleva su comprobación. Sin prueba → «sin verificar».
2. **Comprobar antes de proponer.** Leer código o config desplegada, no la memoria.
3. **Desde el móvil.** Avisar cuando la tarea exija el Mac.
4. **Coste 0 €.** Solo capas gratuitas. Proponer importe antes de gastar.
5. **Cambios en PR.** `main` solo por PR. Editar solo las líneas necesarias.
6. **Repo público.** Secretos: Supabase Secrets / Cloudflare / GitHub Secrets. Nunca en el código.
7. **Lo desplegado = lo del repo.** Mismo código, mismo PR.
8. **Contenido de salud.** Sin promesas de curar, sin dosis. Con contraindicaciones y aviso médico.
9. **Cerrar sesión.** Actualizar `ESTADO.md`. Bitácora en `kimiko/bitacora/` si el trabajo fue largo.

## 4. Candados automáticos (`.claude/settings.json` + `.claude/hooks/`)
- **PreToolUse/Bash**: bloquea `gh pr merge`, push a `main`, quitar `no-fusionar`, deploys a producción, SQL de escritura en bash.
- **PreToolUse/MCP Supabase**: bloquea `execute_sql` con escritura y `apply_migration`.
- **Stop**: si hay TypeScript sin confirmar, corre typecheck y pruebas antes de cerrar.
Verificar: `jq '.hooks' .claude/settings.json`

## 5. Skills (`.claude/skills/` — Claude Code las carga solo)
`qh-sesion` · `qh-cambio-seguro` · `qh-seguridad` · `qh-editorial` · `qh-diseno` · `qh-kimiko-despliegue` · `qh-chat-seguridad`
Verificar: `ls .claude/skills/`

## 6. Conectores (sin verificar — comprobar con la herramienta)
- Probados en este proyecto: Supabase, Vercel, GitHub, Cloudflare (lectura), Telegram (vía Kimiko).
- Disponibles sin probar aquí: Gmail, Google Drive, Google Calendar, Notion.
- No conectados: n8n (sin servidor), Instagram Graph API (sin llaves Business), Stripe en vivo.
