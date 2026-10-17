# Módulo de prueba del ejecutor (F0-09): pide un valor como se pediría una llave y comprueba que no queda en ningún sitio.
# Lo carga run.sh (`bash kimiko/tareas/run.sh hola`); usa sus funciones ok, mal y huella.
# shellcheck shell=bash
TAREA=F0-09
HUELLA=""

pasos() {
  echo "  1. Escribe un valor de prueba cualquiera (no se ve en pantalla). No es una llave: no se guarda."
  echo "  2. El módulo calcula su huella SHA-256 y borra el valor."
  echo "  3. Deja un recibo con los 8 primeros caracteres de la huella en $TAREA (no cambia su estado)."
}

hacer() {
  local valor
  read -r -s -p "  Valor de prueba: " valor; echo
  [ -n "$valor" ] || { mal "Vacío: no hay nada que probar."; return 1; }
  HUELLA=$(printf '%s' "$valor" | huella)
  unset valor
  ok "Valor leído y borrado. Huella: ${HUELLA:0:8}…"
}

comprobar() { [ ${#HUELLA} -eq 64 ]; }

recibo() { echo "valor leído con read -s y borrado; huella ${HUELLA:0:8}"; }
