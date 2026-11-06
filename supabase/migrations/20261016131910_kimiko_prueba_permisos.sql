-- F0-03: prueba de permisos en la base. 0 filas = todo como debe; cada fila es un permiso distinto del esperado.
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
select 'anon', 'profiles', c.column_name, false, true
from information_schema.columns c
where c.table_schema = 'public' and c.table_name = 'profiles'
  and has_column_privilege('anon', 'public.profiles', c.column_name, 'UPDATE')
union all
-- anon y authenticated no insertan, borran ni vacían profiles (las altas las hace handle_new_user)
select r.rol, 'profiles', '(' || lower(r.priv) || ')', false, true
from (values ('anon'), ('authenticated')) a(rol)
cross join lateral (values (a.rol, 'INSERT'), (a.rol, 'DELETE'), (a.rol, 'TRUNCATE')) r(rol, priv)
where has_table_privilege(r.rol, 'public.profiles', r.priv)
union all
-- F0-02: anon y authenticated no insertan, cambian, borran ni vacían ninguna tabla (el dosha va por columna, arriba)
select g.grantee, g.table_name, '(' || lower(g.privilege_type) || ')', false, true
from information_schema.role_table_grants g
where g.table_schema = 'public' and g.grantee in ('anon', 'authenticated')
  and g.privilege_type in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')
union all
-- anon solo lee de profiles las columnas del directorio de terapeutas
select 'anon', 'profiles', c.column_name || ' (select)', false, true
from information_schema.columns c
where c.table_schema = 'public' and c.table_name = 'profiles'
  and c.column_name not in ('id', 'full_name', 'especialidades', 'bio', 'avatar_url', 'role', 'verified')
  and has_column_privilege('anon', 'public.profiles', c.column_name, 'SELECT')
union all
-- plants: el público solo ve fichas publicadas y verificadas; chat_usage sin políticas de escritura
select 'public', c.relname, p.polname, false, true
from pg_policy p join pg_class c on c.oid = p.polrelid
where (c.relname = 'plants' and p.polcmd = 'r' and pg_get_expr(p.polqual, p.polrelid) not like '%publicada%ficha_verificada%')
   or (c.relname in ('plants', 'chat_usage') and p.polcmd <> 'r')
union all
-- las tablas nuevas nacen cerradas para anon y authenticated
select 'default', 'tablas nuevas', d.defaclacl::text, false, true
from pg_default_acl d join pg_namespace n on n.oid = d.defaclnamespace
where n.nspname = 'public' and d.defaclobjtype = 'r' and pg_get_userbyid(d.defaclrole) = 'postgres'
  and (d.defaclacl::text like '%anon=%' or d.defaclacl::text like '%authenticated=%')
$$;

revoke all on function public.kimiko_prueba_permisos() from public, anon, authenticated;
grant execute on function public.kimiko_prueba_permisos() to service_role;
