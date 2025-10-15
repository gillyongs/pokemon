const resolvePokemon = (battle, target) => {
  //포켓몬 객체를 받으면 바로 처리
  //문자열로 받으면 객체를 찾아서 처리
  if (!target) return null;
  if (typeof target === "object") return target;
  if (target === "npc") return battle?.npc ?? null;
  if (target === "player") return battle?.player ?? null;
  return null;
};

// 회복 로직
const doRecover = (battle, recoverValue, recoveredPokemon, { enqueue, text, silent } = {}) => {
  const pokemon = resolvePokemon(battle, recoveredPokemon);
  if (!pokemon) return;

  // 이미 기절했거나 최대체력인 경우
  if (pokemon.hp <= 0) return;

  if (pokemon.hp >= pokemon.origin.hp) {
    if (!silent && enqueue) {
      if (text && text.includes("씨뿌리기")) {
        enqueue({ battle, text });
        //씨뿌리기 -> 풀피여도 텍스트는 떠야함
      } else {
        enqueue({ battle, text: "더 이상 회복할 수 없다!" });
      }
    }
    return;
  }

  const amount = Math.floor(recoverValue || 0);
  if (amount <= 0) return;

  pokemon.hp = Math.min(pokemon.origin.hp, pokemon.hp + amount);
  //최대체력 만큼만 회복
  if (!silent && enqueue) {
    enqueue({
      battle,
      text: text ?? `${pokemon.names} 체력을 회복했다!`,
    });
  }
};

export const recover = (battle, recoverValue, recoveredPokemon, enqueue, text) => {
  doRecover(battle, recoverValue, recoveredPokemon, { enqueue, text, silent: false });
};

export const recoverNoText = (battle, recoverValue, recoveredPokemon) => {
  // 특성 재생력 등 회복 텍스트가 화면에 뜨지 않는 경우
  doRecover(battle, recoverValue, recoveredPokemon, { silent: true });
};
