---
name: qh-seguridad
description: Lista de comprobación de seguridad de Quantum Holistic antes de cada PR y en revisiones periódicas. Úsala al tocar Supabase (tablas, RLS, funciones, Edge Functions), variables de entorno, dependencias, workflows de GitHub o cualquier cosa con llaves. El repo es público.
---

# qh-seguridad — antes de cada PR

## 1. Secretos (repo público)
- `git diff --cached` sin llaves, tokens, `sb_secret_`, `service_role`, `eyJ…` (JWT), `chat_id`, emails de `leads`.
  Rápido: `git diff --cached | grep -nE "sb_secret_|eyJhbGci|sk-[A-Za-z0-9]{20}|gsk_|AIza[0-9A-Za-z_-]{30}|ghp_|github_pat_"`.
- Los secretos viven en: Supabase → Edge Functions → Secrets / Vault, Cloudflare (worker), GitHub Secrets, `.env.local` (ignorado).
- Nunca imprimir secretos en logs, `console.log`, respuestas de Edge Functions ni cuerpos de PR. Para comprobar una llave,
  devolver solo `true/false` o los 4 últimos caracteres.
- Si un secreto llega a un commit: avisar a Kristian para **rotarlo** ya (borrar el commit no basta: el repo es público).
- `gitleaks` corre en cada PR (workflow `vigilancia`): si salta, no se fusiona.

## 2. Supabase
- `get_advisors` de **seguridad** y de **rendimiento** después de cualquier cambio de esquema; incluir el resultado en el PR.
  Lo nuevo con nivel ERROR o WARN se arregla en el mismo PR o se explica.
- **RLS activado en todas las tablas de `public`** (lo vigila también la auditoría semanal `kimiko_auditoria`):
  `select relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where nspname='public' and relkind='r' and not relrowsecurity;` → vacío.
- Tablas internas de Kimiko (`kimiko_*`): RLS sin políticas (solo `service_role`).
- Políticas públicas de lectura solo con filtro (`status = 'published'`, `publicada and ficha_verificada`).
- Funciones `security definer`: `set search_path = ''`, `revoke … from public, anon, authenticated` y `grant` a quien toque.
- Comprobar desde fuera que `anon` no ve lo interno: `POST /rest/v1/rpc/<funcion>` con la llave anon → 401/404.
- Edge Functions con `verify_jwt = false` deben autenticar ellas mismas (cabecera `x-kimiko-secreto` comparada en tiempo constante).

## 3. Web (Next.js en Vercel)
- La llave `service_role` / secreta solo en código de servidor (`app/api`, server components), nunca con `NEXT_PUBLIC_`.
- Entradas de usuario (formularios, `leads`, chat) validadas en servidor; sin `dangerouslySetInnerHTML` con datos sin escapar
  (el `content` del blog llega ya escapado desde `markdownAHtml`).
- `middleware.ts` en la raíz; `/admin` sin sesión → redirección.
- Cabeceras: las vigila `kimiko_security_checks` a diario (HSTS, CSP, nosniff, Referrer-Policy, Permissions-Policy).

## 4. Dependencias
- Dependabot abre PR semanales (npm y Actions). Revisar el changelog de las mayores antes de fusionar.
- `npm audit --omit=dev` sin vulnerabilidades altas o críticas nuevas.
- No añadir paquetes sin necesidad. Skills, plantillas o actions de terceros: **leer el código antes**; ninguna que mande
  tokens a servidores ajenos. Actions de terceros fijadas por versión (idealmente por SHA).

## 5. Telegram y Kimiko
- El worker solo obedece a `TELEGRAM_CHAT_ID` y valida `secret_token`. Cualquier cambio en `src/webhook.js` mantiene las dos cosas
  y su prueba en `pruebas.mjs`.
- Kimiko no puede pagar, borrar datos, crear credenciales ni tocar `main` (`kimiko/PROMPT.md`, NÚCLEO).

## Plantilla para el PR
```
Seguridad: secretos en diff ✅ · advisors (seg/rend) ✅ sin nuevos · RLS ✅ · npm audit ✅ · gitleaks ✅
```
