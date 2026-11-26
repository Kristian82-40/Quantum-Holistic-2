import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chat · Nutrición & Herbología',
  description: 'Consulta sobre plantas medicinales, nutrición km0 y bienestar holístico con el asistente de Quantum Holistic.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/chat' },
  openGraph: {
    title: 'Chat · Nutrición & Herbología',
    description: 'Consulta sobre plantas medicinales, nutrición km0 y bienestar holístico con el asistente de Quantum Holistic.',
    url: '/chat',
  },
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
