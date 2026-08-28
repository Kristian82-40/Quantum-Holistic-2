import { env } from './env.js';

// Acceso a Supabase por REST (sin dependencias npm: menos piezas que se rompan).
async function sb(path, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: env.SUPABASE_SERVICE_KEY,
      authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'content-type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase ${method} ${path}: ${text}`);
  return text ? JSON.parse(text) : null;
}

// --- Anti-duplicados: Telegram reenvía el mismo update si tardamos en responder ---
export async function yaProcesado(updateId) {
  try {
    await sb('kimiko_updates', {
      method: 'POST',
      body: [{ update_id: updateId }],
      headers: { prefer: 'return=minimal' },
    });
    return false; // se ha insertado → es nuevo
  } catch (e) {
    if (String(e).includes('duplicate key')) return true;
    return false; // si la tabla falla, preferimos procesar antes que perder el mensaje
  }
}

// --- Borradores de publicación ---
export async function crearBorrador(row) {
  const [d] = await sb('kimiko_drafts', {
    method: 'POST',
    body: [row],
    headers: { prefer: 'return=representation' },
  });
  return d;
}

export async function leerBorrador(id) {
  const rows = await sb(`kimiko_drafts?id=eq.${id}&select=*`);
  return rows[0] || null;
}

export async function actualizarBorrador(id, patch) {
  const [d] = await sb(`kimiko_drafts?id=eq.${id}`, {
    method: 'PATCH',
    body: { ...patch, updated_at: new Date().toISOString() },
    headers: { prefer: 'return=representation' },
  });
  return d;
}

// --- Aprendizajes: lo que Kimiko va acumulando sobre la marca ---
export async function guardarAprendizaje(texto) {
  await sb('kimiko_learnings', { method: 'POST', body: [{ texto }], headers: { prefer: 'return=minimal' } });
}

export async function leerAprendizajes(limite = 40) {
  const rows = await sb(`kimiko_learnings?select=texto&order=created_at.desc&limit=${limite}`);
  return rows.map((r) => r.texto);
}

// --- Configuración viva (el token de Instagram rotado) ---
export async function leerConfig(clave) {
  const rows = await sb(`kimiko_config?clave=eq.${clave}&select=valor,caduca_en`);
  return rows[0] || null;
}

export async function guardarConfig(clave, valor, caduca_en = null) {
  await sb('kimiko_config', {
    method: 'POST',
    body: [{ clave, valor, caduca_en, updated_at: new Date().toISOString() }],
    headers: { prefer: 'resolution=merge-duplicates,return=minimal' },
  });
}

// --- Almacén de imágenes (Instagram necesita una URL pública) ---
export async function subirImagen(buffer, mime) {
  const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
  const nombre = `posts/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const res = await fetch(`${env.SUPABASE_URL}/storage/v1/object/${env.BUCKET}/${nombre}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'content-type': mime,
      'cache-control': '3600',
    },
    body: buffer,
  });
  if (!res.ok) throw new Error(`Subida a Storage falló: ${await res.text()}`);
  return `${env.SUPABASE_URL}/storage/v1/object/public/${env.BUCKET}/${nombre}`;
}
