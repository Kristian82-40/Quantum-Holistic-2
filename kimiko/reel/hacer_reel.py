#!/usr/bin/env python3
"""Reel diario de Kimiko (9:16, ~16 s) a partir de la pieza del día. Coste 0 €: Pillow + ffmpeg en GitHub Actions.

Flujo: kimiko_content del día → post del blog (título, extracto, imagen) → 4 rótulos sobre la imagen con zoom lento
→ MP4 1080x1920 con un fondo sonoro suave → Storage `kimiko/reels/<proyecto>/<fecha>.mp4` → kimiko_content.reel_url
→ kimiko-diario {accion:"enviar-reel"} lo manda por Telegram listo para subir a Instagram/TikTok a mano.

Variables: SUPABASE_URL, SUPABASE_KEY (llave de servicio), FECHA (AAAA-MM-DD, por defecto hoy UTC),
FORZAR=1 (rehacer aunque ya exista), SIN_SUBIR=1 (solo generar en ./salida para probar), FUENTES (carpeta con .ttf).
Nunca imprime la llave. Si no hay pieza del día, sale con 0 y lo dice (el reintento de la tarde lo vuelve a intentar).
"""
import datetime as dt
import json
import os
import re
import subprocess
import sys
import textwrap
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS, DUR = 1080, 1920, 30, 16
CREMA, BOSQUE, DORADO, NOCHE = (245, 230, 211), (26, 58, 42), (212, 168, 83), (10, 22, 40)
DOMINIO = 'quantum-holistic.com'
AVISO = 'Contenido informativo. No sustituye el consejo de un profesional de la salud.'
# Rótulos: (inicio, fin) en segundos. Se solapan 0,4 s con fundido.
TRAMOS = [(0.3, 4.4), (4.2, 8.6), (8.4, 12.6), (12.4, DUR)]

URL = os.environ.get('SUPABASE_URL', 'https://vctetjugbvyllwjpxcxh.supabase.co').rstrip('/')
KEY = os.environ.get('SUPABASE_KEY', '')
SALIDA = Path(os.environ.get('SALIDA', 'salida'))
FUENTES = Path(os.environ.get('FUENTES', 'fuentes'))


def pedir(metodo, ruta, cuerpo=None, cabeceras=None, crudo=False):
    h = {'apikey': KEY, 'authorization': f'Bearer {KEY}'}
    h.update(cabeceras or {})
    datos = cuerpo if (cuerpo is None or isinstance(cuerpo, bytes)) else json.dumps(cuerpo).encode()
    if datos is not None and 'content-type' not in h:
        h['content-type'] = 'application/json'
    req = urllib.request.Request(f'{URL}{ruta}', data=datos, method=metodo, headers=h)
    with urllib.request.urlopen(req, timeout=60) as r:
        b = r.read()
        return b if crudo else (json.loads(b) if b else None)


def fuente(nombre, tam):
    """'Familia-Estilo.ttf' → fuente variable de Google Fonts (FUENTES/Familia.ttf) con ese estilo; si no está, DejaVu."""
    familia, estilo = nombre.removesuffix('.ttf').split('-')
    f = FUENTES / f'{familia}.ttf'
    if f.exists():
        t = ImageFont.truetype(str(f), tam)
        try:
            t.set_variation_by_name(estilo)
        except Exception:  # fuente estática o estilo inexistente: se queda la normal
            pass
        return t
    d = Path('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')
    return ImageFont.truetype(str(d), tam) if d.exists() else ImageFont.load_default()


def limpiar(t):
    t = re.sub(r'<[^>]+>', ' ', t or '')
    t = re.sub(r'[#*_`>\[\]]', '', t)
    t = re.sub(r'(?i)contenido informativo[^.]*\.', '', t)
    return re.sub(r'\s+', ' ', t).strip()


def frases(t, maximo=150):
    out = ''
    for f in re.split(r'(?<=[.!?])\s+', limpiar(t)):
        if not f or len(out) + len(f) > maximo:
            break
        out = f'{out} {f}'.strip()
    return out or limpiar(t)[:maximo].rsplit(' ', 1)[0] + '…'


def precaucion(contenido):
    """Las 2 primeras líneas de la sección de precauciones del post; si no hay, la genérica. Nunca cifras de dosis."""
    sec = re.split(r'(?i)<h2>[^<]*precauci', contenido or '', maxsplit=1)
    items = re.findall(r'<li>(.*?)</li>', sec[1] if len(sec) > 1 else '', re.S)
    items = [limpiar(i) for i in items if not re.search(r'\d+\s*(mg|g|ml|gotas|tazas?|cucharad)', i, re.I)][:2]
    t = ' · '.join(i.rstrip('.') for i in items if i)
    return frases(t, 120) if t else 'Embarazo, lactancia o medicación: consulta antes con un profesional.'


