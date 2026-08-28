// Red de seguridad: ningún secreto sale nunca por el chat ni por los logs.
//
// Los errores de una API a veces incluyen la URL o el cuerpo de la petición,
// y ahí puede ir un token. Todo lo que Kimiko escribe pasa antes por aquí.

import { env } from './env.js';

// Secretos que aparecen en tiempo de ejecución (el token de Instagram rotado)
const enCaliente = new Set();
export function registrarSecreto(s) {
  if (typeof s === 'string' && s.length > 12) enCaliente.add(s);
}

const SECRETOS = () => [
  env.IG_TOKEN,
  env.FB_APP_SECRET,
  env.ANTHROPIC_KEY,
  env.GEMINI_KEY,
  env.REPLICATE_TOKEN,
  env.SUPABASE_SERVICE_KEY,
  env.TG_TOKEN,
  env.TG_SECRET,
  ...enCaliente,
].filter((s) => typeof s === 'string' && s.length > 12);

// Patrones de credencial aunque no sean ninguno de los nuestros
const PATRONES = [
  /\bEAA[A-Za-z0-9]{20,}/g,              // tokens de Meta / Facebook
  /\bsk-[A-Za-z0-9_-]{20,}/g,            // claves estilo OpenAI / Anthropic
  /\bAIza[A-Za-z0-9_-]{30,}/g,           // claves de Google
  /\br8_[A-Za-z0-9]{20,}/g,              // Replicate
  /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, // JWT (Supabase)
  /\b\d{8,12}:[A-Za-z0-9_-]{30,}/g,      // tokens de bot de Telegram
  /access_token=[^&\s"']+/gi,
];

export function limpiar(texto) {
  let t = String(texto ?? '');
  for (const s of SECRETOS()) t = t.split(s).join('[oculto]');
  for (const p of PATRONES) t = t.replace(p, '[oculto]');
  return t;
}

// console.error seguro
export function registrar(e) {
  console.error(limpiar(e?.stack || e?.message || e));
}
