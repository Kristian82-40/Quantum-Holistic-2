#!/usr/bin/env python3
import subprocess
import sys
import argparse
from datetime import datetime
from pathlib import Path

print("🔄 QH-ROLLBACK-GEN: Generando plan de rollback...\n")

# Argumentos
parser = argparse.ArgumentParser()
parser.add_argument("scope", nargs="?", default="full", help="Scope: full, db-only, backend-only, frontend-only, service:<nombre>")
parser.add_argument("--deep", action="store_true", help="Análisis profundo (dependencias y side-effects)")
args = parser.parse_args()

PROJECT_ROOT = Path.cwd()
scope = args.scope
deep = args.deep

print(f"Scope seleccionado: {scope} {'--deep' if deep else ''}")
print(f"Generado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

# 1. Análisis rápido de cambios
try:
    git_status = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True).stdout.strip()
    last_commit = subprocess.run(["git", "log", "-1", "--pretty=%h %s"], capture_output=True, text=True).stdout.strip()
except:
    git_status = "No git detectado"
    last_commit = "N/A"

# 2. Generación del plan según scope
plan = []
if scope == "full" or scope == "db-only":
    plan.append("**Paso 1:** Revertir migraciones de base de datos")
    plan.append("```bash\nsupabase db reset --linked\n```")
    plan.append("**Paso 2:** Restaurar backup de Supabase (si existe)")

if scope == "full" or scope == "backend-only":
    plan.append("**Paso 3:** Reiniciar servicios backend")
    plan.append("```bash\npm run dev\n```")

if scope == "full" or scope == "frontend-only":
    plan.append("**Paso 4:** Revertir build de frontend")
    plan.append("```bash\ngit checkout HEAD~1 -- apps/web/.next\n```")

plan.append("**Paso Final:** Verificar health checks")
plan.append("```bash\npython3 .skills/qh-deploy-gate/scripts/deploy_gate.py\n```")

# Output final (formato exacto)
print("# QH-ROLLBACK-GEN REPORT")
print(f"**Scope:** {scope}")
print(f"**Commit actual:** {last_commit}")
print(f"**Tiempo estimado de rollback:** 4-12 minutos\n")

print("## Plan de Rollback (ejecutar en orden estricto)\n")
for i, step in enumerate(plan, 1):
    print(f"**{i}.** {step}\n")

print("## Post-Rollback Verification")
print("- [ ] Correr QH-DEPLOY-GATE nuevamente")
print("- [ ] Verificar métricas en Supabase / Vercel")
print("- [ ] Confirmar que la app vuelve al estado anterior")

print(f"\n✅ Plan generado correctamente ({datetime.now().strftime('%H:%M')})")
print("Guarda este output antes de ejecutar cualquier deploy.")
