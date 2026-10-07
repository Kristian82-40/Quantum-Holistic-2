// Vigilancia externa de un sitio: lo que se puede comprobar desde fuera con fetch.
// Limitación: no ve la caducidad del certificado TLS ni el DNS; para eso, el panel de Cloudflare o un servicio externo.

const ESPERADAS = [
  ['strict-transport-security', 'alto', 'Falta HSTS (Strict-Transport-Security)'],
  ['content-security-policy', 'medio', 'Falta Content-Security-Policy'],
  ['x-content-type-options', 'medio', 'Falta X-Content-Type-Options: nosniff'],
  ['referrer-policy', 'info', 'Falta Referrer-Policy'],
  ['permissions-policy', 'info', 'Falta Permissions-Policy'],
];

export function evaluarCabeceras(headers) {
  const get = (n) => (typeof headers.get === 'function' ? headers.get(n) : headers[n]) || '';
  const hallazgos = [];
  for (const [nombre, nivel, msg] of ESPERADAS) if (!get(nombre)) hallazgos.push({ nivel, msg });
  const csp = get('content-security-policy');
  if (!get('x-frame-options') && !/frame-ancestors/i.test(csp)) {
    hallazgos.push({ nivel: 'medio', msg: 'Sin protección contra clickjacking (X-Frame-Options o frame-ancestors)' });
  }
  if (get('x-powered-by')) hallazgos.push({ nivel: 'info', msg: `Revela tecnología con X-Powered-By: ${get('x-powered-by')}` });
  return hallazgos;
}

export async function vigilarSitio(url, { fetchImpl = fetch, lentoMs = 3000 } = {}) {
  const hallazgos = [];
  const t0 = Date.now();
  let r;
  try {
    r = await fetchImpl(url, { redirect: 'follow' });
  } catch (e) {
    return { ok: false, ms: Date.now() - t0, hallazgos: [{ nivel: 'alto', msg: `No responde: ${e.message}` }] };
  }
  const ms = Date.now() - t0;
  if (!r.ok) hallazgos.push({ nivel: 'alto', msg: `Responde con estado ${r.status}` });
  if (ms > lentoMs) hallazgos.push({ nivel: 'medio', msg: `Respuesta lenta: ${ms} ms` });
  if (r.url && !r.url.startsWith('https://')) hallazgos.push({ nivel: 'alto', msg: 'La página final no usa HTTPS' });
  hallazgos.push(...evaluarCabeceras(r.headers));
  try {
    const rr = await fetchImpl(url.replace(/^https:/, 'http:'), { redirect: 'manual' });
    const destino = rr.headers.get('location') || '';
    if (!(rr.status >= 300 && rr.status < 400 && destino.startsWith('https://'))) {
      hallazgos.push({ nivel: 'medio', msg: 'HTTP no redirige a HTTPS' });
    }
  } catch { /* si http ni responde, no es un fallo */ }
  return { ok: !hallazgos.some((h) => h.nivel === 'alto'), ms, hallazgos };
}
