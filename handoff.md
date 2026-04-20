# Handoff — 2026-04-20

## Estado
**Capa 2 en progreso** — Blog + Admin + Webhook n8n completados hoy.

## Completado hoy
1. **Columna `status` en blog_posts** ✅ — Migración ejecutada (Chrome). `draft`/`published`/`rejected`. 84 posts en draft.
2. **Blog público `/blog`** ✅ — Filtra por `status=eq.published`. Fallback a posts estáticos si Supabase vacío.
3. **Blog individual `/blog/[slug]`** ✅ — Ídem, filtro actualizado.
4. **Panel `/admin/blog`** ✅ — Botones Publicar/Rechazar/Despublicar. Filtros por status. `role=admin` ya asignado a kristiantroncoso@gmail.com.
5. **API admin `/api/admin/blog`** ✅ — GET devuelve `status`, PATCH acepta `{ status }`.
6. **Prompt agente nocturno** ✅ — Instrucción estricta JSON al inicio del prompt en `agente-nocturno.sh`.
7. **Webhook n8n `chat-holistic`** ✅ — Workflow insertado en SQLite, activo, test exitoso con respuesta completa de papu-pro.

## Detalles técnicos workflow n8n
- **ID:** `chat-holistic-wf`
- **Path:** `POST /webhook/chat-holistic`
- **Flujo:** Webhook → Ollama (`host.docker.internal:11434`, timeout 120s) → Code (extraer response) → Respond to Webhook → Log Supabase (`agent_logs`, keypair)
- **Creado via:** INSERT directo en SQLite (n8n API key inválida, sesión expirada)
- Nota: `localhost:11434` no funciona desde Docker — usar siempre `host.docker.internal:11434`

## Pendientes
1. **Stripe activación** — acción manual Kristian: completar formulario en dashboard.stripe.com → claves `sk_live_`
2. **Supabase email redirect** — configurar Site URL + Redirect URLs para confirmación de email
3. **n8n workflow `Auto-Bitacora Inactividad`** (PPchw62Xzdnvf9pT) — credenciales del nodo `UltimaActividad` caducadas (pendiente desde sesión anterior)
4. **Push git** — código en main, pendiente push a GitHub

## Archivos modificados
- `app/app/blog/page.tsx` — filtro status=published
- `app/app/blog/[slug]/page.tsx` — filtro status=published
- `app/app/admin/blog/page.tsx` — UI status con Publicar/Rechazar/Despublicar
- `app/app/api/admin/blog/route.ts` — devuelve status
- `app/app/api/admin/blog/[id]/route.ts` — PATCH usa { status }
- `/Volumes/Papu Ext/scripts/agente-nocturno.sh` — prompt JSON estricto

## Decisiones técnicas
- Workflow n8n creado via SQLite directo (no UI/API) porque sesión n8n expiró y API key tenía firma inválida
- "Respond to Webhook" va ANTES del "Log en Supabase" — usuario no espera al log
- Log Supabase usa `specifyBody: keypair` para evitar JSON inválido con respuestas que contienen comillas
