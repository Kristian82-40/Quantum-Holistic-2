'use client'

import { useRef } from 'react'
import styles from './QuoteRail.module.css'

const quotes = [
  { text: "Que tu alimento sea tu medicina y tu medicina sea tu alimento.", author: "Hipócrates" },
  { text: "Cuando la dieta es incorrecta, la medicina no sirve. Cuando la dieta es correcta, no se necesita medicina.", author: "Proverbio ayurvédico" },
  { text: "La naturaleza es el médico de las enfermedades.", author: "Hipócrates" },
  { text: "El cuerpo tiene la sabiduría para curarse a sí mismo cuando se le da lo que necesita.", author: "Deepak Chopra" },
  { text: "Las plantas son los maestros más antiguos de la humanidad.", author: "Stephen Harrod Buhner" },
  { text: "La salud no es simplemente la ausencia de enfermedad, sino una expresión de vida.", author: "Rudolph Ballentine" },
  { text: "El silencio es el lenguaje de Dios; todo lo demás es mala traducción.", author: "Rumi" },
  { text: "Respirar es el puente entre la mente y el cuerpo.", author: "Thich Nhat Hanh" },
  { text: "La mente y el cuerpo son un solo sistema inteligente.", author: "Andrew Weil" },
  { text: "Todo lo que necesitas para tu curación ya existe en la naturaleza.", author: "Rosemary Gladstar" },
  { text: "La enfermedad habla el lenguaje del alma que ha sido ignorada.", author: "Caroline Myss" },
  { text: "Somos lo que repetidamente hacemos. La excelencia no es un acto, sino un hábito.", author: "Aristóteles" },
]

export default function QuoteRail() {
  const trackRef = useRef<HTMLDivElement>(null)

  return (
    <div className={styles.rail}>
      <div ref={trackRef} className={styles.track}>
        {[...quotes, ...quotes].map((q, i) => (
          <div key={i} className={styles.item}>
            <span className={styles.diamond} />
            <span className={styles.quote}>{q.text}</span>
            <span className={styles.author}>— {q.author}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
