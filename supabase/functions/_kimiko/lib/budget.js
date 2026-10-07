// Gasto: Kimiko funciona a 0 € (Workers Free + Workers AI dentro del cupo gratuito diario).
// No hay tope ni coste fijo: el mensaje muestra SOLO lo registrado en kimiko_spend.
export function estadoGasto({ usd = 0, ejecuciones = 0, fallidas = 0 } = {}) {
  const base = `💶 Gasto del mes registrado en kimiko_spend: ${usd.toFixed(2)} $ (${ejecuciones} ejecuciones${fallidas ? `, ${fallidas} fallidas` : ''})`;
  return usd > 0 ? { nivel: 'aviso', texto: `⚠️ El gasto debería ser 0. ${base}` } : { nivel: 'ok', texto: base };
}
