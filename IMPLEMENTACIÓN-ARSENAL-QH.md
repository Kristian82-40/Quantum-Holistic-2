# IMPLEMENTACIÓN — Arsenal QH Completo

**Fecha inicio:** 2026-05-12  
**Estado:** [CHECKLIST DE IMPLEMENTACIÓN]

---

## ✅ Hecho Hoy (2026-05-12)

- [x] **PROJECT_CONTEXT.md** creado
  - Única fuente de verdad ejecutable
  - Actualización automática por QH-FLOW-STATE

- [x] **PROMPT_LIBRARY/** carpeta con 8 templates
  - 00-INTRO.md
  - 01-SCHEMAS.md (Supabase schema actualizado)
  - 02-CLI-COMMANDS.md (referencia rápida)
  - 10-CODE-FEATURE.prompt (feature template)
  - 11-CODE-FIX-BUG.prompt (bug fix template)
  - 20-VALIDATION-SCRIPT.prompt (script template)
  - 40-ROLLBACK.prompt (rollback template)
  - 50-AUDIT-REPORT.prompt (audit template)

- [x] **QH-FLOW-STATE.md** definición
  - Algoritmo documentado
  - Pseudocódigo listo
  - Ready para implementación como skill

---

## ⏳ Por Hacer (Ordenado por impacto)

### TIER 1 — CRÍTICAS (esta sesión)

1. **[ ] QH-FLOW-STATE (skill)** — máxima prioridad
   - Implementar usando `skill-creator`
   - Test: Papu abre Cowork, ejecuta `/flow-state`
   - Debe devolver: estado + 3 pasos en <30 segundos
   - Integrar auto-update de PROJECT_CONTEXT.md

2. **[ ] QH-PROMPT-GEN (skill)** — máxima prioridad
   - Lee PROJECT_CONTEXT.md + tarea Papu
   - Genera prompt específico con rutas/schema/ejemplos
   - Output: copiable directo a Claude Code
   - Ahorro: 15-20 min por tarea

3. **[ ] GitHub Actions CI/CD**
   - Crear `.github/workflows/validate.yml`
   - Trigger: push + PR
   - Correr: QH-CI-VALIDATE checks (build, images, slugs, metadata)
   - Block merge si fail

### TIER 2 — IMPORTANTES (esta semana)

4. **[ ] QH-AUDIT-PLANTS (skill)**
   - Lee Supabase + Vercel + fichas-metadata.json
   - Detecta: duplicados, 404s, metadata inconsistente
   - Output: reporte + sugerencias auto-fix

5. **[ ] QH-SYNC-METADATA (skill)**
   - Auto-sincroniza fichas-metadata.json con DB
   - Corre post-audit si hay mismatches

6. **[ ] QH-DEPLOY-GATE (skill)**
   - Pre-deploy checklist automático
   - Bloquea deploy si falla algún check

7. **[ ] n8n Workflow: Auto-Bitácora**
   - Reactivar credenciales (caducadas 2026-05-06)
   - Cron nocturno: ejecutar QH-AUDIT-PLANTS
   - Si errores: notifica Slack + Notion

### TIER 3 — FUTURO (próximas 2 semanas)

8. **[ ] Supabase Webhooks**
   - Trigger on `plants` INSERT/UPDATE
   - Auto-ejecuta QH-SYNC-METADATA

9. **[ ] Vercel Analytics Integration**
   - QH-DEPLOY-GATE consulta Lighthouse score
   - Bloquea deploy si regresión >5%

10. **[ ] Docker + Coolify** (para alojar `qb` + validators)

---

## 🎯 Flujo Final Esperado (una vez implementado)

```
DÍA 1: Papu abre Cowork
 ├─ QH-FLOW-STATE corre automáticamente (30s)
 └─ Papu ve: estado + 3 pasos + problemas detectados

DÍA 2: Papu elige tarea (ej: "Middleware protection")
 ├─ QH-PROMPT-GEN genera prompt específico
 ├─ Papu copia a Claude Code
 ├─ Code edita + commit
 ├─ GitHub Actions QH-CI-VALIDATE pasa ✅
 ├─ Auto-deploy a Vercel
 └─ QH-DEPLOY-GATE valida en prod

DÍA 3: Noche
 └─ n8n cron ejecuta QH-AUDIT-PLANTS
    └─ Si hay errores → notifica Papu + Notion

RESULTADO: 1 feature/fix por sesión. 3-4k tokens/sesión. Cero overhead.
```

---

## 📊 Métricas de Éxito

| Métrica | Antes | Después | Goal |
|---------|-------|---------|------|
| Tokens/sesión | 8-10k | 3-4k | -60% |
| Tiempo setup | 15 min | 30 sec | -95% |
| Tareas/sesión | 0.5 | 2+ | +300% |
| Manual validations | 100% | 10% | -90% |
| Deploy incidents | 2/mes | 0 | -100% |

---

## 🚀 Próximo Paso
Implementar **QH-FLOW-STATE** como skill formal. Papu abrirá nuevo chat diciendo:
> "Implementa QH-FLOW-STATE como skill. Usa skill-creator. Debe correr automáticamente al abrir Cowork."

Desde ahí, el resto fluye automáticamente.
