// kimiko-diario: el trabajo diario de Kimiko (borrador del blog + pieza de redes + vigilancia + avisos) en Supabase.
// Lo dispara pg_cron cada día a las 06:00 UTC con la cabecera x-kimiko-secreto (secreto en Vault y en los secretos de la función).
// El worker de Cloudflare queda solo para el webhook de Telegram (en Free no caben los ~29 ms de CPU de este trabajo).
// El código vive en lib/ y src/ del repo; scripts/preparar-supabase.sh lo copia a ../_kimiko antes de desplegar.
import { ejecutarDia } from '../_kimiko/src/runner.js';
import { crearDb } from '../_kimiko/lib/db.js';
import { iaRest } from '../_kimiko/lib/ia-rest.js';
import { fichaSVG, BUCKET_BLOG } from '../_kimiko/lib/imagen.js';
import { generarImagen } from '../_kimiko/lib/ia.js';
import { promptImagen } from '../_kimiko/lib/blog.js';
import { enviarMensaje, BOTONES_PR, enviarVideo, pieReel } from '../_kimiko/lib/telegram.js';
import { chequeoDiario, textoChequeo } from '../_kimiko/lib/chequeo.js';
import { auditar, textoAuditoria } from '../_kimiko/lib/auditoria.js';
import { leerRunbook, tareaActiva } from '../_kimiko/lib/runbook.js';
import config from '../_kimiko/config/projects.json' with { type: 'json' };

const json = (d: unknown, status = 200) => new Response(JSON.stringify(d, null, 2), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

// La llave secreta "kimiko" (sb_secret_) la inyecta Supabase en SUPABASE_SECRET_KEYS; si no, la de servicio.
function llaveSecreta(): string {
  try {
    const m = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}');
    const v = m.kimiko ?? m.default ?? Object.values(m)[0];
    if (typeof v === 'string' && v) return v;
  } catch { /* formato inesperado: se usa la de respaldo */ }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
}

async function igualSeguro(a: string, b: string) {
  const enc = new TextEncoder();
  const [x, y] = (await Promise.all([crypto.subtle.digest('SHA-256', enc.encode(a)), crypto.subtle.digest('SHA-256', enc.encode(b))])).map((h) => new Uint8Array(h));
  let dif = 0;
  for (let i = 0; i < x.length; i++) dif |= x[i] ^ y[i];
  return dif === 0;
}

// Solo una llave secreta o de servicio puede leer el endpoint de admin de Auth (mismo método que kimiko-imagen).
async function esLlaveDeServicio(req: Request): Promise<boolean> {
  const llave = req.headers.get('apikey') ?? (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!llave || llave.length < 20) return false;
  const r = await fetch(`${Deno.env.get('SUPABASE_URL')}/auth/v1/admin/users?per_page=1`, { headers: { apikey: llave, authorization: `Bearer ${llave}` } });
  await r.body?.cancel();
  return r.ok;
}

