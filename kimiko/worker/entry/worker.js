// Punto de entrada para Cloudflare Workers (plan Free): SOLO el webhook de Telegram.
// El trabajo diario vive en la Edge Function kimiko-diario de Supabase (en Free no cabían sus ~29 ms de CPU).
// Rutas: POST /telegram (secret_token + chat) y /admin/webhook (Bearer KIMIKO_ADMIN_TOKEN). Todo lo demás, 404.
import { atenderTelegram, igualSeguro } from '../../../supabase/functions/_kimiko/src/webhook.js';
import { crearDb } from '../../../supabase/functions/_kimiko/lib/db.js';
import { ponerWebhook, infoWebhook } from '../../../supabase/functions/_kimiko/lib/telegram.js';

const json = (d, status = 200) => new Response(JSON.stringify(d, null, 2), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });
const NO = () => new Response('Not found', { status: 404 });
const dbDe = (env) => crearDb({ url: env.SUPABASE_URL, serviceKey: env.SUPABASE_SERVICE_ROLE_KEY });

// Lo que se enseña del webhook: nunca el token.
const resumenWebhook = (r) => (r.ok ? { url: r.resultado.url, pendientes: r.resultado.pending_update_count, ultimo_error: r.resultado.last_error_message || null, ultimo_error_fecha: r.resultado.last_error_date ? new Date(r.resultado.last_error_date * 1000).toISOString() : null } : { error: r.error });

async function admin(request, env, ruta) {
  const auth = request.headers.get('authorization') || '';
  if (!env.KIMIKO_ADMIN_TOKEN || !(await igualSeguro(auth, `Bearer ${env.KIMIKO_ADMIN_TOKEN}`))) return NO();
  const u = new URL(request.url);
  if (ruta === '/admin/webhook' && request.method === 'GET') return json(resumenWebhook(await infoWebhook(env.TELEGRAM_BOT_TOKEN)));
  if (ruta === '/admin/webhook' && request.method === 'POST') {
    const puesto = await ponerWebhook(env.TELEGRAM_BOT_TOKEN, `${u.origin}/telegram`);
    return json({ set: puesto.ok ? 'ok' : puesto.error, ahora: resumenWebhook(await infoWebhook(env.TELEGRAM_BOT_TOKEN)) }, puesto.ok ? 200 : 502);
  }
  return NO();
}

export default {
  async fetch(request, env) {
    const ruta = new URL(request.url).pathname;
    if (ruta === '/telegram' && request.method === 'POST') return atenderTelegram({ request, env, db: dbDe(env) });
    if (ruta.startsWith('/admin/')) return admin(request, env, ruta);
    return NO();
  },
};
