#!/usr/bin/env bash
# Prueba del ejecutor (F0-09) sin base ni llaves: un `supabase` falso apunta cada consulta y responde como la cola.
# Corre con el bash con que se la llame (en macOS, /bin/bash 3.2):  bash kimiko/tareas/pruebas/hola.sh
# shellcheck disable=SC2015,SC2012 # ok y mal siempre devuelven 0; los nombres de recibo no tienen espacios
set -uo pipefail
cd "$(dirname "$0")/../../.." || exit 1
echo "bash $BASH_VERSION"

tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
cat > "$tmp/supabase" <<'FALSO'
#!/bin/sh
for a; do q=$a; done                       # la consulta es el último argumento
printf '%s\n---\n' "$q" >> "$SUPABASE_LOG"
case $q in
  update*) echo '[{"id":"F0-09"}]' ;;
  *"where id = 'F0-09'"*) echo '[{"id":"F0-09","titulo":"Ejecutor v2","responsable":"code","estado":"pendiente","evidencia":[]}]' ;;
  *) echo '[]' ;;
esac
FALSO
chmod +x "$tmp/supabase"
export PATH="$tmp:$PATH" SUPABASE_LOG="$tmp/log"
: > "$SUPABASE_LOG"

fallos=0
ok()  { echo "✔ $*"; }
mal() { echo "✘ $*"; fallos=$((fallos + 1)); }
VALOR="valor-de-prueba-$$-NO-DEBE-QUEDAR"
antes=$(ls kimiko/tareas/recibos 2>/dev/null | wc -l)

# 1. En seco: no consulta para escribir, no pide el valor, no deja recibo.
salida=$(printf '%s\n' "$VALOR" | "$BASH" kimiko/tareas/run.sh hola --dry-run 2>&1)
printf '%s\n' "$salida" | grep -q "En seco" && ok "--dry-run lo anuncia" || mal "--dry-run no lo anuncia: $salida"
grep -q '^update' "$SUPABASE_LOG" && mal "--dry-run escribió en la base" || ok "--dry-run no escribe en la base"
[ "$(ls kimiko/tareas/recibos 2>/dev/null | wc -l)" = "$antes" ] && ok "--dry-run no deja recibo" || mal "--dry-run dejó recibo"

# 2. De verdad: el valor llega por la entrada estándar; deja recibo en F0-09 sin cambiar su estado.
salida=$(printf '%s\n' "$VALOR" | "$BASH" kimiko/tareas/run.sh hola 2>&1); codigo=$?
[ "$codigo" = 0 ] && ok "hola termina bien" || mal "hola salió con $codigo: $salida"
grep -q "^update public.kimiko_tareas" "$SUPABASE_LOG" && grep -q "where id = 'F0-09'" "$SUPABASE_LOG" \
  && ok "recibo en kimiko_tareas.evidencia de F0-09" || mal "no guardó el recibo en F0-09"
grep -q "nullif('', '')" "$SUPABASE_LOG" && ok "no cambia el estado de F0-09" || mal "cambió el estado de F0-09"
huella=$(printf '%s' "$VALOR" | { command -v shasum >/dev/null && shasum -a 256 || sha256sum; } | cut -c1-8)
grep -q "huella $huella" "$SUPABASE_LOG" && ok "el recibo lleva la huella ($huella)" || mal "el recibo no lleva la huella"
recibo=$(ls -t kimiko/tareas/recibos/F0-09-*.json 2>/dev/null | head -1)
[ -n "$recibo" ] && ok "recibo local ($recibo)" || mal "sin recibo local"
if grep -rq "$VALOR" "$SUPABASE_LOG" ${recibo:+"$recibo"}; then mal "el valor aparece en la base o en el recibo"
else ok "el valor no aparece en la base ni en el recibo"; fi
printf '%s\n' "$salida" | grep -q "$VALOR" && mal "el valor sale por pantalla" || ok "el valor no sale por pantalla"
[ -n "$recibo" ] && rm -f "$recibo"

# 3. Una tarea que no es de Kristian solo se enseña.
salida=$("$BASH" kimiko/tareas/run.sh F0-09 --dry-run 2>&1 < /dev/null)
printf '%s\n' "$salida" | grep -q "solo se enseña" && ok "tarea de Code: solo se enseña" || mal "tarea de Code: $salida"

[ "$fallos" = 0 ] && echo "Todo en verde" || { echo "$fallos fallos"; exit 1; }
