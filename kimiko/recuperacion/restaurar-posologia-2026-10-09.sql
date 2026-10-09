-- Copia previa (9-oct-2026) de la posología de las 4 fichas publicadas, antes de quitar las dosis.
update plants set ficha_cientifica = jsonb_set(ficha_cientifica, '{posologia}', to_jsonb('Infusión: 2-3 g de hojas secas en 250 ml, 2-3 veces/día.'::text)) where slug = 'albahaca';
update plants set ficha_cientifica = jsonb_set(ficha_cientifica, '{posologia}', to_jsonb('Uso tópico únicamente: gel o crema al 5-10%, 2-3 aplicaciones/día.'::text)) where slug = 'arnica';
update plants set ficha_cientifica = jsonb_set(ficha_cientifica, '{posologia}', to_jsonb('Extracto estandarizado 300-500 mg/día.'::text)) where slug = 'equinacea';
update plants set ficha_cientifica = jsonb_set(ficha_cientifica, '{posologia}', to_jsonb('Infusión: 2-3 g de semillas en 250 ml, 2-3 veces/día.'::text)) where slug = 'hinojo';
-- Copia previa de "indicaciones" de las mismas 4 fichas.
update plants set ficha_cientifica = jsonb_set(ficha_cientifica, '{indicaciones}', '["Digestión pesada", "Ansiedad leve", "Infecciones respiratorias leves", "Mal aliento"]'::jsonb) where slug = 'albahaca';
update plants set ficha_cientifica = jsonb_set(ficha_cientifica, '{indicaciones}', '["Contusiones", "Esguinces", "Dolor muscular", "Hematomas"]'::jsonb) where slug = 'arnica';
update plants set ficha_cientifica = jsonb_set(ficha_cientifica, '{indicaciones}', '["Prevención de resfriados", "Infecciones respiratorias", "Sistema inmune débil", "Inflamación crónica"]'::jsonb) where slug = 'equinacea';
update plants set ficha_cientifica = jsonb_set(ficha_cientifica, '{indicaciones}', '["Hinchazón abdominal", "Cólicos", "Lactancia", "Tos"]'::jsonb) where slug = 'hinojo';
