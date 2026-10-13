# Encargo para Claude Code — revisar las skills nuevas y todo lo de hoy (13-oct-2026)

Pedido por Kristian el 13-oct (17:38). Antes de nada: `CLAUDE.md`, `ESTADO.md` y `qh-sesion`. Solo se **revisa y se arregla en PR**; no se fusiona nada delicado sin el OK de Kristian y no se pega ninguna clave en el repo, los logs ni los PR (repo público). Cada punto termina con una prueba escrita en `ESTADO.md` («sin verificar» si no se pudo).

## A. Skills (`.claude/skills/`)
1. [~] Las 6 skills (`qh-sesion`, `qh-cambio-seguro`, `qh-diseno`, `qh-seguridad`, `qh-editorial`, `qh-kimiko-despliegue`) tienen frontmatter válido (`name` = carpeta, `description` de una frase) y menos de 150 líneas.
2. [x] La lista de skills de `CLAUDE.md` §4 coincide con las carpetas que hay.
3. [~] Ensayo en seco de cada una: seguir sus pasos sobre una tarea pequeña y apuntar qué paso falla o sobra (p. ej. la consulta de la cola de `qh-sesion` devuelve filas; el procedimiento de `qh-kimiko-despliegue` se puede seguir sin adivinar).
4. [~] Ninguna descarga código de terceros ni manda datos fuera. Las skills de terceros que Kristian bajó con Gemini: **leer el código antes de instalarlas** (ver `kimiko/PETICIONES.md`, punto A6 del encargo del 8-oct).

## B. Lo de hoy
5. [~] **PR #60** (cola `para_claude`): migración `20261013170000` ya aplicada en producción; `kimiko/cierre/cerrar-orden.mjs` y el paso final de `kimiko-cloud.yml` (`if: always()` y solo con `draft_id`); `PROMPT.md` solo toca CAPACIDADES, no el NÚCLEO.
6. [x] **PR #62** (Kimiko interno): `supabase/functions/kimiko-orden` y `_kimiko/lib/{orden-interna,motores}.js`. **Comprobar que la función desplegada (v1) es idéntica al repo** (`get_edge_function`) y que `verify_jwt:false` es correcto (valida secreto o llave de servicio).
7. [~] Reglas duras de `orden-interna.js` (llaves, tarjetas, cambiar reglas, dinero): buscar falsos positivos y falsos negativos con 10 frases reales de Kristian; la privacidad `privado` nunca usa Gemini, Mistral ni OpenRouter.
8. [x] `node supabase/functions/_kimiko/pruebas.mjs` (61 en verde) y `get_advisors` de Supabase (seguridad y rendimiento) sin hallazgos nuevos.
9. [~] Cada fila nueva de `ESTADO.md` de hoy tiene prueba real; lo que dice ✅ sin poder comprobarse pasa a ❓.
10. [x] Después del OK de Kristian y de fusionar #60 y luego #62: mandar una orden real desde Telegram y comprobar que el worker llama a `kimiko-orden` (fila `tipo='orden'` con `interno:true` en `kimiko_updates`).

## Al cerrar
`ESTADO.md` al día, nota en `kimiko/bitacora/` y, si algo se queda sin poder hacer, `status='para_claude'` con *Hecho / Falta / Por qué / Pista*.

## Resultado (13-oct, 19:00)
`[x]` comprobado · `[~]` comprobado con pendientes. La prueba de cada punto está en `ESTADO.md` («Revisión del encargo del 13-oct») y el detalle en `kimiko/bitacora/2026-10-13-1900.md`. Arreglo de las reglas duras: PR #64 (borrador, espera el OK de Kristian).
