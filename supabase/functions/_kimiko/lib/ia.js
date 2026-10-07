// Workers AI (binding [ai] de wrangler.toml). Coste 0 €: en el plan Workers Free hay 10.000 neuronas/día gratis
// y al agotarlas Cloudflare devuelve error (3036) en vez de cobrar.
export const MODELO_TEXTO = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
export const MODELO_IMAGEN = '@cf/black-forest-labs/flux-1-schnell';
export const MAX_TOKENS = 2500;
export const REINTENTOS = 2;

// Neuronas por millón de tokens (precio en $ / 0,011 $ cada 1.000 neuronas), verificado el 6-oct-2026.
const NEURONAS_MTOK = { in: 26636, out: 204818 };
const NEURONAS_IMAGEN = 4 * 4.8 + 4 * 9.6; // 1024×1024 = 4 teselas de 512, 4 pasos
export const neuronasTexto = (u = {}) => Math.round(((u.prompt_tokens || 0) * NEURONAS_MTOK.in + (u.completion_tokens || 0) * NEURONAS_MTOK.out) / 1e6);

const MAX_BRUTO = 20000;
const recortar = (s) => (s.length > MAX_BRUTO ? `${s.slice(0, MAX_BRUTO)}…[recortado]` : s);
export const aTexto = (x) => (typeof x === 'string' ? x : JSON.stringify(x));

export const esCupoAgotado = (e) => /3036|daily free allocation|neurons/i.test(String(e?.message || e));

export function extraerJSON(respuesta) {
  if (respuesta && typeof respuesta === 'object') return respuesta;
  const limpio = String(respuesta ?? '').replace(/```json|```/g, '').trim();
  const ini = limpio.indexOf('{');
  const fin = limpio.lastIndexOf('}');
  if (ini < 0 || fin < ini) throw new Error('La respuesta no contiene JSON');
  return JSON.parse(limpio.slice(ini, fin + 1));
}

// Pide JSON forzado por esquema. Reintenta hasta REINTENTOS veces si la llamada falla o el JSON no vale.
// Siempre devuelve (o adjunta al error) todas las respuestas en bruto para guardarlas.
export async function generarJSON({ ai, system, user, schema, validar = () => null, maxTokens = MAX_TOKENS, reintentos = REINTENTOS }) {
  const brutos = [];
  let neuronas = 0;
  let ultimoError;
  for (let intento = 0; intento <= reintentos; intento++) {
    try {
      const r = await ai.run(MODELO_TEXTO, {
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
        response_format: { type: 'json_schema', json_schema: schema },
        max_tokens: maxTokens,
      });
      neuronas += neuronasTexto(r?.usage);
      brutos.push(aTexto(r?.response ?? r));
      const datos = extraerJSON(r?.response);
      const fallo = validar(datos);
      if (fallo) throw new Error(`JSON incompleto: ${fallo}`);
      return { datos, bruto: recortar(brutos.join('\n---\n')), intentos: intento + 1, neuronas };
    } catch (e) {
      ultimoError = e;
      if (!brutos[intento]) brutos.push(`ERROR: ${e.message}`);
      if (esCupoAgotado(e)) break; // reintentar no sirve hasta las 00:00 UTC
    }
  }
  const err = new Error(`Workers AI (texto) tras ${brutos.length} intento(s): ${ultimoError?.message}`);
  err.bruto = recortar(brutos.join('\n---\n'));
  err.neuronas = neuronas;
  err.cupo = esCupoAgotado(ultimoError);
  throw err;
}

// Base64 → bytes. Uint8Array.fromBase64 es nativo y casi no gasta CPU (límite de 10 ms en Workers Free).
export function base64ABytes(b64) {
  if (typeof Uint8Array.fromBase64 === 'function') return Uint8Array.fromBase64(b64);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function generarImagen({ ai, prompt }) {
  const r = await ai.run(MODELO_IMAGEN, { prompt: prompt.slice(0, 2048), steps: 4 });
  if (!r?.image) throw new Error(`flux no devolvió imagen: ${aTexto(r).slice(0, 200)}`);
  return { bytes: base64ABytes(r.image), mime: 'image/jpeg', ext: 'jpg', neuronas: Math.round(NEURONAS_IMAGEN) };
}
