// POST /telegram: el único buzón de Kimiko (un bot, una entrada).
//  · Botones del borrador diario: Publicar / Corregir / Descartar. Publicar pasa los controles de qh-editorial,
//    comprueba la URL pública y deja el botón 🗑 Retirar (lib/publicar.js).
//  · Botones de pieza: pb/rb (post) y pf/rf (ficha de planta), y /pieza <texto> para pedirlos.
//  · Mensajes de Kristian (texto o foto): órdenes para Kimiko Cloud → kimiko_drafts + repository_dispatch.
//  · Notas de voz (13-oct): la Edge Function kimiko-voz las pasa a texto; Kimiko enseña lo entendido y espera ✅ (vok) o ✖ (vno).
//    Lo que no sabe leer (sticker, vídeo, documento sin texto…) ya no se ignora en silencio: lo dice.
//  · Botones de PR de Kimiko Cloud: Fusionar / Cerrar (Kimiko Cloud nunca toca main por su cuenta).
//  · Comandos /estado, /auditar, /manual, /hoy, /pausa y /reanudar (ver comandos.js).
//  · Freno (F0-08): con Kimiko en pausa solo responden /estado y /reanudar; lo demás se contesta sin hacer nada.
// Solo obedece al TELEGRAM_CHAT_ID; cualquier otro remitente se ignora y queda en kimiko_updates (ok=false).
// Responde siempre 200 a Telegram (si no, reintenta). Pocas subpeticiones: el plan Free da 10 ms de CPU.
import { secretoWebhook, responderBoton, cambiarBotones, enviarMensaje, enviarFoto, guardarFoto, BOTONES_PIEZA, BOTONES_VOZ, ponerTeclado } from '../lib/telegram.js';
import { pedirTranscripcion, MAX_SEGUNDOS } from '../lib/voz.js';
import { publicarPieza, retirarPieza, estaPublicada, urlPost, urlFicha, urlImagen } from '../lib/publicar.js';
import { despertarKimikoCloud, fusionarPR, cerrarPR, pedirReel } from '../lib/github.js';
import { atenderComando } from './comandos.js';
import { leerFreno, SIGUE_EN_PAUSA, textoEnPausa } from '../lib/freno.js';

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
    const reel = tipo === 'post' ? await lanzarReel({ env, db, id, fetchImpl }) : '';
    await ponerTeclado(token, chat, mid, BOTONES_PIEZA(tipo, id, true), fetchImpl);
    await enviarMensaje({ token, chatId: chat, texto: `✅ Publicado ${nombre}\n${r.url}${reel}`, teclado: BOTONES_PIEZA(tipo, id, true), fetchImpl });
  } else if (accion === 'publicar') {
    await enviarMensaje({ token, chatId: chat, texto: [`⛔ No publico ${nombre}. Sigue en borrador.`, ...(r.motivos || []).slice(0, 8).map((m) => `• ${m}`), ...(r.accion ? [`👉 ${r.accion}`] : [])].join('\n'), fetchImpl });
  } else {
    await ponerTeclado(token, chat, mid, BOTONES_PIEZA(tipo, id, false), fetchImpl);
    await enviarMensaje({ token, chatId: chat, texto: r.ok ? `🗑 Retirado ${nombre}: vuelve a borrador y la web ya no lo muestra.` : `⚠️ Retirado ${nombre} en Supabase, sin confirmar en la web.\n👉 ${r.accion || (r.motivos || []).join(', ')}`, teclado: BOTONES_PIEZA(tipo, id, false), fetchImpl });
  }
  return r;
}

// 13-oct: el reel ya no espera a los horarios de GitHub (se saltan pases): sale al publicar el post que lleva pieza de redes.
// Si no se puede lanzar, se dice y queda el pase programado de respaldo. Nunca tumba la publicación.
async function lanzarReel({ env, db, id, fetchImpl }) {
  try {
    const [c] = await db.seleccionar('kimiko_content', `blog_post_id=eq.${id}&select=fecha,reel_url&order=created_at.desc&limit=1`);
    if (!c || c.reel_url) return '';
    if ((await leerFreno(db)).pausado) return '\n⏸ Reel en pausa (freno de Kimiko): /reanudar para volver.';
    await pedirReel(env.GH_TOKEN, /^\d{4}-\d{2}-\d{2}$/.test(String(c.fecha || '')) ? c.fecha : null, fetchImpl);
    return '\n🎬 El reel llega en unos minutos.';
  } catch (e) {
    return `\n🎬 El reel saldrá en el próximo pase (no pude lanzarlo ahora: ${String(e?.message ?? e).slice(0, 80)}).`;
  }
}

