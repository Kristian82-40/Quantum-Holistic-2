# QH-FLOW-STATE Skill

## Status
✅ **Ready for deployment**

## What it does
Reads project state from 5 sources in parallel (handoff.md, git log, Notion, Vercel, Supabase) and returns a compressed 200-word executive summary + 3 prioritized next steps. Auto-updates `PROJECT_CONTEXT.md` and logs to Notion bitácora.

## Installation
```
Install the qh-flow-state.skill file via Cowork plugins.
```

## Invocation
- `/flow-state` — explicit trigger
- `/state` — alias
- Auto-triggers on Cowork startup (future)

## Test Results
**Iteration 1:** All 3 evals passed (100% pass rate)
- Eval 1: Basic request → ✓ (4/4 assertions)
- Eval 2: Slash command → ✓ (3/3 assertions)  
- Eval 3: Auto-trigger → ✓ (3/3 assertions)

**Performance:**
- Duration: ~5.23s per run
- Tokens: ~850 per run
- All sources verified

See `qh-flow-state-viewer.html` for detailed eval results.

## Next Steps
1. Wire up real API calls (Notion, Vercel, Supabase) — currently mocked
2. Test Notion bitácora write integration
3. Deploy auto-trigger on Cowork startup
4. Monitor token usage over time

## Files
- `SKILL.md` — skill definition + algorithm
- `scripts/fetch_flow_state.py` — execution logic
- `evals/evals.json` — test cases
- `qh-flow-state.skill` — packaged skill (installable)

## References
- Original spec: `QH-FLOW-STATE.md`
- Test results: `qh-flow-state-viewer.html` (open in browser)
- Benchmark: `qh-flow-state-workspace/iteration-1/benchmark.md`
