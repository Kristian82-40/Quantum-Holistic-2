# PROJECT_CONTEXT — Quantum Holistic
**Última actualización:** 2026-05-12 · Generado automáticamente

---

## 📋 Estado Ejecutivo
- **Producción:** quantum-holistic-2.vercel.app ✅
- **Último commit:** 8fb2197 (2026-05-07)
- **DB:** Supabase vctetjugbvyllwjpxcxh | 50 plantas, diccionario 70, blog vacío
- **Tokens consumidos hoy:** [auto-actualizar]

---

## 🏗️ Stack
| Layer | Tech | URL/ID |
|-------|------|--------|
| **Frontend** | Next.js 14 (App Router) + Tailwind | `/Volumes/Papu Ext/Dev/QuantumHolistic/project/quantum-holistic` |
| **Backend** | Supabase PostgreSQL | Project ID: `vctetjugbvyllwjpxcxh` |
| **Hosting** | Vercel | `quantum-holistic-2` |
| **Repo** | GitHub | `Kristian82-40/Quantum-Holistic-2` |
| **Docs** | Notion | [workspace conectado a Cowork] |

---

## 🗂️ Rutas Principales
```
/                  → Homepage + SeasonalPetals + QuoteRail
/diccionario       → Atlas 70 plantas (tabs: Maestras, Medicinales, Sagradas)
/plantas           → Grid 50 plantas Lamiaceae
/plantas/[slug]    → Ficha individual + recomendador
/recomendador      → Dosha quiz
/blog              → Blog index (0 posts)
/blog/[slug]       → Blog post
/chat              → Paywall 5 msg/día
/admin             → Panel (protegido con middleware, TODO)
/login, /registro  → Auth
```

---

## 🔑 Tablas Supabase
| Tabla | Rows | Estado | Notas |
|-------|------|--------|-------|
| `plants` | 50 | ✅ | Lamiaceae Lamiaceae seed |
| `blog_posts` | 0 | ⏳ | Usar `qb` para generar |
| `profiles` | [N] | ✅ | Auth users |
| `chat_usage` | [N] | ✅ | Tracking paywall |
| `leads` | [N] | ✅ | Form submissions |

---

## 🟡 Pendientes Capa 2 (ACTIVOS)
1. **Middleware route protection** — `/admin` + auth-only routes
2. **Resend email** — RESEND_API_KEY a Vercel + domain verify
3. **Stripe live keys** — Cambiar test→prod en Vercel

---

## ⚙️ Agentes + Coordinación
| Agente | Rol | Acceso |
|--------|-----|--------|
| **Claude.ai (Cowork)** | Orquesta + monitoreo | Vercel, Supabase, Notion, GitHub, Gmail, Drive |
| **Claude Code** | Edits + commits + npm | Terminal + git |
| **Chrome Agent** | UI manual | Vercel dashboard, Supabase Studio, n8n |

---

## 📊 Validadores (QH-CI-VALIDATE)
- [ ] `plants` schema matches Supabase
- [ ] Todas imágenes en Vercel = HTTP 200
- [ ] Slugs únicos, sin duplicados
- [ ] fichas-metadata.json es JSON válido + sync con DB
- [ ] Alt text en todas imágenes
- [ ] Build local sin errores
- [ ] ENV vars en Vercel completas

---

## 🚀 Próximos 3 Pasos (Ordenado por impacto)
1. **Middleware protection** — Bloquear `/admin` sin auth
2. **Resend setup** — Email automático en prod
3. **Stripe live** — Paywalls reales

## Last Flow State Check — 2026-05-12T19:12:25

🔍 FLOW STATE — 2026-05-12T19:12:25

✅ Estado:
   Proyecto en producción. Última entrega hace 5 días.
   Diccionario: 70 plantas en DB. Web estable en Vercel.

⚠️ Problemas detectados:
   - n8n Auto-Bitacora: credencial caducada (2026-05-06)
   - Stripe: aún en test mode, paywall no activo
   - Supabase: Email redirect URLs no configuradas

→ PRÓXIMOS 3 PASOS (por impacto + dependencias):
   1. 🔧 Middleware protection (/admin routes) — bloquea 2 features
   2. 📧 Resend email setup — depende de URL config en Supabase
   3. 💳 Stripe live keys — manual en dashboard, habilita paywall

—— Fuentes Verificadas ——
# Handoff — 2026-05-07 · Diccionario Atlas + Capa 2 pendiente
c2e18f4 fix(diccionario): use exact filenames with tildes/ñ instead of slugify
✓ Notion Bitácora (últimas 3 entradas):
✓ Vercel (últimas 5 deployments):
✓ Supabase plants table: 45 rows

Duración: ~5s | Tokens: ~800

---

## Last Flow State Check — 2026-05-12T19:19:25

🔍 FLOW STATE — 2026-05-12T19:19:25

✅ Estado:
   Proyecto en producción. Última entrega hace 5 días.
   Diccionario: 70 plantas en DB. Web estable en Vercel.

⚠️ Problemas detectados:
   - n8n Auto-Bitacora: credencial caducada (2026-05-06)
   - Stripe: aún en test mode, paywall no activo
   - Supabase: Email redirect URLs no configuradas

→ PRÓXIMOS 3 PASOS (por impacto + dependencias):
   1. 🔧 Middleware protection (/admin routes) — bloquea 2 features
   2. 📧 Resend email setup — depende de URL config en Supabase
   3. 💳 Stripe live keys — manual en dashboard, habilita paywall

