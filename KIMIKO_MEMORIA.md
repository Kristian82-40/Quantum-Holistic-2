# KIMIKO_MEMORIA.md

Diario de aprendizaje de Kimiko (Claude Code). Leer al inicio de cada sesión, actualizar al final: aprendizajes, errores→checks, qué funciona.

## Checks críticos que ya se han violado más de una vez (leer esto aunque no dé tiempo a leer el resto)

- **`citas` no es un funnel de reservas/citoterapia — es una tabla de citas
  célebres de dominio público sobre salud** (Hipócrates, Avicena, la OMS,
  Cervantes...) que Kimiko puebla sola, insertando una fila nueva cuando pasan
  ~24h desde la última (verificada con `WebSearch` si no hay certeza alta de
  autoría/texto exacto, sin lenguaje de curación/pseudociencia, autor no
  repetido). El nombre en español es ambiguo y esto YA causó la misma
  desviación de comportamiento dos veces: ciclos 198º-200º (corregido en el
  201º) y de nuevo ciclos 215º-220º, ~72h sin insertar por leerlo como
  "sequía de reservas" protegida por el límite del Paso 5. **Antes de tratar
  un hueco en `citas` como señal de negocio o como algo "que no se toca",
  comprobar primero qué columnas y contenido tiene de verdad la tabla.** Ver
  detalle en las entradas de 2026-09-03 22:36 (201º) y 2026-09-08 (221º).
- Antes de aplicar cualquier regla de "no tocar X" del prompt (Paso 5) a una
  tabla o entidad por su nombre, confirmar con una consulta real qué contiene
  — un nombre ambiguo en español no es suficiente para decidir que aplica el
  límite.
- **`npm audit` llevaba desde el ciclo 185º reportando "9 vulnerabilidades (1
  moderate, 8 high)" sin cambio — en el 223º (2026-09-09) la composición
  cambió a 1 moderate, 7 high, 1 critical (mismo total, severidad nueva).**
  La entrada crítica es el bloque de advisories de `next` (versión pinneada
  `14.2.35`, sin parche disponible en la rama 14.x — `npm view next
  versions` lo confirma). No asumir nunca que "el total no cambió" equivale
  a "nada cambió": comprobar siempre el desglose por severidad, no solo la
  cifra agregada. Antes de alarmar o de actuar, contrastar la exposición
  real del proyecto contra next.config.js (`images.unoptimized`, uso de
  Server Actions, `rewrites()`, CSP nonces) — varias de las CVEs del bloque
  no aplican a esta configuración concreta. La única corrección de fondo es
  una subida mayor (14→16, salta la 15, rompe `next-intl` 3→4 también) que
  requiere decisión explícita de Kristian por su blast radius, no ejecutarla
  de oficio. Detalle en el cierre del 223º.
- **Check permanente activo desde el 211º/212º, repetido cada ciclo desde
  entonces sin variación (última pasada: 267º):** cruzar por hash el
  contenido de la columna `ficha_cientifica` (JSON) sobre las **52 filas**
  de `plants`, no solo las publicadas — los duplicados entre filas ya
  despublicadas son candidatos a repetir el bug del 211º en cuanto alguien
  las reactive sin pasar por este cruce. Da de forma estable **7 grupos /
  21 filas** (6 pares de fichas reales con contenido cruzado + las 9
  peligrosas compartiendo el mismo placeholder). Nota técnica: `ficha_cientifica`
  es JSON, no texto — comparar con `JSON.stringify(valor)` antes de
  hashear, o `.trim()` revienta con `TypeError` (desliz propio repetido en
  el 258º, corregido dentro del mismo ciclo). Un hash de los ficheros de
  `image_cientifica_url` en disco es un check distinto y no sustituye a
  este.
- **`lavanda` tiene `image_cientifica_url` rellena en Supabase pero el
  fichero no existe en `public/images/plants/` desde 2026-09-03 (abierto
  desde el ciclo 176º-177º).** Está despublicada y sin verificar, así que
  sin blast radius en vivo, pero lleva reanotándose como tarea manual desde
  hace más de dos semanas sin que se genere o suba la imagen — si algún
  ciclo decide generarla, seguir la regla de hierro del Paso 2.2 (verificar
  el fichero en disco antes de tocar `ficha_verificada`).
- **Este fichero (`KIMIKO_MEMORIA.md`) superó el límite de lectura de la
  herramienta Read (256KB) en el ciclo 268º (2026-09-19), con 11344 líneas
  y 912KB acumulados desde el ciclo 1º.** Las entradas de los ciclos 1º-198º
  (2026-07-05 a 2026-09-03) se movieron a
  `kimiko/memoria-archivo/archivo-01-ciclos-1-a-198.md` — consulta histórica
  solo si hace falta, no es necesario leerlo cada ciclo. Los checks
  permanentes que seguían vigentes se resumieron en esta misma sección antes
  de mover el resto. **Si este fichero vuelve a acercarse a las 200-250KB
  (~2500-3000 líneas), repetir el mismo movimiento:** resumir aquí cualquier
  check permanente que solo constara en el cuerpo, archivar el resto en un
  fichero nuevo numerado dentro de `kimiko/memoria-archivo/`, y dejarlo
  anotado en esta lista.

---

### Cierre 2026-09-03 (ciclo 16:02 UTC, 199º, MODO CICLO)
- Build/lint limpios (36/36 páginas). `npm audit`: 9 vulnerabilidades sin cambio
  desde el 185º. 8/8 rutas del checklist en 200, `/admin` → `/login` con la cadena
  completa verificada (308 + 307 + 200), `middleware.ts` en la raíz,
  canonical/`og:url`/`og:image`/sitemap (85 `<loc>`)/robots correctos. Vercel:
  últimos 5 despliegues `READY`.
- `plants`: 52 filas, sin `UPDATE` nuevo desde el 189º (mismo `updated_at` exacto)
  → no repetí la auditoría visual completa. 23 publicada+verificada, 9 peligrosas
  confirmadas `publicada=false`, `lavanda` sigue despublicada (imagen ausente
  confirmada, no la reactivo), duplicado `equinacea`/`echinacea` sin resolver.
- `blog_posts`: 109 filas (79/22/8), sin `UPDATE` nuevo salvo el fix de este ciclo.
  Sin duplicados de título. Hallazgo del ciclo: enlace roto a `lavanda` en 2 posts,
  corregido (ver arriba).
- `leads` en 0. `citas`: última inserción 2026-09-02T08:35:24 UTC, ~31h27min sin
  inserción nueva al cierre — sigue creciendo desde el cruce de umbral del 198º
  (24h06min). Observación de negocio, sin tocar el funnel. `kimiko_drafts`: cola
  vacía, sin filas colgadas en `en_curso`, sin orden de Telegram este ciclo.
- Sin commit de código este ciclo; única escritura fue el `UPDATE` de contenido en
  Supabase descrito arriba, verificado en vivo.
- Ver `kimiko/bitacora/2026-09-03-1602.md`.
- Ver `kimiko/bitacora/2026-09-03-0841.md`.

## 2026-09-03 19:17 UTC — `blog_posts.updated_at` no se actualiza en `UPDATE`
## vía REST: la regla "sin `UPDATE` nuevo → no repetir auditoría" es poco fiable
## (200º ciclo)

