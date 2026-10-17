# Hoja de ruta: terminar la empresa Quantum Holistic (v1)

**Versión 1 · 14-oct-2026 · Cierre previsto de la v1: 31-ene-2027** · Dueño: Kristian · Autor: Claude Code (sesión de planificación del 14-oct)

**Estado:** propuesta para tu OK. Nada de lo que describe está hecho, salvo lo marcado como hecho con su prueba (sección 1). Si algo de aquí choca con la ley, el NÚCLEO de Kimiko, `CLAUDE.md` o `DECISIONES.md`, mandan ellos (sección 9.1).

> **Cómo leerlo.** Un identificador como `F2-04` es la fase 2, tarea 4. **Quién:** Tú, Code (Claude Code) o Kimiko. **OK** es una aprobación tuya: llega con botones por Telegram y, hasta que exista la cola (F0-07), la das escribiendo «sí F0-01» en el chat. **Prueba** es lo que debe ser cierto para dar una tarea por hecha. Lo que no se ha comprobado se escribe «sin verificar». Las fechas son objetivos con holgura calculada sobre las dependencias.

Contenido: 0 Resumen · 1 Punto de partida · 2 Definición de hecho · 3 Fases y puertas · 4 Reparto y tu tiempo · 5 Tareas por fase · 6 Decisiones D1–D6 · 7 Incoherencias · 8 Mejoras de flujo · 9 Reglas de juego · 10 Decisiones técnicas · 11 Ruta crítica y primer euro · 12 Riesgos, supuestos y no verificado · 13 Trazabilidad · 14 Correcciones · Anexos A (instrucciones del Project), B (preguntas al gestor) y C (fuentes)

## 0. Resumen

**Qué es esto.** Una ruta ordenada para dejar Quantum Holistic como un negocio que cobra, se mide y se cuida casi solo: **94 tareas**: 86 repartidas en 6 fases (de la 0 a la 5) y 8 rutinas del régimen permanente (fase 6). Cada una dice quién la hace, de qué depende, para cuándo y con qué prueba se da por hecha. Incluye 37 incoherencias encontradas (2 críticas y 12 altas), 12 mejoras de flujo y 6 decisiones que solo puedes tomar tú.

**Dónde estamos hoy (14-oct, comprobado esta noche).** La web publica (30 artículos, 9 fichas visibles) y Kimiko escribe cada día, pero el proyecto todavía no ingresa nada: 0 leads, 1 perfil y Stripe solo en modo prueba.

**Lo que más pesa** (detalle y pruebas en la sección 7):

1. **I-01 · Crítica.** Cualquier usuario registrado podía cambiar su propio rol, plan o verificación. Cerrado (F0-01/F0-02, comprobado 17-oct): ya no se puede.
2. **I-14 · Crítica.** Quantum Pro, tal como se vende, no existe: el código solo desbloquea el chat sin límite y no hay protocolos, recetas ni planes (0 filas). Cobrarlo sería publicidad engañosa y un riesgo con Stripe. Propuesta (D5): Pro en lista de espera hasta que firmes el Ciclo 1.
3. **I-07 · Alta.** Vercel Hobby no permite uso comercial y la web ya anuncia precios. Antes de cobrar hace falta el plan Pro (D1).
4. **I-13 · Alta.** El dominio no puede recibir ni enviar correo (sin MX).
5. **I-08 · Alta.** La base de datos es la única memoria de Kimiko y no tiene copias de seguridad.

**Cómo se avanza.** Code orquesta, construye y verifica; Kimiko hace lo rutinario; tú haces lo que solo tú puedes: decidir, autorizar, poner identidad y dinero, y revisar como herbolario y chef. Tus tareas van en bloques de 30 minutos como máximo, guiadas paso a paso, desde el móvil (`/hoy` en Telegram) o desde el terminal (`bash kimiko/tareas/run.sh`). Las llaves solo se pegan en el terminal, nunca en el chat.

**Fechas clave.** G0 base estable **20-oct** · G1 listo para cobrar **10-nov** · G2 primer euro de un tercero (objetivo **1-dic**) · G3 Instagram asistido y Kimiko que investiga **22-dic** · G4 ingresos medidos **12-ene** · **G5 Empresa v1: 31-ene-2027**.

**Tu tiempo.** Unas 14,9 h en total hasta enero (media de 56 min por semana). La semana más cargada es la del 16–22 nov con 154 min de 180; diciembre y enero llevan poco a propósito por la temporada de eventos (supuesto: confírmalo). Después, en régimen permanente, unos 63 min por semana.

**Lo que necesito de ti ahora**, por este orden:

1. «sí F0-01»: cerrar el agujero de `profiles` (1 min; es un cambio en la base de datos y necesita tu OK).
2. Contestar D1–D6 (10 min, sección 6): una letra por decisión o «defecto». Los valores por defecto están pensados para no gastar ni cobrar nada sin tu «sí».
3. Pegar las instrucciones del Project (3 min, Anexo A) y corregir el precio anual en Vercel (3 min).

## 1. Punto de partida (14-oct), con pruebas

| # | Área | Estado comprobado | Prueba |
|---|---|---|---|
| 1 | Web y dominio | `quantum-holistic.com` en Vercel (proyecto `quantum-holistic-2`), dominio comprado el 1-may-2026 y renovable el 1-may-2027. Plan de Vercel: Hobby según `CLAUDE.md` (la API no lo expone). | `CLAUDE.md` §2; Vercel `list_domains` del 8-oct (`ESTADO.md`) |
| 2 | Contenido | 119 artículos: 30 publicados, 80 borradores y 9 rechazados. Diccionario: 9 de 57 plantas visibles y 5 fichas listas sin publicar. | Consulta a `blog_posts` y `plants`, 14-oct ~22:00 Madrid (repetida para este documento) |
| 3 | Clientes y dinero | 0 leads, 1 perfil, 0 ingresos del proyecto. Stripe solo en modo prueba (sandbox). | Consultas a `leads` y `profiles` (14-oct); fila de cobro de `ESTADO.md` (13-oct) |
| 4 | Cobro | El aviso de Stripe llega a la web (modo prueba). El plan anual cobra 89 € y la web dice 79 €; `/api/checkout` acepta cualquier precio; los 7 días gratis no existen; el plan Crypto no funciona. | `ESTADO.md` (13 y 14-oct); lectura de `app/api/checkout/route.ts` |
| 5 | Quantum Pro | Lo único que desbloquea `plan = pro` es el chat sin límite. `monthly_protocols`, `nutrition_plans` y `recipes` tienen 0 filas. | Consulta a esas tablas (14-oct, repetida esta noche); `app/api/chat/usage/route.ts` |
| 6 | Chat y plan «de IA» | En producción no usan IA: llaman a n8n y a Ollama en `localhost` (solo existen en tu Mac) y caen a un buscador sobre contenido verificado y a un texto genérico. | Lectura de `app/api/chat/route.ts`, `lib/claude.ts` y `app/api/profile/route.ts` |
| 7 | Seguridad de datos | RLS activado en 30 de 30 tablas. El 14-oct un usuario registrado podía cambiar su rol, plan y verificación en `profiles`, y las 30 tablas aceptaban escrituras de `anon` y `authenticated`. Cerrado (F0-01/F0-02, comprobado 17-oct). | `kimiko_prueba_permisos()` devuelve 0 filas (17-oct) |
| 8 | Dependencias | `npm audit` en la raíz: 15 avisos, 4 en producción (Next crítica, postcss y source-map-js altas, next-intl moderada). GitHub avisaba de 92 el 10-oct. | `npm audit` 14-oct; aviso de GitHub del 10-oct (`ESTADO.md`) |
| 9 | Kimiko | Post diario a las 06:00 UTC (Groq, Gemini, Workers AI), reel al publicar, órdenes y notas de voz por Telegram, `kimiko-orden`, fusión automática y vigilancia. `kimiko-diario` desplegada (v18) no es igual a `main`. | `ESTADO.md`; `list_edge_functions` 14-oct: `kimiko-diario` sigue en la v18 del 9-oct |
| 10 | Redes | Kimiko prepara y tú publicas a mano. Instagram automático no existe (faltan `IG_USER_ID` e `IG_ACCESS_TOKEN`) y la cuenta `kris.biozen` está sin verificar como la buena. | `ESTADO.md` (Redes) y `config.ts` |
| 11 | Correo | `quantum-holistic.com` no tiene MX; `lib/email.ts` envía desde `hola@quantumholistic.com` (otro dominio, no nuestro). El contacto de la web es provisionalmente Gmail. | `ESTADO.md` (fila de correo); Vercel `get_records` del 8-oct |
| 12 | Coste e infraestructura | Dominio pagado y planes gratuitos: Supabase Free (sin copias y con pausa tras 1 semana inactivo), Cloudflare, GitHub Actions, Groq y Workers AI. | `CLAUDE.md` §3.4; documentación de Supabase, 14-oct |
| 13 | Gobierno del proyecto | Cuatro colas de tareas a la vez, instrucciones del Project cortadas en «Trabaje como» y páginas de Notion que ordenan autonomía total y contradicen el NÚCLEO. | Incoherencias I-28 e I-29 |

**Lo que ya funciona y no hay que tocar:** el post diario con tres motores de texto y el filtro de salud de «✅ Publicar»; el reel automático al publicar; la fusión automática de PR y la vigilancia (gitleaks sin fugas en el historial); RLS activado en las 30 tablas; la analítica de Vercel sin cookies.

## 2. Definición de hecho (14 criterios)

«Empresa v1» está terminada cuando se cumplen los 14 criterios, cada uno con su prueba y su fecha, y el informe de cierre (F5-08) lo demuestra.

| # | Criterio | Prueba que lo demuestra | Tareas |
|---|---|---|---|
| 1 | Legal y privacidad en regla | Checklist legal revisada con el gestor y fechada; `curl` a la portada sin dominios de terceros no declarados; alta y baja de un lead de prueba con su constancia de consentimiento. | F1-02, F1-03, F1-05, F1-06, F1-10, F1-11, F2-11, F5-08, F6-08 |
| 2 | Seguridad y datos | Pruebas de permisos en verde en CI; `npm audit --omit=dev` sin altas ni críticas; copia nocturna cifrada y restauración probada hace menos de 30 días. | F0-01, F0-02, F0-03, F1-15, F1-18, F1-19, F5-04, F5-05, F5-08, F6-07 |
| 3 | Cobro real probado | Stripe en vivo; una compra real propia reembolsada; precio anual correcto; solo precios conocidos; al menos un pago real de un tercero. | F0-11, F1-05, F1-12, F1-13, F1-14, F1-20, F2-01, F2-02, F2-03, F2-04 y otras 11 |
| 4 | Alojamiento y correo conformes | Plan comercial de Vercel; correo del dominio con SPF, DKIM y DMARC en pass; correo transaccional verificado. | F1-07, F1-08, F1-09, F5-08 |
| 5 | Contenido sano | El 100 % de lo publicado pasa `revisarPost` y `revisarFicha`; al menos 14 fichas visibles; borradores antiguos archivados o publicables. | F1-16, F1-17, F1-20, F2-01, F2-02, F2-12, F2-13, F2-14, F2-15, F2-16 y otras 4 |
| 6 | Captación y correo | Formulario con consentimiento, doble confirmación, bienvenida de 3 correos y baja con un clic; newsletter semanal solo con ✅. | F1-02, F2-11, F4-02, F4-06, F5-08 |
| 7 | Distribución | Publicación asistida en Instagram probada (con prueba negativa sin ✅), `/ultimo` en la bio y al menos 4 semanas de publicaciones con id registrado. | F3-01, F3-02, F3-03, F3-04, F3-05, F3-06, F3-07, F3-08, F3-09, F4-07 y otras 3 |
| 8 | Medición | `kimiko_metricas` diaria e informe semanal automático (visitas, leads, ventas, coste de IA, cuotas) durante al menos 4 semanas. | F2-10, F3-08, F4-03, F5-08, F6-03 |
| 9 | Autonomía gobernada | Escalera N0–N4 en `DECISIONES.md`, gestor de prompts con vuelta atrás, registro de herramientas, freno de gasto y parada probados. | F0-05, F0-08, F1-01, F3-03, F3-10, F5-01, F5-03, F5-06, F5-08, F6-08 |
| 10 | Operación sin deriva | `/hoy` en uso; `ESTADO.md` solo con pruebas; `DECISIONES.md` al día; 0 contradicciones abiertas; desplegado igual al repo en todas las funciones. | F0-03, F0-04, F0-05, F0-06, F0-07, F0-09, F0-10, F0-12, F0-13, F0-14 y otras 7 |
| 11 | Investigación y mejora continua | Al menos 4 informes semanales de Kimiko con fuentes enlazadas y la decisión de cada propuesta registrada. | F2-19, F3-11, F4-09, F5-08, F6-03, F6-04 |
| 12 | Finanzas ordenadas | Libro mensual de ingresos y costes cuadrado con Stripe y Gumroad; política de gasto vigente; calendario de obligaciones con el gestor. | F1-10, F4-01, F4-10, F5-08, F6-05 |
| 13 | Resiliencia | Lo crítico no depende solo de la suscripción de Claude (Kimiko interno y Code en sesión); runbook de incidentes con simulacro; inventario de secretos con fechas. | F0-08, F1-01, F2-18, F5-04, F5-05, F5-06, F5-07, F5-08, F6-07, F6-08 |
| 14 | Web cuidada | Dirección visual elegida por ti y aplicada; Lighthouse en móvil de al menos 90 en rendimiento, accesibilidad y buenas prácticas y 95 en SEO en portada, blog y una ficha; sin scroll horizontal en móvil. | F4-03, F4-04, F4-05, F5-08 |

## 3. Fases y puertas

| Fase | Nombre | Fechas | Objetivo | Puerta | Tareas |
|---|---|---|---|---|---|
| F0 | Estabilizar | 14-oct a 20-oct | Que nada se rompa ni se filtre mientras construimos: cerrar los agujeros de seguridad, una sola cola de tareas, una sola fuente de verdad y freno de gasto. | G0 | 15 |
| F1 | Cumplir y preparar el cobro | 21-oct a 10-nov | Alojamiento comercial, correo del dominio, textos legales, captación con consentimiento, checkout endurecido, dependencias al día, copias de seguridad y promesas de la web iguales a lo que existe. | G1 | 20 |
| F2 | Producto real, primer cobro y medición | 11-nov a 1-dic | Un Ciclo 1 de Quantum Pro firmado por ti, Stripe en vivo, el primer euro de un tercero y el embudo medido. | G2 | 21 |
| F3 | Distribuir e investigar | 2-dic a 22-dic | Instagram y Facebook con publicación asistida por Kimiko tras tu ✅, enlace de bio, calendario editorial, registro de herramientas y la investigación semanal de Kimiko. Poco tiempo tuyo: es temporada de eventos. | G3 | 11 |
| F4 | Crecer ingresos | 23-dic a 12-ene-2027 | Ritual en Gumroad, SEO, diseño web, newsletter semanal, YouTube Shorts, libro de ingresos y conversaciones con clientes para fijar ofertas y precios con datos. | G4 | 11 |
| F5 | Autonomía de Kimiko y cierre de la v1 | 13-ene-2027 a 31-ene-2027 | Gestor de prompts, simulacros de restauración y de incidente, inventario de secretos, pilotos opcionales e informe de cierre de «Empresa v1». | G5 | 8 |
| F6 | Régimen permanente | desde el 1-feb-2027 | Tareas recurrentes diarias, semanales, mensuales y trimestrales, y el backlog de la v2. | — | 8 |

Una puerta se cierra cuando todos sus criterios están `verificada`. Si no se cumple, no se empieza lo que depende de ella. Reglas que salen de ahí:

- **No se cobra de verdad antes de G1** (alojamiento comercial, gestor consultado, textos legales en vigor, checkout endurecido y compra de prueba de punta a punta).
- **No se publica en redes sin la prueba negativa** de G3: sin tu ✅ no publica.
- **El plan se cambia por versión nueva** (v1.1, v1.2…), con fecha y motivo en `DECISIONES.md`; nadie reordena tareas en silencio.

**G0 · Base estable · 20-oct**

- Ningún usuario puede cambiar su rol, plan ni verificación; lectura anónima de plantas solo de las visibles (F0-01, F0-02)
- La prueba de permisos corre cada día dentro de la base y en CI sobre Supabase local, y avisa o falla si se reabre un permiso (F0-03)
- `kimiko-diario` desplegado = `main` (F0-04)
- Cola única `kimiko_tareas` viva y `/hoy` responde en Telegram (F0-07, F0-13)
- `DECISIONES.md` publicado, instrucciones del Project completas y Notion marcado como histórico (F0-05, F0-06, F0-14)
- Freno de gasto y parada de Kimiko probados (F0-08)
- Ejecutor interactivo v2 ejecuta el módulo de prueba y deja recibo (F0-09)
- PR #66, #67 y #68 resueltos; precio anual corregido; D1–D6 contestadas o con valor por defecto (F0-10, F0-11, F0-12)

