import { crearArticulo, validarProyecto, slugificar } from '../lib/blog.js';
import { imagenDelPost } from '../lib/imagen.js';
import { vigilarSitio } from '../lib/security.js';
import { avisar, enviarBorrador } from '../lib/telegram.js';
import { estadoGasto } from '../lib/budget.js';
import { avisosCaducidad } from '../lib/vault.js';
import { elegirPlanta, articuloSinIA } from '../lib/sin-ia.js';
import { chequeoDiario, textoChequeo } from '../lib/chequeo.js';
import { leerRunbook, tareaActiva, siFalla } from '../lib/runbook.js';

// La Edge Function vive como mucho 150 s (plan Free). El texto tiene hasta LIMITE_TEXTO_MS; después, sin IA.
// Pasado LIMITE_IMAGEN_MS ya no se pide flux (hasta 40 s): se usa la ficha PNG, que tarda ~2 s.
export const LIMITE_TEXTO_MS = 85000;
export const LIMITE_IMAGEN_MS = 100000;

const CAMPOS_REGLA = ['regla', 'rule', 'texto', 'text', 'content', 'contenido'];
const aRegla = (fila) => { for (const c of CAMPOS_REGLA) if (typeof fila[c] === 'string') return fila[c]; return null; };

const pieBorrador = (art, post, origenImagen) => [
  `📝 Borrador del blog · ${art.categoria}`,
  art.titulo,
  '',
  art.extracto,
  '',
  `Imagen: ${origenImagen === 'flux' ? 'acuarela (Workers AI)' : 'ficha de respaldo'} · Texto: ${art.modelo === 'plantilla-sin-ia' ? 'plantilla sin IA (fallaron Gemini, Workers AI y Groq)' : art.modelo}`,
  art.problemas.length ? `⚠️ Revisar: ${art.problemas.map((p) => p.motivo).join('; ')}` : '✅ Sin avisos del filtro legal',
  `Slug: ${post.slug}`,
].join('\n');

