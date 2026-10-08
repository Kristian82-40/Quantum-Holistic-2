// kimiko-diario: el trabajo diario de Kimiko (borrador del blog + pieza de redes + vigilancia + avisos) en Supabase.
// Lo dispara pg_cron cada día a las 06:00 UTC con la cabecera x-kimiko-secreto (secreto en Vault y en los secretos de la función).
// El worker de Cloudflare queda solo para el webhook de Telegram (en Free no caben los ~29 ms de CPU de este trabajo).
// El código vive en lib/ y src/ del repo; scripts/preparar-supabase.sh lo copia a ../_kimiko antes de desplegar.
import { ejecutarDia } from '../_kimiko/src/runner.js';
import { crearDb } from '../_kimiko/lib/db.js';
import { iaRest } from '../_kimiko/lib/ia-rest.js';
import { fichaSVG, BUCKET_BLOG } from '../_kimiko/lib/imagen.js';
import { enviarMensaje, BOTONES_PR } from '../_kimiko/lib/telegram.js';
import { chequeoDiario, textoChequeo } from '../_kimiko/lib/chequeo.js';
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

Deno.serve(async (req) => {
  const secreto = Deno.env.get('KIMIKO_CRON_SECRETO') ?? '';
  if (req.method !== 'POST' || !secreto || !(await igualSeguro(req.headers.get('x-kimiko-secreto') ?? '', secreto))) {
    return json({ error: 'no autorizado' }, 401);
  }
  const p = await req.json().catch(() => ({})) as Record<string, unknown>;
  const env = Deno.env.toObject();
  const db = crearDb({ url: env.SUPABASE_URL, serviceKey: llaveSecreta() });

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
