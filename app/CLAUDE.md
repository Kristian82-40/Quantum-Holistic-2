# Quantum Holistic — Contexto del proyecto

## Stack
- **Framework:** Next.js 14.2.5 con App Router (`/app`)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Deploy:** Vercel (`vercel.json` en raíz)
- **Dev:** `npm run dev` → http://localhost:3000

## Estructura clave
```
app/                  ← App Router (page.tsx, layout.tsx)
components/
  sections/           ← Hero, MarqueeBand, StatsBar, Pillars, HowItWorks,
                         ProDetail, ProfileCTA, Testimonials, Pricing, BlogPreview
  layout/             ← Navbar, Footer
lib/                  ← utilidades compartidas
public/               ← assets estáticos
```

## Servicios externos
- **n8n:** workflows en `~/n8n-data` (symlink → disco Papu Ext)
- **Ollama:** modelos en `~/ollama-data` (gemma3:4b + papu-pro:latest)
- **Dominio:** quantumholistic.com

## Reglas de trabajo
- El disco externo "Papu Ext" es el home real del proyecto
- Nunca tocar `/Users/juliafenton/` ni archivos de Chloe
- Responder siempre en español
- Actuar directamente sin pedir confirmación salvo riesgo de pérdida de datos
