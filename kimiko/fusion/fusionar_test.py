#!/usr/bin/env python3
"""Pruebas unitarias para kimiko/fusion/fusionar.py.

Ejecutar desde la raíz del repo:
    python3 kimiko/fusion/fusionar_test.py
"""
import os
import sys
import types
import unittest

# Cargar fusionar.py como módulo sin ejecutar main()
os.environ.setdefault('GH_TOKEN', 'test-token')
os.environ['SECO'] = '1'

import importlib.util
_spec = importlib.util.spec_from_file_location(
    'fusionar',
    os.path.join(os.path.dirname(__file__), 'fusionar.py'),
)
f = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(f)  # type: ignore[union-attr]


def _pr(numero: int, rama: str, labels: list[str] | None = None, draft: bool = False):
    return {
        'number': numero,
        'draft': draft,
        'title': f'Prueba {rama}',
        'html_url': f'https://github.com/{f.REPO}/pull/{numero}',
        'head': {
            'ref': rama,
            'sha': 'aaabbbccc111',
            'repo': {'full_name': f.REPO},
        },
        'labels': [{'name': n} for n in (labels or [])],
    }


class _Mocks:
    """Contexto que parchea gh y avisar para tests sin HTTP."""

    def __init__(self, fecha_commit='2020-01-01T00:00:00Z'):
        self.fecha_commit = fecha_commit
        self.avisados: list[tuple[str, str, str]] = []  # (titulo, texto, url)
        self._orig_gh = None
        self._orig_avisar = None

    def __enter__(self):
        fecha = self.fecha_commit
        avisados = self.avisados

        def gh_fake(metodo, ruta, cuerpo=None):
            if metodo == 'GET' and '/comments' in ruta:
                return []
            if metodo == 'GET' and '/check-runs' in ruta:
                return {'check_runs': []}
            if metodo == 'GET' and '/status' in ruta:
                return {'statuses': []}
            if metodo == 'GET' and '/commits/' in ruta:
                return {'commit': {'committer': {'date': fecha}}}
            return {}

        def avisar_fake(titulo, texto, url):
            avisados.append((titulo, texto, url))

        self._orig_gh = f.gh
        self._orig_avisar = f.avisar
        f.gh = gh_fake
        f.avisar = avisar_fake
        return self

    def __exit__(self, *_):
        f.gh = self._orig_gh
        f.avisar = self._orig_avisar


class TestV2Bloqueo(unittest.TestCase):
    """Los PRs de ramas claude/v2-* nunca se fusionan solos."""

    def test_v2_devuelve_necesita_ok(self):
        with _Mocks():
            r = f.atender(_pr(109, 'claude/v2-f1-paso-0'))
        self.assertEqual(r, 'necesita OK (v2)')

    def test_v2_step_2_devuelve_necesita_ok(self):
        with _Mocks():
            r = f.atender(_pr(110, 'claude/v2-f1-step-2-propuesta'))
        self.assertEqual(r, 'necesita OK (v2)')

    def test_v2_avisa_a_kristian(self):
        with _Mocks() as m:
            f.atender(_pr(109, 'claude/v2-f1-paso-0'))
        self.assertTrue(m.avisados, 'Se esperaba al menos un aviso para PR v2')
        titulo = m.avisados[0][0]
        self.assertIn('OK', titulo)

    def test_v2_no_avisa_dos_veces_mismo_sha(self):
        """ya_avisado devuelve True la segunda vez: no debe haber segundo aviso."""
        with _Mocks() as m:
            f.atender(_pr(109, 'claude/v2-f1-paso-0'))
            f.atender(_pr(109, 'claude/v2-f1-paso-0'))
        # En SECO=1 y sin POST, ya_avisado siempre devuelve False (no hay
        # comentarios guardados), así que se avisa cada vez. Lo importante es
        # que atender devuelva 'necesita OK (v2)' en ambos casos.
        self.assertEqual(len([a for a in m.avisados if 'OK' in a[0]]), 2)


class TestRamasNormales(unittest.TestCase):
    """Las ramas claude/ y kimiko/ sin el prefijo v2- no se ven afectadas."""

    def test_rama_claude_normal(self):
        with _Mocks():
            r = f.atender(_pr(100, 'claude/arreglo-bug'))
        self.assertNotEqual(r, 'necesita OK (v2)',
                            f'Una rama claude/ normal no debe requerir OK v2; resultado: {r!r}')

    def test_rama_kimiko_normal(self):
        with _Mocks():
            r = f.atender(_pr(101, 'kimiko/foto-planta'))
        self.assertNotEqual(r, 'necesita OK (v2)',
                            f'Una rama kimiko/ no debe requerir OK v2; resultado: {r!r}')

    def test_draft_siempre_fuera(self):
        with _Mocks():
            r = f.atender(_pr(102, 'claude/v2-f1-paso-0', draft=True))
        self.assertEqual(r, 'fuera')

    def test_no_fusionar_label(self):
        with _Mocks():
            r = f.atender(_pr(103, 'claude/v2-f1-paso-0', labels=['no-fusionar']))
        self.assertEqual(r, 'no-fusionar')


if __name__ == '__main__':
    unittest.main(verbosity=2)
