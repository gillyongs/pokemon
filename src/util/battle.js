import { speedCheck } from "./speedCheck";
import { skillUse } from "./skillUse";
import { turnEnd } from "./turnEnd";

export const battleStart = (
  battle,
  skillNumber,
  enqueue,
  dequeue,
  resetQueue
) => {
  resetQueue();
  let bt = structuredClone(battle);
  let fastUser = speedCheck(bt);

  if (fastUser === "player") {
    bt.atk = "player";
    bt.def = "npc";
  } else if (fastUser === "npc") {
    bt.atk = "npc";
    bt.def = "player";
  }
  skillUse(bt, skillNumber, enqueue);

  if (bt[bt.def].hp === 0) {
    return;
  }

  if (fastUser === "player") {
    bt.atk = "npc";
    bt.def = "player";
  } else if (fastUser === "npc") {
    bt.atk = "player";
    bt.def = "npc";
  }

  skillUse(bt, skillNumber, enqueue);
  console.log(bt);
  turnEnd(bt, enqueue);
};
