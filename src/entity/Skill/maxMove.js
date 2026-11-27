import { josa } from "josa";
import { isAttackSkill } from "./Skill";

/**
 * 다이기술(Max Move) 증강 설정 레지스트리
 * 향후 다른 타입의 다이기술 증강 추가 시 이 객체에 항목만 추가하면
 * 위력/물리·특수 변환, 기술 선택 UI, 배틀 부가효과가 모두 자동으로 동작합니다.
 */
export const MAX_MOVE_AUGMENT_CONFIGS = {
  maxFlare: {
    augmentId: "maxFlare",
    moveName: "다이번",
    type: "불꽃",
    cost: 5,
    isLowPowerTable: false,
    hasCustomIcon: true,
    hitEffectText: "날씨를 쾌청 상태로 만듭니다.",
    effectDesc: "5턴 동안 날씨를 쾌청 상태로 만든다.",
    skillEffect: { name: "다이기술", weather: "쾌청" },
  },
  maxRockfall: {
    augmentId: "maxRockfall",
    moveName: "다이록",
    type: "바위",
    cost: 5,
    isLowPowerTable: false,
    hasCustomIcon: true,
    hitEffectText: "날씨를 모래바람 상태로 만듭니다.",
    effectDesc: "5턴 동안 날씨를 모래바람 상태로 만든다.",
    skillEffect: { name: "다이기술", weather: "모래바람" },
  },
  maxHailstorm: {
    augmentId: "maxHailstorm",
    moveName: "다이아이스",
    type: "얼음",
    cost: 5,
    isLowPowerTable: false,
    hasCustomIcon: true,
    hitEffectText: "날씨를 설경 상태로 만듭니다.",
    effectDesc: "5턴 동안 날씨를 설경 상태로 만든다.",
    skillEffect: { name: "다이기술", weather: "설경" },
  },
  maxGeyser: {
    augmentId: "maxGeyser",
    moveName: "다이스트림",
    type: "물",
    cost: 5,
    isLowPowerTable: false,
    hasCustomIcon: true,
    hitEffectText: "날씨를 비 상태로 만듭니다.",
    effectDesc: "5턴 동안 날씨를 비 상태로 만든다.",
    skillEffect: { name: "다이기술", weather: "비" },
  },
};

export const buildMaxMoveAugmentDesc = (config) => {
  if (!config) return "";
  return josa(`해당 포켓몬의 ${config.type} 타입 공격기를 ${config.moveName}#{으로} 변경합니다.\n대상이 숨지 않는 이상 반드시 명중하며 명중시 ${config.hitEffectText}\n방어 계열 기술을 깨뜨릴 수 있으며,\n그 경우 위력이 ¼이 됩니다`);
};

export const isMaxMoveAugment = (augOrId) => {
  const id = typeof augOrId === "string" ? augOrId : augOrId?.id;
  return Boolean(id && MAX_MOVE_AUGMENT_CONFIGS[id]);
};

export const getMaxMoveConfig = (augOrId) => {
  const id = typeof augOrId === "string" ? augOrId : augOrId?.id;
  return (id && MAX_MOVE_AUGMENT_CONFIGS[id]) || null;
};

/**
 * 해당 기술이 특정 다이기술 증강으로 변환 가능한 공격 기술인지 판정
 */
export const isEligibleBaseSkillForMaxMove = (skill, configOrAugId) => {
  const config = typeof configOrAugId === "object" ? configOrAugId : getMaxMoveConfig(configOrAugId);
  if (!skill || !config) return false;
  if (!isAttackSkill(skill)) return false;
  if (skill.feature?.isMaxMove) return false;
  return skill.type === config.type;
};

/**
 * 포켓몬이 해당 다이기술 증강의 대상이 되는 타입의 공격 기술을 1개 이상 보유했는지 판정
 */
export const hasEligibleSkillForMaxMove = (pokemon, configOrAugId) => {
  if (!pokemon?.skill) return false;
  return [1, 2, 3, 4].some((slot) => isEligibleBaseSkillForMaxMove(pokemon.skill[slot], configOrAugId));
};

/**
 * 원본 공격 기술의 위력/특성에 따른 다이기술 위력 산출 (8세대 원작 기준)
 */
export const calculateMaxMovePower = (baseSkill, isLowPowerTable = false) => {
  if (!baseSkill) return isLowPowerTable ? 90 : 130;
  const src = baseSkill.baseSkillSnapshot || baseSkill;

  // 가변 위력("*") 또는 2~5타/3타 연속기는 원작 기준 130 (격투/독은 90)
  if (src.power === "*" || src.feature?.serial === "twoFive" || src.feature?.serial === "triple" || src.feature?.serial === "suru") {
    return isLowPowerTable ? 90 : 130;
  }

  let rawPower = Number(src.power);
  if (isNaN(rawPower) || rawPower <= 0) {
    return isLowPowerTable ? 90 : 130;
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

/**
 * 선택한 원본 기술을 기반으로 실시간 위력 및 물리/특수가 반영된 다이기술 객체를 생성
 */
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

/**
 * AUGMENT_LIST에 등록할 다이기술 증강 객체 배열을 생성합니다.
 */
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
      const rawPrevName =
        (targetPrevName && targetPrevName !== config.moveName ? targetPrevName : null) ||
        prevSkill?.baseSkillSnapshot?.name ||
        (prevSkill?.originalName && prevSkill.originalName !== config.moveName ? prevSkill.originalName : null) ||
        (prevSkill?.name && prevSkill.name !== config.moveName ? prevSkill.name : null) ||
        "기존 기술";

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

      pokemon.skill[slot] = maxMoveSkill;
      if (pokemon.pp) {
        pokemon.pp[slot] = maxMoveSkill.pp;
      }
    },
  }));
