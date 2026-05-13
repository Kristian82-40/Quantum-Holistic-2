# AI_COLLABORATION.md - Cómo trabajamos Claude + Grok

## Regla principal
**Todo lo importante queda aquí o en PROJECT_CONTEXT.md**. Nunca más perder contexto.

## Modelo de colaboración actual (mayo 2026)

| AI       | Rol principal                              | Cuándo usarlo                              | Cómo invocarlo                     |
|----------|--------------------------------------------|--------------------------------------------|------------------------------------|
| Claude   | Código, skills, arquitectura, QH-* skills | Desarrollo diario, prompts, lógica         | Claude Code / Cowork               |
| Grok     | Terminal-first, scripts, validación, depuración rápida, investigación | Comandos bash, scripts Python, pulir output, validación de imágenes | Pegar prompt o usar QH-GROK-BRIDGE |
| Cowork   | Ejecutar skills (QH-FLOW-STATE, etc.)      | Al inicio de cada sesión                   | /flow-state                        |

## Flujo eficiente (el que usamos desde ahora)

1. Abrir Cowork → escribir `/flow-state`
2. Elegir tarea
3. Claude genera prompt preciso (QH-PROMPT-GEN)
4. Si hace falta terminal/scripts → Claude genera prompt para Grok o uso directo
5. Al terminar sesión → volver a correr `/flow-state` (auto-actualiza PROJECT_CONTEXT.md)

## Skills ya funcionando
- **QH-FLOW-STATE** → `/flow-state` (estado comprimido + próximos 3 pasos)
- Script pulido en `.skills/qh-flow-state/scripts/fetch_flow_state.py`

## Reglas importantes
- Todo vive en `/Volumes/Papu Ext/Dev/QuantumHolistic/project/quantum-holistic/`
- Nunca guardar nada en el Mac local
- Cuando Claude diga “necesito Grok”, usar QH-GROK-BRIDGE o pegar directamente aquí
- Este archivo (AI_COLLABORATION.md) es la memoria compartida entre Claude y Grok

## Próximos pasos (para que Claude los vea)
- Crear skills de despliegue (QH-DEPLOY-GATE, QH-ROLLBACK-GEN, etc.)
- Conectar APIs reales en QH-FLOW-STATE (Notion, Vercel, Supabase)

Última actualización: 12 mayo 2026

### ─────────────────────────────────────
### ACTUALIZACIÓN - 13 de mayo 2026 (08:10)
### Sesión Grok: Skills de Despliegue Completas
### ─────────────────────────────────────

**Skills creadas y validadas en esta sesión:**
- **QH-DEPLOY-GATE** → Mejorado con validación automática de imágenes Supabase + next.config
- **QH-ROLLBACK-GEN** → Generador de planes de rollback (full, db-only, etc.)
- **QH-SCHEMA-AUDIT** → Auditoría de esquema DB, migraciones y tipos
- **Aliases fáciles** (`qh-deploy`, `qh-rollback`, `qh-audit`, `qh-flow`, `qh`)

**Estado actual del sistema de despliegue:**
- Ciclo completo de deploy seguro cerrado (Gate → Audit → Rollback)
- QH-FLOW-STATE sigue siendo el motor central
- Aliases cargados vía `.skills/qh-aliases.sh`

**Nota importante del hilo:**
- Problema “imágenes en la web no se ven” detectado. QH-DEPLOY-GATE ahora lo chequea (próximo paso: arreglar remotePatterns o bucket público).

**Próximos pasos recomendados (del último /flow-state):**
1. Middleware protection (/admin routes)
2. Resend email setup
3. Stripe live keys + paywall

**Este chat queda archivado.** Todo el conocimiento ya está en AI_COLLABORATION.md + PROJECT_CONTEXT.md.

