-- Fotos de Grok, lote 1 (IDs 2, 3, 5, 6, 7, 8, 9, 11, 12, 13). Emparejado por nombre latino, nunca por id.
-- Aceptadas: 2, 5, 7, 8, 9, 11, 12. Rechazadas (no se tocan): 3 Árnica (hojas alternas, no es A. montana),
-- 6 Boldo (rótulo «F2 QH Visual system JPG» dentro de la imagen), 13 Eleuterococo (rótulo mal escrito).
-- Las plantas nuevas nacen como borrador (publicada = false, ficha_verificada = false).

alter table public.plants add column if not exists grok_id smallint;
create unique index if not exists plants_grok_id_key on public.plants (grok_id) where grok_id is not null;

-- Plantas que ya existen: solo se anota el grok_id; la foto queda como <slug>-grok.jpg y no sustituye image_cientifica_url.
update public.plants set grok_id = 2  where nombre_latino = 'Aloe vera' and slug = 'aloe-vera' and grok_id is null;
update public.plants set grok_id = 9  where nombre_latino = 'Aesculus hippocastanum' and slug = 'castano-de-indias' and grok_id is null;
-- Echinacea purpurea está duplicada en plants (echinacea id 21 y equinacea id 52, la publicada): se anota en la publicada.
update public.plants set grok_id = 12 where nombre_latino = 'Echinacea purpurea' and slug = 'equinacea' and grok_id is null;

-- Plantas nuevas (borrador).
insert into public.plants (id, slug, nombre_es, nombre_latino, categoria, grok_id, image_cientifica_url,
                           ficha_cientifica, ficha_mistica, ficha_verificada, publicada)
select (select coalesce(max(id), 0) + 1 from public.plants),
       'bardana', 'Bardana', 'Arctium lappa', 'Maestras', 5, '/images/plants/bardana-grok.jpg',
       jsonb_build_object(
         'familia_botanica', 'Asteraceae',
         'parte_usada', 'Raíz (primer año), también hojas y frutos',
         'principios_activos', jsonb_build_array('Inulina', 'Lignanos (arctiína)', 'Ácidos fenólicos (clorogénico, cafeico)', 'Taninos'),
         'propiedades', jsonb_build_array('Diurética suave (uso tradicional)', 'Depurativa (uso tradicional)', 'Apoyo en la piel (uso tradicional)'),
         'indicaciones', jsonb_build_array(
           'Uso tradicional para aumentar la eliminación de orina y ayudar a limpiar las vías urinarias',
           'Uso tradicional como apoyo en problemas leves de la piel, como el acné'),
         'posologia', 'Tradicionalmente se usa la raíz seca en decocción. No indicamos dosis: consulta a un profesional sanitario, sobre todo si tomas medicación. Si los síntomas duran más de una semana, acude a tu médico.',
         'contraindicaciones', jsonb_build_array(
           'Embarazo y lactancia (no hay datos de seguridad)',
           'Alergia a plantas de la familia de las compuestas (asteráceas)',
           'Si tomas diuréticos, antidiabéticos o anticoagulantes, consulta antes con tu médico',
           'No usar si hay obstrucción de las vías urinarias o problemas de riñón sin supervisión profesional',
           'No confundir la raíz con la de la belladona: recolectar solo con identificación segura'),
         'fuentes', jsonb_build_array(jsonb_build_object(
           'titulo', 'Agencia Europea del Medicamento — Arctii radix (monografía)',
           'url', 'https://www.ema.europa.eu/en/medicines/herbal/arctii-radix'))),
       jsonb_build_object(
         'chakra', 'Raíz', 'elemento', 'Tierra', 'planeta_regente', 'Venus',
         'energia', 'Arraigada y purificadora',
         'simbolismo', 'Sus frutos se agarran a todo lo que pasa: símbolo de apego, de lo que se queda pegado y de soltarlo.',
         'uso_ceremonial', 'En la tradición popular se asocia a la protección y a limpiar lo que ya no sirve.',
         'afinidad_ayurvedica', 'Pitta y Kapha; con moderación en Vata'),
       false, false
