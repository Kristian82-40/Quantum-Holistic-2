// Kimiko interno (13-oct-2026): decide qué hacer con una orden de Kristian SIN gastar la suscripción de Claude.
// Solo puede hacer tres cosas: responder una charla corta, pasar la orden a Claude (`para_claude`) o dejarla a Kimiko Cloud
// como hasta ahora. Nunca toca la web, los datos ni los pagos, y ante la duda va a Kimiko Cloud (el comportamiento de siempre).
import { generarJSONMotores } from './motores.js';
import { revisarClaims, esDosis } from './legal.js';

export const ESQUEMA_TRIAJE = {
  type: 'object', additionalProperties: false, required: ['tipo', 'respuesta', 'resumen'],
  properties: {
    tipo: { type: 'string', enum: ['conversacion', 'accion', 'salud'] },
    respuesta: { type: 'string' },
    resumen: { type: 'string' },
  },
};

const SISTEMA = `Eres Kimiko, la operadora de Quantum Holistic, y clasificas el mensaje que te manda Kristian por Telegram.
Responde con un JSON {tipo, respuesta, resumen}:
- tipo "conversacion": SOLO saludos, agradecimientos o charla breve que no pide hacer nada ni consultar datos (ej. "¿cómo estás?", "gracias"). En "respuesta" escribe 1-2 frases cálidas en español, sin prometer ni afirmar que has hecho algo.
- tipo "salud": cualquier pregunta sobre plantas, dosis, síntomas, remedios o salud. "respuesta" vacía.
- tipo "accion": todo lo demás (pedir algo, preguntar por el estado del proyecto, la web, pagos, publicaciones, ficheros, instrucciones). "respuesta" vacía.
En caso de duda, "accion". "resumen": una frase de qué pide, sin copiar datos personales ni números de tarjeta ni llaves.`;

// Reglas en código, sin IA: lo que NO debe ni leer un modelo gratuito ni ejecutarse solo.
// Revisadas el 13-oct con las órdenes reales de Kristian: ante la duda, `para_claude` (no se ejecuta ni se manda a ninguna IA).
// Llaves con prefijo conocido: OpenAI/OpenRouter, Stripe, Supabase, GitHub, Groq, Google, NVIDIA, Slack, bot de Telegram, JWT y AWS.
const SECRETO = /(?:\bsk-[A-Za-z0-9_-]{16,}|\b[sr]k_(?:live|test)_[A-Za-z0-9]{10,}|\bwhsec_[A-Za-z0-9]{10,}|\bsb_(?:secret|publishable)_[A-Za-z0-9_-]{8,}|\bgh[pousr]_[A-Za-z0-9]{20,}|\bgithub_pat_[A-Za-z0-9_]{20,}|\bgsk_[A-Za-z0-9]{20,}|\bAIza[0-9A-Za-z_-]{30,}|\bnvapi-[A-Za-z0-9_-]{20,}|\bxox[abprs]-[A-Za-z0-9-]{10,}|\b\d{8,10}:[A-Za-z0-9_-]{30,}|\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}|\bAKIA[0-9A-Z]{12,})/;
// Llaves sin prefijo (Cloudflare, Mistral…): 32 o más caracteres seguidos, hexadecimales o con minúsculas, mayúsculas y cifras.
// Los enlaces se quitan antes (un id de Drive no es una llave); un nombre de rama o de archivo en minúsculas no cuenta.
function tokenOpaco(texto) {
  return (texto.replace(/https?:\/\/\S+/g, ' ').match(/[A-Za-z0-9_-]{32,}/g) ?? [])
    .some((t) => (/^[0-9a-f]+$/i.test(t) && /\d/.test(t) && /[a-f]/i.test(t)) || (/[a-z]/.test(t) && /[A-Z]/.test(t) && /\d/.test(t)));
}

const luhn = (d) => { let s = 0; for (let i = d.length - 1, doble = false; i >= 0; i--, doble = !doble) { let n = Number(d[i]); if (doble && (n *= 2) > 9) n -= 9; s += n; } return s % 10 === 0; };
const FECHA_HORA = /^20\d\d(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])(?:[01]\d|2[0-3])[0-5]\d[0-5]\d$/;
// 13–19 cifras sueltas (no pegadas a letras, «_» ni «/», como en `migrations/20261009103000_x.sql`) que pasan el dígito de control,
// o cuatro grupos de cuatro aunque no lo pasen. La versión de una migración (AAAAMMDDhhmmss) y la tarjeta de prueba de Stripe no cuentan.
function pareceTarjeta(texto) {
  return (texto.match(/(?<![\w/])\d(?:[ .-]?\d){12,18}(?!\w)/g) ?? []).some((c) => {
    const d = c.replace(/\D/g, '');
    if (d === '4242424242424242' || FECHA_HORA.test(d)) return false;
    return luhn(d) || /^\d{4}(?:[ .-]\d{4}){3}$/.test(c);
  });
}

const QUE_REGLAS = String.raw`(?:instrucciones|reglas|normas|l[ií]mites|restricciones|filtros?|n[uú]cleo|prompt)`;
const CAMBIAR_REGLAS = new RegExp([
  String.raw`\binstrucci[oó]n(?:es)? de sistema\b`,
  String.raw`\b(?:ign[oó]r|olv[ií]d|s[aá]lt|desactiv|anul|incumpl)[\s\S]{0,36}\b${QUE_REGLAS}\b`,
  String.raw`\bno (?:hagas caso|sigas|cumplas|obedezcas)\b[\s\S]{0,30}\b${QUE_REGLAS}\b`,
  String.raw`\b(?:cambi|modific|reescrib|actualiz|edit|sustitu|borr)[\s\S]{0,36}\b(?:tus (?:instrucciones|reglas|normas|l[ií]mites|restricciones)|tu (?:prompt|n[uú]cleo|rol)\b|el n[uú]cleo\b|prompt\.md)`,
  String.raw`\b(?:a partir de ahora|de ahora en adelante|desde ahora)\b[\s\S]{0,40}\b(?:eres|tu rol|tus reglas|tus instrucciones|tus normas|obedece)`,
  String.raw`\bmodo (?:desarrollador|dios|sin restricciones)\b`,
  String.raw`\bnuevo n[uú]cleo\b`,
].join('|'), 'i');

