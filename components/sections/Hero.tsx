import Button from '@/components/ui/Button';
import styles from './Hero.module.css';

const BARS = [
  { label: 'Energía',    pct: 78 },
  { label: 'Digestión',  pct: 64 },
  { label: 'Equilibrio', pct: 91 },
  { label: 'Vitalidad',  pct: 55 },
] as const;

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

          {/* ── Background botanical illustration ── */}
          <svg className={styles.bgBotanical} viewBox="0 0 500 600" fill="none" aria-hidden>
            {/* Main stem */}
            <path d="M250 580 C250 580 240 450 260 350 C280 250 230 150 250 50" stroke="#6B7C5E" strokeWidth="1.2" strokeLinecap="round"/>
            {/* Large leaves left */}
            <path d="M255 460 C255 460 180 430 150 370 C180 390 255 460 255 460Z" fill="#6B7C5E" opacity="0.25"/>
            <path d="M255 460 C255 460 180 430 150 370" stroke="#6B7C5E" strokeWidth="0.8"/>
            <path d="M252 390 C252 390 165 355 140 290" stroke="#A8B89A" strokeWidth="0.7"/>
            <path d="M252 390 C252 390 165 355 140 290 C165 310 252 390 252 390Z" fill="#A8B89A" opacity="0.15"/>
            {/* Large leaves right */}
            <path d="M258 430 C258 430 335 395 365 330 C335 352 258 430 258 430Z" fill="#6B7C5E" opacity="0.2"/>
            <path d="M258 430 C258 430 335 395 365 330" stroke="#6B7C5E" strokeWidth="0.8"/>
            <path d="M260 350 C260 350 340 310 370 245" stroke="#A8B89A" strokeWidth="0.7"/>
            <path d="M260 350 C260 350 340 310 370 245 C340 268 260 350 260 350Z" fill="#A8B89A" opacity="0.12"/>
            {/* Upper branches */}
            <path d="M255 270 C255 270 195 240 175 190" stroke="#6B7C5E" strokeWidth="0.6"/>
            <path d="M255 270 C255 270 195 240 175 190 C198 210 255 270 255 270Z" fill="#6B7C5E" opacity="0.18"/>
            <path d="M258 240 C258 240 315 210 338 160" stroke="#6B7C5E" strokeWidth="0.6"/>
            <path d="M258 240 C258 240 315 210 338 160 C312 182 258 240 258 240Z" fill="#6B7C5E" opacity="0.15"/>
            {/* Small buds */}
            <circle cx="175" cy="188" r="6" fill="#A8B89A" opacity="0.35"/>
            <circle cx="338" cy="158" r="5" fill="#A8B89A" opacity="0.3"/>
            <circle cx="140" cy="288" r="5" fill="#6B7C5E" opacity="0.25"/>
            <circle cx="370" cy="243" r="4" fill="#6B7C5E" opacity="0.2"/>
            <circle cx="250" cy="50" r="8" fill="#C9A84C" opacity="0.3"/>
            {/* Leaf veins */}
            <path d="M200 415 C195 425 188 435 180 440" stroke="#A8B89A" strokeWidth="0.4" opacity="0.5"/>
            <path d="M320 390 C326 400 332 412 336 418" stroke="#A8B89A" strokeWidth="0.4" opacity="0.5"/>
            {/* Root hint */}
            <path d="M245 575 C245 575 215 590 200 600" stroke="#8B6F52" strokeWidth="0.6" opacity="0.3"/>
            <path d="M255 578 C255 578 275 592 285 600" stroke="#8B6F52" strokeWidth="0.6" opacity="0.3"/>
          </svg>

          {/* ── Seasonal badge ── */}
          <div className={`${styles.seasonBadge} ${styles.floatB}`}>
            <span className={styles.seasonIcon}>🌸</span>
            <span className={styles.seasonLabel}>Primavera · Depuración</span>
          </div>

          {/* ── Profile card ── */}
          <div className={`${styles.card} ${styles.floatA}`}>
            <p className={styles.cardTag}>Perfil activo · KM0</p>
            <p className={styles.cardName}>Tu bienestar</p>
            {BARS.map(bar => (
              <div key={bar.label} className={styles.barRow}>
                <span className={styles.barLabel}>{bar.label}</span>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${bar.pct}%` }} />
                </div>
                <span className={styles.barPct}>{bar.pct}</span>
              </div>
            ))}
          </div>

          {/* ── Recommendation card ── */}
          <div className={`${styles.cardDark} ${styles.floatB}`}>
            <p className={styles.recoLabel}>Quantum Pro · Esta semana</p>
            <p className={styles.recoText}>
              &ldquo;Protocolo depurativo: cúrcuma, hinojo y ayuno intermitente adaptado&rdquo;
            </p>
            <div className={styles.recoBadge}>
              <span className={styles.recoAI}>✦ Generado por IA local</span>
            </div>
          </div>

          {/* ── Floating herb icon ── */}
          <div className={`${styles.herbFloat} ${styles.floatA}`} aria-hidden>
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="22" r="21" stroke="#A8B89A" strokeWidth="0.8" strokeDasharray="3 4"/>
              <path d="M22 36 C22 36 10 28 10 18 C10 11 15.5 6 22 6 C28.5 6 34 11 34 18 C34 28 22 36 22 36Z" stroke="#6B7C5E" strokeWidth="0.8"/>
              <path d="M22 36 L22 18" stroke="#6B7C5E" strokeWidth="0.5"/>
              <path d="M22 27 C22 27 15 23 12 17" stroke="#A8B89A" strokeWidth="0.5"/>
              <path d="M22 27 C22 27 29 23 32 17" stroke="#A8B89A" strokeWidth="0.5"/>
            </svg>
          </div>

        </div>
      </div>
    </section>
  );
}
