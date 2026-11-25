#!/usr/bin/env bash
# Stop hook — verifica TypeScript y pruebas antes de cerrar la sesión

set -euo pipefail

INPUT=$(cat)

# 1. Si stop_hook_active es true, salir para evitar bucle
STOP_HOOK_ACTIVE=$(echo "$INPUT" | /usr/bin/jq -r '.stop_hook_active // false')
if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
  exit 0
fi

# 2. Comprobar si hay cambios de TypeScript sin confirmar
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo "")
if [ -z "$REPO_ROOT" ]; then
  exit 0
fi

DIRTY_TS=$(git -C "$REPO_ROOT" status --porcelain 2>/dev/null | grep -E '\.(ts|tsx)$' || true)

if [ -z "$DIRTY_TS" ]; then
  # Sin cambios de TS, nada que verificar
  exit 0
fi

FAILED=0

# 3. Typecheck
echo "--- typecheck ---" >&2
if ! (cd "$REPO_ROOT" && npx tsc --noEmit 2>&1) >&2; then
  FAILED=1
fi

# 4. Si app/api/chat/route.ts está entre los archivos sucios, correr pruebas de seguridad
if echo "$DIRTY_TS" | grep -q 'app/api/chat/route.ts'; then
  echo "--- prueba-chat-seguridad ---" >&2
  if ! (cd "$REPO_ROOT" && node scripts/prueba-chat-seguridad.mjs 2>&1) >&2; then
    FAILED=1
  fi
fi

# 5. Si algo falló, bloquear el cierre
if [ "$FAILED" -ne 0 ]; then
  echo '{"continue":false,"stopReason":"Verificación falló (typecheck o tests). Corrige antes de cerrar."}'
  exit 2
fi

exit 0
