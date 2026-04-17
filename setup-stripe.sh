#!/bin/bash
# ─── Quantum Holistic — Configuración inicial de Stripe ──────────────────────
# Ejecuta este script UNA VEZ después de crear tu cuenta en dashboard.stripe.com
# Uso: ./setup-stripe.sh sk_test_XXXX pk_test_XXXX

BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
RESET="\033[0m"

STRIPE_BIN="$HOME/bin/stripe"
ENV_FILE="/Volumes/Papu Ext/QuantumHolistic/project/quantum-holistic/app/.env.local"

echo -e "${BOLD}Quantum Holistic — Setup de Stripe${RESET}"
echo "────────────────────────────────────"

if [ -z "$1" ] || [ -z "$2" ]; then
  echo -e "${RED}Uso: ./setup-stripe.sh sk_test_XXXX pk_test_XXXX${RESET}"
  echo ""
  echo "Obtén tus claves en: https://dashboard.stripe.com/test/apikeys"
  exit 1
fi

SECRET_KEY="$1"
PUB_KEY="$2"

# Verificar las claves
echo -e "${GREEN}▸ Verificando claves de Stripe...${RESET}"
ACCOUNT=$($STRIPE_BIN --api-key "$SECRET_KEY" get /v1/account 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('email','?'))" 2>/dev/null)

if [ -z "$ACCOUNT" ] || [ "$ACCOUNT" = "?" ]; then
  echo -e "${RED}✗ Clave inválida. Verifica en dashboard.stripe.com${RESET}"
  exit 1
fi
echo -e "  ${GREEN}✓ Cuenta: $ACCOUNT${RESET}"

# Crear productos y precios
echo -e "${GREEN}▸ Creando productos en Stripe...${RESET}"

# Producto Quantum Pro
PRODUCT_ID=$($STRIPE_BIN --api-key "$SECRET_KEY" post /v1/products \
  -d "name=Quantum Pro" \
  -d "description=Plan de bienestar holístico personalizado con IA" \
  2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null)

if [ -z "$PRODUCT_ID" ]; then
  echo -e "${RED}✗ Error creando producto${RESET}"
  exit 1
fi
echo -e "  ${GREEN}✓ Producto creado: $PRODUCT_ID${RESET}"

# Precio mensual €9
PRICE_MONTHLY=$($STRIPE_BIN --api-key "$SECRET_KEY" post /v1/prices \
  -d "product=$PRODUCT_ID" \
  -d "unit_amount=900" \
  -d "currency=eur" \
  -d "recurring[interval]=month" \
  -d "nickname=Quantum Pro Mensual" \
  2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null)

echo -e "  ${GREEN}✓ Precio mensual (€9): $PRICE_MONTHLY${RESET}"

# Precio anual €79
PRICE_ANNUAL=$($STRIPE_BIN --api-key "$SECRET_KEY" post /v1/prices \
  -d "product=$PRODUCT_ID" \
  -d "unit_amount=7900" \
  -d "currency=eur" \
  -d "recurring[interval]=year" \
  -d "nickname=Quantum Pro Anual" \
  2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null)

echo -e "  ${GREEN}✓ Precio anual (€79): $PRICE_ANNUAL${RESET}"

# Actualizar .env.local
echo -e "${GREEN}▸ Actualizando .env.local...${RESET}"
sed -i '' "s|NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=.*|NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$PUB_KEY|" "$ENV_FILE"
sed -i '' "s|STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=$SECRET_KEY|" "$ENV_FILE"
sed -i '' "s|STRIPE_PRO_MONTHLY_PRICE_ID=.*|STRIPE_PRO_MONTHLY_PRICE_ID=$PRICE_MONTHLY|" "$ENV_FILE"
sed -i '' "s|STRIPE_PRO_ANNUAL_PRICE_ID=.*|STRIPE_PRO_ANNUAL_PRICE_ID=$PRICE_ANNUAL|" "$ENV_FILE"

echo -e "  ${GREEN}✓ .env.local actualizado${RESET}"

# Iniciar listener de webhooks para desarrollo
echo -e "${GREEN}▸ Iniciando Stripe webhook listener...${RESET}"
$STRIPE_BIN listen --api-key "$SECRET_KEY" \
  --forward-to localhost:3000/api/webhooks/stripe > /tmp/stripe-dev.log 2>&1 &
sleep 3

WEBHOOK_SECRET=$(grep "whsec_" /tmp/stripe-dev.log 2>/dev/null | grep -o "whsec_[a-zA-Z0-9]*" | head -1)
if [ -n "$WEBHOOK_SECRET" ]; then
  sed -i '' "s|STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET|" "$ENV_FILE"
  echo -e "  ${GREEN}✓ Webhook secret configurado: ${WEBHOOK_SECRET:0:12}...${RESET}"
fi

echo ""
echo -e "${BOLD}${GREEN}Stripe configurado completamente.${RESET}"
echo "Los pagos están listos. Reinicia el dev server para aplicar los cambios."
echo ""
echo -e "  ${YELLOW}Nota: Reinicia Next.js para cargar las nuevas variables:${RESET}"
echo "  cd \"/Volumes/Papu Ext/QuantumHolistic/project/quantum-holistic/app\" && npm run dev"
