import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import styles from '../legal/layout.module.css';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Cómo Quantum Holistic recoge, usa y protege tus datos personales.',
  robots: { index: true, follow: true },
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
            <p className={styles.updated}>Última actualización: abril 2026</p>
          </header>

          <div className={styles.content}>
            <h2>1. Responsable del tratamiento</h2>
            <p>
              Quantum Holistic, gestionado por Kristian Troncoso, con sede en Bristol, Reino Unido.
              Contacto: <a href="mailto:hola@quantumholistic.com">hola@quantumholistic.com</a>
            </p>

            <h2>2. Datos que recogemos</h2>
            <p>Recogemos únicamente los datos necesarios para prestarte el servicio:</p>
            <ul>
              <li><strong>Datos del perfil holístico:</strong> objetivo de bienestar, ubicación y restricciones alimentarias, introducidos voluntariamente en el formulario de la web.</li>
              <li><strong>Datos de pago:</strong> gestionados íntegramente por Stripe. No almacenamos datos de tarjeta. Stripe puede recoger datos adicionales según su propia política.</li>
              <li><strong>Datos técnicos:</strong> dirección IP, tipo de navegador y páginas visitadas, recogidos automáticamente para el funcionamiento del servicio.</li>
              <li><strong>Correo electrónico:</strong> si te suscribes a Quantum Pro, usamos el email facilitado en el proceso de pago para enviarte tu protocolo y comunicaciones del servicio.</li>
            </ul>

            <h2>3. Base legal del tratamiento</h2>
            <ul>
              <li><strong>Ejecución de contrato:</strong> para gestionar tu suscripción Quantum Pro y enviarte el protocolo personalizado.</li>
              <li><strong>Consentimiento:</strong> para el envío del perfil holístico y comunicaciones de marketing (puedes retirar el consentimiento en cualquier momento).</li>
              <li><strong>Interés legítimo:</strong> para el análisis técnico del rendimiento del servicio y la prevención del fraude.</li>
            </ul>

            <h2>4. Cómo usamos tus datos</h2>
            <ul>
              <li>Generar y enviarte tu protocolo de bienestar personalizado.</li>
              <li>Gestionar tu suscripción y comunicaciones relacionadas con el servicio.</li>
              <li>Mejorar la calidad del servicio mediante análisis agregados y anónimos.</li>
              <li>Cumplir con obligaciones legales y fiscales.</li>
            </ul>

            <h2>5. Transferencias y terceros</h2>
            <ul>
              <li><strong>Stripe:</strong> procesador de pagos. Datos transferidos bajo el marco EU-US Data Privacy Framework.</li>
              <li><strong>Vercel:</strong> alojamiento web. Servidores en la región de Londres (lhr1).</li>
              <li><strong>n8n:</strong> automatización interna. Los datos del formulario de perfil se procesan en un servidor privado controlado por Quantum Holistic.</li>
            </ul>
            <p>No vendemos, alquilamos ni cedemos tus datos a terceros con fines comerciales.</p>

            <h2>6. Conservación de datos</h2>
            <p>
              Conservamos tus datos mientras tu cuenta esté activa o mientras sea necesario para prestarte el servicio. Los datos de perfil se eliminan dentro de los 30 días siguientes a la cancelación de tu cuenta. Los datos de facturación se conservan durante el período legalmente requerido (7 años en UK).
            </p>

            <h2>7. Tus derechos (UK GDPR)</h2>
            <ul>
              <li>Acceso a tus datos personales.</li>
              <li>Rectificación de datos inexactos.</li>
              <li>Supresión ("derecho al olvido").</li>
              <li>Limitación del tratamiento.</li>
              <li>Portabilidad de datos.</li>
              <li>Oposición al tratamiento basado en interés legítimo.</li>
            </ul>
            <p>
              Para ejercer cualquiera de estos derechos, escríbenos a{' '}
              <a href="mailto:hola@quantumholistic.com">hola@quantumholistic.com</a>. Responderemos en un plazo máximo de 30 días.
            </p>
            <p>
              Si consideras que el tratamiento de tus datos no es correcto, puedes presentar una reclamación ante la{' '}
              <strong>Information Commissioner&apos;s Office (ICO)</strong> en <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.
            </p>

            <h2>8. Cookies</h2>
            <p>
              Consultá nuestra <Link href="/cookies">Política de Cookies</Link> para más información sobre el uso de cookies en este sitio.
            </p>

            <h2>9. Cambios en esta política</h2>
            <p>
              Podemos actualizar esta política ocasionalmente. Te notificaremos por email si los cambios son significativos. La fecha de "última actualización" al inicio de esta página indica cuándo fue revisada por última vez.
            </p>

            <Link href="/" className={styles.back}>← Volver al inicio</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
