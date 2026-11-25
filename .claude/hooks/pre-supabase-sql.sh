#!/usr/bin/env bash
# PreToolUse hook para mcp__claude_ai_Supabase__execute_sql
# Bloquea SQL de escritura; deja pasar SELECT y otros de solo lectura

set -euo pipefail

INPUT=$(cat)

# Extraer SQL desde tool_input.query o tool_input.sql
SQL=$(echo "$INPUT" | /usr/bin/jq -r '.tool_input.query // .tool_input.sql // ""')

if [ -z "$SQL" ]; then
  # Sin SQL extraíble, dejar pasar
  exit 0
fi

# Comprobar si contiene keywords de escritura (insensible a mayúsculas)
if echo "$SQL" | grep -qiE '^\s*\b(INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE\s+TABLE)\b'; then
  PREVIEW=$(echo "$SQL" | head -c 200)
  echo "BLOQUEADO: execute_sql con operación de escritura detectada."
  echo "Primeros 200 caracteres del SQL:"
  echo "$PREVIEW"
  echo ""
  echo "Las escrituras en Supabase requieren aprobación de Kristian. Usa apply_migration para migraciones."
  exit 2
fi

exit 0
