const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputPath = 'C:/Users/khs20/.gemini/antigravity/brain/45252a11-e070-4b63-be4e-0a5242bba71c/.user_uploaded/media_1792576314713_70bc9527.jpg';
const outputPath = path.join(__dirname, '..', 'public', 'img', 'pokemon', '0303-m.webp');
const previewPath = path.join(__dirname, '..', 'public', 'img', 'pokemon', 'test_0303-m_ai.png');

async function processUserMawile() {
  console.log('Processing user uploaded Mega Mawile image...');
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  function getExpectedBg(x, y) {
    const isWhiteCell = ((Math.floor(x / 32) + Math.floor(y / 32)) % 2 === 0);
    return isWhiteCell ? 253 : 211;
  }

  function getBgDiff(x, y) {
    const idx = (y * w + x) * 3;
    const exp = getExpectedBg(x, y);
    return Math.max(Math.abs(data[idx] - exp), Math.abs(data[idx+1] - exp), Math.abs(data[idx+2] - exp));
  }

  // 1. Flood fill from borders to identify outer background
  const isBg = new Uint8Array(w * h);
  const queue = [];

  function tryEnqueue(x, y) {
    const idx = y * w + x;
    if (!isBg[idx] && getBgDiff(x, y) <= 22) {
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
        if (!isBg[nidx] && getBgDiff(nx, ny) <= 22) {
          isBg[nidx] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }

  // 2. Clear known trapped background hole at [646, 715] (between skirt, arm, and ponytail)
  const holeQueue = [646, 715];
  isBg[715 * w + 646] = 1;
  let hHead = 0;
  while (hHead < holeQueue.length) {
    const hx = holeQueue[hHead++];
    const hy = holeQueue[hHead++];
    const neighbors = [[hx-1, hy], [hx+1, hy], [hx, hy-1], [hx, hy+1]];
    for (const [nhx, nhy] of neighbors) {
      if (nhx >= 0 && nhx < w && nhy >= 0 && nhy < h) {
        const nidx = nhy * w + nhx;
        if (!isBg[nidx] && getBgDiff(nhx, nhy) <= 22) {
          isBg[nidx] = 1;
          holeQueue.push(nhx, nhy);
        }
      }
    }
  }

  // Also clear crevice trapped hole at (609, 365)
  if (!isBg[365 * w + 609] && getBgDiff(609, 365) <= 22) {
    const creviceQ = [609, 365];
    isBg[365 * w + 609] = 1;
    let cHead = 0;
    while (cHead < creviceQ.length) {
      const cx = creviceQ[cHead++];
      const cy = creviceQ[cHead++];
      const neighbors = [[cx-1, cy], [cx+1, cy], [cx, cy-1], [cx, cy+1]];
      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          const nidx = ny * w + nx;
          if (!isBg[nidx] && getBgDiff(nx, ny) <= 22) {
            isBg[nidx] = 1;
            creviceQ.push(nx, ny);
          }
        }
      }
    }
  }

  // 3. Create initial RGBA buffer
  const rgba = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 3;
      const outIdx = (y * w + x) * 4;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      rgba[outIdx] = r;
      rgba[outIdx+1] = g;
      rgba[outIdx+2] = b;

      if (isBg[y * w + x]) {
        rgba[outIdx+3] = 0;
      } else {
        // Anti-aliasing on edge adjacent to background
        let hasBgNeighbor = false;
        const neighbors = [[x-1, y], [x+1, y], [x, y-1], [x, y+1]];
        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < w && ny >= 0 && ny < h && isBg[ny * w + nx]) {
            hasBgNeighbor = true;
            break;
          }
        }

        if (hasBgNeighbor) {
          const diff = getBgDiff(x, y);
          if (diff < 50) {
            rgba[outIdx+3] = Math.round((diff / 50) * 255);
            // Defringe: pull edge color closer to dark outline [24, 25, 30]
            const alphaRatio = rgba[outIdx+3] / 255;
            rgba[outIdx] = Math.round(r * alphaRatio + 24 * (1 - alphaRatio));
            rgba[outIdx+1] = Math.round(g * alphaRatio + 25 * (1 - alphaRatio));
            rgba[outIdx+2] = Math.round(b * alphaRatio + 30 * (1 - alphaRatio));
          } else {
            rgba[outIdx+3] = 255;
          }
        } else {
          rgba[outIdx+3] = 255;
        }
      }
    }
  }

  // 4. Remove small disconnected speckles (e.g. watermark in bottom right x > 940, y > 940)
  const visited = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (!visited[idx] && rgba[idx * 4 + 3] > 0) {
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
              if (!visited[nidx] && rgba[nidx * 4 + 3] > 0) {
                visited[nidx] = 1;
                q.push(nx, ny);
              }
            }
          }
        }
        // If isolated speckle < 100 px, clear it
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
  console.log(`Trimmed dimensions: ${trimW}x${trimH}`);

  // 6. Scale character to standard 256x256 proportions
  const targetMaxW = 224;
  const targetMaxH = 202;
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

processUserMawile().then(res => {
  console.log('Finished successfully:', res);
});
