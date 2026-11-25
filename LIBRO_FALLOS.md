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

## F-002 · Dependencia de disco externo en producción · 24-nov-2026

**Qué falló:** `app/api/profile/route.ts` ejecutaba `python3 /Volumes/PapuExt/agent/quantum_health.py` — una ruta de disco externo del Mac de desarrollo. En producción (Vercel) este path nunca existió. El error era silencioso: `analyzeQuantum` capturaba la excepción y devolvía `null`, así que el formulario "funcionaba" sin el análisis cuántico, pero la función de texto también fallaba porque `generateHealthPlan` de `lib/claude.ts` dependía de n8n en localhost.

**Causa:** Código de desarrollo local nunca adaptado para producción. La sección se desplegó con la intención de terminarla después, sin un freno que lo impidiera.

**Arreglo:** Sección eliminada (ver F-001). La API route puede quedar como stub o eliminarse en un PR posterior.

**Regla / receta:**
> Nunca desplegar código que llame a rutas locales (`/Volumes/`, `localhost`, `127.0.0.1`) desde funciones de servidor en producción. `gitleaks` no detecta esto; añadir un grep de `/Volumes/` y `localhost` en `vigilancia.yml` como check de CI.

---

## F-005 · Grep parcial: informe de «4 referencias» incompleto · 25-nov-2026

**Qué falló:** La sesión anterior reportó "4 referencias quedan" al hacer el grep final de términos prohibidos. En realidad había más: `app/api/chat/route.ts` tenía dos líneas de SYSTEM_PROMPT con "personalizado/planes personalizados" (usuario no ve el texto, pero es incorrecto) y el archivo activo `messages/en.json` (raíz) tenía todo el contenido viejo sin corregir — las ediciones se habían aplicado a `app/messages/en.json` que nadie importa.

**Causa:** Tres errores combinados:
1. El grep se ejecutó sobre `app/ components/ lib/ messages/ config.ts` (relativo), no desde la raíz con `.` — omitió `supabase/` y confundió `messages/` con `app/messages/`.
2. No se incluyeron extensiones `.js` y `.mjs` (Edge Functions de Kimiko).
3. El informe resumió y clasificó resultados en vez de listar la salida completa del grep, ocultando líneas reales.

**Arreglo:** PR `claude/v2-f1-paso-0` — grep desde raíz con todas las extensiones, `messages/en.json` raíz corregido, `app/messages/` borrado (cero imports, alias `@/*` resuelve a raíz), SYSTEM_PROMPT corregido.

**Regla / receta:**
> El grep de términos prohibidos siempre corre desde la raíz del repo (`.`) con `--exclude-dir=node_modules --exclude-dir=.next --exclude="package-lock.json"` e incluye `*.ts *.tsx *.js *.mjs *.json`. El informe entrega la salida completa sin filtrar; la clasificación (interno / user-facing) va debajo como análisis, no como sustitución de la salida. El script canónico está en `.claude/skills/qh-seguridad/`.

---
