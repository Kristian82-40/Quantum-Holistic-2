#!/usr/bin/env bash
# Guía paso a paso de las tareas pendientes de Kristian (8-oct-2026).
#   bash kimiko/guia-tareas.sh        (desde la raíz del repo, en el Mac)
#
# Por cada tarea: abre la página exacta, enseña los pasos, espera Enter (o "s" para saltar)
# y al final comprueba con código si quedó bien (verde) o no (rojo).
#
# Las llaves se piden con `read -s` (no se ven al escribir), viven solo en una variable mientras dura la tarea
# y se guardan únicamente en Supabase → Edge Functions → Secrets. Nunca se imprimen ni se escriben en archivos:
#   · a Supabase llegan por una tubería (--env-file <(printf …)), no por la línea de comandos;
#   · a curl, por su entrada estándar (-K -), para que no salgan en `ps`;
#   · la comprobación compara la huella SHA-256 que guarda Supabase con la de lo que escribiste.
# Las cuatro tareas cuestan 0 €.

set -uo pipefail
cd "$(dirname "$0")/.."

PROYECTO=vctetjugbvyllwjpxcxh
SUPABASE_URL="https://$PROYECTO.supabase.co"
ZIPS="/Volumes/Papu Ext/QuantumHolistic/skills-chat"
WRANGLER="/Volumes/Papu Ext/creando-kimiko-app/kimiko/node_modules/.bin/wrangler"
[ -x "$WRANGLER" ] || WRANGLER="npx -y wrangler"

VERDE=$'\e[32m'; ROJO=$'\e[31m'; AMARILLO=$'\e[33m'; NEGRITA=$'\e[1m'; FIN=$'\e[0m'
ok()    { echo "${VERDE}✔ $*${FIN}"; }
mal()   { echo "${ROJO}✘ $*${FIN}"; }
aviso() { echo "${AMARILLO}• $*${FIN}"; }
titulo() { echo; echo "${NEGRITA}━━━ $* ━━━${FIN}"; }

# Enter = seguir, s = saltar esta tarea. Devuelve 1 si se salta.
seguir() {
  local r
  read -r -p "  [Enter] seguir · [s] saltar esta tarea → " r
  [ "${r:-}" != "s" ] && [ "${r:-}" != "S" ]
}

# Pide una llave sin que se vea. La deja en la variable cuyo nombre se pasa.
pedir_llave() {
  local __var=$1 __texto=$2 __v
  read -r -s -p "  $__texto (no se verá al pegar): " __v; echo
  printf -v "$__var" '%s' "$__v"
}

huella() { printf '%s' "$1" | shasum -a 256 | cut -c1-64; }

# Huella guardada en Supabase para un secreto (vacío si no existe).
huella_supabase() {
  supabase secrets list --project-ref "$PROYECTO" -o json 2>/dev/null \
    | python3 -c "import json,sys; n=sys.argv[1]; print(next((x['value'] for x in json.load(sys.stdin) if x['name']==n), ''))" "$1"
}

# Guarda NOMBRE=valor en los secretos de las Edge Functions sin pasar el valor por argumentos ni por archivos.
guardar_secreto() {
  supabase secrets set --project-ref "$PROYECTO" --env-file <(printf '%s=%s\n' "$1" "$2") >/dev/null 2>&1
}

# GET con cabecera secreta pasada por la entrada estándar de curl. Devuelve el código HTTP.
http_con_llave() {
  local cabecera=$1 url=$2
  printf 'header = "%s"\n' "$cabecera" | curl -s -o /dev/null -w '%{http_code}' --max-time 20 -K - "$url"
}

# ── Tarea suelta: token de Cloudflare para desplegar el worker desde Actions (9-oct) ──
#   bash kimiko/guia-tareas.sh cloudflare
# Sin este token, los botones de Telegram (✅ Publicar, 🗑 Retirar) no pueden llegar al worker nuevo.
# CLOUDFLARE_ACCOUNT_ID ya lo puso Claude Code el 9-oct (no es secreto). El token va solo a GitHub Secrets.
if [ "${1:-}" = "cloudflare" ]; then
  titulo "Token de Cloudflare para GitHub Actions (0 €)"
  command -v gh >/dev/null && gh auth status >/dev/null 2>&1 && ok "GitHub CLI con sesión abierta" || { mal "Falta la sesión de GitHub: gh auth login"; exit 1; }
  gh secret list | grep -q '^CLOUDFLARE_ACCOUNT_ID' && ok "CLOUDFLARE_ACCOUNT_ID ya está en GitHub" || aviso "Falta CLOUDFLARE_ACCOUNT_ID: te lo pediré al final"
  cat <<'PASOS'
  Para qué: GitHub Actions despliega el worker "kimiko" (Telegram) sin el Mac cada vez que cambia su código.
  1. Se abre dash.cloudflare.com/profile/api-tokens. Entra con kristiantroncoso@gmail.com si te lo pide.
  2. Pulsa "Create Token".
  3. En la plantilla "Edit Cloudflare Workers" pulsa "Use template".
  4. Account Resources: Include → "Kristiantroncoso@gmail.com's Account".
     Zone Resources: Include → All zones. No toques nada más (sin IP ni fecha de caducidad).
  5. Pulsa "Continue to summary" y luego "Create Token".
  6. Pulsa "Copy". Solo se ve una vez. Vuelve aquí y pégalo cuando te lo pida.
