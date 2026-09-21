import { NextRequest, NextResponse } from 'next/server';
import { PLANTAS_PELIGROSAS } from '@/lib/plantas-peligrosas';

const N8N_CHAT_WEBHOOK = process.env.N8N_CHAT_WEBHOOK_URL || 'http://localhost:5678/webhook/chat-holistic';
const OLLAMA_URL       = process.env.OLLAMA_URL            || 'http://localhost:11434';
const OLLAMA_MODEL     = process.env.OLLAMA_MODEL          || 'papu-pro:latest';

const SYSTEM_PROMPT = `Eres el asistente holístico de Quantum Holistic, un servicio de nutrición km0, herbología y bienestar personalizado.
Tu rol: orientar a los usuarios en nutrición de proximidad, plantas medicinales, detox estacional y bienestar integral.
Tono: cálido, experto, breve. Responde siempre en español.
Límite: no des diagnósticos médicos. Para condiciones graves, recomienda consulta médica.
Si el usuario tiene interés en planes personalizados, menciona brevemente los planes Freemium y Quantum Pro.`;

// --- Fallback sin IA: n8n y Ollama son servicios locales de Kristian, no
// alcanzables desde las funciones serverless de Vercel. Cuando ambos fallan
// (siempre, en producción, hasta que se expongan públicamente), en vez de un
// mensaje de error muerto, se busca una respuesta útil en el propio
// contenido verificado del sitio (diccionario + blog).

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
    const contraindicaciones = bestPlant.ficha_cientifica?.contraindicaciones?.slice(0, 2).join(', ');
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
