import { josa } from "josa";
import { hasMaxMove } from "./DymaxMove";
import { skillTypeCalculate } from "../../calc/skillTypeCalculate";
import { isSkillUsable } from "../../service/skillCheck/skillDisableCheck";

const DEFAULT_Z_EFFECT_DESC = "방어 계열 기술을 깨뜨릴 수 있으며, 그 경우 대미지가 ¼이 된다.";

// Z크리스탈 아이템별 설정 테이블
// 사용처: ItemSearchModal.js, ZMove.js
export const Z_CRYSTAL_CONFIGS = {
  노말Z: { itemName: "노말Z", type: "노말", zMoveId: "breakneckBlitz", moveName: "울트라대시어택", effectDesc: DEFAULT_Z_EFFECT_DESC, skillEffect: null },
  불꽃Z: { itemName: "불꽃Z", type: "불꽃", zMoveId: "infernoOverdrive", moveName: "다이내믹풀플레임", effectDesc: DEFAULT_Z_EFFECT_DESC, skillEffect: null },
  물Z: { itemName: "물Z", type: "물", zMoveId: "hydroVortex", moveName: "슈퍼아쿠아토네이도", effectDesc: DEFAULT_Z_EFFECT_DESC, skillEffect: null },
  전기Z: { itemName: "전기Z", type: "전기", zMoveId: "gigavoltHavoc", moveName: "스파킹기가볼트", effectDesc: DEFAULT_Z_EFFECT_DESC, skillEffect: null },
  풀Z: { itemName: "풀Z", type: "풀", zMoveId: "bloomDoom", moveName: "블룸샤인엑스트라", effectDesc: DEFAULT_Z_EFFECT_DESC, skillEffect: null },
  얼음Z: { itemName: "얼음Z", type: "얼음", zMoveId: "subzeroSlammer", moveName: "레이징지오프리즈", effectDesc: DEFAULT_Z_EFFECT_DESC, skillEffect: null },
  격투Z: { itemName: "격투Z", type: "격투", zMoveId: "allOutPummeling", moveName: "전력무쌍격렬권", effectDesc: DEFAULT_Z_EFFECT_DESC, skillEffect: null },
  독Z: { itemName: "독Z", type: "독", zMoveId: "acidDownpour", moveName: "애시드포이즌딜리트", effectDesc: DEFAULT_Z_EFFECT_DESC, skillEffect: null },
  땅Z: { itemName: "땅Z", type: "땅", zMoveId: "tectonicRage", moveName: "라이징랜드오버", effectDesc: DEFAULT_Z_EFFECT_DESC, skillEffect: null },
  비행Z: { itemName: "비행Z", type: "비행", zMoveId: "supersonicSkystrike", moveName: "파이널다이브클래시", effectDesc: DEFAULT_Z_EFFECT_DESC, skillEffect: null },
  에스퍼Z: { itemName: "에스퍼Z", type: "에스퍼", zMoveId: "shatteredPsyche", moveName: "맥시멈사이브레이커", effectDesc: DEFAULT_Z_EFFECT_DESC, skillEffect: null },
  벌레Z: { itemName: "벌레Z", type: "벌레", zMoveId: "savageSpinOut", moveName: "절대포식회전참", effectDesc: DEFAULT_Z_EFFECT_DESC, skillEffect: null },
  바위Z: { itemName: "바위Z", type: "바위", zMoveId: "continentalCrush", moveName: "월즈엔드폴", effectDesc: DEFAULT_Z_EFFECT_DESC, skillEffect: null },
  고스트Z: { itemName: "고스트Z", type: "고스트", zMoveId: "neverEndingNightmare", moveName: "무한암야로의유인", effectDesc: DEFAULT_Z_EFFECT_DESC, skillEffect: null },
  드래곤Z: { itemName: "드래곤Z", type: "드래곤", zMoveId: "devastatingDrake", moveName: "얼티메이트드래곤번", effectDesc: DEFAULT_Z_EFFECT_DESC, skillEffect: null },
  악Z: { itemName: "악Z", type: "악", zMoveId: "blackHoleEclipse", moveName: "블랙홀이클립스", effectDesc: DEFAULT_Z_EFFECT_DESC, skillEffect: null },
  강철Z: { itemName: "강철Z", type: "강철", zMoveId: "corkscrewCrash", moveName: "초월선풍연격", effectDesc: DEFAULT_Z_EFFECT_DESC, skillEffect: null },
  페어리Z: { itemName: "페어리Z", type: "페어리", zMoveId: "twinkleTackle", moveName: "러블리스타임팩트", effectDesc: DEFAULT_Z_EFFECT_DESC, skillEffect: null },
};

