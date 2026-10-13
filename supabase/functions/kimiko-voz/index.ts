// kimiko-voz: pasa a texto las notas de voz de Kristian (13-oct). La llama el worker de Telegram con la llave de servicio.
// Va aparte de kimiko-diario para no tocar el trabajo diario: tres archivos y sin estado. Coste 0 € (Groq → Workers AI).
// No guarda el audio ni el texto: el worker registra lo entendido en kimiko_updates y la orden en kimiko_drafts.
import { bajarAudio, bajarAudioPrueba, transcribir } from '../_kimiko/lib/voz.js';
import { crearDb } from '../_kimiko/lib/db.js';

const json = (d: unknown, status = 200) => new Response(JSON.stringify(d), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

// Mismo método que kimiko-diario: llave secreta "kimiko" o la de servicio.
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

// Solo una llave secreta o de servicio puede leer el endpoint de admin de Auth (mismo método que kimiko-diario y kimiko-imagen).
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
  const env = Deno.env.toObject();
  const t0 = Date.now();
  try {
    // file_id: nota de Telegram. audio_url: prueba sin Telegram, solo con audios de este repo (bajarAudioPrueba lo exige).
    const audio = typeof p.file_id === 'string' && /^[\w-]{10,200}$/.test(p.file_id)
      ? await bajarAudio({ token: env.TELEGRAM_BOT_TOKEN, fileId: p.file_id })
      : typeof p.audio_url === 'string' ? await bajarAudioPrueba({ url: p.audio_url }) : null;
    if (!audio) return json({ ok: false, error: 'falta file_id' }, 400);
    const r = await transcribir({ ...audio, env });
    const ms = Date.now() - t0;
    const db = crearDb({ url: env.SUPABASE_URL, serviceKey: llaveSecreta() });
    await db.insertar('kimiko_updates', { tipo: 'voz', project_id: 'qh', ok: r.ok, detalle: { motor: r.motor ?? null, ms, bytes: audio.datos.length, origen: p.file_id ? 'telegram' : 'prueba', errores: r.errores ?? null } }).catch(() => {});
    return json({ ...r, ms }, r.ok ? 200 : 502);
  } catch (e) {
    return json({ ok: false, error: (e as Error).message.slice(0, 200) }, 502);
  }
});
