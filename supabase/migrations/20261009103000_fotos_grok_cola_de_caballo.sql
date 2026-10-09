-- Fotos de Grok (9-oct-2026). Cada archivo se llama «ID N – Nombre (Latín).jpg».
-- El N de Grok NO es el id de plants (en plants el 10 es la salvia): se guarda aparte en grok_id
-- para no pisar nada. El emparejamiento se hace siempre por nombre latino.

alter table public.plants add column if not exists grok_id smallint;
create unique index if not exists plants_grok_id_key on public.plants (grok_id) where grok_id is not null;
comment on column public.plants.grok_id is 'Número de la foto de Grok (carpeta «fotos grok q-h.com»). No es el id de la planta.';

-- Prueba con una foto: ID 10 – Cola de Caballo (Equisetum arvense). Planta nueva, nace como borrador.
insert into public.plants (id, slug, nombre_es, nombre_latino, categoria, grok_id, image_cientifica_url,
                           ficha_cientifica, ficha_mistica, ficha_verificada, publicada)
select (select coalesce(max(id), 0) + 1 from public.plants),
       'cola-de-caballo', 'Cola de Caballo', 'Equisetum arvense', 'Magicas', 10,
       '/images/plants/cola-de-caballo-cientifica.jpg',
       jsonb_build_object(
         'familia_botanica', 'Equisetaceae',
         'parte_usada', 'Tallos estériles verdes (partes aéreas), secos',
         'principios_activos', jsonb_build_array('Sílice (ácido silícico)', 'Sales minerales de potasio', 'Flavonoides (quercetina, kaempferol)', 'Ácidos fenólicos'),
         'propiedades', jsonb_build_array('Diurética suave', 'Astringente', 'Remineralizante (uso tradicional)'),
         'indicaciones', jsonb_build_array(
           'Uso tradicional para aumentar la orina y ayudar a limpiar las vías urinarias en molestias leves',
           'Uso tradicional externo como apoyo en heridas superficiales pequeñas'),
         'posologia', 'Tradicionalmente se usan los tallos secos en infusión o en compresas. No indicamos dosis: consulta a un profesional sanitario, sobre todo si tomas medicación, estás embarazada o das el pecho. Si las molestias urinarias duran más de una semana, acude a tu médico.',
         'contraindicaciones', jsonb_build_array(
           'Embarazo y lactancia (no hay datos de seguridad)',
           'Menores de 12 años',
           'Problemas graves de corazón o de riñón en los que se limita la toma de líquidos',
           'Si tomas diuréticos o litio, consulta antes con tu médico',
           'No confundir con Equisetum palustre (cola de caballo de pantano), que es tóxica',
           'Alergia a la planta'),
         'fuentes', jsonb_build_array(jsonb_build_object(
           'titulo', 'Agencia Europea del Medicamento — Equiseti herba (monografía)',
           'url', 'https://www.ema.europa.eu/en/medicines/herbal/equiseti-herba'))),
       jsonb_build_object(
         'chakra', 'Raíz',
         'elemento', 'Tierra',
         'planeta_regente', 'Saturno',
         'energia', 'Estructurante y depurativa',
         'simbolismo', 'Fósil viviente: sus parientes formaban bosques hace más de 300 millones de años. Símbolo de resistencia, estructura y paciencia.',
         'uso_ceremonial', 'Antigua «hierba de pulir» metales y madera; en ritual se asocia a limpiar y dar firmeza.',
         'afinidad_ayurvedica', 'Kapha; con moderación en Vata (es secante)'),
       false, false
where not exists (select 1 from public.plants where nombre_latino = 'Equisetum arvense' or slug = 'cola-de-caballo');

-- Manual de Kimiko: cómo se integra cada foto de Grok (lo mismo que se hizo a mano con la ID 10).
insert into public.kimiko_runbook (id, nombre, cuando, pasos, comprobacion, si_falla) values
  ('integrar-foto-planta', 'Integrar una foto de planta de Grok', 'cuando Kristian manda una foto «ID N – Nombre (Latín)»',
   '["Leer del nombre del archivo: grok_id = N, nombre, nombre latino", "Si el nombre latino es de una de las 9 plantas peligrosas: parar y avisar", "Si grok_id ya está en plants: parar (foto repetida)", "Buscar en plants por nombre_latino, nunca por id", "Si existe: guardar la foto como /images/plants/<slug>-grok.jpg y proponerla en Telegram, sin sustituir la lámina actual hasta que Kristian diga sí", "Si no existe: crear la planta con el siguiente id libre, grok_id = N, publicada = false y ficha_verificada = false", "Guardar la foto en public/images/plants/<slug>-cientifica.jpg por PR (sin metadatos, mismo tamaño 784x1168)", "Rellenar ficha_cientifica y ficha_mistica con el formato de albahaca: sin dosis, sin promesas, contraindicaciones y fuentes https institucionales", "Mandar la ficha a Telegram como borrador para que Kristian la revise"]',
   'Fila en plants con grok_id = N, publicada = false; el PR con la imagen pasa el build de Vercel; la URL de la imagen responde 200 tras fusionar',
   'Telegram a Kristian con el paso que falló. No se publica nada ni se borra ninguna lámina.')
on conflict (id) do nothing;
