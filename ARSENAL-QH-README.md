# ARSENAL QH — Quantum Architect Toolkit

**Creado:** 2026-05-12  
**Propósito:** Máximo dominio del proyecto + ahorro de tokens + flujo sin fricción

---

## 🎯 Qué es esto

Conjunto integrado de **archivos + skills + conectores** que te permiten (Papu) trabajar 10x más rápido sin leer 10 archivos cada sesión.

Antes: Papu abre Cowork → Lee CLAUDE.md + handoff.md + PROJECT_CONTEXT.md → 20 min setup → hace 1 tarea → se acaban tokens.

Después: Papu abre Cowork → QH-FLOW-STATE corre automáticamente (30s) → Papu elige tarea de 3 opciones → QH-PROMPT-GEN genera prompt → Papu pega en Code → Tarea hecha → QH-FLOW-STATE auto-actualiza handoff.

**Beneficio:** -90% lectura innecesaria. +300% tareas por sesión.

---

## 📁 Estructura de Archivos

```
/Volumes/Papu Ext/Dev/QuantumHolistic/project/quantum-holistic/
├── PROJECT_CONTEXT.md                    ← ÚNICA FUENTE DE VERDAD (actualizado auto)
├── PROMPT_LIBRARY/
│   ├── 00-INTRO.md
│   ├── 01-SCHEMAS.md                    ← Schema Supabase (readOnly)
│   ├── 02-CLI-COMMANDS.md               ← Comandos rápidos
│   ├── 10-CODE-FEATURE.prompt           ← Template para features
│   ├── 11-CODE-FIX-BUG.prompt           ← Template para bugs
│   ├── 20-VALIDATION-SCRIPT.prompt      ← Template para validators
│   ├── 40-ROLLBACK.prompt               ← Template para rollbacks
│   └── 50-AUDIT-REPORT.prompt           ← Template para auditorías
├── QH-FLOW-STATE.md                      ← Definición skill (por implementar)
├── IMPLEMENTACIÓN-ARSENAL-QH.md          ← Checklist de implementación
└── ARSENAL-QH-README.md                  ← ESTE ARCHIVO
```

---

## 🔧 Skills QH a Implementar

### Tier 1 (esta sesión)
1. **QH-FLOW-STATE** — Devuelve estado comprimido + 3 pasos
2. **QH-PROMPT-GEN** — Genera prompts específicos para Claude Code

### Tier 2 (esta semana)
3. **QH-AUDIT-PLANTS** — Auditoría plantas/imágenes/metadata
4. **QH-SYNC-METADATA** — Auto-sincroniza metadata con DB
5. **QH-DEPLOY-GATE** — Pre-deploy checklist
6. Reactivar **n8n Auto-Bitácora**

---

## 💡 Cómo usar

### Opción A: Papu quiere una feature
```
1. Abre Cowork
2. QH-FLOW-STATE corre automáticamente
3. Lee output
4. Dice: "Implementa middleware protection"
5. QH-PROMPT-GEN genera prompt
6. Papu copia y pega en Claude Code
7. Code entrega + Vercel deploya
8. Done.
```

### Opción B: Papu quiere validación
```
1. Dice: "Audita las plantas"
2. QH-AUDIT-PLANTS corre
3. Devuelve reporte + 5 suggestions
4. Papu elige cuál arreglar primero
5. Tarea específica asignada
```

### Opción C: Papu necesita rollback
```
1. Dice: "Algo se rompió en producción"
2. QH-ROLLBACK-GEN genera rollback.sh
3. Papu ejecuta desde Claude Code
4. Vercel auto-redeploya
5. n8n notifica que se revert
```

---

## 🎬 Próximos Pasos (en orden)

### ESTA SESIÓN
- [ ] Implementar **QH-FLOW-STATE** como skill (usar skill-creator)
- [ ] Integrar auto-update de PROJECT_CONTEXT.md

### INMEDIATAMENTE DESPUÉS
- [ ] Implementar **QH-PROMPT-GEN** como skill
- [ ] Test: Papu pide feature, QH-PROMPT-GEN genera prompt, Code lo ejecuta

### ESTA SEMANA
- [ ] GitHub Actions `.github/workflows/validate.yml`
- [ ] Reactivar n8n Auto-Bitácora
- [ ] Implementar QH-AUDIT-PLANTS + QH-SYNC-METADATA

### PRÓXIMAS 2 SEMANAS
- [ ] Supabase Webhooks
- [ ] Vercel Analytics integration
- [ ] Docker + Coolify para validators

---

## 📊 Impacto Esperado

| Métrica | Valor |
|---------|-------|
| Reducción tokens/sesión | -60% (de 8-10k a 3-4k) |
| Tiempo setup inicial | -95% (de 15 min a 30 sec) |
| Tareas por sesión | +300% (de 0.5 a 2+) |
| Deploy incidents | -100% (bloqueados por CI/CD) |
| Manual validations | -90% (automáticas) |

---

## 🚨 Regla de Oro

**TODO en Papu Ext. NADA en Mac local.**

- `/Volumes/Papu Ext/Dev/QuantumHolistic/project/quantum-holistic/` = única source of truth
- Si una herramienta escribe a `/tmp/` o `~/Downloads/` → copiar inmediatamente a Papu Ext
- Verificación: `ls -la /Volumes/Papu\ Ext/...` antes de cada sesión

---

## 🎯 Visión Final

Una vez todo implementado:
- **Papu** no toca terminal, no lee docs innecesarios
- **Claude.ai (Cowork)** = orquestador + monitor (5 min/día)
- **Claude Code** = ejecutor (30 min/día coding real)
- **n8n** = validator nocturno (cero overhead)
- **GitHub Actions** = bloquea errores automáticamente

**Resultado:** Quantum Holistic deployable, escalable, soberano. Cero deuda técnica acumulada.

---

## 📞 Si hay dudas
- Lee IMPLEMENTACIÓN-ARSENAL-QH.md para checklist
- Lee QH-FLOW-STATE.md para entender el motor central
- Lee PROMPT_LIBRARY/ para templates
- Lee PROJECT_CONTEXT.md para estado actual
