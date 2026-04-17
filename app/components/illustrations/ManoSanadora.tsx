import styles from './Illustrations.module.css';

export default function ManoSanadora({ size = 200 }: { size?: number }) {
  return (
    <svg
      className={styles.manoSanadora}
      width={size}
      height={size}
      viewBox="0 0 200 220"
      fill="none"
      aria-hidden
    >
      {/* Palm */}
      <path
        d="M55 140 C50 120 48 100 50 80 C52 65 65 58 72 70 C72 70 70 50 74 38 C77 28 90 28 92 40 L92 70 C92 70 94 42 98 35 C102 28 114 30 114 42 L112 72 C112 72 116 48 120 44 C124 40 134 44 132 58 L128 78 C128 78 132 62 138 60 C144 58 148 66 146 76 L142 100 C150 92 158 96 156 108 C154 120 140 130 130 140 C120 150 110 155 100 158 C80 162 58 158 55 140Z"
        stroke="#2d5a27"
        strokeWidth="1"
        fill="rgba(45,90,39,0.06)"
      />
      {/* Palm lines */}
      <path d="M68 110 C80 108 95 110 108 106" stroke="#2d5a27" strokeWidth="0.5" opacity="0.4" strokeLinecap="round"/>
      <path d="M62 125 C75 122 90 124 105 120" stroke="#2d5a27" strokeWidth="0.5" opacity="0.3" strokeLinecap="round"/>
      {/* Leaf from index finger */}
      <path d="M92 40 C88 22 82 10 80 2 C80 2 88 0 94 12 C98 20 96 32 92 40Z" stroke="#d4a853" strokeWidth="0.8" fill="rgba(212,168,83,0.15)" className={styles.pulse}/>
      <line x1="88" y1="22" x2="92" y2="40" stroke="#d4a853" strokeWidth="0.5" opacity="0.4"/>
      {/* Leaf from middle finger */}
      <path d="M112 42 C112 24 108 12 104 4 C104 4 114 6 116 18 C118 28 116 36 112 42Z" stroke="#2d5a27" strokeWidth="0.8" fill="rgba(45,90,39,0.15)" className={styles.pulse}/>
      {/* Small flower on ring finger */}
      {[0, 72, 144, 216, 288].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <ellipse
            key={i}
            cx={128 + 5 * Math.cos(rad)}
            cy={50 + 5 * Math.sin(rad)}
            rx="2.5" ry="1.8"
            transform={`rotate(${deg},${128 + 5 * Math.cos(rad)},${50 + 5 * Math.sin(rad)})`}
            stroke="#d4a853" strokeWidth="0.6" fill="rgba(212,168,83,0.2)"
          />
        );
      })}
      <circle cx="128" cy="50" r="2" fill="#d4a853" opacity="0.5"/>
      {/* Energy aura around hand */}
      <path
        d="M42 138 C36 115 36 90 40 70 C44 52 58 44 66 56"
        stroke="#d4a853" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.3"
        className={styles.pulse}
      />
      <path
        d="M158 106 C162 90 158 72 150 60 C144 50 136 46 130 54"
        stroke="#d4a853" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.3"
        className={styles.pulse}
      />
      {/* Sparkles */}
      <circle cx="76" cy="15" r="1.5" fill="#f5e6d3" opacity="0.6"/>
      <circle cx="108" cy="10" r="1" fill="#d4a853" opacity="0.7"/>
      <circle cx="140" cy="38" r="1.5" fill="#f5e6d3" opacity="0.5"/>
    </svg>
  );
}