// /pieza <texto>: busca un post o una ficha por slug y la manda con su botón (Publicar o Retirar).
async function pedirPieza({ env, db, msg, fetchImpl }) {
  const q = String(msg.text).trim().split(/\s+/).slice(1).join('-').toLowerCase().replace(/[^a-z0-9-]/g, '');
  const token = env.TELEGRAM_BOT_TOKEN; const chatId = msg.chat.id;
  if (q.length < 3) return enviarMensaje({ token, chatId, texto: 'Uso: /pieza <parte del slug>, p. ej. /pieza salvia', fetchImpl });
  const [posts, plantas] = await Promise.all([
    db.seleccionar('blog_posts', `slug=ilike.*${q}*&select=id,slug,title,status,published&order=created_at.desc&limit=3`),
    db.seleccionar('plants', `slug=ilike.*${q}*&select=id,slug,nombre_es,image_cientifica_url,publicada&order=slug&limit=3`),
  ]);
  const piezas = [...posts.map((p) => ({ tipo: 'post', id: p.id, titulo: p.title, url: urlPost(p.slug), publicada: estaPublicada('post', p) })),
    ...plantas.map((p) => ({ tipo: 'ficha', id: p.id, titulo: `Ficha: ${p.nombre_es}`, url: urlFicha(p.slug), publicada: estaPublicada('ficha', p), foto: urlImagen(p.image_cientifica_url) }))];
  if (!piezas.length) return enviarMensaje({ token, chatId, texto: `No encuentro ningún post ni ficha con «${q}».`, fetchImpl });
  for (const p of piezas) {
    const texto = `${p.publicada ? '🟢 Publicada' : '📝 Borrador'} · ${p.titulo}\n${p.url}`;
    const teclado = BOTONES_PIEZA(p.tipo, p.id, p.publicada);
    if (p.tipo === 'ficha') {
      // 12-oct: la ficha llega con la lámina que enseñará la web, para revisarla ANTES de pulsar Publicar.
      if (!p.foto) { await enviarMensaje({ token, chatId, texto: `${texto}\n⚠️ No tiene lámina: no se puede publicar hasta que tenga una revisada.`, teclado, fetchImpl }); continue; }
      const f = await enviarFoto({ token, chatId, fotoUrl: p.foto, pie: `${texto}\n🖼 Esta es la imagen que saldrá en la web. ¿Es la planta correcta? Si no, no publiques.`, teclado, fetchImpl });
      if (f.ok) continue;
      await enviarMensaje({ token, chatId, texto: `${texto}\n⚠️ No pude enviarte la lámina (${f.error}). Ábrela antes de publicar: ${p.foto}`, teclado, fetchImpl });
      continue;
    }
    await enviarMensaje({ token, chatId, texto, teclado, fetchImpl });
  }
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
  await lanzarOrden({ env, db, id: fila.id, chatId: msg.chat.id, fetchImpl });
  return fila.id;
}

// Kimiko interno (13-oct): antes de gastar la suscripción de Claude, la Edge Function kimiko-orden (motores gratuitos) decide si
// responde ella una charla corta ('responder'), la pasa a Claude sin ejecutarla ('para_claude') o la deja a Kimiko Cloud ('cloud').
// Cualquier fallo o duda → 'cloud': el comportamiento de siempre.
async function triarOrden({ env, id, fetchImpl }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return 'cloud';
  try {
    const r = await fetchImpl(`${env.SUPABASE_URL}/functions/v1/kimiko-orden`, {
      method: 'POST', headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({ id }), signal: AbortSignal.timeout(12000),
    });
    if (!r.ok) return 'cloud';
    const d = await r.json().catch(() => ({}));
    return ['responder', 'para_claude', 'pausado'].includes(d?.ruta) ? d.ruta : 'cloud';
  } catch { return 'cloud'; }
}

