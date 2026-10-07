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

// Una cantidad con unidad de toma ("500 mg", "2 cucharaditas", "20 gotas") es una dosis: la decide un profesional.
const DOSIS = /\b\d+(?:[.,]\d+)?\s*(?:-|a)?\s*\d*\s*(mg|miligramos?|mcg|µg|g|gr|gramos?|ml|mililitros?|gotas?|c[áa]psulas?|comprimidos?|tabletas?|cucharad(?:a|ita)s?|tazas?\s+al\s+d[íi]a|veces\s+al\s+d[íi]a)\b/iu;
const SECCION_PRECAUCIONES = /^#{2,3}\s*precauciones/imu;

export function revisarArticulo({ titulo = '', extracto = '', contenido = '' }) {
  const { problemas } = revisarClaims(`${titulo}.\n${extracto}.\n${contenido}`);
  for (const frase of contenido.split(/[.!?\n]+/).map((f) => f.trim()).filter(Boolean)) {
    if (DOSIS.test(frase)) problemas.push({ frase, motivo: 'Indica una dosis concreta' });
  }
  if (!SECCION_PRECAUCIONES.test(contenido)) problemas.push({ frase: '', motivo: 'Falta la sección "## Precauciones y contraindicaciones"' });
  return { ok: problemas.length === 0, problemas };
}

export function conAvisoBlog(contenido = '') {
  return contenido.includes(AVISO_BLOG) ? contenido : `${contenido.trim()}\n\n*${AVISO_BLOG}*`;
}
