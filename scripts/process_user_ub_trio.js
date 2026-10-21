const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Precision processor for user-uploaded Pokemon sprites with checkerboard background.
 */
async function processTrioItem(config) {
  const {
    inputPath,
    outputPath,
    previewPath,
    targetMaxW = 230,
    targetMaxH = 208,
    bottomPad = 2,
    minBgBrightness = 180,
    maxBgDiff = 16,
    holeSeeds = []
  } = config;

  console.log(`\n========================================`);
  console.log(`Processing: ${path.basename(outputPath)} from ${path.basename(inputPath)}`);

  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  function isBgPixel(r, g, b) {
    const minC = Math.min(r, g, b);
    const maxC = Math.max(r, g, b);
    const diff = maxC - minC;
    return minC >= minBgBrightness && diff <= maxBgDiff;
  }

  // 1. Flood fill from borders
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
  console.log(`Border background pixels: ${queue.length / 2}`);

  // 2. Clear specific verified anatomical background holes
  for (const [sx, sy] of holeSeeds) {
    const sidx = sy * w + sx;
    if (!isBg[sidx] && isBgPixel(data[sidx * 3], data[sidx * 3 + 1], data[sidx * 3 + 2])) {
      const hQueue = [sx, sy];
      isBg[sidx] = 1;
      let hHead = 0;
      while (hHead < hQueue.length) {
        const hx = hQueue[hHead++];
        const hy = hQueue[hHead++];
        const neighbors = [[hx-1, hy], [hx+1, hy], [hx, hy-1], [hx, hy+1]];
        for (const [nhx, nhy] of neighbors) {
          if (nhx >= 0 && nhx < w && nhy >= 0 && nhy < h) {
            const nidx = nhy * w + nhx;
            if (!isBg[nidx] && isBgPixel(data[nidx * 3], data[nidx * 3 + 1], data[nidx * 3 + 2])) {
              isBg[nidx] = 1;
              hQueue.push(nhx, nhy);
            }
          }
        }
      }
      console.log(`Cleared verified background hole at (${sx}, ${sy}) -> ${hQueue.length / 2} px`);
    }
  }

  // 3. Build RGBA buffer with defringed anti-aliasing
  const rgba = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 3;
      const outIdx = (y * w + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      rgba[outIdx] = r;
      rgba[outIdx + 1] = g;
      rgba[outIdx + 2] = b;

      if (isBg[y * w + x]) {
        rgba[outIdx + 3] = 0;
      } else {
        let hasBgNeighbor = false;
        const neighbors = [[x-1, y], [x+1, y], [x, y-1], [x, y+1]];
        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < w && ny >= 0 && ny < h && isBg[ny * w + nx]) {
            hasBgNeighbor = true;
            break;
          }
        }

        if (hasBgNeighbor) {
          const minC = Math.min(r, g, b);
          const maxC = Math.max(r, g, b);
          const diff = maxC - minC;
          if (minC >= 150 && diff <= 22) {
            const alpha = Math.max(0, Math.min(255, Math.round(((230 - minC) / 80) * 255)));
            rgba[outIdx + 3] = alpha;
            const ratio = alpha / 255;
            rgba[outIdx] = Math.round(r * ratio + 24 * (1 - ratio));
            rgba[outIdx + 1] = Math.round(g * ratio + 25 * (1 - ratio));
            rgba[outIdx + 2] = Math.round(b * ratio + 30 * (1 - ratio));
          } else {
            rgba[outIdx + 3] = 255;
          }
        } else {
          rgba[outIdx + 3] = 255;
        }
      }
    }
  }

  // 4. Remove isolated small speckles (< 100 px, such as watermark)
  const speckleVisited = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (!speckleVisited[idx] && rgba[idx * 4 + 3] > 0) {
        const patch = [];
        const q = [x, y];
        speckleVisited[idx] = 1;
        let qh = 0;
        while (qh < q.length) {
          const cx = q[qh++], cy = q[qh++];
          patch.push(cy * w + cx);
          const neighbors = [[cx-1, cy], [cx+1, cy], [cx, cy-1], [cx, cy+1]];
          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const nidx = ny * w + nx;
              if (!speckleVisited[nidx] && rgba[nidx * 4 + 3] > 0) {
                speckleVisited[nidx] = 1;
                q.push(nx, ny);
              }
            }
          }
        }
        if (patch.length < 100) {
          console.log(`Clearing tiny isolated speckle (${patch.length} px) at (${x}, ${y})`);
          for (const p of patch) {
            rgba[p * 4 + 3] = 0;
          }
        }
      }
    }
  }

  // 5. Trim transparent margins
  const rawPng = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
  const trimmed = await sharp(rawPng).trim().toBuffer({ resolveWithObject: true });
  const trimW = trimmed.info.width;
  const trimH = trimmed.info.height;
  console.log(`Trimmed character bounds: ${trimW}x${trimH}`);

  // 6. Scale to standard 256x256 proportions
  let scale = 1.0;
  if (trimW > targetMaxW) scale = targetMaxW / trimW;
  if (trimH * scale > targetMaxH) scale = targetMaxH / trimH;

  const newW = Math.round(trimW * scale);
  const newH = Math.round(trimH * scale);

  const resized = await sharp(trimmed.data)
    .resize(newW, newH, { kernel: sharp.kernel.lanczos3 })
    .toBuffer();

  const topPad = Math.max(0, 256 - newH - bottomPad);
  const leftPad = Math.max(0, Math.round((256 - newW) / 2));

  // 7. Composite onto transparent 256x256 canvas
  const finalCanvas = await sharp({
    create: {
      width: 256,
      height: 256,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([{
    input: resized,
    top: topPad,
    left: leftPad
  }]);

  const webpBuffer = await finalCanvas.webp({ lossless: true }).toBuffer();
  fs.writeFileSync(outputPath, webpBuffer);
  console.log(`Saved lossless WebP to: ${outputPath} (${newW}x${newH} inside 256x256, topPad: ${topPad}, leftPad: ${leftPad})`);

  if (previewPath) {
    const pngBuffer = await sharp(webpBuffer).png().toBuffer();
    fs.writeFileSync(previewPath, pngBuffer);
    console.log(`Saved PNG preview to: ${previewPath}`);
  }

  return { width: newW, height: newH, topPad, leftPad };
}

async function runUbTrio() {
  // 1. Pheromosa (0795)
  await processTrioItem({
    inputPath: 'C:/Users/khs20/.gemini/antigravity/brain/45252a11-e070-4b63-be4e-0a5242bba71c/.user_uploaded/media_1792579045450_9e3c5724.jpg',
    outputPath: path.join(__dirname, '..', 'public', 'img', 'pokemon', '0795.webp'),
    previewPath: path.join(__dirname, '..', 'public', 'img', 'pokemon', 'test_0795_ai.png'),
    targetMaxW: 220,
    targetMaxH: 216,
    bottomPad: 2,
    minBgBrightness: 220,
    maxBgDiff: 10,
    holeSeeds: []
  });

  // 2. Nihilego (0793)
  await processTrioItem({
    inputPath: 'C:/Users/khs20/.gemini/antigravity/brain/45252a11-e070-4b63-be4e-0a5242bba71c/.user_uploaded/media_1792579045487_4c847a00.jpg',
    outputPath: path.join(__dirname, '..', 'public', 'img', 'pokemon', '0793.webp'),
    previewPath: path.join(__dirname, '..', 'public', 'img', 'pokemon', 'test_0793_ai.png'),
    targetMaxW: 220,
    targetMaxH: 210,
    bottomPad: 6,
    minBgBrightness: 195,
    maxBgDiff: 10,
    holeSeeds: []
  });

  // 3. Celesteela (0797)
  await processTrioItem({
    inputPath: 'C:/Users/khs20/.gemini/antigravity/brain/45252a11-e070-4b63-be4e-0a5242bba71c/.user_uploaded/media_1792579045647_014f1a7f.jpg',
    outputPath: path.join(__dirname, '..', 'public', 'img', 'pokemon', '0797.webp'),
    previewPath: path.join(__dirname, '..', 'public', 'img', 'pokemon', 'test_0797_ai.png'),
    targetMaxW: 236,
    targetMaxH: 210,
    bottomPad: 4,
    minBgBrightness: 220,
    maxBgDiff: 10,
    holeSeeds: []
  });
}

runUbTrio().then(() => {
  console.log('\nAll 3 Ultra Beasts processed successfully!');
});
