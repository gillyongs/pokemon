import { damage } from "../function/damage";
import { typeCheck } from "../util/typeCheck";
import { poison, mPoison } from "../function/statusCondition";
import { flyingCheck } from "../util/flyingCheck";
export const applyFieldEffects = (bt, atks, enqueue) => {
  //교체해서 나올때 장판(스텔스록, 독압정) 체크
  //switch.js에서 호출

  let defs;

  if (atks === "player") {
    defs = "npc";
  } else if (atks === "npc") {
    defs = "player";
  }

  const atk = bt[atks];
  const def = bt[defs];

  if (atk.item === "통굽부츠") {
    return;
  }

  // 스텔스록
  if (bt.field[atks].sRock) {
    // 공중 판정 안받음 (풍선도)
    const text = atk.name + "에게 뾰족한 바위가 박혔다!";
    const typeDamage = typeCheck("바위", atk.type1, atk.type2);
    damage(bt, Math.floor((atk.origin.hp * typeDamage) / 8), atks, enqueue, text);
  }

  if (flyingCheck(bt, atk)) {
    return;
  }
  // 독압정
  let poisonSpikes = bt.field[atks].poisonSpikes;
  if (poisonSpikes !== null) {
    if (atk.type1 === "독" || atk.type2 === "독") {
      bt.field[atks].poisonSpikes = null;
      enqueue({ battle: bt, text: "바닥의 독압정이 제거되었다!" });
    }
    if (poisonSpikes === 1) {
      poison(bt, atks, enqueue);
    } else if (poisonSpikes === 2) {
      mPoison(bt, atks, enqueue);
    } else {
      console.error("독압정 에러");
    }
  }
};
