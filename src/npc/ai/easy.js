import { aiItemScore } from "../../entity/Item";
import { pokemonNoStatusCheck } from "../../function/statusCondition";
import { damageCalculate } from "../../util/damageCalculate";
import { priCalculate } from "../../util/speedCheck";
import { typeCheck } from "../../util/typeEffectCalculate";
import { cloneWithMethods } from "../../util/cloneWithMethods";
import { getAccuracy } from "../../function/accuracyCalculate";

export function npcAiEasy(choices, battle) {
  // 상대 HP
  const hp = battle.player.hp;

  // 배틀 객체 복사 및 세팅
  const base = cloneWithMethods(battle);
  base.turn.atk = "npc";
  base.turn.def = "player";

  // 기술 객체 생성
  // 각 기술의 최소, 최대 데미지, 가중치 계산하여 지니고있는다
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
  console.log("AI 가중치 계산");
  console.log(skObj);

  // 상대를 쓰러뜨릴 수 있는 기술이 있으면 이를 사용한다
  let result;
  result = getKillableSkill(skObj, hp, base);
  if (result) return result;

  // 그 외엔 가중치가 가장 높은 기술을 사용한다
  result = getHighestScoreKey(skObj);
  return result;
}

// =====================================================================

// 스킬 객체 생성 함수
// 해당 스킬 사용시 적에게 입히는 최소데미지, 최대데미지, 가중치 값을 지니고있는다
function createSkObj(baseBattle, sn, hp) {
  const bt = cloneWithMethods(baseBattle);
  const skill = bt.npc.origin.skill[sn];

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

  let score = 0;
  if (isAttack(skill.stype)) {
    bt.turn.atkSN = sn;
    skObj.minDmg = damageCalculate(bt, null, { atkSN: sn, randNum: 85 });
    skObj.maxDmg = damageCalculate(bt, null, { atkSN: sn, randNum: 100 });
    score = calculateScoreAtk(bt, sn, skObj);
    if (score !== 0) {
      // 무효 스킬, 옹골참에 일격기, 타오르는 불꽃
      // 애초에 공격 판정이 안들어가니 부가효과 계산을 하면 안됨
      skObj.score = Math.floor(calculateScoreCommon(bt, sn, skObj, score));
    }
  } else {
    score = calculateScoreNatk(bt, sn, skObj);
    skObj.score = Math.floor(calculateScoreCommon(bt, sn, skObj, score));
  }

  return skObj;
}

