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

## F-010 · Segundo package.json olvidado en app/ · 26-nov-2026
**Qué falló:** `app/package.json` y `app/package-lock.json` (next 14.2.5, abril) seguían en el repo después de que el proyecto migrara su raíz a la carpeta principal. GitHub los escaneaba con Dependabot y sumaban decenas de alertas de seguridad duplicadas (103 en total frente a las reales del package.json raíz).
**Causa:** Al reorganizar el proyecto en algún momento (presumiblemente al crear la estructura Next.js en la raíz), los archivos de la carpeta `app/` no se eliminaron. Ningún workflow, script ni vercel.json los referenciaba.
**Arreglo:** `git rm app/package.json app/package-lock.json` en la rama `claude/seguridad-deps` (PR #120). Grep previo en vercel.json, package.json, .github/, scripts y código: 0 referencias.
**Regla / receta:** Antes de cerrar cualquier PR de dependencias, comprobar `find . -name "package.json" -not -path "*/node_modules/*"` y verificar que solo existe el raíz (y los de supabase/functions si los hay). Un package.json huérfano infla las alertas y oculta el estado real de seguridad.

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

## F-009 · Commit de ESTADO.md directo en main local · 26-nov-2026

**Qué falló:** Al cerrar la sesión de PR #118, el agente hizo `git add ESTADO.md && git commit` directamente en la rama local `main`. El commit `236a461` quedó en main local por encima de `origin/main`, bloqueando el push (regla `ask` en settings.local.json) y requiriendo un `git reset --hard` manual.

**Causa:** ESTADO.md se trata habitualmente como "documento de estado vivo" y el agente lo editó y committeó como si fuera un cambio de cierre de sesión de bajo riesgo, sin abrir rama primero.

**Arreglo:** Rama `claude/estado-118` creada a partir de `236a461`, main local reseteado a `origin/main`, PR #119 abierto con `--label no-fusionar`.

**Regla / receta:**
> ESTADO.md también va por rama y PR, sin excepciones. Ningún archivo del repo se commitea directamente en `main` local. La secuencia siempre es: `git checkout -b claude/<nombre>` → editar → commit → push → PR con `--label no-fusionar`.

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
