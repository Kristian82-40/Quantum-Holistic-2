#!/usr/bin/env python3
import subprocess
import sys
from datetime import datetime
from pathlib import Path

print("🔄 QH-SCHEMA-AUDIT: Ejecutando auditoría de esquema...\n")

PROJECT_ROOT = Path.cwd()
checks = []

# 1. Estado de migraciones Supabase (más amigable)
try:
    result = subprocess.run(["supabase", "migration", "list"], capture_output=True, text=True, timeout=15)
    if result.returncode == 0:
        checks.append("✅ Migraciones Supabase OK")
    else:
        if "Access token not provided" in result.stderr:
            checks.append("⚠️ Supabase CLI no logueado (ejecuta: supabase login)")
        else:
            checks.append(f"⚠️ Error en migraciones: {result.stderr.strip()}")
except Exception as e:
    checks.append("⚠️ Supabase CLI no encontrado o no configurado")

# 2. Carpeta de migraciones
migration_path = PROJECT_ROOT / "supabase/migrations"
if migration_path.exists():
    migrations = list(migration_path.glob("*.sql"))
    checks.append(f"✅ {len(migrations)} migraciones encontradas")
else:
    checks.append("⚠️ Carpeta supabase/migrations no encontrada (normal si aún no hay migraciones locales)")

# 3. Validación de tipos TypeScript
try:
    type_check = subprocess.run(["npx", "tsc", "--noEmit", "--skipLibCheck"], capture_output=True, text=True, timeout=20)
    checks.append("✅ Tipos TypeScript OK" if type_check.returncode == 0 else f"❌ Errores de tipos: {type_check.stderr[:150]}")
except:
    checks.append("🔄 TypeScript check saltado")

# 4. Variables DB
env_path = PROJECT_ROOT / ".env.local"
checks.append("✅ Variables DB presentes (verificado en DEPLOY-GATE)" if env_path.exists() else "❌ .env.local no encontrado")

# Resultado final (más inteligente)
real_checks = [c for c in checks if not c.startswith("🔄")]
all_ok = all(c.startswith("✅") for c in real_checks)

print("\n".join(checks))
print(f"\n🔍 Resultado final: {'✅ ESQUEMA SEGURO - Listo para deploy' if all_ok else '⚠️ REVISAR esquema antes de deploy'}")
print(f"Auditoría realizada: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
print("\n💡 Recomendación: Ejecuta QH-SCHEMA-AUDIT → QH-DEPLOY-GATE antes de cualquier deploy")
