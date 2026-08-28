// Vigilante semanal. Vercel lo llama solo (ver "crons" en vercel.json).
// Avisa a Kristian por Telegram ANTES de que algo se caiga, no después.

import { env } from '../../lib/env.js';
import { tg } from '../../lib/telegram.js';
import { estadoToken, renovarToken } from '../../lib/instagram.js';
import { limpiar, registrar } from '../../lib/seguridad.js';

export default async function handler(req, res) {
  // Vercel firma sus crons con CRON_SECRET. Si está puesto, nadie más entra.
  const esperado = process.env.CRON_SECRET;
  if (esperado && req.headers.authorization !== `Bearer ${esperado}`) {
    return res.status(401).send('no');
  }
  if (!env.OWNER_CHAT_ID) return res.status(200).json({ ok: false, motivo: 'sin chat de destino' });

  const avisos = [];

  // ── Instagram: se renueva solo antes de caducar ─────────────
  try {
    const t = await estadoToken();

    if (!t.valido) {
      avisos.push('🔴 El token de Instagram ya no vale. Kimiko no puede publicar hasta que lo renueves a mano.');
    } else if (!t.permanente && t.dias <= 20) {
      // No esperamos a que caduque: lo cambiamos por uno nuevo ahora.
      try {
        const nuevo = await renovarToken();
        avisos.push(`🔄 Token de Instagram renovado solo. Vale ${nuevo.dias ?? '∞'} días más. No tienes que hacer nada.`);
      } catch (e) {
        avisos.push(`🟠 El token caduca en ${t.dias} día${t.dias === 1 ? '' : 's'} y no he podido renovarlo: ${limpiar(e.message).slice(0, 200)}`);
      }
    }
    const faltan = ['instagram_basic', 'instagram_content_publish'].filter((p) => t.permisos.length && !t.permisos.includes(p));
    if (faltan.length) avisos.push(`🟠 Al token le faltan permisos: ${faltan.join(', ')}`);
  } catch (e) {
    avisos.push(`🔴 No he podido comprobar Instagram: ${limpiar(e.message).slice(0, 200)}`);
  }

  // ── Llaves ausentes ─────────────────────────────────────────
  const faltantes = [
    ['ANTHROPIC_API_KEY', env.ANTHROPIC_KEY],
    ['SUPABASE_SERVICE_ROLE_KEY', env.SUPABASE_SERVICE_KEY],
    ['TELEGRAM_WEBHOOK_SECRET', env.TG_SECRET],
  ].filter(([, v]) => !v).map(([k]) => k);
  if (faltantes.length) avisos.push(`🟠 Faltan variables en Vercel: ${faltantes.join(', ')}`);

  try {
    if (avisos.length) {
      await tg.sendMessage(env.OWNER_CHAT_ID, `🩺 <b>Revisión semanal de Kimiko</b>\n\n${avisos.join('\n\n')}`);
    }
    // Si todo está bien, no te molesta. El silencio es la buena noticia.
  } catch (e) {
    registrar(e);
  }

  return res.status(200).json({ ok: true, avisos: avisos.length });
}
