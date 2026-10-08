// Pruebas en seco: sin red, sin llaves, sin gastar nada. Todas deben salir en verde.
import assert from 'node:assert/strict';
import { revisarClaims, conAviso, AVISO_FIJO, revisarArticulo, AVISO_BLOG } from './lib/legal.js';
import { estadoGasto } from './lib/budget.js';
import { sellar, abrir, vencimientos, avisosCaducidad } from './lib/vault.js';
import { evaluarCabeceras, vigilarSitio } from './lib/security.js';
import { crearArticulo, markdownAHtml, slugificar, esDuplicada, elegirPilar, CATEGORIAS, validarRespuesta } from './lib/blog.js';
import { imagenDelPost } from './lib/imagen.js';
import { ejecutarDia } from './src/runner.js';
import { atenderTelegram } from './src/webhook.js';
import { secretoWebhook } from './lib/telegram.js';
import { crearDb } from './lib/db.js';
import { generarJSONGemini } from './lib/gemini.js';
import { pedirTexto, ESQUEMA } from './lib/blog.js';
import { articuloSinIA, elegirPlanta } from './lib/sin-ia.js';
import { chequeoDiario, textoChequeo } from './lib/chequeo.js';
import { auditar, textoAuditoria } from './lib/auditoria.js';
import { tareaActiva, textoManual } from './lib/runbook.js';
import config from './config/projects.json' with { type: 'json' };

let n = 0;
const prueba = async (nombre, fn) => { await fn(); n++; console.log(`✓ ${nombre}`); };
const proyecto = config.proyectos[0];

const cuerpo = (extra = '') => `Introducción sobre la manzanilla y su uso tradicional en infusión. ${'Texto divulgativo de tradición herbolaria. '.repeat(60)}\n\n## Historia\nSe usa desde antiguo.\n\n## Precauciones y contraindicaciones\n- Evitar en embarazo sin consejo profesional.\nConsulta con un profesional sanitario. ${extra}`;
const articulo = (o = {}) => ({
  titulo: 'Manzanilla: una flor de tradición', extracto: 'La manzanilla en la tradición europea.', contenido_markdown: cuerpo(), categoria: 'Herbología',
  etiquetas: ['Manzanilla', 'infusiones'], planta: 'Manzanilla', nombre_botanico: 'Matricaria chamomilla', prompt_imagen_en: 'chamomile flowers in a glass cup',
  social_titular: 'Manzanilla de tradición', social_copy: 'Una flor sencilla con mucha historia.', social_hashtags: ['herbolaria', '#manzanilla'], texto_alternativo: 'Flores de manzanilla', ...o,
});
const gemini = (obj) => ({ ok: true, status: 200, text: async () => JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(obj) }] } }] }) });
const geminiCaido = { ok: false, status: 429, text: async () => '{"error":{"message":"quota GenerateRequestsPerDayPerProjectPerModel"}}' };
const gemini503 = { ok: false, status: 503, text: async () => '{"error":{"code":503,"message":"This model is currently experiencing high demand"}}' };
const CF = { CF_ACCOUNT_ID: 'a', CF_AI_TOKEN: 'b' };
const aiFalso = ({ texto = [], imagenFalla = false } = {}) => ({
  llamadas: [],
  async run(modelo, entrada) {
    this.llamadas.push(modelo);
    if (modelo.includes('flux')) { if (imagenFalla) throw new Error('3036 daily free allocation'); return { image: 'aGVsbG8=' }; }
    const r = texto.shift(); if (r instanceof Error) throw r; return { response: r, usage: { prompt_tokens: 1000, completion_tokens: 1500 } };
  },
});
const cab = new Headers({ 'strict-transport-security': 'x', 'content-security-policy': "frame-ancestors 'none'", 'x-content-type-options': 'nosniff', 'referrer-policy': 'x', 'permissions-policy': 'x' });
const red = (respuestasGemini = [], telegram = []) => async (url, o = {}) => {
  const u = String(url);
  if (u.includes('generativelanguage')) return respuestasGemini.shift();
  if (u.includes('api.telegram.org')) { telegram.push({ metodo: u.split('/').pop(), cuerpo: JSON.parse(o.body) }); return { ok: true, json: async () => ({ ok: true, result: {} }) }; }
  if (u.startsWith('http://')) return { status: 301, headers: new Headers({ location: 'https://quantum-holistic.com' }) };
  return { ok: true, url: u, headers: cab };
};
function dbFalsa({ existente = false, fichaFalla = false } = {}) {
  const t = { blog_posts: [], kimiko_content: [], kimiko_updates: [], kimiko_spend: [], kimiko_security_checks: [], subidas: [], fichas: [], cambios: [] };
  let id = 0;
  return {
    t,
    gastoMes: async () => ({ usd: 0, ejecuciones: 1, fallidas: 0 }),
    seleccionar: async (tabla, q) => (tabla === 'kimiko_content' && q.includes('fecha=eq') && existente ? [{ id: 'x' }] : tabla === 'kimiko_learnings' ? [{ regla: 'Nunca uses la palabra milagro' }] : []),
    insertar: async (tabla, f) => { const fila = { id: `id-${++id}`, update_id: -id, ...f }; t[tabla].push(fila); return fila; },
    actualizar: async (tabla, filtro, c) => { t.cambios.push({ tabla, filtro, c }); },
    subir: async (b, ruta) => { t.subidas.push(`${b}/${ruta}`); return ruta; },
    fichaPNG: async (svg, ruta) => { if (fichaFalla) throw new Error('kimiko-ficha 500'); t.fichas.push({ svg, ruta }); return ruta; },
    urlPublica: (b, r) => `https://x.supabase.co/storage/v1/object/public/${b}/${r}`,
  };
}

