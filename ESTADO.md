# ESTADO.md — qué funciona hoy y con qué prueba

**Última revisión:** 8-oct-2026, 12:00 (Madrid) · por Claude (chat): fusión de #9–#20, PR #29 y #30 · reglas en [`CLAUDE.md`](CLAUDE.md)

Leyenda: ✅ funciona (probado) · ⚠️ funciona a medias · ❌ roto · ❓ sin verificar

## Web q-h.com
| | Qué | Prueba |
|---|---|---|
| ✅ | Producción desplegada desde `main` (commit `c4523d2`, PRs #9–#20 fusionados el 8-oct 11:40) | estado `Vercel=success` del commit en la API de GitHub |
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
| ✅ | Lo desplegado = lo del repo: `kimiko-diario` v15 = `main` (ningún cambio en `supabase/functions` después de `f60a168`) | GET a la función responde 405 "usa POST" (código de `f60a168`), 8-oct 11:49 |

## Kimiko — órdenes por Telegram
| | Qué | Prueba |
|---|---|---|
| ✅ | Worker `kimiko` de Cloudflare recibe el webhook y comprueba el chat | código desplegado leído el 7-oct |
| ✅ | El código del worker ya está en el repo (`kimiko/worker` + `_kimiko/src/webhook.js`) y se desplegó desde ahí | versión `21674e03` del 8-oct |
| ❓ | Comandos `/estado`, `/auditar` y `/manual` | desplegados y con pruebas; falta que Kristian los pruebe desde Telegram |
| ⚠️ | Órdenes del 6-oct: la de 19:05 era duplicada de la de 19:11 (hecha) → marcada `duplicada`. Queda `pendiente` la de 18:30 ("publicar más plantas en el diccionario"): decide Kristian. Arreglo para que no vuelva a pasar en silencio: PR #30 (falta desplegar el worker) | `kimiko_drafts`, 8-oct |
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
| ✅ | Vigilancia: Lighthouse y resumen de Dependabot ya corren desde `main` | run 37759305767 (manual, 8-oct 09:49 UTC): lighthouse, dependabot, gitleaks y pruebas en verde. Guarda del NÚCLEO: solo en PR de ramas `kimiko/` |
| ✅ | Alertas y arreglos de seguridad de Dependabot activados en el repo | API de GitHub, 8-oct |
| ✅ | `kimiko/PROMPT.md` partido en NÚCLEO — INMUTABLE y CAPACIDADES — EDITABLE | PR #16 |

## Lo que solo puede hacer Kristian (todo desde el móvil)
1. Pegar en Supabase → Edge Functions → Secrets: `GROQ_API_KEY` (console.groq.com; su antirobots bloquea que lo haga Claude) y `CF_AI_TOKEN` + `CF_ACCOUNT_ID` (Cloudflare, plantilla "Workers AI"). `GEMINI_API_KEY` ya está (Gemini responde 503 por saturación, no por llave).
2. Revisar y fusionar PR #29 (JSON-LD) y PR #30 (órdenes que fallan avisan). Tras #30, desplegar el worker (`wrangler deploy`, lo hace Code).
3. Decir sí/no a `kimiko/sql/normalizar-categorias.sql` (84 posts; "detox" → Nutrición, ¿vale?).
4. Escribir `/estado` al bot. Reenviar o descartar la orden del 6-oct 18:30.
5. Subir las 5 skills en claude.ai y apagar los conectores Expedia, Kiwi, lastminute y Gamma del proyecto.

## Próximos pasos (en este orden)
1. Normalizar las 84 categorías (cuando Kristian diga sí).
2. Incoherencias a decidir: el pie de la web dice "Bristol, UK" y los correos usan `quantumholistic.com` (sin guion), distinto de `quantum-holistic.com`.
3. Auditoría de diseño de q-h.com con capturas y 2–3 direcciones visuales (skill `qh-diseno`).
