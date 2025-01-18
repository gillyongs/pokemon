import { damage } from "./damage";
import { speedCheck } from "./speedCheck";
import skillEffect from "../component/SkilleEffect";
import { Attacks } from "./Attacks";

export const battleStart = (battle, skillNumber, enqueue, dequeue) => {
  let bt = structuredClone(battle);
  let speedVs = speedCheck(bt);
  const pton = {atks:"player", defs:"npc"}
  const ntop = {atks:"npc", defs:"player"}
  let firstAttack;
  let lastAttack;

  if (speedVs === "player") {
    firstAttack = pton;
    lastAttack = ntop;
  } else if (speedVs === "npc") {
    firstAttack = ntop;
    lastAttack = pton;
  }
  Attacks(bt, firstAttack, skillNumber, enqueue);

  if (bt[firstAttack.defs].hp === 0) {
    return;
  }

  Attacks(bt, lastAttack, skillNumber, enqueue);

  dequeue();
};

