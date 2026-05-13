#!/bin/bash
# Auto-trigger QH-FLOW-STATE on Cowork startup
# Llamar a este script desde session init o startup hook

cd "$(dirname "${BASH_SOURCE[0]}")/.."
python3 ./.skills/qh-flow-state/scripts/fetch_flow_state.py
