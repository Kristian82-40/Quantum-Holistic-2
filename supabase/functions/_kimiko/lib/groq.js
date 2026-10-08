// Groq (API compatible con OpenAI) en su plan GRATUITO: tercer motor de texto, solo si fallan Gemini y Workers AI.
// Cupo comprobado el 8-oct-2026 en console.groq.com/docs/rate-limits (Free Plan): openai/gpt-oss-120b →
// 30 peticiones/min, 1.000/día, 8.000 tokens/min y 200.000 tokens/día. Un post gasta ~6.000 tokens: sobra.
// Sin tarjeta: al agotar el cupo responde 429, nunca cobra. La llave (GROQ_API_KEY) la crea Kristian en console.groq.com.
import { extraerJSON } from './ia.js';

export const MODELO_GROQ = 'openai/gpt-oss-120b';
const URL = 'https://api.groq.com/openai/v1/chat/completions';
const LIMITE_MS = 30000;

export async function generarJSONGroq({ apiKey, system, user, schema, validar = () => null, maxTokens = 6000, modelo = MODELO_GROQ, fetchImpl = fetch, hasta = Infinity }) {
  if (!apiKey) throw new Error('Groq: falta GROQ_API_KEY');
  const queda = hasta - Date.now();
  if (queda < 8000) throw new Error('Groq: sin tiempo para intentarlo');
  let r;
  try {
    r = await fetchImpl(URL, {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: modelo,
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
        response_format: { type: 'json_schema', json_schema: { name: 'articulo', schema } },
        max_completion_tokens: maxTokens,
      }),
      signal: AbortSignal.timeout(Math.min(LIMITE_MS, queda - 3000)),
    });
  } catch (e) {
    throw new Error(`Groq sin respuesta: ${e.name === 'TimeoutError' ? 'tiempo agotado' : e.message}`);
  }
  const bruto = await r.text();
  const fallo = (msg) => { const err = new Error(msg); err.bruto = bruto.slice(0, 20000); return err; };
  if (!r.ok) throw fallo(`Groq ${r.status}: ${bruto.slice(0, 300)}`);
  try {
    const datos = extraerJSON(JSON.parse(bruto).choices?.[0]?.message?.content);
    const malo = validar(datos);
    if (malo) throw new Error(`JSON incompleto: ${malo}`);
    return { datos, bruto: bruto.slice(0, 20000), modelo };
  } catch (e) {
    throw fallo(`Groq (${modelo}): ${e.message}`);
  }
}
