// ─── Site Config ───────────────────────────────────────────
export const SITE_CONFIG = {
  name:        'Quantum Holistic',
  tagline:     'Nutrición KM0, Herbología & Bienestar con IA',
  url:         'https://quantum-holistic.com',
  description: 'Planes nutricionales km0 personalizados, herbología y bienestar holístico potenciados por inteligencia artificial.',
  email:       'kristiantroncoso@gmail.com', // provisional hasta tener correo en quantum-holistic.com (dominio sin MX)
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
      'Perfil holístico básico',
      'Recetas km0 estacionales',
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
    note:     'o €79/año — 2 meses gratis',
    featured: true,
    features: [
      { text: 'Chat sin límite con el asistente holístico', highlight: true },
      { text: 'Sesión 1:1 con el especialista (65 €, aparte)', highlight: true },
      { text: 'Acceso completo al diccionario de plantas', highlight: false },
      { text: 'Protocolo depurativo mes a mes (próximamente)', highlight: false },
      { text: 'Guías PDF descargables (próximamente)',         highlight: false },
    ],
    cta: 'Unirme a la lista de espera',
  },
  {
    id:       'plan_crypto',
    name:     'Quantum Crypto',
    price:    9,
    priceAnnual: 90,
    period:   '/ mes',
    note:     'Pago soberano · Bitcoin / Lightning',
    featured: false,
    features: [
      { text: 'Todo lo de Quantum Pro',                 highlight: true },
      { text: 'Pago con Bitcoin / Lightning (BTCPay)',  highlight: true },
      { text: 'Sin intermediarios financieros',         highlight: true },
      { text: 'Privacidad reforzada',                   highlight: false },
      { text: 'Confirmación on-chain instantánea',      highlight: false },
    ],
    cta: 'Pagar con Crypto',
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
    title: 'Perfil holístico personalizado',
    desc:  'Biométrica, hábitos, energía y objetivos. Un sistema de bienestar único construido desde tus datos reales.',
    tag:   'IA · Biométrica',
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
    icon:  '◉',
    title: 'Chat sin límite',
    desc:  'Pregunta sobre plantas, recetas y bienestar cuando quieras. Respuestas del asistente holístico basadas en el contenido verificado del portal.',
    tag:   'Sin límite · Verificado',
  },
  {
    icon:  '✦',
    title: 'Diccionario completo de plantas',
    desc:  'Acceso a todas las fichas con sus usos tradicionales, contraindicaciones y fuentes citadas (EMA, NCCIH).',
    tag:   'Herbología · Verificado',
  },
  {
    icon:  '◈',
    title: 'Protocolo depurativo mes a mes',
    desc:  'Ciclos de depuración, refuerzo inmune y regeneración adaptados a tu perfil. En desarrollo — disponible pronto.',
    tag:   'Próximamente',
  },
  {
    icon:  '◐',
    title: 'Guías descargables',
    desc:  'Recetarios estacionales y guías de plantas medicinales revisadas por el especialista. En desarrollo — disponible pronto.',
    tag:   'Próximamente',
  },
] as const;

// ─── Marquee items ────────────────────────────────────────────
export const MARQUEE_ITEMS = [
  'Nutrición km0', 'Herbología local', 'Depuración & detox',
  'Alto rendimiento', 'Potenciación cognitiva', 'Macrobiótica consciente',
  'Plantas medicinales', 'Bienestar personalizado',
] as const;
