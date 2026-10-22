const { execSync } = require('child_process');
const fs = require('fs');

const src = '/Users/amit/.gemini/antigravity-ide/brain/80031cb5-235e-41f0-88d4-dfa818b21b0d/.user_uploaded/media_1792703788162.png';

console.log('--- Applying Minimalist Terracotta T and Leaf Emblem ---');

// 1. Copy master emblem
const emblemDest = '/Volumes/Amit/Projects/Apps/thrivefold/assets/brand/thrivefold-t-leaf-emblem.png';
execSync(`cp "${src}" "${emblemDest}"`);

// 2. Overwrite all app icons with the minimalist emblem
const appIconAll = '/Volumes/Amit/Projects/Apps/thrivefold/assets/images/app-icon-all.png';
const appIconIos = '/Volumes/Amit/Projects/Apps/thrivefold/assets/images/app-icon-ios.png';
const appIconAndroidLegacy = '/Volumes/Amit/Projects/Apps/thrivefold/assets/images/app-icon-android-legacy.png';
const brandAppIcon = '/Volumes/Amit/Projects/Apps/thrivefold/assets/brand/app-icon.png';
const brandIcon = '/Volumes/Amit/Projects/Apps/thrivefold/assets/brand/icon.png';
const brandMasterIcon = '/Volumes/Amit/Projects/Apps/thrivefold/assets/brand/thrivefold-master-icon.png';

execSync(`cp "${src}" "${appIconAll}"`);
execSync(`cp "${src}" "${appIconIos}"`);
execSync(`cp "${src}" "${appIconAndroidLegacy}"`);
execSync(`cp "${src}" "${brandAppIcon}"`);
execSync(`cp "${src}" "${brandIcon}"`);
execSync(`cp "${src}" "${brandMasterIcon}"`);

console.log('Master app icons updated.');

// 3. Generate transparent emblem (T + Leaf + Sun on transparent background)
const transparentEmblem = '/Volumes/Amit/Projects/Apps/thrivefold/assets/brand/thrivefold-t-leaf-emblem-transparent.png';
const tLeafMark = '/Volumes/Amit/Projects/Apps/thrivefold/assets/brand/thrivefold-t-leaf-mark.png';

// Transparent background by keying out #FDFBF7 with 8% fuzz
execSync(`magick "${src}" -fuzz 8% -transparent "#FDFBF7" "${transparentEmblem}"`);
execSync(`cp "${transparentEmblem}" "${tLeafMark}"`);
console.log('Transparent emblem generated:', transparentEmblem);

// 4. Android Adaptive icon foreground (within 680px safe circle, centered on 1024x1024)
const adaptiveFg = '/Volumes/Amit/Projects/Apps/thrivefold/assets/images/app-icon-android-adaptive-foreground.png';
const brandAdaptiveFg = '/Volumes/Amit/Projects/Apps/thrivefold/assets/brand/adaptive-foreground.png';

execSync(`magick "${transparentEmblem}" -resize 680x680 -gravity center -background none -extent 1024x1024 "${adaptiveFg}"`);
execSync(`cp "${adaptiveFg}" "${brandAdaptiveFg}"`);
console.log('Android adaptive foreground generated.');

// 5. Android Adaptive icon background (Solid #FDFBF7)
const adaptiveBg = '/Volumes/Amit/Projects/Apps/thrivefold/assets/images/app-icon-android-adaptive-background.png';
execSync(`magick -size 1024x1024 xc:"#FDFBF7" "${adaptiveBg}"`);
console.log('Android adaptive background generated.');

// 6. Web Favicon 48x48
const favicon = '/Volumes/Amit/Projects/Apps/thrivefold/assets/images/app-icon-web-favicon.png';
execSync(`magick "${src}" -resize 48x48 "${favicon}"`);
console.log('Web favicon generated.');

console.log('All icons successfully aligned to Minimalist Terracotta T and Leaf Emblem!');
