#!/usr/bin/env bash
# Módulo F1-07 (+ F1-08) · Correo del dominio quantum-holistic.com · 7-nov-2026
#   bash kimiko/tareas/run.sh F1-07                       lo normal: guía, pone el DNS, comprueba y guarda el recibo
#   SECO=1 bash kimiko/tareas/modulos/F1-07.sh            prueba en seco: no abre páginas ni escribe nada fuera
#
# D3 A: buzón en Zoho Mail gratis (centro de datos de la UE) + envío con Resend (región eu-west-1).
# D3 B (si Zoho no deja el plan gratis): reenvío gratis con ImprovMX hacia Gmail + envío con Resend.
#
# Llaves: la de Resend se pide con `read -s`, vive solo en una variable de esta shell, va a curl por un
# descriptor (no aparece en `ps`) y se borra al terminar. Nunca se imprime ni se guarda.
# DNS: con el CLI de Vercel si está con sesión (`vercel whoami`); si no, deja los registros (son públicos)
# en el recibo de F1-08 para que Code los añada por la API de Vercel.
# Compatible con el bash 3.2 del Mac (sin arrays asociativos ni mapfile).

DOMINIO="quantum-holistic.com"
EQUIPO_VERCEL="kristiantroncoso-8620s-projects"
BUZON="hola@$DOMINIO"
NS_AUTORIDAD="ns1.vercel-dns.com"   # se pregunta al servidor de Vercel: responde al momento, sin cachés
RESEND_API="https://api.resend.com"

# Si se ejecuta suelto (no desde run.sh) define lo mínimo.
if ! declare -F ok >/dev/null; then
  VERDE=$'\e[32m'; ROJO=$'\e[31m'; AMARILLO=$'\e[33m'; NEGRITA=$'\e[1m'; FIN=$'\e[0m'
  ok()    { echo "${VERDE}✔ $*${FIN}"; }
  mal()   { echo "${ROJO}✘ $*${FIN}"; }
  aviso() { echo "${AMARILLO}• $*${FIN}"; }
fi

# ── Estado del módulo (se rellena en hacer, lo lee comprobar) ──
F107_PLAN=""            # A (Zoho) o B (ImprovMX)
F107_ZOHO_DC=""         # eu | com | in | com.au
F107_ZOHO_TXT=""
F107_RESEND_ID=""
F107_GMAIL_OK=""        # s/n: llegó el correo de prueba a Gmail con SPF, DKIM y DMARC en PASS
F107_BUZON_OK=""        # s/n: llegó el correo de prueba al buzón del dominio
F107_N=0                # registros DNS que hacen falta
F107_PEND=""            # registros que no se pudieron poner (texto para el recibo de F1-08)
REG_TIPO=(); REG_NOMBRE=(); REG_VALOR=(); REG_PRIO=()
_LLAVE=""

seco() { [ "${SECO:-}" = "1" ]; }
abrir() { if seco; then aviso "(seco) abriría $1"; else open "$1" 2>/dev/null || aviso "Ábrela a mano: $1"; fi; }
pausa() { local _r; read -r -p "  $1 [Enter] → " _r; }
pregunta_sn() { local _r; read -r -p "  $1 [s/n] → " _r; case "${_r:-}" in s|S|si|sí|Sí|SI) return 0;; *) return 1;; esac; }

# ── DNS ──
# Respuesta del servidor de Vercel, una línea por registro, sin comillas (los TXT largos vienen en trozos).
dns() { # $1 tipo, $2 nombre completo
  command -v dig >/dev/null || { echo ""; return; }
  dig +short +time=3 +tries=1 @"$NS_AUTORIDAD" "$1" "$2" 2>/dev/null | sed -e 's/" "//g' -e 's/"//g'
}
fqdn() { if [ -z "$1" ]; then echo "$DOMINIO"; else echo "$1.$DOMINIO"; fi; }
esta() { # $1 tipo, $2 nombre relativo, $3 valor, $4 prioridad
  local resp; resp=$(dns "$1" "$(fqdn "$2")")
  if [ "$1" = "MX" ]; then printf '%s\n' "$resp" | grep -qiE "^${4} ${3%.}\.?$"
  else printf '%s\n' "$resp" | grep -qF -- "$3"; fi
}
necesito() { # tipo nombre valor [prioridad]
  REG_TIPO[$F107_N]=$1; REG_NOMBRE[$F107_N]=$2; REG_VALOR[$F107_N]=$3; REG_PRIO[$F107_N]=${4:-}
  F107_N=$((F107_N + 1))
}

