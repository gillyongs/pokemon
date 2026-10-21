const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function checkSmallSprites() {
  const content = fs.readFileSync('src/entity/Pokemon/PokemonData.js', 'utf8');
  const regex = /new\s+Pokemon\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']/g;
  const matches = [...content.matchAll(regex)];

  const list = [];

  for (const m of matches) {
    const [_, no, id, name] = m;
    const p = path.join('public', 'img', 'pokemon', `${id}.webp`);
    if (!fs.existsSync(p)) continue;

    const buf = fs.readFileSync(p);
    const meta = await sharp(buf).metadata();
    const trimmed = await sharp(buf).trim().toBuffer({ resolveWithObject: true });

    const tw = trimmed.info.width;
    const th = trimmed.info.height;
    const area = tw * th;
    const canvasArea = meta.width * meta.height;
    const areaPercent = (area / canvasArea) * 100;
    const heightPercent = (th / meta.height) * 100;
    const maxDim = Math.max(tw, th);

    list.push({
      id,
      name,
      canvas: `${meta.width}x${meta.height}`,
      sprite: `${tw}x${th}`,
      tw,
      th,
      maxDim,
      heightPercentNum: heightPercent,
      heightPercent: `${heightPercent.toFixed(1)}%`,
      areaPercentNum: areaPercent,
      areaPercent: `${areaPercent.toFixed(1)}%`,
    });
  }

  // 1. Filter truly small ones:
  // e.g. height < 115px (less than 45% of 256) or maxDim < 140px, or area < 25%
  const small = list.filter((r) => r.th <= 115 || (r.maxDim <= 150 && r.th <= 125) || r.areaPercentNum < 25);
  small.sort((a, b) => a.areaPercentNum - b.areaPercentNum);

  console.log(`\n=== 캔버스 대비 포켓몬이 너무 작게 나오는 포켓몬 (${small.length}마리) ===\n`);
  console.table(
    small.map((r) => ({
      도감번호: r.id,
      이름: r.name,
      '스프라이트 실크기': r.sprite,
      '높이 비율 (세로)': r.heightPercent,
      '면적 점유율': r.areaPercent,
    }))
  );
}

checkSmallSprites();
