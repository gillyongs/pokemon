const sharp = require('sharp');

async function inspectHoles(filePath, name, minBgBrightness, maxBgDiff) {
  const { data, info } = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  function isBgPixel(r, g, b) {
    const minC = Math.min(r, g, b);
    const maxC = Math.max(r, g, b);
    return minC >= minBgBrightness && (maxC - minC) <= maxBgDiff;
  }

  // Border fill
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

  // Check character bounding box
  let minX = w, maxX = 0, minY = h, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!isOuterBg[y * w + x]) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  console.log(`\n=== ${name} Bounding Box: [${minX}, ${minY}] to [${maxX}, ${maxY}] (${maxX-minX+1}x${maxY-minY+1}) ===`);

  // Check all unvisited background-like pixels inside the bounding box
  const visited = new Uint8Array(w * h);
  const internalBgBlobs = [];
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const idx = y * w + x;
      if (!isOuterBg[idx] && !visited[idx] && isBgPixel(data[idx*3], data[idx*3+1], data[idx*3+2])) {
        const blob = [];
        const bq = [x, y];
        visited[idx] = 1;
        let bh = 0;
        let minBlobB = 255, maxBlobB = 0;
        while (bh < bq.length) {
          const bx = bq[bh++], by = bq[bh++];
          blob.push([bx, by]);
          const bidx = (by * w + bx) * 3;
          const br = data[bidx], bg = data[bidx+1], bb = data[bidx+2];
          const bMin = Math.min(br, bg, bb);
          if (bMin < minBlobB) minBlobB = bMin;
          if (bMin > maxBlobB) maxBlobB = bMin;
          for (const [nx, ny] of [[bx-1, by], [bx+1, by], [bx, by-1], [bx, by+1]]) {
            if (nx >= minX && nx <= maxX && ny >= minY && ny <= maxY) {
              const nidx = ny * w + nx;
              if (!isOuterBg[nidx] && !visited[nidx] && isBgPixel(data[nidx*3], data[nidx*3+1], data[nidx*3+2])) {
                visited[nidx] = 1;
                bq.push(nx, ny);
              }
            }
          }
        }
        internalBgBlobs.push({ size: blob.length, blob, minB: minBlobB, maxB: maxBlobB });
      }
    }
  }

  internalBgBlobs.sort((a, b) => b.size - a.size);
  console.log(`Internal bg blobs count: ${internalBgBlobs.length}`);
  internalBgBlobs.slice(0, 10).forEach((b, i) => {
    const avgX = Math.round(b.blob.reduce((s, p) => s + p[0], 0) / b.size);
    const avgY = Math.round(b.blob.reduce((s, p) => s + p[1], 0) / b.size);
    // Sample a few pixels
    const samplePx = b.blob[0];
    const sidx = (samplePx[1] * w + samplePx[0]) * 3;
    console.log(`  Blob ${i}: size=${b.size}, center=(${avgX}, ${avgY}), brightness=[${b.minB}, ${b.maxB}], sample=RGB(${data[sidx]}, ${data[sidx+1]}, ${data[sidx+2]})`);
  });
}

(async () => {
  await inspectHoles('C:/Users/khs20/.gemini/antigravity/brain/45252a11-e070-4b63-be4e-0a5242bba71c/.user_uploaded/media_1792579440113_5166bd36.jpg', '0804 Naganadel', 210, 10);
  await inspectHoles('C:/Users/khs20/.gemini/antigravity/brain/45252a11-e070-4b63-be4e-0a5242bba71c/.user_uploaded/media_1792579440125_80cdd27b.jpg', '0809 Melmetal', 200, 10);
})();
