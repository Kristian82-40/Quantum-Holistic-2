-- Avisos de seguridad de Supabase (get_advisors, 8-oct-2026). Sin cambiar lo que ve o hace la web.

-- 1. Vista kimiko_contenido (ERROR security_definer_view): pasa a respetar el RLS de quien consulta.
--    Mismo resultado hoy: plants tiene lectura pública y blog_posts solo publicados, igual que el filtro de la vista.
alter view public.kimiko_contenido set (security_invoker = true);
revoke insert, update, delete, truncate, references, trigger on public.kimiko_contenido from anon, authenticated;

-- 2. handle_new_user es el disparador de alta en auth.users: nadie tiene que llamarla por la API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- 3. Contador del chat con sesión: solo usuarios con sesión y solo su propio contador
--    (antes cualquiera podía gastar el cupo gratis de otro usuario pasando su id).
create or replace function public.increment_chat_usage(p_user_id uuid, p_date date)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_user_id is distinct from auth.uid() then
    raise exception 'solo puedes contar tu propio uso' using errcode = '42501';
  end if;
  insert into public.chat_usage (user_id, date, count)
  values (p_user_id, p_date, 1)
  on conflict (user_id, date)
  do update set count = public.chat_usage.count + 1;
end;
$$;
revoke execute on function public.increment_chat_usage(uuid, date) from public, anon;
grant execute on function public.increment_chat_usage(uuid, date) to authenticated, service_role;

-- 4. Contador de visitantes sin sesión: tiene que seguir abierto a anon (lo usa /api/chat/usage). Solo se fija el search_path.
create or replace function public.increment_chat_usage_anon(p_session_id text, p_date date)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.chat_usage (session_id, date, count)
  values (p_session_id, p_date, 1)
  on conflict (session_id, date)
  do update set count = public.chat_usage.count + 1;
end;
$$;

-- 5. set_updated_at (WARN search_path mutable).
alter function public.set_updated_at() set search_path = '';
