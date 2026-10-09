// POST /telegram: el único buzón de Kimiko (un bot, una entrada).
//  · Botones del borrador diario: Publicar / Corregir / Descartar. Publicar pasa los controles de qh-editorial,
//    comprueba la URL pública y deja el botón 🗑 Retirar (lib/publicar.js).
//  · Botones de pieza: pb/rb (post) y pf/rf (ficha de planta), y /pieza <texto> para pedirlos.
//  · Mensajes de Kristian (texto o foto): órdenes para Kimiko Cloud → kimiko_drafts + repository_dispatch.
//  · Botones de PR de Kimiko Cloud: Fusionar / Cerrar (Kimiko Cloud nunca toca main por su cuenta).
//  · Comandos /estado, /auditar y /manual (solo lectura; ver comandos.js).
// Solo obedece al TELEGRAM_CHAT_ID; cualquier otro remitente se ignora y queda en kimiko_updates (ok=false).
// Responde siempre 200 a Telegram (si no, reintenta). Pocas subpeticiones: el plan Free da 10 ms de CPU.
import { secretoWebhook, responderBoton, cambiarBotones, enviarMensaje, guardarFoto, BOTONES_PIEZA, ponerTeclado } from '../lib/telegram.js';
import { publicarPieza, retirarPieza, estaPublicada, urlPost, urlFicha } from '../lib/publicar.js';
import { despertarKimikoCloud, fusionarPR, cerrarPR } from '../lib/github.js';
import { atenderComando } from './comandos.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const ENTERO = /^[0-9]{1,9}$/;
// Botón de pieza → [acción, tipo, formato del id]
const PIEZA = { pb: ['publicar', 'post', UUID], rb: ['retirar', 'post', UUID], pf: ['publicar', 'ficha', ENTERO], rf: ['retirar', 'ficha', ENTERO] };
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
  // Publicar ya no escribe a ciegas: controles + prueba de la URL, como los botones de pieza.
  if (codigo === 'pub' && pieza.blog_post_id) {
    const r = await botonPieza({ env, db, cq, accion: 'publicar', tipo: 'post', id: pieza.blog_post_id, fetchImpl });
    if (r.ok) await db.actualizar('kimiko_content', `id=eq.${id}`, { estado: 'publicado' });
    return;
  }
  if (accion.blog && pieza.blog_post_id) await db.actualizar('blog_posts', `id=eq.${pieza.blog_post_id}`, { ...accion.blog, updated_at: new Date().toISOString() });
  await db.actualizar('kimiko_content', `id=eq.${id}`, { estado: accion.estado });
  await responderBoton(env.TELEGRAM_BOT_TOKEN, cq.id, accion.texto, fetchImpl);
  if (accion.boton) await cambiarBotones(env.TELEGRAM_BOT_TOKEN, cq.message.chat.id, cq.message.message_id, accion.boton, fetchImpl);
  // Corregir: la respuesta a este mensaje llega como orden para Kimiko Cloud sobre ese post.
  if (codigo === 'cor' && pieza.blog_post_id) await enviarMensaje({ token: env.TELEGRAM_BOT_TOKEN, chatId: cq.message.chat.id, texto: `✏️ Responde a este mensaje con lo que quieres cambiar en el post. Kimiko Cloud lo hará en un PR. [post:${pieza.blog_post_id}]`, forzarRespuesta: true, fetchImpl });
}

// Publicar / Retirar una pieza. Responde enseguida (Telegram espera ~15 s) y el resultado llega como mensaje.
async function botonPieza({ env, db, cq, accion, tipo, id, fetchImpl }) {
  const token = env.TELEGRAM_BOT_TOKEN; const chat = cq.message.chat.id; const mid = cq.message.message_id;
  await responderBoton(token, cq.id, accion === 'publicar' ? '⏳ Reviso, publico y compruebo la web…' : '⏳ Retiro y compruebo la web…', fetchImpl);
  const r = accion === 'publicar'
    ? await publicarPieza({ db, tipo, id, fetchImpl })
    : await retirarPieza({ db, tipo, id, fetchImpl });
  const nombre = r.titulo ? `«${r.titulo}»` : 'la pieza';
  if (accion === 'publicar' && r.ok) {
    await ponerTeclado(token, chat, mid, BOTONES_PIEZA(tipo, id, true), fetchImpl);
    await enviarMensaje({ token, chatId: chat, texto: `✅ Publicado ${nombre}\n${r.url}`, teclado: BOTONES_PIEZA(tipo, id, true), fetchImpl });
  } else if (accion === 'publicar') {
    await enviarMensaje({ token, chatId: chat, texto: [`⛔ No publico ${nombre}. Sigue en borrador.`, ...(r.motivos || []).slice(0, 8).map((m) => `• ${m}`), ...(r.accion ? [`👉 ${r.accion}`] : [])].join('\n'), fetchImpl });
  } else {
    await ponerTeclado(token, chat, mid, BOTONES_PIEZA(tipo, id, false), fetchImpl);
    await enviarMensaje({ token, chatId: chat, texto: r.ok ? `🗑 Retirado ${nombre}: vuelve a borrador y la web ya no lo muestra.` : `⚠️ Retirado ${nombre} en Supabase, sin confirmar en la web.\n👉 ${r.accion || (r.motivos || []).join(', ')}`, teclado: BOTONES_PIEZA(tipo, id, false), fetchImpl });
  }
  return r;
}

