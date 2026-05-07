#!/usr/bin/env bash
# Rename plant images: plant-NN-cientifica.jpg → plant-NN-{slug}-cientifica.jpg
# Mapping: índice 0..69 = atlas_images del JSON (0-indexed: plant-00 = Beleño negro).
# Compatible zsh / bash (sin declare -A). Idempotente.

set -euo pipefail

ROOT="/Volumes/Papu Ext/Dev/QuantumHolistic/project/quantum-holistic"
JSON="$ROOT/app/fichas-metadata.json"
DIR="$ROOT/public/images/plants"

if [ ! -f "$JSON" ]; then
  echo "❌ No existe $JSON"; exit 1
fi
if [ ! -d "$DIR" ]; then
  echo "❌ No existe $DIR"; exit 1
fi

# Genera líneas "NN<TAB>slug" desde el JSON
MAP=$(python3 - <<'PY'
import json, re, sys
data = json.load(open("/Volumes/Papu Ext/Dev/QuantumHolistic/project/quantum-holistic/app/fichas-metadata.json"))
def slug(name: str) -> str:
    s = name.lower()
    s = re.sub(r'\s*/\s*', '-', s)
    s = re.sub(r'\s+', '-', s)
    s = re.sub(r'-+', '-', s)
    return s.strip('-')
for i, p in enumerate(data["atlas_images"]):
    print(f"{i:02d}\t{slug(p['plant_name'])}")
PY
)

cd "$DIR"
RENAMED=0
SKIPPED=0
MISSING=0

while IFS=$'\t' read -r ID SLUG; do
  SRC="plant-${ID}-cientifica.jpg"
  DST="plant-${ID}-${SLUG}-cientifica.jpg"

  if [ "$SRC" = "$DST" ]; then
    SKIPPED=$((SKIPPED+1)); continue
  fi
  if [ -f "$DST" ]; then
    SKIPPED=$((SKIPPED+1)); continue
  fi
  if [ ! -f "$SRC" ]; then
    MISSING=$((MISSING+1)); continue
  fi
  mv "$SRC" "$DST"
  echo "✓ $SRC → $DST"
  RENAMED=$((RENAMED+1))
done <<< "$MAP"

echo ""
echo "Renombrados: $RENAMED · Saltados: $SKIPPED · Origen ausente: $MISSING"
