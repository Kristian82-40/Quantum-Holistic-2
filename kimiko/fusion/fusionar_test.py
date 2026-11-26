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


# ── Tests del bloqueo manual de claude/* ────────────────────────────────────

class TestClaudeBloqueoManual(unittest.TestCase):
    """Ninguna rama claude/* se fusiona sola (F-007)."""

    def test_claude_v2_devuelve_necesita_ok(self):
        with _Mocks():
            r = f.atender(_pr(109, 'claude/v2-f1-paso-0'))
        self.assertEqual(r, 'necesita OK')

    def test_claude_v2_step2_devuelve_necesita_ok(self):
        with _Mocks():
            r = f.atender(_pr(110, 'claude/v2-f1-step-2-propuesta'))
        self.assertEqual(r, 'necesita OK')

    def test_claude_arreglo_bug_devuelve_necesita_ok(self):
        """Antes se fusionaba solo; ahora debe requerir OK (F-007)."""
        with _Mocks():
            r = f.atender(_pr(100, 'claude/arreglo-bug'))
        self.assertEqual(r, 'necesita OK',
                         f'claude/arreglo-bug debe requerir OK manual; resultado: {r!r}')

    def test_claude_avisa_a_kristian(self):
        with _Mocks() as m:
            f.atender(_pr(109, 'claude/v2-f1-paso-0'))
        self.assertTrue(m.avisados, 'Se esperaba al menos un aviso')
        self.assertIn('OK', m.avisados[0][0])

    def test_no_fusionar_sigue_bloqueando(self):
        with _Mocks():
            r = f.atender(_pr(103, 'claude/v2-f1-paso-0', labels=['no-fusionar']))
        self.assertEqual(r, 'no-fusionar')

    def test_draft_siempre_fuera(self):
        with _Mocks():
            r = f.atender(_pr(102, 'claude/v2-f1-paso-0', draft=True))
        self.assertEqual(r, 'fuera')


# ── Escenario del PR #114 ────────────────────────────────────────────────────

class TestPR114Escenario(unittest.TestCase):
    """Reproduce el fallo F-007: claude/chat-seguridad se fusionó sin ✅ de Kristian."""

    def test_chat_seguridad_requiere_ok(self):
        """claude/chat-seguridad debe requerir OK ahora, no auto-fusionarse."""
        with _Mocks():
            r = f.atender(_pr(114, 'claude/chat-seguridad'))
        self.assertEqual(r, 'necesita OK',
                         f'claude/chat-seguridad debía requerir OK manual; resultado: {r!r}')

    def test_chat_seguridad_con_no_fusionar_queda_bloqueado(self):
        with _Mocks():
            r = f.atender(_pr(114, 'claude/chat-seguridad', labels=['no-fusionar']))
        self.assertEqual(r, 'no-fusionar')

    def test_cualquier_claude_requiere_ok(self):
        """Ninguna variante de claude/* se fusiona sola."""
        for rama in ('claude/chat-seguridad', 'claude/arreglo-bug', 'claude/nueva-feature',
                     'claude/protocolo-code', 'claude/v2-fusion-manual'):
            with self.subTest(rama=rama):
                with _Mocks():
                    r = f.atender(_pr(999, rama))
                self.assertEqual(r, 'necesita OK',
                                 f'{rama} debe requerir OK; resultado: {r!r}')


# ── Tests de kimiko/* (siguen auto-fusionándose si no son DELICADO) ──────────

class TestRamasKimiko(unittest.TestCase):
    """Las ramas kimiko/* pueden fusionarse solas si no tocan nada delicado."""

    def test_kimiko_normal_no_requiere_ok_manual(self):
        """Un PR de kimiko/ que no toca nada delicado no debe requerir OK."""
        with _Mocks():
            r = f.atender(_pr(101, 'kimiko/foto-planta'))
        self.assertNotEqual(r, 'necesita OK',
                            f'kimiko/ no debería requerir OK manual; resultado: {r!r}')

    def test_draft_siempre_fuera(self):
        with _Mocks():
            r = f.atender(_pr(102, 'kimiko/rama-draft', draft=True))
        self.assertEqual(r, 'fuera')


# ── Tests de nuevos patrones DELICADO ───────────────────────────────────────

class TestDelicadoNuevosPatrones(unittest.TestCase):
    """Los nuevos patrones en DELICADO bloquean app/api/, lib/chat, privacidad y términos."""

    def test_app_api_es_delicado(self):
        motivos = f._clasificar_delicados(['app/api/chat/route.ts'])
        self.assertTrue(any('API' in m for m in motivos),
                        f'app/api/chat/route.ts debe ser delicado; motivos: {motivos}')

    def test_app_api_leads_es_delicado(self):
        motivos = f._clasificar_delicados(['app/api/leads/route.ts'])
        self.assertTrue(any('API' in m for m in motivos),
                        f'app/api/leads/route.ts debe ser delicado; motivos: {motivos}')

    def test_app_privacidad_es_delicado(self):
        motivos = f._clasificar_delicados(['app/privacidad/page.tsx'])
        self.assertTrue(any('privacidad' in m.lower() for m in motivos),
                        f'app/privacidad debe ser delicado; motivos: {motivos}')

    def test_app_terminos_es_delicado(self):
        motivos = f._clasificar_delicados(['app/terminos/page.tsx'])
        self.assertTrue(any('terminos' in m.lower() or 'servicio' in m.lower() for m in motivos),
                        f'app/terminos debe ser delicado; motivos: {motivos}')

    def test_lib_chat_es_delicado(self):
        motivos = f._clasificar_delicados(['lib/chat.ts'])
        self.assertTrue(any('chat' in m.lower() for m in motivos),
                        f'lib/chat.ts debe ser delicado; motivos: {motivos}')

    def test_archivo_sin_riesgo_no_es_delicado(self):
        motivos = f._clasificar_delicados(['app/blog/page.tsx'])
        self.assertEqual(motivos, [],
                         f'app/blog/page.tsx no debe ser delicado; motivos: {motivos}')

    def test_supabase_migrations_sigue_siendo_delicado(self):
        motivos = f._clasificar_delicados(['supabase/migrations/001_init.sql'])
        self.assertTrue(any('base de datos' in m for m in motivos),
                        f'supabase/migrations debe ser delicado; motivos: {motivos}')


if __name__ == '__main__':
    unittest.main(verbosity=2)
