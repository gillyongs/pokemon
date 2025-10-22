// swapBattleEntities.js
import { recoverNoText } from "../function/recover";
export const switchPokemon = (battle, IN, OUT) => {
  // 교체 함수.
  // 실제 객체의 값을 바꾸고
  // pokemon.tempStatus 값을 초기화한다

  //IN: player or npc
  //OUT: playerBench1,2 // npcBench1,2

  if (!battle || !battle[IN] || !battle[OUT]) {
    console.error("Invalid battle object or keys");
    return;
  }

  const pokemonIn = battle[IN]; //교체로 들어가는 포켓몬
  if (pokemonIn.abil === "재생력") {
    // 재생력 특성을 지닌 포켓몬은 교체시 체력이 회복
    const hp = pokemonIn.origin.hp;
    recoverNoText(battle, Math.floor(hp / 3), pokemonIn);
  }
  if (pokemonIn.abil === "자연회복") {
    // 자연회복 특성을 지닌 포켓몬은 교체시 상태이상을 회복
    Object.keys(pokemonIn.status).forEach((key) => {
      pokemonIn.status[key] = null;
    });
  }
  if (pokemonIn.status.mpoison && pokemonIn.status.mpoison > 1) {
    pokemonIn.status.mpoison = 1;
    //맹독 스탯 초기화
  }

  let op = IN === "player" ? "npc" : "player";
  if (battle[op].tempStatus.switchLock !== null) {
    battle[op].tempStatus.switchLock = null;
    battle[op].tempStatus.switchLockTurnRemain = null;
    // 마그마스톰 등으로 상대를 구속 후 교체하면 구속 효과가 풀린다
    // 물론 상대방은 해당 턴에 교체할 수 없다
  }

  const ts = pokemonIn.tempStatus;

  Object.keys(ts).forEach((key) => {
    if (key !== "rank") {
      ts[key] = null;
    } else {
      Object.keys(ts.rank).forEach((key) => {
        ts.rank[key] = 0;
      });
    }
  });
  // 리베로 타입 초기화
  pokemonIn.type1 = pokemonIn.origin.type1;
  pokemonIn.type2 = pokemonIn.origin.type2;

  pokemonIn.abil = pokemonIn.origin.abil;

  [battle[IN], battle[OUT]] = [battle[OUT], battle[IN]];
};
