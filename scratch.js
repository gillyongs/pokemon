const fs = require('fs');
let txt = fs.readFileSync('src/npc/ai/easy.js', 'utf8');

// 1. Remove getStatChangeScore entirely
const getStatChangeScoreRegex = /function getStatChangeScore\(skillEffect, npc, player, isNatk = false\) \{[\s\S]*?return \{ scoreDiff, logText \};\n\}\n\n/;
txt = txt.replace(getStatChangeScoreRegex, '');

// 2. Add calculateScoreCommon after calculateScoreNatk
// We'll find the end of calculateScoreNatk and insert it there.
const calculateScoreNatkEndRegex = /skObj\.log\.score = log;\n  return score;\n};\n/;
// Wait, we need to modify calculateScoreNatk to return { score, log } instead of score.
// Let's replace the ends of both functions.

const atkEndRegex = /  log \+= ` = \$\{score\}`;\n  skObj\.log\.score = log;\n  return score;\n\};/;
const natkEndRegex = /  log \+= ` = \$\{score\}`;\n  skObj\.log\.score = log;\n  return score;\n\};/;

txt = txt.replace(atkEndRegex, '  return { score, log };\n};');
txt = txt.replace(natkEndRegex, '  return { score, log };\n};');

// We also need to remove the "능력치증감" blocks from both Atk and Natk loops.
const atkStatRegex = /      if \(skillEffect\?\.name === "능력치증감"\) \{\n        const result = getStatChangeScore\(skillEffect, npc, player, false\);\n        score \+= result\.scoreDiff;\n        log \+= result\.logText;\n      \}\n/;
txt = txt.replace(atkStatRegex, '');

const natkStatRegex = /      if \(skillEffect\.name === "능력치증감" && !npc\.item\?\.startsWith\("구애"\)\) \{\n        const result = getStatChangeScore\(skillEffect, npc, player, true\);\n        ovoSum \+= result\.scoreDiff;\n      \}\n/;
txt = txt.replace(natkStatRegex, '');

// Remove ovoSum logic from Natk end
const ovoSumRegex = /  if \(ovoSum !== 0\) \{\n    score \+= ovoSum;\n    log \+= ` \+ \$\{ovoSum\} \(능력치 증감\)`;\n  \}\n\n/;
txt = txt.replace(ovoSumRegex, '');

// Remove feature logic from Atk and Natk
const featureAtkRegex = /  if \(skill\.feature\) \{\n    const f = skill\.feature;\n    if \(f\.sound && player\.tempStatus\.substitute !== null\) \{\n      score \+= 50;\n      log \+= ` \+ 50 \(소리 무시\)`;\n    \}\n    if \(f\.charge && npc\.item !== "파워풀허브"\) \{\n      score \/= 2;\n      log \+= ` \/2 \(충전\)`;\n    \}\n  \}\n\n/;
txt = txt.replace(featureAtkRegex, '');

const featureNatkRegex = /  if \(skill\.feature\) \{\n    const f = skill\.feature;\n    if \(f\.charge && npc\.item !== "파워풀허브"\) \{\n      score \/= 2;\n      log \+= ` \/2 \(충전\)`;\n    \}\n  \}\n\n/;
txt = txt.replace(featureNatkRegex, '');

