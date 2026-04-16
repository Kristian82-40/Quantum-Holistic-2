import styles from './BlogPreview.module.css';

const POSTS = [
  {
    cat:     'Depuración',
    title:   '5 plantas depurativas de temporada que puedes encontrar en tu mercado local',
    excerpt: 'El hígado habla. A veces pide silencio, a veces pide ortiga. Aprende a escucharlo con lo que la tierra de tu zona ofrece ahora.',
    date:    'Enero 2026',
    slug:    'plantas-depurativas-temporada',
  },
  {
    cat:     'Rendimiento',
    title:   'Cómo optimizar tu energía cognitiva con macrobiótica: guía práctica',
    excerpt: 'La claridad mental no se consigue con cafeína. Se construye con arroz integral, algas y el ritmo correcto de ayuno.',
    date:    'Febrero 2026',
    slug:    'energia-cognitiva-macrobiotica',
  },
  {
    cat:     'KM0',
    title:   'Alimentación km0 en Bristol: dónde comprar, qué hay en temporada y cómo usarlo',
    excerpt: 'Guía práctica para quienes viven en UK y quieren conectar con la tierra local sin comprar espinacas de Kenia.',
    date:    'Marzo 2026',
    slug:    'km0-bristol-guia',
  },
] as const;

export default function BlogPreview() {
  return (
    <section className={`section ${styles.blog}`} id="blog">
      <div className="container">
        <p className={styles.label}>Conocimiento libre</p>
        <h2 className={styles.title}>
          Aprende. Aplica. <em>Transforma.</em>
        </h2>

        <div className={styles.grid}>
          {POSTS.map((post) => (
            <article key={post.slug} className={`${styles.card} reveal`}>
              <div className={styles.thumb}>
                <LeafSVG />
                <span className={styles.cat}>{post.cat}</span>
              </div>
              <div className={styles.body}>
                <h3 className={styles.postTitle}>{post.title}</h3>
                <p className={styles.excerpt}>{post.excerpt}</p>
                <div className={styles.footer}>
                  <span className={styles.date}>{post.date}</span>
                  <a href={`/blog/${post.slug}`} className={styles.read}>
                    Leer →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.cta}>
          <a href="/blog" className={styles.allLink}>
            Ver todos los artículos →
          </a>
        </div>
      </div>
    </section>
  );
}

function LeafSVG() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden>
      <path d="M40 72V20" stroke="#6B7C5E" strokeWidth="1.4"/>
      <path d="M40 55C40 55 20 44 12 30" stroke="#A8B89A" strokeWidth="1"/>
      <path d="M40 55C40 55 60 44 68 30" stroke="#A8B89A" strokeWidth="1"/>
      <path d="M40 40C40 40 25 33 18 22" stroke="#A8B89A" strokeWidth=".7"/>
      <path d="M40 40C40 40 55 33 62 22" stroke="#A8B89A" strokeWidth=".7"/>
      <ellipse cx="40" cy="72" rx="10" ry="3.5" stroke="#6B7C5E" strokeWidth=".6"/>
    </svg>
  );
}
