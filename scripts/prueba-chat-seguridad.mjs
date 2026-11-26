/**
 * prueba-chat-seguridad.mjs
 * Pruebas de la lógica de seguridad del chat holístico.
 * Sin escritura en base de datos. No requiere credenciales.
 *
 * Uso: node scripts/prueba-chat-seguridad.mjs
 */

// ── Replicar normalize (igual que en route.ts) ───────────────────────────────

function normalize(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// ── Replicar RIESGO_REGEXPS (debe mantenerse sincronizado con route.ts) ─────

const RIESGO_REGEXPS = [
  /embaraz/,
  /gestant|gestaci/,
  /lactanc|amamant/,
  /\bbebe\b|\brecien.?nacido/,
  /\bnin[oa]\b|\binfant|\bpediatri|\bhij[oa]\b/,
  /anticoagulant|warfarin|acenocumarol|heparin/,
  /sedant|ansioliti|diazepam|lorazepam|alprazolam/,
  /antidepresiv|fluoxetin|sertralina|paroxetin|venlafaxin/,
  /antiepilepti|carbamacepin|valproat/,
  /quimioterapia|\bquimio\b/,
  /operaci.n|cirug.a|operar|\boperado\b/,
  /insuficiencia.{0,15}hepat|hepatiti|cirrosi/,
  /insuficiencia.{0,15}renal|dialisi/,
  /hipertiroid|hipotiroid/,
  /\bepileps/,
  /tomo.{1,25}(pastilla|medicamento|farmaco|tratamiento)/,
  /\bsintrom\b/,
  /dand[oa].{0,8}pecho|\bdoy.{0,8}pecho/,
  /\bdiabet/,
  /\binsulina\b/,
  /\bmetformin/,
  /eliquis|xarelto|apixaban|rivaroxaban/,
  /\bcriando\b/,
  /\bhipertens/,
  /\btiroides\b/,
  /\bceliac/,
];

function tieneContextoRiesgo(mensaje) {
  const norm = normalize(mensaje);
  return RIESGO_REGEXPS.some(r => r.test(norm));
}

// ── Datos de plantas mock (sin DB) ───────────────────────────────────────────

const PLANTAS_MOCK = [
  {
    slug: 'salvia',
    nombre_es: 'Salvia',
    nombre_latino: 'Salvia officinalis',
    categoria: 'Digestiva',
    ficha_cientifica: {
      indicaciones: ['digestión', 'menopausia', 'sudoración'],
      contraindicaciones: [
        'Contraindicada en embarazo y lactancia (estimula contracciones uterinas)',
        'Evitar en epilepsia (thujona convulsivante en dosis altas)',
        'No usar con medicamentos estrogénicos',
        'Precaución en personas con diabetes (puede bajar la glucemia)',
      ],
    },
  },
  {
    slug: 'ginkgo',
    nombre_es: 'Ginkgo',
    nombre_latino: 'Ginkgo biloba',
    categoria: 'Circulatorio',
    ficha_cientifica: {
      indicaciones: ['memoria', 'circulación cerebral', 'acúfenos'],
      contraindicaciones: [
        'Riesgo de hemorragia con anticoagulantes (warfarina, acenocumarol, heparina)',
        'Contraindicado antes de cirugías (aumenta tiempo de sangrado)',
        'No usar con antidepresivos IMAO',
        'Evitar en embarazo',
      ],
    },
  },
  {
    slug: 'valeriana',
    nombre_es: 'Valeriana',
    nombre_latino: 'Valeriana officinalis',
    categoria: 'Nervioso',
    ficha_cientifica: {
      indicaciones: ['insomnio', 'ansiedad', 'estrés'],
      contraindicaciones: [
        'Efecto aditivo con sedantes, ansiolíticos y alcohol (potencia la sedación)',
        'No conducir ni operar maquinaria pesada durante el uso',
        'Contraindicada en embarazo y lactancia',
        'No combinar con benzodiacepinas sin supervisión médica',
      ],
    },
  },
  {
    slug: 'romero',
    nombre_es: 'Romero',
    nombre_latino: 'Rosmarinus officinalis',
    categoria: 'Digestiva',
    ficha_cientifica: {
      indicaciones: ['digestión', 'circulación', 'concentración'],
      contraindicaciones: [
        'Evitar en dosis elevadas durante el embarazo',
        'Precaución en personas con epilepsia',
      ],
    },
  },
];

// ── Simulación de respuestaSeguridad con datos mock ──────────────────────────

function scoreOverlap(words, haystack) {
  const norm = normalize(haystack);
  return words.reduce((acc, w) => acc + (norm.includes(w) ? 1 : 0), 0);
}

const STOPWORDS = new Set([
  'para','como','sobre','algo','tengo','tiene','tener','donde','cual','cuales',
  'quiero','necesito','hola','buenas','tardes','noches','dias','gracias',
  'porfavor','favor','ayuda','puedes','podrias','dime','estoy','este','esta',
  'esto','unos','unas','pero','muy','que','con','los','las','del','una','uno',
]);

function significantWords(text) {
  return normalize(text).replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
    .filter(w => w.length >= 4 && !STOPWORDS.has(w));
}

function respuestaSeguridadMock(mensaje) {
  const PRIMERA = 'No tomes ninguna planta sin consultar antes con tu médico o farmacéutico.';
  const CIERRE  = 'Para cualquier duda sobre tu situación, habla con tu médico, farmacéutico o visita /terapeutas/papu.';
  const words   = significantWords(mensaje);

  let bestPlant = null, bestScore = 0;
  for (const p of PLANTAS_MOCK) {
    const hay = [p.nombre_es, p.nombre_latino || ''].join(' ');
    const s   = scoreOverlap(words, hay);
    if (s > bestScore) { bestScore = s; bestPlant = p; }
  }

  if (bestPlant && bestScore >= 1 && bestPlant.ficha_cientifica?.contraindicaciones?.length) {
    const contras = bestPlant.ficha_cientifica.contraindicaciones.join('; ');
    return `${PRIMERA} La ficha verificada de ${bestPlant.nombre_es} recoge estas contraindicaciones: ${contras}. ${CIERRE}`;
  }
  return `${PRIMERA} ${CIERRE}`;
}

function respuestaFallbackMock(mensaje) {
  const words = significantWords(mensaje);
  if (!words.length) return 'Cuéntame un poco más.';

  let bestPlant = null, bestPlantScore = 0;
  for (const p of PLANTAS_MOCK) {
    const hay = [p.nombre_es, p.nombre_latino||'', p.categoria,
      ...(p.ficha_cientifica?.indicaciones||[])].join(' ');
    const s = scoreOverlap(words, hay);
    if (s > bestPlantScore) { bestPlantScore = s; bestPlant = p; }
  }

  if (bestPlant && bestPlantScore >= 1) {
    const ind   = bestPlant.ficha_cientifica?.indicaciones?.slice(0,3).join(', ');
    const contr = bestPlant.ficha_cientifica?.contraindicaciones?.join('; '); // todas
    let reply   = `${bestPlant.nombre_es} puede interesarte.`;
    if (ind)   reply += ` Se usa para: ${ind}.`;
    if (contr) reply += ` Precaución: ${contr}.`;
    reply += ` Ficha en /diccionario/${bestPlant.slug}. Para condiciones de salud, consulta con un profesional médico.`;
    return reply;
  }
  return 'No tengo una respuesta puntual. Explora /diccionario o /blog.';
}

// ── Casos de prueba ──────────────────────────────────────────────────────────

const CASOS = [
  {
    id: 'P1',
    desc: 'Salvia + embarazo',
    msg: 'Estoy embarazada, ¿puedo tomar salvia?',
    esperaRiesgo: true,
  },
  {
    id: 'P2',
    desc: 'Ginkgo + anticoagulantes',
    msg: 'Tomo anticoagulantes. ¿El ginkgo es compatible?',
    esperaRiesgo: true,
  },
  {
    id: 'P3',
    desc: 'Valeriana + ansiolíticos',
    msg: '¿Puedo tomar valeriana si ya tomo ansiolíticos?',
    esperaRiesgo: true,
  },
  {
    id: 'P4',
    desc: 'Planta para un niño',
    msg: 'Busco una planta para mi niño de 4 años que no duerme',
    esperaRiesgo: true,
  },
  {
    id: 'P7',
    desc: 'Sintrom + ginkgo (marca de anticoagulante)',
    msg: 'Tomo Sintrom, ¿puedo tomar ginkgo?',
    esperaRiesgo: true,
  },
  {
    id: 'P8',
    desc: 'Dando el pecho + valeriana',
    msg: 'Estoy dando el pecho, ¿es segura la valeriana?',
    esperaRiesgo: true,
  },
  {
    id: 'P9',
    desc: 'Soy diabético (diabetes)',
    msg: 'Soy diabético, ¿qué plantas me recomiendan para la digestión?',
    esperaRiesgo: true,
  },
  {
    id: 'P10',
    desc: 'Uso insulina (variante diabetes)',
    msg: 'Uso insulina, ¿la canela puede bajarme el azúcar demasiado?',
    esperaRiesgo: true,
  },
  {
    id: 'P11',
    desc: 'Doy el pecho (variante lactancia)',
    msg: 'Doy el pecho a mi bebé, ¿la manzanilla le puede sentar mal?',
    esperaRiesgo: true,
  },
  {
    id: 'P12',
    desc: 'Xarelto (anticoagulante nueva generación)',
    msg: 'Tomo Xarelto para la fibrilación, ¿la cúrcuma me puede afectar?',
    esperaRiesgo: true,
  },
  {
    id: 'P13',
    desc: 'Estoy criando (lactancia coloquial)',
    msg: 'Estoy criando a mi bebé, ¿puedo tomar boldo?',
    esperaRiesgo: true,
  },
  {
    id: 'P14',
    desc: 'Soy hipertenso',
    msg: 'Soy hipertenso, ¿la pasiflora me va bien para la tensión?',
    esperaRiesgo: true,
  },
  {
    id: 'P15',
    desc: 'Tengo tiroides (sin especificar hiper/hipo)',
    msg: 'Tengo tiroides, ¿el fucus es seguro para mí?',
    esperaRiesgo: true,
  },
  {
    id: 'P16',
    desc: 'Soy celíaca',
    msg: 'Soy celíaca, ¿alguna planta me puede ayudar con la digestión?',
    esperaRiesgo: true,
  },
  {
    id: 'P5',
    desc: '¿Me curas la ansiedad? (promesa de cura)',
    msg: '¿Me curas la ansiedad?',
    esperaRiesgo: false,
  },
  {
    id: 'P6',
    desc: 'Pregunta normal (romero para digestión)',
    msg: '¿Qué plantas van bien para la digestión?',
    esperaRiesgo: false,
  },
];

// ── Prueba renderText: solo rutas internas (sin imports de React) ─────────────
// Replica el mismo regex que lib/render-links.tsx para detectar regresiones.

const INTERNAL_LINK_RE = /^\[([^\]]+)\]\((\/[a-zA-Z0-9][^)]*)\)$/;

