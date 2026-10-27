# Lote 2, tanda 4 — IDs 44–48 y 50 (27-oct-2026)

Emparejado por nombre latino contra `plants` (consulta del 27-oct).
Decisiones de Kristian (27-oct): brahmi, a la web desde el repo (opción B, sin Storage); las plantas sin ficha, que las cree Kimiko.

| grok_id | Planta | Resultado | Qué se ve y por qué |
|---|---|---|---|
| 44 | Valeriana (Valeriana officinalis), `valeriana` id 14 | No tocada | Ya decidido por Kristian (26-oct 11:35): la ficha se queda con la acuarela del 8-oct; pedir de nuevo a Grok (hojas) |
| 45 | Verbena (Verbena officinalis) | Para Kimiko | Sin ficha en `plants`: la crea Kimiko |
| 46 | Vid roja (Vitis vinifera) | Para Kimiko | Sin ficha en `plants`: la crea Kimiko |
| 47 | Yacón (Smallanthus sonchifolius) | Para Kimiko | Sin ficha en `plants`: la crea Kimiko |
| 48 | Yerba mate (Ilex paraguariensis) | Para Kimiko | Sin ficha en `plants`: la crea Kimiko |
| 50 | Brahmi (Bacopa monnieri), `brahmi` id 40 | **Puesta** (27-oct) | Hoja: opuesta, pequeña, entera y algo carnosa, sobre tallos rastreros rojizos. Flor: solitaria en la axila, 5 pétalos blancos con un toque azulado. Sin texto. Las hojas son algo anchas y con un rabillo corto (en *B. monnieri* son espatuladas y sésiles), pero la especie se reconoce. La lámina anterior (`/images/plants/brahmi-cientifica.jpg`) **es de otra planta**: una leguminosa de flores amarillas y hojas pinnadas |

## Brahmi

- Foto copiada como `public/images/plants/brahmi-grok.jpg` (784×1168, sin Exif).
- Supabase (27-oct): `image_cientifica_url` → `/images/plants/brahmi-grok.jpg` y `grok_id` → 50. Sigue en borrador (`publicada = false`). La foto se sirve cuando se fusione este PR.
- Antes: `image_cientifica_url = /images/plants/brahmi-cientifica.jpg`, `grok_id = null`. Para revertir:
  `update plants set image_cientifica_url = '/images/plants/brahmi-cientifica.jpg', grok_id = null where id = 40;`

## Orden para Kimiko (Kristian la manda por Telegram)

> Kimiko, haz la tanda 4 del lote 2 de fotos de Grok (kimiko/fotos-grok/LOTE-2.md) solo con verbena (45), vid roja (46), yacón (47) y yerba mate (48). Valeriana (44) y brahmi (50) ya están hechas: no las toques.

Kimiko sigue `LOTE-2.md` §3 (mirar la foto, ficha sin dosis y con fuente, borrador) y §4 (PR y aviso por Telegram). Nada se publica sin «✅ Publicar».
