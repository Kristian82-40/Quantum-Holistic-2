-- Deshace 20261016150000_permisos_resto (vuelve al estado del 16-oct antes de aplicarla).
drop policy if exists plants_public_read on public.plants;
create policy plants_public_read on public.plants for select using (true);
drop policy if exists "chat_usage leer anon" on public.chat_usage;
drop policy if exists "chat_usage leer propio" on public.chat_usage;
create policy "anon by session" on public.chat_usage for all using (user_id is null);
create policy "users own usage" on public.chat_usage for all using (user_id = auth.uid());
grant insert, update, delete, truncate, references, trigger on all tables in schema public to anon, authenticated;
revoke insert, delete, truncate, references, trigger on table public.profiles from anon, authenticated;
revoke update on table public.profiles from anon, authenticated;
grant update (dosha, updated_at) on table public.profiles to authenticated;
grant select on table public.profiles to anon;
drop policy if exists "Public read verified terapeutas" on public.profiles;
create policy "Public read verified terapeutas" on public.profiles for select using (role = 'terapeuta' and verified = true);
alter default privileges for role postgres in schema public grant all on tables to anon, authenticated;
