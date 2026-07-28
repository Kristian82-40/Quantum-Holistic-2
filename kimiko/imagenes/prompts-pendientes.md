# Prompts pendientes — imágenes botánicas F2

Estilo F2: acuarela botánica científica, fondo neutro, lámina de herbario.
Referencia visual: `assets/ritual-descanso.pdf` (local, no versionado) y
`public/images/plants/equinacea-cientifica.jpg` (única imagen del set verificada
como correcta y de estilo compatible).

Formato de salida: `public/images/plants/{slug}-cientifica.jpg` — es la convención
que lee el código (`app/diccionario/page.tsx:81`). No usar `plantas/*.webp`.

**Lista vacía a fecha 2026-07-28.** No se generó ninguna imagen en el lote 1.

## Cola sugerida para el lote 2 (de `auditoria-local.md` §1)

Slugs con fila en Supabase e imagen confirmada como incorrecta:

- [ ] `manzanilla` — *Matricaria chamomilla* (ahora tiene una foto de granada)
- [ ] `valeriana` — *Valeriana officinalis* (ahora tiene un árbol tropical)
- [ ] `lavanda` — *Lavandula angustifolia* (imagen retirada: era cornezuelo)
- [ ] `echinacea` — decidir antes si se fusiona con `equinacea` (misma especie)

NUNCA generar ni publicar: aconito, datura, datura-metel, amanita-muscaria, cannabis,
cornezuelo-centeno, beleno-negro, tejo, hierba-mora.
