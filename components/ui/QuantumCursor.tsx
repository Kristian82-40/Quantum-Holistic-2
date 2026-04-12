'use client'
import { useEffect, useRef } from 'react'

export default function QuantumCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const e1Ref = useRef<HTMLDivElement>(null)
  const e2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot = dotRef.current!
    const e1 = e1Ref.current!
    const e2 = e2Ref.current!
    let x = 0, y = 0, t = 0

    const onMove = (e: MouseEvent) => { x = e.clientX; y = e.clientY }
    document.addEventListener('mousemove', onMove)

    function animate() {
      t += 0.04
      dot.style.transform = `translate(${x-3}px,${y-3}px)`
      // Electrón 1 — órbita rápida
      const r1 = 14
      e1.style.transform = `translate(${x + Math.cos(t)*r1 - 2}px,${y + Math.sin(t)*r1 - 2}px)`
      // Electrón 2 — órbita lenta opuesta
      const r2 = 22
      e2.style.transform = `translate(${x + Math.cos(-t*0.6)*r2 - 1.5}px,${y + Math.sin(-t*0.6)*r2 - 1.5}px)`
      requestAnimationFrame(animate)
    }
    animate()

    return () => document.removeEventListener('mousemove', onMove)
  }, [])

  const base: React.CSSProperties = {
    position:'fixed',top:0,left:0,borderRadius:'50%',
    pointerEvents:'none',zIndex:99999
  }

  return (
    <>
      <div ref={dotRef} style={{...base,width:6,height:6,background:'#6B7C5E'}}/>
      <div ref={e1Ref} style={{...base,width:4,height:4,background:'#C9A84C',opacity:0.7}}/>
      <div ref={e2Ref} style={{...base,width:3,height:3,background:'#A8B89A',opacity:0.5}}/>
    </>
  )
}
