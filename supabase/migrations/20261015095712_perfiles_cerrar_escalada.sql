-- Permisos de profiles por columna: el usuario solo puede actualizar dosha y updated_at de su fila.
revoke update on table public.profiles from anon, authenticated;
grant update (dosha, updated_at) on table public.profiles to authenticated;
