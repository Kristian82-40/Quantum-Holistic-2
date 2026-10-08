# Revisión de borradores del blog — 8-oct-2026

Solo informe: **no se ha publicado ni modificado nada**. Revisión con las reglas de `qh-editorial`.

**Prueba:** consultas a `blog_posts` del 8-oct (`status = 'draft' or published = false`) → **88 borradores** de 111 posts.
Comprobaciones automáticas por fila: largo de título y de `excerpt`, sección "Precauciones" (`##` o `<h2>`), mención a
"profesional", contraindicaciones/embarazo, dosis (mg, ml, gotas, cápsulas, cucharadas, "veces al día"), verbos de
promesa (curar, sanar, eliminar, previene, garantiza), H1 en el cuerpo, enlace interno a `/blog/` o `/diccionario/`,
categoría de la lista, imagen https y temas fuera de línea (chakras, reiki, cristales, biodescodificación, nutrición cuántica).
Las frases marcadas se leyeron a mano; el árnica se leyó entero.

## Resumen

| Veredicto | Nº |
|---|---|
| Listo para publicar | **0** |
| Necesita retoque | **25** (1 de hoy + 24, uno por tema) |
| Descartar | **63** (3 pruebas, 29 esbozos vacíos, 8 fuera de línea, 23 duplicados) |

Ningún borrador tiene dosis. Ninguno tiene **enlace interno**. Ninguno de los 87 antiguos cumple el título < 60.

## Fallos comunes de los 24 antiguos que se conservan (aplican a todos salvo que se diga)
- **T**: título de 67–118 caracteres → reescribir a < 60 con la planta o el tema delante.
- **M**: meta (`excerpt`) > 160 → recortar a 50–160.
- **C**: categoría sin normalizar (`nutrición`, `herbología`, `bienestar`, `detox`, `ayurveda`, `sabiduría`) → PR #31 tiene el SQL.
- **P**: falta `## Precauciones y contraindicaciones` (embarazo, lactancia, medicación, alergias).
- **E**: falta enlace a otro post y a la ficha `/diccionario/<slug>`.

## Tabla