// 아이템명으로 Z크리스탈 설정 조회
// 사용처: Bottom-Skill.js, battleStart.js, ZMove.js (isZMoveAble)
export const getZCrystalByItem = (itemName) => {
  if (!itemName) return null;
  return Z_CRYSTAL_CONFIGS[itemName] || null;
};

// 레쿠쟈 여부 판정 (Z크리스탈 사용 차단용)
// 사용처: battleStart.js, ZMove.js (isZMoveAble)
export const isRayquaza = (pokemon) => {
  if (!pokemon) return false;
  return Boolean(pokemon.dexNo === "0384" || pokemon.uniqueKey?.startsWith("0384") || pokemon.sampleName?.includes("레쿠쟈") || pokemon.name?.includes("레쿠쟈"));
};

// Z크리스탈로 해당 기술이 Z기술 발동 가능한 공격 기술인지 판정
// 사용처: SkillButton.js, battleStart.js, ZMove.js (isZMoveAble)
export const isEligibleSkillForZCrystal = (skill, crystalConfig, battle = null, pokemon = null) => {
  if (!skill || !crystalConfig) return false;
  if (skill.stype !== "atk" && skill.stype !== "catk") return false;
  if (skill.feature?.isMaxMove || skill.feature?.isZMove) return false;
  const effectiveType = skillTypeCalculate(battle, skill, pokemon) || skill.type;
  return effectiveType === crystalConfig.type;
};

// 현재 배틀에서 포켓몬이 Z기술을 사용할 수 있는지 판정 (배틀당 1회, 레쿠쟈/다이맥스 제외)
// 사용처: Bottom-Skill.js
export const isZMoveAble = (pokemon, battle) => {
  if (!pokemon || pokemon.faint) return false;
  if (battle?.system?.zUsed?.[pokemon.team]) return false;
  if (pokemon.tempStatus?.dynamax > 0) return false;
  if (isRayquaza(pokemon)) return false;
  const crystal = getZCrystalByItem(pokemon.item);
  if (!crystal) return false;
  return [1, 2, 3, 4].some((slot) => isSkillUsable(pokemon, slot) && isEligibleSkillForZCrystal(pokemon.skill?.[slot], crystal, battle, pokemon));
};

// 해당 기술이 특정 Z기술 증강으로 변환 가능한 공격 기술인지 판정
// 사용처: AugmentSkillSelectView.js, ZMove.js (hasEligibleSkillForZMove, createZMoveAugments)
export const isEligibleBaseSkillForZMove = (skill, configOrAugId) => {
  const config = typeof configOrAugId === "object" ? configOrAugId : getZMoveConfig(configOrAugId);
  if (!skill || !config) return false;
  if (skill.stype !== "atk" && skill.stype !== "catk") return false;
  if (skill.feature?.isMaxMove || skill.feature?.isZMove) return false;
  return skill.type === config.type;
};

// 포켓몬이 해당 Z기술 증강의 대상이 되는 타입의 공격 기술을 1개 이상 보유했는지 판정 (이미 Z기술이나 다이기술 보유 시 제외)
// 사용처: ZMove.js (createZMoveAugments)
const hasEligibleSkillForZMove = (pokemon, configOrAugId) => {
  if (!pokemon?.skill) return false;
  if (hasZMove(pokemon) || hasMaxMove(pokemon)) return false;
  return [1, 2, 3, 4].some((slot) => isEligibleBaseSkillForZMove(pokemon.skill[slot], configOrAugId));
};

