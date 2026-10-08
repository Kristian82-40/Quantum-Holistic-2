-- Normalizar las categorías antiguas de blog_posts a la lista fija de Kimiko
-- (CATEGORIAS en supabase/functions/_kimiko/lib/blog.js):
--   Herbología · Nutrición · Ayurveda · Bienestar Holístico · Sabiduría
--
-- ESTADO: preparado el 8-oct-2026, SIN EJECUTAR. Espera el sí de Kristian.
-- Decisión pendiente: "detox" (6 posts, ninguno publicado) → aquí va a Nutrición.
-- La web solo muestra la categoría como etiqueta: no hay filtros ni rutas que se rompan.

begin;

-- 1. Copia para poder deshacer
create table if not exists public.blog_posts_categoria_backup_20261008 as
  select id, category from public.blog_posts;
alter table public.blog_posts_categoria_backup_20261008 enable row level security;

-- 2. Normalizar
update public.blog_posts set category = case lower(category)
    when 'sabiduría'  then 'Sabiduría'
    when 'sabiduria'  then 'Sabiduría'
    when 'nutrición'  then 'Nutrición'
    when 'nutricion'  then 'Nutrición'
    when 'herbología' then 'Herbología'
    when 'herbologia' then 'Herbología'
    when 'ayurveda'   then 'Ayurveda'
    when 'bienestar'  then 'Bienestar Holístico'
    when 'bienestar holístico' then 'Bienestar Holístico'
    when 'detox'      then 'Nutrición'
    else category end
where category not in ('Herbología', 'Nutrición', 'Ayurveda', 'Bienestar Holístico', 'Sabiduría');

-- 3. Comprobación: debe devolver 0 filas
select category, count(*) from public.blog_posts
where category not in ('Herbología', 'Nutrición', 'Ayurveda', 'Bienestar Holístico', 'Sabiduría')
group by 1;

commit;

-- Deshacer:
-- update public.blog_posts b set category = k.category
--   from public.blog_posts_categoria_backup_20261008 k where k.id = b.id;
