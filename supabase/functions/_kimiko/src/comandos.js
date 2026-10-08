// Comandos de Telegram (B7): /estado, /auditar y /manual. Solo lectura y sin IA; los atiende el worker.
import { auditar, textoAuditoria } from '../lib/auditoria.js';
import { leerRunbook, textoManual } from '../lib/runbook.js';

export const URL_ESTADO = 'https://raw.githubusercontent.com/Kristian82-40/Quantum-Holistic-2/main/ESTADO.md';
export const AYUDA = '🌿 Comandos de Kimiko\n/estado — resumen de ESTADO.md y del último chequeo\n/auditar — auditoría de integridad ahora\n/manual — tareas del manual\nCualquier otro mensaje es una orden para Kimiko Cloud.';

// Resumen de ESTADO.md: fecha de revisión, recuento por icono y las filas rotas (❌).
export function resumirEstado(md = '') {
  const revision = md.match(/\*\*Última revisión:\*\*\s*([^\n·]+)/)?.[1]?.trim() ?? '¿?';
  const filas = md.split('\n').filter((l) => /^\|\s*(✅|⚠️|❌|❓)\s*\|/.test(l));
  const icono = (l) => l.match(/^\|\s*(✅|⚠️|❌|❓)/)[1];
  const cuenta = (i) => filas.filter((l) => icono(l) === i).length;
  const rotas = filas.filter((l) => icono(l) === '❌').map((l) => `• ${l.split('|')[2].trim().replace(/\*\*/g, '').slice(0, 140)}`);
  return [`📋 ESTADO.md (revisado ${revision})`, `✅ ${cuenta('✅')} · ⚠️ ${cuenta('⚠️')} · ❌ ${cuenta('❌')} · ❓ ${cuenta('❓')}`, ...(rotas.length ? ['Roto:', ...rotas] : [])].join('\n');
}

async function estado({ db, fetchImpl, hoy }) {
  const partes = [];
  try {
    const r = await fetchImpl(URL_ESTADO, { signal: AbortSignal.timeout(8000) });
    partes.push(r.ok ? resumirEstado(await r.text()) : `📋 No pude leer ESTADO.md (${r.status})`);
  } catch (e) { partes.push(`📋 No pude leer ESTADO.md (${e.message})`); }
  try {
    const [c] = await db.seleccionar('kimiko_updates', 'tipo=eq.chequeo&select=created_at,ok,detalle&order=created_at.desc&limit=1');
    partes.push(!c ? '🩺 Aún no hay chequeos' : c.ok ? `🩺 Último chequeo (${c.created_at.slice(0, 16).replace('T', ' ')} UTC): todo en orden`
      : [`🩺 Último chequeo (${c.created_at.slice(0, 16).replace('T', ' ')} UTC):`, ...(c.detalle?.fallos || []).map((f) => `• ${f.que}`)].join('\n'));
    const piezas = await db.seleccionar('kimiko_content', `fecha=eq.${hoy}&select=estado,titular`);
    partes.push(piezas.length ? `📝 Hoy: ${piezas.map((p) => `"${p.titular}" (${p.estado})`).join(', ')}` : '📝 Hoy aún no hay borrador');
  } catch (e) { partes.push(`❌ Supabase: ${e.message}`); }
  return partes.join('\n\n');
}

// Devuelve el texto de respuesta para un comando. Lo que no es comando conocido → ayuda.
export async function atenderComando({ texto, db, fetchImpl = fetch, hoy = new Date().toISOString().slice(0, 10) }) {
  const cmd = String(texto).trim().split(/\s+/)[0].toLowerCase().replace(/@.*$/, '');
  if (cmd === '/estado') return estado({ db, fetchImpl, hoy });
  if (cmd === '/manual') return textoManual(await leerRunbook(db));
  if (cmd === '/auditar') {
    let a;
    try { a = await auditar({ db }); } catch (e) { return `❌ No pude auditar: ${e.message}`; }
    await db.insertar('kimiko_updates', { tipo: 'auditoria', project_id: 'qh', ok: a.ok, detalle: { fecha: hoy, origen: 'telegram', hallazgos: a.hallazgos } }).catch(() => {});
    return textoAuditoria(a, hoy);
  }
  return AYUDA;
}
