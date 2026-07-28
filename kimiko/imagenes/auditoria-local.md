# Auditoría local de imágenes botánicas — Mandato v5 (F2)

Fecha: 2026-07-28 · Lote 1
Fuente de verdad: Supabase `plants` (proyecto `vctetjugbvyllwjpxcxh`, 52 filas)
Directorio auditado: `public/images/plants/` (73 archivos `.jpg` al inicio)

> **Nota de ruta.** El mandato pide `public/images/plantas/{slug}.webp`. El repo real usa
> `public/images/plants/{slug}-cientifica.jpg`, y el código lo construye desde el slug en
> `app/diccionario/page.tsx:81` y `app/diccionario/[slug]/page.tsx:100`. Se mantiene la
> convención existente: crear `plantas/*.webp` habría generado archivos que nada referencia.

---

## 0. Resumen del cruce archivo ↔ Supabase

| Situación | Nº | Detalle |
|---|---|---|
| Slug con fila en Supabase y archivo en disco | 43 | auditables |
| Archivos sin fila en Supabase (huérfanos) | 30 | no se muestran en el sitio |
| Filas en Supabase sin archivo | 9 | = exactamente la lista de exclusión ✅ correcto |

Las 9 filas sin imagen son `aconito`, `amanita-muscaria`, `beleno-negro`, `cannabis`,
`cornezuelo-centeno`, `datura`, `datura-metel`, `hierba-mora`, `tejo`. Su `image_cientifica_url`
es `null` y el diccionario las pinta con placeholder de letra. La exclusión de imagen funciona.

---

## 1. Verificación visual una a una (muestra de 7)

Formato: `slug | archivo | veredicto | acción`

