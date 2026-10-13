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
const SECRETO = /\b(?:sk-[A-Za-z0-9_-]{16,}|sb_(?:secret|publishable)_[A-Za-z0-9_-]{8,}|gh[pous]_[A-Za-z0-9]{20,}|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}|AKIA[0-9A-Z]{12,})/;
const TARJETA = /(?:\d[ -]?){13,19}/;
const CAMBIAR_REGLAS = /\binstrucci[oó]n(?:es)? de sistema\b|\b(?:ignora|olvida|salta|desactiva)\b.{0,30}\b(?:instrucciones|reglas|l[ií]mites|filtro)\b|\bmodo (?:desarrollador|dios|sin restricciones)\b|\bnuevo n[uú]cleo\b/i;
const DINERO = /\b(?:paga|pagar|cobra|cobrar|contrata|contratar|compra|comprar|suscr[ií]be|suscribirte|reembols[oa]r?)\b.{0,40}\b(?:\d|€|euros?|plan|licencia|dominio|api|servicio)/i;

export function reglasDuras(texto = '') {
  if (SECRETO.test(texto)) return { ruta: 'para_claude', motivo: 'La orden contiene algo que parece una llave o un token. No la he leído con ninguna IA ni la he copiado a ningún registro.' };
  if (TARJETA.test(texto.replace(/\b4242[ -]?4242[ -]?4242[ -]?4242\b/g, ''))) return { ruta: 'para_claude', motivo: 'La orden contiene una secuencia que parece un número de tarjeta. No la he leído con ninguna IA ni la he copiado a ningún registro.' };
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
export async function decidirRuta({ texto, env, fetchImpl = fetch }) {
  const nota = String(texto ?? '').trim();
  if (!nota) return { ruta: 'cloud', motivo: 'sin texto (probablemente una foto)' };
  const dura = reglasDuras(nota);
  if (dura) return dura;
  if (nota.length > 600) return { ruta: 'cloud', motivo: 'orden larga: la lee Kimiko Cloud' };
  try {
    const r = await generarJSONMotores({
      privacidad: 'privado', env, fetchImpl, system: SISTEMA, user: nota.slice(0, 600), schema: ESQUEMA_TRIAJE,
      validar: (d) => (['conversacion', 'accion', 'salud'].includes(d?.tipo) ? null : 'tipo no válido'),
    });
    if (r.datos.tipo === 'conversacion' && respuestaSegura(r.datos.respuesta)) {
      return { ruta: 'responder', respuesta: r.datos.respuesta.trim(), motor: r.motor, intentos: r.intentos };
    }
    return { ruta: 'cloud', motivo: `clasificada como ${r.datos.tipo}`, motor: r.motor, intentos: r.intentos };
  } catch (e) {
    return { ruta: 'cloud', motivo: 'ningún motor gratuito pudo clasificarla', intentos: e.intentos ?? [] };
  }
}