### Aprendizaje (cicatriz → check permanente)
- **`blog_posts` no tiene trigger que mantenga `updated_at` al día en escrituras
  vía Supabase REST.** Lo descubrí comprobando que el fix del 199º (quitar el
  `<a href="/diccionario/lavanda/">` de 2 posts) seguía vivo: el `content`
  reflejaba el cambio, pero `updated_at` de ambas filas seguía en
  `2026-05-30T06:38:08`, la fecha original del post, sin rastro del `UPDATE`
  del 199º. Desde el 189º he venido usando "`updated_at` máximo sin cambio →
  no repetir auditoría completa de `blog_posts`" para ahorrar trabajo en
  ciclos sin novedad — pero esa regla asume que toda escritura mueve
  `updated_at`, y queda demostrado que no es así al menos para `UPDATE`s
  hechos directamente vía REST (los míos, y probablemente cualquiera que no
  pase por una ruta de la app que lo setee a mano). **Check permanente: no
  usar `updated_at` como único proxy de "nada ha cambiado" en `blog_posts` (ni
  en ninguna tabla sin trigger de `updated_at` confirmado). Los chequeos
  baratos y deterministas — barrido de enlaces internos rotos, duplicados de
  título, longitud de meta description — hay que repetirlos cada ciclo sin
  condicionarlos a que `updated_at` haya cambiado; solo la auditoría visual
  cara (comparar imagen con especie en `plants`) puede seguir limitada por
  presupuesto de "hasta 6 por ciclo", no por esta señal.** Aplica igual a
  `plants`: si alguna vez actualizo una fila de `plants` vía REST sin que
  `updated_at` se mueva, la regla usada desde el 189º ("mismo `updated_at`
  exacto → no repetir auditoría visual") tampoco sería fiable — de momento no
  hay evidencia de que `plants` tenga el mismo problema (no le he hecho ningún
  `UPDATE` de contenido desde el 189º para comprobarlo), pero queda como duda
  abierta, no como hecho confirmado.

### Cierre 2026-09-03 (ciclo 19:17 UTC, 200º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`: 9
  vulnerabilidades sin cambio desde el 185º. 8/8 rutas del checklist en 200,
  `/admin` → `/login` con la cadena completa verificada (308 + 307 + 200),
  `middleware.ts` en la raíz, canonical/`og:url`/`og:image`/sitemap (85
  `<loc>`)/robots correctos. Vercel: últimos 5 despliegues `READY`.
- `plants`: 52 filas, sin `UPDATE` nuevo desde el 189º (mismo `updated_at` exacto)
  → no repetí la auditoría visual completa. 23 publicada+verificada, 9
  peligrosas confirmadas `publicada=false`, `lavanda` sigue despublicada,
  duplicado `equinacea`/`echinacea` sin resolver.
- `blog_posts`: 109 filas (79/22/8). Descubrí que `updated_at` no refleja el
  `UPDATE` del 199º (ver cicatriz arriba) — de aquí en adelante repito los
  chequeos baratos cada ciclo sin condicionarlos a `updated_at`. Barrido
  completo de enlaces internos: único slug enlazado es `hinojo`
  (publicada+verificada, 200 en vivo), fix del 199º a `lavanda` sigue vivo
  verificado directamente en el `content`. Sin duplicados de título, sin
  títulos >60 car. QA SEO en vivo de un post al azar sin hallazgos.
- `leads` en 0. `citas`: última inserción 2026-09-02T08:35:24 UTC, ~34h41min sin
  inserción nueva al cierre, sigue creciendo desde el cruce de umbral del 198º.
  Observación de negocio, sin tocar el funnel. `kimiko_drafts`: cola vacía, sin
  filas colgadas en `en_curso`, sin orden de Telegram este ciclo.
- Sin commits de código ni escritura en Supabase este ciclo — el hallazgo de
  hoy es metodológico (fiabilidad de `updated_at`), no un bug en producción.

## 2026-09-03 22:36 UTC — `citas` (frases célebres) llevaba 3 ciclos sin la
## cita diaria por confundirla con el funnel de reservas del Paso 5 (201º ciclo)

### Aprendizaje (cicatriz → check permanente)
- **La tabla `citas` no tiene nada que ver con reservas de terapia ni con el
  funnel de pago del Paso 2.5/5 — son citas/frases célebres de dominio público
  sobre salud y bienestar que se muestran en el sitio.** Hay una práctica
  autoimpuesta y documentada desde hace decenas de ciclos (explícita al menos
  desde el 184º-187º): cuando pasan 24h sin una fila nueva, busco una cita
  verificable de dominio público, sin lenguaje de curación ni pseudociencia,
  verifico el texto exacto con `WebSearch` si no hay certeza alta ("suena a
  algo que dijo X" no es verificación, regla del 186º), y la inserto. El 198º
  ciclo cruzó el umbral de 24h por primera vez y, en lugar de aplicar esa
  práctica, lo registró como "observación de negocio... Paso 2.5, sin tocar
  el funnel" — leyendo el nombre de la tabla como si fuera el funnel de
  citas/reservas protegido por el límite del Paso 5. Los ciclos 199º y 200º
  copiaron esa lectura sin volver a comprobar qué contiene realmente la
  tabla, así que la cita diaria quedó sin insertarse ~62h en total (3 ciclos)
  antes de que este ciclo lo detectara. **Check permanente: antes de aplicar
  un límite del Paso 5 (o cualquier regla de "no tocar X") a una tabla o
  entidad por su nombre, confirmar qué contiene de verdad — columnas, unas
  pocas filas — en vez de asumir por la palabra. En español "citas" es
  ambiguo (reservas vs. frases célebres) y ya ha causado una desviación real
  de comportamiento.**
- Corregido: cita nueva insertada tras descartar un candidato de Séneca sin
  fuente primaria verificable (parece ser de Rabelais, tampoco confirmado con
  certeza alta) y verificar en su lugar Proverbios 4:22 (Reina-Valera) contra
  varias fuentes independientes. 32 citas en la tabla tras la inserción (antes
  31). Detalle completo en `kimiko/bitacora/2026-09-03-2236.md`.

### Cierre 2026-09-03 (ciclo 22:36 UTC, 201º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm ci`
  limpio. **`npm audit` no completó este ciclo** — colgado sin salida ni error
  en tres intentos (dos en foreground con timeout, uno en background matado
  tras varios minutos), pese a que `registry.npmjs.org` respondía 200 normal
  por `curl`. No bloqueante (build/lint funcionan), pero no puedo confirmar
  si las 9 vulnerabilidades conocidas siguen iguales — anotado como duda
  abierta para Kristian, a vigilar si se repite. 8/8 rutas del checklist en
  200, `/admin` → `/login` con la cadena completa verificada (308 + 307 +
  200), `middleware.ts` en la raíz, canonical/`og:url`/`og:image`/sitemap (85
  `<loc>`)/robots correctos. Vercel: últimos 5 despliegues `READY`.
- `plants`: 52 filas, sin `UPDATE` nuevo desde el 189º (mismo `updated_at`
  exacto) → no repetí la auditoría visual completa. 23 publicada+verificada, 9
  peligrosas confirmadas `publicada=false`, `lavanda` sigue despublicada,
  duplicado `equinacea`/`echinacea` sin resolver.
- `blog_posts`: 109 filas (79/22/8), sin cambio de conteo. Chequeos baratos
  repetidos sin condicionarlos a `updated_at` (regla del 200º): sin
  duplicados de título, ninguno >60 car., los 22 publicados con `excerpt`
  presente y ≤155 car. Único slug de diccionario enlazado sigue siendo
  `hinojo` (200 en vivo). QA SEO en vivo de un post al azar sin hallazgos.
- `leads` en 0. `citas`: hallazgo del ciclo (ver arriba) — cita diaria
  insertada tras 3 ciclos sin ella por el malentendido corregido. 32 filas
  tras la inserción. `kimiko_drafts`: cola vacía, sin filas colgadas en
  `en_curso`, sin orden de Telegram este ciclo.
- Sin commits de código este ciclo; única escritura en Supabase fue la cita
  diaria en `citas`, verificada en vivo (conteo 31→32).
- Ver `kimiko/bitacora/2026-09-03-1917.md`.

## 2026-09-04 03:30 UTC — `npm audit --omit=dev`/`--json` cuelga; `npm audit` sin
## flags funciona (202º ciclo)

### Aprendizaje (cicatriz → check permanente)
- **El cuelgue de `npm audit` reportado como duda abierta en el 201º se repitió, pero
  esta vez aislé la causa: es específico de los flags `--omit=dev` y/o `--json`, no del
  comando ni de la red.** `registry.npmjs.org` respondió 200 en 40ms por `curl` en los
  tres intentos fallidos (dos con `--omit=dev`, uno además con `--json` a fichero en
  background, todos con `timeout` de 60-100s sin salida ni error). En cuanto probé
  `npm audit` **sin ningún flag** completó en menos de 100s con exit 0 y el resultado
  esperado (9 vulnerabilidades, 1 moderate + 8 high, sin cambio desde el 185º). **Check
  permanente: para comprobar vulnerabilidades, usar siempre `npm audit` sin flags. Si se
  necesita `--json` o `--omit=dev` para algo puntual, no asumir que colgará igual sin
  probarlo primero — pero el chequeo rutinario de cada ciclo no los necesita.**

### Cierre 2026-09-04 (ciclo 03:30 UTC, 202º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit` sin flags:
  9 vulnerabilidades (1 moderate, 8 high) sin cambio desde el 185º (ver cicatriz arriba
  sobre los flags que cuelgan). 8/8 rutas del checklist en 200 (verificadas con
  `curl -L` siguiendo redirecciones), `/admin` → `/login` con la cadena completa (308 +
  307 + 200), `middleware.ts` en la raíz, canonical/`og:url`/sitemap/robots correctos.
  Vercel: últimos 5 despliegues `READY`.
- `plants`: 52 filas, 23 publicada+verificada, 9 peligrosas confirmadas
  `publicada=false`, `lavanda` sigue despublicada, duplicado `equinacea`/`echinacea`
  sin resolver. Sin auditoría visual completa este ciclo (sin indicio de cambio).
- `blog_posts`: 22 publicados, sin duplicados de título, ninguno >60 car., todos con
  `excerpt` ≤155 car. Único slug de diccionario enlazado sigue siendo `hinojo`
  (publicada+verificada). Ninguna planta peligrosa enlazada en contenido publicado.
- `leads` en 0. `citas`: última inserción por el 201º ciclo, ~4h54min antes del cierre
  de este — dentro de umbral normal. `kimiko_drafts`: cola vacía, las 4 filas existentes
  en `status='hecho'`, sin filas colgadas en `en_curso`, sin orden de Telegram este
  ciclo.
- Sin commits de código ni escritura en Supabase este ciclo — único hallazgo es
  metodológico (causa del cuelgue de `npm audit`), no un bug de producción.
- Ver `kimiko/bitacora/2026-09-04-0330.md`.

### Cierre 2026-09-04 (ciclo 15:58 UTC, 203º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit` (sin flags): 9
  vulnerabilidades (1 moderate, 8 high) sin cambio desde el 185º. 8/8 rutas del checklist en 200,
  `/admin` → `/login` con la cadena completa (308 + 307 + 200), `middleware.ts` en la raíz,
  canonical/`og:url`/sitemap (85 `<loc>`)/robots correctos. Vercel: últimos 5 despliegues `READY`.
- `plants`: 52 filas, 23 publicada+verificada, 9 peligrosas confirmadas `publicada=false`.
  Reconfirmé a mano que no existe ningún fichero `lavanda*` en `public/images/plants/`, así que
  su despublicación sigue siendo correcta. Duplicado `equinacea`/`echinacea` sin resolver (sigue
  fuera de mi alcance: implica borrar/fusionar una fila). Sin auditoría visual completa este
  ciclo (sin indicio de cambio).
- `blog_posts`: 22 publicados, sin duplicados de título, ninguno >60 car., todos con `excerpt`
  ≤155 car. Único slug de diccionario enlazado sigue siendo `hinojo` (publicada+verificada).
  Ninguna planta peligrosa enlazada en contenido publicado.
- `leads` en 0. `citas`: última inserción por el 201º ciclo, ~17h22min antes del cierre de este —
  dentro de umbral normal, sin acción necesaria. `kimiko_drafts`: cola vacía, las 4 filas
  existentes en `status='hecho'`, sin filas colgadas en `en_curso`, sin orden de Telegram este
  ciclo.
- Sin commits de código ni escritura en Supabase este ciclo — checklist limpio de principio a
  fin, sin hallazgos nuevos respecto al 202º.
- Ver `kimiko/bitacora/2026-09-04-1558.md`.

## 2026-09-04 18:55 UTC — `blog_posts.status` no usa "publicado" como valor; el
## campo que marca "en vivo" es el booleano `published` (204º ciclo)

### Aprendizaje (cicatriz → check permanente)
- **La columna `status` de `blog_posts` es un enum en inglés (`draft` / `published` /
  `rejected`), no en español, y no es la fuente de verdad de "está en vivo en el
  sitio": esa es la columna booleana `published`.** Filtré primero por
  `status=eq.publicado` (calcando el vocabulario del Paso 2.3 en español) y obtuve
  0 filas — un falso "no hay posts publicados" que habría hecho inútil todo el
  chequeo de SEO del ciclo si no lo hubiera notado. Al inspeccionar una fila
  completa con `select=*` vi que `status` usa valores en inglés y que existe además
  `published` (boolean), que es el que coincide con el conteo real (22, igual que
  ciclos anteriores). **Check permanente: para filtrar posts "en vivo" en
  `blog_posts`, usar siempre `published=eq.true`, nunca adivinar el valor de
  `status` por el nombre en español del concepto. Si una consulta a cualquier tabla
  devuelve 0 filas donde se esperaba un número conocido de ciclos previos, tratarlo
  como señal de filtro incorrecto y verificar el esquema con `select=*&limit=1`
  antes de concluir que el dato desapareció.**

### Cierre 2026-09-04 (ciclo 18:55 UTC, 204º, MODO CICLO)
- Build/lint limpios (36/36 páginas). `npm audit` (sin flags): 9 vulnerabilidades
  (1 moderate, 8 high) sin cambio desde el 185º; fix solo vía `--force` (breaking:
  next@16), no aplicado sin validación de Kristian. 8/8 rutas del checklist en 200,
  `/admin` → `/login` con la cadena completa (308 + 307 + 200), `middleware.ts` en
  la raíz, canonical/`og:url`/sitemap (85 `<loc>`)/robots correctos. Vercel:
  últimos 5 despliegues `READY`.
- `plants`: 52 filas, 23 publicada+verificada, las 9 peligrosas confirmadas una a
  una `publicada=false`, `lavanda` sigue despublicada, duplicado
  `equinacea`/`echinacea` sin resolver. `updated_at` máximo sin cambio desde el
  189º → sin auditoría visual completa este ciclo.
- `blog_posts`: 22 publicados (`published=true`; ver cicatriz arriba sobre el
  filtro correcto), sin duplicados de título, ninguno >60 car., todos con
  `excerpt` ≤155 car. Único slug de diccionario enlazado sigue siendo `hinojo`
  (publicada+verificada). Ninguna planta peligrosa enlazada en contenido
  publicado.
- `leads` en 0. `citas`: última inserción por el 201º ciclo, ~20h18min antes del
  cierre de este — dentro de umbral normal, sin acción necesaria. `kimiko_drafts`:
  cola vacía, sin filas colgadas en `en_curso`, sin orden de Telegram este ciclo.
- Sin commits de código ni escritura en Supabase este ciclo — único hallazgo es
  metodológico (filtro correcto de "publicado" en `blog_posts`), no un bug de
  producción.
- Ver `kimiko/bitacora/2026-09-04-1855.md`.

### Cierre 2026-09-04 (ciclo 22:14 UTC, 205º, MODO CICLO)
- Build/lint limpios (36/36 páginas). `npm audit` (sin flags): 9 vulnerabilidades
  (1 moderate, 8 high) sin cambio desde el 185º. 8/8 rutas del checklist en 200,
  `/admin` → `/login` con la cadena completa (308 + 307 + 200), `middleware.ts` en
  la raíz, canonical/`og:url`/`og:image`/sitemap (85 `<loc>`)/robots correctos.
  Vercel: últimos 5 despliegues `READY`.
- `plants`: 52 filas, 23 publicada+verificada, las 9 peligrosas confirmadas una a
  una `publicada=false`. Reconfirmé que no existe ningún fichero `lavanda*` en
  `public/images/plants/` pese a que `image_cientifica_url` apunta a una ruta
  concreta — la despublicación sigue siendo correcta. Duplicado
  `equinacea`/`echinacea` sin resolver. `updated_at` máximo sin cambio desde el
  189º → sin auditoría visual completa.
- `blog_posts`: 22 publicados (`published=true`, coincide con el conteo por
  `status`), sin duplicados de título, ninguno >60 car., todos con `excerpt`
  ≤155 car. Único slug de diccionario enlazado sigue siendo `hinojo`
  (publicada+verificada). Ninguna planta peligrosa enlazada.
- **Hallazgo de negocio (no técnico):** los 22 posts publicados no cambian desde
  2026-05-29/30 — ~3 meses sin publicar nada nuevo, con 79 borradores en cola.
  Varios títulos de borrador tocan categorías del Paso 2.4 que exigen
  contraindicaciones obligatorias o pueden implicar claim de curación (detox
  hepático, ayuno intermitente, rasayanas). No los revisé línea a línea este
  ciclo — aprobar contenido de esas categorías sin lectura completa es
  justo el tipo de atajo que el Paso 2.4 prohíbe ("duda = borrador"). Queda
  como tarea para un ciclo dedicado, no como bloqueo técnico.
- `leads` en 0. `citas`: última inserción 2026-09-03T22:36:49 UTC (201º ciclo),
  ~23h37min antes del cierre — todavía dentro del umbral de 24h por 23 minutos
  de margen; probable que cruce antes del próximo ciclo. `kimiko_drafts`: 4
  filas, las 4 en `hecho`, sin `pendiente`/`en_curso`, sin orden de Telegram
  este ciclo.
- Sin commits de código ni escrituras en Supabase este ciclo — noveno ciclo
  seguido (197º–205º) sin hallazgos técnicos nuevos en el checklist.
- Ver `kimiko/bitacora/2026-09-04-2214.md`.

## 2026-09-05 03:30 UTC — el backlog de 79 borradores de blog no es solo "sin
## revisar": 32 son fragmentos rotos y el resto casi todo cae en categorías
## sensibles del Paso 2.4 (206º ciclo)

### Aprendizaje (cicatriz → check permanente)
- **Un recuento de filas en `blog_posts` con `status='draft'` no dice nada sobre
  si esas filas son borradores publicables.** El 205º dejó anotado "79 borradores
  en cola" como una cifra homogénea. Al entrar al contenido real (`select=*`,
  no solo `title`), 32 de las 79 resultaron ser fragmentos rotos — una sola
  frase suelta como `content`, sin `excerpt`, `tags=null` — más varias filas
  literalmente de prueba (`Test agente nocturno`, `test final` ×2). De los 47
  restantes con contenido real, 18 títulos están duplicados (hasta 4 copias de
  la misma pieza), y casi todos los títulos únicos que quedan tocan justo las
  categorías del Paso 2.4 que exigen contraindicaciones obligatorias (ayuno,
  adaptógenos, rasayanas, detox hepático) o usan lenguaje de claim de curación
  directamente en el título ("El Poder Curativo de...", "...para Sanar el
  Cuerpo"). **Check permanente: antes de calificar cualquier acumulación de
  filas como "pendiente de revisión" (borradores, leads, tickets), mirar el
  contenido real de una muestra representativa, no solo el recuento — un
  conteo puede esconder basura estructural (fragmentos rotos, duplicados,
  pruebas) que cambia la naturaleza de la tarea de "revisar" a "depurar antes
  de revisar".**
- No publiqué nada este ciclo — ningún borrador calificó como limpio sin lectura
  línea a línea completa, y resolver los duplicados exige elegir una versión
  canónica antes de que valga la pena aplicar el filtro de contenido. Detalle
  completo en `kimiko/bitacora/2026-09-05-0330.md`.

### Cierre 2026-09-05 (ciclo 03:30 UTC, 206º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  (sin flags): 9 vulnerabilidades (1 moderate, 8 high) sin cambio desde el
  185º. 8/8 rutas del checklist en 200, `/admin` → `/login` con la cadena
  completa (308 + 307 + 200), `middleware.ts` en la raíz,
  canonical/`og:url`/`og:image`/sitemap (85 `<loc>`)/robots correctos. Vercel:
  últimos 5 despliegues `READY`.
- `plants`: 52 filas, 23 publicada+verificada, las 9 peligrosas confirmadas
  `publicada=false`, `lavanda` sigue despublicada, duplicado
  `equinacea`/`echinacea` sin resolver. `updated_at` máximo sin cambio desde el
  189º → sin auditoría visual completa.
- `blog_posts`: 22 publicados, sin duplicados de título, ninguno >60 car.,
  todos con `excerpt` ≤155 car. Único slug de diccionario enlazado sigue
  siendo `hinojo`. Backlog de 79 borradores investigado a fondo por primera
  vez — ver cicatriz arriba. Sigue sin publicarse nada nuevo.
- `leads` en 0. `citas`: última inserción del 201º ciclo llevaba ~28h51min al
  cierre, cruzando el umbral de 24h — cita nueva insertada tras verificar con
  `WebSearch` la Constitución de la OMS (1946/1948, dominio público, sin
  lenguaje de curación). 33 filas tras la inserción (antes 32). `kimiko_drafts`:
  cola vacía, las 4 filas existentes en `hecho`, sin orden de Telegram este
  ciclo.
- Única escritura en Supabase este ciclo fue la cita diaria en `citas`,
  verificada en vivo (32→33). Sin commits de código.
- Ver `kimiko/bitacora/2026-09-05-0330.md`.

### Cierre 2026-09-05 (ciclo 08:12 UTC, 207º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  (sin flags): 9 vulnerabilidades (1 moderate, 8 high) sin cambio desde el
  185º. 8/8 rutas del checklist en 200, `/admin` → `/login` con la cadena
  completa (308 + 307 + 200), `middleware.ts` en la raíz,
  canonical/`og:url`/`og:image`/sitemap (85 `<loc>`)/robots correctos. Vercel:
  últimos 5 despliegues `READY`.
- `plants`: 52 filas, 23 publicada+verificada, las 9 peligrosas confirmadas
  `publicada=false`. `updated_at` máximo sin cambio desde el 189º → sin
  auditoría visual completa. Duplicado `equinacea`/`echinacea` sin resolver.
- `blog_posts`: 22 publicados, sin duplicados de título, ninguno >60 car.,
  todos con `excerpt` ≤155 car. Único slug de diccionario enlazado sigue
  siendo `hinojo`. Retomé el backlog de borradores del 206º y filtré por
  contenido real + títulos únicos (25 candidatos de 79). Leí a fondo el más
  prometedor (`nutricion-km0-herbologia-plantas-medicinales-de-proximidad-1783698312`,
  único título sin claim de curación ni categoría sensible ya en el título) y
  encontré que usa el verbo "curarse" en excerpt/cierre (claim de curación
  aunque en tono de "alimento como medicina") y describe apoyo hepático del
  diente de león sin la contraindicación específica de cálculos biliares. No
  lo publiqué — "duda = borrador" — pero dejé anotados los dos cambios
  exactos que le faltan, en vez de repetir que "el backlog está sucio". Los
  otros 24 candidatos no se revisaron línea a línea (la mayoría ya toca en el
  título categorías sensibles o claim directo).
- `leads` en 0. `citas`: última inserción del 206º ciclo, ~4h44min antes del
  cierre — dentro del umbral normal, sin acción necesaria. `kimiko_drafts`:
  cola vacía, sin orden de Telegram este ciclo.
- Sin commits de código ni escrituras en Supabase este ciclo — checklist
  limpio, undécimo ciclo consecutivo (197º–207º) sin hallazgos técnicos
  nuevos.

## 2026-09-05 14:45 UTC — "a dos cambios de publicable" no basta: hay que
## comprobar límites SEO reales y comparar el tema contra lo ya publicado,
## no solo contra los otros borradores (208º ciclo)

### Aprendizaje (cicatriz → check permanente)
- El 206º y el 207º dejaron un candidato del backlog de blog ("Nutrición Km0
  y Herbología...") anotado como "a dos cambios de pasar el filtro" (quitar
  "curarse", añadir contraindicación de diente de león). Al ir a aplicar esos
  cambios y publicar, encontré dos problemas que ningún ciclo anterior había
  comprobado en un *borrador* (el checklist de SEO del Paso 2.3 solo se venía
  aplicando a los 22 ya publicados):
  1. Título de 77 caracteres y excerpt de 168 — ambos superan los límites
     (60 y 155) que exige el propio checklist.
  2. Ya existe un post publicado ("Herboristería Europea de Proximidad") que
     trata el mismo tema (plantas medicinales locales/de proximidad) con
     argumentario casi idéntico — publicar el candidato habría sido
     canibalización de contenido, no aporte nuevo.
  **Check permanente: antes de calificar un borrador del backlog como
  "publicable" o "casi publicable", (a) medir título y excerpt contra los
  límites reales del Paso 2.3, y (b) cruzar el tema/título contra los posts
  *ya publicados* (no solo contra otros borradores) para descartar
  redundancia temática. El filtro de contenido sensible del Paso 2.4 y el
  filtro de "¿esto ya existe en el sitio?" son chequeos independientes; pasar
  uno no implica pasar el otro.**
- No publiqué nada este ciclo. Detalle completo en
  `kimiko/bitacora/2026-09-05-1445.md`.

### Cierre 2026-09-05 (ciclo 14:45 UTC, 208º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  (sin flags): 9 vulnerabilidades (1 moderate, 8 high) sin cambio desde el
  185º. 8/8 rutas del checklist en 200, `/admin` → `/login` con la cadena
  completa (308 + 307 + 200), `middleware.ts` en la raíz,
  canonical/`og:url`/`og:image`/sitemap (85 `<loc>`)/robots correctos. Vercel:
  últimos 5 despliegues `READY`.
- `plants`: 52 filas, 23 publicada+verificada, las 9 peligrosas confirmadas
  `publicada=false`. `updated_at` máximo sin cambio desde el 189º → sin
  auditoría visual completa. Duplicado `equinacea`/`echinacea` sin resolver.
- `blog_posts`: 22 publicados, sin duplicados de título, ninguno >60 car.,
  todos con `excerpt` ≤155 car. Único slug de diccionario enlazado sigue
  siendo `hinojo`. Descarté el candidato "casi listo" del 206º/207º por los
  dos motivos de la cicatriz de arriba (SEO + duplicación temática) — ver
  cicatriz.
- `leads` en 0. `citas`: última inserción del 206º ciclo, ~11h17min antes del
  cierre — dentro del umbral normal, sin acción necesaria. `kimiko_drafts`:
  cola vacía, sin orden de Telegram este ciclo.
- Sin commits de código ni escrituras en Supabase este ciclo — checklist
  limpio, duodécimo ciclo consecutivo (197º–208º) sin hallazgos técnicos
  nuevos en el checklist, pero con un hallazgo real de calidad de contenido.
- Ver `kimiko/bitacora/2026-09-05-0812.md`.

## 2026-09-05 18:01 UTC — el backlog de blog no es una cola de "casi listos":
## ≈80% de los títulos únicos duplican el tema de un post ya publicado bajo
## otro título (209º ciclo)

### Aprendizaje (cicatriz → check permanente)
- El 208º dejó anotado, para un solo candidato, que hay que cruzar tema
  contra publicados antes de calificar un borrador como publicable. Este
  ciclo apliqué ese cruce **en bloque** a los 46 títulos únicos con
  contenido real del backlog (de 79 `draft` + 8 `rejected`), en vez de
  candidato a candidato, y el resultado cambia la naturaleza del problema:
  **≈37 de los 46 (≈80%) son el mismo tema que un post ya publicado**, solo
  con título/framing distinto — en un caso ("Microbiota Intestinal: Cómo
  Cuidar tu Segundo Cerebro") duplica *tres* posts publicados a la vez. De
  los ≈9 títulos que sí son tema nuevo, revisé a fondo los tres más
  prometedores (sin categoría prohibida ni claim de curación en el título) y
  los tres fallan: dos variantes de "Acupuntura y Auriculoterapia" afirman
  que la técnica trata Alzheimer, Parkinson y accidente cerebrovascular
  (claim de curación sobre enfermedad grave, no matizable) y citan fuentes
  vagas no verificables, además de superar el límite de título (84 y 71
  car.); "Los Rasayanas Ayurvédicos" supera el límite de título (72 car.)
  antes de llegar siquiera al filtro de contenido. **Check permanente: antes
  de revisar el backlog de blog línea a línea, cruzar TODOS los títulos
  únicos con contenido real contra los ya publicados de una sola vez (no
  uno a uno según se van revisando) — el pipeline que generó el backlog
  repite el mismo puñado de temas con títulos distintos, así que ese cruce
  en bloque descarta la mayoría del trabajo antes de leer un solo párrafo de
  contenido.**
- No publiqué nada este ciclo. Detalle completo en
  `kimiko/bitacora/2026-09-05-1801.md`.

### Cierre 2026-09-05 (ciclo 18:01 UTC, 209º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  (sin flags): 9 vulnerabilidades (1 moderate, 8 high) sin cambio desde el
  185º. 8/8 rutas del checklist en 200, `/admin` → `/login` con la cadena
  completa (308 + 307 + 200), `middleware.ts` en la raíz,
  canonical/`og:url`/`og:image`/sitemap (85 `<loc>`)/robots correctos. Vercel:
  últimos 5 despliegues `READY`.
- `plants`: 52 filas, 23 publicada+verificada, las 9 peligrosas confirmadas
  `publicada=false`. `updated_at` máximo sin cambio desde el 189º → sin
  auditoría visual completa. Duplicado `equinacea`/`echinacea` sin resolver.
- `blog_posts`: 22 publicados, sin duplicados de título, ninguno >60 car.,
  todos con `excerpt` ≤155 car. Único slug de diccionario enlazado sigue
  siendo `hinojo`. Backlog de borradores auditado en bloque por primera vez
  — ver cicatriz arriba. Sigue sin publicarse nada nuevo.
- `leads` en 0. `citas`: última inserción del 206º ciclo, ~14h32min antes del
  cierre — dentro del umbral normal, sin acción necesaria. `kimiko_drafts`:
  cola vacía, sin orden de Telegram este ciclo.
- Sin commits de código ni escrituras en Supabase este ciclo — decimotercer
  ciclo consecutivo (197º–209º) sin hallazgos técnicos nuevos en el
  checklist, pero con un hallazgo de fondo sobre la naturaleza del backlog
  de contenido.

### Cierre 2026-09-05 (ciclo 21:59 UTC, 210º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  (sin flags): 9 vulnerabilidades (1 moderate, 8 high) sin cambio desde el
  185º. 8/8 rutas del checklist en 200, `/admin` → `/login` con la cadena
  completa (308 + 307 + 200), `middleware.ts` en la raíz,
  canonical/`og:url`/`og:image`/sitemap (85 `<loc>`)/robots correctos. Vercel:
  últimos 5 despliegues `READY`.
- `plants`: 52 filas, 23 publicada+verificada, las 9 peligrosas confirmadas
  `publicada=false`. `updated_at` máximo sin cambio desde el 189º → sin
  auditoría visual completa. Duplicado `equinacea`/`echinacea` sin resolver.
- `blog_posts`: 22 publicados, sin duplicados de título, ninguno >60 car.,
  todos con `excerpt` ≤155 car. Backlog sin cambio (87 filas, más reciente
  del 2026-07-10) desde el cruce en bloque del 209º — sin candidatos nuevos
  que auditar, el hallazgo de ≈80% duplicación temática sigue vigente.
- `leads` en 0. `citas`: última inserción del 206º ciclo, ~18h31min antes del
  cierre — dentro del umbral normal pero acercándose a las 24h; vigilar en
  el próximo ciclo. `kimiko_drafts`: 4 filas totales, 0 en
  `pendiente`/`en_curso`, sin orden de Telegram este ciclo.
- Sin commits de código ni escrituras en Supabase este ciclo — decimocuarto
  ciclo consecutivo (197º–210º) sin hallazgos técnicos nuevos.
- Ver `kimiko/bitacora/2026-09-05-2159.md`.
- Ver `kimiko/bitacora/2026-09-05-1801.md`.

## 2026-09-06 03:27 UTC — Ciclo cloud: 19 de 23 plantas "verificadas" tenían
## contenido científico de otra especie — la racha de 14 ciclos limpios se
## sostenía sobre un check que nunca cubrió la republicación (211º ciclo)

### Aprendizaje (cicatriz → check permanente)
- **"Sin `UPDATE` nuevo desde el último audit documentado" (check del 190º)
  solo es una señal válida para saltar una re-auditoría si el audit que fijó
  esa `updated_at` cubrió el mismo tipo de check que se está pensando
  saltar.** El 189º cambió `updated_at` de 40 filas por un incidente de
  *imagen* cruzada (bajó 17 → quedaron 23), no por el check de *texto*
  cruzado del 176º. 14 ciclos seguidos (197º-210º) leyeron ese mismo
  timestamp sin cambios y asumieron que también cubría el check de texto —
  pero ese check nunca se volvió a correr sobre el lote que Kristian había
  re-publicado entre el 177º y el 189º (pasó de 15 filas tras el 177º a 40
  antes del 189º sin que ningún ciclo de Kimiko verificara el contenido de
  esa republicación). Resultado real al comprobarlo este ciclo: 3 plantas
  con `ficha_cientifica` copiada byte a byte de otra especie (`loto`←`tulsi`,
  `cinamomo`←`valeriana`, `nigela`←`manzanilla` — la de `cinamomo` es grave,
  presentaba *Melia azedarach*, tóxica, con posología de sedante de
  valeriana) y otras 16 con familia botánica/principios activos de una
  especie distinta confirmados por muestreo con `WebSearch` (9/9 aciertos):
  `abedul` (contenido de kava), `ajo` (regaliz), `azafrán` (menta), `roble`
  (hamamelis), `incienso` (papaya), `higuera` (moringa), `granada` (melisa),
  `milenrama` (eucalipto), `sidr` (cola de caballo), `frankenia`,
  `rosa-de-jerico`, `amla`, `neem`, `boldo`, `azufaifo`, `arbol-bodhi`. Solo
  4 de las 23 originales eran correctas: `albahaca`, `equinacea`, `arnica`,
  `hinojo`. **Check permanente: el cruce mecánico de `ficha_cientifica`
  idéntica entre slugs distintos (aplicable a las 52 filas de golpe, sin el
  límite de 6/ciclo — eso es solo para la auditoría VISUAL) debe correr en
  CADA ciclo, sin importar si `updated_at` cambió. Es la única forma barata
  de detectar que una fila pasó de no-publicada a publicada por acción
  externa sin que el contenido se haya corregido de verdad.**
- **Una transición `false→true` de `ficha_verificada` hecha por Kristian
  fuera de mi ciclo significa "decidió republicarla", no "verificó que el
  contenido ya no cruza con otra especie".** Distinto del caso `lavanda` del
  190º (imagen rota, sin riesgo de contenido cruzado) — cualquier
  republicación de una fila que en su día se bajó por *contenido* debe
  tratarse como candidata a repetir el cruce de texto en el ciclo siguiente,
  no solo registrarse como hecho consumado.
- **Bug real encontrado de paso en `app/sitemap.ts`:** `getPlantSlugs()` no
  filtraba por `publicada`/`ficha_verificada` (a diferencia de
  `getBlogSlugs()`, que sí filtra `status=eq.published`) — el sitemap llevaba
  enviando a buscadores las 52 URLs de `plants`, incluidas las 9 peligrosas y
  cualquier planta despublicada, todas devolviendo 404. Corregido con el
  mismo filtro que ya usa el blog. **Check permanente: cualquier fuente de
  URLs de `sitemap.ts` debe filtrar por el mismo criterio de visibilidad que
  usa la página real — no asumir que listar la tabla entera es seguro solo
  porque el render ya gatea el contenido.**
- Acción tomada: `publicada=false, ficha_verificada=false` en las 19 filas
  confirmadas. Verificado 404 en vivo al instante (ruta dinámica) en las 19,
  y `/diccionario/` bajó de 23 a 4 entradas (`albahaca`, `arnica`,
  `equinacea`, `hinojo`). Detalle completo de qué especie tenía el contenido
  de cuál en `kimiko/bitacora/2026-09-06-0327.md`.

### Cierre 2026-09-06 (ciclo cloud 03:27 UTC, 211º)
- Build/lint limpios (36/36 páginas) antes y después del fix de
  `sitemap.ts`. `npm audit` sin cambio (9, semver-major desde el 185º). 8/8
  rutas del checklist en 200, `/admin` → `/login` con la cadena completa,
  `middleware.ts` en la raíz, canonical/`og:url` correctos. Commit `231069e`
  empujado y desplegado (`READY`) dentro del ciclo: `sitemap.xml` verificado
  en producción tras el deploy, pasó de 85 a 37 `<loc>`, ya solo lista las
  4 fichas correctas. Vercel: últimos 5 despliegues `READY`.
- `plants`: 52 filas. **23→4 publicada+verificada** (19 bajadas por cruce de
  contenido científico, ver cicatriz). Las 9 peligrosas confirmadas
  `publicada=false`. Duplicado `equinacea`/`echinacea` sigue sin resolver de
  fondo (no crea duplicado en vivo).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Único slug de diccionario enlazado (`hinojo`) sigue siendo una de las 4
  plantas correctas — la bajada de las 19 no rompió enlaces existentes.
- `citas`: última inserción ~23h59min antes del cierre — revisado el
  histórico completo (33 filas, huecos habituales de 24-40h), es cadencia
  normal de esta tabla, no una señal de fallo. Cierro la vigilancia abierta
  por el 210º.
- `leads` en 0. `kimiko_drafts`: cola vacía, sin orden de Telegram este
  ciclo.
- **Commit de código este ciclo** (`app/sitemap.ts`) + escrituras en Supabase
  (19 `UPDATE` sobre `plants`) — rompe la racha de 14 ciclos sin cambios,
  con el hallazgo más grave desde el 176º-177º.
- Ver `kimiko/bitacora/2026-09-06-0327.md`.

### Cierre 2026-09-06 (ciclo 08:26 UTC, 212º, MODO CICLO)
- Build/lint limpios (36/36 páginas). `npm audit` sin cambio (9, desde el
  185º). 8/8 rutas del checklist en 200, `/admin` → `/login` con la cadena
  completa, `middleware.ts` en la raíz, canonical/`og:url`/`og:image`/sitemap
  (37 `<loc>`, sin cambio desde el fix del 211º)/robots correctos. Vercel:
  últimos 5 despliegues `READY`.
- Apliqué por primera vez el check permanente del 211º (cruce mecánico de
  hash de `ficha_cientifica` sobre las 52 filas de golpe, no solo las
  publicadas). Los 3 pares de copia exacta del 211º siguen `publicada=false`.
  **Encontré dos pares de copia exacta nuevos, no vistos en el 211º:
  `muerdago`/`ginseng` y `sauco`/`ashwagandha-fruto`.** Ambos pares ya
  estaban `publicada=false` por otras razones, así que sin blast radius en
  vivo — pero es la prueba de que el check del 211º, corrido por primera vez
  sobre las 52 filas completas en vez de solo las 23 que eran "publicada"
  entonces, encuentra más basura de la que ese ciclo alcanzó a ver. **Check
  permanente ampliado: el cruce de hash de `ficha_cientifica` debe correr
  sobre las 52 filas (no solo las publicadas) en cada ciclo — los pares que
  aparecen entre filas ya despublicadas no son ruido, son candidatos a
  repetir el bug del 211º en cuanto alguien las reactive sin pasar por este
  cruce.** `plants`: 52 filas, 4 publicada+verificada sin cambio. Imágenes de
  las 4 fichas vivas confirmadas en disco. `/diccionario` en producción
  verificado con las 4 fichas correctas y ninguna más.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Sin candidatos nuevos en el backlog desde el cruce en bloque del 209º.
- `citas`: última inserción ~29h antes del cierre — dentro del rango de
  huecos habituales (24-40h) confirmado en el 211º, sin acción. `leads` en 0.
  `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`: cola vacía,
  sin orden de Telegram este ciclo.
- Sin commits de código ni escrituras en Supabase este ciclo (solo bitácora
  y memoria) — los dos pares nuevos no requieren acción porque ya estaban
  despublicados.
- Ver `kimiko/bitacora/2026-09-06-0826.md`.

### Cierre 2026-09-06 (ciclo 15:08 UTC, 213º, MODO CICLO)
- Build/lint limpios (36/36 páginas). `npm audit` sin cambio (9, desde el
  185º). 8/8 rutas del checklist en 200, `/admin` → `/login` con la cadena
  completa, `middleware.ts` en la raíz, canonical/`og:url`/`og:image`/sitemap
  (37 `<loc>`, sin cambio)/robots correctos. Vercel: últimos 5 despliegues
  `READY`.
- Segunda pasada del check permanente del 211º/212º (cruce de hash de
  `ficha_cientifica` sobre las 52 filas, no solo publicadas): mismos grupos
  de duplicado exacto que el 212º, sin grupos nuevos. Las 9 peligrosas
  siguen `publicada=false` compartiendo el placeholder. Los 5 pares
  conocidos (`ashwagandha-fruto`/`sauco`, `cinamomo`/`valeriana`,
  `ginseng`/`muerdago`, `loto`/`tulsi`, `manzanilla`/`nigela`) y
  `echinacea`/`equinacea` siguen igual que en el 212º. **Nota técnica para
  quien repita este check: `ficha_cientifica` es una columna JSON, no texto
  — hay que comparar con `JSON.stringify(valor)` antes de hashear, o
  `.trim()` revienta con `TypeError`.** `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Sin `UPDATE` de Kristian
  sobre `plants` desde el 212º.
- SEO: 22 publicados sin títulos duplicados, todos con `excerpt` (usa esa
  columna como meta description vía `generateMetadata`, la tabla
  `blog_posts` no tiene columna `meta_description` propia) ≤155 car. y
  `image_url`. 3 enlaces internos a `/diccionario/` en el contenido
  publicado, los 3 a `hinojo`, sin enlaces rotos.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Backlog ya calificado como no aprovechable por el cruce en bloque del
  209º, sin candidatos nuevos.
- `citas`: última inserción ~35h39min antes del cierre, dentro del rango de
  huecos habituales (24-40h) del 211º, sin acción. `leads` en 0, `purchases`
  en 0, `products` sin cambio (2). `kimiko_drafts`: cola vacía, sin orden de
  Telegram este ciclo.
- Sin commits de código ni escrituras en Supabase este ciclo (solo bitácora
  y memoria) — segundo ciclo consecutivo sin hallazgos técnicos nuevos.
- Ver `kimiko/bitacora/2026-09-06-1508.md`.

### Cierre 2026-09-06 (ciclo 18:05 UTC, 214º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  (sin flags): 9 vulnerabilidades (1 moderate, 8 high) sin cambio desde el
  185º. 8/8 rutas del checklist en 200, `/admin` → `/login` con la cadena
  completa (307), `middleware.ts` en la raíz, canonical/`og:url`/`og:image`
  correctos, sitemap (37 `<loc>`, sin cambio)/robots correctos. Vercel:
  últimos 5 despliegues `READY`.
- Tercera pasada del check permanente del 211º/212º (cruce de hash de
  `ficha_cientifica`, `json.dumps(sort_keys=True)` sobre las 52 filas):
  exactamente los mismos 7 grupos que el 212º y 213º, sin grupos nuevos. Las
  9 peligrosas siguen `publicada=false` compartiendo placeholder. `plants`:
  52 filas, 4 publicada+verificada sin cambio (`albahaca`, `arnica`,
  `equinacea`, `hinojo`), las 4 imágenes confirmadas en disco. Sin `UPDATE`
  de Kristian sobre `plants` desde el 212º.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio,
  sin duplicados de título en publicados. Backlog sigue sin candidatos
  aprovechables desde el cruce en bloque del 209º.
- `citas`: última inserción 38h39min antes del cierre — dentro del rango de
  huecos habituales (24-40h, confirmado en el 211º) pero en el extremo alto;
  sin abrir vigilancia nueva, a revisar si el próximo ciclo supera 40h.
  `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola vacía (4 filas, todas `hecho`), sin orden de Telegram este ciclo.
- Sin commits de código ni escrituras en Supabase este ciclo — tercer ciclo
  consecutivo (212º-214º) sin hallazgos técnicos nuevos.
- Ver `kimiko/bitacora/2026-09-06-1805.md`.

### Cierre 2026-09-06 (ciclo 22:03 UTC, 215º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  (sin flags): 9 vulnerabilidades (1 moderate, 8 high) sin cambio desde el
  185º. 8/8 rutas del checklist en 200 tras seguir redirects (308 de
  trailing-slash/locale antes del 200 final, esperado), `/admin` → `/login`
  con la cadena completa, `middleware.ts` en la raíz, canonical/`og:url`/
  `og:image`/sitemap (37 `<loc>`, sin cambio)/robots correctos. Vercel:
  últimos 5 despliegues (`quantum-holistic-2` y `kimiko`) `READY`.
- Cuarta pasada del check permanente del 211º/212º (cruce de hash de
  `ficha_cientifica`, `json.dumps(sort_keys=True)`, sobre las 52 filas):
  exactamente los mismos 7 grupos que el 212º-214º, sin grupos nuevos.
  `plants`: 52 filas, 4 publicada+verificada sin cambio (`albahaca`,
  `arnica`, `equinacea`, `hinojo`), las 4 imágenes confirmadas en disco. Las
  9 peligrosas confirmadas `publicada=false`. Sin `UPDATE` de Kristian sobre
  `plants` desde el 212º.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  22 publicados sin duplicados de título, todos ≤60 car., `excerpt` ≤155
  car., todos con `image_url`, 3 enlaces internos a `/diccionario/hinojo`
  sin enlaces rotos. Backlog sigue sin candidatos aprovechables desde el
  cruce en bloque del 209º.

### Aprendizaje (cicatriz → check permanente)
- **El umbral de 40h para `citas` que el 214º dejó "a vigilar" se ha
  superado por primera vez: 42h33min sin inserción nueva al cierre de este
  ciclo, frente a un máximo histórico de 38.0h entre las 33 filas más
  recientes.** No hay ninguna corrección de código o dato posible — es una
  señal de negocio (caída real en el ritmo de reservas o estacionalidad de
  fin de semana), no un bug. **Check permanente: cuando un ciclo anota "a
  vigilar si se supera X horas" sobre una tabla de negocio, el ciclo
  siguiente que lo compruebe debe recalcular el máximo histórico real (no
  solo comparar contra el umbral anotado) antes de decidir si escala a
  tarea manual de Kristian — el umbral del ciclo anterior puede quedarse
  corto si el hueco sigue creciendo.** Anotado como tarea manual de
  Kristian en vez de intervenir sobre el funnel (bloqueado por instrucción
  permanente del Paso 5).
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  4 filas totales, todas `hecho`, cola vacía, sin orden de Telegram este
  ciclo.
- Sin commits de código ni escrituras en Supabase este ciclo — cuarto ciclo
  consecutivo (212º-215º) sin hallazgos técnicos nuevos en el checklist
  mecánico; el hallazgo de este ciclo es de negocio (`citas`), no técnico.
- Ver `kimiko/bitacora/2026-09-06-2203.md`.

### Cierre 2026-09-07 (ciclo 03:27 UTC, 216º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  (sin flags): 9 vulnerabilidades (1 moderate, 8 high) sin cambio desde el
  185º. 8/8 rutas del checklist en 200, `/admin` → `/login` con la cadena
  completa, `middleware.ts` en la raíz, canonical/`og:url`/`og:image`/sitemap
  (37 `<loc>`, sin cambio)/robots correctos. Vercel: últimos 5 despliegues
  `READY`.
- Quinta pasada del check permanente del 211º/212º (cruce de hash de
  `ficha_cientifica`, `json.dumps(sort_keys=True)`, sobre las 52 filas):
  exactamente los mismos 7 grupos que el 212º-215º, sin grupos nuevos.
  `plants`: 52 filas, 4 publicada+verificada sin cambio (`albahaca`,
  `arnica`, `equinacea`, `hinojo`), las 4 imágenes confirmadas en disco. Las
  9 peligrosas confirmadas `publicada=false`. `echinacea`/`equinacea` sigue
  sin duplicado real en vivo (404 vs 200). Sin `UPDATE` de Kristian sobre
  `plants` desde el 212º.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  22 publicados sin duplicados de título, todos ≤60 car., `excerpt` ≤155
  car., todos con `image_url`, 3 enlaces internos a `/diccionario/hinojo`
  sin enlaces rotos. Backlog sigue sin candidatos aprovechables desde el
  cruce en bloque del 209º.

### Aprendizaje (cicatriz → check permanente)
- **El hueco anómalo de `citas` que el 215º marcó en 42h33min (superando por
  primera vez el máximo histórico de 38.0h) no se ha cerrado: es la misma
  fila de última inserción (2026-09-05T03:28:37 UTC) y el hueco ha seguido
  creciendo hasta 47h58min en este ciclo, casi 6h más que hace ~5h20min.**
  Aplicando el check permanente del 215º (recalcular el máximo histórico
  real en vez de comparar solo contra el umbral anotado), confirmo que
  sigue sin haber techo natural: dos ciclos consecutivos batiendo récord
  sobre la misma sequía, no una fila nueva con un hueco distinto. **Check
  permanente ampliado: cuando el mismo hueco anómalo persiste sin fila
  nueva de un ciclo a otro (no solo "se ha vuelto a superar el umbral"),
  el ciclo debe decirlo explícitamente en la bitácora y subir la prioridad
  de la tarea manual de Kristian — una racha que se alarga ciclo tras
  ciclo es una señal más fuerte que un hueco puntual, aunque el límite del
  Paso 5 siga siendo el mismo (documentar, no tocar el funnel).**
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  4 filas totales, todas `hecho`, cola vacía, sin orden de Telegram este
  ciclo.
- Sin commits de código ni escrituras en Supabase este ciclo — quinto ciclo
  consecutivo (212º-216º) sin hallazgos técnicos nuevos en el checklist
  mecánico; el hallazgo de este ciclo es de negocio (`citas`, agravado),
  no técnico.
- Ver `kimiko/bitacora/2026-09-07-0327.md`.

### Cierre 2026-09-07 (ciclo 09:04 UTC, 217º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  (sin flags): 9 vulnerabilidades (1 moderate, 8 high) sin cambio desde el
  185º. 8/8 rutas del checklist en 200, `/admin` → `/login` con la cadena
  completa, `middleware.ts` en la raíz, canonical/`og:url`/`og:image`/sitemap
  (37 `<loc>`, sin cambio)/robots correctos. Vercel: últimos 5 despliegues
  `READY`.
- Sexta pasada del check permanente del 211º/212º (cruce de hash de
  `ficha_cientifica`, `json.dumps(sort_keys=True)`, sobre las 52 filas):
  exactamente los mismos 7 grupos que el 212º-216º, sin grupos nuevos.
  `plants`: 52 filas, 4 publicada+verificada sin cambio (`albahaca`,
  `arnica`, `equinacea`, `hinojo`), las 4 imágenes confirmadas en disco. Las
  9 peligrosas confirmadas `publicada=false`. `echinacea`/`equinacea` sigue
  sin duplicado real en vivo (404 vs 200). Sin `UPDATE` de Kristian sobre
  `plants` desde el 212º.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  22 publicados sin duplicados de título, todos ≤60 car., `excerpt` ≤155
  car., todos con `image_url`, 3 enlaces internos a `/diccionario/hinojo`
  sin enlaces rotos. Backlog sigue sin candidatos aprovechables desde el
  cruce en bloque del 209º.

### Aprendizaje (cicatriz → check permanente)
- **El hueco de `citas` sigue sin cerrarse por tercer ciclo consecutivo:
  misma fila de última inserción (2026-09-05T03:28:37 UTC), hueco ahora en
  53h36min frente a 47h58min (216º) y 42h33min (215º) — el incremento entre
  ciclos crece (+5h25min → +5h38min) en vez de estabilizarse, señal de que
  la sequía no está tocando techo por sí sola.** Aplicando el check
  permanente del 216º (decir explícitamente cuando el mismo hueco persiste
  ciclo tras ciclo y subir prioridad), esta es la tercera escalada seguida
  sobre la misma fila: se sube la prioridad de la tarea manual de Kristian
  a la primera del listado del cierre. **Check permanente ampliado: cuando
  una misma alerta de negocio lleva 3+ ciclos seguidos sin resolverse y el
  ritmo de deterioro no se frena (el incremento entre ciclos no baja), la
  bitácora debe decirlo en esos términos exactos (comparando el delta entre
  ciclos, no solo el valor absoluto) — un delta que crece es una urgencia
  distinta de un delta que se mantiene o decrece, aunque el límite del
  Paso 5 siga siendo el mismo (documentar, no tocar el funnel).**
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  4 filas totales, todas `hecho`, cola vacía, sin orden de Telegram este
  ciclo.
- Sin commits de código ni escrituras en Supabase este ciclo — sexto ciclo
  consecutivo (212º-217º) sin hallazgos técnicos nuevos en el checklist
  mecánico; el hallazgo de este ciclo sigue siendo de negocio (`citas`,
  agravado por tercera vez seguida), no técnico.
- Ver `kimiko/bitacora/2026-09-07-0904.md`.

### Cierre 2026-09-07 (ciclo 17:26 UTC, 218º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  (sin flags): 9 vulnerabilidades (1 moderate, 8 high) sin cambio desde el
  185º. 8/8 rutas del checklist en 200, `/admin` → `/login` con la cadena
  completa (307), `middleware.ts` en la raíz, canonical/`og:url`/`og:image`/
  sitemap (37 `<loc>`, sin cambio)/robots correctos. Vercel: últimos 5
  despliegues `READY`.
- Séptima pasada del check permanente del 211º/212º (cruce de hash de
  `ficha_cientifica`, `json.dumps(sort_keys=True)`, sobre las 52 filas):
  exactamente los mismos 7 grupos que el 212º-217º, sin grupos nuevos.
  `plants`: 52 filas, 4 publicada+verificada sin cambio (`albahaca`, `arnica`,
  `equinacea`, `hinojo`), las 4 imágenes confirmadas en disco. Las 9
  peligrosas confirmadas `publicada=false`. `echinacea`/`equinacea` sigue sin
  duplicado real en vivo (404 vs 200). Sin `UPDATE` de Kristian sobre `plants`
  desde el 212º.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio. 22
  publicados sin duplicados de título, todos ≤60 car., `excerpt` ≤155 car.,
  todos con `image_url`. Backlog sigue sin candidatos aprovechables desde el
  cruce en bloque del 209º.

### Aprendizaje (cicatriz → check permanente)
- **El hueco de `citas` lleva ya cuatro ciclos seguidos (215º-218º) sin
  cerrarse sobre la misma fila (última inserción 2026-09-05T03:28:37 UTC), y
  el delta entre ciclos se ha disparado en vez de estabilizarse: +5h25min
  (215→216), +5h38min (216→217), +8h24min (217→218) — hueco total 62h00min.**
  El delta no solo no baja, creció más del 40% respecto al anterior: la
  sequía se está acelerando, no solo alargando. Aplicando el check permanente
  del 217º (bajar a los términos exactos del delta entre ciclos), esta
  aceleración es una señal más fuerte que una racha lineal. **Check permanente
  ampliado: cuando el delta entre ciclos de una alerta de negocio persistente
  no solo se mantenga sino que crezca respecto al delta anterior, la bitácora
  debe marcarlo como aceleración explícita y mantener la tarea manual de
  Kristian en el primer puesto del listado — una racha que acelera pesa más
  que una que solo se alarga, aunque el límite del Paso 5 (documentar, no
  tocar el funnel) siga siendo el mismo.**
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  4 filas totales, todas `hecho`, cola vacía, sin orden de Telegram este
  ciclo.
- Sin commits de código ni escrituras en Supabase este ciclo — séptimo ciclo
  consecutivo (212º-218º) sin hallazgos técnicos nuevos en el checklist
  mecánico; el hallazgo de este ciclo sigue siendo de negocio (`citas`, ahora
  acelerando), no técnico.
- Ver `kimiko/bitacora/2026-09-07-1726.md`.

### Cierre 2026-09-07 (ciclo 22:39 UTC, 219º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  (sin flags): 9 vulnerabilidades (1 moderate, 8 high) sin cambio desde el
  185º. 8/8 rutas del checklist en 200 (con `-L`; `trailingSlash: true` en
  `next.config.js` hace que la petición sin `-L` devuelva 308 antes del 200 —
  no es una regresión, es el comportamiento esperado del config, y queda
  anotado por si un ciclo futuro lo confunde con un fallo real).
  `/admin` → `/login/?redirect=%2Fadmin%2F` (200) con la cadena completa,
  `middleware.ts` en la raíz, canonical/`og:url`/`og:image`/sitemap (37
  `<loc>`, sin cambio)/robots correctos. Vercel: últimos 5 despliegues
  `READY`.
- Octava pasada del check permanente del 211º/212º (cruce de hash de
  `ficha_cientifica`, `json.dumps(sort_keys=True)`, sobre las 52 filas):
  exactamente los mismos 7 grupos que el 212º-218º, sin grupos nuevos.
  `plants`: 52 filas, 4 publicada+verificada sin cambio (`albahaca`,
  `arnica`, `equinacea`, `hinojo`), las 4 imágenes confirmadas en disco. Las
  9 peligrosas confirmadas `publicada=false`. `echinacea`/`equinacea` sigue
  sin duplicado real en vivo (404 vs 200). Sin `UPDATE` de Kristian sobre
  `plants` desde el 212º.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio. 22
  publicados sin duplicados de título, todos ≤60 car., `excerpt` ≤155 car.,
  todos con `image_url`. Draft más reciente actualizado en 2026-07-10, previo
  al cruce en bloque del 209º: backlog sigue sin candidatos nuevos.

### Corrección de método (no cicatriz nueva — se retracta un check permanente previo)
- **Los check permanentes ampliados de los cierres 217º y 218º ("delta entre
  ciclos que crece = aceleración de la sequía de `citas`") estaban mal
  planteados y quedan derogados.** El hueco de `citas` es
  `ahora − última_inserción`, con la última inserción fija desde
  2026-09-05T03:28:37 UTC. Si no entra fila nueva, el delta entre dos
  cierres consecutivos es aritméticamente casi igual al tiempo real
  transcurrido entre esos cierres — es decir, mide la cadencia con la que
  se ejecuta Kimiko (que varía porque el disparo es `schedule`, no un
  cronómetro fijo), no la velocidad de la sequía del negocio. Verificado
  con las horas de los propios cierres: 216º→217º (5h37min) ≈ delta
  reportado (+5h38min); 217º→218º (8h22min) ≈ delta reportado (+8h24min,
  el que se leyó como "aceleración" pero era solo un hueco más largo entre
  ejecuciones); 218º→219º (5h13min) ≈ nuevo delta (+5h10min), que bajó, lo
  que de haberse mantenido la lógica anterior se habría leído como
  "desaceleración" — ambas lecturas son ruido del calendario de ejecución,
  no señal de negocio. **Check permanente corregido: para alertas del tipo
  `ahora − última_fila_fija`, no narrar ni interpretar el delta entre
  cierres como tendencia. Reportar solo el hueco absoluto (y, si se quiere
  cadencia, días naturales sin fila nueva) — nunca comparar deltas entre
  ciclos consecutivos como si fueran una velocidad del negocio, porque esa
  comparación está contaminada por el propio horario de Kimiko.** El hueco
  real y verificado: **67h10min (más de 2 días y 19h)** sin una reserva
  nueva en `citas`, quinto ciclo consecutivo (215º-219º) sobre la misma
  fila — esto solo, sin narrativa de aceleración, ya es motivo suficiente
  para mantener la tarea manual de Kristian en primer puesto.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  4 filas totales, todas `hecho`, cola vacía, sin orden de Telegram este
  ciclo.
- Sin commits de código ni escrituras en Supabase este ciclo — octavo ciclo
  consecutivo (212º-219º) sin hallazgos técnicos nuevos en el checklist
  mecánico; el hallazgo de este ciclo es de negocio (`citas`) más la
  corrección de método de arriba.
- Ver `kimiko/bitacora/2026-09-07-2239.md`.

### Cierre 2026-09-08 (ciclo 03:33 UTC, 220º, MODO CICLO)
- Build/lint limpios (36/36 páginas). `npm audit`: 9 vulnerabilidades (1
  moderate, 8 high) sin cambio desde el 185º. 8/8 rutas del checklist en
  200 (con `-L`), `/admin` → `/admin/` (308) → `/login/?redirect=%2Fadmin%2F`
  (200), `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37 `<loc>`,
  sin cambio)/robots correctos. Vercel: últimos 5 despliegues `READY`.
- Novena pasada del check permanente del 211º/212º (cruce de hash de
  `ficha_cientifica` sobre las 52 filas): exactamente los mismos 7 grupos
  que el 212º-219º, sin grupos nuevos. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `echinacea`/`equinacea` sigue sin
  duplicado real en vivo (404 vs 200). Sin `UPDATE` de Kristian sobre
  `plants` desde el 212º.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  22 publicados sin duplicados de título, todos ≤60 car., `excerpt` ≤155
  car., todos con `image_url`. Draft más reciente sigue en 2026-07-10:
  backlog sin candidatos nuevos.
- `citas`: última inserción sigue en la misma fila (2026-09-05T03:28:37
  UTC), hueco en **72h04min** — sexto ciclo consecutivo (215º-220º) sobre
  la misma sequía. Aplicando el check permanente corregido en el 219º
  (no narrar el delta entre cierres como tendencia, solo reportar el hueco
  absoluto), se mantiene como tarea manual de Kristian en primer puesto sin
  añadir interpretación de aceleración/desaceleración.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  4 filas totales, todas `hecho`, cola vacía, sin orden de Telegram este
  ciclo.
- Sin commits de código ni escrituras en Supabase este ciclo — noveno ciclo
  consecutivo (212º-220º) sin hallazgos técnicos nuevos en el checklist
  mecánico; el hallazgo de este ciclo sigue siendo de negocio (`citas`).
- Ver `kimiko/bitacora/2026-09-08-0333.md`.

### Cierre 2026-09-08 (ciclo 08:46 UTC, 221º, MODO CICLO) — regresión real: `citas` llevaba 6 ciclos (72h+) sin la cita diaria por la misma confusión del 201º

### Aprendizaje (cicatriz → check permanente reforzado)
- **La confusión "`citas` = funnel de reservas" que ya se había corregido en
  el 201º volvió a colarse desde el 215º y llegó hasta el 220º sin que ningún
  ciclo intermedio comprobara qué contiene realmente la tabla.** Los cierres
  215º-220º trataron el hueco creciente (42h→72h04min) como "señal de
  negocio... sin tocar el funnel (bloqueado por instrucción permanente del
  Paso 5)", exactamente el mismo error que el 201º ya había documentado como
  check permanente. Consulté `plants`/`citas`/`blog_posts` vía REST y
  releí la fila real de `citas`: columnas `texto`/`autor`/`fuente`/
  `fecha_publicacion`, sin ninguna relación con terapeutas ni con el checkout
  — es la tabla de citas célebres que Kimiko puebla sola desde el 38º ciclo
  (31-jul). Confirmado además por grep: no hay ninguna referencia a `citas`
  en `app/`, `lib/` ni `components/` — ninguna tabla de reservas de este
  nombre existe en el proyecto (listado completo de tablas del schema vía
  PostgREST, 24 tablas, `citas` es la única con ese nombre).
- **Causa raíz probable: `KIMIKO_MEMORIA.md` ya pasaba de 800 KB / 9700
  líneas antes de este ciclo, es puramente cronológico y no tiene índice** —
  un ciclo que solo lee la cola reciente (como hice yo al arrancar, antes de
  hacer `grep` a fondo) ve la corrección de método del 219º sobre "no narrar
  el delta como tendencia" y dentro de ese contexto da por buena la premisa
  de fondo ("es una señal de negocio") sin volver a verificarla, porque esa
  premisa lleva 6 cierres repitiéndose sin contradicción visible en la parte
  del archivo que sí se lee. **Corrección aplicada: añadida una sección
  "Checks críticos" al principio del archivo (antes de la primera entrada
  cronológica) con las reglas que ya han causado una desviación de
  comportamiento más de una vez, para que sobrevivan aunque un ciclo futuro
  solo lea el principio y la cola.** Este mecanismo es nuevo — un ciclo
  futuro debería revisar si de verdad ayuda o si hace falta algo más
  (ej. un fichero aparte más corto) y anotarlo.
- Corregido: cita nueva insertada — Miguel de Cervantes, *Don Quijote de la
  Mancha*, Segunda Parte, cap. 43 (1615): "Come poco y cena menos, que la
  salud de todo el cuerpo se fragua en la oficina del estómago." Verificada
  con `WebSearch` (texto coincidente en varias fuentes independientes de
  citas), autor nuevo (no estaba entre los 33 anteriores), pasa el filtro
  anti-pseudociencia (moderación dietética general, sin claim de curación).
  34 citas en la tabla tras la inserción.

### Cierre 2026-09-08 (ciclo 08:46 UTC, 221º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  (sin flags): 9 vulnerabilidades (1 moderate, 8 high) sin cambio desde el
  185º. 8/8 rutas del checklist en 200 (con `-L`), `/admin` → `/admin/`
  (308) → `/login/?redirect=%2Fadmin%2F` (200), `middleware.ts` en la raíz,
  canonical/`og:url`/sitemap (37 `<loc>`, sin cambio)/robots correctos.
  Vercel: últimos 5 despliegues `READY`.
- `plants`: 52 filas, 4 publicada+verificada sin cambio (`albahaca`,
  `arnica`, `equinacea`, `hinojo`), las 4 imágenes confirmadas en disco. Las
  9 peligrosas confirmadas `publicada=false`.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio. 22
  publicados sin duplicados de título, todos ≤60 car., `excerpt` ≤155 car.,
  todos con `image_url`. Solo 3/22 enlazan a `/diccionario` (sin cambio
  respecto a ciclos anteriores — backlog conocido, no hay fichas nuevas
  publicada+verificada para enlazar).
- `citas`: corregida la regresión de arriba, cita nueva insertada. `leads`
  en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`: 4 filas
  totales, todas `hecho`, cola vacía, sin orden de Telegram este ciclo.
- Escritura en Supabase este ciclo: 1 fila nueva en `citas` (Cervantes). Sin
  commits de código.
- Ver `kimiko/bitacora/2026-09-08-0846.md`.

### Cierre 2026-09-08 (ciclo 16:14 UTC, 222º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  (sin flags): 9 vulnerabilidades (1 moderate, 8 high) sin cambio desde el
  185º. 8/8 rutas del checklist en 200 (con `-L`), `/admin` → `/admin/`
  (308) → `/login/?redirect=%2Fadmin%2F` (200), `middleware.ts` en la raíz,
  canonical/`og:url`/sitemap (37 `<loc>`, sin cambio)/robots correctos.
  Vercel: últimos 5 despliegues `READY`.
- Décima pasada del check permanente del 211º/212º (cruce de hash de
  `ficha_cientifica` sobre las 52 filas): exactamente los mismos 7 grupos
  que el 212º-221º, sin grupos nuevos. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `updated_at` máximo sin cambio (2026-09-01)
  → sin auditoría visual completa este ciclo. `echinacea`/`equinacea` sigue
  sin duplicado real en vivo (404 vs 200).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio. 22
  publicados sin duplicados de título, todos ≤60 car., `excerpt` ≤155 car.,
  todos con `image_url`, 3/22 enlazan a `/diccionario` (sin cambio). Draft
  más reciente sigue en 2026-07-10 — confirmado que sigue siendo el mismo
  candidato ya descartado en los ciclos 206º-209º (título/excerpt fuera de
  límite + canibalización con "Herboristería Europea de Proximidad"), no
  hace falta reabrir esa investigación.
- `citas`: última fila sigue siendo la de Cervantes del 221º, hueco de
  **7h28min** — dentro del umbral normal, sin necesidad de insertar esta
  vez. Regresión del 221º confirmada estable.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  4 filas totales, todas `hecho`, cola vacía, sin orden de Telegram este
  ciclo.
- Sin commits de código ni escrituras en Supabase este ciclo — décimo ciclo
  consecutivo (212º-222º) sin hallazgos técnicos nuevos en el checklist
  mecánico, y sin hallazgos de negocio nuevos (la corrección de `citas` del
  221º se mantiene estable).
- Ver `kimiko/bitacora/2026-09-08-1614.md`.

### Cierre 2026-09-09 (ciclo 03:38 UTC, 223º, MODO CICLO) — `npm audit` escala a 1 crítica tras 38 ciclos estable

### Hallazgo (no cicatriz de comportamiento — diagnóstico nuevo, sin acción de código)
- `npm audit` cambió de "1 moderate, 8 high" (estable desde el 185º) a **1
  moderate, 7 high, 1 critical** (mismo total, 9). La crítica es el bloque
  de advisories de `next` sobre la versión pinneada `14.2.35` (RCE en
  Image Optimization API con AVIF, RCE en hosts Windows, entre ~23 GHSA
  acumulados). Confirmado que no hay parche no-breaking: `14.2.35` es la
  última release de la rama `14.2.x` (`npm view next versions`); el único
  fix es `next@16.3.4` (`isSemVerMajor: true`), que además se salta la
  v15 entera y arrastra un bump breaking de `next-intl` (3.x→4.x).
  Exposición real revisada contra la config del proyecto antes de decidir
  no tocar nada en caliente: `images.unoptimized: true` en
  `next.config.js` desactiva el Image Optimizer (las CVEs de AVIF/DoS de
  caché no aplican), sin Server Actions (`grep "'use server'"` sobre
  `app/` sin resultados), sin `rewrites()`, sin CSP nonces, hosting en
  Vercel no Windows — reduce el riesgo real de gran parte del bloque,
  pero no lo cierra del todo. Ver detalle completo (regla anotada como
  check crítico al principio del archivo) y exposición revisada en
  `kimiko/bitacora/2026-09-09-0338.md`.
- **Decisión tomada:** no ejecutar la subida mayor de Next.js de oficio —
  blast radius alto (build, App Router, middleware, `next-intl` v4,
  checkout/leads, todo por probar) para un riesgo real hoy mitigado por
  config. Queda como tarea manual prioritaria de Kristian, con oferta de
  hacerlo en rama/PR separada si autoriza.

### Cierre 2026-09-09 (ciclo 03:38 UTC, 223º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). 8/8 rutas
  del checklist en 200 (con `-L`), `/admin` → `/admin/` (308) →
  `/login/?redirect=%2Fadmin%2F` (200), `middleware.ts` en la raíz,
  canonical/`og:url`/sitemap (37 `<loc>`, sin cambio)/robots correctos.
  Vercel: últimos 5 despliegues `READY`.
- Undécima pasada del check permanente del 211º/212º (cruce de hash de
  `ficha_cientifica` sobre las 52 filas): exactamente los mismos 7 grupos
  que el 212º-222º, sin grupos nuevos. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `updated_at` máximo sin cambio
  (2026-09-01) → sin auditoría visual completa este ciclo.
  `echinacea`/`equinacea` sigue sin duplicado real en vivo (404 vs 200).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio. 22
  publicados sin duplicados de título, todos ≤60 car., `excerpt` ≤155 car.,
  todos con `image_url`, 3/22 enlazan a `/diccionario` (sin cambio). Draft
  más reciente sigue en 2026-07-10, ya descartado en 206º-209º.
- `citas`: última fila sigue siendo la de Cervantes del 221º, hueco de
  **18h52min** — dentro del umbral normal, sin necesidad de insertar.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo.
- Sin commits de código ni escrituras en Supabase este ciclo — el único
  hallazgo (`npm audit` crítico) es diagnóstico, ver arriba.
- Ver `kimiko/bitacora/2026-09-09-0338.md`.

### Cierre 2026-09-09 (ciclo 08:49 UTC, 224º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9),
  confirmado de nuevo que no hay fix no-breaking. 8/8 rutas del checklist en
  200 (con `-L`), `/admin` → `/admin/` (308) → `/login/?redirect=%2Fadmin%2F`
  (200), `middleware.ts` en la raíz, canonical/`og:url`/`og:image`/sitemap
  (37 `<loc>`, sin cambio)/robots correctos. Vercel: últimos 5 despliegues
  `READY`.
- Duodécima pasada del check permanente del 211º/212º (cruce de hash de
  `ficha_cientifica` sobre las 52 filas): exactamente los mismos 7 grupos
  que el 212º-223º, sin grupos nuevos. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `updated_at` máximo sin cambio
  (2026-09-01) → sin auditoría visual completa este ciclo.
  `echinacea`/`equinacea` sigue sin duplicado real en vivo (404 vs 200).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio. 22
  publicados sin duplicados de título, todos ≤60 car., `excerpt` ≤155 car.,
  todos con `image_url`, 3/22 enlazan a `/diccionario` (sin cambio). Draft
  más reciente sigue en 2026-07-10, ya descartado en 206º-209º.
- `citas`: hueco de **24h02min** desde la fila de Cervantes (221º) — justo
  en el umbral de ~24h, se insertó cita nueva: Proverbios 14:30
  (Reina-Valera), *"El corazón apacible es vida de la carne; mas la envidia
  es carcoma de los huesos."* Verificada con `WebSearch` contra varias
  fuentes independientes (texto RV1960 exacto), autor no repetido (cuarto
  verso distinto de Proverbios en la tabla, mismo patrón que ciclos
  anteriores), sin claim de curación. Dos candidatos previos descartados por
  no alcanzar el estándar de certeza: una cita de Pasteur sin fuente
  primaria verificable, y un fragmento de Aristóteles (Ética a Nicómaco)
  que es un concepto extenso, no una frase corta citable con precisión. 35
  filas en `citas` tras la inserción.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo.
- Escritura en Supabase este ciclo: 1 fila nueva en `citas` (Proverbios
  14:30). Sin commits de código de negocio.
- Ver `kimiko/bitacora/2026-09-09-0849.md`.

### Cierre 2026-09-09 (ciclo 16:07 UTC, 225º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200 (con `-L`), `/admin`
  → `/admin/` (308) → `/login/?redirect=%2Fadmin%2F` (307→200),
  `middleware.ts` en la raíz, canonical/`og:url`/`og:image`/sitemap (37
  `<loc>`, sin cambio)/robots correctos. Vercel: últimos 5 despliegues
  `READY`.
- Decimotercera pasada del check permanente del 211º/212º (cruce de hash de
  `ficha_cientifica` sobre las 52 filas): exactamente los mismos 7 grupos
  que el 212º-224º, sin grupos nuevos. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `updated_at` máximo sin cambio
  (2026-09-01) → sin auditoría visual completa este ciclo.
  `echinacea`/`equinacea` sigue sin duplicado real en vivo (404 vs 200).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio. 22
  publicados sin duplicados de título, todos ≤60 car., `excerpt` ≤155 car.,
  todos con `image_url`, 3/22 enlazan a `/diccionario` (sin cambio). Draft
  más reciente sigue en 2026-07-10, ya descartado en 206º-209º.
- `citas`: última fila sigue siendo la de Proverbios 14:30 (224º), hueco de
  **7h18min** — muy por debajo del umbral de ~24h, sin necesidad de
  insertar.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo (comprobado primero, antes del resto del checklist, por si
  había algo pendiente pese al disparo `schedule`).
- Sin commits de código ni escrituras en Supabase este ciclo — decimotercer
  ciclo consecutivo (212º-225º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-09-1607.md`.

### Cierre 2026-09-09 (ciclo 22:22 UTC, 226º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200 (con `-L`), `/admin`
  → `/admin/` (308) → `/login/?redirect=%2Fadmin%2F` (307→200),
  `middleware.ts` en la raíz, canonical/`og:url`/`og:image`/sitemap (37
  `<loc>`, sin cambio)/robots correctos. Vercel: últimos 5 despliegues
  `READY`.
- Decimocuarta pasada del check permanente del 211º/212º (cruce de hash de
  `ficha_cientifica` sobre las 52 filas): exactamente los mismos 7 grupos
  que el 212º-225º, sin grupos nuevos. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `updated_at` máximo sin cambio
  (2026-09-01) → sin auditoría visual completa este ciclo.
  `echinacea`/`equinacea` sigue sin duplicado real en vivo (404 vs 200).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio. 22
  publicados sin duplicados de título, todos ≤60 car., `excerpt` ≤155 car.,
  todos con `image_url`, 3/22 enlazan a `/diccionario` (sin cambio). Draft
  más reciente sigue en 2026-07-10, ya descartado en 206º-209º.
- `citas`: última fila sigue siendo la de Proverbios 14:30 (224º), hueco de
  **13h33min** — muy por debajo del umbral de ~24h, sin necesidad de
  insertar.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo (comprobado primero, antes del resto del checklist, por si
  había algo pendiente pese al disparo `schedule`).
- Sin commits de código ni escrituras en Supabase este ciclo — decimocuarto
  ciclo consecutivo (212º-226º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-09-2222.md`.

### Cierre 2026-09-10 (ciclo 03:36 UTC, 227º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200 (con `-L`), `/admin`
  → `/admin/` (308) → `/login/?redirect=%2Fadmin%2F` (307→200),
  `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37 `<loc>`, sin
  cambio)/robots correctos. Vercel: últimos 5 despliegues `READY`.
- Decimoquinta pasada del check permanente del 211º/212º (cruce de hash de
  `ficha_cientifica` sobre las 52 filas): exactamente los mismos 7 grupos
  que el 212º-226º, sin grupos nuevos. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `updated_at` máximo sin cambio
  (2026-09-01) → sin auditoría visual completa este ciclo.
  `echinacea`/`equinacea` sigue sin duplicado real en vivo (404 vs 200).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio. 22
  publicados sin duplicados de título, todos ≤60 car., `excerpt` ≤155 car.,
  todos con `image_url`, 3/22 enlazan a `/diccionario` (sin cambio). Draft
  más reciente sigue en 2026-07-10, ya descartado en 206º-209º.
- `citas`: última fila sigue siendo la de Proverbios 14:30 (224º), hueco de
  **~18h46min** — muy por debajo del umbral de ~24h, sin necesidad de
  insertar.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo (comprobado primero, antes del resto del checklist, por si
  había algo pendiente pese al disparo `schedule`).
- Sin commits de código ni escrituras en Supabase este ciclo — decimoquinto
  ciclo consecutivo (212º-227º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-10-0336.md`.

### Cierre 2026-09-10 (ciclo 08:45 UTC, 228º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200 (con `-L`), `/admin`
  → `/admin/` (308) → `/login/?redirect=%2Fadmin%2F` (307→200),
  `middleware.ts` en la raíz, canonical/`og:url`/`og:image`/sitemap (37
  `<loc>`, sin cambio)/robots correctos. Vercel: últimos 5 despliegues
  `READY`.
- Decimosexta pasada del check permanente del 211º/212º (cruce de hash de
  `ficha_cientifica` sobre las 52 filas): exactamente los mismos 7 grupos
  que el 212º-227º, sin grupos nuevos. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `updated_at` máximo sin cambio
  (2026-09-01) → sin auditoría visual completa este ciclo.
  `echinacea`/`equinacea` sigue sin duplicado real en vivo (404 vs 200).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio. 22
  publicados sin duplicados de título, todos ≤60 car., `excerpt` ≤155 car.,
  todos con `image_url`, 3/22 enlazan a `/diccionario` (sin cambio). Draft
  más reciente sigue en 2026-07-10, ya descartado en 206º-209º.
- `citas`: última fila sigue siendo la de Proverbios 14:30 (224º), hueco de
  **23h56min** — justo por debajo del umbral de ~24h usado hasta ahora (el
  224º insertó con 24h02min). No se insertó esta vez; el próximo ciclo
  probablemente sí cruce el umbral.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo (comprobado primero, antes del resto del checklist, por si
  había algo pendiente pese al disparo `schedule`).
- Sin commits de código ni escrituras en Supabase este ciclo — decimosexto
  ciclo consecutivo (212º-228º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-10-0845.md`.

### Cierre 2026-09-10 (ciclo 16:02 UTC, 229º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200 (con `-L`), `/admin`
  → `/login/?redirect=%2Fadmin%2F` (200), `middleware.ts` en la raíz,
  canonical/`og:url`/`og:image`/sitemap (37 `<loc>`, sin cambio)/robots
  correctos. Vercel: últimos 5 despliegues `READY`.
- Decimoséptima pasada del check permanente del 211º/212º (cruce de hash de
  `ficha_cientifica` sobre las 52 filas): exactamente los mismos 7 grupos
  que el 212º-228º, sin grupos nuevos. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `updated_at` máximo sin cambio
  (2026-09-01) → sin auditoría visual completa este ciclo.
  `echinacea`/`equinacea` sigue sin duplicado real en vivo (404 vs 200).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio. 22
  publicados sin duplicados de título, todos ≤60 car., `excerpt` ≤155 car.,
  todos con `image_url`, 3/22 enlazan a `/diccionario` (sin cambio). Draft
  más reciente sigue en 2026-07-10, ya descartado en 206º-209º.
- `citas`: hueco de **~31h13min** desde la fila de Proverbios 14:30 (224º)
  — muy por encima del umbral de ~24h, se insertó cita nueva: Proverbios
  12:25 (Reina-Valera), *"La congoja en el corazón del hombre lo abate; mas
  la buena palabra lo alegra."* Verificada con `WebSearch` contra dos
  fuentes independientes (texto RV1960 exacto coincidente), verso distinto
  de los ya usados (14:30, 4:22, 3:7-8, 17:22), sin claim de curación. 36
  filas en `citas` tras la inserción.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo (comprobado primero, antes del resto del checklist, por si
  había algo pendiente pese al disparo `schedule`).
- Escritura en Supabase este ciclo: 1 fila nueva en `citas` (Proverbios
  12:25). Sin commits de código de negocio — decimoséptimo ciclo consecutivo
  (212º-229º) sin hallazgos técnicos nuevos en el checklist mecánico, y sin
  hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-10-1602.md`.

### Cierre 2026-09-10 (ciclo 19:07 UTC, 230º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200 (con `-L`), `/admin`
  → `/login/?redirect=%2Fadmin%2F` (307→200), `middleware.ts` en la raíz,
  canonical/`og:url`/`og:image`/sitemap (37 `<loc>`, sin cambio)/robots
  correctos. Vercel: últimos 5 despliegues `READY`.
- Decimoctava pasada del check permanente del 211º/212º (cruce de hash de
  `ficha_cientifica` sobre las 52 filas): exactamente los mismos 7 grupos
  que el 212º-229º, sin grupos nuevos. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `updated_at` máximo sin cambio
  (2026-09-01) → sin auditoría visual completa este ciclo.
  `echinacea`/`equinacea` sigue sin duplicado real en vivo (404 vs 200).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio. 22
  publicados sin duplicados de título, todos ≤60 car., `excerpt` ≤155 car.,
  todos con `image_url`. Draft más reciente sigue en 2026-07-10, ya
  descartado en 206º-209º.
- `citas`: última fila sigue siendo la de Proverbios 12:25 (229º), hueco de
  **~3h05min** — muy por debajo del umbral de ~24h, sin necesidad de
  insertar.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo (comprobado primero, antes del resto del checklist, por si
  había algo pendiente pese al disparo `schedule`).
- Sin commits de código ni escrituras en Supabase este ciclo — decimoctavo
  ciclo consecutivo (212º-230º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-10-1907.md`.

### Cierre 2026-09-10 (ciclo 22:21 UTC, 231º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200 (con `-L`), `/admin`
  → `/admin/` (308) → `/login/?redirect=%2Fadmin%2F` (307→200),
  `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37 `<loc>`, sin
  cambio)/robots correctos. Vercel: últimos 5 despliegues `READY`.
- Decimonovena pasada del check permanente del 211º/212º (cruce de hash de
  `ficha_cientifica` sobre las 52 filas): exactamente los mismos 7 grupos
  que el 212º-230º, sin grupos nuevos. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `updated_at` máximo sin cambio
  (2026-09-01) → sin auditoría visual completa este ciclo.
  `echinacea`/`equinacea` sigue sin duplicado real en vivo (404 vs 200).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Draft más reciente sigue en 2026-07-10, ya descartado en 206º-209º.
- `citas`: última fila sigue siendo Proverbios 12:25 (229º), hueco de
  **~6h20min** — muy por debajo del umbral de ~24h, sin necesidad de
  insertar.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo (comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`).
- Sin commits de código ni escrituras en Supabase este ciclo — decimonoveno
  ciclo consecutivo (212º-231º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-10-2221.md`.

### Cierre 2026-09-11 (ciclo 03:32 UTC, 232º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200 (con `-L`), `/admin`
  → login (200), `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37
  `<loc>`, sin cambio)/robots correctos. Vercel: últimos 5 despliegues
  `READY`.
- Vigésima pasada del check permanente del 211º/212º (cruce de hash de
  `ficha_cientifica` sobre las 52 filas): exactamente los mismos 7 grupos
  que el 212º-231º, sin grupos nuevos. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `updated_at` máximo sin cambio
  (2026-09-01) → sin auditoría visual completa este ciclo.
  `echinacea`/`equinacea` sigue sin duplicado real en vivo (404 vs 200).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Draft más reciente sigue en 2026-07-10, ya descartado en 206º-209º.
- `citas`: última fila sigue siendo Proverbios 12:25 (229º), hueco de
  **~11h31min** — por debajo del umbral de ~24h, sin necesidad de insertar.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo (comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`).
- Sin commits de código ni escrituras en Supabase este ciclo — vigésimo
  ciclo consecutivo (212º-232º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-11-0332.md`.

### Cierre 2026-09-11 (ciclo 08:44 UTC, 233º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200 (con `-L`), `/admin`
  → login (200), `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37
  `<loc>`, sin cambio)/robots correctos. Vercel: últimos 5 despliegues
  `READY`.
- Vigesimoprimera pasada del check permanente del 211º/212º (cruce de hash
  de `ficha_cientifica` sobre las 52 filas): exactamente los mismos 7
  grupos que el 212º-232º, sin grupos nuevos. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `updated_at` máximo sin cambio
  (2026-09-01) → sin auditoría visual completa este ciclo.
  `echinacea`/`equinacea` sigue sin duplicado real en vivo (404 vs 200,
  tras el 308 normal de barra final).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Draft más reciente sigue en 2026-07-10, ya descartado en 206º-209º.
- `citas`: última fila sigue siendo Proverbios 12:25 (229º), hueco de
  **~16h42min** — por debajo del umbral de ~24h, sin necesidad de
  insertar.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo (comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`).
- Sin commits de código ni escrituras en Supabase este ciclo — vigesimoprimer
  ciclo consecutivo (212º-233º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-11-0844.md`.

### Cierre 2026-09-11 (ciclo 16:05 UTC, 234º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200 (con `-L`), `/admin`
  → login (200), `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37
  `<loc>`, sin cambio)/robots correctos. Vercel: últimos 5 despliegues
  `READY`.
- Vigesimosegunda pasada del check permanente del 211º/212º (cruce de hash
  de `ficha_cientifica` sobre las 52 filas): exactamente los mismos 7
  grupos que el 212º-233º, sin grupos nuevos. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `updated_at` máximo sin cambio
  (2026-09-01) → sin auditoría visual completa este ciclo.
  `echinacea`/`equinacea` sigue sin duplicado real en vivo (404 vs 200).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Draft más reciente sigue en 2026-07-10, ya descartado en 206º-209º.
- `citas`: hueco de **24h02min** desde la fila de Proverbios 12:25 (229º) —
  justo en el umbral de ~24h, se insertó cita nueva: Proverbios 16:24
  (Reina-Valera), *"Panal de miel son los dichos suaves; Suavidad al alma y
  medicina para los huesos."* Verificada con `WebSearch` contra varias
  fuentes independientes (texto RV1960 coincidente), autor/versículo no
  repetido, sin claim de curación. Un candidato de Pasteur descartado por
  atribución sin fuente primaria verificable. 37 filas en `citas` tras la
  inserción.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo (comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`).
- Escritura en Supabase este ciclo: 1 fila nueva en `citas` (Proverbios
  16:24). Sin commits de código de negocio — vigesimosegundo ciclo
  consecutivo (212º-234º) sin hallazgos técnicos nuevos en el checklist
  mecánico.
- Ver `kimiko/bitacora/2026-09-11-1605.md`.

### Cierre 2026-09-11 (ciclo 22:19 UTC, 235º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200 (con `-L`), `/admin`
  → login (200), `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37
  `<loc>`, sin cambio)/robots correctos. Vercel: últimos 5 despliegues
  `READY`.
- Vigesimotercera pasada del check permanente del 211º/212º (cruce de hash
  de `ficha_cientifica` sobre las 52 filas): exactamente los mismos 7
  grupos que el 212º-234º, sin grupos nuevos. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `updated_at` máximo sin cambio
  (2026-09-01) → sin auditoría visual completa este ciclo.
  `echinacea`/`equinacea` sigue sin duplicado real en vivo (404 vs 200).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Draft más reciente sigue en 2026-07-10, ya descartado en 206º-209º.
- `citas`: última fila sigue siendo Proverbios 16:24 (234º), hueco de
  **~6h13min** — muy por debajo del umbral de ~24h, sin necesidad de
  insertar. 37 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo (comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`).
- Sin commits de código ni escrituras en Supabase este ciclo — vigesimotercer
  ciclo consecutivo (212º-235º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-11-2219.md`.

### Cierre 2026-09-12 (ciclo 03:38 UTC, 236º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200 (con `-L`), `/admin`
  → login (200), `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37
  `<loc>`, sin cambio)/robots correctos. Vercel: últimos 5 despliegues
  `READY`.
- Vigesimocuarta pasada del check permanente del 211º/212º (cruce de hash
  de `ficha_cientifica` sobre las 52 filas): exactamente los mismos 7
  grupos que el 212º-235º, sin grupos nuevos. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `updated_at` máximo sin cambio
  (2026-09-01) → sin auditoría visual completa este ciclo.
  `echinacea`/`equinacea` sigue sin duplicado real en vivo (404 vs 200).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Draft más reciente sigue en 2026-07-10, ya descartado en 206º-209º.
- `citas`: última fila sigue siendo Proverbios 16:24 (234º), hueco de
  **~11h32min** — muy por debajo del umbral de ~24h, sin necesidad de
  insertar. 37 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo (comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`).
- Sin commits de código ni escrituras en Supabase este ciclo — vigesimocuarto
  ciclo consecutivo (212º-236º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-12-0338.md`.

### Cierre 2026-09-12 (ciclo 08:29 UTC, 237º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200 (con `-L`), `/admin`
  → login (200), `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37
  `<loc>`, sin cambio)/robots correctos. Vercel: últimos 5 despliegues
  `READY`.
- Vigesimoquinta pasada del check permanente del 211º/212º (cruce de hash
  de `ficha_cientifica` sobre las 52 filas): exactamente los mismos 7
  grupos que el 212º-236º, sin grupos nuevos. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `echinacea`/`equinacea` sigue sin
  duplicado real en vivo (404 vs 200).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Draft más reciente sigue en 2026-07-10, ya descartado en 206º-209º.
- `citas`: última fila sigue siendo Proverbios 16:24 (234º), hueco de
  **~16h24min** — por debajo del umbral de ~24h, sin necesidad de
  insertar. 37 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo (comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`).
- Sin commits de código ni escrituras en Supabase este ciclo — vigesimoquinto
  ciclo consecutivo (212º-237º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-12-0829.md`.

### Cierre 2026-09-12 (ciclo ~15:12 UTC, 238º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200 (con `-L`), `/admin`
  → login (200), `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37
  `<loc>`, sin cambio)/robots correctos. Vercel: últimos 5 despliegues
  `READY`.
- Vigesimosexta pasada del check permanente del 211º/212º (cruce de hash
  de `ficha_cientifica` sobre las 52 filas): exactamente los mismos 7
  grupos que el 212º-237º, sin grupos nuevos. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `echinacea`/`equinacea` sin `-L` dan
  ambas 308 (normalización de barra final de Next.js, no confundir con
  hallazgo); siguiendo el redirect siguen sin ser duplicado real (404 vs
  200).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Draft más reciente sigue en 2026-07-10, ya descartado en 206º-209º.
- `citas`: hueco de **~23h07min** desde la última fila (Proverbios 16:24,
  234º) — ya rozando el umbral de ~24h, y dado el ritmo de ciclos (~5-7h)
  el siguiente habría caído claramente por encima. Insertada una cita
  nueva de Aristóteles (*Ética a Nicómaco*, Libro I, sobre el fin de la
  medicina), verificada con `WebSearch` antes de insertar, autor no
  repetido (comprobados los 37 autores previos). `citas` pasa de 37 a 38
  filas.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo (comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`).
- Único cambio de datos del ciclo: la fila nueva en `citas` (contenido
  editorial rutinario dentro de las atribuciones de Kimiko). Sin commits de
  código ni cambios en `plants`/`blog_posts`. Vigesimosexto ciclo
  consecutivo (212º-238º) sin hallazgos técnicos nuevos en el checklist
  mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-12-1512.md`.

### Cierre 2026-09-12 (ciclo ~18:13 UTC, 239º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200 (con `-L`), `/admin`
  → login (200), `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37
  `<loc>`, sin cambio)/robots correctos. Vercel: últimos 5 despliegues
  `READY`.
- Vigesimoséptima pasada del check permanente del 211º/212º (cruce de hash
  de `ficha_cientifica` sobre las 52 filas): exactamente los mismos 7
  grupos que el 212º-238º, sin grupos nuevos. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `echinacea`/`equinacea` sigue sin
  duplicado real en vivo (404 vs 200); un `curl -L` sin `-m` se colgó una
  vez sin motivo aparente al comprobarlo — usar `-m 15` en próximos ciclos
  para no perder tiempo esperando un curl colgado.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Draft más reciente sigue en 2026-07-10, ya descartado en 206º-209º.
- `citas`: última fila sigue siendo Aristóteles (238º), hueco de
  **~2h59min** — muy por debajo del umbral de ~24h, sin necesidad de
  insertar. 38 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo (comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`).
- Sin commits de código ni escrituras en Supabase este ciclo — vigesimoséptimo
  ciclo consecutivo (212º-239º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-12-1813.md`.

### Cierre 2026-09-12 (ciclo ~22:02 UTC, 240º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200 (con `-L`), `/admin`
  → login (200), `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37
  `<loc>`, sin cambio)/robots correctos. Vercel: últimos 5 despliegues
  `READY`.
- Vigesimoctava pasada del check permanente del 211º/212º (cruce de hash
  de `ficha_cientifica` sobre las 52 filas): exactamente los mismos 7
  grupos que el 212º-239º, sin grupos nuevos. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `updated_at` máximo sin cambio
  (2026-09-01) → sin auditoría visual completa este ciclo.
  `echinacea`/`equinacea` sigue sin duplicado real en vivo (404 vs 200).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Draft más reciente sigue en 2026-07-10, ya descartado en 206º-209º.
- `citas`: última fila sigue siendo Aristóteles (238º), hueco de
  **~6h48min** — muy por debajo del umbral de ~24h, sin necesidad de
  insertar. 38 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo (comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`).
- Sin commits de código ni escrituras en Supabase este ciclo — vigesimoctavo
  ciclo consecutivo (212º-240º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-12-2202.md`.

### Cierre 2026-09-13 (ciclo 03:44 UTC, 241º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200 (con `-L`), `/admin`
  → 308 a login, `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37
  `<loc>`, sin cambio)/robots correctos. Vercel: últimos 5 despliegues
  `READY`.
- Vigesimonovena pasada del check permanente del 211º/212º (cruce de hash
  de `ficha_cientifica` sobre las 52 filas): exactamente los mismos 7
  grupos que el 212º-240º, sin grupos nuevos. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `updated_at` máximo sin cambio
  (2026-09-01) → sin auditoría visual completa este ciclo.
  `echinacea`/`equinacea` sigue sin duplicado real en vivo (404 vs 200).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Draft más reciente sigue en 2026-07-10, ya descartado en 206º-209º.
- `citas`: última fila sigue siendo Aristóteles (238º), hueco de
  **~12h31min** — muy por debajo del umbral de ~24h, sin necesidad de
  insertar. 38 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo (comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`).
- Sin commits de código ni escrituras en Supabase este ciclo — vigesimonoveno
  ciclo consecutivo (212º-241º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-13-0344.md`.

### Cierre 2026-09-13 (ciclo 15:46 UTC, 242º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200 (con `-L`), `/admin`
  → 308 a login, `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37
  `<loc>`, sin cambio)/robots correctos. Vercel: últimos 5 despliegues
  `READY`. Nota: un primer `curl` al sitemap sin reintento dio 15 `<loc>`
  por corte de red transitorio — falsa alarma, descartada con `curl -m 20`;
  si vuelve a pasar, reintentar antes de anotarlo como hallazgo.
- Trigésima pasada del check permanente del 211º/212º (cruce de hash de
  `ficha_cientifica` sobre las 52 filas): exactamente los mismos 7 grupos
  que el 212º-241º, sin grupos nuevos. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `updated_at` máximo sin cambio
  (2026-09-01) → sin auditoría visual completa este ciclo.
  `echinacea`/`equinacea` sigue sin duplicado real en vivo (404 vs 200).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Draft más reciente sigue en 2026-07-10, ya descartado en 206º-209º.
- `citas`: hueco de **~24h32min** desde la última fila (Aristóteles, 238º)
  — por encima del umbral de ~24h. Insertada cita nueva: Proverbios 15:30
  (Reina-Valera), *"La luz de los ojos alegra el corazón, Y la buena
  nueva conforta los huesos."* Verificada con `WebSearch` contra varias
  fuentes independientes, verso no repetido (comprobados los 38
  autores/versículos previos), sin claim de curación. Un candidato de
  Cicerón (*De Senectute*) descartado por no verificar limpio contra las
  fuentes primarias (Perseus/LacusCurtius no reproducen la formulación
  exacta) — mismo patrón que el descarte de Pasteur en el 238º: exigir
  siempre el texto primario, no solo webs de citas. `citas` pasa de 38 a
  39 filas.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo (comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`).
- Único cambio de datos del ciclo: la fila nueva en `citas`. Sin commits de
  código ni cambios en `plants`/`blog_posts`. Trigésimo ciclo consecutivo
  (212º-242º) sin hallazgos técnicos nuevos en el checklist mecánico, y
  sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-13-1546.md`.

### Cierre 2026-09-13 (ciclo 18:35 UTC, 243º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200 (con `-L`), `/admin`
  → 308 a login, `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37
  `<loc>`, sin cambio)/robots correctos. Vercel: últimos despliegues
  `READY`.
- Trigesimoprimera pasada del check permanente del 211º/212º (cruce de hash
  de `ficha_cientifica` sobre las 52 filas): exactamente los mismos 7
  grupos que el 212º-242º, sin grupos nuevos. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `updated_at` máximo sin cambio
  (2026-09-01) → sin auditoría visual completa este ciclo.
  `echinacea`/`equinacea` sigue sin duplicado real en vivo (404 vs 200).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
- `citas`: última fila sigue siendo Proverbios 15:30 (242º), hueco de
  **~2h46min** — muy por debajo del umbral de ~24h, sin necesidad de
  insertar. 39 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo (comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`).
- Sin commits de código ni escrituras en Supabase este ciclo — trigesimoprimer
  ciclo consecutivo (212º-243º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-13-1835.md`.

### Cierre 2026-09-13 (ciclo 22:14 UTC, 244º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200 (con `-L`), `/admin`
  → 308 a login, `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37
  `<loc>`, sin cambio)/robots correctos. Vercel: últimos 5 despliegues
  `READY`.
- Trigesimosegunda pasada del check permanente del 211º/212º (cruce de hash
  de `ficha_cientifica` sobre las 52 filas): exactamente los mismos 7
  grupos que el 212º-243º, sin grupos nuevos. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `updated_at` máximo sin cambio
  (2026-09-01) → sin auditoría visual completa este ciclo.
  `echinacea`/`equinacea` sigue sin duplicado real en vivo (404 vs 200).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Draft más reciente sigue en 2026-07-10, ya descartado en 206º-209º.
- `citas`: última fila sigue siendo Proverbios 15:30 (242º), hueco de
  **~13min** — muy por debajo del umbral de ~24h, sin necesidad de
  insertar. 39 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo (comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`).
- Sin commits de código ni escrituras en Supabase este ciclo — trigesimosegundo
  ciclo consecutivo (212º-244º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-13-2214.md`.

### Cierre 2026-09-14 (ciclo 03:53 UTC, 245º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200 (con `-L`), `/admin`
  → 308, `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37
  `<loc>`, sin cambio)/robots correctos. Vercel: últimos 5 despliegues
  `READY`.
- Trigesimotercera pasada del check permanente del 211º/212º (cruce de hash
  de `ficha_cientifica` sobre las 52 filas): exactamente los mismos 7
  grupos que el 212º-244º, sin grupos nuevos. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `updated_at` máximo sin cambio
  (2026-09-01) → sin auditoría visual completa este ciclo.
  `echinacea`/`equinacea`: un primer `curl` sin `-L` dio 308 en ambas por
  redirect normal de barra final (Next.js/Vercel) — no es un hallazgo
  nuevo, solo confirmar siempre con `-L` o mirar la `location` antes de
  anotar algo raro. Siguiendo el redirect, sigue siendo 404 vs 200, sin
  duplicado real en vivo.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Draft más reciente sigue en 2026-07-10, ya descartado en 206º-209º.
- `citas`: última fila sigue siendo Proverbios 15:30 (242º), hueco de
  **~12h04min** — muy por debajo del umbral de ~24h, sin necesidad de
  insertar. 39 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo (comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`).
- Sin commits de código ni escrituras en Supabase este ciclo — trigesimotercer
  ciclo consecutivo (212º-245º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-14-0353.md`.

### Cierre 2026-09-14 (ciclo 09:42 UTC, 246º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200 (con `-L`), `/admin`
  → 308 a login, `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37
  `<loc>`, sin cambio)/robots correctos. Vercel: últimos 5 despliegues
  `READY`. Nota: un primer `curl` al sitemap sin reintento dio 11 `<loc>`
  por corte de red transitorio — mismo patrón de falsa alarma del 243º/245º,
  descartado tras 3 reintentos consistentes en 37 con `curl -m 30`.
- Trigesimocuarta pasada del check permanente del 211º/212º (cruce de hash
  de `ficha_cientifica` sobre las 52 filas): exactamente los mismos 7
  grupos que el 212º-245º, sin grupos nuevos. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `updated_at` máximo sin cambio
  (2026-09-01) → sin auditoría visual completa este ciclo.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Draft más reciente sigue en 2026-07-10, ya descartado en 206º-209º.
- `citas`: última fila sigue siendo Proverbios 15:30 (242º), hueco de
  **~17h50min** — por debajo del umbral de ~24h, sin necesidad de insertar.
  39 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo (comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`).
- Sin commits de código ni escrituras en Supabase este ciclo — trigesimocuarto
  ciclo consecutivo (212º-246º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-14-0942.md`.

### Cierre 2026-09-14 (ciclo 17:55 UTC, 247º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200 (con `-L`), `/admin`
  → 308 a login, `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37
  `<loc>`, sin cambio)/robots correctos. Vercel: últimos 5 despliegues
  `READY`.
- **Corrección al check permanente del 211º/212º: la cifra de "7 grupos" de
  duplicado exacto era un error de recuento repetido mecánicamente desde el
  214º, 33 ciclos seguidos, sin que nadie volviera a derivar la lista
  completa. El recuento real es 6 grupos / 12 filas, todos pares:**
  `ashwagandha-fruto`/`sauco`, `cinamomo`/`valeriana`,
  `echinacea`/`equinacea`, `ginseng`/`muerdago`, `loto`/`tulsi`,
  `manzanilla`/`nigela`. Coincide exactamente con lo que el propio 213º
  había enumerado ("los 5 pares conocidos... y `echinacea`/`equinacea`" = 6),
  antes de que el 214º introdujera "7" sin respaldo. Sin blast radius en
  vivo: los 12 slots siguen `publicada=false` salvo `equinacea` (una de las
  4 fichas correctas; su duplicado con `echinacea` no crea duplicado en
  vivo — `echinacea` 404, `equinacea` 200, reconfirmado). **De aquí en
  adelante la cifra de referencia es 6 grupos**, con la lista completa
  arriba para contraste directo sin recalcular desde cero. `plants`: 52
  filas, 4 publicada+verificada sin cambio (`albahaca`, `arnica`,
  `equinacea`, `hinojo`), las 4 imágenes confirmadas en disco. Las 9
  peligrosas confirmadas `publicada=false`.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Draft más reciente sigue en 2026-07-10, ya descartado en 206º-209º.
- `citas`: hueco de **~26h06min** desde la última fila (Proverbios 15:30,
  242º) — por encima del umbral de ~24h. Insertada cita nueva: Proverbios
  18:14 (Reina-Valera), *"El ánimo del hombre soportará su enfermedad; Mas
  ¿quién soportará al ánimo angustiado?"* Verificada con `WebSearch` contra
  varias fuentes independientes (Bible Study Tools, YouVersion,
  BlueLetterBible), verso no repetido (comprobados los 39
  autores/versículos previos), sin claim de curación. `citas` pasa de 39 a
  40 filas.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo (comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`).
- Cambios este ciclo: fila nueva en `citas` + corrección de recuento en esta
  memoria (7→6 grupos del check de duplicados). Sin commits de código ni
  cambios en `plants`/`blog_posts`.
- Ver `kimiko/bitacora/2026-09-14-1755.md`.

### Cierre 2026-09-14 (ciclo 23:02 UTC, 248º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200 (con `-L`), `/admin`
  → 308 a login, `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37
  `<loc>`, sin cambio)/robots correctos. Vercel: últimos 5 despliegues
  `READY`.
- Trigesimoquinta pasada del check permanente del 211º/212º (corregido a 6
  grupos en el 247º, ver esa entrada para la lista completa): cruce de hash
  de `ficha_cientifica` sobre las 52 filas da exactamente los mismos 6
  grupos que el 247º, sin grupos nuevos. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `updated_at` máximo sin cambio
  (2026-09-01) → sin auditoría visual completa este ciclo.
  `echinacea`/`equinacea` sigue sin duplicado real en vivo (404 vs 200).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Draft más reciente sigue en 2026-07-10, ya descartado en 206º-209º.
- `citas`: última fila sigue siendo Proverbios 18:14 (247º), hueco de
  **~5h07min** — muy por debajo del umbral de ~24h, sin necesidad de
  insertar. 40 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo (comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`).
- Sin commits de código ni escrituras en Supabase este ciclo — trigesimoquinto
  ciclo consecutivo (212º-248º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-14-2302.md`.

### Cierre 2026-09-15 (ciclo 03:53 UTC, 249º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200 (con `-L`), `/admin`
  → 308 a `/admin/` → 307 a `/login/?redirect=...`, `middleware.ts` en la
  raíz, canonical/`og:url`/sitemap (37 `<loc>`, 3 reintentos consistentes)/
  robots correctos. Vercel: últimos 5 despliegues `READY`.
- **Corrección a la corrección del 247º: la cifra de referencia del check
  permanente del 211º/212º vuelve a ser 7 grupos / 21 filas, no 6.** Rehice
  el cruce de hash desde cero (sin mirar el número anotado en el 248º) sobre
  las 52 filas de `plants`, comparando `ficha_cientifica` con
  `json.dumps(valor, sort_keys=True)` antes de hashear (nota técnica del
  213º). Resultado: 6 pares reales entre fichas —
  `ashwagandha-fruto`/`sauco`, `cinamomo`/`valeriana`,
  `echinacea`/`equinacea`, `ginseng`/`muerdago`, `loto`/`tulsi`,
  `manzanilla`/`nigela` (12 filas) — **más un séptimo grupo: las 9 peligrosas
  (`aconito`, `amanita-muscaria`, `beleno-negro`, `cannabis`,
  `cornezuelo-centeno`, `datura`, `datura-metel`, `hierba-mora`, `tejo`)
  comparten un único hash de `ficha_cientifica` (el placeholder), 9 filas.**
  6+1 = 7 grupos, 12+9 = 21 filas. Esto coincide exactamente con el
  baseline original del 212º-246º (34 ciclos: "7 grupos"), y con la nota
  explícita del 213º que ya listaba los 6 pares **y por separado** "las 9
  peligrosas... compartiendo el placeholder" — es decir, el 213º ya contaba
  7, solo que la entrada del 247º, al re-derivar la lista, se fijó solo en
  los pares "de ficha real" y olvidó que el grupo de las 9 peligrosas
  siempre fue el séptimo grupo del cruce, no un error de recuento. El 247º
  se equivocó al "corregir" 7→6; el error real fue esa corrección, no el
  recuento original. **De aquí en adelante la cifra de referencia vuelve a
  ser 7 grupos / 21 filas**, con el desglose completo arriba. Sin blast
  radius en vivo en ningún caso: los 21 slots siguen `publicada=false`
  salvo `equinacea` (correcta, verificada). `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `updated_at` máximo sin cambio
  (2026-09-01) → sin auditoría visual completa este ciclo.
- **Lección para ciclos futuros: al "corregir" una cifra de un check
  permanente, no basta con re-derivar la lista de memoria — hay que
  re-ejecutar el cruce mecánico desde cero (o releer la nota técnica del
  213º con la lista completa) antes de sobrescribir 34 ciclos de consenso.
  Confiar en la lista corta sin volver a correr el hash fue lo que produjo
  el error del 247º.**
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Draft más reciente sigue en 2026-07-10, ya descartado en 206º-209º.
- `citas`: última fila sigue siendo Proverbios 18:14 (247º), hueco de
  **~9h58min** — muy por debajo del umbral de ~24h, sin necesidad de
  insertar. 40 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo (comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`).
- Cambios este ciclo: corrección de la cifra del check de duplicados (6→7
  grupos, revirtiendo el error del 247º) en esta memoria. Sin commits de
  código, sin escrituras en Supabase.
- Ver `kimiko/bitacora/2026-09-15-0353.md`.

### Cierre 2026-09-15 (ciclo 09:16 UTC, 250º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200, `/admin` → 308 a
  `/admin/` → 307 a `/login/?redirect=...`, `middleware.ts` en la raíz,
  canonical/`og:url`/sitemap (37 `<loc>`)/robots correctos. Vercel: últimos
  5 despliegues `READY`.
- Trigesimosexta pasada del check permanente del 211º/212º: rehecho el
  cruce de hash de `ficha_cientifica` desde cero sobre las 52 filas de
  `plants` (sin mirar la cifra anotada en el 249º), da los mismos **7
  grupos / 21 filas** de la corrección del 249º (6 pares de fichas reales +
  las 9 peligrosas compartiendo el placeholder). Confirma que la
  corrección del 249º fue la buena; sin cambios. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `updated_at` máximo sin cambio
  (2026-09-01) → sin auditoría visual completa este ciclo.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Draft más reciente sigue en 2026-07-10, ya descartado en 206º-209º.
- `citas`: última fila sigue siendo Proverbios 18:14 (247º), hueco de
  **~15h21min** — por debajo del umbral de ~24h, sin necesidad de insertar.
  40 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo (comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`).
- Sin commits de código ni escrituras en Supabase este ciclo — trigesimosexto
  ciclo consecutivo (212º-250º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-15-0916.md`.

### Cierre 2026-09-15 (ciclo 16:28 UTC, 251º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200, `/admin` → 308 a
  `/admin/` → 307 a `/login/?redirect=...`, `middleware.ts` en la raíz,
  canonical/`og:url`/sitemap (37 `<loc>`)/robots correctos. Vercel: últimos
  5 despliegues `READY`.
- Trigesimoséptima pasada del check permanente del 211º/212º: rehecho el
  cruce de hash de `ficha_cientifica` desde cero sobre las 52 filas de
  `plants` (sin mirar la cifra anotada en ciclos previos), da los mismos
  **7 grupos / 21 filas** de la corrección del 249º/250º (6 pares de
  fichas reales + las 9 peligrosas compartiendo el placeholder). Sin
  cambios. `plants`: 52 filas, 4 publicada+verificada sin cambio
  (`albahaca`, `arnica`, `equinacea`, `hinojo`), las 4 imágenes
  confirmadas en disco. Las 9 peligrosas confirmadas `publicada=false`.
  `updated_at` máximo sin cambio (2026-09-01) → sin auditoría visual
  completa este ciclo.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Draft más reciente sigue en 2026-07-10, ya descartado en 206º-209º.
- `citas`: última fila sigue siendo Proverbios 18:14 (247º), hueco de
  **~22h33min** — por debajo del umbral de ~24h, sin necesidad de
  insertar. 40 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola de `pendiente` vacía, sin `en_curso` colgado, sin orden de Telegram
  este ciclo (comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`).
- Sin commits de código ni escrituras en Supabase este ciclo — trigesimoséptimo
  ciclo consecutivo (212º-251º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-15-1628.md`.

### Cierre 2026-09-15 (ciclo 22:44 UTC, 252º, MODO CICLO)
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200, `/admin` → 308 a
  `/admin/` → 307 a `/login/?redirect=...`, `middleware.ts` en la raíz,
  canonical/`og:url`/sitemap (37 `<loc>`)/robots correctos. Vercel: últimos
  5 despliegues `READY`.
- Trigesimoctava pasada del check permanente del 211º/212º: mismos **7
  grupos / 21 filas**. Sin cambios. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `updated_at` máximo sin cambio
  (2026-09-01) → sin auditoría visual completa este ciclo.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  `leads` en 0, `purchases` en 0, `products` sin cambio (2). `kimiko_drafts`:
  cola vacía, sin `en_curso` colgado, sin orden de Telegram este ciclo.
- **Primer hallazgo real en 38 ciclos: `citas` cruzó el umbral de ~24h**
  (última fila del 251º con ~28h51min de hueco al comprobar). Probé dos
  candidatos de cita antes de insertar y los descarté por no superar la
  verificación: Hildegard von Bingen ("All nature is at the disposal of
  humankind...") sin fuente primaria ni latín original localizable por
  `WebSearch`; y un supuesto "bona valetudo" de Cicerón que la búsqueda
  atribuyó en realidad a Séneca (ya presente como autor en la tabla).
  **Inserté Salmos 103:3 (Reina-Valera)**, texto verificado contra RVR1960
  por `WebSearch`, autor nuevo (ningún Salmo previo en la tabla). `citas`:
  41 filas tras el insert. Detalle completo en la bitácora de este ciclo.
- Cambios este ciclo: 1 INSERT en Supabase (`citas`). Sin commits de código.
- Ver `kimiko/bitacora/2026-09-15-2244.md`.

### Cierre 2026-09-16 (ciclo 03:51 UTC, 253º, MODO CICLO)
- `kimiko_drafts` comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`: cola de `pendiente` vacía, sin `en_curso` colgado, sin orden
  de Telegram este ciclo.
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200, `/admin` → 308 a
  `/admin/` → 307 a `/login/?redirect=...`, `middleware.ts` en la raíz,
  canonical/`og:url`/sitemap (37 `<loc>`)/robots correctos. Vercel: últimos
  5 despliegues `READY`.
- Trigesimonovena pasada del check permanente del 211º/212º: rehecho el
  cruce de hash de `ficha_cientifica` desde cero sobre las 52 filas de
  `plants` (sin mirar la cifra anotada en ciclos previos), da los mismos
  **7 grupos / 21 filas** de la corrección del 249º (6 pares de fichas
  reales + las 9 peligrosas compartiendo el placeholder). Sin cambios.
  `plants`: 52 filas, 4 publicada+verificada sin cambio (`albahaca`,
  `arnica`, `equinacea`, `hinojo`), las 4 imágenes confirmadas en disco.
  Las 9 peligrosas confirmadas `publicada=false`. `lavanda` sigue
  despublicada y sin verificar, imagen aún ausente en disco (hallazgo ya
  documentado desde 2026-09-03, sin blast radius). `updated_at` máximo
  sin cambio (2026-09-01) → sin auditoría visual completa este ciclo.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
- `citas`: última fila sigue siendo Salmos 103:3 (252º), hueco de
  **~5h03min** — muy por debajo del umbral de ~24h, sin necesidad de
  insertar. 41 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2).
- Sin commits de código ni escrituras en Supabase este ciclo — trigesimonoveno
  ciclo consecutivo (212º-253º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-16-0351.md`.

### Cierre 2026-09-16 (ciclo 09:11 UTC, 254º, MODO CICLO)
- `kimiko_drafts` comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`: cola de `pendiente` vacía, sin `en_curso` colgado, sin
  orden de Telegram este ciclo.
- Build/lint limpios (36/36 páginas, `npx next lint` sin avisos). `npm audit`
  sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue
  sin fix no-breaking. 8/8 rutas del checklist en 200, `/admin` → 308 a
  `/admin/` → 307 a `/login/?redirect=...`, `middleware.ts` en la raíz,
  canonical/`og:url`/sitemap (37 `<loc>`)/robots correctos. Vercel: últimos
  5 despliegues `READY`.
- Cuadragésima pasada del check permanente del 211º/212º: rehecho el cruce
  de hash de `ficha_cientifica` desde cero sobre las 52 filas de `plants`
  (sin mirar la cifra anotada en ciclos previos), da los mismos **7 grupos
  / 21 filas** de la corrección del 249º (6 pares de fichas reales + las 9
  peligrosas compartiendo el placeholder). Sin cambios. `plants`: 52 filas,
  4 publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `lavanda` sigue despublicada y sin
  verificar, imagen aún ausente en disco (hallazgo ya documentado desde
  2026-09-03, sin blast radius). `updated_at` máximo sin cambio
  (2026-09-01) → sin auditoría visual completa este ciclo.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
- `citas`: última fila sigue siendo Salmos 103:3 (252º), hueco de
  **~10h23min** — muy por debajo del umbral de ~24h, sin necesidad de
  insertar. 41 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2).
- Sin commits de código ni escrituras en Supabase este ciclo — cuadragésimo
  ciclo consecutivo (212º-254º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-16-0911.md`.

### Cierre 2026-09-16 (ciclo 16:20 UTC, 255º, MODO CICLO)
- `kimiko_drafts` comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`: cola de `pendiente` vacía, sin `en_curso` colgado, sin
  orden de Telegram este ciclo.
- Build/lint limpios (36/36 páginas, sin errores). `npm audit` sin cambio
  desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue sin fix
  no-breaking (requiere next-intl 4.14.5 y next 16.3.5, ambos breaking).
  8/8 rutas del checklist en 200, `/admin` → 308 a `/admin/` → 307 a
  `/login/?redirect=...`, `middleware.ts` en la raíz, canonical/`og:url`/
  sitemap (37 `<loc>`)/robots correctos. Vercel: últimos 5 despliegues
  `READY`.
- Cuadragésima primera pasada del check permanente del 211º/212º: rehecho
  el cruce de hash de `ficha_cientifica` desde cero sobre las 52 filas de
  `plants` (sin mirar la cifra anotada en ciclos previos), da los mismos
  **7 grupos / 21 filas** de la corrección del 249º (6 pares de fichas
  reales + las 9 peligrosas compartiendo el placeholder). Sin cambios.
  `plants`: 52 filas, 4 publicada+verificada sin cambio (`albahaca`,
  `arnica`, `equinacea`, `hinojo`), las 4 imágenes confirmadas en disco.
  Las 9 peligrosas confirmadas `publicada=false`. `lavanda` sigue
  despublicada y sin verificar, imagen aún ausente en disco (hallazgo ya
  documentado desde 2026-09-03, sin blast radius). `updated_at` máximo sin
  cambio (2026-09-01) → sin auditoría visual completa este ciclo.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
- `citas`: última fila sigue siendo Salmos 103:3 (252º), hueco de
  **~17h34min** — por debajo del umbral de ~24h, sin necesidad de insertar.
  41 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2).
- Sin commits de código ni escrituras en Supabase este ciclo — cuadragésimo
  primer ciclo consecutivo (212º-255º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-16-1620.md`.

### Cierre 2026-09-16 (ciclo 22:44 UTC, 256º, MODO CICLO)
- `kimiko_drafts` comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`: cola de `pendiente` vacía, sin `en_curso` colgado, sin
  orden de Telegram este ciclo.
- Build/lint limpios (36/36 páginas, sin errores). `npm audit` sin cambio
  desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue sin fix
  no-breaking. 8/8 rutas del checklist en 200, `/admin` → `/login/?redirect=...`,
  `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37 `<loc>`)/robots
  correctos. Vercel: últimos 5 despliegues `READY`.
- Cuadragésima segunda pasada del check permanente del 211º/212º: rehecho el
  cruce de hash de `ficha_cientifica` desde cero sobre las 52 filas de
  `plants` (sin mirar la cifra anotada en ciclos previos), da los mismos
  **7 grupos / 21 filas** de la corrección del 249º (6 pares de fichas
  reales + las 9 peligrosas compartiendo el placeholder). Sin cambios.
  `plants`: 52 filas, 4 publicada+verificada sin cambio (`albahaca`,
  `arnica`, `equinacea`, `hinojo`), las 4 imágenes confirmadas en disco.
  Las 9 peligrosas confirmadas `publicada=false`. `lavanda` sigue
  despublicada y sin verificar, imagen aún ausente en disco (hallazgo ya
  documentado desde 2026-09-03, sin blast radius). `updated_at` máximo sin
  cambio (2026-09-01) → sin auditoría visual completa este ciclo.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
- `citas`: última fila sigue siendo Salmos 103:3 (252º), hueco de
  **~23h56min** al comprobar — justo por debajo del umbral de ~24h, con
  margen de solo minutos. Sin necesidad de insertar este ciclo, pero es
  probable que el próximo ciclo cruce el umbral y tenga que insertar una
  cita nueva. 41 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2).
- Sin commits de código ni escrituras en Supabase este ciclo — cuadragésimo
  segundo ciclo consecutivo (212º-256º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-16-2244.md`.
- Ver `kimiko/bitacora/2026-09-16-1620.md`.

### Cierre 2026-09-17 (ciclo 03:53 UTC, 257º, MODO CICLO)
- `kimiko_drafts` comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`: cola de `pendiente` vacía, sin `en_curso` colgado, sin
  orden de Telegram este ciclo.
- Build/lint limpios (36/36 páginas, sin errores). `npm audit` sin cambio
  desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue sin fix
  no-breaking. 8/8 rutas del checklist en 200, `/admin` → `/login/?redirect=...`,
  `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37 `<loc>`)/robots
  correctos. Vercel: últimos 5 despliegues `READY`.
- Cuadragésima tercera pasada del check permanente del 211º/212º: rehecho el
  cruce de hash de `ficha_cientifica` desde cero sobre las 52 filas de
  `plants` (sin mirar la cifra anotada en ciclos previos), da los mismos
  **7 grupos / 21 filas** de la corrección del 249º (6 pares de fichas
  reales + las 9 peligrosas compartiendo el placeholder). Sin cambios.
  `plants`: 52 filas, 4 publicada+verificada sin cambio (`albahaca`,
  `arnica`, `equinacea`, `hinojo`), las 4 imágenes confirmadas en disco.
  Las 9 peligrosas confirmadas `publicada=false`. `updated_at` máximo sin
  cambio (2026-09-01) → sin auditoría visual completa este ciclo.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
- **`citas`: el hueco cruzó el umbral de ~24h que el 256º había anticipado**
  (última fila, Salmos 103:3 del 252º, tenía ~29h05min de antigüedad al
  comprobar). Inserté una cita nueva: 3 Juan 1:2 (Reina-Valera) — "Amado, yo
  deseo que tú seas prosperado en todas las cosas, y que tengas salud, así
  como prospera tu alma." Verso verificado contra el texto RVR1960 estándar,
  temática de salud, comprobado que no duplicaba ninguna de las 41 filas
  previas. `citas` pasa de 41 a 42 filas — primera escritura en Supabase
  desde el 249º.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2).
- Cuadragésimo tercer ciclo consecutivo (212º-257º) sin hallazgos técnicos
  nuevos en el checklist mecánico de código/build/rutas, y sin hallazgos de
  negocio nuevos. Único cambio real del ciclo: la inserción en `citas`.
- **Check permanente nuevo:** vigilar el hueco de `citas` cada ciclo contra
  el umbral de ~24h e insertar una cita nueva (pública, verificada, temática
  de salud/bienestar, no duplicada) en cuanto se cruce, en vez de solo
  anotarlo como aviso para el ciclo siguiente.
- Ver `kimiko/bitacora/2026-09-17-0353.md`.

### Cierre 2026-09-17 (ciclo 09:19 UTC, 258º, MODO CICLO)
- `kimiko_drafts` comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`: las 4 filas históricas siguen `hecho`, sin `en_curso`
  colgado, sin orden de Telegram este ciclo.
- Build/lint limpios (36/36 páginas, sin errores). `npm audit` sin cambio
  desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue sin fix
  no-breaking. 8/8 rutas del checklist en 200, `/admin` → `/login/?redirect=...`,
  `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37 `<loc>`)/robots
  correctos. Vercel: últimos 5 despliegues `READY`.
- Cuadragésima cuarta pasada del check permanente del 211º/212º: **desliz
  propio corregido dentro del ciclo** — primero hasheé por error los bytes
  de `image_cientifica_url` en disco (dio 0 grupos), lo cual no es el check;
  el check real es sobre la columna `ficha_cientifica` (JSON). Releída la
  cicatriz del 211º y repetido sobre la columna correcta: mismos **7 grupos
  / 21 filas** de siempre (6 pares de fichas reales + las 9 peligrosas
  compartiendo el placeholder). Sin cambios. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `lavanda` tiene ya `image_cientifica_url`
  rellena en la fila pero el fichero sigue ausente en disco (hallazgo desde
  2026-09-03, despublicada, sin blast radius).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Repasados los 22 publicados: sin títulos duplicados, `excerpt` <155 car. e
  `image_url` presente en todos.
- `citas`: última fila sigue siendo 3 Juan 1:2 (insertada en el 257º), hueco
  de ~5h23min — muy por debajo del umbral de ~24h, sin necesidad de
  insertar. 42 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2).
- Sin commits de código ni escrituras en Supabase este ciclo — cuadragésimo
  cuarto ciclo consecutivo (212º-258º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- **Check permanente aclarado:** el cruce de hash del 211º/212º es sobre la
  columna `ficha_cientifica` (JSON, comparar con `JSON.stringify`), no sobre
  los ficheros de `image_cientifica_url`. Un hash de imágenes en disco es un
  check distinto y no sustituye a este — si en algún ciclo se quiere auditar
  también contenido cruzado en las imágenes, debe declararse como check
  aparte, no confundirse con este.
- Ver `kimiko/bitacora/2026-09-17-0919.md`.

### Cierre 2026-09-17 (ciclo 16:29 UTC, 259º, MODO CICLO)
- `kimiko_drafts` comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`: cola de `pendiente` vacía, sin `en_curso` colgado, sin
  orden de Telegram este ciclo.
- Build/lint limpios (36/36 páginas, sin errores). `npm audit` sin cambio
  desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue sin fix
  no-breaking. 8/8 rutas del checklist en 200, `/admin` → `/login/?redirect=...`,
  `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37 `<loc>`)/robots
  correctos. Vercel: últimos 5 despliegues `READY`.
- Cuadragésima quinta pasada del check permanente del 211º/212º: rehecho el
  cruce de hash de `ficha_cientifica` desde cero sobre las 52 filas de
  `plants` (columna JSON, no los ficheros de imagen), da los mismos
  **7 grupos / 21 filas** de siempre (6 pares de fichas reales + las 9
  peligrosas compartiendo el placeholder). Sin cambios. `plants`: 52 filas,
  4 publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `lavanda` sigue con `image_cientifica_url`
  rellena pero sin fichero en disco (hallazgo desde 2026-09-03, despublicada,
  sin blast radius). `updated_at` máximo sin cambio (2026-09-01) → sin
  auditoría visual completa este ciclo.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Repasados los 22 publicados: sin títulos duplicados, `excerpt` <155 car. e
  `image_url` presente en todos.
- `citas`: última fila sigue siendo 3 Juan 1:2 (insertada en el 257º), hueco
  de **~12h33min** — por debajo del umbral de ~24h, sin necesidad de
  insertar. 42 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2).
- Sin commits de código ni escrituras en Supabase este ciclo — cuadragésimo
  quinto ciclo consecutivo (212º-259º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-17-1629.md`.

### Cierre 2026-09-17 (ciclo 22:44 UTC, 260º, MODO CICLO)
- `kimiko_drafts` comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`: las 4 filas históricas siguen `hecho`, sin `en_curso`
  colgado, sin orden de Telegram este ciclo.
- Build/lint limpios (36/36 páginas, sin errores). `npm audit` sin cambio
  desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue sin fix
  no-breaking. 8/8 rutas del checklist en 200, `/admin` → `/admin/` →
  `/login/?redirect=%2Fadmin%2F`, `middleware.ts` en la raíz, canonical/
  `og:url`/sitemap (37 `<loc>`)/robots correctos. Vercel: últimos 5
  despliegues `READY`.
- Cuadragésima sexta pasada del check permanente del 211º/212º: rehecho el
  cruce de hash de `ficha_cientifica` desde cero sobre las 52 filas de
  `plants` (columna JSON, no los ficheros de imagen), da los mismos
  **7 grupos / 21 filas** de siempre (6 pares de fichas reales + las 9
  peligrosas compartiendo el placeholder). Sin cambios. `plants`: 52 filas,
  4 publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `lavanda` sigue con `image_cientifica_url`
  rellena pero sin fichero en disco (hallazgo desde 2026-09-03, despublicada,
  sin blast radius). `updated_at` máximo sin cambio (2026-09-01) → sin
  auditoría visual completa este ciclo.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Repasados los 22 publicados: sin títulos duplicados, `excerpt` <155 car. e
  `image_url` presente en todos.
- `citas`: última fila sigue siendo 3 Juan 1:2 (insertada en el 257º), hueco
  de **~18h47min** — por debajo del umbral de ~24h, sin necesidad de
  insertar. 42 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2).
- Sin commits de código ni escrituras en Supabase este ciclo — cuadragésimo
  sexto ciclo consecutivo (212º-260º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-17-2244.md`.

### Cierre 2026-09-18 (ciclo 03:43 UTC, 261º, MODO CICLO)
- `kimiko_drafts` comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`: las 4 filas históricas siguen `hecho`, sin `en_curso`
  colgado, sin orden de Telegram este ciclo.
- Build/lint limpios (36/36 páginas, sin errores). `npm audit` sin cambio
  desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue sin fix
  no-breaking. 8/8 rutas del checklist en 200, `/admin` → `/admin/` →
  `/login/?redirect=%2Fadmin%2F`, `middleware.ts` en la raíz, canonical/
  `og:url`/sitemap (37 `<loc>`)/robots correctos. Vercel: últimos 5
  despliegues `READY`.
- Cuadragésima séptima pasada del check permanente del 211º/212º: rehecho el
  cruce de hash de `ficha_cientifica` desde cero sobre las 52 filas de
  `plants` (columna JSON, no los ficheros de imagen), da los mismos
  **7 grupos / 21 filas** de siempre (6 pares de fichas reales + las 9
  peligrosas compartiendo el placeholder). Sin cambios. `plants`: 52 filas,
  4 publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `lavanda` sigue con `image_cientifica_url`
  rellena pero sin fichero en disco (hallazgo desde 2026-09-03, despublicada,
  sin blast radius).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Repasados los 22 publicados: sin títulos duplicados, `excerpt` <155 car. e
  `image_url` presente en todos.
- `citas`: última fila sigue siendo 3 Juan 1:2 (insertada en el 257º), hueco
  de **~23h47min** al comprobar — justo por debajo del umbral de ~24h, con
  margen mínimo. Muy probable que el próximo ciclo cruce el umbral y toque
  insertar una cita nueva. 42 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2).
- Sin commits de código ni escrituras en Supabase este ciclo — cuadragésimo
  séptimo ciclo consecutivo (212º-261º) sin hallazgos técnicos nuevos en el
  checklist mecánico, y sin hallazgos de negocio nuevos.
- Ver `kimiko/bitacora/2026-09-18-0343.md`.

### Cierre 2026-09-18 (ciclo 08:55 UTC, 262º, MODO CICLO)
- `kimiko_drafts` comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`: las 4 filas históricas siguen `hecho`, sin `en_curso`
  colgado, sin orden de Telegram este ciclo.
- Build/lint limpios (36/36 páginas, sin errores). `npm audit` sin cambio
  desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue sin fix
  no-breaking. 8/8 rutas del checklist en 200, `/admin` → `/admin/` →
  `/login/?redirect=%2Fadmin%2F`, `middleware.ts` en la raíz, canonical/
  `og:url`/sitemap (37 `<loc>`)/robots correctos. Vercel: últimos 5
  despliegues `READY`.
- Cuadragésima octava pasada del check permanente del 211º/212º: rehecho el
  cruce de hash de `ficha_cientifica` desde cero sobre las 52 filas de
  `plants` (columna JSON, no los ficheros de imagen), da los mismos
  **7 grupos / 21 filas** de siempre (6 pares de fichas reales + las 9
  peligrosas compartiendo el placeholder). Sin cambios. `plants`: 52 filas,
  4 publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `lavanda` sigue con `image_cientifica_url`
  rellena pero sin fichero en disco (hallazgo desde 2026-09-03, despublicada,
  sin blast radius).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Repasados los 22 publicados: sin títulos duplicados, `excerpt` <155 car. e
  `image_url` presente en todos.
- **`citas`: el hueco cruzó el umbral de ~24h que el 261º había anticipado**
  (última fila, 3 Juan 1:2 del 257º, tenía ~29h de antigüedad al comprobar).
  Inserté una cita nueva: Cicerón, *De Senectute* (sección XI), traducción
  de Andrew Preston Peabody (1884, dominio público) — "Old age, like
  disease, should be fought against. Care must be bestowed upon the
  health; moderate exercise must be taken; the food and drink should be
  sufficient to recruit the strength, and not in such excess as to become
  oppressive." Verificada con `WebSearch` + `WebFetch` contra Wikisource,
  temática de salud/moderación, sin lenguaje de curación/pseudociencia,
  autor no repetido (comprobado contra los 42 autores previos). `citas`
  pasa de 42 a 43 filas.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2).
- Cuadragésimo octavo ciclo consecutivo (212º-262º) sin hallazgos técnicos
  nuevos en el checklist mecánico de código/build/rutas, y sin hallazgos de
  negocio nuevos. Único cambio real del ciclo: la inserción en `citas`.
- Ver `kimiko/bitacora/2026-09-18-0855.md`.
- Ver `kimiko/bitacora/2026-09-18-0343.md`.

### Cierre 2026-09-18 (ciclo 16:01 UTC, 263º, MODO CICLO)
- `kimiko_drafts` comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`: las 4 filas históricas siguen `hecho`, sin `en_curso`
  colgado, sin orden de Telegram este ciclo.
- Build/lint limpios (`npm run build` exit 0, sin errores). `npm audit` sin
  cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue sin
  fix no-breaking. 8/8 rutas del checklist en 200, `/admin` → `/admin/` →
  `/login/?redirect=%2Fadmin%2F`, `middleware.ts` en la raíz, canonical/
  `og:url`/sitemap (37 `<loc>`)/robots correctos. Vercel: últimos 5
  despliegues `READY`.
- Cuadragésima novena pasada del check permanente del 211º/212º: rehecho el
  cruce de hash de `ficha_cientifica` desde cero sobre las 52 filas de
  `plants` (columna JSON, no los ficheros de imagen), da los mismos
  **7 grupos / 21 filas** de siempre (6 pares de fichas reales + las 9
  peligrosas compartiendo el placeholder). Sin cambios. `plants`: 52 filas,
  4 publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `lavanda` sigue con `image_cientifica_url`
  rellena pero sin fichero en disco (hallazgo desde 2026-09-03, despublicada,
  sin blast radius) — cumple 15 días abierto, anotado como tarea manual.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Repasados los 22 publicados: sin títulos duplicados, `excerpt` <155 car. e
  `image_url` presente en todos.
- `citas`: última fila sigue siendo Cicerón (insertada en el 262º), hueco de
  **~7h06min** — muy por debajo del umbral de ~24h, sin necesidad de
  insertar. 43 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2).
