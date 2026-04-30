import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'Quantum Holistic <hola@quantumholistic.com>';

export async function sendWelcomeEmail(to: string, billingCycle: 'monthly' | 'annual') {
  const planLabel = billingCycle === 'annual' ? 'Pro Anual' : 'Pro Mensual';
  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://quantumholistic.com'}/mi-cuenta`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f0ece3;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e0ddd5;">
    <!-- Header -->
    <div style="background:#1a1f14;padding:40px 40px 32px;text-align:center;">
      <p style="margin:0;color:#c8b89a;letter-spacing:0.3em;font-size:10px;text-transform:uppercase;font-family:sans-serif;">Quantum Holistic</p>
      <h1 style="margin:12px 0 0;color:#f7f4ee;font-weight:300;font-size:26px;letter-spacing:0.05em;">Bienvenido al Plan ${planLabel}</h1>
    </div>

    <!-- Body -->
    <div style="padding:40px;">
      <p style="color:#555;font-weight:300;line-height:1.8;margin:0 0 24px;">
        Tu suscripción está activa. A partir de ahora tienes acceso completo a las herramientas de bienestar holístico con IA de Quantum Holistic.
      </p>

      <div style="background:#f7f4ee;border-radius:8px;padding:24px;margin-bottom:32px;">
        <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#6B7C5E;font-family:sans-serif;">Incluido en tu plan</p>
        <ul style="margin:0;padding:0 0 0 18px;color:#333;font-weight:300;line-height:2;font-size:14px;">
          <li>Chat holístico ilimitado con IA</li>
          <li>Recomendador Dosha personalizado</li>
          <li>Diccionario completo de 50+ plantas medicinales</li>
          <li>Planes y rutinas personalizadas</li>
        </ul>
      </div>

      <div style="text-align:center;margin-bottom:32px;">
        <a href="${portalUrl}" style="display:inline-block;background:#6B7C5E;color:#fff;text-decoration:none;padding:14px 36px;border-radius:6px;font-size:13px;letter-spacing:0.05em;font-family:sans-serif;">
          Acceder a mi cuenta →
        </a>
      </div>

      <p style="color:#999;font-size:12px;line-height:1.7;margin:0;font-family:sans-serif;">
        Si tienes cualquier pregunta, responde a este email. Estamos aquí para ayudarte en tu camino holístico.<br>
        — Kristian Troncoso, Quantum Holistic
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:24px 40px;border-top:1px solid #e0ddd5;text-align:center;">
      <p style="margin:0;font-size:11px;color:#bbb;font-family:sans-serif;">
        © 2026 Quantum Holistic · <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://quantumholistic.com'}/privacidad" style="color:#bbb;">Privacidad</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Bienvenido a Quantum Holistic Pro 🌿`,
    html,
  });

  if (error) {
    console.error('[email] Error enviando bienvenida:', error);
    throw error;
  }
}

export async function sendPaymentFailedEmail(to: string, invoiceId: string) {
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: 'Problema con tu pago en Quantum Holistic',
    html: `
      <div style="max-width:480px;margin:40px auto;font-family:sans-serif;color:#333;">
        <h2 style="font-weight:300;">Hubo un problema con tu pago</h2>
        <p>No pudimos procesar el pago de tu suscripción Pro (${invoiceId}).</p>
        <p>Por favor actualiza tu método de pago para continuar disfrutando del acceso completo.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://quantumholistic.com'}/mi-cuenta"
           style="display:inline-block;background:#6B7C5E;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;margin-top:16px;">
          Actualizar método de pago
        </a>
      </div>`,
  });

  if (error) console.error('[email] Error enviando pago fallido:', error);
}
