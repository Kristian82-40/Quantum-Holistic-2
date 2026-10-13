// Notas de voz de Kristian → texto (13-oct). Coste 0 €: Groq Whisper (capa gratuita) y, si falla, Workers AI.
// Transcribe la Edge Function kimiko-voz, que tiene las llaves; el worker de Telegram solo pide la transcripción con la
// llave de servicio (pedirTranscripcion), así no gasta su CPU de Workers Free ni necesita llaves nuevas.
// Nunca guarda el audio: lo baja de Telegram, lo manda al motor y lo olvida.
const GROQ = 'https://api.groq.com/openai/v1/audio/transcriptions';
const MODELO = 'whisper-large-v3-turbo';
const EXT_OK = ['flac', 'mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'ogg', 'wav', 'webm'];
const MAX_BYTES = 20 * 1024 * 1024; // lo máximo que deja bajar la API de bots de Telegram
export const MAX_SEGUNDOS = 600; // 10 min por nota
// Audios de prueba (sin Telegram): solo los de este repo público, nunca una URL cualquiera.
export const AUDIO_PRUEBA = 'https://raw.githubusercontent.com/Kristian82-40/Quantum-Holistic-2/';

// Telegram guarda las notas como .oga (Ogg/Opus) y Groq solo acepta la extensión .ogg.
export function nombreAudio(ruta = '') {
  const ext = String(ruta).split('?')[0].split('.').pop().toLowerCase();
  return `nota.${EXT_OK.includes(ext) ? ext : 'ogg'}`;
}

async function bajar(url, fetchImpl) {
  const a = await fetchImpl(url);
  if (!a.ok) throw new Error(`descarga ${a.status}`);
  if (Number(a.headers?.get?.('content-length') || 0) > MAX_BYTES) throw new Error('el audio pasa de 20 MB');
  const datos = new Uint8Array(await a.arrayBuffer());
  if (datos.length > MAX_BYTES) throw new Error('el audio pasa de 20 MB');
  return datos;
}

export async function bajarAudio({ token, fileId, fetchImpl = fetch }) {
  if (!token) throw new Error('falta TELEGRAM_BOT_TOKEN');
  const r = await fetchImpl(`https://api.telegram.org/bot${token}/getFile`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ file_id: fileId }) });
  const d = await r.json().catch(() => ({}));
  if (!d.ok) throw new Error(`Telegram getFile: ${d.description || r.status}`);
  if (d.result.file_size > MAX_BYTES) throw new Error('el audio pasa de 20 MB');
  return { datos: await bajar(`https://api.telegram.org/file/bot${token}/${d.result.file_path}`, fetchImpl), nombre: nombreAudio(d.result.file_path) };
}

export async function bajarAudioPrueba({ url, fetchImpl = fetch }) {
  if (!String(url).startsWith(AUDIO_PRUEBA)) throw new Error('audio de prueba fuera del repo');
  return { datos: await bajar(url, fetchImpl), nombre: nombreAudio(url) };
}

const aBase64 = (u8) => {
  let s = '';
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000));
  return btoa(s);
};

// Groq → Workers AI. Devuelve { ok, texto, motor } o { ok: false, errores } (motivos cortos, sin llaves).
export async function transcribir({ datos, nombre = 'nota.ogg', env = {}, idioma = 'es', fetchImpl = fetch }) {
  const errores = [];
  if (env.GROQ_API_KEY) {
    try {
      const fd = new FormData();
      fd.append('file', new Blob([datos]), nombre);
      fd.append('model', MODELO); fd.append('language', idioma); fd.append('response_format', 'json'); fd.append('temperature', '0');
      const r = await fetchImpl(GROQ, { method: 'POST', headers: { authorization: `Bearer ${env.GROQ_API_KEY}` }, body: fd, signal: AbortSignal.timeout(30_000) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(`${r.status} ${d?.error?.message ?? ''}`.trim());
      const texto = String(d.text ?? '').trim();
      if (texto) return { ok: true, texto, motor: `groq/${MODELO}` };
      errores.push('groq: sin texto');
    } catch (e) { errores.push(`groq: ${String(e?.message ?? e).slice(0, 120)}`); }
  } else errores.push('groq: falta GROQ_API_KEY');
  if (env.CF_ACCOUNT_ID && env.CF_AI_TOKEN) {
    try {
      const r = await fetchImpl(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/ai/run/@cf/openai/${MODELO}`, {
        method: 'POST', headers: { authorization: `Bearer ${env.CF_AI_TOKEN}`, 'content-type': 'application/json' },
        body: JSON.stringify({ audio: aBase64(datos), language: idioma }), signal: AbortSignal.timeout(45_000),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d.success === false) throw new Error(`${r.status} ${d?.errors?.[0]?.message ?? ''}`.trim());
      const texto = String(d.result?.text ?? '').trim();
      if (texto) return { ok: true, texto, motor: `workers-ai/${MODELO}` };
      errores.push('workers-ai: sin texto');
    } catch (e) { errores.push(`workers-ai: ${String(e?.message ?? e).slice(0, 120)}`); }
  } else errores.push('workers-ai: faltan CF_ACCOUNT_ID o CF_AI_TOKEN');
  return { ok: false, errores };
}

// Worker → kimiko-voz con la llave de servicio (el mismo método que usa kimiko-reel para avisar a kimiko-diario).
export async function pedirTranscripcion({ supabaseUrl, llave, fileId, fetchImpl = fetch }) {
  if (!supabaseUrl || !llave) throw new Error('faltan SUPABASE_URL o la llave de servicio en el worker');
  const r = await fetchImpl(`${supabaseUrl}/functions/v1/kimiko-voz`, {
    method: 'POST', headers: { apikey: llave, authorization: `Bearer ${llave}`, 'content-type': 'application/json' },
    body: JSON.stringify({ file_id: fileId }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.ok || !d.texto) throw new Error(d.error || (d.errores || []).join(' · ') || `kimiko-voz ${r.status}`);
  return d;
}
