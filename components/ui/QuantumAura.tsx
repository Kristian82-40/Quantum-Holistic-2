'use client'
import { useEffect, useState } from 'react'

interface AuraItem {
  type: string
  icon: string
  content: string
  tip: string
  color: string
}

export default function QuantumAura() {
  const [aura, setAura] = useState<AuraItem | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout

    const getAura = async () => {
      const res = await fetch('/data/aura.json')
      const data = await res.json()
      const hour = new Date().getHours()
      const profile = localStorage.getItem('qh_goal')
      if (profile === 'detox') return data.detox
      if (profile === 'energia') return data.energy
      if (hour >= 6 && hour < 12) return data.morning
      if (hour >= 12 && hour < 19) return data.afternoon
      if (hour >= 19) return data.night
      return data.default
    }

    const showAura = async () => {
      const item = await getAura()
      setAura(item)
      setVisible(true)
    }

    const resetTimer = () => {
      clearTimeout(timer)
      timer = setTimeout(showAura, 45000)
    }

    const events = ['mousemove','keydown','scroll','click','touchstart']
    events.forEach(e => window.addEventListener(e, resetTimer))
    resetTimer()

    return () => {
      clearTimeout(timer)
      events.forEach(e => window.removeEventListener(e, resetTimer))
    }
  }, [])

  if (!visible || !aura) return null

  return (
    <div style={{
      position:'fixed', bottom:'24px', right:'24px',
      background:'#1E2B1A', border:`1px solid ${aura.color}`,
      borderRadius:'16px', padding:'20px 24px',
      maxWidth:'300px', zIndex:99990,
      boxShadow:'0 8px 32px rgba(0,0,0,0.3)',
      animation:'slideIn 0.5s ease'
    }}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <button onClick={() => setVisible(false)} style={{
        position:'absolute', top:'10px', right:'12px',
        background:'none', border:'none', color:'#A8B89A',
        cursor:'pointer', fontSize:'16px'
      }}>×</button>
      <p style={{color:aura.color, fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 8px'}}>
        {aura.icon} {aura.type}
      </p>
      <p style={{color:'#F0E4C0', fontSize:'16px', fontFamily:'Cormorant Garamond, serif', fontWeight:300, margin:'0 0 8px', lineHeight:1.4}}>
        {aura.content}
      </p>
      <p style={{color:'#A8B89A', fontSize:'12px', margin:0, lineHeight:1.6}}>
        {aura.tip}
      </p>
    </div>
  )
}
