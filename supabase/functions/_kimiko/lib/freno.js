// Freno de Kimiko (F0-08): kimiko_autonomia (una fila) y kimiko_gasto_limites (cuota por servicio).
// Con pausado = true se para lo automático (post diario, reintentos, reel, auditoría del cron); /pausa, /reanudar,
// /hoy, /estado y los avisos siguen. Al revés que el manual (runbook.js), si no se puede leer el freno se considera
// en pausa: un freno que no se lee no puede dejar pasar.
export async function leerFreno(db) {
  try {
    const [f] = await db.seleccionar('kimiko_autonomia', 'id=eq.1&select=nivel,pausado,motivo,actualizado_at');
    return f ?? { pausado: true, ilegible: true, motivo: 'kimiko_autonomia no tiene fila' };
  } catch (e) {
    return { pausado: true, ilegible: true, motivo: `no pude leer kimiko_autonomia (${String(e.message).slice(0, 120)})` };
  }
}

export async function cambiarPausa(db, pausado, motivo = null) {
  await db.actualizar('kimiko_autonomia', 'id=eq.1', { pausado, motivo, actualizado_at: new Date().toISOString() });
  return leerFreno(db);
}

export const textoFreno = (f) => (f.ilegible ? `⛔ Freno: ${f.motivo}. Lo automático queda parado hasta arreglarlo.`
  : f.pausado ? `⏸ Kimiko en pausa desde ${String(f.actualizado_at ?? '').slice(0, 16).replace('T', ' ')} UTC${f.motivo ? `: ${f.motivo}` : ''}. /reanudar para volver.`
    : `▶️ Kimiko en marcha (nivel ${f.nivel}). /pausa <motivo> para pararla.`);

// Un aviso por servicio que llegue a su aviso_pct. usos: { servicio: uso medido } (manda sobre la columna uso).
export function avisosCuota(limites, usos = {}) {
  const fallos = [];
  for (const l of limites) {
    const cuota = Number(l.cuota); const uso = Number(usos[l.servicio] ?? l.uso);
    if (!l.servicio || !(cuota > 0) || !Number.isFinite(uso)) continue;
    // Se compara sin redondear: 79,99 % no llega al aviso del 80 %.
    if (uso * 100 >= cuota * Number(l.aviso_pct ?? 80)) fallos.push({ que: `${l.servicio}: ${uso} de ${cuota} ${l.unidad} (${Math.floor((uso / cuota) * 100)} %)`, accion: l.accion });
  }
  return fallos;
}