// Despierta a Kimiko Cloud con una orden ya guardada en kimiko_drafts (texto, foto o voz confirmada).
async function lanzarOrden({ env, db, id, chatId, fetchImpl }) {
  const ruta = await triarOrden({ env, id, fetchImpl });
  if (ruta === 'pausado') {
    await enviarMensaje({ token: env.TELEGRAM_BOT_TOKEN, chatId, texto: '⏸ Kimiko en pausa: la orden queda guardada sin lanzar. Reenvíala después de /reanudar.', fetchImpl });
    return false;
  }
  if (ruta !== 'cloud') return true; // ya respondió o la dejó a Claude, y avisó a Kristian
  try {
    await despertarKimikoCloud(env.GH_TOKEN, id, fetchImpl);
  } catch (e) {
    // Antes la orden se quedaba en 'pendiente' sin avisar (pasó el 6-oct). Ahora queda marcada y Kristian lo sabe.
    const motivo = String(e?.message ?? e).slice(0, 200);
    await db.actualizar('kimiko_drafts', `id=eq.${id}`, { status: 'error_lanzar', updated_at: new Date().toISOString() });
    await enviarMensaje({ token: env.TELEGRAM_BOT_TOKEN, chatId, texto: `⚠️ Orden guardada, pero no pude despertar a Kimiko Cloud: ${motivo}\nReenvíala cuando esté arreglado.`, fetchImpl });
    return false;
  }
  await enviarMensaje({ token: env.TELEGRAM_BOT_TOKEN, chatId, texto: 'Recibido 🌿 Kimiko Cloud se pone con ello. Si hay cambios en la web te llegará un PR para aprobar aquí.', fetchImpl });
  return true;
}

// Nota de voz (o audio) de Kristian. El 12-oct un audio se perdió sin aviso: el worker solo leía texto y fotos.
// Ahora se transcribe y Kimiko enseña lo entendido; solo con ✅ se lanza Kimiko Cloud (un audio mal oído no debe acabar en un PR).
async function notaDeVoz({ env, db, update, msg, detalle, fetchImpl }) {
  const token = env.TELEGRAM_BOT_TOKEN; const chatId = msg.chat.id;
  const audio = msg.voice || msg.audio;
  if ((audio.duration || 0) > MAX_SEGUNDOS) {
    return enviarMensaje({ token, chatId, texto: `🎙️ El audio pasa de ${MAX_SEGUNDOS / 60} minutos. Pártelo en notas más cortas y te las paso a texto.`, fetchImpl });
  }
  let t;
  try {
    t = await pedirTranscripcion({ supabaseUrl: env.SUPABASE_URL, llave: env.SUPABASE_SERVICE_ROLE_KEY, fileId: audio.file_id, fetchImpl });
  } catch (e) {
    const motivo = String(e?.message ?? e).slice(0, 160);
    await db.actualizar('kimiko_updates', `update_id=eq.${update.update_id}`, { ok: false, detalle: { ...detalle, error: motivo } }).catch(() => {});
    return enviarMensaje({ token, chatId, texto: `🎙️ No he podido pasar el audio a texto (${motivo}). ¿Me lo escribes?`, fetchImpl });
  }
  let nota = [msg.caption, t.texto].filter(Boolean).join('\n\n');
  const post = msg.reply_to_message?.text?.match(/\[post:([0-9a-f-]{36})\]/i);
  if (post && UUID.test(post[1])) nota = `Modifica el post de blog con id ${post[1]} (tabla blog_posts): ${nota}`;
  const fila = await db.insertar('kimiko_drafts', { status: 'voz_por_confirmar', chat_id: chatId, update_id: update.update_id, source_note: nota, tg_file_id: audio.file_id, tg_message_id: msg.message_id });
  await db.actualizar('kimiko_updates', `update_id=eq.${update.update_id}`, { detalle: { ...detalle, texto: t.texto.slice(0, 200), motor: t.motor ?? null, ms: t.ms ?? null } }).catch(() => {});
  await enviarMensaje({ token, chatId, texto: `🎙️ He entendido:\n«${t.texto}»\n\n¿Se lo paso a Kimiko Cloud?`, teclado: BOTONES_VOZ(fila.id), fetchImpl });
  return fila.id;
}

