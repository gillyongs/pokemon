export const BattleAccess = {
  // --- 필드 구성요소 접근자 ---
  get weather() {
    return this.field?.weather;
  },

  get terrain() {
    return this.field?.terrain;
  },

  get room() {
    return this.field?.room;
  },

  // --- 날씨 상태 접근자 (Weather 메서드에 현재 battle 인스턴스를 단방향 전달) ---
  get isSunny() {
    return Boolean(this.field?.weather?.isSunny?.(this));
  },

  get isRainy() {
    return Boolean(this.field?.weather?.isRainy?.(this));
  },

  get isSandstorm() {
    return Boolean(this.field?.weather?.isSandstorm?.(this));
  },

  get isSnow() {
    return Boolean(this.field?.weather?.isSnow?.(this));
  },

  get isDeltaStream() {
    return Boolean(this.field?.weather?.isDeltaStream?.(this));
  },

  get isHeavyRain() {
    return Boolean(this.field?.weather?.isHeavyRain?.(this));
  },

  get isHarshSun() {
    return Boolean(this.field?.weather?.isHarshSun?.(this));
  },

  get hasWeather() {
    return Boolean(this.field?.weather?.hasWeather?.(this));
  },

  // --- 이벤트 시스템 (pub/sub) ---
  on(event, callback) {
    if (!this._events) this._events = {};
    if (!this._events[event]) this._events[event] = [];
    this._events[event].push(callback);
    return this;
  },

  off(event, callback) {
    if (!this._events || !this._events[event]) return this;
    if (!callback) {
      delete this._events[event];
    } else {
      this._events[event] = this._events[event].filter((cb) => cb !== callback);
    }
    return this;
  },

  emit(event, payload = {}) {
    if (!this._events) {
      this._events = {};
      this.initEventListeners?.();
    }
    if (!this._events[event]) return;
    const handlers = [...this._events[event]];
    for (const handler of handlers) {
      handler({ battle: this, ...payload });
    }
  },

  initEventListeners() {
    this.on("pokemonLeave", ({ battle, enqueue }) => {
      battle.field?.weather?.handleExtremeWeatherCheck?.(battle, enqueue);
    });
    this.on("pokemonChange", ({ battle, enqueue }) => {
      battle.field?.weather?.handleExtremeWeatherCheck?.(battle, enqueue);
    });
  },
};
