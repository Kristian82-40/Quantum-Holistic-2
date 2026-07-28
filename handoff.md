# Handoff — 2026-07-29 (7ª sesión: causa raíz del barajado, recuperación de 18 fichas)

## ✅ LO PRIMERO: el barajado del diccionario ya tiene causa raíz identificada y cortada

El pendiente #1 del handoff anterior era *"el script que pobló `plants` sigue sin identificarse;
si se vuelve a ejecutar, reintroduce el problema"*. Identificado, demostrado y neutralizado.

### Qué pasó, exactamente

1. **2026-04-29 22:00 / 22:06** — `seed-plants.mjs` y `seed-plants-bloque3.mjs`
   (`/Volumes/Papu Ext/QH-Content/`) insertaron **50 fichas correctas** de un diccionario
   herbolario clásico (albahaca, aloe, árnica… valeriana, zarzaparrilla, brahmi). El upsert va
   **por `id`** (`Prefer: resolution=merge-duplicates`). Los JSON de origen son coherentes: cada
   ficha corresponde a su planta.
2. **2026-05-05** — commit `8b84912` *"fix: update 50 plants correct names latino image urls"*.
   Se reescribió `slug` / `nombre_es` / `nombre_latino` / `image_cientifica_url` **por `id`** con
   un catálogo distinto (el esotérico-mundial: beleño, sidr, datura, acónito, cinamomo…),
   **sin tocar `ficha_cientifica` ni `ficha_mistica`**.
3. **Resultado:** la ficha se quedó pegada al `id`, la identidad de la fila cambió. Fila 8 pasó de
   *Cola de caballo* a *Sidr* conservando la ficha de cola de caballo; fila 22 de *Kava-kava* a
   *Abedul*; fila 44 de *Valeriana* a *Cinamomo*. Eso explica los 3 tóxicos fuera de lista que
   encontró la sesión anterior.

**Prueba:** cotejando `familia_botanica` de cada fila actual contra `app/fichas-50-valid.json`
por `id`, coinciden **1:1 en las 43 filas con ficha**. No es una hipótesis, es el mecanismo.

### Contaminación aguas abajo (nueva)

`agente-plantas.sh` (alias **`qb`**) lee `plants.ficha_cientifica` y genera blog posts con las
`propiedades` e `indicaciones` de la planta. Con las fichas barajadas, atribuye la farmacología
de una especie a otra. Verificado en los 2 posts que llegó a generar:

| draft | ficha que usó de verdad | evidencia |
|---|---|---|
| `echinacea-guia-1779978659` | jengibre (fila 21) | el cuerpo habla de jengibre/náuseas |
| `sidr-espino-de-cristo-guia-1779978766` | cola de caballo (fila 8) | habla de sílice y remineralización |

**Ninguno está publicado** — ambos en `draft`. Ningún post `published` deriva de fichas de planta
(los 11 publicados el 29-may son de bienestar general, sin dosis). Sin contenido dañino en vivo.

## Acciones aplicadas esta sesión

1. **Seeds neutralizados.** `seed-plants.mjs` y `seed-plants-bloque3.mjs` → renombrados a
   `.mjs.DISABLED` con cabecera explicativa y un `throw` al inicio. Ya no se pueden ejecutar por
   accidente. Los JSON de origen se conservan: son el material de recuperación.
2. **`qb` blindado.** `agente-plantas.sh` ahora pide `ficha_verificada=eq.true` y aborta con un
   mensaje claro si no hay ninguna. Hoy aborta (0 verificadas); se reactivará solo a medida que
   se levanten gates. Sintaxis validada.
3. **18 fichas recuperadas.** Emparejadas por `nombre_latino` (2 por sinónimo botánico:
   *Aloe vera ≡ A. barbadensis*, *Ocimum tenuiflorum ≡ O. sanctum*) y restauradas en Supabase —
   `ficha_cientifica` y `ficha_mistica`. **El gate NO se levantó: las 52 siguen en
   `ficha_verificada = false`.** Verificado en producción: 0 patrones de dosificación servidos.
