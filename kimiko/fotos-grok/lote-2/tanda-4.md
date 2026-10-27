# Lote 2, tanda 4 — IDs 44–48 y 50 (27-oct-2026, encargo v2, opción A)

Mismo método que las tandas 2 y 3 (`kimiko/informes/fotos-grok.md`, PR #90): solo fichas que existen y están en borrador; sin fichas nuevas.
Emparejado por nombre latino contra `plants` (consulta del 27-oct). **Nada subido ni cambiado en Supabase**: falta la llave `service_role`, que solo está en el `.env.local` del Mac.

| grok_id | Planta | Resultado | Qué se ve y por qué |
|---|---|---|---|
| 44 | Valeriana (Valeriana officinalis), `valeriana` id 14 | No tocada | Ya decidido por Kristian (26-oct 11:35): la ficha se queda con la acuarela del 8-oct; pedir de nuevo a Grok (hojas) |
| 45 | Verbena (Verbena officinalis) | Saltada | Sin ficha en `plants` |
| 46 | Vid roja (Vitis vinifera) | Saltada | Sin ficha en `plants` |
| 47 | Yacón (Smallanthus sonchifolius) | Saltada | Sin ficha en `plants` |
| 48 | Yerba mate (Ilex paraguariensis) | Saltada | Sin ficha en `plants` |
| 50 | Brahmi (Bacopa monnieri), `brahmi` id 40 | **Aceptada, por subir** | Hoja: opuesta, pequeña, entera y algo carnosa, sobre tallos rastreros rojizos. Flor: solitaria en la axila, 5 pétalos blancos con un toque azulado. Sin texto. Las hojas son algo anchas y con un rabillo corto (en *B. monnieri* son espatuladas y sésiles), pero la especie se reconoce. La lámina actual (`/images/plants/brahmi-cientifica.jpg`) **es de otra planta**: una leguminosa de flores amarillas y hojas pinnadas |

Estado de `brahmi` (27-oct): `publicada = false`, `ficha_verificada = false`, `grok_id = null`, `image_cientifica_url = /images/plants/brahmi-cientifica.jpg`.

## Para subirla (Kristian, en el Mac)

```bash
python3 kimiko/fotos-grok/subir-lamina.py 50 40 brahmi
```

El script está en la rama de #90. Quita el Exif, no sobrescribe nada, para si la ficha está publicada e imprime el valor anterior.
Para revertir: `update plants set image_cientifica_url = '/images/plants/brahmi-cientifica.jpg', grok_id = null where id = 40;`