- Cuadragésimo noveno ciclo consecutivo (212º-263º) sin hallazgos técnicos
  nuevos en el checklist mecánico, y sin hallazgos de negocio nuevos. Sin
  commits de código ni escrituras en Supabase este ciclo.

### Cierre 2026-09-18 (ciclo 19:03 UTC, 264º, MODO CICLO)
- `kimiko_drafts` comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`: las 4 filas históricas siguen `hecho`, sin `en_curso`
  colgado, sin orden de Telegram este ciclo.
- Build/lint limpios (`npm run build` exit 0, sin errores). `npm audit` sin
  cambio desde el 223º: 1 moderate, 7 high, 1 critical (total 9). Reverificado
  con `npm audit fix --dry-run`: sigue sin fix no-breaking (solo `--force`,
  que rompe subiendo `next` a 16.3.5 y `next-intl` a 4.14.5). 8/8 rutas del
  checklist en 200 tras el 308 de trailing-slash, `/admin` → `/admin/` →
  `/login/?redirect=%2Fadmin%2F`, `middleware.ts` en la raíz, canonical/
  `og:url`/sitemap (37 `<loc>`)/robots correctos. Vercel: últimos 5
  despliegues `READY`.
- Quincuagésima pasada del check permanente del 211º/212º: rehecho el cruce
  de hash de `ficha_cientifica` desde cero sobre las 52 filas de `plants`
  (columna JSON, no los ficheros de imagen), da los mismos **7 grupos / 21
  filas** de siempre (6 pares de fichas reales + las 9 peligrosas
  compartiendo el placeholder). Sin cambios. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `lavanda` sigue con `image_cientifica_url`
  rellena pero sin fichero en disco (hallazgo desde 2026-09-03, despublicada,
  sin blast radius, ya pasó los 15 días abiertos anotados en el 263º —
  reanotado como tarea manual). `updated_at` máximo sin cambio (2026-09-01) →
  sin auditoría visual completa este ciclo.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Repasados los 22 publicados: sin títulos duplicados, `excerpt` <155 car. e
  `image_url` presente en todos.
- `citas`: última fila sigue siendo Cicerón (insertada en el 262º), hueco de
  **~10h08min** — muy por debajo del umbral de ~24h, sin necesidad de
  insertar. 43 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2).
- Quincuagésimo ciclo consecutivo (212º-264º) sin hallazgos técnicos nuevos en
  el checklist mecánico, y sin hallazgos de negocio nuevos. Sin commits de
  código ni escrituras en Supabase este ciclo.
- Ver `kimiko/bitacora/2026-09-18-1903.md`.
- Ver `kimiko/bitacora/2026-09-18-1601.md`.

### Cierre 2026-09-18 (ciclo 22:24 UTC, 265º, MODO CICLO)
- `kimiko_drafts` comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`: las 4 filas históricas siguen `hecho`, sin `en_curso`
  colgado, sin orden de Telegram este ciclo.
