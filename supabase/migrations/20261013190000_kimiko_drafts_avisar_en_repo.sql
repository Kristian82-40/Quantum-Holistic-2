-- El disparador kimiko_drafts_avisar existe en la base pero no estaba en ninguna migración (13-oct-2026):
-- una base reconstruida desde el repo no avisaría por Telegram al cerrarse una orden. Se deja aquí tal cual está.
-- De paso, kimiko_avisar_orden pasa a `search_path = ''` (norma de qh-cambio-seguro para las `security definer`);
-- el cuerpo no cambia: ya nombraba `net.http_post` y `vault.decrypted_secrets` con su esquema.
create or replace function public.kimiko_avisar_orden()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if new.status in ('hecho', 'bloqueado', 'pr_abierto', 'para_claude', 'error_ejecucion')
     and new.status is distinct from old.status then
    perform net.http_post(
      url := 'https://vctetjugbvyllwjpxcxh.supabase.co/functions/v1/kimiko-diario',
      headers := jsonb_build_object('content-type', 'application/json',
        'x-kimiko-secreto', (select decrypted_secret from vault.decrypted_secrets where name = 'kimiko_cron_secreto')),
      body := jsonb_build_object('accion', 'avisar-orden', 'id', new.id),
      timeout_milliseconds := 10000);
  end if;
  return new;
end $function$;

do $$
begin
  if not exists (select 1 from pg_trigger
                 where tgname = 'kimiko_drafts_avisar' and tgrelid = 'public.kimiko_drafts'::regclass) then
    create trigger kimiko_drafts_avisar after update of status on public.kimiko_drafts
      for each row execute function public.kimiko_avisar_orden();
  end if;
end $$;

-- Para deshacer: volver a crear la función con `set search_path to 'public'` (el disparador no se toca).
