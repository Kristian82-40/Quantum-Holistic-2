-- Chequeo diario de Kimiko (B3): estado de sus crons sin abrir el esquema cron a la API.
-- Solo la puede llamar service_role (la llave secreta de las Edge Functions). Solo lectura.
create or replace function public.kimiko_estado_crons()
returns table (jobname text, active boolean, schedule text, ultimo_estado text, ultima_ejecucion timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select j.jobname::text, j.active, j.schedule::text, d.status::text, d.start_time
  from cron.job j
  left join lateral (
    select r.status, r.start_time from cron.job_run_details r
    where r.jobid = j.jobid order by r.start_time desc limit 1
  ) d on true
  where j.jobname like 'kimiko-%';
$$;

revoke all on function public.kimiko_estado_crons() from public, anon, authenticated;
grant execute on function public.kimiko_estado_crons() to service_role;
