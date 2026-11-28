export const skillTypeCalculate = (battle, skill, pokemon = null) => {
  if (!skill) return null;

  const pokeObj = typeof pokemon === "string" ? battle?.[pokemon] : pokemon || (battle?.turn?.atk ? battle[battle.turn.atk] : null);

  let type = skill.originType || skill.type;

  // 테라스탈 상태에서 테라버스트 사용 시 테라타입으로 변환
  if (pokeObj?.isTera && skill.name === "테라버스트") {
    return pokeObj.teraType || pokeObj.type1 || type;
  }

  // 웨더볼: 날씨가 있는 경우 날씨에 따라 타입 결정
  if (skill.name === "웨더볼") {
    if (battle?.isSunny) return "불꽃";
    if (battle?.isRainy) return "물";
    if (battle?.isSandstorm) return "바위";
    if (battle?.isSnow) return "얼음";
    type = "노말";
  }

  // 스킨류 특성 (스카이스킨, 페어리스킨 등): 노말 타입 기술을 해당 타입으로 변환 (발버둥 제외)
  const skinFeature = pokeObj?.abil?.feature?.skin ? pokeObj.abil.feature : null;

  if (skinFeature && type === "노말" && skill.name !== "발버둥") {
    return skinFeature.type;
  }

  return type;
};