// 선택한 원본 기술을 기반으로 실시간 위력 및 물리/특수가 반영된 Z기술 객체를 생성
// 사용처: AugmentSkillSelectView.js, ZMove.js (createZMoveAugments)
export const buildZMoveFromSkill = (baseSkill, configOrAugId, slot = null) => {
  const config = typeof configOrAugId === "object" ? configOrAugId : getZMoveConfig(configOrAugId);
  if (!config) return baseSkill;

  const src = baseSkill?.baseSkillSnapshot || baseSkill || {};
  const power = calculateZMovePower(src);
  const stype = src.stype === "atk" ? "atk" : "catk";
  const stypeKor = stype === "atk" ? "물리" : "특수";
  const pp = typeof src.pp === "number" ? src.pp : 5;
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
      isZMove: true,
      zMoveId: config.augmentId || config.zMoveId,
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

// 원본 공격 기술의 위력/특성에 따른 Z기술 위력 산출 (7세대 원작 기준)
// 사용처: ZMove.js (buildZMoveFromSkill)
const calculateZMovePower = (baseSkill) => {
  if (!baseSkill) return 160;
  const src = baseSkill.baseSkillSnapshot || baseSkill;

  if (src.feature?.oneShot) return 180;
  if (src.power === "*" || src.power === "-" || src.feature?.serial === "twoFive" || src.feature?.serial === "triple" || src.feature?.serial === "suru") {
    return 160;
  }

  let rawPower = Number(src.power);
  if (isNaN(rawPower) || rawPower <= 0) {
    return 160;
  }

  // 2회 타격 연속기는 합산 위력 기준
  if (src.feature?.serial === "double") {
    rawPower *= 2;
  }

  if (rawPower <= 55) return 100;
  if (rawPower <= 65) return 120;
  if (rawPower <= 75) return 140;
  if (rawPower <= 85) return 160;
  if (rawPower <= 95) return 175;
  if (rawPower <= 100) return 180;
  if (rawPower <= 110) return 185;
  if (rawPower <= 125) return 190;
  if (rawPower <= 130) return 195;
  return 200;
};

// Z기술 증강 목록 생성
// 사용처: AugmentData.js
export const createZMoveAugments = (renamePokemonSkill) =>
  Object.values(Z_MOVE_AUGMENT_CONFIGS).map((config) => ({
    id: config.augmentId,
    name: config.moveName,
    desc: buildZMoveAugmentDesc(config),
    cost: config.cost ?? 5,
    weight: 100,
    isEligible: (pokemon) => hasEligibleSkillForZMove(pokemon, config),
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
        slot = [1, 2, 3, 4].find((s) => isEligibleBaseSkillForZMove(pokemon.skill[s], config));
      }
      if (!slot || !pokemon.skill[slot]) return;

      const prevSkill = pokemon.skill[slot];
      const rawPrevName = (targetPrevName && targetPrevName !== config.moveName ? targetPrevName : null) || prevSkill?.baseSkillSnapshot?.name || (prevSkill?.originalName && prevSkill.originalName !== config.moveName ? prevSkill.originalName : null) || (prevSkill?.name && prevSkill.name !== config.moveName ? prevSkill.name : null) || "기존 기술";

      const zMoveSkill = buildZMoveFromSkill(prevSkill, config, slot);
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

      pokemon.skill[slot] = zMoveSkill;
      if (pokemon.pp) {
        pokemon.pp[slot] = zMoveSkill.pp;
      }
    },
  }));

// Z기술 증강 설명 텍스트 생성
// 사용처: ZMove.js (createZMoveAugments)
const buildZMoveAugmentDesc = (config) => {
  if (!config) return "";
  return josa(`${config.type} 타입 공격기를 ${config.moveName}#{으로} 변경합니다.\n상대에게 반드시 명중하며 ${config.hitEffectText}\n방어 계열 기술을 깨뜨릴 수 있으며, 그 경우 대미지가 ¼이 된다.`);
};

// 증강 ID 또는 객체가 Z기술 증강인지 판정
// 사용처: AugmentSelectModal.js
export const isZMoveAugment = (augOrId) => {
  const id = typeof augOrId === "string" ? augOrId : augOrId?.id;
  return Boolean(id && Z_MOVE_AUGMENT_CONFIGS[id]);
};

// 증강 ID 또는 객체로 Z기술 설정 조회
// 사용처: AugmentIcon.js, AugmentSkillSelectView.js, ZMove.js (isEligibleBaseSkillForZMove, buildZMoveFromSkill)
export const getZMoveConfig = (augOrId) => {
  const id = typeof augOrId === "string" ? augOrId : augOrId?.id;
  return (id && Z_MOVE_AUGMENT_CONFIGS[id]) || null;
};

// 포켓몬이 이미 Z기술(isZMove)을 보유하고 있는지 판정
// 사용처: ZMove.js (hasEligibleSkillForZMove)
const hasZMove = (pokemon) => {
  if (!pokemon?.skill) return false;
  return [1, 2, 3, 4].some((slot) => Boolean(pokemon.skill[slot]?.feature?.isZMove));
};

const Z_MOVE_AUGMENT_CONFIGS = {
  infernoOverdrive: {
    augmentId: "infernoOverdrive",
    moveName: "다이내믹풀플레임",
    type: "불꽃",
    cost: 5,
    hitEffectText: "강력한 Z파워로 상대를 공격합니다.",
    effectDesc: DEFAULT_Z_EFFECT_DESC,
    skillEffect: null,
  },
};