const calculateScoreAtk = (bt, sn, skObj) => {
  const npc = bt.npc;
  const player = bt.player;
  const skill = bt.npc.origin.skill[sn];
  const hp = bt.player.origin.hp;

  let avrDmg = damageCalculate(bt, null, { atkSN: sn, randNum: 92 });
  if (avrDmg === 0) {
    skObj.log.score = "불발";
    return 0;
  }

  let accurRaw = getAccuracy(skill, npc);
  let accur = accurRaw === "-" ? 100 : Number(accurRaw) || 0;
  if (accur !== 100 && accurRaw !== "-") accur = Math.min(100, accur);

  let score = Math.floor((avrDmg * accur) / hp); // 평균 데미지 * 명중률 / 상대방 체력

  let log = score;
  skObj.log.scoreOrigin = `${avrDmg} * ${accur} / ${hp} = ${score}`;

  if (skill.skillEffectList && typeof skill.skillEffectList[Symbol.iterator] === "function") {
    for (const skillEffect of skill.skillEffectList) {
      if (skillEffect.name === "화상" && player.origin.role === "물리어태커" && pokemonNoStatusCheck(player) && statusTypeCheck("화상", player)) {
        //상대가 물리형일때 화상 보정
        let plus = (50 * skillEffect.probability) / 100;
        score += plus;
        log += ` + ${plus} (${skillEffect.name})`;
      }
      if ((skillEffect.name === "마비" || skillEffect.name === "얼음" || skillEffect.name === "트라이어택") && pokemonNoStatusCheck(player) && statusTypeCheck(skillEffect.name, player)) {
        let plus = (50 * skillEffect.probability) / 100;
        score += plus;
        log += ` + ${plus} (${skillEffect.name})`;
      }
      if (skillEffect.name === "혼란" && player.tempStatus.confuse === null) {
        let plus = (20 * skillEffect.probability) / 100;
        score += plus;
        log += ` + ${plus} (${skillEffect.name})`;
      }
      if (skillEffect.name === "풀죽음") {
        let plus = (50 * skillEffect.probability) / 100;
        score += plus;
        log += ` + ${plus} (${skillEffect.name})`;
      }
      if (skillEffect.name === "급소") {
        score *= 1.04;
        log += ` * 1.04 (급소보정)`;
      }
      if (skillEffect.name === "탁떨" && player.item !== null) {
        const value = aiItemScore[player.item];
        if (value === 0) {
        } else if (!value) {
          console.error("탁떨 가중치 설정 안 됨 " + skillEffect.name);
        } else {
          score += value;
          log += ` + ${value} (${skillEffect.name})`;
        }
      }
      if (skillEffect.name === "반동" || skillEffect.name === "빗나감패널티") {
        score -= 10;
        log += ` - 10 (${skillEffect.name})`;
      }
      if (skillEffect.name === "흡수") {
        const plus = Math.floor(20 * skillEffect.ratio);
        score += plus;
        log += ` + ${plus} (${skillEffect.name})`;
      }
      if (skillEffect.name === "자동") {
        score -= 20;
        log += ` - 20 (${skillEffect.name})`;
      }
      if (skillEffect.name === "화상치료" && player.status.burn !== null) {
        score -= 10;
        log += ` - 10 (${skillEffect.name})`;
      }
      if ((skillEffect.name === "벽부수기" && bt.field.player.noClean.reflect !== null) || bt.field.player.noClean.lightScreen !== null) {
        score += 50;
        log += ` + 50 (${skillEffect.name})`;
      }
      if (skillEffect.name === "스핀") {
        const count = Object.values(bt.field.npc).reduce((acc, v) => {
          if (v === null) return acc; // null이면 무시
          if (typeof v === "number") return acc + v; // 숫자면 그대로 더함 (독압정 1 맹독압정 2)
          return acc + 1; // 그 외 (문자열, 객체 등) → 1 추가
        }, 0);

        //아군 필드에 깔린 장판 (스텔스록, 압정, 독압정, 가시)
        const value = count * 30;
        score += value;
        log += ` + ${value} (${skillEffect.name})`;
      }
      if (skillEffect.name === "능력치초기화") {
        const count = Object.values(bt.player.tempStatus.rank).reduce((acc, v) => {
          if (typeof v === "number") return acc + v;
          return acc;
        }, 0);
        if (count > 0) {
          const value = count * 20;
          score += value;
          log += ` + ${value} (${skillEffect.name})`;
        }
      }
      if (skillEffect.name === "구속" && player.tempStatus.switchLock !== null) {
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
  const player = bt.player;
  const skill = bt.npc.origin.skill[sn];
  let score = 0;
  let log = "0";
  let ovoSum = 0;

  if (skill.skillEffectList && typeof skill.skillEffectList[Symbol.iterator] === "function") {
    for (const skillEffect of skill.skillEffectList) {
      if (skillEffect.name === "스텔스록") {
        if (bt.field.player.sRock === null) {
          let value = 25 * remainPokemonCount(bt, "player"); // 남은 상대방 포켓몬 수에 비례
          score += value;
          log += ` + ${value} (${skillEffect.name})`;
        }
      }
      if (skillEffect.name === "독압정") {
        if (bt.field.player.poisonSpikes === null) {
          let value = 20 * remainPokemonCount(bt, "player");
          score += value;
          log += ` + ${value} (${skillEffect.name})`;
        } else if (bt.field.player.poisonSpikes === 1) {
          let value = 15 * remainPokemonCount(bt, "player");
          score += value;
          log += ` + ${value} (맹독압정)`;
        }
      }
      if (skillEffect.name === "끈적끈적네트") {
        if (bt.field.player.stickyWeb === null) {
          let value = 20 * remainPokemonCount(bt, "player");
          score += value;
          log += ` + ${value} (${skillEffect.name})`;
        }
      }
      if (skillEffect.name === "리플렉터") {
        if (bt.field.npc.noClean.reflect === null) {
          let origin = player.origin.role === "물리어태커" ? 20 : 15; // 상대가 물리면 리플렉터를 먼저 치게
          let value = origin * (remainPokemonCount(bt, "npc") + 1);
          score += value;
          log += ` + ${value} (${skillEffect.name})`;
        }
      }
      if (skillEffect.name === "빛의장막") {
        if (bt.field.npc.noClean.lightScreen === null) {
          let origin = player.origin.role === "특수어태커" ? 20 : 15;
          let value = origin * (remainPokemonCount(bt, "npc") + 1);
          score += value;
          log += ` + ${value} (${skillEffect.name})`;
        }
      }
      if (skillEffect.name === "씨뿌리기") {
        if (player.tempStatus.seed === null && player.type1 !== "풀" && player.type2 !== "풀") {
          score += 20;
          log += ` + 20 (${skillEffect.name})`;
        }
      }

      const playerRankCount = Object.values(bt.player.tempStatus.rank).reduce((acc, v) => {
        if (typeof v === "number") return acc + v;
        return acc;
      }, 0);
      if (skillEffect.name === "하품") {
        if (player.tempStatus.hapum === null && pokemonNoStatusCheck(player)) {
          let value = 0;
          if (playerRankCount > 0) {
            value = playerRankCount * 30;
            // 랭크업이 많이 되어있을수록 교체 압박이 심해지므로 가산점
            score += value;
            log += ` + ${value} (${skillEffect.name}-랭크)`;
          } else if (playerRankCount < 0) {
            value = playerRankCount * -20;
            score -= value;
            log += ` - ${value} (${skillEffect.name}-랭크)`;
          }
          if (bt.field.player.sRock) {
            score += 25;
            log += ` + 25 (${skillEffect.name}-스락)`;
          }
          if (bt.field.player.stickyWeb) {
            score += 20;
            log += ` + 20 (${skillEffect.name}-끈적끈적네트)`;
          }
        }
      }
      if (skillEffect.name === "강제교체") {
        if (remainPokemonCount(bt, "player") > 0) {
          // 남은 포켓몬이 없다면 실패하므로 제외
          let value = 0;
          if (playerRankCount > 0) {
            value = playerRankCount * 40;
            score += value;
            log += ` + ${value} (${skillEffect.name}-랭크)`;
          } else if (playerRankCount < 0) {
            value = playerRankCount * -20;
            score -= value;
            log += ` - ${value} (${skillEffect.name}-랭크)`;
          }
          if (bt.field.player.sRock) {
            score += 25;
            log += ` + 25 (${skillEffect.name}-스락)`;
          }
          if (bt.field.player.spikes) {
            score += 20;
            log += ` + 20 (${skillEffect.name}-압정)`;
          }
          if (bt.field.player.poisonSpikes) {
            score += 10;
            log += ` + 10 (${skillEffect.name}-독압정)`;
          }
          if (bt.field.player.stickyWeb) {
            score += 20;
            log += ` + 20 (${skillEffect.name}-끈적네트)`;
          }
        }
      }
      if (skillEffect.name === "초승달춤" || skillEffect.name === "치유소원") {
        const hp = npc.hp;
        const maxHp = npc.origin.hp;
        const hpPercent = hp / maxHp; // 0~1 사이 값
        let value = 230 * Math.pow(1 - hpPercent, 2.3);
        // const a = 60; // 곡선 크기 계수
        // const b = 3.5; // 곡선 완만도 (클수록 저체력에서 급상승)
        // const value = Math.round(a * Math.pow(1 / hpPercent - 1, b));
        value = Math.round(value);
        score += value;
        log += ` + ${value} (${skillEffect.name})`;
      }
      if (skillEffect.name === "트릭") {
        let value = 0;
        if (npc.item?.startsWith("구애") && !player.item?.startsWith("구애")) {
          value = 50;
        }
        if (score) {
          score += value;
          log += ` + ${value} (${skillEffect.name})`;
        }
      }
      if (skillEffect.name === "마비" && pokemonNoStatusCheck(player) && statusTypeCheck(skillEffect.name, player)) {
        let value = (50 * skillEffect.probability) / 100;
        if (skill.name === "전기자석파" && (player.type1 === "땅" || player.type2 === "땅")) {
        } else {
          const hasPsychoCut = ["1", "2", "3", "4"].some((key) => npc.origin.skill[key]?.name === "병상첨병");
          if (hasPsychoCut) value *= 1.3;

          score += value;
          let text = ` + ${value} (${skillEffect.name})`;
          if (hasPsychoCut) text += "(병상첨병)";
          log += text;
        }
      }
      if (skillEffect.name === "화상" && player.origin.role === "물리어태커" && pokemonNoStatusCheck(player) && statusTypeCheck(skillEffect.name, player)) {
        let value = (50 * skillEffect.probability) / 100;

        score += value;
        log += ` + ${value} (${skillEffect.name})`;
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

const calculateScoreCommon = (bt, sn, skObj, score) => {
  const npc = bt.npc;
  const player = bt.player;
  const skill = bt.npc.origin.skill[sn];

  let result = score;
  let logText = "";

  if (skill.skillEffectList && typeof skill.skillEffectList[Symbol.iterator] === "function") {
    for (const skillEffect of skill.skillEffectList) {
      if (skillEffect?.name === "능력치증감") {
        const npcRole = npc.origin.role || "";
        const playerRole = player.origin.role || "";

        let iValue = skillEffect.value;
        if ((npc.abil === "심술꾸러기" && skillEffect.target === "atk") || (player.abil === "심술꾸러기" && skillEffect.target === "def")) {
          iValue = -skillEffect.value;
        }

        let value = 0;

        // 1. 자기자신에게 이로운 효과
        if (skillEffect.target === "atk" && typeof iValue === "number" && iValue > 0) {
          // 이미 랭크업이 되어있으면 제외
          if (npc.tempStatus.rank[skillEffect.abil] < 2) {
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

            // 바디프레스 스킬이 있으면 방어력 증가에 추가 보정
            const isBodyPress = [1, 2, 3, 4].some((num) => npc.origin.skill[num]?.name === "바디프레스");
            if (skillEffect.abil === "def" && isBodyPress) {
              value += 15;
            }
          }

          let plus = (value * iValue * skillEffect.probability) / 100; // 화률과 수치 적용
          if (player.abil === "천진") plus = Math.floor(plus * 0.1);
          result += plus;
          logText += ` + ${plus} (${skillEffect.abil} 자벞)`;
        }

        // 2. 자기자신에게 해로운 효과
        else if (skillEffect.target === "atk" && typeof iValue === "number" && iValue < 0) {
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

          let plus = (-1 * value * iValue * skillEffect.probability) / 100;
          if (player.abil === "천진") plus = Math.floor(plus * 0.1);
          result -= plus;
          logText += ` - ${plus} (${skillEffect.abil} 자기디버프)`;
        }

        // 3. 상대방에게 해로운 효과
        else if (skillEffect.target === "def" && typeof iValue === "number" && iValue < 0) {
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

          let plus = (-1 * value * iValue * skillEffect.probability) / 100;
          result += plus;
          logText += ` + ${plus} (${skillEffect.abil} 상대디버프)`;
        }

        // 4. 상대에게 이로운 효과를 주는 경우
        // 뽐내기, 부추기기 추가시 추가 필요

        return result;
      }
    }
  }

  skObj.log.score += logText;
  return score;
};

// 기술의 우선도 -> 명중률 -> 데미지를 고려하여 최적의 기술 리턴
const findBestSkill = (candidates, bt) => {
  if (candidates.length === 0) return null;

  // 우선도 체크
  let maxPrior = -Infinity;
  let topPriorSkills = [];
  for (const s of candidates) {
    const pri = priCalculate(bt, "npc", s.sk) || 0;

    if (pri > maxPrior) {
      maxPrior = pri;
      topPriorSkills = [s];
    } else if (pri === maxPrior) {
      topPriorSkills.push(s);
    }
  }

  // 우선도가 가장 높은 기술이 하나면 이를 리턴
  if (topPriorSkills.length === 1) return topPriorSkills[0];

  // 우선도가 같은 기술이 여러개면 명중률이 제일 높은 기술을 리턴
  const getAccur = (s) => {
    let accRaw = getAccuracy(s.sk, bt.npc);
    if (accRaw === "-") return 9999;
    return Math.min(100, Number(accRaw) || 0);
  };

  const maxAccur = Math.max(...topPriorSkills.map(getAccur));

  const topAccurSkills = topPriorSkills.filter((s) => getAccur(s) === maxAccur);

  if (topAccurSkills.length === 1) return topAccurSkills[0];

  // 명중률 마저 같다면 데미지가 더 높은 기술을 사용
  const maxMinDmg = Math.max(...topAccurSkills.map((s) => s.minDmg || 0));
  return topAccurSkills.find((s) => (s.minDmg || 0) === maxMinDmg) || null;
};

//상대를 쓰러뜨릴 수 있는 기술을 필터링
export function getKillableSkill(skObj, hp, bt) {
  // 1. 상대를 확정으로 쓰러뜨릴 수 있는 기술 (minDmg >= hp)
  const minCandidates = [1, 2, 3, 4].map((num) => skObj[num]).filter((s) => s && s.minDmg >= hp);

  // 2. 그중에서 우선도 ->  명중률 -> 데미지 높은 순으로 선택
  let bestSkill = findBestSkill(minCandidates, bt);

  // 3. 상대를 쓰러뜨릴 수 있는 스킬 필터링 (maxDmg)
  if (!bestSkill) {
    const maxCandidates = [1, 2, 3, 4].map((num) => skObj[num]).filter((s) => s && s.maxDmg >= hp);
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
    if (score !== 0 && score > maxScore) {
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
    if (pokemon.abil === "수포") {
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
  if (bt.field.npc.stickyWeb) {
    if (benchPokemon.type1 !== "비행" && benchPokemon.type2 !== "비행" && benchPokemon.item !== "풍선" && benchPokemon.abil !== "부유") {
      score -= 20;
      log[indexA] += ` - 20 (교체-끈적끈적네트)`;
    }
  }
  const playerSkills = [1, 2, 3, 4].map((num) => bt.player.origin.skill[num]);
  for (const sk of playerSkills) {
    const list = sk?.skillEffectList;
    if (list && typeof list[Symbol.iterator] === "function") {
      for (const skillEffect of list) {
        if (skillEffect?.name === "강제교체") {
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
  let t1Value = typeCheck(player.type1, pokemon.type1, pokemon.type2);
  if (t1Value === 0) t1Value = 0.1;

  if (player.type2) {
    let t2Value = typeCheck(player.type2, pokemon.type1, pokemon.type2);
    if (t2Value === 0) t2Value = 0.1;
    result = Math.max(t1Value, t2Value);
  } else {
    result = t1Value;
  }

  let sk = player.tempStatus.recentSkillUse;
  if (sk && (sk.stype === "atk" || sk.stype === "catk")) {
    if (sk.type !== player.type1 && sk.type !== player.type2) {
      value = typeCheck(sk.type, pokemon.type1, pokemon.type2);
      if (value === 0) value = 0.1;
      result = Math.max(result, value);
    }
  }

  let score = Math.floor((pokemon.origin.hp * pokemon.origin.stat[defStat]) / result / 1000);
  log[index] = `${pokemon.origin.hp} * ${pokemon.origin.stat[defStat]} / ${result} / 1000 = ${score}`;
  return score;
}

function remainPokemonCount(battle, user) {
  // 남은 포켓몬 수 계산
  // 남은 포켓몬 수가 많을수록 스텔스록, 독압정 등에 가중치가 증가한다
  // 상대의 남은 포켓몬이 하나일때 날려버리기(강제교체)를 쓰지 않는다 (실패하니까)
  let result = 0;
  let index1 = user + "Bench1";
  let index2 = user + "Bench2";
  if (!battle[index1].faint) result += 1;
  if (!battle[index2].faint) result += 1;
  return result;
}