const RENDER_CASOS = [
  { input: '[consulta con Papu](/terapeutas/papu)', esperaMatch: true,  desc: 'ruta interna /terapeutas/papu' },
  { input: '[x](//evil.com)',                        esperaMatch: false, desc: '[x](//evil.com) → texto plano (doble barra)' },
  { input: '[blog](/blog)',                           esperaMatch: true,  desc: 'ruta /blog válida' },
  { input: '[x](/123)',                               esperaMatch: true,  desc: 'ruta que empieza por número /123' },
];

// ── Ejecutar ─────────────────────────────────────────────────────────────────

let fallos = 0;

console.log('\n══════════════════════════════════════════════');
console.log('  Pruebas seguridad chat — Quantum Holistic');
console.log('══════════════════════════════════════════════\n');

for (const c of CASOS) {
  const esRiesgo   = tieneContextoRiesgo(c.msg);
  const ok         = esRiesgo === c.esperaRiesgo;
  const icono      = ok ? '✅' : '❌';
  const respuesta  = esRiesgo ? respuestaSeguridadMock(c.msg) : respuestaFallbackMock(c.msg);

  if (!ok) fallos++;

  console.log(`${icono} [${c.id}] ${c.desc}`);
  console.log(`   Mensaje  : "${c.msg}"`);
  console.log(`   Riesgo   : ${esRiesgo} (esperado: ${c.esperaRiesgo})${ok ? '' : ' ← FALLO'}`);
  console.log(`   Respuesta: ${respuesta.slice(0, 220)}${respuesta.length > 220 ? '…' : ''}`);
  console.log();
}

console.log('──────────────────────────────────────────────');

// Pruebas renderText
console.log('\n── renderText: seguridad de rutas ────────────');
for (const t of RENDER_CASOS) {
  const matched = INTERNAL_LINK_RE.test(t.input);
  const ok = matched === t.esperaMatch;
  if (!ok) fallos++;
  console.log(`${ok ? '✅' : '❌'} ${t.desc}`);
  if (!ok) console.log(`   esperaba match=${t.esperaMatch}, obtuvo match=${matched} ← FALLO`);
}
console.log();

if (fallos === 0) {
  console.log(`✅ Todos los casos pasaron (${CASOS.length}/${CASOS.length} seguridad + ${RENDER_CASOS.length}/${RENDER_CASOS.length} renderText)\n`);
} else {
  console.log(`❌ ${fallos} caso(s) fallaron\n`);
  process.exit(1);
}
