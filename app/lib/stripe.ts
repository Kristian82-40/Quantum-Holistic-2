import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY ?? 'sk_placeholder';

export const stripe = new Stripe(key, {
  apiVersion: '2026-03-25.dahlia',
  typescript: true,
});

export const STRIPE_PRICE_IDS = {
  proMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
  proAnnual:  process.env.STRIPE_PRO_ANNUAL_PRICE_ID!,
} as const;
