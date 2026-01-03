/* eslint-disable no-undef */
/**
 * PWA Icon Generator
 * Generates all required PWA icons from the base SVG
 * Run: node scripts/generate-icons.mjs
 */

import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const iconsDir = join(projectRoot, 'public', 'icons');
const splashDir = join(projectRoot, 'public', 'splash');

// Icon configurations
const icons = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-maskable-192.png', size: 192, maskable: true },
  { name: 'icon-maskable-512.png', size: 512, maskable: true },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'apple-touch-icon-180.png', size: 180 },
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
];

// Base SVG for regular icons
const createIconSvg = (size, maskable = false) => {
  const padding = maskable ? size * 0.2 : 0; // 20% safe zone for maskable
  const innerSize = size - padding * 2;
  const cx = size / 2;
  const cy = size / 2;
  const radius = innerSize * 0.31;
  const hourHandLength = innerSize * 0.23;
  const minuteHandLength = innerSize * 0.16;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" fill="none">
  <rect width="${size}" height="${size}" rx="${maskable ? 0 : size * 0.125}" fill="#2563eb"/>
  <circle cx="${cx}" cy="${cy}" r="${radius}" stroke="white" stroke-width="${innerSize * 0.047}" fill="none"/>
  <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - hourHandLength}" stroke="white" stroke-width="${innerSize * 0.039}" stroke-linecap="round"/>
  <line x1="${cx}" y1="${cy}" x2="${cx + minuteHandLength}" y2="${cy}" stroke="white" stroke-width="${innerSize * 0.031}" stroke-linecap="round"/>
  <circle cx="${cx}" cy="${cy}" r="${innerSize * 0.031}" fill="white"/>
</svg>`;
};

// iOS Splash screen configurations
const splashScreens = [
  { name: 'apple-splash-2048-2732.png', width: 2048, height: 2732 }, // 12.9" iPad Pro
  { name: 'apple-splash-1668-2388.png', width: 1668, height: 2388 }, // 11" iPad Pro
  { name: 'apple-splash-1536-2048.png', width: 1536, height: 2048 }, // 9.7" iPad
  { name: 'apple-splash-1290-2796.png', width: 1290, height: 2796 }, // iPhone 15 Pro Max
  { name: 'apple-splash-1179-2556.png', width: 1179, height: 2556 }, // iPhone 15 Pro
  { name: 'apple-splash-1170-2532.png', width: 1170, height: 2532 }, // iPhone 14
  { name: 'apple-splash-750-1334.png', width: 750, height: 1334 },   // iPhone SE
];

const createSplashSvg = (width, height) => {
  const iconSize = Math.min(width, height) * 0.2;
  const cx = width / 2;
  const cy = height / 2 - height * 0.05; // Slightly above center
  const radius = iconSize * 0.31;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="none">
  <rect width="${width}" height="${height}" fill="#2563eb"/>
  <circle cx="${cx}" cy="${cy}" r="${radius}" stroke="white" stroke-width="${iconSize * 0.047}" fill="none"/>
  <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - iconSize * 0.23}" stroke="white" stroke-width="${iconSize * 0.039}" stroke-linecap="round"/>
  <line x1="${cx}" y1="${cy}" x2="${cx + iconSize * 0.16}" y2="${cy}" stroke="white" stroke-width="${iconSize * 0.031}" stroke-linecap="round"/>
  <circle cx="${cx}" cy="${cy}" r="${iconSize * 0.031}" fill="white"/>
  <text x="${cx}" y="${cy + iconSize * 0.6}" font-family="system-ui, -apple-system, sans-serif" font-size="${iconSize * 0.25}" font-weight="600" fill="white" text-anchor="middle">Timelog</text>
</svg>`;
};

async function generateIcons() {
  console.log('Generating PWA icons...\n');

  // Ensure directories exist
  await mkdir(iconsDir, { recursive: true });
  await mkdir(splashDir, { recursive: true });

  // Generate app icons
  for (const icon of icons) {
    const svg = createIconSvg(icon.size, icon.maskable);
    const outputPath = join(iconsDir, icon.name);

    await sharp(Buffer.from(svg))
      .resize(icon.size, icon.size)
      .png()
      .toFile(outputPath);

    console.log(`✓ Generated ${icon.name} (${icon.size}x${icon.size})`);
  }

  // Generate splash screens
  console.log('\nGenerating splash screens...\n');
  for (const splash of splashScreens) {
    const svg = createSplashSvg(splash.width, splash.height);
    const outputPath = join(splashDir, splash.name);

    await sharp(Buffer.from(svg))
      .resize(splash.width, splash.height)
      .png()
      .toFile(outputPath);

    console.log(`✓ Generated ${splash.name} (${splash.width}x${splash.height})`);
  }

  // Generate favicon.ico with multiple sizes (proper ICO format)
  console.log('\nGenerating favicon.ico...');
  const favicon16 = await sharp(Buffer.from(createIconSvg(16)))
    .resize(16, 16)
    .png()
    .toBuffer();
  const favicon32 = await sharp(Buffer.from(createIconSvg(32)))
    .resize(32, 32)
    .png()
    .toBuffer();
  const favicon48 = await sharp(Buffer.from(createIconSvg(48)))
    .resize(48, 48)
    .png()
    .toBuffer();

  // Create proper multi-resolution ICO file
  const icoBuffer = await pngToIco([favicon16, favicon32, favicon48]);
  await writeFile(join(projectRoot, 'public', 'favicon.ico'), icoBuffer);

  console.log('✓ Generated favicon.ico (16x16, 32x32, 48x48)');

  console.log('\n✅ All PWA assets generated successfully!');
  console.log('\nFiles created:');
  console.log('  public/icons/ - App icons');
  console.log('  public/splash/ - iOS splash screens');
  console.log('  public/favicon.ico - Browser favicon');
}

generateIcons().catch(console.error);
