'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface Plant {
  id: number;
  slug: string;
  nombre_es: string;
  nombre_latino: string;
  image_cientifica_url: string | null;
  ficha_cientifica: { propiedades: string[]; familia_botanica: string; indicaciones: string[] };
  ficha_mistica: { elemento: string; chakra: string; afinidad_ayurvedica: string };
}

const ELEMENTOS = ['Todos', 'Fuego', 'Agua', 'Tierra', 'Aire'];

export default function PlantasGrid({ plants }: { plants: Plant[] }) {
  const [query, setQuery] = useState('');
  const [elemento, setElemento] = useState('Todos');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return plants.filter(p => {
      const matchQuery = !q ||
        p.nombre_es.toLowerCase().includes(q) ||
        p.nombre_latino.toLowerCase().includes(q) ||
        p.ficha_cientifica.propiedades?.some(x => x.toLowerCase().includes(q)) ||
        p.ficha_cientifica.indicaciones?.some(x => x.toLowerCase().includes(q)) ||
        p.ficha_mistica.chakra?.toLowerCase().includes(q) ||
        p.ficha_mistica.afinidad_ayurvedica?.toLowerCase().includes(q);
      const matchElemento = elemento === 'Todos' || p.ficha_mistica.elemento === elemento;
      return matchQuery && matchElemento;
    });
  }, [plants, query, elemento]);

  return (
    <>
      {/* Barra de búsqueda + filtros */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="search"
          placeholder="Buscar por nombre, propiedad, chakra, dosha..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            flex: '1 1 280px',
            padding: '10px 16px',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '0.9rem',
            background: 'transparent',
            color: 'var(--text)',
            outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          {ELEMENTOS.map(el => (
            <button
              key={el}
              onClick={() => setElemento(el)}
              style={{
                padding: '8px 14px',
                fontSize: '10px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                border: '1px solid',
                borderColor: elemento === el ? 'var(--sage)' : 'var(--border)',
                borderRadius: '20px',
                background: elemento === el ? 'var(--sage)' : 'transparent',
                color: elemento === el ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {el}
            </button>
          ))}
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {filtered.length} / {plants.length}
        </p>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '28px',
      }}>
        {filtered.map(plant => (
          <Link key={plant.id} href={`/plantas/${plant.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <article
              style={{
                border: '1px solid var(--border)',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'border-color 0.2s, transform 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--sage)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              <div style={{ height: '200px', background: 'var(--bg-subtle, #f8f6f2)', overflow: 'hidden' }}>
                {plant.image_cientifica_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={plant.image_cientifica_url} alt={plant.nombre_es}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.3, fontSize: '40px' }}>◈</div>
                )}
              </div>
              <div style={{ padding: '18px' }}>
                <p style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: '4px' }}>
                  {plant.ficha_mistica.elemento} · {plant.ficha_cientifica.familia_botanica}
                </p>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '1.15rem', margin: '0 0 3px', lineHeight: 1.3 }}>
                  {plant.nombre_es}
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '10px' }}>
                  {plant.nombre_latino}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {plant.ficha_cientifica.propiedades?.slice(0, 2).map(prop => (
                    <span key={prop} style={{
                      fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase',
                      padding: '2px 7px', border: '1px solid var(--border)',
                      borderRadius: '20px', color: 'var(--text-muted)',
                    }}>{prop}</span>
                  ))}
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontWeight: 300, textAlign: 'center', padding: '48px 0' }}>
          Sin resultados para &ldquo;{query}&rdquo;
        </p>
      )}
    </>
  );
}