PASOS
  seguir || { aviso "Saltada"; exit 0; }
  open "https://dash.cloudflare.com/profile/api-tokens"
  pedir_llave CFDEPLOY "Pega el token de Cloudflare"
  if [ "$(http_con_llave "Authorization: Bearer $CFDEPLOY" https://api.cloudflare.com/client/v4/user/tokens/verify)" != "200" ]; then
    unset CFDEPLOY; mal "Cloudflare no acepta el token: no lo guardo. Repite desde el paso 2."; exit 1
  fi
  ok "Cloudflare acepta el token"
  # A gh le llega por la entrada estándar: no aparece en la línea de comandos ni en el historial.
  if printf '%s' "$CFDEPLOY" | gh secret set CLOUDFLARE_API_TOKEN >/dev/null; then ok "Guardado en GitHub → Secrets"
  else unset CFDEPLOY; mal "No pude guardarlo en GitHub"; exit 1; fi
  unset CFDEPLOY
  if ! gh secret list | grep -q '^CLOUDFLARE_ACCOUNT_ID'; then
    read -r -p "  Pega tu Account ID (32 caracteres, en la portada del panel; no es secreto): " CUENTA
    printf '%s' "$CUENTA" | gh secret set CLOUDFLARE_ACCOUNT_ID >/dev/null && ok "CLOUDFLARE_ACCOUNT_ID guardado"
  fi
  aviso "Lanzo el despliegue del worker desde main y espero el resultado (1–2 min)…"
  gh workflow run desplegar-worker.yml --ref main && sleep 8
  RUN=$(gh run list --workflow desplegar-worker.yml --limit 1 --json databaseId -q '.[0].databaseId')
  if gh run watch "$RUN" --exit-status >/dev/null 2>&1 && ! gh run view "$RUN" --log 2>/dev/null | grep -q "no se despliega"; then
    ok "Worker desplegado desde Actions (run $RUN). Ya puedes cerrar esta ventana."
  else
    mal "El despliegue no salió bien: abre https://github.com/Kristian82-40/Quantum-Holistic-2/actions/runs/$RUN"
  fi
  exit 0
fi

# ── Antes de empezar ──────────────────────────────────────────────────────────
titulo "Comprobaciones previas"
command -v supabase >/dev/null && ok "Supabase CLI instalada" || { mal "Falta la CLI de Supabase (brew install supabase/tap/supabase)"; exit 1; }
supabase projects list 2>/dev/null | grep -q "$PROYECTO" && ok "Sesión de Supabase abierta" || { mal "Inicia sesión: supabase login"; exit 1; }
LLAVE_SERVICIO=$(grep -E '^SUPABASE_SERVICE_ROLE_KEY=' .env.local 2>/dev/null | cut -d= -f2- | tr -d '"' || true)
[ -n "$LLAVE_SERVICIO" ] && ok "Llave de servicio leída de .env.local (para comprobar, no se muestra)" || aviso "Sin .env.local: la tarea 2 no podrá hacer su última comprobación"

RESUMEN=()

# ── Tarea 1: Groq ─────────────────────────────────────────────────────────────
titulo "Tarea 1 de 4 · Llave de Groq (tercer motor de texto, gratis)"
cat <<'PASOS'
  Para qué: si fallan Gemini y Workers AI, Kimiko escribe con Groq (1.000 peticiones/día gratis, sin tarjeta).
  1. Se abre console.groq.com/keys. Si te lo pide, entra con Google (kristiantroncoso@gmail.com).
  2. Pulsa "Create API Key".
  3. Nombre: kimiko-supabase. Pulsa "Submit".
  4. Pulsa el botón de copiar (la llave empieza por gsk_). Solo se ve una vez.
  5. Vuelve aquí y pégala cuando te la pida.
