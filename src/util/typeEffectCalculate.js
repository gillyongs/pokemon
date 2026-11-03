const hasType = (type, t1, t2) => t1 === type || t2 === type;
const isOneOf = (value, list) => list.includes(value);

export const ALL_POKEMON_TYPES = ["노말", "불꽃", "물", "풀", "전기", "얼음", "격투", "독", "땅", "비행", "에스퍼", "벌레", "바위", "고스트", "드래곤", "악", "강철", "페어리"];

export const TYPE_COLORS = {
  노말: "#A0A29F",
  불꽃: "#E73B3C",
  물: "#3390F8",
  풀: "#56B13F",
  전기: "#F3C523",
  얼음: "#3BD2DA",
  격투: "#EB812A",
  독: "#9E4ED7",
  땅: "#A76735",
  비행: "#8FA8DD",
  에스퍼: "#E44B79",
  벌레: "#9DB922",
  바위: "#B5B08C",
  고스트: "#664082",
  드래곤: "#4A6DE0",
  악: "#4B4242",
  강철: "#6093A8",
  페어리: "#F37CE6",
};

// 심안(고스트 면역 무시)
const isMindEye = (pokemon, skillType, t1, t2) => {
  return (pokemon?.abil === "심안" || pokemon?.abil === "배짱") && isOneOf(skillType, ["격투", "노말"]) && hasType("고스트", t1, t2);
};

export const typeCheck = (skillType, t1, t2, skillName) => {
  // 특성, 아이템등을 반영하지 않고 오직 상성만을 체크
  // field.js: 스텔스록 데미지 계산
  // npc 교체 판단에 사용
  if (isNoEffect(skillType, t1, t2)) return 0;
  return onlyTypeEffectCalculate(skillType, t1, t2, skillName);
};

export const typeCheckOnBattle = (battle, skillType, t1, t2, skillName, defPoke = null) => {
  // 배틀에 적용되는 실제 상성
  // damageCalculate(상성보정 데미지계산), skillUse("효과가 굉장했다!" 상성 텍스트 및 무효 스킬 실패 처리)에서 호출된다
  // 타오르는불꽃은 버프 효과가 있기에 skillCheck에서 따로 처리
  const atk = battle?.[battle?.turn?.atk];
  const def = defPoke || battle?.[battle?.turn?.def];
  const activeSkillName = skillName || atk?.turn?.useSkill?.name || atk?.origin?.skill?.[battle?.turn?.atkSN]?.name;

  // [증강: 무효 겟또다제]
  if (def?.hasAugment?.("nullifyGetto")) {
    const aug = def.augments?.find((a) => typeof a === "object" && a.id === "nullifyGetto");
    if (aug?.selectedType && aug.selectedType === skillType) {
      return 0;
    }
  }

  if (isNoEffect(skillType, t1, t2) && !isMindEye(atk, skillType, t1, t2)) {
    return 0;
  }

  // 부유, 풍선 처리
  if (skillType === "땅" && def?.isFlying && def.isFlying(battle, true)) {
    return 0;
  }

  return onlyTypeEffectCalculate(skillType, t1, t2, activeSkillName);
};

export const getTypeText = (typeDamage) => {
  // 상성 텍스트 출력
  // skillUse에서 typeEffectCalculateOnBattle을 호출하여 나온 계산값에 따라 텍스트를 리턴한다
  if (typeDamage === 1) {
    return null;
  }
  if (typeDamage > 1) {
    return "효과가 굉장했다!";
  }
  if (typeDamage === 0) {
    return "효과가 없는 것 같다...";
  }
  if (typeDamage < 1) {
    return "효과가 별로인 것 같다...";
  }
};

export const getTypeEffectText = (pokemon, skillType, t1, t2, skillClass, skillName, defPokemon = null) => {
  // 스킬창 밑에 뜨는 상성 텍스트
  // 부유, 건조피부, 저수 등 상대방의 특성은 반영하지 않고
  // 심안 등 본인의 특성은 반영해서 보여준다.
  // skillButton(메인화면), InfoSkillButton(교체화면)에서 사용

  if (skillClass === "natk" || skillClass === "buf") {
    return;
  }

  // npc한테 증강 없어서 상관없긴 한데 굳이 뺼 필욘 없으니까...
  if (defPokemon?.hasAugment?.("nullifyGetto")) {
    const aug = defPokemon.augments?.find((a) => typeof a === "object" && a.id === "nullifyGetto");
    if (aug?.selectedType && aug.selectedType === skillType) {
      return "✕ 효과가 없음";
    }
  }
  if (isNoEffect(skillType, t1, t2) && !isMindEye(pokemon, skillType, t1, t2)) {
    return "✕ 효과가 없음";
  }

  const mult = onlyTypeEffectCalculate(skillType, t1, t2, skillName);

  if (mult === 1) return "○ 효과가 있음";
  if (mult > 1) return "◎ 효과가 굉장함";
  if (mult === 0) return "✕ 효과가 없음";
  return "△ 효과가 별로";
};

