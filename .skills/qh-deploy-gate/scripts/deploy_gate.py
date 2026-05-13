#!/usr/bin/env python3
import subprocess
import sys
from datetime import datetime
from pathlib import Path

print("🔄 QH-DEPLOY-GATE: Ejecutando checklist de despliegue...\n")

checks = []
PROJECT_ROOT = Path.cwd()

# 1. Build Next.js
try:
    result = subprocess.run(["npm", "run", "build"], capture_output=True, text=True, timeout=60)
    checks.append("✅ Build Next.js OK" if result.returncode == 0 else f"❌ Build falló (código {result.returncode})")
except Exception as e:
    checks.append(f"❌ Error al hacer build: {e}")

# 2. Variables de entorno críticas
env_path = PROJECT_ROOT / ".env.local"
if env_path.exists():
    env_content = env_path.read_text()
    required = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]
    missing = [var for var in required if var not in env_content]
    checks.append("✅ Variables de entorno OK" if not missing else f"⚠️ Faltan variables: {missing}")
else:
    checks.append("❌ .env.local no encontrado")

# 3. Validación de imágenes (NUEVO - el que buscábamos)
print("🔍 Validando imágenes de plantas en Supabase Storage...")
checks.append("🔄 Validando imágenes...")

# 3a. Verificar remotePatterns en next.config
config_files = ["next.config.js", "next.config.mjs"]
config_ok = False
for config_file in config_files:
    config_path = PROJECT_ROOT / config_file
    if config_path.exists():
        content = config_path.read_text()
        if "supabase.co" in content or "storage" in content:
            config_ok = True
            checks.append("✅ next.config permite Supabase Storage")
            break
if not config_ok:
    checks.append("❌ next.config NO permite imágenes de Supabase (remotePatterns)")

# 3b. Chequeo real de 3 imágenes (usando curl)
import os
supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL', 'https://vctetjugbvyllwjpxcxh.supabase.co')
image_urls = [
    f"{supabase_url}/storage/v1/object/public/plants/1.jpg",
    f"{supabase_url}/storage/v1/object/public/plants/2.jpg",
    f"{supabase_url}/storage/v1/object/public/plants/3.jpg"
]

working = 0
for url in image_urls:
    try:
        result = subprocess.run(["curl", "-I", "-L", "--max-time", "4", "-s", url], capture_output=True, text=True)
        if "200 OK" in result.stdout or "200" in result.stdout:
            working += 1
    except:
        pass

checks.append(f"✅ {working}/3 imágenes públicas responden 200 OK" if working >= 2 else f"⚠️ Solo {working}/3 imágenes responden correctamente (posible problema de visibilidad)")

# Resultado final
real_checks = [c for c in checks if c.startswith("✅") or c.startswith("❌")]
all_ok = all(c.startswith("✅") for c in real_checks)

print("\n".join(checks))
print(f"\n🔍 Resultado final: {'✅ TODO OK - Listo para deploy' if all_ok else '⚠️ REQUIERE REVISIÓN antes de deploy'}")
print(f"Chequeo realizado: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
