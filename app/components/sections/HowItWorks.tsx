import styles from './HowItWorks.module.css';

const STEPS = [
  { num: '01', title: 'Crea tu perfil holístico',    desc: '10 preguntas sobre tu cuerpo, hábitos, entorno y objetivos. En 5 minutos, tu mapa de bienestar personalizado.' },
  { num: '02', title: 'La IA analiza y conecta',      desc: 'Ciencia nutricional + herbología local + tus datos. El sistema construye un protocolo que ningún otro usuario tiene.' },
  { num: '03', title: 'Recibe tu plan personalizado', desc: 'Plan nutricional semanal, plantas para tu zona y rituales adaptados a tu perfil, tu estación y tu objetivo real.' },
  { num: '04', title: 'Evoluciona con el tiempo',     desc: 'El sistema aprende contigo. Con Quantum Pro, además, hablas directamente con el especialista cada mes.' },
] as const;

const SAMPLE_PLAN = [
  { bg: 'sage', label: 'Lunes · Depuración',  body: 'Caldo de ortiga + arroz integral con sésamo' },
  { bg: 'gold', label: 'Planta recomendada',  body: 'Romero local · Digestión y claridad mental' },
  { bg: 'sage', label: 'Ritual matinal',      body: 'Agua tibia + limón + jengibre fresco rallado' },
  { bg: 'pro',  label: 'Quantum Pro · Sesión',body: 'Videollamada jueves 18h · 45 min' },
] as const;

function Alambique() {
  return (
    <svg className={styles.alambique} viewBox="0 0 160 200" fill="none" aria-hidden>
      <path d="M55 90 L40 150 C38 165 42 178 55 182 C65 185 95 185 105 182 C118 178 122 165 120 150 L105 90Z" stroke="rgba(168,216,168,0.6)" strokeWidth="1.5" fill="rgba(168,216,168,0.08)"/>
      <path d="M43 155 C42 162 44 174 55 178 C65 181 95 181 105 178 C116 174 118 162 117 155Z" fill="rgba(45,90,39,0.35)" className={styles.liquid}/>
      <circle cx="65" cy="160" r="4" fill="none" stroke="rgba(168,216,168,0.5)" strokeWidth="0.8" className={styles.bubble1}/>
      <circle cx="90" cy="168" r="3" fill="none" stroke="rgba(168,216,168,0.5)" strokeWidth="0.8" className={styles.bubble2}/>
      <rect x="68" y="52" width="24" height="40" rx="3" stroke="rgba(168,216,168,0.6)" strokeWidth="1.2" fill="rgba(168,216,168,0.05)"/>
      <rect x="64" y="44" width="32" height="12" rx="4" stroke="rgba(168,216,168,0.5)" strokeWidth="1" fill="rgba(168,216,168,0.1)"/>
      <path d="M80 44 C80 30 100 20 100 5" stroke="rgba(168,216,168,0.5)" strokeWidth="1.2" fill="none"/>
      <path d="M96 8 C92 2 98 -4 94 -10" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeLinecap="round" className={styles.vapor1}/>
      <path d="M102 6 C106 0 100 -6 104 -12" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" strokeLinecap="round" className={styles.vapor2}/>
      <line x1="55" y1="184" x2="105" y2="184" stroke="rgba(168,216,168,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="60" y1="184" x2="55" y2="196" stroke="rgba(168,216,168,0.3)" strokeWidth="1" strokeLinecap="round"/>
      <line x1="100" y1="184" x2="105" y2="196" stroke="rgba(168,216,168,0.3)" strokeWidth="1" strokeLinecap="round"/>
      <line x1="55" y1="196" x2="105" y2="196" stroke="rgba(168,216,168,0.3)" strokeWidth="1" strokeLinecap="round"/>
      <path d="M72 198 C72 198 68 190 74 186 C76 192 80 194 80 194 C80 194 80 190 82 186 C88 190 88 198 84 200 C82 194 80 196 80 196 C80 196 74 198 72 198Z" fill="rgba(212,168,83,0.4)" className={styles.flame}/>
    </svg>
  );
}

export default function HowItWorks() {
  return (
    <section className={`section ${styles.how}`} id="how">
      <div className={`container ${styles.inner}`}>
        <div>
          <p className={styles.label}>El proceso</p>
          <h2 className={styles.title}>
            Simple por fuera.<br />
            <em>Profundo</em> por dentro.
          </h2>
          <div className={styles.steps}>
            {STEPS.map((s) => (
              <div key={s.num} className={`${styles.step} reveal`}>
                <span className={styles.stepNum}>{s.num}</span>
                <div>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepDesc}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.extraLines}>
            <div className={styles.extraLine}><span>Ciencia ancestral validada por la evidencia moderna</span></div>
            <div className={styles.extraLine}><span>Tecnologia cuantica aplicada al bienestar integral</span></div>
          </div>
        </div>

        <div className={styles.visual}>
          <div className={styles.alambiqueWrap} aria-hidden><Alambique /></div>
          <div className={`${styles.planCard} reveal`}>
            <p className={styles.planTag}>Tu plan · Esta semana</p>
            {SAMPLE_PLAN.map((row) => (
              <div key={row.label} className={`${styles.planRow} ${styles[`row_${row.bg}`]}`}>
                <strong>{row.label}</strong>
                {row.body}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
