// Filtro legal: en la UE las plantas no pueden anunciarse como que curan o tratan enfermedades.
// Marca como problema toda frase que mezcle una "promesa" con una "condición de salud",
// más las afirmaciones absolutas. Prefiere pasarse de estricto: lo dudoso va a revisión humana.

export const AVISO_FIJO = 'Contenido informativo basado en tradición herbolaria. No sustituye el consejo médico.';

const PROMESAS = new Set([
  'cura', 'curan', 'curar', 'curará', 'curativo', 'curativa', 'curativos', 'curativas',
  'sanar', 'sanan', 'sanará', 'trata', 'tratar', 'tratamiento', 'elimina', 'eliminar',
  'previene', 'prevenir', 'combate', 'combatir', 'alivia', 'aliviar', 'revierte', 'revertir',
  'desintoxica', 'milagro', 'milagroso', 'milagrosa',
]);

const CONDICIONES = new Set([
  'cáncer', 'cancer', 'diabetes', 'hipertensión', 'hipertension', 'depresión', 'depresion',
  'ansiedad', 'artritis', 'artrosis', 'colesterol', 'infección', 'infeccion', 'infecciones',
  'enfermedad', 'enfermedades', 'alzheimer', 'insomnio', 'migraña', 'obesidad', 'tumor',
  'tumores', 'covid', 'vih',
]);

const ABSOLUTOS = [
  [/garantizad[oa]/iu, 'Promesa de resultado garantizado'],
  [/100\s*%\s*(efectiv|segur)/iu, 'Afirmación absoluta de eficacia o seguridad'],
  [/(?<!no\s)sustituye\s+(al|a tu)\s+médico/iu, 'Sugiere sustituir al médico'],
  [/sin\s+efectos\s+secundarios/iu, 'Afirma ausencia de efectos secundarios'],
  [/deja\s+(tu|la)\s+medicaci/iu, 'Incita a dejar la medicación'],
];

export function revisarClaims(texto = '') {
  const problemas = [];
  const frases = texto.split(/[.!?\n]+/).map((f) => f.trim()).filter(Boolean);
  for (const frase of frases) {
    const palabras = (frase.toLowerCase().match(/\p{L}+/gu) || []);
    const promesa = palabras.find((p) => PROMESAS.has(p));
    const condicion = palabras.find((p) => CONDICIONES.has(p));
    if (promesa && condicion) {
      problemas.push({ frase, motivo: `Promesa de salud ("${promesa}") sobre "${condicion}"` });
    }
    for (const [re, motivo] of ABSOLUTOS) {
      if (re.test(frase)) problemas.push({ frase, motivo });
    }
  }
  return { ok: problemas.length === 0, problemas };
}

export function conAviso(copy = '') {
  return copy.includes(AVISO_FIJO) ? copy : `${copy.trim()}\n\n${AVISO_FIJO}`;
}

// ── Artículos de blog: además de las promesas de salud, dosis y precauciones ──
export const AVISO_BLOG = 'Este artículo es divulgativo y se basa en la tradición herbolaria. No sustituye el consejo de un profesional sanitario: consulta con tu médico o farmacéutico antes de usar cualquier planta, sobre todo si estás embarazada, das el pecho, tomas medicación o tienes una enfermedad crónica.';

// Dosis: la decide un profesional. Unidades de toma ("500 mg", "20 gotas", "2 cápsulas", "3 veces al día") siempre cuentan.
// Pesos y medidas de cocina ("800 g de calabaza", "2 tazas de caldo") solo cuentan si la frase habla de tomar una planta
// (infusión, extracto, "al día", "por taza"…): así una receta no se marca como dosis (9-oct).
const DOSIS_SIEMPRE = /\b\d+(?:[.,]\d+)?\s*(?:(?:-|a)\s*\d+(?:[.,]\d+)?\s*)?(mg|miligramos?|mcg|µg|gotas?|c[áa]psulas?|comprimidos?|tabletas?|veces\s+al\s+d[íi]a|tazas?\s+al\s+d[íi]a)(?![\p{L}])/iu;
const CANTIDAD = /\b\d+(?:[.,]\d+)?\s*(?:(?:-|a)\s*\d+(?:[.,]\d+)?\s*)?(g|gr|gramos?|kg|ml|mililitros?|cl|l|litros?|cucharad(?:a|ita)s?|tazas?)(?![\p{L}])/iu;
const CONTEXTO_TOMA = /\b(al|por|cada)\s+d[íi]a\b|\bdiari[oa]s?\b|\bdosis\b|\btom(a|ar|e|en|ad)\b|\bingerir\b|\binfusi[óo]n|\btisana|\bdecocci[óo]n|\bextracto|\btintura|\baceite\s+esencial|\b(hojas?|flores?|ra[íi]z|ra[íi]ces|planta|sumidades)\s+secas?|\b(por|a\s+la|en\s+una)\s+taza\b|\bsuplement|\bpor\s+kilo/iu;

export const esDosis = (frase = '') => DOSIS_SIEMPRE.test(frase) || (CANTIDAD.test(frase) && CONTEXTO_TOMA.test(frase));
const SECCION_PRECAUCIONES = /^#{2,3}\s*precauciones/imu;

export function revisarArticulo({ titulo = '', extracto = '', contenido = '' }) {
  const { problemas } = revisarClaims(`${titulo}.\n${extracto}.\n${contenido}`);
  for (const frase of contenido.split(/[.!?\n]+/).map((f) => f.trim()).filter(Boolean)) {
    if (esDosis(frase)) problemas.push({ frase, motivo: 'Indica una dosis concreta' });
  }
  if (!SECCION_PRECAUCIONES.test(contenido)) problemas.push({ frase: '', motivo: 'Falta la sección "## Precauciones y contraindicaciones"' });
  return { ok: problemas.length === 0, problemas };
}

export function conAvisoBlog(contenido = '') {
  return contenido.includes(AVISO_BLOG) ? contenido : `${contenido.trim()}\n\n*${AVISO_BLOG}*`;
}
