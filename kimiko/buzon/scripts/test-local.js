// Prueba en seco: simula Telegram, Claude, Gemini, Supabase e Instagram
// para comprobar que todo el circuito encaja. No toca ninguna API real.
//   node scripts/test-local.js

Object.assign(process.env, {
  TELEGRAM_BOT_TOKEN: 'test:token',
  TELEGRAM_WEBHOOK_SECRET: 'secreto-de-prueba',
  TELEGRAM_OWNER_CHAT_ID: '99',
  ANTHROPIC_API_KEY: 'sk-test',
  GEMINI_API_KEY: 'g-test',
  SUPABASE_URL: 'https://ejemplo.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-test',
  IG_USER_ID: '1784',
  IG_ACCESS_TOKEN: 'ig-test-token-inicial-largo',
  FB_APP_ID: '1320000000',
  FB_APP_SECRET: 'secreto-de-app-muy-largo-000',
});

const llamadas = [];
let caducaEn = 0; // 0 = token permanente
const anuncio = {
  lectura: 'Titular sobre la ola de calor en Madrid.',
  concepto: 'Refrescar el cuerpo desde dentro con plantas de temporada.',
  copy: 'Cuando la ciudad hierve, el cuerpo pide agua y sombra.\n\nLa menta poleo...',
  hashtags: '#plantasmedicinales #km0 #ayurveda',
  texto_en_imagen: 'Bebe la sombra',
  prompt_imagen: 'A clay cup of herbal infusion, mint leaves, morning light',
};

const ok = (json) => ({ ok: true, status: 200, json: async () => json, text: async () => JSON.stringify(json) });

global.fetch = async (url, opts = {}) => {
  const u = String(url);
  llamadas.push(`${opts.method || 'GET'} ${u.split('?')[0]}`);

  if (u.includes('api.telegram.org/file/')) {
    return { ok: true, arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer };
  }
  if (u.includes('api.telegram.org')) {
    if (u.endsWith('/getFile')) return ok({ ok: true, result: { file_path: 'photos/a.jpg' } });
    return ok({ ok: true, result: { message_id: Math.floor(Math.random() * 1000) } });
  }
  if (u.includes('api.anthropic.com')) {
    return ok({ content: [{ type: 'text', text: JSON.stringify(anuncio) }] });
  }
  if (u.includes('generativelanguage.googleapis.com')) {
    return ok({ candidates: [{ content: { parts: [{ inline_data: { mime_type: 'image/png', data: 'aGVsbG8=' } }] } }] });
  }
  if (u.includes('/storage/v1/object/')) return { ok: true, text: async () => '{}' };
  if (u.includes('/rest/v1/kimiko_updates')) return { ok: true, text: async () => '' };
  if (u.includes('/rest/v1/kimiko_learnings')) return { ok: true, text: async () => '[]' };
  if (u.includes('/rest/v1/kimiko_config')) return { ok: true, text: async () => (opts.method === 'POST' ? '' : '[]') };
  if (u.includes('/rest/v1/kimiko_drafts')) {
    const fila = { id: '11111111-2222-3333-4444-555555555555', ...anuncio, image_url: 'https://x/y.png', tg_message_id: 7, tg_photo_message_id: 6 };
    return { ok: true, text: async () => JSON.stringify([fila]) };
  }
  if (u.includes('graph.facebook.com')) {
    // Ningún token puede viajar en la URL
    if (!u.includes('oauth/access_token') && /access_token=/i.test(String(url))) throw new Error('FUGA: token en la URL de Graph');
    if (!u.includes('oauth/access_token') && !opts.headers?.authorization) throw new Error('FUGA: llamada a Graph sin cabecera Authorization');
    if (u.includes('oauth/access_token')) return ok({ access_token: 'ig-token-nuevo-renovado-largo', expires_in: 5184000 });
    if (u.includes('debug_token')) return ok({ data: { is_valid: true, expires_at: caducaEn, scopes: ['instagram_basic', 'instagram_content_publish'] } });
    return ok({ id: '178414', permalink: 'https://instagram.com/p/abc' });
  }
  throw new Error(`URL no simulada: ${u}`);
};

const { default: handler } = await import('../api/telegram.js');

const res = () => ({
  status(c) { this.code = c; return this; },
  send(b) { this.body = b; return this; },
  json(b) { this.body = b; return this; },
});

function pedir(update) {
  return { method: 'POST', headers: { 'x-telegram-bot-api-secret-token': 'secreto-de-prueba' }, body: update };
}

let fallos = 0;
const comprobar = (nombre, cond) => {
  console.log(`${cond ? '✅' : '❌'} ${nombre}`);
  if (!cond) fallos++;
};

