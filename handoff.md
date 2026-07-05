# Handoff — 2026-07-05

## Estado del proyecto
- **Bloque Auth + Captación** (handoff Notion 2026-07-04) ejecutado completo, Pasos 1-5.
- Build local: ✓ 35 rutas, 0 errores.
- PR #2 (equinácea) sigue abierto pendiente merge (pendiente de sesiones anteriores).

## Módulos completados esta sesión
1. **Migración `profiles`** — trigger `handle_new_user()` (auto-insert al registrarse, lee `role` de metadata) + policy pública de lectura para terapeutas verificados. La tabla `profiles` YA EXISTÍA (no se recreó); solo faltaban trigger y policies.
2. **Auth migrado a magic-link** (decisión de Kristian) — `/login`, `/registro` (selector Cliente/Terapeuta) reescritos con `signInWithOtp`, componente compartido `components/auth/MagicLinkForm.tsx`. `/registro/terapeuta` ahora redirige a `/registro`.
3. **`app/auth/callback/route.ts`** — nuevo, intercambia el code del magic-link por sesión.
4. **`middleware.ts` reubicado a la raíz** — estaba en `app/middleware.ts` y Next.js NUNCA lo ejecutaba (bug heredado, protección de rutas inactiva en producción hasta hoy). Ahora protege `/cuenta`, `/terapeuta`, `/admin`. Verificado: build muestra `ƒ Middleware` (antes no aparecía) y `curl` confirma redirect 307 a `/login?redirect=...`.
5. **`/cuenta`** (nueva) — perfil, selector de dosha (Vata/Pitta/Kapha, escribe a Supabase), listado de compras (`purchases` + `products`).
6. **Modal scroll-trigger** `components/ui/CuentaScrollModal.tsx` — aparece al 50% de scroll en `/diccionario`, `/diccionario/[slug]`, `/blog`, `/blog/[slug]`. Una vez por sesión (`sessionStorage`), cerrable, no bloquea en móvil.
7. **`/terapeutas`** (directorio público) + **`/terapeutas/papu`** (perfil destacado del fundador, botón "Reservar consulta · €65" vía mailto). Añadido al nav (`config.ts`).
8. **`KIMIKO_MEMORIA.md`** creado (diario de aprendizaje, Paso 0 del handoff).

## Decisiones técnicas tomadas
- **No se recreó `profiles`**: el handoff de Notion asumía que no existía; auditoría (`list_tables`) mostró que sí, con casi todas las columnas pedidas. Solo se añadió lo que realmente faltaba (trigger + policies). Ver `KIMIKO_MEMORIA.md` para el detalle.
- **Migración completa a magic-link** (no híbrido) — confirmado explícitamente por Kristian en sesión.
- Rol interno sigue siendo `user`/`terapeuta`/`admin` (constraint ya existente en DB) aunque la UI de `/registro` lo etiquete como "Cliente" — evita romper el check constraint y el código ya dependiente de `role==='user'`.
- `app/middleware.ts` (ubicación rota) se borró; la lógica vive ahora solo en `middleware.ts` (raíz).

## Pendiente / deuda técnica detectada (no tocada esta sesión)
1. **`app/` contiene un scaffolding de proyecto duplicado** (`app/package.json`, `app/next.config.js`, `app/tsconfig.json`, `app/vercel.json`, `app/node_modules`, `app/.vercel`, `app/CLAUDE.md`). Next.js lo ignora (App Router solo lee `page.tsx`/`layout.tsx`/`route.ts`) pero es deuda técnica — requiere auditoría antes de limpiar.
2. **Directorio `/terapeutas`** hoy solo muestra a Papu (fundador, hardcoded) — no hay terapeutas verificados reales en `profiles` todavía. Se llenará cuando se aprueben registros vía `/registro` (selector Terapeuta) + verificación manual (`verified=true`).
3. **`especialidad` sigue siendo texto simple** (no array) — el handoff pedía `especialidades text[]`; se mantuvo el campo existente para no romper `app/terapeuta/page.tsx`. Si se necesita multi-especialidad, es una migración aparte.
4. **Reservar consulta** apunta a `mailto:` — pendiente integrar Calendly u otro sistema de citas (explícitamente pospuesto por el handoff).
5. Pendientes heredados de sesiones anteriores sin tocar: PR #2 (equinácea), agente nocturno n8n (`PPchw62Xzdnvf9pT`), imágenes `_pending-approval/` (cannabis, cornezuelo, datura).

## Próximos pasos (ordenados por prioridad)
1. **Commit + push + deploy Vercel** de este Bloque Auth (siguiente acción de esta sesión).
2. **Añadir checks de QA nocturna** para rutas auth (`/login`, `/registro`, `/cuenta`, `/terapeutas` responden 200; tabla `profiles` con trigger activo).
3. Revisar plantilla de bitácora del Plan Maestro (secciones "☀️ Tareas manuales de Papu hoy" y "📚 Aprendí hoy") — pendiente de escribir en Notion al cierre.
4. Pendientes heredados (ver arriba, punto 5).

## Scripts disponibles
| Script | Función |
|---|---|
| `node scripts/qh-imagenes-v2.mjs` | Descarga imágenes Wikimedia para slugs faltantes |
| `bash scripts/kimiko-run-all.sh` | Pipeline Kimiko: genera blog posts + imágenes |
| `bash scripts/auto-flow-state.sh` | Estado del proyecto |
