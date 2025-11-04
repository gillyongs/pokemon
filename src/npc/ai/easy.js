import { aiItemScore } from "../../entity/Item";
import { pokemonNoStatusCheck } from "../../function/statusCondition";
import { damageCalculate } from "../../util/damageCalculate";
import { priCalculate } from "../../util/speedCheck";
import { typeCheck } from "../../util/typeCheck";
import { cloneWithMethods } from "../../util/cloneWithMethods";

export function npcAiEasy(choices, battle) {
  // 상대 HP
  const hp = battle.player.hp;

  // 배틀 객체 복사 및 세팅
  const base = cloneWithMethods(battle);
  base.turn.atk = "npc";
  base.turn.def = "player";

  // 1~4 스킬 객체 자동 생성
  const skMap = {};
  for (let i = 1; i <= 4; i++) {
    skMap[i] = createSkObj(base, i, hp);
  }
  for (let i = 1; i <= 2; i++) {
    skMap["npcBench" + i] = createPkObj(base, i, hp);
  }

  // choices 중 스킬 번호만 추출하여 객체화
  const skObj = {};
  choices.forEach((c) => {
    if (skMap[c]) skObj[c] = skMap[c];
  });
  console.log("skObj");
  console.log(skObj);

  let result;
  result = getKillableSkill(skObj, hp, base);
  if (result) return result;

  result = getHighestScoreKey(skObj);
  return result;
}

// =====================================================================

// 공통 스킬 정보 생성 함수
function createSkObj(baseBattle, sn, hp) {
  const bt = baseBattle;
  const skill = bt.npc.origin[`sk${sn}`];

  const skObj = {
    name: skill.name,
    score: 0,
    sk: skill,
    number: sn,
    minDmg: 0,
    maxDmg: 0,
    log: {
      score: null,
    },
  };

  const isAttack = (stype) => {
    return ["atk", "catk"].includes(stype);
  };

  if (isAttack(skill.stype)) {
    bt.turn.atkSN = sn;
    skObj.minDmg = damageCalculate(bt, null, { atkSN: sn, randNum: 85 });
    skObj.maxDmg = damageCalculate(bt, null, { atkSN: sn, randNum: 100 });
    let score = calculateScore(bt, sn, skObj);
    skObj.score = Math.floor(score);
  } else {
    let score = calculateScoreNatk(bt, sn, skObj);
    skObj.score = Math.floor(score);
  }

  return skObj;
}

