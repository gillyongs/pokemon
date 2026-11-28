import { josa } from "josa";

// 다이맥스 기술 (EX: 다이번) 증강 관련 ==============================================================
// 다이맥스 기술 증강 목록 생성
export const createMaxMoveAugments = (renamePokemonSkill) =>
  Object.values(MAX_MOVE_AUGMENT_CONFIGS).map((config) => ({
    id: config.augmentId,
    name: config.moveName,
    desc: buildMaxMoveAugmentDesc(config),
    cost: config.cost ?? 5,
    weight: 100,
    isEligible: (pokemon) => hasEligibleSkillForMaxMove(pokemon, config),
    screenText: function (target, prevPokeName, options) {
      const augOnPoke = target?.augments?.find((a) => a.id === config.augmentId);
      const prevSkillName = options?.replacedSkillName || this?.replacedSkillName || augOnPoke?.replacedSkillName || "기존 기술";
      const names = target?.names ? target.names("는") : "포켓몬은";
      return josa(`[증강] ${names} ${prevSkillName}#{을} ${config.moveName}#{으로} 변경했다!`);
    },
    logModalText: function (target, prevPokeName, options) {
      const augOnPoke = target?.augments?.find((a) => a.id === config.augmentId);
      const prevSkillName = options?.replacedSkillName || this?.replacedSkillName || augOnPoke?.replacedSkillName || "기존 기술";
      const names = target?.names ? target.names("는") : "포켓몬은";
      return josa(`${names} ${prevSkillName}#{을} ${config.moveName}#{으로} 변경했다!`);
    },
    statusModalText: function (pokemon, battle, options) {
      const augOnPoke = pokemon?.augments?.find((a) => a.id === config.augmentId);
      const prevSkillName = options?.replacedSkillName || this?.replacedSkillName || augOnPoke?.replacedSkillName;
      if (prevSkillName) return josa(`${prevSkillName}#{을} ${config.moveName}#{으로} 변경했습니다.`);
      return `${this.desc}`;
    },
    onApply: function (pokemon, battle, options) {
      if (!pokemon?.skill) return;
      let slot = Number(options?.replaceSlot || options?.chosenSlot || this?.replacedSlot);
      const targetPrevName = options?.replacedSkillName || this?.replacedSkillName;

      if ((!slot || !pokemon.skill[slot]) && targetPrevName) {
        slot = [1, 2, 3, 4].find((s) => pokemon.skill[s]?.name === targetPrevName || pokemon.skill[s]?.originalName === targetPrevName);
      }
      if (!slot || !pokemon.skill[slot]) {
        slot = [1, 2, 3, 4].find((s) => isEligibleBaseSkillForMaxMove(pokemon.skill[s], config));
      }
      if (!slot || !pokemon.skill[slot]) return;

      const prevSkill = pokemon.skill[slot];
      const rawPrevName = (targetPrevName && targetPrevName !== config.moveName ? targetPrevName : null) || prevSkill?.baseSkillSnapshot?.name || (prevSkill?.originalName && prevSkill.originalName !== config.moveName ? prevSkill.originalName : null) || (prevSkill?.name && prevSkill.name !== config.moveName ? prevSkill.name : null) || "기존 기술";

      const maxMoveSkill = buildMaxMoveFromSkill(prevSkill, config, slot);
      if (prevSkill?.name && prevSkill.name !== config.moveName && typeof renamePokemonSkill === "function") {
        renamePokemonSkill(pokemon, prevSkill.name, config.moveName);
      }

      this.replacedSlot = slot;
      this.replacedSkillName = rawPrevName;
      const augOnPoke = pokemon.augments?.find((a) => a && a.id === config.augmentId);
      if (augOnPoke) {
        augOnPoke.replacedSlot = slot;
        augOnPoke.replacedSkillName = rawPrevName;
      }
      if (options && typeof options === "object") {
        options.replaceSlot = slot;
        options.replacedSkillName = rawPrevName;
      }

      pokemon.isGimmik = true;
      pokemon.skill[slot] = maxMoveSkill;
      if (pokemon.pp) {
        pokemon.pp[slot] = maxMoveSkill.pp;
      }
    },
  }));

// 다이기술 증강 설명 텍스트 생성
const buildMaxMoveAugmentDesc = (config) => {
  if (!config) return "";
  return josa(`${config.type} 타입 공격기를 ${config.moveName}#{으로} 변경합니다.\n상대에게 반드시 명중하며 ${config.hitEffectText}\n방어 계열 기술을 관통하며 그 경우 위력이 ¼로 감소합니다.`);
};

