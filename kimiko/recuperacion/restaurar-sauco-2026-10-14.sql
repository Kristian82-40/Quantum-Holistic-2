-- Deshace la corrección del borrador del saúco del 14-oct-2026 (Claude Code, a petición de Kristian).
-- Cambios: quitada la «compresa sobre los párpados» y añadido «no debe aplicarse en los ojos»; enlace a la manzanilla
-- sin llamarla «hidrolato»; línea «Ojos» en Precauciones; lámina nueva sauco-cientifica-1014a.jpg (flux, sin texto).
-- La copia está en public.blog_posts_sauco_backup_20261014 (RLS activado, solo service_role).
update public.blog_posts b set content = s.content, image_url = s.image_url, updated_at = s.updated_at
from public.blog_posts_sauco_backup_20261014 s
where b.id = s.id;
-- Cuando ya no haga falta: drop table public.blog_posts_sauco_backup_20261014;
