import { skillUse } from "./skillUse";
import { skillEffectsAfter } from "./skiiEffect";

export const attackPlayer = (bt, actNumber, npcActNumber, enqueue) => {
  bt.turn.atk = "player";
  bt.turn.def = "npc";
  bt.turn.atkSN = actNumber;
  bt.turn.defSN = npcActNumber;
  skillUse(bt, enqueue);
  skillEffectsAfter(bt, enqueue);
};

export const attackNpc = (bt, actNumber, npcActNumber, enqueue) => {
  bt.turn.atk = "npc";
  bt.turn.def = "player";
  bt.turn.atkSN = npcActNumber;
  bt.turn.defSN = actNumber;
  skillUse(bt, enqueue);
  skillEffectsAfter(bt, enqueue);
};
