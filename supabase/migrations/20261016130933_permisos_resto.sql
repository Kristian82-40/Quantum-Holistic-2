-- F0-02 (resto): lecturas públicas solo de lo publicado y sin escrituras directas de anon/authenticated.
-- Las escrituras de la web van por rutas del servidor (llave de servicio) o por funciones security definer.

-- 1) plants: el público solo lee las fichas publicadas y verificadas (los borradores, con la llave de servicio).
drop policy if exists plants_public_read on public.plants;
create policy plants_public_read on public.plants for select to anon, authenticated
  using (publicada and ficha_verificada);

-- 2) chat_usage: solo lectura; los contadores suben con increment_chat_usage(_anon), no con DML directo.
drop policy if exists "anon by session" on public.chat_usage;
drop policy if exists "users own usage" on public.chat_usage;
create policy "chat_usage leer anon" on public.chat_usage for select to anon using (user_id is null);
create policy "chat_usage leer propio" on public.chat_usage for select to authenticated using ((select auth.uid()) = user_id);

-- 3) Ninguna tabla acepta INSERT/UPDATE/DELETE/TRUNCATE de anon o authenticated...
revoke insert, update, delete, truncate, references, trigger on all tables in schema public from anon, authenticated;
-- ...salvo el dosha del propio perfil (lo puso F0-01 y la línea de arriba lo quita).
grant update (dosha, updated_at) on table public.profiles to authenticated;

-- 4) profiles para anon: solo las columnas del directorio de terapeutas, y solo filas de terapeutas verificados.
revoke select on table public.profiles from anon;
grant select (id, full_name, especialidades, bio, avatar_url, role, verified) on table public.profiles to anon;
drop policy if exists "Public read verified terapeutas" on public.profiles;
create policy "Public read verified terapeutas" on public.profiles for select to anon
  using (role = 'terapeuta' and verified = true);

-- 5) Las tablas nuevas nacen cerradas para anon y authenticated (cada migración concede lo que haga falta).
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;

-- Para deshacer: kimiko/recuperacion/deshacer-permisos-resto-2026-10-16.sql
