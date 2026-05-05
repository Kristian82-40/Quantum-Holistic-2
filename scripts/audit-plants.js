const fs = require('fs');
const path = require('path');

const fichas = JSON.parse(fs.readFileSync('/Volumes/Papu Ext/Dev/QuantumHolistic/project/quantum-holistic/app/fichas-50.json', 'utf8'));

const imagesDir = '/Volumes/Papu Ext/Dev/QuantumHolistic/project/quantum-holistic/app/public/images/plants';
const images = fs.readdirSync(imagesDir).filter(f => f.match(/\.(jpg|jpeg|png)$/i));

console.log(`\n📋 FICHAS: ${fichas.length} plantas`);
console.log(`📸 IMÁGENES: ${images.length} archivos\n`);

const imageMap = {};
images.forEach(img => {
  const base = img.replace(/-(cientifica|mistica)\.(jpg|jpeg|png)$/i, '');
  if (!imageMap[base]) imageMap[base] = {};
  if (img.includes('cientifica')) imageMap[base].cientifica = img;
  if (img.includes('mistica')) imageMap[base].mistica = img;
});

let mismatches = 0;
fichas.forEach((ficha, idx) => {
  const slug = ficha.slug || ficha.nombre_es.toLowerCase().replace(/\s+/g, '-');
  const hasImg = imageMap[slug];
  
  if (!hasImg?.cientifica) {
    console.log(`❌ FALTA: ${ficha.id} | ${ficha.nombre_es} (slug: ${slug})`);
    mismatches++;
  }
});

console.log(`\n⚠️  Total mismatches: ${mismatches}/${fichas.length}\n`);
console.log('✅ Guarda este output. Luego ejecuta PROMPT 2.\n');
