import Button from '@/components/ui/Button';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      {/* ── Left ── */}
      <div className={styles.left}>
        <p className={styles.tag}>Nutrición · Bienestar · Inteligencia holística</p>

        <h1 className={styles.title}>
          Tu cuerpo tiene<br />
          su <em>propia</em><br />
          inteligencia
        </h1>

        <p className={styles.desc}>
          Planes nutricionales km0, herbología y bienestar personalizado,
          potenciados por inteligencia artificial y arraigados en la
          sabiduría de la tierra.
        </p>

        <div className={styles.actions}>
          <Button as="a" href="/#pricing">Descubrir mi perfil</Button>
          <a href="#how" className={styles.textLink}>
            Ver cómo funciona <span className={styles.arrow}>→</span>
          </a>
        </div>

        <div className={styles.scrollHint} aria-hidden>
          <span className={styles.scrollLine} />
          <span className={styles.scrollLabel}>Explorar</span>
        </div>
      </div>

      {/* ── Right visual ── */}
      <div className={styles.right}>
        <div className={styles.visual}>
          {/* Botanical SVG bg */}
          <svg
            className={`${styles.botanical} ${styles.floatA}`}
            viewBox="0 0 200 200"
            fill="none"
            aria-hidden
          >
            <path d="M100 180C100 180 38 138 38 78C38 44 66 18 100 18C134 18 162 44 162 78C162 138 100 180 100 180Z" stroke="#6B7C5E" strokeWidth=".8"/>
            <path d="M100 180V80" stroke="#6B7C5E" strokeWidth=".5"/>
            <path d="M100 130C100 130 66 108 50 82" stroke="#A8B89A" strokeWidth=".5"/>
            <path d="M100 130C100 130 134 108 150 82" stroke="#A8B89A" strokeWidth=".5"/>
            <path d="M100 105C100 105 74 90 62 68" stroke="#A8B89A" strokeWidth=".4"/>
            <path d="M100 105C100 105 126 90 138 68" stroke="#A8B89A" strokeWidth=".4"/>
            <circle cx="100" cy="180" r="2.5" fill="#6B7C5E" opacity=".4"/>
          </svg>

          {/* Profile card */}
          <div className={`${styles.card} ${styles.floatA}`}>
            <p className={styles.cardTag}>Perfil activo · KM0</p>
            <p className={styles.cardName}>Tu bienestar</p>
            {[
              { label: 'Energía',   pct: 78 },
              { label: 'Digestión', pct: 64 },
              { label: 'Equilibrio',pct: 91 },
              { label: 'Vitalidad', pct: 55 },
            ].map((bar) => (
              <div key={bar.label} className={styles.barRow}>
                <span className={styles.barLabel}>{bar.label}</span>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${bar.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Pro reco card */}
          <div className={`${styles.cardDark} ${styles.floatB}`}>
            <p className={styles.recoLabel}>Quantum Pro · Esta semana</p>
            <p className={styles.recoText}>
              &ldquo;Protocolo depurativo: cúrcuma, hinojo y ayuno intermitente adaptado&rdquo;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
