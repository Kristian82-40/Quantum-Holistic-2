# SCHEMAS — Quantum Holistic Database

**Auto-generado desde Supabase Live** · Última verificación: 2026-05-12

---

## 📦 Tabla: `plants`

### Columnas
```sql
CREATE TABLE public.plants (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  nombre_es TEXT NOT NULL,
  nombre_latino TEXT NOT NULL,
  familia TEXT,
  descripcion_corta TEXT,
  descripcion_larga TEXT,
  imagen_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  propiedades JSONB,  -- Array de strings
  usos JSONB,         -- Array de strings
  dosis TEXT,
  contraindicaciones TEXT,
  origen_geografico TEXT,
  categoria TEXT,     -- enum: 'maestra', 'medicinal', 'sagrada'
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### Constraints
- `slug` UNIQUE → no duplicados
- `nombre_es` NOT NULL
- `nombre_latino` NOT NULL
- `imagen_url` NOT NULL → debe ser URL válida de Vercel
- `alt_text` NOT NULL → debe ser "[nombre_es] — [nombre_latino]"
- RLS: SELECT para todos, INSERT/UPDATE/DELETE solo authenticated

### Relaciones
- Ninguna FK externa (tabla standalone)

---

## 📦 Tabla: `blog_posts`

### Columnas
```sql
CREATE TABLE public.blog_posts (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  contenido TEXT,
  resumen TEXT,
  autor_id UUID REFERENCES auth.users(id),
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### Estado: VACÍO (0 posts)
Usar `qb` (blog post generator) para popular.

---

## 📦 Tabla: `profiles`

### Columnas
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE,
  nombre TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

---

## 📦 Tabla: `chat_usage`

### Columnas
```sql
CREATE TABLE public.chat_usage (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  messages_used INT DEFAULT 0,
  messages_limit INT DEFAULT 5,
  reset_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## 📦 Tabla: `leads`

### Columnas
```sql
CREATE TABLE public.leads (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  nombre TEXT,
  mensaje TEXT,
  fuente TEXT,  -- enum: 'formulario', 'chat', 'newsletter'
  created_at TIMESTAMP DEFAULT now()
);
```

---

## 🔐 RLS Policies (Resumen)

| Tabla | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| plants | PUBLIC | AUTH | AUTH | AUTH |
| blog_posts | PUBLIC | AUTH | AUTH | AUTH |
| profiles | PUBLIC | AUTH | SELF | SELF |
| chat_usage | AUTH (self) | AUTH | AUTH | AUTH |
| leads | AUTH | PUBLIC | AUTH | AUTH |

---

## 🚨 Validadores críticos
- Todas `TEXT NOT NULL` deben ser no-vacío
- URLs (`imagen_url`) deben devolver HTTP 200
- JSONB arrays deben ser formato válido
- Slugs: minúsculas, sin espacios, only [a-z0-9_-]
