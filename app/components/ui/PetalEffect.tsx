'use client'
import { useEffect, useState } from 'react'

interface Petal {
  id: number
  y: number
  delay: number
  duration: number
  size: number
  rotation: number
  color: string
  shape: number
  driftY: number
  travel: number
}

const COLORS = [
  'rgba(255,192,203,0.85)',
  'rgba(255,218,224,0.90)',
  'rgba(255,240,245,0.78)',
  'rgba(248,200,220,0.82)',
  'rgba(230,210,235,0.80)',
  'rgba(245,225,215,0.88)',
  'rgba(255,245,230,0.82)',
  'rgba(210,195,230,0.75)',
]

function makePetals(n: number): Petal[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    y: Math.random() * 92 + 2,
    delay: Math.random() * 1.6,
    duration: 3.2 + Math.random() * 1.8,
    size: 10 + Math.random() * 18,
    rotation: Math.random() * 360,
    color: COLORS[i % COLORS.length],
    shape: Math.floor(Math.random() * 4),
    driftY: (Math.random() - 0.5) * 100,
    travel: 115 + Math.floor(Math.random() * 25),
  }))
}

export default function PetalEffect({ count = 34 }: { count?: number }) {
  const [petals, setPetals] = useState<Petal[]>([])
  const [gone, setGone] = useState(false)

  useEffect(() => {
    setPetals(makePetals(count))
    const t = setTimeout(() => setGone(true), 5200)
    return () => clearTimeout(t)
  }, [count])

  if (gone || petals.length === 0) return null

  return (
    <>
      <style>{`
        @keyframes qhWindLeft {
          0%   { opacity: 0; transform: translateX(0) translateY(0) rotate(0deg); }
          7%   { opacity: 1; }
          82%  { opacity: 0.9; }
          100% { opacity: 0; transform: translateX(var(--travel)) translateY(var(--driftY)) rotate(var(--spin)); }
        }
        .qh-petal {
          position: fixed;
          right: -70px;
          pointer-events: none;
          z-index: 9990;
          will-change: transform, opacity;
          animation: qhWindLeft var(--dur) var(--delay) ease-out forwards;
        }
        .qh-petals-root {
          animation: qhWindLeft 0s linear forwards;
        }
      `}</style>
      <div aria-hidden="true">
        {petals.map((p) => (
          <div
            key={p.id}
            className="qh-petal"
            style={{
              top: `${p.y}vh`,
              '--dur':    `${p.duration}s`,
              '--delay':  `${p.delay}s`,
              '--travel': `-${p.travel}vw`,
              '--driftY': `${p.driftY}px`,
              '--spin':   `${p.rotation + 540}deg`,
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
              }}/>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
