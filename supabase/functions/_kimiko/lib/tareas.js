// Cola de la hoja de ruta (F0-07): /hoy enseña a Kristian sus tareas abiertas, 5 como máximo, en el mismo orden que
// kimiko/tareas/run.sh (lo del Mac al final, luego fecha límite, orden y minutos). Solo lectura.
const ABIERTAS = ['pendiente', 'en_curso', 'esperando_ok'];
const CANAL = { movil: '📱 móvil', panel_web: '🖥 panel web', mac: '💻 Mac', llamada: '📞 llamada' };

export async function leerHoy(db) {
  try {
    return await db.seleccionar('kimiko_tareas',
      `responsable=eq.kristian&estado=in.(${ABIERTAS.join(',')})&select=id,titulo,canal,minutos,etiquetas,url,fecha_limite,orden&limit=50`);
  } catch { return null; }
}

const clave = (t) => [t.canal === 'mac' ? 1 : 0, t.fecha_limite ?? '9999-12-31', t.orden ?? 1e9, t.minutos ?? 1e9, t.id];
const comparar = (a, b) => { const x = clave(a); const y = clave(b); for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1; return 0; };

export function textoHoy(filas, max = 5) {
  if (!filas) return '🗂 No pude leer la cola (kimiko_tareas).';
  if (!filas.length) return '🗂 No tienes tareas abiertas. 🎉';
  const hoy = [...filas].sort(comparar).slice(0, max);
  const lineas = hoy.map((t, n) => {
    const datos = [CANAL[t.canal] ?? '', t.minutos ? `${t.minutos} min` : '', t.fecha_limite ? `hasta ${t.fecha_limite}` : '',
      t.etiquetas?.length ? `OK: ${t.etiquetas.join(', ')}` : ''].filter(Boolean).join(' · ');
    return `${n + 1}. ${t.id} — ${t.titulo}${datos ? `\n   ${datos}` : ''}${t.url ? `\n   ${t.url}` : ''}`;
  });
  const resto = filas.length - hoy.length;
  return ['🗂 Tu lista de hoy', ...lineas, ...(resto > 0 ? [`(+${resto} más)`] : []),
    'Para hacerlas con guía, en el Mac: bash kimiko/tareas/run.sh'].join('\n');
}
