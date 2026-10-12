import { existsSync } from 'node:fs';
import path from 'node:path';

// Imagen que la web enseña para una planta (12-oct-2026).
// Manda plants.image_cientifica_url: es la que Kimiko revisa y la que Kristian ve en Telegram.
// Antes la web cargaba siempre `<slug>-cientifica.jpg`, y en varias plantas ese archivo era de otra especie.
// - URL absoluta (Supabase Storage): se usa tal cual.
// - Ruta local (/images/…): solo si el archivo existe; si no, sin imagen (nunca una de recambio que pueda ser otra planta).
// - Sin URL: se mantiene el archivo antiguo `<slug>-cientifica.jpg` para las fichas de siempre.
export function imagenPlanta(slug: string, url: string | null | undefined): string | null {
  const existe = (ruta: string) => existsSync(path.join(process.cwd(), 'public', ruta));
  if (url?.startsWith('https://')) return url;
  if (url?.startsWith('/images/')) return existe(url) ? url : null;
  const antigua = `/images/plants/${slug}-cientifica.jpg`;
  return existe(antigua) ? antigua : null;
}
