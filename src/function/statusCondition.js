export const pokemonNoStatusCheck = (pokemon) => {
  const status = pokemon.status;
  // 모든 프로퍼티의 값이 null이면 true 반환
  return Object.values(status).every((v) => v === null);
};

const faintCheck = (pokemon) => pokemon.faint;

// 공통 처리 함수
const applyStatus = (battle, get, enqueue, options) => {
  const { key, immuneTypes = [], condition, text, extra, failText } = options;
  const pokemon = get === "player" ? battle.player : battle.npc;

  // 면역 타입 체크
  if (immuneTypes.includes(pokemon.type1) || immuneTypes.includes(pokemon.type2)) {
    if (failText) enqueue({ battle, text: "하지만 실패했다!" });
    return;
  }

  // 상태 중복 체크
  if (!pokemonNoStatusCheck(pokemon)) {
    if (failText) enqueue({ battle, text: "하지만 실패했다!" });
    return;
  }

  // 기절 체크
  if (faintCheck(pokemon)) {
    if (failText) enqueue({ battle, text: "하지만 실패했다!" });
    return;
  }

  // 추가 조건  (쾌청 상태면 얼지 않는다)
  if (condition && !condition(battle, pokemon)) {
    if (failText) enqueue({ battle, text: "하지만 실패했다!" });
    return;
  }

  // 상태 적용
  if (typeof extra === "function") {
    extra(pokemon);
  } else {
    pokemon.status[key] = true;
  }

  // 출력 텍스트
  enqueue({
    battle,
    text: typeof text === "function" ? text(pokemon) : text,
  });
};

// ---- 상태이상별 함수 ----

export const mabi = (battle, get, enqueue, failText, abilText) => {
  applyStatus(battle, get, enqueue, {
    key: "mabi",
    immuneTypes: ["전기"],
    text: (p) => (abilText ? "[특성 정전기] " : "") + `${p.names} 마비되어 기술이 나오기 어려워졌다!`,
    failText,
  });
};

export const burn = (battle, get, enqueue, ball, failText) =>
  applyStatus(battle, get, enqueue, {
    key: "burn",
    immuneTypes: ["불꽃"],
    text: (p) => (ball ? `${p.names} 화염구슬 때문에 화상을 입었다!` : `${p.names} 화상을 입었다!`),
    failText,
  });

export const poison = (battle, get, enqueue) =>
  applyStatus(battle, get, enqueue, {
    key: "poison",
    immuneTypes: ["독", "강철"],
    text: (p) => `${p.name}의 몸에 독이 퍼졌다!`,
  });

export const mPoison = (battle, get, enqueue, failText) =>
  applyStatus(battle, get, enqueue, {
    key: "mpoison",
    immuneTypes: ["독", "강철"],
    extra: (p) => (p.status.mpoison = 1),
    text: (p) => `${p.name}의 몸에 맹독이 퍼졌다!`,
    failText,
  });

export const freeze = (battle, get, enqueue) =>
  applyStatus(battle, get, enqueue, {
    key: "freeze",
    immuneTypes: ["얼음"],
    condition: (battle) => battle.weatherType !== "쾌청", // 쾌청 시 실패
    text: (p) => `${p.names} 얼어붙었다!`,
  });

export const sleep = (battle, get, enqueue) =>
  applyStatus(battle, get, enqueue, {
    key: "sleep",
    extra: (p) => (p.status.sleep = Math.floor(Math.random() * 3) + 2),
    text: (p) => `${p.names} 잠들어 버렸다!`,
  });

export const confuse = (battle, get, enqueue, autoConfuseText) => {
  const pokemon = get === "player" ? battle.player : battle.npc;

  //이미 혼란에 걸려있는지 체크
  if (pokemon.tempStatus.confuse !== null) return;

  if (faintCheck(pokemon)) return;

  const getConfuseTurn = () => {
    return Math.floor(Math.random() * 3) + 1;
    // 1 ~ 4턴.
  };

  pokemon.tempStatus.confuse = getConfuseTurn();

  let confuseText = pokemon.names + " 혼란에 빠졌다!";
  if (autoConfuseText) enqueue({ battle: battle, text: autoConfuseText ? autoConfuseText : confuseText });
};
