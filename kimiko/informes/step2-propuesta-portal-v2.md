# Step 2 — Propuesta de portada, mapa de áreas y 3 direcciones visuales

**Fecha:** 24-nov-2026 · Autor: Claude Code (encargo v2)
**Estado:** ⏸ PARAR AQUÍ — esperando elección de Kristian

Contexto: La auditoría de diseño del 8-oct (`kimiko/informes/diseno.md`) ya describía los 10 problemas principales y propuso A/B/C. Esta propuesta parte de ahí y la extiende con la visión de portal (encargo 24-nov).

---

## 1. Esquema de portada (bloques)

La portada es la puerta del portal, no una página de ventas. Muestra lo que existe, indica lo que viene, y lleva al visitante al contenido que le interesa.

```
┌─────────────────────────────────────────────────────────────┐
│  NAVBAR · Logo + áreas principales + Login                   │
├─────────────────────────────────────────────────────────────┤
│  HERO                                                         │
│  Titular claro (sin promesas de IA que no existen)           │
│  2 CTAs: "Explorar plantas" (→ /diccionario) + "Leer blog"  │
│  Elemento visual: lámina de acuarela de planta de temporada  │
├─────────────────────────────────────────────────────────────┤
│  LO ÚLTIMO                                                    │
│  1 tarjeta grande: el post o la ficha más reciente           │
│  Estilo: "fresco" — foto real, fecha, 1 línea de extracto    │
├─────────────────────────────────────────────────────────────┤
│  MAPA DEL PORTAL (6–7 tarjetas de área)                       │
│  Blog · Diccionario · Terapeutas (existen hoy)               │
│  Libros · Talleres · Juegos (próximamente)                   │
│  Tarjetas con icono botánico, nombre, descripción breve      │
├─────────────────────────────────────────────────────────────┤
│  LOS TRES PILARES                                             │
│  Nutrición km0 · Herbología verificada · Bienestar holístico │
│  (ya existe como sección «Pillars», solo ajustar textos)     │
├─────────────────────────────────────────────────────────────┤
│  PLANTA DE TEMPORADA                                          │
│  1 ficha del diccionario en versión card: foto, nombre,      │
│  usos principales, contraindicaciones, → "Ver ficha completa"│
│  Rota cada semana (Kimiko la elige)                           │
├─────────────────────────────────────────────────────────────┤
│  BLOG · ÚLTIMAS PIEZAS                                        │
│  3 tarjetas con imagen real, título, extracto, fecha         │
│  → "Ir al blog"                                              │
├─────────────────────────────────────────────────────────────┤
│  CTA FINAL                                                    │
│  «Únete a la comunidad» → formulario de email               │
│  o «Sesión con el especialista» → /terapeutas/papu           │
├─────────────────────────────────────────────────────────────┤
│  FOOTER · Logo + áreas + correo + redes + legal              │
└─────────────────────────────────────────────────────────────┘
```

