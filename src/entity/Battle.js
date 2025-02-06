import { generate } from "./Pokemon/Pokemon";

class Battle {
  constructor(player, npc, playerBench1, playerBench2, npcBench1, npcBench2) {
    this.player = player;
    this.npc = npc;
    this.playerBench1 = playerBench1;
    this.npcBench1 = npcBench1;
    this.playerBench2 = playerBench2;
    this.npcBench2 = npcBench2;
    this.turn = {
      fastUser: null, //기습 조건 체크
      atkSN: null,
      defSN: null,
      atk: null, //battle[battle.turn.atk] = player or npc
      def: null,
      playerSN: null, // 우선도 체크에 사용
      npcSN: null,
      turnEnd: null,
      textFreeze: null,
    };
    //turnEnd 같은 변수때문에 턴이 시작될때 = battleStart.js에서 초기화된다
    this.field = {
      field: null,
      fieldTurnRemain: null,
    };

    // this.player.status.poison = true;
    // this.playerBench1.status.poison = true;
    // this.playerBench2.status.poison = true;
    // this.npc.status.poison = true;
    // this.npcBench1.status.poison = true;
    // this.npcBench2.status.poison = true;
  }
}

export function createBattle(plyayerArray, npcArray) {
  const player = generate(plyayerArray[0]);
  const npc = generate(npcArray[0]);
  npc.name = "상대 " + npc.name;
  npc.names = "상대 " + npc.names;

  const playerBench1 = generate(plyayerArray[1]);
  const npcBench1 = generate(npcArray[1]);
  npcBench1.name = "상대 " + npcBench1.name;
  npcBench1.names = "상대 " + npcBench1.names;

  const playerBench2 = generate(plyayerArray[2]);
  const npcBench2 = generate(npcArray[2]);
  npcBench2.name = "상대 " + npcBench2.name;
  npcBench2.names = "상대 " + npcBench2.names;

  return new Battle(
    player,
    npc,
    playerBench1,
    playerBench2,
    npcBench1,
    npcBench2
  );
}

export default Battle;
