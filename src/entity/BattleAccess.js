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
};
