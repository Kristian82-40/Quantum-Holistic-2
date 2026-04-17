'use client'
import { useEffect, useState } from 'react'

export default function RomeroPopup() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('qh_romero_seen')) return
    const t = setTimeout(() => setOpen(true), 3200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (open) {
      setMounted(true)
      localStorage.setItem('qh_romero_seen', '1')
    }
  }, [open])

  const close = () => setOpen(false)

  if (!mounted) return null

  return (
    <>
      <style>{`
        .qh-romero-overlay {
          position: fixed; inset: 0;
          background: rgba(14,18,12,0.55);
          z-index: 99985;
          display: flex; align-items: center; justify-content: center;
          padding: 1.5rem;
          animation: overlayIn 0.4s ease;
        }
        .qh-romero-card {
          background: linear-gradient(145deg, #1a2314 0%, #0f1a0c 100%);
          border: 1px solid rgba(168,184,154,0.25);
          border-radius: 24px;
          padding: 2.5rem;
          max-width: 480px;
          width: 100%;
          position: relative;
          box-shadow: 0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(107,124,94,0.1);
          animation: cardIn 0.5s cubic-bezier(0.16,1,0.3,1);
        }
        .qh-romero-card:not(.qh-open) {
          animation: cardOut 0.35s ease forwards;
        }
        @keyframes overlayIn { from { opacity:0 } to { opacity:1 } }
        @keyframes cardIn    { from { opacity:0; transform:translateY(24px) scale(0.96) } to { opacity:1; transform:none } }
        @keyframes cardOut   { from { opacity:1; transform:none } to { opacity:0; transform:translateY(16px) scale(0.97) } }
        .qh-romero-close {
          position: absolute; top: 16px; right: 18px;
          background: rgba(168,184,154,0.1); border: none;
          color: #A8B89A; cursor: pointer; font-size: 18px;
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .qh-romero-close:hover { background: rgba(168,184,154,0.2); }
        .qh-romero-tag {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
          color: #6B7C5E; margin: 0 0 1rem;
        }
        .qh-romero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem; font-weight: 300; line-height: 1.2;
          color: #F0E4C0; margin: 0 0 0.75rem;
        }
        .qh-romero-title em { color: #C9A84C; font-style: italic; }
        .qh-romero-body {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; line-height: 1.7;
          color: #A8B89A; margin: 0 0 1.75rem;
        }
        .qh-romero-actions {
          display: flex; gap: 0.75rem; flex-wrap: wrap;
        }
        .qh-romero-btn-primary {
          flex: 1; min-width: 140px;
          background: linear-gradient(135deg, #6B7C5E, #A8B89A);
          color: #1a2314; border: none; border-radius: 100px;
          padding: 0.75rem 1.5rem; font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem; font-weight: 500; cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
        }
        .qh-romero-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .qh-romero-btn-secondary {
          background: none; border: 1px solid rgba(168,184,154,0.25);
          color: #A8B89A; border-radius: 100px;
          padding: 0.75rem 1.25rem; font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem; cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .qh-romero-btn-secondary:hover { border-color: rgba(168,184,154,0.5); color: #F0E4C0; }
        .qh-romero-plant {
          position: absolute; bottom: 0; right: 0;
          opacity: 0.08; pointer-events: none;
          border-radius: 0 0 24px 0; overflow: hidden;
        }
      `}</style>

      <div className="qh-romero-overlay" onClick={e => { if (e.target === e.currentTarget) close() }}>
        <div className={`qh-romero-card ${open ? 'qh-open' : ''}`}>
          <button className="qh-romero-close" onClick={close} aria-label="Cerrar">×</button>

          {/* Botanical decoration */}
          <div className="qh-romero-plant">
            <svg width="180" height="180" viewBox="0 0 200 200" fill="none">
              <path d="M180 200 C180 200 80 160 60 80 C45 20 100 0 100 0" stroke="#A8B89A" strokeWidth="1.5"/>
              <path d="M100 120 C100 120 60 100 50 70" stroke="#A8B89A" strokeWidth="1"/>
              <path d="M100 120 C100 120 140 100 150 70" stroke="#A8B89A" strokeWidth="1"/>
              <path d="M100 160 C100 160 68 145 58 118" stroke="#A8B89A" strokeWidth="0.8"/>
              <path d="M100 160 C100 160 132 145 142 118" stroke="#A8B89A" strokeWidth="0.8"/>
              <ellipse cx="52" cy="68" rx="16" ry="8" fill="#6B7C5E" transform="rotate(-30 52 68)"/>
              <ellipse cx="148" cy="68" rx="16" ry="8" fill="#6B7C5E" transform="rotate(30 148 68)"/>
            </svg>
          </div>

          <p className="qh-romero-tag">🌿 Planta del mes · Primavera</p>
          <h2 className="qh-romero-title">
            El <em>Romero Silvestre</em><br />y tu sistema nervioso
          </h2>
          <p className="qh-romero-body">
            El romero silvestre (<em>Rosmarinus officinalis</em>) es una de las plantas
            más potentes para la memoria y la circulación cerebral. Su aceite esencial
            activa el sistema nervioso simpático y mejora la concentración en solo
            20 minutos de exposición.
            <br /><br />
            Este mes, nuestros planes Pro incluyen un protocolo de aromaterapia y
            tintura de romero adaptado a tu perfil metabólico.
          </p>

          <div className="qh-romero-actions">
            <button
              className="qh-romero-btn-primary"
              onClick={() => { close(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }) }}
            >
              Ver mi plan personalizado
            </button>
            <button className="qh-romero-btn-secondary" onClick={close}>
              Solo estoy explorando
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
