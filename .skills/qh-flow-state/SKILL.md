---
name: qh-flow-state
description: |
  Diagnostic skill that reads all project state sources in parallel (handoff.md, git log, Notion bitácora, Vercel deployments, Supabase tables) and compresses into a 200-word executive summary + 3 prioritized next steps. Triggers on `/flow-state`, `/state`, or automatically when opening Cowork. Auto-updates PROJECT_CONTEXT.md and writes to Notion bitácora for audit trail. Use this skill whenever you want a bird's-eye view of the entire project state without reading multiple files — especially at session start, before choosing which task to tackle, or when the state feels unclear.
---

# QH-FLOW-STATE — Diagnostic Skill

## What it does

Executes a parallel multi-source read of project state and returns:
1. **Executive Summary** (max 200 words) — status, last action, key metrics
2. **Problems Detected** (max 3 bullets) — blockers, outdated credentials, stale configs
3. **Next 3 Steps** — ordered by impact + dependency chain

Then auto-updates `PROJECT_CONTEXT.md` and logs the state to Notion.

---

## Data sources read in parallel

| Source | Tool | Extracts |
|--------|------|----------|
| `handoff.md` | Read | Last known state, in-progress tasks, blockers |
| Git history | Bash (`git log --oneline -10`) | Recent commits, what landed |
| Notion bitácora | Notion connector (list last 3 pages in "Bitácora" folder) | Recent entries, issues noted |
| Vercel API | Vercel connector (list latest 5 deployments) | Last deploy, status, timestamp |
| Supabase | Supabase connector (count rows in `plants` table) | Data health check |

---

## Synthesis algorithm

### 1. Read all sources in parallel
- Extract **handoff.md** content verbatim (use Read tool)
- Run `git log --oneline -10` to get commit history
- Query Notion for latest 3 entries in "Bitácora" database
- Call Vercel API: `list_deployments` (limit 5, most recent first)
- Call Supabase API: `execute_sql` with `SELECT COUNT(*) FROM plants`

### 2. Compress state (200-word max)
Use this format:

```
✅ Estado: [one sentence recap]
   - Status line 1: [metric or condition]
   - Status line 2: [metric or condition]

⚠️ Problemas detectados:
   - [issue 1]
   - [issue 2 if any]

→ PRÓXIMOS 3 PASOS (por impacto + dependencias):
   1. [Step with emoji + short description]
   2. [Step]
   3. [Step]
```

**Rules for compression:**
- Extract only facts: last commit hash, last deploy time, table row count, outstanding blockers
- If a source is stale (handoff.md older than 3 days) or has an error, note it
- Priorities are set by: whether it unblocks other work, whether it has external dependencies (e.g., Stripe manual activation), whether it's infrastructure vs. feature work
- Be terse; strip fluff

### 3. Auto-update PROJECT_CONTEXT.md

After compression, append to the project root's `PROJECT_CONTEXT.md`:

```markdown
## Last Flow State Check

**Date:** [ISO timestamp]

**Estado Comprimido:**
[paste the compressed state from step 2]

**Data Sources Checked:**
- handoff.md: [timestamp of file]
- git log: ✓ (10 commits)
- Notion bitácora: ✓ (3 latest entries reviewed)
- Vercel: ✓ (last deploy: [hash + timestamp])
- Supabase: ✓ (plants count: [N])

**Token Cost:** [total tokens used in this flow-state run]
```

### 4. Write to Notion bitácora

Create a new page in the Notion "Bitácora" database with:
- **Title:** `[FLOW-STATE] 2026-05-12 — [Estado line]`
- **Date:** today
- **Content:** The compressed state + data sources checked
- **Tags/Status:** "diagnostic" or similar

---

## Test it

When you run this skill, you should see:
1. All 5 parallel reads complete (or error gracefully if a source is unavailable)
2. Compressed summary appears in ~30 seconds
3. PROJECT_CONTEXT.md is updated
4. Notion entry is created
5. Return the summary + next steps to the user

---

## Edge cases handled

- **Handoff.md missing:** Report "handoff.md not found, using git log as sole state source"
- **Vercel unreachable:** Skip, note in summary as "Vercel unavailable"
- **Supabase error:** Report `plants` count as "N/A — connection error"
- **Notion write fails:** Don't block the summary; log warning and continue
- **Next steps unclear:** Fall back to: (1) fix infra blocker, (2) complete in-progress task, (3) start next task in handoff

---

## Output example

```
🔍 FLOW STATE — 2026-05-12 10:34 UTC

✅ Estado: Web producción OK. Diccionario: 70 plantas + 45 DB rows. Última entrega: a3f2c11 (2026-05-07, 5 días).

⚠️ Problemas detectados:
  - n8n Auto-Bitacora: credencial caducada (desde 2026-05-06)
  - Stripe: aún en test mode, paywall no activo
  - Supabase: Email redirect URLs no configuradas

→ PRÓXIMOS 3 PASOS:
  1. 🔧 Middleware protection (/admin routes) — bloquea 2 features
  2. 📧 Resend email setup — depende de URL config en Supabase
  3. 💳 Stripe live keys — manual en dashboard, habilita paywall

—— Fuentes Verificadas ——
handoff.md: ✓ (2026-05-12 09:00)
git: ✓ (10 commits, último: a3f2c11)
Notion: ✓ (3 entries, última: "Email setup bloqueado")
Vercel: ✓ (5 deployments, último: a3f2c11 READY)
Supabase: ✓ (plants: 45 rows)

Tokens usados: 3,240 | Duración: 28s
```

---

## How to invoke

```
/flow-state
```

or just ask in chat:

```
What's the state of the project?
```

Or it runs automatically on Cowork startup (via future automation).
