-- Regla 8 de CLAUDE.md y skill qh-editorial: ninguna ficha publicada indica dosis. Mismo estilo que las 5 fichas del 8-oct.
-- Deshacer: kimiko/recuperacion/restaurar-posologia-2026-10-09.sql
update plants set ficha_cientifica = jsonb_set(ficha_cientifica, '{posologia}', to_jsonb('Tradicionalmente se usan las hojas, frescas en la cocina o secas en infusión. No indicamos dosis: consulta a un profesional sanitario, sobre todo si tomas medicación, estás embarazada o das el pecho.'::text)) where slug = 'albahaca';
update plants set ficha_cientifica = jsonb_set(ficha_cientifica, '{posologia}', to_jsonb('Solo uso externo, en preparados tópicos sobre piel sana (nunca en heridas abiertas). No se toma por vía oral. No indicamos dosis: consulta a un profesional sanitario.'::text)) where slug = 'arnica';
update plants set ficha_cientifica = jsonb_set(ficha_cientifica, '{posologia}', to_jsonb('Tradicionalmente se usan la raíz y la parte aérea en infusión o en extractos, durante periodos cortos. No indicamos dosis: consulta a un profesional sanitario, sobre todo si tomas medicación o tienes una enfermedad autoinmune.'::text)) where slug = 'equinacea';
update plants set ficha_cientifica = jsonb_set(ficha_cientifica, '{posologia}', to_jsonb('Tradicionalmente se usan las semillas en infusión y el bulbo en la cocina. No indicamos dosis: consulta a un profesional sanitario, sobre todo si estás embarazada, das el pecho o tomas medicación.'::text)) where slug = 'hinojo';

-- "Indicaciones" pasan a usos tradicionales (sin prevenir/curar), al estilo de jengibre y de las monografías EMA/HMPC.
-- Se quitan: "ansiedad", "infecciones", "sistema inmune débil", "inflamación crónica" (afirmaciones de salud) y en hinojo
-- "lactancia" y "cólicos" (chocan con sus contraindicaciones de embarazo/lactancia y con el uso en bebés).
update plants set ficha_cientifica = jsonb_set(ficha_cientifica, '{indicaciones}', '["Uso tradicional en digestiones pesadas", "Uso culinario como planta aromática"]'::jsonb) where slug = 'albahaca';
update plants set ficha_cientifica = jsonb_set(ficha_cientifica, '{indicaciones}', '["Uso tradicional externo en golpes, contusiones y hematomas", "Uso tradicional externo en molestias musculares"]'::jsonb) where slug = 'arnica';
update plants set ficha_cientifica = jsonb_set(ficha_cientifica, '{indicaciones}', '["Uso tradicional como apoyo en el resfriado común, durante periodos cortos"]'::jsonb) where slug = 'equinacea';
update plants set ficha_cientifica = jsonb_set(ficha_cientifica, '{indicaciones}', '["Uso tradicional en digestiones pesadas, hinchazón y gases"]'::jsonb) where slug = 'hinojo';

-- "Evidencia" sin cita comprobable (sin autores, título ni enlace) y con afirmaciones de salud ("demostró reducción…",
-- "cólico infantil"): se quita hasta tener fuentes EMA/NCCIH con URL, como en las 5 fichas del 8-oct.
update plants set ficha_cientifica = ficha_cientifica - 'evidencia' where slug in ('albahaca','arnica','equinacea','hinojo');
