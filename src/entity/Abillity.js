export const abilObject = {
  리베로: { text: "자신이 사용한 기술과 같은 타입으로 변화한다." },
  정전기: { text: "자신에게 접촉한 상대를 30% 확률로 마비시킨다." },
  프레셔: { text: "상대가 쓰는 기술의 PP를 많이 줄인다." },
  불요의검: { text: "등장했을 때 공격이 1랭크 올라간다." },
  불굴의방패: { text: "등장했을 때 방어가 1랭크 올라간다." },
  그래스메이커: { text: "전투에 나오면 지형을 그래스필드로 만든다." },
  일렉트릭메이커: { text: "전투에 나오면 지형을 일렉트릭필드로 만든다." },
  잔비: { text: "전투에 나오면 날씨를 5턴 간 비로 바꾼다." },
  가뭄: { text: "전투에 나오면 날씨를 5턴 간 쾌청으로 바꾼다." },
  진홍빛고동: {
    text: "등장했을 때 날씨를 맑음으로 만든다. 햇살이 강하면 고대의 고동에 의해 공격이 1.3배가 된다.",
  },
  하드론엔진: {
    text: "등장했을 때 일렉트릭필드를 전개한다. 일렉트릭필드일 때 미래 기관에 의해 특수공격이 1.3배가 된다.",
  },
  재생력: { text: "교체 시 총 체력의 1/3을 회복한다." },
  자연회복: { text: "교체 시 상태 이상을 회복한다" },
  근성: { text: "상태 이상이 되면 근성을 보여서 공격이 올라간다." },
  위협: { text: "등장했을 상대를 위축시켜 공격을 떨어뜨린다." },
  고대활성: {
    text: "부스트에너지를 지니고 있거나 날씨가 맑을 때 가장 높은 능력이 올라간다.",
  },
  보이지않는주먹: {
    text: "상대에게 접촉하는 기술을 사용할 경우 방어 등을 무시하고 대미지를 입힐 수 있다.",
  },
  질풍날개: { text: "자신의 모든 비행 타입 기술의 우선도가 1 증가한다." },
  이판사판: { text: "반동 데미지를 받는 기술들의 위력이 1.2배 증가한다." },
  독치장: {
    text: "물리 기술로 데미지를 입으면 상대의 발밑에 독압정을 뿌린다.",
  },
  페어리오라: { text: "필드 전원의 페어리타입 기술이 4/3배 강해진다." },
  다크오라: { text: "필드 전원의 악타입 기술이 4/3배 강해진다." },
  까칠한피부: {
    text: "공격을 받았을 때 자신에게 접촉한 상대에게 1/8의 데미지를 준다.",
    feature: { hanka: true },
  },
  철가시: {
    text: "공격을 받았을 때 자신에게 접촉한 상대에게 1/8의 데미지를 준다.",
    feature: { hanka: true },
  },
  옹골찬턱: { text: "무는 기술의 위력이 1.5배 강해진다." },
  스킬링크: { text: "연속 기술을 사용하면 항상 최고 횟수로 사용할 수 있다." },
  적응력: { text: "자신과 같은 타입인 기술의 위력이 올라간다." },
  트레이스: { text: "상대의 특성을 트레이스해서 같은 특성이 된다." },
  재앙의검: {
    text: "이 특성을 가진 포켓몬을 제외한 모든 포켓몬의 방어를 약하게 만든다.",
  },
  재앙의구슬: {
    text: "이 특성을 가진 포켓몬을 제외한 모든 포켓몬의 특수방어를 약하게 만든다.",
  },
  천하장사: { text: "물리 기술의 위력이 2배가 된다." },

  // 틀깨기 반영
  재앙의그릇: {
    text: "이 특성을 가진 포켓몬을 제외한 모든 포켓몬의 특수공격을 약하게 만든다.",
  }, // 틀깨기면 무시된다
  재앙의목간: {
    text: "이 특성을 가진 포켓몬을 제외한 모든 포켓몬의 공격을 약하게 만든다.",
  }, // 틀깨기면 무시된다

  탈: { text: "탈로 1번 공격을 막을 수 있다." }, // 틀깨기에 무시된다
  천진: { text: "상대의 능력 변화를 무시하고 싸울 수 있다." }, // 틀깨기면 무시된다
  멀티스케일: { text: "HP가 꽉 찼을 때 받는 데미지가 절반으로 줄어든다." }, // 틀깨기면 무시된다
  옹골참: {
    text: "일격기가 통하지 않으며 체력이 가득찬 상태에서 일격에 쓰러지지 않는다.",
  }, // 틀깨기면 무시된다
  타오르는불꽃: {
    text: "불꽃타입 기술로 공격을 받으면 자신이 사용하는 불꽃타입의 기술이 1.5배 강해진다.",
  }, // 틀깨기면 무시된다

  심술꾸러기: {
    text: "능력의 변화가 역전해서 올라갈 때 떨어지고 떨어질 때 올라간다.",
  }, // 틀깨기면 랭크업을 똑바로 적용시킨다 (구현x)
  부유: { text: "땅 타입 기술에 맞지 않는다." }, // 틀깨기면 땅타입 기술을 맞힐 수 있다. 압정이나 필드 효과가 일부 적용된다
  심안: {
    text: "노말타입과 격투타입 기술을 고스트타입에게 맞힐 수 있다. 상대의 회피율 변화를 무시하고 명중률도 떨어지지 않는다.",
  },
  // 틀깨기면 명중률을 떨어뜨릴 수 있다 (구현x)

  // 틀깨기
  틀깨기: {
    text: "상대 특성에 방해받지 않고 상대에게 기술을 쓸 수 있다.",
    feature: { tgg: true },
  },
  테라볼티지: {
    text: "상대 특성에 방해받지 않고 상대에게 기술을 쓸 수 있다.",
    feature: { tgg: true },
  },
  터보블레이즈: {
    text: "상대 특성에 방해받지 않고 상대에게 기술을 쓸 수 있다.",
    feature: { tgg: true },
  },

  // 자기과신
  비스트부스트: {
    text: "상대를 기절시켰을 때 자신의 가장 높은 능력이 올라간다.",
    feature: { swip: "max" },
  },
  "혼연일체(흑)": {
    text: "상대를 긴장시켜 나무열매를 먹지 못하게 한다. 상대를 쓰러뜨리면 특수공격이 올라간다.",
    feature: { swip: "catk" },
  },
  "혼연일체(백)": {
    text: "상대를 긴장시켜 나무열매를 먹지 못하게 한다. 상대를 쓰러뜨리면 공격이 올라간다.",
    feature: { swip: "atk" },
  },
};

