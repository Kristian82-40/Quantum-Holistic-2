---
name: qh-editorial
description: Reglas de calidad para publicaciones de Quantum Holistic (blog, fichas de plantas, piezas de redes). Úsala al escribir, revisar, corregir o aprobar un artículo o una ficha, al cambiar los prompts o el filtro legal de Kimiko, y al revisar el SEO de un post.
---

# qh-editorial — contenido de salud y SEO básico

## 1. Reglas de salud (no negociables, UE)
- **Sin promesas de curar, tratar, prevenir o eliminar** enfermedades. Hablar de "uso tradicional", "se ha usado para".
- **Sin dosis:** ni mg, g, ml, gotas, cápsulas, cucharadas ni "veces al día". La dosis la decide un profesional.
- **Sección obligatoria** `## Precauciones y contraindicaciones` (embarazo, lactancia, medicación, alergias de familia botánica).
  Contraindicaciones reforzadas en adaptógenos, ayuno, rasayanas y "detox" hepático.
- **Aviso final** "consulta con un profesional" (lo añade `conAvisoBlog` en `_kimiko/lib/legal.js`).
- Fuera: biodescodificación, nutrición cuántica, cristales, reiki, chakras; absolutos ("garantizado", "100 % seguro",
  "sin efectos secundarios", "deja tu medicación").
- **Las 9 plantas peligrosas** (aconito, datura, datura-metel, amanita-muscaria, cannabis, cornezuelo-centeno, beleno-negro,
  tejo, hierba-mora) no se publican ni protagonizan posts.
- Plantas solo de uso externo (p. ej. árnica): decirlo explícitamente.
- Todo contenido nuevo nace **borrador** (`status = 'draft'`, `published = false`). Publica Kristian.
- El filtro automático es `revisarArticulo` / `revisarClaims` (`_kimiko/lib/legal.js`): si cambias estas reglas,
  cambia también el filtro y su prueba.

## 2. SEO básico de cada post
| Elemento | Regla | Dónde |
|---|---|---|
| Título | único, **< 60 caracteres**, con la planta o el tema delante | `blog_posts.title` |
| Meta descripción | **50–160 caracteres**, frase completa, sin comillas | `blog_posts.excerpt` (la web la usa como `description` y OG) |
| Slug | `AAAA-MM-DD-palabras-clave`, minúsculas, sin tildes, sin palabras vacías al final | `blog_posts.slug` |
| H1 | **una sola**: el título (la pinta la página). En el cuerpo, solo `##` y `###` | `content` |
| Datos estructurados | `Article` (headline, image, datePublished, author, publisher) | **pendiente**: la página `app/blog/[slug]` aún no lo emite |
| Imagen | `image_url` absoluta (https) y **texto alternativo** descriptivo de la especie | `image_url`; alt en la pieza de redes (`texto_alternativo`) |
| Enlace interno | al menos **1 enlace a otro post propio** y, si hay planta, a su ficha `/diccionario/<slug>` | cuerpo |
| Categoría | una de: Herbología, Nutrición, Ayurveda, Bienestar Holístico, Sabiduría | `blog_posts.category` |

La auditoría semanal (`kimiko_auditoria`) vigila slugs duplicados, categorías, imagen y meta de lo publicado.

## 3. Revisión rápida antes de aprobar (checklist)
```
[ ] Sin promesas de salud ni dosis      [ ] Precauciones + aviso final
[ ] Título < 60 y único                 [ ] Meta 50–160
[ ] Slug limpio                          [ ] Sin H1 en el cuerpo
[ ] Imagen correcta de la especie + alt [ ] 1 enlace interno (post) + ficha si aplica
[ ] Categoría de la lista               [ ] Sigue en borrador hasta el "Publicar" de Kristian
```

## 4. Voz
Cercana, serena, informativa, de tradición; español de España; frases cortas; sin tecnicismos sin explicar.
