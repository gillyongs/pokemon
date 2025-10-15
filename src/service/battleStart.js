import { speedCheck, skillSpeedCheck } from "../util/speedCheck";
import { statCalculate } from "../function/statCalculate";
import { turnEnd } from "./turnEnd";
import { switchNpc, switchPlayer } from "./switch";
import { attackNpc, attackPlayer } from "./attack";

export const battleStart = (battle, actNumber, npcActNumber, queueObject) => {
  //턴을 시작하는 함수
  //선택지와 스피드에 맞게 '교체'와 '공격' 함수를 호출한다

  queueObject.resetQueue();
  const enqueue = queueObject.enqueue;

  let bt = structuredClone(battle);
  statCalculate(bt);
  Object.keys(bt.turn).forEach((key) => {
    bt.turn[key] = null;
  });

  bt.turn.playerSN = actNumber;
  bt.turn.npcSN = npcActNumber;
  let uTurnTrigger = false;
  let skName;
  if (typeof actNumber === "number") {
    skName = bt.player.origin["sk" + actNumber].name;
  }

  if (skName === "유턴" || skName === "볼트체인지") {
    uTurnTrigger = true;
  }

  if (typeof actNumber === "string" && typeof npcActNumber === "string") {
    //맞교체
    let fastUser = speedCheck(bt);
    if (fastUser === "player") {
      switchPlayer(bt, actNumber, enqueue);
      switchNpc(bt, npcActNumber, enqueue);
    } else if (fastUser === "npc") {
      switchNpc(bt, npcActNumber, enqueue);
      switchPlayer(bt, actNumber, enqueue);
    }
  } else if (
    // 플레이어만 교체
    typeof actNumber === "string" &&
    typeof npcActNumber === "number"
  ) {
    switchPlayer(bt, actNumber, enqueue);
    attackNpc(bt, actNumber, npcActNumber, enqueue);
  } else if (
    // npc만 교체
    typeof npcActNumber === "string" &&
    typeof actNumber === "number"
  ) {
    switchNpc(bt, npcActNumber, enqueue);
    attackPlayer(bt, actNumber, npcActNumber, enqueue);
    if (uTurnTrigger) {
      return;
    }
  } else if (
    //맞공격
    typeof actNumber === "number" &&
    typeof npcActNumber === "number"
  ) {
    let fastUser = skillSpeedCheck(bt);
    bt.turn.fastUser = fastUser; //기습 사용조건때문에 넣는다

    if (fastUser === "player") {
      attackPlayer(bt, actNumber, npcActNumber, enqueue);
      statCalculate(bt);
      if (uTurnTrigger) {
        return;
      }
      if (bt[bt.turn.def].faint !== true) {
        attackNpc(bt, actNumber, npcActNumber, enqueue);
      }
    } else {
      attackNpc(bt, actNumber, npcActNumber, enqueue);
      statCalculate(bt);
      if (bt[bt.turn.def].faint !== true) {
        attackPlayer(bt, actNumber, npcActNumber, enqueue);
        if (uTurnTrigger) {
          return;
        }
      }
    }
  }

  turnEnd(bt, enqueue);
};

const npcAi = (battle, a) => {
  if (a === "playerBench1") {
    return "npcBench1";
  }
  if (a === "playerBench2") {
    return "npcBench2";
  }
  return a;
};
const npcAi2 = (battle) => {
  return 4;
  let choices = [1, 2, 3, 4];
  if (!battle.npcBench1.faint) choices.push("npcBench1");
  if (!battle.npcBench2.faint) choices.push("npcBench2");

  return choices[Math.floor(Math.random() * choices.length)];
};

export default npcAi2;