4. **Service role key retirada del código.** Estaba hardcodeada en claro en ambos seeds.
   Sustituida por `process.env.SUPABASE_SERVICE_ROLE_KEY`. Sigue en claro en
   `agente-plantas.sh` y `runner.sh` — ver pendientes.

### Las 18 recuperadas
`albahaca` · `aloe-vera` · `arnica` · `ashwagandha` · `brahmi` · `echinacea` · `equinacea` ·
`ginseng` · `hinojo` · `jengibre` · `lavanda` · `manzanilla` · `salvia` · `sauco` · `tomillo` ·
`tribulus` · `tulsi` · `valeriana`

Excluida a propósito `ashwagandha-fruto`: es una ficha deliberadamente distinta (fruto vs. raíz),
no debe recibir la de la raíz.

Las **25 restantes con ficha** (beleño, sidr, boldo, olivo, muérdago, cinamomo, abedul…) no tienen
ficha correcta en disco — su especie nunca estuvo en el seed original. Hay que escribirlas desde
cero o dejarlas retenidas. Las 9 tóxicas siguen con `ficha_cientifica` vacía.

## 🔴 URGENTE (heredado del ciclo cloud de las 21:15 UTC, reverificado ahora)

**El checkout está caído: `/producto/ritual-descanso` enlaza a un producto Gumroad que da 404.**

| URL | estado |
|---|---|
| `kristian320.gumroad.com/l/ritual-descanso` ← la que sirve producción | **404** |
| `kristiantronco.gumroad.com/l/ugsqtg` ← la anterior | 200 |

`NEXT_PUBLIC_GUMROAD_URL` se cambió a mano en Vercel el 28-jul 18:25 UTC. **No lo he revertido**:
el cambio es una acción humana deliberada y puede ser una migración de cuenta a medias — revertir
mandaría a los compradores al producto de la cuenta antigua. Papu decide: o publicar el producto
en `kristian320`, o devolver la env var a la URL que funciona. Mientras tanto no hay forma de
cobrar, y el fallback de `RitualCheckout.tsx` no cubre este caso (solo cubre "la env var no existe").

## Estado del proyecto
- Producción estable (`quantum-holistic.com`). Gate del diccionario intacto y verificado.
- Funnel: `/regalo/primera-noche` → `leads` → `/producto/ritual-descanso` → **Gumroad 404 (ver arriba)**.
- `leads` y `purchases` en 0 filas.
- `plants`: 52 filas · 43 con ficha (18 ya correctas por especie) · 0 publicables.
- `blog_posts`: 90 drafts / 19 published, sin cambios.

## Archivos modificados esta sesión
- `/Volumes/Papu Ext/QH-Content/seed-plants.mjs` → `.DISABLED` (key retirada)
- `/Volumes/Papu Ext/QH-Content/seed-plants-bloque3.mjs` → `.DISABLED` (key retirada)
- `/Volumes/Papu Ext/scripts/agente-plantas.sh` — guard `ficha_verificada`
- `kimiko/recuperacion/restaurar-fichas-2026-07-29.sql` — las 18 sentencias, para trazabilidad
- `kimiko/recuperacion/fichas-recuperables-2026-07-29.json` — el mapeo especie→ficha
- Supabase: 18 filas de `plants` (`ficha_cientifica` + `ficha_mistica`), sin tocar el gate

## Próximos pasos (ordenados por prioridad)
00. **Papu: arreglar el checkout Gumroad 404** (ver bloque URGENTE arriba). Bloquea todo ingreso.
0. **Revisar y levantar el gate de las 18 recuperadas, una a una.** Ahora es un trabajo de
   *revisión*, no de redacción: la ficha ya corresponde a la especie, falta contrastar posología
   contra fuente farmacognóstica fiable. Empezar por las estrella (lavanda, manzanilla, valeriana,
   ginseng, jengibre). `update plants set ficha_verificada = true where slug = '<slug>';`
   ⚠️ **Nunca ese `update` sin `where`.**
1. **Decidir qué hacer con las 25 fichas sin origen correcto.** Opciones: redactarlas desde cero,
   o dejarlas retenidas indefinidamente y publicar solo un diccionario de ~18 fichas fiables.
