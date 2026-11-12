const hasAugmentId = (pokemon, id) => {
  if (typeof pokemon?.hasAugment === "function") {
    return pokemon.hasAugment(id);
  }
  return Array.isArray(pokemon?.augments) && pokemon.augments.some((a) => (typeof a === "string" ? a === id : a?.id === id));
};

// 최대 HP 실 수치 계산 함수 (원본 origin.hp는 유지하고 증강 효과를 합산)
export const hpCalculate = (pokemon, baseHp = null) => {
  if (!pokemon) return 0;

  let hp = baseHp !== null && baseHp !== undefined ? baseHp : (pokemon.origin?.hp ?? pokemon.hp ?? 0);
  if (typeof hp !== "number" || Number.isNaN(hp) || hp <= 0) {
    return Math.max(0, Number(hp) || 0);
  }

  let logText = `${hp}(hp)`;

  // 1. 곱적용 증강 =============================================================
  // 인생의 동반자: 모든 능력치 1.1배
  if (hasAugmentId(pokemon, "lifePartner")) {
    hp = Math.round(hp * 1.1);
    logText += " * 1.1 (인생의 동반자)";
  }

  // 2. 합적용 증강 =============================================================
  // 거인의 흡수: 누적 흡수량만큼 추가 HP 증가
  if (hasAugmentId(pokemon, "giantAbsorption")) {
    const aug = pokemon.augments?.find((a) => (typeof a === "string" ? a === "giantAbsorption" : a?.id === "giantAbsorption"));
    const bonusHp = Number(pokemon.giantBonusHp ?? aug?.giantBonusHp ?? 0);
    if (bonusHp > 0) {
      hp += bonusHp;
      logText += ` + ${bonusHp} (거인의 흡수)`;
    }
  }

  logText += ` = ${hp}`;
  try {
    if (pokemon.log) {
      pokemon.log.hpCalculate = logText;
    }
  } catch (e) {}

  return hp;
};
