-- Backlog v2 — fase V2-F1: portal y rediseño.
-- Encargo 24-nov-2026 (Claude Code). Kristian da el OK aplicando este archivo.
-- Aditivo (on conflict do nothing). Prefijo V2-F1-xx para no mezclar con tareas v1.
-- Aplica con: psql $DATABASE_URL < kimiko/tareas/semilla-v2-f1-2026-11-24.sql
-- o desde el Mac: kimiko/tareas/run.sh --sql kimiko/tareas/semilla-v2-f1-2026-11-24.sql
--
-- Revisión 24-nov-2026 (Claude Code, rama claude/v2-correcciones-entrega):
-- · V2-F1-00: estado cambiado de 'verificada' a 'pendiente'. La tarea se marcó
--   verificada en la entrega original sin auditor ni prueba formal. El criterio
--   «esta fila en kimiko_tareas» (auto-referencial) no es suficiente.
-- · Todas las tareas: añadidos épica, prioridad y criterios de aceptación
--   en el campo descripcion para facilitar el seguimiento.

insert into kimiko_tareas
  (id, titulo, descripcion, monton, responsable, estado, etiquetas, canal, minutos, pasos, prueba, depende_de, orden)
values

-- ── Infraestructura v2 ────────────────────────────────────────────────────────
('V2-F1-00',
 'Infraestructura de agentes y libro de fallos',
 E'Épica: infraestructura v2.\nPrioridad: alta.\nCriterios de aceptación: .claude/agents/ existe con README.md y los 4 archivos de agente; LIBRO_FALLOS.md existe con al menos F-001 y F-002; esta tarea aparece en kimiko_tareas; v1.1 consta en DECISIONES.md. Todos los criterios comprobados por el equipo Auditor, no auto-declarados.\n\nCrear .claude/agents/ con los 4 agentes (construir, mantener, gente, auditor). Crear LIBRO_FALLOS.md. Añadir tareas v2 al backlog. Registrar como v1.1 en DECISIONES.md.',
 'A', 'code', 'pendiente', '{}', null, null,
 '[{"paso": "Crear .claude/agents/ con README.md y los 4 archivos de agente"}, {"paso": "Crear LIBRO_FALLOS.md con F-001 y F-002"}, {"paso": "Crear semilla-v2-f1-2026-11-24.sql y aplicarla"}, {"paso": "Añadir v1.1 en DECISIONES.md"}, {"paso": "El equipo Auditor revisa y da el OK formal"}]',
 'ls .claude/agents/ → 5 archivos; LIBRO_FALLOS.md existe con F-001 y F-002; esta fila en kimiko_tareas con estado verificada tras revisión del Auditor.',
 '{}', 200),

-- ── Paso 0: quitar promesas que no existen ────────────────────────────────────
('V2-F1-01',
 'Paso 0 · Quitar de la web lo que promete y no existe',
 E'Épica: honestidad del contenido (encargo v2).\nPrioridad: crítica — bloquea el primer euro.\nCriterios de aceptación: 0 menciones de «inteligencia artificial» o «IA» en portada, metadatos, ChatBot, Footer y HowItWorks salvo que el servicio exista real; botón de Quantum Pro conectado a leads o marcado «Próximamente»; paso 03 de HowItWorks sin prometer plan nutricional generado; paso 04 sin «El sistema aprende»; Kristian da ✅ tras ver la vista previa de Vercel.\n\nEliminar ProfileCTA («Generar mi plan» + API /api/profile/ que llama a PapuExt). Corregir HowItWorks: paso 02 «La IA analiza y conecta» y fila «Quantum Pro · Protocolo». Ajustar features de Quantum Pro en config.ts a lo que realmente existe. Corregir Hero, layout, ChatBot, Footer y terminos.',
 'A', 'code', 'esperando_ok', '{prod}', null, null,
 '[{"paso": "Quitar <ProfileCTA /> de app/page.tsx"}, {"paso": "Corregir STEPS paso 02 en HowItWorks.tsx"}, {"paso": "Quitar fila ''Quantum Pro · Protocolo'' de SAMPLE_PLAN"}, {"paso": "Ajustar PLANS y PRO_ITEMS en config.ts"}, {"paso": "Corregir Hero.tsx: quitar ''inteligencia artificial'' del párrafo y el CTA ''Descubrir mi perfil''"}, {"paso": "Corregir app/layout.tsx: título, metaDescripción, openGraph, twitter y keywords sin ''IA'' falso"}, {"paso": "Corregir ChatBot.tsx: headerStatus y panelFooter sin ''IA local · papu-pro''"}, {"paso": "Corregir Footer.tsx: ''Chat IA'' → ''Asistente''"}, {"paso": "Corregir app/terminos: quitar ''con apoyo de inteligencia artificial''"}, {"paso": "PR con vista previa de Vercel"}, {"paso": "Kristian revisa y da OK"}]',
 'curl portada → 0 "Generar mi plan", 0 "La IA analiza", 0 "Quantum Pro · Protocolo", 0 "inteligencia artificial" en fuentes visibles; ChatBot sin "IA local"; Lighthouse sin errores 500; ✅ de Kristian.',
 '{}', 201),

