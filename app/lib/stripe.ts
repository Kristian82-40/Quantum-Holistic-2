import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY no está configurado en .env.local');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-03-25.dahlia',
  typescript: true,
});

export const STRIPE_PRICE_IDS = {
  proMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
  proAnnual:  process.env.STRIPE_PRO_ANNUAL_PRICE_ID!,
} as const;
