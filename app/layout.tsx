import type { Metadata } from 'next'
import QuantumCursor from '@/components/ui/QuantumCursor';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Quantum Holistic — Nutrición KM0, Herbología & Bienestar con IA',
    template: '%s | Quantum Holistic',
  },
  description:
    'Planes nutricionales km0 personalizados, herbología y bienestar holístico potenciados por inteligencia artificial.',
  metadataBase: new URL('https://quantumholistic.com'),
  openGraph: {
    title: 'Quantum Holistic',
    description: 'Nutrición KM0, Herbología & Bienestar con IA',
    url: 'https://quantumholistic.com',
    siteName: 'Quantum Holistic',
    locale: 'es_ES',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body style={{cursor: "none"}}><QuantumCursor />{children}</body>
    </html>
  );
}
