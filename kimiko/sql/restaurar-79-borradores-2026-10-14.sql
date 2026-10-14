-- Deshace kimiko/sql/archivar-79-borradores-2026-10-14.sql: devuelve cada post a su estado guardado.
begin;
update public.blog_posts b set status = a.status, published = a.published, updated_at = a.updated_at
from public.blog_posts_archivo_20261014 a
where b.id = a.id and b.status = 'rejected';
commit;
-- Comprobación: select count(*) from blog_posts where status='draft';  → 80 (si nadie publicó nada entretanto)
-- Cuando ya no haga falta: drop table public.blog_posts_archivo_20261014;
