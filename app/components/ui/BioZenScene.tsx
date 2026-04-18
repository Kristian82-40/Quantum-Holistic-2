export default function BioZenScene() {
  return (
    <div style={{ background: '#f5f2eb', borderRadius: '12px', padding: '8px' }}>
      <svg width="100%" viewBox="0 0 740 460" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ display: 'block' }}>
        <defs>
          <marker id="dot-end" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="4" markerHeight="4">
            <circle cx="3" cy="3" r="2.5" fill="#9aaa7e"/>
          </marker>
          <marker id="arr-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M1 2L8 5L1 8" fill="none" stroke="#9aaa7e" strokeWidth="1.5" strokeLinecap="round"/>
          </marker>
        </defs>

        {/* fondo suave */}
        <rect width="740" height="460" fill="#f5f2eb" rx="12"/>

        {/* título */}
        <text x="370" y="30" textAnchor="middle" fontFamily="Georgia,serif" fontSize="11" fill="#b0aa96" letterSpacing="0.22em">DE LA SEMILLA AL EXTRACTO</text>
        <line x1="160" y1="38" x2="580" y2="38" stroke="#d0caba" strokeWidth="0.6"/>

        {/* línea de suelo */}
        <line x1="40" y1="360" x2="700" y2="360" stroke="#c8c0a8" strokeWidth="1" strokeDasharray="5 5"/>

        {/* ── 01 SEMILLA ── */}
        <g transform="translate(72,300)">
          <path d="M-22 55 Q0 48 22 55" fill="none" stroke="#b0a890" strokeWidth="2"/>
          <path d="M-18 58 Q0 52 18 58" fill="none" stroke="#b0a890" strokeWidth="1" strokeDasharray="2 3"/>
          <path d="M0 42 C-6 46 -10 52 -8 58" fill="none" stroke="#c4b898" strokeWidth="1.2"/>
          <path d="M0 42 C6 46 10 52 8 58" fill="none" stroke="#c4b898" strokeWidth="1.2"/>
          <path d="M0 42 C0 48 0 54 2 60" fill="none" stroke="#c4b898" strokeWidth="1.2"/>
          <ellipse cx="0" cy="24" rx="13" ry="19" fill="none" stroke="#8a7a58" strokeWidth="2.5"/>
          <ellipse cx="0" cy="24" rx="6" ry="9" fill="none" stroke="#8a7a58" strokeWidth="1" strokeDasharray="2 2"/>
          <line x1="0" y1="5" x2="0" y2="43" stroke="#8a7a58" strokeWidth="0.8" strokeDasharray="2 2"/>
          <path d="M0 5 C0 -8 0 -18 0 -28" fill="none" stroke="#6a8c5a" strokeWidth="2.2"/>
          <path d="M0 -10 C-10 -18 -16 -28 -14 -36" fill="none" stroke="#6a8c5a" strokeWidth="1.8"/>
          <path d="M0 -10 C10 -18 16 -28 14 -36" fill="none" stroke="#6a8c5a" strokeWidth="1.8"/>
          <ellipse cx="-14" cy="-36" rx="9" ry="5" fill="none" stroke="#6a8c5a" strokeWidth="1.5" transform="rotate(-40 -14 -36)"/>
          <ellipse cx="14" cy="-36" rx="9" ry="5" fill="none" stroke="#6a8c5a" strokeWidth="1.5" transform="rotate(40 14 -36)"/>
          <circle cx="8" cy="18" r="1.5" fill="#8a7a58"/>
          <circle cx="-7" cy="26" r="1.5" fill="#8a7a58"/>
          <circle cx="5" cy="32" r="1.5" fill="#8a7a58"/>
        </g>
        <text x="72" y="388" textAnchor="middle" fontFamily="Georgia,serif" fontSize="10" fill="#9a9480" letterSpacing="0.1em">01 · SEMILLA</text>

        {/* flecha 1→2 */}
        <path d="M104 318 C124 308 144 295 165 285" fill="none" stroke="#9aaa7e" strokeWidth="1.5" strokeDasharray="3 4" markerEnd="url(#arr-green)"/>

        {/* ── 02 ARTEMISA DULCE ── */}
        <g transform="translate(225,95)">
          <path d="M0 265 C-3 230 2 195 0 160 C-2 125 2 90 0 55 C-1 35 0 15 0 0" fill="none" stroke="#5a8448" strokeWidth="3"/>
          <path d="M0 220 C-22 205 -40 188 -52 168" fill="none" stroke="#5a8448" strokeWidth="2"/>
          <path d="M0 195 C22 178 38 160 46 140" fill="none" stroke="#5a8448" strokeWidth="2"/>
          <path d="M0 165 C-18 148 -32 132 -40 112" fill="none" stroke="#5a8448" strokeWidth="1.8"/>
          <path d="M0 140 C16 124 28 108 32 88" fill="none" stroke="#5a8448" strokeWidth="1.8"/>
          <path d="M0 110 C-14 95 -24 80 -28 62" fill="none" stroke="#5a8448" strokeWidth="1.5"/>
          <path d="M0 85 C12 70 20 56 22 38" fill="none" stroke="#5a8448" strokeWidth="1.5"/>
          <ellipse cx="-50" cy="162" rx="16" ry="6" fill="none" stroke="#5a8448" strokeWidth="1.8" transform="rotate(-35 -50 162)"/>
          <path d="M-44 168 C-52 162 -56 155 -50 162" fill="none" stroke="#5a8448" strokeWidth="1" strokeDasharray="2 2"/>
          <ellipse cx="-38" cy="106" rx="14" ry="5" fill="none" stroke="#5a8448" strokeWidth="1.6" transform="rotate(-42 -38 106)"/>
          <ellipse cx="-26" cy="56" rx="12" ry="4.5" fill="none" stroke="#5a8448" strokeWidth="1.4" transform="rotate(-38 -26 56)"/>
          <ellipse cx="44" cy="134" rx="16" ry="6" fill="none" stroke="#5a8448" strokeWidth="1.8" transform="rotate(32 44 134)"/>
          <ellipse cx="30" cy="82" rx="14" ry="5" fill="none" stroke="#5a8448" strokeWidth="1.6" transform="rotate(38 30 82)"/>
          <ellipse cx="20" cy="34" rx="11" ry="4" fill="none" stroke="#5a8448" strokeWidth="1.4" transform="rotate(35 20 34)"/>
          <line x1="-44" y1="168" x2="-56" y2="158" stroke="#5a8448" strokeWidth="0.8" strokeDasharray="1.5 2"/>
          <line x1="38" y1="140" x2="50" y2="130" stroke="#5a8448" strokeWidth="0.8" strokeDasharray="1.5 2"/>
          <line x1="0" y1="0" x2="0" y2="-32" stroke="#5a8448" strokeWidth="1.5"/>
          <circle cx="0" cy="-32" r="6" fill="none" stroke="#d4a832" strokeWidth="2"/>
          <circle cx="0" cy="-32" r="3" fill="#d4a832"/>
          <line x1="0" y1="-38" x2="0" y2="-44" stroke="#d4a832" strokeWidth="1.5"/>
          <line x1="4" y1="-36" x2="7" y2="-42" stroke="#d4a832" strokeWidth="1.5"/>
          <line x1="-4" y1="-36" x2="-7" y2="-42" stroke="#d4a832" strokeWidth="1.5"/>
          <line x1="6" y1="-32" x2="12" y2="-32" stroke="#d4a832" strokeWidth="1.5"/>
          <line x1="-6" y1="-32" x2="-12" y2="-32" stroke="#d4a832" strokeWidth="1.5"/>
          <line x1="4" y1="-28" x2="7" y2="-22" stroke="#d4a832" strokeWidth="1.5"/>
          <line x1="-4" y1="-28" x2="-7" y2="-22" stroke="#d4a832" strokeWidth="1.5"/>
          <line x1="0" y1="-10" x2="-12" y2="-22" stroke="#5a8448" strokeWidth="1.2"/>
          <circle cx="-12" cy="-22" r="4.5" fill="none" stroke="#d4a832" strokeWidth="1.8"/>
          <circle cx="-12" cy="-22" r="2" fill="#d4a832"/>
          <line x1="0" y1="-10" x2="12" y2="-22" stroke="#5a8448" strokeWidth="1.2"/>
          <circle cx="12" cy="-22" r="4.5" fill="none" stroke="#d4a832" strokeWidth="1.8"/>
          <circle cx="12" cy="-22" r="2" fill="#d4a832"/>
          <circle cx="-6" cy="-8" r="3" fill="none" stroke="#d4a832" strokeWidth="1.5"/>
          <circle cx="6" cy="-8" r="3" fill="none" stroke="#d4a832" strokeWidth="1.5"/>
          <circle cx="0" cy="-4" r="2.5" fill="none" stroke="#d4a832" strokeWidth="1.2"/>
          <circle cx="28" cy="20" r="1.5" fill="#d4a832" opacity="0.7"/>
          <circle cx="34" cy="10" r="1" fill="#d4a832" opacity="0.5"/>
          <circle cx="-30" cy="18" r="1.5" fill="#d4a832" opacity="0.7"/>
          <circle cx="-36" cy="8" r="1" fill="#d4a832" opacity="0.5"/>
        </g>
        <text x="225" y="388" textAnchor="middle" fontFamily="Georgia,serif" fontSize="10" fill="#9a9480" letterSpacing="0.08em">02 · ARTEMISA DULCE</text>

        {/* flecha 2→3 */}
        <path d="M272 340 C292 342 308 344 325 345" fill="none" stroke="#9aaa7e" strokeWidth="1.5" strokeDasharray="3 4" markerEnd="url(#arr-green)"/>

        {/* ── 03 ALAMBIQUE ── */}
        <g transform="translate(390,130)">
          <path d="M-50 230 C-52 236 -48 240 -40 240 L40 240 C48 240 52 236 50 230" fill="none" stroke="#8a7255" strokeWidth="2"/>
          <path d="M-46 230 L46 230" stroke="#8a7255" strokeWidth="1.5" strokeDasharray="3 3"/>
          <rect x="-44" y="220" width="12" height="20" rx="2" fill="none" stroke="#8a7255" strokeWidth="1.8"/>
          <rect x="-6" y="220" width="12" height="20" rx="2" fill="none" stroke="#8a7255" strokeWidth="1.8"/>
          <rect x="32" y="220" width="12" height="20" rx="2" fill="none" stroke="#8a7255" strokeWidth="1.8"/>
          <path d="M-24 222 C-18 202 -10 210 -4 196 C2 210 8 204 14 196 C20 210 26 202 30 214 C34 222 28 222 24 222" fill="none" stroke="#d4732a" strokeWidth="2"/>
          <path d="M-12 222 C-8 208 -2 214 2 204 C6 214 10 208 14 214 C18 222 14 222 10 222" fill="none" stroke="#e8942a" strokeWidth="1.5"/>
          <path d="M-44 220 C-48 188 -50 155 -42 122 C-34 90 -22 72 0 68 C22 72 34 90 42 122 C50 155 48 188 44 220 Z" fill="none" stroke="#8a6248" strokeWidth="2.8"/>
          <path d="M-42 175 Q0 168 42 175" fill="none" stroke="#8a6248" strokeWidth="0.8" strokeDasharray="3 3"/>
          <path d="M-46 150 Q0 142 46 150" fill="none" stroke="#8a6248" strokeWidth="0.8" strokeDasharray="3 3"/>
          <path d="M-48 125 Q0 118 48 125" fill="none" stroke="#8a6248" strokeWidth="0.8" strokeDasharray="3 3"/>
          <path d="M-36 155 Q0 148 36 155" fill="none" stroke="#a06838" strokeWidth="1.2" strokeDasharray="4 3"/>
          <circle cx="-10" cy="148" r="3" fill="none" stroke="#a06838" strokeWidth="1.2"/>
          <circle cx="8" cy="143" r="2" fill="none" stroke="#a06838" strokeWidth="1"/>
          <circle cx="18" cy="150" r="2.5" fill="none" stroke="#a06838" strokeWidth="1"/>
          <path d="M-16 68 C-14 48 -8 32 0 22" fill="none" stroke="#8a6248" strokeWidth="2.5"/>
          <path d="M16 68 C14 48 8 32 0 22" fill="none" stroke="#8a6248" strokeWidth="2.5"/>
          <path d="M-22 22 C-20 6 -10 -4 0 -8 C10 -4 20 6 22 22 C15 28 -15 28 -22 22 Z" fill="none" stroke="#8a6248" strokeWidth="2.5"/>
          <path d="M-20 18 Q0 14 20 18" fill="none" stroke="#8a6248" strokeWidth="0.8" strokeDasharray="2 3"/>
          <path d="M-22 22 Q0 18 22 22" fill="none" stroke="#8a6248" strokeWidth="0.8" strokeDasharray="2 3"/>
          <path d="M18 8 C28 4 42 2 56 4" fill="none" stroke="#8a6248" strokeWidth="2.2"/>
          <path d="M20 12 C30 10 44 8 56 10" fill="none" stroke="#8a6248" strokeWidth="1" strokeDasharray="2 2"/>
          <path d="M-5 -8 C-8 -18 -4 -26 -6 -34" fill="none" stroke="#c4b898" strokeWidth="1" strokeDasharray="1.5 2.5"/>
          <path d="M5 -8 C8 -18 4 -26 6 -34" fill="none" stroke="#c4b898" strokeWidth="1" strokeDasharray="1.5 2.5"/>
          <circle cx="-6" cy="-36" r="2" fill="none" stroke="#c4b898" strokeWidth="1"/>
          <circle cx="6" cy="-36" r="2" fill="none" stroke="#c4b898" strokeWidth="1"/>
        </g>
        <text x="390" y="388" textAnchor="middle" fontFamily="Georgia,serif" fontSize="10" fill="#9a9480" letterSpacing="0.08em">03 · ALAMBIQUE</text>

        {/* flecha 3→4 */}
        <path d="M450 280 C468 278 480 276 495 275" fill="none" stroke="#9aaa7e" strokeWidth="1.5" strokeDasharray="3 4" markerEnd="url(#arr-green)"/>

        {/* ── 04 CONDENSADOR LIEBIG ── */}
        <g transform="translate(538,80)">
          {/* camisa exterior doble pared */}
          <rect x="-30" y="0" width="60" height="220" rx="8" fill="none" stroke="#6a7a88" strokeWidth="2.5"/>
          <rect x="-24" y="5" width="48" height="210" rx="5" fill="none" stroke="#6a7a88" strokeWidth="0.7" strokeDasharray="3 3"/>

          {/* junta superior */}
          <rect x="-8" y="-22" width="16" height="24" rx="3" fill="none" stroke="#6a7a88" strokeWidth="2"/>
          {/* junta inferior */}
          <rect x="-8" y="220" width="16" height="24" rx="3" fill="none" stroke="#6a7a88" strokeWidth="2"/>

          {/* entrada agua lateral superior derecha */}
          <path d="M30 30 L50 24" fill="none" stroke="#5a8aa8" strokeWidth="1.8"/>
          <ellipse cx="53" cy="23" rx="4" ry="3" fill="none" stroke="#5a8aa8" strokeWidth="1.5"/>

          {/* salida agua lateral inferior izquierda */}
          <path d="M-30 190 L-50 196" fill="none" stroke="#5a8aa8" strokeWidth="1.8"/>
          <ellipse cx="-53" cy="197" rx="4" ry="3" fill="none" stroke="#5a8aa8" strokeWidth="1.5"/>

          {/* espiral interior — 5 bucles Liebig */}
          <line x1="0" y1="-22" x2="0" y2="18" stroke="#8a7255" strokeWidth="2"/>
          <path d="M0 18 C-14 21 -20 26 -18 31 C-16 36 16 39 18 44 C20 49 14 54 0 58 C-14 61 -20 66 -18 71 C-16 76 16 79 18 84 C20 89 14 94 0 98 C-14 101 -20 106 -18 111 C-16 116 16 119 18 124 C20 129 14 134 0 138 C-14 141 -20 146 -18 151 C-16 156 16 159 18 164 C20 169 14 174 0 178 C-14 181 -20 186 -18 191 C-16 196 16 199 18 204 C20 209 14 214 0 218"
            fill="none" stroke="#8a7255" strokeWidth="2.2"/>
          <line x1="0" y1="218" x2="0" y2="244" stroke="#8a7255" strokeWidth="2"/>

          {/* puntos de inflexión */}
          <circle cx="-18" cy="31" r="2" fill="#8a7255"/>
          <circle cx="18" cy="44" r="2" fill="#8a7255"/>
          <circle cx="0" cy="58" r="2" fill="#8a7255"/>
          <circle cx="-18" cy="71" r="2" fill="#8a7255"/>
          <circle cx="18" cy="84" r="2" fill="#8a7255"/>
          <circle cx="0" cy="98" r="2" fill="#8a7255"/>
          <circle cx="-18" cy="111" r="2" fill="#8a7255"/>
          <circle cx="18" cy="124" r="2" fill="#8a7255"/>
          <circle cx="0" cy="138" r="2" fill="#8a7255"/>
          <circle cx="-18" cy="151" r="2" fill="#8a7255"/>
          <circle cx="18" cy="164" r="2" fill="#8a7255"/>
          <circle cx="0" cy="178" r="2" fill="#8a7255"/>
          <circle cx="-18" cy="191" r="2" fill="#8a7255"/>
          <circle cx="18" cy="204" r="2" fill="#8a7255"/>
          <circle cx="0" cy="218" r="2" fill="#8a7255"/>

          {/* texto */}
          <text x="0" y="114" textAnchor="middle" fontFamily="Georgia,serif" fontSize="7" fill="#8a9aaa" letterSpacing="0.05em">AGUA FRÍA</text>

          {/* gotas saliendo por abajo de la junta inferior */}
          <ellipse cx="-6" cy="253" rx="3" ry="4" fill="none" stroke="#5a8aa8" strokeWidth="1.2"/>
          <ellipse cx="0" cy="260" rx="2.5" ry="3.5" fill="none" stroke="#5a8aa8" strokeWidth="1.2"/>
          <ellipse cx="6" cy="255" rx="2" ry="3" fill="none" stroke="#5a8aa8" strokeWidth="1"/>

          {/* pipe desde alambique */}
          <path d="M-72 18 C-58 16 -46 14 -32 12" fill="none" stroke="#8a6248" strokeWidth="2" markerEnd="url(#arr-green)"/>
        </g>
        <text x="538" y="390" textAnchor="middle" fontFamily="Georgia,serif" fontSize="10" fill="#9a9480" letterSpacing="0.08em">04 · LIEBIG</text>

        {/* flecha 4→5 */}
        <path d="M610 310 C628 306 642 295 654 282" fill="none" stroke="#9aaa7e" strokeWidth="1.5" strokeDasharray="3 4" markerEnd="url(#arr-green)"/>

        {/* ── 05 BIO-ZEN BOTELLA ── */}
        <g transform="translate(672,155)">
          <rect x="-36" y="-12" width="72" height="185" rx="8" fill="none" stroke="#4a6a9a" strokeWidth="1.2" strokeDasharray="4 3"/>
          <rect x="-20" y="20" width="40" height="100" rx="6" fill="none" stroke="#2a4a8a" strokeWidth="2.8"/>
          <line x1="-14" y1="30" x2="-14" y2="110" stroke="#4a6aaa" strokeWidth="0.8" opacity="0.6"/>
          <line x1="-8" y1="25" x2="-8" y2="115" stroke="#4a6aaa" strokeWidth="0.8" opacity="0.4"/>
          <path d="M-20 20 C-20 10 -14 4 -8 2 L8 2 C14 4 20 10 20 20" fill="none" stroke="#2a4a8a" strokeWidth="2.5"/>
          <rect x="-8" y="-14" width="16" height="18" rx="3" fill="none" stroke="#2a4a8a" strokeWidth="2.2"/>
          <rect x="-10" y="-26" width="20" height="14" rx="4" fill="none" stroke="#2a4a8a" strokeWidth="2.5"/>
          <line x1="0" y1="-26" x2="0" y2="-36" stroke="#2a4a8a" strokeWidth="2"/>
          <circle cx="0" cy="-38" r="3" fill="none" stroke="#2a4a8a" strokeWidth="2"/>
          <rect x="-16" y="32" width="32" height="55" rx="3" fill="none" stroke="#2a4a8a" strokeWidth="1.2"/>
          <line x1="-12" y1="44" x2="12" y2="44" stroke="#2a4a8a" strokeWidth="0.8"/>
          <line x1="-10" y1="52" x2="10" y2="52" stroke="#2a4a8a" strokeWidth="0.6" strokeDasharray="2 2"/>
          <text x="0" y="38" textAnchor="middle" fontFamily="Georgia,serif" fontStyle="italic" fontSize="8" fill="#2a4a8a" letterSpacing="0.04em">bio</text>
          <text x="0" y="60" textAnchor="middle" fontFamily="Georgia,serif" fontStyle="italic" fontSize="11" fill="#2a4a8a" letterSpacing="0.06em" fontWeight="bold">Zen</text>
          <circle cx="-8" cy="72" r="3" fill="none" stroke="#2a4a8a" strokeWidth="0.8"/>
          <circle cx="0" cy="70" r="3" fill="none" stroke="#2a4a8a" strokeWidth="0.8"/>
          <circle cx="8" cy="72" r="3" fill="none" stroke="#2a4a8a" strokeWidth="0.8"/>
          <path d="M-20 120 Q-22 128 -16 132 L16 132 Q22 128 20 120" fill="none" stroke="#2a4a8a" strokeWidth="2"/>
          <circle cx="-12" cy="35" r="2" fill="#6a8acc" opacity="0.6"/>
          <circle cx="-16" cy="50" r="1.5" fill="#6a8acc" opacity="0.5"/>
          <ellipse cx="-28" cy="85" rx="4" ry="6" fill="none" stroke="#2a4a8a" strokeWidth="1.5"/>
          <ellipse cx="-28" cy="98" rx="3.5" ry="5" fill="none" stroke="#2a4a8a" strokeWidth="1.2"/>
          <circle cx="-28" cy="107" r="2.5" fill="none" stroke="#2a4a8a" strokeWidth="1.2"/>
          <circle cx="26" cy="40" r="1.5" fill="#4a6aaa" opacity="0.7"/>
          <circle cx="30" cy="55" r="1.5" fill="#4a6aaa" opacity="0.7"/>
          <circle cx="28" cy="70" r="1.5" fill="#4a6aaa" opacity="0.7"/>
          <circle cx="26" cy="85" r="1.5" fill="#4a6aaa" opacity="0.7"/>
        </g>
        <text x="672" y="388" textAnchor="middle" fontFamily="Georgia,serif" fontSize="10" fill="#9a9480" letterSpacing="0.08em">05 · BIO-ZEN</text>

        {/* números flotantes */}
        <text x="72" y="274" textAnchor="middle" fontFamily="Georgia,serif" fontSize="9" fill="#c8c0a8" letterSpacing="0.15em">01</text>
        <text x="200" y="80" textAnchor="middle" fontFamily="Georgia,serif" fontSize="9" fill="#c8c0a8" letterSpacing="0.15em">02</text>
        <text x="355" y="118" textAnchor="middle" fontFamily="Georgia,serif" fontSize="9" fill="#c8c0a8" letterSpacing="0.15em">03</text>
        <text x="510" y="68" textAnchor="middle" fontFamily="Georgia,serif" fontSize="9" fill="#c8c0a8" letterSpacing="0.15em">04</text>
        <text x="640" y="136" textAnchor="middle" fontFamily="Georgia,serif" fontSize="9" fill="#c8c0a8" letterSpacing="0.15em">05</text>
      </svg>
    </div>
  );
}
