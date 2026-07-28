# Handoff — 2026-07-28 (4ª sesión: purga de historial git COMPLETADA)

## Estado del proyecto
- Producción estable (`quantum-holistic.com`). Funnel de monetización **100% operativo por primera vez**:
  `/regalo/primera-noche` → `leads` → `/producto/ritual-descanso` → **Gumroad €19**.
- **Producto Gumroad publicado por Papu** (2026-07-28 10:09): https://kristiantronco.gumroad.com/l/ugsqtg — €19, digital, `is_published:true` (verificado vía `/l/ugsqtg.json`).
- **`NEXT_PUBLIC_GUMROAD_URL` creada en Vercel** (production/preview/development) y en `.env.local` — hecha por Kimiko esta sesión. Redeploy disparado con este commit (la var es build-time).
- `leads` y `purchases` en 0 filas. Backlog: **90 drafts** de blog (eran 88 el 7-23; el más nuevo es del 7-10 → los +2 son cambios de status, no contenido nuevo) + 3 borradores sociales sin revisar.

## Módulo trabajado
**Activación del checkout Gumroad** (paso 2 del handoff anterior):
- Verificado producto live vía JSON público: €19 EUR, publicado, descripción OK. Sin covers/thumbnail (cosmético, lo puede añadir Papu).
- No se puede verificar desde fuera que el PDF esté adjunto al producto — **Papu debe confirmar que subió `assets/ritual-descanso.pdf` v2 al producto** (o hacer una compra de prueba con descuento 100%).
- Env var creada vía API Vercel (`upsert`), añadida a `.env.local`, redeploy con este push.
- QA 13 checks tras el deploy (resultado en cierre de KIMIKO_MEMORIA.md).

## Archivos modificados esta sesión
- `.env.local` — `NEXT_PUBLIC_GUMROAD_URL` (no versionado).
- `package.json` / `package-lock.json` — **`next` 14.2.5 → 14.2.35** (parche de la vulnerabilidad critical que la bitácora cloud escalaba; build local limpio, `ƒ Middleware` presente). Quedan 11 high heredadas (`next-intl` etc.) que requieren saltos mayores — decisión de Papu.
- `handoff.md` — reescrito (incluye también el estado de la 2ª sesión: PDF v2).

## Contexto 2ª sesión de hoy (PDF v2, sin commit previo)
- `assets/ritual-descanso.pdf` **v2 definitivo**: 32 págs A5, 5,8 MB, 7 ilustraciones acuarela, verificado página a página. Ignorado por git (correcto).
- Generador persistido en `/Volumes/Papu Ext/scripts/pdf-ritual-descanso/` (`python3 gen_ritual_v2.py` regenera).
- Del descargo legal se omitió "Revisión: Herborista certificado…" (no consta revisión real — riesgo legal).
- Correcciones de seguridad sobre la spec: alergia Asteraceae en manzanilla, lúpulo + anticonceptivos/hormonales, melisa + hipotiroidismo, tónico alcohólico "solo adultos".

## Próximos pasos (ordenados por prioridad)
1. **Papu: confirmar que el PDF v2 está subido como archivo del producto Gumroad** (compra de prueba recomendada). Opcional: añadir cover al producto.
1b. **Papu: rotar el token OAuth expuesto** (bitácoras cloud 2026-07-25 06:22 y 09:52 UTC) — la bitácora cloud lleva 17 ciclos escalándolo sin confirmación de rotación.
2. Papu: resolver permiso Full Disk Access/TCC (bloqueador Kimiko background desde 2026-07-11).
3. Papu: decidir qué hacer con los 90 drafts de blog sin revisar.
4. Papu: Google Search Console + sitemap; confirmar perfiles IG/LinkedIn; aprobar 3 borradores sociales.
5. Vigilar primeras filas en `purchases`/ventas Gumroad ahora que el checkout está live.

## Decisiones técnicas tomadas
- `NEXT_PUBLIC_GUMROAD_URL` configurada sin esperar confirmación (autoridad total + paso listado en handoff): producto verificado como publicado y con precio correcto antes de activar.
- PDF de pago NO se versiona (`.gitignore`).
- **Purga de historial EJECUTADA (2026-07-28, aprobada por Papu):** `git-filter-repo --invert-paths --path assets/ritual-descanso.pdf` + `git push --force --all` (4 ramas: main + fix/images + 2 kimiko/). Verificado: el blob del PDF ya no existe en ningún commit. Backup pre-purga: `/Volumes/Papu Ext/QuantumHolistic/backup-pre-purga-2026-07-28.bundle` + `ritual-descanso-BACKUP.pdf`. Todos los SHAs del repo cambiaron — cualquier clon existente debe re-clonarse.
- Bloqueador TCC de Kimiko: System Settings → Privacy & Security → Full Disk Access → añadir `/bin/bash` y/o binario `claude`.

## Pendiente / deuda técnica heredada (no tocada)
1. ~~Purga de historial git del PDF antiguo~~ — ✅ COMPLETADA esta sesión (ver Decisiones). Opcional: pedir a GitHub Support que purgue vistas cacheadas de los commits antiguos si el PDF fue accedido por URL directa de commit.
2. `app/` con scaffolding duplicado — no tocar sin auditoría.
3. PR #2 (equinácea), agente nocturno n8n (`PPchw62Xzdnvf9pT`), imágenes `_pending-approval/`.

## Scripts disponibles
| Script | Función |
|---|---|
| `node scripts/kimiko-qa-nocturna.mjs` | QA 13 checks (requiere `source .env.local`; `env -u NOTION_API_KEY` para no postear bitácora) |
| `node scripts/qh-imagenes-v2.mjs` | Descarga imágenes Wikimedia para slugs faltantes |
| `bash scripts/kimiko-run-all.sh` | Pipeline Kimiko: blog posts + imágenes |
| `bash scripts/auto-flow-state.sh` | Estado del proyecto |

## Referencias
- Producto Gumroad: https://kristiantronco.gumroad.com/l/ugsqtg
- Bitácora "raíz" con mandatos de Papu: https://app.notion.com/p/36c37a0e7b45812f8628f31630109924
- Última bitácora de cierre (2026-07-11): https://app.notion.com/p/39a37a0e7b4581eb8e3fd99033817de2
- Log de autostart: `~/bin/qh/kimiko-autostart.log`
