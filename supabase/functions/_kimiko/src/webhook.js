// POST /telegram: el único buzón de Kimiko (un bot, una entrada).
//  · Botones del borrador diario: Publicar / Corregir / Descartar.
//  · Mensajes de Kristian (texto o foto): órdenes para Kimiko Cloud → kimiko_drafts + repository_dispatch.
//  · Botones de PR de Kimiko Cloud: Fusionar / Cerrar (Kimiko Cloud nunca toca main por su cuenta).
// Solo obedece al TELEGRAM_CHAT_ID; cualquier otro remitente se ignora y queda en kimiko_updates (ok=false).
// Responde siempre 200 a Telegram (si no, reintenta). Pocas subpeticiones: el plan Free da 10 ms de CPU.
import { secretoWebhook, responderBoton, cambiarBotones, enviarMensaje, guardarFoto } from '../lib/telegram.js';
import { despertarKimikoCloud, fusionarPR, cerrarPR } from '../lib/github.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const OK = () => new Response('ok');

export async function igualSeguro(a, b) {
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([crypto.subtle.digest('SHA-256', enc.encode(a)), crypto.subtle.digest('SHA-256', enc.encode(b))]);
  const x = new Uint8Array(ha); const y = new Uint8Array(hb);
  let dif = 0;
  for (let i = 0; i < x.length; i++) dif |= x[i] ^ y[i];
  return dif === 0;
}

const ACCIONES = {
  pub: { blog: { status: 'published', published: true }, estado: 'publicado', texto: '✅ Publicado en la web', boton: '✅ Publicado' },
  des: { blog: { status: 'rejected', published: false }, estado: 'descartado', texto: '🗑 Descartado (no se borra nada)', boton: '🗑 Descartado' },
  cor: { blog: null, estado: 'revision', texto: '✏️ Dime qué cambiar respondiendo al mensaje', boton: null },
};

async function botonBorrador({ env, db, cq, codigo, id, fetchImpl }) {
  const accion = ACCIONES[codigo];
  const [pieza] = await db.seleccionar('kimiko_content', `id=eq.${id}&select=blog_post_id`);
  if (!pieza) throw new Error('pieza no encontrada');
  if (accion.blog && pieza.blog_post_id) await db.actualizar('blog_posts', `id=eq.${pieza.blog_post_id}`, { ...accion.blog, updated_at: new Date().toISOString() });
  await db.actualizar('kimiko_content', `id=eq.${id}`, { estado: accion.estado });
  await responderBoton(env.TELEGRAM_BOT_TOKEN, cq.id, accion.texto, fetchImpl);
  if (accion.boton) await cambiarBotones(env.TELEGRAM_BOT_TOKEN, cq.message.chat.id, cq.message.message_id, accion.boton, fetchImpl);
  // Corregir: la respuesta a este mensaje llega como orden para Kimiko Cloud sobre ese post.
  if (codigo === 'cor' && pieza.blog_post_id) await enviarMensaje({ token: env.TELEGRAM_BOT_TOKEN, chatId: cq.message.chat.id, texto: `✏️ Responde a este mensaje con lo que quieres cambiar en el post. Kimiko Cloud lo hará en un PR. [post:${pieza.blog_post_id}]`, forzarRespuesta: true, fetchImpl });
}

async function botonPR({ env, db, cq, codigo, id, fetchImpl }) {
  const [orden] = await db.seleccionar('kimiko_drafts', `id=eq.${id}&select=pr_numero,status`);
  if (!orden?.pr_numero) throw new Error('esta orden no tiene PR');
  if (orden.status !== 'pr_abierto') { await responderBoton(env.TELEGRAM_BOT_TOKEN, cq.id, `Ya estaba ${orden.status}`, fetchImpl); return; }
  if (codigo === 'prm') await fusionarPR(env.GH_TOKEN, orden.pr_numero, fetchImpl); else await cerrarPR(env.GH_TOKEN, orden.pr_numero, fetchImpl);
  const estado = codigo === 'prm' ? 'fusionado' : 'cerrado';
  await db.actualizar('kimiko_drafts', `id=eq.${id}`, { status: estado, updated_at: new Date().toISOString() });
  await responderBoton(env.TELEGRAM_BOT_TOKEN, cq.id, codigo === 'prm' ? `✅ PR #${orden.pr_numero} fusionado: Vercel despliega` : `❌ PR #${orden.pr_numero} cerrado`, fetchImpl);
  await cambiarBotones(env.TELEGRAM_BOT_TOKEN, cq.message.chat.id, cq.message.message_id, codigo === 'prm' ? `✅ PR #${orden.pr_numero} fusionado` : `❌ PR #${orden.pr_numero} cerrado`, fetchImpl);
}

