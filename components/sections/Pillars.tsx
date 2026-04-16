import { PILLARS } from '@/lib/config';
import styles from './Pillars.module.css';

export default function Pillars() {
  return (
    <section className={`section ${styles.pillars}`} id="pillars">
      <div className="container">
        <p className={styles.label}>Nuestro método</p>
        <h2 className={styles.title}>
          Tres pilares para una vida{' '}
          <em>verdaderamente</em> equilibrada
        </h2>
      </div>

      <div className="container">
        <div className={styles.grid}>
          {PILLARS.map((p) => (
            <article key={p.num} className={`${styles.pillar} reveal`}>
              <span className={styles.num}>{p.num}</span>
              <h3 className={styles.pillarTitle}>{p.title}</h3>
              <p className={styles.desc}>{p.desc}</p>
              <span className={styles.tag}>{p.tag}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
