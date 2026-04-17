import styles from './Illustrations.module.css';

export default function PlantaMedicinal({ size = 160 }: { size?: number }) {
  return (
    <svg
      className={styles.plantaMedicinal}
      width={size}
      height={size}
      viewBox="0 0 160 200"
      fill="none"
      aria-hidden
    >
      {/* Roots */}
      <path d="M80 185 C80 185 60 175 50 165 C45 158 55 152 60 160 C65 168 80 175 80 185Z" stroke="#8b4513" strokeWidth="0.8" fill="rgba(139,69,19,0.08)"/>
      <path d="M80 185 C80 185 100 175 110 165 C115 158 105 152 100 160 C95 168 80 175 80 185Z" stroke="#8b4513" strokeWidth="0.8" fill="rgba(139,69,19,0.08)"/>
      <path d="M80 185 C80 185 70 172 62 168 C56 164 54 157 62 158 C68 159 78 170 80 185Z" stroke="#8b4513" strokeWidth="0.6" fill="rgba(139,69,19,0.06)"/>
      {/* Main stem */}
      <path d="M80 185 C80 185 78 140 80 100 C81 70 80 40 80 20" stroke="#2d5a27" strokeWidth="1.2" strokeLinecap="round"/>
      {/* Left branch */}
      <path d="M80 140 C80 140 55 128 40 115" stroke="#2d5a27" strokeWidth="0.9" strokeLinecap="round"/>
      {/* Left leaf */}
      <path d="M80 140 C80 140 55 115 40 115 C40 115 50 130 80 140Z" stroke="#2d5a27" strokeWidth="0.8" fill="rgba(45,90,39,0.18)"/>
      {/* Right branch */}
      <path d="M80 118 C80 118 105 106 118 92" stroke="#2d5a27" strokeWidth="0.9" strokeLinecap="round"/>
      {/* Right leaf */}
      <path d="M80 118 C80 118 108 96 118 92 C118 92 106 110 80 118Z" stroke="#2d5a27" strokeWidth="0.8" fill="rgba(45,90,39,0.18)"/>
      {/* Left small branch */}
      <path d="M80 95 C80 95 62 85 54 75" stroke="#1a3a2a" strokeWidth="0.7" strokeLinecap="round"/>
      <path d="M80 95 C80 95 57 73 54 75 C54 75 63 88 80 95Z" stroke="#1a3a2a" strokeWidth="0.6" fill="rgba(26,58,42,0.14)"/>
      {/* Right small branch */}
      <path d="M80 78 C80 78 96 68 104 58" stroke="#1a3a2a" strokeWidth="0.7" strokeLinecap="round"/>
      <path d="M80 78 C80 78 105 60 104 58 C104 58 94 72 80 78Z" stroke="#1a3a2a" strokeWidth="0.6" fill="rgba(26,58,42,0.14)"/>
      {/* Flowers at top */}
      <circle cx="80" cy="20" r="6" stroke="#d4a853" strokeWidth="0.9" fill="rgba(212,168,83,0.15)" className={styles.pulse}/>
      {[0,72,144,216,288].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <ellipse
            key={i}
            cx={80 + 8 * Math.cos(rad)}
            cy={20 + 8 * Math.sin(rad)}
            rx="3.5" ry="2.5"
            transform={`rotate(${deg},${80 + 8 * Math.cos(rad)},${20 + 8 * Math.sin(rad)})`}
            stroke="#d4a853"
            strokeWidth="0.7"
            fill="rgba(212,168,83,0.2)"
          />
        );
      })}
      {/* Small secondary flower */}
      <circle cx="54" cy="75" r="4" stroke="#d4a853" strokeWidth="0.7" fill="rgba(212,168,83,0.12)" className={styles.pulse}/>
      {/* Dew drops */}
      <circle cx="62" cy="120" r="1.5" fill="rgba(245,230,211,0.5)"/>
      <circle cx="100" cy="100" r="1" fill="rgba(245,230,211,0.4)"/>
    </svg>
  );
}
