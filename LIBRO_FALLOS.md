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

**Arreglo (parcial):** PR `claude/v2-f1-paso-0` — quitados ProfileCTA, el paso "La IA analiza y conecta" y el marcador de Quantum Pro del plan de ejemplo. Las features de pago que no existen marcadas como "(próximamente)".

⚠️ **Incompleto en la entrega de 24-nov:** `Hero.tsx` sigue diciendo «potenciados por inteligencia artificial». `app/layout.tsx` incluye «IA» en el título por defecto, en metaDescripción, en openGraph y en keywords. `ChatBot.tsx` muestra «IA local · papu-pro» aunque en producción solo ejecuta búsqueda de palabras clave sobre plantas y posts (n8n y Ollama no son alcanzables desde Vercel). `HowItWorks.tsx` del branch conserva «Inteligencia artificial al servicio de tu bienestar» en `extraLines`. `Footer.tsx` llama «Chat IA» al asistente. Paso 03 de HowItWorks promete «Plan nutricional semanal» cuando `monthly_protocols` tiene 0 filas. Paso 04 dice «El sistema aprende contigo» sin ningún mecanismo de aprendizaje. Estos puntos pasan a la cola de correcciones de #109 (esperando ✅ de Kristian).

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

## F-003 · Push directo a `main` sin PR · 24-nov-2026

**Qué falló:** El commit `db37832` («ESTADO.md: encargo v2 iniciado, PRs #108/#109/#110 en curso») se empujó directamente a `main`, saltándose el flujo de rama + PR + CI que exige la regla 5 de `CLAUDE.md`. Aunque solo tocó `ESTADO.md`, el bypass sienta precedente y no deja rastro en los checks de CI.

**Causa:** La sesión que cerró el encargo v2 empujó a `main` en lugar de hacerlo a la rama del encargo o abrir un PR de actualización de estado.

**Arreglo:** No hay daño que revertir (ESTADO.md es documentación). Se registra aquí para que no se repita.

**Regla / receta:**
> Incluso los archivos de documentación (`ESTADO.md`, `LIBRO_FALLOS.md`, bitácoras) se editan en una rama y entran por PR. La única excepción es un push de emergencia autorizado explícitamente por Kristian en el chat con «push directo».

---

## F-004 · El fusionador podía auto-fusionar ramas `claude/v2-*` · 24-nov-2026

**Qué falló:** `kimiko/fusion/fusionar.py` no tenía ningún tratamiento especial para ramas `claude/v2-*`. Si los checks de CI pasaban y el PR no tocaba nada marcado como «delicado», el fusionador lo habría fusionado solo, sin que Kristian lo revisara. Los PR #109 y #110 del encargo v2 llevan la etiqueta `no-fusionar` (añadida a mano), pero eso no es una garantía estructural.

**Causa:** `RAMAS_OK_MANUAL` no existía en el código; solo había `DELICADO` (patrones de ruta). Un PR de diseño o de textos puede no tocar ninguna ruta delicada y aun así necesitar la revisión de Kristian.

**Arreglo:** PR #111 (`claude/v2-fusionador-bloqueo`) — añadida la constante `RAMAS_OK_MANUAL = ('claude/v2-',)`. Cualquier PR de rama `claude/v2-*` devuelve `'necesita OK (v2)'` y avisa a Kristian antes de intentar el merge. 8 pruebas nuevas cubren el comportamiento.

**Regla / receta:**
> Cuando se abre un encargo de múltiples PRs que necesitan revisión de Kristian, añadir el prefijo de esas ramas a `RAMAS_OK_MANUAL` antes de abrir el primer PR, no después.

---
