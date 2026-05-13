#!/usr/bin/env bash
# Compactar imágenes de plantas: alinear archivo↔JSON 1:1.
# Ejecutar UNA SOLA VEZ desde terminal Mac:
#   bash "/Volumes/Papu Ext/Dev/QuantumHolistic/project/quantum-holistic/scripts/compactar-plantas.sh"
set -euo pipefail

DIR="/Volumes/Papu Ext/Dev/QuantumHolistic/project/quantum-holistic/public/images/plants"
cd "$DIR"

echo "==> 1) Borrar plant-01 (duplicado de plant-00)"
rm -v "plant-01-datura-estramonio-cientifica.jpg"

echo "==> 2) Renombrar plant-00 a placeholder lamiaceae-desconocida"
mv -v "plant-00-beleño-negro-cientifica.jpg" "plant-00-lamiaceae-desconocida-cientifica.jpg"

echo "==> 3) Shift plant-02..plant-50 → plant-01..plant-49 con slug real"
# Pares "origen|destino"
PAIRS=(
  "plant-02-adormidera-cientifica.jpg|plant-01-datura-estramonio-cientifica.jpg"
  "plant-03-mandrágora-cientifica.jpg|plant-02-adormidera-cientifica.jpg"
  "plant-04-belladona-cientifica.jpg|plant-03-mandrágora-cientifica.jpg"
  "plant-05-laurel-cientifica.jpg|plant-04-belladona-cientifica.jpg"
  "plant-06-olivo-cientifica.jpg|plant-05-laurel-cientifica.jpg"
  "plant-07-mirra-cientifica.jpg|plant-06-olivo-cientifica.jpg"
  "plant-08-hisopo-cientifica.jpg|plant-07-mirra-cientifica.jpg"
  "plant-09-salvia-cientifica.jpg|plant-08-hisopo-cientifica.jpg"
  "plant-10-lavanda-cientifica.jpg|plant-09-salvia-cientifica.jpg"
  "plant-11-orégano-cientifica.jpg|plant-10-lavanda-cientifica.jpg"
  "plant-12-hinojo-cientifica.jpg|plant-11-orégano-cientifica.jpg"
  "plant-13-valeriana-cientifica.jpg|plant-12-hinojo-cientifica.jpg"
  "plant-14-milenrama-cientifica.jpg|plant-13-valeriana-cientifica.jpg"
  "plant-15-saúco-cientifica.jpg|plant-14-milenrama-cientifica.jpg"
  "plant-16-muérdago-cientifica.jpg|plant-15-saúco-cientifica.jpg"
  "plant-17-roble-cientifica.jpg|plant-16-muérdago-cientifica.jpg"
  "plant-18-tejo-cientifica.jpg|plant-17-roble-cientifica.jpg"
  "plant-19-acónito-cientifica.jpg|plant-18-tejo-cientifica.jpg"
  "plant-20-equinácea-cientifica.jpg|plant-19-acónito-cientifica.jpg"
  "plant-21-abedul-cientifica.jpg|plant-20-equinácea-cientifica.jpg"
  "plant-22-cornezuelo-del-centeno-cientifica.jpg|plant-21-abedul-cientifica.jpg"
  "plant-23-amanita-muscaria-cientifica.jpg|plant-22-cornezuelo-del-centeno-cientifica.jpg"
  "plant-24-nigela-semilla-negra-cientifica.jpg|plant-23-amanita-muscaria-cientifica.jpg"
  "plant-25-granada-cientifica.jpg|plant-24-nigela-semilla-negra-cientifica.jpg"
  "plant-26-azafrán-cientifica.jpg|plant-25-granada-cientifica.jpg"
  "plant-27-higo-cientifica.jpg|plant-26-azafrán-cientifica.jpg"
  "plant-28-sidr-cientifica.jpg|plant-27-higo-cientifica.jpg"
  "plant-29-incienso-olíbano-cientifica.jpg|plant-28-sidr-cientifica.jpg"
  "plant-30-áloe-vera-cientifica.jpg|plant-29-incienso-olíbano-cientifica.jpg"
  "plant-31-ajo-cientifica.jpg|plant-30-áloe-vera-cientifica.jpg"
  "plant-32-rosa-de-jericó-cientifica.jpg|plant-31-ajo-cientifica.jpg"
  "plant-33-harmal-ruda-siria-cientifica.jpg|plant-32-rosa-de-jericó-cientifica.jpg"
  "plant-34-cannabis-cientifica.jpg|plant-33-harmal-ruda-siria-cientifica.jpg"
  "plant-35-ashwagandha-cientifica.jpg|plant-34-cannabis-cientifica.jpg"
  "plant-36-cúrcuma-cientifica.jpg|plant-35-ashwagandha-cientifica.jpg"
  "plant-37-amla-cientifica.jpg|plant-36-cúrcuma-cientifica.jpg"
  "plant-38-neem-cientifica.jpg|plant-37-amla-cientifica.jpg"
  "plant-39-brahmi-cientifica.jpg|plant-38-neem-cientifica.jpg"
  "plant-40-tulsi-cientifica.jpg|plant-39-brahmi-cientifica.jpg"
  "plant-41-loto-cientifica.jpg|plant-40-tulsi-cientifica.jpg"
  "plant-42-árbol-bodhi-cientifica.jpg|plant-41-loto-cientifica.jpg"
  "plant-43-sándalo-cientifica.jpg|plant-42-árbol-bodhi-cientifica.jpg"
  "plant-44-bilva-bael-cientifica.jpg|plant-43-sándalo-cientifica.jpg"
  "plant-45-bhang-cannabis-cientifica.jpg|plant-44-bilva-bael-cientifica.jpg"
  "plant-46-datura-dhatura-cientifica.jpg|plant-45-bhang-cannabis-cientifica.jpg"
  "plant-47-soma-cientifica.jpg|plant-46-datura-dhatura-cientifica.jpg"
  "plant-48-ginseng-cientifica.jpg|plant-47-soma-cientifica.jpg"
  "plant-49-astrágalo-cientifica.jpg|plant-48-ginseng-cientifica.jpg"
  "plant-50-dong-quai-cientifica.jpg|plant-49-astrágalo-cientifica.jpg"
)

for pair in "${PAIRS[@]}"; do
  src="${pair%%|*}"
  dst="${pair##*|}"
  if [[ -f "$src" ]]; then
    if [[ -e "$dst" ]]; then
      echo "SKIP (target ya existe): $dst"
    else
      mv -v "$src" "$dst"
    fi
  else
    echo "MISSING: $src"
  fi
done

echo "==> Done. Listado final:"
ls -1 plant-*.jpg | sort
