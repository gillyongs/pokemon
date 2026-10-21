const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const POKEMON_DIR = path.join(__dirname, '..', 'public', 'img', 'pokemon');
const BACKUP_DIR = path.join(POKEMON_DIR, 'backup_home_quality');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// 1. Update 0894 (Regieleki) with bottom margin
async function updateRegieleki() {
  console.log('--- Updating 0894 Regieleki bottom margin ---');
  const filepath = path.join(POKEMON_DIR, '0894.webp');
  const backupPath = path.join(BACKUP_DIR, '0894.webp');

  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filepath, backupPath);
  }

  const inputBuffer = fs.readFileSync(backupPath);
  const trimmed = await sharp(inputBuffer).trim().toBuffer({ resolveWithObject: true });
  const tw = trimmed.info.width;
  const th = trimmed.info.height;

  // Give generous bottom margin (24px) so it floats naturally
  const bottomPad = 24;
  const topPad = Math.max(0, 256 - th - bottomPad);
  const leftPad = Math.max(0, Math.round((256 - tw) / 2));

  const outputBuffer = await sharp({
    create: {
      width: 256,
      height: 256,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([{
    input: trimmed.data,
    top: topPad,
    left: leftPad
  }])
  .webp({ lossless: true })
  .toBuffer();

  fs.writeFileSync(filepath, outputBuffer);
  console.log(`[DONE] 0894 Regieleki: placed with bottomPad: ${bottomPad}px, topPad: ${topPad}px, leftPad: ${leftPad}px`);
}

// 2. Fetch and format high-resolution HOME sprites
const highResTargets = [
  { id: '0645-a', name: '랜드로스 영물폼', slug: 'landorus-therian' },
  { id: '0785',   name: '카푸꼬꼬꼭',     slug: 'tapu-koko' },
  { id: '0795',   name: '페로코체',       slug: 'pheromosa' },
  { id: '0797',   name: '철화구야',       slug: 'celesteela' },
];

async function updateHighResSprites() {
  console.log('\n--- Fetching & processing high-res HOME sprites ---');

  for (const t of highResTargets) {
    const filename = `${t.id}.webp`;
    const filepath = path.join(POKEMON_DIR, filename);
    const backupPath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(backupPath) && fs.existsSync(filepath)) {
      fs.copyFileSync(filepath, backupPath);
    }

    const homeUrl = `https://img.pokemondb.net/sprites/home/normal/${t.slug}.png`;
    console.log(`Fetching ${t.name} from ${homeUrl}...`);

    const res = await fetch(homeUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!res.ok) {
      console.error(`Failed to fetch ${t.slug}: ${res.status}`);
      continue;
    }

    const rawBuffer = Buffer.from(await res.arrayBuffer());

    // Trim transparent edges
    const trimmed = await sharp(rawBuffer).trim().toBuffer({ resolveWithObject: true });
    let tw = trimmed.info.width;
    let th = trimmed.info.height;

    // Optional sharpening to enhance crystal-clear edges
    let processed = await sharp(trimmed.data)
      .sharpen({ sigma: 0.8, m1: 1.0, m2: 0.3 })
      .toBuffer();

    // Scale so the Pokemon fills the 256 canvas generously:
    // Target height around 200~215px, max width around 235px
    let scale = 1.0;
    if (th < 195 && tw * (195 / th) <= 235) {
      scale = 195 / th;
    }
    if (tw * scale > 235) {
      scale = 235 / tw;
    }
    if (th * scale > 215) {
      scale = 215 / th;
    }

    let finalData = processed;
    if (Math.abs(scale - 1.0) > 0.02) {
      tw = Math.round(tw * scale);
      th = Math.round(th * scale);
      finalData = await sharp(processed)
        .resize(tw, th, { kernel: sharp.kernel.lanczos3 })
        .toBuffer();
    }

    const bottomPad = 2;
    const topPad = Math.max(0, 256 - th - bottomPad);
    const leftPad = Math.max(0, Math.round((256 - tw) / 2));

    const outputBuffer = await sharp({
      create: {
        width: 256,
        height: 256,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{
      input: finalData,
      top: topPad,
      left: leftPad
    }])
    .webp({ lossless: true })
    .toBuffer();

    fs.writeFileSync(filepath, outputBuffer);
    console.log(`[DONE] ${t.id} (${t.name}): High-res size ${tw}x${th} on 256x256 (top: ${topPad}px, left: ${leftPad}px, bottom: ${bottomPad}px)`);
  }
}

async function main() {
  await updateRegieleki();
  await updateHighResSprites();
  console.log('\nAll operations completed successfully.');
}

main().catch(console.error);
