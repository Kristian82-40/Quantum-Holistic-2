# Handoff — 2026-04-30 · Sesión Arquitectura + Despliegue + Email

## Estado
**Producción OK** — Web en verde, email automático implementado y desplegado

## Deploy actual
- **URL producción**: `quantum-holistic-2-fdcft78bh-kristiantroncoso-8620s-projects.vercel.app`
- **Último commit**: `2d269b0` — email bienvenida Resend
- **Estado Vercel**: READY ✅

## Qué se hizo esta sesión (todo en orden)
1. `1fc57ca` — Navbar/Footer en /recomendador + 51 imágenes plantas en public/images/
2. `2d269b0` — Email automático bienvenida (Resend) en webhook Stripe

## Arquitectura de rutas CORRECTA
```
/                → app/page.tsx
/blog            → app/blog/page.tsx
/blog/[slug]     → app/blog/[slug]/page.tsx
/plantas         → app/plantas/page.tsx
/plantas/[slug]  → app/plantas/[slug]/page.tsx
/recomendador    → app/recomendador/page.tsx  ← tiene Navbar+Footer ahora
/chat            → app/chat/page.tsx (paywall 5msg/día)
/login           → app/login/page.tsx
/registro        → app/registro/page.tsx
/admin           → app/admin/ (protegido por middleware)
/success, /cancel, /gracias → páginas post-pago
```

## Email automático — PENDIENTE UNA ACCIÓN MANUAL
El código está desplegado. Solo falta activarlo:

**Pasos para Kristian:**
1. Crear cuenta en **resend.com** (gratis, 100 emails/día)
2. Ir a API Keys → crear una nueva
3. Añadir a Vercel: `vercel env add RESEND_API_KEY production`
4. Hacer redeploy: `vercel deploy --prod` (o esperar al próximo push)

Una vez hecho, cada nuevo pago Pro dispara automáticamente un email de bienvenida al cliente.

El sender está configurado como `hola@quantumholistic.com` — Resend requiere verificar el dominio en su panel.

## Regla crítica para futuros deploys
Siempre añadir dependencias al ROOT `package.json` Y al `app/package.json`.

## Próximos pasos CEO (en orden)
1. **RESEND_API_KEY**: Crear cuenta resend.com + añadir key a Vercel (ver arriba)
2. **Verificar dominio en Resend**: Panel Resend → Domains → añadir quantumholistic.com
3. **Dominio propio**: Configurar `quantumholistic.com` en Vercel (acción manual)
4. **Stripe keys live**: Las de producción aún no están configuradas
5. **Plan Terapeuta**: formulario activo + onboarding

## Estado DB (Supabase vctetjugbvyllwjpxcxh)
- `plants` ✅ | `profiles` ✅ | `blog_posts` ✅ | `chat_usage` ✅ | `leads` ✅

## Acumulado histórico
- Web Vercel ✅ | Diccionario 50 plantas ✅ | Recomendador Dosha ✅
- Blog + agente qb ✅ | Rutina nocturna ✅ | Panel admin completo ✅
- Paywall chat 5msg/día ✅ | Navbar móvil ✅ | Stripe checkout ✅
- Funnel leads ✅ | Vercel Analytics ✅ | SEO plantas ✅
- Arquitectura URL limpia ✅ | Imágenes plantas en producción ✅
- Email bienvenida automático ✅ (falta RESEND_API_KEY en Vercel)