PASOS
if seguir; then
  open "https://console.groq.com/keys"
  pedir_llave GROQ "Pega la llave de Groq"
  if [ "${GROQ:0:4}" != "gsk_" ]; then
    mal "No empieza por gsk_: no la guardo. Repite la tarea."; RESUMEN+=("${ROJO}✘ Groq${FIN}")
  elif [ "$(http_con_llave "Authorization: Bearer $GROQ" https://api.groq.com/openai/v1/models)" != "200" ]; then
    mal "Groq no acepta la llave: no la guardo."; RESUMEN+=("${ROJO}✘ Groq${FIN}")
  elif guardar_secreto GROQ_API_KEY "$GROQ" && [ "$(huella_supabase GROQ_API_KEY)" = "$(huella "$GROQ")" ]; then
    ok "Groq acepta la llave y está guardada en Supabase (la huella coincide)"; RESUMEN+=("${VERDE}✔ Groq${FIN}")
  else
    mal "No pude guardarla en Supabase o la huella no coincide"; RESUMEN+=("${ROJO}✘ Groq${FIN}")
  fi
  unset GROQ
else
  aviso "Saltada"; RESUMEN+=("${AMARILLO}• Groq (saltada)${FIN}")
fi

# ── Tarea 2: Workers AI ───────────────────────────────────────────────────────
titulo "Tarea 2 de 4 · Workers AI de Cloudflare (Account ID + token)"
CUENTA=$($WRANGLER whoami 2>/dev/null | grep -oE '[0-9a-f]{32}' | head -1 || true)
cat <<'PASOS'
  Para qué: segundo motor de texto y las imágenes acuarela (10.000 neuronas/día gratis; al acabarse, no cobra).
  1. Se abre el panel de Workers AI de tu cuenta de Cloudflare.
  2. Pulsa "Use REST API".
  3. Pulsa "Create a Workers AI API Token". Revisa que pone Workers AI (lectura y edición).
  4. Pulsa "Create API Token" y luego "Copy API Token". Solo se ve una vez.
  5. En esa misma pantalla está tu "Account ID": el script ya lo ha leído con wrangler; si no, te lo pedirá.
  6. Vuelve aquí y pega el token cuando te lo pida.
