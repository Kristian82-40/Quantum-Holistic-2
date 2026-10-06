#!/bin/bash
# kimiko-llaves.sh — los 4 pasos pendientes de Kimiko, desde el terminal del Mac.
# Abre cada ventana justa, pegas la llave (no se ve), Enter, la comprueba y la guarda donde toca.
# Uso:  bash <(curl -fsSL https://raw.githubusercontent.com/Kristian82-40/Quantum-Holistic-2/main/scripts/kimiko-llaves.sh)
# Nada se escribe en el historial ni en disco: solo un registro sin valores en ~/kimiko-llaves.log

set -u
umask 077

SUPA_REF="vctetjugbvyllwjpxcxh"
WORKER="kimiko"
REPO="Kristian82-40/Quantum-Holistic-2"
VERCEL_SCOPE="kristiantroncoso-8620s-projects"
LOG="$HOME/kimiko-llaves.log"

B=$'\033[1m'; G=$'\033[32m'; R=$'\033[31m'; Y=$'\033[33m'; N=$'\033[0m'

ok()   { echo "${G}✅ $*${N}"; echo "$(date '+%F %T') OK  $*" >> "$LOG"; }
fail() { echo "${R}❌ $*${N}"; echo "$(date '+%F %T') ERR $*" >> "$LOG"; }
info() { echo "${Y}👉 $*${N}"; }
titulo(){ echo; echo "${B}━━━ $* ━━━${N}"; }
espera(){ read -r -p "   Pulsa Enter cuando esté hecho (o escribe s para saltar): " r; [ "$r" != "s" ]; }

limpiar() { unset LLAVE; printf '' | pbcopy 2>/dev/null; rm -f "${TMPENV:-}" 2>/dev/null; }
trap limpiar EXIT

pedir_llave() { # $1 = nombre
  LLAVE=""
  while [ -z "$LLAVE" ]; do
    read -r -s -p "   Pega aquí $1 y pulsa Enter (no se verá): " LLAVE; echo
    LLAVE="$(printf '%s' "$LLAVE" | tr -d '[:space:]')"
    [ "$LLAVE" = "s" ] && return 1
  done
}

echo "${B}🌿 Kimiko — llaves pendientes${N}  (registro sin valores en $LOG)"

# ─── 1. CF_AI_TOKEN → Supabase ───────────────────────────────────────────────
titulo "1/4  Token de Workers AI (imágenes gratis) → Supabase"
info "Se abre Cloudflare: Create Token → plantilla 'Workers AI' → Continue to summary → Create Token → Copiar."
open "https://dash.cloudflare.com/profile/api-tokens"
if pedir_llave "CF_AI_TOKEN"; then
  if curl -fsS https://api.cloudflare.com/client/v4/user/tokens/verify \
       -H "Authorization: Bearer $LLAVE" | grep -q '"status":"active"'; then
    ok "CF_AI_TOKEN válido"
    TMPENV="$(mktemp)"; printf 'CF_AI_TOKEN=%s\n' "$LLAVE" > "$TMPENV"
    if npx -y supabase secrets set --env-file "$TMPENV" --project-ref "$SUPA_REF" >/dev/null 2>&1; then
      ok "CF_AI_TOKEN guardado en Supabase"
    else
      info "No pude guardarlo yo (Supabase CLI sin sesión). Te lo dejo copiado: se abre la página,"
      info "Add new secret → nombre CF_AI_TOKEN → pega (Cmd+V) → Save."
      printf '%s' "$LLAVE" | pbcopy
      open "https://supabase.com/dashboard/project/$SUPA_REF/functions/secrets"
      espera && ok "CF_AI_TOKEN guardado a mano en Supabase"
      printf '' | pbcopy
    fi
    rm -f "$TMPENV"
  else
    fail "Cloudflare no reconoce ese token. Vuelve a lanzar el script y repite el paso 1."
  fi
fi
unset LLAVE

# ─── 2. GH_TOKEN → worker de Cloudflare ──────────────────────────────────────
titulo "2/4  Token de GitHub para que Kimiko abra PRs → worker 'kimiko'"
info "Se abre GitHub. Rellena:"
info "  Name: kimiko-worker · Expiration: 90 days"
info "  Repository access: Only select repositories → Quantum-Holistic-2"
info "  Permissions → Contents: Read and write · Pull requests: Read and write"
info "  Generate token → Copiar."
open "https://github.com/settings/personal-access-tokens/new"
if pedir_llave "GH_TOKEN"; then
  RESP="$(curl -fsS -H "Authorization: Bearer $LLAVE" "https://api.github.com/repos/$REPO" 2>/dev/null)"
  if printf '%s' "$RESP" | grep -q '"push": *true'; then
    ok "GH_TOKEN válido y con escritura en $REPO"
    if printf '%s' "$LLAVE" | npx -y wrangler secret put GH_TOKEN --name "$WORKER" >/dev/null 2>&1; then
      ok "GH_TOKEN guardado en el worker $WORKER"
    else
      fail "wrangler no pudo guardarlo. Ejecuta 'npx wrangler login' y vuelve a lanzar el script."
    fi
  else
    fail "El token no tiene escritura en $REPO (revisa repo y permisos) y repite el paso 2."
  fi
fi
unset LLAVE RESP
info "Ahora revoca el token VIEJO de Kimiko (no el kimiko-worker recién creado)."
open "https://github.com/settings/personal-access-tokens"
open "https://github.com/settings/tokens"
espera && ok "Token viejo de GitHub revocado"

# ─── 3. Borrar proyecto 'kimiko' de Vercel ───────────────────────────────────
titulo "3/4  Borrar el proyecto 'kimiko' de Vercel (ya no se usa)"
echo "   ⚠️  Es irreversible. Solo borra 'kimiko', la web q-h.com no se toca."
read -r -p "   Escribe kimiko para borrarlo (o Enter para saltar): " CONF
if [ "$CONF" = "kimiko" ]; then
  if npx -y vercel project rm kimiko --scope "$VERCEL_SCOPE"; then
    ok "Proyecto kimiko borrado de Vercel"
  else
    info "No pude con la CLI (falta 'npx vercel login'). Se abre la página: abajo → Delete Project → escribe kimiko."
    open "https://vercel.com/$VERCEL_SCOPE/kimiko/settings"
    espera && ok "Proyecto kimiko borrado a mano en Vercel"
  fi
fi

# ─── 4. Uso extra de Claude ──────────────────────────────────────────────────
titulo "4/4  Apagar el uso extra de Claude (0 € garantizado)"
info "Se abre claude.ai → Ajustes → Uso: desactiva 'Extra usage'."
open "https://claude.ai/settings/usage"
espera && ok "Uso extra de Claude desactivado"

echo
echo "${B}🌿 Listo.${N} Dile a Claude \"hecho\" y comprobará las llaves y lanzará una orden real de prueba."
