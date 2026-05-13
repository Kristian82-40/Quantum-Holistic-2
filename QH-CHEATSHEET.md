# QH CHEATSHEET — Quick Reference

Abre esto mientras trabajas. TODO lo que necesitas en una página.

---

## 🔗 URLs Críticas

| Recurso | URL |
|---------|-----|
| **Producción** | quantum-holistic-2.vercel.app |
| **Supabase Studio** | app.supabase.com/project/vctetjugbvyllwjpxcxh |
| **Vercel Dashboard** | vercel.com/dashboard/quantum-holistic-2 |
| **GitHub Repo** | github.com/Kristian82-40/Quantum-Holistic-2 |
| **Notion Workspace** | [conectado a Cowork] |

---

## 🚀 Comandos Más Usados

```bash
# Dev local
npm run dev           # → http://localhost:3000

# Build + Test
npm run build
npm run lint

# Git flow
git status                           # Ver cambios
git checkout -b feature/[nombre]     # Nueva rama
git add . && git commit -m "..."     # Commit
git push origin [rama]               # Push

# Ver logs
git log --oneline -5                 # Últimos 5 commits
vercel list deployments              # Últimos deploys

# Vercel deploy
vercel deploy --prod                 # Deploy a prod
```

---

## 📋 Estado Actual (leer cada mañana)

**Actualizado:** 2026-05-07

```
✅ Producción OK
✅ 50 plantas en DB
✅ Diccionario 70 plantas
✅ Navbar móvil + Footer completo
🟡 Middleware protection — pendiente
🟡 Resend email — pendiente
🟡 Stripe live — pendiente
🔴 n8n credencial — caducada desde 2026-05-06
```

Para estado actualizado: **ejecuta `/flow-state` en Cowork** (cuando esté implementada QH-FLOW-STATE)

---

## 📁 Rutas en Código

```
app/                         ← Root Next.js
├── page.tsx               ← Homepage
├── layout.tsx             ← Global layout + ChatBot
├── (rutas públicas)/
│   ├── plantas/page.tsx   ← Grid plantas
│   ├── plantas/[slug]/    ← Ficha individual
│   ├── diccionario/       ← Atlas 70
│   ├── blog/
│   ├── chat/
│   └── recomendador/
├── admin/                 ← Panel (protegido)
└── api/                   ← API endpoints

components/
├── PlantasGrid.tsx
├── ChatBot.tsx
├── RomeroPopup.tsx
├── SeasonalPetals.tsx
└── QuoteRail.tsx
```

---

## 🔑 Schema Crítico (Tabla `plants`)

```sql
CREATE TABLE plants (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,         -- lamiaceae-salvia-oficinalis
  nombre_es TEXT NOT NULL,            -- Salvia Común
  nombre_latino TEXT NOT NULL,        -- Salvia officinalis
  imagen_url TEXT NOT NULL,           -- /images/plants/plant-01.jpg
  alt_text TEXT NOT NULL,             -- Salvia Común — Salvia officinalis
  categoria TEXT,                     -- 'maestra' | 'medicinal' | 'sagrada'
  descripcion_corta TEXT,
  descripcion_larga TEXT,
  propiedades JSONB,                  -- ["antioxidante", "antiinflamatorio"]
  usos JSONB,
  ...otros...
);
```

**Validadores críticos:**
- Slug = UNIQUE, lowercase, no spaces
- nombre_latino siempre presente
- imagen_url = HTTP 200 en Vercel
- alt_text = "[nombre_es] — [nombre_latino]"

---

## 🛠️ Cuando algo se rompe

| Síntoma | Qué revisar |
|---------|------------|
| Imágenes 404 en prod | `/public/images/plants/` en Vercel |
| Slug duplicado | `grep -r "slug" app/` |
| Metadata desincronizada | `fichas-metadata.json` vs Supabase `plants` |
| Build falla | `npm run lint`, `npx tsc --noEmit`, `.next/` corrupto |
| Deploy no funciona | `vercel list deployments` → ver logs |

---

## 💡 Pro Tips

```bash
# Buscar rápido en código
grep -r "plantas" app/

# Ver todas las rutas
find app -name "page.tsx" | grep -v node_modules

# Rebuild limpio si build falla
rm -rf .next node_modules
npm ci && npm run build

# Revert último commit (sin perder cambios)
git reset --soft HEAD~1

# Ver qué cambió entre commits
git diff [SHA1] [SHA2]
```

---

## 🎯 Before Deploy Checklist

- [ ] `npm run build` — compila sin errores
- [ ] `npm run lint` — linting OK
- [ ] `npx tsc --noEmit` — types OK
- [ ] Imágenes validadas (QH-CI-VALIDATE)
- [ ] Metadata sincronizada (fichas-metadata.json)
- [ ] ENV vars en Vercel completadas
- [ ] Commit message es claro
- [ ] Branch está actualizada con main

---

## 📞 Emergencias

### Producción rota
1. Identifica último commit OK: `git log --oneline -5`
2. Genera rollback: Papu dice "Rollback a [SHA]" en Cowork
3. QH-ROLLBACK-GEN da rollback.sh
4. Ejecuta desde Code

### Base de datos corrompida
1. Backups en Supabase: Settings → Backups
2. No hacer cambios hasta que Claude analice

### Deploy no funciona
1. Ver logs Vercel: vercel.com/dashboard
2. Check ENV vars: `vercel env ls`
3. Build local funciona: `npm run build`

---

## 📈 Tracking

- **Tokens hoy:** [auto-calculado por QH-FLOW-STATE]
- **Última tarea completada:** [en handoff.md]
- **Próxima tarea:** [en PROJECT_CONTEXT.md]

---

**Última actualización:** 2026-05-12  
**Mantenedor:** Papu (auto-sync por QH-FLOW-STATE)