// Add calculateScoreCommon
const calculateScoreCommonCode = `
const calculateScoreCommon = (bt, sn, skObj, score, log, isNatk) => {
  const npc = bt.npc;
  const player = bt.player;
  const skill = bt.npc.origin.skill[sn];
  let ovoSum = 0;

  if (skill.skillEffectList && typeof skill.skillEffectList[Symbol.iterator] === "function") {
    for (const skillEffect of skill.skillEffectList) {
      if (skillEffect.name === "능력치증감" && (!isNatk || !npc.item?.startsWith("구애"))) {
        const npcRole = npc.origin.role || "";
        const playerRole = player.origin.role || "";
        const iValue = npc.abil === "심술꾸러기" && skillEffect.target === "atk" ? -skillEffect.value : skillEffect.value;
        let value = 0;
        let scoreDiff = 0;
        let logText = "";

        if (skillEffect.target === "atk" && typeof iValue === "number" && iValue > 0) {
          if (skillEffect.abil === "speed") {
            value = npcRole.includes("어태커") ? 50 : 30;
          } else if (skillEffect.abil === "atk") {
            value = npcRole === "물리어태커" ? 30 : 3;
          } else if (skillEffect.abil === "catk") {
            value = npcRole === "특수어태커" ? 30 : 3;
          } else if (skillEffect.abil === "def") {
            value = playerRole === "물리어태커" ? (npcRole.includes("막이") ? 50 : 30) : 8;
          } else if (skillEffect.abil === "cdef") {
            value = playerRole === "특수어태커" ? (npcRole.includes("막이") ? 50 : 30) : 8;
          }

          if (!isNatk) {
            if (npc.tempStatus.rank[skillEffect.abil] < 1) {
              let plus = (value * iValue * skillEffect.probability) / 100;
              if (player.abil === "천진") plus = Math.floor(plus * 0.1);
              scoreDiff += plus;
              logText += \` + \${plus} (버프)\`;
            }
          } else {
            if (npc.tempStatus.rank[skillEffect.abil] < 3) {
              let actualValue = value;
              const isBodyPress = [1, 2, 3, 4].some((num) => npc.origin.skill[num]?.name === "바디프레스");
              if (skillEffect.abil === "def" && isBodyPress) actualValue = 50;

              const n = npc.tempStatus.rank[skillEffect.abil];
              actualValue = actualValue / (1 + 2 * n);
              let ovo = Math.floor(actualValue) * iValue;
              if (player.abil === "천진") ovo = Math.floor(ovo * 0.1);
              scoreDiff += ovo;
            }
          }
        } else if (skillEffect.target === "atk" && typeof iValue === "number" && iValue < 0) {
          if (skillEffect.abil === "speed") {
            value = npcRole.includes("어태커") ? 40 : 5;
          } else if (skillEffect.abil === "atk") {
            value = npcRole === "물리어태커" ? 20 : 1;
          } else if (skillEffect.abil === "catk") {
            value = npcRole === "특수어태커" ? 20 : 1;
          } else if (skillEffect.abil === "def") {
            value = playerRole === "물리어태커" ? 10 : 5;
          } else if (skillEffect.abil === "cdef") {
            value = playerRole === "특수어태커" ? 10 : 5;
          }

          if (!isNatk) {
            let plus = (-1 * value * iValue * skillEffect.probability) / 100;
            if (player.abil === "천진") plus = Math.floor(plus * 0.1);
            scoreDiff -= plus;
            logText += \` - \${plus} (디버프)\`;
          } else {
            let ovo = value * iValue;
            if (player.abil === "천진") ovo = Math.trunc(ovo * 0.1);
            scoreDiff += ovo;
          }
        } else if (skillEffect.target === "def" && typeof iValue === "number" && iValue < 0) {
          value = 10;
          if (skillEffect.abil === "speed") {
            value = playerRole.includes("어태커") ? 50 : 25;
          } else if (skillEffect.abil === "atk") {
            value = playerRole === "물리어태커" ? 35 : 5;
          } else if (skillEffect.abil === "catk") {
            value = playerRole === "특수어태커" ? 35 : 5;
          } else if (skillEffect.abil === "def") {
            value = npcRole === "물리어태커" ? 15 : 5;
          } else if (skillEffect.abil === "cdef") {
            value = npcRole === "특수어태커" ? 15 : 5;
          }

          if (!isNatk) {
            if (player.tempStatus.rank[skillEffect.abil] > -1) {
              let plus = (-1 * value * iValue * skillEffect.probability) / 100;
              scoreDiff += plus;
              logText += \` + \${plus} (상대디버프)\`;
            }
          } else {
            if (player.tempStatus.rank[skillEffect.abil] > -1) {
              let ovo = -1 * value * iValue;
              scoreDiff += ovo;
            }
          }
        }

        if (isNatk) {
          ovoSum += scoreDiff;
        } else {
          score += scoreDiff;
          log += logText;
        }
      }
    }
  }

  if (isNatk && ovoSum !== 0) {
    score += ovoSum;
    log += \` + \${ovoSum} (능력치 증감)\`;
  }

  if (skill.feature) {
    const f = skill.feature;
    if (f.sound && player.tempStatus.substitute !== null) {
      score += 50;
      log += \` + 50 (소리 무시)\`;
    }
    if (f.charge && npc.item !== "파워풀허브") {
      score /= 2;
      log += \` /2 (충전)\`;
    }
  }

  return { score, log };
};
`;

txt += '\n' + calculateScoreCommonCode;

// Finally, update createSkObj
const createSkObjRegex = /  if \(isAttack\(skill\.stype\)\) \{\n    bt\.turn\.atkSN = sn;\n    skObj\.minDmg = damageCalculate\(bt, null, \{ atkSN: sn, randNum: 85 \}\);\n    skObj\.maxDmg = damageCalculate\(bt, null, \{ atkSN: sn, randNum: 100 \}\);\n    let score = calculateScoreAtk\(bt, sn, skObj\);\n    skObj\.score = Math\.floor\(score\);\n  \} else \{\n    let score = calculateScoreNatk\(bt, sn, skObj\);\n    skObj\.score = Math\.floor\(score\);\n  \}/;

const createSkObjNew = `  let score, log;
  if (isAttack(skill.stype)) {
    bt.turn.atkSN = sn;
    skObj.minDmg = damageCalculate(bt, null, { atkSN: sn, randNum: 85 });
    skObj.maxDmg = damageCalculate(bt, null, { atkSN: sn, randNum: 100 });
    const result = calculateScoreAtk(bt, sn, skObj);
    score = result.score;
    log = result.log;
    const commonResult = calculateScoreCommon(bt, sn, skObj, score, log, false);
    score = commonResult.score;
    log = commonResult.log;
  } else {
    const result = calculateScoreNatk(bt, sn, skObj);
    score = result.score;
    log = result.log;
    const commonResult = calculateScoreCommon(bt, sn, skObj, score, log, true);
    score = commonResult.score;
    log = commonResult.log;
  }

  log += \` = \${Math.floor(score)}\`;
  skObj.log.score = log;
  skObj.score = Math.floor(score);`;

txt = txt.replace(createSkObjRegex, createSkObjNew);

fs.writeFileSync('src/npc/ai/easy.js', txt);
console.log('Done refactoring');
