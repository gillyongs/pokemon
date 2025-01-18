import { speedCheck } from "./speedCheck";
import { skillUse } from "./skillUse";

export const battleStart = (battle, skillNumber, enqueue, dequeue) => {
  let bt = structuredClone(battle);
  let fastUser = speedCheck(bt);
  const pton = { atks: "player", defs: "npc" };
  const ntop = { atks: "npc", defs: "player" };
  let firstAttack;
  let lastAttack;

  if (fastUser === "player") {
    firstAttack = pton;
    lastAttack = ntop;
  } else if (fastUser === "npc") {
    firstAttack = ntop;
    lastAttack = pton;
  }
  skillUse(bt, firstAttack, skillNumber, enqueue);

  if (bt[firstAttack.defs].hp === 0) {
    return;
  }

  skillUse(bt, lastAttack, skillNumber, enqueue);

  dequeue();
};