// 순수 상성 보정 계산
const onlyTypeEffectCalculate = (skillType, t1, t2, skillName) => {
  let result = 1;
  const chart = typeChart[skillType];
  if (!chart) {
    console.error("존재하지 않는 타입");
    return 1;
  }

  // 1배는 chart[t1]이 null이여서 계산 생략됨
  if (skillName === "프리즈드라이" && t1 === "물") result *= 2;
  else if (chart[t1]) result *= chart[t1];

  if (skillName === "프리즈드라이" && t2 === "물") result *= 2;
  else if (chart[t2]) result *= chart[t2];

  return result;
};

// 0배 상성 여부 (순수 타입)
export const isNoEffect = (skillType, t1, t2) => {
  return typeChart[skillType][t1] === 0 || typeChart[skillType][t2] === 0;
};

const typeChart = {
  노말: { 바위: 0.5, 고스트: 0, 강철: 0.5, 기타: 1 },
  불꽃: {
    풀: 2,
    얼음: 2,
    벌레: 2,
    강철: 2,
    불꽃: 0.5,
    물: 0.5,
    바위: 0.5,
    드래곤: 0.5,
    기타: 1,
  },
  물: { 불꽃: 2, 땅: 2, 바위: 2, 물: 0.5, 풀: 0.5, 드래곤: 0.5, 기타: 1 },
  풀: {
    물: 2,
    땅: 2,
    바위: 2,
    불꽃: 0.5,
    풀: 0.5,
    독: 0.5,
    비행: 0.5,
    벌레: 0.5,
    드래곤: 0.5,
    강철: 0.5,
    기타: 1,
  },
  전기: { 물: 2, 비행: 2, 전기: 0.5, 풀: 0.5, 땅: 0, 드래곤: 0.5, 기타: 1 },
  얼음: {
    풀: 2,
    땅: 2,
    비행: 2,
    드래곤: 2,
    불꽃: 0.5,
    물: 0.5,
    강철: 0.5,
    얼음: 0.5,
    기타: 1,
  },
  격투: {
    노말: 2,
    얼음: 2,
    바위: 2,
    악: 2,
    강철: 2,
    독: 0.5,
    비행: 0.5,
    에스퍼: 0.5,
    벌레: 0.5,
    페어리: 0.5,
    고스트: 0,
    기타: 1,
  },
  독: {
    풀: 2,
    페어리: 2,
    독: 0.5,
    땅: 0.5,
    바위: 0.5,
    고스트: 0.5,
    강철: 0,
    기타: 1,
  },
  땅: {
    불꽃: 2,
    전기: 2,
    독: 2,
    바위: 2,
    강철: 2,
    풀: 0.5,
    벌레: 0.5,
    비행: 0,
    기타: 1,
  },
  비행: { 풀: 2, 격투: 2, 벌레: 2, 전기: 0.5, 바위: 0.5, 강철: 0.5, 기타: 1 },
  에스퍼: { 격투: 2, 독: 2, 에스퍼: 0.5, 악: 0, 강철: 0.5, 기타: 1 },
  벌레: {
    풀: 2,
    에스퍼: 2,
    악: 2,
    불꽃: 0.5,
    격투: 0.5,
    독: 0.5,
    비행: 0.5,
    고스트: 0.5,
    강철: 0.5,
    페어리: 0.5,
    기타: 1,
  },
  바위: {
    불꽃: 2,
    얼음: 2,
    벌레: 2,
    비행: 2,
    격투: 0.5,
    땅: 0.5,
    강철: 0.5,
    기타: 1,
  },
  고스트: { 고스트: 2, 에스퍼: 2, 노말: 0, 악: 0.5, 기타: 1 },
  드래곤: { 드래곤: 2, 강철: 0.5, 페어리: 0, 기타: 1 },
  악: { 에스퍼: 2, 고스트: 2, 격투: 0.5, 악: 0.5, 페어리: 0.5, 기타: 1 },
  강철: {
    얼음: 2,
    바위: 2,
    페어리: 2,
    불꽃: 0.5,
    물: 0.5,
    전기: 0.5,
    강철: 0.5,
    기타: 1,
  },
  페어리: {
    격투: 2,
    드래곤: 2,
    악: 2,
    불꽃: 0.5,
    독: 0.5,
    강철: 0.5,
    기타: 1,
  },
};