await prueba('legal: bloquea promesas de curación', () => {
  assert.equal(revisarClaims('El jengibre cura la diabetes.').ok, false);
  assert.equal(revisarClaims('Garantizado: elimina el colesterol.').ok, false);
  assert.equal(revisarClaims('Esta infusión sustituye a tu médico.').ok, false);
});

await prueba('legal: deja pasar lenguaje informativo y añade el aviso una sola vez', () => {
  assert.equal(revisarClaims('Tradicionalmente se usa en infusión con limón.').ok, true);
  assert.equal(revisarClaims('Recuerda: esto no sustituye al médico.').ok, true);
  const una = conAviso('Hola'); assert.ok(una.includes(AVISO_FIJO)); assert.equal(conAviso(una), una);
});

await prueba('bóveda: cifra, descifra, y falla con frase o ranura equivocada', async () => {
  const sobre = await sellar('frase maestra de prueba', 'sk-ant-secreta', 'qh/anthropic/principal');
  assert.ok(!JSON.stringify(sobre).includes('sk-ant-secreta'));
  assert.equal(await abrir('frase maestra de prueba', sobre, 'qh/anthropic/principal'), 'sk-ant-secreta');
  await assert.rejects(() => abrir('otra frase', sobre, 'qh/anthropic/principal'));
  await assert.rejects(() => abrir('frase maestra de prueba', sobre, 'qh/gemini/principal'));
});

await prueba('bóveda: avisa de llaves que toca rotar', () => {
  const hoy = new Date('2026-10-05');
  const v = vencimientos([
    { project_id: 'qh', servicio: 'gemini', etiqueta: 'a', actualizado_at: '2026-06-01', rota_cada_dias: 90 },
    { project_id: 'qh', servicio: 'anthropic', etiqueta: 'b', actualizado_at: '2026-10-01', rota_cada_dias: 90 },
  ], hoy);
  assert.equal(v.length, 1); assert.equal(v[0].servicio, 'gemini');
});

await prueba('seguridad: detecta cabeceras ausentes y fuga de tecnología', () => {
  const h = evaluarCabeceras({ 'x-powered-by': 'Express' });
  assert.ok(h.some((x) => x.nivel === 'alto' && /HSTS/.test(x.msg)));
  assert.ok(h.some((x) => /clickjacking/.test(x.msg)));
  assert.ok(h.some((x) => /X-Powered-By/.test(x.msg)));
});

