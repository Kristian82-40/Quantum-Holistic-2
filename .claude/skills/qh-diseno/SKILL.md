---
name: qh-diseno
description: Diseño y UI de q-h.com (Quantum Holistic) con la marca real del código. Úsala para cualquier cambio visual, de maquetación, de conversión o de imágenes de la web, y para auditorías de diseño. Se apoya en la skill frontend-design (plugin oficial) para el criterio estético.
---

# qh-diseno — marca, móvil primero, antes y después

Si está disponible, carga también la skill **`frontend-design`** (plugin oficial `frontend-design` de
`claude-plugins-official`). Esta skill manda sobre ella en todo lo que sea marca de Quantum Holistic.

## Tokens de marca (fuente: `app/styles/globals.css`, 8-oct-2026)
Usar **siempre** las variables CSS, nunca el hexadecimal suelto.

| Papel | Variable | Valor |
|---|---|---|
| Verde principal | `--sage` / `--sage-light` / `--sage-pale` | #6B7C5E / #A8B89A / #EEF1EA |
| Tierra | `--earth` / `--earth-light` | #8B6F52 / #C4A882 |
| Dorado (acentos, nunca texto largo) | `--gold` / `--gold-pale` | #C9A84C / #F0E4C0 |
| Fondos | `--white` / `--cream` | #FDFCF9 / #F7F4EE |
| Texto | `--charcoal` / `--charcoal-mid` | #2C2C28 / #4A4A44 |
| Oscuro de marca | `--pro-dark` | #1E2B1A |
| Semánticos | `--bg-primary`, `--bg-secondary`, `--text-primary`, `--text-muted`, `--border` | (con modo oscuro) |

- **Tipografías:** títulos `--font-serif` (Cormorant Garamond), texto `--font-sans` (DM Sans).
- Espacios `--space-xs…2xl`, ancho `--max-width` (1200px), animación `--ease-out` y `--dur-fast/mid/slow`.
- **Deuda conocida (no ampliarla):** el bloque antiguo `--color-tierra/crema/dorado/noche/bosque` y `--font-cuerpo`
  (Inter) solo se usa 2 veces; Inter se descarga sin necesidad. Las imágenes de Kimiko (`_kimiko/lib/imagen.js`,
  `COLORES_QH`) usan otra paleta (Brand_Bible_v1). Si tocas eso, unifica hacia los tokens de esta tabla en un PR aparte.

## Estética de imagen
Acuarela botánica **semitraslúcida** con detalles realistas sutiles, fondo crema, salvia y dorado suaves, mucho aire,
**sin texto, sin personas, sin manos**. Plantas: lámina de herbario (`tipo: cientifica` en `kimiko-imagen`).
Generar con la Edge Function `kimiko-imagen` (Workers AI, gratis). No Pollinations.
Antes de guardar una imagen de planta, mirarla y comprobar que es la especie correcta.

## Método
1. **Antes:** captura de la página afectada en móvil (390×844) y escritorio (1440×900) de producción.
   Con Claude in Chrome: `resize_window` + captura; o la vista previa de Vercel.
2. **Móvil primero:** diseñar a 390px; después ampliar. Toques ≥ 44px, texto base ≥ 16px, sin scroll horizontal.
3. Para cambios grandes, **2–3 direcciones** con captura o maqueta antes de programar; Kristian elige.
4. Cambio mínimo en CSS Modules / `globals.css`, reutilizando tokens. Sin librerías de UI nuevas sin preguntar.
5. **Después:** mismas capturas en la vista previa del PR. En el PR, antes/después lado a lado.
6. Contraste AA (4,5:1 en texto). Dorado sobre crema no pasa para texto: úsalo en bordes, iconos y detalles.
7. Lighthouse (rendimiento, accesibilidad, SEO) de la vista previa; no empeorar ninguna cifra.

## No hacer
- Rediseñar el embudo de pago o el checkout (estrategia sin aprobar, ver `kimiko/PROMPT.md` 2.5).
- Añadir fuentes, colores o sombras fuera de los tokens.
- Dar por buena una página sin verla en móvil.
