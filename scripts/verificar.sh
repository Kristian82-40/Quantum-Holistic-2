#!/usr/bin/env bash
# verificar.sh — comprobación completa antes de cada PR en Quantum Holistic
# Para CI sin credenciales, usar SKIP_BUILD=1 para saltar el build.
#
# Uso: bash scripts/verificar.sh
#       SKIP_BUILD=1 bash scripts/verificar.sh

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

FAILED=0

# ─── Herramientas requeridas ───────────────────────────────────────────────
for tool in node npm npx jq; do
  if ! command -v "$tool" &>/dev/null; then
    echo "❌ Herramienta requerida no encontrada: $tool"
    echo "   Instálala antes de ejecutar verificar.sh"
    exit 1
  fi
done

# ─── Helpers ──────────────────────────────────────────────────────────────
pass() { echo "✅ $1"; }
fail() { echo "❌ $1"; FAILED=1; }

# ─── 1. Typecheck ─────────────────────────────────────────────────────────
echo ""
echo "1/6  Typecheck (tsc --noEmit)…"
if npx tsc --noEmit 2>&1; then
  pass "Typecheck"
else
  fail "Typecheck"
fi

# ─── 2. Lint ──────────────────────────────────────────────────────────────
echo ""
echo "2/6  Lint (next lint)…"
if npm run lint 2>&1; then
  pass "Lint"
else
  fail "Lint"
fi

# ─── 3. Pruebas de seguridad del chat ─────────────────────────────────────
echo ""
echo "3/6  Pruebas de seguridad del chat…"
if [ -f "scripts/prueba-chat-seguridad.mjs" ]; then
  if node scripts/prueba-chat-seguridad.mjs 2>&1; then
    pass "Pruebas de seguridad"
  else
    fail "Pruebas de seguridad"
  fi
else
  echo "   ⚠️  scripts/prueba-chat-seguridad.mjs no existe — omitido"
fi

# ─── 4. Textos prohibidos ─────────────────────────────────────────────────
echo ""
echo "4/6  Textos prohibidos…"
BANNED_PATTERN='meses gratis|inteligencia artificial|videollamada|papu-pro'
BANNED_DIRS=(app components lib messages)
BANNED_FOUND=0

for dir in "${BANNED_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    if grep -rn \
        --include="*.ts" --include="*.tsx" --include="*.json" \
        --exclude-dir=node_modules --exclude-dir=.next \
        -E "$BANNED_PATTERN" "$dir" 2>/dev/null; then
      BANNED_FOUND=1
    fi
  fi
done

if [ "$BANNED_FOUND" -eq 0 ]; then
  pass "Sin textos prohibidos"
else
  fail "Textos prohibidos encontrados (ver arriba)"
fi

# ─── 5. Secretos en código ────────────────────────────────────────────────
echo ""
echo "5/6  Secretos en código…"
SECRET_PATTERN='sb_secret_|eyJhbGci|sk-[A-Za-z0-9]{20}|gsk_|AIza[0-9A-Za-z_-]{30}|ghp_|github_pat_'
SECRET_FOUND=0

for dir in "${BANNED_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    if grep -rn \
        --include="*.ts" --include="*.tsx" --include="*.json" \
        --exclude-dir=node_modules --exclude-dir=.next \
        -E "$SECRET_PATTERN" "$dir" 2>/dev/null; then
      SECRET_FOUND=1
    fi
  fi
done

if [ "$SECRET_FOUND" -eq 0 ]; then
  pass "Sin secretos en código"
else
  fail "Secretos detectados en código (ver arriba)"
fi

# ─── 6. Build ─────────────────────────────────────────────────────────────
echo ""
if [ "${SKIP_BUILD:-0}" = "1" ]; then
  echo "6/6  Build — OMITIDO (SKIP_BUILD=1)"
else
  echo "6/6  Build completo (npm run build)…"
  if npm run build 2>&1; then
    pass "Build"
  else
    fail "Build"
  fi
fi

# ─── Resultado final ──────────────────────────────────────────────────────
echo ""
if [ "$FAILED" -eq 0 ]; then
  echo "✅ Todas las comprobaciones pasaron."
  exit 0
else
  echo "❌ Una o más comprobaciones fallaron. Revisa los errores arriba."
  exit 1
fi