// 증강 ID 또는 객체가 다이기술 증강인지 판정
// 기술 교체 모달 호출할때 사용
export const isMaxMoveAugment = (augOrId) => {
  const id = typeof augOrId === "string" ? augOrId : augOrId?.id;
  return Boolean(id && MAX_MOVE_AUGMENT_CONFIGS[id]);
};

// 다이맥스 기술로 변하게 할 해당 타입의 기술이 있는지 확인
const hasEligibleSkillForMaxMove = (pokemon, configOrAugId) => {
  if (pokemon.isGimmik) return false;
  if (hasMaxMove(pokemon)) return false;
  return [1, 2, 3, 4].some((slot) => isEligibleBaseSkillForMaxMove(pokemon.skill[slot], configOrAugId));
};

// 해당 기술이 특정 다이기술 증강으로 변환 가능한 공격 기술인지 판정
export const isEligibleBaseSkillForMaxMove = (skill, configOrAugId) => {
  const config = typeof configOrAugId === "object" ? configOrAugId : getMaxMoveConfig(configOrAugId);
  if (!skill || !config) return false;
  if (skill.stype !== "atk" && skill.stype !== "catk") return false;
  if (skill.feature?.isMaxMove) return false;
  return skill.type === config.type;
};

// 다이맥스 증강 관련 ======================================================================================================

// 포켓몬을 다이맥스 상태로 전환합니다. (체력 2배, 공격기는 타입별 다이기술로, 변화기는 다이윌로 일시 변환, 3턴 지속)
export const applyDynamax = (pokemon, turns = 3) => {
  if (!pokemon || pokemon.faint) return false;
  if (!pokemon.tempStatus) pokemon.tempStatus = {};
  if (pokemon.tempStatus.dynamax > 0) return false;

  const originSkills = {};
  if (pokemon.skill) {
    [1, 2, 3, 4].forEach((slot) => {
      const sk = pokemon.skill[slot];
      if (!sk || sk.feature?.isMaxMove || sk.feature?.isZMove) return;
      if (sk.stype !== "atk" && sk.stype !== "catk") {
        originSkills[slot] = sk;
        pokemon.skill[slot] = buildMaxGuardFromSkill(sk, slot);
        return;
      }
      const config = getMaxMoveConfigByType(sk.type);
      if (!config) return;
      originSkills[slot] = sk;
      pokemon.skill[slot] = buildMaxMoveFromSkill(sk, config, slot);
    });
  }

  pokemon.isGimmik = true;
  pokemon.tempStatus.dynamaxOriginSkills = originSkills;
  pokemon.tempStatus.dynamax = turns;

  if (typeof pokemon.hp === "number" && pokemon.hp > 0) {
    const newMaxHp = pokemon.maxHp;
    pokemon.hp = Math.min(newMaxHp, Math.max(1, Math.round(pokemon.hp * 2)));
  }

  return true;
};

// 포켓몬의 다이맥스 상태를 해제하고 원본 기술 및 체력 비율을 복구합니다.
// 사용처: PokemonGetDamage.js, switch.js, turnEnd.js
export const restoreDynamax = (pokemon) => {
  if (!pokemon?.tempStatus) return false;
  const wasDynamax = pokemon.tempStatus.dynamax != null || Boolean(pokemon.tempStatus.dynamaxOriginSkills);
  if (!wasDynamax) return false;

  const originSkills = pokemon.tempStatus.dynamaxOriginSkills;
  if (originSkills && pokemon.skill) {
    [1, 2, 3, 4].forEach((slot) => {
      if (originSkills[slot]) {
        pokemon.skill[slot] = originSkills[slot];
      }
    });
  }

  pokemon.tempStatus.dynamax = null;
  pokemon.tempStatus.dynamaxOriginSkills = null;

  if (!pokemon.faint && typeof pokemon.hp === "number" && pokemon.hp > 0) {
    const restoredMaxHp = pokemon.maxHp;
    pokemon.hp = Math.min(restoredMaxHp, Math.max(1, Math.round(pokemon.hp / 2)));
  }

  return true;
};

