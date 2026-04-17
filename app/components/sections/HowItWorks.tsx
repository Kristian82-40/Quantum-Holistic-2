import LaboratorioNatural from '@/components/illustrations/LaboratorioNatural';
import styles from './HowItWorks.module.css';

const STEPS = [
  {
    num: '01',
    title: 'Crea tu perfil holístico',
    desc: '10 preguntas sobre tu cuerpo, hábitos, entorno y objetivos. En 5 minutos, tu mapa de bienestar personalizado.',
  },
  {
    num: '02',
    title: 'La IA analiza y conecta',
    desc: 'Ciencia nutricional + herbología local + tus datos. El sistema construye un protocolo que ningún otro usuario tiene.',
  },
  {
    num: '03',
    title: 'Recibe tu plan personalizado',
    desc: 'Plan nutricional semanal, plantas para tu zona y rituales adaptados a tu perfil, tu estación y tu objetivo real.',
  },
  {
    num: '04',
    title: 'Evoluciona con el tiempo',
    desc: 'El sistema aprende contigo. Con Quantum Pro, además, hablas directamente con el especialista cada mes.',
  },
] as const;

const SAMPLE_PLAN = [
  { bg: 'sage', label: 'Lunes · Depuración',    body: 'Caldo de ortiga + arroz integral con sésamo' },
  { bg: 'gold', label: 'Planta recomendada',     body: 'Romero local · Digestión y claridad mental' },
  { bg: 'sage', label: 'Ritual matinal',         body: 'Agua tibia + limón + jengibre fresco rallado' },
  { bg: 'pro',  label: 'Quantum Pro · Sesión',   body: 'Videollamada jueves 18h · 45 min' },
] as const;

export default function HowItWorks() {
  return (
    <section className={`section ${styles.how}`} id="how">
      <div className={`container ${styles.inner}`}>
        {/* Steps */}
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
        </div>

        {/* Visual */}
        <div className={styles.visual}>
          <div className={styles.labIllus} aria-hidden>
            <LaboratorioNatural size={160} />
          </div>
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
