// ── Kimiko Buzón ─────────────────────────────────────────────
// Este handler solo hace tres cosas:
//   1. Valida el secreto del webhook de Telegram
//   2. Guarda el mensaje/foto en kimiko_drafts (estado 'pendiente')
//   3. Dispara repository_dispatch en Quantum-Holistic-2 para que
//      Kimiko Cloud (GitHub Actions + CLAUDE_CODE_OAUTH_TOKEN) lo procese
//
// NO llama a api.anthropic.com ni a Gemini. Coste: cero.

export const config = { maxDuration: 10 };

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TG_TOKEN    = process.env.TELEGRAM_BOT_TOKEN;
const TG_SECRET   = process.env.TELEGRAM_WEBHOOK_SECRET;
const GH_TOKEN    = process.env.GH_DISPATCH_TOKEN;

const GH_DISPATCH_URL =
  'https://api.github.com/repos/Kristian82-40/Quantum-Holistic-2/dispatches';

async function sbPost(table, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      authorization: `Bearer ${SUPABASE_KEY}`,
      'content-type': 'application/json',
      prefer: 'return=representation',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase POST ${table}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function tgSend(chatId, text) {
  await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).send('Kimiko buzón en pie 🌿');

  // 1. Validar secreto
  if (TG_SECRET && req.headers['x-telegram-bot-api-secret-token'] !== TG_SECRET) {
    return res.status(401).send('no');
  }

  const update = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const msg = update?.message || update?.edited_message;
  const chatId = msg?.chat?.id;

  try {
    // 2. Guardar en kimiko_drafts con estado 'pendiente'
    const draft = {
      status: 'pendiente',
      chat_id: chatId ?? null,
      update_id: update.update_id ?? null,
      source_note: msg?.caption || msg?.text || null,
      tg_file_id: msg?.photo ? msg.photo[msg.photo.length - 1].file_id : null,
      raw_update: update,
    };

    const [row] = await sbPost('kimiko_drafts', [draft]);

    // 3. Disparar repository_dispatch → Kimiko Cloud lo recoge
    await fetch(GH_DISPATCH_URL, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${GH_TOKEN}`,
        accept: 'application/vnd.github+json',
        'content-type': 'application/json',
        'x-github-api-version': '2022-11-28',
      },
      body: JSON.stringify({
        event_type: 'kimiko-buzon',
        client_payload: { draft_id: row?.id ?? null },
      }),
    });

    // 4. Confirmar recepción al usuario y responder 200 a Telegram
    if (chatId) {
      await tgSend(chatId, 'Recibido, Kimiko lo procesa en breve. 🌿');
    }
  } catch (e) {
    console.error('kimiko-buzon error:', e?.message || e);
    if (chatId) {
      await tgSend(chatId, '⚠️ Hubo un problema al recibir tu mensaje. Inténtalo de nuevo.').catch(() => {});
    }
  }

  // Siempre 200 a Telegram para evitar reintentos
  return res.status(200).send('ok');
}
