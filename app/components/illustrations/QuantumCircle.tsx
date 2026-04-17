import styles from './Illustrations.module.css';

export default function QuantumCircle({ size = 340 }: { size?: number }) {
  return (
    <svg
      className={styles.quantumCircle}
      width={size}
      height={size}
      viewBox="0 0 340 340"
      fill="none"
      aria-hidden
    >
      {/* Outer ring */}
      <circle cx="170" cy="170" r="158" stroke="#d4a853" strokeWidth="0.6" opacity="0.35" />
      {/* Tick marks on outer ring */}
      {Array.from({ length: 24 }, (_, i) => {
        const angle = (i * 15 * Math.PI) / 180;
        const r1 = 152, r2 = i % 6 === 0 ? 140 : 147;
        return (
          <line
            key={i}
            x1={170 + r1 * Math.cos(angle)}
            y1={170 + r1 * Math.sin(angle)}
            x2={170 + r2 * Math.cos(angle)}
            y2={170 + r2 * Math.sin(angle)}
            stroke="#d4a853"
            strokeWidth="0.8"
            opacity={i % 6 === 0 ? '0.6' : '0.25'}
          />
        );
      })}
      {/* Rotating ring */}
      <circle
        cx="170"
        cy="170"
        r="130"
        stroke="#2d5a27"
        strokeWidth="1"
        strokeDasharray="8 6"
        opacity="0.5"
        className={styles.rotateSlowCCW}
      />
      {/* Sacred geometry — flower of life petals */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i * 60 * Math.PI) / 180;
        const cx = 170 + 48 * Math.cos(angle);
        const cy = 170 + 48 * Math.sin(angle);
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="48"
            stroke="#f5e6d3"
            strokeWidth="0.5"
            opacity="0.12"
          />
        );
      })}
      {/* Inner circle */}
      <circle cx="170" cy="170" r="48" stroke="#d4a853" strokeWidth="0.8" opacity="0.4" />
      {/* Rotating triangle */}
      <polygon
        points="170,110 220,200 120,200"
        stroke="#d4a853"
        strokeWidth="0.7"
        fill="none"
        opacity="0.3"
        className={styles.rotateSlow}
      />
      {/* Inverted triangle */}
      <polygon
        points="170,230 120,140 220,140"
        stroke="#2d5a27"
        strokeWidth="0.7"
        fill="none"
        opacity="0.3"
        className={styles.rotateSlowCCW}
      />
      {/* Center dot */}
      <circle cx="170" cy="170" r="4" fill="#d4a853" opacity="0.7" className={styles.pulse} />
      {/* Energy lines */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * 45 * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={170 + 55 * Math.cos(angle)}
            y1={170 + 55 * Math.sin(angle)}
            x2={170 + 120 * Math.cos(angle)}
            y2={170 + 120 * Math.sin(angle)}
            stroke="#f5e6d3"
            strokeWidth="0.4"
            opacity="0.15"
          />
        );
      })}
      {/* Second outer dashed ring */}
      <circle
        cx="170"
        cy="170"
        r="110"
        stroke="#f5e6d3"
        strokeWidth="0.5"
        strokeDasharray="3 9"
        opacity="0.2"
        className={styles.rotateSlow}
      />
    </svg>
  );
}