-- ── Step 1: capturas reales ───────────────────────────────────────────────────
('V2-F1-02',
 'Step 1 · Capturas reales de la web actual',
 E'Épica: rediseño v2 (documentación del estado antes).\nPrioridad: media — necesaria para medir el impacto del rediseño.\nCriterios de aceptación: directorio kimiko/informes/capturas-antes-v2/ existe en el repo con ≥8 archivos PNG o WebP (portada, blog, diccionario, login × móvil 360px y escritorio 1440px); nombres descriptivos; PR abierto con las capturas.\n\nSacar capturas de portada, blog, diccionario y login en móvil (360px) y escritorio (1440px). Guardar en kimiko/informes/capturas-antes-v2/. Son el «antes» para comparar con el rediseño.',
 'A', 'code', 'pendiente', '{}', null, null,
 '[{"paso": "Abrir Chrome con extensión de Claude"}, {"paso": "Capturar portada, blog, diccionario, login en móvil 360px"}, {"paso": "Capturar en escritorio 1440px"}, {"paso": "Guardar en kimiko/informes/capturas-antes-v2/"}, {"paso": "Abrir PR con las capturas"}]',
 'kimiko/informes/capturas-antes-v2/ tiene ≥8 capturas (4 páginas × 2 viewports); PR abierto.',
 '{"V2-F1-01"}', 202),

-- ── Step 2: propuesta de diseño ───────────────────────────────────────────────
('V2-F1-03',
 'Step 2 · Proponer esquema de portada, mapa de áreas y 3 direcciones visuales',
 E'Épica: rediseño v2.\nPrioridad: media — no empieza sin que Kristian elija dirección.\nCriterios de aceptación: documento con esquema de portada (bloques con nombre y función), mapa de 7 áreas (blog, diccionario, libros, talleres, terapeutas, juegos, «lo último»), 3 propuestas visuales con nombre, paleta HEX, tipografía y tono; Kristian elige una y la decisión queda en DECISIONES.md antes de seguir.\n\nEsquema de portada con bloques. Mapa de áreas: blog, diccionario, libros, talleres, terapeutas, juegos, «lo último». Tres direcciones visuales (paleta, tipografía, tono). Kristian elige una. PARAR y esperar su elección.',
 'A', 'code', 'pendiente', '{}', null, null,
 '[{"paso": "Analizar capturas del Step 1 y el contenido real de la web"}, {"paso": "Escribir esquema de portada con bloques"}, {"paso": "Escribir mapa de áreas"}, {"paso": "Preparar 3 direcciones visuales con ejemplos concretos (nombre, paleta HEX, tipografía, tono)"}, {"paso": "Presentar a Kristian y PARAR"}]',
 'Kristian elige una dirección. Decisión registrada en DECISIONES.md.',
 '{"V2-F1-02"}', 203),

