-- Fichas completadas el 8-oct-2026 (orden de Kristian del 6-oct 18:30, kimiko_drafts 2aa4e2e6).
-- Mismo nivel que manzanilla: sin dosis, uso tradicional, embarazo y medicación, fuentes (EMA/HMPC, NCCIH).
-- Quedan publicada=false y ficha_verificada=false: las revisa y publica Kristian.
-- Deshacer: kimiko/recuperacion/restaurar-plantas-2026-10-08.sql
update public.plants set publicada=false, ficha_verificada=false, updated_at=now(), ficha_cientifica = ficha_cientifica || $j${
 "evidencia":"La Agencia Europea del Medicamento (EMA) reconoce su uso para la tensión nerviosa leve y las dificultades para dormir. Los ensayos clínicos muestran resultados modestos e irregulares; no sustituye a un tratamiento médico.",
 "posologia":"Tradicionalmente se usa la raíz seca en infusión o en extractos. No indicamos dosis: consulta a un profesional sanitario, sobre todo si tomas medicación.",
 "propiedades":["Relajante suave","Favorece el descanso (uso tradicional)","Antiespasmódica suave"],
 "indicaciones":["Uso tradicional en la tensión nerviosa leve","Uso tradicional para favorecer el sueño"],
 "contraindicaciones":["Embarazo y lactancia: no recomendada (faltan datos de seguridad)","No dar a menores de 12 años sin consejo profesional","Puede sumar su efecto al de sedantes, ansiolíticos, antihistamínicos y alcohol","Puede causar somnolencia: precaución al conducir o manejar máquinas","Consulta antes si tomas cualquier medicación o vas a operarte"],
 "fuentes":[{"titulo":"EMA/HMPC — Valerianae radix (monografía de la UE)","url":"https://www.ema.europa.eu/en/medicines/herbal/valerianae-radix"},{"titulo":"NCCIH (NIH) — Valerian","url":"https://www.nccih.nih.gov/health/valerian"}]
}$j$::jsonb where slug='valeriana';
update public.plants set publicada=false, ficha_verificada=false, updated_at=now(), ficha_cientifica = ficha_cientifica || $j${
 "evidencia":"La EMA reconoce su uso para prevenir las náuseas del mareo en los viajes y, por tradición, para molestias digestivas leves. Hay ensayos sobre náuseas con resultados favorables pero modestos; no sustituye a un tratamiento médico.",
 "posologia":"Tradicionalmente se usa el rizoma fresco o seco en infusión o en la cocina. No indicamos dosis: consulta a un profesional sanitario, sobre todo si tomas medicación.",
 "propiedades":["Digestiva (uso tradicional)","Calmante de las náuseas","Aromática y calentadora"],
 "indicaciones":["Uso reconocido para el mareo en los viajes","Uso tradicional en digestiones pesadas y gases"],
 "contraindicaciones":["Embarazo y lactancia: consultar antes con un profesional (también para las náuseas del embarazo)","Cálculos biliares: consultar antes","Puede interactuar con anticoagulantes y antiagregantes (warfarina, aspirina) y con medicación para la diabetes o la tensión","No dar a menores de 6 años sin consejo profesional","Suspender antes de una operación y avisar al médico"],
 "fuentes":[{"titulo":"EMA/HMPC — Zingiberis rhizoma (monografía de la UE)","url":"https://www.ema.europa.eu/en/medicines/herbal/zingiberis-rhizoma"},{"titulo":"NCCIH (NIH) — Ginger","url":"https://www.nccih.nih.gov/health/ginger"}]
}$j$::jsonb where slug='jengibre';
update public.plants set publicada=false, ficha_verificada=false, updated_at=now(), ficha_cientifica = ficha_cientifica || $j${
 "evidencia":"La EMA recoge su uso tradicional para aliviar síntomas leves de estrés y cansancio y para ayudar a dormir. Hay estudios con extractos orales específicos, de calidad variable; no sustituye a un tratamiento médico.",
 "posologia":"Tradicionalmente se toman las flores secas en infusión; el aceite esencial se usa en aromaterapia, siempre diluido y nunca por vía oral sin indicación profesional. No indicamos dosis.",
 "propiedades":["Relajante suave","Aromática","Favorece el descanso (uso tradicional)"],
 "indicaciones":["Uso tradicional en el estrés leve y el cansancio","Uso tradicional para favorecer el sueño","Uso aromático tradicional en baños y ambientes"],
 "contraindicaciones":["Alergia conocida a la lavanda o a otras Lamiaceae","Embarazo y lactancia: no recomendada por vía oral sin consejo profesional","Aceite esencial: no ingerir, no aplicar puro sobre la piel y evitar en bebés y niños pequeños","Puede sumar su efecto al de sedantes y ansiolíticos: consulta si tomas medicación","Puede irritar la piel sensible"],
 "fuentes":[{"titulo":"EMA/HMPC — Lavandulae flos (monografía de la UE)","url":"https://www.ema.europa.eu/en/medicines/herbal/lavandulae-flos"},{"titulo":"NCCIH (NIH) — Lavender","url":"https://www.nccih.nih.gov/health/lavender"}]
}$j$::jsonb where slug='lavanda';
update public.plants set publicada=false, ficha_verificada=false, updated_at=now(), ficha_cientifica = ficha_cientifica || $j${
 "evidencia":"La EMA recoge su uso tradicional como expectorante en la tos asociada al resfriado. La evidencia clínica es limitada y procede sobre todo de combinaciones con otras plantas; no sustituye a un tratamiento médico.",
 "posologia":"Tradicionalmente se usan las hojas y flores secas en infusión o en vahos. No indicamos dosis: consulta a un profesional sanitario, sobre todo si tomas medicación.",
 "propiedades":["Aromática","Expectorante suave (uso tradicional)","Digestiva suave"],
 "indicaciones":["Uso tradicional en la tos del resfriado","Uso tradicional en digestiones pesadas","Uso tradicional en gárgaras"],
 "contraindicaciones":["Alergia a las Lamiaceae (orégano, romero, salvia, menta)","Embarazo y lactancia: consultar antes con un profesional","No dar a menores de 4 años sin consejo profesional","Aceite esencial: no ingerir ni aplicar puro","Úlcera o problemas de estómago: consultar antes","Si la tos dura más de una semana, hay fiebre o falta el aire, acude al médico","Consulta si tomas anticoagulantes u otra medicación"],
 "fuentes":[{"titulo":"EMA/HMPC — Thymi herba (monografía de la UE)","url":"https://www.ema.europa.eu/en/medicines/herbal/thymi-herba"}]
}$j$::jsonb where slug='tomillo';
update public.plants set publicada=false, ficha_verificada=false, updated_at=now(), ficha_cientifica = ficha_cientifica || $j${
 "evidencia":"La EMA recoge su uso tradicional en gárgaras para molestias de boca y garganta, para la sudoración excesiva y para molestias digestivas leves. Contiene tujona, tóxica en cantidades altas; la evidencia clínica es escasa.",
 "posologia":"Tradicionalmente se usan las hojas secas en infusión o en gárgaras (sin tragar). Uso corto y moderado por su contenido en tujona. No indicamos dosis: consulta a un profesional sanitario.",
 "propiedades":["Aromática","Astringente (uso tradicional)","Antioxidante"],
 "indicaciones":["Uso tradicional en gárgaras para boca y garganta","Uso tradicional en la sudoración excesiva","Uso tradicional en digestiones pesadas"],
 "contraindicaciones":["Embarazo y lactancia: no usar (tujona)","Epilepsia o antecedentes de convulsiones: no usar","No dar a niños","No usar de forma prolongada ni concentrada; el aceite esencial no se ingiere","Puede interactuar con anticonvulsivos, sedantes y medicación para la diabetes: consulta si tomas medicación","Alergia a las Lamiaceae"],
 "fuentes":[{"titulo":"EMA/HMPC — Salviae officinalis folium (monografía de la UE)","url":"https://www.ema.europa.eu/en/medicines/herbal/salviae-officinalis-folium"},{"titulo":"NCCIH (NIH) — Sage","url":"https://www.nccih.nih.gov/health/sage"}]
}$j$::jsonb where slug='salvia';
update public.kimiko_drafts set status='en_revision', updated_at=now() where id='2aa4e2e6-a149-44f2-8644-281a4f472955' and status='pendiente';
