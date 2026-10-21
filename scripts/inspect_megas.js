const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function inspectMegas() {
  const content = fs.readFileSync('src/entity/Pokemon/PokemonData.js', 'utf8');
  const regex = /new\s+Pokemon\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']/g;
  const matches = [...content.matchAll(regex)];

  // All mega pokemon in PokemonData
  const megas = matches
    .filter((m) => m[2].includes('-m') || m[2].includes('-x') || m[2].includes('-y') || m[2].includes('-z'))
    .map((m) => ({ id: m[2], name: m[3] }));

  console.log(`Found ${megas.length} Mega Pokemon in PokemonData:\n`);

  for (const mega of megas) {
    const p = path.join('public', 'img', 'pokemon', `${mega.id}.webp`);
    if (!fs.existsSync(p)) {
      console.log(`[Missing] ${mega.id} ${mega.name}`);
      continue;
    }

    const buf = fs.readFileSync(p);
    const meta = await sharp(buf).metadata();
    const trimmed = await sharp(buf).trim().toBuffer({ resolveWithObject: true });

    const tw = trimmed.info.width;
    const th = trimmed.info.height;

    // Compare with base pokemon
    const baseId = mega.id.split('-')[0];
    const baseP = path.join('public', 'img', 'pokemon', `${baseId}.webp`);
    let baseDim = 'N/A';
    if (fs.existsSync(baseP)) {
      const baseBuf = fs.readFileSync(baseP);
      const baseTrimmed = await sharp(baseBuf).trim().toBuffer({ resolveWithObject: true });
      baseDim = `${baseTrimmed.info.width}x${baseTrimmed.info.height}`;
    }

    console.log(
      `[${mega.id}] ${mega.name}: ${tw}x${th} (canvas ${meta.width}x${meta.height}) | Base (${baseId}): ${baseDim}`
    );
  }
}

inspectMegas();
