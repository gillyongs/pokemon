const fs = require('fs');

const txt = fs.readFileSync('src/npc/ai/easy.js', 'utf8');

// Find calculateSkillScore
const calcStart = txt.indexOf('const calculateSkillScore = (bt, sn, skObj, isAttack) => {');
// The function ends before findBestSkill
const calcEnd = txt.indexOf('//  켱 -> ߷ ->  Ͽ   \r\nconst findBestSkill');
const calcEndFallback = txt.indexOf('//  켱 -> ߷ ->  Ͽ   \nconst findBestSkill');
const actualCalcEnd = calcEnd !== -1 ? calcEnd : (calcEndFallback !== -1 ? calcEndFallback : txt.indexOf('const findBestSkill'));

const calculateSkillScoreFunc = txt.substring(calcStart, actualCalcEnd);

// Find remainPokemonCount
const remainStart = txt.indexOf('function remainPokemonCount(battle, user) {');
const remainFunc = txt.substring(remainStart);

// Remove them from easy.js
let newTxt = txt.substring(0, calcStart) + txt.substring(actualCalcEnd, remainStart);

// We need to move statusAbleCheck to calculateSkillScore.js OR export it from easy.js and import it.
// Let's just keep statusAbleCheck in easy.js and export it.
if (newTxt.includes('function statusAbleCheck(status, pokemon) {')) {
  newTxt = newTxt.replace('function statusAbleCheck(status, pokemon) {', 'export function statusAbleCheck(status, pokemon) {');
}

// Add import for calculateSkillScore in easy.js
const importStatement = `import { calculateSkillScore } from "./calculateSkillScore";\n`;
const lastImportIdx = newTxt.lastIndexOf('import ');
const nextLineAfterImport = newTxt.indexOf('\n', lastImportIdx) + 1;
newTxt = newTxt.substring(0, nextLineAfterImport) + importStatement + newTxt.substring(nextLineAfterImport);

// Create calculateSkillScore.js
const calcFileContent = `import { aiItemScore } from "../../entity/Item";
import { damageCalculate } from "../../util/damageCalculate";
import { getAccuracy } from "../../function/accuracyCalculate";
import { statusAbleCheck } from "./easy";

export ${calculateSkillScoreFunc}

${remainFunc}
`;

fs.writeFileSync('src/npc/ai/calculateSkillScore.js', calcFileContent);
fs.writeFileSync('src/npc/ai/easy.js', newTxt);
console.log('Split completed!');
