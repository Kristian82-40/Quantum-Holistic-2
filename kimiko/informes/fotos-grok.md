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
