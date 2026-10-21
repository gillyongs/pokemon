const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const POKEMON_DIR = path.join(__dirname, '..', 'public', 'img', 'pokemon');
const BACKUP_128 = path.join(POKEMON_DIR, 'backup_128');

const megas = [
  { id: '0006-x', name: '메가리자몽X', base: '0006' },
  { id: '0006-y', name: '메가리자몽Y', base: '0006' },
  { id: '0121-m', name: '메가아쿠스타', base: '0121' },
  { id: '0227-m', name: '메가무장조', base: '0227' },
  { id: '0248-m', name: '메가마기라스', base: '0248' },
  { id: '0260-m', name: '메가대짱이', base: '0260' },
  { id: '0303-m', name: '메가입치트', base: '0303' },
  { id: '0373-m', name: '메가보만다', base: '0373' },
  { id: '0376-m', name: '메가메타그로스', base: '0376' },
  { id: '0445-m', name: '메가한카리아스', base: '0445' },
];

async function run() {
  console.log('=== Enlarging & sharpening all 10 Mega Evolution Pokemon ===\n');

  for (const m of megas) {
    const backupFile = path.join(BACKUP_128, `${m.id}.webp`);
    const targetFile = path.join(POKEMON_DIR, `${m.id}.webp`);

    if (!fs.existsSync(backupFile)) {
      console.warn(`[Skip] Missing backup file for ${m.id}`);
      continue;
    }

    const inputBuffer = fs.readFileSync(backupFile);
    const trimmed = await sharp(inputBuffer).trim().toBuffer({ resolveWithObject: true });
    const tw = trimmed.info.width;
    const th = trimmed.info.height;

    // Get base pokemon dimensions
    const baseP = path.join(POKEMON_DIR, `${m.base}.webp`);
    let baseW = 180, baseH = 180;
    if (fs.existsSync(baseP)) {
      const bBuf = fs.readFileSync(baseP);
      const bTrimmed = await sharp(bBuf).trim().toBuffer({ resolveWithObject: true });
      baseW = bTrimmed.info.width;
      baseH = bTrimmed.info.height;
    }

    let scaleH = Math.max(baseH + 5, 190) / th;
    let scaleW = Math.max(baseW + 10, 210) / tw;
    let scale = Math.max(scaleH, scaleW);

    if (tw * scale > 234) scale = 234 / tw;
    if (th * scale > 212) scale = 212 / th;

    const newW = Math.round(tw * scale);
    const newH = Math.round(th * scale);

    // High quality Lanczos3 resize from pristine backup + edge sharpening
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

    fs.writeFileSync(targetFile, outputBuffer);
    console.log(
      `[DONE] ${m.id} (${m.name}): 2D sprite ${tw}x${th} -> ${newW}x${newH} (${(scale * 100).toFixed(0)}%) | Base was ${baseW}x${baseH} | top: ${topPad}px, left: ${leftPad}px, bottom: ${bottomPad}px`
    );
  }

  console.log('\nAll 10 Mega Evolution Pokemon resized and sharpened.');
}

run();