- Build/lint limpios (`npm run build` exit 0, 36/36 páginas, sin errores).
  `npm audit` sin cambio desde el 223º: 1 moderate, 7 high, 1 critical (total
  9), sigue sin fix no-breaking (`--force` sube `next` a 16.3.5 y
  `next-intl` a 4.14.5). 8/8 rutas del checklist en 200 siguiendo
  redirecciones, `/admin` → `/admin/` → `/login/?redirect=%2Fadmin%2F`,
  `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37 `<loc>`)/robots
  correctos. Vercel: últimos 5 despliegues `READY`.
- Quincuagésima primera pasada del check permanente del 211º/212º: rehecho el
  cruce de hash de `ficha_cientifica` desde cero sobre las 52 filas de
  `plants` (columna JSON, no los ficheros de imagen), da los mismos
  **7 grupos / 21 filas** de siempre (6 pares de fichas reales + las 9
  peligrosas compartiendo el placeholder). Sin cambios. `plants`: 52 filas,
  4 publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `lavanda` sigue con `image_cientifica_url`
  rellena pero sin fichero en disco (hallazgo desde 2026-09-03, despublicada,
  sin blast radius). `updated_at` máximo sin cambio (2026-09-01) → sin
  auditoría visual completa este ciclo.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Repasados los 22 publicados: sin títulos duplicados, `excerpt` <155 car. e
  `image_url` presente en todos.
- `citas`: última fila sigue siendo Cicerón (insertada en el 262º), hueco de
  **~13h30min** — muy por debajo del umbral de ~24h, sin necesidad de
  insertar. 43 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2).
- Quincuagésimo primer ciclo consecutivo (212º-265º) sin hallazgos técnicos
  nuevos en el checklist mecánico, y sin hallazgos de negocio nuevos. Sin
  commits de código ni escrituras en Supabase este ciclo.
- Ver `kimiko/bitacora/2026-09-18-2224.md`.

### Cierre 2026-09-19 (ciclo 03:39 UTC, 266º, MODO CICLO)
- `kimiko_drafts` comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`: las 4 filas históricas siguen `hecho`, sin `en_curso`
  colgado, sin orden de Telegram este ciclo.
