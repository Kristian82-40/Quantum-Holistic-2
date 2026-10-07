// Bóveda de llaves "de conocimiento cero": se cifra en el dispositivo con una frase maestra
// (PBKDF2 + AES-GCM, WebCrypto). El servidor solo guarda texto cifrado: sin la frase, no hay nada que robar.
// Si se pierde la frase maestra, NO hay recuperación. Guárdala en dos lugares físicos.
// Funciona igual en el navegador/iPhone, Cloudflare Workers y Node 20+.

const enc = new TextEncoder();
const dec = new TextDecoder();
const aB64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const deB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const ITERACIONES = 600000;

async function derivar(frase, salt, iteraciones) {
  const base = await crypto.subtle.importKey('raw', enc.encode(frase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: iteraciones, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'],
  );
}

// "ranura" ata el texto cifrado a su sitio (p. ej. "qh/anthropic/clave-principal"): no se puede mover a otro.
export async function sellar(frase, secreto, ranura) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const clave = await derivar(frase, salt, ITERACIONES);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: enc.encode(ranura) }, clave, enc.encode(secreto));
  return { v: 1, kdf: 'PBKDF2-SHA256', it: ITERACIONES, salt: aB64(salt), iv: aB64(iv), ct: aB64(ct) };
}

export async function abrir(frase, sobre, ranura) {
  const clave = await derivar(frase, deB64(sobre.salt), sobre.it);
  const claro = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: deB64(sobre.iv), additionalData: enc.encode(ranura) }, clave, deB64(sobre.ct),
  );
  return dec.decode(claro);
}

// Avisos de rotación: llaves más antiguas que su plazo.
export function vencimientos(items, hoy = new Date()) {
  return items
    .map((i) => ({ ...i, dias: Math.floor((hoy - new Date(i.actualizado_at)) / 86400000) }))
    .filter((i) => i.dias >= (i.rota_cada_dias ?? 90))
    .map((i) => ({ project_id: i.project_id, servicio: i.servicio, etiqueta: i.etiqueta, dias: i.dias }));
}

// Avisos de caducidad para el resumen diario: llaves que caducan en <= antelacion días (o ya caducadas).
// Usa caduca_at si existe; si no, la fecha de alta más su plazo de rotación.
export function avisosCaducidad(items, hoy = new Date(), antelacion = 10) {
  return items
    .map((i) => {
      const limite = i.caduca_at ? new Date(i.caduca_at) : new Date(new Date(i.actualizado_at).getTime() + (i.rota_cada_dias ?? 90) * 86400000);
      return { project_id: i.project_id, etiqueta: i.etiqueta, ultimos4: i.ultimos4 || null, dias: Math.ceil((limite - hoy) / 86400000) };
    })
    .filter((i) => i.dias <= antelacion)
    .map((i) => ({ ...i, texto: `🔑 ${i.project_id} · ${i.etiqueta}${i.ultimos4 ? ` (…${i.ultimos4})` : ''}: ${i.dias > 0 ? `caduca en ${i.dias} día(s)` : 'CADUCADA, rótala'}` }));
}

export const exportarCifrado = (items) => JSON.stringify({ formato: 'kimiko-vault-v1', items }, null, 2);
