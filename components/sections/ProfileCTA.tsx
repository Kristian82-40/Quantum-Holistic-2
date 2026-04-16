'use client'
import { useState } from 'react'
import styles from './ProfileCTA.module.css'

interface QuantumResult {
  estado: string
  probabilidad: string
  recomendacion: string
}

interface ProfileResult {
  plan: string
  quantum: QuantumResult | null
}

export default function ProfileCTA() {
  const [goal, setGoal] = useState('')
  const [diet, setDiet] = useState('')
  const [lifestyle, setLifestyle] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ProfileResult | null>(null)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!goal || !diet || !lifestyle) {
      setError('Por favor completa todos los campos')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/profile/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, diet, lifestyle }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error generando el plan')
    } finally {
      setLoading(false)
    }
  }

  function renderPlan(text: string) {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h2 key={i} style={{fontSize:'1.3rem',marginTop:'16px'}}>{line.replace('# ','')}</h2>
      if (line.startsWith('## ')) return <h3 key={i} style={{fontSize:'1.1rem',marginTop:'12px',color:'#6B7C5E'}}>{line.replace('## ','')}</h3>
      if (line.startsWith('### ')) return <h4 key={i} style={{fontSize:'1rem',marginTop:'8px',fontWeight:500}}>{line.replace('### ','')}</h4>
      if (line.startsWith('- ')) return <p key={i} style={{margin:'2px 0',paddingLeft:'12px'}}>• {line.replace('- ','')}</p>
      if (line.startsWith('**')) return <p key={i} style={{margin:'2px 0',fontWeight:500}}>{line.replace(/\*\*/g,'')}</p>
      return <p key={i} style={{margin:'2px 0'}}>{line}</p>
    })
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Tu plan personalizado</h2>
        <p className={styles.subtitle}>Análisis holístico + computación cuántica + IA</p>
        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>¿Cuál es tu objetivo?</label>
            <select className={styles.select} value={goal} onChange={e => setGoal(e.target.value)}>
              <option value="">Selecciona...</option>
              <option value="energia">Ganar energía</option>
              <option value="perder peso">Perder peso</option>
              <option value="detox">Detox y depuración</option>
              <option value="rendimiento cognitivo">Rendimiento cognitivo</option>
              <option value="equilibrio">Equilibrio vital</option>
              <option value="refuerzo inmune">Refuerzo inmune</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>¿Qué tipo de alimentación sigues?</label>
            <select className={styles.select} value={diet} onChange={e => setDiet(e.target.value)}>
              <option value="">Selecciona...</option>
              <option value="vegetariana">Vegetariana</option>
              <option value="vegana">Vegana</option>
              <option value="mediterránea">Mediterránea</option>
              <option value="macrobiótica">Macrobiótica</option>
              <option value="omnívora">Omnívora</option>
              <option value="sin gluten">Sin gluten</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>¿Cómo es tu estilo de vida?</label>
            <select className={styles.select} value={lifestyle} onChange={e => setLifestyle(e.target.value)}>
              <option value="">Selecciona...</option>
              <option value="sedentario">Sedentario</option>
              <option value="ligero">Ligero</option>
              <option value="moderado">Moderado</option>
              <option value="activo">Activo</option>
              <option value="muy_activo">Muy activo</option>
            </select>
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.button} onClick={handleSubmit} disabled={loading}>
            {loading ? '⚛️ Analizando con IA cuántica...' : '🌿 Generar mi plan'}
          </button>
        </div>
        {result && (
          <div className={styles.result}>
            {result.quantum && (
              <div className={styles.quantum}>
                <h3 className={styles.quantumTitle}>⚛️ Análisis cuántico</h3>
                <div className={styles.quantumGrid}>
                  <div className={styles.quantumItem}>
                    <span className={styles.quantumLabel}>Estado cuántico</span>
                    <span className={styles.quantumValue}>{result.quantum.estado}</span>
                  </div>
                  <div className={styles.quantumItem}>
                    <span className={styles.quantumLabel}>Probabilidad</span>
                    <span className={styles.quantumValue}>{result.quantum.probabilidad}</span>
                  </div>
                  <div className={styles.quantumItem}>
                    <span className={styles.quantumLabel}>Recomendación</span>
                    <span className={styles.quantumValue}>{result.quantum.recomendacion}</span>
                  </div>
                </div>
              </div>
            )}
            <div className={styles.plan}>
              <h3 className={styles.planTitle}>🌿 Tu plan nutricional</h3>
              <div className={styles.planContent}>
                {renderPlan(result.plan)}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
