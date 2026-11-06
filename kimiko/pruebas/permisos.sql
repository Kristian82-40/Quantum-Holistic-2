-- Prueba de permisos (solo lectura: no cambia nada). La matriz esperada vive en la función
-- public.kimiko_prueba_permisos() (migraciones 20261016131910 y 20261016155901, v2). 0 filas = todo como debe.
-- Uso: editor SQL de Supabase, execute_sql o la CI (job «permisos» de vigilancia.yml, sobre Supabase local).
select * from public.kimiko_prueba_permisos();
