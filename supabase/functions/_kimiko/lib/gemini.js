// Gemini API en capa GRATUITA (sin facturación enlazada al proyecto de Google). Verificado el 6-oct-2026 en
// ai.google.dev/gemini-api/docs/pricing (actualizada 1-oct-2026): gemini-3.8-flash "Free of charge"; en capa gratuita
// Google usa el contenido para mejorar sus productos. Los límites (RPM/RPD) solo se ven en AI Studio.
// Si se agota la cuota responde 429 y Kimiko pasa a Workers AI: nunca se paga.
import { extraerJSON } from './ia.js';

export const MODELO_GEMINI = 'gemini-3.8-flash';
const URL_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function generarJSONGemini({ apiKey, system, user, schema, validar = () => null, maxTokens = 8192, modelo = MODELO_GEMINI, fetchImpl = fetch }) {
  if (!apiKey) throw new Error('Gemini: falta GEMINI_API_KEY');
  const r = await fetchImpl(`${URL_BASE}/${modelo}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { responseMimeType: 'application/json', responseJsonSchema: schema, maxOutputTokens: maxTokens },
    }),
  });
  const bruto = await r.text();
  if (!r.ok) {
    const err = new Error(`Gemini ${r.status}: ${bruto.slice(0, 300)}`);
    err.bruto = bruto.slice(0, 20000);
    throw err;
  }
  let texto = '';
  try {
    const data = JSON.parse(bruto);
    texto = (data.candidates?.[0]?.content?.parts || []).filter((p) => !p.thought).map((p) => p.text || '').join('');
    const datos = extraerJSON(texto);
    const fallo = validar(datos);
    if (fallo) throw new Error(`JSON incompleto: ${fallo}`);
    return { datos, bruto: bruto.slice(0, 20000), modelo };
  } catch (e) {
    const err = new Error(`Gemini (${modelo}): ${e.message}`);
    err.bruto = bruto.slice(0, 20000);
    throw err;
  }
}
