import { speedCheck, skillSpeedCheck } from "../util/speedCheck";
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
  Object.keys(bt.turn).forEach((key) => {
    bt.turn[key] = null;
  });

  const npcSkillNumber = skillNumber;
  bt.turn.playerSN = skillNumber;
  bt.turn.npcSN = npcSkillNumber;

  let fastUser = skillSpeedCheck(bt);
  bt.turn.fastUser = fastUser;

  if (fastUser === "player") {
    bt.turn.atk = "player";
    bt.turn.def = "npc";
    bt.turn.atkSN = skillNumber;
    bt.turn.defSN = npcSkillNumber;
  } else if (fastUser === "npc") {
    bt.turn.atk = "npc";
    bt.turn.def = "player";
    bt.turn.atkSN = npcSkillNumber;
    bt.turn.defSN = skillNumber;
  }
  skillUse(bt, skillNumber, enqueue);

  if (bt[bt.turn.def].faint === true) {
    return;
  }

  if (fastUser === "player") {
    bt.turn.atk = "npc";
    bt.turn.def = "player";
    bt.turn.atkSN = skillNumber;
    bt.turn.defSN = npcSkillNumber;
  } else if (fastUser === "npc") {
    bt.turn.atk = "player";
    bt.turn.def = "npc";
    bt.turn.atkSN = npcSkillNumber;
    bt.turn.defSN = skillNumber;
  }

  skillUse(bt, skillNumber, enqueue);
  turnEnd(bt, enqueue);
};
