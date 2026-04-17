'use client'
import { useEffect, useState } from 'react'

interface Petal {
  id: number
  x: number
  delay: number
  duration: number
  size: number
  rotation: number
  drift: number
  color: string
  shape: number
}

const COLORS = [
  'rgba(255,192,203,0.82)',
  'rgba(255,218,224,0.88)',
  'rgba(255,240,245,0.75)',
  'rgba(248,200,220,0.80)',
  'rgba(230,210,235,0.78)',
  'rgba(245,225,215,0.85)',
  'rgba(255,245,230,0.80)',
  'rgba(210,195,230,0.72)',
]

function makePetals(n: number): Petal[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    x: Math.random() * 108 - 4,
    delay: Math.random() * 20,
    duration: 7 + Math.random() * 9,
    size: 9 + Math.random() * 16,
    rotation: Math.random() * 360,
    drift: (Math.random() - 0.5) * 130,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: Math.floor(Math.random() * 4),
  }))
}

export default function PetalEffect({ count = 26 }: { count?: number }) {
  const [petals, setPetals] = useState<Petal[]>([])

  useEffect(() => {
    setPetals(makePetals(count))
  }, [count])

  if (petals.length === 0) return null

  return (
    <>
      <style>{`
        @keyframes fall {
          0%   { transform: translateY(-70px) translateX(0) rotate(0deg); opacity: 0; }
          6%   { opacity: 1; }
          88%  { opacity: 0.85; }
          100% { transform: translateY(112vh) translateX(var(--petal-drift)) rotate(var(--petal-spin)); opacity: 0; }
        }
        @keyframes sway {
          0%, 100% { margin-left: 0; }
          33%       { margin-left: 14px; }
          66%       { margin-left: -8px; }
        }
        .qh-petal-wrap {
          position: fixed;
          top: -30px;
          pointer-events: none;
          z-index: 9990;
          animation:
            fall  var(--petal-dur) var(--petal-delay) ease-in infinite,
            sway  calc(var(--petal-dur) * 0.55) var(--petal-delay) ease-in-out infinite;
        }
      `}</style>
      <div aria-hidden="true">
        {petals.map((p) => (
          <div
            key={p.id}
            className="qh-petal-wrap"
            style={{
              left: `${p.x}vw`,
              '--petal-dur':   `${p.duration}s`,
              '--petal-delay': `${p.delay}s`,
              '--petal-drift': `${p.drift}px`,
              '--petal-spin':  `${p.rotation + 360}deg`,
            } as React.CSSProperties}
          >
            {p.shape === 0 && (
              <svg width={p.size} height={p.size * 1.35} viewBox="0 0 20 27" fill={p.color}>
                <path d="M10 0 C14 4 18 9 18 15 C18 21 14 27 10 27 C6 27 2 21 2 15 C2 9 6 4 10 0Z"/>
              </svg>
            )}
            {p.shape === 1 && (
              <svg width={p.size * 1.25} height={p.size} viewBox="0 0 25 18" fill={p.color}>
                <path d="M12 1 C17 1 23 5 23 9 C23 14 18 17 12 17 C6 17 2 14 2 9 C2 5 7 1 12 1Z"/>
              </svg>
            )}
            {p.shape === 2 && (
              <svg width={p.size} height={p.size} viewBox="0 0 20 20" fill={p.color}>
                <path d="M10 0 C13 5 20 7 15 12 C18 18 10 20 10 20 C10 20 2 18 5 12 C0 7 7 5 10 0Z"/>
              </svg>
            )}
            {p.shape === 3 && (
              <div style={{
                width: p.size,
                height: p.size * 1.2,
                background: p.color,
                borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
              }} />
            )}
          </div>
        ))}
      </div>
    </>
  )
}
