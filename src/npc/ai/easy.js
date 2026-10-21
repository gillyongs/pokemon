import { damageCalculate } from "../../util/damageCalculate";
import { priCalculate } from "../../util/speedCheck";
import { typeCheck } from "../../util/typeEffectCalculate";
import { cloneWithMethods } from "../../util/cloneWithMethods";
import { getAccuracy } from "../../function/accuracyCalculate";
import { calculateSkillScore } from "./calculateSkillScore";

export function npcAiEasy(choices, battle) {
  // 상대 HP
  const hp = battle.player.hp;

  // 배틀 객체 복사 및 세팅
  const base = cloneWithMethods(battle);
  base.turn.atk = "npc";
  base.turn.def = "player";

  // 기술 객체 생성
  // 각 기술의 최소, 최대 데미지, 가중치 계산하여 지니고있는다
  // choices에 있는 선택지만 추출하여 객체화
  const skObj = {};
  choices.forEach((c) => {
    if (typeof c === "number") {
      skObj[c] = createSkObj(base, c, hp);
    } else if (c === "npcBench1") {
      skObj[c] = createPkObj(base, 1, hp);
    } else if (c === "npcBench2") {
      skObj[c] = createPkObj(base, 2, hp);
    }
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
      atkScoreOrigin: null,
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
  }
  // 기술 가중치 계산 함수
  skObj.score = calculateSkillScore(bt, sn, skObj, isAttack(skill.stype));
  return skObj;
}

//상대를 쓰러뜨릴 수 있는 기술을 필터링
export function getKillableSkill(skObj, hp, bt) {
  // 1. 상대를 확정으로 쓰러뜨릴 수 있는 기술 (minDmg >= hp)
  const minCandidates = [1, 2, 3, 4].map((num) => skObj[num]).filter((s) => s && s.minDmg >= hp);

  // 2. 그중에서 우선도 -> 강한 디메리트 없음 -> 명중률 -> 약한 디메리트 없음 -> 데미지 높은 순으로 선택
  let bestSkill = findBestSkill(minCandidates, bt);

  // 3. 상대를 쓰러뜨릴 수 있는 스킬 필터링 (maxDmg)
  if (!bestSkill) {
    const maxCandidates = [1, 2, 3, 4].map((num) => skObj[num]).filter((s) => s && s.maxDmg >= hp);
    bestSkill = findBestSkill(maxCandidates, bt);
  }

  // 스킬 번호 리턴
  return bestSkill?.number ?? null;
}

const findBestSkill = (skillList, bt) => {
  if (skillList.length === 0) return null;

  // 1. 우선도 체크
  let maxPrior = -Infinity;
  let topPriorSkills = [];
  for (const skill of skillList) {
    const pri = priCalculate(bt, "npc", skill.sk) || 0;

    if (pri > maxPrior) {
      maxPrior = pri;
      topPriorSkills = [skill];
    } else if (pri === maxPrior) {
      topPriorSkills.push(skill);
    }
  }

  // 우선도가 가장 높은 기술이 하나면 이를 리턴
  if (topPriorSkills.length === 1) return topPriorSkills[0];

  // 2. 강한 디메리트 없음 (No Strong Demerit)
  const noStrongDemeritSkills = topPriorSkills.filter((s) => !hasStrongDemerit(s, bt));
  const candidatesAfterStrong = noStrongDemeritSkills.length > 0 ? noStrongDemeritSkills : topPriorSkills;
  if (candidatesAfterStrong.length === 1) return candidatesAfterStrong[0];

  // 3. 우선도가 같고 강한 디메리트 여부가 같다면 명중률이 제일 높은 기술을 리턴
  const getAccur = (s) => {
    let accRaw = getAccuracy(bt, s.sk, bt.npc);
    if (accRaw === "-") return 9999;
    return Math.min(100, Number(accRaw) || 0);
  };

  const maxAccur = Math.max(...candidatesAfterStrong.map(getAccur));

  const topAccurSkills = candidatesAfterStrong.filter((s) => getAccur(s) === maxAccur);

  if (topAccurSkills.length === 1) return topAccurSkills[0];

  // 4. 약한 디메리트 없음 (No Weak Demerit)
  const noWeakDemeritSkills = topAccurSkills.filter((s) => !hasWeakDemerit(s, bt));
  const candidatesAfterWeak = noWeakDemeritSkills.length > 0 ? noWeakDemeritSkills : topAccurSkills;
  if (candidatesAfterWeak.length === 1) return candidatesAfterWeak[0];

  // 5. 명중률과 디메리트 여부마저 같다면 데미지가 더 높은 기술을 사용
  const maxMinDmg = Math.max(...candidatesAfterWeak.map((s) => s.minDmg || 0));
  return candidatesAfterWeak.find((s) => (s.minDmg || 0) === maxMinDmg) || null;
};

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

// 강한 디메리트 체크
export function hasStrongDemerit(skillObj, bt) {
  const sk = skillObj?.sk;
  if (!sk) return false;

  const list = sk.skillEffectList || [];
  // 추가 조건 없는 단순 강한 디메리트 효과 목록
  const strongSimpleEffects = ["자폭", "대폭발", "반동휴식", "철제광선반동", "자동"];

  for (const eff of list) {
    // 1. 추가 조건 없는 단순 효과 순회
    if (strongSimpleEffects.includes(eff.name)) {
      return true;
    }

    // 2. 공격 OR 특공 2랭크 이상 하락
    if (eff.name === "랭크변화" && eff.target === "atk" && (eff.stat === "atk" || eff.stat === "catk") && typeof eff.value === "number" && eff.value <= -2) {
      return true;
    }
    if (eff.name === "랭크다수변화" && eff.target === "atk" && Array.isArray(eff.stats)) {
      if (eff.stats.some((st) => (st.stat === "atk" || st.stat === "catk") && typeof st.value === "number" && st.value <= -2)) {
        return true;
      }
    }

    // 3. 상대방이 물리어태커/딜탱인데 화상을 입었을 때의 화상치료
    if (eff.name === "화상치료") {
      const player = bt?.player;
      const role = player?.role || player?.origin?.role;
      const isPhysical = role === "물리어태커" || role === "물리딜탱";
      const hasBurn = player?.ailment?.burn !== null && player?.ailment?.burn !== undefined;
      if (isPhysical && hasBurn) {
        return true;
      }
    }
  }

  return false;
}

// 약한 디메리트 체크
export function hasWeakDemerit(skillObj, bt) {
  const sk = skillObj?.sk;
  if (!sk) return false;

  // 강한 디메리트에 해당하면 약한 디메리트에서는 제외
  if (hasStrongDemerit(skillObj, bt)) {
    return false;
  }

  const list = sk.skillEffectList || [];
  const npc = bt?.npc;
  // 추가 조건 없는 단순 약한 디메리트 효과 목록
  const weakSimpleEffects = ["빗나감패널티"];

  for (const eff of list) {
    // 1. 추가 조건 없는 단순 효과 순회
    if (weakSimpleEffects.includes(eff.name)) {
      return true;
    }

    // 2. 반동 피해 (돌머리 특성일 경우 반동 무효이므로 디메리트 아님)
    if (eff.name === "반동") {
      if (npc?.abil !== "돌머리") {
        return true;
      }
    }

    // 3. 자신 대상 랭크 하락 (인파이트, 엄청난힘, 암해머, 스케일샷 등)
    if (eff.name === "랭크변화" && eff.target === "atk" && typeof eff.value === "number" && eff.value < 0) {
      return true;
    }
    if (eff.name === "랭크다수변화" && eff.target === "atk" && Array.isArray(eff.stats)) {
      if (eff.stats.some((st) => typeof st.value === "number" && st.value < 0)) {
        return true;
      }
    }
  }

  // 4. 2회 연속 사용 불가 (블러드문)
  if (sk.feature?.noDouble) {
    return true;
  }

  return false;
}

// 상태이상 가능 여부 체크
export function statusAbleCheck(status, pokemon) {
  if (Object.values(pokemon.ailment).some((v) => v !== null)) {
    // null이 아닌 값이 하나라도 있으면 (상태이상이 이미 걸려있으면) false 반환
    return false;
  }

  let t1 = pokemon.type1;
  let t2 = pokemon.type2;

  if (status === "화상") {
    // 물타입한테 화상 걸리는거 맞음
    if (t1 === "불꽃" || t2 === "불꽃") {
      return false;
    }
    if (pokemon.abil === "수포") {
      return false;
    }
  }
  if (status === "마비") {
    // 땅타입한테 마비 걸리는거 맞음 (전기자석파가 무효)
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
  let result = calculatePokemonSwitchScore(bt, sn, skObj);
  skObj.score = result.score;
  skObj.log = result;

  return skObj;
}

export function calculatePokemonSwitchScore(bt, sn, skObj) {
  const log = {};
  const index = "npcBench" + sn;
  const benchPokemon = bt[index];
  let benchScore = calculateTypeScore(bt, index, log);
  let npcScore = calculateTypeScore(bt, "npc", log);
  let score = benchScore - npcScore;

  const totalResult = "totalResult";
  log[totalResult] = score;

  // 필드 장애물 존재시 교체 디메리트 보정
  if (bt.field.npc.sRock) {
    score -= 25;
    log[totalResult] += ` - 25 (교체-스락)`;
  }

  const isFly = benchPokemon.isFlying(bt);
  if (bt.field.npc.spikes && !isFly) {
    score -= 20;
    log[totalResult] += ` - 20 (교체-압정)`;
  }
  if (bt.field.npc.stickyWeb && !isFly) {
    // 역할군에 따른 보정 추가필요
    score -= 20;
    log[totalResult] += ` - 20 (교체-끈적끈적네트)`;
  }

  if (bt.field.npc.poisonSpikes && !isFly) {
    if (benchPokemon.type1 === "독" || benchPokemon.type2 === "독") {
      score += 20;
      log[totalResult] += ` + 10 (교체-독압정 제거)`;
    } else if (statusAbleCheck("독", benchPokemon)) {
      // 탱커의 맹독 추가보정 필요
      let value = 10 * bt.field.npc.poisonSpikes; // 맹독압정 고려
      score -= value;
      log[totalResult] += ` - 10 (교체-독압정)`;
    }
  }

  const playerSkills = [1, 2, 3, 4].map((num) => bt.player.origin.skill[num]);
  for (const sk of playerSkills) {
    const list = sk?.skillEffectList;
    if (list && typeof list[Symbol.iterator] === "function") {
      for (const skillEffect of list) {
        if (skillEffect?.name === "강제교체") {
          //상대에게 강제교체 기술이 존재하면 교체를 하지 않는다
          log[totalResult] = "0 (강제교체)";
          score = 0;
        }
      }
    }
  }
  log[totalResult] += ` = ${score}`;
  log.score = score;
  return log;
}

function calculateTypeScore(bt, index, log) {
  const pokemon = bt[index];
  const stat = bt.player.origin.stat;
  const playerAtkType = stat.atk > stat.catk ? "atk" : "catk"; // 상대가 물리형인지 특수형인지
  const defStat = playerAtkType === "atk" ? "def" : "cdef";
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
      value = typeCheck(sk.type, pokemon.type1, pokemon.type2, sk.name);
      if (value === 0) value = 0.1;
      result = Math.max(result, value);
    }
  }

  let score = Math.floor((pokemon.origin.hp * pokemon.origin.stat[defStat]) / result / 1000);
  log[index] = `${pokemon.origin.hp} * ${pokemon.origin.stat[defStat]} / ${result} / 1000 = ${score}`;
  return score;
}
