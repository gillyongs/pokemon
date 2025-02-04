// swapBattleEntities.js

export const switchPokemon = (battle, keyA, keyB) => {
  if (!battle || !battle[keyA] || !battle[keyB]) {
    console.error("Invalid battle object or keys");
    return;
  }

  // 값 교환
  [battle[keyA], battle[keyB]] = [battle[keyB], battle[keyA]];
};
