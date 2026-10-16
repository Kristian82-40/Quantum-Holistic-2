#!/usr/bin/env bash
# F0-03: prueba de permisos sobre Supabase local, sin tocar producción ni usar sus llaves.
# Carga supabase/schema/base.sql, aplica las migraciones posteriores al volcado y exige 0 filas en
# public.kimiko_prueba_permisos(). La usan la CI (vigilancia.yml, job «permisos») y el Mac. Necesita Docker y el CLI de Supabase.
set -euo pipefail
RAIZ=$(cd "$(dirname "$0")/../.." && pwd)
BASE="$RAIZ/supabase/schema/base.sql"
HASTA=$(sed -n 's/^-- incluye migraciones hasta \([0-9]*\).*/\1/p' "$BASE")
[[ -n "$HASTA" ]] || { echo "base.sql no dice hasta qué migración incluye"; exit 2; }
TMP=$(mktemp -d)
ID="qh-permisos-$$"
parar() { (cd "$TMP" && supabase stop --no-backup --project-id "$ID" >/dev/null 2>&1) || true; rm -rf "$TMP"; }
trap parar EXIT
cd "$TMP"
supabase init --force </dev/null >/dev/null
sed -i.bak "s/^project_id = .*/project_id = \"$ID\"/" supabase/config.toml
supabase start -x gotrue,realtime,storage-api,imgproxy,kong,mailpit,postgrest,postgres-meta,studio,edge-runtime,logflare,vector,supavisor >/dev/null
sql() { docker exec -i "supabase_db_$ID" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q "$@"; }
# El volcado trae los GRANT de producción pero no los REVOKE: se parte de cero para que queden exactos.
for t in tables sequences functions; do sql -c "alter default privileges for role postgres in schema public revoke all on $t from anon, authenticated, service_role;"; done
sql < "$BASE"
for m in "$RAIZ"/supabase/migrations/*.sql; do
  v=$(basename "$m" | cut -d_ -f1)
  if [[ "$v" > "$HASTA" ]]; then echo "Aplico $(basename "$m")"; sql < "$m"; fi
done
sql -c 'select * from public.kimiko_prueba_permisos();'
n=$(sql -tA -c 'select count(*) from public.kimiko_prueba_permisos();')
if [[ "$n" != 0 ]]; then echo "❌ $n permiso(s) distintos de lo esperado"; exit 1; fi
echo "✅ Permisos como deben (0 filas)"
