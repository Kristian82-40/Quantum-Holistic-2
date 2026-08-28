import { env } from './env.js';
import { leerConfig, guardarConfig } from './db.js';
import { registrarSecreto } from './seguridad.js';

// ─────────────────────────────────────────────────────────────
//  Instagram Graph API
//
//  Dos reglas de oro:
//  1. El token NUNCA viaja en la URL. Va en Authorization: Bearer.
//     Un token en la URL acaba escrito en logs de servidor y proxys.
//  2. El token vigente vive en la base de datos, no en la variable de
//     entorno. Así Kimiko puede renovarlo él solo antes de que caduque.
//     La variable de entorno es solo la semilla del primer arranque.
// ─────────────────────────────────────────────────────────────

const graph = (path, params = {}) => {
  const url = new URL(`https://graph.facebook.com/${env.GRAPH_VERSION}/${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url;
};

// Caché corta: una instancia de la función atiende varias peticiones seguidas.
let cache = { token: null, hasta: 0 };

export async function tokenVigente() {
  if (cache.token && Date.now() < cache.hasta) return cache.token;

  let token = env.IG_TOKEN;
  try {
    const fila = await leerConfig('ig_access_token');
    if (fila?.valor) token = fila.valor;
  } catch { /* si la tabla no responde, tiramos de la variable de entorno */ }

  registrarSecreto(token); // que nunca pueda escaparse por un mensaje de error
  cache = { token, hasta: Date.now() + 60_000 };
  return token;
}

async function graphFetch(path, { method = 'GET', params = {} } = {}) {
  const token = await tokenVigente();
  const res = await fetch(graph(path, params), {
    method,
    headers: { authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Instagram: ${json.error?.message || 'error desconocido'}`);
  return json;
}

// Publica una imagen única en el feed. La URL debe ser pública.
export async function publicarEnInstagram({ imageUrl, caption }) {
  const contenedor = await graphFetch(`${env.IG_USER_ID}/media`, {
    method: 'POST',
    params: { image_url: imageUrl, caption },
  });
  const publicado = await graphFetch(`${env.IG_USER_ID}/media_publish`, {
    method: 'POST',
    params: { creation_id: contenedor.id },
  });

  let permalink = null;
  try {
    permalink = (await graphFetch(publicado.id, { params: { fields: 'permalink' } })).permalink || null;
  } catch { /* el post ya está publicado; el enlace es un extra */ }

  return { id: publicado.id, permalink };
}

export async function comprobarInstagram() {
  return graphFetch(env.IG_USER_ID, { params: { fields: 'username,followers_count' } });
}

// Estado del token: válido, y cuántos días le quedan.
// expires_at = 0 significa que no caduca (token de Usuario del Sistema).
export async function estadoToken() {
  const json = await graphFetch('debug_token', { params: { input_token: await tokenVigente() } });
  const d = json.data;
  if (!d) throw new Error('no he podido leer el token');

  const caduca = d.expires_at || d.data_access_expires_at || 0;
  const dias = caduca ? Math.floor((caduca * 1000 - Date.now()) / 86400000) : null;

  return { valido: Boolean(d.is_valid), permanente: dias === null, dias, permisos: d.scopes || [] };
}

// Renueva el token de larga duración por otros ~60 días y lo guarda.
// Requiere FB_APP_ID y FB_APP_SECRET. Es lo que elimina la tarea recurrente.
export async function renovarToken() {
  if (!env.FB_APP_ID || !env.FB_APP_SECRET) {
    throw new Error('para renovar solo hacen falta FB_APP_ID y FB_APP_SECRET en Vercel');
  }

  const actual = await tokenVigente();
  // Este endpoint exige los parámetros en la URL: es el intercambio de credenciales,
  // no una llamada de datos. Por eso el secreto de la app solo se usa aquí.
  const url = graph('oauth/access_token', {
    grant_type: 'fb_exchange_token',
    client_id: env.FB_APP_ID,
    client_secret: env.FB_APP_SECRET,
    fb_exchange_token: actual,
  });

  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.access_token) {
    throw new Error(`No he podido renovar el token: ${json.error?.message || 'respuesta inesperada'}`);
  }

  const caduca = json.expires_in ? new Date(Date.now() + json.expires_in * 1000).toISOString() : null;
  await guardarConfig('ig_access_token', json.access_token, caduca);
  registrarSecreto(json.access_token);
  cache = { token: json.access_token, hasta: Date.now() + 60_000 };

  const dias = json.expires_in ? Math.floor(json.expires_in / 86400) : null;
  return { dias, permanente: dias === null };
}