const VERBO_DINERO = String.raw`(?:pag(?:a|ar|as|ue|ues|uen)|abon(?:a|ar|e)|cobr(?:a|ar|as|e|es|en)|contrat(?:a|ar|as|e|es|en)|compr(?:a|ar|as|e|es|en)|suscr[ií]b(?:e|ir|a|as|ete|irte|eme|irme)|reembols(?:o|a|ar|e|es)|ren(?:ueva|ovar|ueve)|transf(?:iere|erir|iera)|donar?|date de alta|upgrade)`;
const QUE_DINERO = String.raw`(?:\d+(?:[.,]\d+)?\s?(?:€|euros?|\$|usd|d[oó]lares)|[€$]\s?\d|\b(?:plan|licencia|dominio|api|servicio|suscripci[oó]n|factura|recibo|cuota|cr[eé]ditos?|hosting|servidor|tarjeta)\b)`;
const DINERO = new RegExp([
  String.raw`\b${VERBO_DINERO}\b[\s\S]{0,40}${QUE_DINERO}`,
  String.raw`\bplan de pago\b`,
  String.raw`\b(?:haz|hacer|emite|emitir|tramita|tramitar)\b[\s\S]{0,20}\b(?:reembolso|devoluci[oó]n del dinero|transferencia|bizum|pago)\b`,
].join('|'), 'i');

export function reglasDuras(texto = '') {
  if (SECRETO.test(texto) || tokenOpaco(texto)) return { ruta: 'para_claude', motivo: 'La orden contiene algo que parece una llave o un token. No la he leído con ninguna IA ni la he copiado a ningún registro.' };
  if (pareceTarjeta(texto)) return { ruta: 'para_claude', motivo: 'La orden contiene una secuencia que parece un número de tarjeta. No la he leído con ninguna IA ni la he copiado a ningún registro.' };
  if (CAMBIAR_REGLAS.test(texto)) return { ruta: 'para_claude', motivo: 'Pide cambiar mis instrucciones o mis límites. Eso solo se cambia por PR de Kristian (el NÚCLEO es inmutable para mí), así que no lo hago desde un mensaje.' };
  if (DINERO.test(texto)) return { ruta: 'para_claude', motivo: 'Implica pagar, contratar o mover dinero. No puedo hacerlo: lo decide Kristian y lo hace él o Claude con su OK.' };
  return null;
}

// Una respuesta de charla solo sale si es corta, sin promesas de salud, sin dosis y sin afirmar que se ha hecho algo.
export function respuestaSegura(texto = '') {
  const t = String(texto).trim();
  if (t.length < 2 || t.length > 400) return false;
  if (!revisarClaims(t).ok || esDosis(t)) return false;
  if (/\b(?:he|ya)\s+(?:publicad|cambiad|arreglad|desplegad|borrad|creado|hecho|enviad|pagad)/i.test(t)) return false;
  if (/https?:\/\/|\d{4,}/.test(t)) return false;
  return true;
}

// Devuelve { ruta: 'responder' | 'cloud' | 'para_claude', respuesta?, motivo?, motor?, intentos? }.
// `limiteMs`: el worker espera 12 s a kimiko-orden; si los motores tardan más, la orden va a Kimiko Cloud y la respuesta tardía
// se descarta (así nunca responden los dos a la vez).
export async function decidirRuta({ texto, env, fetchImpl = fetch, limiteMs = 9000 }) {
  const nota = String(texto ?? '').trim();
  if (!nota) return { ruta: 'cloud', motivo: 'sin texto (probablemente una foto)' };
  const dura = reglasDuras(nota);
  if (dura) return dura;
  if (nota.length > 600) return { ruta: 'cloud', motivo: 'orden larga: la lee Kimiko Cloud' };
  let reloj;
  try {
    const r = await Promise.race([
      generarJSONMotores({
        privacidad: 'privado', env, fetchImpl, system: SISTEMA, user: nota.slice(0, 600), schema: ESQUEMA_TRIAJE,
        validar: (d) => (['conversacion', 'accion', 'salud'].includes(d?.tipo) ? null : 'tipo no válido'),
      }),
      new Promise((ok) => { reloj = setTimeout(() => ok(null), limiteMs); }),
    ]);
    if (!r) return { ruta: 'cloud', motivo: 'los motores gratuitos tardan demasiado: la lee Kimiko Cloud' };
    if (r.datos.tipo === 'conversacion' && respuestaSegura(r.datos.respuesta)) {
      return { ruta: 'responder', respuesta: r.datos.respuesta.trim(), motor: r.motor, intentos: r.intentos };
    }
    return { ruta: 'cloud', motivo: `clasificada como ${r.datos.tipo}`, motor: r.motor, intentos: r.intentos };
  } catch (e) {
    return { ruta: 'cloud', motivo: 'ningún motor gratuito pudo clasificarla', intentos: e.intentos ?? [] };
  } finally {
    clearTimeout(reloj);
  }
}
