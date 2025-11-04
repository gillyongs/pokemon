import { noTraceAbil } from "../entity/Abillity";
import { rank, getStatName, maxStatFinder } from "../function/rankStat";
// ======================================================
// applyAbilityEffects
// ======================================================
export const applyAbilityEffects = (bt, atks, enqueue, trace) => {
  const atk = bt[atks];
  const defs = atks === "player" ? "npc" : "player";
  const def = bt[defs];
  const atkAbil = atk.abil;

  // -------------------------------
  // ① 공통 메시지 특성 (단순 텍스트 출력)
  // -------------------------------
  const messageAbilities = {
    재앙의검: { text: "주위의 방어가 약해졌다!", head: "name" },
    재앙의그릇: { text: "주위의 특수공격이 약해졌다!", head: "name" },
    재앙의구슬: { text: "주위의 특수방어가 약해졌다!", head: "name" },
    재앙의목간: { text: "주위의 공격이 약해졌다!", head: "name" },
    다크오라: { text: "다크오라를 발산하고 있다!", head: "names" },
    페어리오라: { text: "페어리오라를 발산하고 있다!", head: "names" },
    테라볼티지: { text: "세차게 튀는 오라를 발산하고 있다!", head: "names" },
    터보블레이즈: { text: "활활 타오르는 오라를 발산하고 있다!", head: "names" },
    틀깨기: { text: "상대 특성에 방해받지 않고 기술을 사용할 수 있다.", head: "names" },
  };

  if (messageAbilities[atkAbil]) {
    enqueue({
      battle: bt,
      text: `[특성 ${atkAbil}] ${atk[messageAbilities[atkAbil].head]} ${messageAbilities[atkAbil].text}`,
    });
  }

  // -------------------------------
  // ② 능력치 상승 / 하락형 특성
  // -------------------------------
  const rankUpAbilities = {
    불요의검: { cond: atk.item === "녹슨검", stat: "atk", change: 1 },
    불굴의방패: { cond: atk.item === "녹슨방패", stat: "def", change: 1 },
    위협: { cond: !def.tempStatus.substitute, target: defs, stat: "atk", change: -1 },
  };

  Object.entries(rankUpAbilities).forEach(([abil, cfg]) => {
    const text = `[특성 ${abil}]`;
    if (atkAbil === abil && cfg.cond) {
      const target = cfg.target || atks;
      rank(bt, enqueue, target, cfg.stat, cfg.change, text);
    } else if (atkAbil === abil && !cfg.cond && abil === "위협") {
      enqueue({ battle: bt, text: text + " " + def.name + "에겐 효과가 없는 것 같다..." });
    }
  });

  // -------------------------------
  // ③ 혼연일체(흑/백)
  // -------------------------------
  if (atkAbil === "혼연일체(흑)" || atkAbil === "혼연일체(백)") {
    enqueue({
      battle: bt,
      text: `[특성 혼연일체] ${atk.names} 두 가지 특성을 겸비한다!`,
    });
    enqueue({
      battle: bt,
      text: `[특성 혼연일체] ${bt.common[atk.team].teamKrReverse} 편은 긴장해서 나무열매를 먹을 수 없게 되었다!`,
    });
  }

  // -------------------------------
  // ④ 고대활성
  // -------------------------------
  if (atkAbil === "고대활성" && atk.tempStatus.protosynthesis === null) {
    atk.handleProtosynthesis(bt, enqueue);
  }

  // -------------------------------
  // ⑤ 날씨 / 필드 전개형 특성
  // -------------------------------
  const weatherAbilities = {
    잔비: { weatherType: "비", text: "주변에 비가 내리기 시작했다!" },
    가뭄: { weatherType: "쾌청", text: "주변의 햇살이 강해졌다!" },
  };
  Object.entries(weatherAbilities).forEach(([abil, { weatherType, text }]) => {
    if (atkAbil === abil) {
      let weatherAbiltext = `[특성 ${abil}] ${atk.name} ${text}`;
      bt.field.weather.setWeatherOnBattle(bt, enqueue, atk, weatherType, weatherAbiltext);
    }
  });

  const terrainAbilities = {
    그래스메이커: { terrainType: "그래스필드", text: "발밑에 풀이 무성해졌다!" },
    일렉트릭메이커: { terrainType: "일렉트릭필드", text: "발밑에 전기가 떠돌기 시작했다!" },
  };
  Object.entries(terrainAbilities).forEach(([abil, { terrainType, text }]) => {
    if (atkAbil === abil) {
      let terrainAbiltext = `[특성 ${abil}] ${atk.name} ${text}`;
      bt.field.terrain.setTerrainOnBattle(bt, enqueue, atk, terrainType, terrainAbiltext);
    }
  });

  // -------------------------------
  // ⑥ 진홍빛고동 (날씨 조정형)
  // -------------------------------
  if (atkAbil === "진홍빛고동") {
    if (bt.field.weather.isSunny) {
      enqueue({
        battle: bt,
        text: `[특성 진홍빛고동] ${atk.names} 햇살을 받아 고대의 고동을 폭발시켰다!`,
      });
    } else {
      let text = `[특성 진홍빛고동] ${atk.names} 햇살을 강하게 하여 고대의 고동을 폭발시켰다!`;
      bt.field.weather.setWeatherOnBattle(bt, enqueue, atk, "쾌청", text);
    }
  }

  if (atkAbil === "하드론엔진") {
    if (bt.field.terrain.isElectricField) {
      enqueue({
        battle: bt,
        text: `[특성 하드론엔진] ${atk.names} 일렉트릭필드의 힘으로 미래 기관을 가동했다!`,
      });
    } else {
      const text = `[특성 하드론엔진] ${atk.names} 일렉트릭필드를 전개하여 미래 기관을 가동했다!`;
      bt.field.terrain.setTerrainOnBattle(bt, enqueue, atk, "일렉트릭필드", text);
    }
  }

  if (trace) return;

  if (atkAbil === "트레이스") {
    if (noTraceAbil.includes(def.abil)) {
      return;
    } else {
      atk.abil = def.abil;
      atk.abilObj = def.abilObj;
      enqueue({
        battle: bt,
        text: `[특성 트레이스] ${atk.names} ${def.name}의 ${def.abil}를 트레이스했다!`,
      });
      applyAbilityEffects(bt, atks, enqueue, true);
    }
  }

  if (def.abil === "트레이스") {
    //상대방의 특성을 트레이스하지 못한 경우
    //트레이스 가능한 특성이 포켓몬이 등장하면 바로 발동한다
    if (noTraceAbil.includes(atk.abil)) {
      return;
    } else {
      def.abil = atk.abil;
      def.abilObj = atk.abilObj;
      enqueue({
        battle: bt,
        text: `[특성 트레이스] ${def.names} ${atk.name}의 ${atk.abil}를 트레이스했다!`,
      });
      applyAbilityEffects(bt, defs, enqueue, true);
    }
  }

  if (atk.item === "풍선") {
    enqueue({ battle: bt, text: atk.names + " 풍선으로 떠 있다!" });
  }
};
