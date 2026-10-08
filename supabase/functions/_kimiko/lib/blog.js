// Artículo diario del blog + pieza para redes, en UNA sola llamada de texto.
// Texto: Gemini (capa gratuita), Workers AI y Groq; si fallan los tres, ficha sin IA a partir de `plants`. Siempre se guarda como borrador (published=false, status='draft').
import { generarJSONGemini } from './gemini.js';
import { generarJSON as generarJSONWorkersAI, MODELO_TEXTO } from './ia.js';
import { generarJSONGroq } from './groq.js';
import { revisarArticulo, conAvisoBlog, revisarClaims, conAviso } from './legal.js';

// Lista limpia y fija de categorías nuevas. Las filas antiguas (con variantes) no se tocan en esta fase.
export const CATEGORIAS = ['Herbología', 'Nutrición', 'Ayurveda', 'Bienestar Holístico', 'Sabiduría'];
const UMBRAL_DUPLICADO = 0.6;

const tokens = (t) => new Set((String(t).toLowerCase().match(/\p{L}{3,}/gu) || []));
export function similitud(a, b) {
  const A = tokens(a); const B = tokens(b);
  if (!A.size || !B.size) return 0;
  let comunes = 0;
  for (const x of A) if (B.has(x)) comunes++;
  return comunes / (A.size + B.size - comunes);
}
export const esDuplicada = (titulo, recientes = []) => recientes.some((r) => similitud(titulo, r) >= UMBRAL_DUPLICADO);

const dia = (fecha) => Math.floor(Date.parse(fecha) / 86400000);
export const elegirPilar = (proyecto, fecha, slot = 1) => proyecto.pilares[(dia(fecha) + slot) % proyecto.pilares.length];
const POR_DEFECTO = { lettering: ['letras modernas que se adaptan al motivo'], paletas: ['colores armónicos con el motivo'] };
export function elegirVariacion(proyecto, fecha, slot = 1) {
  const v = proyecto.variaciones || POR_DEFECTO;
  const lettering = v.lettering?.length ? v.lettering : POR_DEFECTO.lettering;
  const paletas = v.paletas?.length ? v.paletas : POR_DEFECTO.paletas;
  return { lettering: lettering[(dia(fecha) + slot - 1) % lettering.length], paleta: paletas[(dia(fecha) + slot - 1) % paletas.length] };
}

export function validarProyecto(p = {}) {
  const faltan = [];
  for (const campo of ['id', 'nombre', 'sitio', 'voz', 'estetica_imagen']) if (!p[campo]) faltan.push(campo);
  if (!Array.isArray(p.pilares) || p.pilares.length === 0) faltan.push('pilares');
  return { ok: faltan.length === 0, faltan };
}

export const slugificar = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70).replace(/-+$/, '');

