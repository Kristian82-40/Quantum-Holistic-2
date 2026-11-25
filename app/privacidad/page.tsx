import { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SITE_CONFIG } from '@/lib/config';
import styles from '../legal/layout.module.css';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Cómo Quantum Holistic recoge, usa y protege tus datos personales.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/privacidad' },
  openGraph: {
    title: 'Política de Privacidad',
    description: 'Cómo Quantum Holistic recoge, usa y protege tus datos personales.',
    url: '/privacidad',
  },
};

export default function PrivacidadPage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={`container ${styles.inner}`}>
          <header className={styles.header}>
            <p className={styles.label}>Legal</p>
            <h1 className={styles.title}>Política de Privacidad</h1>
            <p className={styles.updated}>Última actualización: noviembre 2026</p>
          </header>

          <div className={styles.content}>
            <h2>1. Responsable del tratamiento</h2>
            <p>
              Quantum Holistic, gestionado por Kristian Troncoso, con sede en Barcelona, España.
              Contacto: <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>
            </p>

            <h2>2. Datos que recogemos</h2>
            <p>Recogemos únicamente los datos necesarios para prestarte el servicio:</p>
            <ul>
              <li><strong>Correo electrónico:</strong> facilitado al registrarte, al dejarlo en el chat, al rellenar un formulario de regalo o descarga, o al suscribirte a Quantum Pro. Lo usamos para confirmaciones y comunicaciones del servicio.</li>
              <li><strong>Dosha (opcional):</strong> indicado voluntariamente en tu perfil de cuenta (/cuenta). No es obligatorio y no se comparte con terceros.</li>
              <li><strong>Datos de pago:</strong> gestionados íntegramente por Stripe. No almacenamos datos de tarjeta. Stripe puede recoger datos adicionales según su propia política.</li>
              <li><strong>Datos técnicos:</strong> dirección IP, tipo de navegador y páginas visitadas, recogidos automáticamente para el funcionamiento del servicio.</li>
            </ul>

            <h2>3. Base legal del tratamiento</h2>
            <ul>
              <li><strong>Ejecución de contrato:</strong> para gestionar tu suscripción Quantum Pro y prestarte el servicio.</li>
              <li><strong>Consentimiento:</strong> para el envío de comunicaciones de novedades y marketing (puedes retirar el consentimiento en cualquier momento).</li>
              <li><strong>Interés legítimo:</strong> para el análisis técnico del rendimiento del servicio y la prevención del fraude.</li>
            </ul>

            <h2>4. Cómo usamos tus datos</h2>
            <ul>
              <li>Gestionar tu suscripción, tu acceso y las comunicaciones del servicio.</li>
              <li>Mejorar la calidad del servicio mediante análisis agregados y anónimos.</li>
              <li>Cumplir con obligaciones legales y fiscales.</li>
            </ul>

            <h2>5. Transferencias y terceros</h2>
            <ul>
              <li><strong>Stripe:</strong> procesador de pagos. Datos transferidos bajo el marco EU-US Data Privacy Framework.</li>
              <li><strong>Supabase:</strong> base de datos y lógica del servicio. Servidores en la Unión Europea.</li>
              <li><strong>Resend:</strong> envío de emails transaccionales (confirmaciones de suscripción y avisos de pago). Consulta su política de privacidad en resend.com.</li>
              <li><strong>Vercel:</strong> alojamiento web y analítica de visitas anónima (Vercel Analytics). Los datos de analítica no incluyen información personal identificable.</li>
            </ul>
            <p>No vendemos, alquilamos ni cedemos tus datos a terceros con fines comerciales.</p>

            <h2>6. Conservación de datos</h2>
            <p>
              Conservamos tus datos mientras tu cuenta esté activa o mientras sean necesarios para prestarte el servicio. Los datos de perfil se eliminan en los 30 días siguientes a la baja de tu cuenta. Los datos de facturación se conservan 6 años (art. 30 del Código de Comercio), plazo que cubre los 4 años de prescripción tributaria (art. 66 de la Ley 58/2003). El email que nos dejes se conserva hasta que pidas su supresión y, como máximo, 24 meses sin actividad.
            </p>

            <h2>7. Tus derechos (RGPD)</h2>
            <ul>
              <li>Acceso a tus datos personales.</li>
              <li>Rectificación de datos inexactos.</li>
              <li>Supresión (&quot;derecho al olvido&quot;).</li>
              <li>Limitación del tratamiento.</li>
              <li>Portabilidad de datos.</li>
              <li>Oposición al tratamiento basado en interés legítimo.</li>
            </ul>
            <p>
              Para ejercer cualquiera de estos derechos, escríbenos a{' '}
              <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>. Responderemos en un plazo máximo de 30 días.
            </p>
            <p>
              Si consideras que el tratamiento de tus datos no es correcto, puedes presentar una reclamación ante la{' '}
              <strong>Agencia Española de Protección de Datos (AEPD)</strong> en <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">aepd.es</a>.
            </p>

            <h2>8. Cookies</h2>
            <p>
              Consultá nuestra <Link href="/cookies">Política de Cookies</Link> para más información sobre el uso de cookies en este sitio.
            </p>

            <h2>9. Cambios en esta política</h2>
            <p>
              Podemos actualizar esta política ocasionalmente. Te notificaremos por email si los cambios son significativos. La fecha de &quot;última actualización&quot; al inicio de esta página indica cuándo fue revisada por última vez.
            </p>

            <Link href="/" className={styles.back}>← Volver al inicio</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
