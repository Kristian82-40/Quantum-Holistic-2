# Handoff — 2026-10-06 (sesión interactiva)

## 🔴 BLOQUEANTE #1: el checkout Gumroad lleva caído desde el 2026-07-28 (~69 días)

`NEXT_PUBLIC_GUMROAD_URL` (Vercel) → `kristian320.gumroad.com/l/ritual-descanso` → **404**.
La URL anterior `kristiantronco.gumroad.com/l/ugsqtg` sigue en **200**. Reverificado hoy.
Los ciclos Kimiko dejaron de vigilarlo cuando el ciclo 268º archivó la memoria donde estaba el
aviso: desde entonces cada ciclo reporta "sin hallazgos" con el cobro roto.

**Papu decide (no lo he tocado):** publicar el producto en `kristian320`, o devolver la env var
a `https://kristiantronco.gumroad.com/l/ugsqtg` y redeploy.

**Mitigación aplicada hoy:** la página revalida el enlace cada hora (ISR). Si Gumroad responde
404/410, muestra el formulario de lista de espera (guarda en `leads`, `source=ritual_descanso_waitlist`)
en vez de mandar al comprador a un error. Cuando el enlace vuelva a 200, el botón "Comprar"
reaparece solo en ≤1h, sin redeploy. Un fallo de red/timeout **no** esconde el botón.
**Verificado en vivo el 2026-10-06:** la página ya muestra la lista de espera (el `HIT` que vio el ciclo 18:03 era caché vieja).

## Estado del proyecto
- Producción estable (`quantum-holistic.com`). Últimos ciclos: build/lint limpios, 8/8 rutas OK.
- `plants`: 52 filas, 4 publicada+verificada (`albahaca`, `arnica`, `equinacea`, `hinojo`).
  Check permanente de hash de `ficha_cientifica`: 7 grupos / 21 filas, estable.
- `blog_posts`: 109 (79 draft / 22 published / 8 rejected). `leads`/`purchases`: 0.
- Chat web: fallback de contenido sin IA en producción (`e957d8a`, ciclo 278º).
- Service role key: ya no está en claro en `agente-plantas.sh` ni `runner.sh`. Rotación sin confirmar.

## Módulo trabajado
Monetización: lista de espera del checkout.

## Archivos modificados
- `app/api/leads/route.ts`: upsert con `?on_conflict=email` (antes un email repetido daba 409 contra `leads_email_key`)
  y devuelve 502 si Supabase falla (antes respondía `ok:true` siempre y el lead se perdía sin aviso).
- `KIMIKO_MEMORIA.md`: cierre de sesión.

## Próximos pasos (ordenados por prioridad)
1. **Papu: arreglar Gumroad** (ver arriba). Bloquea todo ingreso.
2. **Papu: rotar la service role key de Supabase** (estuvo en claro en scripts del disco) y el token OAuth pendiente.
3. Levantar el gate `ficha_verificada` de las recuperadas restantes, una a una, con revisión de posología.
   ⚠️ Nunca `update plants set ficha_verificada = true` sin `where slug = ...`.
4. `lavanda`: subir `lavanda-cientifica.jpg` (con auditoría visual) o vaciar `image_cientifica_url`. Lleva 30+ días abierto.
5. Decidir qué hacer con las 25 fichas sin origen correcto en disco (redactar o dejar retenidas).
6. `npm audit`: 1 critical en `next` 14.2.35 sin parche en 14.x; la salida es 14→16 + `next-intl` 3→4. Decisión de Papu.
7. Pendientes heredados: Search Console, Full Disk Access para Kimiko, 79 drafts del blog.

## Decisiones técnicas tomadas
- **No revertir la env var de Gumroad.** Es un cambio humano deliberado (posible migración de cuenta);
  revertirlo cobraría en una cuenta que quizá ya no se vigila. Sí se elimina el daño visible (el 404).
- **Solo 404/410 activan el fallback.** Si Gumroad bloquea la IP de Vercel o hay un timeout, se
  mantiene el botón de compra: un falso "roto" costaría ventas reales.
- **Lead repetido = merge** (`resolution=merge-duplicates`, comportamiento original): el `source` pasa a ser el último formulario.
- **Chip sustituido, no eliminado:** se mantienen 4 sugerencias, apuntando a una planta publicada y verificada.

## Notas para ajustar CLAUDE.md
- Al empezar sesión: `git pull` antes de leer `handoff.md`. Hoy el local iba 297 commits por detrás.
- Cuando Kimiko archive su memoria, los bloqueantes abiertos se tienen que mover a "checks críticos".
