import { speedCheck } from "./speedCheck";
import { skillUse } from "./skillUse";

export const battleStart = (battle, skillNumber, enqueue, dequeue) => {
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

  dequeue();
};