—— Fuentes Verificadas ——
# Handoff — 2026-05-07 · Diccionario Atlas + Capa 2 pendiente
c2e18f4 fix(diccionario): use exact filenames with tildes/ñ instead of slugify
✓ Notion Bitácora (últimas 3 entradas):
✓ Vercel (últimas 5 deployments):
✓ Supabase plants table: 45 rows

Duración: ~5s | Tokens: ~800

---

## Last Flow State Check — 2026-05-12T21:42:51

🔍 FLOW STATE — 2026-05-12T21:42:51

✅ Estado:
   Proyecto en producción. Última entrega hace 5 días.
   Diccionario: 70 plantas en DB. Web estable en Vercel.

⚠️ Problemas detectados:
   - n8n Auto-Bitacora: credencial caducada (2026-05-06)
   - Stripe: aún en test mode, paywall no activo
   - Supabase: Email redirect URLs no configuradas

→ PRÓXIMOS 3 PASOS (por impacto + dependencias):
   1. 🔧 Middleware protection (/admin routes) — bloquea 2 features
   2. 📧 Resend email setup — depende de URL config en Supabase
   3. 💳 Stripe live keys — manual en dashboard, habilita paywall

—— Fuentes Verificadas ——
# Handoff Quantum Holístico - Última actualización: 2026-05-12
c2e18f4 fix(diccionario): use exact filenames with tildes/ñ instead of slugify
✓ Notion Bitácora (últimas 3 entradas):
✓ Vercel (últimas 5 deployments):
✓ Supabase plants table: 45 rows

Duración: ~5s | Tokens: ~800

---

## Last Flow State Check — 2026-05-12T21:47:25

🔍 FLOW STATE — 2026-05-12T21:47:25

✅ Estado:
   Proyecto en producción. Última entrega hace 5 días.
   Diccionario: 70 plantas en DB. Web estable en Vercel.

⚠️ Problemas detectados:
   - n8n Auto-Bitacora: credencial caducada (2026-05-06)
   - Stripe: aún en test mode, paywall no activo
   - Supabase: Email redirect URLs no configuradas

→ PRÓXIMOS 3 PASOS (por impacto + dependencias):
   1. 🔧 Middleware protection (/admin routes) — bloquea 2 features
   2. 📧 Resend email setup — depende de URL config en Supabase
   3. 💳 Stripe live keys — manual en dashboard, habilita paywall

—— Fuentes Verificadas ——
✓ handoff.md (Última actualización: 2026-05-12)
✓ git: c2e18f4 fix(diccionario): use exact filenames with tildes/ñ instead of slugify
✓ Notion Bitácora (últimas 3 entradas)
✓ Vercel (últimas 5 deployments)
✓ Supabase plants table: 45 rows

Duración: ~5s | Tokens: ~800

---

## Last Flow State Check — 2026-05-12T21:54:34

🔍 FLOW STATE — 2026-05-12T21:54:34

✅ Estado:
   Proyecto en producción. Última entrega hace 5 días.
   Diccionario: 70 plantas en DB. Web estable en Vercel.

⚠️ Problemas detectados:
   - n8n Auto-Bitacora: credencial caducada (2026-05-06)
   - Stripe: aún en test mode, paywall no activo
   - Supabase: Email redirect URLs no configuradas

→ PRÓXIMOS 3 PASOS (por impacto + dependencias):
   1. 🔧 Middleware protection (/admin routes) — bloquea 2 features
   2. 📧 Resend email setup — depende de URL config en Supabase
   3. 💳 Stripe live keys — manual en dashboard, habilita paywall

—— Fuentes Verificadas ——
✓ handoff.md (Última actualización: 2026-05-12)
✓ git: c2e18f4 fix(diccionario): use exact filenames with tildes/ñ instead of slugify
✓ Notion Bitácora (últimas 3 entradas)
✓ Vercel (últimas 5 deployments)
✓ Supabase plants table: 45 rows

Duración: ~5s | Tokens: ~800

---

## AI Collaboration (Claude + Grok) - Actualizado 12 mayo 2026
- **Única fuente de verdad**: PROJECT_CONTEXT.md + AI_COLLABORATION.md
- Motor central: QH-FLOW-STATE (funciona en terminal y dentro de Cowork con /flow-state)
- Flujo recomendado: QH-FLOW-STATE → elegir tarea → Claude Code → Grok (cuando se necesite terminal, scripts o validación)
- Todo el conocimiento de este chat largo queda guardado en AI_COLLABORATION.md

## Last Flow State Check — 2026-05-13T08:07:40

🔍 FLOW STATE — 2026-05-13T08:07:40

✅ Estado:
   Proyecto en producción. Última entrega hace 5 días.
   Diccionario: 70 plantas en DB. Web estable en Vercel.

⚠️ Problemas detectados:
   - n8n Auto-Bitacora: credencial caducada (2026-05-06)
   - Stripe: aún en test mode, paywall no activo
   - Supabase: Email redirect URLs no configuradas

→ PRÓXIMOS 3 PASOS (por impacto + dependencias):
   1. 🔧 Middleware protection (/admin routes) — bloquea 2 features
   2. 📧 Resend email setup — depende de URL config en Supabase
   3. 💳 Stripe live keys — manual en dashboard, habilita paywall

—— Fuentes Verificadas ——
✓ handoff.md (Última actualización: 2026-05-12)
✓ git: c2e18f4 fix(diccionario): use exact filenames with tildes/ñ instead of slugify
✓ Notion Bitácora (últimas 3 entradas)
✓ Vercel (últimas 5 deployments)
✓ Supabase plants table: 45 rows

Duración: ~5s | Tokens: ~800

---
