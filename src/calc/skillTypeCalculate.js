import { abilObject } from "../entity/Ability";

export const skillTypeCalculate = (battle, skill, pokemon = null) => {
  if (!skill) return null;

  const pokeObj =
    typeof pokemon === "string"
      ? battle?.[pokemon]
      : pokemon || (battle?.turn?.atk ? battle[battle.turn.atk] : null);

  let type = skill.originType || skill.type;

  // 웨더볼: 날씨가 있는 경우 날씨에 따라 타입 결정
  if (skill.name === "웨더볼") {
    const weather = battle?.field?.weather;
    if (weather?.isSunny) return "불꽃";
    if (weather?.isRainy) return "물";
    if (weather?.isSandstorm) return "바위";
    const w = typeof weather?.get === "function" ? weather.get() : weather?.get;
    if (w === "설경" || w === "눈") return "얼음";
    type = "노말";
  }

  // 스킨류 특성 (스카이스킨, 페어리스킨 등): 노말 타입 기술을 해당 타입으로 변환 (발버둥 제외)
  const skinFeature = pokeObj?.abilObj?.feature?.skin
    ? pokeObj.abilObj.feature
    : abilObject[pokeObj?.abil]?.feature?.skin
    ? abilObject[pokeObj.abil].feature
    : null;

  if (skinFeature && type === "노말" && skill.name !== "발버둥") {
    return skinFeature.type;
  }

  return type;
};
