# Fotos de Grok — informe por lotes

Tarea `integrar-foto-planta` (kimiko_runbook). Emparejado por nombre latino, nunca por id; el número de Grok va solo en `plants.grok_id`.
Foto comprobada a ojo contra la especie; las 9 peligrosas no se tocan.

## Lote 1 — IDs 2, 3, 5, 6, 7, 8, 9, 11, 12, 13 (9-oct-2026)

| grok_id | Planta | Resultado | Archivo | Nota |
|---|---|---|---|---|
| 2 | Aloe vera | Aceptada (ya existe, id 31) | `aloe-vera-grok.jpg` | Hojas azuladas con manchas y dientes: correcta. No cambia `image_cientifica_url` |
| 3 | Árnica (Arnica montana) | **Rechazada** | — | Hojas alternas y dentadas grandes, tallo ramificado: no es árnica (hojas enteras, opuestas, roseta basal). Parece Heliopsis/Helianthus |
| 5 | Bardana (Arctium lappa) | Aceptada, planta nueva (borrador) | `bardana-grok.jpg` | Capítulos con brácteas ganchudas y hojas grandes: correcta |
| 6 | Boldo (Peumus boldus) | **Rechazada** | — | La imagen lleva texto incrustado («F2 QH Visual system JPG») |
| 7 | Caléndula (Calendula officinalis) | Aceptada, planta nueva (borrador) | `calendula-grok.jpg` | Correcta |
| 8 | Cardo Mariano (Silybum marianum) | Aceptada, planta nueva (borrador) | `cardo-mariano-grok.jpg` | Hojas con nervio blanco y capítulos morados espinosos: correcta, algo parecida a una alcachofa |
| 9 | Castaño de Indias (Aesculus hippocastanum) | Aceptada (ya existe, id 9) | `castano-de-indias-grok.jpg` | Correcta (hojas palmeadas, erizos, flores). No cambia `image_cientifica_url` |
| 11 | Diente de León (Taraxacum officinale) | Aceptada, planta nueva (borrador) | `diente-de-leon-grok.jpg` | Correcta |
| 12 | Echinacea (Echinacea purpurea) | Aceptada (ya existe) | `equinacea-grok.jpg` | Correcta. **Ojo:** Echinacea purpurea está duplicada en `plants` (`echinacea` id 21, sin publicar; `equinacea` id 52, publicada). El `grok_id` va a la 52 |
| 13 | Eleuterococo (Eleutherococcus senticosus) | **Rechazada** | — | Rótulo en la imagen con erratas («ELEUTHEROCCOCCUS», «Siberian ziaseng») |

Las láminas `<slug>-cientifica.jpg` de esas 4 plantas ya existían en el repo (sin fila en `plants`): no se han tocado; la foto de Grok se guarda como `-grok.jpg` y es la que usa la ficha nueva.

Fichas de las 4 plantas nuevas: sin dosis, con contraindicaciones, fuente EMA (URLs comprobadas con `curl` → 200). `publicada = false`, `ficha_verificada = false`.
**Estado en Supabase: migración `20261009120000_fotos_grok_lote_1.sql` SIN APLICAR** (Kimiko Cloud no tiene vía SQL). Idempotente.

## Lote 2, tanda 1 — IDs 14–23 (16-oct-2026)

| grok_id | Planta | Resultado | Archivo | Nota |
|---|---|---|---|---|
| 14 | Eucalipto (Eucalyptus globulus) | **Rechazada** | — | Yemas pequeñas en umbela con pedúnculo: no son las yemas grandes, solitarias y rugosas de *E. globulus*. Que la mire Kristian |
| 15 | Frambuesa (Rubus idaeus) | **Rechazada** | — | Lleva texto dentro de la imagen («Rubus idaeus») |
| 16 | Ganoderma (Ganoderma lucidum) | Aceptada, planta nueva (id 58, borrador) | `ganoderma-grok.jpg` | Sombrero lacado con anillos y pie lateral: correcta |
| 17 | Ginkgo (Ginkgo biloba) | Aceptada, planta nueva (id 59, borrador) | `ginkgo-grok.jpg` | Hojas en abanico con nervadura abierta y óvulos con pedúnculo: correcta |
| 18 | Ginseng (Panax ginseng) | Aceptada (ya existe, `ginseng` id 49) | `ginseng-grok.jpg` | Hoja palmeada de 5 foliolos, umbela, bayas rojas y raíz: correcta. **Propuesta como lámina nueva**; no se ha cambiado nada en Supabase |
| 19 | Gordolobo (Verbascum thapsus) | Aceptada, planta nueva (id 60, borrador) | `gordolobo-grok.jpg` | Hojas lanosas y espiga de flores amarillas: correcta |
| 20 | Hamamelis (Hamamelis virginiana) | Aceptada, planta nueva (id 61, borrador) | `hamamelis-grok.jpg` | Flores con pétalos en cinta, hojas asimétricas y cápsula: correcta |
| 21 | Hipérico (Hypericum perforatum) | **Rechazada** | — | Hojas con el borde aserrado; en *H. perforatum* son enteras y con puntos translúcidos |
| 22 | Jengibre (Zingiber officinale) | **Rechazada** | — | Brácteas rojas y amarillas grandes, más propias de una heliconia o una cúrcuma; el jengibre da una espiga verde. Que la mire Kristian |
| 23 | Lavanda (Lavandula angustifolia) | Aceptada (ya existe, `lavanda` id 11) | `lavanda-grok.jpg` | Correcta. **Propuesta como lámina nueva**; no se ha cambiado nada en Supabase |

