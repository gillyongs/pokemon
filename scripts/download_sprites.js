const fs = require('fs');
const path = require('path');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'img', 'pokemon');

async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          ...options.headers,
        },
        ...options,
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      return res;
    } catch (err) {
      if (i === retries - 1) throw err;
      await delay(1000 * (i + 1));
    }
  }
}

async function getPokedexList() {
  console.log('Fetching Pokédex list from pokemondb.net/pokedex/all...');
  const res = await fetchWithRetry('https://pokemondb.net/pokedex/all');
  const allHtml = await res.text();

  const trMatches = [...allHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  const pokemonMap = new Map();

  for (const tr of trMatches) {
    const row = tr[1];
    const numMatch = row.match(/<span class="infocard-cell-data">(\d+)<\/span>/);
    const linkMatch = row.match(/<a class="ent-name" href="(\/pokedex\/[^"]+)"[^>]*>([^<]+)<\/a>/);
    if (numMatch && linkMatch) {
      const numInt = parseInt(numMatch[1], 10);
      if (!pokemonMap.has(numInt)) {
        pokemonMap.set(numInt, {
          num: numInt,
          pad: String(numInt).padStart(4, '0'),
          name: linkMatch[2],
          href: linkMatch[1],
        });
      }
    }
  }

  return pokemonMap;
}

async function getSpriteUrlForPokemon(pokemon) {
  const pageUrl = `https://pokemondb.net${pokemon.href}`;
  const res = await fetchWithRetry(pageUrl);
  const html = await res.text();

  const start = html.lastIndexOf('dex-sprites');
  if (start === -1) {
    // Fallback directly to HOME sprite
    const slug = pokemon.href.replace('/pokedex/', '');
    return {
      url: `https://img.pokemondb.net/sprites/home/normal/${slug}.png`,
      source: 'HOME (no table)',
    };
  }

  const end = html.indexOf('</table>', start);
  const tableHtml = html.substring(start, end + 8);

  const headers = [...tableHtml.matchAll(/<th[^>]*>(.*?)<\/th>/gi)].map((m) => m[1].trim());
  const gen9Col = headers.findIndex((h) => h.includes('Generation 9'));

  const tbodyStart = tableHtml.indexOf('<tbody>');
  const tbodyEnd = tableHtml.indexOf('</tbody>');
  const tbody = tableHtml.substring(tbodyStart, tbodyEnd);
  const firstRowMatch = tbody.match(/<tr[^>]*>([\s\S]*?)<\/tr>/i);

  let spriteUrl = null;
  let source = '';

  if (firstRowMatch) {
    const cells = [...firstRowMatch[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((m) => m[1]);

    // Check Generation 9 column first
    if (gen9Col !== -1 && gen9Col < cells.length) {
      const gen9Cell = cells[gen9Col];
      const aMatch = gen9Cell.match(/href="([^"]+)"/i);
      const imgMatch = gen9Cell.match(/src="([^"]+)"/i);
      if (aMatch && !aMatch[1].includes('&mdash;')) {
        spriteUrl = aMatch[1];
        source = 'Generation 9';
      } else if (imgMatch) {
        spriteUrl = imgMatch[1];
        source = 'Generation 9';
      }
    }

    // Fallback: check other generations backwards (Gen 8, 7...)
    if (!spriteUrl) {
      for (let col = cells.length - 1; col >= 1; col--) {
        const cell = cells[col];
        const aMatch = cell.match(/href="([^"]+)"/i);
        const imgMatch = cell.match(/src="([^"]+)"/i);
        if (aMatch && aMatch[1].startsWith('http')) {
          spriteUrl = aMatch[1];
          source = headers[col] || `Col ${col}`;
          break;
        } else if (imgMatch && imgMatch[1].startsWith('http')) {
          spriteUrl = imgMatch[1];
          source = headers[col] || `Col ${col}`;
          break;
        }
      }
    }
  }

  if (!spriteUrl) {
    const slug = pokemon.href.replace('/pokedex/', '');
    spriteUrl = `https://img.pokemondb.net/sprites/home/normal/${slug}.png`;
    source = 'HOME fallback';
  }

  return { url: spriteUrl, source };
}

async function downloadSprite(url, outputPath) {
  const res = await fetchWithRetry(url);
  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));
}

async function main() {
  const args = process.argv.slice(2);
  const startNum = parseInt(args[0], 10) || 1;
  const endNum = parseInt(args[1], 10) || 10;

  console.log(`=== Pokédex Sprite Downloader ===`);
  console.log(`Range: #${startNum} to #${endNum}`);
  console.log(`Target directory: ${OUTPUT_DIR}\n`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const pokedexMap = await getPokedexList();
  console.log(`Loaded ${pokedexMap.size} unique Pokémon from Pokédex.\n`);

  const results = [];

  for (let num = startNum; num <= endNum; num++) {
    const pokemon = pokedexMap.get(num);
    if (!pokemon) {
      console.warn(`[Skip] Pokémon #${num} not found in Pokédex list.`);
      continue;
    }

    const filename = `${pokemon.pad}.webp`;
    const outputPath = path.join(OUTPUT_DIR, filename);

    try {
      process.stdout.write(`Fetching #${pokemon.pad} ${pokemon.name}... `);
      const { url, source } = await getSpriteUrlForPokemon(pokemon);
      process.stdout.write(`downloading from ${source} (${url})... `);
      await downloadSprite(url, outputPath);
      const size = fs.statSync(outputPath).size;
      console.log(`[DONE] saved ${filename} (${size} bytes)`);

      results.push({
        num: pokemon.pad,
        name: pokemon.name,
        filename,
        source,
        url,
        size,
      });
    } catch (err) {
      console.error(`[ERROR] #${pokemon.pad} ${pokemon.name}: ${err.message}`);
    }

    await delay(350); // Respectful rate limiting
  }

  console.log('\n=== Download Summary ===');
  console.table(results.map((r) => ({
    Number: r.num,
    Name: r.name,
    File: r.filename,
    Source: r.source,
    Size: `${r.size} B`,
  })));
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
