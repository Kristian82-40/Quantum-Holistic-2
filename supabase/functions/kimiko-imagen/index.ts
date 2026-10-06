// kimiko-imagen: genera una imagen con Workers AI (flux-1-schnell, cupo gratis) con la estética de marca
// y la sube al bucket público "kimiko". La usa Kimiko Cloud (GitHub Actions) para las plantas del diccionario
// y cualquier pieza que necesite imagen. Coste 0 €: al agotar el cupo diario Cloudflare devuelve error, no cobra.
//
// Quién puede llamarla (verify_jwt=false, autenticación propia):
//   · Kimiko Cloud con su llave secreta de Supabase (cabecera apikey) — se comprueba contra el endpoint de admin,
//     que solo acepta llaves secretas/de servicio.
//   · pg_cron / SQL interno con la cabecera x-kimiko-secreto (secreto en Vault).
//
// POST { "slug": "manzanilla", "nombre_latino": "Matricaria chamomilla", "escena": "flores blancas…",
//        "tipo": "cientifica" | "mistica" | "libre", "ruta": "opcional/sin-extension" }
// → { ok, url, ruta, modelo }

const MODELO = '@cf/black-forest-labs/flux-1-schnell';
const BUCKET = 'kimiko';

const ESTILO: Record<string, string> = {
  cientifica:
    'botanical scientific watercolor plate, 19th century herbarium illustration, semi-translucent watercolor washes with ' +
    'realistic subtle details, accurate leaves, flowers and stems, soft cream background #F4EDE0, muted sage green and ' +
    'soft gold tones, centered composition, no text, no letters, no labels, no people',
  mistica:
    'ethereal semi-translucent watercolor, realistic subtle botanical details, soft glowing light, cream background, ' +
    'sage green, warm gold and terracotta accents, serene and sacred mood, no text, no letters, no people',
  libre: 'semi-translucent watercolor with realistic subtle details, cream background, sage green and soft gold palette, no text, no people',
};

const json = (d: unknown, status = 200) =>
  new Response(JSON.stringify(d), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

async function igualSeguro(a: string, b: string) {
  const enc = new TextEncoder();
  const [x, y] = (await Promise.all([crypto.subtle.digest('SHA-256', enc.encode(a)), crypto.subtle.digest('SHA-256', enc.encode(b))]))
    .map((h) => new Uint8Array(h));
  let dif = 0;
  for (let i = 0; i < x.length; i++) dif |= x[i] ^ y[i];
  return dif === 0;
}

// Llave con la que la función sube a Storage (la secreta "kimiko" si existe, si no la de servicio).
function llaveSecreta(): string {
  try {
    const m = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}');
    const v = m.kimiko ?? m.default ?? Object.values(m)[0];
    if (typeof v === 'string' && v) return v;
  } catch { /* se usa la de respaldo */ }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
}

async function autorizado(req: Request): Promise<boolean> {
  const secreto = Deno.env.get('KIMIKO_CRON_SECRETO') ?? '';
  const cab = req.headers.get('x-kimiko-secreto') ?? '';
  if (secreto && cab && (await igualSeguro(cab, secreto))) return true;

  const llave = req.headers.get('apikey') ?? (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!llave || llave.length < 20) return false;
  // Solo una llave secreta o de servicio puede leer el endpoint de admin de Auth.
  const r = await fetch(`${Deno.env.get('SUPABASE_URL')}/auth/v1/admin/users?per_page=1`, {
    headers: { apikey: llave, authorization: `Bearer ${llave}` },
  });
  await r.body?.cancel();
  return r.ok;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'usa POST' }, 405);
  if (!(await autorizado(req))) return json({ error: 'no autorizado' }, 401);

  const p = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (p.accion === 'diag') {
    return json({ cf_ai_token: !!Deno.env.get('CF_AI_TOKEN'), cf_account_id: !!Deno.env.get('CF_ACCOUNT_ID') });
  }
  const slug = String(p.slug ?? '').trim();
  const tipo = String(p.tipo ?? 'cientifica');
  const latino = String(p.nombre_latino ?? '').trim().slice(0, 80);
  const escena = String(p.escena ?? '').trim().slice(0, 600);
  if (!/^[a-z0-9-]{2,60}$/.test(slug)) return json({ error: 'slug inválido (a-z, 0-9, guiones)' }, 400);
  if (!ESTILO[tipo]) return json({ error: 'tipo debe ser cientifica, mistica o libre' }, 400);
  if (!latino && !escena) return json({ error: 'falta nombre_latino o escena' }, 400);

  const ruta = String(p.ruta ?? `plantas/${slug}-${tipo}-${Date.now().toString(36)}`);
  if (!/^[a-z0-9/_-]{3,120}$/.test(ruta) || ruta.includes('..')) return json({ error: 'ruta inválida' }, 400);

  const cuenta = Deno.env.get('CF_ACCOUNT_ID') ?? '';
  const token = Deno.env.get('CF_AI_TOKEN') ?? '';
  if (!cuenta || !token) return json({ error: 'faltan CF_ACCOUNT_ID o CF_AI_TOKEN en los secretos de la función' }, 500);

  const prompt = [latino && `${latino} (the real plant species, botanically accurate)`, escena, ESTILO[tipo]]
    .filter(Boolean).join('. ').slice(0, 2048);

  const ai = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cuenta}/ai/run/${MODELO}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ prompt, steps: 8 }),
  });
  const d = await ai.json().catch(() => ({}));
  if (!ai.ok || d?.success === false || !d?.result?.image) {
    const cupo = JSON.stringify(d?.errors ?? '').includes('3036');
    return json({ error: cupo ? 'cupo diario gratis de Workers AI agotado: reintenta mañana' : `Workers AI ${ai.status}`,
      detalle: JSON.stringify(d?.errors ?? d).slice(0, 300) }, 502);
  }

  const bytes = Uint8Array.from(atob(d.result.image), (c) => c.charCodeAt(0));
  const url = Deno.env.get('SUPABASE_URL');
  const llave = llaveSecreta();
  const sub = await fetch(`${url}/storage/v1/object/${BUCKET}/${ruta}.jpg`, {
    method: 'POST',
    headers: { apikey: llave, authorization: `Bearer ${llave}`, 'content-type': 'image/jpeg', 'x-upsert': 'true' },
    body: bytes,
  });
  if (!sub.ok) return json({ error: `Storage ${sub.status}`, detalle: (await sub.text()).slice(0, 200) }, 502);

  return json({ ok: true, url: `${url}/storage/v1/object/public/${BUCKET}/${ruta}.jpg`, ruta: `${BUCKET}/${ruta}.jpg`, modelo: MODELO });
});
