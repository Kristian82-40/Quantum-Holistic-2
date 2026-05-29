# HANDOFF — 2026-05-29

## Hecho hoy
- Auditoría tabla plants: 44/50 tenían imagen equivocada (filenames de lista vieja ≠ slugs).
- Claude.ai ejecutó 20 UPDATE de image_cientifica_url (Grupo A, sin beleño). Estado: sin_url=0, 20 coinciden, 30 pendientes.

## Pendiente Code (en este orden)
1. git remote -v && git status. VERIFICAR ruta canónica: ¿/Users/Kristian/Projects/quantum-holistic es el repo que despliega (Kristian82-40/Quantum-Holistic-2)? Posible causa de errores recurrentes si hay dos copias.
2. git mv "public/images/plants/plant-00-beleño-negro-cientifica.jpg" "public/images/plants/plant-00-beleno-negro-cientifica.jpg"  (la ñ rompe en Vercel/Linux)
3. git ls-files de los 21 archivos Grupo A; git add los que falten.
4. git commit -m "fix: mapeo imagenes plantas + beleno ASCII" && git push origin main. Reportar hash.
5. Avisar a Claude.ai para actualizar URL de beleño en Supabase.

## Pendiente generación — Grupo B (29 SIN imagen)
hierba-mora, sidr, hinojo, milenrama, roble, tejo, aconito, abedul, cornezuelo-centeno, nigela, granada, azafran, higuera, azufaifo, incienso, ajo, rosa-de-jerico, frankenia, cannabis, ashwagandha-fruto, amla, neem, loto, arbol-bodhi, cinamomo, guayaba, datura, datura-metel, amanita-muscaria
Plan: nombre_latino → prompt F2 maestro + img2img referencia → n8n + API cloud free (Pixazo/ModelsLab FLUX). Falta N8N_API_KEY en .env.local.

## Decisiones
- SuperGrok descartado (no free tier, no se paga). SD local descartado (8GB). Agentes Ollama = orquestación, no generan imágenes.

## Cola
- Frontend tabs por categoría (Maestras 18 / Sagradas 16 / Magicas 16).
