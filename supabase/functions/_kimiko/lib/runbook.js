// Manual de tareas (B1): la tabla kimiko_runbook dice qué tareas están activas y qué hacer si fallan.
// Si la tabla no responde, la tarea se considera activa: un fallo de lectura no puede parar el post.
export async function leerRunbook(db) {
  try { return await db.seleccionar('kimiko_runbook', 'select=id,nombre,cuando,comprobacion,si_falla,activa&order=id'); } catch { return null; }
}

export const tareaActiva = (runbook, id) => !runbook || runbook.find((t) => t.id === id)?.activa !== false;
export const siFalla = (runbook, id) => runbook?.find((t) => t.id === id)?.si_falla || null;

export const textoManual = (runbook) => (runbook?.length
  ? ['📖 Manual de Kimiko', ...runbook.map((t) => `${t.activa ? '🟢' : '⏸'} ${t.nombre} — ${t.cuando}\n   Comprobación: ${t.comprobacion}`)].join('\n')
  : '📖 No pude leer el manual (kimiko_runbook).');
