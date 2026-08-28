import { env } from './env.js';

const API = () => `https://api.telegram.org/bot${env.TG_TOKEN}`;

async function call(method, body) {
  const res = await fetch(`${API()}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(`Telegram ${method}: ${json.description}`);
  return json.result;
}

export const tg = {
  async sendMessage(chatId, text, extra = {}) {
    return call('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', ...extra });
  },

  async sendPhoto(chatId, photoUrl, caption, extra = {}) {
    return call('sendPhoto', { chat_id: chatId, photo: photoUrl, caption, parse_mode: 'HTML', ...extra });
  },

  async editText(chatId, messageId, text, extra = {}) {
    return call('editMessageText', { chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML', ...extra });
  },

  async editCaption(chatId, messageId, caption, extra = {}) {
    return call('editMessageCaption', { chat_id: chatId, message_id: messageId, caption, parse_mode: 'HTML', ...extra });
  },

  async editMedia(chatId, messageId, photoUrl, caption, extra = {}) {
    return call('editMessageMedia', {
      chat_id: chatId,
      message_id: messageId,
      media: { type: 'photo', media: photoUrl, caption, parse_mode: 'HTML' },
      ...extra,
    });
  },

  async answerCallback(id, text = '') {
    return call('answerCallbackQuery', { callback_query_id: id, text });
  },

  async removeKeyboard(chatId, messageId) {
    try {
      await call('editMessageReplyMarkup', { chat_id: chatId, message_id: messageId, reply_markup: { inline_keyboard: [] } });
    } catch { /* el mensaje puede haber cambiado ya; no es crítico */ }
  },

  // Descarga una foto enviada al chat y la devuelve en base64 (para la visión de Claude)
  async downloadPhoto(fileId) {
    const file = await call('getFile', { file_id: fileId });
    const url = `https://api.telegram.org/file/bot${env.TG_TOKEN}/${file.file_path}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('No he podido descargar la foto de Telegram');
    const buf = Buffer.from(await res.arrayBuffer());
    const ext = (file.file_path.split('.').pop() || 'jpg').toLowerCase();
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    return { buffer: buf, base64: buf.toString('base64'), mime };
  },
};

export function draftKeyboard(id) {
  return {
    inline_keyboard: [
      [{ text: '✅ Publicar en Instagram', callback_data: `pub:${id}` }],
      [
        { text: '✏️ Otro texto', callback_data: `tone:${id}` },
        { text: '🎨 Otra imagen', callback_data: `img:${id}` },
      ],
      [{ text: '🗑 Descartar', callback_data: `del:${id}` }],
    ],
  };
}
