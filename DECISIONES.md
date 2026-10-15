# DECISIONES.md — decisiones fechadas de Kristian

Nivel 3 de la tabla de precedencia (abajo): manda sobre la hoja de ruta, las instrucciones del Project, `ESTADO.md` y todo lo demás, y por debajo de la ley, los términos de las plataformas, el NÚCLEO de `kimiko/PROMPT.md` y `CLAUDE.md`.
Cada decisión nueva se añade con su fecha; las antiguas no se borran: si una cambia, se escribe la nueva y se dice a cuál sustituye.

## Decisiones D1 a D7

| ID | Decisión | Respuesta (15-oct-2026) | Límite | Notas |
|---|---|---|---|---|
| D1 | Alojamiento comercial de la web | A: Vercel Pro (20 $ por asiento y mes) | 30-oct | Contratar como muy tarde el 6-nov y antes de activar Stripe en vivo. NO se contrata ni se cobra nada sin un «sí» aparte de Kristian (F1-09). |
| D2 | Alta fiscal, facturación y títulos | A: consulta con un gestor antes del primer cobro | 23-oct | Consulta hecha antes del 6-nov. Hasta entonces, ningún cobro real por Stripe. |
| D3 | Correo del dominio | A: Zoho Mail gratis (si no está disponible en su región, B: reenvío gratuito + Resend) | 23-oct | |
| D4 | Redes y nivel de autonomía de publicación | A: Instagram y Facebook primero, después YouTube Shorts; Kimiko publica solo tras ✅ (N2) | 25-nov | Cambiar la regla del NÚCLEO que hoy prohíbe publicar en redes es un PR de Kristian (fase 3). |
| D5 | Qué se vende primero y cuándo se abre Quantum Pro | A: primero sesión 1:1 (65 €) y Ritual (19 €); Pro pasa a lista de espera hasta que el Ciclo 1 esté firmado | 30-oct | Ya decididas: anual 79 €, prueba de 7 días con tarjeta solo cuando Pro abra, plan Crypto oculto. |
| D6 | Qué manda cuando los documentos chocan y qué significa «Quantum» | A: la tabla de precedencia (abajo); «Quantum» es solo marca | 20-oct | Sin promesas ni código de computación cuántica. |
| D7 | Presupuesto y modo sin Claude | Tope de 20 € al mes de gasto recurrente y el proyecto ha de funcionar sin sesiones de Claude Code. Excepción de dos meses: durante ella se pagan a la vez Vercel Pro y Claude; al acabar, puerta de decisión | — | Ningún gasto fuera de esto sin importe y «sí» de Kristian. Si un cargo (por ejemplo, con IVA) pasa del tope, se avisa antes de pagar. |

## Qué manda cuando dos fuentes chocan

| Nivel | Fuente | Qué significa |
|---|---|---|
| 1 | La ley y los términos de las plataformas (Vercel, Stripe, Meta, Google, Supabase) | No se negocia. Si algo choca, se para. |
| 2 | NÚCLEO de `kimiko/PROMPT.md` y `CLAUDE.md` | Solo cambian con un PR de Kristian. |
| 3 | `DECISIONES.md` | Decisiones fechadas de Kristian; mandan sobre todo lo que sigue. |
| 4 | La hoja de ruta (`claude/hoja-de-ruta-empresa.md`, después copia en `kimiko/plan/`) | Plan; se corrige por PR o por versión nueva. |
| 5 | Instrucciones del Project de claude.ai | Orientan las conversaciones. |
| 6 | `ESTADO.md` | Es estado con pruebas, no norma. |
| 7 | Notion, documentos antiguos y memoria de sesiones | Solo historia: se leen, no se obedecen. |

Manda el número más bajo (el nivel 1 pesa más que el 7). Si no está claro cuál de dos fuentes manda, **nadie elige: se detiene el trabajo y se avisa a Kristian** antes de seguir. La regla 4 de `CLAUDE.md` («cualquier gasto se propone con importe y se espera el sí») no choca con la política de gasto de abajo: la política solo fija topes y disparadores, y el sí de Kristian sigue siendo necesario.

## Escalera de autonomía de Kimiko

| Nivel | Nombre | Qué hace | Dónde está hoy | Para subir a este nivel |
|---|---|---|---|---|
| N0 | Observa | Chequeos, auditoría, informes. No cambia nada. | Siempre | — |
| N1 | Prepara | Escribe borradores, reels y textos; Kristian publica a mano. | Redes: hoy (decisión del 5-oct) | — |
| N2 | Publica con tu ✅ | Publica cuando Kristian pulsa ✅ en Telegram. | Blog y fichas: hoy. Redes: se activa en la fase 3 | Token de Meta verificado, PR del NÚCLEO aprobado por Kristian y prueba negativa: sin ✅ no publica. |
| N3 | Publica con derecho a veto | Publica sola piezas derivadas de contenido ya aprobado (reels de posts publicados) tras 2 horas de veto. | No | Al menos 30 publicaciones aprobadas seguidas sin editar, 0 incidencias de los controles, 6 semanas de métricas y parada probada. Aprobación de Kristian por PR del NÚCLEO. |
| N4 | Gestiona dentro de un presupuesto | Decide pequeñas acciones de crecimiento y gasta hasta un tope mensual fijado por Kristian. | No | 3 meses de ingresos recurrentes, revisión legal externa del contenido y tope en `kimiko_gasto_limites`. |