const calculateScore = (bt, sn, skObj) => {
  const npc = bt.npc;
  const player = bt.player;
  const stat = bt.player.origin.stat;
  const playerAtkType = stat.atk > stat.catk ? "atk" : "catk"; // 상대가 물리형인지 특수형인지
  const skill = npc.origin[`sk${sn}`];
  const hp = bt.player.origin.hp;

  let avrDmg = damageCalculate(bt, null, { atkSN: sn, randNum: 92 });
  if (avrDmg === 0) return 0;

  const accur = skill.accur === "-" ? 100 : skill.accur;

  let score = Math.floor((avrDmg * accur) / hp); // 평균 데미지 * 명중률 / 상대망 체력

  let log = score;
  skObj.log.scoreOirign = `${avrDmg} * ${accur} / ${hp}`;
  if (skill.skillEffectList && typeof skill.skillEffectList[Symbol.iterator] === "function") {
    for (const item of skill.skillEffectList) {
      if (item?.name === "능력치증감") {
        const iValue = npc.abil === "심술꾸러기" && item.target === "atk" ? -item.value : item.value;
        // 심술꾸러기는 자신에게 적용되는 랭크변화를 반대로 적용

        if (item.target === "atk" && typeof iValue === "number" && iValue > 0 && player.abil !== "천진") {
          // 자기자신에게 이로운 효과
          if (npc.tempStatus.rank[item.abil] < 1) {
            // 이미 랭크업이 되어있으면 예외
            let value = item.abil === "speed" ? 50 : item.abil === "atk" || item.abil === "catk" ? 30 : 15;
            // 스피드 > 공격, 특공 > 방어, 특방 가중치 부여
            let plus = (value * iValue * item.probability) / 100;
            // 오르는 랭크 수와 오를 확률 적용
            score += plus;
            log += ` + ${plus} (버프)`;
          }
        }
        if (item.target === "atk" && typeof iValue === "number" && iValue < 0 && player.abil !== "천진") {
          // 자기자신에게 해로운 효과
          let value = item.abil === "atk" || item.abil === "catk" ? 20 : 5;
          // 공격, 특공 > 방어, 특방, 스피드 가중치 부여
          let plus = (-1 * value * iValue * item.probability) / 100;
          // 오르는 랭크 수와 오를 확률 적용
          score -= plus;
          log += ` - ${plus} (디버프)`;
        }
        if (item.target === "def" && typeof iValue === "number" && iValue < 0) {
          // 상대방에게 해로운 효과
          if (player.tempStatus.rank[item.abil] > -1) {
            // 이미 랭크다운이 되어있으면 예외
            let value = item.abil === "speed" ? 30 : 20;
            // 스피드 가중치 부여
            let plus = (-1 * value * iValue * item.probability) / 100;
            score += plus;
            log += ` + ${plus} (상대디버프)`;
          }
        }
      }
      if (item.name === "화상" && playerAtkType === "atk" && pokemonNoStatusCheck(player) && statusTypeCheck(item.name, player)) {
        //상대가 물리형일때 화상 보정
        let plus = (50 * item.probability) / 100;
        score += plus;
        log += ` + ${plus} (${item.name})`;
      }
      if ((item.name === "마비" || item.name === "얼음" || item.name === "트라이어택") && pokemonNoStatusCheck(player) && statusTypeCheck(item.name, player)) {
        let plus = (50 * item.probability) / 100;
        score += plus;
        log += ` + ${plus} (${item.name})`;
      }
      if (item.name === "혼란" && player.tempStatus.confuse === null) {
        let plus = (20 * item.probability) / 100;
        score += plus;
        log += ` + ${plus} (${item.name})`;
      }
      if (item.name === "풀죽음") {
        let plus = (100 * item.probability) / 100;
        score += plus;
        log += ` + ${plus} (${item.name})`;
      }
      if (item.name === "급소") {
        score *= 1.04;
        log += ` * 1.04 (급소보정)`;
      }
      if (item.name === "탁떨" && player.item !== null) {
        const value = aiItemScore[player.item];
        if (value === 0) {
        } else if (!value) {
          console.error("탁떨 가중치 설정 안 됨 " + item.name);
        } else {
          score += value;
          log += ` + ${value} (${item.name})`;
        }
      }
      if (item.name === "반동" || item.name === "빗나감패널티") {
        score -= 10;
        log += ` - 10 (${item.name})`;
      }
      if (item.name === "흡수" || item.name === "빗나감패널티") {
        score += 15;
        log += ` + 15 (${item.name})`;
      }
      if (item.name === "자동") {
        score -= 20;
        log += ` - 20 (${item.name})`;
      }
      if ((item.name === "벽부수기" && bt.field.noClean.player.reflect !== null) || bt.field.noClean.player.lightScreen !== null) {
        score += 50;
        log += ` + 50 (${item.name})`;
      }
      if (item.name === "스핀") {
        const count = Object.values(bt.field.npc).reduce((acc, v) => {
          if (v === null) return acc; // null이면 무시
          if (typeof v === "number") return acc + v; // 숫자면 그대로 더함 (독압정 1 맹독압정 2)
          return acc + 1; // 그 외 (문자열, 객체 등) → 1 추가
        }, 0);

        //아군 필드에 깔린 장판 (스텔스록, 압정, 독압정, 가시)
        const value = count * 30;
        score += value;
        log += ` + ${value} (${item.name})`;
      }
      if (item.name === "능력치초기화") {
        const count = Object.values(bt.player.tempStatus.rank).reduce((acc, v) => {
          if (typeof v === "number") return acc + v;
        }, 0);
        if (count > 0) {
          const value = count * 20;
          score += value;
          log += ` + ${value} (${item.name})`;
        }
      }
      if (item.name === "구속" && player.tempStatus.switchLock !== null) {
        score += 30;
        log += ` + 30 (구속)`;
      }
    }
  }
  if (skill.feature) {
    const f = skill.feature;
    if (f.sound && player.tempStatus.substitute !== null) {
      score += 50;
      log += ` + 50 (대타 소리 기술 보정)`;
    }
    if (f.charge && npc.item !== "파워풀허브") {
      score /= 2;
      log += ` /2 (충전)`;
    }
  }

  log += ` = ${score}`;
  skObj.log.score = log;
  return score;
};

