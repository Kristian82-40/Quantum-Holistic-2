// Stub: las rutas /app/api/* usan la app/lib/stripe.ts real en producción
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const stripe: any = null;
export const createCheckoutSession = async () => null;
export const STRIPE_PRICE_IDS: { proMonthly: string; proAnnual: string } = {
  proMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? '',
  proAnnual:  process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? '',
};
