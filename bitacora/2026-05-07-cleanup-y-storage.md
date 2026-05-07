# Bitácora — 2026-05-07 · Cleanup + verificación de storage

## Regla de oro confirmada
**Todos los archivos, carpetas y datos generados por el proyecto Quantum Holistic viven SIEMPRE en `/Volumes/Papu Ext/Dev/QuantumHolistic/project/quantum-holistic/`.**

Mac local → solo herramientas (Cursor, terminal, navegador). Cero artefactos del proyecto fuera de Papu Ext.

## Verificación de hoy

### Trabajo creado en sesión 2026-05-07
| Archivo | Ruta absoluta | Storage |
|---|---|---|
| `page.tsx` | `/Volumes/Papu Ext/Dev/QuantumHolistic/project/quantum-holistic/app/diccionario/page.tsx` | ✅ Papu Ext |
| `Catalogo.tsx` | `/Volumes/Papu Ext/Dev/QuantumHolistic/project/quantum-holistic/app/diccionario/Catalogo.tsx` | ✅ Papu Ext |
| `diccionario.module.css` | `/Volumes/Papu Ext/Dev/QuantumHolistic/project/quantum-holistic/app/diccionario/diccionario.module.css` | ✅ Papu Ext |
| `fichas-metadata.json` (reparado) | `/Volumes/Papu Ext/Dev/QuantumHolistic/project/quantum-holistic/app/fichas-metadata.json` | ✅ Papu Ext |
| `handoff.md` (actualizado) | `/Volumes/Papu Ext/Dev/QuantumHolistic/project/quantum-holistic/handoff.md` | ✅ Papu Ext |
| Imágenes plantas (51 jpg, plant-00..plant-50) | `/Volumes/Papu Ext/Dev/QuantumHolistic/project/quantum-holistic/public/images/plants/` | ✅ Papu Ext |

Todo escrito directamente sobre Papu Ext — Claude no usó scratchpad temporal del Mac para nada del proyecto.

## Carpetas temporales del agente — verificadas vacías
- Workspace temporal (outputs): **vacío** ✅
- Uploads (read-only): **vacío** ✅
- No hay artefactos del proyecto fuera del disco externo en los paths accesibles al agente.

## Lo que NO se borró (ni hace falta)
- `node_modules/` y `.next/` viven dentro del proyecto en Papu Ext → correcto, ahí deben estar.
- Sesión Vercel + Supabase: vive en la nube, no en disco local.

## Lo que el agente NO puede inspeccionar (acción manual de Papu)
Claude solo tiene acceso a `/Volumes/Papu Ext/Dev/QuantumHolistic/project/quantum-holistic/` y a las carpetas temporales propias. No puede listar el filesystem completo del Mac. Si en algún momento existieron copias del proyecto o assets en estas zonas, conviene revisarlas a mano:

- `~/Downloads/` — assets sueltos, zips, imágenes generadas, exports.
- `~/Desktop/` — capturas, pruebas rápidas.
- `~/Documents/` — backups antiguos del repo o documentos sueltos del proyecto.
- `~/Library/Caches/` — caches de Next, Vercel CLI, Supabase CLI (limpiables sin riesgo).
- `~/Library/Application Support/` — datos de apps (Cursor, Claude, etc.).
- Cualquier otro disco/pendrive con copias antiguas del repo.

**Comando útil para Papu (Terminal del Mac):**
```bash
# Buscar carpetas con nombre del proyecto fuera de Papu Ext
find ~ -type d -iname "*quantum-holistic*" 2>/dev/null | grep -v "/Volumes/Papu Ext/"

# Buscar archivos del atlas fuera de Papu Ext
find ~ -iname "fichas-metadata*" -o -iname "plant-*-cientifica*" 2>/dev/null | grep -v "/Volumes/Papu Ext/"
```

Si esos comandos devuelven algo, son copias para borrar.

## Resumen de archivos borrados hoy
**Ninguno** — el agente no encontró duplicados ni artefactos del proyecto en sus paths accesibles. Toda la creación de la sesión fue directamente a Papu Ext.

## Próxima vez que se generen assets
Política reforzada para Claude (Cowork) y Claude Code:
1. Toda escritura nueva → ruta absoluta empezando por `/Volumes/Papu Ext/Dev/QuantumHolistic/project/quantum-holistic/`.
2. Prohibido usar el outputs/scratchpad temporal del Mac para guardar algo del proyecto.
3. Si una herramienta solo permite escribir a workspace temporal (ej. generación de imágenes), copiar inmediatamente a Papu Ext y borrar el original temporal.
4. Bitácora del día queda dentro de `bitacora/` en Papu Ext (esta carpeta acaba de nacer hoy).
