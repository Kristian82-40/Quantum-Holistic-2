---
name: qh-generar-imagenes
description: Generación autónoma de imágenes botánicas científicas para Quantum Holistic. Lee data/pending-images.json, genera {slug}-cientifica.jpg vía Pollinations (keyless) o ModelsLab, guarda en public/images/plants y limpia el pending. Ejecutor previsto: agente Kimiko (fin de semana). Trigger cuando se pida generar/rellenar imágenes de plantas, cerrar huecos del diccionario botánico o procesar el backlog de imágenes.
---

# qh-generar-imagenes

## Qué hace
Convierte el worklist `data/pending-images.json` en imágenes `{slug}-cientifica.jpg`
dentro de `public/images/plants/`, usando un provider de imagen configurable.

## Regla de oro (NO romper)
- Archivo SIEMPRE `{slug}-cientifica.jpg`, SIN número secuencial.
- El slug en Supabase ES el nombre del archivo.
- NUNCA generar las plantas de `data/dangerous-plants.json` (requieren aprobación visual manual).

## Provider (variable)
- `PROVIDER=pollinations` (default) — keyless, 100% free, FLUX. Sin cupo, sin API key.
- `PROVIDER=modelslab` — mejor calidad; requiere `MODELSLAB_API_KEY`.
- Fallback automático: si Pollinations falla y existe `MODELSLAB_API_KEY`, reintenta con ModelsLab.

## Prompt maestro (F2)
`botanical scientific illustration of {nombre_latino} (family {familia})`, acuarela botánica
sobre papel envejecido, planta completa (hojas/flores/raíces) con morfología científicamente
correcta, luz natural suave, paleta terrosa, estilo lámina de herbario vintage, sin texto ni marca.

## Uso
```bash
node scripts/qh-generar-imagenes.mjs                 # todo el pending (no peligrosas)
node scripts/qh-generar-imagenes.mjs sidr hinojo     # solo esos slugs
PROVIDER=modelslab node scripts/qh-generar-imagenes.mjs
FORCE=1 node scripts/qh-generar-imagenes.mjs sidr    # regenerar aunque exista
```

## Flujo
1. Carga `data/pending-images.json` (objetos: slug, nombre_latino, familia, categoria).
2. Excluye las que estén en `data/dangerous-plants.json`.
3. Genera y guarda `{slug}-cientifica.jpg` en `public/images/plants/`.
4. Quita del pending los slugs que aterrizaron correctamente.
5. Tras revisión, `UPDATE plants SET image_cientifica_url='/images/plants/{slug}-cientifica.jpg'`.

## Siguiente paso tras generar
Abrir PR con las imágenes nuevas + el `pending-images.json` actualizado. Aprobación visual
antes de merge. Nunca commitear imágenes peligrosas sin OK explícito de Papu.

## Pipeline autónomo end-to-end (Kimiko)
`scripts/kimiko-pipeline.mjs` encadena TODO sin intervención humana:
`generar → UPDATE Supabase image_cientifica_url → git rama/commit/push → abrir PR`.

- **Generación:** delega en `qh-generar-imagenes.mjs` (provider variable, excluye peligrosas).
- **Supabase:** UPDATE solo de los slugs que aterrizaron este ciclo (service role key de `.env.local`).
- **Git:** NUNCA pushea a main → rama `kimiko/images-<ts>` + PR vía GitHub REST API (`GITHUB_TOKEN`).
- **Deploy:** ocurre solo al hacer **merge** del PR (decisión humana = supervisión). El push no despliega.

```bash
node scripts/kimiko-pipeline.mjs            # ciclo completo (lo que corre el LaunchAgent)
node scripts/kimiko-pipeline.mjs sidr       # solo un slug
DRY_RUN=1 node scripts/kimiko-pipeline.mjs  # genera + Supabase, sin git/PR
```

El LaunchAgent `com.qh.kimiko` ejecuta el **pipeline** (no el generador suelto), cada 4 h.