// /pieza <texto>: busca un post o una ficha por slug y la manda con su botón (Publicar o Retirar).
async function pedirPieza({ env, db, msg, fetchImpl }) {
  const q = String(msg.text).trim().split(/\s+/).slice(1).join('-').toLowerCase().replace(/[^a-z0-9-]/g, '');
  const token = env.TELEGRAM_BOT_TOKEN; const chatId = msg.chat.id;
  if (q.length < 3) return enviarMensaje({ token, chatId, texto: 'Uso: /pieza <parte del slug>, p. ej. /pieza salvia', fetchImpl });
  const [posts, plantas] = await Promise.all([
    db.seleccionar('blog_posts', `slug=ilike.*${q}*&select=id,slug,title,status,published&order=created_at.desc&limit=3`),
    db.seleccionar('plants', `slug=ilike.*${q}*&select=id,slug,nombre_es,publicada&order=slug&limit=3`),
  ]);
  const piezas = [...posts.map((p) => ({ tipo: 'post', id: p.id, titulo: p.title, url: urlPost(p.slug), publicada: estaPublicada('post', p) })),
    ...plantas.map((p) => ({ tipo: 'ficha', id: p.id, titulo: `Ficha: ${p.nombre_es}`, url: urlFicha(p.slug), publicada: estaPublicada('ficha', p) }))];
  if (!piezas.length) return enviarMensaje({ token, chatId, texto: `No encuentro ningún post ni ficha con «${q}».`, fetchImpl });
  for (const p of piezas) await enviarMensaje({ token, chatId, texto: `${p.publicada ? '🟢 Publicada' : '📝 Borrador'} · ${p.titulo}\n${p.url}`, teclado: BOTONES_PIEZA(p.tipo, p.id, p.publicada), fetchImpl });
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
  try {
    await despertarKimikoCloud(env.GH_TOKEN, fila.id, fetchImpl);
  } catch (e) {
    // Antes la orden se quedaba en 'pendiente' sin avisar (pasó el 6-oct). Ahora queda marcada y Kristian lo sabe.
    const motivo = String(e?.message ?? e).slice(0, 200);
    await db.actualizar('kimiko_drafts', `id=eq.${fila.id}`, { status: 'error_lanzar', updated_at: new Date().toISOString() });
    await enviarMensaje({ token: env.TELEGRAM_BOT_TOKEN, chatId: msg.chat.id, texto: `⚠️ Orden guardada, pero no pude despertar a Kimiko Cloud: ${motivo}\nReenvíala cuando esté arreglado.`, fetchImpl });
    return fila.id;
  }
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
      if (PIEZA[codigo]) {
        const [accion, tipo, formato] = PIEZA[codigo];
        if (!formato.test(id || '')) { await responderBoton(env.TELEGRAM_BOT_TOKEN, cq.id, 'Botón desconocido', fetchImpl); return OK(); }
        await botonPieza({ env, db, cq, accion, tipo, id, fetchImpl });
        return OK();
      }
      if (!UUID.test(id || '')) { await responderBoton(env.TELEGRAM_BOT_TOKEN, cq.id, 'Botón ya usado o desconocido', fetchImpl); return OK(); }
      if (ACCIONES[codigo]) await botonBorrador({ env, db, cq, codigo, id, fetchImpl });
      else if (codigo === 'prm' || codigo === 'prc') await botonPR({ env, db, cq, codigo, id, fetchImpl });
      else await responderBoton(env.TELEGRAM_BOT_TOKEN, cq.id, 'Botón desconocido', fetchImpl);
    } else if (msg && /^\/pieza(@\S+)?(\s|$)/i.test(String(msg.text || ''))) {
      await pedirPieza({ env, db, msg, fetchImpl });
    } else if (msg && String(msg.text || '').startsWith('/')) {
      await enviarMensaje({ token: env.TELEGRAM_BOT_TOKEN, chatId: msg.chat.id, texto: await atenderComando({ texto: msg.text, db, fetchImpl }), fetchImpl });
    } else if (msg && (msg.text || msg.caption || msg.photo)) {
      await orden({ env, db, update, msg, fetchImpl });
    }
  } catch (e) {
    if (cq) await responderBoton(env.TELEGRAM_BOT_TOKEN, cq.id, `❌ ${e.message}`.slice(0, 190), fetchImpl);
    else await enviarMensaje({ token: env.TELEGRAM_BOT_TOKEN, chatId: chat, texto: `❌ No pude pasar la orden a Kimiko Cloud: ${e.message}`, fetchImpl });
    await db.actualizar('kimiko_updates', `update_id=eq.${update.update_id}`, { ok: false, detalle: { ...detalle, error: e.message } }).catch(() => {});
  }
  return OK();
}
