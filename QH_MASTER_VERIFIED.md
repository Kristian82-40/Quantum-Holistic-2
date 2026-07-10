# QH_MASTER_VERIFIED.md
**Referencia permanente de Kimiko (Claude Code).** Actualizar en cada cambio relevante. No duplicar contenido de `handoff.md` o `CLAUDE.md` — este documento consolida y marca qué está VERIFICADO vs SOSPECHOSO (presunción negativa).

_Última verificación: 2026-07-04, vía MCP (Supabase, Vercel, Notion) + filesystem + git + launchctl._

---

## 1. Fuentes de verdad (orden de precedencia)
1. **Supabase** (`vctetjugbvyllwjpxcxh`, tabla `plants`) — dato real de plantas.
2. **Roadmap** — NO existe `CLAUDE_CODE_HANDOFF.md` en el repo ni en Papu Ext (verificado, 0 resultados). El roadmap vigente vive en **Notion**: página *"Bitácora · 2026-07-03 — Fase Ejecución: Brand Bible + Oferta + Funnel"* (`39237a0e-7b45-819b-8bc8-da7e57db6daa`), sección "Handoff a Claude Code (orden)". ⚠️ Marcar como hueco de proceso: el roadmap debería vivir en un archivo versionado, no solo en Notion.
3. **CLAUDE.md** — hay DOS, no confundir:
   - `~/.claude/CLAUDE.md` (global, reglas de Kristian/sistema, ecosistema completo)
   - `{repo}/CLAUDE.md` (reglas específicas del proyecto QH, autoridad 2026-04-29, storage exclusivo en Papu Ext)

## 2. Estado real del filesystem (VERIFICADO — diverge de `~/.claude/CLAUDE.md` global)
- Ruta real del repo: `/Volumes/Papu Ext/Dev/QuantumHolistic/project/quantum-holistic` (con `Dev/` intermedio).
  El CLAUDE.md global documenta `/Volumes/Papu Ext/QuantumHolistic/project/quantum-holistic` (sin `Dev/`) — **desactualizado, corregir en próxima edición del CLAUDE.md global**.
- `/Volumes/Papu Ext/QuantumHolistic/` sí existe pero solo contiene `n8n-data/`, `ollama-data/`, `weekend-output/` (logs de un agente distinto, ver §3).
- Disco Papu Ext montado y accesible. Symlink `~/Projects/quantum-holistic` correcto.

## 3. Diagnóstico (a) — Por qué NO existe bitácora de QA nocturna en Notion

**Causa raíz confirmada:** el LaunchAgent `com.qh.kimiko` está cargado pero **nunca ha ejecutado ni una vez** desde su última recarga (`launchctl print` → `runs = 0`, `state = not running`, `last exit code = (never exited)`).

Evidencia adicional, en cascada:
1. El plist apunta stdout/stderr a `/Volumes/Papu Ext/QuantumHolistic/weekend-output/logs/kimiko.log` — **ese archivo no existe**. Lo que sí existe en esa carpeta son logs de OTRO agente ("Agente Fin de Semana", `runner-2026-05-30_*.log`), último rastro: **30 mayo 2026**, hace más de un mes.
2. El script real que ejecuta el LaunchAgent (`scripts/kimiko-run-all.sh`) escribe a `{repo}/logs/kimiko-plants.log` y `kimiko-blog.log` — **el directorio `{repo}/logs/` está vacío**. Confirma que el pipeline tampoco ha corrido desde esa ruta.
3. **Desalineación de rol (la causa de fondo):** `kimiko-run-all.sh` ejecuta `kimiko-pipeline.mjs` (plantas) + `kimiko-blog-pipeline.mjs` (blog) — un pipeline de **generación de contenido**. Pero la bitácora Notion 2026-07-03 define el rol nocturno de Kimiko como **QA**: "Build + rutas sin 5xx + integridad Supabase (52 plantas, 9 peligrosas en placeholder) + PDFs presentes + bitácora de resultados". **Ese script de QA no existe todavía** — es músculo faltante, no un bug.
4. `StartInterval=14400` (4h) + `RunAtLoad=false` + `KeepAlive=false`: si el Mac duerme/se apaga en la ventana del intervalo, launchd no compensa runs perdidos. Contribuye a que nunca se haya disparado, pero no es la causa principal (aunque estuviera despierto, ejecutaría el pipeline equivocado).

