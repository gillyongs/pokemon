const sharp = require('sharp');

async function findEnclosedHoles(filePath, name) {
  const { data, info } = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  function isBgPixel(r, g, b) {
    const minC = Math.min(r, g, b);
    const maxC = Math.max(r, g, b);
    return minC >= 220 && (maxC - minC) <= 10;
  }

  const isOuterBg = new Uint8Array(w * h);
  const q = [];
  function tryEnqueue(x, y) {
    const idx = y * w + x;
    if (!isOuterBg[idx] && isBgPixel(data[idx * 3], data[idx * 3 + 1], data[idx * 3 + 2])) {
      isOuterBg[idx] = 1;
      q.push(x, y);
    }
  }
  for (let x = 0; x < w; x++) { tryEnqueue(x, 0); tryEnqueue(x, h - 1); }
  for (let y = 0; y < h; y++) { tryEnqueue(0, y); tryEnqueue(w - 1, y); }
  let qh = 0;
  while (qh < q.length) {
    const cx = q[qh++], cy = q[qh++];
    for (const [nx, ny] of [[cx-1, cy], [cx+1, cy], [cx, cy-1], [cx, cy+1]]) {
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const nidx = ny * w + nx;
        if (!isOuterBg[nidx] && isBgPixel(data[nidx * 3], data[nidx * 3 + 1], data[nidx * 3 + 2])) {
          isOuterBg[nidx] = 1;
          q.push(nx, ny);
        }
      }
    }
  }

  // Find all enclosed bright neutral blobs
  const visited = new Uint8Array(w * h);
  const blobs = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (!isOuterBg[idx] && !visited[idx] && isBgPixel(data[idx*3], data[idx*3+1], data[idx*3+2])) {
        const b = [];
        const bq = [x, y];
        visited[idx] = 1;
        let bh = 0;
        while (bh < bq.length) {
          const bx = bq[bh++], by = bq[bh++];
          b.push([bx, by]);
          for (const [nx, ny] of [[bx-1, by], [bx+1, by], [bx, by-1], [bx, by+1]]) {
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const nidx = ny * w + nx;
              if (!isOuterBg[nidx] && !visited[nidx] && isBgPixel(data[nidx*3], data[nidx*3+1], data[nidx*3+2])) {
                visited[nidx] = 1;
                bq.push(nx, ny);
              }
            }
          }
        }
        blobs.push(b);
      }
    }
  }
  blobs.sort((a, b) => b.length - a.length);
  console.log(`\n=== ${name} Enclosed Blobs (top 15) ===`);
  blobs.slice(0, 15).forEach((b, i) => {
    const avgX = Math.round(b.reduce((s, p) => s + p[0], 0) / b.length);
    const avgY = Math.round(b.reduce((s, p) => s + p[1], 0) / b.length);
    console.log(`  Blob ${i}: size=${b.length}, center=(${avgX}, ${avgY})`);
  });
}

(async () => {
  await findEnclosedHoles('C:/Users/khs20/.gemini/antigravity/brain/45252a11-e070-4b63-be4e-0a5242bba71c/.user_uploaded/media_1792579717677_2c41f7dc.jpg', '0898-a Calyrex Ice');
})();
