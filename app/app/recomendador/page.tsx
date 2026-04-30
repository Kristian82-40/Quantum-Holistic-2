'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Plant {
  id: number;
  slug: string;
  nombre_es: string;
  nombre_latino: string;
  image_cientifica_url: string | null;
  ficha_cientifica: { propiedades: string[]; familia_botanica: string };
  ficha_mistica: { afinidad_ayurvedica: string; chakra: string; elemento: string };
}

const DOSHA_INFO = {
  Vata: {
    descripcion: 'Energía del movimiento. Mente creativa, constitución ligera, tendencia a la ansiedad y la sequedad.',
    color: '#8B7355',
    keywords: ['Vata', 'Tridosha'],
  },
  Pitta: {
    descripcion: 'Energía del fuego. Mente analítica, constitución media, tendencia al calor y la inflamación.',
    color: '#B5653E',
    keywords: ['Pitta', 'Tridosha'],
  },
  Kapha: {
    descripcion: 'Energía de la tierra. Mente estable, constitución robusta, tendencia a la retención y la calma.',
    color: '#4A7C6B',
    keywords: ['Kapha', 'Tridosha'],
  },
};

const PREGUNTAS = [
  {
    pregunta: '¿Cómo describes tu constitución física?',
    opciones: [
      { texto: 'Delgada y difícil de ganar peso', dosha: 'Vata' },
      { texto: 'Media y musculada', dosha: 'Pitta' },
      { texto: 'Robusta y tendencia a retener peso', dosha: 'Kapha' },
    ],
  },
  {
    pregunta: '¿Cómo suele ser tu mente bajo estrés?',
    opciones: [
      { texto: 'Ansiosa, dispersa, difícil de calmar', dosha: 'Vata' },
      { texto: 'Irritable, perfeccionista, intensamente enfocada', dosha: 'Pitta' },
      { texto: 'Lenta para reaccionar, busca la comodidad', dosha: 'Kapha' },
    ],
  },
  {
    pregunta: '¿Cuál es tu patrón de sueño habitual?',
    opciones: [
      { texto: 'Ligero, me despierto fácilmente', dosha: 'Vata' },
      { texto: 'Moderado, duermo bien pero soy puntual', dosha: 'Pitta' },
      { texto: 'Profundo y prolongado, me cuesta despertar', dosha: 'Kapha' },
    ],
  },
  {
    pregunta: '¿Cuál es tu digestión habitual?',
    opciones: [
      { texto: 'Irregular, gases y distensión', dosha: 'Vata' },
      { texto: 'Fuerte y rápida, hambre intensa', dosha: 'Pitta' },
      { texto: 'Lenta pero estable', dosha: 'Kapha' },
    ],
  },
];

type DoshaType = 'Vata' | 'Pitta' | 'Kapha';

