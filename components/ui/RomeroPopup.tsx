'use client'
import { useEffect, useState, useCallback } from 'react'
import styles from './RomeroPopup.module.css'

export default function RomeroPopup() {
  const [state, setState] = useState<'hidden' | 'visible' | 'closing'>('hidden')

  useEffect(() => {
    if (localStorage.getItem('qh_romero_seen')) return
    const t = setTimeout(() => setState('visible'), 3200)
    return () => clearTimeout(t)
  }, [])

  const close = useCallback(() => {
    setState('closing')
    localStorage.setItem('qh_romero_seen', '1')
    setTimeout(() => setState('hidden'), 380)
  }, [])

  if (state === 'hidden') return null

  const isClosing = state === 'closing'

  return (
    <div
      className={`${styles.overlay} ${isClosing ? styles.overlayHide : ''}`}
      onClick={e => { if (e.target === e.currentTarget) close() }}
    >
      <div className={`${styles.card} ${isClosing ? styles.cardHide : ''}`}>
        <button className={styles.closeBtn} onClick={close} aria-label="Cerrar">×</button>

        {/* Botanical background decoration */}
        <svg className={styles.botanical} viewBox="0 0 220 220" fill="none" aria-hidden>
          <path d="M110 10 C110 10 30 70 30 130 C30 175 65 210 110 210 C155 210 190 175 190 130 C190 70 110 10 110 10Z" stroke="#A8B89A" strokeWidth="1.5"/>
          <path d="M110 210 L110 90" stroke="#A8B89A" strokeWidth="1"/>
          <path d="M110 155 C110 155 68 130 50 95" stroke="#A8B89A" strokeWidth="0.8"/>
          <path d="M110 155 C110 155 152 130 170 95" stroke="#A8B89A" strokeWidth="0.8"/>
          <path d="M110 120 C110 120 76 102 62 74" stroke="#A8B89A" strokeWidth="0.7"/>
          <path d="M110 120 C110 120 144 102 158 74" stroke="#A8B89A" strokeWidth="0.7"/>
          <ellipse cx="50" cy="93" rx="22" ry="10" fill="#6B7C5E" transform="rotate(-30 50 93)"/>
          <ellipse cx="170" cy="93" rx="22" ry="10" fill="#6B7C5E" transform="rotate(30 170 93)"/>
          <ellipse cx="62" cy="72" rx="16" ry="8" fill="#6B7C5E" transform="rotate(-25 62 72)"/>
          <ellipse cx="158" cy="72" rx="16" ry="8" fill="#6B7C5E" transform="rotate(25 158 72)"/>
          <circle cx="110" cy="210" r="4" fill="#6B7C5E" opacity="0.5"/>
          <circle cx="110" cy="90" r="3" fill="#A8B89A" opacity="0.4"/>
        </svg>

        <p className={styles.tag}>🌿 Planta del mes · Primavera 2026</p>

        <h2 className={styles.title}>
          El <em>Romero Silvestre</em><br />
          y tu sistema nervioso
        </h2>

        <div className={styles.divider} />

        <span className={styles.highlight}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="#A8B89A" strokeWidth="1"/>
            <path d="M6 3V6.5L8 8" stroke="#A8B89A" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          Rosmarinus officinalis · Temporada alta
        </span>

        <p className={styles.body}>
          El romero silvestre es una de las plantas más estudiadas para la memoria
          y la circulación cerebral. Su aceite esencial activa el sistema nervioso
          simpático mejorando la concentración en solo 20 minutos de exposición.
          <br /><br />
          Este mes, los planes <em>Quantum Pro</em> incluyen un protocolo completo
          de aromaterapia y tintura de romero, adaptado a tu perfil metabólico
          y al ritmo estacional de tu zona.
        </p>

        <div className={styles.actions}>
          <button
            className={styles.btnPrimary}
            onClick={() => {
              close()
              setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 400)
            }}
          >
            Ver mi plan personalizado →
          </button>
          <button className={styles.btnSecondary} onClick={close}>
            Solo estoy explorando
          </button>
        </div>
      </div>
    </div>
  )
}
