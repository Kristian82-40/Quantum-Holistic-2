# Handoff — 2026-04-19

## Estado
**Capa 2 — Perfil Terapeuta MVP ✅** Auth + Chat + Terapeuta funcionando. Middleware de rutas activo.

## Pendientes (priorizados)
1. **Stripe activación** — acción manual de Kristian: completar formulario en dashboard.stripe.com → claves `sk_live_`
2. **Webhook n8n `chat-holistic`** — crear en n8n (:5678): trigger POST → Ollama `host.docker.internal:11434` → log `agent_logs` → Respond
3. **n8n credenciales caducadas** — workflow `Auto-Bitacora Inactividad` (PPchw62Xzdnvf9pT), nodo `UltimaActividad`
4. **Página `/blog` pública** — listar posts de tabla `blog_posts` generados por agente nocturno
5. **Supabase email redirect** — configurar Site URL + Redirect URLs en dashboard para que la confirmación lleve a `/terapeuta` o `/`

## Último commit
Pendiente — ver Tarea 6

## Archivos clave añadidos/modificados
- `middleware.ts` — protección rutas: `/chat`, `/mi-cuenta`, `/terapeuta`, `/admin`
- `app/registro/terapeuta/page.tsx` — signup terapeuta
- `app/terapeuta/page.tsx` — dashboard con estado verificación

## Siguiente paso
Kristian activa Stripe (acción manual). En paralelo, siguiente tarea de código: webhook n8n `chat-holistic`.