where not exists (select 1 from public.plants where nombre_latino = 'Arctium lappa' or slug = 'bardana' or grok_id = 5);

insert into public.plants (id, slug, nombre_es, nombre_latino, categoria, grok_id, image_cientifica_url,
                           ficha_cientifica, ficha_mistica, ficha_verificada, publicada)
select (select coalesce(max(id), 0) + 1 from public.plants),
       'calendula', 'Caléndula', 'Calendula officinalis', 'Maestras', 7, '/images/plants/calendula-grok.jpg',
       jsonb_build_object(
         'familia_botanica', 'Asteraceae',
         'parte_usada', 'Flores (capítulos florales), secas',
         'principios_activos', jsonb_build_array('Flavonoides (quercetina, isorramnetina)', 'Carotenoides', 'Triterpenos (faradiol)', 'Aceite esencial'),
         'propiedades', jsonb_build_array('Antiinflamatoria suave (uso tradicional)', 'Cicatrizante (uso tradicional)', 'Calmante de la piel (uso tradicional)'),
         'indicaciones', jsonb_build_array(
           'Uso tradicional externo como apoyo en pequeñas heridas e inflamaciones leves de la piel',
           'Uso tradicional como enjuague en irritaciones leves de boca y garganta'),
         'posologia', 'Tradicionalmente se usan las flores en infusión para enjuagues o compresas, o en pomada. No indicamos dosis: consulta a un profesional sanitario. Si una herida no mejora en pocos días, acude a tu médico.',
         'contraindicaciones', jsonb_build_array(
           'Alergia a plantas de la familia de las compuestas (asteráceas, como manzanilla o árnica)',
           'Embarazo y lactancia: sin datos de seguridad suficientes',
           'No aplicar sobre heridas profundas o infectadas',
           'Menores de 12 años: consulta antes con un profesional'),
         'fuentes', jsonb_build_array(jsonb_build_object(
           'titulo', 'Agencia Europea del Medicamento — Calendulae flos (monografía)',
           'url', 'https://www.ema.europa.eu/en/medicines/herbal/calendulae-flos'))),
       jsonb_build_object(
         'chakra', 'Plexo solar', 'elemento', 'Fuego', 'planeta_regente', 'Sol',
         'energia', 'Luminosa y cálida',
         'simbolismo', 'Sus flores se abren con el sol y se cierran al caer la tarde: símbolo de constancia y de alegría serena.',
         'uso_ceremonial', 'En la tradición popular se ofrece como flor solar en fiestas de verano.',
         'afinidad_ayurvedica', 'Pitta con moderación; equilibra Kapha'),
       false, false
where not exists (select 1 from public.plants where nombre_latino = 'Calendula officinalis' or slug = 'calendula' or grok_id = 7);

insert into public.plants (id, slug, nombre_es, nombre_latino, categoria, grok_id, image_cientifica_url,
                           ficha_cientifica, ficha_mistica, ficha_verificada, publicada)
