#!/usr/bin/env bash
# Módulo F1-14 · Compra de prueba de punta a punta (Stripe en MODO PRUEBA) · 22-nov-2026
#   bash kimiko/tareas/run.sh F1-14                  lo normal: guía, abre las páginas y comprueba el resultado
#   SECO=1 bash kimiko/tareas/modulos/F1-14.sh       prueba en seco: no abre páginas
#
# Qué demuestra: que una compra de Quantum Pro llega al webhook de la web y deja el perfil en `pro`.
# Sin dinero real: la tarjeta 4242 4242 4242 4242 solo existe en modo prueba de Stripe.
# Seguridad: antes de nada pide una sesión de pago a la web y PARA si no es de prueba (`cs_test_`).
# Llaves: ninguna. La comprobación usa la sesión del CLI de Supabase del Mac (igual que run.sh).
# Después: Code cancela la suscripción de prueba en Stripe y el perfil vuelve a `free`.
# Compatible con el bash 3.2 del Mac.

WEB="https://quantum-holistic.com"
F114_T0=""        # hora UTC de inicio: la comprobación solo cuenta cambios posteriores
F114_GRACIAS=""   # s/n: Stripe devolvió a /gracias

if ! declare -F ok >/dev/null; then
  VERDE=$'\e[32m'; ROJO=$'\e[31m'; AMARILLO=$'\e[33m'; NEGRITA=$'\e[1m'; FIN=$'\e[0m'
  ok()    { echo "${VERDE}✔ $*${FIN}"; }
  mal()   { echo "${ROJO}✘ $*${FIN}"; }
  aviso() { echo "${AMARILLO}• $*${FIN}"; }
fi
declare -F sql >/dev/null || sql() { supabase db query --linked --agent=no -o json "$1" 2>/dev/null; }

seco() { [ "${SECO:-}" = "1" ]; }
abrir() { if seco; then aviso "(seco) abriría $1"; else open "$1" 2>/dev/null || aviso "Ábrela a mano: $1"; fi; }
pausa() { local _r; read -r -p "  $1 [Enter] → " _r; }
pregunta_sn() { local _r; read -r -p "  $1 [s/n] → " _r; case "${_r:-}" in s|S|si|sí|Sí|SI) return 0;; *) return 1;; esac; }

modo_prueba() { # 0 si la web crea sesiones de prueba; 1 si en vivo o no responde
  local r
  r=$(curl -s -m 15 -X POST "$WEB/api/checkout/" -H 'content-type: application/json' -d '{"billingCycle":"monthly"}')
  case "$r" in
    *cs_test_*) return 0 ;;
    *cs_live_*) mal "¡La web está en MODO REAL (cs_live)! Paro: con la 4242 no se prueba en vivo."; return 1 ;;
    *)          mal "La web no devolvió una sesión de pago. Paro y aviso a Code."; return 1 ;;
  esac
}

hacer() {
  echo; echo "${NEGRITA}F1-14 · Compra de prueba (sin dinero real) · 10 min${FIN}"
  echo "  1/4 Compruebo que Stripe está en modo prueba…"
  modo_prueba || return 1
  ok "Modo prueba confirmado (cs_test)"
  F114_T0=$(date -u +%Y-%m-%dT%H:%M:%SZ)

  echo; echo "  2/4 Entra en la web con TU cuenta (la de admin)."
  abrir "$WEB/login/"
  pausa "Cuando estés dentro"

  echo; echo "  3/4 Abro los planes. Pulsa ${NEGRITA}Pro mensual${FIN} y, en la página de Stripe:"
  echo "      · Correo: ${NEGRITA}el mismo con el que has entrado${FIN} (el webhook busca el perfil por correo)"
  echo "      · Tarjeta: 4242 4242 4242 4242 · fecha: cualquiera futura (12/30) · CVC: 123"
  echo "      · Nombre y código postal: cualquiera"
  abrir "$WEB/#pricing"
  pausa "Cuando hayas pagado"

  echo; echo "  4/4"
  if pregunta_sn "¿Te ha devuelto a la página «gracias» de la web?"; then F114_GRACIAS=s; else F114_GRACIAS=n; fi
  return 0
}

comprobar() {
  echo; echo "  Compruebo en la base que tu perfil pasó a Pro (espero hasta 1 min al webhook)…"
  local i n
  for i in 1 2 3 4 5 6; do
    n=$(sql "select count(*) n from public.profiles where plan = 'pro' and stripe_customer_id like 'cus_%'
             and updated_at >= '$F114_T0'::timestamptz" | python3 -I -c 'import json,sys
try: print(json.load(sys.stdin)[0]["n"])
except Exception: print("?")')
    [ "$n" != "0" ] && [ "$n" != "?" ] && break
    sleep 10
  done
  if [ "$n" = "?" ]; then mal "No pude leer la base (¿sesión del CLI caducada? supabase login)"; return 1; fi
  if [ "$n" -ge 1 ] 2>/dev/null; then
    ok "Perfil en Pro tras el pago de prueba. Webhook OK."
    aviso "Code cancelará la suscripción de prueba en Stripe y tu perfil volverá a «free»."
    return 0
  fi
  mal "El perfil no cambió a Pro. ¿Usaste en Stripe el mismo correo que en la web? (gracias=$F114_GRACIAS)"
  aviso "Code revisará el webhook en Stripe y los logs de Vercel."
  return 1
}

# Ejecutado suelto: guía y comprobación sin tocar la cola.
if [ "${BASH_SOURCE[0]}" = "$0" ]; then
  hacer && comprobar
fi
