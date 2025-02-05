import { speedCheck, skillSpeedCheck } from "../util/speedCheck";
import { statCalculate } from "../function/statCalculate";
import { turnEnd } from "./turnEnd";
import { switchNpc, switchPlayer } from "./switchPokemon";
import { attackNpc, attackPlayer } from "./attack";
import { random } from "../util/randomCheck";

export const battleStart = (battle, actNumber, queueObject) => {
  queueObject.resetQueue();
  const enqueue = queueObject.enqueue;

  let bt = structuredClone(battle);
  statCalculate(bt);
  Object.keys(bt.turn).forEach((key) => {
    bt.turn[key] = null;
  });

  const npcActNumber = npcAi2(battle);
  bt.turn.playerSN = actNumber;
  bt.turn.npcSN = npcActNumber;

  if (typeof actNumber === "string" && typeof npcActNumber === "string") {
    let fastUser = speedCheck(bt);
    if (fastUser === "player") {
      switchPlayer(bt, actNumber, enqueue);
      switchNpc(bt, npcActNumber, enqueue);
    } else if (fastUser === "npc") {
      switchNpc(bt, npcActNumber, enqueue);
      switchPlayer(bt, actNumber, enqueue);
    }
  } else if (
    typeof actNumber === "string" &&
    typeof npcActNumber === "number"
  ) {
    switchPlayer(bt, actNumber, enqueue);
    attackNpc(bt, actNumber, npcActNumber, enqueue);
  } else if (
    typeof npcActNumber === "string" &&
    typeof actNumber === "number"
  ) {
    switchNpc(bt, npcActNumber, enqueue);
    attackPlayer(bt, actNumber, npcActNumber, enqueue);
  } else if (
    typeof actNumber === "number" &&
    typeof npcActNumber === "number"
  ) {
    let fastUser = skillSpeedCheck(bt);
    bt.turn.fastUser = fastUser; //기습 사용조건 체크

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
