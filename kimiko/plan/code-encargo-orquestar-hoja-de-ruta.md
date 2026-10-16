# Encargo para Claude Code: orquestar la hoja de ruta de Quantum Holistic (v1)

**Pedido por Kristian el 14-oct-2026.** Repo: `Kristian82-40/Quantum-Holistic-2`. Plan: `claude/hoja-de-ruta-empresa.md` («la hoja»). Tareas de Kristian: `claude/tareas-kristian.md`. Este encargo sustituye a los del 5-oct y el 8-oct, que quedan como histórico.

> Si dos documentos chocan, manda la tabla de precedencia de la hoja (9.1). Si no está claro cuál manda, **para y avisa a Kristian antes de seguir**.

Contenido: 0 Antes de empezar · 1 Objetivo y medidas · 2 Cómo se trabaja · 3 Reglas duras · 4 Los primeros diez pasos · 5 La cola `kimiko_tareas` · 6 Ejecutor interactivo v2 y módulos · 7 Plantillas · 8 F0-01 en detalle · 9 Qué no hacer · 10 Cierre de sesión · Anexo con las tareas en CSV

## 0. Antes de empezar

1. Lee, en este orden y nada más (skill `qh-sesion`): `CLAUDE.md`, `ESTADO.md`, la última nota de `kimiko/bitacora/` y, de la hoja, la sección 9 (reglas) y la tabla de la fase activa (sección 5).
2. Cuando exista la cola (F0-07), consulta qué toca: `select id, titulo, estado, fecha_objetivo from kimiko_tareas where estado not in ('verificada','descartado') order by fecha_objetivo nulls last limit 15;`
3. Si tu sesión no tiene el Project, pide a Kristian que adjunte la hoja y este encargo. Hasta que F0-15 copie la hoja a `kimiko/plan/`, ese adjunto es la fuente; después manda la copia del repo (T-19).
4. Las fechas de la hoja son del 14-oct-2026. Mira la fecha de hoy y qué tareas vencen o están retrasadas antes de planificar.

## 1. Objetivo y cómo se mide

**Objetivo:** ejecutar la hoja hasta la puerta G5 (31-ene-2027) con el mínimo de pasos manuales para Kristian, sin romper ninguna regla de la sección 3 y con prueba de cada tarea. Tú orquestas: preparas, construyes, verificas y le dejas a Kristian solo lo que no se puede delegar.

**Medidas** (las resumes cada lunes en una línea: «X de Y verificadas · puerta Gn a N días»):

- Tareas verificadas frente a las de la fase y estado de su puerta.
- Minutos de Kristian en la semana frente a su capacidad (tabla 4.5 de la hoja).
- OK pendientes y su antigüedad (objetivo: menos de 24 h).
- Llaves expuestas: 0 · contradicciones abiertas: 0 · diferencias entre lo desplegado y `main`: 0.

## 2. Cómo se trabaja

### 2.1 Ciclo de una sesión

1. **Leer** (sección 0).
2. **Recomprobar la línea base** si la última comprobación tiene más de 24 h (sección 4, paso 1). Si algo difiere de la hoja, para y avisa.
3. **Elegir tareas listas:** las que tienen todas sus dependencias en `verificada`, por fecha y margen. Primero las que bloquean tiempo de Kristian.
4. **Preparar los bloques de Kristian:** lo que cada tarea suya llama «prepara» (enlaces, valores, comprobaciones) listo antes de pedirle nada. Su lista del día (`/hoy`) lleva como máximo 5 tareas.
5. **Hacer tus tareas.** Las que llevan OK: pídelo con el mensaje de 7.5 y espera. Sin «sí» no se hace.
6. **Verificar:** ejecuta la prueba de la tarea, guarda la evidencia (consulta, URL, id de ejecución y hora) y pasa la tarea a `verificada`.
7. **Cerrar** (sección 10).

### 2.2 Quién ejecuta qué

| Quién | Con qué | Hace |
|---|---|---|
| Code (sesión en el Mac de Kristian) | Conectores (Supabase, Vercel, Cloudflare en lectura, Stripe), CLI (`gh`, `supabase`, `vercel`), PR, pruebas | Migraciones y consultas, PR, despliegue de funciones, variables de Vercel no secretas, DNS, comprobaciones, evidencia |
| Kimiko (automático) | Edge Functions, `pg_cron`, worker de Cloudflare, Actions | Post diario, reel, chequeos, auditoría, métricas, informes, calendario, envíos ya aprobados |
| Kristian | Terminal del Mac (ejecutor v2), paneles web, móvil | Decisiones, OK, identidad y dinero, llaves, revisión como herbolario y chef |

### 2.3 Qué necesita OK de Kristian

Cada tarea de la hoja lleva su etiqueta y su texto de OK (sección 5 de la hoja y CSV del anexo). La tabla de etiquetas está en la hoja (9.4). Si tu cambio toca algo de esa lista y la tarea no lo marca, **pide el OK igualmente** y avisa del desajuste para corregir la hoja.

- Un OK vale solo para lo que nombra. «Sí F0-01» no autoriza F0-02.
- Puede dar varios en un mensaje («sí F0-01 F0-04»); cada uno vale solo para su tarea.
- Si pasan 48 h sin respuesta a un OK, recuérdalo una vez; no lo des por concedido nunca.
- Las decisiones D1–D6 no son OK: tienen fecha límite y valor por defecto (hoja, sección 6).

### 2.4 Qué es «hecho»

Una tarea es `verificada` solo cuando **tú** has ejecutado la comprobación de su prueba y has guardado la evidencia. Que Kristian pulse «hecho» deja la tarea en `esperando_prueba`. Si la prueba no se puede ejecutar, la tarea queda en `esperando_prueba` y se dice por qué; nunca `verificada` «a ojo».

## 3. Reglas duras

1. **Nada es «hecho» sin prueba.** Lo no comprobado se escribe «sin verificar» (regla 1 de `CLAUDE.md`).
2. **Un PR por bloque.** `main` solo por PR. Ningún paso manual en GitHub para Kristian: los PR en verde se fusionan solos; los delicados, con su «sí» (tú ejecutas la fusión).
3. **El repositorio es público.** Ni secretos ni datos personales (correos, nombres, `chat_id`) en código, documentos, PR, bitácoras o registros.
4. **Fallos de seguridad abiertos: no se escriben en el repo.** Primero se corrigen en la base y después se abre el PR con la misma migración y un texto genérico (T-19).
5. **Las llaves nunca pasan por el chat.** Solo por el ejecutor del terminal (`read -s`) a Supabase Secrets, a Vercel como «sensibles» o a los secretos del repo privado de copias. Se comparan por huella. Si una llave aparece en un chat, un PR o un log, se rota en esa sesión.
6. **Coste 0 € salvo lo aprobado** (hoy: Vercel Pro y el gestor). Cualquier otro gasto se propone con importe y se espera el «sí» (regla 4 y política de gasto, hoja 9.3).
7. **OK explícito** para las etiquetas `db`, `pago`, `dns`, `regla`, `envio`, `prod`, `cred` y `delicado`. «Es poco» no es motivo para saltárselo.
8. **Conflicto o peligro = parar y avisar** (tabla de precedencia, hoja 9.1). Nadie elige entre dos instrucciones contradictorias.
9. **Supabase: contar, no volcar.** `count(*)`, `limit 5` y columnas concretas; nunca `select *` de `blog_posts`, `plants` o `kimiko_updates`, ni correos de `leads`.
10. **Salud (regla 8):** sin promesas de curar, sin dosis, con contraindicaciones y aviso de consultar con un profesional; todo contenido nuevo nace como borrador. Quantum Pro no se vende hasta que exista como se anuncia (D5).
11. **Lo desplegado = lo del repo (regla 7).** Tras cada despliegue, `supabase functions download` y `diff` con `main`; también en la revisión mensual (T-18).
12. **Lo que exige el Mac se marca como tal** (regla 3) y se agrupa en sesiones cortas.
13. **Kimiko no toca su NÚCLEO, ni paga, ni borra, ni crea credenciales.** Los cambios del NÚCLEO, `PROMPT.md` y `CLAUDE.md` son PR de Kristian con etiqueta `regla`.
14. **El plan no se reordena en silencio.** Un cambio es una versión nueva con fecha y motivo en `DECISIONES.md` (hoja 9.5). Propón con `estado = propuesta`; decide Kristian.
15. **Lo legal y fiscal es orientativo.** Lo confirma el gestor; no presentes tus textos como asesoramiento.

