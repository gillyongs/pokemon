import { skillUse } from "./skillUse";
import { skillEffectsAfter, skillEffectsBefore } from "./skiiEffect";

export const attackPlayer = (bt, actNumber, npcActNumber, enqueue) => {
  bt.turn.atk = "player";
  bt.turn.def = "npc";
  bt.turn.atkSN = actNumber;
  bt.turn.defSN = npcActNumber;
  skillEffectsBefore(bt, enqueue);
  skillUse(bt, enqueue);
  skillEffectsAfter(bt, enqueue);
};

export const attackNpc = (bt, actNumber, npcActNumber, enqueue) => {
  bt.turn.atk = "npc";
  bt.turn.def = "player";
  bt.turn.atkSN = npcActNumber;
  bt.turn.defSN = actNumber;
  skillEffectsBefore(bt, enqueue);
  skillUse(bt, enqueue);
  skillEffectsAfter(bt, enqueue);
};
