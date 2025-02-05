import { speedCheck, skillSpeedCheck } from "../util/speedCheck";
import { statCalculate } from "../function/statCalculate";
import { turnEnd } from "./turnEnd";
import { switchNpc, switchPlayer } from "./switch";
import { attackNpc, attackPlayer } from "./attack";
import { abil } from "./abil";

export const battleStart = (battle, actNumber, queueObject) => {
  //턴을 시작하는 함수
  //선택지와 스피드에 맞게 '교체'와 '공격' 함수를 호출한다

  queueObject.resetQueue();
  const enqueue = queueObject.enqueue;

  let bt = structuredClone(battle);
  statCalculate(bt);
  Object.keys(bt.turn).forEach((key) => {
    bt.turn[key] = null;
  });
  // turnEnd 같은 프로퍼티도 있어서 턴이 시작할때 초기화해야함

  const npcActNumber = npcAi2(battle);
  bt.turn.playerSN = actNumber;
  bt.turn.npcSN = npcActNumber;

  if (typeof actNumber === "string" && typeof npcActNumber === "string") {
    //맞교체
    let fastUser = speedCheck(bt);
    if (fastUser === "player") {
      switchPlayer(bt, actNumber, enqueue);
      switchNpc(bt, npcActNumber, enqueue);
      abil(bt, "player", enqueue);
      abil(bt, "npc", enqueue);
    } else if (fastUser === "npc") {
      switchNpc(bt, npcActNumber, enqueue);
      switchPlayer(bt, actNumber, enqueue);
      abil(bt, "npc", enqueue);
      abil(bt, "player", enqueue);
    }
  } else if (
    typeof actNumber === "string" &&
    typeof npcActNumber === "number"
  ) {
    switchPlayer(bt, actNumber, enqueue);
    abil(bt, "player", enqueue);
    attackNpc(bt, actNumber, npcActNumber, enqueue);
  } else if (
    typeof npcActNumber === "string" &&
    typeof actNumber === "number"
  ) {
    switchNpc(bt, npcActNumber, enqueue);
    abil(bt, "npc", enqueue);
    attackPlayer(bt, actNumber, npcActNumber, enqueue);
  } else if (
    typeof actNumber === "number" &&
    typeof npcActNumber === "number"
  ) {
    let fastUser = skillSpeedCheck(bt);
    bt.turn.fastUser = fastUser; //기습 사용조건때문에 넣는다

    if (fastUser === "player") {
      attackPlayer(bt, actNumber, npcActNumber, enqueue);
      statCalculate(bt);
      if (bt[bt.turn.def].faint !== true) {
        attackNpc(bt, actNumber, npcActNumber, enqueue);
      }
    } else {
      attackNpc(bt, actNumber, npcActNumber, enqueue);
      statCalculate(bt);
      if (bt[bt.turn.def].faint !== true) {
        attackPlayer(bt, actNumber, npcActNumber, enqueue);
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
  let choices = [1, 2, 3, 4];
  if (!battle.npcBench1.faint) choices.push("npcBench1");
  if (!battle.npcBench2.faint) choices.push("npcBench2");

  return choices[Math.floor(Math.random() * choices.length)];
};

export default npcAi2;
