const { execSync } = require('child_process');
const fs = require('fs');

const src = '/Users/amit/.gemini/antigravity-ide/brain/80031cb5-235e-41f0-88d4-dfa818b21b0d/.user_uploaded/media_1792702711681.jpg';
const media3D = '/Users/amit/.gemini/antigravity-ide/brain/80031cb5-235e-41f0-88d4-dfa818b21b0d/.user_uploaded/media_1792702938740.jpg';
const mediaFlat = '/Users/amit/.gemini/antigravity-ide/brain/80031cb5-235e-41f0-88d4-dfa818b21b0d/.user_uploaded/media_1792702972287.jpg';

const icons = [
  // Row 1
  { name: 'womens-health', letter: 'W', category: 'Womens Health', x: 45, y: 215, w: 210, h: 200 },
  { name: 'mens-health', letter: 'M', category: 'Mens Health', x: 285, y: 215, w: 210, h: 200 },
  { name: 'pride-wellbeing', letter: 'P', category: 'Pride Wellbeing', x: 528, y: 215, w: 210, h: 200 },
  { name: 'adhd-support', letter: 'A', category: 'ADHD Support', x: 768, y: 215, w: 210, h: 200 },
  // Row 2
  { name: 'mind-mood', letter: 'M', category: 'Mind and Mood', x: 45, y: 472, w: 210, h: 200 },
  { name: 'fitness', letter: 'F', category: 'Fitness', x: 285, y: 472, w: 210, h: 200 },
  { name: 'nutrition', letter: 'N', category: 'Nutrition', x: 528, y: 472, w: 210, h: 200 },
  { name: 'sleep', letter: 'S', category: 'Sleep', x: 768, y: 472, w: 210, h: 200 },
  // Row 3
  { name: 'community', letter: 'C', category: 'Community', x: 45, y: 728, w: 210, h: 200 },
  { name: 'letters', letter: 'L', category: 'Letters', x: 285, y: 728, w: 210, h: 200 },
  { name: 'local-ai', letter: 'A', category: 'Local AI', x: 528, y: 728, w: 210, h: 200 },
  { name: 'growth-quests', letter: 'G', category: 'Growth and Quests', x: 768, y: 728, w: 210, h: 200 }
];

const outDir = '/Volumes/Amit/Projects/Apps/thrivefold/assets/icons/categories';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

for (const icon of icons) {
  const dest = `${outDir}/${icon.name}.png`;
  const cmd = `magick "${src}" -crop ${icon.w}x${icon.h}+${icon.x}+${icon.y} +repage -resize 256x256 "${dest}"`;
  execSync(cmd);
  console.log(`[Extracted] ${icon.name} (${icon.letter}) -> ${dest}`);
}

// 1. Brand Banner Logo
const brandBanner = '/Volumes/Amit/Projects/Apps/thrivefold/assets/brand/thrivefold-banner-logo.png';
execSync(`magick "${src}" -crop 570x110+225+55 +repage "${brandBanner}"`);
console.log(`[Extracted] Brand Banner -> ${brandBanner}`);

// 2. Master App Icon (from 3D icon media_1792702938740.jpg, perfectly centered 1024x1024)
const master3DIcon = '/Volumes/Amit/Projects/Apps/thrivefold/assets/images/app-icon-all.png';
execSync(`magick "${media3D}" -resize 1024x1024 "${master3DIcon}"`);
execSync(`cp "${master3DIcon}" "/Volumes/Amit/Projects/Apps/thrivefold/assets/images/app-icon-ios.png"`);
execSync(`cp "${master3DIcon}" "/Volumes/Amit/Projects/Apps/thrivefold/assets/images/app-icon-android-legacy.png"`);
execSync(`cp "${master3DIcon}" "/Volumes/Amit/Projects/Apps/thrivefold/assets/brand/app-icon.png"`);
execSync(`cp "${master3DIcon}" "/Volumes/Amit/Projects/Apps/thrivefold/assets/brand/icon.png"`);
execSync(`cp "${master3DIcon}" "/Volumes/Amit/Projects/Apps/thrivefold/assets/brand/thrivefold-master-icon.png"`);

// Favicon 48x48
execSync(`magick "${master3DIcon}" -resize 48x48 "/Volumes/Amit/Projects/Apps/thrivefold/assets/images/app-icon-web-favicon.png"`);

// Android Adaptive foreground (scaled with transparent safe area padding for adaptive icon round mask)
const adaptiveFg = '/Volumes/Amit/Projects/Apps/thrivefold/assets/images/app-icon-android-adaptive-foreground.png';
execSync(`magick "${master3DIcon}" -resize 720x720 -gravity center -background none -extent 1024x1024 "${adaptiveFg}"`);
execSync(`cp "${adaptiveFg}" "/Volumes/Amit/Projects/Apps/thrivefold/assets/brand/adaptive-foreground.png"`);

// Android Adaptive background (warm cream sand #FAF7F2 matching the aesthetic)
const adaptiveBg = '/Volumes/Amit/Projects/Apps/thrivefold/assets/images/app-icon-android-adaptive-background.png';
execSync(`magick -size 1024x1024 xc:"#FAF7F2" "${adaptiveBg}"`);

console.log('App icons and category icons successfully generated!');