Fichas de las 4 plantas nuevas: sin dosis, con contraindicaciones y `revisarFicha` sin motivos. Fuentes (`curl` → 200): EMA (ginkgo, gordolobo, hamamelis) y MSKCC (ganoderma; no hay monografía de la EMA).
`publicada = false`, `ficha_verificada = false`. Insertadas por REST el 16-oct; el registro está en `kimiko/fotos-grok/lote-2/tanda-1.sql`.
Hamamelis lleva «solo uso externo». Ganoderma, ginkgo y gordolobo: la ficha avisa de anticoagulantes (los dos primeros) y de colar los pelillos (gordolobo).
Fotos copiadas sin Exif ni XMP (se han quitado los segmentos APP1, APP13 y COM del JPEG).

## Lote 2, tanda 2 — IDs 24–33 (26-oct-2026, encargo v2, opción A)

Con el ✅ de Kristian (26-oct). Las fotos van a Storage (`kimiko/plantas/grok/`) con `kimiko/fotos-grok/subir-lamina.py`, **solo en fichas que ya existen y están en borrador**. Sin fichas nuevas: las plantas sin ficha se saltan hasta que Kristian decida.
Recibo: cada foto mirada a ojo antes de subirla; qué planta se ve y por qué.

| grok_id | Planta | Resultado | Qué se ve y por qué |
|---|---|---|---|
| 24 | Llantén (Plantago major), `llantan` id 24 | **Subida** (26-oct, prueba) | Especie correcta y sin texto (revisión de la prueba con 1) |
| 25 | Malva (Malva sylvestris) | Saltada | Sin ficha en `plants` |
| 26 | Manzanilla (Matricaria chamomilla), `manzanilla` id 51 | **Subida** | Hoja: muy dividida en lacinias filiformes. Flor: cabezuelas con lígulas blancas y receptáculo amarillo cónico (típico de *M. chamomilla*). Sin texto. `image_cientifica_url` antes `/images/plants/manzanilla-cientifica.jpg`, `grok_id` antes `null` |
| 27 | Melisa (Melissa officinalis) | Saltada | Sin ficha en `plants` |
| 28 | Menta (Mentha spicata) | Saltada | Sin ficha en `plants` |
| 29 | Muérdago (Viscum album), `muerdago` id 17 | **No subida** | Hoja: opuesta, coriácea y ovalada. Fruto: bayas blancas translúcidas. La especie es correcta, pero **lleva el rótulo «VISCUM ALBUM.»** dentro de la imagen. Que la mire Kristian |
| 30 | Olivo (Olea europaea), `olivo` id 7 | **No subida (duda)** | Hoja (lanceolada) y fruto (drupas verdes y una negra) de olivo, pero **la flor está mal**: 5–6 pétalos, muchos estambres y una rosada; la del olivo tiene 4 pétalos blancos y 2 estambres. Que la mire Kristian |
| 31 | Pasiflora (Passiflora incarnata) | Saltada | Sin ficha en `plants` |
| 32 | Pensamiento (Viola tricolor) | Saltada | Sin ficha en `plants` |
| 33 | Pino silvestre (Pinus sylvestris) | Saltada | Sin ficha en `plants` |

Comprobación de la 26: URL pública → 200 `image/jpeg`, sin Exif; la ficha sigue en borrador (`publicada = false`).
