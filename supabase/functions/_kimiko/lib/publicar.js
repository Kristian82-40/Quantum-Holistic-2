// «✅ Publicar» y «🗑 Retirar» desde Telegram (9-oct-2026). Lo usa el worker; nada se publica sin el botón de Kristian.
// Autoridad de Kimiko aquí: solo el campo de publicación (blog_posts.published/status, plants.publicada/ficha_verificada)
// y comprobar la URL pública. Nunca borra, nunca toca main, nunca crea llaves.
// La web lee Supabase al vuelo (blog y diccionario con cache: 'no-store'), así que no hace falta revalidar ni redeploy.
import { revisarArticulo, revisarClaims, esDosis } from './legal.js';

export const DOMINIO = 'https://quantum-holistic.com';
// Mismas 9 que lib/plantas-peligrosas.ts (la web) y qh-editorial. Límite inamovible.
export const PLANTAS_PELIGROSAS = ['aconito', 'datura', 'datura-metel', 'amanita-muscaria', 'cannabis', 'cornezuelo-centeno', 'beleno-negro', 'tejo', 'hierba-mora'];
const NOMBRES_PELIGROSOS = /\b(ac[óo]nito|datura|amanita|cannabis|marihuana|cornezuelo|bele[ñn]o|tejo|hierba[\s-]mora)\b/iu;
const AVISO_PROFESIONAL = /consulta\w*\s+(con\s+)?(a\s+)?(tu|un|una|el|la)\s+(m[ée]dic|profesional|farmac[ée]utic)/iu;

export const urlPost = (slug) => `${DOMINIO}/blog/${slug}/`;
export const urlFicha = (slug) => `${DOMINIO}/diccionario/${slug}/`;
const sinTitulo = (t = '') => t.replace(/\s*\|\s*Quantum Holistic\s*$/i, '').trim();

export function peligrosa({ slug = '', titulo = '' }) {
  if (PLANTAS_PELIGROSAS.some((p) => slug === p || slug.includes(p))) return true;
  return NOMBRES_PELIGROSOS.test(titulo);
}