- Build/lint limpios (`npm run build` exit 0, 36/36 páginas; `npm run lint`
  sin warnings). `npm audit` sin cambio desde el 223º: 1 moderate, 7 high, 1
  critical (total 9), sigue sin fix no-breaking (`--force` sube `next` a
  16.3.5 y `next-intl` a 4.14.5). 8/8 rutas del checklist en 200 siguiendo
  redirecciones, `/admin` → `/admin/` → `/login/?redirect=%2Fadmin%2F`,
  `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37 `<loc>`)/robots
  correctos. Vercel: últimos 5 despliegues `READY`.
- Quincuagésima segunda pasada del check permanente del 211º/212º: rehecho
  el cruce de hash de `ficha_cientifica` desde cero sobre las 52 filas de
  `plants` (columna JSON, no los ficheros de imagen), da los mismos
  **7 grupos / 21 filas** de siempre (6 pares de fichas reales + las 9
  peligrosas compartiendo el placeholder). Sin cambios. `plants`: 52 filas,
  4 publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false`. `lavanda` sigue con `image_cientifica_url`
  rellena pero sin fichero en disco (hallazgo desde 2026-09-03, despublicada,
  sin blast radius, ya 16 días abierto, reanotado como tarea manual).
  `updated_at` máximo sin cambio (2026-09-01) → sin auditoría visual
  completa este ciclo.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Repasados los 22 publicados: sin títulos duplicados, `excerpt` <155 car. e
  `image_url` presente en todos.
