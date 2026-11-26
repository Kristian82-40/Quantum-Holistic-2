import { NextRequest, NextResponse } from 'next/server';
import { PLANTAS_PELIGROSAS } from '@/lib/plantas-peligrosas';

const N8N_CHAT_WEBHOOK = process.env.N8N_CHAT_WEBHOOK_URL || 'http://localhost:5678/webhook/chat-holistic';
const OLLAMA_URL       = process.env.OLLAMA_URL            || 'http://localhost:11434';
const OLLAMA_MODEL     = process.env.OLLAMA_MODEL          || 'papu-pro:latest';

const SYSTEM_PROMPT = `Eres el asistente holístico de Quantum Holistic, un servicio de nutrición km0, herbología y bienestar holístico.
Tu rol: orientar a los usuarios en nutrición de proximidad, plantas medicinales, detox estacional y bienestar integral.
Tono: cálido, experto, breve. Responde siempre en español.
Límite: no des diagnósticos médicos. Para condiciones graves, recomienda consulta médica.
Si el usuario quiere saber más sobre el servicio, menciona brevemente los planes Freemium y Quantum Pro.`;

// ── SEGURIDAD: detección de contextos de riesgo ─────────────────────────────
//
// Estos patrones se aplican sobre el texto normalizado (sin tildes, minúsculas).
// La cobertura es intencionalmente amplia: mejor un falso positivo (mensaje de
// precaución) que omitir una advertencia en un caso real.

const RIESGO_REGEXPS: RegExp[] = [
  /embaraz/,                                           // embarazo, embarazada
  /gestant|gestaci/,                                   // gestante, gestación
  /lactanc|amamant/,                                   // lactancia, amamantando
  /\bbebe\b|\brecien.?nacido/,                         // bebé, recién nacido
  /\bnin[oa]\b|\binfant|\bpediatri|\bhij[oa]\b/,       // niño, niña, hijo, hija
  /anticoagulant|warfarin|acenocumarol|heparin/,       // anticoagulantes
  /sedant|ansioliti|diazepam|lorazepam|alprazolam/,    // sedantes / ansiolíticos
  /antidepresiv|fluoxetin|sertralina|paroxetin|venlafaxin/, // antidepresivos
  /antiepilepti|carbamacepin|valproat/,                // antiepilépticos
  /quimioterapia|\bquimio\b/,                          // quimioterapia
  /operaci.n|cirug.a|operar|\boperado\b/,              // cirugía / operación
  /insuficiencia.{0,15}hepat|hepatiti|cirrosi/,        // hepatopatía
  /insuficiencia.{0,15}renal|dialisi/,                 // nefropatía
  /hipertiroid|hipotiroid/,                            // tiroides
  /\bepileps/,                                         // epilepsia
  /tomo.{1,25}(pastilla|medicamento|farmaco|tratamiento)/, // "tomo medicamentos"
  /\bsintrom\b/,                                        // Sintrom (marca de acenocumarol)
  /dand[oa].{0,8}pecho|\bdoy.{0,8}pecho/,              // dando/doy el pecho (lactancia)
  /\bdiabet/,                                           // diabetes, diabético/a y variantes
  /\binsulina\b/,                                       // insulina (diabetes)
  /\bmetformin/,                                        // metformina (diabetes)
  /eliquis|xarelto|apixaban|rivaroxaban/,               // anticoagulantes de nueva generación
  /\bcriando\b/,                                        // "estoy criando" (lactancia coloquial)
  /\bhipertens/,                                        // hipertenso/a, hipertensión
  /\btiroides\b/,                                       // "tengo tiroides" (sin especificar hiper/hipo)
  /\bceliac/,                                           // celíaco/a, celiaquía
];

/** Devuelve true si el mensaje contiene un contexto de riesgo conocido. */
function tieneContextoRiesgo(mensaje: string): boolean {
  const norm = normalize(mensaje);
  return RIESGO_REGEXPS.some((r) => r.test(norm));
}

// ── Tipos ────────────────────────────────────────────────────────────────────

