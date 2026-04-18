export default function BioZenScene() {
  return (
    <svg
      viewBox="0 0 740 460"
      width="100%"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4f0e8" />
          <stop offset="100%" stopColor="#e8e2d4" />
        </linearGradient>
        <linearGradient id="stemGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b7c5c" />
          <stop offset="100%" stopColor="#8a9a6e" />
        </linearGradient>
        <linearGradient id="dropGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8b89a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#a89070" stopOpacity="0.6" />
        </linearGradient>
        <filter id="softBlur">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>

      {/* Fondo */}
      <rect width="740" height="460" fill="url(#bgGrad)" rx="4" />

      {/* Suelo sutil */}
      <ellipse cx="370" cy="400" rx="280" ry="18" fill="#d4c9b0" opacity="0.4" />

      {/* ── SEMILLA (izquierda) ── */}
      <g transform="translate(100, 310)">
        {/* tierra */}
        <ellipse cx="0" cy="60" rx="44" ry="8" fill="#b8a88a" opacity="0.5" />
        {/* semilla */}
        <ellipse cx="0" cy="34" rx="12" ry="16" fill="#8c7355" />
        <ellipse cx="0" cy="34" rx="6" ry="10" fill="#a08060" opacity="0.6" />
        {/* brote */}
        <path d="M0 18 Q-8 4 -14 -8" stroke="#6b7c5c" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="-14" cy="-8" rx="9" ry="5" fill="#7a9460" transform="rotate(-30 -14 -8)" />
        <path d="M0 18 Q8 2 16 -6" stroke="#6b7c5c" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="16" cy="-6" rx="9" ry="5" fill="#8aaa6e" transform="rotate(25 16 -6)" />
        {/* raíces */}
        <path d="M-4 50 Q-10 58 -14 66" stroke="#9a8060" strokeWidth="1.5" fill="none" opacity="0.7" strokeLinecap="round" />
        <path d="M4 50 Q10 58 8 68" stroke="#9a8060" strokeWidth="1.5" fill="none" opacity="0.7" strokeLinecap="round" />
        <path d="M0 50 Q0 60 2 70" stroke="#9a8060" strokeWidth="1.5" fill="none" opacity="0.6" strokeLinecap="round" />
        {/* etiqueta */}
        <text x="0" y="86" textAnchor="middle" fontFamily="serif" fontSize="9" fill="#7a6a50" letterSpacing="0.08em">SEMILLA</text>
      </g>

      {/* flecha 1 */}
      <g opacity="0.45">
        <path d="M168 354 Q200 340 228 354" stroke="#9a8a6e" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
        <polygon points="228,349 235,354 228,359" fill="#9a8a6e" />
      </g>

      {/* ── PLANTA (centro-izquierda) ── */}
      <g transform="translate(280, 200)">
        {/* tallo principal */}
        <path d="M0 170 Q-2 120 0 80 Q2 40 0 0" stroke="url(#stemGrad)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        {/* hoja izquierda grande */}
        <path d="M-2 90 Q-50 60 -62 28 Q-30 34 -2 70" fill="#7a9460" opacity="0.85" />
        <path d="M-2 90 Q-30 60 -32 38" stroke="#5a7040" strokeWidth="0.8" fill="none" opacity="0.5" />
        {/* hoja derecha grande */}
        <path d="M2 110 Q52 78 66 44 Q32 52 2 94" fill="#8aaa6e" opacity="0.85" />
        <path d="M2 110 Q34 82 36 52" stroke="#6a8050" strokeWidth="0.8" fill="none" opacity="0.5" />
        {/* hoja izquierda media */}
        <path d="M-1 50 Q-38 26 -46 4 Q-20 14 -1 38" fill="#6a8c50" opacity="0.75" />
        {/* hoja derecha media */}
        <path d="M1 60 Q40 36 50 12 Q22 24 1 48" fill="#7a9c60" opacity="0.75" />
        {/* flor en la punta */}
        <circle cx="0" cy="-6" r="10" fill="#d4a855" opacity="0.9" />
        <circle cx="0" cy="-6" r="5" fill="#e8c070" />
        {[0,60,120,180,240,300].map((angle, i) => (
          <ellipse
            key={i}
            cx={Math.cos((angle * Math.PI) / 180) * 13}
            cy={-6 + Math.sin((angle * Math.PI) / 180) * 13}
            rx="5"
            ry="3"
            fill="#d4b870"
            opacity="0.7"
            transform={`rotate(${angle} ${Math.cos((angle * Math.PI) / 180) * 13} ${-6 + Math.sin((angle * Math.PI) / 180) * 13})`}
          />
        ))}
        {/* tierra */}
        <ellipse cx="0" cy="175" rx="44" ry="8" fill="#b8a88a" opacity="0.45" />
        {/* etiqueta */}
        <text x="0" y="194" textAnchor="middle" fontFamily="serif" fontSize="9" fill="#7a6a50" letterSpacing="0.08em">PLANTA</text>
      </g>

      {/* flecha 2 */}
      <g opacity="0.45">
        <path d="M342 354 Q374 340 402 354" stroke="#9a8a6e" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
        <polygon points="402,349 409,354 402,359" fill="#9a8a6e" />
      </g>

      {/* ── MORTERO Y MANO (centro-derecha) ── */}
      <g transform="translate(470, 260)">
        {/* mortero */}
        <path d="M-48 70 Q-52 100 -40 108 L40 108 Q52 100 48 70 Z" fill="#c8b090" />
        <ellipse cx="0" cy="70" rx="48" ry="12" fill="#d8c0a0" />
        <ellipse cx="0" cy="70" rx="40" ry="8" fill="#e8d0b0" />
        {/* contenido molido */}
        <ellipse cx="0" cy="72" rx="30" ry="5" fill="#9a8050" opacity="0.7" />
        {/* mano de mortero */}
        <rect x="-6" y="20" width="12" height="50" rx="6" fill="#b8a080" />
        <ellipse cx="0" cy="20" rx="10" ry="7" fill="#c8b090" />
        {/* partículas */}
        <circle cx="-22" cy="62" r="2" fill="#7a6040" opacity="0.6" />
        <circle cx="18" cy="60" r="1.5" fill="#7a6040" opacity="0.5" />
        <circle cx="-10" cy="58" r="1" fill="#8a7050" opacity="0.5" />
        <circle cx="28" cy="65" r="1.5" fill="#6a5030" opacity="0.4" />
        {/* hojas alrededor */}
        <path d="M38 50 Q60 30 68 12 Q48 24 36 44" fill="#7a9460" opacity="0.6" />
        <path d="M-36 46 Q-58 24 -64 8 Q-44 22 -34 42" fill="#6a8450" opacity="0.6" />
        {/* tierra */}
        <ellipse cx="0" cy="118" rx="50" ry="9" fill="#b8a88a" opacity="0.4" />
        {/* etiqueta */}
        <text x="0" y="136" textAnchor="middle" fontFamily="serif" fontSize="9" fill="#7a6a50" letterSpacing="0.08em">PREPARACIÓN</text>
      </g>

      {/* flecha 3 */}
      <g opacity="0.45">
        <path d="M544 354 Q576 340 604 354" stroke="#9a8a6e" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
        <polygon points="604,349 611,354 604,359" fill="#9a8a6e" />
      </g>

      {/* ── FRASCO / EXTRACTO (derecha) ── */}
      <g transform="translate(648, 270)">
        {/* frasco */}
        <rect x="-20" y="0" width="40" height="10" rx="3" fill="#b0a888" />
        <rect x="-16" y="10" width="32" height="4" rx="1" fill="#a09878" />
        <path d="M-22 14 Q-26 20 -26 80 Q-26 96 0 96 Q26 96 26 80 Q26 20 22 14 Z" fill="#c8d4b0" opacity="0.75" />
        <path d="M-22 14 Q-26 20 -26 80 Q-26 96 0 96 Q26 96 26 80 Q26 20 22 14 Z" fill="none" stroke="#90a070" strokeWidth="1.5" />
        {/* liquido dentro */}
        <path d="M-24 54 Q-24 94 0 94 Q24 94 24 54 Z" fill="#8aaa60" opacity="0.45" />
        {/* reflejo */}
        <path d="M-16 22 Q-18 50 -16 70" stroke="white" strokeWidth="2" opacity="0.35" strokeLinecap="round" />
        {/* gotas cayendo */}
        <path d="M0 96 Q1 106 0 112" stroke="#7a9450" strokeWidth="1.5" fill="none" opacity="0.6" />
        <path d="M-2 112 Q0 120 2 112 Q1 107 -2 112" fill="#7a9450" opacity="0.7" />
        {/* etiqueta frasco */}
        <rect x="-14" y="36" width="28" height="18" rx="2" fill="white" opacity="0.55" />
        <text x="0" y="47" textAnchor="middle" fontFamily="serif" fontSize="6" fill="#5a6a40" letterSpacing="0.06em">QH</text>
        {/* tierra */}
        <ellipse cx="0" cy="118" rx="38" ry="7" fill="#b8a88a" opacity="0.4" />
        {/* etiqueta */}
        <text x="0" y="136" textAnchor="middle" fontFamily="serif" fontSize="9" fill="#7a6a50" letterSpacing="0.08em">EXTRACTO</text>
      </g>

      {/* línea base decorativa */}
      <line x1="60" y1="400" x2="680" y2="400" stroke="#c8b898" strokeWidth="1" opacity="0.4" />

      {/* titulo superior sutil */}
      <text x="370" y="36" textAnchor="middle" fontFamily="serif" fontSize="11" fill="#8a7a60" letterSpacing="0.2em" opacity="0.7">DE LA TIERRA · A TI</text>
    </svg>
  );
}