## 4. Los primeros diez pasos

Orden recomendado para las primeras sesiones (G0 se cierra el 20-oct). Los pasos 2 a 9 respetan las dependencias de la hoja; entre dos pasos sin dependencia puedes elegir el que Kristian pueda desbloquear antes.

### Paso 1. Recomprobar la línea base (solo lectura, 10 minutos)

Repite estas comprobaciones y compáralas con la sección 1 de la hoja. **Si algo difiere, para y avisa.**

```sql
-- 1) Permisos de profiles: qué columnas puede actualizar un usuario registrado
select column_name, has_column_privilege('authenticated', 'public.profiles', column_name, 'UPDATE') as authenticated_update
from information_schema.columns where table_schema = 'public' and table_name = 'profiles' order by ordinal_position;

-- 2) Políticas de profiles
select polname, polcmd, pg_get_expr(polqual, polrelid) as using_expr, pg_get_expr(polwithcheck, polrelid) as check_expr
from pg_policy where polrelid = 'public.profiles'::regclass;

-- 3) Nadie ha abusado: perfiles, admins y planes de pago (solo recuentos)
select count(*) as perfiles, count(*) filter (where role = 'admin') as admins, count(*) filter (where plan <> 'freemium') as de_pago from public.profiles;
select count(*) as usuarios_auth from auth.users;

-- 4) Contenido y captación (recuentos)
select status, count(*) from public.blog_posts group by status order by 1;
select count(*) filter (where publicada and ficha_verificada) as visibles, count(*) as total from public.plants;
select count(*) as leads from public.leads;

-- 5) Cómo se crea un perfil al registrarse (el disparador debe ser security definer)
select p.proname, p.prosecdef from pg_trigger t join pg_proc p on p.oid = t.tgfoid
where t.tgrelid = 'auth.users'::regclass and not t.tgisinternal;
```

