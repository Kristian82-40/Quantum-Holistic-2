#!/usr/bin/env python3
"""Sube una foto de Grok a Storage (kimiko/plantas/grok/) y la enlaza en su ficha, solo si es borrador.

Uso: python3 kimiko/fotos-grok/subir-lamina.py <grok_id> <plants.id> <slug> [archivo]
[archivo]: otra imagen (JPEG o WebP) en lugar de entrada/grok-<grok_id>.jpg; se guarda como JPEG.
La llave se lee de .env.local (SUPABASE_SERVICE_ROLE_KEY); nunca se imprime.
No sobrescribe archivos de Storage ni toca fichas publicadas. Imprime el valor anterior para poder revertir.
"""
import io, json, os, sys, urllib.request, urllib.error
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENV = os.environ.get('QH_ENV', os.path.expanduser('~/Projects/quantum-holistic/.env.local'))


def env():
    vals = {}
    for linea in open(ENV):
        if '=' in linea and not linea.lstrip().startswith('#'):
            k, v = linea.strip().split('=', 1)
            vals[k] = v.strip().strip('"\'')
    return vals['NEXT_PUBLIC_SUPABASE_URL'].rstrip('/'), vals['SUPABASE_SERVICE_ROLE_KEY']


def pedir(metodo, url, llave, cuerpo=None, cabeceras=None):
    h = {'apikey': llave, 'Authorization': f'Bearer {llave}'}
    h.update(cabeceras or {})
    req = urllib.request.Request(url, data=cuerpo, method=metodo, headers=h)
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def main(grok_id, planta_id, slug, archivo=None):
    base, llave = env()
    origen = archivo or os.path.join(RAIZ, 'kimiko', 'fotos-grok', 'entrada', f'grok-{grok_id}.jpg')
    destino = f'plantas/grok/grok-{grok_id}-{slug}.jpg'
    publica = f'{base}/storage/v1/object/public/kimiko/{destino}'

    st, cuerpo = pedir('GET', f'{base}/rest/v1/plants?id=eq.{planta_id}&select=id,slug,grok_id,publicada,image_cientifica_url', llave)
    filas = json.loads(cuerpo)
    if st != 200 or len(filas) != 1:
        sys.exit(f'PARA: no encuentro la planta {planta_id} ({st})')
    p = filas[0]
    if p['slug'] != slug:
        sys.exit(f'PARA: el slug de {planta_id} es {p["slug"]}, no {slug}')
    if p['publicada']:
        sys.exit(f'PARA: {slug} está publicada; no se toca')
    st, cuerpo = pedir('GET', f'{base}/rest/v1/plants?grok_id=eq.{grok_id}&id=neq.{planta_id}&select=id', llave)
    if json.loads(cuerpo):
        sys.exit(f'PARA: el grok_id {grok_id} ya está en otra planta: {cuerpo.decode()}')

    # Re-guardar sin Exif/XMP
    img = Image.open(origen).convert('RGB')
    buf = io.BytesIO()
    img.save(buf, 'JPEG', quality=92, optimize=True)

    st, cuerpo = pedir('POST', f'{base}/storage/v1/object/kimiko/{destino}', llave, buf.getvalue(),
                       {'Content-Type': 'image/jpeg', 'x-upsert': 'false', 'Cache-Control': 'max-age=31536000'})
    if st not in (200, 201):
        sys.exit(f'PARA: subida {st}: {cuerpo[:200]!r}')
    st, _ = pedir('GET', publica, llave)
    if st != 200:
        sys.exit(f'PARA: la URL pública da {st}')

    st, cuerpo = pedir('PATCH', f'{base}/rest/v1/plants?id=eq.{planta_id}&publicada=eq.false', llave,
                       json.dumps({'image_cientifica_url': publica, 'grok_id': grok_id}).encode(),
                       {'Content-Type': 'application/json', 'Prefer': 'return=representation'})
    filas = json.loads(cuerpo)
    if st != 200 or len(filas) != 1:
        sys.exit(f'PARA: update {st}: {cuerpo[:200]!r}')
    print(json.dumps({'id': planta_id, 'slug': slug, 'grok_id': grok_id, 'antes': p['image_cientifica_url'],
                      'grok_id_antes': p['grok_id'], 'ahora': publica, 'publicada': filas[0]['publicada']},
                     ensure_ascii=False))


if __name__ == '__main__':
    if len(sys.argv) not in (4, 5):
        sys.exit(__doc__)
    main(int(sys.argv[1]), int(sys.argv[2]), sys.argv[3], *sys.argv[4:])
