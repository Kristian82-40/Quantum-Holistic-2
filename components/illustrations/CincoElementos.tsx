import styles from './Illustrations.module.css';

const ELEMENTS = [
  { symbol: '⊕', color: '#8b4513', angle: -90 },
  { symbol: '≋', color: '#1a3a2a', angle: -18 },
  { symbol: '△', color: '#d4a853', angle: 54  },
  { symbol: '◌', color: '#2d5a27', angle: 126 },
  { symbol: '✦', color: '#f5e6d3', angle: 198 },
];

export default function CincoElementos({ size = 200 }: { size?: number }) {
  const cx = 100, cy = 100, r = 72;
  const pts = ELEMENTS.map(({ angle }) => ({ x: cx + r * Math.cos((angle * Math.PI) / 180), y: cy + r * Math.sin((angle * Math.PI) / 180) }));
  return (
    <svg className={styles.cincoElementos} width={size} height={size} viewBox="0 0 200 200" fill="none" aria-hidden>
      <circle cx={cx} cy={cy} r="90" stroke="#d4a853" strokeWidth="0.5" opacity="0.25" strokeDasharray="4 8"/>
      {pts.map((p, i) => <line key={i} x1={p.x} y1={p.y} x2={pts[(i+1)%5].x} y2={pts[(i+1)%5].y} stroke="#d4a853" strokeWidth="0.6" opacity="0.3"/>)}
      {pts.map((p, i) => <line key={`s${i}`} x1={p.x} y1={p.y} x2={pts[(i+2)%5].x} y2={pts[(i+2)%5].y} stroke="#f5e6d3" strokeWidth="0.4" opacity="0.15"/>)}
      {pts.map((p, i) => <line key={`r${i}`} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={ELEMENTS[i].color} strokeWidth="0.5" opacity="0.4"/>)}
      {pts.map((p, i) => (
        <g key={`el${i}`}>
          <circle cx={p.x} cy={p.y} r="16" stroke={ELEMENTS[i].color} strokeWidth="0.8" fill={`${ELEMENTS[i].color}18`} className={styles.pulse}/>
          <text x={p.x} y={p.y+5} textAnchor="middle" fill={ELEMENTS[i].color} fontSize="11" fontFamily="serif" opacity="0.9">{ELEMENTS[i].symbol}</text>
        </g>
      ))}
      <circle cx={cx} cy={cy} r="12" stroke="#d4a853" strokeWidth="0.7" fill="rgba(212,168,83,0.1)" className={styles.pulse}/>
      <circle cx={cx} cy={cy} r="3" fill="#d4a853" opacity="0.6"/>
    </svg>
  );
}
