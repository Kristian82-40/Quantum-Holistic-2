-- Cola «para Claude» y aviso de órdenes que no terminan (13-oct-2026).
-- kimiko_drafts.status no tiene CHECK, así que los estados nuevos no piden cambiar el esquema:
--   para_claude     → Kimiko hizo lo que pudo y deja el resto a Claude (el detalle va en `copy`).
--   error_ejecucion → Kimiko Cloud falló o terminó sin cerrar la orden (lo marca el workflow, no Kimiko).
-- El trigger kimiko_drafts_avisar ya existía en la base pero no estaba en el repo; se deja aquí tal cual,
-- con los dos estados nuevos añadidos a la lista que avisa por Telegram (lo desplegado = lo del repo).
create or replace function public.kimiko_avisar_orden()
returns trigger
language plpgsql
security definer
set search_path to 'public'
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

-- Para deshacer: volver a crear la función con la lista ('hecho', 'bloqueado', 'pr_abierto').
