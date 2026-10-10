# Fotos de Grok — lote 2: orden para Kimiko

Preparado el 10-oct-2026 por Claude (chat) a petición de Kristian. Kimiko lo hace **por tandas**, cuando Kristian
lo pide por Telegram, por ejemplo: «Kimiko, haz la tanda 1 del lote 2 de fotos de Grok (kimiko/fotos-grok/LOTE-2.md)».
Se cumple dentro de los límites de `kimiko/PROMPT.md` y `CLAUDE.md`. Si algo de aquí choca con ellos, mandan ellos:
para y avisa a Kristian.

## 1. La regla que nos dio problemas: nunca por número

- Las fotos están en `kimiko/fotos-grok/entrada/grok-<N>.jpg` e `indice.csv` dice qué planta es cada `N`.
- **`N` es el número de Grok, no el `id` de `plants`.** Los números no coinciden: la foto 41 de Grok es *Tribulus
  terrestris*, pero `plants.id` 41 es la tulsi; la foto 50 es el brahmi y `plants.id` 50 es el tribulus.
- Se empareja **solo por nombre latino** (`plants.nombre_latino`, sin distinguir mayúsculas). Si no hay coincidencia,
  mira también el slug y los sinónimos botánicos (p. ej. *Rosmarinus officinalis* = *Salvia rosmarinus*) antes de crear
  una planta nueva. Nunca por número, nunca por `id`, nunca solo por el nombre común.
- Lo antiguo que emparejaba por número está en `archivo/obsoleto/`: no se sigue.

## 2. Tandas (36 fotos)

| Tanda | grok_id | Plantas |
|---|---|---|
| 1 | 14–23 | Eucalipto, Frambuesa, Ganoderma, Ginkgo, Ginseng, Gordolobo, Hamamelis, Hipérico, Jengibre, Lavanda |
| 2 | 24–33 | Llantén, Malva, Manzanilla, Melisa, Menta, Muérdago, Olivo, Pasiflora, Pensamiento, Pino silvestre |
| 3 | 34–43 | Rabo de gato, Regaliz, Romero, Salvia, Saúco, Tila, Tomillo, Tribulus, Tulsi, Uña de gato |
| 4 | 44–48 y 50 | Valeriana, Verbena, Vid roja, Yacón, Yerba mate, Brahmi |

Comprobado el 10-oct contra `plants`: **14 ya existen** (ginseng, jengibre, lavanda, llantén, manzanilla, muérdago,
olivo, salvia, saúco, tomillo, tribulus, tulsi, valeriana, brahmi) y **22 son nuevas**. Vuelve a comprobarlo al empezar
cada tanda. Los números 1, 4 y 49 no están en la entrada: no los inventes.

## 3. Por cada foto

1. Lee su fila de `indice.csv`: `grok_id`, `nombre_es`, `nombre_latino`.
2. Si la especie es una de las 9 peligrosas (`PLANTAS_PELIGROSAS` en `supabase/functions/_kimiko/lib/publicar.js`):
   no la toques y anótalo.
3. Si ese `grok_id` ya está en `plants`: foto repetida, no la toques.
4. **Mira la imagen** (herramienta `Read`). Recházala si lleva texto o rótulos dentro, si no corresponde a la especie
   (hojas, flores, frutos, porte) o si tienes una duda razonable. Escribe siempre el motivo. Ante la duda, rechazada
   y «que la mire Kristian».
5. **Aceptada y la planta ya existe:** cópiala como `public/images/plants/<slug>-grok.jpg`, sin metadatos Exif/XMP.
   No cambies nada de esa planta en Supabase (ni `image_cientifica_url` ni `grok_id`): en el informe la propones
   como lámina nueva, y la cambia Claude cuando Kristian diga sí.
6. **Aceptada y la planta es nueva:**
   - Copia la foto como `public/images/plants/<slug>-grok.jpg` (slug en minúsculas, sin tildes, con guiones).
   - Escribe la ficha con **la misma estructura que las publicadas** (albahaca, árnica, hinojo, equinácea) y que el
     lote 1 (`supabase/migrations/20261009120000_fotos_grok_lote_1.sql`):
     `ficha_cientifica` = `familia_botanica`, `parte_usada`, `principios_activos[]`, `propiedades[]`,
     `indicaciones[]`, `posologia`, `contraindicaciones[]`, `fuentes[{titulo,url}]`;
     `ficha_mistica` = `chakra`, `elemento`, `planeta_regente`, `energia`, `simbolismo`, `uso_ceremonial`,
     `afinidad_ayurvedica` (solo tradición y folclore, nunca efectos de salud).
   - Reglas de salud (qh-editorial): todo como «uso tradicional»; **sin dosis** (la `posologia` dice cómo se usa
     tradicionalmente y que la dosis la decide un profesional); contraindicaciones de embarazo, lactancia, alergias de
     la familia botánica, medicación e interacciones, niños; «solo uso externo» cuando toque (p. ej. hamamelis).
   - Fuente: la monografía de la EMA si existe; si no, ESCOP, OMS, NCCIH o MSKCC. Comprueba la URL con `curl` (200).
     **Sin fuente fiable, la planta no entra**: anótalo.
   - Pásala por `revisarFicha` (mismo archivo `publicar.js`); si da algún motivo, corrígela antes de seguir.
   - Inserta la fila en `plants` por REST como **borrador**: `publicada = false`, `ficha_verificada = false`,
     `grok_id`, `categoria = 'Maestras'`, `image_cientifica_url = '/images/plants/<slug>-grok.jpg'` e
     `id` = máximo actual + 1 (consúltalo justo antes de cada inserción).
7. Nada se publica: publica Kristian con «✅ Publicar».

## 4. Qué entrega cada tanda

- Un PR desde `kimiko/fotos-grok-lote-2-tanda-<N>` con las fotos, el informe añadido a `kimiko/informes/fotos-grok.md`
  (tabla como la del lote 1: aceptada/rechazada y motivo) y `kimiko/fotos-grok/lote-2/tanda-<N>.sql`: el registro de lo
  insertado (los mismos INSERT, idempotentes con `where not exists`) para que lo del repo sea lo de la base de datos.
  **No pongas nada en `supabase/migrations/`**: los borradores ya entran por REST.
- Mensaje a Kristian por Telegram: cuántas aceptadas y rechazadas (con el motivo), las plantas nuevas, las láminas
  propuestas para plantas existentes y, para publicar cuando el PR esté fusionado, `/pieza <slug>` y «✅ Publicar».
- Una tanda por orden. No empieces la siguiente sin que Kristian la pida.