const calculateScoreNatk = (bt, sn, skObj) => {
  const npc = bt.npc;
  const npcRank = npc.tempStatus.rank;
  const player = bt.player;
  const skill = npc.origin[`sk${sn}`];
  const hp = bt.player.origin.hp;
  let score = 0;
  let log = "0";
  let ovoSum = 0;

  const playerAtkType = player.origin.stat.atk > player.origin.stat.catk ? "atk" : "catk"; // 상대가 물리형인지 특수형인지
  if (skill.skillEffectList && typeof skill.skillEffectList[Symbol.iterator] === "function") {
    for (const item of skill.skillEffectList) {
      if (item.name === "능력치증감" && npcRank[item.abil] < 4 && item.target === "atk" && player.abil !== "천진" && !npc.item?.startsWith("구애")) {
        let value = item.abil === "speed" ? 70 : item.abil === "atk" || item.abil === "catk" ? 50 : 20;
        if (item.abil === "def" && playerAtkType === "atk") value *= 2;
        if (item.abil === "cdef" && playerAtkType === "catk") value *= 2;
        if (item.value < 0) {
          ovoSum += value * item.value;
        } else {
          const bodyPress = npc.origin.sk1.name === "바디프레스" || npc.origin.sk2.name === "바디프레스" || npc.origin.sk3.name === "바디프레스" || npc.origin.sk4.name === "바디프레스";
          if (item.abil === "def" && bodyPress) value = 70;
          if (item.abil === "def" && playerAtkType === "atk") value *= 2;
          if (item.abil === "cdef" && playerAtkType === "catk") value *= 2;
          const n = npcRank[item.abil];
          value = value / (1 + 2 * n);
          let ovo = Math.floor(value) * item.value;
          ovoSum += ovo;
        }
      }
      if (item.name === "스텔스록") {
        if (bt.field.player.sRock === null) {
          let value = 25 * getReaminPokemon(bt, "player");
          score += value;
          log += ` + ${value} (${item.name})`;
        }
      }
      if (item.name === "독압정") {
        if (bt.field.player.poisonSpikes === null) {
          let value = 20 * getReaminPokemon(bt, "player");
          score += value;
          log += ` + ${value} (${item.name})`;
        } else if (bt.field.player.poisonSpikes === 1) {
          let value = 15 * getReaminPokemon(bt, "player");
          score += value;
          log += ` + ${value} (맹독압정)`;
        }
      }
      if (item.name === "리플렉터") {
        if (bt.field.noClean.npc.reflect === null) {
          let origin = playerAtkType === "atk" ? 20 : 15; // 상대가 물리면 리플렉터를 먼저 치게
          let value = origin * (getReaminPokemon(bt, "npc") + 1);
          score += value;
          log += ` + ${value} (${item.name})`;
        }
      }
      if (item.name === "빛의장막") {
        if (bt.field.noClean.npc.lightScreen === null) {
          let origin = playerAtkType === "catk" ? 20 : 15;
          let value = origin * (getReaminPokemon(bt, "npc") + 1);
          score += value;
          log += ` + ${value} (${item.name})`;
        }
      }
      if (item.name === "씨뿌리기") {
        if (player.tempStatus.seed === null && player.type1 !== "풀" && player.type2 !== "풀") {
          score += 20;
          log += ` + 20 (${item.name})`;
        }
      }
      const playerRankCount = Object.values(bt.player.tempStatus.rank).reduce((acc, v) => {
        if (typeof v === "number") return acc + v;
      }, 0);
      if (item.name === "하품") {
        if (player.tempStatus.hapum === null && pokemonNoStatusCheck(player)) {
          let value = 0;
          if (playerRankCount > 0) {
            value = playerRankCount * 30;
            // 랭크업이 많이 되어있을수록 교체 압박이 심해지므로 가산점
            score += value;
            log += ` + ${value} (${item.name}-랭크)`;
          } else if (playerRankCount < 0) {
            value = playerRankCount * -20;
            score -= value;
            log += ` - ${value} (${item.name}-랭크)`;
          }
          if (bt.field.player.sRock) {
            score += 25;
            log += ` + 25 (${item.name}-스락)`;
          }
        }
      }
      if (item.name === "강제교체") {
        if (getReaminPokemon(bt, "player") > 0) {
          // 남은 포켓몬이 없다면 실패하므로 제외
          let value = 0;
          if (playerRankCount > 0) {
            value = playerRankCount * 40;
            score += value;
            log += ` + ${value} (${item.name}-랭크)`;
          } else if (playerRankCount < 0) {
            value = playerRankCount * -20;
            score -= value;
            log += ` - ${value} (${item.name}-랭크)`;
          }
          if (bt.field.player.sRock) {
            score += 25;
            log += ` + 25 (${item.name}-스락)`;
          }
          if (bt.field.player.spikes) {
            score += 20;
            log += ` + 20 (${item.name}-압정)`;
          }
          if (bt.field.player.poisonSpikes) {
            score += 10;
            log += ` + 10 (${item.name}-독압정)`;
          }
        }
      }
      if (item.name === "초승달춤" || item.name === "치유소원") {
        const hp = npc.hp;
        const maxHp = npc.origin.hp;
        const hpPercent = hp / maxHp; // 0~1 사이 값
        let value = 230 * Math.pow(1 - hpPercent, 2.3);
        // const a = 60; // 곡선 크기 계수
        // const b = 3.5; // 곡선 완만도 (클수록 저체력에서 급상승)
        // const value = Math.round(a * Math.pow(1 / hpPercent - 1, b));
        value = Math.round(value);
        score += value;
        log += ` + ${value} (${item.name})`;
      }
      if (item.name === "트릭") {
        let value = 0;
        if (npc.item?.startsWith("구애") && !player.item?.startsWith("구애")) {
          value = 50;
        }
        if (score) {
          score += value;
          log += ` + ${value} (${item.name})`;
        }
      }
      if (item.name === "마비" && pokemonNoStatusCheck(player) && statusTypeCheck(item.name, player)) {
        let value = (50 * item.probability) / 100;
        if (skill.name === "전기자석파" && (player.type1 === "땅" || player.type2 === "땅")) {
        } else {
          const hasPsychoCut = ["sk1", "sk2", "sk3", "sk4"].some((key) => npc.origin[key]?.name === "병상첨병");
          if (hasPsychoCut) value *= 1.3;

          score += value;
          let text = ` + ${value} (${item.name})`;
          if (hasPsychoCut) text += "(병상첨병)";
          log += text;
        }
      }
      if (item.name === "화상" && playerAtkType === "atk" && pokemonNoStatusCheck(player) && statusTypeCheck(item.name, player)) {
        let value = (50 * item.probability) / 100;

        score += value;
        log += ` + ${value} (${item.name})`;
      }
    }
  }

  if (ovoSum !== 0) {
    score += ovoSum;
    log += ` + ${ovoSum} (능력치 증감)`;
  }

  if (skill.feature) {
    const f = skill.feature;
    if (f.charge && npc.item !== "파워풀허브") {
      score /= 2;
      log += ` /2 (충전)`;
    }
  }

  log += ` = ${score}`;
  skObj.log.score = log;
  return score;
};

