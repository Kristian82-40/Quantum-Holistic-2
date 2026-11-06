-- F0-03 (v2, más estricta tras la revisión de seguridad): prueba de permisos en la base. 0 filas = todo como debe; cada fila es un permiso distinto del esperado.
-- La llaman el chequeo diario de kimiko-diario (service_role) y la CI sobre Supabase local. Solo lectura.
create or replace function public.kimiko_prueba_permisos()
returns table (rol text, tabla text, columna text, esperado boolean, obtenido boolean)
language sql
stable
security invoker
set search_path = ''
as $$
with esperado(rol, tabla, columna, puede_update) as (
  values
    -- profiles: el usuario solo cambia su dosha (y la fecha de cambio)
    ('authenticated', 'profiles', 'dosha',              true),
    ('authenticated', 'profiles', 'updated_at',         true),
    ('authenticated', 'profiles', 'id',                 false),
    ('authenticated', 'profiles', 'email',              false),
    ('authenticated', 'profiles', 'role',               false),
    ('authenticated', 'profiles', 'plan',               false),
    ('authenticated', 'profiles', 'plan_expires_at',    false),
    ('authenticated', 'profiles', 'stripe_customer_id', false),
    ('authenticated', 'profiles', 'verified',           false)
)
select e.rol, e.tabla, e.columna, e.puede_update as esperado,
       has_column_privilege(e.rol, format('public.%I', e.tabla), e.columna, 'UPDATE') as real
from esperado e
where has_column_privilege(e.rol, format('public.%I', e.tabla), e.columna, 'UPDATE') <> e.puede_update
union all
-- anon no actualiza ninguna columna de profiles
select 'anon', 'profiles', a.attname::text, false, true
from pg_attribute a
where a.attrelid = 'public.profiles'::regclass and a.attnum > 0 and not a.attisdropped
  and has_column_privilege('anon', 'public.profiles'::regclass, a.attnum, 'UPDATE')
union all
-- anon y authenticated no insertan, borran ni vacían profiles (las altas las hace handle_new_user)
select r.rol, 'profiles', '(' || lower(r.priv) || ')', false, true
from (values ('anon'), ('authenticated')) a(rol)
cross join lateral (values (a.rol, 'INSERT'), (a.rol, 'DELETE'), (a.rol, 'TRUNCATE')) r(rol, priv)
where has_table_privilege(r.rol, 'public.profiles', r.priv)
union all
-- F0-02: anon y authenticated no insertan, cambian, borran ni vacían ninguna tabla (el dosha va por columna, arriba)
-- (con has_table_privilege: el catálogo de information_schema solo enseña los permisos del rol que pregunta)
select r.rol, c.relname::text, '(' || lower(pr.priv) || ')', false, true
from pg_class c join pg_namespace n on n.oid = c.relnamespace
cross join (values ('anon'), ('authenticated')) r(rol)
cross join (values ('INSERT'), ('UPDATE'), ('DELETE'), ('TRUNCATE')) pr(priv)
where n.nspname = 'public' and c.relkind in ('r', 'p') and has_table_privilege(r.rol, c.oid, pr.priv)
union all
-- anon solo lee de profiles las columnas del directorio de terapeutas
select 'anon', 'profiles', a.attname::text || ' (select)', false, true
from pg_attribute a
where a.attrelid = 'public.profiles'::regclass and a.attnum > 0 and not a.attisdropped
  and a.attname not in ('id', 'full_name', 'especialidades', 'bio', 'avatar_url', 'role', 'verified')
  and has_column_privilege('anon', 'public.profiles'::regclass, a.attnum, 'SELECT')
union all
-- plants y chat_usage: solo las políticas de lectura esperadas, con su condición exacta (cualquier otra es un fallo)
select 'politica', c.relname::text, p.polname::text || ' ' || p.polcmd::text || ' ' || coalesce(pg_get_expr(p.polqual, p.polrelid), ''), false, true
from pg_policy p join pg_class c on c.oid = p.polrelid join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('plants', 'chat_usage')
  and (c.relname, p.polname::text, p.polcmd::text, coalesce(pg_get_expr(p.polqual, p.polrelid), '')) not in (
    ('plants', 'plants_public_read', 'r', '(publicada AND ficha_verificada)'),
    ('chat_usage', 'chat_usage leer anon', 'r', '(user_id IS NULL)'),
    ('chat_usage', 'chat_usage leer propio', 'r', '(( SELECT auth.uid() AS uid) = user_id)'))
union all
-- toda tabla de public tiene la RLS activada (sin ella, el SELECT de anon lo enseña todo)
select 'rls', c.relname::text, '(rls desactivada)', true, false
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity
union all
-- ni anon ni authenticated insertan o cambian columnas sueltas, salvo el dosha propio
select r.rol, c.relname::text, a.attname::text || ' (' || lower(pr.priv) || ')', false, true
from pg_class c join pg_namespace n on n.oid = c.relnamespace
join pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
cross join (values ('anon'), ('authenticated')) r(rol)
cross join (values ('INSERT'), ('UPDATE')) pr(priv)
where n.nspname = 'public' and c.relkind in ('r', 'p')
  and has_column_privilege(r.rol, c.oid, a.attnum, pr.priv) and not has_table_privilege(r.rol, c.oid, pr.priv)
  and not (r.rol = 'authenticated' and c.relname = 'profiles' and pr.priv = 'UPDATE' and a.attname in ('dosha', 'updated_at'))
union all
-- las tablas nuevas nacen cerradas para anon y authenticated
select 'default', 'tablas nuevas', d.defaclacl::text, false, true
from pg_default_acl d join pg_namespace n on n.oid = d.defaclnamespace
where n.nspname = 'public' and d.defaclobjtype = 'r' and pg_get_userbyid(d.defaclrole) = 'postgres'
  and (d.defaclacl::text like '%anon=%' or d.defaclacl::text like '%authenticated=%')
$$;

revoke all on function public.kimiko_prueba_permisos() from public, anon, authenticated;
grant execute on function public.kimiko_prueba_permisos() to service_role;
