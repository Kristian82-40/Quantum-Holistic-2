#!/usr/bin/env bash
# Ejecutor de tareas v2 (F0-09, 15-oct-2026). Lee y escribe la cola kimiko_tareas de Supabase.
#   bash kimiko/tareas/run.sh             menú: tu lista de hoy, eliges una y te guía
#   bash kimiko/tareas/run.sh --lista     tu lista de hoy (5 como máximo, ordenada)
#   bash kimiko/tareas/run.sh --todas     todas tus tareas abiertas
#   bash kimiko/tareas/run.sh --estado    recuento de la cola por responsable y estado
#   bash kimiko/tareas/run.sh <ID>        una tarea: abre su página, enseña los pasos y guarda el recibo
#
# Habla con la base por `supabase db query --linked` (la sesión del CLI de Supabase del Mac): no pide ni guarda llaves.
# Si una tarea necesita una llave, su módulo (kimiko/tareas/modulos/<ID>.sh) la pide con `read -s` y la manda
# directa a Supabase Secrets; aquí nunca se escribe ni se imprime. El recibo de `evidencia` no lleva secretos.

set -uo pipefail
cd "$(dirname "$0")/../.."

VERDE=$'\e[32m'; ROJO=$'\e[31m'; AMARILLO=$'\e[33m'; NEGRITA=$'\e[1m'; FIN=$'\e[0m'
ok()    { echo "${VERDE}✔ $*${FIN}"; }
mal()   { echo "${ROJO}✘ $*${FIN}"; }
aviso() { echo "${AMARILLO}• $*${FIN}"; }
MODULOS="kimiko/tareas/modulos"
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

id_valido() { [[ "$1" =~ ^[A-Z][0-9A-Z]{0,3}(-[0-9]{1,3})?$ ]]; }

mis_tareas() { # $1 = límite (vacío = todas)
  sql "select id, titulo, canal, minutos, etiquetas, estado, fecha_limite from public.kimiko_tareas
       where responsable = 'kristian' and estado in ($ABIERTAS) $ORDEN ${1:+limit $1}"
}

# Añade un recibo a evidencia y cambia el estado. $1 id, $2 estado, $3 texto, $4 motivo (opcional)
registrar() {
  local id=$1 nuevo=$2 texto=$3 motivo=${4:-}
  local salida
  salida=$(sql "update public.kimiko_tareas set estado = $(literal "$nuevo"),
         evidencia = evidencia || $(literal "$($FICHA recibo "$texto")")::jsonb
         ${motivo:+, motivo = $(literal "$motivo")}
       where id = $(literal "$id") returning id")
  if [ -n "$salida" ] && [ "$salida" != "[]" ]; then ok "Guardado: $id → $nuevo"
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
  local r
  if [ -n "$url" ]; then
    read -r -p "  [Enter] abrir la página · [s] saltar → " r
    [ "${r:-}" = "s" ] && return 0
    open "$url" 2>/dev/null || aviso "Ábrela a mano: $url"
  fi

  # Módulo propio (pide llaves con read -s y comprueba con código). Define hacer() y comprobar().
  if [ -f "$MODULOS/$id.sh" ]; then
    # shellcheck source=/dev/null
    source "$MODULOS/$id.sh"
    hacer || { mal "El módulo de $id no terminó"; return 1; }
    if comprobar; then registrar "$id" verificada "comprobado por el módulo $id.sh"
    else registrar "$id" esperando_prueba "hecho por Kristian; la comprobación del módulo falló"; fi
    return 0
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
      [1-5]) set -- $ids; if [ "$r" -le $# ]; then tarea "${!r}"; else mal "No hay tarea $r"; fi ;;
      *) tarea "$(printf '%s' "$r" | tr '[:lower:]' '[:upper:]')" ;;
    esac
  done
}

case "${1:-}" in
  "")        menu ;;
  --lista)   echo "${NEGRITA}Tu lista de hoy${FIN}"; mis_tareas 5 | $FICHA lista ;;
  --todas)   mis_tareas | $FICHA lista ;;
  --estado)  sql "select responsable, estado, count(*) n from public.kimiko_tareas group by 1, 2 order by 1, 2" | $FICHA estado ;;
  -h|--help) sed -n '2,8p' "$0" ;;
  *)         tarea "$(printf '%s' "$1" | tr '[:lower:]' '[:upper:]')" ;;
esac
