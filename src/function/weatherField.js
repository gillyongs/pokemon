import { speedCheck } from "../util/speedCheck";
import { maxStatFinder, getStatName } from "./rankStat";

/**
 * 개별 포켓몬의 고대활성 발동 처리
 */
const handleProtosynthesis = (battle, pokemon, enqueue) => {
  if (pokemon.abil !== "고대활성" || pokemon.tempStatus.protosynthesis !== null) return;

  const maxKey = maxStatFinder(pokemon);
  pokemon.tempStatus.protosynthesis = maxKey;

  enqueue({
    battle,
    text: `[특성 고대활성] ${pokemon.names} 쾌청에 의해 고대활성을 발동했다!`,
  });

  enqueue({
    battle,
    text: `[특성 고대활성] ${pokemon.name}의 ${getStatName(maxKey)}이(가) 강화되었다!`,
  });
};

/**
 * 날씨를 쾌청으로 전환하고, 고대활성 특성 포켓몬 발동 처리
 */
export const sunny = (battle, enqueue, text) => {
  // 이미 쾌청이면 종료
  if (battle.field.weather === "쾌청") return;

  // 날씨 변경
  battle.field.weather = "쾌청";
  battle.field.weatherTurnRemain = 5;

  if (text) enqueue({ battle, text });

  // 빠른 쪽 / 느린 쪽 계산
  const fastUser = speedCheck(battle);
  const slowUser = fastUser === "npc" ? "player" : "npc";

  // 두 포켓몬 처리
  handleProtosynthesis(battle, battle[fastUser], enqueue);
  handleProtosynthesis(battle, battle[slowUser], enqueue);
};
