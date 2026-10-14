// Publicación automática del post diario (14-oct). APAGADA por defecto: solo corre si kimiko_runbook tiene la tarea
// 'autopublicar' con activa = true. Si falta la fila o no se puede leer el runbook, NO publica (al revés que tareaActiva).
// Mismos controles que «✅ Publicar» (publicarPieza: qh-editorial + URL pública) y, antes, tres más: sin avisos del filtro
// legal, acuarela flux (no la ficha PNG de emergencia) y sin aviso de imagen. Si algo falla, se queda en borrador y avisa.
import { publicarPieza } from './publicar.js';

export const autopublicarActiva = (runbook) => Array.isArray(runbook) && runbook.find((t) => t.id === 'autopublicar')?.activa === true;

export function motivosPrevios({ art, img }) {
  const m = [];
  if (art?.problemas?.length) m.push(`El filtro legal dejó ${art.problemas.length} aviso(s)`);
  if (!img?.url) m.push('No tiene imagen');
  else if (img.origen !== 'flux') m.push('La imagen es la ficha PNG de emergencia, no la acuarela');
  if (img?.aviso) m.push(`Aviso de imagen: ${String(img.aviso).slice(0, 120)}`);
  return m;
}

export async function autopublicar({ db, postId, slug, titulo, art, img, fetchImpl = fetch, espera }) {
  const motivos = motivosPrevios({ art, img });
  if (motivos.length) {
    await db.insertar('kimiko_updates', { tipo: 'publicacion', project_id: 'qh', ok: false, detalle: { tipo: 'post', id: String(postId), slug, titulo, origen: 'auto', resultado: 'bloqueada', motivos } }).catch(() => null);
    return { ok: false, slug, titulo, motivos };
  }
  return publicarPieza({ db, tipo: 'post', id: postId, fetchImpl, ...(espera !== undefined ? { espera } : {}) });
}

export const textoAutopublicar = (r) => (r.ok
  ? `🟢 Publicado solo: «${r.titulo}»\n${r.url}\nSi algo no te cuadra: /pieza ${r.slug} y 🗑 Retirar.`
  : [`🟡 «${r.titulo}» se queda en borrador (publicación automática)`, ...(r.motivos || []).map((m) => `• ${m}`), r.accion || `Revísalo con /pieza ${r.slug} y pulsa ✅ Publicar si está bien.`].join('\n'));
