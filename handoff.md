# Handoff — 2026-04-19

## Estado del proyecto
**Capa 1 completada al 95%.** Web Next.js funcional con auth, chat, pricing y i18n. Pendiente test manual end-to-end del chat antes de declarar Capa 1 cerrada.

## Módulos trabajados (resumen multi-sesión)

### i18n (next-intl 4.9.1)
- Modo standalone (sin route-based locale)
- `LanguageProvider` Client Component → lee/escribe `qh-locale` en localStorage
- `NextIntlClientProvider` con `timeZone="Europe/Madrid"`
- Todos los componentes de sección convertidos a `'use client'`
- Arrays via `t.raw('key')`, rich text via `t.rich()`
- Archivos: `messages/es.json`, `messages/en.json`, `components/providers/LanguageProvider.tsx`

### Pricing — 3 planes
- Freemium / Quantum Pro (€9.90/mes · €89/año) / Terapeuta (beta)
- Iconos SVG de métodos de pago inline (Visa, MC, SEPA, Bizum, PayPal)
- Checkout real via `/api/checkout` → Stripe → `/gracias`
- Price IDs actuales: `price_1TNiOk` (mensual) · `price_1TNiOn` (anual)
- ⚠️ Stripe en TEST mode — `charges_enabled: false` hasta verificar cuenta

### Auth (Supabase)
- `/login` → `signInWithPassword` → redirect `/`
- `/registro` → `signUp` + upsert en tabla `profiles` (plan: freemium)
- Tabla `profiles`: `id, email, full_name, plan, stripe_customer_id, plan_expires_at`
- ⚠️ Confirmación de email activa en Supabase — desactivar para dev local

### Chat / papu-pro
- Ruta: `app/api/chat/route.ts` (App Router — crítico, NO en raíz del proyecto)
- Flujo: n8n webhook (10s timeout) → fallback Ollama directo (90s timeout)
- `OLLAMA_URL=http://localhost:11434` (NO usar 172.17.0.2 — IP Docker gateway, no funciona desde Next.js)
- Modelo: `papu-pro:latest` — cold start 30–90s, luego responde en segundos
- UI: `app/chat/page.tsx` — burbujas, auto-scroll, dot de estado
- ⚠️ n8n webhook `chat-holistic` aún no creado — el chat va directo a Ollama por ahora

## Archivos modificados (sesión actual)
- `app/.env.local` → añadido `OLLAMA_URL=http://localhost:11434` y `OLLAMA_MODEL=papu-pro:latest`

## Archivos clave del proyecto
```
app/
├── app/
│   ├── api/chat/route.ts          ← chat endpoint (App Router)
│   ├── api/checkout/route.ts      ← Stripe checkout
│   ├── chat/page.tsx              ← UI del chat
│   ├── login/page.tsx             ← auth login
│   ├── registro/page.tsx          ← auth registro
│   └── gracias/page.tsx           ← success page post-pago
├── components/
│   ├── providers/LanguageProvider.tsx
│   ├── sections/Pricing.tsx
│   └── layout/Navbar.tsx
├── lib/supabase-client.ts
├── messages/es.json · en.json
└── .env.local
```

## Próximos pasos (ordenados por prioridad)

1. **TEST CHAT** — `qw` + abrir `localhost:3001/chat` + enviar mensaje → confirmar respuesta de papu-pro
2. **Test auth** — `localhost:3001/registro` + `/login` (desactivar confirmación email en Supabase si falla)
3. **n8n webhook chat-holistic** — crear en n8n (:5678) para que el chat use el workflow en lugar de Ollama directo
4. **Stripe producción** — completar formulario en dashboard Stripe → cambiar a claves `sk_live_`/`pk_live_` en `.env.local` y Vercel
5. **Gate Capa 1** → cuando chat + auth funcionan, Kristian confirma "web OK" → pasar a Capa 2
6. **Capa 2.1** — GitHub Action Claude Code review (`.github/workflows/claude-review.yml`)
7. **n8n credenciales** — workflow `Auto-Bitacora Inactividad` (PPchw62Xzdnvf9pT) tiene auth caducada en nodo `UltimaActividad`

## Decisiones técnicas tomadas
- `OLLAMA_URL` siempre `localhost:11434` desde Next.js — la IP Docker `172.17.0.2` no es accesible desde fuera del contenedor
- Timeout Ollama: 90s (cold start de papu-pro puede tardar hasta 90s la primera vez)
- `app/api/chat/route.ts` DEBE estar dentro de `app/` — si está en la raíz del proyecto, Next.js no lo registra como ruta
- next-intl standalone (sin layout `[locale]`) — evita reestructurar rutas, persiste locale en localStorage

## Notas para ajustar CLAUDE.md
- Sección 1: URL Ollama corregida a `localhost:11434` (ya actualizado)
- Sección 11: añadido aviso sobre cold start y ruta correcta de app/api
