# ESTADO.md — qué funciona hoy y con qué prueba

**Última revisión:** 7-oct-2026, 12:15 (Madrid) · por Claude (chat) · reglas en [`CLAUDE.md`](CLAUDE.md)

Leyenda: ✅ funciona (probado) · ⚠️ funciona a medias · ❌ roto · ❓ sin verificar

## Web q-h.com
| | Qué | Prueba |
|---|---|---|
| ✅ | Producción desplegada desde `main` (commit `8be6901`) | Vercel `quantum-holistic-2`: último despliegue de producción en estado READY |
| ❓ | Rutas `/`, `/blog`, `/diccionario`, `/terapeutas`, `/login` responden 200 | No comprobable desde el entorno del chat (red restringida); pendiente desde Kimiko Cloud |
| ⚠️ | Blog: 110 artículos, **solo 23 publicados** (último 6-oct) | `select count(*) … from blog_posts` |
| ⚠️ | Diccionario: **4 de 52 plantas visibles** (`publicada and ficha_verificada`) | consulta a `plants` |
| ⚠️ | Captación: **0 leads, 1 perfil** | consultas a `leads` y `profiles` |
| ❓ | Diseño: Kristian no está conforme | pendiente auditoría visual con capturas |

## Kimiko — trabajo diario (Supabase `kimiko-diario`)
| | Qué | Prueba |
|---|---|---|
| ✅ | Cron `kimiko-diario` a las 06:00 UTC | `cron.job` jobid 1 |
| ✅ | Cron `kimiko-reintento` 07:30, 09:30, 12:30 y 15:30 UTC, solo si no hay pieza del día | `cron.job` jobid 2 (creado 7-oct) |
| ❌ | Texto del post del 7-oct: Gemini devolvió 503 (saturado) y Workers AI no tiene llaves | `kimiko_updates` 06:00 y 09:21 UTC |
| ❌ | Faltan `CF_ACCOUNT_ID` y `CF_AI_TOKEN` en los secretos de Edge Functions | error "Workers AI REST: faltan CF_ACCOUNT_ID o CF_AI_TOKEN" |
| ⚠️ | Gemini sin reintentos: un 503 pasajero tumba el día | `supabase/functions/_kimiko/lib/gemini.js` |
| ✅ | Código desplegado copiado a este repo (antes solo existía en el disco del Mac) | `supabase/functions/_kimiko`, versión 9 de la función |

## Kimiko — órdenes por Telegram
| | Qué | Prueba |
|---|---|---|
| ✅ | Worker `kimiko` de Cloudflare recibe el webhook y comprueba el chat | código desplegado leído el 7-oct |
| ⚠️ | El código del worker **no está en el repo** (solo desplegado y en el disco del Mac) | búsqueda en el repo |
| ❌ | 2 órdenes del 6-oct (18:30 y 19:05 UTC) siguen `pendiente`: no llegaron a lanzar Kimiko Cloud | `kimiko_drafts` + historial de Actions (solo 1 ejecución a las 19:11) |
| ✅ | Kimiko Cloud (Actions) abre PR y no toca `main` | última ejecución 6-oct 19:11, success |

## Redes
| | Qué | Prueba |
|---|---|---|
| ⚠️ | Kimiko prepara la pieza; Kristian publica a mano (decisión del 5-oct) | `kimiko_content` (1 fila) |
| ❌ | Instagram automático: faltan `IG_USER_ID` e `IG_ACCESS_TOKEN` | `kimiko_config` |

## Lo que solo puede hacer Kristian (todo desde el móvil)
1. Crear el token de Workers AI y copiar el Account ID en Cloudflare, y pegarlos como `CF_AI_TOKEN` y `CF_ACCOUNT_ID` en Supabase → Edge Functions → Secrets.
2. Reenviar o descartar las 2 órdenes pendientes del 6-oct.

## Próximos pasos (en este orden)
1. Desplegar los reintentos de Gemini (código preparado y probado el 7-oct, falta PR).
2. Subir el código del worker de Telegram al repo y arreglar las órdenes que se quedan en `pendiente`.
3. Chequeo de salud diario por Telegram (llaves, cuota, rutas de la web) antes de escribir el post.
4. Auditoría de diseño de q-h.com con capturas y 2–3 direcciones visuales.