// 선택한 변화기 원본 기술을 기반으로 다이윌(방어) 객체를 생성
const buildMaxGuardFromSkill = (baseSkill, slot = null) => {
  const src = baseSkill?.baseSkillSnapshot || baseSkill || {};
  const pp = typeof src.pp === "number" ? src.pp : 10;
  const effectDesc = "다이맥스 기술을 포함한 상대의 모든 공격을 막는다. 연속으로 쓰면 실패하기 쉽다. (우선도 +4)";

  return {
    name: "다이윌",
    originalName: src.originalName || src.name || "다이윌",
    type: "노말",
    power: "-",
    accur: "-",
    pp,
    prior: 4,
    stype: "buf",
    useCount: 0,
    fatalStrike: Boolean(baseSkill?.fatalStrike),
    skillNumber: slot ?? baseSkill?.skillNumber,
    requirement: { name: "방어" },
    feature: {
      isMaxMove: true,
      maxMoveId: "maxGuard",
      protect: true,
      maxGuard: true,
    },
    skillEffectList: [{ name: "다이윌" }, { name: "공통" }],
    originText: effectDesc,
    text: effectDesc,
    baseSkillSnapshot: {
      name: src.name,
      originalName: src.originalName || src.name,
      type: src.type,
      power: src.power,
      stype: src.stype,
      pp,
      feature: src.feature ? { ...src.feature } : {},
    },
  };
};

// =========================================================================================================

// 포켓몬이 이미 다이맥스 기술(isMaxMove)을 보유하고 있는지 판정
// 다이맥스 기술이 존재하면 다이맥스와 다이번 ... 다이어택 등 증강이 나오지 않는다
export const hasMaxMove = (pokemon) => {
  if (!pokemon?.skill) return false;
  return [1, 2, 3, 4].some((slot) => Boolean(pokemon.skill[slot]?.feature?.isMaxMove));
};

// 선택한 원본 기술을 기반으로 실시간 위력 및 물리/특수가 반영된 다이기술 객체를 생성
// 사용처: AugmentSkillSelectView.js, maxMove.test.js, DymaxMove.js (applyDynamax, createMaxMoveAugments)
export const buildMaxMoveFromSkill = (baseSkill, configOrAugId, slot = null) => {
  const config = typeof configOrAugId === "object" ? configOrAugId : getMaxMoveConfig(configOrAugId);
  if (!config) return baseSkill;

  const src = baseSkill?.baseSkillSnapshot || baseSkill || {};
  const power = calculateMaxMovePower(src, config.isLowPowerTable);
  const stype = src.stype === "atk" ? "atk" : "catk";
  const stypeKor = stype === "atk" ? "물리" : "특수";
  const pp = typeof src.pp === "number" ? src.pp : 8;
  const accur = "-";
  const effectDesc = config.effectDesc || "";
  const fullText = `위력 ${power} / 명중 ${accur} / ${stypeKor}${effectDesc ? ` / ${effectDesc}` : ""}`;

  return {
    name: config.moveName,
    originalName: src.originalName || src.name || config.moveName,
    type: config.type,
    power,
    accur,
    pp,
    prior: 0,
    stype,
    useCount: 0,
    fatalStrike: Boolean(baseSkill?.fatalStrike),
    skillNumber: slot ?? baseSkill?.skillNumber,
    requirement: null,
    feature: {
      isMaxMove: true,
      maxMoveId: config.augmentId,
    },
    skillEffectList: [config.skillEffect, { name: "공통" }].filter(Boolean),
    originText: effectDesc,
    text: fullText,
    baseSkillSnapshot: {
      name: src.name,
      originalName: src.originalName || src.name,
      type: src.type,
      power: src.power,
      stype: src.stype,
      pp,
      feature: src.feature ? { ...src.feature } : {},
    },
  };
};

// 원본 공격 기술의 위력/특징에 따른 다이기술 위력 산출
const calculateMaxMovePower = (baseSkill, isLowPowerTable = false) => {
  if (!baseSkill) return isLowPowerTable ? 100 : 130;
  const src = baseSkill.baseSkillSnapshot || baseSkill;

  // 위력 비고정("*", "-"), 일격기, 또는 2~5타/3타 연속기는 원작 기준 130 (격투/독은 100)
  if (src.power === "*" || src.power === "-" || src.feature?.oneShot || src.feature?.serial === "twoFive" || src.feature?.serial === "triple" || src.feature?.serial === "suru") {
    return isLowPowerTable ? 100 : 130;
  }

  let rawPower = Number(src.power);
  if (isNaN(rawPower) || rawPower <= 0) {
    return isLowPowerTable ? 100 : 130;
  }

  // 2회 타격 연속기(더블윙, 기어소서, 드래곤애로, 더블펀처 등)는 합산 위력 기준
  if (src.feature?.serial === "double") {
    rawPower *= 2;
  }

  if (isLowPowerTable) {
    if (rawPower <= 40) return 70;
    if (rawPower <= 50) return 75;
    if (rawPower <= 60) return 80;
    if (rawPower <= 70) return 85;
    if (rawPower <= 100) return 90;
    if (rawPower <= 140) return 95;
    return 100;
  }

  if (rawPower <= 40) return 90;
  if (rawPower <= 50) return 100;
  if (rawPower <= 60) return 110;
  if (rawPower <= 70) return 120;
  if (rawPower <= 100) return 130;
  if (rawPower <= 140) return 140;
  return 150;
};

