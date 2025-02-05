import { damage } from "../function/damage";
import { switchNpc } from "./switch";
import { abil } from "./abil";
export const turnEnd = (battle, enqueue) => {
  // 턴이 종료될때 실행되는 이벤트 모음
  // 화상딜, 독딜, 날개쉬기 타입복구, NPC 기절시 교체
  // turnEnd를 trigger로 사용하여 모든 이벤트가 끝나야 교체화면이 나오게 함
  // player.temp의 프로퍼티들은 여기서 초기화된다.
  // battle.turn은 turnEnd 때문에 턴 시작할때 (battleStart.js)에서 초기화된다

  if (battle.player.faint !== true) {
    if (battle.player.status.poision === true) {
      damage(
        battle,
        Math.floor(battle.player.origin.hp / 8),
        "player",
        enqueue,
        battle.player.names + " 독에 의한 데미지를 입었다!"
      );
    }
    if (battle.player.status.burn === true) {
      damage(
        battle,
        Math.floor(battle.player.origin.hp / 16),
        "player",
        enqueue,
        battle.player.names + " 화상 데미지를 입었다!"
      );
    }
  }
  if (battle.npc.faint !== true) {
    if (battle.npc.status.poision === true) {
      damage(
        battle,
        Math.floor(battle.npc.origin.hp / 8),
        "npc",
        enqueue,
        battle.npc.names + " 독에 의한 데미지를 입었다!"
      );
    }

    if (battle.npc.status.burn === true) {
      damage(
        battle,
        Math.floor(battle.npc.origin.hp / 16),
        "npc",
        enqueue,
        battle.npc.names + " 화상 데미지를 입었다!"
      );
    }
  }

  let tempPlayer = battle.player.temp;
  let tempNpc = battle.npc.temp;

  if (tempPlayer.roost) {
    tempPlayer.roost = null;
    battle.player.type1 = battle.player.origin.type1;
    battle.player.type2 = battle.player.origin.type2;
  }
  if (tempNpc.roost) {
    tempNpc.roost = null;
    battle.npc.type1 = battle.npc.origin.type1;
    battle.npc.type2 = battle.npc.origin.type2;
  }

  Object.keys(tempPlayer).forEach((key) => {
    tempPlayer[key] = null;
  });
  Object.keys(tempNpc).forEach((key) => {
    tempNpc[key] = null;
  });

  battle.turn.turnEnd = true;
  if (battle.npc.faint && !battle.player.faint) {
    if (battle.npcBench1.faint !== true) {
      // 1번이 기절 안했으면 1번 교체
      switchNpc(battle, "npcBench1", enqueue);
    } else if (
      battle.npcBench2.faint !== true &&
      battle.npcBench1.faint === true
    ) {
      //1번 기절했고 2번 기절 안했으면 2번 교체
      switchNpc(battle, "npcBench2", enqueue);
    }
    abil(battle, "npc", enqueue);
  }

  if (battle.player.faint) {
    battle.turn.textFreeze = true;
    enqueue({
      battle: battle,
      text: " 누구로 교체 할까?",
    });
  } else {
    enqueue({
      battle: battle,
      text: battle.player.origin.names + " 무엇을 할까?",
    });
  }
};
