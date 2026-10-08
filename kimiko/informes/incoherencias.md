# Incoherencias de marca — 8-oct-2026

Solo informe: **no se ha corregido nada**. Kristian tiene que decir la ciudad, el correo y las redes buenas.

**Prueba:** `grep` sobre el repo (sin `node_modules`, `.next`, `logs`), `dig` de DNS y `curl` a cada dominio y red, 8-oct ~10:35 Madrid.

## 0. Lo más grave: el dominio
| Dominio | Qué hay hoy | Prueba |
|---|---|---|
| `quantum-holistic.com` | **La web real** (Vercel, título "Quantum Holistic — Nutrición KM0…") | `curl -I` → `server: Vercel` |
| `q-h.com` | **No es nuestro: página de venta de Aftermarket** ("The domain Q-H.com is for sale!") | `curl` → cabecera `x-domain-io: domainio-parking`, IP 3.33.224.147 |
| `quantumholistic.com` (sin guion) | Resuelve a 2 IP de AWS, **HTTPS no responde** y **no tiene MX** (no recibe correo) | `dig A/MX`, `curl` → 000 |

Consecuencias: (a) los documentos internos (`CLAUDE.md`, `ESTADO.md`, skills, `_kimiko/lib/imagen.js:8`) llaman "q-h.com" a la web; si alguien enlaza o comparte ese nombre, llega a una página de venta. (b) **Todo el correo de la web es `hola@quantumholistic.com`, un dominio sin MX: los correos de clientes no llegan** y `lib/email.ts` no podrá enviar desde ese remitente. Ni `quantum-holistic.com` ni `q-h.com` tienen MX tampoco.

## 1. "quantumholistic.com" sin guion
| Archivo:línea | Qué dice | Se ve en la web |
|---|---|---|
| `config.ts:7` | `email: 'hola@quantumholistic.com'` → usado en `components/layout/Footer.tsx:19` (Contacto), `:64` (Newsletter) y `app/terapeutas/papu/page.tsx:65` | sí |
| `lib/email.ts:3` | remitente `Quantum Holistic <hola@quantumholistic.com>` | correos |
| `app/cookies/page.tsx:99` | mailto y texto `hola@quantumholistic.com` | sí |
| `app/cancel/page.tsx:25-26` | mailto y texto | sí |
| `app/terminos/page.tsx:37` | "Al acceder a quantumholistic.com…" (texto legal con el dominio equivocado) | sí |
| `app/terminos/page.tsx:65` y `:106` | mailto | sí |
| `app/privacidad/page.tsx:38` y `:89` | mailto | sí |
| `scripts/qh-imagenes-v2.mjs:66` | User-Agent con el correo | no |
| `app/config.ts:5,7` · `app/lib/config.ts:5,7` | copias antiguas de la config con `url` y `email` sin guion | no (no las importa nadie: los componentes usan `@/lib/config` → `lib/config.ts` → `config.ts`) |
| `app/next.config.js:9` y `:15` | redirecciones a `https://quantumholistic.com/:path*` | no (Next usa el `next.config.js` de la raíz) |
| `README.md:20,53,54` · `app/README.md:1,15,99,100,106,128` · `app/CLAUDE.md:24` · `QH_ASSETS_MASTER.txt:231` | documentación con el dominio sin guion | no |

## 2. "Bristol"
| Archivo:línea | Qué dice | Se ve en la web |
|---|---|---|
| `components/layout/Footer.tsx:61` | "© … Quantum Holistic · Bristol, UK" (en **todas** las páginas) | sí |
| `app/privacidad/page.tsx:37` | responsable "con sede en Bristol, Reino Unido" (dato legal RGPD) | sí |
| `app/terminos/page.tsx:100` | ley del Reino Unido y **tribunales de Bristol** (dato legal) | sí |
| `components/sections/Testimonials.tsx:18` | testimonio con `location: 'Bristol'` (portada) | sí |
| `components/sections/BlogPreview.tsx:20,23` | tarjeta de portada "Alimentación km0 en Bristol…" → `km0-bristol-guia` | sí |
| `lib/posts.ts:105-148` | post estático `km0-bristol-guia` entero sobre mercados de Bristol | sí |
| `README.md:3,101` · `app/README.md:190` | "Bristol, UK · 2026" | no |

Nota: privacidad y términos son textos legales; la ciudad, el país de la ley aplicable y el responsable deben coincidir con la realidad (si la actividad es en España, RGPD + LSSI con domicilio en España).

## 3. Redes
| Archivo:línea | Enlace | Resultado |
|---|---|---|
| `config.ts:10` (Footer `:65`) | `https://youtube.com/@quantumholistic` | **404: el canal no existe** |
| `config.ts:9` (Footer `:63`) | `https://instagram.com/quantumholistic` | Existe un perfil `quantumholistic` (200). **Sin verificar que sea de Kristian** |
| `app/config.ts:9-10` · `app/lib/config.ts:9-10` | mismas dos (copias sin uso) | — |

No hay enlaces a Facebook, TikTok, X, LinkedIn, Pinterest, Telegram ni WhatsApp en `app/`, `components/`, `lib/`.

## 4. Otras incoherencias vistas de paso
- Las 4 fichas publicadas del diccionario (albahaca, árnica, equinácea, hinojo) muestran **posología con dosis** (p. ej. hinojo "2-3 g … 2-3 veces/día"), lo que choca con la regla "sin dosis" de `qh-editorial`. Manzanilla y las 5 nuevas ya van sin dosis.
- En `plants` hay dos filas de la misma especie: `equinacea` (publicada) y `echinacea` (sin publicar), ambas *Echinacea purpurea*; y `ashwagandha` / `ashwagandha-fruto`.

- Portada: cifras "2.400+ planes km0 generados", "98 % satisfacción", "340+ plantas en la base de datos" y 3 testimonios (uno de "Bristol") que no cuadran con los datos (52 plantas, 0 leads, 1 perfil). Ver `diseno.md`, punto 1.

## Lo que necesito de Kristian
1. ¿Dominio bueno: `quantum-holistic.com`? (q-h.com no es nuestro).
2. Correo de contacto real (y si hay que dar de alta MX en `quantum-holistic.com`).
3. Ciudad / país para pie de página y textos legales.
4. ¿Quitamos las cifras y testimonios de la portada?
5. ¿Es tuya la cuenta de Instagram `quantumholistic`? ¿Quitamos YouTube?
