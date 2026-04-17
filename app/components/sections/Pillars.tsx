import { PILLARS } from '@/lib/config';
import styles from './Pillars.module.css';

const PILLAR_ICONS = [
  // Hoja / KM0
  <svg key="01" viewBox="0 0 40 40" fill="none" aria-hidden>
    <path d="M20 4 C28 4 36 12 36 22 C36 30 28 36 20 36 C12 36 8 28 12 20 C14 14 18 8 20 4Z" stroke="currentColor" strokeWidth="1" fill="none"/>
    <line x1="20" y1="36" x2="20" y2="16" stroke="currentColor" strokeWidth="0.8"/>
    <line x1="20" y1="28" x2="14" y2="22" stroke="currentColor" strokeWidth="0.6"/>
    <line x1="20" y1="24" x2="26" y2="18" stroke="currentColor" strokeWidth="0.6"/>
  </svg>,
  // Perfil / persona
  <svg key="02" viewBox="0 0 40 40" fill="none" aria-hidden>
    <circle cx="20" cy="14" r="6" stroke="currentColor" strokeWidth="1"/>
    <path d="M8 34 C8 26 12 22 20 22 C28 22 32 26 32 34" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M26 20 C30 18 36 14 36 8" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2 2"/>
    <circle cx="36" cy="6" r="2" fill="currentColor" opacity="0.5"/>
  </svg>,
  // Planta / herbología
  <svg key="03" viewBox="0 0 40 40" fill="none" aria-hidden>
    <line x1="20" y1="36" x2="20" y2="10" stroke="currentColor" strokeWidth="1"/>
    <path d="M20 28 C20 28 12 24 10 16 C16 16 20 20 20 28Z" stroke="currentColor" strokeWidth="0.8" fill="none"/>
    <path d="M20 22 C20 22 28 18 30 10 C24 10 20 14 20 22Z" stroke="currentColor" strokeWidth="0.8" fill="none"/>
    <circle cx="20" cy="10" r="2" stroke="currentColor" strokeWidth="0.8"/>
  </svg>,
];

export default function Pillars() {
  return (
    <section className={`section ${styles.pillars}`} id="pillars">
      <div className="container">
        <p className={styles.label}>Nuestro método</p>
        <h2 className={styles.title}>
          Tres pilares para una vida{' '}
          <em>verdaderamente</em> equilibrada
        </h2>
        <div className={styles.grid}>
          {PILLARS.map((p, i) => (
            <article key={p.num} className={`${styles.pillar} reveal`}>
              <div className={styles.iconWrap} aria-hidden>
                {PILLAR_ICONS[i]}
              </div>
              <span className={styles.num} aria-hidden>{p.num}</span>
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
