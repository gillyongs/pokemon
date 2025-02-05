// swapBattleEntities.js

import { statCalculate } from "../function/statCalculate";

export const switchPokemon = (battle, keyA, keyB) => {
  if (!battle || !battle[keyA] || !battle[keyB]) {
    console.error("Invalid battle object or keys");
    return;
  }

  const pokemon = battle[keyA];
  const ts = pokemon.tempStatus;

  ts.confuse = null;
  ts.confuseTurnRemain = null;
  ts.rank.atk = 0;
  ts.rank.catk = 0;
  ts.rank.def = 0;
  ts.rank.cdef = 0;
  ts.rank.speed = 0;
  ts.rank.critical = 0;
  pokemon.type1 = pokemon.origin.type1;
  pokemon.type2 = pokemon.origin.type2;
  statCalculate(battle);

  // 값 교환
  [battle[keyA], battle[keyB]] = [battle[keyB], battle[keyA]];
};
