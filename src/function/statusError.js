const statusCheck = (status) => {
  return Object.values(status).some((value) => value !== null);
};

export const mabi = (battle, get, enqueue, abil) => {
  let pokemon;
  if (get === "player") {
    pokemon = battle.player;
  } else if (get === "npc") {
    pokemon = battle.npc;
  }
  if (pokemon.type1 === "전기" || pokemon.type2 === "전기") {
    return;
  }
  if (statusCheck(pokemon.status)) {
    //이미 걸린 상태이상이 있는지 체크
    return;
  }
  let mabiText = pokemon.names + " 마비되어 기술이 나오기 어려워졌다!";
  if (abil) {
    mabiText = "[특성 정전기] " + mabiText;
  }
  pokemon.status.mabi = true;
  enqueue({
    battle: battle,
    text: mabiText,
  });
};

export const burn = (battle, get, enqueue) => {
  let pokemon;
  if (get === "player") {
    pokemon = battle.player;
  } else if (get === "npc") {
    pokemon = battle.npc;
  }
  if (pokemon.type1 === "불꽃" || pokemon.type2 === "불꽃") {
    return;
  }
  if (statusCheck(pokemon.status)) {
    //이미 걸린 상태이상이 있는지 체크
    return;
  }
  let fireText = pokemon.names + " 화상을 입었다!";
  pokemon.status.burn = true;
  enqueue({
    battle: battle,
    text: fireText,
  });
};
export const poision = (battle, get, enqueue) => {
  let pokemon;
  if (get === "player") {
    pokemon = battle.player;
  } else if (get === "npc") {
    pokemon = battle.npc;
  }
  if (
    pokemon.type1 === "독" ||
    pokemon.type2 === "독" ||
    pokemon.type1 === "강철" ||
    pokemon.type2 === "강철"
  ) {
    return;
  }
  if (statusCheck(pokemon.status)) {
    //이미 걸린 상태이상이 있는지 체크
    return;
  }
  let poisionText = pokemon.name + "의 몸에 독이 퍼졌다!";
  pokemon.status.poision = true;
  enqueue({
    battle: battle,
    text: poisionText,
  });
};
export const sleep = (battle, enqueue) => {};
export const confuse = (battle, enqueue) => {};