// Config ==================================================================================================

// 증강 ID 또는 객체로 다이기술 설정 조회
export const getMaxMoveConfig = (augOrId) => {
  const id = typeof augOrId === "string" ? augOrId : augOrId?.id;
  return (id && MAX_MOVE_AUGMENT_CONFIGS[id]) || null;
};

// 타입명으로 다이기술 설정을 조회합니다.
// 사용처: DymaxMove.js (applyDynamax)
const getMaxMoveConfigByType = (type) => {
  if (!type) return null;
  return Object.values(MAX_MOVE_AUGMENT_CONFIGS).find((cfg) => cfg.type === type) || null;
};

const MAX_MOVE_AUGMENT_CONFIGS = {
  maxFlare: {
    augmentId: "maxFlare",
    moveName: "다이번",
    type: "불꽃",
    cost: 3,
    isLowPowerTable: false,
    hasCustomIcon: false,
    hitEffectText: "날씨를 쾌청 상태로 만듭니다.",
    effectDesc: "5턴 동안 날씨를 쾌청 상태로 만든다.",
    skillEffect: { name: "다이기술", weather: "쾌청" },
  },
  maxRockfall: {
    augmentId: "maxRockfall",
    moveName: "다이록",
    type: "바위",
    cost: 3,
    isLowPowerTable: false,
    hasCustomIcon: false,
    hitEffectText: "날씨를 모래바람 상태로 만듭니다.",
    effectDesc: "5턴 동안 날씨를 모래바람 상태로 만든다.",
    skillEffect: { name: "다이기술", weather: "모래바람" },
  },
  maxHailstorm: {
    augmentId: "maxHailstorm",
    moveName: "다이아이스",
    type: "얼음",
    cost: 3,
    isLowPowerTable: false,
    hasCustomIcon: false,
    hitEffectText: "날씨를 설경 상태로 만듭니다.",
    effectDesc: "5턴 동안 날씨를 설경 상태로 만든다.",
    skillEffect: { name: "다이기술", weather: "설경" },
  },
  maxGeyser: {
    augmentId: "maxGeyser",
    moveName: "다이스트림",
    type: "물",
    cost: 3,
    isLowPowerTable: false,
    hasCustomIcon: false,
    hitEffectText: "날씨를 비 상태로 만듭니다.",
    effectDesc: "5턴 동안 날씨를 비 상태로 만든다.",
    skillEffect: { name: "다이기술", weather: "비" },
  },
  maxLightning: {
    augmentId: "maxLightning",
    moveName: "다이썬더",
    type: "전기",
    cost: 3,
    isLowPowerTable: false,
    hasCustomIcon: false,
    hitEffectText: "필드를 일렉트릭필드로 만듭니다.",
    effectDesc: "5턴 동안 일렉트릭필드를 만든다.",
    skillEffect: { name: "다이기술", terrain: "일렉트릭필드" },
  },
  maxOvergrowth: {
    augmentId: "maxOvergrowth",
    moveName: "다이그래스",
    type: "풀",
    cost: 3,
    isLowPowerTable: false,
    hasCustomIcon: false,
    hitEffectText: "필드를 그래스필드로 만듭니다.",
    effectDesc: "5턴 동안 그래스필드를 만든다.",
    skillEffect: { name: "다이기술", terrain: "그래스필드" },
  },
  maxStarfall: {
    augmentId: "maxStarfall",
    moveName: "다이페어리",
    type: "페어리",
    cost: 3,
    isLowPowerTable: false,
    hasCustomIcon: false,
    hitEffectText: "필드를 미스트필드로 만듭니다.",
    effectDesc: "5턴 동안 미스트필드를 만든다.",
    skillEffect: { name: "다이기술", terrain: "미스트필드" },
  },
  maxMindstorm: {
    augmentId: "maxMindstorm",
    moveName: "다이사이코",
    type: "에스퍼",
    cost: 3,
    isLowPowerTable: false,
    hasCustomIcon: false,
    hitEffectText: "필드를 사이코필드로 만듭니다.",
    effectDesc: "5턴 동안 사이코필드를 만든다.",
    skillEffect: { name: "다이기술", terrain: "사이코필드" },
  },
  maxAirstream: {
    augmentId: "maxAirstream",
    moveName: "다이제트",
    type: "비행",
    cost: 4, // 얘만 다른거 맞음
    isLowPowerTable: false,
    hasCustomIcon: false,
    hitEffectText: "사용자의 스피드를 1랭크 상승시킵니다.",
    effectDesc: "사용자의 스피드를 1랭크 상승시킨다.",
    skillEffect: { name: "다이기술", stat: "speed", target: "atk", value: 1 },
  },
  maxKnuckle: {
    augmentId: "maxKnuckle",
    moveName: "다이너클",
    type: "격투",
    cost: 3,
    isLowPowerTable: true,
    hasCustomIcon: false,
    hitEffectText: "사용자의 공격을 1랭크 상승시킵니다.",
    effectDesc: "사용자의 공격을 1랭크 상승시킨다.",
    skillEffect: { name: "다이기술", stat: "atk", target: "atk", value: 1 },
  },
  maxOoze: {
    augmentId: "maxOoze",
    moveName: "다이애시드",
    type: "독",
    cost: 3,
    isLowPowerTable: true,
    hasCustomIcon: false,
    hitEffectText: "사용자의 특수공격을 1랭크 상승시킵니다.",
    effectDesc: "사용자의 특수공격을 1랭크 상승시킨다.",
    skillEffect: { name: "다이기술", stat: "catk", target: "atk", value: 1 },
  },
  maxQuake: {
    augmentId: "maxQuake",
    moveName: "다이어스",
    type: "땅",
    cost: 3,
    isLowPowerTable: false,
    hasCustomIcon: false,
    hitEffectText: "사용자의 특수방어를 1랭크 상승시킵니다.",
    effectDesc: "사용자의 특수방어를 1랭크 상승시킨다.",
    skillEffect: { name: "다이기술", stat: "cdef", target: "atk", value: 1 },
  },
  maxSteelspike: {
    augmentId: "maxSteelspike",
    moveName: "다이스틸",
    type: "강철",
    cost: 3,
    isLowPowerTable: false,
    hasCustomIcon: false,
    hitEffectText: "사용자의 방어를 1랭크 상승시킵니다.",
    effectDesc: "사용자의 방어를 1랭크 상승시킨다.",
    skillEffect: { name: "다이기술", stat: "def", target: "atk", value: 1 },
  },
  maxFlutterby: {
    augmentId: "maxFlutterby",
    moveName: "다이웜",
    type: "벌레",
    cost: 3,
    isLowPowerTable: false,
    hasCustomIcon: false,
    hitEffectText: "상대의 특수공격을 1랭크 하락시킵니다.",
    effectDesc: "상대의 특수공격을 1랭크 하락시킨다.",
    skillEffect: { name: "다이기술", stat: "catk", target: "def", value: -1 },
  },
  maxPhantasm: {
    augmentId: "maxPhantasm",
    moveName: "다이할로우",
    type: "고스트",
    cost: 3,
    isLowPowerTable: false,
    hasCustomIcon: false,
    hitEffectText: "상대의 방어를 1랭크 하락시킵니다.",
    effectDesc: "상대의 방어를 1랭크 하락시킨다.",
    skillEffect: { name: "다이기술", stat: "def", target: "def", value: -1 },
  },
  maxWyrmwind: {
    augmentId: "maxWyrmwind",
    moveName: "다이드라군",
    type: "드래곤",
    cost: 3,
    isLowPowerTable: false,
    hasCustomIcon: false,
    hitEffectText: "상대의 공격을 1랭크 하락시킵니다.",
    effectDesc: "상대의 공격을 1랭크 하락시킨다.",
    skillEffect: { name: "다이기술", stat: "atk", target: "def", value: -1 },
  },
  maxDarkness: {
    augmentId: "maxDarkness",
    moveName: "다이아크",
    type: "악",
    cost: 3,
    isLowPowerTable: false,
    hasCustomIcon: false,
    hitEffectText: "상대의 특수방어를 1랭크 하락시킵니다.",
    effectDesc: "상대의 특수방어를 1랭크 하락시킨다.",
    skillEffect: { name: "다이기술", stat: "cdef", target: "def", value: -1 },
  },
  maxStrike: {
    augmentId: "maxStrike",
    moveName: "다이아택",
    type: "노말",
    cost: 3,
    isLowPowerTable: false,
    hasCustomIcon: false,
    hitEffectText: "상대의 스피드를 1랭크 하락시킵니다.",
    effectDesc: "상대의 스피드를 1랭크 하락시킨다.",
    skillEffect: { name: "다이기술", stat: "speed", target: "def", value: -1 },
  },
};
