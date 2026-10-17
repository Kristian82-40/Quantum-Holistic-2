#!/usr/bin/env bash
# Ejecutor de tareas v2 (F0-09, 15-oct-2026). Lee y escribe la cola kimiko_tareas de Supabase.
#   bash kimiko/tareas/run.sh             menú: tu lista de hoy, eliges una y te guía
#   bash kimiko/tareas/run.sh --lista     tu lista de hoy (5 como máximo, ordenada)
#   bash kimiko/tareas/run.sh --todas     todas tus tareas abiertas
#   bash kimiko/tareas/run.sh --estado    recuento de la cola por responsable y estado
#   bash kimiko/tareas/run.sh <ID>        una tarea: abre su página, enseña los pasos y guarda el recibo
#   bash kimiko/tareas/run.sh <módulo>    un módulo por su nombre (p. ej. `hola`, la prueba del ejecutor)
#   … <ID|módulo> --dry-run               enseña los pasos sin cambiar nada ni pedir secretos
#
# Habla con la base por `supabase db query --linked` (la sesión del CLI de Supabase del Mac): no pide ni guarda llaves.
# Si una tarea necesita una llave, su módulo (kimiko/tareas/modulos/<ID>.sh) la pide con `read -s` y la manda
# directa a Supabase Secrets; aquí nunca se escribe ni se imprime. El recibo de `evidencia` no lleva secretos.

set -uo pipefail
umask 077
cd "$(dirname "$0")/../.." || exit 1
SECO=""; [ "${2:-}" = "--dry-run" ] && SECO=1

VERDE=$'\e[32m'; ROJO=$'\e[31m'; AMARILLO=$'\e[33m'; NEGRITA=$'\e[1m'; FIN=$'\e[0m'
ok()    { echo "${VERDE}✔ $*${FIN}"; }
mal()   { echo "${ROJO}✘ $*${FIN}"; }
aviso() { echo "${AMARILLO}• $*${FIN}"; }
MODULOS="kimiko/tareas/modulos"
RECIBOS="kimiko/tareas/recibos"   # ignorada por git
FICHA="python3 -I kimiko/tareas/ficha.py"
ABIERTAS="'pendiente','en_curso','esperando_ok'"
ORDEN="order by (canal = 'mac'), fecha_limite nulls last, orden nulls last, minutos nulls last, id"

command -v supabase >/dev/null || { mal "Falta el CLI de Supabase (brew install supabase/tap/supabase)."; exit 1; }

# Consulta a la base; salida JSON. Los avisos del CLI van a /dev/null.
sql() { supabase db query --linked --agent=no -o json "$1" 2>/dev/null; }
literal() { $FICHA literal "$1"; }

# Rechaza notas que parecen llaves (ni el repo ni la base guardan secretos).
parece_llave() {
  printf '%s' "$1" | grep -qE '(sk|pk|rk)_(live|test)_|whsec_|gh[pousr]_[A-Za-z0-9]{20}|github_pat_|xox[bap]-|AKIA[0-9A-Z]{12}|eyJ[A-Za-z0-9_-]{20}|gsk_|AIza[0-9A-Za-z_-]{20}|[A-Za-z0-9_-]{40,}'
}

huella() { if command -v shasum >/dev/null; then shasum -a 256; else sha256sum; fi | cut -c1-64; }
abrir() { open "$1" 2>/dev/null || xdg-open "$1" 2>/dev/null || aviso "Ábrela a mano: $1"; }

id_valido() { [[ "$1" =~ ^[A-Z][0-9A-Z]{0,3}(-[0-9]{1,3})?$ ]]; }

mis_tareas() { # $1 = límite (vacío = todas)
  sql "select id, titulo, canal, minutos, etiquetas, estado, fecha_limite from public.kimiko_tareas
       where responsable = 'kristian' and estado in ($ABIERTAS) $ORDEN ${1:+limit $1}"
}

