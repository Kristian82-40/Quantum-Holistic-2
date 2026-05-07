'use client';

import { useMemo, useState } from 'react';
import styles from './diccionario.module.css';

export type Plant = {
  region: string;
  group: string;
  plant_name: string;
  scientific_name: string;
  image_prompt?: string;
};

type TabKey = 'maestras' | 'medicinales' | 'sagradas';

const TABS: { key: TabKey; label: string; emoji: string; match: string }[] = [
  { key: 'maestras', label: 'Maestras', emoji: '🌀', match: 'Maestras' },
  { key: 'medicinales', label: 'Medicinales', emoji: '💊', match: 'Medicinales' },
  { key: 'sagradas', label: 'Sagradas', emoji: '🕊️', match: 'Sagradas' },
];

// Imágenes existentes en /public/images/plants (índices 0–50)
const MAX_IMAGE_INDEX = 50;

function imageSrc(index: number): string | null {
  if (index < 0 || index > MAX_IMAGE_INDEX) return null;
  const id = String(index).padStart(2, '0');
  return `/images/plants/plant-${id}-cientifica.jpg`;
}

export default function Catalogo({ plants }: { plants: Plant[] }) {
  const [active, setActive] = useState<TabKey>('maestras');

  const indexed = useMemo(
    () => plants.map((p, i) => ({ ...p, _index: i })),
    [plants]
  );

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = { maestras: 0, medicinales: 0, sagradas: 0 };
    indexed.forEach((p) => {
      for (const t of TABS) if (p.group.includes(t.match)) c[t.key]++;
    });
    return c;
  }, [indexed]);

  const visible = useMemo(() => {
    const tab = TABS.find((t) => t.key === active)!;
    return indexed.filter((p) => p.group.includes(tab.match));
  }, [indexed, active]);

  return (
    <main className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>Diccionario de Plantas</h1>
        <p className={styles.subtitle}>Atlas viviente · {plants.length} especies</p>
      </header>

      <nav className={styles.tabs} role="tablist" aria-label="Categorías">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={active === t.key}
            className={`${styles.tab} ${active === t.key ? styles.tabActive : ''}`}
            onClick={() => setActive(t.key)}
          >
            <span aria-hidden>{t.emoji}</span>
            {t.label}
            <span className={styles.count}>{counts[t.key]}</span>
          </button>
        ))}
      </nav>

      {visible.length === 0 ? (
        <p className={styles.empty}>Sin plantas en esta categoría.</p>
      ) : (
        <section className={styles.grid}>
          {visible.map((p) => {
            const src = imageSrc(p._index);
            return (
              <article key={`${p._index}-${p.scientific_name}`} className={styles.card}>
                <div className={styles.imgWrap}>
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt={p.plant_name}
                      loading="lazy"
                      className={styles.img}
                    />
                  ) : (
                    <div className={styles.placeholder} aria-label="Sin imagen">
                      ☘
                    </div>
                  )}
                  <div className={styles.overlay}>
                    <span className={styles.overlayText}>{p.scientific_name}</span>
                  </div>
                </div>
                <div className={styles.body}>
                  <h3 className={styles.name}>{p.plant_name}</h3>
                  <p className={styles.scientific}>{p.scientific_name}</p>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
