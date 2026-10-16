-- Prueba de permisos (solo lectura: no cambia nada). La matriz esperada vive en la función
-- public.kimiko_prueba_permisos() (migración 20261016131910). 0 filas = todo como debe.
-- Uso: editor SQL de Supabase, execute_sql o la CI (job «permisos» de vigilancia.yml, sobre Supabase local).
select * from public.kimiko_prueba_permisos();
