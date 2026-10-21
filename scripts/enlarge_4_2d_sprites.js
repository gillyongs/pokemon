const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const POKEMON_DIR = path.join(__dirname, '..', 'public', 'img', 'pokemon');

const targets = [
  { id: '0645-a', name: '랜드로스 영물폼', scale: 1.35 },
  { id: '0785',   name: '카푸꼬꼬꼭',     scale: 1.30 },
  { id: '0797',   name: '철화구야',       scale: 1.30 },
  { id: '0795',   name: '페로코체',       scale: 1.10 },
];

async function run() {
  console.log('=== Scaling up 2D sprites with sharpen filter ===\n');

  for (const t of targets) {
    const filename = `${t.id}.webp`;
    const filepath = path.join(POKEMON_DIR, filename);

    if (!fs.existsSync(filepath)) {
      console.warn(`[Skip] File not found: ${filename}`);
      continue;
    }

    const inputBuffer = fs.readFileSync(filepath);
    const trimmed = await sharp(inputBuffer).trim().toBuffer({ resolveWithObject: true });

    const tw = trimmed.info.width;
    const th = trimmed.info.height;

    const newW = Math.round(tw * t.scale);
    const newH = Math.round(th * t.scale);

    // High quality Lanczos3 resize + edge sharpening for crisp 2D look
    const resized = await sharp(trimmed.data)
      .resize(newW, newH, { kernel: sharp.kernel.lanczos3 })
      .sharpen({ sigma: 1.0, m1: 1.2, m2: 0.5 })
      .toBuffer();

    const bottomPad = 2;
    const topPad = Math.max(0, 256 - newH - bottomPad);
    const leftPad = Math.max(0, Math.round((256 - newW) / 2));

    const outputBuffer = await sharp({
      create: {
        width: 256,
        height: 256,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: resized,
          top: topPad,
          left: leftPad,
        },
      ])
      .webp({ lossless: true })
      .toBuffer();

    fs.writeFileSync(filepath, outputBuffer);
    console.log(`[DONE] ${t.id} (${t.name}): 2D sprite ${tw}x${th} -> ${newW}x${newH} (${(t.scale * 100).toFixed(0)}%) | top: ${topPad}px, left: ${leftPad}px, bottom: ${bottomPad}px`);
  }

  console.log('\nAll 4 2D sprites enlarged and sharpened cleanly.');
}

run();