select (select coalesce(max(id), 0) + 1 from public.plants),
       'cardo-mariano', 'Cardo Mariano', 'Silybum marianum', 'Maestras', 8, '/images/plants/cardo-mariano-grok.jpg',
       jsonb_build_object(
         'familia_botanica', 'Asteraceae',
         'parte_usada', 'Frutos (mal llamados semillas), secos',
         'principios_activos', jsonb_build_array('Silimarina (mezcla de flavonolignanos: silibinina, silicristina, silidianina)', 'Aceite graso', 'Flavonoides'),
         'propiedades', jsonb_build_array('Uso tradicional como apoyo digestivo y hepático'),
         'indicaciones', jsonb_build_array(
           'Uso tradicional para aliviar molestias digestivas leves, como la pesadez tras las comidas'),
         'posologia', 'Tradicionalmente se usan los frutos en infusión o en extractos. No indicamos dosis: consulta a un profesional sanitario antes de usarlo, sobre todo si tienes alguna enfermedad del hígado o tomas medicación.',
         'contraindicaciones', jsonb_build_array(
           'Alergia a plantas de la familia de las compuestas (asteráceas)',
           'Embarazo y lactancia: sin datos de seguridad suficientes',
           'Menores de 18 años',
           'Si tomas medicación (puede interferir con algunos fármacos) o tienes enfermedad hepática, consulta antes con tu médico',
           'Puede tener efecto laxante suave en algunas personas',
           'No sustituye ningún tratamiento médico'),
         'fuentes', jsonb_build_array(jsonb_build_object(
           'titulo', 'Agencia Europea del Medicamento — Silybi mariani fructus (monografía)',
           'url', 'https://www.ema.europa.eu/en/medicines/herbal/silybi-mariani-fructus'))),
       jsonb_build_object(
         'chakra', 'Plexo solar', 'elemento', 'Fuego', 'planeta_regente', 'Marte',
         'energia', 'Protectora y firme',
         'simbolismo', 'Sus hojas veteadas de blanco recuerdan, según la leyenda, la leche de la Virgen María: símbolo de protección.',
         'uso_ceremonial', 'En la tradición popular se colgaba como amuleto protector del hogar.',
         'afinidad_ayurvedica', 'Pitta y Kapha; con moderación en Vata'),
       false, false
where not exists (select 1 from public.plants where nombre_latino = 'Silybum marianum' or slug = 'cardo-mariano' or grok_id = 8);

insert into public.plants (id, slug, nombre_es, nombre_latino, categoria, grok_id, image_cientifica_url,
                           ficha_cientifica, ficha_mistica, ficha_verificada, publicada)
select (select coalesce(max(id), 0) + 1 from public.plants),
       'diente-de-leon', 'Diente de León', 'Taraxacum officinale', 'Maestras', 11, '/images/plants/diente-de-leon-grok.jpg',
       jsonb_build_object(
         'familia_botanica', 'Asteraceae',
         'parte_usada', 'Raíz y hojas',
         'principios_activos', jsonb_build_array('Lactonas sesquiterpénicas (taraxacína)', 'Inulina', 'Flavonoides', 'Sales de potasio'),
         'propiedades', jsonb_build_array('Diurética suave (uso tradicional)', 'Estimula el apetito y la digestión (uso tradicional)'),
         'indicaciones', jsonb_build_array(
           'Uso tradicional para aumentar la eliminación de orina',
           'Uso tradicional para aliviar molestias digestivas leves y la falta de apetito'),
         'posologia', 'Tradicionalmente se usa la raíz o la hoja en infusión o decocción. No indicamos dosis: consulta a un profesional sanitario, sobre todo si tomas medicación. Si los síntomas duran más de una semana, acude a tu médico.',
         'contraindicaciones', jsonb_build_array(
           'Alergia a plantas de la familia de las compuestas (asteráceas)',
           'Obstrucción de las vías biliares, vesícula con cálculos o inflamación intestinal: consulta antes con tu médico',
           'Si tomas diuréticos, litio o anticoagulantes, consulta antes con tu médico',
           'Embarazo y lactancia: sin datos de seguridad suficientes',
           'Problemas de corazón o de riñón en los que se limita el líquido'),
         'fuentes', jsonb_build_array(jsonb_build_object(
           'titulo', 'Agencia Europea del Medicamento — Taraxaci officinalis radix (monografía)',
           'url', 'https://www.ema.europa.eu/en/medicines/herbal/taraxaci-officinalis-radix'))),
       jsonb_build_object(
         'chakra', 'Plexo solar', 'elemento', 'Aire', 'planeta_regente', 'Júpiter',
         'energia', 'Expansiva y resiliente',
         'simbolismo', 'Del sol amarillo al reloj de semillas blancas: símbolo de deseos que se sueltan al viento y de resistencia.',
         'uso_ceremonial', 'Soplar su vilano para pedir un deseo es un gesto popular muy extendido.',
         'afinidad_ayurvedica', 'Pitta y Kapha; con moderación en Vata'),
       false, false
where not exists (select 1 from public.plants where nombre_latino = 'Taraxacum officinale' or slug = 'diente-de-leon' or grok_id = 11);
