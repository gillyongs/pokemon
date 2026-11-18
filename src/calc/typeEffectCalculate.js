import { TYPE_CHART } from "../entity/TypeData";

// 심안 / 배짱: 노말·격투 기술로 고스트 타입 면역 관통
const isMindEye = (atk, skillType) => {
  const abilName = atk?.abil?.name;
  return (abilName === "심안" || abilName === "배짱") && (skillType === "격투" || skillType === "노말");
};

// [증강: 이 공격 무효일세] 방어자가 선택한 무효 타입 일치 여부
const hasNullifyAugment = (def, skillType) => {
  if (!def?.hasAugment?.("nullifyGetto")) return false;
  return def.augments.some((a) => typeof a === "object" && a.id === "nullifyGetto" && a.selectedType === skillType);
};

// 단일 방어 타입(t1 또는 t2)에 대한 상성 배율 계산 (0배 포함)
const getSingleTypeMultiplier = (skillType, defType, { atk, def, skillName, isDeltaStream }) => {
  const chart = TYPE_CHART[skillType];

  // 특수 기술: 프리즈드라이는 물 타입에 2배
  if (skillName === "프리즈드라이" && defType === "물") return 2;

  // 공격자 특성: 심안/배짱은 고스트 면역(0배)을 1배로 관통
  if (defType === "고스트" && isMindEye(atk, skillType)) return 1;

  // [증강: 과거의 영광 (에스퍼)] - 피격 시: 에스퍼 타입에 한해 고스트 무효(0배), 악/강철 1배
  // (메가뮤츠X 등 복합 타입은 나머지 타입의 상성과 그대로 곱해짐)
  if (defType === "에스퍼" && def?.hasAugment?.("lostTechnologyPsychic")) {
    if (skillType === "고스트") return 0;
    if (skillType === "악" || skillType === "강철") return 1;
  }

  // [증강: 과거의 영광 (에스퍼)] - 공격 시: 에스퍼 기술로 악/강철 공격 시 1배
  if (skillType === "에스퍼" && atk?.hasAugment?.("lostTechnologyPsychic")) {
    if (defType === "악" || defType === "강철") return 1;
  }

  let mult = chart[defType] ?? 1;

  // 날씨: 난기류(델타스트림) - 비행 타입의 약점(2배)을 1배로 완화
  if (isDeltaStream && defType === "비행" && mult > 1) {
    mult = 1;
  }

  return mult;
};

// 공통 상성 계산 코어 (순수 상성 / 배틀 실상성 / UI 표시 모두 이 파이프라인 공유)
const calculateTypeMultiplier = ({ skillType, t1, t2 = null, skillName = null, atk = null, def = null, battle = null, includeDefHidden = false }) => {
  if (skillName === "발버둥") return 1;

  // 극단적 날씨: 폭우(불꽃 공격 무효), 큰가뭄(물 공격 무효)
  if (battle?.isHeavyRain && skillType === "불꽃") return 0;
  if (battle?.isHarshSun && skillType === "물") return 0;

  // [증강: 이 공격 무효일세]
  if (hasNullifyAugment(def, skillType)) return 0;

  // 배틀 전용 숨겨진 방어 판정 (부유, 풍선 등 - UI에서는 스포일러 방지를 위해 미반영)
  if (includeDefHidden && skillType === "땅" && def?.isFlying?.(battle, true)) {
    return 0;
  }

  const ctx = {
    atk,
    def,
    skillName,
    isDeltaStream: Boolean(battle?.isDeltaStream),
  };

  return getSingleTypeMultiplier(skillType, t1, ctx) * getSingleTypeMultiplier(skillType, t2, ctx);
};

// 순수 타입 상성상 0배(무효) 여부
export const isNoEffect = (skillType, t1, t2) => {
  const chart = TYPE_CHART[skillType];
  if (!chart) return false;
  return chart[t1] === 0 || chart[t2] === 0;
};

// 특성·아이템·날씨·증강을 반영하지 않은 순수 상성 계산
// field.js(스텔스록), easy.js(NPC 교체 점수), ItemSearchModal(추천 아이템)에서 사용
export const typeCheck = (skillType, t1, t2 = null, skillName = null) => {
  return calculateTypeMultiplier({ skillType, t1, t2, skillName });
};

// 배틀에 적용되는 실제 상성 계산
// damageCalculate(상성보정 데미지), skillUse(상성 텍스트 및 무효 실패 처리), onHit(슈케열매)에서 사용
// (타오르는불꽃 등 버프형 무효 특성은 skillCheck에서 별도 처리)
export const typeCheckOnBattle = (battle, skill, atkPoke = null, defPoke = null) => {
  const atk = atkPoke || battle[battle.turn.atk];
  const def = defPoke || battle[battle.turn.def];

  return calculateTypeMultiplier({
    skillType: skill.type,
    t1: def.type1,
    t2: def.type2,
    skillName: skill.name,
    atk,
    def,
    battle,
    includeDefHidden: true,
  });
};

// 배틀 로그용 상성 텍스트 반환 (skillUse에서 사용)
export const getTypeText = (typeDamage) => {
  if (typeDamage === 0) return "효과가 없는 것 같다...";
  if (typeDamage >= 4) return "효과가 매우 굉장했다!";
  if (typeDamage > 1) return "효과가 굉장했다!";
  if (typeDamage === 1) return null;
  if (typeDamage <= 0.25) return "효과가 매우 별로인 것 같다...";
  return "효과가 별로인 것 같다...";
};

// 스킬창 하단 상성 표시 텍스트
// 부유·풍선 등 상대의 숨겨진 특성·도구는 반영하지 않고,
// 본인 특성(심안 등)과 공개된 필드 날씨(난기류·폭우·큰가뭄) 및 증강을 반영한다.
// SkillButton, Bottom-Info, AugmentSkillSelectView에서 사용
export const getTypeEffectText = (battle, pokemon, skill, displayType = null, defPokemon = null) => {
  if (skill.stype === "natk" || skill.stype === "buf") {
    return;
  }
  const def = defPokemon || battle?.npc;
  if (!def) return;

  const mult = calculateTypeMultiplier({
    skillType: displayType || skill.type,
    t1: def.type1,
    t2: def.type2,
    skillName: skill.name,
    atk: pokemon,
    def,
    battle,
    includeDefHidden: false,
  });

  return formatTypeEffectText(mult);
};

// UI용 상성 배율 포맷터
const formatTypeEffectText = (mult) => {
  if (mult === 0) return "✕ 효과가 없음";
  if (mult >= 4) return "☆ 효과가 매우 굉장";
  if (mult > 1) return "◎ 효과가 굉장함";
  if (mult === 1) return "○ 효과가 있음";
  if (mult <= 0.25) return "⟁ 효과가 매우 별로";
  return "△ 효과가 별로";
};
