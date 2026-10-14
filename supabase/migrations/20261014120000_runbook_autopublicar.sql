-- Tarea 'autopublicar' en el manual de Kimiko, APAGADA (activa = false). Encenderla es decisión de Kristian:
--   update kimiko_runbook set activa = true where id = 'autopublicar';
insert into public.kimiko_runbook (id, nombre, cuando, pasos, comprobacion, si_falla, activa)
values (
  'autopublicar',
  'Publicación automática del post diario',
  'justo después del post diario (06:00 UTC), solo si esta tarea está activa',
  '["Pasa los controles de qh-editorial (revisarPost) y además: sin avisos del filtro legal, acuarela flux y sin aviso de imagen", "Publica y comprueba la URL pública (200 + título)", "Si algo falla, el post queda en borrador y llega un aviso 🟡 por Telegram con el motivo"]'::jsonb,
  'kimiko_updates tipo=publicacion con detalle.origen=auto o resultado publicada; blog_posts.status',
  'Queda en borrador: revisarlo con /pieza <slug> y pulsar ✅ Publicar. Para apagarla: activa=false',
  false
)
on conflict (id) do nothing;
