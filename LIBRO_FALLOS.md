# Libro de fallos y lecciones — Quantum Holistic

Lo escriben los agentes; Kristian solo lo lee.
Sin secretos ni datos personales. El repo es público.

Formato de cada entrada:
```
## F-NNN · <título corto> · <fecha>
**Qué falló:** descripción del síntoma.
**Causa:** por qué ocurrió.
**Arreglo:** qué se hizo para corregirlo (PR, migración, configuración).
**Regla / receta:** la norma que sale de esto, para los agentes y para la fábrica.
```

---

## F-001 · Funcionalidades prometidas que no existen · 24-nov-2026

**Qué falló:** La portada prometía un "plan con IA" (sección ProfileCTA con botón "Generar mi plan"), una sección "La IA analiza y conecta" y un "bloque de protocolo de Quantum Pro". Ninguna de estas funcionaba: `/api/profile/` llamaba a un script Python en `/Volumes/PapuExt/` (disco externo ya desconectado) y a n8n/Ollama en localhost. Las tablas `monthly_protocols`, `nutrition_plans` y `recipes` tienen 0 filas.

**Causa:** La web se construyó con funciones planificadas pero no implementadas. No había un proceso de auditoría que cruzara lo que la web promete con lo que el código hace.

**Arreglo:** PR `claude/v2-f1-paso-0` — quitados ProfileCTA, el paso "La IA analiza y conecta" y el marcador de Quantum Pro del plan de ejemplo. Las features de pago que no existen marcadas como "(próximamente)". Texto del encabezado corregido para no prometer IA donde no hay.

**Regla / receta:**
> Antes de desplegar cualquier sección nueva, el equipo Mantener cruza lo que el componente dice con lo que la API devuelve. Una promesa en la web sin código detrás es un fallo de tipo F-001. Se registra aquí y el PR no se fusiona hasta que la promesa sea verdad o esté marcada "próximamente" de forma honesta.

---

## F-006 · Chat responde a consultas de riesgo sin advertencia · 25-nov-2026

**Qué falló:** `localFallbackReply` respondía a "Estoy embarazada, ¿puedo tomar salvia?" con un artículo recomendado y sin ninguna advertencia de seguridad. La función solo añadía `slice(0,2)` de contraindicaciones al final de la respuesta, insuficiente cuando el contexto implica riesgo real. En producción, `localFallbackReply` es el único camino que corre (n8n y Ollama no son accesibles desde Vercel serverless).

**Causa:** La ruta del chat no tenía ninguna capa de detección de contexto de riesgo antes de la búsqueda de contenido. El diseño asumía que un modelo IA daría advertencias, pero en producción nunca llega a ningún modelo.

**Arreglo:** PR `claude/chat-seguridad` — `tieneContextoRiesgo()` corre ANTES de cualquier IA o búsqueda. Detecta embarazo, lactancia, niños, medicación (anticoagulantes, sedantes, ansiolíticos, antidepresivos, antiepilépticos), enfermedad/cirugía. Respuesta fija: "No tomes ninguna planta sin consultar antes con tu médico o farmacéutico." + contraindicaciones completas de la ficha si la hay. Sin artículos, sin sugerir otras plantas. Las contraindicaciones en respuestas normales pasan de `slice(0,2)` a todas.

**Regla / receta:**
> Cualquier cambio en `app/api/chat/route.ts` debe pasar `scripts/prueba-chat-seguridad.mjs` antes de fusionarse. El script verifica los 6 casos de la skill `qh-chat-seguridad` y falla con exit 1 si alguno no pasa. Ver también: en producción Vercel, `localFallbackReply` es el único código que ejecuta el chat; testear solo en local contra Ollama no es suficiente.

---

## F-007 · PR #114 fusionado sin ✅ de Kristian · 25-nov-2026

**Qué falló:** `claude/chat-seguridad` (#114) se fusionó automáticamente sin que Kristian lo aprobara. `kimiko-fusion.yml` bloqueaba solo las ramas `claude/v2-*`; cualquier otra `claude/*` sin etiqueta `no-fusionar` se fusionaba sola si las pruebas estaban en verde.

**Causa:** `RAMAS_OK_MANUAL = ('claude/v2-',)` — prefijo demasiado estrecho. El PR no llevaba la etiqueta `no-fusionar` porque el agente no la añadió al crear el PR (gap en el proceso de creación).

**Arreglo:** PR `claude/v2-fusion-manual` — `RAMAS_OK_MANUAL = ('claude/',)`: todas las ramas `claude/*` requieren OK manual. Añadidas también a DELICADO: `app/api/`, `lib/chat`, `app/privacidad`, `app/terminos` (aplican a `kimiko/*`). 18/18 pruebas en verde.

**Regla / receta:**
> Todo PR abierto desde una sesión de Claude lleva la etiqueta `no-fusionar` en el `gh pr create` (`--label no-fusionar`). Verificar con `gh pr list --label no-fusionar`. El fusionador rechaza cualquier `claude/*` sin importar las pruebas; `kimiko/*` puede auto-fusionarse si no toca nada DELICADO.

---

## F-002 · Dependencia de disco externo en producción · 24-nov-2026

**Qué falló:** `app/api/profile/route.ts` ejecutaba `python3 /Volumes/PapuExt/agent/quantum_health.py` — una ruta de disco externo del Mac de desarrollo. En producción (Vercel) este path nunca existió. El error era silencioso: `analyzeQuantum` capturaba la excepción y devolvía `null`, así que el formulario "funcionaba" sin el análisis cuántico, pero la función de texto también fallaba porque `generateHealthPlan` de `lib/claude.ts` dependía de n8n en localhost.

**Causa:** Código de desarrollo local nunca adaptado para producción. La sección se desplegó con la intención de terminarla después, sin un freno que lo impidiera.

**Arreglo:** Sección eliminada (ver F-001). La API route puede quedar como stub o eliminarse en un PR posterior.

**Regla / receta:**
> Nunca desplegar código que llame a rutas locales (`/Volumes/`, `localhost`, `127.0.0.1`) desde funciones de servidor en producción. `gitleaks` no detecta esto; añadir un grep de `/Volumes/` y `localhost` en `vigilancia.yml` como check de CI.

---
