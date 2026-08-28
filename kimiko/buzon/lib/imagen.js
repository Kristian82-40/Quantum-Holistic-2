import { env } from './env.js';

// Adaptador de generación de imagen. Cambia IMAGE_PROVIDER para elegir motor.
// - 'gemini'    : usa la foto que enviaste como referencia y la reinterpreta con la línea de marca.
// - 'replicate' : genera desde cero con Flux (mejor calidad, cuesta unos céntimos por imagen).
// - 'none'      : no genera nada, reutiliza tu foto original.

const ESTILO = `Estética de marca obligatoria: minimalismo orgánico premium, paleta índigo profundo,
turquesa, dorado suave, verdes sanadores y tonos tierra. Luz natural lateral, sombras suaves,
mucho aire negativo, texturas reales (hoja, barro, lino, agua, vapor). Un único foco visual.
Formato cuadrado 1:1. Sin caras reconocibles, sin marcas de agua, sin logos ajenos.`;

export async function generarImagen({ prompt, textoEnImagen, fuente }) {
  const completo = `${prompt}\n\n${ESTILO}${
    textoEnImagen ? `\n\nIntegra este titular en la imagen, tipografía serif elegante, bien legible, sin faltas: "${textoEnImagen}"` : ''
  }`;

  if (env.IMAGE_PROVIDER === 'none') return null;
  if (env.IMAGE_PROVIDER === 'replicate') return replicate(completo);
  return gemini(completo, fuente);
}

// ── Gemini: acepta la foto original como referencia ──────────
async function gemini(prompt, fuente) {
  const partes = [{ text: prompt }];
  if (fuente?.base64) {
    partes.unshift({ inline_data: { mime_type: fuente.mime, data: fuente.base64 } });
    partes.push({ text: 'Usa la imagen adjunta solo como referencia de tema y contexto. No la copies literalmente ni reproduzcas texto de periódico ni logotipos.' });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_IMAGE_MODEL}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'x-goog-api-key': env.GEMINI_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: partes }] }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Gemini: ${json.error?.message || JSON.stringify(json)}`);

  const parts = json.candidates?.[0]?.content?.parts || [];
  const img = parts.find((p) => p.inline_data || p.inlineData);
  if (!img) throw new Error('Gemini no ha devuelto imagen');
  const data = img.inline_data || img.inlineData;
  return { buffer: Buffer.from(data.data, 'base64'), mime: data.mime_type || data.mimeType || 'image/png' };
}

// ── Replicate / Flux ─────────────────────────────────────────
async function replicate(prompt) {
  const res = await fetch(`https://api.replicate.com/v1/models/${env.REPLICATE_MODEL}/predictions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.REPLICATE_TOKEN}`,
      'content-type': 'application/json',
      prefer: 'wait=55',
    },
    body: JSON.stringify({ input: { prompt, aspect_ratio: '1:1', output_format: 'jpg' } }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Replicate: ${json.detail || JSON.stringify(json)}`);

  const salida = Array.isArray(json.output) ? json.output[0] : json.output;
  if (!salida) throw new Error('Replicate no ha devuelto imagen a tiempo');
  const img = await fetch(salida);
  return { buffer: Buffer.from(await img.arrayBuffer()), mime: 'image/jpeg' };
}
