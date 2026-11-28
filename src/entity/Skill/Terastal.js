// 테라스탈 관련 코어 로직 (증강 및 추후 하단 UI 트리거 공용)

// 현재 포켓몬이 테라스탈을 사용할 수 있는지 판정 (팀당 배틀 1회, 기믹 중복/다이맥스/무한다이맥스 제외)
// 사용처: AugmentData.js, 추후 Bottom-Skill.js
export const isTeraAble = (pokemon, battle = null) => {
  if (!pokemon || pokemon.faint) return false;
  if (pokemon.isTera) return false;
  if (battle?.system?.teraUsed?.[pokemon.team]) return false;
  if (pokemon.isGimmik) return false;
  if (pokemon.tempStatus?.dynamax > 0) return false;
  if (pokemon.uniqueKey === "0890-m") return false;
  return Boolean(pokemon.teraType || pokemon.type1);
};

// 포켓몬에게 테라스탈을 적용 (방어 타입을 테라타입 단일 타입으로 변경, 배틀 종료/기절 전까지 유지)
// 사용처: AugmentData.js, 추후 battleStart.js
export const applyTerastal = (pokemon, teraType = null, battle = null) => {
  if (!pokemon || pokemon.faint || pokemon.isTera) return false;
  const resolvedType = teraType || pokemon.teraType || pokemon.o?.teraType || pokemon.type1 || "노말";

  pokemon.teraType = resolvedType;
  pokemon.isTera = true;
  pokemon.isGimmik = true;
  pokemon.type1 = resolvedType;
  pokemon.type2 = null;

  if (battle?.system && pokemon.team) {
    if (!battle.system.teraUsed) {
      battle.system.teraUsed = { player: false, npc: false };
    }
    battle.system.teraUsed[pokemon.team] = true;
    if (battle.system.teraTrigger) {
      battle.system.teraTrigger[pokemon.team] = false;
    }
  }

  return true;
};

// 테라스탈 여부를 반영한 자속보정(STAB) 배율 및 로그 라벨 계산
// 사용처: damageCalculate.js
export const getStabMultiplier = (skill, attackPokemon, atkAbil = null) => {
  if (!skill || !attackPokemon || skill.name === "발버둥") {
    return { multiplier: 1, label: "" };
  }

  if (!attackPokemon.isTera) {
    if (skill.type === attackPokemon.type1 || skill.type === attackPokemon.type2) {
      if (atkAbil === "적응력") {
        return { multiplier: 2, label: "자속보정+적응력" };
      }
      return { multiplier: 1.5, label: "자속보정" };
    }
    return { multiplier: 1, label: "" };
  }

  const teraType = attackPokemon.teraType || attackPokemon.type1;
  const orig1 = attackPokemon.o?.type1;
  const orig2 = attackPokemon.o?.type2;
  const matchesTera = skill.type === teraType;
  const matchesOrigin = skill.type === orig1 || (Boolean(orig2) && skill.type === orig2);

  if (matchesTera && matchesOrigin) {
    if (atkAbil === "적응력") {
      return { multiplier: 2.25, label: "테라+자속+적응력" };
    }
    return { multiplier: 2, label: "테라+자속" };
  }
  if (matchesTera) {
    if (atkAbil === "적응력") {
      return { multiplier: 2, label: "테라+적응력" };
    }
    return { multiplier: 1.5, label: "테라" };
  }
  if (matchesOrigin) {
    return { multiplier: 1.5, label: "자속보정" };
    // 갸라도스가 물테라하고 비행기술써도 1.5배 자속보정은 그대로 적용됨
    // 단 적응력은 적용되지 않음
    // 방어상성은 단일 물타입 이 맞음
  }
  return { multiplier: 1, label: "" };
};
