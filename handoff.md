# Handoff — 2026-04-30

## Estado
**Capa 2 en progreso** — Web live en Vercel ✅ · Todas las tareas de la sesión completadas ✅

## Completado (acumulado)
1. **Web en Vercel** ✅
2. **Diccionario Botánico `/plantas`** ✅ — Grid 50 plantas + buscador
3. **Fichas individuales `/plantas/[slug]`** ✅
4. **Tabla `plants` en Supabase** ✅ — 50 filas completas
5. **50 imágenes botánicas** ✅
6. **Migration profiles** ✅ — role, verified, bio, especialidad
7. **Blog público + admin** ✅
8. **Agente Plantas local** ✅ — `qb`
9. **Rutina remota nocturna** ✅ — L-V 2am Madrid
10. **Cleanup repo** ✅
11. **NAV_LINKS sincronizado** ✅
12. **Panel /admin/plantas** ✅ — CRUD visual, editor JSONB, sidebar buscable
13. **Recomendador holístico `/recomendador`** ✅ — quiz 4 preguntas → dosha → plantas filtradas
14. **Paywall /chat** ✅ — 5 msg/día free (localStorage), aviso ≤2, bloqueo con CTA Pro
15. **Navbar móvil** ✅ — hamburger + overlay lateral, links /plantas y /recomendador
16. **Supabase: `dosha` en profiles** ✅ + tabla `chat_usage` + RPCs increment

## Agente nocturno activo
- **Rutina remota:** `trig_01PEZYnHF2xwrXR5ZjCJJuc7`
- **Script local:** `qb` → `/Volumes/Papu Ext/scripts/agente-plantas.sh`

## Próximos pasos (por prioridad)
1. **Stripe activación** — Manual: dashboard.stripe.com → claves `sk_live_` en Vercel env vars
2. **Webhook Stripe en Vercel** — registrar `https://quantum-holistic.vercel.app/api/webhooks/stripe` en Stripe dashboard
3. **Guardar dosha en profiles** — si hay sesión al terminar el quiz, hacer PATCH a profiles.dosha
4. **n8n webhook chat-holistic** — workflow n8n para que el chat pase por n8n antes de Ollama
5. **Navbar: link /chat** — acceso directo al asistente en el nav principal

## Estado DB (Supabase vctetjugbvyllwjpxcxh)
- `plants`: 50 filas ✅ | `profiles`: +dosha ✅ | `blog_posts` ✅ | `chat_usage` ✅

## Decisiones técnicas
- Paywall chat: localStorage para anónimos (sin fricción de login), sin Supabase en el cliente
- Recomendador: quiz client-side, plantas cargadas lazy solo al mostrar resultado
- Admin plantas: fullscreen split-view sin Navbar (sidebar + editor JSONB visual)
- RPCs Supabase SECURITY DEFINER para evitar bloqueo RLS en chat_usage
- Navbar hamburger: overlay backdrop-filter, body overflow:hidden al abrir, cierre al clickar fuera
