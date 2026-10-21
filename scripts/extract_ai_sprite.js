const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imgPath = 'C:\\Users\\khs20\\.gemini\\antigravity\\brain\\45252a11-e070-4b63-be4e-0a5242bba71c\\mega_charizard_x_sprite_1792573732421.jpg';
const outPath = path.join(__dirname, '..', 'public', 'img', 'pokemon', 'test_0006-x_ai.png');

async function processCleanCutout() {
  const { data, info } = await sharp(imgPath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  const rgba = Buffer.alloc(w * h * 4);

  for (let i = 0; i < w * h; i++) {
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];

    rgba[i * 4] = r;
    rgba[i * 4 + 1] = g;
    rgba[i * 4 + 2] = b;

    // Minimum channel brightness for white detection
    const minC = Math.min(r, g, b);

    if (minC >= 248) {
      // Pure background white (outer & all inner holes)
      rgba[i * 4 + 3] = 0;
    } else if (minC >= 235) {
      // Smooth anti-aliased edge
      const alphaFactor = (248 - minC) / (248 - 235);
      rgba[i * 4 + 3] = Math.round(alphaFactor * 255);
    } else {
      rgba[i * 4 + 3] = 255;
    }
  }

  // Trim transparent padding to get exact character bounds
  const rawPng = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
  const trimmed = await sharp(rawPng).trim().toBuffer({ resolveWithObject: true });
  console.log('Clean trimmed dimensions:', trimmed.info.width, trimmed.info.height);

  // Resize to standard ~230w x ~180-190h
  let scale = 1.0;
  if (trimmed.info.width > 230) scale = 230 / trimmed.info.width;
  if (trimmed.info.height * scale > 190) scale = 190 / trimmed.info.height;

  const newW = Math.round(trimmed.info.width * scale);
  const newH = Math.round(trimmed.info.height * scale);

  const resized = await sharp(trimmed.data)
    .resize(newW, newH, { kernel: sharp.kernel.lanczos3 })
    .toBuffer();

  const bottomPad = 2;
  const topPad = Math.max(0, 256 - newH - bottomPad);
  const leftPad = Math.max(0, Math.round((256 - newW) / 2));

  const final256 = await sharp({
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
  }])
  .webp({ lossless: true })
  .toBuffer();

  // Also replace 0006-x.webp directly so the user sees it in-game and in test!
  fs.writeFileSync(outPath, final256);
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'img', 'pokemon', '0006-x.webp'), final256);
  console.log('Saved to test_0006-x_ai.png and updated public/img/pokemon/0006-x.webp!');
}

processCleanCutout();
