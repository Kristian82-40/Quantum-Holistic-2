---
name: "qh-kimiko-despliegue"
description: "Desplegar y probar una Edge Function de Kimiko, abrir el PR y cerrar la sesión en Quantum Holistic cuando las herramientas habituales fallan (gh pr create, hook de push, logs)."
---

# qh-kimiko-despliegue — de la rama a producción sin tropiezos

Complementa `qh-cambio-seguro` (plan → rama → prueba → PR) y `qh-sesion` (tokens). Reglas de `CLAUDE.md` mandan siempre: coste 0 €, repo público (ningún secreto), cambios pequeños y en PR.

## 1. Antes de tocar nada
- Leer `CLAUDE.md` y `ESTADO.md`. Mirar la cola: `select left(id::text,8) id, status, left(copy,200) copy from kimiko_drafts where status in ('para_claude','error_ejecucion') order by updated_at desc limit 5;`
- Si hay contradicción entre instrucciones antiguas y nuevas, o algo peligroso: parar y avisar a Kristian antes de seguir.

## 2. Desplegar una Edge Function (MCP Supabase `deploy_edge_function`)
- Proyecto `vctetjugbvyllwjpxcxh`. Archivos con nombre `functions/<fn>/index.ts` y `functions/_kimiko/lib/*.js` (mismo contenido exacto que el repo; leer cada archivo con Read, no de memoria).
- Seguir el grafo de imports y subir todos los archivos que se importen.
- `verify_jwt:false` solo si la función ya valida su propio secreto o la llave de servicio. Si no, `true`.
- Lo desplegado = lo del repo: el mismo código va en el PR (regla 7). Comprobarlo: `supabase functions download <fn> --project-ref vctetjugbvyllwjpxcxh` en una carpeta temporal y `diff` contra `supabase/functions/` (o `get_edge_function` si no hay CLI).

## 3. Probar con la red real
- Insertar filas de prueba en `kimiko_drafts` copiando `chat_id` de una orden reciente; texto que empiece por «PRUEBA».
- Llamar a la función desde SQL con `net.http_post` y el secreto de Vault `kimiko_cron_secreto` (cabecera `x-kimiko-secreto`); leer el resultado en `net._http_response`.
- Comprobar estado final, `kimiko_updates` (tipo, motor, ok) y el aviso en Telegram.
- Limpiar: pasar las filas de prueba a `descartado` (no borrar).
- `execute_sql` con varias sentencias solo devuelve la última: lanzar las consultas por separado.

## 4. Pruebas y PR
- `node supabase/functions/_kimiko/pruebas.mjs` debe quedar en verde antes de subir.
- Si `gh pr create` falla por GraphQL (pasa en las sesiones en la nube; en el Mac funciona): usar `gh api repos/Kristian82-40/Quantum-Holistic-2/pulls --input pr.json` (JSON con title, head, base, body) con el JSON en el scratchpad.
- Los logs de Actions no se leen por el proxy: usar la API de jobs/steps y las annotations.
- PR apilado: decir en el cuerpo cuál debe fusionarse antes. Lo delicado (base de datos, pagos, reglas de Kimiko, worker) necesita el OK de Kristian por Telegram. El fusionador solo reconoce como delicado migraciones, pagos, `PROMPT.md`/`CLAUDE.md` y el propio fusionador: un PR que cambie `supabase/functions/`, `kimiko/worker` o un workflow se abre **en borrador** (`--draft`) para que no se fusione solo.
- Commits y PR con las líneas de atribución que indique la sesión.

## 5. Hook de push («commits sin subir y no hay rama remota»)
- Comprobar con `git ls-remote --heads origin <rama>` y `git rev-parse HEAD`: si coinciden, ya está subido.
- Arreglo: `git push -u origin <rama>` y, si sigue sin rama de seguimiento local, `git update-ref refs/remotes/origin/<rama> <sha>`; volver a ejecutar el hook.
- Los archivos sin seguimiento también hacen saltar el hook: commitear o ignorar.

## 6. Cerrar la sesión
- `ESTADO.md`: editar solo las filas que cambiaron, cada una con su prueba; lo no comprobado, «sin verificar»; actualizar «Última revisión».
- Las tareas de Kristian van a «Lo que solo puede hacer Kristian» de `ESTADO.md` (punto «Cola de Kristian») y se hacen de forma interactiva por terminal, para que las claves vayan directas a Supabase Secrets sin pasar por el chat.
- Informar en español, corto y legible desde el móvil.

## Nunca
- Pegar claves, tokens o números de tarjeta en el repo, logs, PR o chat.
- Crear credenciales o gastar dinero sin el «sí» de Kristian.
- Marcar algo como hecho sin prueba.
