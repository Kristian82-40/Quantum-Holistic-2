-- F0-07: cola de tareas de la hoja de ruta (Code, Kristian y Kimiko). La leen /hoy (Telegram) y kimiko/tareas/run.sh.
-- Estados y etiquetas: DECISIONES.md, «Estados de una tarea y qué necesita OK». Sin políticas: solo service_role.
create table if not exists public.kimiko_tareas (
  id text primary key,                                   -- F0-07, F1-09, P1…
  titulo text not null,
  descripcion text,
  monton text check (monton in ('A', 'B', 'C')),         -- A antes del corte · B sin Code · C puede esperar
  responsable text not null check (responsable in ('code', 'kristian', 'kimiko')),
  estado text not null default 'pendiente' check (estado in
    ('pendiente', 'en_curso', 'esperando_ok', 'esperando_prueba', 'verificada', 'bloqueado', 'descartado', 'propuesta')),
  etiquetas text[] not null default '{}' check (etiquetas <@ array['db', 'pago', 'dns', 'regla', 'envio', 'prod', 'cred', 'delicado']),
  canal text check (canal in ('movil', 'panel_web', 'mac', 'llamada')),
  minutos int check (minutos between 1 and 30),          -- bloques de Kristian: 30 min como máximo
  url text check (url is null or url ~ '^https://'),      -- página donde se hace la tarea
  pasos jsonb not null default '[]'::jsonb check (jsonb_typeof(pasos) = 'array'),
  prueba text,                                           -- cómo se comprueba que quedó bien
  fecha_limite date,
  orden int,
  depende_de text[] not null default '{}',
  evidencia jsonb not null default '[]'::jsonb check (jsonb_typeof(evidencia) = 'array'), -- recibos sin secretos
  motivo text,                                           -- obligatorio si está bloqueada
  creado_at timestamptz not null default now(),
  actualizado_at timestamptz not null default now(),
  verificada_at timestamptz,
  constraint kimiko_tareas_bloqueo_con_motivo check (estado <> 'bloqueado' or coalesce(motivo, '') <> '')
);
alter table public.kimiko_tareas enable row level security; -- sin políticas: solo service_role

create index if not exists kimiko_tareas_cola on public.kimiko_tareas (responsable, estado, fecha_limite, orden);

create or replace function public.kimiko_tareas_tocar()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_at := now();
  if new.estado = 'verificada' and old.estado is distinct from 'verificada' then new.verificada_at := now(); end if;
  return new;
end $$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'kimiko_tareas_tocar' and tgrelid = 'public.kimiko_tareas'::regclass) then
    create trigger kimiko_tareas_tocar before update on public.kimiko_tareas
      for each row execute function public.kimiko_tareas_tocar();
  end if;
end $$;

-- Para deshacer: alter table public.kimiko_tareas rename to kimiko_tareas_archivo (no se borra).
