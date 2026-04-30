import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { stripe } from '@/lib/stripe';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Bienvenido a Quantum Pro',
  robots: { index: false },
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect('/');
  }

  let email: string | null = null;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') {
      redirect('/cancel');
    }
    email = session.customer_details?.email ?? null;
  } catch {
    redirect('/');
  }

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.card}>
          <span className={styles.icon}>✦</span>
          <h1 className={styles.title}>¡Bienvenido a Quantum Pro!</h1>
          <p className={styles.text}>
            Tu suscripción está activa.
            {email && (
              <> En menos de 24h recibirás un email en <strong>{email}</strong> con tu protocolo personalizado y acceso a todas las funcionalidades Pro.</>
            )}
            {!email && (
              <> En menos de 24h recibirás un email con tu protocolo personalizado y acceso a todas las funcionalidades Pro.</>
            )}
          </p>
          <a href="/" className={styles.back}>
            Volver al inicio →
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
