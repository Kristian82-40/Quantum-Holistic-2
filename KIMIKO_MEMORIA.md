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
- **El chat de la web (`/api/chat`, `components/ui/ChatBot.tsx`) dependía en
  producción de `N8N_CHAT_WEBHOOK_URL` y `OLLAMA_URL`, dos servicios que solo
  corren en la máquina local de Kristian (ver `app/CLAUDE.md`) — nunca
  alcanzables desde una función serverless de Vercel. Hasta el 278º ciclo
  (2026-09-21, orden de Telegram) esto no se había detectado: el chat llevaba
  desplegado devolviendo siempre el mismo mensaje de error genérico, sin que
  ningún ciclo lo hubiera probado en vivo con una petición `POST` real (el
  checklist del Paso 2.1 solo cubre rutas `GET`). Arreglado en `e957d8a`:
  cuando ambos backends fallan, responde con una búsqueda por palabras clave
  sobre `plants` (publicada+verificada) y `blog_posts` (published) en vez de
  un callejón sin salida — no requiere IA de pago, coherente con coste cero.
  **Check permanente: además del checklist de rutas `GET` del Paso 2.1,
  probar `POST https://quantum-holistic.com/api/chat` con un mensaje real de
  vez en cuando (no hace falta cada ciclo) y confirmar que la respuesta no es
  el fallback genérico salvo que de verdad no haya match de contenido.** Si
  Kristian expone Ollama o n8n con una URL pública y actualiza las env vars
  en Vercel, verificar que la ruta las usa antes de asumir que sigue en modo
  fallback. Detalle en `kimiko/bitacora/2026-09-21-1249.md`.
- **Este fichero (`KIMIKO_MEMORIA.md`) superó el límite de lectura de la
  herramienta Read (256KB) en el ciclo 268º (2026-09-19), con 11344 líneas
  y 912KB acumulados desde el ciclo 1º.** Las entradas de los ciclos 1º-198º
  (2026-07-05 a 2026-09-03) se movieron a
  `kimiko/memoria-archivo/archivo-01-ciclos-1-a-198.md` — consulta histórica
  solo si hace falta, no es necesario leerlo cada ciclo. Los checks
  permanentes que seguían vigentes se resumieron en esta misma sección antes
  de mover el resto. **Repetido en el ciclo 279º (2026-09-21):** el fichero
  volvió a acercarse al umbral (3016 líneas, 197KB) tras 11 días de cierres
  sin archivar; las entradas de los ciclos 199º-260º (2026-09-03 a 2026-09-17)
  se movieron a `kimiko/memoria-archivo/archivo-02-ciclos-199-a-260.md`, sin
  checks permanentes nuevos que resumir (todos los de ese rango ya estaban
  reflejados aquí). **Si este fichero vuelve a acercarse a las 200-250KB
  (~2500-3000 líneas), repetir el mismo movimiento:** resumir aquí cualquier
  check permanente que solo constara en el cuerpo, archivar el resto en un
  fichero nuevo numerado dentro de `kimiko/memoria-archivo/`, y dejarlo
  anotado en esta lista.

---

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

### Cierre 2026-09-21 (ciclo 12:49 UTC, 278º, MODO ORDEN vía Telegram)
- Orden de Kristian: "dime si el bot de la página funciona correctamente, y
  si no, lo reparas". Cicatriz nueva (resumida arriba en los checks
  críticos): el chat de la web llevaba desplegado en producción sin poder
  responder nunca — dependía de `N8N_CHAT_WEBHOOK_URL`/`OLLAMA_URL`, servicios
  solo locales de Kristian, inalcanzables desde Vercel. Nadie lo había
  probado con un `POST` real antes.
- Arreglado en `e957d8a`: fallback de contenido (plantas verificadas + blog
  publicado) por palabras clave cuando n8n/Ollama fallan, en vez del mensaje
  de error genérico. `npm run build` limpio (36/36), probado en local y
  reprobado en caliente contra `quantum-holistic.com/api/chat` tras el
  despliegue (`READY` confirmado por API de Vercel).
