import Button from '@/components/ui/Button';
import QuantumCircle from '@/components/illustrations/QuantumCircle';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      {/* ── CSS Art Background ── */}
      <div className={styles.bgGradient} aria-hidden />
      <div className={styles.bgLight} aria-hidden />
      <div className={styles.bgWaves} aria-hidden>
        {[0,1,2,3,4].map((i) => (
          <span key={i} className={styles.wave} style={{ '--w': i } as React.CSSProperties} />
        ))}
      </div>
      <div className={styles.bgParticles} aria-hidden>
        {Array.from({ length: 24 }, (_, i) => (
          <span key={i} className={styles.particle} style={{ '--i': i } as React.CSSProperties} />
        ))}
      </div>

      {/* ── QuantumCircle flotando a la derecha ── */}
      <div className={styles.quantumFloat} aria-hidden>
        <QuantumCircle size={380} />
      </div>

      {/* ── Contenido centrado ── */}
      <div className={styles.content}>
        <p className={styles.badge}>✦ Medicina Integrativa Cuántica ✦</p>

        <h1 className={styles.title}>
          Tu cuerpo tiene<br />
          su <em>propia</em><br />
          inteligencia
        </h1>

        <div className={styles.elements}>
          <span>Tierra</span>
          <span className={styles.elemDiv}>·</span>
          <span>Agua</span>
          <span className={styles.elemDiv}>·</span>
          <span>Fuego</span>
          <span className={styles.elemDiv}>·</span>
          <span>Aire</span>
          <span className={styles.elemDiv}>·</span>
          <span>Éter</span>
        </div>

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
      </div>

      <div className={styles.scrollHint} aria-hidden>
        <span className={styles.scrollLine} />
        <span className={styles.scrollLabel}>Explorar</span>
      </div>
    </section>
  );
}