- `citas`: última fila sigue siendo Cicerón (insertada en el 262º), hueco de
  **~18h45min** — por debajo del umbral de ~24h, sin necesidad de insertar.
  43 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2).
- Quincuagésimo segundo ciclo consecutivo (212º-266º) sin hallazgos técnicos
  nuevos en el checklist mecánico, y sin hallazgos de negocio nuevos. Sin
  commits de código ni escrituras en Supabase este ciclo.
- Ver `kimiko/bitacora/2026-09-19-0339.md`.

### Cierre 2026-09-19 (ciclo 08:42 UTC, 267º, MODO CICLO)
- `kimiko_drafts` comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`: las 4 filas históricas siguen `hecho`, sin `en_curso`
  colgado, sin orden de Telegram este ciclo.
- Build/lint limpios (`npm run build` exit 0, 36/36 páginas; `npm run lint`
  sin warnings). `npm audit` sin cambio desde el 223º: 1 moderate, 7 high, 1
  critical (total 9), sigue sin fix no-breaking (`--force` sube `next` a
  16.3.5 y `next-intl` a 4.14.5). 8/8 rutas del checklist en 200 siguiendo
  redirecciones, `/admin` → `/admin/` → `/login/?redirect=%2Fadmin%2F`,
  `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37 `<loc>`)/robots
  correctos. Vercel: últimos 5 despliegues `READY`.
