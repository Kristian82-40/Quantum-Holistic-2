export interface Post {
  slug:        string;
  cat:         string;
  title:       string;
  excerpt:     string;
  date:        string;
  readingTime: string;
  content:     string; // HTML simple
}

export const POSTS: Post[] = [
  {
    slug:        'plantas-depurativas-temporada',
    cat:         'Depuración',
    title:       '5 plantas depurativas de temporada que puedes encontrar en tu mercado local',
    excerpt:     'El hígado habla. A veces pide silencio, a veces pide ortiga. Aprende a escucharlo con lo que la tierra de tu zona ofrece ahora.',
    date:        'Enero 2026',
    readingTime: '5 min',
    content: `
<p>La depuración no empieza en un bote de cápsulas compradas por internet. Empieza en el mercado de tu barrio, en lo que los agricultores de tu zona están cosechando ahora mismo. La sabiduría depurativa ancestral siempre fue hiperlocal: lo que crece en tu tierra, en tu estación, es exactamente lo que tu cuerpo necesita en ese momento.</p>

<h2>Por qué la temporalidad importa más que el exotismo</h2>

<p>Cuando una planta crece en su ciclo natural y en tu misma latitud, su composición química responde a los mismos factores ambientales que afectan a tu organismo: la temperatura, la humedad, la intensidad solar. Eso no es casualidad. Es coevolución.</p>

<p>En cambio, tomar cúrcuma seca procesada de un laboratorio en Mumbai tiene un valor fitoquímico infinitamente menor que usar la ortiga fresca que crece a dos kilómetros de tu casa.</p>

<h2>Las 5 plantas depurativas de temporada (invierno-primavera)</h2>

<h3>1. Ortiga (Urtica dioica)</h3>
<p>La reina de la depuración primaveral. Rica en hierro, clorofila, vitamina C y flavonoides. Estimula el riñón, apoya al hígado y tiene acción antiinflamatoria demostrada. La encuentras fresca en mercados de proximidad de febrero a mayo. Úsala en infusión, en sopas o ligeramente escaldada como espinaca.</p>

<h3>2. Diente de León (Taraxacum officinale)</h3>
<p>Sus hojas amargas son un potente estimulante hepático. Las raíces actúan como prebiótico suave. Perfectas en ensalada con aceite de oliva y limón. Si encuentras las flores, añádelas: tienen propiedades antioxidantes superiores a las hojas.</p>

<h3>3. Hinojo (Foeniculum vulgare)</h3>
<p>Carminativo, antiespamódico y suavemente diurético. El bulbo fresco es ideal crudo o asado. La infusión de sus semillas tostadas ayuda a reducir la retención de líquidos y facilita la digestión de grasas. Muy disponible en mercados del Mediterráneo de octubre a marzo.</p>

<h3>4. Cardo mariano (Silybum marianum)</h3>
<p>La silimarina que contiene es uno de los hepatoprotectores más estudiados en fitoterapia. Protege las células hepáticas del daño oxidativo y estimula la regeneración. Lo encuentras en herbolarios de proximidad. 1-2 semanas de infusión en primavera hacen un trabajo silencioso y profundo.</p>

<h3>5. Bardana (Arctium lappa)</h3>
<p>Menos conocida, pero extraordinaria. Sus raíces tienen acción depurativa de la piel (acné, eczema) y actúan como prebiótico potente gracias a su inulina. En Japón es un alimento de uso cotidiano (gobo). En mercados europeos de agricultura ecológica la encuentras de otoño a principios de primavera.</p>

<h2>Cómo integrarlas en una semana depurativa</h2>

<p>No se trata de hacer un protocolo extremo de 3 días con zumos. Eso agota el sistema más que depurarlo. La clave es la constancia suave: una infusión de ortiga por la mañana, diente de león en la ensalada, hinojo como acompañamiento de la cena. Dos semanas así hacen más que cualquier detox agresivo.</p>

<p>Si quieres un protocolo personalizado basado en tu zona de residencia y estación actual, <a href="/#profile">genera tu perfil holístico</a> y te diseñamos uno adaptado a lo que tienes disponible a menos de 50km de donde vives.</p>
    `.trim(),
  },

  {
    slug:        'energia-cognitiva-macrobiotica',
    cat:         'Rendimiento',
    title:       'Cómo optimizar tu energía cognitiva con macrobiótica: guía práctica',
    excerpt:     'La claridad mental no se consigue con cafeína. Se construye con arroz integral, algas y el ritmo correcto de ayuno.',
    date:        'Febrero 2026',
    readingTime: '6 min',
    content: `
<p>El rendimiento cognitivo tiene fundamentos bioquímicos claros: glucosa estable, inflamación baja, microbioma equilibrado y neurotransmisores bien precursados. La macrobiótica, mal entendida como una dieta restrictiva de los 70, es en realidad uno de los sistemas más sofisticados para lograr exactamente eso.</p>

<h2>El problema con la energía cognitiva moderna</h2>

<p>La mayoría de personas que buscan "más energía mental" están montadas en una montaña rusa glucémica: café en ayunas, pico de cortisol, ultraprocesado a mediodía, crash a las 3pm, otro café, insomnio. El sistema nervioso nunca descansa. La inflamación de bajo grado sube. La conexión intestino-cerebro se deteriora.</p>

<p>La macrobiótica no es una solución mágica. Es un sistema de regulación. Y funciona porque ataca los tres frentes a la vez.</p>

<h2>Los tres pilares macrobióticos para el rendimiento mental</h2>

<h3>1. Carbohidratos de índice glucémico bajo y grano entero</h3>
<p>El arroz integral, el mijo, la cebada, el centeno y el trigo sarraceno proporcionan glucosa de liberación lenta. El cerebro gasta el 20% de la glucosa del cuerpo en reposo. Cuando la glucosa es errática, la función ejecutiva —toma de decisiones, foco, memoria de trabajo— se degrada primero.</p>
<p>Práctica: sustituye el pan blanco del desayuno por gachas de avena con semillas de cáñamo y frutos rojos silvestres. El índice glucémico baja a la mitad, la saciedad dura el doble.</p>

<h3>2. Algas marinas como fuente de yodo y minerales trazos</h3>
<p>La wakame, kombu y nori son incomprendidas en Occidente. No son solo un complemento japonés: son una de las pocas fuentes de yodo biodisponible en una dieta continental. El yodo es cofactor esencial de las hormonas tiroideas, que regulan directamente el metabolismo cerebral.</p>
<p>Práctica: un cuadrado de kombu en el caldo de verduras o una cucharada de wakame seca en la sopa. Dos veces por semana es suficiente para mantener niveles óptimos.</p>

<h3>3. Ritmo de ayuno natural sin protocolos extremos</h3>
<p>La macrobiótica tradicional contempla una ventana de alimentación de 12 horas (por ejemplo, 7:00-19:00) como norma estándar, no como biohacking. Esto permite ciclos completos de limpieza autofágica sin el estrés hormonal del ayuno 16:8 practicado incorrectamente.</p>
<p>La autofagia cerebral —el proceso por el que las neuronas eliminan proteínas dañadas— requiere entre 12 y 16 horas de ayuno para activarse. La macrobiótica lo contemplaba intuitivamente décadas antes de que Yoshinori Ohsumi ganara el Nobel por ello.</p>

<h2>Protocolo de 5 días para resetear la energía cognitiva</h2>

<p><strong>Mañana:</strong> Gachas de mijo con miso blanco (probiótico y antiinflamatorio), semillas de sésamo tostado, una ciruela umeboshi si tienes.</p>
<p><strong>Mediodía:</strong> Arroz integral, verduras de hoja verde salteadas en aceite de sésamo, alga nori, proteína vegetal o pescado azul de temporada.</p>
<p><strong>Tarde:</strong> Una infusión de raíz de achicoria o té de arroz tostado (no estimulante).</p>
<p><strong>Noche:</strong> Sopa miso con tofu, verduras raíz (zanahoria, chirivía), legumbre pequeña.</p>

<p>Al quinto día, la mayoría de personas reporta una estabilidad mental que no sentían desde niños. No euforia. Claridad tranquila.</p>

<p>Si quieres un plan macrobiótico adaptado a tu situación específica, tu zona geográfica y tus objetivos cognitivos, <a href="/#pricing">activa Quantum Pro</a> y lo construimos contigo.</p>
    `.trim(),
  },

  {
    slug:        'km0-bristol-guia',
    cat:         'KM0',
    title:       'Alimentación km0 en Bristol: dónde comprar, qué hay en temporada y cómo usarlo',
    excerpt:     'Guía práctica para quienes viven en UK y quieren conectar con la tierra local sin comprar espinacas de Kenia.',
    date:        'Marzo 2026',
    readingTime: '7 min',
    content: `
<p>Bristol tiene algo que muy pocas ciudades del sur de UK poseen: una cultura de mercados de productores genuinamente arraigada, un cinturón verde accesible y una comunidad de agricultores ecológicos de alta densidad en un radio de 50km. Si vives aquí y sigues comprando en el supermercado convencional, estás ignorando uno de los sistemas alimentarios más ricos de toda Gran Bretaña.</p>

<h2>Por qué Bristol es especial para la alimentación de proximidad</h2>

<p>Somerset y el Vale of Evesham son dos de las zonas agrícolas más fértiles de Europa templada. A menos de una hora de Bristol tienes acceso a:</p>
<ul>
<li>Manzanas y peras de cider heritage (más de 500 variedades locales)</li>
<li>Verduras de raíz de primera calidad (chirivías, colinabos, remolachas)</li>
<li>Quesos artesanos de leche cruda de pequeñas granjas</li>
<li>Carnes de pastoreo certificadas de Exmoor y Dartmoor</li>
<li>Hierbas silvestres del bosque de Dean</li>
</ul>

<h2>Dónde comprar km0 en Bristol</h2>

<h3>St Nicholas Market (centre)</h3>
<p>El mercado más antiguo de Bristol. Los miércoles y viernes tienen puestos de productores locales. Busca a Reg el de Somerset Mushrooms (setas cultivadas en paja de cereal local) y a la señora del puesto de piel de limón ecológico.</p>

<h3>Tobacco Factory Farmers' Market (Southville)</h3>
<p>Domingos de 10:00 a 14:30. Probablemente el mejor mercado de productores de la ciudad. Casi todos los puestos tienen certificación orgánica o practican labranza regenerativa. El puesto de Westcountry Dairy es imprescindible.</p>

<h3>Whiteladies Road y Clifton</h3>
<p>La zona tiene varias tiendas de barrio con filosofía slow food: Better Food Company (ecológico y local), Clifton Village Deli. No son baratos, pero son fiables en cuanto a origen.</p>

<h3>CSA (Community Supported Agriculture)</h3>
<p>La opción más km0 posible: Chew Valley Organics y Barley Wood Walled Garden ofrecen cestas semanales de verdura de temporada recogida el día anterior. Puedes elegir entre cesta completa o media cesta. Es la forma más directa de conectar con la agricultura de proximidad.</p>

<h2>Qué hay en temporada mes a mes</h2>

<p><strong>Enero-Febrero:</strong> Coliflor, brócoli morado, puerro, chirivía, coles de Bruselas, manzanas de almacén, peras, setas ostra cultivadas.</p>
<p><strong>Marzo-Abril:</strong> Espárragos de Worcestershire (los primeros de UK), espinacas, guisantes, rábanos, nabos, ortiga fresca.</p>
<p><strong>Mayo-Junio:</strong> Fresas de Somerset, habas, guisantes frescos, lechugas, tomates de invernadero local, las primeras cerezas.</p>
<p><strong>Julio-Agosto:</strong> Plenitud total. Calabacines, judías, pepinos, tomates de campo, arándanos silvestres, moras.</p>
<p><strong>Septiembre-Octubre:</strong> Manzanas (temporada), calabazas, boniato, maíz, higos, peras.</p>
<p><strong>Noviembre-Diciembre:</strong> Remolacha, kale, coles, puerros, raíz de apio, castañas de Wye Valley.</p>

<h2>Cómo construir una semana km0 en Bristol</h2>

<p>El domingo en el Tobacco Factory: compras las verduras de la semana, proteína animal si la consumes, huevos de granja y queso artesano. El miércoles en St Nicholas: reposición rápida de lo que necesitas fresco.</p>

<p>Con eso, siguiendo la estacionalidad, construyes una dieta que tiene más variedad nutricional que cualquier cesta de supermercado, más sabor, menos huella de carbono y un impacto directo en la economía local.</p>

<p>Si vives en otra ciudad del UK y quieres una guía km0 personalizada para tu zona, <a href="/#profile">cuéntanos dónde estás</a> y te la preparamos.</p>
    `.trim(),
  },
];

export function getPostBySlug(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
