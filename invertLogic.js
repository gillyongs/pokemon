const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.js');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // First replace the implementation in ailment.js
  if (file.includes('ailment.js')) {
    content = content.replace(/export const pokemonNoStatusCheck = \(pokemon\) => \{\s*const status = pokemon\.status;\s*\/\/[^\n]*\s*return Object\.values\(status\)\.every\(\(v\) => v === null\);\s*\};/g, 
      "export const isAilmentCheck = (pokemon) => {\n" +
      "  const status = pokemon.status;\n" +
      "  // 상태이상이 하나라도 걸려있으면 true 반환\n" +
      "  return Object.values(status).some((v) => v !== null);\n" +
      "};");
  }

  // Usages:
  content = content.replace(/!pokemonNoStatusCheck\(([^)]+)\)/g, 'isAilmentCheck($1)');
  content = content.replace(/pokemonNoStatusCheck\(([^)]+)\)/g, '!isAilmentCheck($1)');
  
  // Imports & exports
  content = content.replace(/\bpokemonNoStatusCheck\b/g, 'isAilmentCheck');

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
  }
}
