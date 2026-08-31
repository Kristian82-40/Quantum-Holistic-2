import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gracias por tu compra',
  description: 'Tu suscripción a Quantum Holistic está activa. Revisa tu email para los próximos pasos.',
  robots: { index: false },
  alternates: { canonical: '/gracias' },
};

export default function GraciasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
