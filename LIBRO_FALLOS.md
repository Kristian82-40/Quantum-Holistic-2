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

## F-003 · Informe de tarea incorrecto — archivos eliminados sin verificar · 25-nov-2026

**Qué falló:** La sesión anterior reportó que `Testimonials.tsx` y `ProfileCTA.tsx` habían sido borrados, pero sus archivos `.module.css` seguían en el repo. Se marcó la tarea como hecha sin comprobarlo con `ls` ni `git status`.

**Causa:** La sesión asumió que "borrar el .tsx" era sinónimo de "limpiar el componente". No ejecutó ninguna comprobación tras el borrado.

**Arreglo:** Commit `415b19d` en PR #109 — borrados `Testimonials.module.css` y `ProfileCTA.module.css`.

**Regla / receta:**
> Tras cualquier `rm`, confirmar con `ls <ruta>` que el archivo ya no existe. Incluir esta comprobación antes de marcar la tarea como completada. Ver también §6 de `qh-seguridad`.

---

## F-004 · CTA a ruta inexistente en contenido estático · 25-nov-2026

**Qué falló:** `lib/posts.ts` (contenido del blog) tenía un CTA a `/#profile` — el formulario holístico que nunca se construyó — y prometía "te diseñamos un protocolo personalizado". La auditoría inicial solo cubrió `app/` y `components/`, no `lib/`.

**Causa:** Los archivos `lib/` con contenido estático (posts) no se incluyeron en el grep de auditoría.

**Arreglo:** Commit `415b19d` en PR #109 — CTA cambiado a `/chat`.

**Regla / receta:**
> El grep de texto prohibido debe incluir siempre `lib/` además de `app/` y `components/`. Ver `qh-seguridad §6` para el comando completo.

---
