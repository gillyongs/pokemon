import { speedCheck } from "../util/speedCheck";
import { skillUse } from "./skillUse";
import { turnEnd } from "./turnEnd";

class Turn {
  constructor(battle, atk, def, skillNumber, npcSkillNumber, fastUser) {
    this.battle = battle;
    this.atk = atk;
    this.def = def;
    this.skillNumber = skillNumber;
    this.npcSkillNumber = npcSkillNumber;
    this.skill = battle.player["sk" + skillNumber];
    this.npcSkill = battle.npc["sk" + skillNumber];
    this.fastUser = fastUser;
  }
}

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
  const npcSkillNumber = skillNumber;

  if (fastUser === "player") {
    bt.atk = "player";
    bt.def = "npc";
  } else if (fastUser === "npc") {
    bt.atk = "npc";
    bt.def = "player";
  }
  skillUse(bt, skillNumber, enqueue);

  if (bt[bt.def].faint === true) {
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
  turnEnd(bt, enqueue);
};
