import { Cormorant_Garamond, Inter_Tight } from 'next/font/google';
import metadata from '../fichas-metadata.json';
import Catalogo, { type Plant } from './Catalogo';

export const dynamic = 'force-dynamic';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-inter-tight',
  display: 'swap',
});

export default function DiccionarioPage() {
  const plants = (metadata as { atlas_images: Plant[] }).atlas_images;

  return (
    <div className={`${cormorant.variable} ${interTight.variable}`}>
      <Catalogo plants={plants} />
    </div>
  );
}