| slug | archivo | veredicto | acción |
|---|---|---|---|
| `equinacea` | `equinacea-cientifica.jpg` | ✅ **CORRECTA** — lámina botánica de *Echinacea purpurea*: lígulas rosas péndulas, cono espinoso naranja. Estilo compatible con F2. | Ninguna. Conservar como referencia de estilo. |
| `granada` | `granada-cientifica.jpg` | ✅ **CORRECTA** — flores de *Punica granatum*: pétalos escarlata arrugados, cáliz carnoso. | Ninguna. |
| `lavanda` | `lavanda-cientifica.jpg` | 🔴 **INCORRECTA — BRECHA DE EXCLUSIÓN.** No es *Lavandula*: es una espiga de trigo/centeno con esclerocios morado-negros = **cornezuelo (*Claviceps purpurea*)**, planta de la lista de exclusión, publicada bajo un slug seguro. | **HECHO:** movida a `kimiko/imagenes/pendiente-aprobacion/cornezuelo-centeno-foto-espiga__ex-lavanda.jpg`. Lavanda queda con placeholder hasta tener imagen real. |
| `manzanilla` | `manzanilla-cientifica.jpg` | 🔴 **INCORRECTA** — son frutos de **granada** (*Punica granatum*), no *Matricaria chamomilla*. No es un intercambio: `granada-cientifica.jpg` ya es correcta y distinta. | Regenerar imagen de manzanilla. No renombrar. |
| `valeriana` | `valeriana-cientifica.jpg` | 🔴 **INCORRECTA** — árbol leñoso con panículas rosadas. *Valeriana officinalis* es herbácea con corimbos planos blanco-rosados. | Regenerar. |
| `echinacea` | `echinacea-cientifica.jpg` | 🔴 **INCORRECTA** — labiada con verticilastros de flores bilabiadas en tallo cuadrangular (tipo *Clinopodium*/*Thymus*). No es *Echinacea*. Además la fila `echinacea` **duplica** a `equinacea` (misma especie *Echinacea purpurea*). | Regenerar **o** fusionar la fila con `equinacea` y borrar el archivo. Decisión de Papu. |
| `rabo-de-gato` | `rabo-de-gato-cientifica.jpg` | 🔴 **INCORRECTA** — mata almohadillada con flores blancas de 5 pétalos y hojas pinnadas en pedregal. "Rabo de gato" es *Sideritis* (labiada de flores amarillas en espiga). Además es huérfana (sin fila). | Regenerar sólo si se crea la fila en Supabase. |
| — | `plant-00-beleno-negro-cientifica.jpg` | 🔴 **DOBLE FALLO** — (a) nombre fuera de convención, no lo sirve ningún slug; (b) es **byte a byte idéntica** a `albahaca-cientifica.jpg` (md5 `bce91f04…`), o sea no es beleño; (c) el slug pertenece a la lista de exclusión. | **HECHO:** movida a cuarentena como `DUPLICADO-albahaca__ex-plant-00-beleno-negro.jpg`. |

**Tasa de error de la muestra: 5 incorrectas de 7 verificadas (71%).**

⚠️ Las 36 imágenes emparejadas restantes **no** se han verificado visualmente en este lote.
Con un 71% de error muestral, el set completo debe considerarse **no fiable** hasta
verificación individual. No asumir que las no auditadas son correctas.

---

## 2. Archivos huérfanos (30) — sin fila en Supabase, nunca se muestran

`bardana`, `calendula`, `cardo-mariano`, `cola-de-caballo`, `diente-de-leon`, `eleuterococo`,
`eucalipto`, `frambuesa`, `ganoderma-reishi`, `ginkgo-biloba`, `gordolobo`, `hamamelis`,
`hipericio-hierba-san-juan`, `malva`, `melisa`, `menta`, `pasiflora`, `pensamiento`,
`pino-silvestre`, `rabo-de-gato`, `regaliz`, `romero`, `tila`, `una-de-gato`, `verbena`,
`vid-roja`, `yacon`, `yerba-mate`, `zarzaparrilla` (+ `plant-00-beleno-negro`, ya retirada).

**Acción:** decisión de Papu — crear las filas en `plants` (con ficha verificada) o borrar los
archivos. No se ha hecho nada: crear 29 filas con contenido sin verificar agravaría el problema
descrito en §3. `hipericio` además está mal escrito (debería ser `hiperico`).

---

## 3. 🔴 HALLAZGO CRÍTICO FUERA DEL ALCANCE DE IMÁGENES — `ficha_cientifica`

Al usar Supabase como fuente de verdad se detecta que **el contenido textual de `ficha_cientifica`
está descolocado entre plantas y es material de relleno generado, no verificado.** Ejemplos:

- `valeriana` → "mejora en insuficiencia cardíaca" (es espino blanco)
- `lavanda` → "reducción de incidencia y duración de resfriados" (es equinácea)
- `tejo` → "eficacia comparable a ISRS" (es hipérico)
- `abedul` → "Journal of Clinical Psychopharmacology" (no corresponde a *Betula*)

**Lo grave:** el diccionario publica las 52 filas sin filtrar (`app/diccionario/page.tsx:33`
no aplica ningún `filter`), así que `/diccionario/{slug}` sirve fichas con **posología oral para
plantas letales**:

| slug | posología publicada | realidad |
|---|---|---|
| `aconito` | "Infusión: 2-3 g de semillas, 2-3 veces/día" | *Aconitum napellus*: dosis letal de aconitina ~2-6 **mg**. Esta pauta mata. |
| `tejo` | "Extracto estandarizado 300-900 mg/día" | *Taxus baccata*: taxinas cardiotóxicas, sin dosis oral segura. |
| `beleno-negro` | "Jugo interno: 20-50 ml/día" | Alcaloides tropánicos. Letal. |
| `datura-metel` | "Jugo fresco: 50-100 ml/día" | Anticolinérgico letal. |
| `datura` | "Extracto de hojas: 300-600 mg/día" | Ídem. |
| `cornezuelo-centeno` | "Infusión: 1-2 g flores secas" | Es un **hongo**, no tiene flores. Ergotismo/gangrena. |
| `amanita-muscaria` | "Infusión tradicional: 10-15 g de hojas" | Es un **hongo**, no tiene hojas. |
| `hierba-mora` | "Decocción: 2-4 g de raíz seca" | Solanina. |

Además `seguridad` es `null` en las 9 y las contraindicaciones no corresponden
(p. ej. acónito → "Alergia a Apiaceae"; es Ranunculácea).

**La lista de exclusión protege la foto pero no el texto, que es lo peligroso.**

### Mecanismo real del fallo (peor que un descoloque de campos)

No es que se mezclaran frases sueltas: **cada una de las 9 fichas tóxicas contenía ÍNTEGRA la
ficha de otra planta inocua**, familia botánica y principios activos incluidos:

| slug tóxico | ficha ajena que ocupaba su sitio | lo que publicaba |
|---|---|---|
| `aconito` | **hinojo** | "familia Apiaceae", "carminativa", "cólicos", "lactancia" |
| `amanita-muscaria` | **yerba mate** | "Aquifoliaceae", cafeína, teobromina |
| `beleno-negro` | **aloe vera** | "Asphodelaceae", aloína, gel de hojas |
| `cannabis` | **salvia** | "Lamiaceae", tujona, cineol |
| `cornezuelo-centeno` | **lavanda** | "Lamiaceae", linalool, Silexan |
| `datura` | **vid roja** | "Vitaceae", resveratrol |
| `datura-metel` | **yacón** | "Asteraceae", inulina, tubérculo |
| `hierba-mora` | **bardana / diente de león** | "Asteraceae", inulina, raíz |
| `tejo` | **hipérico** | "Hypericaceae", hipericina |

Las plantas de origen son en su mayoría los slugs huérfanos de §2 → el script que pobló la tabla
descolocó las fichas y las nueve peligrosas heredaron las de plantas seguras. Y en el caso
lavanda ↔ cornezuelo **se intercambiaron imagen y texto a la vez**, en direcciones opuestas.

### ✅ MITIGACIÓN APLICADA (2026-07-28)

Verificado en producción con `curl` que `/diccionario/aconito/` servía la posología letal.
Ejecutado sobre Supabase:

```sql
update plants set ficha_cientifica = '{}'::jsonb, updated_at = now()
where slug in ('aconito','amanita-muscaria','beleno-negro','cannabis',
               'cornezuelo-centeno','datura','datura-metel','hierba-mora','tejo');
```

- **Backup íntegro previo:** `/Volumes/Papu Ext/QuantumHolistic/backups/plants-ficha-cientifica-9-toxicas-2026-07-28.sql`
- La plantilla ya tolera `ficha_cientifica = '{}'` (`equinacea` y `manzanilla` ya estaban así).
- Las queries usan `cache: 'no-store'` → efecto inmediato, sin redeploy.
- **Verificado tras aplicar:** las 9 responden 200 con 0 bloques de "Posología".
- Se vació la ficha entera y no sólo `posologia` porque el resto también era falso: dejar
  "Acónito · familia Apiaceae · carminativa · para cólicos" seguiría siendo peligroso.

**Esto es una contención, no la solución.** Las 9 páginas siguen publicadas (ahora vacías).
Pendiente de decisión de Papu — despublicarlas del todo:

```sql
-- Fase 1: añadir la columna de publicación
alter table plants add column if not exists publicada boolean not null default true;

-- Fase 2: retirar las 9 tóxicas de la web
update plants set publicada = false
where slug in ('aconito','amanita-muscaria','beleno-negro','cannabis',
               'cornezuelo-centeno','datura','datura-metel','hierba-mora','tejo');
```
Y filtrar `&publicada=eq.true` en las dos queries de `app/diccionario/`.

⚠️ **Y lo más importante: el descoloque es transversal, no sólo de las 9.** Las 43 fichas
restantes proceden del mismo poblado defectuoso y no se han tocado. Ya se ven indicios claros
(`valeriana` → "insuficiencia cardíaca", que es espino blanco; `lavanda` → "resfriados", que es
equinácea). **Toda la tabla `plants` necesita re-verificación ficha a ficha antes de seguir
publicando el diccionario.**

---

## 4. Estado de los pasos del mandato v5

| Paso | Estado |
|---|---|
| 1. Leer `prompts-pendientes.md` | ✅ No existía → creado vacío → salto al paso 5 (según el propio mandato) |
| 2. Generar imágenes F2 | ⏭️ Sin prompts pendientes: nada que generar |
| 3. Excluir plantas peligrosas | ✅ 2 brechas encontradas y corregidas (ver §1) |
| 4. Verificación visual previa a commit | ✅ 7 verificadas una a una; 36 pendientes |
| 5. Auditoría | ✅ Este documento |
| 6. Commit + push | ✅ · Actualización de `image_cientifica_url`: ❌ **no ejecutada** (ver abajo) |

Verificación HTTP tras el deploy (2026-07-28):

| URL | Antes | Después | Correcto |
|---|---|---|---|
| `/images/plants/lavanda-cientifica.jpg` | 200 | **404** | ✅ retirada (era cornezuelo) |
| `/images/plants/plant-00-beleno-negro-cientifica.jpg` | 200 | **404** | ✅ retirada (dup. de albahaca) |
| `/images/plants/equinacea-cientifica.jpg` | 200 | 200 | ✅ intacta |
| `/images/plants/granada-cientifica.jpg` | 200 | 200 | ✅ intacta |

**Por qué no se tocó `image_cientifica_url`:** no hay URLs nuevas que verificar (no se generó
ninguna imagen), y el mapeo existente no es fiable (71% de error muestral). Escribir esas rutas
en Supabase consolidaría datos erróneos. Además el código **no lee** esa columna para pintar:
construye la ruta desde el slug, así que actualizarla no cambiaría nada en el sitio.
