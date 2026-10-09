#!/usr/bin/env python3
"""Fusión automática de PR de Kimiko y Claude (Kristian no tiene que entrar en GitHub).

Cada pase mira los PR abiertos de ramas `claude/*` y `kimiko/*` y, para cada uno:
  · si las pruebas aún corren o el último cambio tiene menos de ESPERA_MIN minutos → espera al siguiente pase;
  · si algo falló (pruebas, Vercel, conflicto) → avisa por Telegram una vez por versión del PR y no fusiona;
  · si toca algo delicado (base de datos, pagos, reglas de Kimiko, este fusionador) → avisa «necesita tu OK» y no fusiona;
  · si todo está en verde → lo fusiona (squash), borra la rama y avisa «✅ fusionado».
Nunca toca PR de Dependabot ni de forks, ni los que lleven la etiqueta `no-fusionar`.

Variables: GH_TOKEN (token de Kristian con Contents, Pull requests y Workflows en este repo; secreto KIMIKO_GH_TOKEN),
SUPABASE_KEY (para avisar por Telegram vía kimiko-diario), SECO=1 (solo dice qué haría, sin tocar nada).
Solo usa la biblioteca estándar. Nunca imprime llaves.
"""
import datetime as dt
import json
import os
import re
import sys
import urllib.error
import urllib.request

REPO = os.environ.get('REPO', 'Kristian82-40/Quantum-Holistic-2')
API = f'https://api.github.com/repos/{REPO}'
TOKEN = os.environ.get('GH_TOKEN', '')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', '')
KIMIKO_URL = 'https://vctetjugbvyllwjpxcxh.supabase.co/functions/v1/kimiko-diario'
SECO = os.environ.get('SECO') == '1'
ESPERA_MIN = int(os.environ.get('ESPERA_MIN', '10'))

RAMAS = ('claude/', 'kimiko/')
PRUEBAS_OBLIGATORIAS = {'pruebas-kimiko', 'gitleaks'}
MALAS = {'failure', 'cancelled', 'timed_out', 'action_required', 'startup_failure', 'stale'}
# Lo que nunca se fusiona solo: (patrón de ruta, motivo para Kristian).
DELICADO = [
    (r'^supabase/migrations/', 'cambia la base de datos'),
    (r'(?i)(stripe|checkout|precio|pricing|pago)', 'toca pagos o precios'),
    (r'^(kimiko/PROMPT\.md|CLAUDE\.md)$', 'cambia las reglas de Kimiko'),
    (r'^(kimiko/fusion/|\.github/workflows/kimiko-fusion\.yml$)', 'cambia el propio fusionador'),
]


def gh(metodo, ruta, cuerpo=None):
    url = ruta if ruta.startswith('https://') else f'{API}{ruta}'
    req = urllib.request.Request(url, method=metodo, data=json.dumps(cuerpo).encode() if cuerpo is not None else None, headers={
        'authorization': f'Bearer {TOKEN}', 'accept': 'application/vnd.github+json',
        'x-github-api-version': '2022-11-28', 'user-agent': 'kimiko-fusion', 'content-type': 'application/json'})
    with urllib.request.urlopen(req, timeout=30) as r:
        b = r.read()
        return json.loads(b) if b else None


def avisar(titulo, texto, url):
    print(f'[aviso] {titulo} · {texto} · {url}')
    if SECO or not SUPABASE_KEY:
        return
    req = urllib.request.Request(KIMIKO_URL, method='POST', data=json.dumps({'accion': 'avisar-ci', 'titulo': titulo, 'texto': texto, 'url': url}).encode(),
                                 headers={'apikey': SUPABASE_KEY, 'content-type': 'application/json'})
    try:
        urllib.request.urlopen(req, timeout=30).read()
    except urllib.error.URLError as e:
        print(f'No pude avisar por Telegram: {e}')


def ya_avisado(pr, marca):
    """Un aviso por versión del PR: la marca queda como comentario oculto en el propio PR."""
    comentarios = gh('GET', f"/issues/{pr['number']}/comments?per_page=100")
    return any(marca in (c.get('body') or '') for c in comentarios)


def avisar_una_vez(pr, clave, titulo, texto):
    marca = f"<!-- kimiko-fusion:{pr['head']['sha']}:{clave} -->"
    if ya_avisado(pr, marca):
        return
    avisar(titulo, texto, pr['html_url'])
    if not SECO:
        gh('POST', f"/issues/{pr['number']}/comments", {'body': f'🤖 Kimiko · {titulo}\n\n{texto}\n\n{marca}'})


