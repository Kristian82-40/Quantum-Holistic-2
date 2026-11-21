-- Copia de seguridad de los posts publicados cuyo contenido sigue en markdown (21-nov-2026).
-- Motivo: la web pinta `content` como HTML y en estos posts se ven "##" y "**" (auditoría SEO,
-- kimiko/informes/seo-blog-2026-11-21.md). Se copian las filas enteras ANTES de convertir nada.
-- Ejecutado por Claude Code con el sí de Kristian (21-nov). Aún no se ha arreglado ningún post.

create table public.blog_posts_markdown_backup_20261121 as
  select b.*, now() as copiado_at
  from public.blog_posts b
  where b.status = 'published' and b.content ~ '(^|\n)#{2,3} ';

-- Sin acceso público: RLS sin políticas y sin permisos para anon/authenticated.
alter table public.blog_posts_markdown_backup_20261121 enable row level security;
revoke all on public.blog_posts_markdown_backup_20261121 from anon, authenticated;

-- Deshacer la conversión de un post (o de todos, quitando el filtro por id):
-- update public.blog_posts b set content = k.content, updated_at = k.updated_at
--   from public.blog_posts_markdown_backup_20261121 k
--   where k.id = b.id and b.id = '<id>';
