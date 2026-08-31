import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chat con papu-pro',
  description: 'Habla con papu-pro, el asistente de IA de Quantum Holistic, sobre nutrición KM0, rituales y bienestar.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/chat' },
  openGraph: {
    title: 'Chat con papu-pro',
    description: 'Habla con papu-pro, el asistente de IA de Quantum Holistic, sobre nutrición KM0, rituales y bienestar.',
    url: '/chat',
  },
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
