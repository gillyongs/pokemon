const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Cleanly cut out an AI-generated sprite on solid white/light background,
 * removing both outer background and trapped interior background regions (between wings, limbs, etc.).
 * 
 * @param {string} inputPath - path to generated JPG/PNG
 * @param {string} outputPath - path to output 256x256 WEBP
 * @param {object} options - custom scaling or padding options
 */
async function processAiSprite(inputPath, outputPath, options = {}) {
  const {
    targetMaxW = 230,
    targetMaxH = 195,
    bottomPad = 2,
    whiteThreshold = 246,
    edgeFadeThreshold = 232,
    previewPngPath = null
  } = options;

  console.log(`Processing sprite from: ${inputPath}`);
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const channels = info.channels;

  // 1. Mark near-white pixels
  // minC is min(R, G, B)
  const isWhite = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];
    if (Math.min(r, g, b) >= whiteThreshold) {
      isWhite[i] = 2; // pure white background
    } else if (Math.min(r, g, b) >= edgeFadeThreshold) {
      isWhite[i] = 1; // edge transition
    } else {
      isWhite[i] = 0; // solid foreground
    }
  }

  // 2. Flood fill from borders to identify guaranteed outer background
  const isBackground = new Uint8Array(w * h);
  const queue = [];

  function enqueue(x, y) {
    const idx = y * w + x;
    if (isBackground[idx] === 0 && isWhite[idx] > 0) {
      isBackground[idx] = 1;
      queue.push(x, y);
    }
  }

  // Seed borders
  for (let x = 0; x < w; x++) {
    enqueue(x, 0);
    enqueue(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    enqueue(0, y);
    enqueue(w - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];

    const neighbors = [
      [cx - 1, cy], [cx + 1, cy],
      [cx, cy - 1], [cx, cy + 1]
    ];
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const nidx = ny * w + nx;
        if (isBackground[nidx] === 0 && isWhite[nidx] > 0) {
          isBackground[nidx] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }

  // 3. Find trapped interior white regions (connected components of isWhite > 0 that didn't touch borders)
  // Background holes in sprites: large open areas encircled by limbs/wings/tail (e.g. > 600 px in 1024x1024).
  // Small enclosed white shapes (< 500 px) are character anatomy: teeth, eye sclera, claws/toenails, which MUST be kept!
  const minHoleSize = options.minHoleSize || 600;
  const visitedHoles = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (isBackground[idx] === 0 && isWhite[idx] === 2 && visitedHoles[idx] === 0) {
        // Enclosed white patch
        const patch = [];
        const hQueue = [x, y];
        visitedHoles[idx] = 1;
        let hHead = 0;

        while (hHead < hQueue.length) {
          const hx = hQueue[hHead++];
          const hy = hQueue[hHead++];
          patch.push([hx, hy]);

          const hNeighbors = [
            [hx - 1, hy], [hx + 1, hy],
            [hx, hy - 1], [hx, hy + 1]
          ];
          for (const [nhx, nhy] of hNeighbors) {
            if (nhx >= 0 && nhx < w && nhy >= 0 && nhy < h) {
              const nhidx = nhy * w + nhx;
              if (isBackground[nhidx] === 0 && isWhite[nhidx] > 0 && visitedHoles[nhidx] === 0) {
                visitedHoles[nhidx] = 1;
                hQueue.push(nhx, nhy);
              }
            }
          }
        }

        if (patch.length >= minHoleSize) {
          console.log(`[Background Hole] Enclosed gap of ${patch.length} pixels at (${x}, ${y}) -> clearing as background hole`);
          for (const [px, py] of patch) {
            isBackground[py * w + px] = 1;
          }
        } else {
          console.log(`[Character Detail] Preserving enclosed white shape (${patch.length} px) at (${x}, ${y}) (e.g. claw/tooth/eye)`);
        }
      }
    }
  }

  // 4. Build RGBA buffer with smooth anti-aliased edge
  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];
    const minC = Math.min(r, g, b);

    rgba[i * 4] = r;
    rgba[i * 4 + 1] = g;
    rgba[i * 4 + 2] = b;

    if (isBackground[i]) {
      if (minC >= whiteThreshold) {
        rgba[i * 4 + 3] = 0;
      } else if (minC >= edgeFadeThreshold) {
        const factor = (whiteThreshold - minC) / (whiteThreshold - edgeFadeThreshold);
        rgba[i * 4 + 3] = Math.round(factor * 255);
      } else {
        rgba[i * 4 + 3] = 255;
      }
    } else {
      rgba[i * 4 + 3] = 255;
    }
  }

  // 5. Trim transparent margins
  const rawPng = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
  const trimmed = await sharp(rawPng).trim().toBuffer({ resolveWithObject: true });
  const trimW = trimmed.info.width;
  const trimH = trimmed.info.height;
  console.log(`Trimmed dimensions: ${trimW}x${trimH}`);

  // 6. Scale character
  let scale = 1.0;
  if (trimW > targetMaxW) scale = targetMaxW / trimW;
  if (trimH * scale > targetMaxH) scale = targetMaxH / trimH;

  const newW = Math.max(1, Math.round(trimW * scale));
  const newH = Math.max(1, Math.round(trimH * scale));

  const resized = await sharp(trimmed.data)
    .resize(newW, newH, { kernel: sharp.kernel.lanczos3 })
    .toBuffer();

  const topPad = Math.max(0, 256 - newH - bottomPad);
  const leftPad = Math.max(0, Math.round((256 - newW) / 2));

  // 7. Composite onto 256x256 transparent canvas
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
  console.log(`Saved output to ${outputPath} (${newW}x${newH} inside 256x256, topPad: ${topPad}, leftPad: ${leftPad})`);

  if (previewPngPath) {
    const pngBuffer = await sharp(webpBuffer).png().toBuffer();
    fs.writeFileSync(previewPngPath, pngBuffer);
    console.log(`Saved preview PNG to ${previewPngPath}`);
  }

  return { width: newW, height: newH, topPad, leftPad };
}

module.exports = { processAiSprite };
