# Handoff — 2026-06-11

## Estado del proyecto
- **Deploy Vercel:** main en `e0dea15` — build limpio, push OK, deploy en curso.
- Build local: ✓ 31 rutas, 0 errores TypeScript, lint pass.
- PR #2 (equinácea) sigue abierto pendiente merge.

## Módulo trabajado
Limpieza profunda post-auditoría — reparación de build roto + eliminación de código muerto.

## Archivos modificados
- `package.json` — eliminados scripts `prebuild`, `verify`, `gen:manifest`
- `app/api/chat/route.ts` — fix fallback Ollama: `172.17.0.2` → `localhost`
- `lib/claude.ts` — fix modelo: `phi4-mini` → `process.env.OLLAMA_MODEL || papu-pro:latest`
- `lib/email.ts` — eliminada referencia a diccionario de plantas (ruta eliminada)
- `tests/e2e/site-health.spec.ts` — eliminados tests de `/diccionario` (ruta muerta)

## Eliminado
| Archivo/Dir | Motivo |
|---|---|
| `app/admin/plantas/page.tsx` | Ruta eliminada, commit pendiente |
| `app/api/admin/plantas/route.ts` | Ídem |
| `app/recomendador/page.tsx` | Ruta eliminada, commit pendiente |
| `app/public/` (51 imgs, 14MB) | Directorio no servido por Next.js App Router |
| `lib/stripe.ts` | Stub null, 0 importaciones reales |
| `app/lib/posts.ts` | Duplicado de `lib/posts.ts`, 0 importaciones |
| `app/lib/email.ts` | Duplicado de `lib/email.ts`, 0 importaciones |
| `components/illustrations/LaboratorioNatural.tsx` | 0 importaciones |
| `components/illustrations/ManoSanadora.tsx` | 0 importaciones |
| `scripts/gen-plants-manifest.ts` | Depende de data/*.json inexistentes |
| `scripts/kimiko-pipeline.mjs` | Ídem |
| `scripts/qh-generar-imagenes.mjs` | Ídem |
| `lib/schemas/plant.ts` | Solo usada por scripts eliminados |
| `@anthropic-ai/sdk` (dep) | 0 imports en código |
| `@google/generative-ai` (dep) | 0 imports (Gemini usa fetch directo) |

## Conservado (verificado con grep)
- `next-intl` — usado por `components/providers/LanguageProvider.tsx`
- `CincoElementos.tsx` — usado por `Footer.tsx`
- `PlantaMedicinal.tsx` — usado por `components/sections/Pillars.tsx`
- `QuantumCircle.tsx` — usado por `components/sections/Hero.tsx`
- `lib/email.ts` — usado por `app/api/webhooks/stripe/route.ts`
- `app/lib/stripe.ts` — usado por checkout, success, stripe webhook
- `lib/claude.ts` — usado por `app/api/profile/route.ts`
- `scripts/kimiko-blog-*.mjs` — NO tocados (pipeline Kimiko activo)

## Próximos pasos (ordenados por prioridad)
1. **Verificar deploy Vercel** de `e0dea15` — confirmar 0 errores en producción
2. **Mergear PR #2** (equinácea) → dispara deploy automático
3. **Rebuild diccionario** — cuando llegue el momento, crear `scripts/check-plants.ts` nuevo
4. **Limpiar ramas obsoletas** — `fix/images-and-video-2026-05-13`, `kimiko/images-*` post-merge

## Decisiones técnicas tomadas
- `app/lib/email.ts` eliminado aunque era la versión más moderna: 0 importaciones. La webhook activa usa `lib/email.ts`.
- `next-intl` conservado: `LanguageProvider.tsx` lo usa en el layout raíz.
- Scripts Kimiko blog (`kimiko-blog-catalog.mjs`, `kimiko-blog-pipeline.mjs`, `kimiko-run-all.sh`) intactos.
- Footer y sitemap ya no tenían referencias a `/plantas` ni `/recomendador` — nada que limpiar allí.

## Notas para CLAUDE.md
- Sección 11 menciona `app/admin/plantas` y `/recomendador` — ya no existen.
