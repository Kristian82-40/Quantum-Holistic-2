// Cierra una orden de Kimiko Cloud que se quedó sin cerrar (falló, se canceló o terminó sin dejar estado).
// Sin dependencias. En GitHub Actions: node kimiko/cierre/cerrar-orden.mjs
// Entorno: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, KIMIKO_DRAFT_ID, JOB_STATUS (success | failure | cancelled).
// Nunca imprime llaves ni el texto de la orden (el repo es público y los logs también).
import { pathToFileURL } from 'node:url';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const ABIERTAS = ['pendiente', 'en_curso'];

export function motivoCierre(jobStatus) {
  if (jobStatus === 'success') return 'Kimiko Cloud terminó sin cerrar la orden (no dejó estado ni resumen).';
  if (jobStatus === 'cancelled') return 'Kimiko Cloud se canceló antes de terminar.';
  return 'Kimiko Cloud falló antes de terminar (puede ser el límite de la suscripción de Claude o un error de la ejecución).';
}

// Devuelve null si no hay nada que cerrar; si no, lo que hay que escribir en la fila.
export function decidirCierre({ id, orden, jobStatus }) {
  if (!UUID.test(String(id ?? ''))) return null;
  if (!orden || !ABIERTAS.includes(orden.status)) return null;
  return {
    status: 'error_ejecucion',
    copy: `${motivoCierre(jobStatus)} La orden NO está hecha: reenvíala o déjasela a Claude.`,
    updated_at: new Date().toISOString(),
  };
}

export async function cerrarOrden({ url, llave, id, jobStatus, fetchImpl = fetch }) {
  const h = { apikey: llave, authorization: `Bearer ${llave}`, 'content-type': 'application/json' };
  if (!UUID.test(String(id ?? ''))) return { cerrada: false, motivo: 'sin id válido' };
  const r = await fetchImpl(`${url}/rest/v1/kimiko_drafts?id=eq.${id}&select=id,status`, { headers: h });
  if (!r.ok) throw new Error(`no pude leer la orden (HTTP ${r.status})`);
  const [orden] = await r.json();
  const cambio = decidirCierre({ id, orden, jobStatus });
  if (!cambio) return { cerrada: false, motivo: orden ? `ya estaba ${orden.status}` : 'no existe' };
  // El filtro de estado evita pisar a Kimiko si cerró la orden justo ahora. El cambio de estado dispara el aviso a Telegram.
  const p = await fetchImpl(`${url}/rest/v1/kimiko_drafts?id=eq.${id}&status=in.(${ABIERTAS.join(',')})`, {
    method: 'PATCH', headers: { ...h, prefer: 'return=representation' }, body: JSON.stringify(cambio),
  });
  if (!p.ok) throw new Error(`no pude cerrar la orden (HTTP ${p.status})`);
  // Sin filas cambiadas, Kimiko la cerró entre la lectura y el PATCH: no hay nada que registrar.
  if (!(await p.json()).length) return { cerrada: false, motivo: 'Kimiko la cerró a la vez' };
  await fetchImpl(`${url}/rest/v1/kimiko_updates`, {
    method: 'POST', headers: { ...h, prefer: 'return=minimal' },
    body: JSON.stringify({ tipo: 'orden', project_id: 'qh', ok: false, detalle: { id, estado: cambio.status, motivo: motivoCierre(jobStatus), job: jobStatus } }),
  }).catch(() => {});
  return { cerrada: true, motivo: motivoCierre(jobStatus) };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, KIMIKO_DRAFT_ID, JOB_STATUS } = process.env;
  try {
    const r = await cerrarOrden({ url: SUPABASE_URL, llave: SUPABASE_SERVICE_ROLE_KEY, id: KIMIKO_DRAFT_ID, jobStatus: JOB_STATUS });
    console.log(r.cerrada ? `Orden marcada error_ejecucion: ${r.motivo}` : `Nada que cerrar: ${r.motivo}`);
  } catch (e) {
    console.log(`No se pudo cerrar la orden: ${e.message}`);
    process.exitCode = 1;
  }
}
