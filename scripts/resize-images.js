import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⭐ Configuration HOME
const homeCarouselImages = [
  'drainage-1024x2218.webp',
  'remodelage-1024x2218.webp',
  'miracleFace-1024x2218.webp',
  'massageSetup-1024x2218.webp'
];

const homeTreatmentImages = [
  'drainagePicture.webp',
  'remodelagePicture.webp',
  'miracleFacePicture.webp'
];

// ⭐ Configuration ABOUT
const aboutImages = [
  'portraitIntroduction-square.webp',
  'portraitLikeMe-square.webp',
  'portraitPhysio-square.webp',
  'portraitYouMatter-square.webp',
  'portraitObjectives-square.webp'
];

const aboutImages1024 = [
  'portraitIntroduction-1024x2218.webp',
  'portraitLikeMe-1024x2218.webp',
  'portraitPhysio-1024x2218.webp',
  'portraitYouMatter-1024x2218.webp',
  'portraitObjectives-1024x2218.webp'
];

const aboutImages1200 = [
  'portraitIntroduction-1200x1800.webp',
  'portraitLikeMe-1200x1800.webp',
  'portraitPhysio-1200x1800.webp',
  'portraitYouMatter-1200x1800.webp',
  'portraitObjectives-1200x1800.webp'
];

const sizes = [400, 800, 1200];  // ⭐ 3 tailles standard

async function processImage(inputPath, outputDir, quality = 92) {
  const filename = path.basename(inputPath, path.extname(inputPath));
  
  if (!fs.existsSync(inputPath)) {
    console.log(`  ⚠️  Fichier introuvable: ${inputPath}`);
    return;
  }

  console.log(`📸 Traitement: ${filename}`);

  try {
    const metadata = await sharp(inputPath).metadata();
    const originalWidth = metadata.width;

    let processedCount = 0;

    for (const width of sizes) {
      if (width > originalWidth) {
        console.log(`  ⏭️  ${width}w ignoré (largeur originale: ${originalWidth}px)`);
        continue;
      }

      const outputPath = path.join(outputDir, `${filename}-${width}w.webp`);

      await sharp(inputPath)
        .resize(width, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality })
        .toFile(outputPath);

      processedCount++;
      console.log(`  ✅ ${width}w créé`);
    }

    console.log(`  ✨ ${processedCount} versions créées\n`);
  } catch (error) {
    console.error(`  ❌ Erreur: ${error.message}\n`);
  }
}

async function cleanDirectory(dir) {
  if (fs.existsSync(dir)) {
    console.log(`🧹 Nettoyage de ${dir}...`);
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}

async function optimizeAllImages() {
  console.log('🚀 Optimisation des images HOME + ABOUT...\n');

  // ⭐ 1. Images du carrousel HOME (public/images/home)
  const carouselInputDir = path.join(__dirname, '../public/images/home');
  const carouselOutputDir = path.join(__dirname, '../public/images/optimized/home');

  console.log('📁 CARROUSEL HOME');
  console.log(`   Input: ${carouselInputDir}`);
  console.log(`   Output: ${carouselOutputDir}\n`);

  await cleanDirectory(carouselOutputDir);

  for (const imageName of homeCarouselImages) {
    const inputPath = path.join(carouselInputDir, imageName);
    await processImage(inputPath, carouselOutputDir);
  }

  // ⭐ 2. Images des traitements HOME (src/assets/images)
  const treatmentInputDir = path.join(__dirname, '../src/assets/images');
  const treatmentOutputDir = path.join(__dirname, '../src/assets/images/optimized');

  console.log('\n📁 TRAITEMENTS HOME');
  console.log(`   Input: ${treatmentInputDir}`);
  console.log(`   Output: ${treatmentOutputDir}\n`);

  await cleanDirectory(treatmentOutputDir);

  for (const imageName of homeTreatmentImages) {
    const inputPath = path.join(treatmentInputDir, imageName);
    await processImage(inputPath, treatmentOutputDir);
  }

  // ⭐ 3. Images de la page ABOUT - Square (public/images/about)
  const aboutInputDir = path.join(__dirname, '../public/images/about');
  const aboutOutputDir = path.join(__dirname, '../public/images/optimized/about');

  console.log('\n📁 PAGE ABOUT - Format Square');
  console.log(`   Input: ${aboutInputDir}`);
  console.log(`   Output: ${aboutOutputDir}\n`);

  await cleanDirectory(aboutOutputDir);

  for (const imageName of aboutImages) {
    const inputPath = path.join(aboutInputDir, imageName);
    await processImage(inputPath, aboutOutputDir);
  }

  // ⭐ 4. Images 1024x2218 de la page ABOUT
  console.log('\n📁 PAGE ABOUT - Format 1024x2218');
  console.log(`   Input: ${aboutInputDir}`);
  console.log(`   Output: ${aboutOutputDir}\n`);

  for (const imageName of aboutImages1024) {
    const inputPath = path.join(aboutInputDir, imageName);
    await processImage(inputPath, aboutOutputDir);
  }

  // ⭐ 5. Images 1200x1800 de la page ABOUT
  console.log('\n📁 PAGE ABOUT - Format 1200x1800');
  console.log(`   Input: ${aboutInputDir}`);
  console.log(`   Output: ${aboutOutputDir}\n`);

  for (const imageName of aboutImages1200) {
    const inputPath = path.join(aboutInputDir, imageName);
    await processImage(inputPath, aboutOutputDir);
  }

  // ⭐ Résumé
  const totalImages = homeCarouselImages.length + homeTreatmentImages.length + 
                     aboutImages.length + aboutImages1024.length + aboutImages1200.length;
  
  console.log('\n✨ Optimisation terminée !');
  console.log('\n📊 Images générées:');
  console.log(`  - public/images/optimized/home/ (${homeCarouselImages.length * 3} fichiers)`);
  console.log(`  - src/assets/images/optimized/ (${homeTreatmentImages.length * 3} fichiers)`);
  console.log(`  - public/images/optimized/about/ (${(aboutImages.length + aboutImages1024.length + aboutImages1200.length) * 3} fichiers)`);
  console.log('\n💡 Total: ' + (totalImages * 3) + ' fichiers');
}

optimizeAllImages().catch(console.error);