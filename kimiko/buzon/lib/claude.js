import { env } from './env.js';
import { BRAND } from './brand.js';

async function anthropic(body) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ model: env.CLAUDE_MODEL, max_tokens: 2000, ...body }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Claude: ${json.error?.message || JSON.stringify(json)}`);
  return json.content.map((c) => (c.type === 'text' ? c.text : '')).join('').trim();
}

function extraerJSON(texto) {
  const limpio = texto.replace(/^```(?:json)?/m, '').replace(/```$/m, '').trim();
  const i = limpio.indexOf('{');
  const f = limpio.lastIndexOf('}');
  if (i === -1 || f === -1) throw new Error('Claude no ha devuelto JSON válido');
  return JSON.parse(limpio.slice(i, f + 1));
}

const sistema = (aprendizajes) => `${BRAND}

APRENDIZAJES ACUMULADOS (correcciones que Kristian te ha dado; pesan más que cualquier regla general):
${aprendizajes.length ? aprendizajes.map((a) => `- ${a}`).join('\n') : '- (todavía ninguno)'}

Eres Kimiko, el agente responsable de Quantum Holistic. Trabajas para Kristian.
Escribes en español neutro, cálido y con criterio. Nada de promesas médicas ni afirmaciones
pseudocientíficas: la ciencia se nombra con honestidad y lo ancestral se nombra como tradición.`;

// Lee la foto (un periódico, un cartel, una escena) y construye el anuncio completo.
export async function crearAnuncio({ base64, mime, nota, aprendizajes }) {
  const texto = await anthropic({
    system: sistema(aprendizajes),
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mime, data: base64 } },
          {
            type: 'text',
            text: `Esta foto es el disparador de una publicación de Quantum Holistic.
${nota ? `Indicación de Kristian: "${nota}"` : 'Kristian no ha añadido indicación: decide tú el ángulo.'}

Haz esto:
1. Lee lo que hay en la imagen (titulares, texto, escena, contexto). Si es una noticia o tendencia, identifícala.
2. Encuentra el puente honesto entre ese tema y el mundo de Quantum Holistic (bienestar, plantas medicinales, Ayurveda, MTC, KM0, hábitos).
3. Escribe la publicación.

Devuelve SOLO un objeto JSON, sin texto alrededor, con estas claves:
{
  "lectura": "qué has visto en la foto, 1-2 frases",
  "concepto": "el ángulo elegido, 1 frase",
  "copy": "el texto del post para Instagram, 60-120 palabras, con saltos de línea reales, gancho en la primera línea y una llamada a la acción al final",
  "hashtags": "8-12 hashtags separados por espacio, en español, sin repetir",
  "texto_en_imagen": "el titular corto que irá SOBRE la imagen, máximo 7 palabras",
  "prompt_imagen": "descripción en inglés para generar la imagen del anuncio: composición, luz, paleta índigo/turquesa/dorado suave/verdes, estética minimalismo orgánico premium, sin caras reconocibles, sin logos ajenos"
}`,
          },
        ],
      },
    ],
  });
  return extraerJSON(texto);
}

// Reescribe el texto de un borrador manteniendo el concepto.
export async function reescribirCopy({ borrador, instruccion, aprendizajes }) {
  const texto = await anthropic({
    max_tokens: 1200,
    system: sistema(aprendizajes),
    messages: [
      {
        role: 'user',
        content: `Concepto: ${borrador.concepto}
Texto actual:
${borrador.copy}

${instruccion || 'Reescríbelo con otro tono y otro gancho, mismo concepto. Que no se parezca al anterior.'}

Devuelve SOLO JSON: {"copy": "...", "hashtags": "...", "texto_en_imagen": "..."}`,
      },
    ],
  });
  return extraerJSON(texto);
}

// Conversación normal con Kimiko (texto suelto en el chat).
export async function conversar({ mensaje, aprendizajes }) {
  return anthropic({
    max_tokens: 1200,
    system: `${sistema(aprendizajes)}

Estás hablando por Telegram: responde breve, directo y accionable. Sin encabezados de informe.`,
    messages: [{ role: 'user', content: mensaje }],
  });
}
