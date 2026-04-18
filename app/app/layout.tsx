import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { LanguageProvider } from '@/components/providers/LanguageProvider';

const SITE_URL = 'https://quantumholistic.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Quantum Holistic — Nutrición KM0, Herbología & Bienestar con IA',
    template: '%s | Quantum Holistic',
  },
  description:
    'Planes nutricionales km0 personalizados, herbología y bienestar holístico potenciados por inteligencia artificial. Descubre tu perfil y transforma tu salud.',
  keywords: [
    'nutrición km0',
    'bienestar holístico',
    'herbología',
    'plan nutricional personalizado',
    'macrobiótica',
    'plantas medicinales',
    'inteligencia artificial salud',
    'detox depuracion',
  ],
  authors: [{ name: 'Kristian Troncoso', url: SITE_URL }],
  creator: 'Kristian Troncoso',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: SITE_URL,
    siteName: 'Quantum Holistic',
    title: 'Quantum Holistic — Nutrición KM0 & Bienestar con IA',
    description:
      'Tu cuerpo tiene su propia inteligencia. Planes nutricionales km0 y bienestar holístico personalizados con IA.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quantum Holistic — Nutrición KM0 & Bienestar con IA',
    description: 'Tu cuerpo tiene su propia inteligencia. Descubre tu perfil holístico.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: SITE_URL,
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F4EE' },
    { media: '(prefers-color-scheme: dark)',  color: '#141610' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
