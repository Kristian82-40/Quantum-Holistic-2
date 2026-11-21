# Handoff — 2026-11-21

El estado con pruebas vive en `ESTADO.md` y la lista de tareas en la cola `kimiko_tareas` (Supabase).
Este archivo solo dice qué hizo la última sesión y por dónde seguir.

## Módulo trabajado
Poner al día la cola `kimiko_tareas` (puerta G0).

## Hecho (con prueba)
- **F0-08 (freno) → `verificada`.** La rama `claude/f0-08-freno` es antecesora de `main` (entró con #95, `cf8bce9`); 0 diferencias en `supabase/`, el worker y `.github`; migración `20261017090000` aplicada; `kimiko_autonomia` en N2, sin pausa. **PR #84 cerrado** sin fusionar porque era redundante.
- **F0-03 (prueba de permisos) → `verificada`.** Chequeo de las 06:00 del 17 al 21-nov: `ok: true`, `permisos_rotos: 0`.
- `ESTADO.md`: actualizadas las filas de F0-03 y la línea de última revisión.

## Archivos modificados
- `ESTADO.md`, `handoff.md`

## Próximos pasos (cola, responsable code)
1. F0-07 (`/hoy` nunca usado en Telegram) y F0-10 (dos órdenes reales seguidas, #66): necesitan que Kristian lo use desde el móvil.
2. F0-09: falta la matriz Ubuntu + macOS (bash 3.2) en `vigilancia.yml`.
3. F1-01 … F1-13 pendientes (F1-12 = fusionar #59, espera el «sí» de Kristian).

## Notas
- `KIMIKO_MEMORIA.md` no tiene cierres desde el 16-oct: la fuente de verdad es `ESTADO.md` + la cola.
- `kimiko/tareas/recibos/` no está en git (recibo local de F0-09 del 17-oct). Se queda así.
