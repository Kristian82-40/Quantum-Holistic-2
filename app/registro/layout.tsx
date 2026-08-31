import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description: 'Crea tu cuenta gratis en Quantum Holistic y accede a rituales, dieta KM0 y acompañamiento personalizado.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/registro' },
  openGraph: {
    title: 'Crear cuenta',
    description: 'Crea tu cuenta gratis en Quantum Holistic y accede a rituales, dieta KM0 y acompañamiento personalizado.',
    url: '/registro',
  },
};

export default function RegistroLayout({ children }: { children: React.ReactNode }) {
  return children;
}
