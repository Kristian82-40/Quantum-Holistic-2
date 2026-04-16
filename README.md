# Quantum Holistic 2.0

> Plataforma de bienestar holístico con IA · Bristol, UK · 2026

[![Deploy](https://github.com/Kristian82-40/Quantum-Holistic-2/actions/workflows/nextjs.yml/badge.svg)](https://github.com/Kristian82-40/Quantum-Holistic-2/actions/workflows/nextjs.yml)

**Live:** https://kristian82-40.github.io/Quantum-Holistic-2/

---

## Stack

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript |
| Estilos | CSS Modules + Variables globales |
| Deploy Preview | GitHub Pages |
| Deploy Producción | Vercel |
| Dominio principal | quantumholistic.com |

---

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Desarrollo local
npm run dev
# → http://localhost:3000

# 3. Build de producción
npm run build
```

## Deploy

### GitHub Pages (preview automático)
Cada push a `main` dispara el workflow `.github/workflows/nextjs.yml` que:
1. Hace `npm install && npm run build`
2. Sube el output `out/` a GitHub Pages

### Vercel (producción)
```bash
npm i -g vercel
vercel login
vercel --prod
```

Luego en Vercel Dashboard → Settings → Domains:
- `quantumholistic.com` → dominio principal
- `www.quantumholistic.com` → redirect
- `quantumholistic.io` → redirect automático (next.config.js)

---

## Estructura

```
quantum-holistic/
├── .github/workflows/nextjs.yml  # CI/CD: build + deploy automático
├── app/
│   ├── layout.tsx                # Root layout, metadata, OG, favicon
│   ├── page.tsx                  # Home page (todas las secciones)
│   └── blog/page.tsx             # Blog (placeholder MDX-ready)
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx            # Nav fija con efecto scroll
│   │   └── Footer.tsx
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── MarqueeBand.tsx
│   │   ├── Pillars.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── ProDetail.tsx
│   │   ├── Pricing.tsx           # Toggle mensual/anual, 2 planes
│   │   └── BlogPreview.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Cursor.tsx            # Cursor personalizado
│       └── ScrollReveal.tsx
├── lib/config.ts                 # SSOT: textos, planes, nav links
├── styles/globals.css            # Tokens CSS, dark mode, animaciones
├── next.config.js                # Static export + basePath GitHub Pages
└── vercel.json                   # Región lhr1 (Londres), headers seguridad
```

---

## Planes

| Plan | Precio | Incluye |
|------|--------|---------|
| Freemium | €0 | Acceso básico, sin tarjeta |
| Quantum Pro | €9/mes · €79/año | Protocolo depurativo, videollamadas, optimización por perfil |

---

Proyecto por **Kristian Troncoso** · Bristol, UK · 2026
