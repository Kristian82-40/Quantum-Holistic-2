# Agentes de Quantum Holistic — Fábrica de sistemas

Tres equipos + un auditor. Cada equipo tiene su archivo de definición en esta carpeta.
El auditor revisa cada entrega antes de cerrarla.

## Equipos

| Archivo | Equipo | Responsabilidad |
|---|---|---|
| `equipo-construir.md` | Construir y evolucionar | Arquitecto/producto, frontend, backend, integraciones, IA |
| `equipo-mantener.md` | Mantener | Seguridad, DevOps, QA, revisor de páginas |
| `equipo-gente.md` | Gente | Contenido, SEO, respuestas, feedback |
| `auditor.md` | Auditor | Revisa cada entrega; aprueba o bloquea el cierre |

## Reglas de activación

- **Pocos agentes a la vez.** Solo los necesarios para la tarea actual. El gasto de tokens es el tope real.
- **En paralelo solo si las tareas son independientes de verdad.**
- **El auditor siempre va último**, antes de cerrar cualquier tarea verificada.
- **El revisor de páginas** (equipo Mantener) trabaja solo, una vez por semana, sin que Kristian esté.

## Ciclo de trabajo

```
Planificar → Implementar → Probar → Revisar (auditor) → Corregir → Documentar → Cerrar
```

Una tarea solo pasa a `verificada` cuando:
1. Pruebas automatizadas en verde.
2. El auditor ha revisado y dado el OK.
3. La evidencia está registrada en `kimiko_tareas.evidencia`.

## Backlog

Cola única: `kimiko_tareas` en Supabase.
- Tareas v1: prefijo `F0-`, `F1-`, ..., `F6-`, `P1`, `Z9`.
- Tareas v2: prefijo `V2-F1-`, `V2-F2-`, etc.

Ver `DECISIONES.md` para el registro de versiones del backlog.