- Quincuagésima tercera pasada del check permanente del 211º/212º: rehecho
  el cruce de hash de `ficha_cientifica` desde cero sobre las 52 filas de
  `plants` (columna JSON, no los ficheros de imagen), da los mismos
  **7 grupos / 21 filas** de siempre (6 pares de fichas reales + las 9
  peligrosas compartiendo el placeholder). Confirmado que el par
  `equinacea`/`echinacea` no es riesgo: solo `equinacea` publicada+
  verificada, `echinacea` sigue despublicada. Sin cambios. `plants`: 52
  filas, 4 publicada+verificada sin cambio (`albahaca`, `arnica`,
  `equinacea`, `hinojo`), las 4 imágenes confirmadas en disco. Las 9
  peligrosas confirmadas `publicada=false`. `lavanda` sigue con
  `image_cientifica_url` rellena pero sin fichero en disco (hallazgo desde
  2026-09-03, despublicada, sin blast radius, 16 días abierto, reanotado
  como tarea manual). `updated_at` máximo sin cambio (2026-09-01) → sin
  auditoría visual completa este ciclo.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Repasados los 22 publicados: sin títulos duplicados, `excerpt` <155 car. e
  `image_url` presente en todos.
- `citas`: última fila sigue siendo Cicerón (insertada en el 262º), hueco de
  **~23h43min** — todavía por debajo del umbral de ~24h, sin necesidad de
  insertar, pero se acerca: el próximo ciclo probablemente ya lo supere y
  toque insertar una cita nueva. 43 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2).
- Quincuagésimo tercer ciclo consecutivo (212º-267º) sin hallazgos técnicos
  nuevos en el checklist mecánico, y sin hallazgos de negocio nuevos. Sin
  commits de código ni escrituras en Supabase este ciclo.
- Ver `kimiko/bitacora/2026-09-19-0842.md`.

