// Weather.js
export class Weather {
  constructor() {
    this.type = null; // 현재 날씨 이름
    this.turnRemain = 0;
  }

  #setWeather(type, turnRemain, enqueue, battle, text) {
    this.type = type;
    this.turnRemain = turnRemain;
    if (text && enqueue) enqueue({ battle, text });
  }

  setWeatherRain(battle, enqueue, text, pokemon) {
    if (this.type === "비") return;
    let turnRemain = pokemon.item === "축축한바위" ? 8 : 5;
    this.#setWeather("비", turnRemain, enqueue, battle, text);
  }
}
