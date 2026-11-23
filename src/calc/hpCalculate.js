const hasAugmentId = (pokemon, id) => {
  if (typeof pokemon?.hasAugment === "function") {
    return pokemon.hasAugment(id);
  }
  return Array.isArray(pokemon?.augments) && pokemon.augments.some((a) => (typeof a === "string" ? a === id : a?.id === id));
};

// 최대 HP 실 수치 계산 함수 (원본 o.hp를 유지하고 증강 효과를 합산)
export const hpCalculate = (pokemon) => {
  let hp = pokemon.baseHp;

  let logText = `${hp}(hp)`;

  // 합적용 증강 =============================================================
  // 거인의 흡수: 누적 흡수량만큼 추가 HP 증가
  if (hasAugmentId(pokemon, "giantAbsorption")) {
    const aug = pokemon.augments?.find((a) => (typeof a === "string" ? a === "giantAbsorption" : a?.id === "giantAbsorption"));
    const bonusHp = Number(pokemon.giantBonusHp ?? aug?.giantBonusHp ?? 0);
    if (bonusHp > 0) {
      hp += bonusHp;
      logText += ` + ${bonusHp} (거인의 흡수)`;
    }
  }

  // 곱적용 증강 =============================================================
  // 하이퍼 바디: 파티 전원의 Max HP가 50% 증가
  if (pokemon?.hasAugmentOnTeam?.("hyperBody") || hasAugmentId(pokemon, "hyperBody")) {
    hp = Math.round(hp * 1.5);
    logText += ` * 1.5 (하이퍼 바디)`;
  }

  // 커져라!: 이번 라운드 동안 체력 1.5배 증가
  if (hasAugmentId(pokemon, "growUp")) {
    hp = Math.round(hp * 1.5);
    logText += ` * 1.5 (커져라!)`;
  }

  logText += ` = ${hp}`;
  pokemon.log.hpCalculate = logText;

  return hp;
};
