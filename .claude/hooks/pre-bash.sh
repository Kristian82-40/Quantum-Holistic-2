#!/usr/bin/env bash
# PreToolUse hook for Bash — bloquea comandos peligrosos
# Lee JSON desde stdin, extrae tool_input.command con jq

set -euo pipefail

INPUT=$(cat)
CMD=$(echo "$INPUT" | /usr/bin/jq -r '.tool_input.command // ""')

# Escape hatch: si el comando es ejecutar los propios hooks, dejar pasar (evita bucle)
if echo "$CMD" | grep -qE '\.claude/hooks/'; then
  exit 0
fi

# 1. gh pr merge (cualquier variante)
if printf '%s' "$CMD" | grep -qE 'gh\s+pr\s+merge'; then
  echo "BLOQUEADO: 'gh pr merge' está prohibido desde hooks. Los PRs se fusionan solos por kimiko-fusion.yml cuando las pruebas están en verde."
  exit 2
fi

# 2. git push --force o git push -f (cualquier rama)
if echo "$CMD" | grep -qE 'git\s+push\s+(.*\s)?(-f\b|--force\b)'; then
  echo "BLOQUEADO: 'git push --force / -f' está prohibido. Nunca reescribas el historial remoto."
  exit 2
fi

# 3. git push a main (pero NO a claude/* ni kimiko/*)
if echo "$CMD" | grep -qE 'git\s+push\s+'; then
  # Extrae la rama destino: "git push origin main" o "git push origin HEAD:main"
  if echo "$CMD" | grep -qE 'git\s+push\s+\S+\s+(HEAD:)?main(\s|$)'; then
    echo "BLOQUEADO: push directo a 'main' prohibido. Usa una rama claude/* o kimiko/* y abre un PR."
    exit 2
  fi
fi

# 4. Quitar etiqueta no-fusionar
if echo "$CMD" | grep -qE '(gh\s+pr\s+edit.*--remove-label.*no-fusionar|gh\s+label\s+delete\s+no-fusionar|gh\s+pr\s+edit.*no-fusionar.*--remove-label)'; then
  echo "BLOQUEADO: Eliminar la etiqueta 'no-fusionar' está prohibido desde hooks. Pide permiso a Kristian."
  exit 2
fi

# 5. vercel deploy --prod, vercel promote, vercel --prod
if echo "$CMD" | grep -qE '(vercel\s+(deploy\s+--prod|promote\b)|vercel\s+--prod\b)'; then
  echo "BLOQUEADO: Despliegues a producción ('vercel deploy --prod', 'vercel promote', 'vercel --prod') están prohibidos desde hooks."
  exit 2
fi

# 6. SQL de escritura en bash (combinación de keywords SQL + herramientas de DB)
if echo "$CMD" | grep -qiE '\b(INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER)\b' && \
   echo "$CMD" | grep -qE '\b(psql|supabase|sqlite3|sqlite|mysql|pg_dump)\b'; then
  echo "BLOQUEADO: SQL de escritura (INSERT/UPDATE/DELETE/DROP/TRUNCATE/ALTER) vía herramienta de DB detectado en bash. Usa el conector MCP de Supabase con aprobación."
  exit 2
fi

exit 0
