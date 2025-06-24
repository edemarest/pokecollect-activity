// Script to move all pokemon images from src/assets/pokemon to public/pokemon
import fs from 'fs';
import path from 'path';

const SRC = path.resolve('./src/assets/pokemon');
const DEST = path.resolve('./public/pokemon');

if (!fs.existsSync(DEST)) {
  fs.mkdirSync(DEST, { recursive: true });
}

const files = fs.readdirSync(SRC);
for (const file of files) {
  const srcFile = path.join(SRC, file);
  const destFile = path.join(DEST, file);
  fs.copyFileSync(srcFile, destFile);
  console.log(`Copied ${file}`);
}
console.log('All images moved to public/pokemon.');
