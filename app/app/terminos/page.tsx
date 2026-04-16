import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import styles from '../legal/layout.module.css';

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Condiciones de uso del servicio Quantum Holistic.',
  robots: { index: true, follow: true },
};

export default function TerminosPage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={`container ${styles.inner}`}>
          <header className={styles.header}>
            <p className={styles.label}>Legal</p>
            <h1 className={styles.title}>Términos y Condiciones</h1>
            <p className={styles.updated}>Última actualización: abril 2026</p>
          </header>

          <div className={styles.content}>
            <h2>1. Aceptación</h2>
            <p>
              Al acceder a quantumholistic.com o contratar cualquiera de nuestros servicios, aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguna parte, te pedimos que no uses el servicio.
            </p>

            <h2>2. El servicio</h2>
            <p>
              Quantum Holistic ofrece planes de bienestar holístico, nutrición km0 y herbología personalizados con apoyo de inteligencia artificial. El servicio incluye:
            </p>
            <ul>
              <li><strong>Plan Freemium:</strong> perfil holístico básico, plan semanal generado por IA, recetas estacionales y acceso al blog. Gratuito, sin tarjeta requerida.</li>
              <li><strong>Quantum Pro (mensual/anual):</strong> protocolo depurativo mensual, optimización de perfil avanzada, videollamada mensual con especialista, seguimiento adaptativo y guías descargables.</li>
            </ul>

            <h2>3. Naturaleza del servicio — aviso importante</h2>
            <p>
              El contenido de Quantum Holistic tiene <strong>carácter informativo y educativo</strong>. No constituye asesoramiento médico, diagnóstico ni tratamiento de ninguna enfermedad o condición de salud.
            </p>
            <p>
              Consulta siempre a un profesional sanitario cualificado antes de realizar cambios significativos en tu dieta, especialmente si tienes condiciones médicas preexistentes, estás embarazada, en período de lactancia o tomas medicación.
            </p>

            <h2>4. Suscripción Quantum Pro</h2>
            <h3>Facturación</h3>
            <p>
              Las suscripciones se facturan de forma recurrente (mensual o anual) a través de Stripe. El cargo se realiza al inicio de cada período de facturación. Los precios incluyen IVA cuando corresponda.
            </p>
            <h3>Cancelación</h3>
            <p>
              Puedes cancelar tu suscripción en cualquier momento escribiendo a{' '}
              <a href="mailto:hola@quantumholistic.com">hola@quantumholistic.com</a>. La cancelación tiene efecto al final del período de facturación en curso. No se realizan reembolsos por el período no consumido.
            </p>
            <h3>Derecho de desistimiento</h3>
            <p>
              Si eres residente en el Reino Unido o la UE, tienes derecho a desistir del contrato en un plazo de 14 días naturales desde la contratación, sin necesidad de justificación. Para ejercer este derecho, contáctanos antes de que transcurra ese plazo.
            </p>

            <h2>5. Uso aceptable</h2>
            <p>Al usar el servicio, te comprometes a:</p>
            <ul>
              <li>No compartir acceso a tu cuenta Quantum Pro con terceros.</li>
              <li>No reproducir ni distribuir el contenido personalizado sin autorización expresa.</li>
              <li>No usar el servicio para fines ilegales, fraudulentos o que perjudiquen a otros usuarios.</li>
            </ul>

            <h2>6. Propiedad intelectual</h2>
            <p>
              Todo el contenido de Quantum Holistic — textos, diseño, código, protocolos, recetas y materiales descargables — es propiedad de Quantum Holistic o de sus licenciantes. El contenido generado para ti de forma personalizada es de uso exclusivo tuyo. Queda prohibida su reproducción pública o comercial sin autorización.
            </p>

            <h2>7. Limitación de responsabilidad</h2>
            <p>
              Quantum Holistic no será responsable de daños directos, indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso del servicio, en la medida en que la ley aplicable lo permita.
            </p>
            <p>
              La responsabilidad total de Quantum Holistic frente a un usuario no superará el importe pagado por dicho usuario en los 12 meses anteriores al hecho que origine la reclamación.
            </p>

            <h2>8. Modificaciones del servicio</h2>
            <p>
              Nos reservamos el derecho de modificar o discontinuar el servicio, total o parcialmente, con un preaviso razonable. En caso de cambios sustanciales en las condiciones de una suscripción activa, notificaremos por email con al menos 30 días de antelación.
            </p>

            <h2>9. Ley aplicable</h2>
            <p>
              Estos términos se rigen por la legislación del Reino Unido. Cualquier disputa se someterá a la jurisdicción de los tribunales de Bristol, UK, salvo que la normativa de protección al consumidor aplicable en tu país de residencia disponga otra cosa.
            </p>

            <h2>10. Contacto</h2>
            <p>
              Para cualquier consulta sobre estos términos:{' '}
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