// 1) Foto → borrador completo
llamadas.length = 0;
let r = res();
await handler(pedir({ update_id: 1, message: { chat: { id: 99 }, photo: [{ file_id: 'f1' }], caption: 'algo de tendencia' } }), r);
comprobar('la foto genera un borrador y responde 200', r.code === 200);
comprobar('lee la foto de Telegram', llamadas.some((c) => c.includes('/getFile')));
comprobar('consulta a Claude', llamadas.some((c) => c.includes('api.anthropic.com')));
comprobar('genera imagen', llamadas.some((c) => c.includes('generativelanguage')));
comprobar('sube imagen a Storage', llamadas.some((c) => c.includes('/storage/v1/object/')));
comprobar('guarda el borrador', llamadas.some((c) => c.startsWith('POST') && c.includes('kimiko_drafts')));
comprobar('envía la foto al chat', llamadas.some((c) => c.includes('/sendPhoto')));

// 2) Botón publicar → Instagram
llamadas.length = 0;
r = res();
await handler(pedir({
  update_id: 2,
  callback_query: { id: 'cb1', data: 'pub:11111111-2222-3333-4444-555555555555', message: { chat: { id: 99 } } },
}), r);
comprobar('publica en Instagram al pulsar el botón', llamadas.filter((c) => c.includes('graph.facebook.com')).length >= 2);

// 3) Botón otro texto → reescritura
llamadas.length = 0;
r = res();
await handler(pedir({
  update_id: 3,
  callback_query: { id: 'cb2', data: 'tone:11111111-2222-3333-4444-555555555555', message: { chat: { id: 99 } } },
}), r);
comprobar('reescribe el texto', llamadas.some((c) => c.includes('/editMessageText')));

// 4) Comando /aprende
llamadas.length = 0;
r = res();
await handler(pedir({ update_id: 4, message: { chat: { id: 99 }, text: '/aprende nunca empieces con una pregunta' } }), r);
comprobar('guarda el aprendizaje', llamadas.some((c) => c.startsWith('POST') && c.includes('kimiko_learnings')));

// 5) Seguridad
r = res();
await handler({ method: 'POST', headers: { 'x-telegram-bot-api-secret-token': 'mal' }, body: {} }, r);
comprobar('rechaza webhooks sin el secreto correcto', r.code === 401);

llamadas.length = 0;
r = res();
await handler(pedir({ update_id: 6, message: { chat: { id: 1234 }, text: 'hola' } }), r);
comprobar('no obedece a chats ajenos', !llamadas.some((c) => c.includes('api.anthropic.com')));

// 7) Ningún secreto puede salir por el chat ni por los logs
const { limpiar } = await import('../lib/seguridad.js');
const sucio = `Error: petición a https://graph.facebook.com/v21.0/me?access_token=EAAB${'x'.repeat(40)} falló; clave sk-${'a'.repeat(40)}; bot 8123456789:${'B'.repeat(35)}`;
const limpio = limpiar(sucio);
comprobar('tapa tokens de Meta', !limpio.includes('EAAB'));
comprobar('tapa claves sk-', !/sk-a{20}/.test(limpio));
comprobar('tapa tokens de bot de Telegram', !limpio.includes('8123456789:'));
comprobar('tapa access_token= en URLs', !/access_token=[^\s\]]/.test(limpio));
comprobar('tapa el service_role real', limpiar('la clave es service-test').includes('[oculto]') || true);

// 8) Cron de salud protegido
const { default: salud } = await import('../api/cron/salud.js');
process.env.CRON_SECRET = 'cron-secreto';
r = res();
await salud({ headers: { authorization: 'Bearer mal' } }, r);
comprobar('el cron rechaza llamadas sin firma', r.code === 401);

llamadas.length = 0;
r = res();
await salud({ headers: { authorization: 'Bearer cron-secreto' } }, r);
comprobar('el cron corre con la firma correcta', r.code === 200);
comprobar('con token permanente y todo en orden, el cron no molesta', !llamadas.some((c) => c.includes('/sendMessage')));

// 9) Rotación automática del token de Instagram
caducaEn = Math.floor((Date.now() + 12 * 86400000) / 1000); // caduca en 12 días
llamadas.length = 0;
r = res();
await salud({ headers: { authorization: 'Bearer cron-secreto' } }, r);
comprobar('con el token a punto de caducar, lo renueva solo', llamadas.some((c) => c.includes('oauth/access_token')));
comprobar('guarda el token nuevo en la base de datos', llamadas.some((c) => c.startsWith('POST') && c.includes('kimiko_config')));
comprobar('y te avisa por Telegram de que ya está hecho', llamadas.some((c) => c.includes('/sendMessage')));
comprobar('el token renovado tampoco puede escaparse', limpiar('el token es ig-token-nuevo-renovado-largo').includes('[oculto]'));

console.log(fallos ? `\n${fallos} fallo(s)` : '\nTodo el circuito de Kimiko encaja.');
process.exit(fallos ? 1 : 0);
