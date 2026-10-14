-- Archivar los 79 borradores antiguos del blog (14-abr → 10-jul-2026). PREPARADO, SIN EJECUTAR: lo decide Kristian.
-- Reversible: guarda id/status/published/updated_at en una copia y pasa los posts a 'rejected'
-- (el CHECK de blog_posts solo admite draft/published/rejected). No borra nada ni toca el contenido.
-- Deshacer: kimiko/sql/restaurar-79-borradores-2026-10-14.sql
begin;

create table if not exists public.blog_posts_archivo_20261014 as
  select id, status, published, updated_at from public.blog_posts
  where status = 'draft' and created_at < '2026-08-01';
alter table public.blog_posts_archivo_20261014 enable row level security; -- solo service_role

do $$
declare n int;
begin
  select count(*) into n from public.blog_posts_archivo_20261014;
  if n <> 79 then raise exception 'Esperaba 79 borradores y hay %: no archivo nada', n; end if;
end $$;

update public.blog_posts b set status = 'rejected', updated_at = now()
from public.blog_posts_archivo_20261014 a
where b.id = a.id and b.status = 'draft';

commit;
-- Comprobación: select count(*) from blog_posts where status='draft';  → 1 (el saúco)
