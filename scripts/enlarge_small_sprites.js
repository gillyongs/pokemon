const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetIds = [
  '0798',   // 종이신도
  '1004',   // 위유이
  '0778',   // 따라큐
  '0479-h', // 히트로토무
  '0479-w', // 워시로토무
  '0479-c', // 커트로토무
  '0260-m', // 메가대짱이
  '0598',   // 너트령
  '0596',   // 전툴라
  '0717',   // 이벨타르
  '0713',   // 크레베이스
  '0970',   // 킬라플로르
  '0809',   // 멜메탈
  '0752',   // 깨비물거미
  '0594',   // 맘복치
  '0903',   // 포푸니크
  '0898-a', // 백마렉스
  '0898-b', // 흑마렉스
  '0882',   // 어래곤
  '0795',   // 페로코체
  '0233',   // 폴리곤2
];

const POKEMON_DIR = path.join(__dirname, '..', 'public', 'img', 'pokemon');
const BACKUP_DIR = path.join(POKEMON_DIR, 'backup_enlarged');

async function run() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const content = fs.readFileSync('src/entity/Pokemon/PokemonData.js', 'utf8');

  console.log(`=== Starting enlargement for ${targetIds.length} small Pokemon ===\n`);

  for (const id of targetIds) {
    const filename = `${id}.webp`;
    const filepath = path.join(POKEMON_DIR, filename);
    const backupPath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filepath)) {
      console.warn(`[Skip] File not found: ${filename}`);
      continue;
    }

    const nameMatch = content.match(new RegExp(`new\\s+Pokemon\\(\\s*["'][^"']+["']\\s*,\\s*["']${id}["']\\s*,\\s*["']([^"']+)["']`));
    const name = nameMatch ? nameMatch[1] : id;

    // 1. Backup original file
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(filepath, backupPath);
    }

    try {
      const inputBuffer = fs.readFileSync(backupPath);
      const trimmed = await sharp(inputBuffer).trim().toBuffer({ resolveWithObject: true });
      const tw = trimmed.info.width;
      const th = trimmed.info.height;

      let scale = 1.35;
      if (th < 100) scale = 1.5;
      else if (th < 120) scale = 1.38;
      else if (tw < 100) scale = 1.28;

      // Safety bounds to prevent overflow
      if (tw * scale > 234) scale = 234 / tw;
      if (th * scale > 195) scale = 195 / th;

      const newW = Math.max(1, Math.round(tw * scale));
      const newH = Math.max(1, Math.round(th * scale));

      const resized = await sharp(trimmed.data)
        .resize(newW, newH, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
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
      console.log(`[DONE] ${id} (${name}): ${tw}x${th} -> ${newW}x${newH} (${(scale * 100).toFixed(0)}%) | top: ${topPad}px, left: ${leftPad}px, bottom: ${bottomPad}px`);
    } catch (err) {
      console.error(`[ERROR] Failed to enlarge ${filename}:`, err.message);
    }
  }

  console.log(`\nAll ${targetIds.length} sprites enlarged and centered. Backups preserved in public/img/pokemon/backup_enlarged/.`);
}

run();