Además: `supabase functions list` (versión de `kimiko-diario`; debe seguir la v18), `gh pr list --state all --limit 20` (estado real de #59, #65, #66, #67 y #68) y `get_advisors` de seguridad (línea base: 0 ERROR y 5 WARN).

Esperado el 14-oct: 1 perfil, 1 usuario, 30 publicados, 80 borradores, 9 rechazados, 9 de 57 plantas visibles y 0 leads. Si hay más de 1 perfil, compara cuándo se crearon con los usuarios reales antes de nada.

### Paso 2. F0-01: cerrar la escalada en `profiles` (hoy mismo, con «sí F0-01»)

Procedimiento completo en la sección 8. Es lo único con riesgo real hoy. Pide el OK con el mensaje de 7.5.

### Paso 3. F0-05: crear `DECISIONES.md`

En la raíz del repo. Contenido: (1) D1–D6 como «pendientes de respuesta» con su fecha límite y valor por defecto, copiados de la hoja (sección 6); (2) la tabla de precedencia (9.1); (3) la escalera N0–N4 (9.2); (4) la política de gasto, los disparadores y las cuotas (9.3); (5) un registro fechado de decisiones (vacío salvo «14-oct: hoja de ruta v1 propuesta»). Nada de datos personales ni de fallos de seguridad abiertos. `qh-sesion` pasa a leerlo en el primer paso. Sin etiqueta de OK: es solo documentación.

### Paso 4. F0-04: `kimiko-diario` igual a `main`

Sigue la skill `qh-kimiko-despliegue`: `supabase functions download kimiko-diario` en una carpeta nueva, `diff -r` con `supabase/functions/kimiko-diario` y `_kimiko`, pruebas de Kimiko en verde (`node supabase/functions/_kimiko/pruebas.mjs`), despliegue con el CLI y OK `prod`. Después, `diff` otra vez (0 diferencias), `{"accion":"chequeo"}` → 200 y, al día siguiente, una fila `blog` en `kimiko_updates` con el filtro legal nuevo.

### Paso 5. F0-10: PR #66, #67 y #68

Para cada uno: lee los comentarios del PR (la prueba exacta está escrita ahí), rebasa sobre `main` si hace falta, ejecuta las pruebas, pide el OK (`db` o `delicado`) y fusiona con `--admin` solo tras el «sí». **#68 (qué es «delicado» para el fusionador):** su estado es *sin verificar*; si ya está fusionado, comprueba que `kimiko-fusion.yml` en `main` lista funciones, worker y workflows como delicados; si sigue abierto, aplícalo. Prueba final: `pg_get_triggerdef` de `kimiko_drafts_avisar` igual al archivo del repo y tres órdenes de prueba seguidas cerradas las tres. Las filas de prueba pasan a `descartado`, no se borran.

### Paso 6. F0-02: cerrar el resto de permisos (tras F0-01)

Con OK `db`, mismo patrón que en la sección 8 (primero la base, después el PR con la misma migración y texto genérico). Alcance:

- `terapeutas`: la política «Public read verified terapeutas» expone la fila entera. Sustitúyela por una vista `terapeutas_publicos` solo con nombre, foto, biografía y especialidades; quita la lectura directa de `profiles` a `anon`.
- `plants`: `plants_public_read` tiene `qual = true` (48 de 57 son borradores legibles). Déjala en `publicada and ficha_verificada`. **Antes**, busca con `grep` qué rutas leen `plants` con la llave pública o con la sesión de un usuario (`/diccionario`, `/diccionario/[slug]`, `/admin`) y comprueba que siguen funcionando; los borradores los leen Kimiko y `/admin` con la llave de servicio o con una función `es_admin()` `security definer`.
- `chat_usage`: las dos políticas ALL permiten saltarse el límite de 5 mensajes y tocar contadores ajenos. Pasa la escritura a la ruta del servidor (llave de servicio) y quita DML directo a `anon` y `authenticated`.
- Resto de tablas: `revoke insert, update, delete on all tables in schema public from anon, authenticated` y concede de vuelta **solo** lo que el navegador necesita (haz el inventario con `grep` de `.insert(`, `.update(`, `.delete(` y `.upsert(` sobre el cliente público). **Ojo:** la revocación general también quita el `grant update (dosha, updated_at)` de `profiles` que puso F0-01; repónlo en la misma migración. Ajusta los privilegios por defecto del rol con el que se crean las tablas (`alter default privileges in schema public revoke all on tables from anon, authenticated`) y comprueba con `pg_default_acl` que las tablas nuevas nacen cerradas.
- Guarda la matriz esperada de las 30 tablas en `kimiko/pruebas/permisos.sql` y comprueba `get_advisors` (sin avisos nuevos). Prueba de humo posterior: `/`, `/blog`, `/diccionario`, `/diccionario/hinojo`, `/login`, `/cuenta` (con sesión de prueba) y `/api/chat/usage` → sin errores.

### Paso 7. F0-07: la cola `kimiko_tareas` y `/hoy` (tras F0-02)

Sección 5. OK `db` y `prod`. Importa las tareas del anexo CSV, enseña `/hoy` a Kristian y deja la tarea F0-13 lista en su lista.

### Paso 8. F0-03: prueba de permisos diaria y en CI (tras F0-02)

(1) Función `kimiko_prueba_permisos()` en la base: devuelve una fila por cada expectativa rota (columnas escribibles que no deberían, plantas legibles que no deberían, DML sobrante) y **0 filas** si todo está bien. (2) El chequeo diario de `kimiko-diario` la llama con la llave de servicio que ya tiene y avisa a Telegram si hay filas. (3) Job nuevo en `vigilancia` que levanta Supabase local y corre `kimiko/pruebas/permisos.sql` en los PR que tocan `supabase/migrations/`. **Ojo (comprobado el 14-oct):** ninguna migración del repo crea `profiles` y solo hay 9 migraciones (empiezan el 8-oct): las migraciones por sí solas no reconstruyen la base. Añade un volcado de esquema versionado (`supabase/schema/base.sql`, solo esquema, sin datos): si el CLI pide la contraseña de la base para `supabase db dump --linked --schema public`, que la teclee Kristian en su terminal (≈ 3 min, anótalos como suyos), nunca en el chat; alternativa sin contraseña: reconstruirlo con consultas al catálogo por el conector. Pasa gitleaks antes de subirlo. **Sin credenciales de producción en GitHub** (T-06).

### Paso 9. F0-08 y F0-09

**Freno (F0-08):** tabla `kimiko_autonomia` (una fila: nivel, pausado, motivo, actualizado) y `kimiko_gasto_limites` (servicio, cuota, unidad, `aviso_pct` = 80, `tope_mensual_eur` = 0). Con `pausado = true` se detiene lo automático (diario, reintentos, reel, distribución, envíos); `/pausa`, `/reanudar`, `/hoy` y `/estado` siguen funcionando. Prueba: una cuota simulada al 85 % manda aviso con la acción exacta y `kimiko-diario` responde `pausado` sin escribir.

**Ejecutor v2 (F0-09):** sección 6. Lo único que se entrega en F0 es el esqueleto (`run.sh`, `lib.sh`, `--lista`, `--dry-run`, `--continuar`), el módulo `hola` y las pruebas; los demás módulos se escriben cuando toque su tarea.

### Paso 10. F0-14, F0-15 y comprobar G0

**Notion (F0-14):** con OK, añade al principio de las páginas del Handoff del 26-may y de los mandatos v4 y v5 el aviso «HISTÓRICO: manda `DECISIONES.md`», sin cambiar nada más; comprueba con `notion-fetch`.

**`ESTADO.md` y copia del plan (F0-15):** (a) «Lo que solo puede hacer Kristian» se sustituye por un puntero a `/hoy`; (b) encabezado de una sola línea; (c) línea base del 14-oct con su prueba; (d) numeración arreglada; (e) copia la hoja y este encargo a `kimiko/plan/` **solo después de que F0-01 y F0-02 estén `verificadas`**; antes de copiar, `grep` de «sigue abierto» y de los fallos I-01 a I-05 para que no quede ningún fallo abierto descrito; (f) una sola línea en `CLAUDE.md` que apunte a `kimiko/plan/` (etiqueta `regla`: pide el OK; el diff de `CLAUDE.md` es de una línea). Registra la huella SHA-256 de las dos copias.

**Puerta G0 (20-oct):** recorre los 8 criterios de G0 en la hoja (sección 3) y marca cada uno con su evidencia. Lo que falle se dice con el motivo y una propuesta; no se empieza la fase 1 con huecos en G0.

## 5. La cola `kimiko_tareas`

Sustituye a las cuatro colas de hoy (I-29). Solo la leen y escriben Code y Kimiko con la llave de servicio; ni `anon` ni `authenticated` tienen acceso.

### 5.1 Tablas

```sql
create table if not exists public.kimiko_tareas (
  id             text primary key,                         -- F0-01, o P-001 para propuestas de Kimiko
  fase           smallint not null check (fase between 0 and 6),
  clave          text not null unique,                     -- perfiles, grants...
  titulo         text not null,
  quien          text not null check (quien in ('K','C','M')),
  deps           text[] not null default '{}',             -- ids de las que depende
  canal          text check (canal in ('movil','panel','mac','llamada')),
  modulo         text,                                     -- módulo del ejecutor (tareas de Mac)
  minutos        integer not null default 0,
  ok_requerido   text,                                     -- qué aprueba Kristian (null = nada)
  ok_minutos     integer not null default 0,
  etiquetas      text[] not null default '{}',             -- db, pago, dns, regla, envio, prod, cred, delicado
  estado         text not null default 'pendiente'
                 check (estado in ('pendiente','en_curso','esperando_ok','esperando_prueba','verificada','bloqueado','descartado','propuesta')),
  fecha_objetivo date,
  prueba         text not null,
  evidencia      jsonb not null default '{}'::jsonb,       -- recibos sin secretos
  recurrente     text check (recurrente in ('diaria','semanal','mensual','trimestral')),
  opcional       boolean not null default false,
  ultimo_por     text not null default 'sistema' check (ultimo_por in ('kristian','code','kimiko','sistema')),
  actualizado    timestamptz not null default now()
);

create table if not exists public.kimiko_tareas_historial (
  id        bigint generated always as identity primary key,
  tarea_id  text not null references public.kimiko_tareas(id) on delete cascade,
  de        text,
  a         text not null,
  quien     text not null,
  cuando    timestamptz not null default now()
);

create or replace function public.kimiko_tareas_toca() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.actualizado := now();
  if new.estado is distinct from old.estado then
    insert into public.kimiko_tareas_historial (tarea_id, de, a, quien) values (new.id, old.estado, new.estado, new.ultimo_por);
  end if;
  return new;
end $$;
create trigger kimiko_tareas_toca before update on public.kimiko_tareas
  for each row execute function public.kimiko_tareas_toca();
revoke execute on function public.kimiko_tareas_toca() from public, anon, authenticated;

alter table public.kimiko_tareas enable row level security;
alter table public.kimiko_tareas_historial enable row level security;
revoke all on public.kimiko_tareas, public.kimiko_tareas_historial from anon, authenticated;
-- sin políticas: solo la llave de servicio entra
```

Es una propuesta: ajústala si la base lo pide, pero conserva las columnas, los estados y que **nada** sea accesible para `anon` ni `authenticated`. Aplícala con OK `db`; la prueba es `has_table_privilege('anon','public.kimiko_tareas','SELECT')` = false.

### 5.2 Importar el plan

1. Lee el CSV del anexo: `id`, `clave`, `fase`, `quien`, `deps` (claves separadas por espacios; conviértelas a ids), `canal`, `minutos`, `ok_minutos`, `etiquetas` (separadas por `+`), `fecha`, `recurrente`, `opcional`, `modulo` y `titulo`.
2. `prueba` y `ok_requerido` salen de la sección 5 de la hoja: cada tarea tiene una línea con el patrón `- **F0-01** — *Tu OK: …* Prueba: …` (el texto de OK es opcional). Si el patrón no coincide para alguna tarea, para y avisa.
3. Inserta todas con `estado = 'pendiente'`. Comprueba `select count(*) from kimiko_tareas` = nº de filas del CSV y que no hay ciclos en `deps`.

### 5.3 `/hoy`

Comando de Telegram (worker + `_kimiko/src/webhook.js`, con pruebas como los demás). Muestra como máximo **5 tareas**, en este orden:

1. Primero los OK pendientes (`estado = 'esperando_ok'`) con botones **✅ Aprobar** y **✖ Rechazar**.
2. Después las tareas de Kristian (`quien = 'K'`, `estado` en `pendiente` o `en_curso`, sin `recurrente`) cuyas dependencias estén todas en `verificada` o `descartado`, por `fecha_objetivo` y, a igualdad, menos minutos primero. Las vencidas llevan ⏰.
3. Cada tarea: `ID · título · canal · minutos · para el dd-mmm` y botones **▶ Empezar** (muestra los pasos y la prueba), **✅ Hecho** (pasa a `esperando_prueba`), **⏸ Luego** (la oculta un día) y **🚫 Bloqueada** (pide el motivo).
4. Pie: «Total: N min». Si no queda nada: «Nada pendiente hoy».
5. `callback_data` ≤ 64 bytes, por ejemplo `t:F1-07:go`. Cada pulsación escribe `ultimo_por = 'kristian'`.

```sql
create or replace function public.kimiko_hoy(p_max int default 5)
returns table (id text, titulo text, estado text, canal text, minutos int, ok_requerido text, fecha_objetivo date, vencida boolean)
language sql stable security definer set search_path = '' as $$
  select t.id, t.titulo, t.estado, t.canal, t.minutos, t.ok_requerido, t.fecha_objetivo, coalesce(t.fecha_objetivo < current_date, false)
  from public.kimiko_tareas t
  where t.recurrente is null
    and (t.estado = 'esperando_ok' or (t.quien = 'K' and t.estado in ('pendiente','en_curso')))
    and not exists (
      select 1 from unnest(t.deps) d join public.kimiko_tareas x on x.id = d
      where x.estado not in ('verificada','descartado'))
  order by (t.estado = 'esperando_ok') desc, t.fecha_objetivo nulls last, t.minutos
  limit p_max
$$;
revoke execute on function public.kimiko_hoy(int) from public, anon, authenticated;
```

`/pausa` y `/reanudar` cambian `kimiko_autonomia.pausado` y responden con el estado.

### 5.4 Propuestas de Kimiko

Las ideas del informe de los lunes (F3-11) entran como filas `P-001`, `P-002`… con `estado = 'propuesta'`, `fase = 6`, `quien = 'K'` (decide Kristian) y la fuente enlazada en `evidencia`. Botones: **✅** crea la tarea real (Code decide quién y cuándo) y deja la propuesta en `descartado` con la nota «aceptada como F-xx»; **✖** la descarta con motivo; **⏸** la deja `propuesta` 30 días más. Ninguna propuesta se ejecuta por sí sola.

## 6. Ejecutor interactivo v2 y módulos

Sustituye a `kimiko/guia-tareas.sh` (que sigue siendo la referencia del método: `read -s`, `supabase secrets set --env-file <(printf …)`, huellas SHA-256 y `curl -K -`). Lo ejecuta **Kristian en una pestaña de su terminal**, no dentro de la sesión de Code: así nada de lo que teclea entra en la conversación.

### 6.1 Requisitos

- `kimiko/tareas/run.sh` (despachador), `kimiko/tareas/lib.sh` (funciones comunes), `kimiko/tareas/modulos/<modulo>.sh` y `kimiko/tareas/pruebas/`.
- Bash 3.2 o superior (macOS) y 5 (Linux); `curl`; `node` para tratar JSON (ya presente por el proyecto; **sin `jq`**). Hash: `shasum -a 256` o `sha256sum`. Abrir enlaces: `open`, `xdg-open` o, si no hay, imprimir el enlace.
- `set -euo pipefail`, `umask 077`, `trap` para borrar temporales, y `unset` de cada secreto tras usarlo. Un secreto nunca va en un argumento de línea de órdenes ni en un archivo del repo: se lee con `read -r -s` y se pasa por entrada estándar o por sustitución de procesos (`--env-file <(printf 'NOMBRE=%s\n' "$VALOR")`).
- `shellcheck` sin errores y prueba en seco en Ubuntu y en macOS dentro de `vigilancia` (matriz de dos sistemas). Los runners estándar de GitHub son gratis en repos públicos (documentación de GitHub, 14-oct; no nombra macOS aparte). Si algún día tuvieran coste, se propone con importe antes de usarlos.

### 6.2 Uso

```bash
bash kimiko/tareas/run.sh --lista            # tus tareas listas, con canal y minutos (lee ~/.kimiko/cola.json)
bash kimiko/tareas/run.sh F1-07              # ejecuta la tarea por su id (o por el nombre del módulo)
bash kimiko/tareas/run.sh F1-07 --dry-run    # enseña los pasos sin cambiar nada ni pedir secretos
bash kimiko/tareas/run.sh F1-07 --continuar  # retoma en el paso donde lo dejaste (tareas en bloques)
```

- `--lista`: **Code exporta tu cola** (solo tus tareas, sin secretos) a `~/.kimiko/cola.json` al abrir la sesión y tras cada cambio; el ejecutor no lleva ninguna llave de servicio. Si el archivo no existe, usa `kimiko/plan/tareas.csv` (estado «desconocido»).
- Cada tarea se parte en pasos numerados; el paso actual se guarda en `~/.kimiko/estado/<id>.json` para `--continuar`. Un bloque dura como máximo 30 minutos.
- **Recibo:** al terminar escribe `kimiko/tareas/recibos/<id>-<AAAAMMDD-HHMM>.json` (carpeta ignorada por git) con lo que 7.2 describe. Dices «hecho» a Code, que lee el recibo, ejecuta la comprobación de la prueba y registra la evidencia en `kimiko_tareas.evidencia`.
- El ejecutor jamás imprime ni guarda un valor secreto: solo nombres y huellas.

### 6.3 Módulos

Un módulo por tarea de terminal; se escribe cuando toca su tarea y se prueba en seco antes de pedirle nada a Kristian.

| Módulo | Tarea | Qué te pide (sin mostrarlo) | Dónde queda | Prueba |
|---|---|---|---|---|
| hola | Prueba del ejecutor (F0-09) | Un valor de prueba (`HOLA_PRUEBA`) que no se guarda | Recibo local | El módulo corre en Ubuntu y en macOS (matriz de `vigilancia`, con el bash 3.2 de macOS; el valor se le pasa por entrada estándar); `--dry-run` no cambia nada; el recibo no contiene el valor |
| backups | F1-19 | Contraseña o URL de conexión de la base (solo escribirla); la clave `age` privada nunca sale por pantalla ni va al repo | Repo privado `qh-backups`: workflow, `AGE_PUBLIC_KEY` y `SUPABASE_DB_URL` como secretos de ese repo; la privada, en un archivo 0600 fuera del repo para que la muevas a tu gestor de contraseñas | Primera copia como artefacto, descifrada en el Mac con recuentos iguales en 3 tablas |
| llaves-ia | F2-18 | Una llave por proveedor (NVIDIA, Mistral, OpenRouter) | Supabase Secrets (`NVIDIA_API_KEY`, `MISTRAL_API_KEY`, `OPENROUTER_API_KEY`) | Llamada gratuita a cada proveedor → 200; huella local = huella de `supabase secrets list` |
| skills-claude | F2-20 | Nada | Tres `.zip` (`qh-sesion`, `qh-kimiko-despliegue`, `qh-cambio-seguro`) con la carpeta y su `SKILL.md`; abre los ajustes de claude.ai | `unzip -l` correcto; Kristian confirma que las ve activadas |
| stripe-vivo | F2-04 | Clave secreta (`sk_live`), publicable (`pk_live`) y firma del webhook en vivo (`whsec_`) | Vercel (producción) como «sensibles»: clave secreta, publicable, firma y los dos `price_`; precios y endpoint creados en Stripe; avisos viejos de Make.com borrados con OK | `charges_enabled = true`; las variables salen como «Sensitive»; se crea una sesión de checkout en vivo sin cobrar; Preview conserva las llaves de prueba |
| meta | F3-02 | Token de Meta y `IG_USER_ID` | Supabase Secrets (`IG_ACCESS_TOKEN`, `IG_USER_ID`) | `me?fields=id,username` → 200; huella igual; caducidad del token anotada (depende del tipo de token: sin verificar) |
| youtube | F4-07 | ID y secreto del cliente OAuth de Google y la autorización en el navegador | Supabase Secrets (`YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN`) | Token de acceso de prueba (200) y lectura del canal propio; nombres en `supabase secrets list` |
| firecrawl | F2-19 | `FIRECRAWL_API_KEY` | Supabase Secrets | Llamada de 1 crédito → 200; saldo restante en el recibo; huella igual |
| restaurar | F5-05 | Ruta de tu clave `age` privada (no su contenido) | Postgres local temporal; borra lo descifrado al terminar | Recuentos iguales a producción en 5 tablas y tiempo total en el recibo |

Detalles que no se deben olvidar:

- **`stripe-vivo`:** si el CLI de Vercel instalado no admite `--sensitive`, el módulo da el paso exacto del panel (Environment Variables → marcar «Sensitive»). No toques las variables de Preview. Reembolsos y borrados en Stripe, con OK `pago`.
- **`backups`:** la clave privada de `age` se guarda en un archivo 0600 y se le dice a Kristian que lo mueva a su gestor de contraseñas y lo borre; sin esa clave las copias no se pueden abrir.
- **`meta`:** el token de Meta tiene caducidad; anótala en `kimiko_secretos` cuando exista (F5-07).
- **`restaurar`:** los recuentos de producción los aporta Code en `~/.kimiko/conteos.json`; el módulo solo compara.

## 7. Plantillas

### 7.1 PR

```markdown
Título: <qué cambia, en una línea, sin describir fallos de seguridad>

## Qué cambia
## Por qué (tarea F0-xx de la hoja)
## Cómo se probó (consulta o comando y salida, sin secretos)
## Qué no cambia
## Cómo se deshace
## Necesita OK de Kristian: sí / no (etiqueta)
```

### 7.2 Recibo del ejecutor (sin secretos)

```json
{
  "tarea": "F1-07",
  "modulo": "backups",
  "version_ejecutor": "2.0.0",
  "inicio": "2026-11-05T18:02:11Z",
  "fin": "2026-11-05T18:14:40Z",
  "pasos": [{"n": 1, "titulo": "Crear repositorio privado", "ok": true}],
  "comprobaciones": [{"nombre": "primer volcado descifrado", "resultado": "ok", "detalle": "3 tablas con el mismo recuento"}],
  "secretos": [{"nombre": "SUPABASE_DB_URL", "destino": "repo privado qh-backups", "huella_local": "ab12cd34", "huella_remota": "ab12cd34", "coinciden": true}],
  "salida": "ok"
}
```

### 7.3 Línea de `ESTADO.md`

```markdown
| ✅ | <qué funciona, en una frase> | <prueba: consulta, URL o ejecución, con fecha y hora; lo no comprobado, «sin verificar»> |
```

### 7.4 Nota de bitácora (`kimiko/bitacora/AAAA-MM-DD-HHMM.md`)

```markdown
# Sesión AAAA-MM-DD HH:MM
## Qué se comprobó
## Qué cambió (tareas que pasan de estado y por qué)
## Qué parece sospechoso
## Tareas manuales de Kristian (máximo 3, desde el móvil)
```

### 7.5 Petición de OK por Telegram o por el chat

```text
🔐 OK F0-01 · Cerrar permisos de profiles por columna
Qué hago: <acción concreta, en una frase>
Riesgo: <bajo/medio/alto y por qué>
Se deshace con: <comando o migración inversa>
Prueba: <qué comprobaré y con qué>
[✅ Aprobar]  [✖ Rechazar]     (o responde «sí F0-01» / «no F0-01»)
```

## 8. F0-01 en detalle: cerrar la escalada de privilegios en `profiles`

**Hallazgo (14-oct, comprobado dos veces).** Un usuario registrado puede actualizar, sobre su propia fila de `profiles`, las columnas `role`, `plan`, `plan_expires_at`, `stripe_customer_id`, `verified`, `email` e `id`: la política «Users update own profile» solo comprueba `auth.uid() = id`, no hay disparadores y el CHECK de `role` admite `admin`. `middleware.ts`, `lib/require-admin.ts` y `app/api/admin/*` confían en `profiles.role`; el chat confía en `plan`. La app solo escribe `dosha` (y `updated_at`) con la sesión del usuario (`app/cuenta/page.tsx:61` y `app/api/perfil/dosha/route.ts:21`); el aviso de Stripe y el de BTCPay escriben con la llave de servicio, que no se ve afectada.

1. **Recomprobar** (paso 1). Mira también si hay un disparador de alta y si su función es `security definer`: si no lo es, **no revoques `insert`** (deja solo `update`).
2. **Pedir el OK** (7.5): «sí F0-01». Sin él no se toca la base.
3. **Aplicar primero en la base** (`apply_migration`, nombre `perfiles_cerrar_escalada`):

```sql
-- Nadie escribe en profiles salvo por las columnas que la app necesita.
revoke insert, update, delete on table public.profiles from anon, authenticated;
grant update (dosha, updated_at) on table public.profiles to authenticated;

-- Política de UPDATE: solo la propia fila y solo usuarios autenticados.
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);
```

Antes de aplicar, repite `grep -rn "from('profiles')" app lib components` y comprueba que no hay otro `.update(` con la sesión del usuario; si lo hubiera, añade solo esa columna inocua al `grant`. Nunca `role`, `plan`, `plan_expires_at`, `stripe_customer_id`, `verified`, `email` ni `id`.

4. **Leer la versión que asignó Supabase** (`select version, name from supabase_migrations.schema_migrations order by version desc limit 3;`) y usarla para el archivo del repo, para que base y repo lleven el mismo número (I-26).
5. **Probar dentro de una transacción con `rollback`** (plantilla; ajústala):

```sql
begin;
select set_config('kimiko.prueba_id', (select id::text from public.profiles limit 1), true);
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', current_setting('kimiko.prueba_id'), 'role', 'authenticated')::text, true);

-- Debe pasar: lo legítimo
update public.profiles set dosha = dosha where id = current_setting('kimiko.prueba_id')::uuid;

-- Cada una debe fallar con permission denied; si alguna se deja actualizar, la prueba revienta
do $$
declare c text;
begin
  foreach c in array array['role','plan','plan_expires_at','stripe_customer_id','verified','email','id'] loop
    begin
      execute format('update public.profiles set %I = %I where id = $1', c, c) using current_setting('kimiko.prueba_id')::uuid;
      raise exception 'ABIERTO: % se puede actualizar', c;
    exception when insufficient_privilege then null;
    end;
  end loop;
end $$;
rollback;
```

Comprueba además: `has_column_privilege('authenticated','public.profiles',c,'UPDATE')` = false para esas siete columnas y `has_column_privilege('anon', …)` = false para todas; `anon` sigue sin leer ninguna fila de `profiles`; `get_advisors` sin avisos nuevos; y las rutas que leen `profiles` (`/login`, `/cuenta`, `/terapeuta`, `/api/chat/usage`) responden como antes.
6. **Abrir el PR** con la misma migración (archivo `<versión>_perfiles_cerrar_escalada.sql`) y la primera versión de `kimiko/pruebas/permisos.sql`. Título y descripción genéricos («Permisos de `profiles` por columna»): ver reglas 3 y 4.
7. **Si una función legítima falla:** añade solo la columna que falta al `grant update (…)`; no deshagas la revocación. Volver al estado anterior (`grant update on table public.profiles to authenticated;`) **reabre el fallo**: solo con el OK de Kristian y como último recurso.
8. **Cerrar:** evidencia en la cola (salida de las comprobaciones, sin datos personales), línea de `ESTADO.md` («permisos de `profiles` por columna», con la prueba) y un aviso a Kristian de una línea.

## 9. Qué no hacer

- No marques `verificada` sin ejecutar la prueba. No des por hecho lo que cuenta una sesión anterior: comprueba lo desplegado.
- No pidas ni aceptes llaves en el chat, ni las pegues en un comando. Si Kristian la pega, rótala.
- No describas en el repositorio público un fallo de seguridad que siga abierto.
- No uses un OK para algo distinto de lo que nombra, ni tomes el silencio por un «sí».
- No cambies de plataforma, no contrates ni actives planes de pago, no toques el dominio ni los DNS sin OK.
- No uses Gemini para datos privados ni para visitantes de la web (T-14).
- No instales skills, paquetes o servidores MCP de terceros sin leer su código (regla de `CLAUDE.md` §5).
- No borres datos ni contenido publicado: archiva (`status = 'archived'`) y deja copia; borrar lo decide Kristian.
- No toques el NÚCLEO, `PROMPT.md` ni `CLAUDE.md` sin PR de Kristian y etiqueta `regla`.
- No des a Kristian una tarea del Mac sin avisar, ni una de más de 30 minutos sin partirla en bloques.
- No empieces la fase siguiente con una puerta sin cerrar.
- No hagas nada del backlog de la v2 (hoja, 11.5) dentro de la v1.
- No te pongas a investigar o construir «mejoras» fuera de la hoja: propónlas con `estado = propuesta`.

## 10. Cierre de sesión

1. `kimiko_tareas` al día: estados, evidencia y `ultimo_por`.
2. `ESTADO.md`: solo las líneas que cambiaron, cada una con su prueba y la fecha de «Última revisión». Lo no comprobado, «sin verificar». Nada de datos personales ni de fallos abiertos.
3. Bitácora (plantilla 7.4) si hubo trabajo largo; máximo 3 tareas manuales para Kristian, desde el móvil.
4. `/hoy` revisado: máximo 5 tareas; los OK pendientes arriba.
5. Lo desplegado = repo (comparación hecha) y PR abiertos o fusionados según su etiqueta.
6. Un mensaje final a Kristian de una línea: qué quedó verificado, qué necesita su OK y qué es lo siguiente.

## Anexo. Las tareas en CSV (para importar a `kimiko_tareas`)

Una fila por tarea. `deps` son claves separadas por espacios (conviértelas a ids al importar); `etiquetas` separadas por `+`. `prueba` y el texto de OK salen de la sección 5 de la hoja (5.2).

```csv
id,clave,fase,quien,deps,canal,minutos,ok_minutos,etiquetas,fecha,recurrente,opcional,modulo,titulo
F0-01,perfiles,0,C,,,0,1,db,2026-10-15,,,,Cerrar la escalada de privilegios en `profiles`
F0-02,grants,0,C,perfiles,,0,1,db,2026-10-16,,,,"Cerrar lecturas y permisos abiertos: terapeutas verificados, plantas en borrador, `chat_usage` y DML sobrante"
F0-03,seg_ci,0,C,grants,,0,1,db+delicado,2026-10-18,,,,"Prueba de permisos: función en la base, aviso diario y CI sobre Supabase local"
F0-04,desplegar_diario,0,C,,,0,1,prod,2026-10-16,,,,Desplegar `kimiko-diario` igual a `main`
F0-05,decisiones,0,C,,,0,0,,2026-10-16,,,,"Crear `DECISIONES.md` con decisiones fechadas, precedencia y escalera de autonomía"
F0-06,instrucciones_project,0,K,decisiones,panel,3,0,,2026-10-17,,,,Pegar las instrucciones completas en el Project de claude.ai (Anexo A)
F0-07,cola,0,C,grants,,0,1,db+prod,2026-10-18,,,,"Crear la cola única `kimiko_tareas`, el comando `/hoy` e importar esta hoja de ruta"
F0-08,freno,0,C,cola,,0,1,db+prod,2026-10-20,,,,Freno de gasto y parada de Kimiko
F0-09,runner_v2,0,C,cola,,0,0,,2026-10-20,,,,Ejecutor interactivo v2 con módulos y recibos
F0-10,pr_pendientes,0,C,,,0,3,db+delicado,2026-10-17,,,,"Resolver los PR #66, #67 y #68 (órdenes en ráfaga, migración del disparador y qué es «delicado» para el fusionador)"
F0-11,precio_anual,0,K,,panel,3,0,,2026-10-16,,,,Corregir el precio anual en Vercel (`STRIPE_PRO_ANNUAL_PRICE_ID`) y redesplegar
F0-12,responder_d,0,K,decisiones,movil,10,0,,2026-10-19,,,,Contestar D1 a D6 (o dejar que se apliquen los valores por defecto)
F0-13,humo_telegram,0,K,cola,movil,5,0,,2026-10-20,,,,Prueba de humo en Telegram: comandos y una nota de voz
F0-14,notion_banner,0,C,decisiones,,0,1,,2026-10-19,,,,Marcar como histórico lo que ordena autonomía total en Notion
F0-15,estado_pointer,0,C,cola decisiones perfiles grants,,0,1,regla,2026-10-19,,,,"Poner `ESTADO.md` al día (puntero a `/hoy`, numeración arreglada, línea base del 14-oct) y copiar la hoja de ruta a `kimiko/plan/` con un puntero en `CLAUDE.md`"
F1-01,permisos_kimiko,1,C,decisiones freno,,0,5,regla,2026-10-26,,,,Decidir los permisos de Kimiko antes del 27-oct
F1-02,captacion,1,C,grants,,0,2,db,2026-10-30,,,,"Captación con consentimiento, doble confirmación y protección contra abuso"
F1-03,fuentes,1,C,,,0,0,,2026-10-27,,,,"Tipografías propias con `next/font`, sin llamadas a Google"
F1-04,limpieza,1,C,decisiones,,0,1,prod,2026-10-29,,,,Limpiar duplicados de `app/` y el apodo «q-h.com»
F1-05,promesas_web,1,C,responder_d,,0,10,,2026-11-03,,,,Igualar las promesas de la web a lo que existe y retirar el código muerto
F1-06,gemini_limite,1,C,promesas_web,,0,0,,2026-11-05,,,,Gemini solo para contenido público de back-office
F1-07,correo_k,1,K,responder_d,panel,35,0,,2026-10-30,,,,"Crear el correo del dominio (Zoho gratis), dar de alta el dominio en Resend y copiar los registros que piden"
F1-08,correo_dns,1,C,correo_k,,0,2,dns,2026-11-02,,,,"Registros MX, SPF, DKIM y DMARC, y remitente real en Resend"
F1-09,alojamiento,1,K,responder_d,panel,10,0,pago,2026-11-06,,,,Contratar Vercel Pro (D1)
F1-10,gestor,1,K,responder_d,llamada,60,0,pago,2026-11-06,,,,Consulta con un gestor (preguntas del Anexo B)
F1-11,legal_textos,1,C,gestor fuentes captacion,,0,15,,2026-11-09,,,,Reescribir los textos legales y de precios con lo que diga el gestor
F1-12,pr59,1,C,precio_anual grants promesas_web,,0,2,pago,2026-11-06,,,,Fusionar el PR #59 (botón Pro y checkout seguro) justo antes del PR de checkout
F1-13,checkout,1,C,pr59 gestor,,0,3,pago,2026-11-09,,,,"Checkout endurecido: precios en lista blanca, prueba de 7 días y bandera `PRO_ABIERTO`"
F1-14,compra_prueba,1,K,checkout,movil,10,0,,2026-11-10,,,,Compra de prueba de punta a punta en modo prueba
F1-15,deps_next,1,C,limpieza,,0,5,prod,2026-11-08,,,,"Subir Next, React y next-intl para dejar `npm audit --omit=dev` limpio"
F1-16,posts_salud,1,C,decisiones,,0,2,db,2026-10-31,,,,Aplicar precauciones y aviso a los posts publicados y listar los que prometen curar
F1-17,posts_k,1,K,posts_salud,movil,25,0,,2026-11-04,,,,Revisar los posts con promesas (como herbolario)
F1-18,backups_c,1,C,grants,,0,1,delicado,2026-11-02,,,,Copia nocturna cifrada de la base: plantilla del workflow y módulo
F1-19,backups_k,1,K,backups_c runner_v2,mac,15,0,,2026-11-05,,,backups,"Crear el repositorio privado de copias, la clave y los secretos (módulo `backups`)"
F1-20,pro_definir,1,K,responder_d,movil,45,0,,2026-11-09,,,,Definir qué recibe un cliente Pro el primer mes (Ciclo 1)
F2-01,pro_ciclo1_borrador,2,M,pro_definir posts_salud,,0,0,,2026-11-16,,,,Borrador del Ciclo 1 de Quantum Pro
F2-02,pro_ciclo1_k,2,K,pro_ciclo1_borrador,movil,90,0,,2026-11-22,,,,Revisar y firmar el Ciclo 1 como herbolario y chef
F2-03,pro_miembros,2,C,pro_definir checkout correo_dns,,0,2,db,2026-11-20,,,,Área de miembros mínima para Pro
F2-04,stripe_vivo,2,K,alojamiento gestor legal_textos checkout compra_prueba correo_dns,mac,40,5,cred+pago,2026-11-17,,,stripe-vivo,Activar Stripe en vivo (módulo `stripe-vivo`)
F2-05,compra_real,2,K,stripe_vivo,movil,10,0,pago,2026-11-19,,,,Primera compra real propia y reembolso
F2-06,disponibilidad_k,2,K,pro_definir,movil,10,0,,2026-11-13,,,,Decir cuándo ofreces sesiones 1:1
F2-07,ventas_sesion,2,C,stripe_vivo disponibilidad_k,,0,2,pago,2026-11-23,,,,Reserva y cobro de la sesión 1:1
F2-08,entorno_10,2,K,ventas_sesion compra_real,movil,60,0,,2026-11-29,,,,Ofrecer sesión o lista de espera a 10 personas de tu entorno
F2-09,hito_primer_euro,2,K,entorno_10,,0,0,,2026-12-01,,,,Hito: primer pago real de un tercero
F2-10,metricas,2,C,cola freno,,0,2,db,2026-11-19,,,,Métricas diarias e informe semanal por Telegram
F2-11,bienvenida,2,C,captacion correo_dns legal_textos,,0,5,db+envio,2026-11-20,,,,"Bienvenida de 3 correos con doble confirmación, baja y entrega del regalo por enlace firmado"
F2-12,fichas_k,2,K,grants humo_telegram,movil,35,0,,2026-11-14,,,,Revisar y publicar las 5 fichas listas y elegir las láminas de árnica y equinácea
F2-13,fotos_tanda1_k,2,K,humo_telegram,movil,3,0,,2026-11-13,,,,Pedir a Kimiko la tanda 1 del lote 2 de fotos
F2-14,jwkug_k,2,K,,mac,5,0,,2026-11-26,,si,,Identificar la foto `JWkug.jpg`
F2-15,fotos_lote2,2,M,fotos_tanda1_k,,0,0,,2026-11-22,,,,Kimiko inserta las 36 fichas del lote 2 como borradores
F2-16,borradores_c,2,C,decisiones,,0,10,db,2026-11-25,,,,Archivar los borradores descartables del blog sin borrarlos y marcar los recuperables para reescribir
F2-17,datos_duplicados,2,C,borradores_c,,0,2,db,2026-11-28,,,,"Fusionar plantas duplicadas, corregir la categoría «Magicas» y fijar retención de copias"
F2-18,llaves_respaldo,2,K,runner_v2,mac,15,0,,2026-11-25,,,llaves-ia,"Llaves gratis de NVIDIA, Mistral y OpenRouter (módulo `llaves-ia`)"
F2-19,firecrawl_k,2,K,runner_v2,mac,5,0,,2026-11-26,,,firecrawl,Llave gratis de Firecrawl (módulo `firecrawl`)
F2-20,skills_zip,2,K,runner_v2,mac,10,0,,2026-11-24,,,skills-claude,Volver a subir tres skills a claude.ai (módulo `skills-claude`)
F2-21,fusionador_fiable,2,C,pr_pendientes,,0,3,delicado,2026-11-12,,,,Fusionador que espera el margen dentro de la misma ejecución
F3-01,ig_cuenta_k,3,K,responder_d,movil,25,0,,2026-12-04,,,,Confirmar la cuenta de Instagram y pasarla a profesional
F3-02,meta_app_k,3,K,ig_cuenta_k runner_v2,mac,35,0,,2026-12-08,,,meta,Crear la app de Meta y guardar el token (módulo `meta`)
F3-03,nucleo_regla,3,C,decisiones freno responder_d,,0,3,regla,2026-12-04,,,,PR del NÚCLEO: Kimiko puede publicar en redes solo tras tu ✅
F3-04,distribuir_fn,3,C,meta_app_k nucleo_regla metricas,,0,3,prod+regla,2026-12-14,,,,`kimiko-distribuir`: reel en Instagram tras tu ✅
F3-05,humo_dist_k,3,K,distribuir_fn,movil,10,0,,2026-12-16,,,,Publicar un reel real con ✅ y verlo en Instagram
F3-06,ultimo,3,C,decisiones grants,,0,0,,2026-12-08,,,,Página `/ultimo` que redirige al último post publicado
F3-07,bio_k,3,K,ultimo ig_cuenta_k,movil,3,0,,2026-12-09,,,,Poner `quantum-holistic.com/ultimo` en la bio de Instagram
F3-08,calendario,3,C,metricas cola,,0,2,db,2026-12-12,,,,Calendario editorial semanal con propuesta cada domingo
F3-09,fb_reels,3,C,distribuir_fn,,0,1,prod,2026-12-19,,,,Reels también en la Página de Facebook
F3-10,herramientas,3,C,freno,,0,2,db+delicado,2026-12-10,,,,"Registro de herramientas de Kimiko (riesgo, cuota, interruptor y prueba por herramienta)"
F3-11,investigar,3,C,firecrawl_k metricas herramientas,,0,3,prod,2026-12-18,,,,Investigación semanal de Kimiko con Firecrawl: informe de los lunes con 3 propuestas
F4-01,ritual_k,4,K,gestor legal_textos alojamiento,panel,25,0,,2027-01-05,,,,Arreglar el Ritual (19 €) en Gumroad
F4-02,ritual_web,4,C,ritual_k bienvenida,,0,1,,2027-01-07,,,,Enlazar el Ritual en la web y en la bienvenida
F4-03,seo,4,C,deps_next fuentes captacion,,0,0,,2026-12-30,,,,"SEO técnico: JSON-LD `Article`, mapa del sitio y enlaces internos"
F4-04,diseno_k,4,K,deps_next,movil,10,0,,2026-12-30,,,,"Elegir la dirección visual A, B o C de la web"
F4-05,diseno_web,4,C,diseno_k seo fuentes deps_next,,0,10,,2027-01-08,,,,Aplicar la dirección visual elegida a las páginas clave y arreglar los problemas del informe de diseño
F4-06,newsletter,4,C,bienvenida metricas calendario,,0,3,envio,2027-01-08,,,,"Newsletter semanal: Kimiko redacta, tú dices ✅, MailerLite envía"
F4-07,yt_k,4,K,humo_dist_k runner_v2,mac,35,0,,2027-01-08,,,youtube,YouTube: canal propio y proyecto de Google (módulo `youtube`)
F4-08,yt_adapter,4,C,yt_k distribuir_fn,,0,2,prod,2027-01-12,,,,Adaptador de YouTube Shorts en `kimiko-distribuir`
F4-09,entrevistas_k,4,K,compra_real bienvenida,llamada,45,0,,2027-01-12,,,,Tres conversaciones de 15 minutos con clientes o interesados
F4-10,libro_ingresos,4,C,stripe_vivo gestor,,0,2,db,2027-01-08,,,,Libro mensual de ingresos y costes con importación de Stripe y Gumroad
F4-11,alianzas_k,4,K,hito_primer_euro,movil,30,0,,2027-01-12,,,,"Hablar con 5 tiendas, herbolarios o cocineros de tu zona"
F5-01,prompts,5,C,cola herramientas,,0,2,db+delicado,2027-01-20,,,,Gestor de prompts versionados con casos de oro
F5-02,busqueda_semantica,5,C,herramientas prompts,,0,2,db,2027-01-27,,si,,Búsqueda semántica para el diccionario y el chat (opcional)
F5-03,n3_piloto,5,C,humo_dist_k metricas prompts herramientas,,0,3,regla,2027-01-27,,si,,Piloto de nivel N3 (opcional)
F5-04,restauracion_c,5,C,backups_k,,0,0,,2027-01-20,,,,Preparar la prueba de restauración de la copia
F5-05,restauracion_k,5,K,restauracion_c,mac,15,0,,2027-01-22,,,restaurar,Descifrar la copia con tu clave y restaurar en local (módulo `restaurar`)
F5-06,simulacro_incidente,5,C,freno prompts permisos_kimiko,,0,10,,2027-01-24,,,,"Simulacro de incidente: parada, vuelta atrás y rotación de una llave de prueba"
F5-07,inventario_secretos,5,C,herramientas,,0,1,db,2027-01-23,,,,Inventario de secretos con fecha y aviso 30 días antes
F5-08,informe_v1,5,C,stripe_vivo compra_real hito_primer_euro metricas bienvenida distribuir_fn newsletter libro_ingresos investigar prompts herramientas simulacro_incidente restauracion_k inventario_secretos seo diseno_web ritual_k entrevistas_k deps_next legal_textos posts_k fichas_k alojamiento correo_dns yt_adapter fb_reels,,0,20,,2027-01-31,,,,Informe de cierre de «Empresa v1» y decisión sobre la v2
F6-01,r_diario_m,6,M,desplegar_diario freno,,0,0,,,diaria,,,"Cada día: borrador del post a las 06:00 UTC, chequeo y reintentos"
F6-02,r_diario_k,6,K,humo_dist_k,movil,3,0,,,diaria,,,Cada día: revisar y pulsar ✅ Publicar o 🗑 (el reel y la distribución salen solos)
F6-03,r_semana_m,6,M,metricas calendario investigar borradores_c,,0,0,,,semanal,,,Cada semana: auditoría y calendario el domingo; métricas e investigación el lunes; un borrador antiguo reescrito
F6-04,r_semana_k,6,K,metricas investigar,movil,20,0,,,semanal,,,Cada semana: leer el informe del lunes y decidir las propuestas
F6-05,r_mes_k,6,K,libro_ingresos freno,movil,30,0,,,mensual,,,Cada mes: enviar el resumen al gestor y revisar cuotas y gasto
F6-06,r_mes_ciclo,6,K,pro_ciclo1_k pro_miembros,movil,45,0,,,mensual,,,Cada mes: revisar y firmar el Ciclo de Quantum Pro
F6-07,r_mes_c,6,C,restauracion_k prompts herramientas,,0,0,,,mensual,,,"Cada mes: restauración de prueba, Dependabot, revisión de prompts y de cuotas"
F6-08,r_trim,6,C,informe_v1 inventario_secretos,,0,60,,,trimestral,,,"Cada trimestre: revisión legal con el gestor, escalera de autonomía, llaves y definición de hecho"
```
