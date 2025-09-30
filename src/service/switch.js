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

export const switchPlayerForce = (battle, actNumber, enqueue) => {
  switchPokemon(battle, "player", actNumber);
  enqueue({
    battle,
    text: battle.player.origin.names + " 배틀에 끌려나왔다!",
  });
  abil(battle, "player", enqueue);
};

export const switchNpc = (battle, actNumber, enqueue, force) => {
  // NPC 교체
  // NPC가 교체를 골랐을떄 (BattleStart.js)
  // 포켓몬이 쓰러져서 교체할때 (turnEnd.js)
  // 양쪽 다 쓰러져서 맞교체할때 (Bottom-Switch.js)  *사용자가 교체한 다음에 호출해야해서
  // 강제교체 스킬을 맞았을때 (skillEffect.js)
  // 유턴 사용시 (skillEffect.js) 호출됨
  if (force) {
    switchPokemon(battle, "npc", actNumber);
    enqueue({
      battle,
      text: "상대 " + battle.npc.origin.names + " 배틀에 끌려나왔다!",
    });
  } else {
    enqueue({
      battle,
      text: "상대는 " + battle.npc.origin.namess + " 넣어 버렸다!",
    });
    switchPokemon(battle, "npc", actNumber);
    enqueue({
      battle,
      text: "상대는 " + battle.npc.origin.namess + " 내보냈다!",
    });
  }
  abil(battle, "npc", enqueue);
};
