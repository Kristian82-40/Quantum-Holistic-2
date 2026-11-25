import { PRO_ITEMS } from '@/lib/config';
import styles from './ProDetail.module.css';

export default function ProDetail() {
  return (
    <section className={`section ${styles.pro}`} id="pro-detail">
      <div className="container">
        <p className={styles.label}>Quantum Pro — Próximamente</p>
        <h2 className={styles.title}>
          Estamos construyendo<br /><em>algo nuevo</em>.
        </h2>
      </div>

      <div className="container">
        <div className={styles.grid}>
          {PRO_ITEMS.map((item) => (
            <article key={item.title} className={`${styles.item} reveal`}>
              <span className={styles.icon} aria-hidden>{item.icon}</span>
              <h3 className={styles.itemTitle}>{item.title}</h3>
              <p className={styles.desc}>{item.desc}</p>
              <span className={styles.tag}>{item.tag}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
