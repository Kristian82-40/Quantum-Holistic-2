-- Reels diarios (9-oct-2026): GitHub Actions (kimiko-reel) monta un MP4 9:16 con la pieza del día,
-- lo sube a Storage (kimiko/reels/…) y kimiko-diario lo manda a Telegram una sola vez.
alter table public.kimiko_content add column if not exists reel_url text;
alter table public.kimiko_content add column if not exists reel_enviado_at timestamptz;

-- El orden de motores cambió: Groq primero (rápido), Gemini con un solo intento, luego Workers AI.
update public.kimiko_runbook
   set pasos = replace(pasos::text, 'Gemini (3 intentos) → Workers AI → Groq', 'Groq → Gemini (1 intento) → Workers AI')::jsonb,
       actualizado_at = now()
 where id = 'post-diario';

insert into public.kimiko_runbook (id, nombre, cuando, pasos, comprobacion, si_falla) values
  ('reel-diario', 'Reel del día (vídeo 9:16)', '06:15, 07:45, 09:45, 12:45 y 15:45 UTC (GitHub Actions kimiko-reel), solo si aún no hay reel',
   '["Leer la pieza de hoy en kimiko_content (no descartada) y su post", "Montar 16 s con la imagen del post y 4 rótulos (planta, idea, precaución, enlace) + aviso legal fijo", "Subir el MP4 a Storage kimiko/reels/<proyecto>/<fecha>.mp4 y guardar reel_url", "kimiko-diario accion=enviar-reel: Telegram con el vídeo y el texto listo para Instagram/TikTok"]',
   'kimiko_content de hoy con reel_url y reel_enviado_at; fila tipo=reel en kimiko_updates',
   'El siguiente pase del día lo vuelve a intentar. Si falla el job de Actions, el aviso llega por Telegram (avisar-ci).')
on conflict (id) do update set nombre = excluded.nombre, cuando = excluded.cuando, pasos = excluded.pasos,
  comprobacion = excluded.comprobacion, si_falla = excluded.si_falla, actualizado_at = now();
