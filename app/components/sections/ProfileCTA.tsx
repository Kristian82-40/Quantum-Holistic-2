'use client';

import { useState } from 'react';
import styles from './ProfileCTA.module.css';

type Goal = 'Energía' | 'Depuración' | 'Rendimiento' | 'Equilibrio';

interface FormData {
  goal: Goal | '';
  location: string;
  restrictions: string;
}

const GOALS: Goal[] = ['Energía', 'Depuración', 'Rendimiento', 'Equilibrio'];

export default function ProfileCTA() {
  const [form, setForm]         = useState<FormData>({ goal: '', location: '', restrictions: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/profile', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Error al enviar el formulario');

      setSubmitted(true);
    } catch {
      setError('Algo salió mal. Por favor inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section className={`section ${styles.section}`} id="profile">
        <div className={`container ${styles.inner}`}>
          <div className={styles.success}>
            <span className={styles.successIcon}>✦</span>
            <h2 className={styles.successTitle}>¡Perfil enviado!</h2>
            <p className={styles.successText}>
              Te contactamos en menos de 48h con tu plan personalizado.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`section ${styles.section}`} id="profile">
      <div className={`container ${styles.inner}`}>
        <div className={styles.header}>
          <p className={styles.label}>Empieza ahora</p>
          <h2 className={styles.title}>
            Tu perfil holístico,<br /><em>en 3 preguntas</em>
          </h2>
          <p className={styles.subtitle}>
            La IA analiza tus respuestas y genera un protocolo único para ti.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Q1 */}
          <div className={styles.question}>
            <p className={styles.questionLabel}>
              <span className={styles.qNum}>01</span>
              ¿Cuál es tu principal objetivo?
            </p>
            <div className={styles.goalGrid}>
              {GOALS.map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`${styles.goalBtn} ${form.goal === g ? styles.goalActive : ''}`}
                  onClick={() => setForm((f) => ({ ...f, goal: g }))}
                >
                  <span>{g}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Q2 */}
          <div className={styles.question}>
            <label className={styles.questionLabel} htmlFor="location">
              <span className={styles.qNum}>02</span>
              ¿Dónde vives?
            </label>
            <input
              id="location"
              type="text"
              className={styles.input}
              placeholder="Ciudad o región — adaptamos el KM0 a ti"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
          </div>

          {/* Q3 */}
          <div className={styles.question}>
            <label className={styles.questionLabel} htmlFor="restrictions">
              <span className={styles.qNum}>03</span>
              ¿Alguna restricción alimentaria?
            </label>
            <input
              id="restrictions"
              type="text"
              className={styles.input}
              placeholder="Vegano, celíaco, alergias... o ninguna"
              value={form.restrictions}
              onChange={(e) => setForm((f) => ({ ...f, restrictions: e.target.value }))}
            />
          </div>

          {error && (
            <p style={{ color: 'var(--earth)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className={styles.submit}
            disabled={!form.goal || !form.location || loading}
          >
            <span>{loading ? 'Enviando…' : 'Generar mi perfil con IA →'}</span>
          </button>
        </form>
      </div>
    </section>
  );
}
