import { PILLARS } from '@/lib/config';
import PlantaMedicinal from '@/components/illustrations/PlantaMedicinal';
import BioZenScene from '@/components/ui/BioZenScene';
import styles from './Pillars.module.css';

export default function Pillars() {
  return (
    <section className={`section ${styles.pillars}`} id="pillars">
      <div className="container">
        <p className={styles.label}>Nuestro método</p>
        <h2 className={styles.title}>
          Cuatro pilares para una vida{' '}
          <em>verdaderamente</em> equilibrada
        </h2>
      </div>

      <div className="container">
        <div className={styles.grid}>
          {PILLARS.map((p) => p.num === '04' ? (
            <article key={p.num} className={`${styles.pillar} ${styles.pillarWide} reveal`}>
              <div className={styles.pillarWideText}>
                <span className={styles.num}>{p.num}</span>
                <h3 className={styles.pillarTitle}>{p.title}</h3>
                <p className={styles.desc}>{p.desc}</p>
                <div className={styles.tags}>
                  {p.tags.map((t) => (
                    <span key={t} className={styles.tag}>{t}</span>
                  ))}
                </div>
              </div>
              <div className={styles.pillarWideVisual} aria-hidden>
                <BioZenScene />
              </div>
            </article>
          ) : (
            <article key={p.num} className={`${styles.pillar} reveal`}>
              <div className={styles.pillarIllus} aria-hidden>
                <PlantaMedicinal size={110} />
              </div>
              <span className={styles.num}>{p.num}</span>
              <h3 className={styles.pillarTitle}>{p.title}</h3>
              <p className={styles.desc}>{p.desc}</p>
              <div className={styles.tags}>
                {p.tags.map((t) => (
                  <span key={t} className={styles.tag}>{t}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
