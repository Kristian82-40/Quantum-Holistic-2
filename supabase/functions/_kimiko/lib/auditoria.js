// Auditoría semanal de integridad (B4): todo en SQL (función kimiko_auditoria), sin IA. Solo informa: no corrige nada.
const ETIQUETAS = {
  slugs_duplicados: 'Slugs duplicados en el blog',
  categorias_no_normalizadas: 'Posts con categoría fuera de la lista fija',
  publicados_sin_imagen: 'Posts publicados sin imagen',
  publicados_sin_meta: 'Posts publicados sin meta descripción válida (extracto de 50 a 160 caracteres)',
  plantas_publicadas_sin_verificar: 'Plantas publicadas sin ficha verificada',
  tablas_sin_rls: 'Tablas públicas sin RLS',
};

export async function auditar({ db }) {
  const r = await db.rpc('kimiko_auditoria');
  const hallazgos = Object.entries(ETIQUETAS).map(([clave, texto]) => ({ clave, texto, n: Number(r?.[clave]?.n || 0), ejemplos: r?.[clave]?.ejemplos || [] }));
  return { ok: hallazgos.every((h) => h.n === 0), hallazgos };
}

export const textoAuditoria = (a, fecha) => (a.ok
  ? `🔎 Auditoría ${fecha}: todo limpio (slugs, categorías, imágenes, metas, plantas y RLS)`
  : [`🔎 Auditoría ${fecha}`, ...a.hallazgos.filter((h) => h.n).map((h) => `• ${h.texto}: ${h.n}${h.ejemplos.length ? `\n  ej.: ${h.ejemplos.slice(0, 5).join(', ')}` : ''}`), '', 'No he cambiado nada. Si quieres que lo arregle, pídemelo y va en un PR.'].join('\n'));
