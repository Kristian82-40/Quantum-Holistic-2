# KIMIKO_MEMORIA.md

Diario de aprendizaje de Kimiko (Claude Code). Leer al inicio de cada sesión, actualizar al final: aprendizajes, errores→checks, qué funciona.

---

## 2026-07-05 — Sesión Bloque Auth

### Aprendizajes
- **`profiles` YA EXISTE en Supabase** (proyecto `vctetjugbvyllwjpxcxh`) con casi todas las columnas que el handoff de Notion pedía crear: `id, created_at, updated_at, email, full_name, avatar_url, plan, plan_expires_at, stripe_customer_id, role (user/terapeuta/admin), verified, bio, especialidad, dosha`. RLS activado. 8 migraciones ya aplicadas sobre esta tabla (última: `20260526140842_add_categoria_plants`).
- **Antes de redactar cualquier migración nueva: correr `list_tables` / `list_migrations` primero.** El handoff puede estar desactualizado respecto al estado real de Supabase — pasó en esta sesión (Paso 1 del Bloque Auth asumía que `profiles` no existía).
- **Auth actual usa email+password**, no magic link: `app/login/page.tsx` (`signInWithPassword`), `app/registro/page.tsx` (`signUp` + upsert manual en `profiles`), `app/registro/terapeuta/page.tsx`. El nuevo handoff pide migrar a magic link — es un cambio de UX, no un complemento.
- **`app/middleware.ts` está mal ubicado.** Next.js App Router requiere `middleware.ts` en la raíz del proyecto (junto a `package.json`), no dentro de `app/`. Tal como está, el archivo probablemente NUNCA se ejecuta — el middleware de protección de rutas (`/mi-cuenta`, `/terapeuta`, `/admin`) puede estar inactivo en producción. Pendiente de confirmar y corregir.
- **`app/` contiene un scaffolding de proyecto duplicado** (`app/package.json`, `app/next.config.js`, `app/tsconfig.json`, `app/vercel.json`, `app/node_modules`, `app/.vercel`, `app/CLAUDE.md`). Next.js los ignora porque el App Router solo lee `page.tsx`/`layout.tsx`/`route.ts`, pero es deuda técnica — no tocar sin auditoría, no es parte del Bloque Auth.
- **Regla de checks:** antes de ejecutar un "Bloque" completo de un handoff de Notion, contrastar cada paso contra el estado real (schema Supabase, código existente) según CLAUDE.md § Validación Cruzada. Si un paso choca con lo ya implementado, detener ese paso puntual y proponer opciones — no bloquear los demás pasos.

### Qué funciona
- Notion search + fetch para localizar el handoff activo cuando el título de la página no coincide con el contenido (la página se edita in-place, el título queda desactualizado).
- `list_tables` con `verbose:true` da todo el schema + FKs en una sola llamada — mejor que iterar columnas a mano.