Deno.serve(async (req) => {
  const secreto = Deno.env.get('KIMIKO_CRON_SECRETO') ?? '';
  if (req.method !== 'POST') return json({ error: 'usa POST' }, 405);
  const porSecreto = !!secreto && (await igualSeguro(req.headers.get('x-kimiko-secreto') ?? '', secreto));
  const p = await req.json().catch(() => ({})) as Record<string, unknown>;
  // GitHub Actions solo puede pedir 'avisar-ci' (vigilancia) y 'enviar-reel' (kimiko-reel), con la llave de servicio.
  if (!porSecreto && !(['avisar-ci', 'enviar-reel'].includes(String(p.accion)) && (await esLlaveDeServicio(req)))) return json({ error: 'no autorizado' }, 401);
  const env = Deno.env.toObject();

  // Aviso de GitHub Actions (gitleaks, Lighthouse, Dependabot) a Telegram. Texto recortado y marcado como de CI.
  if (p.accion === 'avisar-ci') {
    const texto = `⚙️ GitHub · ${String(p.titulo ?? 'vigilancia').slice(0, 80)}\n${String(p.texto ?? '').slice(0, 1500)}${typeof p.url === 'string' && p.url.startsWith('https://github.com/') ? `\n${p.url}` : ''}`;
    const r = await enviarMensaje({ token: env.TELEGRAM_BOT_TOKEN, chatId: env.TELEGRAM_CHAT_ID, texto });
    return json({ telegram: r.ok ? 'enviado' : r.error }, r.ok ? 200 : 502);
  }
  const db = crearDb({ url: env.SUPABASE_URL, serviceKey: llaveSecreta() });

  // Reel del día: lo monta GitHub Actions (kimiko-reel) y aquí solo se manda a Telegram, una vez.
  if (p.accion === 'enviar-reel' && typeof p.id === 'string' && /^[0-9a-f-]{36}$/.test(p.id)) {
    const [c] = await db.seleccionar('kimiko_content', `id=eq.${p.id}&select=id,titular,copy,hashtags,reel_url,reel_enviado_at,blog_post_id`);
    if (!c?.reel_url) return json({ error: 'sin reel' }, 404);
    if (c.reel_enviado_at && !p.forzar) return json({ omitido: 'ya enviado' });
    const [b] = c.blog_post_id ? await db.seleccionar('blog_posts', `id=eq.${c.blog_post_id}&select=slug,published`) : [];
    const r = await enviarVideo({ token: env.TELEGRAM_BOT_TOKEN, chatId: env.TELEGRAM_CHAT_ID, videoUrl: c.reel_url, pie: pieReel({ ...c, slug: b?.published ? b.slug : null }) });
    if (r.ok) await db.actualizar('kimiko_content', `id=eq.${c.id}`, { reel_enviado_at: new Date().toISOString() });
    await db.insertar('kimiko_updates', { tipo: 'reel', project_id: 'qh', ok: r.ok, detalle: { id: c.id, url: c.reel_url, telegram: r.ok ? 'enviado' : r.error } }).catch(() => {});
    return json({ telegram: r.ok ? 'enviado' : r.error }, r.ok ? 200 : 502);
  }
  // Versiones de prueba de la imagen de una planta (1–3) con el prompt del blog: Kristian las ve en Telegram y elige.
  // No toca ningún post; aplicar la elegida es un UPDATE aparte de blog_posts.image_url.
  if (p.accion === 'probar-imagen' && typeof p.nombre_botanico === 'string' && typeof p.escena_en === 'string') {
    const n = Math.min(Math.max(Number(p.n) || 2, 1), 3);
    const prompt = promptImagen(null, { nombre_botanico: p.nombre_botanico.slice(0, 80), prompt_imagen_en: p.escena_en.slice(0, 600) }, { paleta: String(p.paleta ?? '') });
    const ai = iaRest({ accountId: env.CF_ACCOUNT_ID, token: env.CF_AI_TOKEN });
    const base = `pruebas/${p.nombre_botanico.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '')}-${Date.now().toString(36)}`;
    const urls: string[] = [];
    for (let i = 0; i < n; i++) {
      try {
        const img = await generarImagen({ ai, prompt });
        urls.push(db.urlPublica(BUCKET_BLOG, await db.subir(BUCKET_BLOG, `${base}-${'abc'[i]}.${img.ext}`, img.bytes, img.mime)));
      } catch (e) { urls.push(`(falló: ${(e as Error).message.slice(0, 120)})`); }
    }
    const texto = [`🎨 Imagen de prueba · ${p.nombre_botanico}`, ...urls.map((u, i) => `${'abc'[i]}: ${u}`), '', 'Dime qué letra te gusta (o «ninguna») y la pongo en el post.'].join('\n');
    if (p.avisar !== false) await enviarMensaje({ token: env.TELEGRAM_BOT_TOKEN, chatId: env.TELEGRAM_CHAT_ID, texto, teclado: undefined });
    return json({ prompt, urls });
  }
  if (p.accion === 'probar-ficha') {
    const r = await db.fichaPNG(fichaSVG({ titulo: 'Manzanilla', subtitulo: 'Matricaria chamomilla', pie: 'quantum-holistic.com' }), `pruebas/ficha-${Date.now()}.png`);
    return json({ ruta: r, url: db.urlPublica(BUCKET_BLOG, r) });
  }
  // Aviso de Kimiko Cloud: lo dispara el trigger de kimiko_drafts al cambiar a hecho / bloqueado / pr_abierto.
  if (p.accion === 'avisar-orden' && typeof p.id === 'string') {
    const [o] = await db.seleccionar('kimiko_drafts', `id=eq.${p.id}&select=id,status,copy,pr_numero,pr_url,source_note,avisado_at`);
    if (!o || o.avisado_at) return json({ omitido: true });
    const icono = { hecho: '✅', bloqueado: '⛔', pr_abierto: '🔀' }[o.status as string] ?? 'ℹ️';
    const texto = [`${icono} Kimiko Cloud · ${o.status}`, `Orden: ${String(o.source_note ?? '(foto)').slice(0, 200)}`, '', String(o.copy ?? 'Sin resumen'), o.pr_url ? `\nPR: ${o.pr_url}` : ''].join('\n');
    const r = await enviarMensaje({ token: env.TELEGRAM_BOT_TOKEN, chatId: env.TELEGRAM_CHAT_ID, texto, teclado: o.status === 'pr_abierto' && o.pr_numero ? BOTONES_PR(o.id, o.pr_numero) : undefined });
    await db.actualizar('kimiko_drafts', `id=eq.${o.id}`, { avisado_at: new Date().toISOString() });
    return json({ telegram: r.ok ? 'enviado' : r.error });
  }
  if (p.accion === 'diag') {
    let formato = 'ausente';
    try { const m = JSON.parse(env.SUPABASE_SECRET_KEYS ?? ''); formato = Array.isArray(m) ? 'lista' : `objeto: ${Object.keys(m).join(', ')}`; } catch { formato = env.SUPABASE_SECRET_KEYS ? 'no-json' : 'ausente'; }
    return json({ secret_keys: formato, gemini: !!env.GEMINI_API_KEY, telegram: !!env.TELEGRAM_BOT_TOKEN && !!env.TELEGRAM_CHAT_ID, workers_ai: !!env.CF_AI_TOKEN && !!env.CF_ACCOUNT_ID, groq: !!env.GROQ_API_KEY });
  }
  // Chequeo suelto (B3), sin escribir el post. avisar=true lo manda también a Telegram.
  if (p.accion === 'chequeo') {
    const proyecto = config.proyectos[0];
    const fecha = new Date().toISOString().slice(0, 10);
    const c = await chequeoDiario({ env, db, sitio: proyecto.sitio, fecha });
    await db.insertar('kimiko_updates', { tipo: 'chequeo', project_id: proyecto.id, ok: c.ok, detalle: { fecha, fallos: c.fallos, ...c.datos, origen: 'manual' } }).catch(() => {});
    if (p.avisar) await enviarMensaje({ token: env.TELEGRAM_BOT_TOKEN, chatId: env.TELEGRAM_CHAT_ID, texto: textoChequeo(c, fecha) });
    return json(c);
  }
  // Auditoría semanal (B4): la lanza el cron kimiko-auditoria los domingos o /auditar desde Telegram.
  if (p.accion === 'auditoria') {
    const fecha = new Date().toISOString().slice(0, 10);
    if (p.origen === 'cron' && !tareaActiva(await leerRunbook(db), 'auditoria-semanal')) return json({ omitido: 'auditoria-semanal en pausa' });
    try {
      const a = await auditar({ db });
      await db.insertar('kimiko_updates', { tipo: 'auditoria', project_id: 'qh', ok: a.ok, detalle: { fecha, origen: String(p.origen || 'manual'), hallazgos: a.hallazgos } }).catch(() => {});
      const tg = await enviarMensaje({ token: env.TELEGRAM_BOT_TOKEN, chatId: env.TELEGRAM_CHAT_ID, texto: textoAuditoria(a, fecha) });
      return json({ ...a, telegram: tg.ok ? 'enviado' : tg.error });
    } catch (e) {
      await enviarMensaje({ token: env.TELEGRAM_BOT_TOKEN, chatId: env.TELEGRAM_CHAT_ID, texto: `❌ Auditoría ${fecha}: ${(e as Error).message}` });
      return json({ error: (e as Error).message }, 500);
    }
  }

  const trabajo = ejecutarDia({
    env, ai: iaRest({ accountId: env.CF_ACCOUNT_ID, token: env.CF_AI_TOKEN }), proyectos: config.proyectos,
    fecha: typeof p.fecha === 'string' ? p.fecha : new Date().toISOString().slice(0, 10), db,
    opciones: { forzarError: !!p.forzar_error, forzarFicha: !!p.forzar_ficha, slot: Number(p.slot || 1), origen: String(p.origen || 'manual') },
  });
  if (p.esperar) return json(await trabajo);
  // pg_net corta a los pocos segundos: se responde ya y el trabajo sigue en segundo plano (hasta 150 s en el plan Free).
  // @ts-ignore EdgeRuntime existe en Supabase
  EdgeRuntime.waitUntil(trabajo.catch((e: Error) => console.error('kimiko-diario:', e.message)));
  return json({ aceptado: true }, 202);
});