interface PlantRow {
  slug: string;
  nombre_es: string;
  nombre_latino: string | null;
  categoria: string;
  ficha_cientifica: {
    indicaciones?: string[];
    propiedades?: string[];
    contraindicaciones?: string[];
  } | null;
}

interface PostRow {
  slug: string;
  title: string;
  excerpt: string | null;
}

// ── Utilidades de texto ──────────────────────────────────────────────────────

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

const STOPWORDS = new Set([
  'para', 'como', 'sobre', 'algo', 'tengo', 'tiene', 'tener', 'donde', 'cual',
  'cuales', 'quiero', 'necesito', 'hola', 'buenas', 'tardes', 'noches', 'dias',
  'gracias', 'porfavor', 'favor', 'ayuda', 'puedes', 'podrias', 'dime', 'estoy',
  'este', 'esta', 'esto', 'unos', 'unas', 'pero', 'muy', 'que', 'con', 'los',
  'las', 'del', 'una', 'uno',
]);

function significantWords(text: string): string[] {
  return normalize(text)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w));
}

// ── Acceso a datos ───────────────────────────────────────────────────────────

async function fetchPlants(): Promise<PlantRow[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(
      `${url}/rest/v1/plants?select=slug,nombre_es,nombre_latino,categoria,ficha_cientifica&publicada=eq.true&ficha_verificada=eq.true`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store' }
    );
    if (!res.ok) return [];
    const data: PlantRow[] = await res.json();
    return data.filter((p) => !PLANTAS_PELIGROSAS.has(p.slug));
  } catch {
    return [];
  }
}

