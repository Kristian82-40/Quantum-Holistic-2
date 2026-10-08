// Supabase por REST. Solo se usa desde el servidor, con la clave de servicio (nunca en el navegador).
export function crearDb({ url, serviceKey, fetchImpl = fetch }) {
  const h = { apikey: serviceKey, authorization: `Bearer ${serviceKey}` };
  const json = { ...h, 'content-type': 'application/json' };

  async function ok(r) {
    if (!r.ok) throw new Error(`Supabase ${r.status}: ${(await r.text()).slice(0, 200)}`);
    return r;
  }

  return {
    async insertar(tabla, fila) {
      const r = await ok(await fetchImpl(`${url}/rest/v1/${tabla}`, {
        method: 'POST', headers: { ...json, prefer: 'return=representation' }, body: JSON.stringify(fila),
      }));
      return (await r.json())[0];
    },
    // Devuelve la fila si es nueva, o null si ya existía (Telegram reintenta el mismo update_id).
    async insertarSiNuevo(tabla, fila, conflicto) {
      const r = await ok(await fetchImpl(`${url}/rest/v1/${tabla}?on_conflict=${conflicto}`, {
        method: 'POST', headers: { ...json, prefer: 'return=representation,resolution=ignore-duplicates' }, body: JSON.stringify(fila),
      }));
      return (await r.json())[0] ?? null;
    },
    async seleccionar(tabla, consulta = '') {
      const r = await ok(await fetchImpl(`${url}/rest/v1/${tabla}?${consulta}`, { headers: h }));
      return r.json();
    },
    async actualizar(tabla, filtro, cambios) {
      await ok(await fetchImpl(`${url}/rest/v1/${tabla}?${filtro}`, {
        method: 'PATCH', headers: { ...json, prefer: 'return=minimal' }, body: JSON.stringify(cambios),
      }));
    },
    // Devuelve la ruta. kimiko-privado (redes) se lee con URLs firmadas; kimiko (blog) es público.
    async subir(bucket, ruta, bytes, mime) {
      await ok(await fetchImpl(`${url}/storage/v1/object/${bucket}/${ruta}`, {
        method: 'POST', headers: { ...h, 'content-type': mime, 'x-upsert': 'true' }, body: bytes,
      }));
      return ruta;
    },
    // Subida en streaming (cuerpo ReadableStream): para fotos de Telegram sin cargarlas en memoria.
    async subirStream(ruta, cuerpo, mime, bucket = 'kimiko-privado') {
      await ok(await fetchImpl(`${url}/storage/v1/object/${bucket}/${ruta}`, {
        method: 'POST', headers: { ...h, 'content-type': mime, 'x-upsert': 'true' }, body: cuerpo, duplex: 'half',
      }));
      return `${bucket}/${ruta}`;
    },
    // Función SQL expuesta por PostgREST (solo las que tienen GRANT a service_role).
    async rpc(nombre, args = {}) {
      const r = await ok(await fetchImpl(`${url}/rest/v1/rpc/${nombre}`, { method: 'POST', headers: json, body: JSON.stringify(args) }));
      return r.json();
    },
    urlPublica: (bucket, ruta) => `${url}/storage/v1/object/public/${bucket}/${ruta}`,
    // SVG → PNG en la Edge Function kimiko-ficha, que lo sube ella misma al bucket "kimiko" con esta misma llave.
    async fichaPNG(svg, ruta) {
      const r = await ok(await fetchImpl(`${url}/functions/v1/kimiko-ficha`, {
        method: 'POST', headers: json, body: JSON.stringify({ svg, ruta }),
      }));
      const d = await r.json();
      if (!d.ruta) throw new Error(`kimiko-ficha no devolvió ruta: ${JSON.stringify(d).slice(0, 200)}`);
      return d.ruta;
    },
    async gastoMes(mes) {
      const filas = await this.seleccionar('kimiko_spend', `mes=eq.${mes}&select=usd,ok`);
      return {
        usd: filas.reduce((s, f) => s + Number(f.usd || 0), 0),
        ejecuciones: filas.length,
        fallidas: filas.filter((f) => f.ok === false).length,
      };
    },
  };
}
