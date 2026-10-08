-- Láminas nuevas (Workers AI flux-1-schnell vía kimiko-imagen, tipo "cientifica") para las 5 fichas SIN publicar.
-- APLICADO el 8-oct-2026 ~17:45 por Claude (chat), con el sí de Kristian ("5 sí"). Las fichas siguen publicada=false.
-- Revisión a ojo de Claude: lavanda, jengibre, tomillo y salvia correctos; valeriana aceptable (inflorescencia algo compacta).
-- Ninguna lleva texto inventado salvo marcas mínimas del modelo (no legibles). Kristian las revisa antes de publicar.
begin;
create table if not exists public.plants_imagen_backup_20261008 as
  select id, slug, image_cientifica_url from public.plants where slug in ('valeriana','jengibre','lavanda','tomillo','salvia');
alter table public.plants_imagen_backup_20261008 enable row level security;
update public.plants p set image_cientifica_url = v.url, updated_at = now()
from (values
 ('valeriana','https://vctetjugbvyllwjpxcxh.supabase.co/storage/v1/object/public/kimiko/plantas/valeriana-cientifica-muzpau4x.jpg'),
 ('jengibre','https://vctetjugbvyllwjpxcxh.supabase.co/storage/v1/object/public/kimiko/plantas/jengibre-cientifica-muzpau52.jpg'),
 ('lavanda','https://vctetjugbvyllwjpxcxh.supabase.co/storage/v1/object/public/kimiko/plantas/lavanda-cientifica-muzp8w1b.jpg'),
 ('tomillo','https://vctetjugbvyllwjpxcxh.supabase.co/storage/v1/object/public/kimiko/plantas/tomillo-cientifica-muzpau4x.jpg'),
 ('salvia','https://vctetjugbvyllwjpxcxh.supabase.co/storage/v1/object/public/kimiko/plantas/salvia-cientifica-muzpau56.jpg')) v(slug,url)
where p.slug = v.slug;
commit;
-- Deshacer:
-- update public.plants p set image_cientifica_url = b.image_cientifica_url from public.plants_imagen_backup_20261008 b where b.id = p.id;
