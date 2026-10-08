// GitHub (repo de la web): despertar a Kimiko Cloud con una orden y fusionar o cerrar sus PR desde Telegram.
// GH_TOKEN: token fine-grained de Kristian solo para Kristian82-40/Quantum-Holistic-2 (Contents y Pull requests: lectura y escritura).
export const REPO = 'Kristian82-40/Quantum-Holistic-2';

async function gh(token, metodo, ruta, cuerpo, fetchImpl = fetch) {
  if (!token) throw new Error('falta GH_TOKEN en el worker');
  const r = await fetchImpl(`https://api.github.com/repos/${REPO}${ruta}`, {
    method: metodo,
    headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28', 'user-agent': 'kimiko-worker', 'content-type': 'application/json' },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  if (!r.ok) throw new Error(`GitHub ${metodo} ${ruta} ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.status === 204 ? null : r.json().catch(() => null);
}

export const despertarKimikoCloud = (token, draftId, fetchImpl) => gh(token, 'POST', '/dispatches', { event_type: 'kimiko-orden', client_payload: { draft_id: draftId } }, fetchImpl);
export const fusionarPR = (token, numero, fetchImpl) => gh(token, 'PUT', `/pulls/${numero}/merge`, { merge_method: 'squash' }, fetchImpl);
export const cerrarPR = (token, numero, fetchImpl) => gh(token, 'PATCH', `/pulls/${numero}`, { state: 'closed' }, fetchImpl);
