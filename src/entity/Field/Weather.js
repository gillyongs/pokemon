// Weather.js
import { speedCheck } from "../../util/speedCheck";

export class Weather {
  #type = null; // 현재 날씨: "쾌청", "비", null
  #turnRemain = null; // 남은 턴 수

  get() {
    return this.#type;
  }

  get isSunny() {
    return this.#type === "쾌청";
    // 고대활성, 아침햇살, 진홍빛고동, 번개/폭풍 명중률, 얼음 상태이상 실패
  }

  get isRainy() {
    return this.#type === "비";
    // 번개/폭풍 필중
  }

  #setWeather(weatherType, turnRemain, enqueue, battle, weatherText) {
    this.#type = weatherType;
    this.#turnRemain = turnRemain;
    if (weatherText) enqueue({ battle, text: weatherText });
  }

  setWeatherOnBattle(battle, enqueue, pokemon, weatherType, weatherText) {
    if (this.#type === weatherType) return; // 이미 같은 날씨면 무시
    const endedType = this.#type;

    const itemExtendMap = {
      비: "축축한바위",
      쾌청: "뜨거운바위",
    };

    const baseTurn = 5;
    const turnRemain = pokemon.item === itemExtendMap[weatherType] ? 8 : baseTurn;

    this.#setWeather(weatherType, turnRemain, enqueue, battle, weatherText);

    this.#handleWeatherStartEffect(battle, enqueue, weatherType);
    this.#handleWeatherEndEffect(battle, enqueue, endedType);
  }

  // 턴 종료시 날씨 처리
  handleWeatherTurnEnd(battle, enqueue) {
    if (this.#type === null) return;

    this.#turnRemain--;
    if (this.#turnRemain <= 0) {
      this.#handleWeatherEnd(battle, enqueue);
    }
  }

  #handleWeatherEnd(battle, enqueue) {
    const endedType = this.#type;
    this.#type = null;
    this.#turnRemain = null;

    const endTextMap = {
      비: "비가 그쳤다!",
      쾌청: "햇살이 원래대로 되돌아왔다!",
    };
    enqueue({ battle, text: endTextMap[endedType] });

    // 날씨별 종료 효과
    this.#handleWeatherEndEffect(battle, enqueue, endedType);
  }

  // 날씨 부가 효과 (시작 시)
  #handleWeatherStartEffect(battle, enqueue, weatherType) {
    if (weatherType === "쾌청") {
      const fastUser = speedCheck(battle);
      const slowUser = fastUser === "npc" ? "player" : "npc";
      // 쾌청으로 인한 고대활성 발동
      battle[fastUser].handleProtosynthesis(battle, enqueue);
      battle[slowUser].handleProtosynthesis(battle, enqueue);
    }
  }

  // 날씨 부가 효과 (종료 시)
  #handleWeatherEndEffect(battle, enqueue, weatherType) {
    if (weatherType === "쾌청") {
      const fastUser = speedCheck(battle);
      const slowUser = fastUser === "npc" ? "player" : "npc";
      // 쾌청으로 인한 고대활성 종료
      battle[fastUser].handleProtosynthesisEnd(battle, enqueue);
      battle[slowUser].handleProtosynthesisEnd(battle, enqueue);
    }
  }
}
