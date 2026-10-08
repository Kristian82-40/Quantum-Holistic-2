// Chequeo diario ANTES del post (B3): llaves, cupo, web y crons. Sin IA: solo llamadas que no gastan cupo de generación.
// Devuelve { ok, fallos: [{ que, accion }], datos }. Cada fallo trae la acción exacta para Kristian (desde el móvil).
export const RUTAS_WEB = ['/', '/blog', '/diccionario', '/terapeutas', '/login'];
export const CUPO_NEURONAS = 10000;
const SECRETOS = 'Supabase → Edge Functions → Secrets';

async function pedir(fetchImpl, url, opciones = {}, limiteMs = 10000) {
  try {
    const r = await fetchImpl(url, { ...opciones, redirect: 'follow', signal: AbortSignal.timeout(limiteMs) });
    return { status: r.status };
  } catch (e) {
    return { status: 0, error: e.name === 'TimeoutError' ? `sin respuesta en ${limiteMs / 1000} s` : e.message };
  }
}

// Comprueba que cada llave existe y que el proveedor la acepta (listar modelos no gasta cupo).
async function llaves(env, fetchImpl) {
  const fallos = [];
  const motores = {};
  if (!env.GEMINI_API_KEY) fallos.push({ que: 'Falta GEMINI_API_KEY', accion: `Crea una llave en aistudio.google.com/apikey y pégala como GEMINI_API_KEY en ${SECRETOS}` });
  else {
    const r = await pedir(fetchImpl, 'https://generativelanguage.googleapis.com/v1beta/models?pageSize=1', { headers: { 'x-goog-api-key': env.GEMINI_API_KEY } });
    motores.gemini = r.status === 200;
    if (r.status === 400 || r.status === 401 || r.status === 403) fallos.push({ que: `Gemini rechaza la llave (${r.status})`, accion: `Genera otra en aistudio.google.com/apikey y sustituye GEMINI_API_KEY en ${SECRETOS}` });
  }
  if (!env.CF_ACCOUNT_ID || !env.CF_AI_TOKEN) fallos.push({ que: 'Faltan CF_ACCOUNT_ID o CF_AI_TOKEN (Workers AI)', accion: `Cloudflare → Mi perfil → API Tokens → plantilla "Workers AI". Pega el token como CF_AI_TOKEN y el Account ID como CF_ACCOUNT_ID en ${SECRETOS}` });
  else {
    const r = await pedir(fetchImpl, `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/ai/models/search?per_page=1`, { headers: { authorization: `Bearer ${env.CF_AI_TOKEN}` } });
    motores.workers_ai = r.status === 200;
    if (r.status === 401 || r.status === 403) fallos.push({ que: `Workers AI rechaza el token (${r.status})`, accion: `Crea otro token con la plantilla "Workers AI" y sustituye CF_AI_TOKEN en ${SECRETOS}` });
  }
  if (!env.GROQ_API_KEY) fallos.push({ que: 'Falta GROQ_API_KEY (tercer motor, gratis)', accion: `console.groq.com → API Keys → Create (sin tarjeta). Pégala como GROQ_API_KEY en ${SECRETOS}` });
  else {
    const r = await pedir(fetchImpl, 'https://api.groq.com/openai/v1/models', { headers: { authorization: `Bearer ${env.GROQ_API_KEY}` } });
    motores.groq = r.status === 200;
    if (r.status === 401 || r.status === 403) fallos.push({ que: `Groq rechaza la llave (${r.status})`, accion: `Crea otra en console.groq.com y sustituye GROQ_API_KEY en ${SECRETOS}` });
  }
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) fallos.push({ que: 'Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID', accion: `Pégalos en ${SECRETOS} (BotFather → /token)` });
  return { fallos, motores };
}

