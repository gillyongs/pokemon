const sharp = require('sharp');

async function testFill(filePath, name, minBgBrightness, maxBgDiff) {
  const { data, info } = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
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
    const neighbors = [[cx-1, cy], [cx+1, cy], [cx, cy-1], [cx, cy+1]];
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const nidx = ny * w + nx;
        if (!isBg[nidx] && isBgPixel(data[nidx * 3], data[nidx * 3 + 1], data[nidx * 3 + 2])) {
          isBg[nidx] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }
  console.log(name, 'Border fill pixels:', queue.length / 2, 'Total:', w * h);

  // Check unvisited bright neutral pixels
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
          const neighbors = [[bx-1, by], [bx+1, by], [bx, by-1], [bx, by+1]];
          for (const [nx, ny] of neighbors) {
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
  console.log(name, 'Unvisited bright neutral blobs:', unvisitedBlobs.length);
  unvisitedBlobs.sort((a, b) => b.length - a.length);
  unvisitedBlobs.slice(0, 10).forEach((b, i) => {
    const avgX = Math.round(b.reduce((s, p) => s + p[0], 0) / b.length);
    const avgY = Math.round(b.reduce((s, p) => s + p[1], 0) / b.length);
    console.log(`  Blob ${i}: size=${b.length}, center=(${avgX}, ${avgY})`);
  });
}

(async () => {
  await testFill('C:/Users/khs20/.gemini/antigravity/brain/45252a11-e070-4b63-be4e-0a5242bba71c/.user_uploaded/media_1792579045450_9e3c5724.jpg', '0795 Pheromosa', 220, 10);
  await testFill('C:/Users/khs20/.gemini/antigravity/brain/45252a11-e070-4b63-be4e-0a5242bba71c/.user_uploaded/media_1792579045487_4c847a00.jpg', '0793 Nihilego', 200, 10);
  await testFill('C:/Users/khs20/.gemini/antigravity/brain/45252a11-e070-4b63-be4e-0a5242bba71c/.user_uploaded/media_1792579045647_014f1a7f.jpg', '0797 Celesteela', 220, 10);
})();
