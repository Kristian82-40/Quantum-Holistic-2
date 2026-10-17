// kimiko-orden: «Kimiko interno» (13-oct-2026). Lo llama el worker de Telegram con la orden ya guardada en kimiko_drafts, ANTES de
// despertar a Kimiko Cloud. Decide con motores gratuitos (Groq → Workers AI → NVIDIA NIM, ver _kimiko/lib/motores.js) si:
//   · responder una charla corta él mismo (status 'hecho'),
//   · pasarla a Claude sin ejecutarla (status 'para_claude': llaves, tarjetas, cambiar sus reglas, dinero),
//   · o dejarla a Kimiko Cloud (ruta 'cloud': el comportamiento de siempre; también ante cualquier duda o error).
// No toca la web ni los datos, no guarda el texto de la orden en los registros y cuesta 0 €.
import { decidirRuta } from '../_kimiko/lib/orden-interna.js';
import { enviarMensaje } from '../_kimiko/lib/telegram.js';
import { crearDb } from '../_kimiko/lib/db.js';
import { leerFreno } from '../_kimiko/lib/freno.js';

const json = (d: unknown, status = 200) => new Response(JSON.stringify(d), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function llaveSecreta(): string {
  try {
    const m = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}');
    const v = m.kimiko ?? m.default ?? Object.values(m)[0];
    if (typeof v === 'string' && v) return v;
  } catch { /* formato inesperado: se usa la de respaldo */ }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
}

async function igualSeguro(a: string, b: string) {
  const enc = new TextEncoder();
  const [x, y] = (await Promise.all([crypto.subtle.digest('SHA-256', enc.encode(a)), crypto.subtle.digest('SHA-256', enc.encode(b))])).map((h) => new Uint8Array(h));
  let dif = 0;
  for (let i = 0; i < x.length; i++) dif |= x[i] ^ y[i];
  return dif === 0;
}

async function esLlaveDeServicio(req: Request): Promise<boolean> {
  const llave = req.headers.get('apikey') ?? (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!llave || llave.length < 20) return false;
  const r = await fetch(`${Deno.env.get('SUPABASE_URL')}/auth/v1/admin/users?per_page=1`, { headers: { apikey: llave, authorization: `Bearer ${llave}` } });
  await r.body?.cancel();
  return r.ok;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'usa POST' }, 405);
  const secreto = Deno.env.get('KIMIKO_CRON_SECRETO') ?? '';
  const porSecreto = !!secreto && (await igualSeguro(req.headers.get('x-kimiko-secreto') ?? '', secreto));
  if (!porSecreto && !(await esLlaveDeServicio(req))) return json({ error: 'no autorizado' }, 401);
  const p = await req.json().catch(() => ({})) as Record<string, unknown>;
  if (typeof p.id !== 'string' || !UUID.test(p.id)) return json({ ruta: 'cloud', motivo: 'sin id válido' }, 400);
  const env = Deno.env.toObject();
  const db = crearDb({ url: env.SUPABASE_URL, serviceKey: llaveSecreta() });
  // Freno (F0-08): en pausa (o si el freno no se lee) no se tría ni se lanza nada; el worker no despierta a Kimiko Cloud.
  if ((await leerFreno(db)).pausado) return json({ ruta: 'pausado' });
  try {
    const [o] = await db.seleccionar('kimiko_drafts', `id=eq.${p.id}&select=id,status,chat_id,source_note`);
    if (!o || o.status !== 'pendiente') return json({ ruta: 'cloud', motivo: 'la orden no está pendiente' });
    if (String(o.chat_id) !== String(env.TELEGRAM_CHAT_ID)) return json({ ruta: 'cloud', motivo: 'chat no reconocido' });
    const d = await decidirRuta({ texto: o.source_note, env });
    const ahora = new Date().toISOString();
    const registro = (ok: boolean, extra: Record<string, unknown> = {}) =>
      db.insertar('kimiko_updates', { tipo: 'orden', project_id: 'qh', ok, detalle: { id: o.id, ruta: d.ruta, motor: d.motor ?? null, intentos: d.intentos ?? [], interno: true, ...extra } }).catch(() => {});

    if (d.ruta === 'responder') {
      const tg = await enviarMensaje({ token: env.TELEGRAM_BOT_TOKEN, chatId: env.TELEGRAM_CHAT_ID, texto: `🌿 ${d.respuesta}\n\n(Kimiko interno · ${d.motor})` });
      if (!tg.ok) return json({ ruta: 'cloud', motivo: 'no pude enviar la respuesta a Telegram' });
      await db.actualizar('kimiko_drafts', `id=eq.${o.id}`, { status: 'hecho', copy: d.respuesta, avisado_at: ahora, updated_at: ahora });
      await registro(true);
      return json({ ruta: 'responder' });
    }
    if (d.ruta === 'para_claude') {
      const copy = `Hecho: nada, no la he ejecutado.\nFalta: que Claude (o tú) la mire.\nPor qué: ${d.motivo}\nPista: la orden sigue guardada en kimiko_drafts (${String(o.id).slice(0, 8)}).`;
      await db.actualizar('kimiko_drafts', `id=eq.${o.id}`, { status: 'para_claude', copy, avisado_at: ahora, updated_at: ahora });
      await enviarMensaje({ token: env.TELEGRAM_BOT_TOKEN, chatId: env.TELEGRAM_CHAT_ID, texto: `📬 Kimiko interno · para Claude\n\n${copy}` });
      await registro(true);
      return json({ ruta: 'para_claude' });
    }
    await registro(true, { motivo: d.motivo ?? null });
    return json({ ruta: 'cloud', motivo: d.motivo ?? null });
  } catch (e) {
    // Cualquier fallo: la orden sigue su camino de siempre hacia Kimiko Cloud.
    return json({ ruta: 'cloud', motivo: `error interno: ${(e as Error).message.slice(0, 120)}` });
  }
});