async function fetchPosts(): Promise<PostRow[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(
      `${url}/rest/v1/blog_posts?select=slug,title,excerpt&status=eq.published`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store' }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

function scoreOverlap(words: string[], haystack: string): number {
  const norm = normalize(haystack);
  return words.reduce((acc, w) => acc + (norm.includes(w) ? 1 : 0), 0);
}

// ── Respuesta de seguridad ───────────────────────────────────────────────────

/**
 * Genera la respuesta para contextos de riesgo (embarazo, medicación, etc.).
 * Primera frase fija. Si hay una planta identificable con ficha verificada,
 * incluye TODAS sus contraindicaciones. Sin artículos ni sugerencias de otras plantas.
 */
async function respuestaSeguridadRiesgo(mensaje: string): Promise<string> {
  const PRIMERA_FRASE = 'No tomes ninguna planta sin consultar antes con tu médico o farmacéutico.';
  const CIERRE = 'Para cualquier duda sobre tu situación, habla con tu médico, farmacéutico o [consulta con Papu](/terapeutas/papu).';

  const words = significantWords(mensaje);
  if (words.length === 0) return `${PRIMERA_FRASE} ${CIERRE}`;

  const plants = await fetchPlants();
  let bestPlant: PlantRow | null = null;
  let bestScore = 0;
  for (const p of plants) {
    // Solo buscar por nombre, no por indicaciones (evitar sugerir plantas)
    const hay = [p.nombre_es, p.nombre_latino || ''].join(' ');
    const s = scoreOverlap(words, hay);
    if (s > bestScore) { bestScore = s; bestPlant = p; }
  }

  if (bestPlant && bestScore >= 1 && bestPlant.ficha_cientifica?.contraindicaciones?.length) {
    const contras = bestPlant.ficha_cientifica.contraindicaciones.join('; ');
    return `${PRIMERA_FRASE} La ficha verificada de ${bestPlant.nombre_es} recoge estas contraindicaciones: ${contras}. ${CIERRE}`;
  }

  return `${PRIMERA_FRASE} ${CIERRE}`;
}

// ── Fallback local (sin IA disponible) ───────────────────────────────────────

async function localFallbackReply(message: string): Promise<string> {
  const words = significantWords(message);
  if (words.length === 0) {
    return 'Cuéntame un poco más: ¿buscas una planta concreta, un plan nutricional o algo sobre bienestar km0?';
  }

  const [plants, posts] = await Promise.all([fetchPlants(), fetchPosts()]);

  let bestPlant: PlantRow | null = null;
  let bestPlantScore = 0;
  for (const p of plants) {
    const haystack = [
      p.nombre_es,
      p.nombre_latino || '',
      p.categoria,
      ...(p.ficha_cientifica?.indicaciones || []),
      ...(p.ficha_cientifica?.propiedades || []),
    ].join(' ');
    const score = scoreOverlap(words, haystack);
    if (score > bestPlantScore) {
      bestPlantScore = score;
      bestPlant = p;
    }
  }

  let bestPost: PostRow | null = null;
  let bestPostScore = 0;
  for (const post of posts) {
    const haystack = `${post.title} ${post.excerpt || ''}`;
    const score = scoreOverlap(words, haystack);
    if (score > bestPostScore) {
      bestPostScore = score;
      bestPost = post;
    }
  }

  if (bestPlant && bestPlantScore >= 1) {
    const indicaciones = bestPlant.ficha_cientifica?.indicaciones?.slice(0, 3).join(', ');
    // Mostrar TODAS las contraindicaciones (antes: slice(0,2))
    const contraindicaciones = bestPlant.ficha_cientifica?.contraindicaciones?.join('; ');
    let reply = `${bestPlant.nombre_es}${bestPlant.nombre_latino ? ` (${bestPlant.nombre_latino})` : ''} puede interesarte.`;
    if (indicaciones) reply += ` Se usa tradicionalmente para: ${indicaciones}.`;
    if (contraindicaciones) reply += ` Precaución: ${contraindicaciones}.`;
    reply += ` Ficha completa en /diccionario/${bestPlant.slug}.`;
    if (bestPost && bestPostScore >= 1) reply += ` También puede interesarte nuestro artículo "${bestPost.title}" en /blog/${bestPost.slug}.`;
    reply += ' Para cualquier condición de salud concreta, consulta con un profesional médico.';
    return reply;
  }

  if (bestPost && bestPostScore >= 1) {
    return `Tenemos un artículo que puede ayudarte: "${bestPost.title}" — /blog/${bestPost.slug}. También puedes explorar el diccionario de plantas en /diccionario.`;
  }

  return 'No tengo una respuesta puntual para eso ahora mismo, pero puedes explorar el diccionario de plantas en /diccionario o el blog en /blog. Para condiciones de salud concretas, consulta con un profesional médico.';
}

// ── Handler principal ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let userMessage: string | undefined;
  try {
    const { message, history = [] } = await req.json() as {
      message: string;
      history: { role: string; text: string }[];
    };
    userMessage = message;

    if (!message || typeof message !== 'string' || message.length > 1000) {
      return NextResponse.json({ error: 'Mensaje inválido' }, { status: 400 });
    }

    // ── Seguridad: contextos de riesgo — ANTES de cualquier IA o búsqueda ──
    // Embarazo, lactancia, niños, medicación, enfermedad, cirugía.
    if (tieneContextoRiesgo(message)) {
      const reply = await respuestaSeguridadRiesgo(message);
      return NextResponse.json({ reply });
    }

    // Intentar via n8n primero
    try {
      const n8nRes = await fetch(N8N_CHAT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
        signal: AbortSignal.timeout(10000),
      });
      if (n8nRes.ok) {
        const data = await n8nRes.json() as { reply?: string };
        if (data.reply) return NextResponse.json({ reply: data.reply });
      }
    } catch {
      // n8n no disponible, fallback a Ollama
    }

    // Fallback: Ollama directo
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-6).map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text,
      })),
      { role: 'user', content: message },
    ];

    const ollamaRes = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: OLLAMA_MODEL, messages, stream: false }),
      signal: AbortSignal.timeout(15000),
    });

    if (!ollamaRes.ok) throw new Error('Ollama no disponible');

    const data = await ollamaRes.json() as { message?: { content?: string } };
    const reply = data.message?.content || 'No pude generar una respuesta.';

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('[chat]', err);
    if (userMessage) {
      const reply = await localFallbackReply(userMessage);
      return NextResponse.json({ reply }, { status: 200 });
    }
    return NextResponse.json(
      { reply: 'En este momento no puedo responder. Inténtalo en unos minutos.' },
      { status: 200 },
    );
  }
}
