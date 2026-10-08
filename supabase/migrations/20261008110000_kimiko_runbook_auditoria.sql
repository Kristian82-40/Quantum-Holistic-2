-- B1: manual de tareas de Kimiko. Kimiko lo lee con código (activa / si_falla); Claude solo lo cambia por PR (esta carpeta).
create table if not exists public.kimiko_runbook (
  id text primary key,
  nombre text not null,
  cuando text not null,
  pasos jsonb not null default '[]'::jsonb,
  comprobacion text not null,
  si_falla text not null,
  activa boolean not null default true,
  actualizado_at timestamptz not null default now()
);
alter table public.kimiko_runbook enable row level security; -- sin políticas: solo service_role

insert into public.kimiko_runbook (id, nombre, cuando, pasos, comprobacion, si_falla) values
  ('chequeo-diario', 'Chequeo antes del post', 'cada día 06:00 UTC (cron kimiko-diario), antes del post',
   '["Comprobar que existen GEMINI_API_KEY, CF_ACCOUNT_ID, CF_AI_TOKEN, GROQ_API_KEY y Telegram, y que cada proveedor las acepta (listar modelos, sin gastar cupo)", "Sumar las neuronas de Workers AI gastadas hoy", "Pedir /, /blog, /diccionario, /terapeutas y /login de q-h.com", "Leer kimiko_estado_crons()"]',
   'Fila tipo=chequeo en kimiko_updates con ok=true',
   'Telegram a Kristian con cada fallo y su acción exacta. El post se intenta igualmente.'),
  ('post-diario', 'Borrador diario del blog + pieza de redes', 'cada día 06:00 UTC (cron kimiko-diario)',
   '["Elegir pilar y evitar temas recientes", "Pedir el texto: Gemini (3 intentos) → Workers AI → Groq", "Si fallan los tres: ficha de planta sin IA desde plants (nunca las 9 peligrosas, sin dosis)", "Filtro legal y una corrección si hay tiempo", "Imagen flux; si falla o no hay tiempo, ficha PNG", "Guardar en blog_posts como draft y en kimiko_content", "Enviar el borrador a Telegram con botones"]',
   'kimiko_content con fecha de hoy y slot 1; blog_posts con status=draft y published=false',
   'Telegram ❌ con el error; el cron kimiko-reintento lo vuelve a intentar.'),
  ('reintento', 'Reintento del post', '07:30, 09:30, 12:30 y 15:30 UTC (cron kimiko-reintento)',
   '["Solo si no hay kimiko_content de hoy", "Repetir post-diario sin chequeo"]',
   'kimiko_content con fecha de hoy',
   'Si a las 15:30 sigue sin post, lo dice el resumen de Telegram; mirar kimiko_updates.'),
  ('auditoria-semanal', 'Auditoría de integridad (SQL, sin IA)', 'domingos 08:00 UTC (cron kimiko-auditoria) o /auditar',
   '["Slugs duplicados en blog_posts", "Categorías fuera de la lista fija", "Posts publicados sin imagen o sin meta descripción (excerpt de 50 a 160 caracteres)", "Plantas publicadas sin ficha verificada", "Tablas públicas sin RLS"]',
   'Fila tipo=auditoria en kimiko_updates y resumen en Telegram',
   'Si la función SQL falla, Telegram ❌ con el error. No se corrige nada solo: los arreglos van por PR o los aprueba Kristian.')
on conflict (id) do nothing;

-- B4: auditoría semanal de integridad. Solo lectura, sin IA. Devuelve recuentos y hasta 10 ejemplos de cada problema.
create or replace function public.kimiko_auditoria()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with
  dup as (select slug from public.blog_posts group by slug having count(*) > 1),
  cat as (select distinct category from public.blog_posts
          where category is null or category not in ('Herbología', 'Nutrición', 'Ayurveda', 'Bienestar Holístico', 'Sabiduría')),
  sin_img as (select slug from public.blog_posts where status = 'published' and coalesce(image_url, '') = ''),
  sin_meta as (select slug from public.blog_posts where status = 'published' and (excerpt is null or length(excerpt) not between 50 and 160)),
  plantas as (select slug from public.plants where publicada and not coalesce(ficha_verificada, false)),
  sin_rls as (select c.relname::text as tabla from pg_class c join pg_namespace n on n.oid = c.relnamespace
              where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity)
  select jsonb_build_object(
    'slugs_duplicados', jsonb_build_object('n', (select count(*) from dup), 'ejemplos', coalesce((select jsonb_agg(slug) from (select slug from dup limit 10) x), '[]')),
    'categorias_no_normalizadas', jsonb_build_object('n', (select count(*) from public.blog_posts p where p.category is null or p.category in (select category from cat)), 'ejemplos', coalesce((select jsonb_agg(category) from cat), '[]')),
    'publicados_sin_imagen', jsonb_build_object('n', (select count(*) from sin_img), 'ejemplos', coalesce((select jsonb_agg(slug) from (select slug from sin_img limit 10) x), '[]')),
    'publicados_sin_meta', jsonb_build_object('n', (select count(*) from sin_meta), 'ejemplos', coalesce((select jsonb_agg(slug) from (select slug from sin_meta limit 10) x), '[]')),
    'plantas_publicadas_sin_verificar', jsonb_build_object('n', (select count(*) from plantas), 'ejemplos', coalesce((select jsonb_agg(slug) from (select slug from plantas limit 10) x), '[]')),
    'tablas_sin_rls', jsonb_build_object('n', (select count(*) from sin_rls), 'ejemplos', coalesce((select jsonb_agg(tabla) from sin_rls), '[]'))
  );
$$;
revoke all on function public.kimiko_auditoria() from public, anon, authenticated;
grant execute on function public.kimiko_auditoria() to service_role;

-- Cron de los domingos a las 08:00 UTC: la Edge Function corre la auditoría y manda el resumen a Telegram.
select cron.schedule('kimiko-auditoria', '0 8 * * 0', $cron$
  select net.http_post(
    url := 'https://vctetjugbvyllwjpxcxh.supabase.co/functions/v1/kimiko-diario',
    headers := jsonb_build_object('content-type', 'application/json',
      'x-kimiko-secreto', (select decrypted_secret from vault.decrypted_secrets where name = 'kimiko_cron_secreto')),
    body := '{"accion":"auditoria","origen":"cron"}'::jsonb,
    timeout_milliseconds := 10000);
$cron$);
