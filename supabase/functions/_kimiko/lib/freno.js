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

// En pausa el worker solo atiende /estado y /reanudar: órdenes, notas de voz, botones y el resto de comandos no hacen nada.
export const SIGUE_EN_PAUSA = /^\/(estado|reanudar)(@\S+)?(\s|$)/i;
export const textoEnPausa = (f) => `${textoFreno(f)}\nEn pausa solo atiendo /estado y /reanudar. Lo que mandes ahora no se guarda ni se lanza: reenvíalo después.`;

export async function cambiarPausa(db, pausado, motivo = null) {
  await db.actualizar('kimiko_autonomia', 'id=eq.1', { pausado, motivo, actualizado_at: new Date().toISOString() });
  return leerFreno(db);
}

export const textoFreno = (f) => (f.ilegible ? `⛔ Freno: ${f.motivo}. Lo automático queda parado hasta arreglarlo.`
  : f.pausado ? `⏸ Kimiko en pausa desde ${String(f.actualizado_at ?? '').slice(0, 16).replace('T', ' ')} UTC${f.motivo ? `: ${f.motivo}` : ''}. /reanudar para volver.`
    : `▶️ Kimiko en marcha (nivel ${f.nivel}). /pausa <motivo> para pararla.`);

// Tope de gasto (F0-08): si el gasto del mes de un servicio (gasto_mes_eur) pasa de su tope_mensual_eur, Kimiko se pausa sola.
// gasto_mes_eur no se mide solo: lo apunta Kristian o Claude. Vacío cuenta como 0 €.
export const topesSuperados = (limites) => limites.filter((l) => Number(l.gasto_mes_eur ?? 0) > Number(l.tope_mensual_eur ?? 0));

// Devuelve el motivo de la pausa, o null si no hay que parar. Si los topes no se pueden leer, también para.
export async function aplicarTope(db) {
  let motivo;
  try {
    const sup = topesSuperados(await db.seleccionar('kimiko_gasto_limites', 'select=servicio,tope_mensual_eur,gasto_mes_eur'));
    if (!sup.length) return null;
    motivo = `tope de gasto superado: ${sup.map((l) => `${l.servicio} ${l.gasto_mes_eur} € de ${l.tope_mensual_eur} €`).join(', ')}`;
  } catch (e) {
    motivo = `no pude leer los topes de gasto (${String(e.message).slice(0, 120)})`;
  }
  await cambiarPausa(db, true, motivo).catch(() => {});
  return motivo;
}

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
