import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  // Cargar mensajes del locale - por ahora solo español
  const messages = (await import(`./messages/${locale}.json`)).default;
  return { messages };
});
