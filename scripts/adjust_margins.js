const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetIds = [
  '0121',   // 아쿠스타 (하단 53px 뜸, 256x240 비표준)
  '0145',   // 썬더 (하단 37px 뜸)
  '0279',   // 패리퍼 (우측 31px 쏠림)
  '0303',   // 입치트 (204x202 비표준, 하단 12px)
  '0373',   // 보만다 (하단 23px 뜸)
  '0382',   // 가이오가 (하단 19px 뜸)
  '0609',   // 샹델라 (하단 28px 뜸)
  '0635',   // 삼삼드래 (우측 29px 쏠림)
  '0645-a', // 랜드로스 (하단 13px 뜸)
  '0663',   // 파이어로 (우측 43px 쏠림)
  '0888',   // 자시안 (좌측 62px 쏠림)
  '0894',   // 레지에레키 (우측 32px 쏠림)
  '0902',   // 대쓰여너 (하단 21px 뜸)
  '0970',   // 킬라플로르 (하단 19px 뜸)
  '0987',   // 날개치는머리 (우측 56px 쏠림)
  '1003',   // 딩루 (좌측 65px 쏠림)
];

const POKEMON_DIR = path.join(__dirname, '..', 'public', 'img', 'pokemon');
const BACKUP_DIR = path.join(POKEMON_DIR, 'backup_adjusted');

async function adjustSprites() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  console.log(`=== Starting margin calibration for ${targetIds.length} Pokemon ===\n`);

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
      const inputBuffer = fs.readFileSync(backupPath);
      const meta = await sharp(inputBuffer).metadata();

      // 2. Trim empty transparent edges
      const trimmed = await sharp(inputBuffer).trim().toBuffer({ resolveWithObject: true });
      const tw = trimmed.info.width;
      const th = trimmed.info.height;

      // 3. Canvas size: standard 256x256
      const targetW = 256;
      const targetH = 256;

      // 4. Position: bottomPad 2px, center horizontally
      const bottomPad = 2;
      const topPad = Math.max(0, targetH - th - bottomPad);
      const leftPad = Math.max(0, Math.round((targetW - tw) / 2));

      // 5. Composite onto new 256x256 canvas
      const outputBuffer = await sharp({
        create: {
          width: targetW,
          height: targetH,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      })
        .composite([
          {
            input: trimmed.data,
            top: topPad,
            left: leftPad,
          },
        ])
        .webp({ lossless: true })
        .toBuffer();

      fs.writeFileSync(filepath, outputBuffer);
      console.log(`[DONE] ${filename} (${meta.width}x${meta.height} -> 256x256): sprite ${tw}x${th} placed at left: ${leftPad}px, top: ${topPad}px, bottom: ${bottomPad}px`);
    } catch (err) {
      console.error(`[ERROR] Failed to adjust ${filename}:`, err.message);
    }
  }

  console.log(`\nAll ${targetIds.length} sprites calibrated. Original backups preserved in public/img/pokemon/backup_adjusted/.`);
}

adjustSprites();
