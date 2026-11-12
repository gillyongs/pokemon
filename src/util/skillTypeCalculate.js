import { abilObject } from "../entity/Ability";
import { getWeatherBallType } from "./weatherBall";

export const skillTypeCalculate = (battle, skill, pokemon = null) => {
  if (!skill) return null;

  const pokeObj =
    typeof pokemon === "string"
      ? battle?.[pokemon]
      : pokemon || (battle?.turn?.atk ? battle[battle.turn.atk] : null);

  let type = skill.originType || skill.type;

  // 웨더볼: 날씨가 있는 경우 날씨에 따라 타입 결정
  if (skill.name === "웨더볼") {
    const weatherType = getWeatherBallType(battle?.field?.weather);
    if (weatherType !== "노말") {
      return weatherType;
    }
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