2. **Descartar los 2 drafts contaminados** (`echinacea-guia-*`, `sidr-espino-de-cristo-guia-*`):
   están construidos sobre la farmacología de otra planta, no son recuperables editándolos.
3. **Papu: rotar la service role key** — estuvo en claro en 2 scripts del disco y sigue en
   `agente-plantas.sh` y `scripts/runner.sh`. Suma al token OAuth ya pendiente (18+ ciclos).
4. **Imágenes: 5 de 7 verificadas estaban mal (71%).** 36 sin verificar. Decidir fusión
   `echinacea`/`equinacea` (misma especie, y ahora además la misma ficha).
5. Papu: confirmar que el PDF v2 está subido como archivo del producto Gumroad.
6. Papu: permiso Full Disk Access/TCC (bloqueador Kimiko background desde 2026-07-11).
7. Papu: decidir qué hacer con los 90 drafts de blog (10 violan el checklist anti-pseudociencia).
8. Papu: Google Search Console + sitemap; perfiles IG/LinkedIn; aprobar borradores sociales.
9. Vigilar primeras filas en `purchases`/ventas Gumroad.

## Decisiones técnicas tomadas
- **Desactivar en vez de borrar los seeds.** Renombrados con cabecera y `throw`, no eliminados:
  los JSON que consumen son el único material de recuperación que existe.
- **Restaurar sin levantar el gate.** Sustituir una ficha equivocada por la correcta es una mejora
  estricta y reversible, y nada de eso se publica mientras `ficha_verificada` sea `false`. Levantar
  el gate es una decisión de salud que exige revisión humana, y no se tomó.
- **`ficha_mistica` también restaurada.** Sí está publicada, así que el barajado era visible en
  vivo (lavanda mostraba el perfil simbólico de la equinácea). No tiene dosificación, así que
  corregirla es ganancia sin riesgo.
- **Emparejar por `nombre_latino`, nunca por `id`.** El `id` es exactamente lo que causó el fallo.
- **`ashwagandha-fruto` excluida** del emparejamiento pese a compartir binomio con `ashwagandha`.

## Pendiente / deuda técnica heredada (no tocada)
1. `app/` con scaffolding duplicado — no tocar sin auditoría.
2. `/api/webhooks/btcpay` — pasarela cripto descartada por directiva, sigue en el build.
3. 29 imágenes huérfanas en `public/images/plants/` sin fila en Supabase.
4. `npm audit`: 11 high heredadas (`next-intl` etc.) que requieren saltos mayores.
5. PR #2 (equinácea), agente nocturno n8n (`PPchw62Xzdnvf9pT`), imágenes `_pending-approval/`.

## Scripts disponibles
| Script | Función |
|---|---|
| `node scripts/kimiko-qa-nocturna.mjs` | QA 13 checks (requiere `source .env.local`; `env -u NOTION_API_KEY` para no postear bitácora) |
| `node scripts/qh-imagenes-v2.mjs` | Descarga imágenes Wikimedia para slugs faltantes |
| `bash scripts/kimiko-run-all.sh` | Pipeline Kimiko: blog posts + imágenes |
| `bash scripts/auto-flow-state.sh` | Estado del proyecto |
| ~~`qb` / `agente-plantas.sh`~~ | Aborta hasta que haya plantas con `ficha_verificada = true` |

## Referencias
- Auditoría del diccionario: `kimiko/imagenes/auditoria-local.md`
- Mapeo de recuperación: `kimiko/recuperacion/fichas-recuperables-2026-07-29.json`
- Backup pre-restauración: `/Volumes/Papu Ext/QuantumHolistic/backups/plants-full-dump-2026-07-29-pre-restore.json`
- Backup del 28-jul: `/Volumes/Papu Ext/QuantumHolistic/backups/plants-full-dump-2026-07-28.json`
- Commit que causó el barajado: `8b84912` (2026-05-05)
- Producto Gumroad: https://kristiantronco.gumroad.com/l/ugsqtg
- Bitácora "raíz" con mandatos de Papu: https://app.notion.com/p/36c37a0e7b45812f8628f31630109924