async function cupo(db, fecha) {
  const filas = await db.seleccionar('kimiko_updates', `tipo=eq.blog&created_at=gte.${fecha}T00:00:00Z&select=detalle`);
  const neuronas = filas.reduce((s, f) => s + Number(f.detalle?.neuronas || 0), 0);
  return { neuronas, fallos: neuronas >= CUPO_NEURONAS * 0.9 ? [{ que: `Workers AI: ${neuronas} de ${CUPO_NEURONAS} neuronas gastadas hoy`, accion: 'Nada que hacer: el cupo vuelve a las 00:00 UTC. Hoy tiran Gemini y Groq.' }] : [] };
}

async function web(sitio, fetchImpl) {
  const res = await Promise.all(RUTAS_WEB.map(async (ruta) => ({ ruta, ...(await pedir(fetchImpl, `${sitio}${ruta}`)) })));
  const malas = res.filter((r) => r.status !== 200);
  return { rutas: res, fallos: malas.map((r) => ({ que: `${sitio}${r.ruta} responde ${r.status || r.error}`, accion: 'Abre Vercel → quantum-holistic-2 → Deployments y mira el último despliegue; si está en Error, pulsa Redeploy del anterior que funcionaba' })) };
}

// kimiko_estado_crons(): función SQL (solo service_role) que lee cron.job y su última ejecución.
async function crons(db, ahora) {
  const filas = await db.rpc('kimiko_estado_crons');
  const fallos = [];
  for (const nombre of ['kimiko-diario', 'kimiko-reintento']) {
    const j = filas.find((f) => f.jobname === nombre);
    if (!j) fallos.push({ que: `No existe el cron ${nombre}`, accion: 'Pide a Claude Code que lo recree (está en supabase/migrations)' });
    else if (!j.active) fallos.push({ que: `El cron ${nombre} está desactivado`, accion: `Supabase → Integrations → Cron → ${nombre} → activar` });
    else if (j.ultimo_estado && j.ultimo_estado !== 'succeeded') fallos.push({ que: `La última ejecución de ${nombre} terminó en "${j.ultimo_estado}"`, accion: 'Supabase → Integrations → Cron → History: mira el mensaje de error' });
  }
  const diario = filas.find((f) => f.jobname === 'kimiko-diario');
  if (diario?.ultima_ejecucion && ahora - Date.parse(diario.ultima_ejecucion) > 26 * 3600 * 1000) fallos.push({ que: 'kimiko-diario no se ha ejecutado en más de 26 h', accion: 'Supabase → Integrations → Cron → kimiko-diario: comprueba que está activo' });
  return { crons: filas, fallos };
}

export async function chequeoDiario({ env, db, sitio, fecha, fetchImpl = fetch, ahora = Date.now() }) {
  const partes = await Promise.all([
    llaves(env, fetchImpl),
    cupo(db, fecha).catch((e) => ({ fallos: [{ que: `No pude leer el cupo: ${e.message}`, accion: 'Ninguna: se reintenta mañana' }] })),
    web(sitio, fetchImpl),
    crons(db, ahora).catch((e) => ({ fallos: [{ que: `No pude leer los crons: ${e.message}`, accion: 'Pide a Claude Code que revise la función kimiko_estado_crons' }] })),
  ]);
  const fallos = partes.flatMap((p) => p.fallos);
  const [k, c, w, cr] = partes;
  const datos = { motores: k.motores, neuronas_hoy: c.neuronas, rutas: w.rutas?.map((r) => `${r.ruta} ${r.status}`), crons: cr.crons };
  // Hay texto si al menos un motor contesta; si no, hoy saldrá la ficha sin IA.
  if (k.motores && !Object.values(k.motores).some(Boolean)) fallos.unshift({ que: 'Ningún motor de IA responde: hoy el post saldrá en modo sin IA (ficha de planta)', accion: 'Revisa las llaves de abajo' });
  return { ok: fallos.length === 0, fallos, datos };
}

export const textoChequeo = (c, fecha) => (c.ok
  ? `🩺 Chequeo ${fecha}: todo en orden (llaves, cupo, web y crons)`
  : [`🩺 Chequeo ${fecha}: ${c.fallos.length} cosa(s) que mirar`, ...c.fallos.map((f) => `• ${f.que}\n  → ${f.accion}`)].join('\n'));
