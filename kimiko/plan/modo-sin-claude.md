# Modo sin Claude (P1, D7)

Qué sigue funcionando cuando no hay suscripción de Claude ni sesiones de Claude Code, qué se congela y cómo se opera a mano desde Telegram.
Escrito el 15-oct-2026 con lo comprobado ese día; cada pieza nueva que se construya tiene que decir aquí si depende de Claude (regla 15 del arranque).

## Qué depende de Claude hoy
Solo dos cosas:
1. **Kimiko Cloud** (`.github/workflows/kimiko-cloud.yml`): usa `anthropics/claude-code-action` con la suscripción (`CLAUDE_CODE_OAUTH_TOKEN`). Es quien convierte una orden de Telegram en una rama y un PR.
2. **Las sesiones de Claude Code**: arreglos de código, migraciones, despliegues de Edge Functions, revisión de PR y pasar a `verificada` las tareas que Kristian deja en `esperando_prueba`.

Todo lo demás corre con capas gratuitas (Groq, Gemini, Workers AI, Supabase, Cloudflare, Vercel, GitHub Actions).

## Sigue funcionando sin Claude
| Pieza | Dónde corre | Cómo se ve que va bien |
|---|---|---|
| Web quantum-holistic.com | Vercel, rama `main` | se abre en el móvil |
| Borrador diario del blog + reintentos | `kimiko-diario` por `pg_cron` (06:00 UTC; 07:30, 09:30, 12:30 y 15:30) | llega el borrador a Telegram cada mañana |
| Imágenes (acuarela flux, fichas PNG) | `kimiko-imagen`, `kimiko-ficha` | el borrador trae imagen |
| Publicar / retirar un post o una ficha | botones ✅ Publicar y 🗑 Retirar del worker | la URL pública responde tras pulsar |
| Comandos `/estado`, `/auditar`, `/manual`, `/hoy`, `/pieza <slug>` | worker `kimiko` (Cloudflare) | responden al momento |
| Charlas cortas y triaje de órdenes | `kimiko-orden` (Groq → Workers AI) | contesta sin despertar a Kimiko Cloud |
| Notas de voz | `kimiko-voz` (Groq Whisper → Workers AI) | «He entendido: …» con ✅ / ✖ |
| Auditoría semanal | `pg_cron` domingos 08:00 UTC | resumen en Telegram |
| Reels | `kimiko-reel.yml` (Actions, sin Claude) | el reel llega a Telegram |
| Vigilancia (Lighthouse, gitleaks, Dependabot) y fusión automática | Actions, sin Claude | avisos en Telegram |
| Cobro con Stripe | webhook en la web (`/api/webhooks/stripe/`) | el pago activa el plan |
| Cola de tareas | `kimiko_tareas` + `/hoy`; en el Mac, `bash kimiko/tareas/run.sh` (sin llaves) | la lista se actualiza |

## Se congela sin Claude
- **Órdenes que tocan la web** (textos, páginas, arreglos): Kimiko Cloud no puede ejecutarlas. Hoy, la orden se guarda y, si la ejecución falla, la cola la marca `error_ejecucion` y avisa por Telegram. No se pierde: queda para cuando vuelva Claude.
- **Cambios de código, migraciones y despliegues de Edge Functions.**
- **Verificar las tareas** que Kristian deja en `esperando_prueba` (quedan así hasta la siguiente sesión).
- **Revisión de PR** de Dependabot y de Kimiko: el fusionador sigue fusionando lo no delicado en verde; lo delicado espera.

## Operarlo a mano desde Telegram
| Quiero… | Hago |
|---|---|
| saber si todo va bien | `/estado` (ESTADO.md + último chequeo + borrador de hoy) |
| revisar la base | `/auditar` |
| publicar el borrador del día | revisarlo y pulsar ✅ Publicar (pasa los controles de salud; si no los pasa, lo dice) |
| retirar algo publicado | `/pieza <parte del slug>` → 🗑 Retirar |
| ver mis tareas | `/hoy` |
| hacer una tarea con guía (en el Mac) | `bash kimiko/tareas/run.sh` |
| parar una tarea automática | panel de Supabase en el móvil → SQL: `update kimiko_runbook set activa = false where id = '<tarea>';` (`/manual` enseña las tareas y su estado) |
| saber qué falló de noche | el chequeo de las 06:00 UTC manda cada fallo con su acción exacta |

## Dependencias de Claude que conviene quitar (propuestas)
1. **Interruptor «Claude apagado»** en el worker: cuando no haya suscripción, no despertar a Kimiko Cloud; guardar la orden como `para_claude` y contestar «guardada para cuando vuelva Claude». Hoy la orden falla y avisa con `error_ejecucion`, que funciona pero es más ruidoso.
2. **`/pausa` en Telegram**: `DECISIONES.md` dice que bajar de nivel es inmediato con `/pausa`, pero el comando **todavía no existe** (15-oct). Hasta entonces, la parada es la consulta de `kimiko_runbook` de arriba.
3. **Desplegar las Edge Functions desde Actions al fusionar** (como ya se hace con el worker), para que un cambio fusionado no necesite una sesión de Code para llegar a producción. Necesita un token de Supabase que crea Kristian.
4. **Verificación automática de tareas**: que cada módulo del ejecutor (`kimiko/tareas/modulos/`) traiga su comprobación, para que la tarea pase sola a `verificada` sin Code.
