import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import styles from '../legal/layout.module.css';

export const metadata: Metadata = {
  title: 'Política de Cookies',
  description: 'Información sobre el uso de cookies en Quantum Holistic.',
  robots: { index: true, follow: true },
};

export default function CookiesPage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={`container ${styles.inner}`}>
          <header className={styles.header}>
            <p className={styles.label}>Legal</p>
            <h1 className={styles.title}>Política de Cookies</h1>
            <p className={styles.updated}>Última actualización: abril 2026</p>
          </header>

          <div className={styles.content}>
            <h2>¿Qué son las cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Permiten que el sitio recuerde tus preferencias y mejore tu experiencia de navegación.
            </p>

            <h2>Cookies que usamos</h2>

            <h3>Estrictamente necesarias</h3>
            <p>
              Esenciales para el funcionamiento del sitio. No pueden desactivarse. No recogen información personal identificable.
            </p>
            <ul>
              <li><strong>__stripe_mid / __stripe_sid:</strong> generadas por Stripe para la seguridad del proceso de pago. Se eliminan al cerrar el navegador o tras 1 año.</li>
              <li><strong>Cookies de sesión de Next.js:</strong> necesarias para el funcionamiento del servidor. Duración: sesión.</li>
            </ul>

            <h3>Funcionales</h3>
            <p>
              Permiten recordar tus preferencias (por ejemplo, el ciclo de facturación seleccionado en la sección de precios). No se comparten con terceros.
            </p>
            <ul>
              <li><strong>Preferencias de la interfaz:</strong> almacenadas en localStorage del navegador, no se transmiten a ningún servidor.</li>
            </ul>

            <h3>Analíticas</h3>
            <p>
              Actualmente <strong>no usamos cookies analíticas de terceros</strong> (Google Analytics, Hotjar u similares). Si esto cambia, actualizaremos esta política y solicitaremos tu consentimiento explícito.
            </p>

            <h3>De marketing</h3>
            <p>
              <strong>No usamos cookies de marketing ni de seguimiento publicitario.</strong>
            </p>

            <h2>Cookies de terceros</h2>
            <ul>
              <li>
                <strong>Stripe:</strong> cuando accedes al proceso de pago, Stripe puede establecer sus propias cookies para la detección de fraude y la gestión de sesiones. Consulta la{' '}
                <a href="https://stripe.com/cookies-policy/legal" target="_blank" rel="noopener noreferrer">política de cookies de Stripe</a>.
              </li>
              <li>
                <strong>Google Fonts:</strong> usamos fuentes alojadas en Google Fonts. Google puede establecer cookies técnicas. Consulta la{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">política de privacidad de Google</a>.
              </li>
            </ul>

            <h2>Cómo controlar las cookies</h2>
            <p>
              Puedes gestionar o eliminar las cookies desde la configuración de tu navegador. Ten en cuenta que deshabilitar ciertas cookies puede afectar al funcionamiento del sitio, especialmente en el proceso de pago.
            </p>
            <ul>
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Chrome</a></li>
              <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer">Firefox</a></li>
              <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
              <li><a href="https://support.microsoft.com/es-es/windows/eliminar-y-administrar-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer">Edge</a></li>
            </ul>

            <h2>Cambios en esta política</h2>
            <p>
              Actualizaremos esta política si cambia nuestro uso de cookies. La fecha de "última actualización" al inicio indica la versión vigente.
            </p>

            <p>
              ¿Tienes preguntas? Escríbenos a{' '}
              <a href="mailto:hola@quantumholistic.com">hola@quantumholistic.com</a>
            </p>

            <Link href="/" className={styles.back}>← Volver al inicio</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