// 트레이스로 배낄 수 없는 특성
// 테라볼티지, 터보블레이즈, 재앙시리즈, 불가사의부적 가능
const noTraceAbil = ["트레이스", "혼연일체(흑)", "혼연일체(백)", "탈", "배틀스위치", "고대활성", "쿼크차지", "테라체인지", "테라셀", "제로포밍", "어군", "절대안깸", "플라워기프트", "화학의힘", "일루전", "유대변화", "스웜체인지", "리시버", "리밋실드", "달마모드", "기분파", "괴짜", "AR시스템", "그대로꿀꺽미사일", "아이스페이스", "일루전"];

export const applyAbilityEffects = (bt, atks, enqueue, trace) => {
  const atk = bt[atks];
  const defs = atks === "player" ? "npc" : "player";
  const def = bt[defs];
  const atkAbil = atk.abil;

  // ==================================================================================
  // 단순 텍스트 출력
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

  // ==================================================================================
  // 랭크 관련
  const rankUpAbilities = {
    불요의검: { cond: atk.item === "녹슨검", target: "atk", stat: "atk", value: 1 },
    불굴의방패: { cond: atk.item === "녹슨방패", target: "atk", stat: "def", value: 1 },
    위협: { cond: !def.tempStatus.substitute, target: "def", stat: "atk", value: -1 },
  };

  Object.entries(rankUpAbilities).forEach(([abil, cfg]) => {
    const abilText = `[특성 ${abil}]`;
    if (atkAbil === abil && cfg.cond) {
      const target = cfg.target === "atk" ? atk : def;
      target.rankUp(bt, enqueue, cfg.stat, cfg.value, abilText);
    } else if (atkAbil === abil && !cfg.cond && abil === "위협") {
      enqueue({ battle: bt, text: abilText + " " + def.name + "에겐 효과가 없는 것 같다..." });
    }
  });

  // ==================================================================================
  // 날씨, 필드 관련
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

  // ==================================================================================
  // 기타 특성
  if (atkAbil === "고대활성" && atk.tempStatus.protosynthesis === null) {
    atk.handleProtosynthesis(bt, enqueue);
  }

  if (trace) return; // 트레이스로 상대 특성을 배껴왔을때 재귀적으로 해당 함수를 한번 더 실행

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
    // 등장했을때 상대방의 특성을 트레이스하지 못한 경우
    // 이후 트레이스 가능한 특성의 포켓몬이 등장하면 바로 발동한다
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