| Post (slug) | Listo para publicar | Necesita retoque (cuál) | Descartar (por qué) |
|---|---|---|---|
| **2026-10-08-arnica-ficha-de-la-planta** (hoy) | — | Título 26 ✔, meta 85 ✔, precauciones ✔, aviso ✔, sin dosis ✔. Falta: decir **"solo uso externo"** de forma explícita (regla del árnica) y no usar sobre piel herida; enlace a `/diccionario/arnica` y a otro post; cuerpo muy corto (1.252 car., salió en modo sin IA) | — |
| aceite-de-oliva-virgen-extra-medicina | — | T (83), M (185), C, P, E | — |
| aceite-de-oliva-virgen-extra-medicina-497775 | — | — | Duplicado del anterior; además "cura" en el texto |
| acupuntura-y-auriculoterapia-bases-y-aplicaciones-1780097435 | — | T (71), P, E, quitar H1 del cuerpo, revisar frases de promesa | — |
| acupuntura-y-auriculoterapia-bases-y-aplicaciones-1780092546 | — | — | Duplicado; título 84 y sin contraindicaciones |
| ayuno-intermitente-salud-digestiva-556358 | — | T (75), M (209), C, P **reforzada** (ayuno: embarazo, diabetes, TCA, medicación), E, quitar "eliminando toxinas" | — |
| ayuno-intermitente-desde-la-perspectiva-holistica-1780097353 | — | — | Duplicado; "eliminando toxinas", H1 en el cuerpo |
| ayuno-intermitente-salud-digestiva-497223 | — | — | Duplicado; título 98, sin aviso profesional |
| ayuno-intermitente-salud-digestiva-quantum-holistic | — | — | Duplicado; "limpiar… eliminando toxinas", sin aviso |
| ayurveda-circadiano-comer-segn-las-horas-497873 | — | T (98), M (163), C, P, E, aviso profesional; slug con "segn" (falta la ú) | — |
| ayurveda-circadiano-comer-horas | — | — | Duplicado y esbozo (821 car.) |
| curcuma-y-pimienta-negra-antiinflamatorio-497515 | — | T (89), M (193), C, P (anticoagulantes, cálculos biliares, embarazo), E | — |
| curcuma-pimienta-antiinflamatorio-quantum-holistic | — | — | Duplicado |
| curcuma-y-pimienta-negra-antiinflamatorio-556672 | — | — | Duplicado; sin aviso profesional |
| detox-hepatico-natural-con-plantas-medicinales-1780097992 | — | T (67), quitar H1, E; quitar "elimina toxinas, medicamentos" y "proteger el hígado"; contraindicaciones **reforzadas** (detox hepático) | — |
| detox-primaveral-protocolos-naturales | — | T (105), M (274), C (`detox` no existe), P, E, aviso; quitar "eliminar las toxinas" | — |
| detox-primavera-protocolos-naturales-556863 | — | — | Duplicado; sin imagen; propone limpieza de colon |
| dieta-mediterranea-km0-longevidad | — | T (97), M (178), C, P, E; quitar "garantiza" | — |
| echinacea-guia-1779978659 | — | T (77), M (209), quitar H1, E; **quitar la sección "Elemento, Chakra y Dosha"** (chakras fuera de línea); quitar "poder… para sanar" | — |
| fermentados-naturales-kefir-kombucha-chucrut-inmunidad | — | T (86), C (`ayurveda` no encaja → Nutrición), P (inmunodeprimidos, histamina), E | — |
| fermentados-naturales-…-inmunidad-497467 | — | — | Duplicado; sin aviso profesional |
| fermentados-naturales-…-inmunidad-556622 | — | — | Duplicado; título 113 |
| herbolaria-europea-plantas-medicinales-proximidad-2362000 | — | T (106), M (242), C, P, E | — |
| herboreria-europea-plantas-medicinales-proximidad-497593 | — | — | Duplicado y esbozo (984 car.) |
| hidroterapia-baños-plantas-medicinales-0441000 | — | T (90), M (217), C (`detox`), P, E, aviso; slug con "ñ" | — |
| los-rasayanas-ayurvedicos-elixires-de-longevidad-1780097034 | — | T (72), quitar H1, E; contraindicaciones **reforzadas** (rasayanas: metales pesados en preparados, medicación) | — |
| magnesio-deficiencia-70-porcentaje-poblacion | — | T (75), M (166), C, P (insuficiencia renal), E; verificar la cifra del 70 % con fuente | — |
| magnesio-deficiencia-70-porcentaje-poblacion-497920 | — | — | Duplicado; "eliminar metales pesados" |
| medicina-ayurvedica-doshas-tipo-cuerpo | — | T (93), M (257), C (`detox`), P, E, aviso | — |
| medicina-ayurvedica-tipos-cuerpo-497413 | — | — | Duplicado |
| medicina-ayurvedica-tres-doshas-tipo-cuerpo-556574 | — | — | Duplicado; título 118 |
| microbiota-intestinal-cuidar-segundo-cerebro-8377000-497363 | — | T (72), M (216), C, P, E, aviso; slug con dos números | — |
| microbiota-intestinal-cuidar-segundo-cerebro | — | — | Duplicado; "Panchakarma… eliminar toxinas" |
| mindful-eating-comer-con-conciencia-para-sanar-el-cuerpo-497725 | — | T (76), M (186), C, P (TCA), E, aviso; cambiar "sanar" del título | — |
| mindful-eating-comer-con-conciencia-para-sanar-el-cuerpo | — | — | Duplicado; "forma de sanar tu cuerpo" |
| nutricion-km0-herbologia-plantas-medicinales-de-proximidad-1783698312 | — | T (77), M (167), quitar H1, P (sección), E; **sin imagen**; revisar frases de promesa | — |
| plantas-adaptogenas-para-el-estres-ashwagandha-rhodiola-y-gi-497281 | — | T (100), M (237), C, P **reforzada** (adaptógenos: tiroides, embarazo, antidepresivos), E, aviso; slug cortado | — |
| plantas-adaptogenas-para-el-estres-556408 | — | — | Duplicado |
| plantas-adaptogenas-para-el-estres-ashwagandha-rhodiola-ginseng | — | — | Duplicado; título 104 |
| plantas-medicinales-ansiedad-valeriana-pasiflora-melisa-497822 | — | T (89), M (193), C, P (sedantes, conducción, embarazo), E, aviso | — |
| plantas-medicinales-ansiedad-valeriana-pasiflora-melisa | — | — | Duplicado; frases de promesa |
| sidr-espino-de-cristo-guia-1779978766 | — | T (76), M (178), quitar H1, P (sección), E; **quitar "Elemento, Chakra y Dosha"**; "ayudando a eliminar" | — |
| silicio-organico-articulaciones-fuertes | — | T (87), M (229), C (`ayurveda` → Nutrición), P, E | — |
| silicio-organico-salud-articular-498011 | — | — | Duplicado |
| sueo-melatonina-alimentos-regulan-descanso-556720 | — | T (79), M (193), C, P, E, aviso; slug roto ("sueo") | — |
| sueño-melatonina-alimentos-regulan-descanso | — | — | Duplicado; slug con ñ |
| sueo-melatonina-alimentos-regulan-descanso-497559 | — | — | Duplicado |
| tes-medicinales-para-cada-estacion-498126 | — | T (102), M (193), C, P, E, aviso | — |
| biodescodificacion-y-el-lenguaje-del-cuerpo-1780096414 | — | — | Biodescodificación: fuera de línea editorial |
| chakras-y-alimentacion-colores-que-sanan | — | — | Chakras: fuera de línea; "sanar el chakra" |
| chakras-y-alimentacion-colores-que-sanan-498063 | — | — | Chakras: fuera de línea |
| chakras-y-colores-que-sanan-557229 | — | — | Chakras: fuera de línea; sin imagen |
| cristales-y-gemoterapia-fundamentos-y-practica-1780097196 | — | — | Cristales: fuera de línea |
| los-7-chakras-principales-y-como-equilibrarlos-1780097836 | — | — | Chakras: fuera de línea |
| nutricion-cuantica-y-coherencia-celular-1780097677 | — | — | Nutrición cuántica: fuera de línea |
| reiki-y-bioenergetica-fundamentos-de-la-sanacion-energetica-1780093279 | — | — | Reiki: fuera de línea |
| test-1776203786, test-final-1776203003, test-agente-nocturno | — | — | Filas de prueba (10–29 caracteres) |
| 29 esbozos de abril con `--quantum-holistic-17762…` y `la-sabiduría-del-bambú-japonés-1776202155` (el arte de vivir lento ×3, equilibrio mente-cuerpo ×3, el poder curativo del Ayurveda ×3, el silencio como medicina ×3, filosofía estoica ×2, la luna y el cuerpo ×2, la naturaleza como farmacia ×3, sabiduría del bambú ×5, mindfulness zen ×3, plantas que curan lo que la ciencia no ve ×2) | — | — | Sin contenido real (10–214 caracteres), sin meta; varios títulos con promesa ("curativo", "plantas que curan") |

## Recomendación
1. Kristian decide si se **archivan** los 63 descartes (borrar datos exige su sí; se propone cambiar `status` a `archived`, reversible).
2. Retocar primero el **árnica** (2 frases + 2 enlaces) y los 6 de plantas (cúrcuma, equinácea, adaptógenas, ansiedad, sidr, tés): son los que alimentan el diccionario.
3. Hacer que `kimiko-diario` añada siempre "solo uso externo" cuando la planta lo exija y 1 enlace a la ficha.
