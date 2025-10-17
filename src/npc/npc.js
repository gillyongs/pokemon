import { npcAiHard } from "./hard";
let before = null;
export const npcChoice = (battle, actNumber) => {
  if (before === null) {
    before = 1;
    return 4;
  }
  if (before) {
    return "npcBench1";
  }
  return 4; //npcact
  return npcAiHard(battle, actNumber);
};
