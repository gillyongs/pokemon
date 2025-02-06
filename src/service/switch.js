import { switchPokemon } from "../util/switchPokemon";
import { abil } from "./abil";

export const switchPlayer = (battle, actNumber, enqueue) => {
  // 플레이어 교체
  // 사용자가 교체를 골랐을떄 (BattleStart.js)
  // 포켓몬이 쓰러져서 교체할때, 유턴 썼을때 (Bottom-Switch.js) 호출됨

  battle.turn.textFreeze = null;
  battle.turn.turnEnd = null;
  enqueue({ battle, text: battle.player.origin.name + " 돌아와!" });
  switchPokemon(battle, "player", actNumber);
  battle.turn.turnEnd = null;
  enqueue({
    battle,
    text: "가랏! " + battle.player.origin.name + "!",
  });
  abil(battle, "player", enqueue);
};

export const switchNpc = (battle, actNumber, enqueue) => {
  // NPC 교체
  // NPC가 교체를 골랐을떄 (BattleStart.js)
  // 포켓몬이 쓰러져서 교체할때 (turnEnd.js)
  // 양쪽 다 쓰러져서 맞교체할때 (Bottom-Switch.js)  *사용자가 교체한 다음 교체해야해서
  // 유턴 사용시 (skillEffect.js) 호출됨
  enqueue({
    battle,
    text: "상대는 " + battle.npc.origin.namess + " 넣어 버렸다!",
  });
  switchPokemon(battle, "npc", actNumber);
  enqueue({
    battle,
    text: "상대는 " + battle.npc.origin.namess + " 내보냈다!",
  });
  abil(battle, "npc", enqueue);
};
