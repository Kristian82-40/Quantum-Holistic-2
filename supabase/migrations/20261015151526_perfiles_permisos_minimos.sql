-- profiles: anon y authenticated solo leen (las políticas RLS deciden qué filas) y el usuario solo actualiza dosha y updated_at de su fila.
-- Las altas las hace el disparador handle_new_user (security definer) y los cambios de plan, la llave de servicio.
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to anon, authenticated;
grant update (dosha, updated_at) on table public.profiles to authenticated;
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
-- Para deshacer: grant insert, delete, truncate, references, trigger on public.profiles to anon, authenticated;
-- y volver a crear la política sin "to authenticated" ni "with check".
