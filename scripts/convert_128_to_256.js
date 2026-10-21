const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetIds = [
  '0006-x', '0006-y', '0121-m', '0227-m', '0248-m',
  '0260-m', '0303-m', '0373-m', '0376-m', '0445-m',
  '0555-g', '0598',   '0649',   '0697',   '0716',
  '0717',   '0785',   '0793',   '0795',   '0797',
  '0798',   '0804',   '0809',   '0882',   '0898-a',
  '0898-b'
];

const POKEMON_DIR = path.join(__dirname, '..', 'public', 'img', 'pokemon');
const BACKUP_DIR = path.join(POKEMON_DIR, 'backup_128');

async function run() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  console.log(`Starting conversion of ${targetIds.length} 128x128 Pokemon to 256x256 standard...`);

  for (const id of targetIds) {
    const filename = `${id}.webp`;
    const filepath = path.join(POKEMON_DIR, filename);
    const backupPath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filepath)) {
      console.warn(`[Skip] File not found: ${filename}`);
      continue;
    }

    // 1. Backup original file
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(filepath, backupPath);
    }

    try {
      // 2. Read buffer into memory so Windows doesn't lock the file
      const inputBuffer = fs.readFileSync(backupPath);

      // 3. Trim transparent edges
      const trimmed = await sharp(inputBuffer).trim().toBuffer({ resolveWithObject: true });
      const origW = trimmed.info.width;
      const origH = trimmed.info.height;

      // 4. Compute scale to match 256x256 Gen 9 sprites
      let scale = 1.35;
      if (origW * scale > 230) scale = 230 / origW;
      if (origH * scale > 195) scale = 195 / origH;

      const newW = Math.max(1, Math.round(origW * scale));
      const newH = Math.max(1, Math.round(origH * scale));

      const resized = await sharp(trimmed.data)
        .resize(newW, newH, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
        .toBuffer();

      const bottomPad = 2;
      const topPad = Math.max(0, 256 - newH - bottomPad);
      const leftPad = Math.max(0, Math.round((256 - newW) / 2));

      // 5. Composite onto a transparent 256x256 canvas
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
      console.log(`[DONE] ${filename}: ${origW}x${origH} -> ${newW}x${newH} inside 256x256 (topPad: ${topPad}, leftPad: ${leftPad})`);
    } catch (err) {
      console.error(`[ERROR] Failed to convert ${filename}:`, err.message);
    }
  }

  console.log('\nAll 26 files converted successfully. Backups preserved in public/img/pokemon/backup_128/.');
}

run();
