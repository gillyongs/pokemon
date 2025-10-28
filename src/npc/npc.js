import { npcAiEasy } from "./ai/easy";
import { npcAiRandom } from "./ai/random";
import { npcAiHard } from "./hard";
import { npcCommon } from "./npcCommon";
let before = null;
export const npcChoice = (battle, actNumber) => {
  const choices = npcCommon(battle);
  if (choices.length === 1) return choices[0];
  else if (choices.length < 1) return null;
  let result = npcAiEasy(choices, battle);
  return isNaN(Number(result)) ? result : Number(result);
  // 형태: [1,2,3,4,'npcBench1','npcBench2']
  // 기절한 포켓몬 제외, 구애나 도발로 사용 불가 스킬 제외 등 공통사항 처리
  return npcAiRandom(choices);
  if (before === null) {
    before = true;
    return 1;
  }
  if (before) {
    return 3;
  }
  return "npcBench2"; //npcact
  // const choices = npcCommon(battle);
  // 형태: [1,2,3,4,'npcBench1','npcBench2']
  // 기절한 포켓몬 제외, 구애나 도발로 사용 불가 스킬 제외 등 공통사항 처리
  return npcAiHard(battle, actNumber);
};
