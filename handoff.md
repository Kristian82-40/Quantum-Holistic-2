# Handoff — 2026-04-30 · CEO Session

## Estado
**Funnel de ingresos operativo** — Stripe webhook funcional ✅ · Lead capture activo ✅ · Analytics instalado ✅

## Completado esta sesión (CEO)
1. **Webhook Stripe funcional** ✅ — Ya actualiza `profiles.plan='pro'` en Supabase al pagar. Antes solo hacía console.log.
2. **Lead capture modal** ✅ — Modal aparece al 4º mensaje, oferta "guía de plantas + acceso anticipado Pro"
3. **Tabla `leads` en Supabase** ✅ — email, source, dosha, converted
4. **/admin/leads** ✅ — Panel con KPIs: total leads, convertidos, tasa de conversión + lista emails
5. **Vercel Analytics** ✅ — Instalado en layout.tsx, visible en Vercel dashboard
6. **Fix middleware chat** ✅ — /chat accesible sin login (paywall lo gestiona el componente)

## Acumulado histórico
- Web Vercel ✅ | Diccionario Botánico 50 plantas ✅ | Recomendador Dosha ✅
- Blog + agente qb ✅ | Rutina nocturna ✅ | Panel admin/plantas y admin/blog ✅
- Paywall chat 5msg/día ✅ | Navbar móvil ✅ | Stripe checkout ✅

## Acción manual CRÍTICA (solo Kristian puede hacer esto)
### Para activar cobros reales:
1. Ir a https://dashboard.stripe.com → Developers → API keys
2. Copiar `pk_live_...` y `sk_live_...`
3. Ir a Vercel → quantum-holistic → Settings → Environment Variables
4. Reemplazar `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` y `STRIPE_SECRET_KEY` con las claves live
5. En Stripe → Developers → Webhooks → Add endpoint:
   - URL: `https://quantum-holistic.vercel.app/api/webhooks/stripe`
   - Eventos: `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated`, `invoice.payment_failed`
6. Copiar el webhook secret y actualizar `STRIPE_WEBHOOK_SECRET` en Vercel
7. Hacer Redeploy en Vercel

## Próximos pasos CEO (próxima sesión)
1. **Email de bienvenida automático** — cuando alguien paga → email via n8n/Gmail "Bienvenido a Quantum Pro"
2. **Secuencia nurturing** — 3 emails en 7 días para leads que no convirtieron (papu-pro genera el contenido)
3. **A/B test pricing** — probar €7,9/mes vs €9,9/mes para maximizar conversión
4. **Plan Terapeuta activo** — formulario de aplicación + onboarding
5. **Referidos** — código de descuento por invitar amigos

## Métricas a monitorizar (Vercel Analytics)
- Visitas a /#pricing vs clicks en "Ver planes Pro"
- Visitas a /chat → usuarios que llegan al paywall
- Leads capturados por día (/admin/leads)
- Conversión lead → Pro (columna `converted` en tabla leads)

## Estado DB (Supabase vctetjugbvyllwjpxcxh)
- `plants` ✅ | `profiles` +dosha ✅ | `blog_posts` ✅ | `chat_usage` ✅ | `leads` ✅ (nueva)
