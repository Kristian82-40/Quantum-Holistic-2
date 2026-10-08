---
name: qh-sesion
description: Abrir y cerrar una sesión de trabajo en Quantum Holistic gastando pocos tokens y sin perder el hilo. Úsala al empezar cualquier tarea en este repo (q-h.com, Kimiko, Supabase), cuando el estado no esté claro, y al terminar para dejar ESTADO.md al día. Sustituye a flow-state / qh-flow-state en este repo.
---

# qh-sesion — tokens e integridad

## Al empezar (en este orden, nada más)
1. `CLAUDE.md` (reglas fijas) y `ESTADO.md` (qué funciona y con qué prueba).
2. La última nota de la bitácora: `ls kimiko/bitacora | tail -1` y leer solo esa.
3. Si la tarea toca Kimiko: `kimiko_runbook` (qué tareas hay y si están activas):
   `select id, activa, cuando from kimiko_runbook order by id;`
4. No leer `handoff.md`, `PROJECT_CONTEXT.md`, `KIMIKO_MEMORIA.md` ni bitácoras antiguas salvo que la tarea lo pida.

## Mientras trabajas
- **Supabase: contar, no volcar.** `select count(*) … where …` o `limit 5` con columnas concretas.
  Nunca `select *` de `blog_posts`, `plants` o `kimiko_updates` sin `limit` (el campo `content`/`respuesta_bruta` pesa mucho).
- Logs: `kimiko_updates` con `detalle->>'error'` recortado (`left(…, 200)`), nunca `respuesta_bruta` entera.
- **Buscar antes de abrir.** `grep -n` / `rg` para encontrar la línea; abrir el archivo solo por el tramo que importa.
  Archivos de más de 300 líneas: leer por rangos.
- Ignorar siempre `node_modules/`, `.next/`, `public/images/`, `*.json` de datos (`app/fichas-*.json`), `qh-flow-state-workspace/`.
- Lo que ya se leyó en la sesión no se vuelve a leer salvo que haya cambiado.
- Comprobar en lo desplegado (Supabase, Vercel, `curl`), no en la memoria de otra sesión.

## Al cerrar
1. **`ESTADO.md`**: editar solo las filas que cambiaron. Cada línea con su prueba (consulta, URL, PR, log).
   Lo no comprobado se escribe "sin verificar". Actualizar la fecha de "Última revisión".
2. **Bitácora** solo si hubo trabajo largo: `kimiko/bitacora/YYYY-MM-DD-HHMM.md` con
   qué se comprobó, qué cambió, qué parece sospechoso y "Tareas manuales de Kristian" (máx. 3, desde el móvil).
3. Nada de datos personales en el repo (es público): ni emails de `leads`, ni nombres, ni `chat_id`.
4. Cambios de código: van en PR (ver skill `qh-cambio-seguro`).

## Señales de alarma
- `ESTADO.md` dice ✅ algo que no puedes comprobar → bájalo a ❓ y dilo.
- Dos documentos dicen cosas distintas → manda `CLAUDE.md`; avisa a Kristian de la contradicción.
