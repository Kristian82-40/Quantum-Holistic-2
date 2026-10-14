# PETICIONES — skills, plantillas y servidores de terceros revisados

Regla (`CLAUDE.md` §5): **leer el código antes de instalar**; ninguna que mande tokens a servidores ajenos.
Una skill solo sirve a Claude; un servidor MCP también. Kimiko no usa ninguna de estas: lo suyo es código propio.

Revisión del 8-oct-2026 por Claude Code. Repos clonados sin ejecutar nada; se leyeron las llamadas de red, el uso de
tokens y las dependencias.

| Candidata | Qué es | Código leído | A dónde van los tokens | Veredicto |
|---|---|---|---|---|
| [luminarylane/instagram-mcp-server](https://github.com/luminarylane/instagram-mcp-server) @ `a6da07d` (MIT) | Servidor MCP (Node) para la Instagram Graph API: publicar, comentarios, métricas | `src/client.ts` (3 `fetch`), `sanitize.ts`, `rate-limiter.ts`. Dependencias: solo `@modelcontextprotocol/sdk` y `zod` | Solo a `graph.facebook.com` / `graph.instagram.com` (Meta). El token va en la URL (lo normal en Meta, pero acaba en logs de proxy) | **Vale, más adelante.** Es la mejor de las dos (validación de entradas, límite de peticiones, pruebas). Útil para que Claude (chat) lea métricas. **Bloqueada** hasta tener `IG_USER_ID` e `IG_ACCESS_TOKEN` de una cuenta Business. Usarla solo en lectura: publicar sigue siendo cosa de Kristian. |
| [aleemhaider/instagram-mcp](https://github.com/aleemhaider/instagram-mcp) @ `dfbd5eb` (MIT) | Lo mismo en Python, 24 herramientas (incluye mensajes directos) | `graph.py` (httpx a Meta), `scripts/get_token.py` (OAuth). Dependencias: `mcp`, `httpx`, `python-dotenv` | Solo a `graph.facebook.com` | **No.** Hace lo mismo que la anterior con más permisos (mensajes directos), sin límite de peticiones ni filtro de entradas. |
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) @ `b9ba399` (MIT) | Unas 50 skills de marketing en Markdown (social, SEO, schema, imagen…) | Las skills `social`, `schema`, `seo-audit` e `image` son solo texto. La carpeta `tools/clis/*.js` sí llama a APIs de terceros (Mixpanel, Amplitude…) y `partners.json` promociona servicios de pago | Las skills no mandan nada. Los CLIs de `tools/` mandan tus llaves a esos servicios | **Solo `schema`, copiada a mano y fijada a ese commit**, para añadir `Article` JSON-LD al blog (pendiente en `qh-editorial`). **No instalar el paquete entero**: skills de 300–500 líneas (gastan contexto), CLIs a servicios ajenos y socios de pago. |
| [wshobson/agents → github-actions-templates](https://github.com/wshobson/agents/tree/main/plugins/cicd-automation/skills/github-actions-templates) @ `46891e7` (MIT) | Plantillas genéricas de GitHub Actions (CI, Docker, despliegues) | `SKILL.md` de 322 líneas. Propone Snyk, Codecov, Slack y AWS | Snyk y Codecov reciben código o informes con su token | **No.** El workflow `Vigilancia` ya cubre lo que necesitamos (gitleaks, Lighthouse, Dependabot, pruebas) sin servicios ajenos. |

## Pendientes de decisión de Kristian
1. ¿Copiamos la skill `schema` (179 líneas) a `.claude/skills/` y añadimos `Article` JSON-LD a `app/blog/[slug]`? Coste 0 €.
2. Instagram: cuando haya cuenta Business y llaves, instalar `luminarylane/instagram-mcp-server` **en el chat** en modo lectura (métricas), fijado a un commit.

## Proveedores de IA gratuitos (14-oct-2026)
Solo anotación: **la cadena del blog no se toca** hasta que Kristian decida si Gemini se queda (su plan gratuito usa los datos para entrenar y no vale para usuarios del EEE).

| Proveedor | Secreto en Supabase | Dónde se usa hoy | Estado |
|---|---|---|---|
| Groq (1.000 pet/día) | `GROQ_API_KEY` ✅ | 1.º del blog; 1.º de órdenes (`kimiko-orden`) y voz (Whisper) | funciona: post del 14-oct, `modelo_texto` Groq; órdenes `motor: groq` |
| Gemini (capa gratuita) | `GEMINI_API_KEY` ✅ | 2.º del blog (1 intento); **nunca** en órdenes privadas | configurado; pendiente de la decisión de Kristian |
| Workers AI de Cloudflare (10.000 neuronas/día) | `CF_ACCOUNT_ID` + `CF_AI_TOKEN` ✅ | 3.º del blog, 2.º de órdenes, imágenes flux | funciona: acuarela flux del 14-oct |
| NVIDIA NIM (NVIDIA Developer Program) | `NVIDIA_API_KEY` ❌ | previsto 3.º de órdenes (`CADENAS.privado`) | falta la llave |
| Mistral (La Plateforme, plan gratuito) | `MISTRAL_API_KEY` ❌ | previsto solo para lo público (`CADENAS.publico`) | falta la llave |
| OpenRouter (modelos `:free`) | `OPENROUTER_API_KEY` ❌ | previsto solo para lo público | falta la llave |

Prueba: `supabase secrets list` (14-oct, solo nombres) y `CADENAS` en `supabase/functions/_kimiko/lib/motores.js`. Las llaves que faltan las crea Kristian y se guardan en Supabase Secrets por terminal, sin pasar por el chat.
