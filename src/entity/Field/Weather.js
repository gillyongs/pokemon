// Weather.js
import { speedCheck } from "../../calc/speedCheck";

const EXTREME_WEATHERS = ["난기류", "폭우", "큰가뭄"];

const EXTREME_WEATHER_ABIL_MAP = {
  난기류: "델타스트림",
  폭우: "시작의바다",
  큰가뭄: "끝의대지",
};

export class Weather {
  #type = null; // 현재 날씨: "쾌청", "비", "모래바람", "설경", "난기류", "폭우", "큰가뭄", null
  #turnRemain = null; // 남은 턴 수 (난기류/폭우/큰가뭄은 null)

  // 날씨부정 / 에어록에 의한 날씨 무효화 여부
  isSuppressed(battle) {
    const p1 = battle.player;
    const p2 = battle.npc;
    const noWeatherAbils = ["에어록", "날씨부정"];
    return Boolean((!p1.faint && noWeatherAbils.includes(p1.abil.name)) || (!p2.faint && noWeatherAbils.includes(p2.abil.name)));
  }

  // battle.isSunny에서 this.field.weather.isSunny(this)로 접근
  isSunny(battle) {
    if (this.isSuppressed(battle)) return false;
    return this.#type === "쾌청" || this.#type === "큰가뭄";
    // 고대활성, 아침햇살, 진홍빛고동, 번개/폭풍 명중률, 얼음 상태이상 실패
  }

  isRainy(battle) {
    if (this.isSuppressed(battle)) return false;
    return this.#type === "비" || this.#type === "폭우";
    // 번개/폭풍 필중
  }

  isSandstorm(battle) {
    if (this.isSuppressed(battle)) return false;
    return this.#type === "모래바람";
  }

  isSnow(battle) {
    if (this.isSuppressed(battle)) return false;
    return this.#type === "설경";
    // 얼음타입 방어 1.5배, 눈보라 필중, 오로라베일 사용 조건
  }

  // 난기류 여부
  isDeltaStream(battle) {
    if (this.isSuppressed(battle)) return false;
    return this.#type === "난기류";
  }

  // 폭우 여부
  isHeavyRain(battle) {
    if (this.isSuppressed(battle)) return false;
    return this.#type === "폭우";
  }

  // 큰가뭄 여부
  isHarshSun(battle) {
    if (this.isSuppressed(battle)) return false;
    return this.#type === "큰가뭄";
  }

  // 현재 유효한 날씨가 존재하는지 여부
  // 웨더볼 위력 증가 조건
  hasWeather(battle) {
    return this.isSunny(battle) || this.isRainy(battle) || this.isSandstorm(battle) || this.isSnow(battle);
  }

