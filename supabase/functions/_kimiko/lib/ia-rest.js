// Workers AI por REST (desde Supabase): misma interfaz que el binding env.AI → ai.run(modelo, entrada).
// Gratis dentro de las 10.000 neuronas/día de la cuenta; agotadas, Cloudflare devuelve error (3036) en vez de cobrar.
export function iaRest({ accountId, token, fetchImpl = fetch }) {
  return {
    async run(modelo, entrada) {
      if (!accountId || !token) throw new Error('Workers AI REST: faltan CF_ACCOUNT_ID o CF_AI_TOKEN');
      const r = await fetchImpl(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${modelo}`, {
        method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify(entrada),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d.success === false) throw new Error(`Workers AI ${r.status}: ${JSON.stringify(d.errors || d).slice(0, 300)}`);
      return d.result;
    },
  };
}