- Hallazgo colateral sin tocar: el chip de sugerencia "Romero y memoria" del
  propio `ChatBot.tsx` no tiene ninguna planta `romero` en `plants` (0 filas)
  — desajuste de contenido preexistente entre UI y datos, anotado como tarea
  manual, no como bug de este fix.
- Fila `kimiko_drafts` `69eafe6f-b261-494f-a7a4-f16a47e3cbd1` cerrada `hecho`
  con resumen en `copy`, mismo resumen enviado por Telegram al `chat_id`
  autorizado. Sin más filas `pendiente` en la cola.
- Ver `kimiko/bitacora/2026-09-21-1249.md`.

### Cierre 2026-09-21 (ciclo 18:01 UTC, 279º, MODO CICLO)
- `kimiko_drafts` comprobado primero: sin filas `pendiente` ni `en_curso`, sin
  orden de Telegram nueva este ciclo.
- Build/lint limpios (`npm ci` limpio, 415 paquetes; `npm run build` exit 0,
  36/36 páginas; `npm run lint` sin warnings). `npm audit` sin cambio desde
  el 223º: 1 moderate, 7 high, 1 critical (total 9), sigue sin fix
  no-breaking. 8/8 rutas del checklist en 200 siguiendo redirecciones,
  `/admin` → `/admin/` → `/login/?redirect=%2Fadmin%2F`, `middleware.ts` en
  la raíz, canonical/`og:url`/sitemap (37 `<loc>`)/robots correctos. Vercel:
  últimos 5 despliegues `READY`.
- Sexagésima cuarta pasada del check permanente del 211º/212º: rehecho el
  cruce de hash de `ficha_cientifica` desde cero sobre las 52 filas de
  `plants`, mismos **7 grupos / 21 filas** de siempre. `plants`: 52 filas, 4
  publicada+verificada sin cambio (`albahaca`, `arnica`, `equinacea`,
  `hinojo`), las 4 imágenes confirmadas en disco. Las 9 peligrosas
  confirmadas `publicada=false` una a una. `lavanda` sigue con
  `image_cientifica_url` rellena pero sin fichero en disco (hallazgo desde
  2026-09-03, 20 días abierto, sin blast radius, reanotado como tarea
  manual).
- `blog_posts`: 109 filas (79 draft/22 published/8 rejected), sin cambio.
  Repasados los 22 publicados: sin títulos duplicados, ninguno >60 car.,
  `excerpt` <155 car. e `image_url` presente en todos. Barrido de enlaces
  internos sobre el `content` completo: único slug enlazado sigue siendo
  `hinojo`, ninguna planta peligrosa enlazada.
- **`citas`: el hueco cruzó el umbral de ~24h** (última fila, James Thomson
  del 273º, ~26h20min de antigüedad al comprobar). Inserté una cita nueva:
  Izaak Walton, *The Compleat Angler*, Parte I, Cap. 21 (1653-1655) —
  "Look to your health; and if you have it, praise God, and value it next
  to a good conscience; for health is the second blessing that we mortals
  are capable of; a blessing that money cannot buy." Verificada con
  `WebSearch` contra varias fuentes independientes (azquotes.com,
  libquotes.com), autor nuevo (no repetido entre las 45 filas previas),
  temática de salud, sin lenguaje de curación/pseudociencia. `citas` pasa de
  45 a 46 filas.
- `leads` en 0, `purchases` en 0, `products` sin cambio (2).
- Sexagésimo cuarto ciclo consecutivo (212º-279º) sin hallazgos técnicos
  nuevos en el checklist mecánico, y sin hallazgos de negocio nuevos. Sin
  commits de código este ciclo; única escritura fue el `INSERT` en `citas`.
- Ver `kimiko/bitacora/2026-09-21-1801.md`.
