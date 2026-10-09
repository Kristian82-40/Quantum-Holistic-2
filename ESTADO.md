# ESTADO.md — qué funciona hoy y con qué prueba

**Última revisión:** 9-oct-2026, 11:50 (Madrid) · Claude Code: worker desplegado desde Actions; bloque 1 de «✅ Publicar» por Telegram en PR · antes, Claude (chat): Groq primero, reels, fichas sin dosis (#35–#38) · reglas en [`CLAUDE.md`](CLAUDE.md)

Leyenda: ✅ funciona (probado) · ⚠️ funciona a medias · ❌ roto · ❓ sin verificar

## Web quantum-holistic.com
| | Qué | Prueba |
|---|---|---|
| ✅ | Producción desplegada desde `main` (commit `c4523d2`, PRs #9–#20 fusionados el 8-oct 11:40) | estado `Vercel=success` del commit en la API de GitHub |
| ✅ | Rutas `/`, `/blog`, `/diccionario`, `/terapeutas`, `/login` responden 200 | Chequeo de `kimiko-diario` del 8-oct 08:13 UTC (`kimiko_updates` tipo `chequeo`) |
| ⚠️ | **22 de los 25 posts publicados no pasarían los controles de «✅ Publicar»** (sin sección de precauciones o sin aviso; 5 con promesas tipo «aliviar la ansiedad»). No se ha retirado nada | `revisarPost` sobre los 25 publicados, 9-oct 11:40 |
| ✅ | Una ficha nueva de `plants` nace en borrador (`publicada` default `false`; antes `true` y salía sola en /diccionario) | migración `20261009140000` aplicada; `information_schema.columns` → `false` |
| ⚠️ | Blog: 110 artículos, **solo 23 publicados** (último 6-oct) | `select count(*) … from blog_posts` |
| ⚠️ | Diccionario: **4 de 52 plantas visibles** (`publicada and ficha_verificada`) | consulta a `plants`, 8-oct 12:30 |
| ⚠️ | 5 fichas completadas y **sin publicar** (valeriana, jengibre, lavanda, tomillo, salvia): sin dosis, embarazo y medicación, fuentes EMA/NCCIH. **Láminas nuevas de acuarela** generadas con Workers AI el 8-oct (las antiguas eran de otra especie). Falta que Kristian las revise y diga cuáles se publican | `kimiko/sql/imagenes-5-fichas-2026-10-08.sql` aplicado; `kimiko-imagen` → 200 ×9 (8-oct ~17:40); revisión visual de Claude |
| ✅ | La ficha pinta **Fuentes** (solo https) y las secciones se llaman «Usos tradicionales» y «Cómo se usa tradicionalmente» | PR #36; `quantum-holistic.com/diccionario/hinojo` → 200 con los títulos nuevos (9-oct 09:59) |
| ✅ | Las 4 fichas publicadas ya **no indican dosis** ni afirmaciones de salud: posología e indicaciones reescritas como uso tradicional; quitada la «evidencia» sin cita comprobable. Kristian revisa los textos como herbolario | `select … ~ '\d'` sobre `posologia` → 0 (9-oct); copia para deshacer en `kimiko/recuperacion/restaurar-posologia-2026-10-09.sql` |
| ❌ | Blog: **0 de 88 borradores listos**; 25 para retocar y 63 para descartar (pruebas, esbozos, duplicados, temas fuera de línea) | `kimiko/informes/blog-borradores.md` |
| ✅ | **Dominio `quantum-holistic.com` (y `www.`) es nuestro**: comprado en Vercel el 1-may-2026, caduca el 1-may-2027 con renovación automática (de pago, ~1 vez al año), DNS en Vercel (`ns1/ns2.vercel-dns.com`). `q-h.com` **no** es nuestro (está en venta): no usarlo en textos ni enlaces | Vercel API `list_domains` y `list_project_domains`, 8-oct 17:20 |
| ❌ | Correo: `hola@quantumholistic.com` (sin guion) no existe y `quantum-holistic.com` **no tiene MX** (no recibe correo). Decidido crear uno serio en `quantum-holistic.com` | Vercel `get_records`: 0 registros MX, 8-oct |
| ✅ | Portada sin cifras sin respaldo ("2.400+ planes", "340+ plantas", "98 %"), sin los 3 testimonios y sin el enlace roto de YouTube | PR #34 fusionado el 8-oct 17:45, vista previa de Vercel en verde |
| ⚠️ | Captación: **0 leads, 1 perfil** | consultas a `leads` y `profiles` |
| ⚠️ | Diseño: auditoría hecha con capturas (móvil y escritorio, 5 páginas), 10 problemas y 3 direcciones de acuarela. Sin scroll horizontal ni imágenes rotas | `kimiko/informes/diseno.md` + `kimiko/informes/diseno/`, Playwright 8-oct ~10:40 |

## Kimiko — trabajo diario (Supabase `kimiko-diario`)
| | Qué | Prueba |
|---|---|---|
| ✅ | Cron `kimiko-diario` a las 06:00 UTC | `cron.job` jobid 1 |
| ✅ | Cron `kimiko-reintento` 07:30, 09:30, 12:30 y 15:30 UTC, solo si no hay pieza del día | `cron.job` jobid 2 (creado 7-oct) |
| ✅ | **Causa de los posts «sin IA» del 8 y 9-oct**: Gemini gastaba 75 s (3 × 25 s) y a Groq no le llegaba el tiempo. Ahora la cadena es **Groq → Gemini (1 intento) → Workers AI**. Prueba real (slot 2): artículo de salvia escrito por Groq en **12 s** con acuarela flux | `kimiko_updates` 9-oct 07:52 UTC (`modelo_texto = openai/gpt-oss-120b`, `imagen = flux`); `kimiko-diario` v18 = `main` (diff de los 19 archivos) |
| ✅ | Cadena de texto: Groq → Gemini (1 intento) → Workers AI → ficha sin IA. Un día malo ya no queda en blanco | PR #35 · 41 pruebas |
| ✅ | Causa del fallo silencioso de las 07:30 del 8-oct encontrada: Gemini se colgó y la función murió a los 150 s sin registro. Ahora todo lleva tiempo límite | logs de la función (`booted` → `shutdown`) |
| ✅ | `CF_ACCOUNT_ID` y `CF_AI_TOKEN` en los secretos de Edge Functions | `kimiko/guia-tareas.sh` 8-oct ~16:50: Cloudflare aceptó el token (200), huella SHA-256 en Supabase = la escrita, y `kimiko-imagen` `{"accion":"diag"}` → las dos `true` |
| ✅ | `GROQ_API_KEY` (tercer motor gratis: 1.000 peticiones/día) | `kimiko/guia-tareas.sh` 8-oct ~16:45: Groq aceptó la llave (`/v1/models` → 200) y la huella en Supabase coincide. Falta verla en uso real: chequeo de mañana 06:00 UTC |
| ✅ | Chequeo diario antes del post (llaves, cupo, web, crons) con aviso a Telegram y acción exacta | `{"accion":"chequeo"}` real el 8-oct; función `kimiko_estado_crons()` |
| ✅ | Manual de tareas `kimiko_runbook` (4 tareas; `activa` pausa una tarea sin tocar código) | PR #10, migración aplicada |
| ✅ | Auditoría semanal (cron `kimiko-auditoria`, domingos 08:00 UTC). Primera pasada: 84 posts con categoría sin normalizar (**normalizados el 8-oct 17:15**: quedan 5 categorías, Sabiduría 38 · Bienestar Holístico 30 · Nutrición 18 · Herbología 16 · Ayurveda 9; copia en `blog_posts_categoria_backup_20261008`), 1 publicado con meta fuera de 50–160; 0 slugs duplicados, 0 sin imagen, 0 plantas sin verificar, 0 tablas sin RLS | `{"accion":"auditoria"}` real el 8-oct, Telegram enviado |
| ✅ | Lo desplegado = lo del repo: `kimiko-diario` v15 = `main` (ningún cambio en `supabase/functions` después de `f60a168`) | GET a la función responde 405 "usa POST" (código de `f60a168`), 8-oct 11:49 |

## Kimiko — órdenes por Telegram
| | Qué | Prueba |
|---|---|---|
| ✅ | Worker `kimiko` de Cloudflare recibe el webhook y comprueba el chat | código desplegado leído el 7-oct |
| ✅ | El código del worker ya está en el repo (`kimiko/worker` + `_kimiko/src/webhook.js`) y se desplegó desde ahí | versión `21674e03` del 8-oct |
| ❓ | Comandos `/estado`, `/auditar` y `/manual` | desplegados y con pruebas; falta que Kristian los pruebe desde Telegram |
| ⚠️ | Orden del 6-oct 18:30 (`2aa4e2e6`, más plantas en el diccionario) pasa a `en_revision`: 5 fichas listas para que Kristian las revise. La de las 19:05 está `duplicada` (la de 19:11 quedó `hecho`) | `kimiko_drafts` consultada el 8-oct 12:30 |
| ✅ | Worker desplegado desde GitHub Actions (`desplegar-worker.yml`) con el código de `main` `2fba307` (incluye el arreglo de órdenes mudas, PR #30). Secretos `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` en GitHub | run 37911111476 (9-oct 09:25 UTC, success, «Uploaded kimiko»); `wrangler deployments list` → versión `1e86ef62` al 100 % |
| ❓ | **«✅ Publicar» / «🗑 Retirar» por Telegram** (posts y fichas): controles de qh-editorial, prueba de la URL pública (200 + título), registro en `kimiko_updates`, `/pieza <slug>`. Web del blog sin caché (antes 5 min). En PR, sin desplegar | 47 pruebas; controles sobre datos reales: salvia y las 9 fichas pasan; `comprobarURL` contra salvia en producción → 200 |
| ✅ | Kimiko Cloud (Actions) abre PR y no toca `main` | última ejecución 6-oct 19:11, success |

## Redes
| | Qué | Prueba |
|---|---|---|
| ⚠️ | Kimiko prepara la pieza; Kristian publica a mano (decisión del 5-oct) | `kimiko_content` |
| ❓ | **Reels diarios**: GitHub Actions `kimiko-reel` (06:15, 07:45, 09:45, 12:45, 15:45 UTC) monta un MP4 1080×1920 de 16 s (imagen del post + 4 rótulos + aviso legal), lo sube a `kimiko/reels/qh/<fecha>.mp4` y `kimiko-diario` (`enviar-reel`) lo manda a Telegram con el texto listo. Primer pase real: 9-oct 09:45 UTC | PR #35; reel de prueba renderizado en local (16 s, h264+aac); runbook `reel-diario`. Falta ver la primera ejecución real |
| ❌ | Instagram automático: faltan `IG_USER_ID` e `IG_ACCESS_TOKEN` | `kimiko_config` |

## Riesgos
| | Qué | Prueba |
|---|---|---|
| ⚠️ | Kimiko Cloud usa `CLAUDE_CODE_OAUTH_TOKEN` (suscripción de Claude). Si la suscripción caduca, las órdenes que cambian la web dejan de funcionar | `.github/workflows/kimiko-cloud.yml` |
| ⚠️ | **Fotos de Grok, lote 1** (IDs 2–13): 7 aceptadas (3 `-grok.jpg` de plantas existentes, 4 plantas nuevas en borrador), 3 rechazadas (árnica equivocada; boldo y eleuterococo con texto). Migración `20261009120000` **sin aplicar** en Supabase | informe `kimiko/informes/fotos-grok.md`; `npm run build` OK; EMA → 200 con `curl` (9-oct) |
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
1. Crear el correo de contacto en `quantum-holistic.com` (propuesta: Zoho Mail gratis; los registros DNS los pone Claude), decir la **ciudad/país** del pie y de los textos legales y si la cuenta de Instagram `quantumholistic` es tuya.
2. Decir si se quitan las cifras y testimonios de la portada, y elegir dirección visual A, B o C (`kimiko/informes/diseno.md`).
3. ~~Normalizar categorías~~ hecho el 8-oct ("detox" → Nutrición).
4. Revisar las 5 fichas nuevas, ya con láminas nuevas, en `/admin` (o en `plants`) y si se archivan los 63 borradores descartables (`kimiko/informes/blog-borradores.md`).

Hecho el 8-oct por la tarde: #29–#32 fusionados (Claude, con Vercel en verde); `/estado` y `/manual` responden en Telegram (16:39); llaves de Groq y Workers AI (guía, en verde); 5 skills `qh-*` subidas a claude.ai (Claude las ve cargadas en el chat); conectores Expedia, Kiwi.com, lastminute.com y Gamma desconectados (sus herramientas desaparecieron de la sesión de Claude a las 17:07).

## Próximos pasos (en este orden)
1. Confirmar el primer reel real (9-oct 09:45 UTC) y desplegar el worker en cuanto estén los secretos de Cloudflare en GitHub.
2. ~~Láminas de las 5 fichas~~ hechas el 8-oct. Árnica y equinácea: 2 candidatas de cada una generadas el 9-oct (`kimiko/plantas/{arnica,equinacea}-cientifica-1009{a,b}.jpg`), **sin aplicar**: Claude no puede verlas desde la sesión; las elige Kristian.
3. ~~Pintar `fuentes` y quitar las dosis de las 4 fichas publicadas~~ hecho el 9-oct (#36, #38). Pendiente: categoría «Magicas» en las 4 fichas publicadas (no cuadra con hinojo, árnica…).
4. Retocar el borrador de árnica de hoy ("solo uso externo" + enlaces) y los 6 de plantas del informe.
5. ~~Normalizar las 84 categorías~~ hecho el 8-oct 17:15.
6. Con las respuestas de Kristian: corregir dominio, correo, ciudad y redes en un PR.
