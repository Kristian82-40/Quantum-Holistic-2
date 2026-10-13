# Pipeline de reels multired — propuesta (13-oct-2026)

Estado: **propuesta documentada, nada implementado ni contratado.** Orden de Kristian (cola de Telegram, 13-oct 11:41).

## Lo que ya existe (coste 0 €)
- `kimiko-reel` (GitHub Actions) monta el MP4 1080×1920 y lo sube a Supabase Storage `kimiko/reels/qh/<fecha>.mp4`.
- `kimiko-diario` (`enviar-reel`) lo manda a Telegram con el texto y los hashtags; Kristian lo publica a mano.
- «✅ Publicar» en un post lanza el reel al momento (`repository_dispatch` `kimiko-reel`, PR #54).

## Qué falta para publicar solo
| Red | Vía oficial | Bloqueo hoy |
|---|---|---|
| Instagram Reels | Instagram Graph API | faltan `IG_USER_ID` e `IG_ACCESS_TOKEN` (cuenta Business) |
| Facebook Reels | Graph API (página) | mismo token de Meta |
| YouTube Shorts | YouTube Data API v3 (gratis, cupo diario) | proyecto de Google + OAuth de Kristian |
| TikTok | Content Posting API | app a aprobar por TikTok |
| LinkedIn | Marketing/Community API | app a aprobar por LinkedIn |

Metricool y Buffer tienen API solo en planes de pago, y n8n necesita servidor propio: **no se contratan** (regla de coste 0 €). La vía gratuita es llamar a las APIs oficiales desde una Edge Function.

## Diseño propuesto
1. Edge Function `kimiko-distribuir` (Supabase), llamada por `repository_dispatch`/`pg_cron` al terminar `kimiko-reel`.
2. Entrada: `kimiko_content.reel_url` (firmada, caduca en minutos) + `copy` + `hashtags` + URL del post (`https://quantum-holistic.com/blog/<slug>`).
3. Una red por llamada; el resultado (id de la publicación o error) se guarda en `kimiko_updates` tipo `distribucion`.
4. **Puerta humana:** solo se publica si el post está `published = true` y Kristian pulsó «✅ Publicar» (el reel hereda esa aprobación). Hoy el NÚCLEO de Kimiko prohíbe publicar en redes: activarlo exige que Kristian cambie esa regla por PR propio.
5. Endpoint propuesto: `POST /functions/v1/kimiko-distribuir` con `{"content_id":"<uuid>","redes":["instagram","youtube"]}`, cabecera `apikey` con la service role (nunca en el repo).

## Enlace en la bio
Instagram **no permite** cambiar la bio por API. Alternativas gratuitas: una página propia `quantum-holistic.com/ultimo` que siempre redirija al último post publicado (un cambio pequeño de la web, en PR) y poner ese enlace una sola vez en la bio. Pendiente de «sí» de Kristian.

## Latencia/capacidad
Sin medir: Kimiko Cloud no tiene métricas propias de latencia. No se afirma ningún número.
