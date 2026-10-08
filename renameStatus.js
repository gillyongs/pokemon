const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.js');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace exact .status property accesses
  content = content.replace(/([a-zA-Z0-9_\]])\.status\b/g, '$1.ailment');
  
  // Replace resetStatus with resetAilment
  content = content.replace(/\bresetStatus\b/g, 'resetAilment');

  // Specific to ailment.js:
  if (file.includes('ailment.js')) {
    content = content.replace(/const status = pokemon\.ailment;/g, 'const ailmentObj = pokemon.ailment;');
    content = content.replace(/Object\.values\(status\)/g, 'Object.values(ailmentObj)');
    
    // function ailmentAbleCheck(battle, status, pokemon)
    content = content.replace(/ailmentAbleCheck\(battle, status, pokemon\)/g, 'ailmentAbleCheck(battle, ailment, pokemon)');
    content = content.replace(/const isBurn = status ===/g, 'const isBurn = ailment ===');
    content = content.replace(/const isMabi = status ===/g, 'const isMabi = ailment ===');
    content = content.replace(/const isFreeze = status ===/g, 'const isFreeze = ailment ===');
    content = content.replace(/const isPoison = status ===/g, 'const isPoison = ailment ===');
    content = content.replace(/const isSleep = status ===/g, 'const isSleep = ailment ===');
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
  }
}
