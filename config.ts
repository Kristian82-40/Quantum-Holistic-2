// ─── Site Config ───────────────────────────────────────────
export const SITE_CONFIG = {
  name:        'Quantum Holistic',
  tagline:     'Nutrición KM0, Herbología & Bienestar con IA',
  url:         'https://quantumholistic.com',
  description: 'Planes nutricionales km0 personalizados, herbología y bienestar holístico potenciados por inteligencia artificial.',
  email:       'hola@quantumholistic.com',
  social: {
    instagram: 'https://instagram.com/quantumholistic',
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
  { label: 'Plantas',      href: '/plantas' },
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
      'Plan semanal generado por IA',
      'Recetas km0 estacionales',
      'Biblioteca de plantas medicinales',
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
      { text: 'Protocolo depurativo mes a mes',         highlight: true },
      { text: 'Optimización según tu perfil único',     highlight: true },
      { text: 'Videollamada mensual 1:1',               highlight: true },
      { text: 'Seguimiento adaptativo con IA',          highlight: false },
      { text: 'Potenciación de habilidades específicas',highlight: false },
      { text: 'Guías PDF descargables',                 highlight: false },
      { text: 'Plan nutricional avanzado',              highlight: false },
      { text: 'Herbología y rituales personalizados',   highlight: false },
    ],
    cta: 'Activar Quantum Pro',
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
    icon:  '◈',
    title: 'Protocolo depurativo mes a mes',
    desc:  'Cada mes un ciclo diferente: depuración, refuerzo inmune, regeneración. Adaptado a tu estado, no a un calendario genérico.',
    tag:   'Detox · Regeneración',
  },
  {
    icon:  '◉',
    title: 'Optimización según tu perfil',
    desc:  'Deportista de élite, rendimiento cognitivo o equilibrio vital. Las técnicas se segmentan exactamente donde tú necesitas.',
    tag:   'Élite · Rendimiento',
  },
  {
    icon:  '◎',
    title: 'Videollamada con el especialista',
    desc:  'Sesión mensual para revisar tu evolución, ajustar el protocolo y resolver lo que ninguna IA puede gestionar sola.',
    tag:   '1:1 · Humano',
  },
  {
    icon:  '◇',
    title: 'Seguimiento adaptativo',
    desc:  'El sistema detecta si estás en fase de estrés, fatiga o pico de forma. Ajusta el protocolo de forma automática.',
    tag:   'IA · Adaptativo',
  },
  {
    icon:  '✦',
    title: 'Potenciación de habilidades únicas',
    desc:  'Músico, atleta, emprendedor o investigador: el plan potencia las capacidades específicas que tu vida requiere.',
    tag:   'Personalizado · Enfocado',
  },
  {
    icon:  '◐',
    title: 'Guías descargables & recursos',
    desc:  'PDFs depurativos, recetarios estacionales, guías de plantas medicinales. Generados con IA y revisados por el especialista.',
    tag:   'PDF · Recursos',
  },
] as const;

// ─── Marquee items ────────────────────────────────────────────
export const MARQUEE_ITEMS = [
  'Nutrición km0', 'Herbología local', 'Depuración & detox',
  'Alto rendimiento', 'Potenciación cognitiva', 'Macrobiótica consciente',
  'Plantas medicinales', 'Bienestar personalizado',
] as const;
