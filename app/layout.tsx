import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { LanguageProvider } from '@/components/providers/LanguageProvider';
import { Analytics } from '@vercel/analytics/react';
import ChatBot from '@/components/ui/ChatBot';

const SITE_URL = 'https://quantum-holistic.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Quantum Holistic — Nutrición KM0, Herbología & Bienestar',
    template: '%s | Quantum Holistic',
  },
  description:
    'Herbología y nutrición de kilómetro cero arraigadas en la sabiduría de la tierra. Blog, diccionario de plantas y asesoramiento con el especialista.',
  keywords: [
    'nutrición km0',
    'bienestar holístico',
    'herbología',
    'plan nutricional',
    'macrobiótica',
    'plantas medicinales',
    'detox depuracion',
  ],
  authors: [{ name: 'Kristian Troncoso', url: SITE_URL }],
  creator: 'Kristian Troncoso',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: SITE_URL,
    siteName: 'Quantum Holistic',
    title: 'Quantum Holistic — Nutrición KM0 & Bienestar',
    description:
      'Herbología, nutrición km0 y bienestar holístico arraigados en la sabiduría de la tierra.',
    images: [{ url: '/images/og-default.jpg', width: 1059, height: 556 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quantum Holistic — Nutrición KM0 & Bienestar',
    description: 'Tu cuerpo tiene su propia inteligencia. Herbología y nutrición km0 arraigadas en la sabiduría de la tierra.',
    images: ['/images/og-default.jpg'],
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
        <ChatBot />
        <Analytics />
      </body>
    </html>
  );
}