// blog_posts.content se guarda en HTML (markdownAHtml): se pasa a texto con los encabezados como "## " para revisarlo.
export const aTexto = (html = '') => html
  .replace(/<h([23])[^>]*>/gi, (_, n) => `\n${'#'.repeat(Number(n))} `)
  .replace(/<\/(h[1-6]|p|li|ul|ol|div|blockquote)>|<br\s*\/?>/gi, '\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, '&');

// Controles de qh-editorial para un post. Devuelve la lista de motivos (vacía = se puede publicar).
export function revisarPost(post, { slugRepetido = false } = {}) {
  if (peligrosa({ slug: post.slug, titulo: post.title })) return ['Trata de una de las 9 plantas peligrosas: nunca se publica'];
  const contenido = aTexto(post.content || '');
  const { problemas } = revisarArticulo({ titulo: post.title, extracto: post.excerpt, contenido });
  const motivos = problemas.map((p) => (p.frase ? `${p.motivo}: «${p.frase.slice(0, 80)}»` : p.motivo));
  if (!AVISO_PROFESIONAL.test(contenido)) motivos.push('Falta el aviso «consulta con un profesional»');
  if (!post.slug) motivos.push('No tiene slug');
  if (slugRepetido) motivos.push(`El slug «${post.slug}» ya lo usa otro post`);
  return motivos;
}

// Controles para una ficha de plants. El aviso «consulta con un profesional» lo pinta siempre la página de la ficha.
export function revisarFicha(planta, { slugRepetido = false } = {}) {
  if (peligrosa({ slug: planta.slug, titulo: planta.nombre_es })) return ['Es una de las 9 plantas peligrosas: nunca se publica'];
  const fc = planta.ficha_cientifica || {};
  const motivos = [];
  const textos = [fc.posologia, fc.evidencia, ...(fc.propiedades || []), ...(fc.indicaciones || [])].filter((x) => typeof x === 'string');
  for (const t of textos) {
    for (const p of revisarClaims(t).problemas) motivos.push(`${p.motivo}: «${p.frase.slice(0, 80)}»`);
    for (const frase of t.split(/[.!?\n;]+/).map((f) => f.trim()).filter(Boolean)) if (esDosis(frase)) motivos.push(`Indica una dosis concreta: «${frase.slice(0, 80)}»`);
  }
  if (!Array.isArray(fc.contraindicaciones) || fc.contraindicaciones.length === 0) motivos.push('Faltan las contraindicaciones (ficha_cientifica.contraindicaciones)');
  if (!planta.slug) motivos.push('No tiene slug');
  if (slugRepetido) motivos.push(`El slug «${planta.slug}» ya lo usa otra planta`);
  return motivos;
}

// Lee el HTML por trozos y para en cuanto aparece el título (CPU mínima: el worker Free da 10 ms).
async function contiene(r, buscado, max = 300_000) {
  if (!r.body?.getReader) return normalizar(await r.text()).includes(buscado);
  const lector = r.body.getReader(); const dec = new TextDecoder();
  let cola = ''; let leidos = 0;
  for (;;) {
    const { done, value } = await lector.read();
    if (done) return false;
    leidos += value.length;
    // Solo se mira el trozo nuevo más una cola del anterior (por si el título queda partido entre dos trozos).
    const ventana = cola + dec.decode(value, { stream: true });
    if (normalizar(ventana).includes(buscado)) { lector.cancel().catch(() => {}); return true; }
    cola = ventana.slice(-buscado.length * 6);
    if (leidos > max) { lector.cancel().catch(() => {}); return false; }
  }
}
const normalizar = (html) => html.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").toLowerCase();

// Prueba de publicado: la URL pública da 200 y contiene el título. Reintenta unas veces por si la web tarda.
export async function comprobarURL(url, titulo, { fetchImpl = fetch, intentos = 3, espera = 4000 } = {}) {
  const buscado = sinTitulo(titulo).toLowerCase();
  let ultimo = '';
  for (let i = 0; i < intentos; i++) {
    if (i) await new Promise((r) => setTimeout(r, espera));
    try {
      const r = await fetchImpl(url, { redirect: 'follow', headers: { 'cache-control': 'no-cache' }, signal: AbortSignal.timeout(15000) });
      const encontrado = r.status === 200 && (await contiene(r, buscado));
      if (encontrado) return { ok: true, status: 200 };
      ultimo = r.status === 200 ? 'la página no contiene el título' : `HTTP ${r.status}`;
    } catch (e) { ultimo = e.message; }
  }
  return { ok: false, motivo: ultimo };
}

// Tras retirar, la URL ya no debe servir la pieza (404).
export async function comprobarRetirada(url, { fetchImpl = fetch } = {}) {
  try {
    const r = await fetchImpl(url, { redirect: 'follow', headers: { 'cache-control': 'no-cache' }, signal: AbortSignal.timeout(15000) });
    return r.status === 404 ? { ok: true } : { ok: false, motivo: `la URL aún responde ${r.status}` };
  } catch (e) { return { ok: false, motivo: e.message }; }
}

const ahora = () => new Date().toISOString();
const registrar = (db, tipo, ok, detalle) => db.insertar('kimiko_updates', { tipo, project_id: 'qh', ok, detalle }).catch(() => null);

// Cada pieza sabe leerse, publicarse y retirarse. tipo: 'post' (blog_posts, uuid) o 'ficha' (plants, id numérico).
const PIEZAS = {
  post: {
    leer: async (db, id) => (await db.seleccionar('blog_posts', `id=eq.${id}&select=id,slug,title,excerpt,content,status,published&limit=1`))[0],
    repetido: async (db, p) => (await db.seleccionar('blog_posts', `slug=eq.${encodeURIComponent(p.slug)}&id=neq.${p.id}&select=id&limit=1`)).length > 0,
    revisar: revisarPost,
    titulo: (p) => p.title,
    url: (p) => urlPost(p.slug),
    publicar: (db, id) => db.actualizar('blog_posts', `id=eq.${id}`, { published: true, status: 'published', updated_at: ahora() }),
    retirar: (db, id) => db.actualizar('blog_posts', `id=eq.${id}`, { published: false, status: 'draft', updated_at: ahora() }),
    publicada: (p) => p.published === true && p.status === 'published',
  },
  ficha: {
    leer: async (db, id) => (await db.seleccionar('plants', `id=eq.${id}&select=id,slug,nombre_es,ficha_cientifica,publicada,ficha_verificada&limit=1`))[0],
    repetido: async (db, p) => (await db.seleccionar('plants', `slug=eq.${encodeURIComponent(p.slug)}&id=neq.${p.id}&select=id&limit=1`)).length > 0,
    revisar: revisarFicha,
    titulo: (p) => p.nombre_es,
    url: (p) => urlFicha(p.slug),
    // La web muestra la planta con publicada y su ficha científica solo con ficha_verificada: publicar = las dos.
    publicar: (db, id) => db.actualizar('plants', `id=eq.${id}`, { publicada: true, ficha_verificada: true, updated_at: ahora() }),
    // Retirar solo apaga publicada (la verificación de Kristian se conserva).
    retirar: (db, id) => db.actualizar('plants', `id=eq.${id}`, { publicada: false, updated_at: ahora() }),
    publicada: (p) => p.publicada === true,
  },
};

// Publica una pieza tras pasar los controles y comprueba la URL. Si la URL falla, la deja en borrador.
// Devuelve { ok, url, titulo, motivos?, accion? } para que el worker responda en Telegram.
export async function publicarPieza({ db, tipo, id, fetchImpl = fetch, espera }) {
  const P = PIEZAS[tipo];
  const pieza = await P.leer(db, id);
  if (!pieza) return { ok: false, motivos: ['No encuentro la pieza'] };
  const base = { tipo, id: String(id), slug: pieza.slug, titulo: P.titulo(pieza) };
  const motivos = P.revisar(pieza, { slugRepetido: pieza.slug ? await P.repetido(db, pieza) : false });
  if (motivos.length) {
    await registrar(db, 'publicacion', false, { ...base, resultado: 'bloqueada', motivos });
    return { ok: false, ...base, motivos, accion: 'Corrígela (✏️ Corregir o en /admin) y vuelve a pulsar ✅ Publicar' };
  }
  await P.publicar(db, id);
  const url = P.url(pieza);
  const prueba = await comprobarURL(url, P.titulo(pieza), { fetchImpl, ...(espera !== undefined ? { espera } : {}) });
  if (!prueba.ok) {
    await P.retirar(db, id);
    const accion = `La web no la muestra (${prueba.motivo}). Queda en borrador. Mira el último despliegue en vercel.com (proyecto quantum-holistic-2) y vuelve a pulsar ✅ Publicar`;
    await registrar(db, 'publicacion', false, { ...base, url, resultado: 'fallo-url', error: prueba.motivo });
    return { ok: false, ...base, url, motivos: [`La URL pública no pasó la prueba: ${prueba.motivo}`], accion };
  }
  await registrar(db, 'publicacion', true, { ...base, url, resultado: 'publicada' });
  return { ok: true, ...base, url };
}

export async function retirarPieza({ db, tipo, id, fetchImpl = fetch }) {
  const P = PIEZAS[tipo];
  const pieza = await P.leer(db, id);
  if (!pieza) return { ok: false, motivos: ['No encuentro la pieza'] };
  const base = { tipo, id: String(id), slug: pieza.slug, titulo: P.titulo(pieza) };
  await P.retirar(db, id);
  const url = P.url(pieza);
  const prueba = await comprobarRetirada(url, { fetchImpl });
  await registrar(db, 'retirada', prueba.ok, { ...base, url, resultado: prueba.ok ? 'retirada' : 'retirada-sin-confirmar', ...(prueba.ok ? {} : { error: prueba.motivo }) });
  return { ok: prueba.ok, ...base, url, ...(prueba.ok ? {} : { motivos: [prueba.motivo], accion: `En Supabase ya está en borrador, pero ${prueba.motivo}. Vuelve a abrir el enlace en un minuto` }) };
}

export const estaPublicada = (tipo, pieza) => PIEZAS[tipo].publicada(pieza);
export const leerPieza = (db, tipo, id) => PIEZAS[tipo].leer(db, id);