def estado_pruebas(sha):
    """'ok', 'espera' o ('falla', nombres)."""
    runs = gh('GET', f'/commits/{sha}/check-runs?per_page=100')['check_runs']
    runs = [r for r in runs if r['name'] != 'fusionar']
    if any(r['status'] != 'completed' for r in runs):
        return 'espera'
    fallos = sorted({r['name'] for r in runs if r['conclusion'] in MALAS})
    estado = gh('GET', f'/commits/{sha}/status')
    fallos += [s['context'] for s in estado['statuses'] if s['state'] in ('failure', 'error')]
    if fallos:
        return ('falla', fallos)
    if any(s['state'] == 'pending' for s in estado['statuses']):
        return 'espera'
    ok = {r['name'] for r in runs if r['conclusion'] == 'success'}
    return 'ok' if PRUEBAS_OBLIGATORIAS <= ok else 'espera'


def motivos_delicados(numero):
    archivos = [f['filename'] for f in gh('GET', f'/pulls/{numero}/files?per_page=100')]
    return sorted({motivo for a in archivos for patron, motivo in DELICADO if re.search(patron, a)})


def atender(pr):
    n, rama, sha = pr['number'], pr['head']['ref'], pr['head']['sha']
    if pr.get('draft') or not rama.startswith(RAMAS) or pr['head']['repo'] is None or pr['head']['repo']['full_name'] != REPO:
        return 'fuera'
    if any(l['name'] == 'no-fusionar' for l in pr.get('labels', [])):
        return 'no-fusionar'
    fecha = gh('GET', f'/commits/{sha}')['commit']['committer']['date']
    edad = (dt.datetime.now(dt.timezone.utc) - dt.datetime.fromisoformat(fecha.replace('Z', '+00:00'))).total_seconds() / 60
    if edad < ESPERA_MIN:
        return f'espera ({edad:.0f} min)'
    pruebas = estado_pruebas(sha)
    if pruebas == 'espera':
        return 'espera pruebas'
    if pruebas != 'ok':
        avisar_una_vez(pr, 'falla', f'⚠️ PR #{n} no se fusiona: fallan pruebas', f"«{pr['title']}»\nFalla: {', '.join(pruebas[1])}. Claude o Kimiko lo arreglan; no tienes que hacer nada.")
        return 'falla'
    detalle = gh('GET', f'/pulls/{n}')
    if detalle['mergeable'] is None:
        return 'espera mergeable'
    if not detalle['mergeable']:
        avisar_una_vez(pr, 'conflicto', f'⚠️ PR #{n} choca con main', f"«{pr['title']}»\nHay que rehacerlo sobre la versión actual. Lo hace Claude o Kimiko.")
        return 'conflicto'
    delicado = motivos_delicados(n)
    if delicado:
        avisar_una_vez(pr, 'ok', f'🔐 PR #{n} necesita tu OK', f"«{pr['title']}»\nNo lo fusiono solo porque {' y '.join(delicado)}. Ábrelo y pulsa «Merge» si te parece bien.")
        return 'necesita OK'
    if not TOKEN_ESCRIBE:
        avisar_una_vez(pr, 'llave', f'🔑 PR #{n} listo, pero me falta la llave', f"«{pr['title']}»\nEstá en verde. Para fusionarlo solo necesito el secreto KIMIKO_GH_TOKEN en GitHub (pasos en ESTADO.md).")
        return 'sin llave'
    if SECO:
        return 'fusionaría'
    gh('PUT', f'/pulls/{n}/merge', {'merge_method': 'squash', 'sha': sha})
    try:
        gh('DELETE', f'/git/refs/heads/{rama}')
    except urllib.error.HTTPError:
        pass  # la rama ya no estaba: no importa
    avisar(f'✅ Kimiko fusionó el PR #{n}', f"«{pr['title']}»\nPruebas en verde. Vercel lo publica en un par de minutos.", pr['html_url'])
    return 'fusionado'


def main():
    global TOKEN_ESCRIBE
    if not TOKEN:
        sys.exit('Falta GH_TOKEN')
    TOKEN_ESCRIBE = os.environ.get('TOKEN_ESCRIBE', '1') == '1'
    print(f"::notice title=Llave::{'la de Kristian (puede fusionar)' if TOKEN_ESCRIBE else 'la de Actions (solo avisa)'}")
    for pr in gh('GET', '/pulls?state=open&per_page=50'):
        try:
            r = atender(pr)
            if r != 'fuera':  # anotación visible en el resumen de la ejecución (y por la API de checks)
                print(f"::notice title=PR {pr['number']}::{r}")
        except urllib.error.HTTPError as e:
            print(f"::error title=PR {pr['number']}::GitHub {e.code} {e.read()[:200]!r}")


TOKEN_ESCRIBE = True

if __name__ == '__main__':
    main()
