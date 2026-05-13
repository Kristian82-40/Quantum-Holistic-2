#!/bin/bash
# =============================================
# Quantum Holistic - Aliases fáciles
# =============================================

alias qh-flow="python3 .skills/qh-flow-state/scripts/fetch_flow_state.py"
alias qh-deploy="python3 .skills/qh-deploy-gate/scripts/deploy_gate.py"
alias qh-rollback="python3 .skills/qh-rollback-gen/scripts/rollback_gen.py"
alias qh-audit="python3 .skills/qh-schema-audit/scripts/schema_audit.py"

alias qh="echo '🚀 Quantum Holistic commands:
  qh-flow     → Estado del proyecto + próximos pasos
  qh-deploy   → Checklist pre-deploy
  qh-rollback → Generar plan de rollback
  qh-audit    → Auditoría de esquema'"

echo "✅ Aliases de Quantum Holistic cargados correctamente"
echo "Para usarlos en esta sesión, ejecuta:"
echo "   source .skills/qh-aliases.sh"
echo ""
echo "Si quieres que se carguen automáticamente cada vez, agrega esta línea a tu ~/.zshrc:"
echo "   source \"/Volumes/Papu Ext/Dev/QuantumHolistic/project/quantum-holistic/.skills/qh-aliases.sh\""
