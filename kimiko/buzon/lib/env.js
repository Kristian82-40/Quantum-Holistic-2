// Variables de entorno de Kimiko. Todas se configuran en Vercel → Settings → Environment Variables.
export const env = {
  // --- Telegram ---
  TG_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TG_SECRET: process.env.TELEGRAM_WEBHOOK_SECRET, // cadena inventada por ti; Telegram la devuelve en cada webhook
  OWNER_CHAT_ID: process.env.TELEGRAM_OWNER_CHAT_ID, // solo tú puedes darle órdenes

  // --- Claude (el cerebro) ---
  ANTHROPIC_KEY: process.env.ANTHROPIC_API_KEY,
  CLAUDE_MODEL: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5',

  // --- Imagen ---
  // IMAGE_PROVIDER: 'gemini' | 'replicate' | 'none'
  IMAGE_PROVIDER: process.env.IMAGE_PROVIDER || 'gemini',
  GEMINI_KEY: process.env.GEMINI_API_KEY,
  GEMINI_IMAGE_MODEL: process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image',
  REPLICATE_TOKEN: process.env.REPLICATE_API_TOKEN,
  REPLICATE_MODEL: process.env.REPLICATE_MODEL || 'black-forest-labs/flux-1.1-pro',

  // --- Supabase (memoria + almacén de imágenes) ---
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  BUCKET: process.env.SUPABASE_BUCKET || 'kimiko',

  // --- Instagram (publicación real) ---
  IG_USER_ID: process.env.IG_USER_ID, // ID numérico de la cuenta Instagram Business
  IG_TOKEN: process.env.IG_ACCESS_TOKEN, // token inicial; luego Kimiko usa el renovado
  GRAPH_VERSION: process.env.GRAPH_VERSION || 'v21.0',

  // Con estos dos, Kimiko renueva el token de Instagram él solo antes de que caduque.
  FB_APP_ID: process.env.FB_APP_ID,
  FB_APP_SECRET: process.env.FB_APP_SECRET,
};

export function requireEnv(keys) {
  const missing = keys.filter((k) => !env[k]);
  if (missing.length) throw new Error(`Faltan variables de entorno: ${missing.join(', ')}`);
}
