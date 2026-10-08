// Modo sin IA: si fallan los tres motores de texto, Kimiko no deja el día en blanco. Monta una ficha divulgativa de
// una planta a partir de la tabla `plants` con una plantilla fija. Nunca copia posología (dosis) ni "indicaciones"
// (son afirmaciones de salud): solo botánica, uso tradicional en general y contraindicaciones. Siempre borrador.
import { markdownAHtml, slugificar } from './blog.js';
import { conAvisoBlog, conAviso } from './legal.js';

// Las 9 peligrosas de kimiko/PROMPT.md: jamás se escribe sobre ellas.
export const PELIGROSAS = ['aconito', 'datura', 'datura-metel', 'amanita-muscaria', 'cannabis', 'cornezuelo-centeno', 'beleno-negro', 'tejo', 'hierba-mora'];

const lista = (x) => (Array.isArray(x) ? x.map(String).map((s) => s.trim()).filter(Boolean) : []);
const sinDosis = (s) => !/\d/.test(s); // una contraindicación con cifras ("dosis altas de 5 g") se omite

// Elige la planta: con ficha, no peligrosa, sin post reciente; primero las verificadas. Rota por día.
export function elegirPlanta(plantas = [], recientes = [], fecha = '2026-01-01') {
  const usada = (p) => recientes.some((t) => String(t).toLowerCase().includes(String(p.nombre_es).toLowerCase()));
  const aptas = plantas.filter((p) => !PELIGROSAS.includes(p.slug) && p.ficha_cientifica && lista(p.ficha_cientifica.contraindicaciones).length);
  const libres = aptas.filter((p) => !usada(p));
  const grupo = [libres.filter((p) => p.ficha_verificada), libres, aptas].find((g) => g.length);
  if (!grupo) return null;
  return grupo[Math.floor(Date.parse(fecha) / 86400000) % grupo.length];
}

export function articuloSinIA({ planta, proyecto }) {
  const f = planta.ficha_cientifica || {};
  const nombre = planta.nombre_es;
  const latino = planta.nombre_latino;
  const props = lista(f.propiedades).slice(0, 5).map((p) => p.toLowerCase());
  const activos = lista(f.principios_activos).slice(0, 5);
  const contra = lista(f.contraindicaciones).filter(sinDosis);
  const md = [
    `${nombre} (*${latino}*) forma parte de la tradición herbolaria${f.familia_botanica ? ` y pertenece a la familia de las ${f.familia_botanica}` : ''}. En esta ficha repasamos qué es, qué parte se usa y qué precauciones conviene conocer antes de acercarse a ella.`,
    '', '## Qué es',
    `${nombre} es una planta conocida por su nombre botánico, *${latino}*. ${f.parte_usada ? `De ella se aprovechan sobre todo: ${String(f.parte_usada).toLowerCase()}.` : ''}`,
    ...(activos.length ? ['', '## Qué contiene', `Entre sus componentes descritos están: ${activos.join(', ')}.`] : []),
    ...(props.length ? ['', '## Su lugar en la tradición', `La herbolaria tradicional le ha atribuido propiedades como: ${props.join(', ')}. Son usos tradicionales, no indicaciones médicas.`] : []),
    '', '## Precauciones y contraindicaciones',
    ...(contra.length ? contra.map((c) => `- ${c}`) : ['- Consulta siempre antes de usarla si tomas medicación.']),
    '- Evita su uso en embarazo y lactancia sin consejo profesional.',
    '- Algunas plantas solo son seguras de uso externo: no la tomes por vía oral sin que un profesional te lo indique.',
    '', 'Consulta con un profesional sanitario antes de usar cualquier planta.',
  ].join('\n');
  const titulo = `${nombre}: ficha de la planta`.slice(0, 60);
  return {
    pilar: 'ficha de planta (sin IA)', variacion: null, categoria: 'Herbología', modelo: 'plantilla-sin-ia', neuronas: 0, errores: [],
    problemas: [{ motivo: 'Hecho sin IA con la plantilla de ficha: revisar el texto antes de publicar' }],
    bruto: null, titulo, extracto: `Qué es ${nombre} (${latino}), qué parte se usa y qué precauciones conviene conocer.`.slice(0, 155),
    contenidoHtml: markdownAHtml(conAvisoBlog(md)),
    etiquetas: [slugificar(nombre).replace(/-/g, ' '), 'ficha', 'herbología'],
    planta: nombre, nombreBotanico: latino,
    promptImagen: `${latino} botanical plate. Style: semi-translucent watercolor illustration, soft paper texture, cream background. No people, no text.`,
    social: {
      titular: `${nombre}, en ficha`, copy: conAviso(`Hoy repasamos ${nombre} (${latino}): qué es, qué parte se usa y sus precauciones.`),
      hashtags: ['#herbologia', '#plantasmedicinales', `#${slugificar(nombre).replace(/-/g, '')}`], texto_alternativo: `Ilustración botánica de ${nombre}`,
    },
    sitio: proyecto.sitio,
  };
}