Subir un peldaño es un PR del NÚCLEO que aprueba Kristian (etiqueta `regla`). Bajar es inmediato con `/pausa`.

**Objetivo de Kristian (15-oct-2026): Kimiko acaba haciéndolo todo.** Los límites de abajo son de la fase de construcción, no el destino. Hoy, mientras se construye y se prueba, Kimiko no hace por sí sola cuatro cosas, y cada una exige OK explícito de Kristian: cambiar su NÚCLEO (`regla`), pagar (`pago`), borrar datos (`db`, se archiva) y crear o rotar credenciales (`cred`).

Cada una se desbloquea cuando Kristian lo decida, por PR del NÚCLEO (`regla`), y se entrega con tres cosas: tope (importe, número de acciones o ámbito), registro de cada uso y parada con `/pausa`. Los criterios concretos de cada desbloqueo son una propuesta, pendiente de que Kristian los confirme en una decisión fechada:

| Capacidad | Hoy | Se puede desbloquear cuando |
|---|---|---|
| Pagar | Siempre con su «sí» | N4 (tabla de arriba): tope mensual en `kimiko_gasto_limites` |
| Borrar datos | Se archiva, no se borra | Copias diarias activas (Supabase Pro) y borrado reversible durante un plazo |
| Credenciales | Solo Kristian, por el terminal | Gestor de secretos con permisos mínimos y rotación registrada |
| Su propio NÚCLEO | Solo por PR de Kristian | Kimiko propone el PR y Kristian lo aprueba; después, lo que él decida |

## Gasto, disparadores y cuotas

El tope mensual de D7 manda sobre esta tabla mientras esté vigente.

**Niveles de gasto** (el gasto real se compara cada mes en el libro de ingresos):

| Nivel | Se activa con | Qué permite |
|---|---|---|
| Nivel 0 | Ingresos 0 €/mes | Solo el dominio (pagado hasta el 1-may-2027), Vercel Pro por obligación (D1) y los honorarios puntuales del gestor, cada uno con el OK de Kristian. Todo lo demás, 0 € (salvo la excepción de D7). |
| Nivel 1 | Ingresos netos de al menos 100 €/mes durante 2 meses seguidos | Hasta el 15 % de los ingresos netos del mes anterior en herramientas, con OK de Kristian por herramienta. |
| Nivel 2 | Ingresos netos de al menos 500 €/mes durante 3 meses | Se revisa el tope y se considera ayuda administrativa; Kimiko sigue sin poder contratar nada. |

**Disparadores** (cuándo se propone pasar a un plan de pago; siempre con OK de Kristian):

| Servicio | Disparador | Por qué |
|---|---|---|
| Supabase Pro (25 $/mes) | Ingresos recurrentes de al menos 150 €/mes o 500 leads con consentimiento | Copias diarias con 7 días, sin pausa por inactividad, protección de contraseñas filtradas. |
| MailerLite de pago | Pasar de 250 suscriptores activos | Con más, el envío se bloquea. |
| Resend de pago | Acercarse a 3.000 correos al mes o a 100 al día | Límites del plan gratuito. |
| Firecrawl de pago | No antes del nivel N3 | El plan gratuito da 1.000 créditos al mes. |

**Cuotas gratuitas vigiladas** (aviso a Telegram al 80 % de cada una, con la acción exacta):

| Servicio | Cuota | Uso |
|---|---|---|
| Cloudflare Workers AI | 10.000 neuronas al día | Texto de respaldo e imágenes flux |
| Groq | 1.000 peticiones al día | Primer motor del blog y de las órdenes; Whisper |
| Firecrawl | 1.000 créditos al mes | Investigación semanal (máximo el 40 %) |
| Resend | 3.000 correos al mes y 100 al día | Solo correo transaccional |
| MailerLite | 250 suscriptores y 2.500 correos al mes | Bienvenida y newsletter |
| Supabase Free | 500 MB de base de datos; pausa tras 1 semana sin actividad | Base única |
| Instagram (API oficial) | 100 publicaciones por API cada 24 horas según la guía de Meta | Muy por encima de nuestro uso |

## Estados de una tarea y qué necesita OK

Estados de `kimiko_tareas.estado`: pendiente · en_curso · esperando_ok · esperando_prueba · verificada (solo Code o Kimiko, tras ejecutar la comprobación) · bloqueado (motivo obligatorio) · descartado (lo decide Kristian) · propuesta (idea de Kimiko pendiente de ✅, ✖ o ⏸).

Necesitan OK explícito de Kristian: `db` (cambios en la base de datos), `pago`, `dns`, `regla` (NÚCLEO, `PROMPT.md`, `CLAUDE.md`), `envio` (mensajes a personas reales), `prod` (despliegues y publicación en una red), `cred` (crear, rotar o guardar credenciales) y `delicado` (workflows, el fusionador y funciones con permisos). Un OK vale solo para la tarea que nombra; el silencio no es un sí.

## Registro

- 14-oct-2026: hoja de ruta v1 propuesta.
- 15-oct-2026: Kristian responde D1 a D6 = A (con las salvedades de D1 y D5), aprueba D7 y F0-01, y aprueba de palabra las propuestas P1 (documento «modo sin Claude»), P2 (tope bajo de uso en el panel de Vercel, con su OK al ponerlo) y P3 (módulos del ejecutor).