**G1 · Listo para cobrar · 10-nov**

- Alojamiento comercial conforme y correo del dominio con SPF, DKIM y DMARC en pass (F1-09, F1-08)
- Gestor consultado y textos legales en vigor (F1-10, F1-11)
- Captación con consentimiento y sin llamadas a Google Fonts (F1-02, F1-03)
- Checkout con lista blanca de precios, prueba de 7 días y compra de prueba de punta a punta en modo prueba (F1-13, F1-14)
- Las promesas de la web coinciden con lo que existe; ninguna ruta de visitantes usa Gemini ni scripts del Mac (F1-05, F1-06)
- `npm audit --omit=dev` sin altas ni críticas (F1-15)
- Posts publicados cumplen los controles de salud (F1-16, F1-17)
- Copia nocturna cifrada funcionando (F1-19)
- Permisos de Kimiko decididos antes del 27-oct (F1-01)

**G2 · Primer euro y embudo medido · 1-dic**

- Ciclo 1 de Quantum Pro firmado y área de miembros mínima (F2-02, F2-03)
- Stripe en vivo con una compra real propia reembolsada (F2-04, F2-05)
- Primer pago real de un tercero registrado (F2-09)
- Informe semanal de métricas llegando por Telegram (F2-10)
- Alta de lead con doble confirmación y bienvenida automática (F2-11)
- Fichas listas publicadas y lote 2 de fotos en marcha (F2-12, F2-15)

**G3 · Instagram asistido y Kimiko que investiga · 22-dic**

- Kimiko publica un reel en Instagram solo tras tu ✅ (y no publica sin ✅) (F3-04, F3-05)
- `/ultimo` en la bio y calendario editorial semanal (F3-06, F3-07, F3-08)
- Registro de herramientas vivo y primer informe de investigación en Telegram con propuestas (F3-10, F3-11)

**G4 · Ingresos medidos y canales activos · 12-ene-2027**

- Newsletter semanal con ✅ y SEO técnico validado (F4-06, F4-03)
- Libro de ingresos cuadrado con Stripe y Gumroad (F4-10, F4-01)
- Conversaciones con clientes resumidas y una decisión de oferta o precio tomada (F4-09)
- Dirección visual elegida y aplicada, con Lighthouse en los mínimos (F4-04, F4-05)

**G5 · Empresa v1 · 31-ene-2027**

- Los 14 criterios de la definición de hecho, cada uno con su prueba (F5-08)
- Gestor de prompts, simulacro de incidente y restauración de la copia hechos (F5-01, F5-06, F5-05)
- Al menos cuatro informes semanales de Kimiko con fuentes y la decisión de cada propuesta registrada (F3-11)

## 4. Quién hace qué, y cuánto tiempo tuyo

### 4.1 Reparto

| Fase | Tú | Code | Kimiko | Tareas | Tu tiempo (min) |
|---|---|---|---|---|---|
| F0 · Estabilizar | 4 | 11 | 0 | 15 | 32 |
| F1 · Cumplir y preparar el cobro | 7 | 13 | 0 | 20 | 248 |
| F2 · Producto real, primer cobro y medición | 12 | 7 | 2 | 21 | 314 |
| F3 · Distribuir e investigar | 4 | 7 | 0 | 11 | 87 |
| F4 · Crecer ingresos | 5 | 6 | 0 | 11 | 163 |
| F5 · Autonomía de Kimiko y cierre de la v1 | 1 | 7 | 0 | 8 | 53 |
| F6 · Régimen permanente | 4 | 2 | 2 | 8 | ≈ 63 por semana |
| Total | 37 | 53 | 4 | 94 | 897 min (≈ 14,9 h) |

- **Kimiko** (agente interno y Kimiko Cloud) hace el trabajo rutinario y la vigilancia: post diario, reel, chequeo, auditoría, informes. Nunca cambia su NÚCLEO ni paga, borra datos o crea credenciales.
- **Claude Code** orquesta: construye, prueba, abre PR, verifica y deja la evidencia; prepara cada bloque tuyo para que solo tengas que ejecutarlo.
- **Tú** haces lo que no se puede delegar: (a) lo que exige tu identidad, tu tarjeta o tu cuenta; (b) lo que exige tu criterio profesional (salud, cocina); (c) las decisiones que solo te corresponden; (d) hablar con personas (gestor, clientes, aliados). Además, aprobar lo delicado con un OK.

### 4.2 Cómo se hace una tarea tuya, de forma interactiva

Es el método que ya usas (`kimiko/guia-tareas.sh`), pero portable y con recibos:

1. Abres `/hoy` en Telegram o `bash kimiko/tareas/run.sh --lista` en el terminal: ves como máximo **5 tareas**, en orden, con canal y minutos.
2. Eliges una (`run.sh F1-07`). El ejecutor te lee los pasos, abre el enlace correcto y te pide solo lo imprescindible. Si la tarea pasa de 30 minutos, se parte en bloques y recuerda en qué paso lo dejaste.
3. Las llaves se piden con `read -s` (no se ven ni quedan en el historial), van directas a Supabase Secrets o a Vercel como «sensibles» y se comparan por huella SHA-256, nunca por pantalla ni por chat.
4. Al acabar, el ejecutor comprueba la prueba de la tarea (sección 5) y guarda un recibo sin secretos en `kimiko_tareas.evidencia`. La tarea queda en `esperando_prueba`.
5. Code ejecuta la comprobación completa y la marca `verificada`, o te dice qué falta. **Nada es «hecho» sin prueba.**
6. Tus «sí» a lo delicado llegan como botones ✅ Aprobar y ✖ Rechazar; quedan guardados con fecha. Ningún paso manual en GitHub: los PR se fusionan solos o con ese botón.

### 4.3 Canales y minutos

| Canal | Qué es | Tareas | Minutos | Ejemplos |
|---|---|---|---|---|
| móvil | Telegram o navegador del móvil; sin ordenador | 16 | 381 | Revisar, decidir, pulsar ✅, comprar de prueba |
| panel web | Navegador (mejor en ordenador): paneles de Vercel, Zoho, Gumroad… | 5 | 76 | Contratar, crear cuentas, copiar registros |
| Mac (terminal) | Exige el Mac: ejecutor con módulo; aquí viven las llaves | 9 | 175 | Llaves, Stripe en vivo, copias, restauración |
| llamada | Hablar con personas | 2 | 105 | Gestor, clientes, aliados |

Regla 3 de `CLAUDE.md`: lo que exige el Mac va siempre marcado como tal y nunca se te da sin avisar.

### 4.4 Sesiones de Mac

Son las únicas tareas que exigen el Mac. Agrúpalas: las tres últimas filas de noviembre caben en una sola sesión de unos 30 minutos.

| ID | Tarea | Módulo | Min | Fecha |  |
|---|---|---|---|---|---|
| F1-19 | Crear el repositorio privado de copias, la clave y los secretos (módulo `backups`) | backups | 15 | 5-nov |  |
| F2-04 | Activar Stripe en vivo (módulo `stripe-vivo`) | stripe-vivo | 45 | 17-nov |  |
| F2-14 | Identificar la foto `JWkug.jpg` | — | 5 | 26-nov | opcional |
| F2-18 | Llaves gratis de NVIDIA, Mistral y OpenRouter (módulo `llaves-ia`) | llaves-ia | 15 | 25-nov |  |
| F2-19 | Llave gratis de Firecrawl (módulo `firecrawl`) | firecrawl | 5 | 26-nov |  |
| F2-20 | Volver a subir tres skills a claude.ai (módulo `skills-claude`) | skills-claude | 10 | 24-nov |  |
| F3-02 | Crear la app de Meta y guardar el token (módulo `meta`) | meta | 35 | 8-dic |  |
| F4-07 | YouTube: canal propio y proyecto de Google (módulo `youtube`) | youtube | 35 | 8-ene-2027 |  |
| F5-05 | Descifrar la copia con tu clave y restaurar en local (módulo `restaurar`) | restaurar | 15 | 22-ene-2027 |  |

### 4.5 Tu tiempo por semana

Cada tarea cuenta en la semana de su fecha límite, con sus minutos propios más los de OK. Capacidad supuesta: **180 min por semana en octubre y noviembre y 90 en diciembre y enero** (temporada de eventos): es un supuesto, corrígelo y lo recalculo. Total: **897 min (≈ 14,9 h)**; media de 56 min por semana.

| Semana | Tu tiempo | Capacidad | Uso | Tareas que vencen |
|---|---|---|---|---|
| 12–18 oct | 14 min | 180 | 8 % | F0-01, F0-02, F0-03, F0-04, F0-06, F0-07, F0-10, F0-11 |
| 19–25 oct | 18 min | 180 | 10 % | F0-08, F0-12, F0-13, F0-14, F0-15 |
| 26 oct–1 nov | 45 min | 180 | 25 % | F1-01, F1-02, F1-04, F1-07, F1-16 |
| 2–8 nov | 130 min | 180 | 72 % | F1-05, F1-08, F1-09, F1-10, F1-12, F1-15, F1-17, F1-18, F1-19 |
| 9–15 nov | 124 min | 180 | 69 % | F1-11, F1-13, F1-14, F1-20, F2-06, F2-12, F2-13, F2-21 |
| 16–22 nov | 154 min | 180 | 86 % | F2-02, F2-03, F2-04, F2-05, F2-10, F2-11 |
| 23–29 nov | 109 min | 180 | 61 % | F2-07, F2-08, F2-14, F2-16, F2-17, F2-18, F2-19, F2-20 |
| 30 nov–6 dic | 28 min | 90 | 31 % | F3-01, F3-03 |
| 7–13 dic | 42 min | 90 | 47 % | F3-02, F3-07, F3-08, F3-10 |
| 14–20 dic | 17 min | 90 | 19 % | F3-04, F3-05, F3-09, F3-11 |
| 28 dic–3 ene | 10 min | 90 | 11 % | F4-04 |
| 4–10 ene | 76 min | 90 | 84 % | F4-01, F4-02, F4-05, F4-06, F4-07, F4-10 |
| 11–17 ene | 77 min | 90 | 86 % | F4-08, F4-09, F4-11 |
| 18–24 ene | 28 min | 90 | 31 % | F5-01, F5-05, F5-06, F5-07 |
| 25–31 ene | 25 min | 90 | 28 % | F5-02, F5-03, F5-08 |

Las semanas del 21 al 27 de diciembre no llevan nada tuyo. En régimen permanente (desde febrero) son unos 63 min por semana: el ✅ diario (3 min), el informe del lunes (20), el resumen mensual al gestor (30) y el Ciclo de Pro (45), repartidos.

## 5. Tareas por fase

Cada fase tiene su tabla y, debajo, la prueba de cada tarea. Los pasos detallados de las tareas tuyas están en `claude/tareas-kristian.md`.

### Fase 0 · Estabilizar · 14-oct a 20-oct · puerta G0

Que nada se rompa ni se filtre mientras construimos: cerrar los agujeros de seguridad, una sola cola de tareas, una sola fuente de verdad y freno de gasto.

Tu tiempo en la fase: 32 min (≈ 0,5 h).

| ID | Tarea | Quién | Tu tiempo | Depende de | Fecha |
|---|---|---|---|---|---|
| F0-01 | Cerrar la escalada de privilegios en `profiles` | Code | OK · 1 min | — | 15-oct |
| F0-02 | Cerrar lecturas y permisos abiertos: terapeutas verificados, plantas en borrador, `chat_usage` y DML sobrante | Code | OK · 1 min | F0-01 | 16-oct |
| F0-03 | Prueba de permisos: función en la base, aviso diario y CI sobre Supabase local | Code | OK · 1 min | F0-02 | 18-oct |
| F0-04 | Desplegar `kimiko-diario` igual a `main` | Code | OK · 1 min | — | 16-oct |
| F0-05 | Crear `DECISIONES.md` con decisiones fechadas, precedencia y escalera de autonomía | Code | — | — | 16-oct |
| F0-06 | Pegar las instrucciones completas en el Project de claude.ai (Anexo A) | Tú | panel web · 3 min | F0-05 | 17-oct |
| F0-07 | Crear la cola única `kimiko_tareas`, el comando `/hoy` e importar esta hoja de ruta | Code | OK · 1 min | F0-02 | 18-oct |
| F0-08 | Freno de gasto y parada de Kimiko | Code | OK · 1 min | F0-07 | 20-oct |
| F0-09 | Ejecutor interactivo v2 con módulos y recibos | Code | — | F0-07 | 20-oct |
| F0-10 | Resolver los PR #66, #67 y #68 (órdenes en ráfaga, migración del disparador y qué es «delicado» para el fusionador) | Code | OK · 3 min | — | 17-oct |
| F0-11 | Corregir el precio anual en Vercel (`STRIPE_PRO_ANNUAL_PRICE_ID`) y redesplegar | Tú | panel web · 3 min | — | 16-oct |
| F0-12 | Contestar D1 a D6 (o dejar que se apliquen los valores por defecto) | Tú | móvil · 10 min | F0-05 | 19-oct |
| F0-13 | Prueba de humo en Telegram: comandos y una nota de voz | Tú | móvil · 5 min | F0-07 | 20-oct |
| F0-14 | Marcar como histórico lo que ordena autonomía total en Notion | Code | OK · 1 min | F0-05 | 19-oct |
| F0-15 | Poner `ESTADO.md` al día (puntero a `/hoy`, numeración arreglada, línea base del 14-oct) y copiar la hoja de ruta a `kimiko/plan/` con un puntero en `CLAUDE.md` | Code | OK · 1 min | F0-07, F0-05, F0-01, F0-02 | 19-oct |

**Pruebas y OK**