PASOS
if seguir; then
  open "https://dash.cloudflare.com/?to=/:account/ai/workers-ai"
  if [ -z "$CUENTA" ]; then read -r -p "  Pega tu Account ID (32 caracteres, no es secreto): " CUENTA; fi
  if [[ ! "$CUENTA" =~ ^[0-9a-f]{32}$ ]]; then
    mal "El Account ID no tiene 32 caracteres hexadecimales"; RESUMEN+=("${ROJO}✘ Workers AI${FIN}")
  else
    if [ "$(huella_supabase CF_ACCOUNT_ID)" = "$(huella "$CUENTA")" ]; then ok "CF_ACCOUNT_ID ya estaba bien en Supabase"
    elif guardar_secreto CF_ACCOUNT_ID "$CUENTA"; then ok "CF_ACCOUNT_ID guardado"
    else mal "No pude guardar CF_ACCOUNT_ID"; fi
    pedir_llave CFTOKEN "Pega el token de Workers AI"
    if [ "$(http_con_llave "Authorization: Bearer $CFTOKEN" "https://api.cloudflare.com/client/v4/accounts/$CUENTA/ai/models/search?per_page=1")" != "200" ]; then
      mal "Cloudflare no acepta el token para esta cuenta: no lo guardo."; RESUMEN+=("${ROJO}✘ Workers AI${FIN}")
    elif guardar_secreto CF_AI_TOKEN "$CFTOKEN" && [ "$(huella_supabase CF_AI_TOKEN)" = "$(huella "$CFTOKEN")" ]; then
      ok "Cloudflare acepta el token y está guardado en Supabase (la huella coincide)"
      # Última prueba: la función kimiko-imagen dice si ve las dos llaves (solo true/false, nunca el valor).
      if [ -n "$LLAVE_SERVICIO" ]; then
        sleep 5
        diag=$(printf 'header = "apikey: %s"\n' "$LLAVE_SERVICIO" | curl -s --max-time 30 -K - -X POST "$SUPABASE_URL/functions/v1/kimiko-imagen" -H 'content-type: application/json' -d '{"accion":"diag"}')
        if [ "$diag" = '{"cf_ai_token":true,"cf_account_id":true}' ]; then ok "kimiko-imagen ya ve las dos llaves"; RESUMEN+=("${VERDE}✔ Workers AI${FIN}")
        else aviso "kimiko-imagen aún no las ve ($diag). Suele tardar un minuto: vuelve a lanzar solo esta tarea más tarde."; RESUMEN+=("${AMARILLO}• Workers AI (guardado, función sin confirmar)${FIN}"); fi
      else RESUMEN+=("${VERDE}✔ Workers AI${FIN}"); fi
    else
      mal "No pude guardarlo en Supabase o la huella no coincide"; RESUMEN+=("${ROJO}✘ Workers AI${FIN}")
    fi
    unset CFTOKEN
  fi
else
  aviso "Saltada"; RESUMEN+=("${AMARILLO}• Workers AI (saltada)${FIN}")
fi

# ── Tarea 3: skills en claude.ai ──────────────────────────────────────────────
titulo "Tarea 3 de 4 · Subir las skills a claude.ai (para el chat)"
cat <<'PASOS'
  Para qué: que Claude en el chat siga las mismas reglas que Claude Code (sesión, cambios, diseño, seguridad, editorial).
  claude.ai acepta UNA skill por .zip: hay que subir los 5 archivos qh-*.zip (no qh-skills-todas.zip).
  1. Se abren Ajustes → Capacidades de claude.ai y la carpeta con los .zip en el Finder.
  2. Comprueba que "Ejecución de código y creación de archivos" está activado (las skills lo necesitan).
  3. En "Skills", pulsa "Upload skill" y elige qh-sesion.zip.
  4. Repite con qh-cambio-seguro.zip, qh-diseno.zip, qh-seguridad.zip y qh-editorial.zip.
  5. Comprueba que las 5 aparecen en la lista y están activadas.
PASOS
if seguir; then
  bien=0
  for s in qh-sesion qh-cambio-seguro qh-diseno qh-seguridad qh-editorial; do
    if unzip -tq "$ZIPS/$s.zip" >/dev/null 2>&1 && unzip -l "$ZIPS/$s.zip" | grep -q "$s/SKILL.md"; then bien=$((bien+1)); else mal "$s.zip falta o está dañado"; fi
  done
  [ "$bien" = 5 ] && ok "Los 5 .zip están bien formados (carpeta + SKILL.md)"
  open "https://claude.ai/settings/capabilities"; open "$ZIPS"
  read -r -p "  Cuando hayas subido las 5, pulsa Enter → " _
  # claude.ai no tiene API para listar skills: esta comprobación solo puede ser tuya.
  read -r -p "  ¿Ves las 5 skills qh-… activadas en la lista? [s/n] → " r
  if [ "$bien" = 5 ] && [ "${r:-n}" = "s" ]; then ok "Skills subidas (confirmado por ti: claude.ai no deja comprobarlo por código)"; RESUMEN+=("${VERDE}✔ Skills en claude.ai (confirmado a mano)${FIN}")
  else mal "Faltan skills por subir"; RESUMEN+=("${ROJO}✘ Skills en claude.ai${FIN}"); fi
else
  aviso "Saltada"; RESUMEN+=("${AMARILLO}• Skills (saltada)${FIN}")
fi

# ── Tarea 4: conectores ───────────────────────────────────────────────────────
titulo "Tarea 4 de 4 · Desconectar Expedia, Kiwi.com, lastminute.com y Gamma"
cat <<'PASOS'
  Para qué: no se usan en Quantum Holistic y cada uno añade herramientas que gastan contexto en cada conversación.
  Ojo: en claude.ai los conectores no se apagan por proyecto; desconectarlos en Ajustes los quita en todas partes
  (también en Claude Code). Si algún día los quieres para viajar, se vuelven a conectar en un clic.
  1. Se abre Ajustes → Conectores de claude.ai.
  2. Pulsa en Expedia → "Disconnect" (o los tres puntos → Desconectar).
  3. Repite con Kiwi.com, lastminute.com y Gamma.
PASOS
if seguir; then
  open "https://claude.ai/settings/connectors"
  read -r -p "  Cuando hayas desconectado los 4, pulsa Enter → " _
  quedan=$(claude mcp list 2>/dev/null | grep -iE 'claude\.ai (Expedia|Kiwi\.com|lastminute\.com|Gamma):' | grep -c 'Connected' || true)
  if [ "$quedan" = 0 ]; then ok "Claude Code ya no ve ninguno de los 4 conectores"; RESUMEN+=("${VERDE}✔ Conectores${FIN}")
  else
    mal "Claude Code aún ve $quedan de los 4 como conectados."
    aviso "Puede ser caché de Claude Code: cierra y vuelve a abrir Claude Code y lanza otra vez esta tarea."
    RESUMEN+=("${ROJO}✘ Conectores ($quedan siguen conectados)${FIN}")
  fi
else
  aviso "Saltada"; RESUMEN+=("${AMARILLO}• Conectores (saltada)${FIN}")
fi

unset LLAVE_SERVICIO
titulo "Resumen"
printf '  %s\n' "${RESUMEN[@]}"
echo
echo "  Cuando todo esté en verde, el chequeo de mañana a las 06:00 UTC lo confirmará por Telegram."
