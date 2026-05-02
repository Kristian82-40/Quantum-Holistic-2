# Handoff — 2026-05-02 · Sesión Web Impecable (responsivo + elementos restaurados)

## Estado
**Producción OK** — Web en verde, desplegando en Vercel ahora

## Deploy actual
- **URL producción**: `quantum-holistic-2.vercel.app`
- **Último commit**: `e5d04dc` — restaurar componentes desconectados
- **Estado Vercel**: Desplegando ✅

## Qué se hizo esta sesión (commits en orden)
1. **Fix crítico servidor**: Eliminado `app/app/` (proyecto B anidado causaba conflicto de rutas `/icon`)
2. **Fix .env.local**: Creado en raíz del proyecto (antes solo existía en `app/`)
3. **next.config.js**: Eliminado `withNextIntl` que generaba rutas `/icon` conflictivas
4. **50 imágenes plantas**: Verificadas todas (plant-01 a plant-50), HTTP 200 en producción
5. **Navbar móvil**: Hamburger menu con overlay + animación X (visible en < 900px)
6. **Footer links**: Todos apuntan a rutas reales (antes eran `#`)
7. **Responsive CSS**: plantas/[slug] hero grid + ProfileCTA quantumGrid (mobile 1 col)
8. **PlantasGrid**: Alt text correcto (`nombre_es — nombre_latino`), lazy loading, hover zoom
9. **favicon + manifest**: SVG leaf icon, webmanifest actualizado
10. `e5d04dc` — **Componentes restaurados**: ChatBot, RomeroPopup, SeasonalPetals, QuoteRail

## Componentes UI restaurados (estaban desconectados)
| Componente | Dónde | Qué hace |
|---|---|---|
| `ChatBot` | `layout.tsx` (global) | Botón flotante chat holístico con Papu Pro |
| `RomeroPopup` | `page.tsx` homepage | Popup planta del mes (3.2s delay, localStorage) |
| `SeasonalPetals` | `page.tsx` homepage | Lluvia de pétalos primavera (marzo-mayo activo) |
| `QuoteRail` | `page.tsx` entre MarqueeBand y StatsBar | Carrusel citas holísticas animado |

## Arquitectura de rutas
```
/                → app/page.tsx
/blog            → app/blog/page.tsx
/blog/[slug]     → app/blog/[slug]/page.tsx
/plantas         → app/plantas/page.tsx
/plantas/[slug]  → app/plantas/[slug]/page.tsx
/recomendador    → app/recomendador/page.tsx
/chat            → app/chat/page.tsx (paywall 5msg/día)
/login           → app/login/page.tsx
/registro        → app/registro/page.tsx
/admin           → app/admin/ (protegido por middleware)
/success, /cancel, /gracias → páginas post-pago
```

## Pendientes (sin cambios desde sesión anterior)
1. **RESEND_API_KEY**: Crear cuenta resend.com + añadir key a Vercel
2. **Verificar dominio en Resend**: Panel Resend → Domains → añadir quantumholistic.com
3. **Dominio propio**: Configurar `quantumholistic.com` en Vercel (acción manual)
4. **Stripe keys live**: Las de producción aún no están configuradas
5. **Blog posts**: 0 en Supabase — ejecutar `qb` para generar contenido herbología

## Estado DB (Supabase vctetjugbvyllwjpxcxh)
- `plants` ✅ (50 plantas) | `profiles` ✅ | `blog_posts` ✅ (vacío) | `chat_usage` ✅ | `leads` ✅

## Acumulado histórico
- Web Vercel ✅ | Diccionario 50 plantas ✅ | Recomendador Dosha ✅
- Blog + agente qb ✅ | Rutina nocturna ✅ | Panel admin completo ✅
- Paywall chat 5msg/día ✅ | Navbar móvil ✅ | Stripe checkout ✅
- Funnel leads ✅ | Vercel Analytics ✅ | SEO plantas ✅
- Arquitectura URL limpia ✅ | Imágenes plantas en producción ✅
- Email bienvenida automático ✅ (falta RESEND_API_KEY en Vercel)
- Web responsive ✅ | SVG inline ✅ | Componentes UI reconectados ✅
