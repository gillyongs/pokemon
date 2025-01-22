import { generate } from "./Pokemon";

class Battle {
  constructor(player, npc) {
    this.player = player;
    this.npc = npc;
  }
}

export function createBattle(p_id, n_id) {
  const player = generate(p_id);
  const npc = generate(n_id);
  npc.name = "상대 " + npc.name;
  npc.names = "상대 " + npc.names;
  return new Battle(player, npc);
}

export default Battle;
