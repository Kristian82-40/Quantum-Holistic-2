import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Blog — Nutrición KM0, Herbología & Bienestar',
  description: 'Artículos sobre nutrición de proximidad, herbología, depuración y bienestar holístico basados en ciencia y tradición.',
};

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '120px', minHeight: '60vh' }}>
        <div className="container section">
          <p style={{ fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: '18px' }}>
            Blog
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, marginBottom: '24px' }}>
            Próximamente
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', fontWeight: 300 }}>
            Estamos preparando contenido de alta calidad sobre nutrición km0,
            herbología y bienestar holístico. Suscríbete a la newsletter para
            ser el primero en leerlo.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
