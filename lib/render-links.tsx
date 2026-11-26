import React from 'react';

/**
 * Convierte [texto](/ruta) en <a> clicable dentro de un mensaje del asistente.
 * Solo acepta rutas internas: "/" seguido de letra o número.
 * "//dominio.com" y cualquier ruta que empiece por "//" quedan como texto plano.
 */
export function renderText(text: string): React.ReactNode {
  // Captura [texto](/letra-o-número…) — el segundo char tras "/" debe ser [a-zA-Z0-9]
  const parts = text.split(/(\[[^\]]+\]\(\/[a-zA-Z0-9][^)]*\))/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\((\/[a-zA-Z0-9][^)]*)\)$/);
    if (m) return (
      <a key={i} href={m[2]} style={{ color: 'var(--sage)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
        {m[1]}
      </a>
    );
    return part;
  });
}
