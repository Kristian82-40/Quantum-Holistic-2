'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './StatsBar.module.css';

const STATS = [
  { value: '2.400+', label: 'Planes km0 generados' },
  { value: '98%',    label: 'Satisfacción usuarios Pro' },
  { value: '340+',   label: 'Plantas en la base de datos' },
  { value: '< 48h',  label: 'Tiempo hasta tu primer plan' },
] as const;

export default function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={styles.band}>
      <div className={`container ${styles.inner}`}>
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className={`${styles.item} ${visible ? styles.itemVisible : ''}`}
            style={{ transitionDelay: `${i * 0.1}s` }}
          >
            <span className={styles.value}>{stat.value}</span>
            <span className={styles.label}>{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
