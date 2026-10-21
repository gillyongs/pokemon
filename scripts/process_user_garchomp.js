const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputPath = 'C:/Users/khs20/.gemini/antigravity/brain/45252a11-e070-4b63-be4e-0a5242bba71c/.user_uploaded/media_1792578227118_8c0eb7dd.jpg';
const outputPath = path.join(__dirname, '..', 'public', 'img', 'pokemon', '0445-m.webp');
const previewPath = path.join(__dirname, '..', 'public', 'img', 'pokemon', 'test_0445-m_ai.png');

async function processUserGarchomp() {
  console.log('Processing user uploaded Mega Garchomp image...');
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  function isBgPixel(r, g, b) {
    const minC = Math.min(r, g, b);
    const maxC = Math.max(r, g, b);
    const diff = maxC - minC;
    return minC >= 180 && diff <= 16;
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
  console.log('Border background pixels:', queue.length / 2);

  // 2. Clear known genuine background holes:
  // - (670, 460): inside right arm/scythe
  // - (593, 759): between the legs
  // - (671, 648): tail loop upper
  // - (696, 727): tail loop lower
  const holeSeeds = [[670, 460], [593, 759], [671, 648], [696, 727]];
  let totalHolePixels = 0;

  for (const [sx, sy] of holeSeeds) {
    const sidx = sy * w + sx;
    if (!isBg[sidx] && isBgPixel(data[sidx * 3], data[sidx * 3 + 1], data[sidx * 3 + 2])) {
      const hQueue = [sx, sy];
      isBg[sidx] = 1;
      let hHead = 0;
      while (hHead < hQueue.length) {
        const hx = hQueue[hHead++];
        const hy = hQueue[hHead++];
        totalHolePixels++;
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
      console.log(`Cleared background hole at (${sx}, ${sy}) -> ${hQueue.length / 2} px`);
    }
  }
  console.log('Total interior background hole pixels cleared:', totalHolePixels);

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

  // 4. Remove isolated small speckles (e.g. bottom-right watermark)
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
  const targetMaxW = 228;
  const targetMaxH = 220;
  let scale = 1.0;
  if (trimW > targetMaxW) scale = targetMaxW / trimW;
  if (trimH * scale > targetMaxH) scale = targetMaxH / trimH;

  const newW = Math.round(trimW * scale);
  const newH = Math.round(trimH * scale);

  const resized = await sharp(trimmed.data)
    .resize(newW, newH, { kernel: sharp.kernel.lanczos3 })
    .toBuffer();

  const bottomPad = 2;
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

  const pngBuffer = await sharp(webpBuffer).png().toBuffer();
  fs.writeFileSync(previewPath, pngBuffer);
  console.log(`Saved PNG preview to: ${previewPath}`);

  return { width: newW, height: newH, topPad, leftPad };
}

processUserGarchomp().then(res => {
  console.log('Finished successfully:', res);
});