// La web pinta `content` como HTML (con \n → <br/>). Markdown mínimo → HTML escapado y en una sola línea.
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const enLinea = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
export function markdownAHtml(md = '') {
  const out = []; let lista = null; let parrafo = [];
  const cerrarP = () => { if (parrafo.length) { out.push(`<p>${enLinea(parrafo.join(' '))}</p>`); parrafo = []; } };
  const cerrarL = () => { if (lista) { out.push(`<ul>${lista.map((i) => `<li>${enLinea(i)}</li>`).join('')}</ul>`); lista = null; } };
  for (const bruta of md.split('\n')) {
    const l = bruta.trim();
    const h = l.match(/^(#{1,4})\s+(.*)$/);
    const li = l.match(/^[-*•]\s+(.*)$/);
    if (!l) { cerrarP(); cerrarL(); } else if (h) { cerrarP(); cerrarL(); const n = Math.max(2, h[1].length); out.push(`<h${n}>${enLinea(h[2])}</h${n}>`); } else if (li) { cerrarP(); (lista ||= []).push(li[1]); } else { cerrarL(); parrafo.push(l); }
  }
  cerrarP(); cerrarL();
  return out.join('');
}

export const ESQUEMA = {
  type: 'object',
  properties: {
    titulo: { type: 'string' },
    extracto: { type: 'string' },
    contenido_markdown: { type: 'string' },
    categoria: { type: 'string', enum: CATEGORIAS },
    etiquetas: { type: 'array', items: { type: 'string' } },
    planta: { type: 'string' },
    nombre_botanico: { type: 'string' },
    prompt_imagen_en: { type: 'string' },
    social_titular: { type: 'string' },
    social_copy: { type: 'string' },
    social_hashtags: { type: 'array', items: { type: 'string' } },
    texto_alternativo: { type: 'string' },
  },
  required: ['titulo', 'extracto', 'contenido_markdown', 'categoria', 'etiquetas', 'planta', 'nombre_botanico', 'prompt_imagen_en', 'social_titular', 'social_copy', 'social_hashtags', 'texto_alternativo'],
};

export function validarRespuesta(d) {
  const falta = ESQUEMA.required.filter((k) => d?.[k] === undefined || d[k] === '' || (Array.isArray(d[k]) && !d[k].length));
  if (falta.length) return `faltan ${falta.join(', ')}`;
  if (String(d.contenido_markdown).split(/\s+/).length < 300) return 'contenido demasiado corto (< 300 palabras)';
  return null;
}

export function promptSistema(proyecto, pilar, variacion, aprendizajes, recientes) {
  return [
    `Eres el redactor del blog de "${proyecto.nombre}" (${proyecto.sitio}). Escribes en ${proyecto.idioma || 'es'} de España.`,
    `Voz: ${proyecto.voz}.`,
    `Pilar de hoy: ${pilar}. El artículo gira en torno a UNA planta o ingrediente concreto, con su nombre botánico.`,
    'Reglas innegociables (normativa UE): tono divulgativo y de tradición; nunca prometas curar, tratar, prevenir ni aliviar enfermedades;',
    'no des dosis ni cantidades de toma (ni mg, ni gotas, ni cucharadas al día); nada de afirmaciones absolutas.',
    'El contenido_markdown (700-1000 palabras) usa ## para secciones e incluye OBLIGATORIAMENTE una sección "## Precauciones y contraindicaciones"',
    '(embarazo, lactancia, interacciones con medicación, alergias) que termine recomendando consultar con un profesional sanitario. No pongas el título como # al principio.',
    `categoria: una de ${CATEGORIAS.join(', ')}.`,
    `prompt_imagen_en: en inglés, solo la escena botánica (la planta, sus hojas, flores o raíces, y como mucho un objeto de cocina o herbolario), sin personas ni texto; el sistema añade el estilo.`,
    'social_*: versión corta para Instagram del mismo tema (copy de 80-150 palabras, 8-12 hashtags).',
    aprendizajes.length ? `Reglas del dueño (mandan sobre todo lo demás):\n- ${aprendizajes.join('\n- ')}` : '',
    recientes.length ? `No repitas estos temas recientes:\n- ${recientes.slice(0, 30).join('\n- ')}` : '',
    `Variación visual de hoy: paleta "${variacion.paleta}".`,
    'Responde SOLO con el JSON pedido.',
  ].filter(Boolean).join('\n');
}

export const promptImagen = (proyecto, d, variacion) =>
  `${d.prompt_imagen_en.replace(/\.$/, '')}. Botanical subject: ${d.nombre_botanico}. Style: semi-translucent watercolor illustration with subtle realistic details, modern clean contours, soft paper texture, generous negative space. Color palette: ${variacion.paleta}. No people, no faces, no hands, no text, no letters, no watermark. Botanical still life only.`;

const normalizarHashtags = (hs = []) => [...new Set(hs.map((h) => `#${String(h).replace(/^#+/, '').replace(/\s+/g, '')}`))].slice(0, 15);

// Cadena de motores gratuitos: Gemini (3 intentos) → Workers AI → Groq. Si fallan todos, el error lleva sinTexto=true
// y quien llama pasa al modo sin IA (ficha de planta con plantilla). `hasta` es la hora límite para pedir texto.
export async function pedirTexto({ env, ai, system, user, fetchImpl = fetch, hasta = Infinity }) {
  const errores = [];
  const motores = [
    ['gemini', () => generarJSONGemini({ apiKey: env.GEMINI_API_KEY, system, user, schema: ESQUEMA, validar: validarRespuesta, fetchImpl, hasta })],
    ['workers-ai', async () => {
      if (!env.CF_ACCOUNT_ID || !env.CF_AI_TOKEN) throw new Error('faltan CF_ACCOUNT_ID o CF_AI_TOKEN');
      return { ...(await generarJSONWorkersAI({ ai, system, user, schema: ESQUEMA, validar: validarRespuesta, maxTokens: 3000, reintentos: 1 })), modelo: MODELO_TEXTO };
    }],
    ['groq', () => generarJSONGroq({ apiKey: env.GROQ_API_KEY, system, user, schema: ESQUEMA, validar: validarRespuesta, fetchImpl, hasta })],
  ];
  let neuronas = 0;
  for (const [motor, pedir] of motores) {
    if (hasta - Date.now() < 8000) { errores.push({ motor, error: 'sin tiempo (límite de la función)' }); continue; }
    try {
      const r = await pedir();
      return { ...r, neuronas: neuronas + (r.neuronas || 0), errores };
    } catch (e) {
      neuronas += e.neuronas || 0;
      errores.push({ motor, error: e.message, bruto: e.bruto });
    }
  }
  const err = new Error(`Sin texto: ${errores.map((x) => `${x.motor}: ${x.error.slice(0, 160)}`).join(' | ')}`);
  err.bruto = errores.map((x) => `[${x.motor}] ${x.bruto || x.error}`).join('\n---\n').slice(0, 20000);
  err.neuronas = neuronas;
  err.sinTexto = true;
  err.errores = errores;
  throw err;
}

export async function crearArticulo({ env, ai, proyecto, fecha, slot = 1, recientes = [], aprendizajes = [], fetchImpl = fetch, hasta = Infinity }) {
  const pilar = elegirPilar(proyecto, fecha, slot);
  const variacion = elegirVariacion(proyecto, fecha, slot);
  const system = promptSistema(proyecto, pilar, variacion, aprendizajes, recientes);
  let user = `Escribe el artículo del ${fecha}.`;
  let r = await pedirTexto({ env, ai, system, user, fetchImpl, hasta });
  const brutos = [r.bruto];
  let neuronas = r.neuronas || 0;
  const evaluar = (d) => ({ legal: revisarArticulo({ titulo: d.titulo, extracto: d.extracto, contenido: d.contenido_markdown }), social: revisarClaims(`${d.social_titular}. ${d.social_copy}`), duplicada: esDuplicada(d.titulo, recientes) });
  let ev = evaluar(r.datos);
  // Una corrección como mucho: cada vuelta gasta cuota gratuita y el borrador lo revisa Kristian igualmente.
  // Sin margen de tiempo no se corrige: mejor un borrador con avisos que ninguno.
  if ((!ev.legal.ok || !ev.social.ok || ev.duplicada) && hasta - Date.now() > 40000) {
    const motivos = [...ev.legal.problemas, ...ev.social.problemas].map((p) => `${p.motivo}${p.frase ? `: "${p.frase.slice(0, 120)}"` : ''}`);
    if (ev.duplicada) motivos.push('El título repite un tema reciente; elige otra planta');
    user = `${user}\nCorrige esto en tu nueva versión: ${motivos.join('; ')}`;
    try {
      const r2 = await pedirTexto({ env, ai, system, user, fetchImpl, hasta });
      brutos.push(r2.bruto); neuronas += r2.neuronas || 0;
      const ev2 = evaluar(r2.datos);
      const nProb = (e) => e.legal.problemas.length + e.social.problemas.length + (e.duplicada ? 1 : 0);
      if (nProb(ev2) <= nProb(ev)) { r = r2; ev = ev2; }
    } catch (e) { brutos.push(`corrección fallida: ${e.message}`); }
  }
  const d = r.datos;
  const problemas = [...ev.legal.problemas, ...ev.social.problemas].map((p) => ({ motivo: p.motivo, frase: p.frase }));
  if (ev.duplicada) problemas.push({ motivo: 'Título parecido a uno reciente' });
  const categoria = CATEGORIAS.includes(d.categoria) ? d.categoria : 'Herbología';
  return {
    pilar, variacion, categoria, problemas, modelo: r.modelo, neuronas, errores: r.errores,
    bruto: brutos.join('\n=====\n').slice(0, 20000),
    titulo: d.titulo.trim(), extracto: d.extracto.trim().slice(0, 300),
    contenidoHtml: markdownAHtml(conAvisoBlog(d.contenido_markdown)),
    etiquetas: [...new Set(d.etiquetas.map((t) => String(t).toLowerCase().trim()).filter(Boolean))].slice(0, 8),
    planta: d.planta, nombreBotanico: d.nombre_botanico,
    promptImagen: promptImagen(proyecto, d, variacion),
    social: { titular: d.social_titular.trim(), copy: conAviso(d.social_copy), hashtags: normalizarHashtags(d.social_hashtags), texto_alternativo: d.texto_alternativo },
  };
}