async function orden({ env, db, update, msg, fetchImpl }) {
  let nota = msg.caption || msg.text || '';
  const post = msg.reply_to_message?.text?.match(/\[post:([0-9a-f-]{36})\]/i);
  if (post && UUID.test(post[1]) && nota) nota = `Modifica el post de blog con id ${post[1]} (tabla blog_posts): ${nota}`;
  const fileId = msg.photo ? msg.photo[msg.photo.length - 1].file_id : null;
  const imagen = fileId ? await guardarFoto({ token: env.TELEGRAM_BOT_TOKEN, fileId, ruta: `ordenes/${update.update_id}.jpg`, subirStream: db.subirStream, fetchImpl }) : null;
  const fila = await db.insertar('kimiko_drafts', { status: 'pendiente', chat_id: msg.chat.id, update_id: update.update_id, source_note: nota || null, tg_file_id: fileId, imagen_ruta: imagen, tg_message_id: msg.message_id });
  await despertarKimikoCloud(env.GH_TOKEN, fila.id, fetchImpl);
  await enviarMensaje({ token: env.TELEGRAM_BOT_TOKEN, chatId: msg.chat.id, texto: 'Recibido 🌿 Kimiko Cloud se pone con ello. Si hay cambios en la web te llegará un PR para aprobar aquí.', fetchImpl });
  return fila.id;
}

export async function atenderTelegram({ request, env, db, fetchImpl = fetch }) {
  const esperado = await secretoWebhook(env.TELEGRAM_BOT_TOKEN || '');
  if (!env.TELEGRAM_BOT_TOKEN || !(await igualSeguro(request.headers.get('x-telegram-bot-api-secret-token') || '', esperado))) {
    return new Response('Forbidden', { status: 403 });
  }
  const update = await request.json().catch(() => null);
  if (!update?.update_id) return OK();
  const cq = update.callback_query;
  const msg = update.message;
  const chat = String(cq?.message?.chat?.id ?? msg?.chat?.id ?? '');
  const autorizado = !!env.TELEGRAM_CHAT_ID && chat === String(env.TELEGRAM_CHAT_ID);
  const [codigo, id] = String(cq?.data || '').split(':');
  const detalle = {
    chat_ok: autorizado, datos: cq?.data ?? null, texto: (msg?.text || msg?.caption)?.slice(0, 200) ?? null, foto: !!msg?.photo,
    ...(autorizado ? {} : { ignorado: 'remitente no autorizado', chat, de: cq?.from?.username ?? msg?.from?.username ?? null }),
  };
  // Se registra TODO antes de actuar (también lo ignorado). Si ya existía, es un reintento de Telegram: no se repite.
  const fila = await db.insertarSiNuevo('kimiko_updates', { update_id: update.update_id, tipo: 'telegram', project_id: 'qh', ok: autorizado, detalle }, 'update_id');
  if (!fila || !autorizado) return OK();

  try {
    if (cq) {
      if (!UUID.test(id || '')) { await responderBoton(env.TELEGRAM_BOT_TOKEN, cq.id, 'Botón ya usado o desconocido', fetchImpl); return OK(); }
      if (ACCIONES[codigo]) await botonBorrador({ env, db, cq, codigo, id, fetchImpl });
      else if (codigo === 'prm' || codigo === 'prc') await botonPR({ env, db, cq, codigo, id, fetchImpl });
      else await responderBoton(env.TELEGRAM_BOT_TOKEN, cq.id, 'Botón desconocido', fetchImpl);
    } else if (msg && (msg.text || msg.caption || msg.photo) && !String(msg.text || '').startsWith('/')) {
      await orden({ env, db, update, msg, fetchImpl });
    }
  } catch (e) {
    if (cq) await responderBoton(env.TELEGRAM_BOT_TOKEN, cq.id, `❌ ${e.message}`.slice(0, 190), fetchImpl);
    else await enviarMensaje({ token: env.TELEGRAM_BOT_TOKEN, chatId: chat, texto: `❌ No pude pasar la orden a Kimiko Cloud: ${e.message}`, fetchImpl });
    await db.actualizar('kimiko_updates', `update_id=eq.${update.update_id}`, { ok: false, detalle: { ...detalle, error: e.message } }).catch(() => {});
  }
  return OK();
}
