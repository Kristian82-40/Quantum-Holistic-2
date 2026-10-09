// Telegram: avisos y entrega del borrador del día con botones. Solo habla con el chat de Kristian (TELEGRAM_CHAT_ID).
// Nunca lanza: devuelve { ok, error } para que un fallo de Telegram quede registrado en kimiko_updates.
async function llamar(token, metodo, cuerpo, fetchImpl = fetch) {
  if (!token) return { ok: false, error: 'falta TELEGRAM_BOT_TOKEN' };
  try {
    const r = await fetchImpl(`https://api.telegram.org/bot${token}/${metodo}`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo),
    });
    const d = await r.json().catch(() => ({}));
    return d.ok ? { ok: true, resultado: d.result } : { ok: false, error: `Telegram ${metodo} ${r.status}: ${d.description || 'sin detalle'}` };
  } catch (e) {
    return { ok: false, error: `Telegram ${metodo}: ${e.message}` };
  }
}

export const avisar = ({ token, chatId, texto, fetchImpl = fetch }) =>
  (chatId ? llamar(token, 'sendMessage', { chat_id: chatId, text: texto.slice(0, 3900), disable_web_page_preview: true }, fetchImpl) : Promise.resolve({ ok: false, error: 'falta TELEGRAM_CHAT_ID' }));

export const BOTONES = (id) => ({
  inline_keyboard: [[
    { text: '✅ Publicar', callback_data: `pub:${id}` },
    { text: '✏️ Corregir', callback_data: `cor:${id}` },
    { text: '🗑 Descartar', callback_data: `des:${id}` },
  ]],
});

// Botones de una pieza ya presentada (post o ficha): Publicar si está en borrador, Retirar si está publicada.
// tipo 'post' → pb/rb:<uuid de blog_posts>; 'ficha' → pf/rf:<id de plants>.
export const BOTONES_PIEZA = (tipo, id, publicada) => ({
  inline_keyboard: [[publicada
    ? { text: '🗑 Retirar', callback_data: `${tipo === 'post' ? 'rb' : 'rf'}:${id}` }
    : { text: '✅ Publicar', callback_data: `${tipo === 'post' ? 'pb' : 'pf'}:${id}` }]],
});

export const ponerTeclado = (token, chatId, messageId, teclado, fetchImpl = fetch) =>
  llamar(token, 'editMessageReplyMarkup', { chat_id: chatId, message_id: messageId, reply_markup: teclado }, fetchImpl);

// Foto por URL (bucket público) con pie y botones. id = kimiko_content.id
export const enviarBorrador = ({ token, chatId, fotoUrl, pie, id, fetchImpl = fetch }) =>
  llamar(token, 'sendPhoto', { chat_id: chatId, photo: fotoUrl, caption: pie.slice(0, 1000), reply_markup: BOTONES(id) }, fetchImpl);

// Reel del día (MP4 en el bucket público): Telegram lo descarga por URL (máx. 20 MB) y lo muestra con su pie.
export const enviarVideo = ({ token, chatId, videoUrl, pie, fetchImpl = fetch }) =>
  llamar(token, 'sendVideo', { chat_id: chatId, video: videoUrl, caption: pie.slice(0, 1000), supports_streaming: true, width: 1080, height: 1920 }, fetchImpl);

// Pie del reel: listo para copiar en Instagram/TikTok (texto, hashtags y enlace al post).
export function pieReel({ titular, copy, hashtags = [], slug, dominio = 'quantum-holistic.com' }) {
  const enlace = slug ? `https://${dominio}/blog/${slug}` : `https://${dominio}/blog`;
  return [`🎬 Reel del día · ${titular ?? ''}`.trim(), '', String(copy ?? '').trim(), '', (hashtags ?? []).join(' '), '', `👉 ${enlace}`, '', 'Guárdalo en el carrete y súbelo a mano (añade la música en la app).']
    .join('\n').replace(/\n{3,}/g, '\n\n').slice(0, 1000);
}

export const responderBoton = (token, callbackId, texto, fetchImpl = fetch) =>
  llamar(token, 'answerCallbackQuery', { callback_query_id: callbackId, text: texto.slice(0, 190) }, fetchImpl);

export const cambiarBotones = (token, chatId, messageId, texto, fetchImpl = fetch) =>
  llamar(token, 'editMessageReplyMarkup', { chat_id: chatId, message_id: messageId, reply_markup: { inline_keyboard: [[{ text: texto, callback_data: 'hecho' }]] } }, fetchImpl);

// secret_token del webhook derivado del propio token (HMAC): no hace falta otro secreto y cambia si se rota el bot.
export async function secretoWebhook(token) {
  const clave = await crypto.subtle.importKey('raw', new TextEncoder().encode(token), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const firma = await crypto.subtle.sign('HMAC', clave, new TextEncoder().encode('kimiko-webhook-v1'));
  return [...new Uint8Array(firma)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const ponerWebhook = async (token, url, fetchImpl = fetch) =>
  llamar(token, 'setWebhook', { url, secret_token: await secretoWebhook(token), allowed_updates: ['callback_query', 'message'], drop_pending_updates: true }, fetchImpl);

export const infoWebhook = (token, fetchImpl = fetch) => llamar(token, 'getWebhookInfo', {}, fetchImpl);

// Mensaje con teclado opcional (avisos de Kimiko Cloud con botones de PR, o petición de respuesta).
export const enviarMensaje = ({ token, chatId, texto, teclado, forzarRespuesta = false, fetchImpl = fetch }) =>
  llamar(token, 'sendMessage', {
    chat_id: chatId, text: texto.slice(0, 3900), disable_web_page_preview: true,
    ...(teclado ? { reply_markup: teclado } : forzarRespuesta ? { reply_markup: { force_reply: true } } : {}),
  }, fetchImpl);

export const BOTONES_PR = (draftId, numero) => ({
  inline_keyboard: [[
    { text: `✅ Fusionar PR #${numero}`, callback_data: `prm:${draftId}` },
    { text: '❌ Cerrar PR', callback_data: `prc:${draftId}` },
  ]],
});

// Foto de una orden: se descarga de Telegram y se sube en streaming (sin pasar por memoria: CPU mínima en Workers Free).
export async function guardarFoto({ token, fileId, subirStream, ruta, fetchImpl = fetch }) {
  const f = await llamar(token, 'getFile', { file_id: fileId }, fetchImpl);
  if (!f.ok) throw new Error(f.error);
  const r = await fetchImpl(`https://api.telegram.org/file/bot${token}/${f.resultado.file_path}`);
  if (!r.ok) throw new Error(`Telegram descarga ${r.status}`);
  return subirStream(ruta, r.body, r.headers.get('content-type') || 'image/jpeg');
}
