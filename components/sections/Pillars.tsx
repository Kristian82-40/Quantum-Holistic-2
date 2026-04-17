import { PILLARS } from '@/lib/config';
import styles from './Pillars.module.css';

const PILLAR_ICONS = [
  // 01 Nutrición km0 — espiga de trigo
  <svg key="01" width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
    <path d="M24 44 L24 10" stroke="#6B7C5E" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M24 34 C24 34 14 28 14 20 C14 20 20 18 24 22" stroke="#6B7C5E" strokeWidth="0.9" fill="rgba(107,124,94,0.1)"/>
    <path d="M24 34 C24 34 34 28 34 20 C34 20 28 18 24 22" stroke="#6B7C5E" strokeWidth="0.9" fill="rgba(107,124,94,0.1)"/>
    <path d="M24 26 C24 26 16 21 16 14 C16 14 21 13 24 16" stroke="#A8B89A" strokeWidth="0.8" fill="rgba(168,184,154,0.1)"/>
    <path d="M24 26 C24 26 32 21 32 14 C32 14 27 13 24 16" stroke="#A8B89A" strokeWidth="0.8" fill="rgba(168,184,154,0.1)"/>
    <circle cx="24" cy="10" r="2.5" fill="#C9A84C" opacity="0.6"/>
  </svg>,

  // 02 Perfil holístico — átomo/quantum
  <svg key="02" width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
    <circle cx="24" cy="24" r="3.5" fill="#6B7C5E" opacity="0.7"/>
    <ellipse cx="24" cy="24" rx="18" ry="8" stroke="#6B7C5E" strokeWidth="0.9" opacity="0.6"/>
    <ellipse cx="24" cy="24" rx="18" ry="8" stroke="#A8B89A" strokeWidth="0.8" opacity="0.4" transform="rotate(60 24 24)"/>
    <ellipse cx="24" cy="24" rx="18" ry="8" stroke="#A8B89A" strokeWidth="0.8" opacity="0.4" transform="rotate(-60 24 24)"/>
    <circle cx="42" cy="24" r="2" fill="#C9A84C" opacity="0.5"/>
    <circle cx="6" cy="24" r="2" fill="#C9A84C" opacity="0.5"/>
    <circle cx="33" cy="8" r="1.5" fill="#A8B89A" opacity="0.5"/>
    <circle cx="15" cy="40" r="1.5" fill="#A8B89A" opacity="0.5"/>
  </svg>,

  // 03 Plantas — hoja medicinal
  <svg key="03" width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
    <path d="M24 42 C24 42 8 32 8 18 C8 9 15 4 24 4 C33 4 40 9 40 18 C40 32 24 42 24 42Z" stroke="#6B7C5E" strokeWidth="1" fill="rgba(107,124,94,0.1)"/>
    <path d="M24 42 L24 16" stroke="#6B7C5E" strokeWidth="0.8"/>
    <path d="M24 32 C24 32 16 27 13 20" stroke="#A8B89A" strokeWidth="0.7"/>
    <path d="M24 32 C24 32 32 27 35 20" stroke="#A8B89A" strokeWidth="0.7"/>
    <path d="M24 24 C24 24 18 20 16 14" stroke="#A8B89A" strokeWidth="0.6" opacity="0.7"/>
    <path d="M24 24 C24 24 30 20 32 14" stroke="#A8B89A" strokeWidth="0.6" opacity="0.7"/>
    <circle cx="24" cy="4" r="2" fill="#C9A84C" opacity="0.5"/>
  </svg>,
] as const;

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
          {PILLARS.map((p, i) => (
            <article key={p.num} className={`${styles.pillar} reveal`}>
              <div className={styles.iconWrap}>
                {PILLAR_ICONS[i]}
              </div>
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