vercel_listo() {
  seco && return 1
  command -v vercel >/dev/null && vercel whoami --scope "$EQUIPO_VERCEL" >/dev/null 2>&1
}

poner_dns() {
  local i=0 tipo nombre valor prio etiqueta usar_cli=0
  vercel_listo && usar_cli=1
  if [ $usar_cli = 0 ] && ! seco; then aviso "No hay CLI de Vercel con sesión: Code pondrá los registros que falten (quedan en F1-08)."; fi
  F107_PEND=""
  while [ $i -lt $F107_N ]; do
    tipo=${REG_TIPO[$i]}; nombre=${REG_NOMBRE[$i]}; valor=${REG_VALOR[$i]}; prio=${REG_PRIO[$i]}
    etiqueta="$tipo $(fqdn "$nombre") ${prio:+$prio }$valor"
    if esta "$tipo" "$nombre" "$valor" "$prio"; then ok "Ya estaba: $etiqueta"
    elif seco; then aviso "(seco) añadiría: $etiqueta"
    elif [ $usar_cli = 1 ] && vercel dns add "$DOMINIO" "${nombre:-@}" "$tipo" "$valor" $prio --scope "$EQUIPO_VERCEL" >/dev/null 2>&1; then
      ok "Añadido: $etiqueta"
    else
      F107_PEND="${F107_PEND}${tipo}|${nombre:-@}|${prio}|${valor}"$'\n'
      aviso "Pendiente para Code: $etiqueta"
    fi
    i=$((i + 1))
  done
}

esperar_dns() { # espera hasta 2 min a que el servidor de Vercel tenga todo
  seco && return 0
  command -v dig >/dev/null || { aviso "Sin dig en este Mac: no puedo esperar al DNS."; return 1; }
  local vuelta=0 i faltan
  while [ $vuelta -lt 8 ]; do
    faltan=0; i=0
    while [ $i -lt $F107_N ]; do
      esta "${REG_TIPO[$i]}" "${REG_NOMBRE[$i]}" "${REG_VALOR[$i]}" "${REG_PRIO[$i]}" || faltan=$((faltan + 1))
      i=$((i + 1))
    done
    [ $faltan = 0 ] && { ok "Los $F107_N registros responden en el DNS de Vercel"; return 0; }
    aviso "Faltan $faltan registros en el DNS; espero 15 s…"; sleep 15; vuelta=$((vuelta + 1))
  done
  return 1
}