export default function RecomendadorPage() {
  const [step, setStep] = useState<'quiz' | 'result'>('quiz');
  const [question, setQuestion] = useState(0);
  const [votes, setVotes] = useState<Record<DoshaType, number>>({ Vata: 0, Pitta: 0, Kapha: 0 });
  const [dosha, setDosha] = useState<DoshaType | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loadingPlants, setLoadingPlants] = useState(false);

  function answer(d: DoshaType) {
    const next = { ...votes, [d]: votes[d] + 1 };
    setVotes(next);
    if (question + 1 >= PREGUNTAS.length) {
      const winner = (Object.entries(next) as [DoshaType, number][])
        .sort((a, b) => b[1] - a[1])[0][0];
      setDosha(winner);
      setStep('result');
    } else {
      setQuestion(q => q + 1);
    }
  }

  useEffect(() => {
    if (step !== 'result' || !dosha) return;
    setLoadingPlants(true);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;
    fetch(
      `${url}/rest/v1/plants?select=id,slug,nombre_es,nombre_latino,image_cientifica_url,ficha_cientifica,ficha_mistica&order=id.asc`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    )
      .then(r => r.json())
      .then((data: Plant[]) => {
        const info = DOSHA_INFO[dosha];
        const filtered = data.filter(p => {
          const af = p.ficha_mistica?.afinidad_ayurvedica ?? '';
          return info.keywords.some(k => af.toLowerCase().includes(k.toLowerCase()));
        });
        setPlants(filtered.slice(0, 9));
        setLoadingPlants(false);
      })
      .catch(() => setLoadingPlants(false));
  }, [step, dosha]);

  function restart() {
    setStep('quiz');
    setQuestion(0);
    setVotes({ Vata: 0, Pitta: 0, Kapha: 0 });
    setDosha(null);
    setPlants([]);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary, #f0ece3)', fontFamily: 'var(--font-sans, sans-serif)' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px 60px' }}>
        {/* Header */}
        <p style={{ fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--sage, #6B7C5E)', marginBottom: '16px' }}>
          Ayurveda · Quantum Holistic
        </p>
        <h1 style={{ fontFamily: 'var(--font-serif, serif)', fontWeight: 300, fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '8px', lineHeight: 1.2 }}>
          Descubre tu Dosha
        </h1>
        <p style={{ color: 'var(--text-muted, #888)', fontWeight: 300, marginBottom: '48px', maxWidth: '480px' }}>
          Responde 4 preguntas y te mostraremos las plantas medicinales más afines a tu constitución ayurvédica.
        </p>

        {step === 'quiz' && (
          <div>
            {/* Progreso */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '40px' }}>
              {PREGUNTAS.map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: '3px', borderRadius: '2px',
                  background: i <= question ? 'var(--sage, #6B7C5E)' : 'var(--border, #e0ddd5)',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>

            <p style={{ fontSize: '11px', color: 'var(--text-muted, #888)', marginBottom: '12px', letterSpacing: '0.1em' }}>
              Pregunta {question + 1} de {PREGUNTAS.length}
            </p>
            <h2 style={{ fontFamily: 'var(--font-serif, serif)', fontWeight: 300, fontSize: '1.5rem', marginBottom: '32px', lineHeight: 1.4 }}>
              {PREGUNTAS[question].pregunta}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {PREGUNTAS[question].opciones.map((op) => (
                <button
                  key={op.dosha}
                  onClick={() => answer(op.dosha as DoshaType)}
                  style={{
                    padding: '16px 24px',
                    border: '1px solid var(--border, #e0ddd5)',
                    borderRadius: '8px',
                    background: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 300,
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    color: 'var(--text-primary, #1a1a1a)',
                    lineHeight: 1.5,
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--sage, #6B7C5E)'; (e.currentTarget as HTMLElement).style.background = 'rgba(107,124,94,0.04)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border, #e0ddd5)'; (e.currentTarget as HTMLElement).style.background = '#fff'; }}
                >
                  {op.texto}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'result' && dosha && (
          <div>
            {/* Resultado dosha */}
            <div style={{
              padding: '32px',
              borderRadius: '12px',
              border: `1px solid ${DOSHA_INFO[dosha].color}33`,
              background: `${DOSHA_INFO[dosha].color}08`,
              marginBottom: '48px',
            }}>
              <p style={{ fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: DOSHA_INFO[dosha].color, marginBottom: '12px' }}>
                Tu dosha predominante
              </p>
              <h2 style={{ fontFamily: 'var(--font-serif, serif)', fontWeight: 300, fontSize: '2.5rem', color: DOSHA_INFO[dosha].color, marginBottom: '16px' }}>
                {dosha}
              </h2>
              <p style={{ color: 'var(--text-muted, #888)', fontWeight: 300, lineHeight: 1.7, maxWidth: '480px' }}>
                {DOSHA_INFO[dosha].descripcion}
              </p>
            </div>

            {/* Plantas recomendadas */}
            <h3 style={{ fontFamily: 'var(--font-serif, serif)', fontWeight: 300, fontSize: '1.4rem', marginBottom: '24px' }}>
              Plantas para tu constitución {dosha}
            </h3>

            {loadingPlants && <p style={{ color: 'var(--text-muted, #888)' }}>Cargando plantas…</p>}

            {!loadingPlants && plants.length === 0 && (
              <p style={{ color: 'var(--text-muted, #888)' }}>No se encontraron plantas para este dosha.</p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginBottom: '48px' }}>
              {plants.map(p => (
                <Link key={p.id} href={`/plantas/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{
                    border: '1px solid var(--border, #e0ddd5)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: '#fff',
                    transition: 'box-shadow 0.2s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                  >
                    {p.image_cientifica_url && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={p.image_cientifica_url} alt={p.nombre_es} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                    )}
                    <div style={{ padding: '14px 16px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 400, marginBottom: '4px' }}>{p.nombre_es}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted, #888)', fontStyle: 'italic' }}>{p.nombre_latino}</p>
                      <p style={{ fontSize: '10px', color: 'var(--sage, #6B7C5E)', marginTop: '8px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {p.ficha_mistica?.chakra}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={restart}
                style={{ padding: '12px 28px', border: '1px solid var(--border, #e0ddd5)', borderRadius: '6px', background: 'transparent', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}
              >
                Repetir quiz
              </button>
              <Link href="/plantas" style={{ padding: '12px 28px', background: 'var(--sage, #6B7C5E)', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', display: 'inline-flex', alignItems: 'center' }}>
                Ver todas las plantas →
              </Link>
            </div>
          </div>
        )}

        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border, #e0ddd5)' }}>
          <Link href="/" style={{ fontSize: '12px', color: 'var(--text-muted, #888)', textDecoration: 'none' }}>
            ← Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