await prueba('seguridad: sitio caído y sitio sano', async () => {
  const caido = await vigilarSitio('https://x.test', { fetchImpl: async () => { throw new Error('ECONNREFUSED'); } });
  assert.equal(caido.ok, false);
  const cab = new Headers({ 'strict-transport-security': 'max-age=1', 'content-security-policy': "frame-ancestors 'none'", 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer', 'permissions-policy': 'camera=()' });
  const sano = await vigilarSitio('https://x.test', { fetchImpl: async (u, o) => (o.redirect === 'manual' ? { status: 301, headers: new Headers({ location: 'https://x.test' }) } : { ok: true, url: 'https://x.test', headers: cab }) });
  assert.equal(sano.ok, true); assert.equal(sano.hallazgos.length, 0);
});

await prueba('bóveda: avisa de caducidades con antelación y sin mostrar más de 4 caracteres', () => {
  const hoy = new Date('2026-10-05T12:00:00Z');
  const a = avisosCaducidad([
    { project_id: 'qh', etiqueta: 'ANTHROPIC_API_KEY', ultimos4: 'wxyz', caduca_at: '2026-10-12T12:00:00Z' },
    { project_id: 'qh', etiqueta: 'GEMINI_API_KEY', ultimos4: 'abcd', caduca_at: '2027-01-01T00:00:00Z' },
    { project_id: 'qh', etiqueta: 'TELEGRAM_BOT_TOKEN', actualizado_at: '2026-06-01T00:00:00Z', rota_cada_dias: 90 },
  ], hoy);
  assert.equal(a.length, 2);
  assert.match(a[0].texto, /ANTHROPIC_API_KEY \(…wxyz\): caduca en 7 día/);
  assert.match(a[1].texto, /TELEGRAM_BOT_TOKEN: CADUCADA/);
});

await prueba('legal (blog): detecta dosis y exige la sección de precauciones', () => {
  assert.equal(revisarArticulo({ contenido: cuerpo() }).ok, true);
  assert.ok(revisarArticulo({ contenido: cuerpo('Toma 500 mg al día.') }).problemas.some((p) => /dosis/.test(p.motivo)));
  assert.ok(revisarArticulo({ contenido: cuerpo('Añade 2 cucharaditas a la taza.') }).problemas.some((p) => /dosis/.test(p.motivo)));
  assert.ok(revisarArticulo({ contenido: 'Texto sin sección.' }).problemas.some((p) => /Precauciones/.test(p.motivo)));
  assert.equal(revisarArticulo({ contenido: `${cuerpo()} Cura la diabetes.` }).ok, false);
});
await prueba('blog: markdown → HTML escapado en una sola línea, slug limpio, categorías fijas', () => {
  const h = markdownAHtml('## Título\nUn **texto** <script>x</script>\n\n- uno\n- dos');
  assert.equal(h, '<h2>Título</h2><p>Un <strong>texto</strong> &lt;script&gt;x&lt;/script&gt;</p><ul><li>uno</li><li>dos</li></ul>');
  assert.ok(!h.includes('\n'));
  assert.equal(slugificar('Manzanilla: ¡Flor de Tradición!'), 'manzanilla-flor-de-tradicion');
  assert.deepEqual(CATEGORIAS, ['Herbología', 'Nutrición', 'Ayurveda', 'Bienestar Holístico', 'Sabiduría']);
  assert.match(validarRespuesta({ ...articulo(), contenido_markdown: 'corto' }), /corto/);
});
await prueba('anti-duplicados y rotación de pilares', () => {
  assert.equal(esDuplicada('Manzanilla: infusión de tradición', ['Manzanilla: una infusión de tradición']), true);
  assert.equal(esDuplicada('Respiración consciente al amanecer', ['Manzanilla: una infusión de tradición']), false);
  assert.notEqual(elegirPilar(proyecto, '2026-10-05'), elegirPilar(proyecto, '2026-10-06'));
});
await prueba('texto: Gemini primero; con Gemini sin cuota usa Workers AI', async () => {
  const ai = aiFalso({ texto: [articulo({ titulo: 'Desde Workers AI' })] });
  const a = await crearArticulo({ env: { GEMINI_API_KEY: 'k', ...CF }, ai, proyecto, fecha: '2026-10-06', fetchImpl: red([geminiCaido]) });
  assert.equal(a.titulo, 'Desde Workers AI'); assert.match(a.modelo, /llama/); assert.match(a.errores[0].error, /429/);
  const b = await crearArticulo({ env: { GEMINI_API_KEY: 'k' }, ai: aiFalso(), proyecto, fecha: '2026-10-06', fetchImpl: red([gemini(articulo())]) });
  assert.equal(b.modelo, 'gemini-3.8-flash'); assert.ok(b.contenidoHtml.includes(AVISO_BLOG)); assert.equal(b.categoria, 'Herbología');
  assert.ok(b.social.copy.includes(AVISO_FIJO)); assert.deepEqual(b.social.hashtags, ['#herbolaria', '#manzanilla']);
});
await prueba('texto: corrige una dosis en el segundo intento', async () => {
  const a = await crearArticulo({ env: { GEMINI_API_KEY: 'k' }, ai: aiFalso(), proyecto, fecha: '2026-10-06', fetchImpl: red([gemini(articulo({ contenido_markdown: cuerpo('Toma 500 mg al día.') })), gemini(articulo())]) });
  assert.equal(a.problemas.length, 0);
});
await prueba('imagen: flux al bucket kimiko; si falla, ficha PNG; si también falla, error (nunca post sin imagen)', async () => {
  const db = dbFalsa();
  const a = await imagenDelPost({ ai: aiFalso(), db, prompt: 'p', ruta: 'blog/qh/x', ficha: { titulo: 'Manzanilla' } });
  assert.equal(a.origen, 'flux'); assert.equal(db.t.subidas[0], 'kimiko/blog/qh/x.jpg'); assert.match(a.url, /public\/kimiko\/blog\/qh\/x\.jpg$/);
  const b = await imagenDelPost({ ai: aiFalso({ imagenFalla: true }), db, prompt: 'p', ruta: 'blog/qh/y', ficha: { titulo: 'Manzanilla', subtitulo: 'Matricaria' } });
  assert.equal(b.origen, 'ficha'); assert.equal(db.t.fichas[0].ruta, 'blog/qh/y.png'); assert.ok(db.t.fichas[0].svg.includes('#F4EDE0'));
  await assert.rejects(() => imagenDelPost({ ai: aiFalso({ imagenFalla: true }), db: dbFalsa({ fichaFalla: true }), prompt: 'p', ruta: 'r', ficha: { titulo: 't' } }), /kimiko-ficha/);
});
await prueba('ejecutor: borrador con imagen (published=false y status=draft), pieza, registro y Telegram con botones', async () => {
  const db = dbFalsa(); const tg = [];
  const r = await ejecutarDia({ env: { GEMINI_API_KEY: 'k', TELEGRAM_BOT_TOKEN: 't', TELEGRAM_CHAT_ID: '1' }, ai: aiFalso(), proyectos: [proyecto], fecha: '2026-10-06', db, fetchImpl: red([gemini(articulo())], tg), opciones: { chequeo: false } });
  const post = db.t.blog_posts[0];
  assert.equal(post.published, false); assert.equal(post.status, 'draft'); assert.match(post.image_url, /^https:\/\/.*\/public\/kimiko\/blog\/qh\/2026-10-06-manzanilla/);
  assert.equal(post.slug, '2026-10-06-manzanilla-una-flor-de-tradicion'); assert.equal(post.category, 'Herbología');
  assert.equal(db.t.kimiko_content[0].blog_post_id, post.id); assert.equal(db.t.kimiko_content[0].estado, 'listo');
  assert.equal(db.t.kimiko_updates.length, 1); assert.equal(db.t.kimiko_updates[0].ok, true); assert.equal(db.t.kimiko_updates[0].tipo, 'blog');
  assert.equal(db.t.kimiko_spend[0].usd, 0); assert.equal(db.t.kimiko_spend[0].ok, true);
  const foto = tg.find((x) => x.metodo === 'sendPhoto');
  assert.deepEqual(foto.cuerpo.reply_markup.inline_keyboard[0].map((b) => b.callback_data.slice(0, 4)), ['pub:', 'cor:', 'des:']);
  assert.ok(r.resumen[0].startsWith('✅ qh: borrador'));
});
await prueba('ejecutor: no repite si ya hay pieza ese día', async () => {
  const db = dbFalsa({ existente: true });
  const r = await ejecutarDia({ env: {}, ai: aiFalso(), proyectos: [proyecto], fecha: '2026-10-06', db, fetchImpl: red(), opciones: { chequeo: false } });
  assert.equal(db.t.blog_posts.length, 0); assert.ok(r.resumen.some((l) => l.includes('ya hecho hoy')));
});
await prueba('ejecutor: un error manda ❌ a Telegram y queda en kimiko_updates y kimiko_spend', async () => {
  const db = dbFalsa(); const tg = [];
  const r = await ejecutarDia({ env: { TELEGRAM_BOT_TOKEN: 't', TELEGRAM_CHAT_ID: '1' }, ai: aiFalso(), proyectos: [proyecto], fecha: '2026-10-06', db, fetchImpl: red([], tg), opciones: { forzarError: true, chequeo: false } });
  assert.ok(tg.some((x) => x.cuerpo.text?.startsWith('❌ Kimiko 2026-10-06 · qh')));
  assert.equal(db.t.kimiko_updates[0].ok, false); assert.match(db.t.kimiko_updates[0].detalle.error, /a propósito/);
  assert.equal(db.t.kimiko_updates[0].detalle.telegram_error, 'enviado');
  assert.equal(db.t.kimiko_spend[0].ok, false); assert.equal(db.t.blog_posts.length, 0);
  assert.ok(r.resumen.some((l) => l.startsWith('❌ qh')));
});
await prueba('ejecutor: si fallan Gemini, Workers AI y Telegram, el fallo queda escrito igualmente', async () => {
  const db = dbFalsa();
  const caidoTg = async (url) => { if (String(url).includes('generativelanguage')) return geminiCaido; if (String(url).includes('telegram')) throw new Error('red caída'); return { ok: true, url, headers: cab, status: 301 }; };
  await ejecutarDia({ env: { GEMINI_API_KEY: 'k', TELEGRAM_BOT_TOKEN: 't', TELEGRAM_CHAT_ID: '1', ...CF }, ai: aiFalso({ texto: [new Error('3036'), new Error('3036')] }), proyectos: [proyecto], fecha: '2026-10-06', db, fetchImpl: caidoTg, opciones: { chequeo: false } });
  const u = db.t.kimiko_updates[0];
  assert.equal(u.ok, false); assert.match(u.detalle.error, /Sin texto: gemini.*workers-ai/); assert.match(u.detalle.telegram_error, /red caída/);
  assert.ok(u.respuesta_bruta.includes('[gemini]'));
});
await prueba('webhook: rechaza sin secreto, ignora otros chats y "Publicar" pone el post en published', async () => {
  const env = { TELEGRAM_BOT_TOKEN: 'tok', TELEGRAM_CHAT_ID: '42' };
  const secreto = await secretoWebhook('tok');
  const id = '11111111-2222-3333-4444-555555555555';
  const pet = (chat, s = secreto) => new Request('https://k/telegram', { method: 'POST', headers: { 'x-telegram-bot-api-secret-token': s }, body: JSON.stringify({ update_id: 7, callback_query: { id: 'c', data: `pub:${id}`, message: { message_id: 3, chat: { id: chat } } } }) });
  const db = dbFalsa();
  db.insertarSiNuevo = async (t, f) => f;
  db.seleccionar = async () => [{ id, blog_post_id: 'post-1', estado: 'listo' }];
  assert.equal((await atenderTelegram({ request: pet(42, 'malo'), env, db, fetchImpl: red() })).status, 403);
  await atenderTelegram({ request: pet(99), env, db, fetchImpl: red() });
  assert.equal(db.t.cambios.length, 0);
  const tg = [];
  await atenderTelegram({ request: pet(42), env, db, fetchImpl: red([], tg) });
  assert.deepEqual(db.t.cambios.find((c) => c.tabla === 'blog_posts').c.status, 'published');
  assert.equal(db.t.cambios.find((c) => c.tabla === 'kimiko_content').c.estado, 'publicado');
  assert.ok(tg.some((x) => x.metodo === 'answerCallbackQuery'));
});
await prueba('órdenes: un texto de Kristian va a kimiko_drafts y despierta a Kimiko Cloud; otro chat se ignora y queda registrado', async () => {
  const env = { TELEGRAM_BOT_TOKEN: 'tok', TELEGRAM_CHAT_ID: '42', GH_TOKEN: 'gh' };
  const s = await secretoWebhook('tok');
  const pet = (chat, extra = {}) => new Request('https://k/telegram', { method: 'POST', headers: { 'x-telegram-bot-api-secret-token': s }, body: JSON.stringify({ update_id: 9, message: { message_id: 5, chat: { id: chat }, from: { username: 'x' }, text: 'Revisa el SEO de la caléndula', ...extra } }) });
  const llamadas = [];
  const red2 = async (url, o = {}) => { llamadas.push({ url: String(url), cuerpo: o.body ? JSON.parse(o.body) : null, auth: o.headers?.authorization }); return { ok: true, status: 204, json: async () => ({ ok: true, result: {} }), text: async () => '' }; };
  const db = dbFalsa(); const registros = [];
  db.insertarSiNuevo = async (t, f) => { registros.push(f); return f; };
  await atenderTelegram({ request: pet(99), env, db, fetchImpl: red2 });
  assert.equal(registros[0].ok, false); assert.equal(registros[0].detalle.ignorado, 'remitente no autorizado'); assert.equal(registros[0].detalle.chat, '99');
  assert.equal(db.t.kimiko_drafts, undefined); assert.equal(llamadas.length, 0);
  db.t.kimiko_drafts = [];
  await atenderTelegram({ request: pet(42), env, db, fetchImpl: red2 });
  assert.equal(db.t.kimiko_drafts[0].status, 'pendiente'); assert.equal(db.t.kimiko_drafts[0].source_note, 'Revisa el SEO de la caléndula');
  const d = llamadas.find((l) => l.url.endsWith('/dispatches'));
  assert.equal(d.cuerpo.event_type, 'kimiko-orden'); assert.equal(d.cuerpo.client_payload.draft_id, db.t.kimiko_drafts[0].id); assert.equal(d.auth, 'Bearer gh');
  assert.ok(llamadas.some((l) => l.url.endsWith('/sendMessage') && /Recibido/.test(l.cuerpo.text)));
  db.t.kimiko_drafts = [];
  await atenderTelegram({ request: pet(42, { text: 'Hazlo más corto', reply_to_message: { text: '… [post:11111111-2222-3333-4444-555555555555]' } }), env, db, fetchImpl: red2 });
  assert.match(db.t.kimiko_drafts[0].source_note, /^Modifica el post de blog con id 11111111-2222-3333-4444-555555555555/);
});
await prueba('órdenes: "Fusionar PR" fusiona por la API de GitHub y no repite si ya estaba fusionado', async () => {
  const env = { TELEGRAM_BOT_TOKEN: 'tok', TELEGRAM_CHAT_ID: '42', GH_TOKEN: 'gh' };
  const s = await secretoWebhook('tok');
  const id = '11111111-2222-3333-4444-555555555555';
  const pet = (uid) => new Request('https://k/telegram', { method: 'POST', headers: { 'x-telegram-bot-api-secret-token': s }, body: JSON.stringify({ update_id: uid, callback_query: { id: 'c', data: `prm:${id}`, message: { message_id: 3, chat: { id: 42 } } } }) });
  const llamadas = [];
  const red2 = async (url, o = {}) => { llamadas.push({ url: String(url), metodo: o.method }); return { ok: true, status: 200, json: async () => ({ ok: true, result: {} }), text: async () => '' }; };
  const db = dbFalsa(); db.insertarSiNuevo = async (t, f) => f;
  let estado = 'pr_abierto';
  db.seleccionar = async () => [{ pr_numero: 17, status: estado }];
  await atenderTelegram({ request: pet(1), env, db, fetchImpl: red2 });
  assert.ok(llamadas.some((l) => l.url.endsWith('/pulls/17/merge') && l.metodo === 'PUT'));
  assert.equal(db.t.cambios.find((c) => c.tabla === 'kimiko_drafts').c.status, 'fusionado');
  estado = 'fusionado'; llamadas.length = 0;
  await atenderTelegram({ request: pet(2), env, db, fetchImpl: red2 });
  assert.ok(!llamadas.some((l) => l.url.includes('/merge')));
});
await prueba('"Corregir" deja la pieza en revisión y pide la corrección con el id del post', async () => {
  const env = { TELEGRAM_BOT_TOKEN: 'tok', TELEGRAM_CHAT_ID: '42' };
  const s = await secretoWebhook('tok');
  const id = '11111111-2222-3333-4444-555555555555';
  const db = dbFalsa(); db.insertarSiNuevo = async (t, f) => f; db.seleccionar = async () => [{ blog_post_id: 'p-1' }];
  const tg = [];
  await atenderTelegram({ request: new Request('https://k/telegram', { method: 'POST', headers: { 'x-telegram-bot-api-secret-token': s }, body: JSON.stringify({ update_id: 3, callback_query: { id: 'c', data: `cor:${id}`, message: { message_id: 3, chat: { id: 42 } } } }) }), env, db, fetchImpl: red([], tg) });
  assert.equal(db.t.cambios.find((c) => c.tabla === 'kimiko_content').c.estado, 'revision');
  const pide = tg.find((x) => x.metodo === 'sendMessage');
  assert.ok(pide.cuerpo.text.includes('[post:p-1]')); assert.equal(pide.cuerpo.reply_markup.force_reply, true);
});
await prueba('gasto: 0 € es lo normal; cualquier gasto registrado avisa', () => {
  assert.equal(estadoGasto({ usd: 0, ejecuciones: 3 }).nivel, 'ok');
  assert.equal(estadoGasto({ usd: 0.01 }).nivel, 'aviso');
});
await prueba('db: sube a Storage y suma el gasto del mes', async () => {
  const llamadas = [];
  const db = crearDb({ url: 'https://x.supabase.co', serviceKey: 's', fetchImpl: async (u) => { llamadas.push(u); return { ok: true, json: async () => [{ usd: 0.1, ok: true }, { usd: 0.2, ok: false }] }; } });
  assert.equal(await db.subir('kimiko', 'blog/qh/a.jpg', new Uint8Array([1]), 'image/jpeg'), 'blog/qh/a.jpg');
  const g = await db.gastoMes('2026-10'); assert.ok(Math.abs(g.usd - 0.3) < 1e-9); assert.equal(g.fallidas, 1);
  assert.ok(llamadas[0].includes('/storage/v1/object/kimiko/blog/qh/a.jpg'));
});

// ── B2: cadena de IAs gratuitas y modo sin IA ──
await prueba('gemini: reintenta un 503 y sale bien al segundo intento', async () => {
  const resp = [gemini503, gemini(articulo())];
  const r = await generarJSONGemini({ apiKey: 'k', system: 's', user: 'u', schema: ESQUEMA, validar: validarRespuesta, esperas: [0], fetchImpl: async () => resp.shift() });
  assert.equal(r.intentos, 2); assert.equal(r.datos.planta, 'Manzanilla');
});
await prueba('gemini: tres 503 seguidos fallan; la cuota diaria (429 PerDay) no se reintenta', async () => {
  let n = 0;
  await assert.rejects(() => generarJSONGemini({ apiKey: 'k', system: 's', user: 'u', schema: ESQUEMA, esperas: [0], fetchImpl: async () => { n++; return gemini503; } }), /tras 3 intento/);
  assert.equal(n, 3); n = 0;
  await assert.rejects(() => generarJSONGemini({ apiKey: 'k', system: 's', user: 'u', schema: ESQUEMA, esperas: [0], fetchImpl: async () => { n++; return geminiCaido; } }), /429/);
  assert.equal(n, 1);
});
await prueba('gemini: una llamada colgada cuenta como fallo pasajero y no se pasa de la hora límite', async () => {
  const colgado = async () => { const e = new Error('aborted'); e.name = 'TimeoutError'; throw e; };
  await assert.rejects(() => generarJSONGemini({ apiKey: 'k', system: 's', user: 'u', schema: ESQUEMA, esperas: [0], fetchImpl: colgado }), /sin respuesta/);
  await assert.rejects(() => generarJSONGemini({ apiKey: 'k', system: 's', user: 'u', schema: ESQUEMA, fetchImpl: colgado, hasta: Date.now() + 1000 }), /sin tiempo/);
});
await prueba('cadena: Gemini caído y Workers AI sin llaves → escribe Groq', async () => {
  const llamadas = [];
  const red3 = async (url) => {
    llamadas.push(String(url));
    if (String(url).includes('generativelanguage')) return geminiCaido;
    return { ok: true, status: 200, text: async () => JSON.stringify({ choices: [{ message: { content: JSON.stringify(articulo()) } }] }) };
  };
  const r = await pedirTexto({ env: { GEMINI_API_KEY: 'k', GROQ_API_KEY: 'g' }, ai: aiFalso(), system: 's', user: 'u', fetchImpl: red3 });
  assert.equal(r.modelo, 'openai/gpt-oss-120b');
  assert.deepEqual(r.errores.map((e) => e.motor), ['gemini', 'workers-ai']);
  assert.ok(llamadas.some((u) => u.includes('api.groq.com')));
});
const plantas = [
  { slug: 'datura', nombre_es: 'Datura', nombre_latino: 'Datura stramonium', ficha_verificada: true, ficha_cientifica: { contraindicaciones: ['Tóxica'] } },
  { slug: 'albahaca', nombre_es: 'Albahaca', nombre_latino: 'Ocimum basilicum', ficha_verificada: true, ficha_cientifica: { familia_botanica: 'Lamiaceae', parte_usada: 'Hojas', posologia: 'Infusión: 2-3 g en 250 ml', indicaciones: ['Infecciones respiratorias'], propiedades: ['Digestiva'], principios_activos: ['Eugenol'], contraindicaciones: ['Embarazo (dosis altas)', 'Más de 5 g al día'] } },
];
await prueba('sin IA: nunca elige una planta peligrosa y la ficha no lleva dosis ni indicaciones', () => {
  for (const f of ['2026-10-06', '2026-10-07', '2026-10-08']) assert.equal(elegirPlanta(plantas, [], f).slug, 'albahaca');
  assert.equal(elegirPlanta([plantas[0]], [], '2026-10-06'), null);
  const a = articuloSinIA({ planta: plantas[1], proyecto });
  assert.ok(!/\d/.test(a.contenidoHtml.replace(/<[^>]+>/g, ''))); assert.ok(!a.contenidoHtml.includes('Infecciones'));
  assert.ok(revisarArticulo({ titulo: a.titulo, extracto: a.extracto, contenido: '## Precauciones y contraindicaciones\n' + a.contenidoHtml.replace(/<[^>]+>/g, '\n') }).ok);
  assert.ok(a.titulo.length <= 60); assert.ok(a.extracto.length <= 155);
});
await prueba('ejecutor: si fallan los tres motores, sale la ficha sin IA como borrador (el día no queda en blanco)', async () => {
  const db = dbFalsa(); const base = db.seleccionar;
  db.seleccionar = async (tabla, q) => (tabla === 'plants' ? plantas : base(tabla, q));
  const tg = [];
  const r = await ejecutarDia({ env: { GEMINI_API_KEY: 'k', TELEGRAM_BOT_TOKEN: 't', TELEGRAM_CHAT_ID: '1' }, ai: aiFalso(), proyectos: [proyecto], fecha: '2026-10-08', db, fetchImpl: red([geminiCaido], tg), opciones: { chequeo: false } });
  const post = db.t.blog_posts[0];
  assert.equal(post.status, 'draft'); assert.equal(post.published, false); assert.match(post.title, /Albahaca/);
  assert.equal(db.t.kimiko_updates[0].detalle.modo, 'sin-ia'); assert.equal(db.t.kimiko_content[0].estado, 'revision');
  assert.ok(tg.find((x) => x.metodo === 'sendPhoto').cuerpo.caption.includes('plantilla sin IA'));
  assert.ok(r.resumen[0].startsWith('✅'));
});

// ── B3: chequeo diario ──
const redChequeo = ({ web = 200, llave = 200 } = {}) => async (url) => {
  const u = String(url);
  if (u.includes('quantum-holistic.com')) return { status: u.endsWith('/blog') ? web : 200 };
  return { status: llave };
};
const dbChequeo = (crons) => ({ seleccionar: async () => [{ detalle: { neuronas: 300 } }], rpc: async () => crons });
const cronsOk = [{ jobname: 'kimiko-diario', active: true, ultimo_estado: 'succeeded', ultima_ejecucion: '2026-10-08T06:00:00Z' }, { jobname: 'kimiko-reintento', active: true, ultimo_estado: 'succeeded', ultima_ejecucion: '2026-10-08T07:30:00Z' }, { jobname: 'kimiko-auditoria', active: true, ultimo_estado: null, ultima_ejecucion: null }];
const envCompleto = { GEMINI_API_KEY: 'k', GROQ_API_KEY: 'g', TELEGRAM_BOT_TOKEN: 't', TELEGRAM_CHAT_ID: '1', ...CF };
await prueba('chequeo: todo en orden', async () => {
  const c = await chequeoDiario({ env: envCompleto, db: dbChequeo(cronsOk), sitio: 'https://quantum-holistic.com', fecha: '2026-10-08', fetchImpl: redChequeo(), ahora: Date.parse('2026-10-08T08:00:00Z') });
  assert.equal(c.ok, true, JSON.stringify(c.fallos)); assert.match(textoChequeo(c, '2026-10-08'), /todo en orden/);
});
await prueba('chequeo: llaves que faltan, web caída y cron apagado, cada uno con su acción', async () => {
  const crons = [{ ...cronsOk[0], active: false }, cronsOk[1]];
  const c = await chequeoDiario({ env: { GEMINI_API_KEY: 'k', TELEGRAM_BOT_TOKEN: 't', TELEGRAM_CHAT_ID: '1' }, db: dbChequeo(crons), sitio: 'https://quantum-holistic.com', fecha: '2026-10-08', fetchImpl: redChequeo({ web: 500 }), ahora: Date.parse('2026-10-08T08:00:00Z') });
  const que = c.fallos.map((f) => f.que).join(' | ');
  assert.match(que, /CF_ACCOUNT_ID/); assert.match(que, /GROQ_API_KEY/); assert.match(que, /\/blog responde 500/); assert.match(que, /kimiko-diario está desactivado/);
  assert.ok(c.fallos.every((f) => f.accion.length > 10));
});
await prueba('chequeo: llave rechazada y ningún motor vivo avisa del modo sin IA', async () => {
  const c = await chequeoDiario({ env: envCompleto, db: dbChequeo(cronsOk), sitio: 'https://quantum-holistic.com', fecha: '2026-10-08', fetchImpl: redChequeo({ llave: 401 }), ahora: Date.parse('2026-10-08T08:00:00Z') });
  assert.match(c.fallos[0].que, /modo sin IA/); assert.match(c.fallos.map((f) => f.que).join(), /Gemini rechaza/);
});
await prueba('ejecutor: a las 06:00 el chequeo va antes del post y avisa por Telegram si algo falla', async () => {
  const db = dbFalsa(); db.rpc = async () => cronsOk; const tg = [];
  const base = red([gemini(articulo())], tg);
  const conChequeo = async (url, o) => (String(url).includes('/models?') ? { status: 200 } : String(url).startsWith('https://quantum-holistic.com') ? { status: 200 } : base(url, o));
  await ejecutarDia({ env: { GEMINI_API_KEY: 'k', TELEGRAM_BOT_TOKEN: 't', TELEGRAM_CHAT_ID: '1' }, ai: aiFalso(), proyectos: [proyecto], fecha: '2026-10-06', db, fetchImpl: conChequeo });
  assert.equal(db.t.kimiko_updates[0].tipo, 'chequeo'); assert.equal(db.t.kimiko_updates[0].ok, false);
  assert.match(tg[0].cuerpo.text, /🩺 Chequeo 2026-10-06/); assert.equal(tg[1].metodo, 'sendPhoto');
});

// ── B1 y B4: manual de tareas y auditoría ──
await prueba('manual: una tarea en pausa no se ejecuta; si la tabla no responde, todo sigue activo', async () => {
  assert.equal(tareaActiva(null, 'post-diario'), true);
  assert.equal(tareaActiva([{ id: 'post-diario', activa: false }], 'post-diario'), false);
  const db = dbFalsa(); const base = db.seleccionar;
  db.seleccionar = async (t, q) => (t === 'kimiko_runbook' ? [{ id: 'post-diario', activa: false }] : base(t, q));
  const r = await ejecutarDia({ env: {}, ai: aiFalso(), proyectos: [proyecto], fecha: '2026-10-08', db, fetchImpl: red(), opciones: { chequeo: false } });
  assert.equal(db.t.blog_posts.length, 0); assert.ok(r.resumen.some((l) => l.includes('en pausa')));
  assert.match(textoManual([{ nombre: 'Post', cuando: '06:00', comprobacion: 'x', activa: true }]), /🟢 Post — 06:00/);
});
await prueba('auditoría: resume solo lo que falla y dice que no ha cambiado nada', async () => {
  const limpio = { slugs_duplicados: { n: 0 }, categorias_no_normalizadas: { n: 0 }, publicados_sin_imagen: { n: 0 }, publicados_sin_meta: { n: 0 }, plantas_publicadas_sin_verificar: { n: 0 }, tablas_sin_rls: { n: 0 } };
  const a = await auditar({ db: { rpc: async () => limpio } });
  assert.equal(a.ok, true); assert.match(textoAuditoria(a, '2026-10-11'), /todo limpio/);
  const b = await auditar({ db: { rpc: async () => ({ ...limpio, categorias_no_normalizadas: { n: 84, ejemplos: ['sabiduría', 'detox'] } }) } });
  const t = textoAuditoria(b, '2026-10-11');
  assert.equal(b.ok, false); assert.match(t, /categoría fuera de la lista fija: 84/); assert.match(t, /sabiduría, detox/); assert.match(t, /No he cambiado nada/);
  assert.ok(!t.includes('RLS'));
});

console.log(`\n${n} pruebas en verde`);
