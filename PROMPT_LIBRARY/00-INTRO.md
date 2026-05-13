# PROMPT_LIBRARY — Quantum Holistic

Carpeta de prompts pre-armados para máxima eficiencia. Papu **copia + pega directo** a Claude Code o Claude.ai.

Cada prompt incluye:
- Contexto autogenerado desde PROJECT_CONTEXT.md
- Rutas exactas
- Schema Supabase actualizado
- Ejemplos

---

## 🎯 Flujo
1. Identifica qué necesitas (feature, fix, audit, rollback)
2. Abre el template correspondiente (ej: `10-CODE-FEATURE.prompt`)
3. **Copia el contenido completo**
4. Pega en Claude Code o claude.ai según corresponda
5. Ejecuta

---

## 📁 Estructura
- **00-INTRO.md** ← estás aquí
- **01-SCHEMAS.md** ← Supabase schema (readOnly, auto-generado)
- **02-CLI-COMMANDS.md** ← Comandos npm/git/vercel exactos
- **10-CODE-FEATURE.prompt** ← Implementar feature
- **11-CODE-FIX-BUG.prompt** ← Arreglar bug
- **20-VALIDATION-SCRIPT.prompt** ← Generar scripts
- **30-GROK-BRIDGE.prompt** ← Invocar Grok
- **40-ROLLBACK.prompt** ← Revertir
- **50-AUDIT-REPORT.prompt** ← Reportes

Próximos updates: auto-generados por **QH-PROMPT-GEN** cada sesión.
