# Quantum Holistic — quantumholistic.com

Web corporativa / product landing construida con **Next.js 14 App Router**, lista para desplegar en Vercel.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript |
| Estilos | CSS Modules + Variables globales |
| Deploy | Vercel |
| Dominio principal | quantumholistic.com |
| Dominio secundario | quantumholistic.io → redirect a .com |

---

## Estructura

```
quantum-holistic/
├── app/
│   ├── layout.tsx          # Root layout, metadata global, OG, favicon
│   ├── page.tsx            # Home page (compone todas las secciones)
│   ├── blog/page.tsx       # Blog index (placeholder, listo para expandir)
│   ├── sitemap.ts          # Sitemap automático para SEO
│   └── robots.ts           # robots.txt
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx      # Nav fija con efecto scroll
│   │   └── Footer.tsx      # Footer con columnas y social
│   ├── sections/
│   │   ├── Hero.tsx        # Hero split con cards flotantes
│   │   ├── MarqueeBand.tsx # Banda de texto en loop
│   │   ├── Pillars.tsx     # 3 pilares del método
│   │   ├── HowItWorks.tsx  # 4 pasos + plan de muestra
│   │   ├── ProDetail.tsx   # 6 bloques Quantum Pro (dark bg)
│   │   ├── Pricing.tsx     # Toggle mensual/anual + 2 planes
│   │   └── BlogPreview.tsx # 3 artículos preview
│   └── ui/
│       ├── Button.tsx      # Button con variantes: primary, outline, gold, ghost
│       ├── Cursor.tsx      # Cursor personalizado (client-side)
│       └── ScrollReveal.tsx# IntersectionObserver reveal
├── lib/
│   └── config.ts           # SSOT: textos, planes, pilares, nav links
├── styles/
│   └── globals.css         # Tokens CSS, reset, dark mode, animaciones
├── public/
│   └── site.webmanifest
├── next.config.js          # Redirects .io → .com
└── vercel.json             # Config Vercel: región lhr1, headers seguridad
```

---

## Inicio rápido

```bash
# 1. Clonar / entrar al directorio
cd quantum-holistic

# 2. Instalar dependencias
npm install

# 3. Desarrollo local
npm run dev
# → http://localhost:3000

# 4. Build de producción
npm run build
npm start
```

---

## Deploy en Vercel

### Primera vez

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Login
vercel login

# Deploy (desde la raíz del proyecto)
vercel

# Deploy a producción
vercel --prod
```

### Dominio custom en Vercel

1. Ir a **Vercel Dashboard → Project → Settings → Domains**
2. Añadir `quantumholistic.com` → seguir instrucciones DNS
3. Añadir `www.quantumholistic.com` → redirect a `quantumholistic.com`
4. Añadir `quantumholistic.io` → redirect automático vía `next.config.js`

### DNS recomendada (Cloudflare o tu registrar)

```
# Para quantumholistic.com
A     @       76.76.21.21      (IP de Vercel)
CNAME www     cname.vercel-dns.com

# Para quantumholistic.io (redirect, mismo config)
A     @       76.76.21.21
CNAME www     cname.vercel-dns.com
```

---

## Variables de entorno

Crea `.env.local` para desarrollo:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

En Vercel (Settings → Environment Variables):

```env
NEXT_PUBLIC_SITE_URL=https://quantumholistic.com
```

---

## Roadmap de expansión

### Fase 2 — Blog con MDX
```bash
npm install @next/mdx @mdx-js/react
```
Añadir `app/blog/[slug]/page.tsx` con `generateStaticParams`.

### Fase 3 — Auth + Área privada
```bash
npm install next-auth
```
Añadir `app/dashboard/` con middleware de protección.

### Fase 4 — Integración Claude API (health profiling)
```bash
npm install @anthropic-ai/sdk
```
Crear `app/api/profile/route.ts` con el pipeline de perfilado.

### Fase 5 — Pagos
```bash
npm install stripe
```
Añadir `app/api/checkout/route.ts`.

---

## Favicon & OG Image

Necesitas generar y colocar en `/public/`:

- `favicon.ico`
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png` (180×180)
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`
- `og-image.png` (1200×630) — imagen Open Graph para redes sociales

Herramienta recomendada: [realfavicongenerator.net](https://realfavicongenerator.net)

---

## Paleta de colores

| Variable | Hex | Uso |
|----------|-----|-----|
| `--sage` | `#6B7C5E` | Primario |
| `--sage-light` | `#A8B89A` | Secundario / textos |
| `--gold` | `#C9A84C` | Quantum Pro / acentos |
| `--pro-dark` | `#1E2B1A` | Fondo sección Pro |
| `--cream` | `#F7F4EE` | Fondo secundario |
| `--charcoal` | `#2C2C28` | Texto principal |

---

Proyecto por **Kristian Troncoso** · Bristol, UK · 2026
