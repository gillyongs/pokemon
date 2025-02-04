import { switchPokemon } from "../util/switch";

export const switchPlayer = (battle, actNumber, enqueue) => {
  battle.turn.textFreeze = null;
  battle.turn.turnEnd = null;
  enqueue({ battle, text: battle.player.origin.name + " 돌아와!" });
  switchPokemon(battle, "player", actNumber);
  battle.turn.turnEnd = null;
  enqueue({
    battle,
    text: "가랏! " + battle.player.origin.name + "!",
  });
};

export const switchNpc = (battle, actNumber, enqueue) => {
  enqueue({
    battle,
    text: "상대는 " + battle.npc.origin.namess + " 넣어 버렸다!",
  });
  switchPokemon(battle, "npc", actNumber);
  enqueue({
    battle,
    text: "상대는 " + battle.npc.origin.namess + " 내보냈다!",
  });
};