**MÚSCULO FALTANTE:** script `kimiko-qa-nightly.sh` (o `.mjs`) que:
- Verifique build (`npm run build` o `next build --dry` equivalente) y rutas sin 5xx.
- Consulte Supabase: 52 filas en `plants`, exactamente 9 sin imagen y que coincidan con la lista de peligrosas.
- Verifique presencia de los 3 PDFs de marca (ver §5 — hoy NINGUNO existe en disco).
- Escriba resultado a Notion (bitácora del día) vía MCP.
- LaunchAgent reapuntado a este script, con logs en una ruta que exista.

**PROPUESTA:** no crear el script todavía sin luz verde — es trabajo de implementación, no de diagnóstico. Pendiente de aprobación de Papu antes de escribir/activar.

## 4. Auditoría (b) — Repo vs producción

✅ **Coinciden exactamente.** Verificado vía MCP Vercel + git:
- `git log -1 HEAD` → `425cb5b8f7b0ab79dea7a4450df64782caa23828` (11 jun 2026)
- Deployment Vercel más reciente en `target=production`, `state=READY`: mismo SHA `425cb5b8f...`, proyecto `quantum-holistic-2`.
- `git status`: working tree limpio salvo `handoff.md` con cambios **sin commitear** (el handoff committeado en `425cb5b` describe el estado de `e0dea15`; la copia local en disco ya refleja `425cb5b` pero nunca se subió). ⚠️ Pendiente: commitear `handoff.md` o descartar el diff — decisión de Papu, no autónoma (toca historial del repo).
- Supabase `plants`: 52 filas, 9 sin `image_cientifica_url`, y son exactamente las 9 nombradas en los límites innegociables (aconito, datura, datura-metel, amanita-muscaria, cannabis, cornezuelo-centeno, beleno-negro, tejo, hierba-mora). **Gate de seguridad correcto, no bug** — coincide con lo que registra la bitácora Notion.

## 5. Bloque 1 del Handoff (c) — Assets de marca

Orden del roadmap Notion: 1) Versionar 3 assets → 2) Landing producto → 3) Landing regalo + `leads` → 4) Resend → 5) Activar Kimiko → 6) Docs.

**PARCIALMENTE DESBLOQUEADO** (2026-07-04, tarde).
- ✅ **Brand Bible v1** — recibida de Papu, escrita en `{repo}/Brand_Bible_v1.md`. Contiene arquetipos (Sabio/Mago), paleta (Sage `#8A9A7B`, Dorado `#B8935A`, Crema `#F4EDE0`, Terracota `#9C5A3C`, Forest `#3D4A3A`), tipografía (Cormorant Garamond + Inter Tight), tono de voz y reglas de uso. Formato Markdown, no PDF — suficiente como fuente de verdad de marca; no bloquea implementación de landings.
- ⚠️ **"El Ritual del Descanso"** (PDF 14pp, oferta 19€) — sigue sin aparecer en disco.
- ⚠️ **"3 Infusiones para tu Primera Noche Tranquila"** (lead magnet 4pp) — sigue sin aparecer en disco.

Nota técnica: para maquetar estos 2 PDFs con la identidad QH (Cormorant + Inter Tight) se necesita un renderer HTML→PDF. Se verificó que **WeasyPrint no está instalado** (ni pip/pip3/npm/brew) — si se decide generar los PDFs localmente en vez de recibirlos ya maquetados, hace falta instalar `pango` (brew) + `weasyprint` (pip3), o usar una alternativa vía Playwright/Puppeteer. Pendiente de decisión de Papu sobre cuál vía tomar.

Sigue sin avanzar a landing/versionado del producto y el lead magnet sin los 2 PDFs o sin confirmación de Papu sobre su ubicación/generación.

## 6. Límites innegociables (vigentes, sin cambios)
- 9 plantas peligrosas mantienen placeholder salvo aprobación visual explícita de Papu: **aconito, datura, datura-metel, amanita-muscaria, cannabis, cornezuelo-centeno, beleno-negro, tejo, hierba-mora.**
- Cero escrituras autónomas en DB.
- Cero operaciones batch sobre imágenes — una a una, con verificación.
- Acciones irreversibles (pagos, borrados, migraciones): detener y consultar.

