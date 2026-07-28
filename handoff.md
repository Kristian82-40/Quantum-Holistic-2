# Handoff — 2026-07-28 (6ª sesión: diccionario contenido, gate `ficha_verificada`)

## ✅ LO PRIMERO: el diccionario ya no publica fichas clínicas falsas

La sesión anterior encontró que `/diccionario/aconito/` servía la ficha del **hinojo** con
posología oral para una planta de dosis letal en miligramos, y vació las 9 fichas tóxicas.
Esta sesión **auditó las 41 fichas restantes: 38 son de otra especie (93% de error)**.

Y la lista de exclusión de 9 se quedaba corta — había **3 especies tóxicas más** publicando
posología ajena, ninguna marcada como peligrosa:

| slug | especie real | lo que servía |
|---|---|---|
| `muerdago` | *Viscum album* (tóxica) | ficha de **ginseng**, "200-400 mg/día" |
| `cinamomo` | *Melia azedarach* (frutos venenosos) | ficha de **valeriana**, "300-600 mg/día" |
| `abedul` | *Betula pendula* | ficha de **kava**, dosis hepatotóxica |

**Contención aplicada y verificada en producción** (commit `b99e6d8`): columna
`plants.ficha_verificada boolean default false` + gate en el frontend. Las 52 fichas responden
200 y **ninguna** sirve posología, principios activos ni evidencia. Sin borrar un solo dato.
Detalle completo en `kimiko/imagenes/auditoria-local.md` §3bis.

## Estado del proyecto
- Producción estable (`quantum-holistic.com`). QA nocturna **13/13**.
- Funnel de monetización operativo: `/regalo/primera-noche` → `leads` →
  `/producto/ritual-descanso` → **Gumroad €19** (https://kristiantronco.gumroad.com/l/ugsqtg).
- `leads` y `purchases` en 0 filas. Backlog: 90 drafts de blog + borradores sociales sin revisar.
- Diccionario: 52 plantas visibles con nombre, imagen y ficha mística. **Ficha clínica retenida
  en las 52** hasta re-verificación humana.

## Módulo trabajado
**Auditoría del contenido de `plants.ficha_cientifica` (lote 2) y contención.**
- Cotejo de `familia_botanica` + `principios_activos` contra `nombre_latino` en las 41 fichas
  con contenido. 38 incorrectas; solo `albahaca`, `arnica` y `ashwagandha` coinciden (por azar
  del barajado, no por estar validadas).
- Se descartó vaciar las 41 fichas: destructivo e irreversible. Se optó por un gate reversible.
- Backup íntegro previo de las 52 filas:
  `/Volumes/Papu Ext/QuantumHolistic/backups/plants-full-dump-2026-07-28.json`

## Archivos modificados esta sesión
- `app/diccionario/[slug]/page.tsx` — gate `ficha_verificada`, aviso de revisión, `<meta>` honesta.
- `app/diccionario/page.tsx` — pide `ficha_verificada`, subtítulo y `<meta>` sin prometer fichas.
- `kimiko/imagenes/auditoria-local.md` — §3bis con la auditoría de las 41 y la contención.
- Supabase: migración `add_ficha_verificada_gate_plants`.

## Próximos pasos (ordenados por prioridad)
0. **Re-verificar las fichas planta a planta y levantar el gate una a una.** Es trabajo de
   contenido, no de código: cotejar cada ficha contra fuente farmacognóstica fiable y hacer
   `update plants set ficha_verificada = true where slug = '<slug>';`.
   ⚠️ **Nunca ese `update` sin `where`** — republicaría el barajado entero.
   Sugerencia: empezar por las 10-15 plantas estrella y dejar el resto en revisión; un
   diccionario con 15 fichas fiables vale más que 52 inventadas.
1. **Decidir el origen del barajado.** El script que pobló `plants` sigue sin identificarse.
   Si se vuelve a ejecutar, reintroduce el problema. Conviene encontrarlo y desactivarlo.
2. **Imágenes: 5 de 7 verificadas estaban mal (71%).** Las 36 restantes sin verificar. Regenerar
   manzanilla, valeriana, lavanda; decidir fusión `echinacea`/`equinacea` (misma especie).
3. **Papu: confirmar que el PDF v2 está subido como archivo del producto Gumroad**
   (compra de prueba recomendada). Opcional: añadir cover.
4. **Papu: rotar el token OAuth expuesto** (bitácoras cloud 2026-07-25 06:22 y 09:52 UTC) —
   lleva 17+ ciclos escalándose sin confirmación de rotación.
5. Papu: permiso Full Disk Access/TCC (bloqueador Kimiko background desde 2026-07-11).
6. Papu: decidir qué hacer con los 90 drafts de blog (10 violan el checklist anti-pseudociencia).
7. Papu: Google Search Console + sitemap; perfiles IG/LinkedIn; aprobar borradores sociales.
8. Vigilar primeras filas en `purchases`/ventas Gumroad.

## Decisiones técnicas tomadas
- **Gate en vez de borrado.** Vaciar 41 fichas más habría destruido el único material de partida
  para la re-verificación. `ficha_verificada boolean default false` consigue el mismo efecto en
  la web (nada publicado) y es reversible planta a planta.
- **La ficha mística se mantiene publicada.** Simbolismo, elemento, chakra y dosha no contienen
  dosificación; aunque estén barajados no son un vector de daño. El diccionario sigue siendo
  navegable y con contenido mientras dura la revisión.
- **Textos corregidos, no solo datos.** El subtítulo de `/diccionario` y los `<meta description>`
  prometían "fichas científicas". Mantenerlos habría sido una promesa falsa.
- **Aviso explícito al usuario** en cada ficha pidiendo no seguir pautas obtenidas antes en esa
  página — quien ya las leyó no se entera de otro modo.

## Pendiente / deuda técnica heredada (no tocada)
1. `app/` con scaffolding duplicado — no tocar sin auditoría.
2. `/api/webhooks/btcpay` — pasarela cripto descartada por directiva, sigue en el build.
3. 30 imágenes huérfanas en `public/images/plants/` sin fila en Supabase.
4. `npm audit`: 11 high heredadas (`next-intl` etc.) que requieren saltos mayores.
5. PR #2 (equinácea), agente nocturno n8n (`PPchw62Xzdnvf9pT`), imágenes `_pending-approval/`.

## Scripts disponibles
| Script | Función |
|---|---|
| `node scripts/kimiko-qa-nocturna.mjs` | QA 13 checks (requiere `source .env.local`; `env -u NOTION_API_KEY` para no postear bitácora) |
| `node scripts/qh-imagenes-v2.mjs` | Descarga imágenes Wikimedia para slugs faltantes |
| `bash scripts/kimiko-run-all.sh` | Pipeline Kimiko: blog posts + imágenes |
| `bash scripts/auto-flow-state.sh` | Estado del proyecto |

## Referencias
- Auditoría del diccionario: `kimiko/imagenes/auditoria-local.md`
- Backup de `plants`: `/Volumes/Papu Ext/QuantumHolistic/backups/plants-full-dump-2026-07-28.json`
- Producto Gumroad: https://kristiantronco.gumroad.com/l/ugsqtg
- Bitácora "raíz" con mandatos de Papu: https://app.notion.com/p/36c37a0e7b45812f8628f31630109924
