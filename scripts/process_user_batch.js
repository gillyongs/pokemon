const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Robust cutout for user-uploaded 2D sprites with checkerboard background.
 */
async function processCheckerboardSprite(config) {
  const {
    inputPath,
    outputPath,
    previewPath,
    targetMaxW = 230,
    targetMaxH = 210,
    bottomPad = 2,
    minBgBrightness = 200,
    maxBgDiff = 16,
    minHoleSize = 70
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

  // 2. Find enclosed background holes
  const visited = new Uint8Array(w * h);
  let clearedHoles = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (!isBg[idx] && isBgPixel(data[idx * 3], data[idx * 3 + 1], data[idx * 3 + 2]) && !visited[idx]) {
        const patch = [];
        const q = [x, y];
        visited[idx] = 1;
        let qh = 0;
        while (qh < q.length) {
          const cx = q[qh++], cy = q[qh++];
          patch.push(cy * w + cx);
          const neighbors = [[cx-1, cy], [cx+1, cy], [cx, cy-1], [cx, cy+1]];
          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const nidx = ny * w + nx;
              if (!isBg[nidx] && isBgPixel(data[nidx * 3], data[nidx * 3 + 1], data[nidx * 3 + 2]) && !visited[nidx]) {
                visited[nidx] = 1;
                q.push(nx, ny);
              }
            }
          }
        }
        if (patch.length >= minHoleSize) {
          clearedHoles++;
          console.log(`[Background Hole] Clearing trapped hole of ${patch.length} px at (${x}, ${y})`);
          for (const p of patch) {
            isBg[p] = 1;
          }
        } else {
          console.log(`[Character Detail] Preserving internal shape (${patch.length} px) at (${x}, ${y}) (e.g. tooth/eye)`);
        }
      }
    }
  }
  console.log(`Total trapped background holes cleared: ${clearedHoles}`);

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

  // 4. Remove tiny isolated speckles (< 100 px, such as watermark)
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

async function runBatch() {
  // 1. Process Mega Skarmory (0227-m)
  await processCheckerboardSprite({
    inputPath: 'C:/Users/khs20/.gemini/antigravity/brain/45252a11-e070-4b63-be4e-0a5242bba71c/.user_uploaded/media_1792577607000_73526525.jpg',
    outputPath: path.join(__dirname, '..', 'public', 'img', 'pokemon', '0227-m.webp'),
    previewPath: path.join(__dirname, '..', 'public', 'img', 'pokemon', 'test_0227-m_ai.png'),
    targetMaxW: 226,
    targetMaxH: 220,
    bottomPad: 2,
    minBgBrightness: 215,
    maxBgDiff: 14,
    minHoleSize: 60
  });

  // 2. Process Mega Salamence (0373-m)
  await processCheckerboardSprite({
    inputPath: 'C:/Users/khs20/.gemini/antigravity/brain/45252a11-e070-4b63-be4e-0a5242bba71c/.user_uploaded/media_1792577629704_23b89f02.jpg',
    outputPath: path.join(__dirname, '..', 'public', 'img', 'pokemon', '0373-m.webp'),
    previewPath: path.join(__dirname, '..', 'public', 'img', 'pokemon', 'test_0373-m_ai.png'),
    targetMaxW: 232,
    targetMaxH: 212,
    bottomPad: 2,
    minBgBrightness: 205,
    maxBgDiff: 15,
    minHoleSize: 80
  });
}

runBatch().then(() => {
  console.log('\nAll batch sprites processed successfully!');
});
