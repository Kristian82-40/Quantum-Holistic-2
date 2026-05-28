'use client';

import { useMemo, useState } from 'react';
import styles from './diccionario.module.css';

export type Plant = {
  id: number;
  nombre_es: string;
  slug: string;
  categoria: string | null;
  descripcion_corta: string | null;
  image_cientifica_url: string | null;
  nombre_latino: string | null;
};

type TabKey = 'maestras' | 'sagradas' | 'magicas';

const TABS: { key: TabKey; label: string; match: string; color: string }[] = [
  { key: 'maestras', label: 'Maestras',  match: 'Maestras',  color: '#8A9A7B' },
  { key: 'sagradas', label: 'Sagradas',  match: 'Sagradas',  color: '#B8935A' },
  { key: 'magicas',  label: 'Mágicas',   match: 'Magicas',   color: '#9C5A3C' },
];

export default function Catalogo({ plants }: { plants: Plant[] }) {
  const [active, setActive] = useState<TabKey>('maestras');

  const activeColor = TABS.find((t) => t.key === active)!.color;

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = { maestras: 0, sagradas: 0, magicas: 0 };
    for (const p of plants) {
      const cat = p.categoria ?? '';
      for (const t of TABS) if (cat === t.match) c[t.key]++;
    }
    return c;
  }, [plants]);

  const visible = useMemo(() => {
    const tab = TABS.find((t) => t.key === active)!;
    return plants.filter((p) => p.categoria === tab.match);
  }, [plants, active]);

  return (
    <main className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>Diccionario Botánico</h1>
        <p className={styles.subtitle}>Atlas viviente · {plants.length} especies</p>
      </header>

      <nav className={styles.tabs} role="tablist" aria-label="Categorías">
        {TABS.map((t) => {
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={isActive}
              className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
              style={isActive ? { background: t.color, borderColor: t.color } : undefined}
              onClick={() => setActive(t.key)}
            >
              {t.label}
              <span className={styles.count}>{counts[t.key]}</span>
            </button>
          );
        })}
      </nav>

      {visible.length === 0 ? (
        <p className={styles.empty}>Sin plantas en esta categoría.</p>
      ) : (
        <section className={styles.grid}>
          {visible.map((p) => {
            const src =
              p.image_cientifica_url ||
              `/images/plants/${p.slug}-cientifica.jpg`;
            return (
              <article key={p.id} className={styles.card}>
                <div className={styles.imgWrap}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={p.nombre_es}
                    loading="lazy"
                    className={styles.img}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                      const ph = e.currentTarget.nextElementSibling as HTMLElement | null;
                      if (ph) ph.style.display = 'flex';
                    }}
                  />
                  <div className={styles.placeholder} style={{ display: 'none' }} aria-hidden>
                    ☘
                  </div>
                  <div className={styles.overlay}>
                    <span className={styles.overlayText}>{p.nombre_latino}</span>
                  </div>
                </div>
                <div className={styles.body}>
                  <h3 className={styles.name}>{p.nombre_es}</h3>
                  {p.nombre_latino && (
                    <p className={styles.scientific}>{p.nombre_latino}</p>
                  )}
                  {p.descripcion_corta && (
                    <p className={styles.desc}>{p.descripcion_corta}</p>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
