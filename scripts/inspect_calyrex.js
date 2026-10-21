const sharp = require('sharp');

async function inspectCalyrex(filePath, name, minBgBrightness, maxBgDiff) {
  const { data, info } = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  let minBrightness = 255;
  let maxDiff = 0;
  function check(x, y) {
    const idx = (y * w + x) * 3;
    const r = data[idx], g = data[idx+1], b = data[idx+2];
    const minC = Math.min(r, g, b);
    const maxC = Math.max(r, g, b);
    const diff = maxC - minC;
    if (minC < minBrightness) minBrightness = minC;
    if (diff > maxDiff) maxDiff = diff;
  }
  for (let x = 0; x < w; x++) { check(x, 0); check(x, h - 1); }
  for (let y = 0; y < h; y++) { check(0, y); check(w - 1, y); }
  console.log(`\n=== ${name} (${w}x${h}) ===`);
  console.log(`Border min brightness: ${minBrightness}, max diff: ${maxDiff}`);

  function isBgPixel(r, g, b) {
    const minC = Math.min(r, g, b);
    const maxC = Math.max(r, g, b);
    return minC >= minBgBrightness && (maxC - minC) <= maxBgDiff;
  }

  const isBg = new Uint8Array(w * h);
  const queue = [];
  function tryEnqueue(x, y) {
    const idx = y * w + x;
    if (!isBg[idx] && isBgPixel(data[idx * 3], data[idx * 3 + 1], data[idx * 3 + 2])) {
      isBg[idx] = 1;
      queue.push(x, y);
    }
  }
  for (let x = 0; x < w; x++) { tryEnqueue(x, 0); tryEnqueue(x, h - 1); }
  for (let y = 0; y < h; y++) { tryEnqueue(0, y); tryEnqueue(w - 1, y); }
  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];
    for (const [nx, ny] of [[cx-1, cy], [cx+1, cy], [cx, cy-1], [cx, cy+1]]) {
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const nidx = ny * w + nx;
        if (!isBg[nidx] && isBgPixel(data[nidx * 3], data[nidx * 3 + 1], data[nidx * 3 + 2])) {
          isBg[nidx] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }
  console.log(`Border fill pixels: ${queue.length / 2}`);

  // Find unvisited bright neutral blobs
  const unvisitedBlobs = [];
  const visited2 = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (!isBg[idx] && !visited2[idx] && isBgPixel(data[idx*3], data[idx*3+1], data[idx*3+2])) {
        const blob = [];
        const bq = [x, y];
        visited2[idx] = 1;
        let bh = 0;
        while (bh < bq.length) {
          const bx = bq[bh++], by = bq[bh++];
          blob.push([bx, by]);
          for (const [nx, ny] of [[bx-1, by], [bx+1, by], [bx, by-1], [bx, by+1]]) {
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const nidx = ny * w + nx;
              if (!isBg[nidx] && !visited2[nidx] && isBgPixel(data[nidx*3], data[nidx*3+1], data[nidx*3+2])) {
                visited2[nidx] = 1;
                bq.push(nx, ny);
              }
            }
          }
        }
        unvisitedBlobs.push(blob);
      }
    }
  }
  console.log(`Unvisited bright neutral blobs: ${unvisitedBlobs.length}`);
  unvisitedBlobs.sort((a, b) => b.length - a.length);
  unvisitedBlobs.slice(0, 10).forEach((b, i) => {
    const avgX = Math.round(b.reduce((s, p) => s + p[0], 0) / b.length);
    const avgY = Math.round(b.reduce((s, p) => s + p[1], 0) / b.length);
    console.log(`  Blob ${i}: size=${b.length}, center=(${avgX}, ${avgY})`);
  });
}

(async () => {
  await inspectCalyrex('C:/Users/khs20/.gemini/antigravity/brain/45252a11-e070-4b63-be4e-0a5242bba71c/.user_uploaded/media_1792579717662_335e11fd.jpg', '0898-b Calyrex Shadow', 220, 10);
  await inspectCalyrex('C:/Users/khs20/.gemini/antigravity/brain/45252a11-e070-4b63-be4e-0a5242bba71c/.user_uploaded/media_1792579717677_2c41f7dc.jpg', '0898-a Calyrex Ice', 220, 10);
})();
