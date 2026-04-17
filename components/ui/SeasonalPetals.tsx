'use client'
import { useEffect, useState, useRef } from 'react'

const SPRING_MONTHS = [2, 3, 4] // marzo-mayo

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
  'rgba(255,192,203,0.85)',
  'rgba(255,218,224,0.9)',
  'rgba(255,240,245,0.8)',
  'rgba(248,200,220,0.85)',
  'rgba(255,175,185,0.7)',
]

function generatePetals(count: number): Petal[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 110 - 5,
    delay: Math.random() * 18,
    duration: 6 + Math.random() * 8,
    size: 8 + Math.random() * 14,
    rotation: Math.random() * 360,
    drift: (Math.random() - 0.5) * 120,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: Math.floor(Math.random() * 3),
  }))
}

export default function SeasonalPetals() {
  const [petals, setPetals] = useState<Petal[]>([])
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const month = new Date().getMonth()
    if (!SPRING_MONTHS.includes(month)) return
    if (sessionStorage.getItem('qh_petals_shown')) return

    sessionStorage.setItem('qh_petals_shown', '1')
    setPetals(generatePetals(40))
    setVisible(true)

    timerRef.current = setTimeout(() => setVisible(false), 22000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  if (!visible || petals.length === 0) return null

  return (
    <>
      <style>{`
        @keyframes petalFall {
          0%   { transform: translateY(-60px) translateX(0) rotate(0deg); opacity: 0; }
          5%   { opacity: 1; }
          85%  { opacity: 0.9; }
          100% { transform: translateY(110vh) translateX(var(--drift)) rotate(var(--spin)); opacity: 0; }
        }
        @keyframes petalSway {
          0%, 100% { margin-left: 0; }
          50%       { margin-left: 18px; }
        }
        .qh-petal {
          position: fixed;
          top: -20px;
          pointer-events: none;
          z-index: 99980;
          animation: petalFall var(--dur) var(--delay) ease-in forwards,
                     petalSway calc(var(--dur) * 0.6) var(--delay) ease-in-out infinite;
        }
        .qh-petals-fade {
          animation: petalsFadeOut 1s ease forwards;
        }
        @keyframes petalsFadeOut {
          to { opacity: 0; }
        }
      `}</style>
      <div aria-hidden>
        {petals.map(p => (
          <div
            key={p.id}
            className="qh-petal"
            style={{
              left: `${p.x}vw`,
              '--dur': `${p.duration}s`,
              '--delay': `${p.delay}s`,
              '--drift': `${p.drift}px`,
              '--spin': `${p.rotation + 360}deg`,
            } as React.CSSProperties}
          >
            {p.shape === 0 && (
              <svg width={p.size} height={p.size * 1.3} viewBox="0 0 20 26" fill={p.color}>
                <path d="M10 0 C14 4 18 8 18 14 C18 20 14 26 10 26 C6 26 2 20 2 14 C2 8 6 4 10 0Z"/>
              </svg>
            )}
            {p.shape === 1 && (
              <svg width={p.size * 1.2} height={p.size} viewBox="0 0 24 18" fill={p.color}>
                <path d="M12 1 C16 1 22 5 22 9 C22 14 18 17 12 17 C6 17 2 14 2 9 C2 5 8 1 12 1Z"/>
              </svg>
            )}
            {p.shape === 2 && (
              <svg width={p.size} height={p.size} viewBox="0 0 20 20" fill={p.color}>
                <path d="M10 0 C13 5 20 7 15 12 C18 18 10 20 10 20 C10 20 2 18 5 12 C0 7 7 5 10 0Z"/>
              </svg>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
