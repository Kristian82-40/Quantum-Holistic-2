import styles from './Testimonials.module.css';

const TESTIMONIALS = [
  {
    name:     'Marc B.',
    location: 'Barcelona — Deportista de élite',
    text:     'Primer mes con el protocolo depurativo y mis marcas en carrera mejoraron un 12%. Lo que más me sorprende es lo personalizado que es.',
    initial:  'M',
  },
  {
    name:     'Laia M.',
    location: 'Vilanova',
    text:     'Nunca pensé que herbología e IA pudieran funcionar juntas. Me mandaron una guía de plantas locales del Garraf que es increíble.',
    initial:  'L',
  },
  {
    name:     'Carlos R.',
    location: 'Bristol',
    text:     'El plan km0 se adapta a lo que encuentro en el mercado local. Llevo 3 meses y me siento con más energía que a los 30.',
    initial:  'C',
  },
] as const;

export default function Testimonials() {
  return (
    <section className={`section ${styles.testimonials}`} id="testimonials">
      <div className="container">
        <p className={styles.label}>Lo que dicen</p>
        <h2 className={styles.title}>
          Personas reales.<br /><em>Cambios reales.</em>
        </h2>
        <div className={styles.grid}>
          {TESTIMONIALS.map((t) => (
            <blockquote key={t.name} className={`${styles.card} reveal`}>
              <span className={styles.quote} aria-hidden>&ldquo;</span>
              <p className={styles.text}>{t.text}</p>
              <footer className={styles.footer}>
                <div className={styles.avatar}>{t.initial}</div>
                <div>
                  <p className={styles.name}>{t.name}</p>
                  <p className={styles.location}>{t.location}</p>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
