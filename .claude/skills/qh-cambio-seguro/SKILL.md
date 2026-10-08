---
name: qh-cambio-seguro
description: Pasos obligatorios para cualquier cambio en Quantum Holistic (código, Supabase, Edge Functions, crons, workflows). Úsala antes de tocar nada que se despliegue, al preparar un PR y antes de decir "hecho". Para si el cambio implica pagar o cambiar de plataforma.
---

# qh-cambio-seguro — plan, rama, prueba, PR

## 0. ¿Hay que parar y preguntar a Kristian?
Para **antes de empezar** si el cambio:
- cuesta dinero (plan de pago, API de pago, dominio, tarjeta) — di el importe;
- cambia de plataforma o de pieza de la arquitectura congelada (`CLAUDE.md` §2);
- borra datos o tablas, reescribe historial de git o fuerza un push;
- publica contenido (todo nace como borrador) o toca precios y pagos.

## 1. Plan breve (3–6 líneas)
Qué cambia, en qué archivos o tablas, cómo se va a probar y cómo se deshace.

## 2. Rama
`git switch main && git pull && git switch -c claude/<tema-corto>` (Kimiko Cloud: `kimiko/orden-<id>`).
Nunca commits en `main`: está protegida y solo se actualiza fusionando PR.

## 3. Cambio mínimo
- Solo las líneas necesarias (Diff-Only). Mismo estilo y comentarios en español que el código de alrededor.
- Supabase: migración nueva en `supabase/migrations/AAAAMMDDHHMMSS_nombre.sql`, aditiva y reversible
  (`create … if not exists`, `add column if not exists`). Nunca `drop`. Funciones `security definer` con
  `set search_path = ''` y `grant` solo a `service_role` si son internas.
- Kimiko: el código vive en `supabase/functions/_kimiko` (lib/, src/) y el worker en `kimiko/worker`.
- Ningún secreto en el código, en los logs ni en el PR (el repo es público).

## 4. Prueba real (sin esto no hay "hecho")
| Qué cambió | Prueba mínima |
|---|---|
| Web (Next.js) | `npm run build` + vista previa de Vercel del PR (captura móvil, ver `qh-diseno`) |
| Kimiko | `node supabase/functions/_kimiko/pruebas.mjs` todo en verde + una ejecución real (`net.http_post` con el secreto de Vault) y la fila en `kimiko_updates` |
| SQL | consulta que muestre el resultado + `get_advisors` de seguridad (ver `qh-seguridad`) |
| Cron | `select jobname, active from cron.job` y, tras la hora, `cron.job_run_details` |
| Workflow de Actions | ejecución en la rama (`workflow_dispatch`) con resultado `success` |

Si la prueba no se puede hacer desde aquí, se escribe **"sin verificar"** y por qué.

## 5. PR
`gh pr create --base main` con: qué cambia, causa (si es un arreglo), **cómo se probó con resultados reales**,
y "Para Kristian" (máx. 3 acciones, desde el móvil). Un PR por bloque. No fusionar tus propios PR.
Si algo ya se desplegó desde la rama (Edge Function, migración), dilo en el PR: lo desplegado = lo del repo.

## 6. ESTADO.md
Actualizar las filas afectadas con la prueba (ver `qh-sesion`).

## Frases prohibidas sin prueba
"Hecho", "funciona", "arreglado", "desplegado", "ya está". Sustitúyelas por lo que se comprobó: "la ejecución de las
08:13 UTC dejó el borrador X en `blog_posts`".