-- ── Step 3: sistema de diseño (bloqueado hasta elección) ─────────────────────
('V2-F1-04',
 'Step 3 · Sistema de diseño (tras elección de Kristian)',
 E'Épica: rediseño v2.\nPrioridad: alta — desbloquea toda la capa visual.\nCriterios de aceptación: tokens CSS en globals.css (colores y tipografía de la dirección elegida); todos los textos pasan WCAG AA (contraste ≥4.5:1); rutas /es y /en funcionan; tarjetas de blog con imagen real; sección «Lo último» visible; Lighthouse móvil ≥90/90/95; sin scroll horizontal a 360px; ✅ de Kristian.\n\nCon la dirección elegida: tokens de color y tipografía en globals.css, componentes base, WCAG AA en todo el texto, rutas /es y /en, tarjetas de blog con imagen, contraste del pie, sección «Lo último».',
 'A', 'code', 'bloqueado', '{prod}', null, null,
 '[{"paso": "Leer la dirección elegida en DECISIONES.md"}, {"paso": "Definir tokens CSS (colores, tipografía)"}, {"paso": "Comprobar contraste WCAG AA con axe-core"}, {"paso": "Implementar /es y /en"}, {"paso": "Tarjetas de blog con imagen real"}, {"paso": "Sección ''Lo último''"}, {"paso": "PR con vista previa de Vercel"}, {"paso": "Kristian da ✅"}]',
 'Lighthouse móvil ≥90/90/95; sin scroll horizontal a 360px; 0 imágenes de relleno en blog; ✅ de Kristian.',
 '{"V2-F1-03"}', 204),

-- ── Step 4: prueba del CMS ───────────────────────────────────────────────────
('V2-F1-05',
 'Step 4 · Prueba corta del CMS sobre Postgres actual',
 E'Épica: rediseño v2 / gestión de contenido.\nPrioridad: media — no bloquea el diseño pero sí la publicación autónoma.\nCriterios de aceptación: informe kimiko/informes/cms-evaluacion-2026.md con al menos una opción evaluada (Keystatic, Tina o solo Studio), criterios de edición, versiones y flujo borrador→publicado; recomendación documentada con pros y contras; Kristian aprueba la decisión antes de implementar.\n\nEvaluar si el Postgres de Supabase puede servir de CMS sin herramienta adicional. Criterios: edición de posts desde interfaz sencilla, control de versiones, flujo borrador→publicado. Decisión documentada antes de seguir.',
 'A', 'code', 'pendiente', '{}', null, null,
 '[{"paso": "Inventariar lo que ya existe: tablas blog_posts, plants, kimiko_drafts"}, {"paso": "Probar edición desde Supabase Studio"}, {"paso": "Evaluar alternativas CMS sin coste (Keystatic, Tina, solo Studio)"}, {"paso": "Escribir informe con recomendación"}]',
 'kimiko/informes/cms-evaluacion-2026.md con la decisión y la prueba.',
 '{}', 205),

-- ── Revisor de páginas semanal ───────────────────────────────────────────────
('V2-F1-06',
 'Revisor de páginas semanal (equipo Mantener)',
 E'Épica: calidad continua / equipo Mantener.\nPrioridad: media — previene que vuelvan a colarse promesas falsas.\nCriterios de aceptación: script o workflow ejecutable que abre la web, saca capturas, revisa contraste/enlaces/promesas/fallos visuales y deja informe en kimiko/informes/; al menos una ejecución real produce kimiko/informes/revision-semana-YYYY-WW.md con capturas y ≥1 hallazgo registrado en LIBRO_FALLOS.md si procede.\n\nCron semanal que abre la web en Chrome (con extensión de Claude), saca capturas, revisa contraste/enlaces/promesas/fallos visuales. Deja informe corto en kimiko/informes/ y apunta hallazgos en LIBRO_FALLOS.md. Trabaja solo, sin Kristian.',
 'A', 'code', 'pendiente', '{prod}', null, null,
 '[{"paso": "Escribir script o workflow de revisión semanal"}, {"paso": "Configurar cron (GitHub Actions o LaunchAgent)"}, {"paso": "Primera ejecución manual para validar"}, {"paso": "Revisar informe generado"}]',
 'Primera ejecución real produce kimiko/informes/revision-semana-YYYY-WW.md con capturas y ≥1 hallazgo.',
 '{"V2-F1-02"}', 206)

on conflict (id) do nothing;
