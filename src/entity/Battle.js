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
      fastUser: null,
      atkSN: null,
      defSN: null,
      atk: null,
      def: null,
      playerSN: null,
      npcSN: null,
      turnEnd: null,
      textFreeze: null,
    };
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
