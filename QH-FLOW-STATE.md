# QH-FLOW-STATE — Skill Definition

**Tipo:** Diagnostic + Auto-update  
**Trigger:** Inicio de sesión o `/flow-state` en chat  
**Output:** Estado comprimido (max 200 palabras) + 3 siguientes pasos ordenados

---

## Descripción
Lee fuentes de verdad (handoff.md, git log, Notion bitácora, Vercel API) y devuelve estado ejecutivo sin que Papu tenga que leer nada.

---

## Algoritmo

### 1. Lectura de fuentes (en paralelo)
```
A. handoff.md → último estado conocido
B. git log -10 → últimos 10 commits
C. Notion API → últimas 3 entries en bitácora
D. Vercel API → último deploy status
E. Supabase API → tabla `plants` row count
```

### 2. Síntesis
```
- Estado: [una línea máximo]
  Ej: "Web OK. Últimas 2 tareas: diccionario ✅, middleware ⏳"
  
- Problemas detectados: [máx 3 bullets]
  Ej: "n8n credencial caducada | Stripe aún en test | ..."
  
- Próximos 3 pasos: [ordenados por impacto + dependencias]
  1. Middleware protection (bloquea /admin)
  2. Resend setup (envía emails)
  3. Stripe live (paywalls reales)
```

### 3. Auto-update de archivos
```
- Actualiza PROJECT_CONTEXT.md:
  - Última actualización: [FECHA]
  - Próximos 3 pasos: [NUEVOS]
  - Tokens consumidos hoy: [COUNT]

- Escribe en Notion bitácora: entrada con estado + delta
```

---

## Salida esperada (ejemplo)

```
🔍 FLOW STATE — 2026-05-12

✅ Estado: Web producción OK. Diccionario 70 plantas + 50 DB rows.
  Último deploy: 8fb2197 (2026-05-07). Vercel estable.

⚠️ Problemas detectados:
  - n8n Auto-Bitacora: credencial caducada (desde 2026-05-06)

→ PRÓXIMOS 3 PASOS (Papu elige uno):
  1. 🔧 Middleware protection (/admin)
  2. 📧 Resend email setup
  3. 💳 Stripe live keys
```

---

## Implementación (pseudocódigo)

```javascript
async function qhFlowState() {
  // 1. Lee handoff.md (Read tool)
  const handoff = readFile('handoff.md');
  
  // 2. Lee git log (Bash)
  const commits = await bash('git log --oneline -10');
  
  // 3. Lee Notion (Notion connector)
  const notion = await listPages('Bitácora');
  
  // 4. Vercel API
  const deployments = await vercelAPI.listDeployments();
  
  // 5. Supabase API
  const plantsCount = await supabase.from('plants').select('id').count();
  
  // 6. Síntesis
  const state = compress({handoff, commits, notion, deployments, plantsCount});
  
  // 7. Update PROJECT_CONTEXT.md + Notion
  updateProjectContext(state);
  createNotionEntry(state);
  
  return state;
}
```

---

## Triggers para activación automática
- `claude.ai` inicia sesión → corre automáticamente
- Papu dice `/flow-state` o `/state` → ejecuta
- Cada mañana 09:00 AM → corre vía n8n, escribe Notion

---

## Próximo paso
Una vez que QH-FLOW-STATE esté implementada:
1. Papu abre Cowork mañana
2. QH-FLOW-STATE corre automáticamente
3. Papu ve estado en 30 segundos
4. Elige tarea
5. QH-PROMPT-GEN genera prompt específico
6. Papu pega en Claude Code
7. Tarea completa

**Beneficio:** -90% lectura innecesaria = +60% tiempo para código.