// 기술의 우선도 및 데미지 체크 함수
const findBestSkill = (candidates, bt) => {
  if (candidates.length === 0) return null;
  // 1. 우선도 체크
  let maxPrior = -Infinity; // 🔹 처음엔 음수 (또는 -1 등)
  let topPriorSkills = [];

  for (const s of candidates) {
    const pri = priCalculate(bt, "npc", s.sk) || 0;

    if (pri > maxPrior) {
      // 🔹 더 큰 값이면 새로 갱신
      maxPrior = pri;
      topPriorSkills = [s];
    } else if (pri === maxPrior) {
      // 🔹 같은 값이면 추가
      topPriorSkills.push(s);
    }
  }

  if (topPriorSkills.length === 1) return topPriorSkills[0];

  // 2. 명중률 체크
  const maxAccur = Math.max(
    ...candidates.map((s) => {
      const accur = s.sk.accur;
      return accur === "-" ? 9999 : Number(accur) || 0;
    })
  );

  const topAccurSkills = candidates.filter((s) => {
    const accur = s.sk.accur === "-" ? 9999 : Number(s.sk.accur) || 0;
    return accur === maxAccur;
  });

  if (topAccurSkills.length === 1) return topAccurSkills[0];

  // 3. 데미지 체크
  const maxMinDmg = Math.max(...topPriorSkills.map((s) => s.minDmg || 0));
  return topPriorSkills.find((s) => (s.minDmg || 0) === maxMinDmg) || null;
};