- **F0-01** — *Tu OK: cambio en la base de datos.* Prueba: `has_column_privilege('authenticated','public.profiles','role','UPDATE')` da false para `role`, `plan`, `plan_expires_at`, `stripe_customer_id`, `verified`, `email` e `id`; en una transacción con `set local role authenticated`, actualizar `dosha` pasa y actualizar `role` falla con permission denied; `rollback` al final.
- **F0-02** — *Tu OK: cambio en la base de datos.* Prueba: `anon` lee 9 plantas (no 57) y ninguna fila de `profiles`; una vista `terapeutas_publicos` expone solo nombre, foto, bio y especialidades; en `chat_usage` ni `anon` ni `authenticated` escriben directamente; la matriz de las 30 tablas queda en `kimiko/pruebas/permisos.sql`; `get_advisors` sin avisos nuevos.
- **F0-03** — *Tu OK: función en la base y workflow (delicado).* Prueba: `select * from kimiko_prueba_permisos()` devuelve 0 filas en producción y devuelve la fila de `role` en una transacción de prueba que reabre el permiso; el chequeo diario la llama y avisa a Telegram si hay filas; `vigilancia` levanta Supabase local con las migraciones, corre `kimiko/pruebas/permisos.sql` y falla en una rama que reabre el permiso de `role`. Si las migraciones no reconstruyen la base, queda anotado y se usa un volcado de esquema versionado.
- **F0-04** — *Tu OK: despliegue en producción.* Prueba: `supabase functions download kimiko-diario` y `diff` con `main`: 0 diferencias; la acción `chequeo` responde 200; el post de las 06:00 UTC siguiente se escribe con el filtro legal nuevo (fila en `kimiko_updates`).
- **F0-05** — Prueba: Archivo en `main` con D1 a D6 pendientes, la tabla de precedencia y la escalera N0 a N4; `qh-sesion` lo lista en el primer paso de lectura.
- **F0-06** — Prueba: Code lee las instrucciones del Project con `project_info` y comprueba que ya no acaban en «Trabaje como».
- **F0-07** — *Tu OK: base de datos y worker.* Prueba: `select count(*) from kimiko_tareas` coincide con las tareas del plan; `/hoy` responde en Telegram con tus tareas en orden y con botones; `anon` y `authenticated` no tienen ningún privilegio sobre la tabla.
- **F0-08** — *Tu OK: base de datos y Kimiko.* Prueba: Una cuota simulada al 85 % manda aviso a Telegram con la acción exacta; con `kimiko_autonomia.pausado = true` `kimiko-diario` responde `pausado` y no escribe; `/pausa` y `/reanudar` funcionan.
- **F0-09** — Prueba: `bash kimiko/tareas/run.sh --lista` muestra tus tareas; `run.sh hola --dry-run` no cambia nada; el módulo `hola` corre en Ubuntu y en macOS (matriz de `vigilancia`, que trae el bash 3.2 de macOS) y deja un recibo en `kimiko_tareas.evidencia` sin ninguna llave.
- **F0-10** — *Tu OK: migración, workflows y fusionador.* Prueba: Los tres fusionados (o el #68 confirmado como ya fusionado); `kimiko-fusion.yml` en `main` lista funciones, worker y workflows como delicados; `pg_get_triggerdef` de `kimiko_drafts_avisar` igual al archivo del repo; tres órdenes de prueba seguidas se cierran las tres.
- **F0-11** — Prueba: Code crea una sesión de checkout anual en modo prueba y comprueba `amount_total` = 7900.
- **F0-12** — Prueba: `DECISIONES.md` tiene las 6 respuestas o «defecto» con fecha.
- **F0-13** — Prueba: Filas de los 4 comandos y de la voz en `kimiko_updates` con la hora de hoy (cierra los ❓ de `ESTADO.md`).
- **F0-14** — *Tu OK: edita páginas de Notion.* Prueba: Las páginas del Handoff del 26-may y los mandatos v4 y v5 empiezan con un aviso «HISTÓRICO, manda DECISIONES.md»; `notion-fetch` lo muestra.
- **F0-15** — *Tu OK: una línea de puntero en `CLAUDE.md` (reglas).* Prueba: «Lo que solo puede hacer Kristian» se sustituye por un puntero a `/hoy`; encabezado de una sola línea; la línea base lleva su prueba; `kimiko/plan/` contiene la hoja de ruta y el encargo con la misma huella SHA-256 que las del Project (copiadas solo después de verificar los permisos de la base); el diff de `CLAUDE.md` es una sola línea.

### Fase 1 · Cumplir y preparar el cobro · 21-oct a 10-nov · puerta G1

Alojamiento comercial, correo del dominio, textos legales, captación con consentimiento, checkout endurecido, dependencias al día, copias de seguridad y promesas de la web iguales a lo que existe.

Tu tiempo en la fase: 248 min (≈ 4,1 h).

| ID | Tarea | Quién | Tu tiempo | Depende de | Fecha |
|---|---|---|---|---|---|
| F1-01 | Decidir los permisos de Kimiko antes del 27-oct | Code | OK · 5 min | F0-05, F0-08 | 26-oct |
| F1-02 | Captación con consentimiento, doble confirmación y protección contra abuso | Code | OK · 2 min | F0-02 | 30-oct |
| F1-03 | Tipografías propias con `next/font`, sin llamadas a Google | Code | — | — | 27-oct |
| F1-04 | Limpiar duplicados de `app/` y el apodo «q-h.com» | Code | OK · 1 min | F0-05 | 29-oct |
| F1-05 | Igualar las promesas de la web a lo que existe y retirar el código muerto | Code | OK · 10 min | F0-12 | 3-nov |
| F1-06 | Gemini solo para contenido público de back-office | Code | — | F1-05 | 5-nov |
| F1-07 | Crear el correo del dominio (Zoho gratis), dar de alta el dominio en Resend y copiar los registros que piden | Tú | panel web · 35 min (2 bloques) | F0-12 | 30-oct |
| F1-08 | Registros MX, SPF, DKIM y DMARC, y remitente real en Resend | Code | OK · 2 min | F1-07 | 2-nov |
| F1-09 | Contratar Vercel Pro (D1) | Tú | panel web · 10 min | F0-12 | 6-nov |
| F1-10 | Consulta con un gestor (preguntas del Anexo B) | Tú | llamada · 60 min | F0-12 | 6-nov |
| F1-11 | Reescribir los textos legales y de precios con lo que diga el gestor | Code | OK · 15 min | F1-10, F1-03, F1-02 | 9-nov |
| F1-12 | Fusionar el PR #59 (botón Pro y checkout seguro) justo antes del PR de checkout | Code | OK · 2 min | F0-11, F0-02, F1-05 | 6-nov |
| F1-13 | Checkout endurecido: precios en lista blanca, prueba de 7 días y bandera `PRO_ABIERTO` | Code | OK · 3 min | F1-12, F1-10 | 9-nov |
| F1-14 | Compra de prueba de punta a punta en modo prueba | Tú | móvil · 10 min | F1-13 | 10-nov |
| F1-15 | Subir Next, React y next-intl para dejar `npm audit --omit=dev` limpio | Code | OK · 5 min | F1-04 | 8-nov |
| F1-16 | Aplicar precauciones y aviso a los posts publicados y listar los que prometen curar | Code | OK · 2 min | F0-05 | 31-oct |
| F1-17 | Revisar los posts con promesas (como herbolario) | Tú | móvil · 25 min | F1-16 | 4-nov |
| F1-18 | Copia nocturna cifrada de la base: plantilla del workflow y módulo | Code | OK · 1 min | F0-02 | 2-nov |
| F1-19 | Crear el repositorio privado de copias, la clave y los secretos (módulo `backups`) | Tú | Mac (terminal) · 15 min | F1-18, F0-09 | 5-nov |
| F1-20 | Definir qué recibe un cliente Pro el primer mes (Ciclo 1) | Tú | móvil · 45 min (2 bloques) | F0-12 | 9-nov |

**Pruebas y OK**

- **F1-01** — *Tu OK: reglas de Kimiko (PROMPT.md).* Prueba: PR que sustituye «Permisos temporales» por permisos permanentes con límites y revisión trimestral, aprobado por ti en Telegram; el diff no toca el NÚCLEO.
- **F1-02** — *Tu OK: migración de `leads`.* Prueba: POST sin consentimiento → 400; con casilla → fila con `consent_at` y `consent_version`; campo trampa relleno → 200 sin guardar; más de 5 intentos por minuto desde una IP → 429; ningún correo en los logs de Vercel.
- **F1-03** — Prueba: `curl` a `/` no contiene `fonts.googleapis.com`; Lighthouse sin peticiones a Google; capturas antes y después sin diferencia visible.
- **F1-04** — *Tu OK: despliegue de `kimiko-imagen`.* Prueba: `grep` de `q-h.com` y `quantumholistic.com` solo deja menciones explicadas; fuera `app/config.ts`, `app/lib/config.ts`, `app/next.config.js`, `app/lib/claude.ts` y `app/package.json` (tras comprobar que Vercel compila desde la raíz) y `Testimonials.tsx`; build y pruebas en verde; `kimiko-imagen` desplegada igual al repo.
- **F1-05** — *Tu OK: textos de venta y de salud.* Prueba: La vista previa muestra Pro como lista de espera con el texto acordado y sin «detecta si estás en fase de estrés…»; el chat se llama «buscador de contenido verificado»; `/api/profile` sin `analyzeQuantum`, sin `claude-api+quantum` y sin guardar correos en `plan_data`; tú dices sí a los textos.
- **F1-06** — Prueba: `grep` de `generativelanguage` en `app/`, `lib/` y `components/` → 0; `CADENAS.privado` sin Gemini (prueba existente en verde); la nota de `kimiko/PETICIONES.md` corregida con la cita exacta de los términos.
- **F1-07** — Prueba: `dig TXT` del dominio muestra el registro de verificación de Zoho y Zoho marca el dominio como verificado; tienes los registros de Resend para pasar a Code.
- **F1-08** — *Tu OK: DNS del dominio y lectura de un correo de prueba en tu Gmail.* Prueba: `dig MX` y `dig TXT` correctos; tú ves el dominio «Verified» en Resend; un correo de prueba enviado por la web a Gmail llega a bandeja con SPF, DKIM y DMARC en pass (Code lee solo ese mensaje en tu Gmail, con tu OK, y mira las cabeceras); uno enviado al buzón nuevo llega.
- **F1-09** — *Tu OK: pago de 20 $ al mes por asiento.* Prueba: El panel muestra el plan Pro y llega la factura al correo.
- **F1-10** — *Tu OK: gasto en honorarios.* Prueba: `DECISIONES.md` recoge forma de alta, IVA, factura o recibo y denominaciones permitidas, con la fecha de la consulta.
- **F1-11** — *Tu OK: textos legales.* Prueba: Aviso legal, privacidad, cookies y términos con responsable real, base legal, lista de encargados (Supabase, Vercel, Stripe, Resend, MailerLite), desistimiento de 14 días, renovación automática e IVA incluido; cookies describe lo que de verdad se usa; tú los lees en la vista previa y dices sí.
- **F1-12** — *Tu OK: pagos (modo prueba).* Prueba: Pasos 1 a 3 del comentario del PR en modo prueba: mensual 900, anual 7900 y webhook sin firma → 400.
- **F1-13** — *Tu OK: pagos.* Prueba: POST a `/api/checkout` con un precio inventado → 400; con el mensual → sesión con `trial_period_days = 7`, tarjeta obligatoria, 0 € hoy y 9 € el día 8; el plan Crypto no aparece; con `PRO_ABIERTO=false` el botón dice «Lista de espera».
- **F1-14** — Prueba: Webhook 200, `profiles.plan = pro`, suscripción `trialing`, cancelación → `freemium` y reembolso hecho (API de Stripe).
- **F1-15** — *Tu OK: versión mayor en producción.* Prueba: Tres PR con vista previa (herramientas, Next y React, next-intl); `npm audit --omit=dev` sin altas ni críticas; `next build` y pruebas en verde; `/`, `/blog`, `/diccionario` y `/login` → 200 en producción; Lighthouse igual o mejor.
- **F1-16** — *Tu OK: edita contenido publicado.* Prueba: Copia `blog_posts_salud_backup_20261031` creada antes; `revisarPost` sobre los publicados → 0 fallos de estructura; lista de posts con promesas para tu revisión; ningún borrado.
- **F1-17** — Prueba: Cada post de la lista tiene decisión en `kimiko_updates` (publicación o retirada); `revisarPost` → 0 fallos de promesas.
- **F1-18** — *Tu OK: workflow y repositorio privado.* Prueba: PR con la plantilla `copia-nocturna.yml` (cifrado con `age`, solo la clave pública; se instala en el repo privado, no en el público; artefacto con 30 días de retención) y el módulo `backups` del ejecutor; prueba en seco sin secretos; tamaño actual del volcado anotado.
- **F1-19** — Prueba: Primera copia como artefacto de `qh-backups`, descifrada en tu Mac con conteos iguales a producción en 3 tablas.
- **F1-20** — Prueba: Ficha de producto de 1 página en `DECISIONES.md`: qué incluye el Ciclo 1, esfuerzo mensual y qué no se promete.

### Fase 2 · Producto real, primer cobro y medición · 11-nov a 1-dic · puerta G2

Un Ciclo 1 de Quantum Pro firmado por ti, Stripe en vivo, el primer euro de un tercero y el embudo medido.

Tu tiempo en la fase: 314 min (≈ 5,2 h).

| ID | Tarea | Quién | Tu tiempo | Depende de | Fecha |
|---|---|---|---|---|---|
| F2-01 | Borrador del Ciclo 1 de Quantum Pro | Kimiko | — | F1-20, F1-16 | 16-nov |
| F2-02 | Revisar y firmar el Ciclo 1 como herbolario y chef | Tú | móvil · 90 min (3 bloques) | F2-01 | 22-nov |
| F2-03 | Área de miembros mínima para Pro | Code | OK · 2 min | F1-20, F1-13, F1-08 | 20-nov |
| F2-04 | Activar Stripe en vivo (módulo `stripe-vivo`) | Tú | Mac (terminal) · 40 min (2 bloques) + 5 de OK | F1-09, F1-10, F1-11, F1-13, F1-14, F1-08 | 17-nov |
| F2-05 | Primera compra real propia y reembolso | Tú | móvil · 10 min | F2-04 | 19-nov |
| F2-06 | Decir cuándo ofreces sesiones 1:1 | Tú | móvil · 10 min | F1-20 | 13-nov |
| F2-07 | Reserva y cobro de la sesión 1:1 | Code | OK · 2 min | F2-04, F2-06 | 23-nov |
| F2-08 | Ofrecer sesión o lista de espera a 10 personas de tu entorno | Tú | móvil · 60 min (2 bloques) | F2-07, F2-05 | 29-nov |
| F2-09 | Hito: primer pago real de un tercero *(hito)* | Tú | — | F2-08 | 1-dic |
| F2-10 | Métricas diarias e informe semanal por Telegram | Code | OK · 2 min | F0-07, F0-08 | 19-nov |
| F2-11 | Bienvenida de 3 correos con doble confirmación, baja y entrega del regalo por enlace firmado | Code | OK · 5 min | F1-02, F1-08, F1-11 | 20-nov |
| F2-12 | Revisar y publicar las 5 fichas listas y elegir las láminas de árnica y equinácea | Tú | móvil · 35 min (2 bloques) | F0-02, F0-13 | 14-nov |
| F2-13 | Pedir a Kimiko la tanda 1 del lote 2 de fotos | Tú | móvil · 3 min | F0-13 | 13-nov |
| F2-14 | Identificar la foto `JWkug.jpg` *(opcional)* | Tú | Mac (terminal) · 5 min | — | 26-nov |
| F2-15 | Kimiko inserta las 36 fichas del lote 2 como borradores | Kimiko | — | F2-13 | 22-nov |
| F2-16 | Archivar los borradores descartables del blog sin borrarlos y marcar los recuperables para reescribir | Code | OK · 10 min | F0-05 | 25-nov |
| F2-17 | Fusionar plantas duplicadas, corregir la categoría «Magicas» y fijar retención de copias | Code | OK · 2 min | F2-16 | 28-nov |
| F2-18 | Llaves gratis de NVIDIA, Mistral y OpenRouter (módulo `llaves-ia`) | Tú | Mac (terminal) · 15 min | F0-09 | 25-nov |
| F2-19 | Llave gratis de Firecrawl (módulo `firecrawl`) | Tú | Mac (terminal) · 5 min | F0-09 | 26-nov |
| F2-20 | Volver a subir tres skills a claude.ai (módulo `skills-claude`) | Tú | Mac (terminal) · 10 min | F0-09 | 24-nov |
| F2-21 | Fusionador que espera el margen dentro de la misma ejecución | Code | OK · 3 min | F0-10 | 12-nov |

**Pruebas y OK**

- **F2-01** — Prueba: Borrador en `kimiko_drafts` (`en_revision`) con menú de 4 semanas km0, plantas en uso tradicional sin dosis, lista de la compra y 3 recetas; `revisarArticulo` y `revisarClaims` con 0 problemas.
- **F2-02** — Prueba: Estado `aprobado` con tu pulsación y PDF generado.
- **F2-03** — *Tu OK: base de datos y web.* Prueba: Usuario `freemium` en `/cuenta/ciclo` → redirigido; usuario `pro` descarga el PDF por enlace firmado que caduca en 15 minutos; correo de bienvenida Pro recibido.
- **F2-04** — *Tu OK: cuenta de pago y llaves.* Prueba: Stripe en vivo con `charges_enabled = true`; en Vercel `STRIPE_SECRET_KEY` y la firma figuran como «sensible»; una sesión de checkout en vivo se crea (sin cobrar).
- **F2-05** — *Tu OK: cobro real con tu tarjeta (9 €; la comisión puede no reembolsarse, sin verificar).* Prueba: Stripe en vivo: pago `succeeded`, webhook 200, `profiles.plan = pro`, reembolso `succeeded`, perfil de vuelta a `freemium` y recibo por correo.
- **F2-06** — Prueba: `DECISIONES.md` recoge huecos semanales, formato y precio.
- **F2-07** — *Tu OK: pagos.* Prueba: Página de reserva con el pago de 65 € (enlace de pago de Stripe); compra de prueba en vivo reembolsada; llega un correo con los datos de la reserva al buzón del dominio.
- **F2-08** — Prueba: Recuento en `kimiko_tareas.evidencia`: enviados, respuestas y ventas, sin nombres.
- **F2-09** — Prueba: Stripe en vivo: un `charge.succeeded` de un cliente distinto de ti, o una venta en Gumroad.
- **F2-10** — *Tu OK: base de datos.* Prueba: Tabla `kimiko_metricas` con 7 días seguidos de filas; el lunes llega el informe con visitas, leads, ventas, coste de IA y cuotas, cada cifra con su fuente; lo que no se puede medir sale como «sin medir».
- **F2-11** — *Tu OK: envíos a personas reales.* Prueba: Alta de prueba → correo de confirmación → bienvenida 1 al confirmar, 2 y 3 programadas; baja con un clic y estado igual en `leads` y MailerLite; `curl` a `/downloads/primera-noche-tranquila.pdf` → 404 y el enlace del correo funciona y caduca.
- **F2-12** — Prueba: `select count(*) from plants where publicada and ficha_verificada` pasa de 9 a 14.
- **F2-13** — Prueba: La orden queda `hecho` y hay filas nuevas en `plants` con `grok_id` entre 14 y 50.
- **F2-14** — Prueba: El ID 49 aparece en `kimiko/fotos-grok/LOTE-2.md` con su planta.
- **F2-15** — Prueba: Hay 36 filas con `grok_id` entre 14 y 50 (14 existentes y 22 nuevas), todas en borrador y con `revisarFicha` sin problemas.
- **F2-16** — *Tu OK: archivar 63 borradores.* Prueba: Copia `blog_posts_archivo_20261125`; las filas descartables pasan a `status = archived`; 0 borradas; los recuperables (unos 17 a 25) quedan marcados para que Kimiko reescriba uno por semana con los controles de salud, siempre como borrador hasta tu ✅; conteo por estado antes y después.
- **F2-17** — *Tu OK: base de datos.* Prueba: `equinacea` y `echinacea`, `ashwagandha` y `ashwagandha-fruto` quedan en una fila cada una; 0 fichas con categoría «Magicas»; las tablas `*_backup_*` con fecha de caducidad en `DECISIONES.md`.
- **F2-18** — Prueba: `supabase secrets list` muestra `NVIDIA_API_KEY`, `MISTRAL_API_KEY` y `OPENROUTER_API_KEY`; cada una responde 200.
- **F2-19** — Prueba: El módulo la prueba con una llamada de 1 crédito (200) y compara la huella; `supabase secrets list` muestra `FIRECRAWL_API_KEY`.
- **F2-20** — Prueba: Módulo: los .zip están bien formados; tú confirmas que los ves (claude.ai no deja comprobarlo por código).
- **F2-21** — *Tu OK: fusionador (delicado).* Prueba: Un PR de prueba en verde se fusiona entre 10 y 15 minutos después de terminar Vigilancia, sin otra intervención; ejecuciones del fusionador en 48 horas comparadas con las 11 de antes.

### Fase 3 · Distribuir e investigar · 2-dic a 22-dic · puerta G3

Instagram y Facebook con publicación asistida por Kimiko tras tu ✅, enlace de bio, calendario editorial, registro de herramientas y la investigación semanal de Kimiko. Poco tiempo tuyo: es temporada de eventos.

Tu tiempo en la fase: 87 min (≈ 1,4 h).

| ID | Tarea | Quién | Tu tiempo | Depende de | Fecha |
|---|---|---|---|---|---|
| F3-01 | Confirmar la cuenta de Instagram y pasarla a profesional | Tú | móvil · 25 min | F0-12 | 4-dic |
| F3-02 | Crear la app de Meta y guardar el token (módulo `meta`) | Tú | Mac (terminal) · 35 min (2 bloques) | F3-01, F0-09 | 8-dic |
| F3-03 | PR del NÚCLEO: Kimiko puede publicar en redes solo tras tu ✅ | Code | OK · 3 min | F0-05, F0-08, F0-12 | 4-dic |
| F3-04 | `kimiko-distribuir`: reel en Instagram tras tu ✅ | Code | OK · 3 min | F3-02, F3-03, F2-10 | 14-dic |
| F3-05 | Publicar un reel real con ✅ y verlo en Instagram | Tú | móvil · 10 min | F3-04 | 16-dic |
| F3-06 | Página `/ultimo` que redirige al último post publicado | Code | — | F0-05, F0-02 | 8-dic |
| F3-07 | Poner `quantum-holistic.com/ultimo` en la bio de Instagram | Tú | móvil · 3 min | F3-06, F3-01 | 9-dic |
| F3-08 | Calendario editorial semanal con propuesta cada domingo | Code | OK · 2 min | F2-10, F0-07 | 12-dic |
| F3-09 | Reels también en la Página de Facebook | Code | OK · 1 min | F3-04 | 19-dic |
| F3-10 | Registro de herramientas de Kimiko (riesgo, cuota, interruptor y prueba por herramienta) | Code | OK · 2 min | F0-08 | 10-dic |
| F3-11 | Investigación semanal de Kimiko con Firecrawl: informe de los lunes con 3 propuestas | Code | OK · 3 min | F2-19, F2-10, F3-10 | 18-dic |

**Pruebas y OK**

- **F3-01** — Prueba: Con el token del paso siguiente, la llamada `me` de la API devuelve el nombre de usuario y el tipo profesional.
- **F3-02** — Prueba: La llamada `me?fields=id,username` responde 200; la huella en Supabase es igual a la tuya; los dos nombres salen en `supabase secrets list`.
- **F3-03** — *Tu OK: reglas de Kimiko (NÚCLEO).* Prueba: Diff de una sola regla (de «no publica» a «publica solo con ✅ de Kristian») y la tabla de autonomía; aprobado por ti en Telegram.
- **F3-04** — *Tu OK: nueva función y NÚCLEO.* Prueba: Publicación de prueba visible en la cuenta tras ✅; sin ✅ no publica (prueba negativa); fila `distribucion` en `kimiko_updates` con el id; con `pausado = true` tampoco publica; respeta la cuota diaria.
- **F3-05** — Prueba: Reel visible en Instagram con id en `kimiko_updates` y sin ediciones tuyas.
- **F3-06** — Prueba: `curl -I /ultimo` → 307 al último `published`; tras publicar uno nuevo cambia el destino.
- **F3-07** — Prueba: Code abre el perfil público y comprueba el enlace.
- **F3-08** — *Tu OK: base de datos.* Prueba: El domingo llega a Telegram la propuesta de 7 días (tema, red y hora) con ✅ y ✖; lo aprobado se programa; sin repetir planta en 30 días.
- **F3-09** — *Tu OK: publicación en una red.* Prueba: Reel visible en la Página con id registrado, también solo tras ✅.
- **F3-10** — *Tu OK: base de datos y funciones de Kimiko.* Prueba: `kimiko_herramientas` con Groq, Workers AI, Gemini, Resend, Firecrawl y Stripe en lectura; Meta y YouTube se registran al construir su adaptador; una herramienta sin registro no puede llamarse (prueba negativa); el post diario sale igual.
- **F3-11** — *Tu OK: nueva función con llamadas externas.* Prueba: Primer informe en Telegram el lunes 21-dic con 3 propuestas, fuentes enlazadas y menos del 40 % de los 1.000 créditos del mes usados; el informe incluye los requisitos y plazos de TikTok, LinkedIn y Pinterest (backlog de la v2); cada propuesta con ✅, ✖ o ⏸ registrado en `kimiko_tareas`.

### Fase 4 · Crecer ingresos · 23-dic a 12-ene-2027 · puerta G4

Ritual en Gumroad, SEO, diseño web, newsletter semanal, YouTube Shorts, libro de ingresos y conversaciones con clientes para fijar ofertas y precios con datos.

Tu tiempo en la fase: 163 min (≈ 2,7 h).

| ID | Tarea | Quién | Tu tiempo | Depende de | Fecha |
|---|---|---|---|---|---|
| F4-01 | Arreglar el Ritual (19 €) en Gumroad | Tú | panel web · 25 min | F1-10, F1-11, F1-09 | 5-ene-2027 |
| F4-02 | Enlazar el Ritual en la web y en la bienvenida | Code | OK · 1 min | F4-01, F2-11 | 7-ene-2027 |
| F4-03 | SEO técnico: JSON-LD `Article`, mapa del sitio y enlaces internos | Code | — | F1-15, F1-03, F1-02 | 30-dic |
| F4-04 | Elegir la dirección visual A, B o C de la web | Tú | móvil · 10 min | F1-15 | 30-dic |
| F4-05 | Aplicar la dirección visual elegida a las páginas clave y arreglar los problemas del informe de diseño | Code | OK · 10 min | F4-04, F4-03, F1-03, F1-15 | 8-ene-2027 |
| F4-06 | Newsletter semanal: Kimiko redacta, tú dices ✅, MailerLite envía | Code | OK · 3 min | F2-11, F2-10, F3-08 | 8-ene-2027 |
| F4-07 | YouTube: canal propio y proyecto de Google (módulo `youtube`) | Tú | Mac (terminal) · 35 min (2 bloques) | F3-05, F0-09 | 8-ene-2027 |
| F4-08 | Adaptador de YouTube Shorts en `kimiko-distribuir` | Code | OK · 2 min | F4-07, F3-04 | 12-ene-2027 |
| F4-09 | Tres conversaciones de 15 minutos con clientes o interesados | Tú | llamada · 45 min | F2-05, F2-11 | 12-ene-2027 |
| F4-10 | Libro mensual de ingresos y costes con importación de Stripe y Gumroad | Code | OK · 2 min | F2-04, F1-10 | 8-ene-2027 |
| F4-11 | Hablar con 5 tiendas, herbolarios o cocineros de tu zona | Tú | móvil · 30 min | F2-09 | 12-ene-2027 |

**Pruebas y OK**

- **F4-01** — Prueba: El enlace responde 200 y una compra de prueba con cupón del 100 % se completa.
- **F4-02** — *Tu OK: enlace de venta.* Prueba: `/producto/ritual-descanso` enseña el botón de compra solo si el enlace responde; el correo 3 de la bienvenida lo menciona.
- **F4-03** — Prueba: Rich Results Test válido en 3 posts; Lighthouse SEO de al menos 95 en `/`, `/blog` y un post.
- **F4-04** — Prueba: `DECISIONES.md` recoge la dirección elegida (A, B, C o mezcla) con la fecha.
- **F4-05** — *Tu OK: diseño en producción (vista previa).* Prueba: Vista previa con la dirección elegida en portada, blog, una ficha del diccionario, `/terapeutas/papu` y `/login`; Lighthouse en móvil de al menos 90 en rendimiento, accesibilidad y buenas prácticas y 95 en SEO; sin scroll horizontal a 360 px; capturas de antes y después guardadas; tú dices sí.
- **F4-06** — *Tu OK: envíos a suscriptores.* Prueba: Dos envíos reales con ✅; tasa de baja por debajo del 2 %; un intento sin ✅ no sale (prueba negativa).
- **F4-07** — Prueba: El módulo obtiene un token de prueba (200) y lo guarda en Supabase; `supabase secrets list` muestra los nombres.
- **F4-08** — *Tu OK: publicación en una red.* Prueba: Short de prueba publicado tras ✅; cuota diaria de la API respetada.
- **F4-09** — Prueba: `DECISIONES.md` con 3 hallazgos y 1 cambio decidido (oferta, precio o texto).
- **F4-10** — *Tu OK: base de datos.* Prueba: El mes de diciembre cuadra con Stripe al céntimo (cobros menos reembolsos) y con Gumroad; resumen para el gestor generado.
- **F4-11** — Prueba: Recuento en `kimiko_tareas.evidencia`: contactados, respuestas y acuerdos, sin nombres.

### Fase 5 · Autonomía de Kimiko y cierre de la v1 · 13-ene-2027 a 31-ene-2027 · puerta G5

Gestor de prompts, simulacros de restauración y de incidente, inventario de secretos, pilotos opcionales e informe de cierre de «Empresa v1».

Tu tiempo en la fase: 53 min (≈ 0,9 h).

| ID | Tarea | Quién | Tu tiempo | Depende de | Fecha |
|---|---|---|---|---|---|
| F5-01 | Gestor de prompts versionados con casos de oro | Code | OK · 2 min | F0-07, F3-10 | 20-ene-2027 |
| F5-02 | Búsqueda semántica para el diccionario y el chat (opcional) *(opcional)* | Code | OK · 2 min | F3-10, F5-01 | 27-ene-2027 |
| F5-03 | Piloto de nivel N3 (opcional) *(opcional)* | Code | OK · 3 min | F3-05, F2-10, F5-01, F3-10 | 27-ene-2027 |
| F5-04 | Preparar la prueba de restauración de la copia | Code | — | F1-19 | 20-ene-2027 |
| F5-05 | Descifrar la copia con tu clave y restaurar en local (módulo `restaurar`) | Tú | Mac (terminal) · 15 min | F5-04 | 22-ene-2027 |
| F5-06 | Simulacro de incidente: parada, vuelta atrás y rotación de una llave de prueba | Code | OK · 10 min | F0-08, F5-01, F1-01 | 24-ene-2027 |
| F5-07 | Inventario de secretos con fecha y aviso 30 días antes | Code | OK · 1 min | F3-10 | 23-ene-2027 |
| F5-08 | Informe de cierre de «Empresa v1» y decisión sobre la v2 | Code | OK · 20 min | F2-04, F2-05, F2-09, F2-10, F2-11, F3-04 y otras 20 | 31-ene-2027 |

**Pruebas y OK**

- **F5-01** — *Tu OK: base de datos y funciones de Kimiko.* Prueba: Cambiar un prompt crea versión nueva, corre 10 casos de oro y solo se activa si pasan; `rollback` en un comando; el post diario sale igual con el prompt versionado.
- **F5-02** — *Tu OK: base de datos.* Prueba: 10 consultas reales: la planta correcta entre las 3 primeras en al menos 8; coste 0 €.
- **F5-03** — *Tu OK: reglas de Kimiko (NÚCLEO).* Prueba: Solo si se cumple la puerta N2 a N3 (30 aprobaciones sin editar, 6 semanas de métricas y parada probada); si no, se queda en N2 y se reevalúa el 28-feb.
- **F5-04** — Prueba: Guion que descifra la última copia y la restaura en un Postgres local de tu Mac; compara conteos de 5 tablas; deja escrito cómo se recrean los `cron.job`, las funciones y las políticas que no estén en las migraciones.
- **F5-05** — Prueba: Conteos iguales a producción en 5 tablas y tiempo total anotado.
- **F5-06** — *Tu OK: asistir al simulacro y aprobar el runbook.* Prueba: Parada con `/pausa` en menos de 1 minuto, vuelta atrás de un prompt en menos de 5 y rotación de una llave de prueba; tiempos anotados y `kimiko_runbook` actualizado.
- **F5-07** — *Tu OK: base de datos.* Prueba: Tabla `kimiko_secretos` (solo nombre y caducidad) con `KIMIKO_GH_TOKEN` y el resto; aviso de prueba a Telegram.
- **F5-08** — *Tu OK: leer el informe y decidir qué entra en la v2.* Prueba: Los 14 criterios con su prueba y fecha; lo que falte, con motivo; la decisión tuya sobre qué entra en la v2 queda en `DECISIONES.md`.

### Fase 6 · Régimen permanente · desde el 1-feb-2027

Tareas recurrentes diarias, semanales, mensuales y trimestrales, y el backlog de la v2.

| ID | Rutina | Quién | Frecuencia | Tu tiempo | Depende de |
|---|---|---|---|---|---|
| F6-01 | Cada día: borrador del post a las 06:00 UTC, chequeo y reintentos | Kimiko | cada día | — | F0-04, F0-08 |
| F6-02 | Cada día: revisar y pulsar ✅ Publicar o 🗑 (el reel y la distribución salen solos) | Tú | cada día | móvil · 3 min | F3-05 |
| F6-03 | Cada semana: auditoría y calendario el domingo; métricas e investigación el lunes; un borrador antiguo reescrito | Kimiko | cada semana | — | F2-10, F3-08, F3-11, F2-16 |
| F6-04 | Cada semana: leer el informe del lunes y decidir las propuestas | Tú | cada semana | móvil · 20 min | F2-10, F3-11 |
| F6-05 | Cada mes: enviar el resumen al gestor y revisar cuotas y gasto | Tú | cada mes | móvil · 30 min | F4-10, F0-08 |
| F6-06 | Cada mes: revisar y firmar el Ciclo de Quantum Pro | Tú | cada mes | móvil · 45 min (2 bloques) | F2-02, F2-03 |
| F6-07 | Cada mes: restauración de prueba, Dependabot, revisión de prompts y de cuotas | Code | cada mes | — | F5-05, F5-01, F3-10 |
| F6-08 | Cada trimestre: revisión legal con el gestor, escalera de autonomía, llaves y definición de hecho | Code | cada trimestre | OK · 60 min | F5-08, F5-07 |

**Pruebas y OK**

- **F6-01** — Prueba: Una fila `blog` o `chequeo` en `kimiko_updates` cada día.
- **F6-02** — Prueba: Una publicación o retirada por día en `kimiko_updates`.
- **F6-03** — Prueba: Cuatro mensajes por semana en Telegram, cada uno con su fuente.
- **F6-04** — Prueba: Cada propuesta con decisión registrada y `/hoy` vacío el domingo.
- **F6-05** — Prueba: Resumen enviado y política de gasto revisada en `DECISIONES.md`.
- **F6-06** — Prueba: Ciclo del mes en `aprobado` antes del día 25 y entregado el día 1.
- **F6-07** — Prueba: Informe mensual en la bitácora con restauración probada y avisos de Dependabot a cero.
- **F6-08** — *Tu OK: revisión trimestral con el gestor y decisiones.* Prueba: Acta en `DECISIONES.md` con la escalera revisada, llaves rotadas y criterios cumplidos.

## 6. Decisiones que solo puedes tomar tú (D1 a D6)

Se contestan con una letra por decisión («D1 A, D2 A…») o con «defecto», por Telegram o por el chat; Code lo copia a `DECISIONES.md` con la fecha. Los valores por defecto están pensados para **no gastar ni cobrar nada sin tu «sí»**: aunque una decisión se quede sin contestar, cada gasto o cobro seguirá pidiendo tu OK propio.

| ID | Decisión | Recomendada | Límite | Si no contestas |
|---|---|---|---|---|
| D1 | Alojamiento comercial de la web | A | 30-oct | Queda en espera. |
| D2 | Alta fiscal, facturación y títulos | A | 23-oct | Queda en espera: cada día sin respuesta retrasa el primer cobro un día. |
| D3 | Correo del dominio | A | 23-oct | Se aplica el valor por defecto. |
| D4 | Redes y nivel de autonomía de publicación | A | 25-nov | Se aplica el valor por defecto. |
| D5 | Qué se vende primero y cuándo se abre Quantum Pro | A | 30-oct | Se aplica el valor por defecto. |
| D6 | Qué manda cuando los documentos chocan, y qué significa «Quantum» | A | 20-oct | Vigente desde hoy con el valor por defecto; si lo cambias, se corrige. |

### D1 · Alojamiento comercial de la web

**Límite: 30-oct** · **Afecta a:** F1-09

**Pregunta.** ¿Cómo cumplimos los términos de Vercel? La página oficial dice que Hobby es solo para uso personal no comercial y cuenta como comercial «anunciar la venta de un producto o servicio» y «cualquier método de pedir o procesar pagos». La web ya anuncia Pro (9 €) y la sesión (65 €).

- A. Vercel Pro: 20 $ por asiento y mes (≈ 18–19 €, sin IVA; varía con el cambio). Recomendada.
- B. Mover la web a otro alojamiento gratuito que permita uso comercial: es un cambio de plataforma (exige tu «sí» explícito), requiere pasar antes a Next 15 y lleva semanas.
- C. Seguir en Hobby y asumir el riesgo de suspensión: no recomendada.

**Por defecto.** A, contratada como muy tarde el 6-nov y antes de activar Stripe en vivo. Si no contestas, no se activa ningún cobro real.

**Si no contestas.** Queda en espera.

### D2 · Alta fiscal, facturación y títulos

**Límite: 23-oct** · **Afecta a:** F1-10

**Pregunta.** ¿Cómo se factura (forma de alta, IVA, factura o recibo) y qué denominaciones profesionales puedes usar en la web y en las facturas?

- A. Consulta con un gestor antes del primer cobro (preguntas en el Anexo B). Recomendada.
- B. Mientras tanto, vender solo productos digitales por Gumroad (actúa como comerciante registrado y gestiona el IVA internacional), sabiendo que los ingresos hay que declararlos igual.
- C. Cobrar sin consultar: no recomendada.

**Por defecto.** A, con la consulta hecha antes del 6-nov. Hasta entonces, ningún cobro real por Stripe.

**Si no contestas.** Queda en espera: cada día sin respuesta retrasa el primer cobro un día.

### D3 · Correo del dominio

**Límite: 23-oct** · **Afecta a:** F1-07, F1-08

**Pregunta.** ¿Qué servicio recibe el correo @quantum-holistic.com? Hoy el dominio no tiene MX y los avisos por correo no pueden salir.

- A. Zoho Mail gratis: hasta 5 usuarios y 5 GB cada uno, sin IMAP ni POP; la página dice que solo está disponible en algunos centros de datos (sin verificar para tu región). Recomendada.
- B. Reenvío gratuito de un tercero hacia Gmail más envío con Resend.
- C. Google Workspace de pago.

**Por defecto.** A. Si Zoho no está disponible en tu región, B.

**Si no contestas.** Se aplica el valor por defecto.

### D4 · Redes y nivel de autonomía de publicación

**Límite: 25-nov** · **Afecta a:** F3-01, F3-03

**Pregunta.** ¿Qué redes primero y cuánta autonomía tiene Kimiko para publicar?

- A. Instagram y Facebook primero; después YouTube Shorts. Kimiko publica solo tras tu ✅ (nivel N2). Recomendada.
- B. Todas a la vez: TikTok y LinkedIn exigen que aprueben una aplicación (plazos sin verificar).
- C. Seguir manual (nivel N1).

**Por defecto.** A. Cambiar la regla del NÚCLEO que hoy prohíbe publicar en redes lo decides tú con un PR propio (tarea de la fase 3).

**Si no contestas.** Se aplica el valor por defecto.

### D5 · Qué se vende primero y cuándo se abre Quantum Pro

**Límite: 30-oct** · **Afecta a:** F1-05, F1-20, F1-13

**Pregunta.** Hoy Pro promete un protocolo mensual, seguimiento adaptativo y guías, pero el código solo desbloquea el chat sin límite. ¿Qué se cobra primero?

- A. Primero lo que existe: sesión 1:1 (65 €) y Ritual (19 €). Pro pasa a lista de espera hasta que el Ciclo 1 esté firmado por ti. Recomendada.
- B. Abrir Pro ya con lo que hay: no recomendada (ver I-14).
- C. Cambiar el modelo (por ejemplo, cocina medicinal a medida o talleres): decisión tuya, el plan se rehace en esa parte.

**Por defecto.** A. Además, ya decididas: precio anual 79 €, prueba de 7 días con tarjeta solo cuando Pro abra, y plan Crypto oculto hasta que haya servidor BTCPay de terceros.

**Si no contestas.** Se aplica el valor por defecto.

### D6 · Qué manda cuando los documentos chocan, y qué significa «Quantum»

**Límite: 20-oct** (no bloquea ninguna tarea) · **Afecta a:** F0-05, F0-06, F0-14

**Pregunta.** Las páginas de Notion (mandatos de mayo con publicación autónoma), las instrucciones del Project (truncadas en «Trabaje como») y `CLAUDE.md` con el NÚCLEO se contradicen. ¿Cuál manda? ¿Y la «cuántica»?

- A. La tabla de precedencia de la sección 9 (ley, NÚCLEO y `CLAUDE.md`, `DECISIONES.md`, esta hoja de ruta, Project, `ESTADO.md`, Notion e históricos). «Quantum» es solo nombre de marca: sin promesas ni código de computación cuántica. Recomendada.
- B. Integrar la «cuántica» como línea de producto: no recomendada, no hay base técnica ni evidencia y es riesgo con Stripe y con consumo.

**Por defecto.** A. Si dos fuentes chocan, Claude se detiene y te avisa antes de seguir (es la regla que ya acordamos).

**Si no contestas.** Vigente desde hoy con el valor por defecto; si lo cambias, se corrige.

## 7. Incoherencias encontradas (37)

Ordenadas por gravedad. «Prueba» dice cómo se comprobó (o «sin verificar»). Cada una se resuelve en una tarea o en una decisión.

**Resumen:** 2 críticas · 12 altas · 20 medias · 3 bajas.

| ID | Gravedad | Qué pasa | Prueba | Se resuelve en |
|---|---|---|---|---|
| I-01 | Crítica | Un usuario registrado podía cambiar su propio rol, plan o verificación | Cerrado (F0-01/F0-02, comprobado 17-oct). `kimiko_prueba_permisos()` devuelve 0 filas | F0-01, F0-03 |
| I-14 | Crítica | Quantum Pro, tal como se vende, no existe como producto | Lo único que el código desbloquea con `plan = pro` es el chat sin límite (gratis: 5 al día). `monthly_protocols`, `nutrition_plans` y `recipes` tienen 0 filas. Prometidos sin código ni contenido: protocolo mensual, «detecta si estás en fase de estrés, fatiga o pico de forma», guías PDF, plan nutricional avanzado. Cobrarlo sería publicidad engañosa y riesgo con Stripe, que prohíbe «afirmaciones exageradas» y nutracéuticos con afirmaciones dañinas. `config.ts`, `app/api/chat/usage/route.ts` y consultas, 14-oct | F1-05, F1-20, F2-01, F2-02, F2-03, D5 |
| I-02 | Alta | La ficha pública de terapeutas verificados mostraba datos privados (correo e id de cliente de Stripe) | Cerrado (F0-01/F0-02, comprobado 17-oct). Latente: no había terapeutas verificados | F0-02 |
| I-03 | Alta | Las plantas en borrador se podían leer por la API aunque la web las ocultara (regla 8) | Cerrado (F0-01/F0-02, comprobado 17-oct) | F0-02 |
| I-06 | Alta | La captación no pide consentimiento ni tiene protección contra abuso, y el regalo es un PDF público | `app/api/leads/route.ts` guarda cualquier correo con la clave de servicio, sin casilla, sin finalidad y sin límite de peticiones; `app/regalo/primera-noche/RegaloForm.tsx` apunta a `/downloads/primera-noche-tranquila.pdf`, descargable sin dar el correo. Lectura del código, 14-oct | F1-02, F2-11 |
| I-07 | Alta | Vercel Hobby es solo para uso personal no comercial y la web ya anuncia servicios de pago | Página de uso justo de Vercel (revisada el 14-oct): Hobby excluye «anunciar la venta de un producto o servicio» y «cualquier método de pedir o procesar pagos». Pro cuesta 20 $ por asiento y mes. El equipo no expone su plan por API; `CLAUDE.md` dice Hobby | F1-09 |
| I-08 | Alta | La base de datos es la única memoria de Kimiko y no tiene copias de seguridad | Supabase Free: sin copias automáticas y proyectos pausados tras 1 semana de inactividad; Pro (25 $/mes) trae copias diarias con 7 días. `kimiko_updates` 162 filas y 119 artículos. Documentación de Supabase, 14-oct | F1-18, F1-19, F5-05 |
| I-09 | Alta | El plan anual se anuncia a 79 € y Stripe cobra 89 € | `STRIPE_PRO_ANNUAL_PRICE_ID` apunta al precio antiguo (variable sin tocar desde abril). Sesiones de prueba del 13-oct: mensual 900, anual 8900. `ESTADO.md` | F0-11 |
| I-10 | Alta | `/api/checkout` acepta cualquier precio que llegue en la petición | Dicho en `ESTADO.md` (próximos pasos, punto 0) y pendiente de arreglo. El PR #59 no lo cubre | F1-13 |
| I-13 | Alta | El dominio no puede enviar ni recibir correo | `quantum-holistic.com` sin MX; `lib/email.ts` envía desde `hola@quantumholistic.com` (otro dominio, sin MX y no nuestro). El contacto de la web es provisionalmente Gmail. Vercel `get_records` del 8-oct y `ESTADO.md` | F1-07, F1-08 |
| I-15 | Alta | El chat «asistente holístico» y el «plan semanal generado por IA» no usan IA en producción | `app/api/chat/route.ts` y `lib/claude.ts` llaman a n8n y Ollama en `localhost` (solo existen en el Mac de Kristian); en Vercel el chat cae a un buscador sobre el contenido verificado y el plan a un texto genérico «modo offline». `app/api/profile/route.ts` ejecuta un script del disco del Mac (`/Volumes/PapuExt/...`), etiqueta `claude-api+quantum` y guarda el correo dentro de `plan_data` sin consentimiento; `nutrition_plans` no tiene política de INSERT, así que ni siquiera guarda. Lectura del código, 14-oct | F1-05, F1-06 |
| I-18 | Alta | Hay contenido de salud publicado que no cumple la regla 8 | El 9-oct, 22 de los 25 posts publicados no pasaban `revisarPost` (sin precauciones o sin aviso; 5 con promesas como «aliviar la ansiedad»). Hoy hay 30 publicados: la cifra se recalcula en la primera tarea. `ESTADO.md` | F1-16, F1-17 |
| I-24 | Alta | Lo desplegado no es lo del repo en `kimiko-diario` | Sigue la v18 del 9-oct; `legal.js` y `telegram.js` cambiaron después (#42 y #53). El post diario sale con el filtro legal antiguo. Rompe la regla 7. `list_edge_functions` y `git log`, `ESTADO.md` | F0-04 |
| I-28 | Alta | Las instrucciones se contradicen entre Notion, el Project y el repo | Notion (Handoff del 26-may: «AUTONOMÍA CONCEDIDA», mandatos v4 y v5 con publicación autónoma) frente al NÚCLEO y `CLAUDE.md` (Kimiko no publica; todo nace como borrador) y frente a las instrucciones del Project, cortadas en «Trabaje como». La «computación cuántica» sigue como código muerto (`analyzeQuantum`) y como idea de producto. Es el mismo patrón del conflicto de las fotos de Grok | F0-05, F0-06, F0-14, D6 |
| I-04 | Media | El límite de 5 mensajes del chat se podía saltar y un visitante podía tocar contadores ajenos | Cerrado (F0-01/F0-02, comprobado 17-oct). La tabla estaba vacía | F0-02 |
| I-05 | Media | Las 30 tablas de `public` aceptaban escrituras de `anon` y `authenticated` y solo RLS las frenaba | Cerrado (F0-01/F0-02, comprobado 17-oct) | F0-02, F0-03 |
| I-11 | Media | El plan Crypto se anuncia pero no funciona y su precio no cuadra con Pro | Faltan `BTCPAY_SERVER_URL`, `BTCPAY_API_KEY` y `BTCPAY_STORE_ID` en Vercel (el checkout da error); anuncia 90 €/año frente a 79 € de Pro. Un BTCPay propio exige servidor (coste). `ESTADO.md`, 14-oct | F1-13, D5 |
| I-12 | Media | La descripción del proyecto pide 7 días gratis con tarjeta y no existen | Ni `trial_period_days` en `app/api/checkout/route.ts` ni texto en la web. `ESTADO.md`, 14-oct | F1-13 |
| I-16 | Media | Dependencias con vulnerabilidades en producción | `npm audit` raíz: 15 (4 de producción: Next crítica, postcss y source-map-js altas, next-intl moderada; npm propone Next 16.4.1). Copia `app/package.json` (Next 14.2.5): 22 (10 de producción). GitHub avisaba de 92 el 10-oct (desglose sin verificar). Los avisos de Next se corrigen en 15.5 o superior, que exige React 19 | F1-15, F1-04 |
| I-17 | Media | La web carga las tipografías desde Google en cada visita | `@import` de Google Fonts en `styles/globals.css` y `app/styles/globals.css`: la IP del visitante llega a Google. La postura de la AEPD no está verificada. Lectura del código, 14-oct | F1-03 |
| I-19 | Media | 80 borradores y 9 rechazados sin resolver | 79 borradores antiguos (71 de abril), 27 sobran por títulos duplicados y 35 tienen menos de 1.500 caracteres. Nada se ha borrado. `ESTADO.md` y consulta, 14-oct | F2-16 |
| I-20 | Media | Solo 9 de 57 plantas son visibles y hay 5 fichas listas sin publicar | `publicada and ficha_verificada`: 9 filas. Valeriana, jengibre, lavanda, tomillo y salvia esperan tu revisión; el lote 2 de fotos (36) no ha empezado. Consulta, 14-oct | F2-12, F2-13, F2-15 |
| I-22 | Media | Documentos y código con dominios equivocados | `q-h.com` (no es nuestro, está en venta) en documentos internos y en `_kimiko/lib/imagen.js:8`; `quantumholistic.com` sin guion y «Bristol» en README, `app/README.md`, `app/config.ts`, `app/lib/config.ts` y `app/next.config.js` (redirecciones al dominio equivocado). `kimiko/informes/incoherencias.md` y `ESTADO.md` | F1-04 |
| I-23 | Media | El ejecutor de tareas solo funciona en el Mac de Kristian | `kimiko/guia-tareas.sh` usa rutas `/Volumes/Papu Ext/...`, `open` y `shasum`, y tiene 4 tareas fijas del 8-oct. `CLAUDE.md` regla 3 exige avisar cuando algo requiere el Mac | F0-09 |
| I-25 | Media | El fusionador depende de un horario de GitHub que casi no corre | 11 ejecuciones programadas entre el 12-oct y el 13-oct 09:47 UTC frente a unas 100 esperadas. `ESTADO.md` | F2-21 |
| I-26 | Media | Cola de órdenes con migración desfasada y órdenes en ráfaga que se cancelan | Versión de la migración distinta en la base (`20261013143834`) y en el repo (`20261013170000`); el disparador `kimiko_drafts_avisar` solo existe en la base; `concurrency` cancela la segunda orden si llega una tercera (PR #67 y #66, sin aplicar). `ESTADO.md` | F0-10, F0-03 |
| I-27 | Media | Los permisos temporales de Kimiko tienen fecha de revisión (27-oct) sin resultado definido | `kimiko/PROMPT.md`, sección «Permisos temporales»: revisión el 27-oct-2026 y «Kristian retira o amplía estos permisos por PR». Sin decisión, el 28-oct es ambiguo | F1-01 |
| I-29 | Media | Cuatro colas de tareas a la vez y documentos del Project obsoletos | `ESTADO.md` «Lo que solo puede hacer Kristian» (numeración rota: 0 a 8, 3b, 7b, 7c y dos «8»), `claude/tareas-kristian.md` del 13-oct, `kimiko/PETICIONES.md` y la cola de Telegram. Los documentos del Project eran de agosto, 5-oct y 8-oct | F0-07, F0-15 |
| I-30 | Media | La regla «coste 0 €» no distingue lo opcional de lo obligatorio | `CLAUDE.md` §3.4. Chocan con ella Vercel Pro (obligación, D1), el gestor, las copias y un futuro Supabase Pro. Sin política de gasto ligada a ingresos | F0-08, D1 |
| I-31 | Media | Hay tablas de salud creadas y vacías | `health_profiles`, `health_connections`, `health_summaries` y `monthly_protocols` (0 filas). Son datos de categoría especial (RGPD art. 9): si se usan hace falta consentimiento explícito, evaluación de impacto y ningún proveedor de IA que los use para entrenar | F1-11, F1-10 |
| I-32 | Media | Gemini gratuito: los términos exigen servicios de pago cuando el cliente de la API lo usan visitantes del EEE | Términos de la API (14-oct): «You may use only Paid Services when making API Clients available to users in the European Economic Area…». Si el desarrollador está en el EEE, los términos de datos de pago valen también para el cupo gratuito (frase recortada en mi lectura). `lib/claude.ts` llama a Gemini para visitantes. Corrige la nota de `PETICIONES.md` | F1-06, F1-05 |
| I-33 | Media | El producto Ritual (19 €) de Gumroad tiene el enlace roto | `app/producto/ritual-descanso/page.tsx` oculta el botón si Gumroad devuelve 404; `KIMIKO_MEMORIA.md` lo da por roto desde el 28-jul | F4-01 |
| I-36 | Media | La cuenta de Instagram no está verificada como la buena y queda un enlace de YouTube que da 404 | `config.ts` apunta a `instagram.com/kris.biozen` («sin verificar que sea la cuenta buena») y conserva `youtube.com/@quantumholistic` (404; ya no se muestra). `ESTADO.md` y `config.ts` | F3-01, F4-07 |
| I-37 | Media | El fusionador no trata como delicados las funciones, el worker ni los workflows mientras el PR #68 siga sin fusionar | `kimiko-fusion.yml` en `main` (copia leída el 14-oct) lista como delicado: base de datos, pagos, reglas de Kimiko y el propio fusionador. El PR #68, que añade funciones, worker y workflows, figura abierto en la cola del 13-oct y no aparece en `ESTADO.md`; su estado actual está sin verificar | F0-10 |
| I-21 | Baja | Datos duplicados y copias sueltas | `equinacea` y `echinacea`, `ashwagandha` y `ashwagandha-fruto`; categoría «Magicas» en 4 fichas publicadas; tablas `*_backup_*` sin política de retención. `ESTADO.md` | F2-17 |
| I-34 | Baja | Llaves de Stripe legibles en Vercel y avisos viejos de Make.com solo desactivados | `STRIPE_SECRET_KEY` figura como «readable-secret»; los 2 webhooks de Make.com están desactivados, no borrados. `ESTADO.md` | F2-04 |
| I-35 | Baja | Las skills de claude.ai están desactualizadas | La copia de `qh-sesion` en claude.ai no tiene el paso de la cola `para_claude`. `ESTADO.md`, revisión del 13-oct | F2-20 |

## 8. Mejoras del flujo de trabajo (W1 a W12)

No son sugerencias: cada una está convertida en tarea y se ejecuta dentro del plan. «Se mide con» es lo que dirá `ESTADO.md` cuando esté hecha.

| ID | Mejora | Qué cambia | Por qué (hoy) | Tareas | Se mide con |
|---|---|---|---|---|---|
| W1 | Una sola cola viva | `kimiko_tareas` en Supabase y `/hoy` en Telegram sustituyen a las cuatro colas de hoy; `ESTADO.md` pasa a ser solo estado con pruebas. | Hoy: 4 colas, numeración rota y un documento del Project de hace 6 días ya desfasado. | F0-07, F0-15 | 0 colas paralelas; `/hoy` muestra como máximo 5 tareas. |
| W2 | Ejecutor interactivo v2 con recibos | Un módulo por tarea, portable (macOS y Linux), con `--dry-run`, huellas en vez de llaves y un recibo sin secretos que se guarda en la cola. | `guia-tareas.sh` solo corre en el Mac con rutas personales y 4 tareas fijas. | F0-09 | Cada tarea de terminal deja recibo; 0 llaves en pantalla, historial o logs. |
| W3 | Bloques de 30 minutos como máximo, por canal | Code agrupa lo tuyo en bloques de móvil, panel, Mac o llamada, de 30 minutos como máximo y con todo preparado de antemano: enlaces, valores y comprobaciones. Una tarea más larga se parte en bloques y el ejecutor recuerda el paso en que la dejaste. | Las tareas llegan sueltas y sin tiempo estimado; la regla 3 pide avisar cuando se necesita el Mac. | F0-07, F0-09 | Cada tarea tuya con canal, minutos y prueba; ningún bloque por encima de 30 minutos (salvo las llamadas con terceros, que duran lo que dure la cita); semana nunca por encima de tu capacidad. |
| W4 | Tus «sí» con un botón de Telegram | Los PR delicados y las acciones con OK llegan con ✅ Aprobar y ✖ Rechazar; el «sí» queda en `kimiko_tareas` con fecha. Hasta que exista la cola (F0-07), tu «sí» es una frase en el chat con el identificador de la tarea: «sí F0-01». | Hoy hay que escribir «sí» en el chat y Code fusiona a mano; ningún paso manual en GitHub. | F0-07, F0-08 | Tiempo medio entre propuesta y OK por debajo de 24 h. |
| W5 | Nada está hecho sin prueba verificada | Pulsar «hecho» deja la tarea en «esperando prueba»; solo pasa a «verificada» cuando Code ejecuta la comprobación y guarda la evidencia. | `ESTADO.md` ya tuvo ✅ sin prueba (corregido a ❓ el 13-oct). | F0-07, F0-09 | 100 % de tareas cerradas con evidencia. |
| W6 | `DECISIONES.md` y conflicto = parar y avisar | Decisiones fechadas y tabla de precedencia; si dos fuentes chocan, nadie elige: se avisa a Kristian. | Notion, Project y repo se contradicen (I-28). | F0-05, F0-14, F0-06 | 0 contradicciones abiertas. |
| W7 | Freno de gasto y parada de Kimiko | Límites por servicio, aviso al 80 % de cada cuota gratuita y un interruptor que pausa todo lo automático. | El 13-oct, Kimiko Cloud falló 5 veces sin que nadie midiera la cuota. | F0-08, F2-10 | Aviso antes de agotar cualquier cuota; parada en menos de 1 minuto. |
| W8 | Bucle semanal de crecimiento | Lunes: informe de métricas e investigación de Kimiko (3 propuestas); domingo: auditoría y calendario. Tú decides con botones. | Hoy no hay medición ni investigación; las ideas llegan en bloques largos por el chat. | F2-10, F3-11, F3-08 | 1 informe por semana y cada propuesta con su decisión registrada. |
| W9 | Gestor de prompts y registro de herramientas | Prompts versionados con casos de oro y vuelta atrás; cada herramienta con riesgo, cuota, interruptor y prueba. | Los prompts viven en `PROMPT.md` y en funciones; añadir una herramienta no deja rastro. | F5-01, F3-10 | Ningún prompt ni herramienta activos sin versión ni prueba. |
| W10 | Copias y simulacro de restauración | Copia nocturna cifrada, prueba mensual de restauración y simulacro de incidente. | Supabase Free no hace copias (I-08). | F1-18, F1-19, F5-04, F5-06 | Última restauración probada hace menos de 30 días. |
| W11 | Fusionador que no depende del reloj de GitHub | El fusionador espera el margen de 10 minutos dentro de la misma ejecución. | 11 ejecuciones programadas en 33 horas frente a unas 100 esperadas. | F2-21 | PR verde fusionado en menos de 15 minutos sin intervención. |
| W12 | Desplegado = repo, comprobado tras cada despliegue y cada mes | Code descarga cada Edge Function y la compara con `main` al terminar un despliegue y en la revisión mensual. Sin token de Supabase en GitHub (T-18). | `kimiko-diario` v18 llevaba 5 días desfasada sin aviso (I-24). | F0-04, F6-07 | 0 diferencias tras cada despliegue y en la revisión mensual. |

## 9. Reglas de juego

### 9.1 Qué manda cuando dos fuentes chocan

| Nivel | Fuente | Qué significa |
|---|---|---|
| 1 | La ley y los términos de las plataformas (Vercel, Stripe, Meta, Google, Supabase) | No se negocia. Si algo choca, se para. |
| 2 | NÚCLEO de `kimiko/PROMPT.md` y `CLAUDE.md` | Solo cambian con un PR de Kristian. |
| 3 | `DECISIONES.md` | Decisiones fechadas de Kristian; mandan sobre todo lo que sigue. |
| 4 | Esta hoja de ruta (`claude/hoja-de-ruta-empresa.md`) | Plan; se corrige por PR o por versión nueva. |
| 5 | Instrucciones del Project de claude.ai | Orientan las conversaciones. |
| 6 | `ESTADO.md` | Es estado con pruebas, no norma. |
| 7 | Notion, documentos antiguos y memoria de sesiones | Solo historia: se leen, no se obedecen. |

Manda el número más bajo de la tabla (el nivel 1 pesa más que el 7). Si no está claro cuál de dos fuentes manda, **nadie elige: se detiene el trabajo y se te avisa** antes de seguir (es lo que debió pasar con las instrucciones de las fotos de Grok). La regla 4 de `CLAUDE.md` («cualquier gasto se propone con importe y se espera el sí») no choca con la política de gasto de 9.3: la política solo fija los topes y los disparadores, y tu sí sigue siendo necesario.

### 9.2 Escalera de autonomía de Kimiko

| Nivel | Nombre | Qué hace | Dónde está hoy | Para subir a este nivel |
|---|---|---|---|---|
| N0 | Observa | Chequeos, auditoría, informes. No cambia nada. | Siempre | — |
| N1 | Prepara | Escribe borradores, reels y textos; tú publicas a mano. | Redes: hoy (decisión del 5-oct) | — |
| N2 | Publica con tu ✅ | Publica cuando pulsas ✅ en Telegram. | Blog y fichas: hoy. Redes: se activa en la fase 3 | Token de Meta verificado, PR del NÚCLEO aprobado por ti y prueba negativa: sin ✅ no publica. |
| N3 | Publica con derecho a veto | Publica sola piezas derivadas de contenido ya aprobado (reels de posts publicados) tras 2 horas de veto. | No | Al menos 30 publicaciones aprobadas seguidas sin editar, 0 incidencias de los controles, 6 semanas de métricas y parada probada. Aprobación tuya por PR del NÚCLEO. |
| N4 | Gestiona dentro de un presupuesto | Decide pequeñas acciones de crecimiento y gasta hasta un tope mensual fijado por ti. | No | 3 meses de ingresos recurrentes, revisión legal externa del contenido y tope en `kimiko_gasto_limites`. |

Subir un peldaño es un PR del NÚCLEO que apruebas tú (etiqueta `regla`). Bajar es inmediato con `/pausa`. Kimiko nunca toca su NÚCLEO, ni paga, ni borra datos, ni crea credenciales, en ningún nivel.

### 9.3 Gasto, disparadores y cuotas

**Niveles de gasto** (el gasto real se compara cada mes en el libro de ingresos):

| Nivel | Se activa con | Qué permite |
|---|---|---|
| Nivel 0 | Ingresos 0 €/mes | Solo el dominio (ya pagado hasta el 1-may-2027), Vercel Pro por obligación (D1) y los honorarios puntuales del gestor, cada uno con tu OK. Todo lo demás, 0 €. |
| Nivel 1 | Ingresos netos de al menos 100 €/mes durante 2 meses seguidos | Hasta el 15 % de los ingresos netos del mes anterior en herramientas, con tu OK por herramienta. |
| Nivel 2 | Ingresos netos de al menos 500 €/mes durante 3 meses | Se revisa el tope y se considera ayuda administrativa; Kimiko sigue sin poder contratar nada. |

**Disparadores** (cuándo se propone pasar a un plan de pago; siempre con tu OK):

| Servicio | Disparador | Por qué |
|---|---|---|
| Supabase Pro (25 $/mes) | Ingresos recurrentes de al menos 150 €/mes o 500 leads con consentimiento | Copias diarias con 7 días, sin pausa por inactividad, protección de contraseñas filtradas. |
| MailerLite de pago | Pasar de 250 suscriptores activos | Con más, el envío se bloquea (campañas y automatizaciones). |
| Resend de pago | Acercarse a 3.000 correos al mes o a 100 al día | Límites del plan gratuito. |
| Firecrawl de pago | No antes del nivel N3 | El plan gratuito da 1.000 créditos al mes, renovados cada mes. |

**Cuotas gratuitas vigiladas** (aviso a Telegram al 80 % de cada una, con la acción exacta):

| Servicio | Cuota | Uso |
|---|---|---|
| Cloudflare Workers AI | 10.000 neuronas al día | Texto de respaldo e imágenes flux |
| Groq | 1.000 peticiones al día | Primer motor del blog y de las órdenes; Whisper |
| Firecrawl | 1.000 créditos al mes | Investigación semanal (se usará como máximo el 40 %) |
| Resend | 3.000 correos al mes y 100 al día | Solo correo transaccional |
| MailerLite | 250 suscriptores y 2.500 correos al mes | Bienvenida y newsletter |
| Supabase Free | 500 MB de base de datos; pausa tras 1 semana sin actividad | Base única |
| Instagram (API oficial) | 100 publicaciones por API cada 24 horas según la guía de Meta (la misma guía da 50 para carruseles) | Muy por encima de nuestro uso |

### 9.4 Llaves, datos y estados de una tarea

**Llaves**

- Solo se pegan en el terminal del Mac con el ejecutor (`read -s`): no se ven, no quedan en el historial ni en el chat, y van directas a Supabase Secrets, a Vercel como «sensibles» o a los secretos del repositorio privado de copias.
- Se comprueban por huella SHA-256 (la misma que muestra `supabase secrets list`), nunca enseñando el valor.
- Una llave que aparece en un chat, un PR o un log se considera comprometida: se rota en esa misma sesión.
- El repositorio es público: ni llaves ni datos personales (correos, nombres, `chat_id`) en código, documentos, PR o registros. Los recibos del ejecutor guardan nombres de secretos y huellas, nunca valores.
- Cada secreto tendrá su fecha de caducidad en `kimiko_secretos` desde F5-07; hasta entonces, `KIMIKO_GH_TOKEN` (puesto el 9-oct con 1 año) está como riesgo R10.

**Datos**

- Los correos de leads y los datos de clientes viven solo en Supabase. Nada de eso en `ESTADO.md`, `DECISIONES.md`, bitácoras ni mensajes de Telegram.
- Las tareas con personas (entorno cercano, conversaciones con clientes, alianzas) guardan solo recuentos, nunca nombres.
- Las tablas de salud (`health_*`, `monthly_protocols`) no se usan hasta tener consentimiento explícito y evaluación de impacto (I-31).
- **Fallos de seguridad abiertos:** no se describen en el repositorio público mientras sigan abiertos. Primero se cierran en la base y después se abre el PR con la misma migración (T-19).

**Estados de una tarea** (`kimiko_tareas.estado`)

| Estado | Significado | Lo cambia |
|---|---|---|
| pendiente | No empezada. Puede tener dependencias sin cerrar. | Sistema |
| en_curso | Empezada (pulsaste ▶ o Code la tiene abierta). | Quien la hace |
| esperando_ok | Preparada por Code; necesita tu «sí» (botón ✅ Aprobar o ✖ Rechazar). | Code |
| esperando_prueba | Hecha; falta ejecutar la comprobación de su prueba. | Tú o Code |
| verificada | La prueba se ejecutó y la evidencia está guardada. **Solo Code o Kimiko la marcan, tras ejecutar la comprobación.** | Code o Kimiko |
| bloqueado | Algo externo la frena; el motivo es obligatorio. | Quien la hace |
| descartado | Se decide no hacerla (motivo y fecha en `DECISIONES.md`). | Tú |
| propuesta | Idea de Kimiko pendiente de tu ✅, ✖ o ⏸. | Kimiko la crea; tú decides |

**Qué necesita tu OK explícito** (cada tarea lleva su etiqueta; la columna «Tareas» cuenta cuántas del plan la llevan):

| Etiqueta | Cuándo | Tareas |
|---|---|---|
| db | Cambios en la base de datos: migraciones, permisos, edición o archivo de contenido publicado. | 19 |
| pago | Dinero: cobros, reembolsos, precios, honorarios o cualquier gasto. | 7 |
| dns | Registros DNS del dominio. | 1 |
| regla | Reglas de Kimiko: NÚCLEO, `PROMPT.md`, `CLAUDE.md`. | 5 |
| envio | Mensajes a personas reales: correo de bienvenida, newsletter. | 2 |
| prod | Despliegues en producción (web, funciones, worker) y publicación en una red. | 9 |
| cred | Crear, rotar o guardar credenciales. | 1 |
| delicado | Workflows, el fusionador y funciones que ejecutan código con permisos. | 6 |

Hasta que exista la cola (F0-07), el OK es una frase en el chat con el identificador de la tarea («sí F0-01»); puedes dar varios en un mensaje y cada OK vale solo para las tareas que nombra. Después son botones de Telegram y quedan guardados con fecha.

### 9.5 Cómo cambia este plan

- **Versiones.** Esta es la v1 (14-oct). Un cambio crea v1.1, v1.2… con fecha y motivo en `DECISIONES.md`. Nadie reordena tareas en silencio.
- **Dos copias, una verdad (T-19).** La del Project y la del repo (`kimiko/plan/`) se actualizan en el mismo paso; si difieren, se para y se te avisa.
- **Revisión semanal.** Cada lunes `/hoy` y la tabla de tu tiempo se recalculan; si una tarea se retrasa, Code recalcula solo las que dependen de ella y te lo dice.
- **Puertas.** Si una puerta no se cumple, no se empieza lo que depende de ella; se avisa con el motivo y una propuesta.
- **Alcance.** Code y Kimiko pueden *proponer* añadir o quitar tareas (estado `propuesta`); decides tú.

## 10. Decisiones técnicas cerradas (T-01 a T-19)

Salen del análisis de esta hoja y no necesitan que decidas nada: se explican para que nadie las reabra sin motivo. Si quieres cambiar una, se hace como cualquier cambio del plan (9.5).

| ID | Decisión | Motivo |
|---|---|---|
| T-01 | Se mantiene la arquitectura congelada (Next en Vercel, Supabase, Worker de Cloudflare, GitHub Actions). No se adoptan n8n, Metricool ni Buffer. | Regla de cambio de plataforma y coste; n8n exige servidor propio y las APIs de Metricool y Buffer son de pago (`kimiko/informes/pipeline-multired.md`). |
| T-02 | Cola única `kimiko_tareas` en Supabase con `/hoy` en Telegram. `ESTADO.md` guarda estado y pruebas, no la cola. | Evita las cuatro colas actuales (I-29). |
| T-03 | Gestor de prompts propio (`kimiko_prompts` con versión, huella y casos de oro). No se adopta LangChain ni LlamaIndex. | La lógica es pequeña y vive en Edge Functions; menos dependencias que mantener. |
| T-04 | Las herramientas externas se llaman por REST desde Edge Functions y se registran en `kimiko_herramientas`. Firecrawl y similares no entran por MCP de Claude. | Kimiko no corre dentro de Claude; las llaves viven en Supabase Secrets. |
| T-05 | Búsqueda semántica con pgvector y bge-m3 de Workers AI, solo si el buscador lo justifica (opcional, fase 5). Sin Pinecone ni Qdrant. | Coste 0 € y datos en un solo sitio. |
| T-06 | Permisos de base de datos: revocar por defecto y conceder por columna. La función `kimiko_prueba_permisos()` vive en la base (devuelve las expectativas rotas; 0 filas = bien) y la llama la auditoría diaria con la llave de servicio que ya tiene; la misma prueba corre en CI sobre Supabase local (`supabase start`) en los PR que tocan migraciones. Ninguna credencial de producción en GitHub. | I-01 a I-05. Evita meter en Actions una contraseña de la base o un token con poder sobre toda la cuenta. |
| T-07 | Subir Next a la versión mínima que deje `npm audit --omit=dev` sin altas ni críticas (15.5 o superior; npm propone 16.4.1), con React 19 y next-intl actual, en 3 PR con vista previa. | I-16. La versión exacta se decide al probar. |
| T-08 | Tipografías con `next/font` (se descargan al compilar y se sirven desde nuestro dominio). | I-17. |
| T-09 | Copias: volcado nocturno cifrado con `age`, guardado como artefacto de Actions con 30 días de retención en el repositorio privado `qh-backups` (el workflow vive allí, no en el público; la contraseña de la base es un secreto de ese repo). Una copia mensual se baja a tu disco. Prueba de restauración mensual. Supabase Pro cuando se cumpla el disparador de la sección 9. | I-08. El volcado cubre la base; lo que haya en Storage (reels) se regenera desde la base y el repo (sin verificar qué más hay). Alternativa a verificar: Cloudflare R2 (sin verificar si pide tarjeta). |
| T-10 | Captación: consentimiento explícito, doble confirmación y constancia (fecha y versión del texto) en `leads`; MailerLite Free para los envíos (250 suscriptores, 2.500 correos al mes); Resend solo para correo transaccional. | I-06. En MailerLite Free la API y el MCP no envían; los envíos van por automatizaciones y campañas. |
| T-11 | Pagos: Stripe Checkout alojado, lista blanca de precios, prueba de 7 días con tarjeta cuando Pro abra; Gumroad para productos digitales sueltos; Crypto oculto. | I-09 a I-12. |
| T-12 | Distribución por las APIs oficiales desde `kimiko-distribuir`, con puerta humana. Instagram y Facebook primero. | `kimiko/informes/pipeline-multired.md`. |
| T-13 | Medición con Vercel Web Analytics (sin cookies: identifica con un hash de la petición y lo descarta a las 24 h) más `kimiko_metricas` propias. Sin Google Analytics. | Documentación de privacidad de Vercel Web Analytics. |
| T-14 | Gemini solo para borradores de contenido público desde el back-office; nunca visitantes ni datos privados. | I-32. |
| T-15 | Ejecutor interactivo v2 en Bash portable, un módulo por tarea, sustituye a `guia-tareas.sh`. | I-23. |
| T-16 | Se copia a mano la skill `schema` de `marketingskills` (solo texto, fijada al commit `b9ba399`) para el JSON-LD `Article`. | Cierra la pregunta 1 de `kimiko/PETICIONES.md`: no cuesta nada ni envía datos. |
| T-17 | El fusionador espera el margen de 10 minutos dentro de la misma ejecución, sin depender del horario de GitHub. | I-25. |
| T-18 | Las Edge Functions se despliegan desde la sesión de Code (CLI) y se comparan con `main` al terminar cada despliegue y cada mes. No se guarda ningún token de Supabase en GitHub mientras no haya ingresos (la propuesta 8 de `ESTADO.md` queda aplazada y se reevalúa junto con Supabase Pro). | Un token de cuenta de Supabase da poder sobre todo el proyecto y un workflow puede editarlo un PR. El coste es alguna deriva ocasional (I-24), cubierta con la comparación obligatoria. |
| T-19 | La hoja de ruta tiene dos copias: la del Project (la lees tú) y la del repo en `kimiko/plan/` (la leen Code y Kimiko). La del repo se crea solo después de verificar los permisos de la base (F0-01 y F0-02) y se actualiza en el mismo PR que cambie la del Project; si difieren, se para y se te avisa. | I-28 y I-29: dos fuentes que se contradicen es justo lo que queremos evitar. El repo es público: no se publican fallos de seguridad que sigan abiertos. |

## 11. Ruta crítica, primer euro y punto de equilibrio

### 11.1 Camino más largo hasta el primer euro de un tercero

Es la cadena de dependencias que fija la fecha del primer cobro. **Margen** = días entre la fecha más temprana posible (según duraciones y dependencias) y la fecha fijada en el plan; con margen 0 cualquier retraso mueve el primer euro.

| ID | Tarea | Quién | Más pronto | Fecha del plan | Margen (días) |
|---|---|---|---|---|---|
| F0-05 | Crear `DECISIONES.md` con decisiones fechadas, precedencia y escalera de autonomía | Code | 15-oct | 16-oct | 1 |
| F0-12 | Contestar D1 a D6 (o dejar que se apliquen los valores por defecto) | Tú | 18-oct | 19-oct | 1 |
| F1-10 | Consulta con un gestor (preguntas del Anexo B) | Tú | 1-nov | 6-nov | 5 |
| F1-13 | Checkout endurecido: precios en lista blanca, prueba de 7 días y bandera `PRO_ABIERTO` | Code | 4-nov | 9-nov | 5 |
| F1-14 | Compra de prueba de punta a punta en modo prueba | Tú | 5-nov | 10-nov | 5 |
| F2-04 | Activar Stripe en vivo (módulo `stripe-vivo`) | Tú | 10-nov | 17-nov | 7 |
| F2-07 | Reserva y cobro de la sesión 1:1 | Code | 14-nov | 23-nov | 9 |
| F2-08 | Ofrecer sesión o lista de espera a 10 personas de tu entorno | Tú | 20-nov | 29-nov | 9 |
| F2-09 | Hito: primer pago real de un tercero | Tú | 22-nov | 1-dic | 9 |

Lo que más retrasa el primer euro son **tus** respuestas a D1 y D2, la cita con el gestor y la activación de Stripe en vivo. Por eso las decisiones tienen fecha límite y un valor por defecto.

### 11.2 Camino hasta la v1

Comparte el tramo anterior hasta F2-04 (Activar Stripe en vivo (módulo `stripe-vivo`)). Después sigue por:

| ID | Tarea | Quién | Más pronto | Fecha del plan | Margen (días) |
|---|---|---|---|---|---|
| F2-05 | Primera compra real propia y reembolso | Tú | 12-nov | 19-nov | 7 |
| F4-09 | Tres conversaciones de 15 minutos con clientes o interesados | Tú | 26-nov | 12-ene-2027 | 47 |
| F5-08 | Informe de cierre de «Empresa v1» y decisión sobre la v2 | Code | 29-nov | 31-ene-2027 | 63 |

Hay mucho margen al final (la v1 podría cerrarse antes de enero), pero se deja a propósito: diciembre y enero llevan poco de tu tiempo y la investigación, el diseño y el libro de ingresos necesitan semanas de datos reales para que el informe diga algo.

### 11.3 Punto de equilibrio (orientativo)

- **Coste fijo previsto:** Vercel Pro, 20 $ por asiento y mes (≈ 18–19 €, sin IVA; varía con el cambio), más los honorarios del gestor (**presupuesto pendiente**, tarea F1-10) y el dominio (ya pagado hasta el 1-may-2027).
- **Una sola sesión 1:1 de 65 € al mes** cubre Vercel Pro. Con Quantum Pro a 9 € al mes harían falta unas **3 suscripciones**, antes de comisiones de Stripe (importe exacto sin verificar) e impuestos.
- El Ritual de Gumroad (19 €) deja unos 16–17 € por venta tras la comisión de Gumroad (10 % + 0,50 $, según su página del 14-oct).
- Estas cifras no son un plan financiero: las valida el gestor y se contrastan cada mes con el libro de ingresos (F4-10).

### 11.4 Qué pasa si no hay ventas

- El gasto no sube: el nivel 0 de 9.3 solo incluye Vercel Pro, el gestor y el dominio. Vercel Pro se factura por mes (condiciones de cancelación sin verificar).
- A mitad de enero, las conversaciones con clientes (F4-09) y el libro de ingresos dicen por qué: oferta, precio, canal o confianza.
- En F5-08 decides con datos entre: ajustar oferta o precio, dedicar más tiempo a captación, cambiar el modelo (opción C de D5) o pausar lo que cuesta dinero y mantener solo lo gratuito.
- Lo ya construido (seguridad, copias, medición, Kimiko, contenido sano) sigue valiendo en cualquiera de esos caminos.

### 11.5 Backlog de la v2 (nada de esto entra en la v1)

- TikTok, LinkedIn y Pinterest: requisitos y plazos en el primer informe de investigación (F3-11); suelen exigir que aprueben la aplicación (plazos sin verificar).
- Búsqueda semántica con pgvector (F5-02, opcional en la fase 5) y lector de métricas de Instagram en el chat.
- Nivel N3 de autonomía (F5-03, opcional) y, más adelante, N4 con presupuesto.
- Un servidor BTCPay de terceros para volver a ofrecer pago con criptomonedas (hoy el plan está oculto).
- Supabase Pro y MailerLite de pago cuando se cumpla su disparador (9.3).
- Ayuda administrativa externa cuando los ingresos alcancen el nivel 2 de gasto.

## 12. Riesgos, supuestos y lo que no he podido verificar

### 12.1 Riesgos

| ID | Riesgo | Probabilidad | Impacto | Respuesta | Tareas |
|---|---|---|---|---|---|
| R1 | Vercel suspende la web por uso comercial en Hobby | Media | Alto | D1: pasar a Pro antes de cobrar | F1-09 |
| R2 | Pérdida de datos (sin copias; pausa por inactividad) | Media | Alto | Copia nocturna cifrada y simulacro mensual | F1-18, F1-19, F5-05 |
| R3 | Kimiko Cloud deja de funcionar por el límite de la suscripción de Claude | Alta | Medio | Kimiko interno para lo simple, llaves gratis de respaldo, Code en sesión para lo demás y métrica de fallos | F2-10, F0-08, F2-18, F5-06 |
| R4 | Stripe cierra la cuenta por afirmaciones de salud | Baja | Alto | Promesas iguales a lo entregado y controles en cada pieza | F1-05, F1-16 |
| R5 | Meta cambia o restringe su API | Media | Medio | Adaptador aislado y vuelta a N1 (publicación manual) | F3-02, F3-04 |
| R6 | Poco tiempo tuyo en diciembre y enero | Alta | Medio | Tu trabajo se concentra en octubre y noviembre; fases 3 y 4 ligeras | F0-12 |
| R7 | Fuga de una llave (repositorio público) | Baja | Alto | Llaves solo por terminal interactivo a Supabase Secrets, gitleaks, inventario con fechas | F0-09, F5-07 |
| R8 | Uso de títulos profesionales no permitidos («nutricionista») | Baja | Alto | Consulta al gestor y revisión de textos | F1-10, F1-11 |
| R9 | Regresión visual o funcional al subir a Next 15 | Media | Medio | 3 PR con vista previa, pruebas y Lighthouse | F1-15 |
| R10 | Caduca el token `KIMIKO_GH_TOKEN` (puesto el 9-oct con 1 año) | Cierta | Medio | Inventario con aviso 30 días antes | F5-07 |
| R11 | La base no se puede reconstruir desde el repo (hay objetos que solo existen en la base) | Media | Medio | Prueba de permisos sobre Supabase local, volcado de esquema versionado y restauración mensual | F0-03, F5-04, F5-05 |
| R12 | Una Edge Function desplegada se separa del repo sin que nadie lo vea (ya pasó con `kimiko-diario`) | Media | Bajo | Comparación tras cada despliegue y cada mes (T-18) | F0-04, F6-07 |

### 12.2 Supuestos (corrígelos si no son ciertos y recalculo)

1. Tu capacidad es de unos 180 minutos a la semana en octubre y noviembre y de unos 90 en diciembre y enero por la temporada de eventos de fin de año. Es un supuesto: corrígelo y recalculo.
2. Code se ejecuta en tu Mac con `gh`, `supabase` y `vercel` ya identificados; Kimiko Cloud sigue disponible (si no, Code trabaja en sesión).
3. El equipo de Vercel es Hobby (lo dice `CLAUDE.md`; la API no expone el plan).
4. Las fechas son objetivos con holgura calculada sobre las dependencias; si una decisión tuya llega tarde, se desplazan solo las tareas que dependen de ella.
5. Abres una sesión de Code al menos dos veces por semana en octubre y noviembre y una en diciembre y enero (o Kimiko Cloud lanza la tarea por una orden tuya de Telegram); Code deja resultados y tu lista del día aunque no estés.
6. Las rutinas de la fase 6 empiezan el día en que se construyen (por ejemplo, el informe de los lunes desde el 21-dic); la fase 6 es el régimen documentado a partir de febrero.

### 12.3 Lo que no he podido verificar

Se dice «sin verificar» donde corresponda en todo el documento. Esta es la lista completa:

- Si Vercel aplica mitigaciones propias a los avisos de Next 14 y si el aviso del procesado de imágenes AVIF afecta a nuestro despliegue.
- Si el plan de Zoho gratis está disponible en tu región y si admite el dominio sin IMAP.
- Si Gumroad paga a cuentas en España y qué documentación fiscal pide.
- Si una app de Meta en modo desarrollo puede publicar en tu propia cuenta sin revisión (la guía no lo aclara) y cuánto dura el token.
- Si un volcado cifrado a un repositorio privado de GitHub sale de verdad a 0 € con tu cuenta, y si Cloudflare R2 pide tarjeta.
- Los límites de uso de la suscripción de Claude: es la hipótesis de los 5 fallos del 13-oct, no está confirmada.
- La postura de la AEPD sobre Google Fonts y las obligaciones de etiquetado de contenido generado por IA (reglamento europeo de IA, art. 50).
- Qué denominaciones profesionales puedes usar y el IVA aplicable a tus servicios: es consulta para el gestor, no conclusión mía.
- Si MailerLite Free admite doble confirmación en tu formulario (la página de precios no lo menciona).
- Si las migraciones del repo reconstruyen la base entera (el disparador `kimiko_drafts_avisar` solo existe en la base) y si `supabase start` corre en Actions con ellas.
- Si ya existe cuenta de Resend con su llave en Vercel (el dominio de envío hay que darlo de alta allí).
- Cuánto pesa hoy la base frente a los 500 MB del plan gratuito y qué hay en Storage además de los reels.

## 13. Trazabilidad: qué se pidió antes y dónde queda

Para que nada se pierda al sustituir las colas antiguas. Estado según `ESTADO.md` del 14-oct (✅ funciona · ⚠️ a medias · ❌ no existe · ❓ sin verificar).

| Origen | Punto | Estado (14-oct) | Dónde queda |
|---|---|---|---|
| 8-oct · A1 | Skill `qh-sesion` | ✅ en el repo; la copia de claude.ai es antigua | F2-20 |
| 8-oct · A2 | Skill `qh-cambio-seguro` | ✅ en el repo; falta subir la versión nueva a claude.ai | F2-20 |
| 8-oct · A3 | Skill `qh-diseno` | ⚠️ tokens comprobados; método de capturas sin verificar | F4-04, F4-05 |
| 8-oct · A4 | Skill `qh-seguridad` | ✅ activa; se refuerza con la prueba de permisos | F0-03 |
| 8-oct · A5 | Skill `qh-editorial` | ⚠️ falta el JSON-LD `Article` | F4-03 (T-16) |
| 8-oct · A6 | Skills de terceros revisadas | ✅ revisadas, ninguna instalada; dos decisiones de `PETICIONES.md` abiertas | F4-03; lector de Instagram: backlog v2 |
| 8-oct · B1 | Manual de tareas `kimiko_runbook` | ✅ 7 tareas | F6-01, F5-06 |
| 8-oct · B2 | Cadena de IAs gratuitas | ⚠️ faltan NVIDIA, Mistral y OpenRouter; Gemini sin decidir | F2-18, F1-06 |
| 8-oct · B3 | Chequeo diario antes del post | ✅ | F6-01 |
| 8-oct · B4 | Auditoría semanal | ✅; se amplía con los permisos | F0-03, F6-03 |
| 8-oct · B5 | Vigilancia gratuita (gitleaks, Dependabot, Lighthouse) | ✅ | F0-03, F6-07 |
| 8-oct · B6 | Autoridad con límites (NÚCLEO y CAPACIDADES) | ⚠️ permisos temporales hasta el 27-oct | F1-01 |
| 8-oct · B7 | Comandos de Telegram `/estado`, `/auditar`, `/manual` | ❓ sin probar desde Telegram | F0-13 |
| 5-oct · 1 | Cron diario de artículos | ✅ escribe a las 06:00 UTC en borrador y publicas tú con ✅ (regla 8, que sustituye al `published=true` del encargo) | F0-04, F6-01, F6-02 |
| 5-oct · 2 | Rotación de temas sin repetir en 30 días | ✅ un tema distinto cada día del 8 al 14-oct; la regla de 30 días sin verificar | F3-08 |
| 5-oct · 3 | Imagen de acuarela con Workers AI y plan B por código | ✅ acuarela flux del 14-oct | — |
| 5-oct · 4 | Controles antes de publicar | ✅ en lo nuevo; ⚠️ en lo ya publicado (I-18) | F1-16, F1-17 |
| 5-oct · 5 | Telegram con 🗑 Retirar y ✏️ Corregir | ✅ funcionan «Publicar» y «Retirar» (visto el 14-oct); «Corregir» sin verificar | F1-17 |
| 5-oct · 6 | Registro en `kimiko_updates` y gasto en `kimiko_spend` | ✅ `kimiko_updates`; `kimiko_spend` sin verificar | F2-10 |
| 5-oct · categorías | Normalizar categorías del blog | ✅ hecho el 8-oct (5 categorías) | — |
| 5-oct · redes | Instagram automático con ✅ Publicar | ❌ faltan `IG_USER_ID` e `IG_ACCESS_TOKEN` | F3-01, F3-02, F3-03, F3-04 |
| ESTADO · 1 | Correo de contacto en el dominio | ❌ el dominio no tiene MX | F1-07, F1-08 |
| ESTADO · 2 | Dirección visual A, B o C | ⚠️ sin elegir | F4-04 |
| ESTADO · 3b | Tanda 1 del lote 2 de fotos e identificar `JWkug.jpg` | ⚠️ sin empezar | F2-13, F2-14, F2-15 |
| ESTADO · 5 | Revisar las 5 fichas y los borradores descartables | ⚠️ sin revisar; no se ha borrado nada | F2-12, F2-16 |
| ESTADO · 7b | Precio anual de Stripe | ⚠️ cobra 89 € y la web dice 79 € | F0-11 |
| ESTADO · 7c | Compra de prueba | ⚠️ pendiente | F1-14 |
| ESTADO · 8a | PR #60 y #62 | ✅ fusionados el 13-oct | — |
| ESTADO · 8b | Llaves gratis de NVIDIA, Mistral y OpenRouter | ❌ sin llave (opcional) | F2-18 |
| ESTADO · 8d | Una orden real desde Telegram tras fusionar | ⚠️ 3 órdenes pasaron por Kimiko interno; la charla real sin verificar | F0-13 |
| ESTADO · 8g | Volver a subir tres skills a claude.ai | ❌ pendiente | F2-20 |
| ESTADO · 8h | PR #66, #67 y #59 | ⚠️ sin aplicar | F0-10, F1-12 |
| ESTADO · 8 (propuesta) | Token de Supabase en GitHub para desplegar solo | Aplazada: da poder sobre toda la cuenta y la edita un PR | T-18 |
| ESTADO · próximos 0 | Antes de cobrar: precio, 7 días, lista de precios y Stripe en vivo | ⚠️ nada hecho | F1-13, F2-04 |
| ESTADO · próximos 3 | Categoría «Magicas» en 4 fichas | ⚠️ pendiente | F2-17 |
| ESTADO · próximos 4 | Retocar el borrador de árnica y los de plantas | ⚠️ pendiente | F2-16 |
| ESTADO · próximos 7 | Semana 1: compra real de principio a fin | Reprogramada (sección 14) | F2-05 |
| PETICIONES · 1 | Copiar la skill `schema` y añadir JSON-LD | Decidido: sí, a mano y fijada al commit `b9ba399` | F4-03 (T-16) |
| PETICIONES · 2 | Lector de Instagram en el chat | Aplazado hasta tener las llaves de Meta | Backlog v2 |
| PETICIONES · Gemini | Si Gemini se queda en la cadena | Decidido: solo contenido público del back-office (T-14) | F1-06 |
| Project · instrucciones | Instrucciones cortadas en «Trabaje como» | ⚠️ completadas en el Anexo A, a tu OK | F0-06 |
| Project · monetizar | Sacar el proyecto y monetizarlo | ❌ 0 ingresos; ruta en la sección 11 | F2-09 |

## 14. Correcciones a lo dicho antes

Cosas que se dieron por ciertas y no lo son (o lo son solo en parte). Ya están corregidas en este documento.

| Qué se dijo | Dónde | Lo correcto | Prueba |
|---|---|---|---|
| Firecrawl: «500 créditos al mes» | Texto pegado en la conversación | El plan gratuito da **1.000 créditos al mes y se renuevan cada mes** (no son un cupo único). La investigación semanal usará como máximo el 40 %. El módulo `firecrawl` comprueba el saldo real al guardar la llave. | Página de precios de Firecrawl, 14-oct (Anexo C) |
| Gemini: «su plan gratuito usa los datos y no vale para usuarios del EEE» | `kimiko/PETICIONES.md` | Solo en parte. Los términos exigen servicios de pago cuando un cliente de la API lo usan visitantes del EEE; no aplica al back-office sin visitantes. Si el desarrollador está en el EEE, los términos de datos de pago valen también para el cupo gratuito (frase recortada en mi lectura). Se corrige la nota en F1-06. | Términos adicionales de la API de Gemini, 14-oct |
| «Semana 1 (12–18 oct): compra real de principio a fin» | `ESTADO.md`, próximos pasos 7 | No es realista: antes hacen falta alojamiento comercial, gestor, textos legales y Stripe en vivo. La compra real propia pasa al 19-nov y el primer pago de un tercero se apunta al 1-dic. | Dependencias de F2-05 |
| «7 días gratis con tarjeta» | Descripción del proyecto | No existen hoy (ni `trial_period_days` ni texto en la web). Se construyen en F1-13 y solo se activan cuando Pro abra. | `app/api/checkout/route.ts`, 14-oct |
| «Lo que solo puede hacer Kristian (todo desde el móvil)» | `ESTADO.md` | Varias tareas exigen el Mac (llaves, Stripe en vivo, copias, restauración). Ahora cada tarea lleva su canal y las del Mac se agrupan (4.4); es la regla 3 de `CLAUDE.md`. | Sección 4.4 |
| «GitHub avisa de 92 vulnerabilidades» | `ESTADO.md` | Es el contador de GitHub del 10-oct, sin desglose verificado. La medida que usa el plan es `npm audit --omit=dev` (4 de producción hoy). | `npm audit`, 14-oct |

## Anexo A. Instrucciones completas para el Project de claude.ai

Las instrucciones actuales terminan cortadas en «Trabaje como». Este es el texto completo propuesto. **La frase que completa «Trabaje como» («socio operativo crítico, no asistente complaciente») es una suposición mía: cámbiala si querías otra cosa.** Se pega entera en las instrucciones del Project (F0-06); Code comprueba después que ya no terminan cortadas.

```
PROYECTO: Quantum Holistic, el proyecto de vida y negocio de Kristian (Barcelona). Web: quantum-holistic.com. «Quantum» es solo nombre de marca: no se prometen ni se programan cosas de computación cuántica.

OBJETIVO: dejar la empresa funcionando, cobrando y midiéndose con la mínima intervención manual. Kimiko (agente coordinador) planifica, ejecuta y supervisa con skills, herramientas, APIs y flujos; Claude Code orquesta, construye y verifica; Kristian decide, autoriza, aporta identidad y dinero y revisa como herbolario y chef. El plan vigente está en claude/hoja-de-ruta-empresa.md; el encargo para Code, en claude/code-encargo-orquestar-hoja-de-ruta.md; las tareas de Kristian, en claude/tareas-kristian.md.

CÓMO TRABAJAR (como socio operativo crítico, no como asistente complaciente):
1. Comprueba antes de afirmar: mira el código, la base de datos o lo desplegado, no la memoria. Lo no comprobado se escribe «sin verificar». Nada está hecho sin prueba.
2. Busca inconsistencias y señálalas con su evidencia, también las de Kristian y las de estas instrucciones. Si dos fuentes chocan o hay un peligro, detente y avisa antes de seguir.
3. Lo que propongas como mejora, ejecútalo (en un PR, con prueba) salvo que necesite un OK de Kristian.
4. Orden de mando: la ley y los términos de las plataformas; el NÚCLEO de kimiko/PROMPT.md y CLAUDE.md; DECISIONES.md; la hoja de ruta; estas instrucciones; ESTADO.md; Notion y documentos antiguos (solo historia).

LÍMITES:
- Autonomía de Kimiko: escalera N0 a N4 de la hoja de ruta. Hoy blog y fichas son N2 (prepara y publica cuando Kristian pulsa ✅); las redes son N1 hasta que Kristian apruebe el PR del NÚCLEO (fase 3). Kimiko nunca toca su NÚCLEO, ni paga, ni borra datos, ni crea credenciales.
- Dinero: coste 0 € salvo lo que Kristian apruebe (hoy, Vercel Pro y el gestor). Cualquier otro gasto se propone con importe y se espera su sí.
- Salud: sin promesas de curar, sin dosis, con contraindicaciones y aviso de consultar con un profesional. Todo contenido nuevo nace como borrador. Quantum Pro solo se vende cuando exista tal como se anuncia.
- Seguridad: el repositorio es público. Nunca secretos ni datos personales en código, documentos, PR o registros. Las llaves se pegan solo en el terminal interactivo, nunca en el chat. Los fallos de seguridad abiertos no se describen en el repositorio hasta cerrarlos.
- Legal y fiscal: lo que se escriba es orientativo, no asesoramiento; lo confirma el gestor.
- Necesitan OK explícito de Kristian: cambios en la base de datos, pagos, DNS, reglas de Kimiko, envíos a personas, despliegues en producción, credenciales y workflows.

FORMA: español. Respuestas breves y accionables; lo largo va a documentos del Project. Las tareas de Kristian, en bloques de 30 minutos como máximo, con pasos, canal, minutos y prueba. Cada sesión empieza por CLAUDE.md, ESTADO.md y /hoy, y termina actualizando ESTADO.md solo con pruebas.
```

## Anexo B. Preguntas para el gestor

Llévalas en el móvil a la cita (F1-10). Orientativo: ninguna respuesta de este documento sustituye al gestor. Pasa a Code un resumen **sin datos personales** para `DECISIONES.md`.

**Alta y facturación**

1. ¿Qué forma de alta me conviene para vender sesiones 1:1, suscripciones y productos digitales, y desde cuándo debo estar dado de alta (¿antes del primer cobro?)? ¿Es compatible con mis otras actividades?
2. ¿Qué documento emito por cada tipo de venta (factura o recibo) y con qué herramienta? ¿Qué datos debe llevar?
3. ¿Cómo declaro lo que cobra Gumroad (actúa como comerciante registrado) y lo que cobra Stripe?

**Impuestos y calendario**

4. IVA: ¿qué tipo aplica a cada servicio (sesión, suscripción, producto digital) y a clientes de otros países de la UE? ¿Necesito la ventanilla única (OSS) o hay umbral?
5. ¿Qué declaraciones y fechas me tocan? ¿Cuál es tu presupuesto mensual y qué gastos son deducibles (Vercel Pro, dominio, herramientas)?

**Salud y denominaciones**

6. ¿Puedo usar «nutricionista», «herbolario», «terapeuta» o «eco-chef medicinal» en la web, las facturas y las redes con mi formación? ¿Cuáles están reservadas y cuáles no?
7. ¿Dónde está el límite entre contar usos tradicionales de plantas y hacer una declaración de salud? ¿Qué avisos mínimos pongo? ¿Hay restricciones para recomendar plantas medicinales o complementos?

**Datos personales**

8. RGPD: ¿quién es el responsable, qué base legal uso para leads, clientes y sesiones, y qué documentos necesito (política, registro de actividades, contratos con encargados como Supabase, Vercel, Stripe, Resend, MailerLite, Zoho y Meta)? ¿Y las transferencias a EE. UU.?
9. Hay tablas creadas para datos de salud (todavía vacías). Si algún día se usan, ¿qué consentimiento explícito y evaluación de impacto hacen falta?
10. Cookies y analítica: uso Vercel Web Analytics (sin cookies) y tipografías propias. ¿Necesito banner de cookies?

**Contratos con clientes**

11. Desistimiento de 14 días en contenido digital y suscripciones, renovación automática y prueba de 7 días con tarjeta: ¿qué debo informar antes de la compra y cómo recojo el consentimiento?
12. ¿Puedes revisar mis términos, política de reembolsos y limitación de responsabilidad?

**IA, seguros y ayudas**

13. Contenido generado con IA (textos, acuarelas, reels): ¿obligaciones de etiquetado (reglamento europeo de IA, art. 50) y uso comercial de imágenes generadas por IA (Grok, Workers AI)?
14. ¿Es recomendable u obligatorio un seguro de responsabilidad civil para sesiones y contenido?
15. ¿Hay ayudas o bonificaciones para nuevos autónomos o proyectos de salud y alimentación en Cataluña? (Sin verificar que existan hoy.)

## Anexo C. Fuentes consultadas el 14-oct-2026

Precios y límites cambian: se recomprueban cada trimestre (F6-08) y antes de cualquier gasto.

| Fuente | Dirección |
|---|---|
| [Vercel, uso justo y uso comercial en Hobby](https://vercel.com/docs/limits/fair-use-guidelines) | https://vercel.com/docs/limits/fair-use-guidelines |
| [Vercel, precios (Pro: 20 $ por asiento y mes)](https://vercel.com/pricing) | https://vercel.com/pricing |
| [Vercel Web Analytics, privacidad y cookies](https://vercel.com/docs/analytics/privacy-policy) | https://vercel.com/docs/analytics/privacy-policy |
| [Supabase, precios (Pro 25 $/mes, pausa de proyectos gratuitos, copias)](https://supabase.com/pricing) | https://supabase.com/pricing |
| [Supabase, copias de seguridad](https://supabase.com/docs/guides/platform/backups) | https://supabase.com/docs/guides/platform/backups |
| [MailerLite, precios y límites del plan gratuito](https://www.mailerlite.com/pricing) | https://www.mailerlite.com/pricing |
| [Resend, precios y límites del plan gratuito](https://resend.com/pricing) | https://resend.com/pricing |
| [Gumroad, comisiones y comerciante registrado](https://gumroad.com/pricing) | https://gumroad.com/pricing |
| [Zoho Mail, plan gratuito](https://www.zoho.com/mail/zohomail-pricing.html) | https://www.zoho.com/mail/zohomail-pricing.html |
| [Stripe, negocios prohibidos y restringidos](https://stripe.com/legal/restricted-businesses) | https://stripe.com/legal/restricted-businesses |
| [Stripe Checkout, pruebas gratuitas](https://docs.stripe.com/payments/checkout/free-trials) | https://docs.stripe.com/payments/checkout/free-trials |
| [Firecrawl, precios (plan gratuito: 1.000 créditos al mes)](https://www.firecrawl.dev/pricing) | https://www.firecrawl.dev/pricing |
| [Gemini API, condiciones adicionales](https://ai.google.dev/gemini-api/terms) | https://ai.google.dev/gemini-api/terms |
| [Instagram, publicación de contenido por API](https://developers.facebook.com/docs/instagram-platform/content-publishing/) | https://developers.facebook.com/docs/instagram-platform/content-publishing/ |

Además, las pruebas de la sección 1 salen de consultas propias a Supabase, Vercel y GitHub del 14-oct, de la lectura del código del repositorio y de `ESTADO.md`; cada fila lo indica.