# ── Resend (la llave va por un descriptor, nunca como argumento) ──
resend() { # $1 método, $2 ruta, $3 cuerpo JSON opcional → JSON por la salida
  if seco; then echo '{}'; return 0; fi
  curl -sS --max-time 20 -X "$1" "$RESEND_API$2" \
    -H @<(printf 'Authorization: Bearer %s\nContent-Type: application/json\n' "$_LLAVE") \
    ${3:+--data "$3"}
}
json() { python3 -I -c "import json,sys
try: d=json.load(sys.stdin)
except Exception: d={}
$1" 2>/dev/null; }

resend_dominio() { # crea (o reutiliza) el dominio en eu-west-1 y añade sus registros a la lista
  local lista registros
  lista=$(resend GET /domains)
  F107_RESEND_ID=$(printf '%s' "$lista" | json "print(next((x['id'] for x in d.get('data',[]) if x.get('name')=='$DOMINIO'),''))")
  if [ -z "$F107_RESEND_ID" ]; then
    if seco; then F107_RESEND_ID="seco"; aviso "(seco) daría de alta $DOMINIO en Resend (eu-west-1)"
    else
      registros=$(resend POST /domains "{\"name\":\"$DOMINIO\",\"region\":\"eu-west-1\"}")
      F107_RESEND_ID=$(printf '%s' "$registros" | json "print(d.get('id',''))")
      [ -n "$F107_RESEND_ID" ] || { mal "Resend no aceptó el dominio: $(printf '%s' "$registros" | json "print(d.get('message','sin respuesta'))")"; return 1; }
      ok "Dominio dado de alta en Resend (Irlanda, eu-west-1)"
    fi
  else ok "El dominio ya estaba en Resend"; fi
  seco && { necesito MX send feedback-smtp.eu-west-1.amazonses.com 10; necesito TXT send "v=spf1 include:amazonses.com ~all"; necesito TXT resend._domainkey "p=(clave pública de Resend)"; return 0; }
  registros=$(resend GET "/domains/$F107_RESEND_ID")
  # Una línea por registro: tipo|nombre relativo|prioridad|valor
  local lineas linea t n p v
  lineas=$(printf '%s' "$registros" | json "
for r in d.get('records',[]):
    n=r.get('name','').removesuffix('.$DOMINIO').removesuffix('$DOMINIO')
    print('|'.join([r.get('type',''), n, str(r.get('priority') or ''), r.get('value','').strip(chr(34))]))")
  [ -n "$lineas" ] || { mal "Resend no devolvió registros"; return 1; }
  while IFS='|' read -r t n p v; do [ -n "$t" ] && necesito "$t" "$n" "$v" "$p"; done <<< "$lineas"
}

resend_verificado() {
  seco && return 0
  local estado vuelta=0
  resend POST "/domains/$F107_RESEND_ID/verify" >/dev/null
  while [ $vuelta -lt 8 ]; do
    estado=$(resend GET "/domains/$F107_RESEND_ID" | json "print(d.get('status',''))")
    [ "$estado" = "verified" ] && { ok "Resend: dominio verificado"; return 0; }
    aviso "Resend: «${estado:-sin respuesta}»; espero 15 s…"; sleep 15; vuelta=$((vuelta + 1))
  done
  mal "Resend aún no lo da por verificado (puede tardar hasta 1 h; repite run.sh F1-07)"; return 1
}

correo_prueba() { # $1 destino
  local cuerpo resp
  cuerpo=$(python3 -I -c 'import json,sys; print(json.dumps({"from":"Quantum Holistic <'"$BUZON"'>","to":[sys.argv[1]],
"subject":"Prueba F1-07 · correo del dominio","text":"Correo de prueba del módulo F1-07. Si lo lees, el envío desde quantum-holistic.com funciona."}))' "$1")
  if seco; then aviso "(seco) enviaría un correo de prueba a $1"; return 0; fi
  resp=$(resend POST /emails "$cuerpo")
  if [ -n "$(printf '%s' "$resp" | json "print(d.get('id',''))")" ]; then ok "Correo de prueba enviado a $1"
  else mal "Resend no lo envió: $(printf '%s' "$resp" | json "print(d.get('message','sin respuesta'))")"; return 1; fi
}

# ── Pasos ──
paso_zoho() {
  echo; echo "${NEGRITA}1 · Buzón en Zoho Mail (gratis)${FIN}"
  abrir "https://www.zoho.eu/mail/zohomail-pricing.html"
  echo "  En la página: baja hasta el plan «Forever Free» (gratis, hasta 5 usuarios) y pulsa «Sign up»."
  echo "  · Elige «Ya tengo un dominio» y escribe ${NEGRITA}$DOMINIO${FIN}."
  echo "  · Tu usuario: ${NEGRITA}hola${FIN} (queda $BUZON). Tus datos y tu móvil para el código SMS."
  echo "  · No metas tarjeta: si te la pide, no es el plan gratis."
  if ! pregunta_sn "¿Has llegado a la pantalla «Verificar dominio» sin pagar nada?"; then
    F107_PLAN="B"; aviso "Zoho no deja el plan gratis aquí: paso a D3 B (reenvío gratis a Gmail con ImprovMX + envío con Resend)."
    return 0
  fi
  F107_PLAN="A"
  echo "  En «Verificar dominio» elige el método ${NEGRITA}TXT${FIN} y copia el valor (empieza por zoho-verification=)."
  local v
  while true; do
    read -r -p "  Pega aquí el valor TXT → " v
    v=$(printf '%s' "$v" | tr -d '[:space:]"')
    if [[ "$v" =~ ^zoho-verification=zb[0-9A-Za-z]+\.zmverify\.zoho\.(eu|com|in|com\.au|jp|com\.cn)$ ]]; then
      F107_ZOHO_TXT=$v; F107_ZOHO_DC=${BASH_REMATCH[1]}; break
    fi
    mal "No parece el valor de Zoho (zoho-verification=zb….zmverify.zoho.eu). Vuelve a copiarlo."
  done
  [ "$F107_ZOHO_DC" = "eu" ] || aviso "Tu cuenta de Zoho está en el centro de datos «$F107_ZOHO_DC», no en la UE: sigo con sus servidores."
  necesito TXT "" "$F107_ZOHO_TXT"
  local mx="zoho.$F107_ZOHO_DC" spf="zoho.$F107_ZOHO_DC"
  [ "$F107_ZOHO_DC" = "eu" ] && spf="zohomail.eu"
  necesito MX "" "mx.$mx" 10; necesito MX "" "mx2.$mx" 20; necesito MX "" "mx3.$mx" 50
  necesito TXT "" "v=spf1 include:$spf ~all"
}