export function getKillableSkill(skObj, hp, bt) {
  // 1. 상대를 확정으로 쓰러뜨릴 수 있는 기술 필터링 (minDmg)
  const minCandidates = [1, 2, 3, 4].map((num) => skObj[num]).filter((s) => s && s.minDmg > hp);

  // 2. 그중에서 우선도 ->  명중률 -> 데미지 높은 순으로 선택
  let bestSkill = findBestSkill(minCandidates, bt);

  // 3. 상대를 쓰러뜨릴 수 있는 스킬 필터링 (maxDmg)
  if (!bestSkill) {
    const maxCandidates = [1, 2, 3, 4].map((num) => skObj[num]).filter((s) => s && s.maxDmg > hp);
    bestSkill = findBestSkill(maxCandidates, bt);
  }

  // 스킬 번호 리턴
  return bestSkill?.number ?? null;
}

export function getHighestScoreKey(skObj) {
  let bestKey = null;
  let maxScore = -Infinity;

  for (const [key, value] of Object.entries(skObj)) {
    const score = value?.score ?? 0; // score 없으면 0
    if (score > maxScore) {
      maxScore = score;
      bestKey = key;
    }
  }
  return bestKey;
}

function statusTypeCheck(status, pokemon) {
  let t1 = pokemon.type1;
  let t2 = pokemon.type2;
  if (status === "화상") {
    if (t1 === "불꽃" || t2 === "불꽃") {
      return false;
    }
  }
  if (status === "마비") {
    if (t1 === "전기" || t2 === "전기") {
      return false;
    }
  }
  if (status === "얼음") {
    if (t1 === "얼음" || t2 === "얼음") {
      return false;
    }
  }
  if (status === "독" || status === "맹독") {
    if (t1 === "독" || t2 === "독") {
      return false;
    }
    if (t1 === "강철" || t2 === "강철") {
      return false;
    }
  }
  return true;
}

