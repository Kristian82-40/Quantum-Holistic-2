# Handoff — 2026-04-30

## Estado
**Capa 2 en progreso** — Web live en Vercel ✅ · Diccionario Botánico completo ✅ · Repo limpio ✅

## Completado (acumulado)
1. **Web en Vercel** ✅ — Build limpio, todas las rutas compilando.
2. **Diccionario Botánico `/plantas`** ✅ — Grid 50 plantas + buscador por nombre/propiedad/elemento.
3. **Fichas individuales `/plantas/[slug]`** ✅ — Ficha científica + sabiduría ancestral.
4. **Tabla `plants` en Supabase** ✅ — 50 plantas IDs 1-50, slug, imagen, ficha_cientifica/mistica (JSONB).
5. **50 imágenes botánicas** ✅ — `public/images/plants/plant-01 a plant-50-cientifica.jpg`.
6. **Migration profiles** ✅ — role, verified, bio, especialidad.
7. **Blog público + admin** ✅ — `/blog`, `/admin/blog` con publicar/rechazar/despublicar.
8. **Agente Plantas local** ✅ — `qb` → genera 3 posts herbología/sesión con papu-pro.
9. **Rutina remota nocturna** ✅ — L-V 2am Madrid, Haiku detecta plantas sin post → email `qb`.
10. **Cleanup repo** ✅ — Eliminados app_next/, archive/, docs/, bitacora/, supabase/.temp/. .gitignore ampliado.
11. **NAV_LINKS sincronizado** ✅ — config.ts raíz incluye Plantas (ROOT ↔ app/).

## Agente nocturno activo
- **Rutina remota:** `trig_01PEZYnHF2xwrXR5ZjCJJuc7` — https://claude.ai/code/routines/trig_01PEZYnHF2xwrXR5ZjCJJuc7
- **Script local:** `qb` → `/Volumes/Papu Ext/scripts/agente-plantas.sh`
- **Logs:** `/Volumes/Papu Ext/logs/agente-plantas-YYYY-MM-DD.log`

## Próximos pasos (por prioridad)
1. **Fichas plantas 31–50** — insertar en Supabase (IDs 31-50 pendientes de generar)
2. **Panel /admin/plantas** — editar fichas sin SQL
3. **Recomendador holístico** — matchear `profiles.dosha` con `plants.ficha_mistica.afinidad_ayurvedica`
4. **Stripe activación** — Manual: dashboard.stripe.com → claves `sk_live_`
5. **Paywall /chat** — 5 msg/día free, ilimitado pro
6. **Navbar móvil** — hamburger menu

## Estado DB (Supabase vctetjugbvyllwjpxcxh)
- `plants`: 50 filas ✅ | `profiles`: role/verified/bio/especialidad ✅ | `blog_posts`: draft/published/rejected ✅

## Decisiones técnicas
- ROOT Navbar usa NAV_LINKS de config.ts raíz (no inline como app/components/layout/Navbar.tsx)
- Two-project: ROOT (dev+next-intl), APP (Vercel, rootDir=app/)
- `@/` en ROOT → raíz repo; en APP → app/
- `localhost:11434` para Ollama desde Next.js; `host.docker.internal:11434` desde Docker/n8n
