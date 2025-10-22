import { speedCheck } from "../util/speedCheck";
import { maxStatFinder, getStatName } from "./rankStat";

export const weatherChange = (battle, pokemon, enqueue, weather, text) => {
  const beforeWeather = battle.field.weather;
  const fastUser = speedCheck(battle);
  const slowUser = fastUser === "npc" ? "player" : "npc";

  if (weather === "쾌청") {
    sunny(battle, enqueue, text, pokemon);
  } else if (weather === "비") {
    rainy(battle, enqueue, text, pokemon);
  } else if (weather === null) {
    battle.field.weather = null;
    let text;
    if (beforeWeather === "비") {
      text = "비가 그쳤다!";
    }
    if (beforeWeather === "쾌청") {
      text = "햇살이 원래대로 되돌아왔다!";
    }
    enqueue({ battle, text: text });
    // 빠른 쪽 / 느린 쪽 계산
  }

  if (beforeWeather === "쾌청" && battle.field.weather !== "쾌청") {
    // 두 포켓몬 처리
    handleProtosynthesisEnd(battle, battle[fastUser], enqueue);
    handleProtosynthesisEnd(battle, battle[slowUser], enqueue);
  }
};

export const sunny = (battle, enqueue, text, pokemon) => {
  // 이미 쾌청이면 종료
  if (battle.field.weather === "쾌청") return;

  // 날씨 변경
  battle.field.weather = "쾌청";
  battle.field.weatherTurnRemain = 5;
  if (pokemon.item === "뜨거운바위") battle.field.weatherTurnRemain = 8;

  if (text) enqueue({ battle, text });

  // 빠른 쪽 / 느린 쪽 계산
  const fastUser = speedCheck(battle);
  const slowUser = fastUser === "npc" ? "player" : "npc";

  // 두 포켓몬 처리
  handleProtosynthesis(battle, battle[fastUser], enqueue);
  handleProtosynthesis(battle, battle[slowUser], enqueue);
};

// 개별 포켓몬의 고대활성 발동 처리
const handleProtosynthesis = (battle, pokemon, enqueue) => {
  if (pokemon.abil !== "고대활성" || pokemon.tempStatus.protosynthesis !== null) return;

  const maxKey = maxStatFinder(pokemon);
  pokemon.tempStatus.protosynthesis = maxKey;
  pokemon.tempStatus.protosynthesisBySun = true;

  enqueue({
    battle,
    text: `[특성 고대활성] ${pokemon.names} 쾌청에 의해 고대활성을 발동했다!`,
  });

  enqueue({
    battle,
    text: `[특성 고대활성] ${pokemon.name}의 ${getStatName(maxKey)} 강화되었다!`,
  });
};

const handleProtosynthesisEnd = (battle, pokemon, enqueue) => {
  // 쾌청이 끝나면 쾌청으로 발동한 고대활성 효과가 사라진다
  if (pokemon.abil !== "고대활성" || pokemon.tempStatus.protosynthesis === null) return;
  if (!pokemon.tempStatus.protosynthesisBySun) return; // 쾌청이 아닌 부스트에너지로 발동한 경우 취소되지 않음
  pokemon.tempStatus.protosynthesis = null;
  enqueue({
    battle,
    text: `${pokemon.name}에게서 고대활성의 효과가 사라졌다!`,
  });
  if (pokemon.item === "부스트에너지") {
    //쾌청 끝났을때 지닌 아이템 부스트에너지면 고대활성 재발동
    enqueue({
      battle: battle,
      text: `[특성 고대활성] ${pokemon.names} 부스트에너지에 의해 고대활성을 발동했다!`,
    });
    const maxKey = maxStatFinder(pokemon);
    pokemon.tempStatus.protosynthesis = maxKey;
    enqueue({
      battle,
      text: `[특성 고대활성] ${pokemon.name}의 ${getStatName(maxKey)} 강화되었다!`,
    });
  }
};

export const rainy = (battle, enqueue, text, pokemon) => {
  if (battle.field.weather === "비") return;

  battle.field.weather = "비";
  battle.field.weatherTurnRemain = 5;
  if (pokemon.item === "축축한바위") battle.field.weatherTurnRemain = 8;

  if (text) enqueue({ battle, text });
};