**Lo que desaparece** (Step 0, ya en PR #109):
- Sección «Tu plan personalizado» (formulario con API rota)
- Sección «Proceso / La IA analiza y conecta»
- Referencias a Quantum Pro con protocolos que no existen

**Lo que se simplifica:**
- «Quantum Pro» pasa a ser un bloque pequeño dentro del mapa del portal, con estado «lista de espera»

---

## 2. Mapa de áreas del portal

| Área | Ruta | Estado | Descripción |
|---|---|---|---|
| **Blog** | `/blog` | ✅ Existe | Artículos de herbología, nutrición y bienestar. Kimiko escribe cada día. |
| **Diccionario** | `/diccionario` | ✅ Existe (9 fichas visibles de 57) | Fichas de plantas con usos tradicionales, contraindicaciones y fuentes. |
| **Terapeutas** | `/terapeutas` | ✅ Existe (1 perfil: Kristian) | Directorio de especialistas. Sesión 1:1 a 65 €. |
| **Libros** | `/libros` (nuevo) | 🔜 Próximamente | Guías y recetarios descargables. |
| **Talleres** | `/talleres` (nuevo) | 🔜 Próximamente | Talleres presenciales y online de herbología. |
| **Juegos** | `/juegos` (nuevo) | 🔜 Próximamente | Herramientas interactivas (identificador de plantas, calculadora de estación). |
| **Quantum Pro** | `/#pricing` | ⏳ Lista de espera | Plan de seguimiento personalizado. En desarrollo. |

Las áreas «próximamente» se muestran con una tarjeta atenuada y una etiqueta «Pronto». No se ocultan: anuncian el portal que viene.

---

## 3. Tres direcciones visuales

Los tokens de color actuales: `--sage` #a8d8a8, `--cream` #faf8f3, `--gold` #d4a853, `--earth` #8b6914, `--charcoal` #2d3a2e, `--pro-dark` #1a2e1a. Fuentes: Cormorant Garamond (títulos) + DM Sans (cuerpo).

---

### A. «Herbario abierto» ✦ Recomendada

**Concepto:** Un herbario impreso, abierto encima de una mesa de trabajo. Crema dominante, láminas de acuarela como imágenes, tipografía editorial.

| Elemento | Propuesta | Hoy |
|---|---|---|
| Fondo base | `--cream` en toda la web | Verde noche en el hero |
| Hero | Lámina de acuarela de planta de temporada a sangre por la derecha, titular en `--charcoal` | Degradado oscuro + SVG |
| Navbar | Logo en `--charcoal`, fondo `--cream` semi-transparente | Logo verde sobre verde |
| Tarjetas blog | Imagen real de lámina (ya generadas por Kimiko), borde `--sage` fino | Icono genérico gris |
| Acento | `--gold` solo en números, filetes y CTAs secundarios | `--gold` difuso |
| Área «próximamente» | Tarjeta atenuada con fondo `--cream` + borde `--sage` punteado | No existe |
| Contraste | Todo WCAG AA: títulos `--charcoal`/crema 11:1, cuerpo 7:1, pie arreglado | Pie con ~2:1 |

**Por qué funciona:** Es la extensión natural del diccionario (ya usa este estilo) hacia toda la web. Las láminas de acuarela ya existen (Kimiko las genera con Workers AI). Mínimo trabajo de imagen nuevo.

**Effort:** Medio. Requiere cambiar el hero, el navbar y las tarjetas de blog.

---

### B. «Cuaderno de campo»

**Concepto:** Un cuaderno de naturalista con anotaciones a mano. Más personal y artesanal; ideal si quieres que la web se sienta como un diario de exploración botánica.

| Elemento | Propuesta |
|---|---|
| Fondo base | `--cream` con una textura de papel muy sutil (CSS, sin imagen) |
| Hero | Título grande en Cormorant con una acuarela en fondo difuminado; sin foto de planta |
| Detalles | Subrayados a mano (`border-bottom` ondulado en `--earth`), anotaciones cortas en márgenes |
| Tarjetas | Esquinas redondeadas grandes, sombra suave `--earth`, etiqueta manuscrita en la esquina |
| Separadores | Líneas de acuarela horizontales entre secciones (SVG simple) |
| Contraste | WCAG AA completo |

**Por qué funciona:** Destaca por originalidad. Encaja con la voz editorial de Kimiko (íntima, experta).

**Effort:** Alto. Requiere nuevos detalles de UI y más decisiones visuales.

---

### C. «Farmacia artesanal»

**Concepto:** Una farmacia herbolaria de los años 20. Verde oscuro solo en el hero y el footer; el resto en crema cálida. Tipografía más condensada, etiquetas de frasco.

| Elemento | Propuesta |
|---|---|
| Hero | `--pro-dark` (#1a2e1a) con logo y menú en `--cream` (arregla el contraste sin cambiar el tono oscuro) |
| Resto de la web | `--cream` |
| Tarjetas | Estilo «etiqueta de frasco»: borde dorado fino, nombre en mayúsculas pequeñas, número de «lote» (fecha) |
| Áreas | Iconos SVG simples estilo botánico (hoja, flor, raíz) en `--earth` |
| CTAs | Botones con borde `--charcoal` y texto `--charcoal`; hover a `--pro-dark` con texto `--cream` |
| Contraste | WCAG AA completo |

**Por qué funciona:** Conserva parte de la identidad «verde oscuro» actual, que algunos usuarios ya reconocen. Es el cambio más pequeño en términos de código.

**Effort:** Bajo-medio. Solo ajusta el hero y las tarjetas.

---

## 4. Tabla de comparación

| Criterio | A · Herbario abierto | B · Cuaderno de campo | C · Farmacia artesanal |
|---|---|---|---|
| Cambio visual respecto a hoy | Grande | Grande | Pequeño |
| Effort de implementación | Medio | Alto | Bajo |
| Encaja con láminas de acuarela actuales | ✅ Perfecto | ✅ Bien | ⚠️ Parcial |
| Originalidad | Alta | Muy alta | Media |
| Riesgo de rotura | Bajo | Medio | Bajo |
| Primera impresión en móvil | Warm, invita a leer | Artesanal, curioso | Clásico, familiar |

---

## 5. Mi recomendación

**A. «Herbario abierto»** — porque:
1. Las láminas de acuarela ya existen (Kimiko las genera, están en la base).
2. Es la extensión del diccionario, que ya funciona bien visualmente.
3. Resuelve de un golpe los 3 problemas principales de la auditoría de octubre (contraste del logo, falta de imagen, tono equivocado).
4. Effort medio, riesgo bajo, resultado muy visible.

---

## 6. ¿Qué necesito de Kristian?

**Responde aquí o por Telegram con una letra: A, B o C.**

Una vez que eliges:
1. Implemento el sistema de diseño (tokens, tipografía, WCAG AA).
2. Rutas `/es` y `/en` (internacionalización básica).
3. Tarjetas de blog con imagen real.
4. Sección «Lo último».
5. Vista previa en Vercel antes de fusionar. Nada va a `main` sin tu ✅.

Los textos de cada sección nueva los presentaré antes de fusionar.

---

*Generado por Claude Code · 24-nov-2026 · Referencia: `kimiko/informes/diseno.md` (8-oct)*
