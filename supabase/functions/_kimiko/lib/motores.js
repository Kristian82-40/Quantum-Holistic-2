// Motores de IA gratuitos, elegidos por PRIVACIDAD (13-oct-2026). Coste 0 € siempre: sin llave el motor se salta,
// sin cupo responde 429 y se pasa al siguiente; ninguno de estos planes cobra.
//   privado → lo que dice Kristian (órdenes, notas de voz): solo motores que no registran ni entrenan con lo que reciben.
//   publico → texto que acabará en la web (borradores): además, motores de cupo pequeño o con avisos de uso de datos.
// Los cupos son los publicados al 13-oct-2026 (comprobados en gravity.fast y dev.to/tariqnasser; Kristian los confirma al crear cada llave):
//   Groq 1.000 pet/día · Workers AI 10.000 neuronas/día · NVIDIA NIM 10.000 pet/día (hace falta el NVIDIA Developer Program)
//   · Mistral 10 $/mes en créditos del plan gratuito (puede entrenar con los prompts) · OpenRouter ':free' 50 pet/día (puede registrar).
// Gemini no está aquí: ya tiene su sitio en la cadena del blog, y Google avisa de que el plan gratuito mejora sus productos
// con lo que recibe y no vale para apps con usuarios en el EEE: nunca para órdenes privadas.
import { extraerJSON, generarJSON as generarJSONWorkersAI, MODELO_TEXTO } from './ia.js';
import { iaRest } from './ia-rest.js';
import { generarJSONGroq, MODELO_GROQ } from './groq.js';

const LIMITE_MS = 25000;

// Cualquier API «compatible con OpenAI»: NVIDIA NIM, Mistral, OpenRouter.
async function chatCompatible({ nombre, url, llave, modelo, system, user, validar, fetchImpl, maxTokens = 1500 }) {
  if (!llave) throw new Error(`${nombre}: sin llave`);
  const r = await fetchImpl(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${llave}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: modelo, max_tokens: maxTokens, temperature: 0.3,
      messages: [{ role: 'system', content: `${system}\nResponde SOLO con un objeto JSON válido, sin texto alrededor.` }, { role: 'user', content: user }],
    }),
    signal: AbortSignal.timeout(LIMITE_MS),
  });
  const bruto = await r.text();
  if (!r.ok) throw new Error(`${nombre} ${r.status}: ${bruto.slice(0, 160)}`);
  const datos = extraerJSON(JSON.parse(bruto).choices?.[0]?.message?.content);
  const malo = validar(datos);
  if (malo) throw new Error(`${nombre}: JSON incompleto (${malo})`);
  return { datos, modelo };
}

// Orden de la cadena por privacidad. El orden pone primero el cupo más holgado y más rápido.
export const CADENAS = {
  privado: ['groq', 'workers-ai', 'nvidia'],
  publico: ['groq', 'workers-ai', 'nvidia', 'mistral', 'openrouter'],
};

const MOTOR = {
  groq: ({ env, system, user, schema, validar, fetchImpl, hasta }) =>
    generarJSONGroq({ apiKey: env.GROQ_API_KEY, system, user, schema, validar, fetchImpl, hasta, maxTokens: 1500 }),
  'workers-ai': async ({ env, system, user, schema, validar, fetchImpl }) => {
    const ai = iaRest({ accountId: env.CF_ACCOUNT_ID, token: env.CF_AI_TOKEN, fetchImpl });
    return { ...(await generarJSONWorkersAI({ ai, system, user, schema: { name: 'respuesta', schema }, validar, maxTokens: 1500, reintentos: 0 })), modelo: MODELO_TEXTO };
  },
  nvidia: (a) => chatCompatible({ ...a, nombre: 'NVIDIA NIM', url: 'https://integrate.api.nvidia.com/v1/chat/completions', llave: a.env.NVIDIA_API_KEY, modelo: a.env.NVIDIA_MODELO || 'meta/llama-3.3-70b-instruct' }),
  mistral: (a) => chatCompatible({ ...a, nombre: 'Mistral', url: 'https://api.mistral.ai/v1/chat/completions', llave: a.env.MISTRAL_API_KEY, modelo: a.env.MISTRAL_MODELO || 'mistral-small-latest' }),
  openrouter: (a) => chatCompatible({ ...a, nombre: 'OpenRouter', url: 'https://openrouter.ai/api/v1/chat/completions', llave: a.env.OPENROUTER_API_KEY, modelo: a.env.OPENROUTER_MODELO || 'openai/gpt-oss-120b:free' }),
};

// Qué motores tienen llave hoy (para /estado y para decidir qué pedirle a Kristian). No muestra ninguna llave.
export function motoresConLlave(env) {
  const llaves = { groq: env.GROQ_API_KEY, 'workers-ai': env.CF_ACCOUNT_ID && env.CF_AI_TOKEN, nvidia: env.NVIDIA_API_KEY, mistral: env.MISTRAL_API_KEY, openrouter: env.OPENROUTER_API_KEY };
  return Object.fromEntries(Object.entries(llaves).map(([k, v]) => [k, !!v]));
}

// Prueba la cadena de la privacidad pedida. Devuelve { datos, motor, modelo, intentos } o lanza con todos los intentos.
export async function generarJSONMotores({ privacidad = 'privado', env, system, user, schema, validar = () => null, fetchImpl = fetch, hasta = Date.now() + 40000 }) {
  const cadena = CADENAS[privacidad];
  if (!cadena) throw new Error(`privacidad desconocida: ${privacidad}`);
  const intentos = [];
  for (const motor of cadena) {
    try {
      const r = await MOTOR[motor]({ env, system, user, schema, validar, fetchImpl, hasta });
      intentos.push({ motor, ok: true });
      return { datos: r.datos, motor, modelo: r.modelo ?? null, intentos };
    } catch (e) {
      intentos.push({ motor, ok: false, error: String(e.message).slice(0, 120) });
    }
  }
  const err = new Error(`ningún motor ${privacidad} respondió: ${intentos.map((i) => `${i.motor} (${i.error})`).join('; ')}`);
  err.intentos = intentos;
  throw err;
}

export { MODELO_GROQ };
