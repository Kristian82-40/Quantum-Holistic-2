import { Resend } from 'resend';

const FROM = 'Quantum Holistic <hola@quantumholistic.com>';

function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY no configurada');
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendWelcomeEmail(
  to: string,
  billingCycle: 'monthly' | 'annual'
): Promise<void> {
  const resend = getResend();
  const plan = billingCycle === 'annual' ? 'anual' : 'mensual';
  await resend.emails.send({
    from: FROM,
    to,
    subject: '¡Bienvenida a Quantum Holistic Pro! 🌿',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <h1 style="color:#2d6a4f;font-size:24px;margin-bottom:8px">¡Bienvenida a Quantum Holistic Pro!</h1>
        <p style="color:#444;font-size:16px;line-height:1.6">
          Tu suscripción <strong>${plan}</strong> ya está activa. Ahora tienes acceso ilimitado
          al chat con nuestra IA holística, al diccionario completo de plantas y a todas
          las herramientas de bienestar.
        </p>
        <a href="https://quantum-holistic.vercel.app/chat"
           style="display:inline-block;margin-top:24px;padding:12px 28px;background:#2d6a4f;
                  color:#fff;border-radius:8px;text-decoration:none;font-size:15px">
          Empezar ahora →
        </a>
        <p style="margin-top:32px;color:#888;font-size:13px">
          Si tienes dudas, responde a este email o visita <a href="https://quantum-holistic.vercel.app">quantumholistic.com</a>.
        </p>
      </div>
    `,
  });
}

export async function sendPaymentFailedEmail(
  to: string,
  invoiceId: string
): Promise<void> {
  const resend = getResend();
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Problema con tu pago en Quantum Holistic',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <h1 style="color:#c0392b;font-size:24px;margin-bottom:8px">Problema con tu pago</h1>
        <p style="color:#444;font-size:16px;line-height:1.6">
          No pudimos procesar el pago de tu suscripción Quantum Holistic Pro
          (referencia: <code>${invoiceId}</code>).
        </p>
        <p style="color:#444;font-size:16px;line-height:1.6">
          Por favor actualiza tu método de pago para seguir disfrutando de acceso ilimitado.
        </p>
        <a href="https://quantum-holistic.vercel.app/perfil"
           style="display:inline-block;margin-top:24px;padding:12px 28px;background:#c0392b;
                  color:#fff;border-radius:8px;text-decoration:none;font-size:15px">
          Actualizar método de pago →
        </a>
      </div>
    `,
  });
}