paso_improvmx() {
  echo; echo "${NEGRITA}1 · Plan B: reenvío gratis con ImprovMX${FIN}"
  abrir "https://app.improvmx.com/"
  echo "  · Escribe ${NEGRITA}$DOMINIO${FIN} y tu Gmail como destino; crea el alias ${NEGRITA}hola${FIN} → tu Gmail."
  echo "  · Plan gratuito (no metas tarjeta). Los registros los pongo yo."
  pausa "Cuando veas el dominio añadido en ImprovMX"
  necesito MX "" mx1.improvmx.com 10; necesito MX "" mx2.improvmx.com 20
  necesito TXT "" "v=spf1 include:spf.improvmx.com ~all"
}

paso_resend() {
  echo; echo "${NEGRITA}2 · Envío con Resend${FIN}"
  abrir "https://resend.com/api-keys"
  echo "  Entra en Resend (la cuenta que ya usa la web; si no tienes, crea una gratis) → «Create API key»,"
  echo "  nombre ${NEGRITA}F1-07${FIN}, permiso ${NEGRITA}Full access${FIN}. Cópiala. Al acabar la puedes borrar."
  while true; do
    if seco; then _LLAVE="re_seco"; aviso "(seco) llave de prueba"; break; fi
    read -r -s -p "  Pega la llave (no se verá) → " _LLAVE; echo
    _LLAVE=$(printf '%s' "$_LLAVE" | tr -d '[:space:]')
    [[ "$_LLAVE" =~ ^re_[A-Za-z0-9_]{10,}$ ]] && break
    mal "No parece una llave de Resend (empieza por re_). Otra vez."
  done
  ok "Llave recibida (huella $(printf '%s' "$_LLAVE" | shasum -a 256 2>/dev/null | cut -c1-8 || echo '—'))"
  resend_dominio
}

paso_dmarc() {
  necesito TXT _dmarc "v=DMARC1; p=none; rua=mailto:$BUZON; adkim=r; aspf=r"
}

paso_zoho_final() {
  [ "$F107_PLAN" = "A" ] || return 0
  echo; echo "${NEGRITA}4 · Termina en Zoho${FIN}"
  echo "  Vuelve a la pestaña de Zoho y pulsa ${NEGRITA}«Verificar»${FIN}. Luego, en los pasos de MX y SPF, pulsa «Verificar» también."
  echo "  Si te ofrece DKIM: «Añadir selector», nombre ${NEGRITA}zmail${FIN}, y pega aquí el valor TXT que te da (o Enter para saltarlo)."
  local dk
  read -r -p "  Valor DKIM de Zoho (empieza por v=DKIM1) → " dk
  dk=$(printf '%s' "$dk" | tr -d '"' | sed 's/^ *//; s/ *$//')
  if [[ "$dk" =~ ^v=DKIM1\;.*p=[A-Za-z0-9+/=]{100,}$ ]]; then
    necesito TXT zmail._domainkey "$dk"; poner_dns; esperar_dns
    pausa "Pulsa «Verificar» en el DKIM de Zoho y vuelve"
  elif [ -n "$dk" ]; then aviso "Eso no parece un DKIM de Zoho: lo salto (se puede hacer después)."; fi
  pausa "Cuando Zoho diga que el dominio está verificado"
}

