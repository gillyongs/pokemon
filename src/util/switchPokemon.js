// swapBattleEntities.js

import { statCalculate } from "../function/statCalculate";

export const switchPokemon = (battle, keyA, keyB) => {
  // 교체 함수.
  // 실제 객체의 값을 바꾸고
  // pokemon.tempStatus 값을 초기화한다

  if (!battle || !battle[keyA] || !battle[keyB]) {
    console.error("Invalid battle object or keys");
    return;
  }

  const pokemon = battle[keyA];
  const ts = pokemon.tempStatus;

  Object.keys(ts).forEach((key) => {
    if (key !== "rank") {
      ts[key] = null;
    } else {
      Object.keys(ts.rank).forEach((key) => {
        ts.rank[key] = 0;
      });
    }
  });
  pokemon.type1 = pokemon.origin.type1;
  pokemon.type2 = pokemon.origin.type2;
  // 리베로
  statCalculate(battle);

  [battle[keyA], battle[keyB]] = [battle[keyB], battle[keyA]];
};
