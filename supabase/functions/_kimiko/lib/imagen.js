// Imagen de cada post: Workers AI (flux-1-schnell, acuarela con la estética de marca) → bucket público "kimiko".
// Si flux falla o se acaba el cupo, ficha de planta en SVG con los colores de marca, pasada a PNG por la Edge Function
// "kimiko-ficha" de Supabase (rasterizar en el Worker no cabe en los 10 ms de CPU del plan Free). Sin imagen no hay post.
import { generarImagen } from './ia.js';

export const BUCKET_BLOG = 'kimiko';

// Colores de Brand_Bible_v1.md de q-h.com. Cada proyecto puede traer los suyos en config/projects.json → colores_marca.
export const COLORES_QH = { salvia: '#8A9A7B', dorado: '#B8935A', crema: '#F4EDE0', terracota: '#9C5A3C', bosque: '#3D4A3A' };

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Parte un texto en líneas de como mucho `max` caracteres, sin cortar palabras.
function lineas(texto, max, tope) {
  const out = []; let l = '';
  for (const p of String(texto).split(/\s+/).filter(Boolean)) {
    if ((`${l} ${p}`).trim().length > max && l) { out.push(l); l = p; } else l = `${l} ${p}`.trim();
  }
  if (l) out.push(l);
  return out.length > tope ? [...out.slice(0, tope - 1), `${out.slice(tope - 1).join(' ').slice(0, max - 1)}…`] : out;
}

export function fichaSVG({ titulo, subtitulo = '', pie = 'quantum-holistic.com', colores = COLORES_QH, ancho = 1200, alto = 630 }) {
  const c = { ...COLORES_QH, ...colores };
  const cx = ancho / 2;
  const lt = lineas(titulo, ancho > alto ? 30 : 20, 3);
  const y0 = alto / 2 - (lt.length - 1) * 34;
  const hoja = (x, y, r, color, giro) => `<path transform="translate(${x} ${y}) rotate(${giro})" d="M0 0 C ${r * 0.6} ${-r * 0.5}, ${r * 0.6} ${-r * 1.3}, 0 ${-r * 1.8} C ${-r * 0.6} ${-r * 1.3}, ${-r * 0.6} ${-r * 0.5}, 0 0 Z" fill="${color}" fill-opacity="0.35"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}" viewBox="0 0 ${ancho} ${alto}">`
    + `<rect width="100%" height="100%" fill="${c.crema}"/>`
    + `<rect x="24" y="24" width="${ancho - 48}" height="${alto - 48}" fill="none" stroke="${c.dorado}" stroke-width="2" rx="18"/>`
    + hoja(110, alto - 70, 90, c.salvia, -25) + hoja(170, alto - 60, 70, c.salvia, 15) + hoja(ancho - 120, 190, 80, c.terracota, 160) + hoja(ancho - 170, 170, 60, c.salvia, 200)
    + lt.map((l, i) => `<text x="${cx}" y="${y0 + i * 68}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="56" fill="${c.bosque}">${esc(l)}</text>`).join('')
    + (subtitulo ? `<text x="${cx}" y="${y0 + lt.length * 68 + 10}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="30" fill="${c.salvia}">${esc(subtitulo)}</text>` : '')
    + `<text x="${cx}" y="${alto - 52}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="22" letter-spacing="4" fill="${c.dorado}">${esc(pie.toUpperCase())}</text>`
    + '</svg>';
}

// ruta sin extensión, p. ej. "blog/qh/2026-10-06-manzanilla". Devuelve { ruta, url, origen, neuronas, aviso }.
export async function imagenDelPost({ ai, db, prompt, ficha, ruta, forzarFicha = false }) {
  let aviso = null;
  if (!forzarFicha) {
    try {
      const img = await generarImagen({ ai, prompt });
      const r = await db.subir(BUCKET_BLOG, `${ruta}.${img.ext}`, img.bytes, img.mime);
      return { ruta: r, url: db.urlPublica(BUCKET_BLOG, r), origen: 'flux', neuronas: img.neuronas, aviso };
    } catch (e) {
      aviso = `flux falló, uso la ficha PNG: ${e.message.slice(0, 160)}`;
    }
  } else aviso = 'ficha PNG: sin tiempo para la acuarela (o prueba forzada)';
  const r = await db.fichaPNG(fichaSVG(ficha), `${ruta}.png`); // si esto también falla, lanza: el post no se crea
  return { ruta: r, url: db.urlPublica(BUCKET_BLOG, r), origen: 'ficha', neuronas: 0, aviso };
}
