const sharp = require('sharp');

async function inspect(filePath, name) {
  const { data, info } = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
  console.log(name, w, h);
  const samples = [
    [0, 0], [w-1, 0], [0, h-1], [w-1, h-1],
    [Math.floor(w/2), 0], [Math.floor(w/2), h-1], [0, Math.floor(h/2)], [w-1, Math.floor(h/2)]
  ];
  samples.forEach(([x, y]) => {
    const idx = (y * w + x) * 3;
    console.log(`  (${x}, ${y}): RGB(${data[idx]}, ${data[idx+1]}, ${data[idx+2]})`);
  });
}

(async () => {
  await inspect('C:/Users/khs20/.gemini/antigravity/brain/45252a11-e070-4b63-be4e-0a5242bba71c/.user_uploaded/media_1792579045450_9e3c5724.jpg', '0795 Pheromosa');
  await inspect('C:/Users/khs20/.gemini/antigravity/brain/45252a11-e070-4b63-be4e-0a5242bba71c/.user_uploaded/media_1792579045487_4c847a00.jpg', '0793 Nihilego');
  await inspect('C:/Users/khs20/.gemini/antigravity/brain/45252a11-e070-4b63-be4e-0a5242bba71c/.user_uploaded/media_1792579045647_014f1a7f.jpg', '0797 Celesteela');
})();