  #setWeather(weatherType, turnRemain, enqueue, battle, weatherText) {
    this.#type = weatherType;
    this.#turnRemain = turnRemain;
    if (weatherText) enqueue({ id: "e89aa2ed-051a-4539-8c4a-4504306726f0", battle, text: weatherText });
  }

  setWeatherOnBattle(battle, enqueue, pokemon, weatherType, weatherText) {
    if (this.#type === weatherType) return; // 이미 같은 날씨면 무시

    const isCurrentExtreme = EXTREME_WEATHERS.includes(this.#type);
    const isNextExtreme = EXTREME_WEATHERS.includes(weatherType);

    // 현재 날씨가 난기류/폭우/큰가뭄 중 하나일 때는 일반 날씨로 바뀌지 않는다 (셋끼리는 서로 교체 가능)
    // 날씨부정이여도 이는 적용된다
    if (isCurrentExtreme && !isNextExtreme) {
      const blockTextMap = {
        난기류: "[특성 델타스트림] 수수께끼의 난기류의 기세는 멈추지 않는다!",
        폭우: "[특성 시작의바다] 강한 비의 기세는 멈추지 않는다!",
        큰가뭄: "[특성 끝의대지] 강한 햇살의 기세는 멈추지 않는다!",
      };
      enqueue({
        id: "e89aa2ed-051a-4539-8c4a-4504306726f1",
        battle,
        text: blockTextMap[this.#type],
      });
      return;
    }

    const endedType = this.#type;

    const itemExtendMap = {
      비: "축축한바위",
      쾌청: "뜨거운바위",
      모래바람: "매끄러운바위",
      설경: "차가운바위",
    };

    const baseTurn = 5;
    const turnRemain = isNextExtreme ? null : pokemon?.item === itemExtendMap[weatherType] ? 8 : baseTurn;

    this.#setWeather(weatherType, turnRemain, enqueue, battle, weatherText);

    this.#handleWeatherStartEffect(battle, enqueue, weatherType);
    this.#handleWeatherEndEffect(battle, enqueue, endedType);
  }

  // 필드 위에 극단적 날씨(난기류/폭우/큰가뭄)를 유지할 수 있는 특성 포켓몬이 여전히 존재하는지 검사
  handleExtremeWeatherCheck(battle, enqueue) {
    if (!this.#type) return;

    const requiredAbil = EXTREME_WEATHER_ABIL_MAP[this.#type];
    // 극단적 날씨가 아니면 종료 검사 불필요
    if (!requiredAbil) return;

    // 필드 위의 active 포켓몬(player, npc) 중 해당 특성을 가진 살아있는 포켓몬이 있는지 확인
    const activePokemons = [battle.player, battle.npc].filter(Boolean);
    const hasActiveSupplier = activePokemons.some((p) => !p.faint && (p.abil?.name === requiredAbil || p.abil === requiredAbil));

    // 필드에 해당 특성 포켓몬이 없으면 날씨 즉시 종료
    if (!hasActiveSupplier) {
      this.#handleWeatherEnd(battle, enqueue);
    }
  }

  // 포켓몬 기절/교체/증강변경 시 델타스트림/시작의바다/끝의대지 날씨 종료 처리 (하위 호환 유지)
  handleExtremeWeatherEnd(battle, enqueue, leavingPokemon) {
    this.handleExtremeWeatherCheck(battle, enqueue);
  }

  // 턴 종료시 날씨 처리
  handleWeatherTurnEnd(battle, enqueue) {
    if (this.#type === null) return;
    if (this.#turnRemain === null) return; // 난기류, 폭우, 큰가뭄은 턴 카운트 없음

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
      모래바람: "모래바람이 가라앉았다!",
      설경: "눈이 그쳤다!",
      폭우: "강한 비가 그쳤다!",
      큰가뭄: "강한 햇살이 원래대로 되돌아왔다!",
      난기류: "수수께끼의 난기류가 사라졌다!",
    };
    if (endTextMap[endedType]) {
      enqueue({ id: "73eac5c5-08df-41f7-8eee-388297d2c5ab", battle, text: endTextMap[endedType] });
    }

    // 날씨별 종료 효과
    this.#handleWeatherEndEffect(battle, enqueue, endedType);
  }

  // 날씨 데미지 처리 (턴 종료 시 1개체 대상)
  handleWeatherDamageTurnEnd(battle, enqueue, user) {
    if (this.isSandstorm(battle)) {
      const p = battle[user];
      if (p.faint) return;
      const immune = p.type1 === "바위" || p.type2 === "바위" || p.type1 === "땅" || p.type2 === "땅" || p.type1 === "강철" || p.type2 === "강철";
      if (!immune) {
        p.getDamage(battle, enqueue, Math.floor(p.maxHp / 16), `모래바람이 ${p.names("를")} 덮쳤다!`);
      }
    }
  }

  // 날씨 부가 효과 (시작 시)
  #handleWeatherStartEffect(battle, enqueue, weatherType) {
    if (weatherType === "쾌청" || weatherType === "큰가뭄") {
      const fastUser = speedCheck(battle);
      const slowUser = fastUser === "npc" ? "player" : "npc";
      // 쾌청/큰가뭄으로 인한 고대활성 발동
      battle[fastUser].handleProtosynthesis(battle, enqueue);
      battle[slowUser].handleProtosynthesis(battle, enqueue);
    }
  }

  // 날씨 부가 효과 (종료 시)
  #handleWeatherEndEffect(battle, enqueue, weatherType) {
    if ((weatherType === "쾌청" || weatherType === "큰가뭄") && !this.isSunny(battle)) {
      const fastUser = speedCheck(battle);
      const slowUser = fastUser === "npc" ? "player" : "npc";
      // 쾌청/큰가뭄 종료로 인한 고대활성 종료
      battle[fastUser].handleProtosynthesisEnd(battle, enqueue);
      battle[slowUser].handleProtosynthesisEnd(battle, enqueue);
    }
  }
}