// ✅ / ✖ de una nota de voz transcrita. Solo vale una vez: después la orden ya no está 'voz_por_confirmar'.
async function botonVoz({ env, db, cq, codigo, id, fetchImpl }) {
  const token = env.TELEGRAM_BOT_TOKEN; const chat = cq.message.chat.id; const mid = cq.message.message_id;
  const [o] = await db.seleccionar('kimiko_drafts', `id=eq.${id}&select=id,status`);
  if (o?.status !== 'voz_por_confirmar') { await responderBoton(token, cq.id, o ? `Ya estaba ${o.status}` : 'No encuentro esa orden', fetchImpl); return; }
  const si = codigo === 'vok';
  await db.actualizar('kimiko_drafts', `id=eq.${id}`, { status: si ? 'pendiente' : 'descartado', updated_at: new Date().toISOString() });
  await responderBoton(token, cq.id, si ? '✅ Se la paso a Kimiko Cloud' : '✖ Descartada: no se hace nada', fetchImpl);
  await cambiarBotones(token, chat, mid, si ? '✅ Enviada a Kimiko Cloud' : '✖ Descartada', fetchImpl);
  if (si) await lanzarOrden({ env, db, id, chatId: chat, fetchImpl });
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
    ...(msg?.voice || msg?.audio ? { voz: true, segundos: (msg.voice || msg.audio).duration ?? null } : {}),
    ...(autorizado ? {} : { ignorado: 'remitente no autorizado', chat, de: cq?.from?.username ?? msg?.from?.username ?? null }),
  };
  // Se registra TODO antes de actuar (también lo ignorado). Si ya existía, es un reintento de Telegram: no se repite.
  const fila = await db.insertarSiNuevo('kimiko_updates', { update_id: update.update_id, tipo: 'telegram', project_id: 'qh', ok: autorizado, detalle }, 'update_id');
  if (!fila || !autorizado) return OK();

  // Freno (F0-08): en pausa (o si el freno no se lee) solo /estado y /reanudar. Nada se guarda, se publica ni se lanza.
  if (!SIGUE_EN_PAUSA.test(String(msg?.text || ''))) {
    const freno = await leerFreno(db);
    if (freno.pausado) {
      if (cq) await responderBoton(env.TELEGRAM_BOT_TOKEN, cq.id, '⏸ Kimiko en pausa: /reanudar para volver', fetchImpl);
      else if (msg) await enviarMensaje({ token: env.TELEGRAM_BOT_TOKEN, chatId: msg.chat.id, texto: textoEnPausa(freno), fetchImpl });
      await db.actualizar('kimiko_updates', `update_id=eq.${update.update_id}`, { detalle: { ...detalle, en_pausa: true } }).catch(() => {});
      return OK();
    }
  }

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
      else if (codigo === 'vok' || codigo === 'vno') await botonVoz({ env, db, cq, codigo, id, fetchImpl });
      else await responderBoton(env.TELEGRAM_BOT_TOKEN, cq.id, 'Botón desconocido', fetchImpl);
    } else if (msg && /^\/pieza(@\S+)?(\s|$)/i.test(String(msg.text || ''))) {
      await pedirPieza({ env, db, msg, fetchImpl });
    } else if (msg && String(msg.text || '').startsWith('/')) {
      await enviarMensaje({ token: env.TELEGRAM_BOT_TOKEN, chatId: msg.chat.id, texto: await atenderComando({ texto: msg.text, db, fetchImpl }), fetchImpl });
    } else if (msg && (msg.voice || msg.audio)) {
      await notaDeVoz({ env, db, update, msg, detalle, fetchImpl });
    } else if (msg && (msg.text || msg.caption || msg.photo)) {
      await orden({ env, db, update, msg, fetchImpl });
    } else if (msg) {
      await enviarMensaje({ token: env.TELEGRAM_BOT_TOKEN, chatId: msg.chat.id, texto: '🤖 Este tipo de mensaje todavía no lo sé leer. Mándame texto, una foto o una nota de voz.', fetchImpl });
    }
  } catch (e) {
    if (cq) await responderBoton(env.TELEGRAM_BOT_TOKEN, cq.id, `❌ ${e.message}`.slice(0, 190), fetchImpl);
    else await enviarMensaje({ token: env.TELEGRAM_BOT_TOKEN, chatId: chat, texto: `❌ No pude pasar la orden a Kimiko Cloud: ${e.message}`, fetchImpl });
    await db.actualizar('kimiko_updates', `update_id=eq.${update.update_id}`, { ok: false, detalle: { ...detalle, error: e.message } }).catch(() => {});
  }
  return OK();
}
