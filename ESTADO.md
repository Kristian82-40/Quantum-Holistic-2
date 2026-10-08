# ESTADO.md — qué funciona hoy y con qué prueba

**Última revisión:** 8-oct-2026, 10:45 (Madrid) · por Claude Code (encargo de skills y autonomía, PR #9, #10, #11 y #16) · reglas en [`CLAUDE.md`](CLAUDE.md)

Leyenda: ✅ funciona (probado) · ⚠️ funciona a medias · ❌ roto · ❓ sin verificar

## Web q-h.com
| | Qué | Prueba |
|---|---|---|
| ✅ | Producción desplegada desde `main` (commit `8be6901`) | Vercel `quantum-holistic-2`: último despliegue de producción en estado READY |
| ✅ | Rutas `/`, `/blog`, `/diccionario`, `/terapeutas`, `/login` responden 200 | Chequeo de `kimiko-diario` del 8-oct 08:13 UTC (`kimiko_updates` tipo `chequeo`) |
| ⚠️ | Blog: 110 artículos, **solo 23 publicados** (último 6-oct) | `select count(*) … from blog_posts` |
| ⚠️ | Diccionario: **4 de 52 plantas visibles** (`publicada and ficha_verificada`) | consulta a `plants` |
| ⚠️ | Captación: **0 leads, 1 perfil** | consultas a `leads` y `profiles` |
| ❓ | Diseño: Kristian no está conforme | pendiente auditoría visual con capturas |

## Kimiko — trabajo diario (Supabase `kimiko-diario`)
| | Qué | Prueba |
|---|---|---|
| ✅ | Cron `kimiko-diario` a las 06:00 UTC | `cron.job` jobid 1 |
| ✅ | Cron `kimiko-reintento` 07:30, 09:30, 12:30 y 15:30 UTC, solo si no hay pieza del día | `cron.job` jobid 2 (creado 7-oct) |
| ⚠️ | Post del 8-oct: Gemini 503 ×3 y sin llaves de Workers AI ni Groq → salió en **modo sin IA** (borrador `2026-10-08-arnica-ficha-de-la-planta`, Telegram enviado) | `kimiko_updates` 08:13 UTC, `detalle.modo = sin-ia` |
| ✅ | Cadena de texto: Gemini (3 intentos, 25 s máx. cada uno) → Workers AI → Groq → ficha sin IA. Un día malo ya no queda en blanco | PR #9 · 33 pruebas + ejecución real anterior |
| ✅ | Causa del fallo silencioso de las 07:30 del 8-oct encontrada: Gemini se colgó y la función murió a los 150 s sin registro. Ahora todo lleva tiempo límite | logs de la función (`booted` → `shutdown`) |
| ❌ | Faltan `CF_ACCOUNT_ID` y `CF_AI_TOKEN` en los secretos de Edge Functions | chequeo del 8-oct 08:13 UTC |
| ❌ | Falta `GROQ_API_KEY` (tercer motor gratis: 1.000 peticiones/día, comprobado el 8-oct) | chequeo del 8-oct 08:13 UTC |
| ✅ | Chequeo diario antes del post (llaves, cupo, web, crons) con aviso a Telegram y acción exacta | `{"accion":"chequeo"}` real el 8-oct; función `kimiko_estado_crons()` |
| ✅ | Manual de tareas `kimiko_runbook` (4 tareas; `activa` pausa una tarea sin tocar código) | PR #10, migración aplicada |
| ✅ | Auditoría semanal (cron `kimiko-auditoria`, domingos 08:00 UTC). Primera pasada: **84 posts con categoría sin normalizar**, 1 publicado con meta fuera de 50–160; 0 slugs duplicados, 0 sin imagen, 0 plantas sin verificar, 0 tablas sin RLS | `{"accion":"auditoria"}` real el 8-oct, Telegram enviado |
| ✅ | Lo desplegado = lo del repo: `kimiko-diario` desplegada desde la rama del PR #16 (incluye #9 y #10) | `supabase functions deploy` del 8-oct · **hasta fusionar, producción va por delante de `main`** |

## Kimiko — órdenes por Telegram
| | Qué | Prueba |
|---|---|---|
| ✅ | Worker `kimiko` de Cloudflare recibe el webhook y comprueba el chat | código desplegado leído el 7-oct |
| ✅ | El código del worker ya está en el repo (`kimiko/worker` + `_kimiko/src/webhook.js`) y se desplegó desde ahí | versión `21674e03` del 8-oct |
| ❓ | Comandos `/estado`, `/auditar` y `/manual` | desplegados y con pruebas; falta que Kristian los pruebe desde Telegram |
| ❌ | 2 órdenes del 6-oct (18:30 y 19:05 UTC) siguen `pendiente`: no llegaron a lanzar Kimiko Cloud | `kimiko_drafts` + historial de Actions (solo 1 ejecución a las 19:11) |
| ✅ | Kimiko Cloud (Actions) abre PR y no toca `main` | última ejecución 6-oct 19:11, success |

## Redes
| | Qué | Prueba |
|---|---|---|
| ⚠️ | Kimiko prepara la pieza; Kristian publica a mano (decisión del 5-oct) | `kimiko_content` (1 fila) |
| ❌ | Instagram automático: faltan `IG_USER_ID` e `IG_ACCESS_TOKEN` | `kimiko_config` |

## Riesgos
| | Qué | Prueba |
|---|---|---|
| ⚠️ | Kimiko Cloud usa `CLAUDE_CODE_OAUTH_TOKEN` (suscripción de Claude). Si la suscripción caduca, las órdenes que cambian la web dejan de funcionar | `.github/workflows/kimiko-cloud.yml` |
| ✅ | Revisor `claude-review` retirado (fallaba por necesitar API de pago) | PR #8 |
| ✅ | Secreto sin uso `ANTHROPIC_API_KEY` borrado del worker (quedan 7) | `wrangler secret delete`, 8-oct |
| ✅ | Avisos de seguridad de Supabase: de 1 ERROR + 10 WARN a 0 ERROR + 5 WARN (los que quedan son intencionados o de panel) | PR #17, migración aplicada, `get_advisors` del 8-oct |
| ❓ | Protección de contraseñas filtradas (Auth) | ajuste de panel; según Supabase requiere plan Pro |
| ✅ | gitleaks antes de cada commit, con reglas para llaves de Supabase (antes no las detectaba) | PR #18: commit con llave falsa bloqueado |
| ✅ | 6 skills repetidas u obsoletas retiradas (`flow-state` y compañía) | PR #19 |
| ✅ | Vigilancia: gitleaks y pruebas de Kimiko en cada PR | PR #16, run 37749905519 ("no leaks found", 38 pruebas). Historial completo: 0 fugas |
| ❓ | Vigilancia: Lighthouse diario, resumen de Dependabot y guarda del NÚCLEO | corren cuando el workflow esté en `main`. Base del 8-oct (móvil): rend 75–91, acces 90–94, SEO 100 |
| ✅ | Alertas y arreglos de seguridad de Dependabot activados en el repo | API de GitHub, 8-oct |
| ✅ | `kimiko/PROMPT.md` partido en NÚCLEO — INMUTABLE y CAPACIDADES — EDITABLE | PR #16 |

## Lo que solo puede hacer Kristian (todo desde el móvil)
1. Fusionar en orden: **#9 → #10 → #16**; y #11, #17, #18 y #19 cuando quieras. Desde GitHub en el móvil.
2. Pegar en Supabase → Edge Functions → Secrets: `GROQ_API_KEY` (console.groq.com, sin tarjeta) y `CF_AI_TOKEN` + `CF_ACCOUNT_ID` (Cloudflare, plantilla "Workers AI").
3. Escribir `/estado` al bot para probar los comandos. Y reenviar o descartar las 2 órdenes pendientes del 6-oct.

## Próximos pasos (en este orden)
1. Normalizar las 84 categorías antiguas del blog (UPDATE reversible, con el visto bueno de Kristian).
2. `Article` JSON-LD en `app/blog/[slug]` (ver `kimiko/PETICIONES.md`, skill `schema`).
3. Arreglar las órdenes que se quedan en `pendiente` (2 del 6-oct).
4. Auditoría de diseño de q-h.com con capturas y 2–3 direcciones visuales (skill `qh-diseno`).