# Añade un recibo a evidencia y cambia el estado. $1 id, $2 estado (vacío = no cambia), $3 texto, $4 motivo (opcional)
registrar() {
  local id=$1 nuevo=$2 texto=$3 motivo=${4:-}
  local salida
  if [ -n "$SECO" ]; then aviso "En seco: no guardo «$texto» en $id${nuevo:+ ni la paso a $nuevo}."; return 0; fi
  mkdir -p "$RECIBOS"
  $FICHA recibo "$texto" > "$RECIBOS/$id-$(date +%Y%m%d-%H%M).json"
  salida=$(sql "update public.kimiko_tareas set estado = coalesce(nullif($(literal "$nuevo"), ''), estado),
         evidencia = evidencia || $(literal "$($FICHA recibo "$texto")")::jsonb
         ${motivo:+, motivo = $(literal "$motivo")}
       where id = $(literal "$id") returning id")
  if [ -n "$salida" ] && [ "$salida" != "[]" ]; then ok "Guardado: $id → ${nuevo:-recibo, sin cambiar el estado}"
  else mal "No pude guardar el recibo de $id (¿sesión del CLI caducada? supabase login)"; fi
}

tarea() {
  local id=$1
  id_valido "$id" || { mal "ID no válido: $id"; return 1; }
  local fila
  fila=$(sql "select * from public.kimiko_tareas where id = $(literal "$id")")
  if [ -z "$fila" ] || [ "$fila" = "[]" ]; then mal "No existe la tarea $id"; return 1; fi
  printf '%s' "$fila" | $FICHA tarea

  local responsable url
  responsable=$(printf '%s' "$fila" | $FICHA campo responsable)
  url=$(printf '%s' "$fila" | $FICHA campo url)
  if [ "$responsable" != "kristian" ]; then
    aviso "Esta tarea es de $responsable: aquí solo se enseña."
    return 0
  fi

  echo
  if [ -f "$MODULOS/$id.sh" ]; then modulo "$id" "$id"; return; fi
  if [ -n "$SECO" ]; then aviso "En seco: no abro la página ni pregunto nada."; return 0; fi
  local r
  if [ -n "$url" ]; then
    read -r -p "  [Enter] abrir la página · [s] saltar → " r
    [ "${r:-}" = "s" ] && return 0
    abrir "$url"
  fi

  echo
  read -r -p "  ¿Cómo ha ido? [h] hecho · [b] bloqueado · [Enter] lo dejo para luego → " r
  case "${r:-}" in
    h|H)
      local nota
      read -r -p "  Una nota corta (lo que viste; nunca una llave) o Enter: " nota
      if parece_llave "$nota"; then mal "Eso parece una llave: no se guarda. Repite sin ella."; return 1; fi
      registrar "$id" esperando_prueba "hecho${nota:+: $nota}"
      aviso "Code o Kimiko lo comprobarán y la pasarán a «verificada»." ;;
    b|B)
      local motivo
      read -r -p "  ¿Qué lo bloquea? " motivo
      if parece_llave "$motivo"; then mal "Eso parece una llave: no se guarda."; return 1; fi
      [ -n "$motivo" ] || { mal "Hace falta el motivo."; return 1; }
      registrar "$id" bloqueado "bloqueado" "$motivo" ;;
    *) aviso "Sin cambios en $id." ;;
  esac
}

# Módulo propio (pide llaves con read -s y comprueba con código). Define pasos(), hacer(), comprobar() y,
# si quiere, recibo() (texto sin secretos) y TAREA (la fila de la cola donde deja el recibo).
# $1 = nombre del archivo en $MODULOS, $2 = tarea de la cola (vacío = la que diga el módulo)
modulo() {
  local nombre=$1 TAREA=${2:-}
  # shellcheck source=/dev/null
  source "$MODULOS/$nombre.sh"
  local id=${2:-$TAREA}
  echo "${NEGRITA}━━━ Módulo $nombre${id:+ · $id} ━━━${FIN}"
  pasos
  if [ -n "$SECO" ]; then aviso "En seco: no pido nada ni guardo nada."; return 0; fi
  hacer || { mal "El módulo $nombre no terminó"; return 1; }
  local texto="módulo $nombre.sh"
  if declare -F recibo >/dev/null; then texto="$texto: $(recibo)"; fi
  [ -n "$id" ] || { ok "$texto (sin tarea en la cola: no se guarda recibo)"; return 0; }
  if [ -n "${2:-}" ]; then
    if comprobar; then registrar "$id" verificada "comprobado por el $texto"
    else registrar "$id" esperando_prueba "hecho por Kristian; la comprobación del $texto falló"; fi
  else # módulo por nombre (p. ej. hola): solo deja el recibo, no cambia el estado de la tarea
    if comprobar; then registrar "$id" "" "comprobado por el $texto"
    else mal "La comprobación del módulo $nombre falló"; return 1; fi
  fi
}

menu() {
  while true; do
    echo; echo "${NEGRITA}━━━ Tu lista de hoy ━━━${FIN}"
    local filas ids
    filas=$(mis_tareas 5)
    printf '%s' "$filas" | $FICHA lista
    ids=$(printf '%s' "$filas" | $FICHA ids)
    [ -n "$ids" ] || return 0
    echo
    local r
    read -r -p "  Número o ID de la tarea · [q] salir → " r
    case "${r:-}" in
      q|Q|"") return 0 ;;
      [1-5]) # shellcheck disable=SC2086 # los ids se separan a propósito
        set -- $ids; if [ "$r" -le $# ]; then tarea "${!r}"; else mal "No hay tarea $r"; fi ;;
      *) tarea "$(printf '%s' "$r" | tr '[:lower:]' '[:upper:]')" ;;
    esac
  done
}

case "${1:-}" in
  "")        menu ;;
  --lista)   echo "${NEGRITA}Tu lista de hoy${FIN}"; mis_tareas 5 | $FICHA lista ;;
  --todas)   mis_tareas | $FICHA lista ;;
  --estado)  sql "select responsable, estado, count(*) n from public.kimiko_tareas group by 1, 2 order by 1, 2" | $FICHA estado ;;
  -h|--help) sed -n '2,10p' "$0" ;;
  *)         if [[ "$1" =~ ^[a-z][a-z0-9-]*$ ]] && [ -f "$MODULOS/$1.sh" ]; then modulo "$1"
             else tarea "$(printf '%s' "$1" | tr '[:lower:]' '[:upper:]')"; fi ;;
esac
