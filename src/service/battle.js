import { speedCheck, skillSpeedCheck } from "../util/speedCheck";
import { statCalculate } from "../function/statCalculate";
import { skillEffectsAfter } from "./skiiEffect";
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
  statCalculate(bt);
  Object.keys(bt.turn).forEach((key) => {
    bt.turn[key] = null;
  });

  const npcSkillNumber = skillNumber;
  bt.turn.playerSN = skillNumber;
  bt.turn.npcSN = npcSkillNumber;

  let fastUser = skillSpeedCheck(bt);
  bt.turn.fastUser = fastUser;

  setAtkDef(
    bt,
    fastUser,
    fastUser === "player" ? "npc" : "player",
    fastUser === "player" ? skillNumber : npcSkillNumber,
    fastUser === "player" ? npcSkillNumber : skillNumber
  );

  skillUse(bt, enqueue);
  skillEffectsAfter(bt, enqueue);
  if (bt[bt.turn.def].faint === true) {
    return;
  }

  setAtkDef(bt, bt.turn.def, bt.turn.atk, bt.turn.defSN, bt.turn.atkSN);

  skillUse(bt, enqueue);
  skillEffectsAfter(bt, enqueue);
  turnEnd(bt, enqueue);
};

const setAtkDef = (bt, attacker, defender, atkSN, defSN) => {
  bt.turn.atk = attacker;
  bt.turn.def = defender;
  bt.turn.atkSN = atkSN;
  bt.turn.defSN = defSN;
};
