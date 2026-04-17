#!/bin/bash
# ─── Quantum Holistic — Script de arranque completo ──────────────────────────
# Arranca n8n, Next.js y el listener de Stripe webhooks en paralelo.
# Uso: ./start-dev.sh

set -e
BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RESET="\033[0m"

PROJECT_ROOT="/Volumes/Papu Ext/QuantumHolistic"
N8N_DB="$PROJECT_ROOT/n8n-data/database.sqlite"
APP_DIR="$PROJECT_ROOT/project/quantum-holistic/app"

echo -e "${BOLD}🌿 Quantum Holistic — Entorno de desarrollo${RESET}"
echo "────────────────────────────────────────────"

# ── n8n ──────────────────────────────────────────────────────────────────────
echo -e "${GREEN}▸ Arrancando n8n...${RESET}"
N8N_USER_FOLDER="$HOME/n8n-data" \
DB_TYPE=sqlite \
DB_SQLITE_DATABASE="$N8N_DB" \
npx n8n start > /tmp/n8n-dev.log 2>&1 &
N8N_PID=$!

# Esperar n8n
until curl -s http://localhost:5678/healthz > /dev/null 2>&1; do sleep 2; done
echo -e "  ${GREEN}✓ n8n listo en http://localhost:5678${RESET}"

# ── Next.js ──────────────────────────────────────────────────────────────────
echo -e "${GREEN}▸ Arrancando Next.js...${RESET}"
cd "$APP_DIR" && npm run dev > /tmp/nextjs-dev.log 2>&1 &
NEXT_PID=$!

# Esperar Next.js
until curl -s http://localhost:3000 > /dev/null 2>&1; do sleep 2; done
echo -e "  ${GREEN}✓ Web lista en http://localhost:3000${RESET}"

# ── Stripe webhook listener ───────────────────────────────────────────────────
if command -v stripe &> /dev/null || [ -f "$HOME/bin/stripe" ]; then
  STRIPE_BIN=$(command -v stripe || echo "$HOME/bin/stripe")

  # Verificar si hay sesión activa de Stripe
  if $STRIPE_BIN config --list 2>/dev/null | grep -q "api_key"; then
    echo -e "${GREEN}▸ Arrancando Stripe webhook listener...${RESET}"
    $STRIPE_BIN listen --forward-to localhost:3000/api/webhooks/stripe > /tmp/stripe-dev.log 2>&1 &
    STRIPE_PID=$!
    sleep 3
    # Capturar el webhook secret
    WEBHOOK_SECRET=$(grep "whsec_" /tmp/stripe-dev.log 2>/dev/null | grep -o "whsec_[a-zA-Z0-9]*" | head -1)
    if [ -n "$WEBHOOK_SECRET" ]; then
      # Actualizar .env.local con el webhook secret
      sed -i '' "s/STRIPE_WEBHOOK_SECRET=.*/STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET/" "$APP_DIR/.env.local"
      echo -e "  ${GREEN}✓ Stripe listener activo — webhook secret actualizado${RESET}"
    fi
  else
    echo -e "  ${YELLOW}⚠ Stripe no configurado. Ejecuta: ~/bin/stripe login${RESET}"
  fi
fi

echo ""
echo -e "${BOLD}Todo listo:${RESET}"
echo "  Web:   http://localhost:3000"
echo "  n8n:   http://localhost:5678"
echo ""
echo "Presiona Ctrl+C para detener todo."

# Mantener el script activo y matar todo al salir
trap "kill $N8N_PID $NEXT_PID ${STRIPE_PID:-} 2>/dev/null; echo 'Entorno detenido.'" EXIT
wait
