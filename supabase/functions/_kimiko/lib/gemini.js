// Gemini API en capa GRATUITA (sin facturación enlazada al proyecto de Google). Verificado el 6-oct-2026 en
// ai.google.dev/gemini-api/docs/pricing (actualizada 1-oct-2026): gemini-3.8-flash "Free of charge"; en capa gratuita
// Google usa el contenido para mejorar sus productos. Los límites (RPM/RPD) solo se ven en AI Studio.
// Si se agota la cuota responde 429 y Kimiko pasa a Workers AI: nunca se paga.
import { extraerJSON } from './ia.js';

export const MODELO_GEMINI = 'gemini-3.8-flash';
const URL_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Un 503 ("high demand") o un 429 por minuto suelen ser pasajeros: se reintenta hasta REINTENTOS_GEMINI veces con espera.
// Cada intento tiene tiempo límite: el 8-oct una llamada colgada agotó los 150 s de la Edge Function sin dejar registro.
export const REINTENTOS_GEMINI = 3;
export const ESPERAS_MS = [2000, 5000];
const LIMITE_INTENTO_MS = 25000;
const esPasajero = (status) => status === 429 || status >= 500;
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function intentoGemini({ apiKey, system, user, schema, validar, maxTokens, modelo, fetchImpl, limiteMs }) {
  let r;
  try {
    r = await fetchImpl(`${URL_BASE}/${modelo}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { responseMimeType: 'application/json', responseJsonSchema: schema, maxOutputTokens: maxTokens },
      }),
      signal: AbortSignal.timeout(limiteMs),
    });
  } catch (e) {
    const err = new Error(`Gemini sin respuesta: ${e.name === 'TimeoutError' ? `más de ${Math.round(limiteMs / 1000)} s` : e.message}`);
    err.pasajero = true;
    throw err;
  }
  const bruto = await r.text();
  if (!r.ok) {
    const err = new Error(`Gemini ${r.status}: ${bruto.slice(0, 300)}`);
    err.bruto = bruto.slice(0, 20000);
    err.pasajero = esPasajero(r.status) && !/per day|PerDay/i.test(bruto); // la cuota diaria no vuelve hasta mañana
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
    err.pasajero = true; // JSON roto: otro intento suele salir bien
    throw err;
  }
}

// hasta (ms desde epoch): no se empieza un intento si no queda tiempo para terminarlo.
export async function generarJSONGemini({ apiKey, system, user, schema, validar = () => null, maxTokens = 8192, modelo = MODELO_GEMINI, fetchImpl = fetch, reintentos = REINTENTOS_GEMINI, esperas = ESPERAS_MS, hasta = Infinity }) {
  if (!apiKey) throw new Error('Gemini: falta GEMINI_API_KEY');
  const fallos = [];
  for (let i = 0; i < reintentos; i++) {
    const queda = hasta - Date.now();
    if (queda < 8000) { fallos.push('sin tiempo para otro intento'); break; }
    try {
      return { ...(await intentoGemini({ apiKey, system, user, schema, validar, maxTokens, modelo, fetchImpl, limiteMs: Math.min(LIMITE_INTENTO_MS, queda - 3000) })), intentos: i + 1 };
    } catch (e) {
      fallos.push(e);
      if (!e.pasajero || i === reintentos - 1) break;
      await dormir(esperas[i] ?? esperas[esperas.length - 1] ?? 0);
    }
  }
  const ultimo = [...fallos].reverse().find((f) => f instanceof Error);
  const err = new Error(`${ultimo?.message ?? 'Gemini: sin tiempo'} (tras ${fallos.filter((f) => f instanceof Error).length} intento(s))`);
  err.bruto = fallos.map((f) => f.bruto || String(f.message || f)).join('\n---\n').slice(0, 20000);
  throw err;
}