function createPkObj(baseBattle, sn, hp) {
  const bt = baseBattle;
  const index = "npcBench" + sn;
  const pokemon = bt[index];

  const skObj = {
    name: pokemon.origin.name,
    score: 0,
    number: index,
    log: {
      score: null,
    },
  };
  let result = calculatePkScore(bt, sn, skObj);
  skObj.score = result.score;
  skObj.log = result;

  return skObj;
}

function calculatePkScore(bt, sn, skObj) {
  const index = "npcBench" + sn;
  const indexA = index + "+a";
  const log = {};
  const benchPokemon = bt[index];
  let benchScore = calculateTypeScore(bt, index, log);
  let npcScore = calculateTypeScore(bt, "npc", log);
  let score = benchScore - npcScore;
  log[indexA] = score;
  if (bt.field.npc.sRock) {
    score -= 25;
    log[indexA] += ` - 25 (교체-스락)`;
  }
  if (bt.field.npc.spikes) {
    score -= 20;
    log[indexA] += ` - 20 (교체-압정)`;
  }
  if (bt.field.npc.poisonSpikes) {
    if (benchPokemon.type1 === "독" || benchPokemon.type2 === "독") {
      score += 10;
      log[indexA] += ` + 10 (교체(독)-독압정)`;
    } else if (benchPokemon.type1 === "강철" || benchPokemon.type2 === "강철" || pokemonNoStatusCheck(benchPokemon)) {
    } else {
      score -= 10;
      log[indexA] += ` - 10 (교체-독압정)`;
    }
  }

  const playerSkills = [bt.player.origin.sk1, bt.player.origin.sk2, bt.player.origin.sk3, bt.player.origin.sk4];
  for (const sk of playerSkills) {
    const list = sk?.skillEffectList;
    if (list && typeof list[Symbol.iterator] === "function") {
      for (const item of list) {
        if (item?.name === "강제교체") {
          //상대에게 강제교체 기술이 존재하면 교체를 하지 않는다
          log[indexA] = "0 (강제교체)";
          score = 0;
        }
      }
    }
  }
  log[indexA] += ` = ${score}`;
  log.score = score;
  return log;
}

function calculateTypeScore(bt, index, log) {
  const pokemon = bt[index];
  const stat = bt.player.origin.stat;
  const playerAtkType = stat.atk > stat.catk ? "atk" : "catk"; // 상대가 물리형인지 특수형인지
  const defStat = playerAtkType === "atk" ? "def" : "cdef";
  // console.log(pokemon.origin.name);
  const player = bt.player;
  let result = 1;
  let value;
  value = typeCheck(player.type1, pokemon.type1, pokemon.type2);
  if (value === 0) value = 0.1;
  // console.log(`${player.type1} vs ${pokemon.type1} ${pokemon.type2} = ${value}`);
  result *= value;
  if (player.type2) {
    value = typeCheck(player.type2, pokemon.type1, pokemon.type2);
    if (value === 0) value = 0.1;
    // console.log(`${player.type2} vs ${pokemon.type1} ${pokemon.type2} = ${value}`);
    result *= value;
  }
  let sk = player.tempStatus.recentSkillUse;
  if (sk && (sk.stype === "atk" || sk.stype === "catk")) {
    if (sk.type !== player.type1 && sk.type !== player.type2) {
      value = typeCheck(sk.type, pokemon.type1, pokemon.type2);
      if (value === 0) value = 0.1;
      // console.log(`${sk.type} vs ${pokemon.type1} ${pokemon.type2} = ${value}`);
      result *= value;
    }
  }

  let score = Math.floor((pokemon.origin.hp * pokemon.origin.stat[defStat]) / result / 1000);
  log[index] = `${pokemon.origin.hp} * ${pokemon.origin.stat[defStat]} / ${result} / 1000 = ${score}`;
  return score;
}

function getReaminPokemon(battle, user) {
  let result = 0;
  let index1 = user + "Bench1";
  let index2 = user + "Bench1";
  if (!battle[index1].faint) result += 1;
  if (!battle[index2].faint) result += 1;
  return result;
}
