// ─── Site Config ───────────────────────────────────────────
export const SITE_CONFIG = {
  name:        'Quantum Holistic',
  tagline:     'Nutrición KM0, Herbología & Bienestar',
  url:         'https://quantum-holistic.com',
  description: 'Herbología y nutrición de kilómetro cero arraigadas en la sabiduría de la tierra.',
  email:       'hola@quantum-holistic.com', // correo del dominio, activo desde 20-nov-2026
  social: {
    instagram: 'https://instagram.com/kris.biozen',
    youtube:   'https://youtube.com/@quantumholistic',
  },
} as const;

// ─── Navigation ─────────────────────────────────────────────
export const NAV_LINKS = [
  { label: 'Método',       href: '/#pillars' },
  { label: 'Proceso',      href: '/#how' },
  { label: 'Quantum Pro',  href: '/#pro-detail' },
  { label: 'Planes',       href: '/#pricing' },
  { label: 'Blog',         href: '/blog' },
  { label: 'Diccionario', href: '/diccionario' },
  { label: 'Terapeutas',  href: '/terapeutas' },
] as const;

// ─── Pricing ─────────────────────────────────────────────────
export const PLANS = [
  {
    id:       'freemium',
    name:     'Freemium',
    price:    0,
    period:   'para siempre',
    note:     'Sin tarjeta de crédito',
    featured: false,
    features: [
      'Chat holístico (5 mensajes/día)',
      'Diccionario de plantas medicinales',
      'Blog y recursos gratuitos',
    ],
    cta: 'Empezar gratis',
  },
  {
    id:       'pro',
    name:     'Quantum Pro',
    price:    9,
    priceAnnual: 79,
    period:   '/ mes',
    note:     'Lista de espera · Acceso próximamente',
    featured: true,
    features: [
      { text: 'Sesión 1:1 con el especialista (65 €, aparte)', highlight: true },
      { text: 'Protocolo depurativo mes a mes (próximamente)', highlight: false },
      { text: 'Guías PDF descargables (próximamente)',         highlight: false },
    ],
    cta: 'Próximamente',
  },
  {
    id:       'plan_crypto',
    name:     'Quantum Crypto',
    price:    9,
    priceAnnual: 90,
    period:   '/ mes',
    note:     'Pago soberano · En desarrollo',
    featured: false,
    features: [
      { text: 'Pago con Bitcoin / Lightning (BTCPay)',  highlight: true },
      { text: 'Sin intermediarios financieros',         highlight: true },
      { text: 'Privacidad reforzada',                   highlight: false },
    ],
    cta: 'Próximamente',
  },
] as const;

// ─── Pillars ─────────────────────────────────────────────────
export const PILLARS = [
  {
    num:   '01',
    title: 'Nutrición de proximidad',
    desc:  'Alimentos locales, estacionales y de kilómetro cero. Tu cuerpo y la tierra que pisas comparten el mismo ritmo.',
    tag:   'KM0 · Estacional',
  },
  {
    num:   '02',
    title: 'Dosha y constitución vital',
    desc:  'Vata, Pitta o Kapha: conoce tu tipo de energía y adapta tu alimentación a tu constitución según el Ayurveda.',
    tag:   'Ayurveda · Dosha',
  },
  {
    num:   '03',
    title: 'Plantas & sabiduría ancestral',
    desc:  'Herbología, macrobiótica y tradiciones milenarias integradas en recomendaciones prácticas.',
    tag:   'Herbología · Tradición',
  },
] as const;

// ─── Pro Detail Items ─────────────────────────────────────────
export const PRO_ITEMS = [
  {
    icon:  '◎',
    title: 'Sesión 1:1 con el especialista',
    desc:  'Opcional y aparte del plan (65 €): revisamos tu contexto, ajustamos las recomendaciones y resolvemos lo que necesitas en persona.',
    tag:   '1:1 · 65 € aparte',
  },
  {
    icon:  '◈',
    title: 'Protocolo depurativo mes a mes',
    desc:  'Ciclos de depuración, refuerzo inmune y regeneración. En desarrollo — disponible pronto.',
    tag:   'Próximamente',
  },
  {
    icon:  '◐',
    title: 'Guías descargables',
    desc:  'Recetarios estacionales y guías de plantas medicinales. En desarrollo — disponible pronto.',
    tag:   'Próximamente',
  },
] as const;

// ─── Marquee items ────────────────────────────────────────────
export const MARQUEE_ITEMS = [
  'Nutrición km0', 'Herbología local', 'Depuración & detox',
  'Alto rendimiento', 'Potenciación cognitiva', 'Macrobiótica consciente',
  'Plantas medicinales', 'Bienestar holístico',
] as const;
