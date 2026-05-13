# CLI COMMANDS — Quantum Holistic

Quick reference. Ejecuta en terminal desde `/Volumes/Papu Ext/Dev/QuantumHolistic/project/quantum-holistic/`.

---

## 🔨 npm / pnpm

```bash
# Instalar dependencias
npm install

# Dev server
npm run dev
# → http://localhost:3000

# Build para producción
npm run build

# Serve build local
npm run start

# Linting
npm run lint

# Type checking
npx tsc --noEmit
```

---

## 🌳 Git

```bash
# Ver estado
git status

# Ver últimos commits
git log --oneline -10

# Crear rama feature
git checkout -b feature/[nombre]

# Commit
git add .
git commit -m "feat: [descripción]"

# Push
git push origin [rama]

# Cambiar a main
git checkout main
git pull origin main

# Ver diferencias
git diff main
git show [SHA]

# Revert commit
git revert [SHA]

# Reset (CUIDADO: destructivo)
git reset --hard [SHA]
git push --force-with-lease origin main
```

---

## 🚀 Vercel

```bash
# Deploy a producción (desde main)
vercel deploy --prod

# Ver deployments
vercel list deployments

# Ver env vars
vercel env ls

# Setear env var
vercel env add [KEY]

# Check build
vercel build
```

---

## 🗄️ Supabase

```bash
# Ver migraciones locales
ls supabase/migrations/

# Crear migration
supabase migration new [nombre]

# Aplicar migrations
supabase migration up

# Ver schema local
supabase introspect

# Seed data
supabase seed run
```

---

## 📝 Scripts Personalizados

```bash
# Validación QH (cuando exista)
node scripts/validate-plants.js
node scripts/validate-metadata.js
node scripts/validate-images.js

# Blog post generator
npm run qb
# → Genera posts en Supabase `blog_posts`

# Bitácora sync (n8n)
npm run sync-bitacora
```

---

## 🔍 Grep / Find

```bash
# Buscar string en código
grep -r "plantas" app/

# Buscar archivos
find . -name "*.tsx" -type f

# Ver estructura
tree -L 3 -I node_modules
```

---

## 🧹 Limpieza

```bash
# Limpiar node_modules
rm -rf node_modules
npm ci

# Limpiar cache Next.js
rm -rf .next

# Limpiar archivos temporales
rm -rf .DS_Store dist build
```

---

## ⚡ Pro Tips

```bash
# Ver consumo de tokens hoy (después de export)
grep "tokens_consumed" .usage

# Check performance
npm run build && npm run start
# Abre http://localhost:3000 y corre Lighthouse

# Ver archivos que no están en git
git status -s

# Commit amend (sin crear nuevo commit)
git commit --amend --no-edit
git push --force-with-lease

# Squash last N commits
git reset --soft HEAD~3  # N=3
git commit -m "feat: squashed changes"
```
