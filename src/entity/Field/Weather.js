// Weather.js
import { speedCheck } from "../../util/speedCheck";

export class Weather {
  constructor() {
    this.type = null; // 현재 날씨: "쾌청", "비", null
    this.turnRemain = null;
  }

  #setWeather(weatherType, turnRemain, enqueue, battle, weatherText) {
    this.type = weatherType;
    this.turnRemain = turnRemain;
    if (weatherText) enqueue({ battle, text: weatherText });
  }

  setWeatherOnBattle(battle, enqueue, pokemon, weatherType, weatherText) {
    if (this.type === weatherType) return; // 이미 같은 날씨면 무시

    const itemExtendMap = {
      비: "축축한바위",
      쾌청: "뜨거운바위",
    };

    const baseTurn = 5;
    const turnRemain = pokemon.item === itemExtendMap[weatherType] ? 8 : baseTurn;

    this.#setWeather(weatherType, turnRemain, enqueue, battle, weatherText);

    this.#handleWeatherStartEffect(battle, enqueue, weatherType);
  }

  // 턴 종료시 날씨 처리
  handleWeatherTurnEnd(battle, enqueue) {
    if (this.type === null) return;

    this.turnRemain--;
    if (this.turnRemain <= 0) {
      this.#handleWeatherEnd(battle, enqueue);
    }
  }

  #handleWeatherEnd(battle, enqueue) {
    const endedType = this.type;
    this.type = null;
    this.turnRemain = null;

    // 공통 종료 텍스트
    const endTextMap = {
      비: "비가 그쳤다!",
      쾌청: "햇살이 원래대로 되돌아왔다!",
    };
    enqueue({ battle, text: endTextMap[endedType] });

    // 날씨별 부가 종료 효과
    this.#handleWeatherEndEffect(battle, enqueue, endedType);
  }

  // 날씨 부가 효과 (시작 시)
  #handleWeatherStartEffect(battle, enqueue, weatherType) {
    if (weatherType === "쾌청") {
      const fastUser = speedCheck(battle);
      const slowUser = fastUser === "npc" ? "player" : "npc";
      battle[fastUser].handleProtosynthesis(battle, enqueue);
      battle[slowUser].handleProtosynthesis(battle, enqueue);
    }
  }

  // 날씨 부가 효과 (종료 시)
  #handleWeatherEndEffect(battle, enqueue, weatherType) {
    if (weatherType === "쾌청") {
      const fastUser = speedCheck(battle);
      const slowUser = fastUser === "npc" ? "player" : "npc";
      battle[fastUser].handleProtosynthesisEnd(battle, enqueue);
      battle[slowUser].handleProtosynthesisEnd(battle, enqueue);
    }
  }
}
