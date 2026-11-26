---
name: qh-chat-seguridad
description: Reglas y pruebas obligatorias para cualquier cambio en app/api/chat/route.ts. Úsala antes de tocar la ruta del chat, el fallback local, los patrones de riesgo o el SYSTEM_PROMPT.
---

# qh-chat-seguridad — antes de tocar el chat

## Contexto crítico

En producción (Vercel serverless), **`localFallbackReply` es el único código que ejecuta el chat**.
`OLLAMA_URL` y `N8N_CHAT_WEBHOOK_URL` no tienen valores en producción → siempre caen al fallback.
Cualquier defecto en `localFallbackReply` o en la detección de riesgo es un defecto en producción.

## Reglas inamovibles

1. **`tieneContextoRiesgo` corre ANTES de cualquier búsqueda de contenido y antes de llamar a n8n u Ollama.**
   No puede moverse después de `fetchPlants()` ni dentro del bloque catch.

2. **Respuesta en contexto de riesgo:**
   - Primera frase exacta: «No tomes ninguna planta sin consultar antes con tu médico o farmacéutico.»
   - Si hay planta identificada con ficha verificada: incluir TODAS sus contraindicaciones.
   - Sin artículos. Sin sugerencias de otras plantas. Sin «puede interesarte».
   - Cierre: referencia a médico/farmacéutico y a /terapeutas/papu.

3. **En respuestas normales** (sin riesgo): mostrar TODAS las contraindicaciones de la ficha, nunca `slice(n)`.

4. **Patrones de detección** (definidos en `RIESGO_REGEXPS` en route.ts):
   - Embarazo / gestación / lactancia / bebé / recién nacido
   - Niño / niña / hijo / hija / infante / pediatría
   - Anticoagulantes: warfarina, acenocumarol, heparina
   - Sedantes / ansiolíticos: diazepam, lorazepam, alprazolam
   - Antidepresivos: fluoxetina, sertralina, paroxetina, venlafaxina
   - Antiepilépticos: carbamazepina, valproato
   - Quimioterapia
   - Cirugía / operación
   - Insuficiencia hepática / hepatitis / cirrosis
   - Insuficiencia renal / diálisis
   - Hiper/hipotiroidismo
   - Epilepsia
   - «Tomo medicamentos/pastillas/tratamiento»
   Los patrones se aplican sobre texto normalizado (normalize: minúsculas + sin tildes).

## Suite de pruebas obligatoria

Antes de cualquier PR que toque `app/api/chat/route.ts`:

```bash
node scripts/prueba-chat-seguridad.mjs
```

El script sale con exit 1 si algún caso falla. Los 6 casos:

| ID | Mensaje | Riesgo esperado |
|----|---------|-----------------|
| P1 | «Estoy embarazada, ¿puedo tomar salvia?» | ✅ sí |
| P2 | «Tomo anticoagulantes. ¿El ginkgo es compatible?» | ✅ sí |
| P3 | «¿Puedo tomar valeriana si ya tomo ansiolíticos?» | ✅ sí |
| P4 | «Busco una planta para mi niño de 4 años que no duerme» | ✅ sí |
| P5 | «¿Me curas la ansiedad?» | ❌ no (respuesta normal, sin artículo de cura) |
| P6 | «¿Qué plantas van bien para la digestión?» | ❌ no (respuesta normal con fichas) |

**Respuestas esperadas para casos de riesgo:**
- Primera frase siempre: «No tomes ninguna planta sin consultar antes con tu médico o farmacéutico.»
- P1 (salvia+embarazo): incluye todas las contraindicaciones de la ficha de salvia.
- P2 (ginkgo+anticoagulantes): incluye «Riesgo de hemorragia con anticoagulantes».
- P3 (valeriana+ansiolíticos): incluye «Efecto aditivo con sedantes, ansiolíticos y alcohol».
- P4 (niño): sin planta identificable → solo frase fija + cierre.

**Respuestas esperadas para casos normales:**
- P5: puede mencionar valeriana (ansiedad) con TODAS las contraindicaciones. Sin prometer cura.
- P6: planta relevante con todas las contraindicaciones. Sin artículos si el score es bajo.

## Al actualizar RIESGO_REGEXPS

Cuando añadas o cambies un patrón en route.ts, actualiza también el array `RIESGO_REGEXPS`
en `scripts/prueba-chat-seguridad.mjs`. Los dos deben estar sincronizados manualmente.
Añade un caso de prueba al script para el nuevo patrón antes de hacer el commit.

## Artículos del blog vs fichas

Los artículos estáticos (`lib/posts.ts`) y los de Supabase no incluyen contraindicaciones de forma sistemática.
La ficha del diccionario (/diccionario/[slug]) es la fuente de verdad para contraindicaciones.
No editar artículos solo para añadir contraindicaciones: hacerlo desde qh-editorial con el proceso completo.

## Plantilla para el PR
```
Chat seguridad: prueba-chat-seguridad.mjs ✅ 6/6 · tieneContextoRiesgo antes de cualquier búsqueda ✅ · build ✅
```