paso_pruebas() {
  echo; echo "${NEGRITA}5 · Correos de prueba${FIN}"
  local gmail
  gmail=$(sed -n "s/^ *email: *'\([^']*\)'.*/\1/p" config.ts 2>/dev/null | head -1)
  correo_prueba "${gmail:-kristiantroncoso@gmail.com}" || true
  correo_prueba "$BUZON" || true
  echo "  En Gmail abre el correo «Prueba F1-07» → ⋮ → «Mostrar original» y mira SPF, DKIM y DMARC."
  if pregunta_sn "¿Ha llegado a Gmail y los tres dicen PASS?"; then F107_GMAIL_OK=s; else F107_GMAIL_OK=n; fi
  if [ "$F107_PLAN" = "A" ]; then echo "  Abre https://mail.zoho.eu (o tu app de Zoho Mail) con $BUZON."
  else echo "  Con ImprovMX el que va a $BUZON llega reenviado a tu Gmail."; fi
  if pregunta_sn "¿Ha llegado también el que va a $BUZON?"; then F107_BUZON_OK=s; else F107_BUZON_OK=n; fi
}

guardar_pendientes() { # deja los registros que falten en F1-08 (datos públicos) para que Code los ponga
  [ -n "$F107_PEND" ] || return 0
  local texto="DNS pendiente para Code (tipo|nombre|prioridad|valor):"$'\n'"$F107_PEND"
  if seco || ! declare -F sql >/dev/null; then printf '%s' "$texto"; return 0; fi
  sql "update public.kimiko_tareas set evidencia = evidencia || $(literal "$($FICHA recibo "$texto")")::jsonb
       where id = 'F1-08' returning id" >/dev/null && ok "Registros pendientes guardados en F1-08: avisa a Code."
}

hacer() {
  echo "${NEGRITA}F1-07 · Correo de $DOMINIO${FIN} (unos 30 min; el DNS lo pongo yo)"
  seco && aviso "Prueba en seco: no se abre nada ni se escribe nada fuera."
  paso_zoho
  [ "$F107_PLAN" = "B" ] && paso_improvmx
  paso_resend || return 1
  paso_dmarc
  echo; echo "${NEGRITA}3 · Registros DNS ($F107_N)${FIN}"
  poner_dns
  guardar_pendientes
  if [ -n "$F107_PEND" ]; then
    aviso "Faltan registros por poner: cuando Code los añada, vuelve a lanzar «bash kimiko/tareas/run.sh F1-07»."
    _LLAVE=""; return 0
  fi
  esperar_dns
  paso_zoho_final
  resend_verificado
  paso_pruebas
  return 0
}

comprobar() {
  echo; echo "${NEGRITA}Comprobación${FIN}"
  local fallos=0 i=0
  if ! command -v dig >/dev/null; then mal "Falta dig: no puedo comprobar el DNS"; fallos=1
  else
    while [ $i -lt $F107_N ]; do
      if esta "${REG_TIPO[$i]}" "${REG_NOMBRE[$i]}" "${REG_VALOR[$i]}" "${REG_PRIO[$i]}"; then ok "dig ${REG_TIPO[$i]} $(fqdn "${REG_NOMBRE[$i]}")"
      else mal "dig ${REG_TIPO[$i]} $(fqdn "${REG_NOMBRE[$i]}"): no está"; fallos=$((fallos + 1)); fi
      i=$((i + 1))
    done
  fi
  [ -z "$F107_PEND" ] || { mal "Hay registros pendientes para Code"; fallos=$((fallos + 1)); }
  if [ "$F107_GMAIL_OK" = "s" ]; then ok "Correo de prueba en Gmail con SPF, DKIM y DMARC en PASS"; else mal "Correo de prueba en Gmail: sin confirmar"; fallos=$((fallos + 1)); fi
  if [ "$F107_BUZON_OK" = "s" ]; then ok "Correo de prueba en $BUZON"; else mal "Correo en $BUZON: sin confirmar"; fallos=$((fallos + 1)); fi
  _LLAVE=""
  echo "  Plan ${F107_PLAN:-?}${F107_ZOHO_DC:+ (Zoho $F107_ZOHO_DC)}; Resend ${F107_RESEND_ID:+id ${F107_RESEND_ID:0:8}…}"
  [ $fallos = 0 ]
}

# Suelto (prueba en seco o sin run.sh): hace y comprueba.
if [ "${BASH_SOURCE[0]}" = "$0" ]; then
  set -uo pipefail
  cd "$(dirname "$0")/../../.." || exit 1
  hacer && comprobar && ok "F1-07 comprobada" || aviso "F1-07 sin comprobar del todo"
fi
