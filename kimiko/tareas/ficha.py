"""Formato de la cola kimiko_tareas para run.sh. Lee JSON (salida de `supabase db query -o json`) por la entrada estándar.
   python3 ficha.py lista | estado | tarea | ids | campo <nombre> | recibo <texto> | literal <texto>
"""
import datetime
import json
import sys

NEGRITA, AMARILLO, GRIS, FIN = '\033[1m', '\033[33m', '\033[2m', '\033[0m'
CANAL = {'movil': '📱 móvil', 'panel_web': '🖥  panel web', 'mac': '💻 Mac (hay que estar en el Mac)', 'llamada': '📞 llamada'}


def leer():
    texto = sys.stdin.read().strip()
    return json.loads(texto) if texto else []


def lista(filas):
    if not filas:
        print('  No tienes tareas abiertas. 🎉')
        return
    for n, f in enumerate(filas, 1):
        extra = [CANAL.get(f.get('canal') or '', '—')]
        if f.get('minutos'):
            extra.append(f"{f['minutos']} min")
        if f.get('fecha_limite'):
            extra.append(f"hasta {f['fecha_limite']}")
        if f.get('etiquetas'):
            extra.append('necesita OK: ' + ', '.join(f['etiquetas']))
        if f.get('estado') != 'pendiente':
            extra.append(f['estado'])
        print(f"  {n}. {NEGRITA}{f['id']}{FIN}  {f['titulo']}")
        print('     ' + ' · '.join(extra))


def estado(filas):
    for f in filas:
        print(f"  {f['responsable']:9} {f['estado']:17} {f['n']}")


def tarea(filas):
    f = filas[0]
    print()
    print(f"{NEGRITA}━━━ {f['id']} · {f['titulo']} ━━━{FIN}")
    if f.get('descripcion'):
        print(f"  {f['descripcion']}")
    datos = [CANAL.get(f.get('canal') or '', '')]
    if f.get('minutos'):
        datos.append(f"{f['minutos']} min")
    if f.get('fecha_limite'):
        datos.append(f"hasta {f['fecha_limite']}")
    datos.append(f"estado: {f['estado']}")
    print('  ' + ' · '.join(d for d in datos if d))
    if f.get('etiquetas'):
        print(f"  {AMARILLO}Necesita tu OK: {', '.join(f['etiquetas'])}{FIN}")
    if f.get('depende_de'):
        print(f"  Va después de: {', '.join(f['depende_de'])}")
    if f.get('url'):
        print(f"  Página: {f['url']}")
    if f.get('pasos'):
        print('  Pasos:')
        for n, p in enumerate(f['pasos'], 1):
            print(f'    {n}. {p}')
    if f.get('prueba'):
        print(f"  Cómo se comprueba: {f['prueba']}")
    ev = f.get('evidencia') or []
    if ev:
        print(f"{GRIS}  Último recibo: {ev[-1].get('fecha', '')} · {ev[-1].get('que', '')}{FIN}")


def main():
    orden = sys.argv[1]
    if orden == 'literal':  # texto → literal SQL con las comillas dobladas
        print("'" + sys.argv[2].replace("'", "''") + "'")
    elif orden == 'recibo':
        ahora = datetime.datetime.now().astimezone().isoformat(timespec='minutes')
        print(json.dumps([{'fecha': ahora, 'por': 'kristian', 'via': 'run.sh', 'que': sys.argv[2]}], ensure_ascii=False))
    elif orden == 'ids':
        print(' '.join(f['id'] for f in leer()))
    elif orden == 'campo':
        filas = leer()
        print((filas[0].get(sys.argv[2]) or '') if filas else '')
    else:
        {'lista': lista, 'estado': estado, 'tarea': tarea}[orden](leer())


if __name__ == '__main__':
    main()
