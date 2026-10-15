-- Prueba de permisos por columna (solo lectura: no cambia nada).
-- Devuelve 0 filas si todo está como debe; cada fila es un permiso distinto del esperado.
-- Uso: pegar en el editor SQL de Supabase o ejecutar con execute_sql.
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
  and has_column_privilege('anon', 'public.profiles', c.column_name, 'UPDATE');