def fondo(img_bytes, ruta):
    im = Image.open(__import__('io').BytesIO(img_bytes)).convert('RGB')
    # Cubrir 9:16 con margen del 12 % para el zoom lento.
    esc = max(W * 1.12 / im.width, H * 1.12 / im.height)
    im = im.resize((round(im.width * esc), round(im.height * esc)), Image.LANCZOS)
    x, y = (im.width - round(W * 1.12)) // 2, (im.height - round(H * 1.12)) // 2
    im = im.crop((x, y, x + round(W * 1.12), y + round(H * 1.12)))
    im.save(ruta, quality=92)


def rotulo(ruta, texto, *, tipo, sub=None, etiqueta=None):
    """PNG transparente 1080x1920 con un panel crema translúcido y el texto (estética acuarela de la marca)."""
    capa = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(capa)
    if tipo == 'titulo':
        f, ancho, color = fuente('CormorantGaramond-SemiBold.ttf', 96), 18, BOSQUE
    elif tipo == 'cta':
        f, ancho, color = fuente('CormorantGaramond-SemiBold.ttf', 84), 20, BOSQUE
    else:
        f, ancho, color = fuente('DMSans-Medium.ttf', 58), 28, NOCHE
    lineas = textwrap.wrap(texto, ancho)[:6]
    fs = fuente('DMSans-Regular.ttf', 40)
    sublineas = textwrap.wrap(sub, 40)[:3] if sub else []
    alto = sum(d.textbbox((0, 0), l, font=f)[3] + 22 for l in lineas) + sum(52 for _ in sublineas) + (40 if sub else 0)
    y0 = int(H * 0.60) - alto // 2
    extra = 80 if etiqueta else 0
    panel = Image.new('RGBA', (W - 120, alto + 120 + extra), CREMA + (222,))
    mascara = Image.new('L', panel.size, 0)
    ImageDraw.Draw(mascara).rounded_rectangle((0, 0, *panel.size), 48, fill=255)
    capa.paste(panel, (60, y0 - 60 - extra), mascara.filter(ImageFilter.GaussianBlur(2)))
    d.line((W // 2 - 60, y0 - 28, W // 2 + 60, y0 - 28), fill=DORADO + (255,), width=4)
    if etiqueta:
        fe = fuente('DMSans-SemiBold.ttf', 36)
        b = d.textbbox((0, 0), etiqueta.upper(), font=fe)
        d.text(((W - b[2]) // 2, y0 - 110), etiqueta.upper(), font=fe, fill=BOSQUE + (255,))
    y = y0
    for l in lineas:
        b = d.textbbox((0, 0), l, font=f)
        d.text(((W - b[2]) // 2, y), l, font=f, fill=color + (255,))
        y += b[3] + 22
    if sub:
        y += 30
        for l in sublineas:
            b = d.textbbox((0, 0), l, font=fs)
            d.text(((W - b[2]) // 2, y), l, font=fs, fill=BOSQUE + (230,))
            y += 52
    # Pie fijo: marca arriba y aviso legal abajo, sobre franjas oscuras suaves para que se lean en fondos claros.
    for y_a, y_b, sube in ((0, 300, False), (H - 320, H, True)):
        for k in range(y_a, y_b, 4):
            t = (k - y_a) / (y_b - y_a)
            alfa = int(190 * (t if sube else 1 - t))
            d.rectangle((0, k, W, k + 4), fill=NOCHE + (alfa,))
    fm = fuente('CormorantGaramond-SemiBold.ttf', 46)
    b = d.textbbox((0, 0), 'Quantum Holistic', font=fm)
    d.text(((W - b[2]) // 2, 120), 'Quantum Holistic', font=fm, fill=CREMA + (240,), stroke_width=2, stroke_fill=BOSQUE + (160,))
    fa = fuente('DMSans-Regular.ttf', 28)
    for i, l in enumerate(textwrap.wrap(AVISO, 52)):
        b = d.textbbox((0, 0), l, font=fa)
        d.text(((W - b[2]) // 2, H - 170 + i * 38), l, font=fa, fill=CREMA + (235,), stroke_width=2, stroke_fill=NOCHE + (170,))
    capa.save(ruta)


def montar(dir_, salida):
    """Zoom lento sobre la acuarela + 4 rótulos con fundido + fondo sonoro suave (216/324 Hz, muy bajo)."""
    n = DUR * FPS
    entradas = ['-loop', '1', '-i', str(dir_ / 'fondo.jpg')]
    for i in range(4):
        entradas += ['-loop', '1', '-i', str(dir_ / f'r{i}.png')]
    entradas += ['-f', 'lavfi', '-i', f'sine=f=216:d={DUR}', '-f', 'lavfi', '-i', f'sine=f=324:d={DUR}']
    filtros = [f"[0:v]scale={round(W*1.12)}:{round(H*1.12)},zoompan=z='1+0.10*on/{n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s={W}x{H}:fps={FPS},format=yuv420p[b0]"]
    for i, (a, z) in enumerate(TRAMOS):
        filtros.append(f"[{i+1}:v]format=rgba,trim=duration={DUR},fade=in:st={a}:d=0.4:alpha=1,fade=out:st={z-0.4}:d=0.4:alpha=1[t{i}]")
        filtros.append(f"[b{i}][t{i}]overlay=0:0:shortest=1[b{i+1}]")
    filtros.append(f"[5:a][6:a]amix=inputs=2,volume=0.06,tremolo=f=0.25:d=0.5,afade=in:d=2,afade=out:st={DUR-2}:d=2[a]")
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', *entradas, '-filter_complex', ';'.join(filtros), '-map', '[b4]', '-map', '[a]',
           '-t', str(DUR), '-r', str(FPS), '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p',
           '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', str(salida)]
    subprocess.run(cmd, check=True)


def main():
    fecha = os.environ.get('FECHA') or dt.datetime.utcnow().strftime('%Y-%m-%d')
    if not KEY and not os.environ.get('PIEZA_JSON'):
        sys.exit('Falta SUPABASE_KEY')
    if os.environ.get('PIEZA_JSON'):  # prueba local sin red: {"pieza": {...}, "post": {...}, "imagen": "ruta.jpg"}
        prueba = json.loads(Path(os.environ['PIEZA_JSON']).read_text())
        pieza, post, img = prueba['pieza'], prueba['post'], Path(prueba['imagen']).read_bytes()
    else:
        piezas = pedir('GET', f'/rest/v1/kimiko_content?fecha=eq.{fecha}&estado=neq.descartado&order=created_at.desc&limit=1'
                       '&select=id,project_id,titular,copy,hashtags,blog_post_id,reel_url')
        if not piezas:
            print(f'Sin pieza del {fecha}: nada que montar.')
            return
        pieza = piezas[0]
        if pieza.get('reel_url') and os.environ.get('FORZAR') != '1':
            print(f"El reel del {fecha} ya existe: {pieza['reel_url']}")
            return
        post = (pedir('GET', f"/rest/v1/blog_posts?id=eq.{pieza['blog_post_id']}&select=title,excerpt,content,image_url,slug") or [{}])[0]
        if not post.get('image_url'):
            sys.exit('El post del día no tiene imagen: no se monta el reel.')
        img = urllib.request.urlopen(post['image_url'], timeout=60).read()

    SALIDA.mkdir(parents=True, exist_ok=True)
    titulo = limpiar(post.get('title') or pieza.get('titular'))
    idea = frases(post.get('excerpt') or pieza.get('copy') or '', 150)
    fondo(img, SALIDA / 'fondo.jpg')
    rotulo(SALIDA / 'r0.png', titulo, tipo='titulo', etiqueta='Planta del día')
    rotulo(SALIDA / 'r1.png', idea, tipo='texto', etiqueta='En pocas palabras')
    rotulo(SALIDA / 'r2.png', precaucion(post.get('content')), tipo='texto', etiqueta='Precaución', sub='Consulta siempre con un profesional')
    rotulo(SALIDA / 'r3.png', 'Ficha completa en el blog', tipo='cta', sub=f"{DOMINIO}/blog · guárdalo para luego")
    mp4 = SALIDA / f'reel-{fecha}.mp4'
    montar(SALIDA, mp4)
    print(f'Reel listo: {mp4} ({mp4.stat().st_size // 1024} KB)')
    if os.environ.get('SIN_SUBIR') == '1' or os.environ.get('PIEZA_JSON'):
        return

    ruta = f"reels/{pieza.get('project_id') or 'qh'}/{fecha}.mp4"
    pedir('POST', f'/storage/v1/object/kimiko/{ruta}', mp4.read_bytes(), {'content-type': 'video/mp4', 'x-upsert': 'true'})
    url = f'{URL}/storage/v1/object/public/kimiko/{ruta}'
    pedir('PATCH', f"/rest/v1/kimiko_content?id=eq.{pieza['id']}", {'reel_url': url}, {'prefer': 'return=minimal'})
    r = pedir('POST', '/functions/v1/kimiko-diario', {'accion': 'enviar-reel', 'id': pieza['id']})
    print(f'Subido y enviado: {url} · Telegram: {r}')


if __name__ == '__main__':
    main()