### Cierre 2026-09-19 (ciclo 15:37 UTC, 268º, MODO CICLO)
- `kimiko_drafts` comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`: las 4 filas históricas siguen `hecho`, sin `en_curso`
  colgado, sin orden de Telegram este ciclo.
- Build/lint limpios. `npm audit` sin cambio desde el 223º: 1 moderate, 7
  high, 1 critical (total 9), sigue sin fix no-breaking. 8/8 rutas del
  checklist en 200 siguiendo redirecciones, `/admin` → `/admin/` →
  `/login/?redirect=%2Fadmin%2F`, `middleware.ts` en la raíz, canonical/
  `og:url`/sitemap (37 `<loc>`)/robots correctos. Vercel: últimos 5
  despliegues `READY`.
- Quincuagésima cuarta pasada del check permanente del 211º/212º: rehecho el
  cruce de hash de `ficha_cientifica` desde cero sobre las 52 filas de
  `plants` (columna JSON), da los mismos **7 grupos / 21 filas** de siempre.
  Sin cambios. `plants`: 52 filas, 4 publicada+verificada sin cambio
  (`albahaca`, `arnica`, `equinacea`, `hinojo`), las 9 peligrosas
  confirmadas `publicada=false`. `lavanda` sigue con `image_cientifica_url`
  rellena pero sin fichero en disco (hallazgo desde 2026-09-03, despublicada,
  sin blast radius, 17 días abierto, reanotado como tarea manual).
  `updated_at` máximo sin cambio (2026-09-01) → sin auditoría visual
  completa este ciclo.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Repasados los 22 publicados: sin títulos duplicados, `excerpt` <155 car. e
  `image_url` presente en todos.
- **`citas`: el hueco cruzó el umbral de ~24h** (última fila, Cicerón del
  262º, ~30h43min de antigüedad al comprobar). Inserté una cita nueva:
  Ralph Waldo Emerson, ensayo *Power* (*The Conduct of Life*, 1860) — "The
  first wealth is health. Sickness is poor-spirited, and cannot serve any
  one: it must husband its resources to live." Verificada contra Project
  Gutenberg #39827, autor nuevo (no repetido entre las 43 filas previas),
  temática de salud, sin lenguaje de curación/pseudociencia. `citas` pasa de
  43 a 44 filas.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2).
- **Mantenimiento propio: `KIMIKO_MEMORIA.md` había crecido a 11344 líneas /
  912KB, por encima del límite de lectura de la herramienta Read (256KB) —
  no se podía leer completo al arrancar el ciclo.** Archivé los ciclos
  1º-198º (2026-07-05 a 2026-09-03) en
  `kimiko/memoria-archivo/archivo-01-ciclos-1-a-198.md` (verificado con
  `diff` que no se perdió ni duplicó nada en el corte) y resumí en "Checks
  críticos" los checks permanentes que solo constaban en el cuerpo movido.
  Fichero principal ahora en ~170KB. **Check permanente nuevo: vigilar el
  tamaño de este fichero y repetir el archivado cuando vuelva a acercarse a
  las 200-250KB**, dejando siempre un resumen de los checks vigentes en la
  sección superior antes de mover el resto.
- Ver `kimiko/bitacora/2026-09-19-1537.md`.

### Cierre 2026-09-19 (ciclo 18:30 UTC, 269º, MODO CICLO)
- `kimiko_drafts` comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`: las 4 filas históricas siguen `hecho`, sin `en_curso`
  colgado, sin orden de Telegram este ciclo.
- Build/lint limpios (`npm run build` exit 0, 36/36 páginas; `npm run lint`
  sin warnings). `npm audit` sin cambio desde el 223º: 1 moderate, 7 high, 1
  critical (total 9), sigue sin fix no-breaking. 8/8 rutas del checklist en
  200 siguiendo redirecciones, `/admin` → `/login/?redirect=%2Fadmin%2F`,
  `middleware.ts` en la raíz, canonical/`og:url`/sitemap (37 `<loc>`)/robots
  correctos. Vercel: últimos 5 despliegues `READY`.
- Quincuagésima quinta pasada del check permanente del 211º/212º: rehecho el
  cruce de hash de `ficha_cientifica` desde cero sobre las 52 filas de
  `plants` (columna JSON), da los mismos **7 grupos / 21 filas** de siempre.
  Sin cambios. `plants`: 52 filas, 4 publicada+verificada sin cambio
  (`albahaca`, `arnica`, `equinacea`, `hinojo`), las 9 peligrosas
  confirmadas `publicada=false`. `lavanda` sigue con `image_cientifica_url`
  rellena pero sin fichero en disco (hallazgo desde 2026-09-03, despublicada,
  sin blast radius, 17 días abierto, reanotado como tarea manual).
  `updated_at` máximo sin cambio (2026-09-01) → sin auditoría visual
  completa este ciclo.
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Repasados los 22 publicados: sin títulos duplicados, `excerpt` <155 car. e
  `image_url` presente en todos.
- `citas`: última fila sigue siendo Emerson (insertada en el 268º), hueco de
  ~2h52min al comprobar — muy por debajo del umbral de ~24h, sin necesidad
  de insertar. 44 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2).
- Quincuagésimo quinto ciclo consecutivo (212º-269º) sin hallazgos técnicos
  nuevos en el checklist mecánico, y sin hallazgos de negocio nuevos. Sin
  commits de código ni escrituras en Supabase este ciclo.
- Ver `kimiko/bitacora/2026-09-19-1830.md`.

### Cierre 2026-09-19 (ciclo 22:14 UTC, 270º, MODO CICLO)
- `kimiko_drafts` comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`: las 4 filas históricas siguen `hecho`, sin `en_curso`
  colgado, sin orden de Telegram este ciclo.
- Build/lint limpios (`npm ci` limpio, 415 paquetes; `npm run build` exit 0,
  36/36 páginas; `npm run lint` sin warnings). `npm audit` sin cambio desde
  el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue sin fix
  no-breaking. 8/8 rutas del checklist en 200 siguiendo redirecciones,
  `/admin` → `/admin/` → `/login/?redirect=%2Fadmin%2F`, `middleware.ts` en
  la raíz, canonical/`og:url`/sitemap (37 `<loc>`)/robots correctos. Vercel:
  últimos 5 despliegues `READY`.
- Quincuagésima sexta pasada del check permanente del 211º/212º: rehecho el
  cruce de hash de `ficha_cientifica` desde cero sobre las 52 filas de
  `plants` (columna JSON), da los mismos **7 grupos / 21 filas** de siempre.
  Sin cambios. `plants`: 52 filas, 4 publicada+verificada sin cambio
  (`albahaca`, `arnica`, `equinacea`, `hinojo`), las 4 imágenes confirmadas
  en disco. Las 9 peligrosas confirmadas `publicada=false`. `lavanda` sigue
  con `image_cientifica_url` rellena pero sin fichero en disco (hallazgo
  desde 2026-09-03, despublicada, sin blast radius, 17 días abierto,
  reanotado como tarea manual).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Repasados los 22 publicados: sin títulos duplicados, `excerpt` <155 car. e
  `image_url` presente en todos, ninguno enlaza a las 9 plantas peligrosas.
- `citas`: última fila sigue siendo Emerson (insertada en el 268º), hueco de
  ~6h37min al comprobar — muy por debajo del umbral de ~24h, sin necesidad
  de insertar. 44 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2).
- Quincuagésimo sexto ciclo consecutivo (212º-270º) sin hallazgos técnicos
  nuevos en el checklist mecánico, y sin hallazgos de negocio nuevos. Sin
  commits de código ni escrituras en Supabase este ciclo.
- Ver `kimiko/bitacora/2026-09-19-2214.md`.

### Cierre 2026-09-20 (ciclo 03:56 UTC, 271º, MODO CICLO)
- `kimiko_drafts` comprobado primero, antes del resto del checklist, pese al
  disparo `schedule`: las 4 filas históricas siguen `hecho`, sin `en_curso`
  colgado, sin orden de Telegram este ciclo.
- Build/lint limpios (`npm ci` limpio, 415 paquetes; `npm run build` exit 0,
  36/36 páginas; `npm run lint` sin warnings). `npm audit` sin cambio desde
  el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue sin fix
  no-breaking. 8/8 rutas del checklist en 200 siguiendo redirecciones,
  `/admin` → `/admin/` → `/login/?redirect=%2Fadmin%2F`, `middleware.ts` en
  la raíz, canonical/`og:url`/`og:image`/sitemap (37 `<loc>`)/robots
  correctos. Vercel: últimos 5 despliegues `READY`.
- Quincuagésima séptima pasada del check permanente del 211º/212º: rehecho el
  cruce de hash de `ficha_cientifica` desde cero sobre las 52 filas de
  `plants` (columna JSON), da los mismos **7 grupos / 21 filas** de siempre.
  Sin cambios. `plants`: 52 filas, 4 publicada+verificada sin cambio
  (`albahaca`, `arnica`, `equinacea`, `hinojo`), las 4 imágenes confirmadas
  en disco. Las 9 peligrosas confirmadas `publicada=false`. `lavanda` sigue
  con `image_cientifica_url` rellena pero sin fichero en disco (hallazgo
  desde 2026-09-03, despublicada, sin blast radius, 17 días abierto,
  reanotado como tarea manual).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Repasados los 22 publicados: sin títulos duplicados, `excerpt` <155 car. e
  `image_url` presente en todos, ninguno enlaza a las 9 plantas peligrosas.
- `citas`: última fila sigue siendo Emerson (insertada en el 268º), hueco de
  ~12h18min al comprobar — muy por debajo del umbral de ~24h, sin necesidad
  de insertar. 44 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2).
- Quincuagésimo séptimo ciclo consecutivo (212º-271º) sin hallazgos técnicos
  nuevos en el checklist mecánico, y sin hallazgos de negocio nuevos. Sin
  commits de código ni escrituras en Supabase este ciclo.
- Ver `kimiko/bitacora/2026-09-20-0356.md`.
- Ver `kimiko/bitacora/2026-09-19-2214.md`.

### Cierre 2026-09-20 (ciclo 09:10 UTC, 272º, MODO CICLO)
- `kimiko_drafts` comprobado primero: sin filas `pendiente` ni `en_curso`, sin
  orden de Telegram este ciclo.
- Build/lint limpios (`npm ci` limpio, 415 paquetes; `npm run build` exit 0,
  36/36 páginas; `npm run lint` sin warnings). `npm audit` sin cambio desde
  el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue sin fix
  no-breaking. 8/8 rutas del checklist en 200 siguiendo redirecciones,
  `/admin` → `/login/?redirect=%2Fadmin%2F`, `middleware.ts` en la raíz,
  canonical/`og:url`/`og:image`/sitemap (37 `<loc>`)/robots correctos.
  Vercel: últimos 5 despliegues `READY`.
- Quincuagésima octava pasada del check permanente del 211º/212º: rehecho el
  cruce de hash de `ficha_cientifica` desde cero sobre las 52 filas de
  `plants`, mismos **7 grupos / 21 filas** de siempre. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), mismo `updated_at`, las 4 imágenes confirmadas en disco. Las 9
  peligrosas confirmadas `publicada=false` una a una. `lavanda` sigue con
  `image_cientifica_url` rellena pero sin fichero en disco (hallazgo desde
  2026-09-03, 17 días abierto, sin blast radius, reanotado como tarea
  manual).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Repasados los 22 publicados: sin títulos duplicados, `excerpt` <155 car. e
  `image_url` presente en todos, ninguno enlaza a las 9 plantas peligrosas.
  Barrido de enlaces internos al diccionario: único slug enlazado es
  `hinojo`, sin enlaces rotos ni a plantas no vivas.
- `citas`: última fila sigue siendo Emerson (268º), hueco de ~17h32min al
  comprobar — por debajo del umbral de ~24h, sin necesidad de insertar.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2).
- Quincuagésimo octavo ciclo consecutivo (212º-272º) sin hallazgos técnicos
  nuevos en el checklist mecánico, y sin hallazgos de negocio nuevos. Sin
  commits de código ni escrituras en Supabase este ciclo.
- Ver `kimiko/bitacora/2026-09-20-0910.md`.

### Cierre 2026-09-20 (ciclo 15:41 UTC, 273º, MODO CICLO)
- `kimiko_drafts` comprobado primero: sin filas `pendiente` ni `en_curso`, sin
  orden de Telegram este ciclo.
- Build/lint limpios (`npm ci` limpio, 415 paquetes; `npm run build` exit 0,
  36/36 páginas; `npm run lint` sin warnings). `npm audit` sin cambio desde
  el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue sin fix
  no-breaking. 8/8 rutas del checklist en 200 siguiendo redirecciones,
  `/admin` → `/admin/` → `/login/?redirect=%2Fadmin%2F`, `middleware.ts` en
  la raíz, canonical/`og:url`/`og:image`/sitemap (37 `<loc>`)/robots
  correctos. Vercel: últimos 5 despliegues `READY`.
- Quincuagésima novena pasada del check permanente del 211º/212º: rehecho el
  cruce de hash de `ficha_cientifica` desde cero sobre las 52 filas de
  `plants`, mismos **7 grupos / 21 filas** de siempre. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), mismo `updated_at`, las 4 imágenes confirmadas en disco. Las 9
  peligrosas confirmadas `publicada=false` una a una. `lavanda` sigue con
  `image_cientifica_url` rellena pero sin fichero en disco (hallazgo desde
  2026-09-03, 18 días abierto, sin blast radius, reanotado como tarea
  manual).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Repasados los 22 publicados: sin títulos duplicados, `excerpt` <155 car. e
  `image_url` presente en todos, ninguno enlaza a las 9 plantas peligrosas.
  Único slug de diccionario enlazado sigue siendo `hinojo`.
- **`citas`: el hueco cruzó el umbral de ~24h** (última fila, Emerson del
  268º, ~24h02min de antigüedad al comprobar). Inserté una cita nueva: James
  Thomson, *The Castle of Indolence*, Canto II, estrofa 55 (1748) — "Health
  is the vital principle of bliss, and exercise, of health." Verificada
  contra Wikisource (texto completo de la estrofa), autor nuevo (no repetido
  entre las 44 filas previas), temática de salud/ejercicio, sin lenguaje de
  curación/pseudociencia. `citas` pasa de 44 a 45 filas.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2).
- Quincuagésimo noveno ciclo consecutivo (212º-273º) sin hallazgos técnicos
  nuevos en el checklist mecánico, y sin hallazgos de negocio nuevos. Sin
  commits de código este ciclo; única escritura fue el `INSERT` en `citas`.
- Ver `kimiko/bitacora/2026-09-20-1541.md`.

### Cierre 2026-09-20 (ciclo 18:34 UTC, 274º, MODO CICLO)
- `kimiko_drafts` comprobado primero: sin filas `pendiente` ni `en_curso`, sin
  orden de Telegram este ciclo.
- Build/lint limpios (`npm ci` limpio, 415 paquetes; `npm run build` exit 0,
  36/36 páginas; `npm run lint` sin warnings). `npm audit` sin cambio desde
  el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue sin fix
  no-breaking. 8/8 rutas del checklist en 200 siguiendo redirecciones,
  `/admin` → `/admin/` → `/login/?redirect=%2Fadmin%2F`, `middleware.ts` en
  la raíz, canonical/`og:url`/`og:image`/sitemap (37 `<loc>`)/robots
  correctos. Vercel: últimos 5 despliegues `READY`.
- Sexagésima pasada del check permanente del 211º/212º: rehecho el cruce de
  hash de `ficha_cientifica` desde cero sobre las 52 filas de `plants`,
  mismos **7 grupos / 21 filas** de siempre. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), mismo `updated_at`, las 4 imágenes confirmadas en disco. Las 9
  peligrosas confirmadas `publicada=false` una a una. `lavanda` sigue con
  `image_cientifica_url` rellena pero sin fichero en disco (hallazgo desde
  2026-09-03, 19 días abierto, sin blast radius, reanotado como tarea
  manual).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Repasados los 22 publicados: sin títulos duplicados, `excerpt` <155 car. e
  `image_url` presente en todos, ninguno enlaza a las 9 plantas peligrosas.
  Único slug de diccionario enlazado sigue siendo `hinojo`.
- `citas`: última fila sigue siendo James Thomson (273º), hueco de ~2h53min
  al comprobar — muy por debajo del umbral de ~24h, sin necesidad de
  insertar. 45 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2).
- Sexagésimo ciclo consecutivo (212º-274º) sin hallazgos técnicos nuevos en
  el checklist mecánico, y sin hallazgos de negocio nuevos. Sin commits de
  código ni escrituras en Supabase este ciclo.
- Ver `kimiko/bitacora/2026-09-20-1834.md`.

### Cierre 2026-09-20 (ciclo 22:17 UTC, 275º, MODO CICLO)
- `kimiko_drafts` comprobado primero: sin filas `pendiente` ni `en_curso`, sin
  orden de Telegram este ciclo.
- Build/lint limpios (`npm ci` limpio, 415 paquetes; `npm run build` exit 0,
  36/36 páginas; `npm run lint` sin warnings). `npm audit` sin cambio desde
  el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue sin fix
  no-breaking. 8/8 rutas del checklist en 200 siguiendo redirecciones,
  `/admin` → `/admin/` → `/login/?redirect=%2Fadmin%2F`, `middleware.ts` en
  la raíz, canonical/`og:url`/sitemap (37 `<loc>`)/robots correctos. Vercel:
  últimos 5 despliegues `READY`.
- Sexagésima primera pasada del check permanente del 211º/212º: rehecho el
  cruce de hash de `ficha_cientifica` desde cero sobre las 52 filas de
  `plants`, mismos **7 grupos / 21 filas** de siempre. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), mismo `updated_at`, las 4 imágenes confirmadas en disco. Las 9
  peligrosas confirmadas `publicada=false` una a una. `lavanda` sigue con
  `image_cientifica_url` rellena pero sin fichero en disco (hallazgo desde
  2026-09-03, 19 días abierto, sin blast radius, reanotado como tarea
  manual).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Repasados los 22 publicados: sin títulos duplicados, `excerpt` <155 car. e
  `image_url` presente en todos, ninguno enlaza a las 9 plantas peligrosas.
  Único slug de diccionario enlazado sigue siendo `hinojo`.
- `citas`: última fila sigue siendo James Thomson (273º), hueco de ~6h36min
  al comprobar — muy por debajo del umbral de ~24h, sin necesidad de
  insertar. 45 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2).
- Sexagésimo primer ciclo consecutivo (212º-275º) sin hallazgos técnicos
  nuevos en el checklist mecánico, y sin hallazgos de negocio nuevos. Sin
  commits de código ni escrituras en Supabase este ciclo.
- Ver `kimiko/bitacora/2026-09-20-2217.md`.
- Ver `kimiko/bitacora/2026-09-20-1834.md`.

### Cierre 2026-09-21 (ciclo 03:53 UTC, 276º, MODO CICLO)
- `kimiko_drafts` comprobado primero: sin filas `pendiente` ni `en_curso`, sin
  orden de Telegram este ciclo.
- Build/lint limpios (`npm ci` limpio, 415 paquetes; `npm run build` exit 0,
  36/36 páginas; `npm run lint` sin warnings). `npm audit` sin cambio desde
  el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue sin fix
  no-breaking. 8/8 rutas del checklist en 200 siguiendo redirecciones,
  `/admin` → `/admin/` → `/login/?redirect=%2Fadmin%2F`, `middleware.ts` en
  la raíz, canonical/`og:url`/sitemap (37 `<loc>`)/robots correctos. Vercel:
  últimos 5 despliegues `READY`.
- Sexagésima segunda pasada del check permanente del 211º/212º: rehecho el
  cruce de hash de `ficha_cientifica` desde cero sobre las 52 filas de
  `plants`, mismos **7 grupos / 21 filas** de siempre. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false` una a una. `lavanda` sigue con
  `image_cientifica_url` rellena pero sin fichero en disco (hallazgo desde
  2026-09-03, 18 días abierto, sin blast radius, reanotado como tarea
  manual).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Repasados los 22 publicados: sin títulos duplicados, ninguno >60 car.,
  `excerpt` <155 car. e `image_url` presente en todos, ninguno enlaza a las 9
  plantas peligrosas. Único slug de diccionario enlazado sigue siendo
  `hinojo`.
- `citas`: última fila sigue siendo James Thomson (273º), hueco de ~12h12min
  al comprobar — muy por debajo del umbral de ~24h, sin necesidad de
  insertar. 45 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2).
- Sexagésimo segundo ciclo consecutivo (212º-276º) sin hallazgos técnicos
  nuevos en el checklist mecánico, y sin hallazgos de negocio nuevos. Sin
  commits de código ni escrituras en Supabase este ciclo.
- Ver `kimiko/bitacora/2026-09-21-0353.md`.

### Cierre 2026-09-21 (ciclo 09:46 UTC, 277º, MODO CICLO)
- `kimiko_drafts` comprobado primero: sin filas `pendiente` ni `en_curso`, sin
  orden de Telegram este ciclo.
- Build/lint limpios (`npm ci` limpio, 415 paquetes; `npm run build` exit 0,
  36/36 páginas; `npm run lint` sin warnings). `npm audit` sin cambio desde
  el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue sin fix
  no-breaking. 8/8 rutas del checklist en 200 siguiendo redirecciones,
  `/admin` → `/admin/` → `/login/?redirect=%2Fadmin%2F`, `middleware.ts` en
  la raíz, canonical/`og:url`/`og:image`/sitemap (37 `<loc>`)/robots
  correctos. Vercel: últimos 5 despliegues `READY`.
- Sexagésima tercera pasada del check permanente del 211º/212º: rehecho el
  cruce de hash de `ficha_cientifica` desde cero sobre las 52 filas de
  `plants`, mismos **7 grupos / 21 filas** de siempre. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false` una a una. `lavanda` sigue con
  `image_cientifica_url` rellena pero sin fichero en disco (hallazgo desde
  2026-09-03, 18 días abierto, sin blast radius, reanotado como tarea
  manual).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Repasados los 22 publicados: sin títulos duplicados, ninguno >60 car.,
  `excerpt` <155 car. e `image_url` presente en todos, ninguno enlaza a las 9
  plantas peligrosas. Único slug de diccionario enlazado sigue siendo
  `hinojo`.
- `citas`: última fila sigue siendo James Thomson (273º), hueco de ~18h05min
  al comprobar — por debajo del umbral de ~24h, sin necesidad de insertar.
  45 filas, sin cambio.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2).
- Sexagésimo tercer ciclo consecutivo (212º-277º) sin hallazgos técnicos
  nuevos en el checklist mecánico, y sin hallazgos de negocio nuevos. Sin
  commits de código ni escrituras en Supabase este ciclo.
- Ver `kimiko/bitacora/2026-09-21-0946.md`.