// Un proyecto: artículo de blog (borrador) + pieza de redes. Lanza si falla; el registro lo hace quien llama.
async function blogDelProyecto({ env, ai, db, proyecto, fecha, slot, forzarError, forzarFicha, fetchImpl, reg, t0 }) {
  if (forzarError) throw new Error('Error provocado a propósito (prueba de avisos)');
  const valido = validarProyecto(proyecto);
  if (!valido.ok) throw new Error(`proyecto incompleto: falta ${valido.faltan.join(', ')}`);

  const ya = await db.seleccionar('kimiko_content', `project_id=eq.${proyecto.id}&fecha=eq.${fecha}&slot=eq.${slot}&select=id`);
  if (ya.length) { reg.detalle.saltado = 'ya existe la pieza de este día y slot'; return `${proyecto.id}: ya hecho hoy (slot ${slot}), no repito`; }

  const recientes = [
    ...(await db.seleccionar('blog_posts', 'select=title&order=created_at.desc&limit=40')).map((f) => f.title),
    ...(await db.seleccionar('kimiko_content', `project_id=eq.${proyecto.id}&select=titular&order=created_at.desc&limit=20`)).map((f) => f.titular),
  ];
  const aprendizajes = (await db.seleccionar('kimiko_learnings', 'select=*&limit=50')).map(aRegla).filter(Boolean);

  let art;
  try {
    art = await crearArticulo({ env, ai, proyecto, fecha, slot, recientes, aprendizajes, fetchImpl, hasta: t0 + LIMITE_TEXTO_MS });
  } catch (e) {
    if (!e.sinTexto) throw e;
    // Modo sin IA: un día malo nunca se queda en blanco. Ficha con plantilla desde `plants`, como borrador.
    const plantas = await db.seleccionar('plants', 'select=slug,nombre_es,nombre_latino,ficha_cientifica,ficha_verificada&ficha_cientifica=not.is.null');
    const planta = elegirPlanta(plantas, recientes, fecha);
    if (!planta) throw e;
    art = { ...articuloSinIA({ planta, proyecto }), errores: e.errores || [], bruto: e.bruto };
    reg.detalle.modo = 'sin-ia';
  }
  reg.respuesta_bruta = art.bruto;
  Object.assign(reg.detalle, { modelo_texto: art.modelo, errores_texto: art.errores.map((e) => `${e.motor}: ${e.error.slice(0, 200)}`), neuronas: art.neuronas, problemas: art.problemas });

  let slug = `${fecha}-${slugificar(art.titulo)}`;
  if ((await db.seleccionar('blog_posts', `slug=eq.${encodeURIComponent(slug)}&select=id`)).length) slug = `${slug}-${slot}-${Date.now() % 100000}`;

  const img = await imagenDelPost({
    ai, db, prompt: art.promptImagen, ruta: `blog/${proyecto.id}/${slug}`, forzarFicha: forzarFicha || Date.now() - t0 > LIMITE_IMAGEN_MS,
    ficha: { titulo: art.planta, subtitulo: art.nombreBotanico, pie: proyecto.sitio.replace(/^https?:\/\//, '') },
  });
  Object.assign(reg.detalle, { imagen: img.origen, imagen_url: img.url, aviso_imagen: img.aviso });
  reg.detalle.neuronas += img.neuronas;

  // Borrador: published=false (RLS de lectura pública) Y status='draft' (filtro de la web). Las dos puertas cerradas.
  const post = await db.insertar('blog_posts', {
    slug, title: art.titulo, excerpt: art.extracto, content: art.contenidoHtml, category: art.categoria,
    tags: art.etiquetas, image_url: img.url, published: false, status: 'draft',
  });
  reg.detalle.blog_post_id = post.id; reg.detalle.slug = slug;

  const contenido = await db.insertar('kimiko_content', {
    project_id: proyecto.id, fecha, slot, estado: art.problemas.length ? 'revision' : 'listo', pilar: art.pilar,
    titular: art.social.titular, copy: art.social.copy, hashtags: art.social.hashtags, texto_alternativo: art.social.texto_alternativo,
    prompt_imagen: art.promptImagen, variacion: art.variacion, imagen_ruta: `kimiko/${img.ruta}`, coste_usd: 0,
    problemas: art.problemas, blog_post_id: post.id,
  });
  reg.detalle.kimiko_content_id = contenido.id;

  const tg = await enviarBorrador({ token: env.TELEGRAM_BOT_TOKEN, chatId: env.TELEGRAM_CHAT_ID, fotoUrl: img.url, pie: pieBorrador(art, post, img.origen), id: contenido.id, fetchImpl });
  reg.detalle.telegram_borrador = tg.ok ? 'enviado' : tg.error;
  return `${proyecto.id}: borrador "${art.titulo}" (${art.categoria})${art.problemas.length ? ` · ${art.problemas.length} aviso(s)` : ''}${tg.ok ? '' : ` · ❌ Telegram: ${tg.error}`}`;
}

export async function ejecutarDia({ env, ai, proyectos, fecha, db, fetchImpl = fetch, opciones = {} }) {
  const { forzarError = false, forzarFicha = false, slot = 1, origen = 'cron', chequeo = origen === 'cron', t0 = Date.now() } = opciones;
  const mes = fecha.slice(0, 7);
  const resumen = [];
  const registros = [];

  const runbook = await leerRunbook(db);
  // Chequeo antes del post (solo en la ejecución de las 06:00, para no repetir avisos en cada reintento).
  if (chequeo && tareaActiva(runbook, 'chequeo-diario')) {
    for (const proyecto of proyectos.filter((p) => p.activo !== false)) {
      try {
        const c = await chequeoDiario({ env, db, sitio: proyecto.sitio, fecha, fetchImpl });
        await db.insertar('kimiko_updates', { tipo: 'chequeo', project_id: proyecto.id, ok: c.ok, detalle: { fecha, fallos: c.fallos, ...c.datos } }).catch(() => {});
        if (!c.ok) await avisar({ token: env.TELEGRAM_BOT_TOKEN, chatId: env.TELEGRAM_CHAT_ID, texto: textoChequeo(c, fecha), fetchImpl });
        resumen.push(c.ok ? '🩺 Chequeo: todo en orden' : `🩺 Chequeo: ${c.fallos.length} aviso(s), enviados aparte`);
      } catch (e) { resumen.push(`❌ chequeo: ${e.message}`); }
    }
  }

  if (!tareaActiva(runbook, 'post-diario')) resumen.push('⏸ post-diario está en pausa en kimiko_runbook');
  for (const proyecto of proyectos.filter((p) => p.activo !== false && tareaActiva(runbook, 'post-diario'))) {
    const reg = { tipo: 'blog', project_id: proyecto.id, ok: false, detalle: { fecha, slot, origen, neuronas: 0 }, respuesta_bruta: null };
    const inicio = Date.now();
    try {
      resumen.push(`✅ ${await blogDelProyecto({ env, ai, db, proyecto, fecha, slot, forzarError, forzarFicha, fetchImpl, reg, t0 })}`);
      reg.ok = true;
    } catch (e) {
      reg.detalle.error = e.message;
      reg.respuesta_bruta = e.bruto || reg.respuesta_bruta || String(e.stack || e.message).slice(0, 4000);
      const tg = await avisar({ token: env.TELEGRAM_BOT_TOKEN, chatId: env.TELEGRAM_CHAT_ID, texto: `❌ Kimiko ${fecha} · ${proyecto.id}\n${e.message}${siFalla(runbook, 'post-diario') ? `\nManual: ${siFalla(runbook, 'post-diario')}` : ''}`, fetchImpl });
      reg.detalle.telegram_error = tg.ok ? 'enviado' : tg.error;
      resumen.push(`❌ ${proyecto.id}: ${e.message}`);
    } finally {
      reg.detalle.ms = Date.now() - inicio;
      registros.push(reg);
      // Siempre queda escrito, también si Telegram falló. Si Supabase falla, al menos va en el resumen.
      try { reg.detalle.update_id = (await db.insertar('kimiko_updates', reg))?.update_id; } catch (e) { resumen.push(`❌ no pude escribir kimiko_updates: ${e.message}`); }
      try { await db.insertar('kimiko_spend', { mes, concepto: `${proyecto.id} blog ${fecha} #${slot}`, usd: 0, ok: reg.ok, error: reg.detalle.error || null, respuesta_bruta: reg.ok ? null : reg.respuesta_bruta }); } catch (e) { resumen.push(`❌ no pude escribir kimiko_spend: ${e.message}`); }
    }

    if (!forzarError) {
      try {
        const seg = await vigilarSitio(proyecto.sitio, { fetchImpl });
        await db.insertar('kimiko_security_checks', { project_id: proyecto.id, sitio: proyecto.sitio, ok: seg.ok, hallazgos: seg.hallazgos });
        if (!seg.ok) resumen.push(`⚠️ ${proyecto.id}: seguridad, ${seg.hallazgos.filter((h) => h.nivel === 'alto').map((h) => h.msg).join('; ')}`);
      } catch (e) { resumen.push(`❌ ${proyecto.id}: vigilancia de seguridad (${e.message})`); }
    }
  }

  try { const g = estadoGasto(await db.gastoMes(mes)); if (g.nivel === 'ok') resumen.push(g.texto); else resumen.unshift(g.texto); } catch (e) { resumen.unshift(`❌ gasto: no pude calcularlo (${e.message})`); }
  try {
    const fichas = await db.seleccionar('kimiko_vault', 'select=project_id,etiqueta,ultimos4,actualizado_at,rota_cada_dias,caduca_at');
    for (const a of avisosCaducidad(fichas, new Date(`${fecha}T12:00:00Z`))) resumen.push(a.texto);
  } catch (e) { resumen.push(`❌ bóveda: no pude revisar caducidades (${e.message})`); }

  const texto = `Kimiko ${fecha}${origen === 'cron' ? '' : ` (${origen})`}\n${resumen.join('\n') || 'Nada que hacer'}`;
  const tg = await avisar({ token: env.TELEGRAM_BOT_TOKEN, chatId: env.TELEGRAM_CHAT_ID, texto, fetchImpl });
  if (!tg.ok) {
    // El resumen no llegó: se apunta en las filas de esta ejecución.
    for (const r of registros) if (r.detalle.update_id) await db.actualizar('kimiko_updates', `update_id=eq.${r.detalle.update_id}`, { detalle: { ...r.detalle, telegram_resumen: tg.error } }).catch(() => {});
  }
  return { resumen, texto, registros: registros.map((r) => ({ ok: r.ok, ...r.detalle })), telegram_resumen: tg.ok ? 'enviado' : tg.error };
}
