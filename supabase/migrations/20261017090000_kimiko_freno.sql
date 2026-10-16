-- F0-08: freno de Kimiko. kimiko_autonomia (una sola fila) dice si lo automático está en pausa; /pausa y /reanudar la cambian.
-- kimiko_gasto_limites: cuota gratuita de cada servicio; el chequeo de las 06:00 avisa al llegar a aviso_pct.
-- Sin políticas: solo service_role (la Edge Function y el worker).
create table if not exists public.kimiko_autonomia (
  id int primary key default 1 check (id = 1),          -- una sola fila
  nivel text not null default 'N2' check (nivel in ('N0', 'N1', 'N2', 'N3', 'N4')), -- escalera de DECISIONES.md
  pausado boolean not null default false,
  motivo text,
  actualizado_at timestamptz not null default now()
);
alter table public.kimiko_autonomia enable row level security;
insert into public.kimiko_autonomia (id) values (1) on conflict (id) do nothing;

create table if not exists public.kimiko_gasto_limites (
  servicio text primary key,                             -- workers_ai, gemini, groq…
  cuota numeric not null check (cuota > 0),
  unidad text not null,                                  -- p. ej. «neuronas/día»
  aviso_pct int not null default 80 check (aviso_pct between 1 and 100),
  tope_mensual_eur numeric not null default 0 check (tope_mensual_eur >= 0), -- 0 €: regla 4 de CLAUDE.md
  uso numeric,                                           -- último uso medido a mano; workers_ai se mide solo (kimiko_updates)
  accion text not null,                                  -- qué hacer al llegar al aviso, para el móvil
  actualizado_at timestamptz not null default now()
);
alter table public.kimiko_gasto_limites enable row level security;
insert into public.kimiko_gasto_limites (servicio, cuota, unidad, accion) values
  ('workers_ai', 10000, 'neuronas/día', 'Nada que hacer: el cupo vuelve a las 00:00 UTC. Hoy tiran Gemini y Groq.')
on conflict (servicio) do nothing;

revoke all on public.kimiko_autonomia, public.kimiko_gasto_limites from anon, authenticated;
grant select, insert, update on public.kimiko_autonomia, public.kimiko_gasto_limites to service_role;

-- Para deshacer: alter table … rename to …_archivo (no se borra). Sin la tabla, kimiko-diario se considera en pausa.
