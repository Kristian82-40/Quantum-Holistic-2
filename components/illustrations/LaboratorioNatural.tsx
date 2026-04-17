import styles from './Illustrations.module.css';

export default function LaboratorioNatural({ size = 180 }: { size?: number }) {
  return (
    <svg className={styles.laboratorioNatural} width={size} height={size} viewBox="0 0 180 200" fill="none" aria-hidden>
      <path d="M40 130 C38 145 42 165 50 170 C60 176 120 176 130 170 C138 165 142 145 140 130Z" stroke="#8b4513" strokeWidth="1" fill="rgba(139,69,19,0.1)"/>
      <ellipse cx="90" cy="130" rx="52" ry="12" stroke="#8b4513" strokeWidth="1" fill="rgba(139,69,19,0.08)"/>
      <rect x="84" y="90" width="12" height="50" rx="6" stroke="#8b4513" strokeWidth="0.8" fill="rgba(139,69,19,0.06)"/>
      <path d="M60 130 C65 120 72 115 78 122 C82 126 80 132 75 134" stroke="#2d5a27" strokeWidth="0.8" fill="none"/>
      <path d="M62 128 C62 128 56 118 62 114 C68 110 72 122 62 128Z" fill="rgba(45,90,39,0.25)" stroke="#2d5a27" strokeWidth="0.6"/>
      <path d="M110 126 C110 126 116 116 110 112 C104 108 100 120 110 126Z" fill="rgba(45,90,39,0.25)" stroke="#2d5a27" strokeWidth="0.6"/>
      <circle cx="65" cy="65" r="7" stroke="#d4a853" strokeWidth="0.8" fill="rgba(212,168,83,0.12)" className={styles.pulse}/>
      <circle cx="90" cy="45" r="9" stroke="#d4a853" strokeWidth="0.8" fill="rgba(212,168,83,0.15)" className={styles.pulse}/>
      <circle cx="115" cy="62" r="7" stroke="#d4a853" strokeWidth="0.8" fill="rgba(212,168,83,0.12)" className={styles.pulse}/>
      <line x1="72" y1="62" x2="83" y2="52" stroke="#d4a853" strokeWidth="0.6" opacity="0.5"/>
      <line x1="97" y1="52" x2="108" y2="60" stroke="#d4a853" strokeWidth="0.6" opacity="0.5"/>
      <path d="M75 125 C73 110 77 98 74 85" stroke="#2d5a27" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.4"/>
      <path d="M90 122 C90 108 92 96 90 82" stroke="#2d5a27" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.4"/>
    </svg>
  );
}
