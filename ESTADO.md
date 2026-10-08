# ESTADO.md — qué funciona hoy y con qué prueba

**Última revisión:** 8-oct-2026, 16:40 (Madrid) · Claude (chat) fusionó `main` tras #29, #30 y #31; antes, Claude Code (informes de blog, diseño e incoherencias + 5 fichas; ver `kimiko/bitacora/2026-10-08-1250.md`) · reglas en [`CLAUDE.md`](CLAUDE.md)

Leyenda: ✅ funciona (probado) · ⚠️ funciona a medias · ❌ roto · ❓ sin verificar

## Web q-h.com
| | Qué | Prueba |
|---|---|---|
| ✅ | Producción desplegada desde `main` (commit `c4523d2`, PRs #9–#20 fusionados el 8-oct 11:40) | estado `Vercel=success` del commit en la API de GitHub |
| ✅ | Rutas `/`, `/blog`, `/diccionario`, `/terapeutas`, `/login` responden 200 | Chequeo de `kimiko-diario` del 8-oct 08:13 UTC (`kimiko_updates` tipo `chequeo`) |
| ⚠️ | Blog: 110 artículos, **solo 23 publicados** (último 6-oct) | `select count(*) … from blog_posts` |
| ⚠️ | Diccionario: **4 de 52 plantas visibles** (`publicada and ficha_verificada`) | consulta a `plants`, 8-oct 12:30 |
| ⚠️ | 5 fichas completadas y **sin publicar** (valeriana, jengibre, lavanda, tomillo, salvia): sin dosis, embarazo y medicación, fuentes EMA/NCCIH. **Sus imágenes son de otra especie** (lavanda no tiene archivo): no publicar hasta cambiarlas | `kimiko/sql/fichas-5-plantas-2026-10-08.sql` aplicado; consulta: 5–7 contraindicaciones y 1–2 fuentes por ficha, 0 números en posología. Copia previa: `kimiko/recuperacion/restaurar-plantas-2026-10-08.sql` |
| ⚠️ | La ficha pública no muestra el campo `fuentes` (la página no lo pinta) | `app/diccionario/[slug]/page.tsx` líneas 20–23 |
| ⚠️ | Las 4 fichas publicadas muestran posología **con dosis** (choca con `qh-editorial`) | consulta a `plants` (`posologia` de hinojo: "2-3 g … 2-3 veces/día") |
| ❌ | Blog: **0 de 88 borradores listos**; 25 para retocar y 63 para descartar (pruebas, esbozos, duplicados, temas fuera de línea) | `kimiko/informes/blog-borradores.md` |
| ❌ | **`q-h.com` no es nuestro** (página de venta de Aftermarket); la web está en `quantum-holistic.com`. El correo `hola@quantumholistic.com` usa un dominio **sin MX** | `curl` y `dig` del 8-oct, `kimiko/informes/incoherencias.md` |
| ❌ | Portada con cifras sin respaldo ("2.400+ planes", "340+ plantas", "98 %") y 3 testimonios; YouTube del pie da 404 | captura del 8-oct, `kimiko/informes/diseno.md` punto 1 |
| ⚠️ | Captación: **0 leads, 1 perfil** | consultas a `leads` y `profiles` |
| ⚠️ | Diseño: auditoría hecha con capturas (móvil y escritorio, 5 páginas), 10 problemas y 3 direcciones de acuarela. Sin scroll horizontal ni imágenes rotas | `kimiko/informes/diseno.md` + `kimiko/informes/diseno/`, Playwright 8-oct ~10:40 |

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
| ⚠️ | Orden del 6-oct 18:30 (`2aa4e2e6`, más plantas en el diccionario) pasa a `en_revision`: 5 fichas listas para que Kristian las revise. La de las 19:05 está `duplicada` (la de 19:11 quedó `hecho`) | `kimiko_drafts` consultada el 8-oct 12:30 |
| ❓ | Worker con el arreglo de órdenes mudas: PR #30 **fusionado** el 8-oct 16:34; **falta desplegar** (`wrangler deploy` en `kimiko/worker`) | `gh pr view 30` → MERGED |
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
1. Fusionar el PR de informes del 8-oct (#32).
2. Pegar en Supabase → Edge Functions → Secrets: `GROQ_API_KEY` (console.groq.com; su antirobots bloquea que lo haga Claude) y `CF_AI_TOKEN` + `CF_ACCOUNT_ID` (Cloudflare, plantilla "Workers AI"). `GEMINI_API_KEY` ya está (Gemini responde 503 por saturación, no por llave).
3. Decir el **dominio bueno** (q-h.com no es suyo: está en venta; la web es `quantum-holistic.com`), el **correo** de contacto, la **ciudad/país** de los textos legales y si la cuenta de Instagram `quantumholistic` es tuya.
4. Decir si se quitan las cifras y testimonios de la portada, y elegir dirección visual A, B o C (`kimiko/informes/diseno.md`).
5. Sí/no a `kimiko/sql/normalizar-categorias.sql` (84 posts; "detox" → Nutrición, ¿vale?).
6. Revisar las 5 fichas nuevas en `/admin` (o en `plants`) y si se archivan los 63 borradores descartables (`kimiko/informes/blog-borradores.md`).
7. Escribir `/estado` al bot. Subir las 5 skills en claude.ai y apagar los conectores Expedia, Kiwi, lastminute y Gamma del proyecto.

## Próximos pasos (en este orden)
1. Desplegar el worker (PR #30 ya en `main`).
2. Imágenes correctas para valeriana, jengibre, lavanda, tomillo y salvia (`kimiko-imagen`, necesita `CF_AI_TOKEN`) y revisar las de árnica y equinácea publicadas.
3. Pintar `fuentes` en `app/diccionario/[slug]/page.tsx` y quitar las dosis de las 4 fichas publicadas.
4. Retocar el borrador de árnica de hoy ("solo uso externo" + enlaces) y los 6 de plantas del informe.
5. Normalizar las 84 categorías antiguas del blog (cuando Kristian diga sí).
6. Con las respuestas de Kristian: corregir dominio, correo, ciudad y redes en un PR.
