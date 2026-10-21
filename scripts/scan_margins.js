const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function scanPokemon() {
  const content = fs.readFileSync('src/entity/Pokemon/PokemonData.js', 'utf8');
  const regex = /new\s+Pokemon\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']/g;
  const matches = [...content.matchAll(regex)];

  const results = [];

  for (const m of matches) {
    const [_, no, id, name] = m;
    const p = path.join('public', 'img', 'pokemon', `${id}.webp`);
    if (!fs.existsSync(p)) {
      results.push({ id, name, status: 'MISSING FILE' });
      continue;
    }

    try {
      const buf = fs.readFileSync(p);
      const meta = await sharp(buf).metadata();
      const trimmed = await sharp(buf).trim().toBuffer({ resolveWithObject: true });

      const w = meta.width;
      const h = meta.height;
      const tw = trimmed.info.width;
      const th = trimmed.info.height;

      const leftPad = -trimmed.info.trimOffsetLeft;
      const topPad = -trimmed.info.trimOffsetTop;
      const rightPad = w - leftPad - tw;
      const bottomPad = h - topPad - th;

      const bottomPercent = (bottomPad / h) * 100;
      const hDiff = Math.abs(leftPad - rightPad);
      const hDiffPercent = (hDiff / w) * 100;

      // Anomaly detection rules:
      // 1. Large bottom margin (floating): bottomPad > 12px in 256 or > 5% of height
      // 2. Large horizontal shift: leftPad and rightPad difference > 25px
      // 3. Top-heavy: topPad < bottomPad (sitting too high or upside down padding)
      const reasons = [];
      if (bottomPad > 12) {
        reasons.push(`하단 여백 큼 (${bottomPad}px, ${bottomPercent.toFixed(1)}%)`);
      }
      if (hDiff > 25) {
        reasons.push(`좌우 비대칭 (좌 ${leftPad}px vs 우 ${rightPad}px)`);
      }
      if (topPad < 10) {
        reasons.push(`상단 여백 거의 없음 (${topPad}px)`);
      }

      results.push({
        id,
        name,
        canvas: `${w}x${h}`,
        sprite: `${tw}x${th}`,
        topPad,
        bottomPad,
        leftPad,
        rightPad,
        reasons,
        isSuspicious: reasons.length > 0,
      });
    } catch (err) {
      results.push({ id, name, status: `ERROR: ${err.message}` });
    }
  }

  const suspicious = results.filter((r) => r.isSuspicious);

  console.log(`\n=== 전체 등록 포켓몬 ${results.length}마리 중 여백 이상 의심: ${suspicious.length}마리 ===\n`);
  suspicious.forEach((s) => {
    console.log(`[${s.id}] ${s.name} (${s.canvas})`);
    console.log(`  - 스프라이트 크기: ${s.sprite}`);
    console.log(`  - 여백: 상단 ${s.topPad}px | 하단 ${s.bottomPad}px | 좌측 ${s.leftPad}px | 우측 ${s.rightPad}px`);
    console.log(`  - 이상 원인: ${s.reasons.join(', ')}\n`);
  });

  // Also print all bottomPads sorted descending to see the ranking
  const byBottomPad = [...results]
    .filter((r) => !r.status)
    .sort((a, b) => b.bottomPad - a.bottomPad)
    .slice(0, 15);

  console.log('=== 하단 여백이 가장 큰 상위 15마리 ===');
  console.table(
    byBottomPad.map((r) => ({
      ID: r.id,
      Name: r.name,
      Canvas: r.canvas,
      Top: `${r.topPad}px`,
      Bottom: `${r.bottomPad}px`,
      Left: `${r.leftPad}px`,
      Right: `${r.rightPad}px`,
    }))
  );
}

scanPokemon();