## 7. Backlog de bloqueos (cicatriz → check, acumulativo)
| # | Bloqueo | Causa raíz | Músculo faltante | Estado |
|---|---|---|---|---|
| 0 | 🚨 **CRÍTICO — el PDF de pago "El Ritual del Descanso" (19€) es descargable gratis** | Commit `7858379` subió `assets/ritual-descanso.pdf` a un repo de GitHub **público** (`Kristian82-40/Quantum-Holistic-2`, visibility=public, verificado vía API). URL cruda accesible sin auth: `raw.githubusercontent.com/.../assets/ritual-descanso.pdf` → HTTP 200. Cualquiera puede tener el producto sin pagar. El lead magnet gratuito (`primera-noche-tranquila.pdf`) estar público SÍ es correcto — solo el de pago es el problema. | Mover el PDF de pago a storage privado (Supabase Storage bucket privado + URL firmada tras checkout, o servirlo desde una ruta API protegida) y **purgar del historial de git** (no basta con `git rm`, queda en commits anteriores y en el CDN de GitHub) | 🟡 **Parcialmente mitigado 2026-07-10** (commit `fc617a3`): `git rm --cached` + `.gitignore` — la URL raw sobre `main` actual ya 404. El archivo sigue vivo en el commit histórico `7858379` (`raw.githubusercontent.com/.../7858379/...` sigue sirviendo 200) hasta que se purgue el historial (BFG/filter-repo + force-push) — **sigue requiriendo aprobación explícita de Papu**, es acción irreversible sobre repo compartido. Landing `/producto/ritual-descanso` ya construida (commit `195d299`) con captura de lead como fallback mientras no exista cuenta Gumroad/Lemon Squeezy. |
| 1 | No hay bitácora QA nocturna en Notion | **Causa raíz real (corregida 2026-07-04 tarde):** el LaunchAgent nunca pudo arrancar — no fue "mala suerte" del intervalo. `StandardOutPath`/`StandardErrorPath` apuntando al disco externo `/Volumes/Papu Ext/...` hace que `posix_spawn` de launchd falle con **`EX_CONFIG` (78)**, siempre, con cualquier script. Verificado empíricamente: mismo plist, mismo script, solo cambiando esas 2 rutas a disco local → pasa de fallar 100% de las veces a `exit code 0`. | ✅ **Resuelto y verificado en caliente** (`launchctl kickstart`, `runs` incrementó, `last exit code = 0`, 9/9 checks OK). Plist reapuntado a `node scripts/kimiko-qa-nocturna.mjs`, con `VERCEL_TOKEN`/`NOTION_API_KEY`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` en `EnvironmentVariables` (launchd no lee `.env.local`). Logs de sistema en `~/Library/Logs/com.qh.kimiko.log` (disco local, obligatorio para que el spawn funcione); el script además escribe su propia copia en `{repo}/logs/kimiko-qa-nocturna.log` (Papu Ext) una vez que el proceso Node ya está corriendo — normal filesystem access, sin la restricción de spawn. También se corrigieron 4 bugs del script: `node-fetch` no instalado (Node 22 trae fetch nativo), nombre de env var de Supabase incorrecto, `count()` agregado deshabilitado en PostgREST (→ header `Prefer: count=exact`), API de Vercel `v12` inexistente (→ `v6`), y el log a Notion era un stub sin POST real (implementado). | ⚠️ **Un único paso manual pendiente, solo Papu puede hacerlo:** compartir la integración "kimiko-bitacora" con la página "📓 Bitácora Quantum Holistic" en Notion (abrir la página → "..." → Connections → añadir "kimiko-bitacora"). Sin esto, la escritura a Notion devuelve 404 aunque el token es válido (verificado con `/v1/users/me` → 200). Todo lo demás corre solo cada 4h vía `StartInterval`. |
| 2 | 2 PDFs de oferta/lead magnet no estaban en disco | Nunca se habían exportado/subido | ✅ **Resuelto** 2026-07-04 — Papu commiteó `Brand_Bible_v1.md` + ambos PDFs (`7858379`), ya en producción. Ver bloqueo #0 sobre el PDF de pago. | — |
| 3 | `handoff.md` commiteado desactualizado (describe `e0dea15`, no `425cb5b`) | Edición local nunca commiteada | Commit explícito (decisión de Papu, toca historial) | Reportado 2026-07-04, aún sin resolver |
