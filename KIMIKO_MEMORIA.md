# KIMIKO_MEMORIA.md

Diario de aprendizaje de Kimiko (Claude Code). Leer al inicio de cada sesión, actualizar al final: aprendizajes, errores→checks, qué funciona.

---

## 2026-07-05 — Sesión Bloque Auth

### Aprendizajes
- **`profiles` YA EXISTE en Supabase** (proyecto `vctetjugbvyllwjpxcxh`) con casi todas las columnas que el handoff de Notion pedía crear: `id, created_at, updated_at, email, full_name, avatar_url, plan, plan_expires_at, stripe_customer_id, role (user/terapeuta/admin), verified, bio, especialidad, dosha`. RLS activado. 8 migraciones ya aplicadas sobre esta tabla (última: `20260526140842_add_categoria_plants`).
- **Antes de redactar cualquier migración nueva: correr `list_tables` / `list_migrations` primero.** El handoff puede estar desactualizado respecto al estado real de Supabase — pasó en esta sesión (Paso 1 del Bloque Auth asumía que `profiles` no existía).
- **Auth actual usa email+password**, no magic link: `app/login/page.tsx` (`signInWithPassword`), `app/registro/page.tsx` (`signUp` + upsert manual en `profiles`), `app/registro/terapeuta/page.tsx`. El nuevo handoff pide migrar a magic link — es un cambio de UX, no un complemento.
- **`app/middleware.ts` estaba mal ubicado — confirmado y corregido.** Next.js App Router requiere `middleware.ts` en la raíz del proyecto (junto a `package.json`), no dentro de `app/`. Antes del build no aparecía `ƒ Middleware` en el output; tras moverlo a la raíz sí aparece, y `curl` confirma el redirect 307 `/cuenta → /login?redirect=...`. Es decir: la protección de `/terapeuta` y `/admin` estuvo inactiva en producción hasta este commit (`e6cb074`). Vale la pena revisar si hubo acceso indebido mientras estuvo roto.
- **`app/` contiene un scaffolding de proyecto duplicado** (`app/package.json`, `app/next.config.js`, `app/tsconfig.json`, `app/vercel.json`, `app/node_modules`, `app/.vercel`, `app/CLAUDE.md`). Next.js los ignora porque el App Router solo lee `page.tsx`/`layout.tsx`/`route.ts`, pero es deuda técnica — no tocar sin auditoría, no es parte del Bloque Auth.
- **Regla de checks:** antes de ejecutar un "Bloque" completo de un handoff de Notion, contrastar cada paso contra el estado real (schema Supabase, código existente) según CLAUDE.md § Validación Cruzada. Si un paso choca con lo ya implementado, detener ese paso puntual y proponer opciones — no bloquear los demás pasos.

### Qué funciona
- Notion search + fetch para localizar el handoff activo cuando el título de la página no coincide con el contenido (la página se edita in-place, el título queda desactualizado).
- `list_tables` con `verbose:true` da todo el schema + FKs en una sola llamada — mejor que iterar columnas a mano.
- Migraciones incrementales pequeñas (trigger, luego ajuste del trigger) son más seguras que una migración monolítica — permitió corregir el mapeo de `role` sin tocar lo ya aplicado.
- `curl -sL -o /dev/null -w "%{http_code}"` en bucle sobre `npm start` (puerto alterno) es la forma más rápida de verificar rutas 200 antes de dar por cerrado un bloque grande de páginas nuevas.

### Cierre Bloque Auth (2026-07-05)
- Commit `e6cb074` → push `main` → Vercel `dpl_99yqqVLgwAeRWiw7nh6jMqFUnAwF` **READY** en producción (`quantum-holistic.com`).
- Pasos 1-5 completos. Pendiente para la próxima sesión: checks de QA nocturna para rutas auth, y decidir si auditar accesos a `/terapeuta`/`/admin` durante la ventana en que el middleware estuvo inactivo.
