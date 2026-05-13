# Cowork Commands Registry

## /flow-state
**Description:** Ejecuta QH-FLOW-STATE diagnostic skill. Lee proyecto state y devuelve resumen ejecutivo + próximos 3 pasos.

**Invocation:** `/flow-state`

**Output:** 
- Estado comprimido (200 palabras máx)
- Problemas detectados (max 3)
- Próximos 3 pasos ordenados

**Auto-updates:** PROJECT_CONTEXT.md + Notion bitácora

**Script:** `./.skills/qh-flow-state/scripts/fetch_flow_state.py`

---
