import { damage } from "../function/damage";
import { switchNpc } from "./switch";
import { recover } from "../function/recover";
import { speedCheck } from "../util/speedCheck";
export const turnEnd = (battle, enqueue) => {
  // 턴이 종료될때 실행되는 이벤트 모음
  // 화상딜, 독딜, 날개쉬기 타입복구, NPC 기절시 교체
  // turnEnd를 trigger로 사용하여 모든 이벤트가 끝나야 교체화면이 나오게 함
  // player.temp의 프로퍼티들은 여기서 초기화된다.
  // battle.turn은 turnEnd 때문에 턴 시작할때 (battleStart.js)에서 초기화된다

  const fastUser = speedCheck(battle);
  const slowUser = fastUser === "player" ? "npc" : "player";
  const fast = battle[fastUser];
  const slow = battle[slowUser];
  const field = battle.field.field;

  if (battle.field.weather !== null) {
    battle.field.weatherTurnRemain -= 1;
    if (battle.field.weatherTurnRemain === 0) {
      const weather = battle.field.weather;
      battle.field.weather = null;
      let text;
      if (weather === "비") {
        text = "비가 그쳤다!";
      }
      enqueue({ battle, text: text });
    }
  }
  if (field !== null) {
    let fieldEndText;
    if (field === "그래스필드") {
      fieldEndText = "발밑의 풀이 사라졌다!";
      const text = "의 체력이 회복되었다!";
      if (fast.hp < fast.origin.hp && !fast.faint) {
        recover(
          battle,
          Math.floor(fast.origin.hp / 16),
          fastUser,
          enqueue,
          fast.name + text
        );
      }
      if (slow.hp < slow.origin.hp && !slow.faint) {
        recover(
          battle,
          Math.floor(slow.origin.hp / 16),
          slowUser,
          enqueue,
          slow.name + text
        );
      }
    }

    if (field === "일렉트릭필드") {
      fieldEndText = "발밑의 전기가 사라졌다!";
    }
    const bf = battle.field;
    bf.fieldTurnRemain -= 1;
    if (bf.fieldTurnRemain === 0) {
      bf.fieldTurnRemain = null;
      bf.field = null;
      enqueue({ battle, text: fieldEndText });
    }
  }

  if (fast.status.poison && !fast.faint) {
    damage(
      battle,
      Math.floor(fast.origin.hp / 8),
      fastUser,
      enqueue,
      fast.names + " 독에 의한 데미지를 입었다!"
    );
  }
  if (slow.status.poison && !slow.faint) {
    damage(
      battle,
      Math.floor(slow.origin.hp / 8),
      slowUser,
      enqueue,
      slow.names + " 독에 의한 데미지를 입었다!"
    );
  }
  if (fast.status.burn && !fast.faint) {
    damage(
      battle,
      Math.floor(fast.origin.hp / 16),
      fastUser,
      enqueue,
      fast.names + " 화상 데미지를 입었다!"
    );
  }
  if (slow.status.burn && !slow.faint) {
    damage(
      battle,
      Math.floor(slow.origin.hp / 16),
      slowUser,
      enqueue,
      slow.names + " 화상 데미지를 입었다!"
    );
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
  }

  if (battle.player.faint) {
    battle.turn.textFreeze = true;
    enqueue({
      battle: battle,
      text: "누구로 교체 할까?",
    });
  } else {
    if (battle.uturn) {
      return;
    }
    enqueue({
      battle: battle,
      text: battle.player.origin.names + " 무엇을 할까?",
    });
  }
};
