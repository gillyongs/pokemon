const statusCheck = (status) => {
  return Object.values(status).some((value) => value !== null);
};

const faintCheck = (pokemon) => {
  if (pokemon.faint) {
    return true;
  }
};

export const mabi = (battle, get, enqueue, abilText) => {
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
  if (faintCheck(pokemon)) {
    return;
  }
  let mabiText = pokemon.names + " 마비되어 기술이 나오기 어려워졌다!";
  if (abilText) {
    mabiText = "[특성 정전기] " + mabiText;
  }
  pokemon.status.mabi = true;
  enqueue({
    battle: battle,
    text: mabiText,
  });
};

export const burn = (battle, get, enqueue, ball) => {
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
  if (faintCheck(pokemon)) {
    return;
  }
  let fireText = pokemon.names + " 화상을 입었다!";
  if (ball) {
    fireText = pokemon.names + " 화염구슬 때문에 화상을 입었다!";
  }
  pokemon.status.burn = true;
  enqueue({
    battle: battle,
    text: fireText,
  });
};
export const poison = (battle, get, enqueue) => {
  let pokemon;
  if (get === "player") {
    pokemon = battle.player;
  } else if (get === "npc") {
    pokemon = battle.npc;
  }
  if (pokemon.type1 === "독" || pokemon.type2 === "독" || pokemon.type1 === "강철" || pokemon.type2 === "강철") {
    return;
  }
  if (statusCheck(pokemon.status)) {
    //이미 걸린 상태이상이 있는지 체크
    return;
  }
  if (faintCheck(pokemon)) {
    return;
  }
  let poisonText = pokemon.name + "의 몸에 독이 퍼졌다!";
  pokemon.status.poison = true;
  enqueue({
    battle: battle,
    text: poisonText,
  });
};

export const freeze = (battle, get, enqueue, abilText) => {
  let pokemon;
  if (get === "player") {
    pokemon = battle.player;
  } else if (get === "npc") {
    pokemon = battle.npc;
  }
  if (pokemon.type1 === "얼음" || pokemon.type2 === "얼음") {
    return;
  }
  if (statusCheck(pokemon.status)) {
    //이미 걸린 상태이상이 있는지 체크
    return;
  }
  if (faintCheck(pokemon)) {
    return;
  }
  if (battle.field.weather === "쾌청") {
    return;
    //날씨가 쾌청이면 얼지 않는다
  }
  let freezeText = pokemon.names + " 얼어붙었다!";
  pokemon.status.freeze = true;
  enqueue({
    battle: battle,
    text: freezeText,
  });
};
export const sleep = (battle, get, enqueue) => {
  let pokemon;
  if (get === "player") {
    pokemon = battle.player;
  } else if (get === "npc") {
    pokemon = battle.npc;
  }
  if (statusCheck(pokemon.status)) {
    //이미 걸린 상태이상이 있는지 체크
    return;
  }
  if (faintCheck(pokemon)) {
    return;
  }
  let sleepText = pokemon.names + "  잠들어 버렸다!";
  pokemon.status.sleep = Math.floor(Math.random() * 3) + 2;
  // 기대값 : 2, 3, 4
  // 수면은 0이 되면 바로 깨므로 최소 1턴 자려면 값이 2여야함
  enqueue({
    battle: battle,
    text: sleepText,
  });
};
export const confuse = (battle, enqueue) => {};
