-- Manual de Kimiko: tarea «publicar» (botones ✅ Publicar / 🗑 Retirar de Telegram, 9-oct-2026).
insert into public.kimiko_runbook (id, nombre, cuando, pasos, comprobacion, si_falla, activa) values (
  'publicar',
  'Publicar o retirar una pieza (post o ficha)',
  'cuando Kristian pulsa ✅ Publicar o 🗑 Retirar en Telegram (worker kimiko; /pieza <slug> pide los botones)',
  '["Leer la pieza: blog_posts (uuid) o plants (id)",
    "Si es una de las 9 plantas peligrosas: no publicar y responder el motivo",
    "Controles de qh-editorial: sin promesas de curar, sin dosis (las cantidades de recetas no cuentan), sección Precauciones y contraindicaciones, aviso «consulta con un profesional» (en fichas lo pinta la página), contraindicaciones en fichas, slug único",
    "Si algo falla: no tocar nada y mandar a Telegram la lista de motivos y qué hacer",
    "Publicar: blog_posts.published = true y status = published; en plants, publicada = true y ficha_verificada = true",
    "Comprobar que quantum-holistic.com/blog/<slug>/ o /diccionario/<slug>/ da 200 y contiene el título (3 intentos). La web lee Supabase al vuelo: sin revalidar ni redeploy",
    "Si la URL falla: volver a borrador y avisar con la acción exacta",
    "Si sale bien: «✅ Publicado» con el enlace y el botón 🗑 Retirar",
    "Retirar: published = false y status = draft (plants: publicada = false), comprobar que la URL da 404 y dejar el botón ✅ Publicar",
    "Registrar cada publicación y retirada en kimiko_updates (tipo publicacion / retirada)"]'::jsonb,
  'select created_at, tipo, ok, detalle->>''resultado'', detalle->>''url'' from kimiko_updates where tipo in (''publicacion'',''retirada'') order by created_at desc limit 5;',
  'Kimiko solo cambia el campo de publicación: nunca borra, nunca toca main, nunca crea llaves. Si la web no responde, la pieza queda en borrador y Kristian recibe el enlace a Vercel.',
  true
) on conflict (id) do update set nombre = excluded.nombre, cuando = excluded.cuando, pasos = excluded.pasos,
  comprobacion = excluded.comprobacion, si_falla = excluded.si_falla, actualizado_at = now();
