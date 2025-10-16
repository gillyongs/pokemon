import { damageCalculate } from "../util/damageCalculate";
import { speedCheck } from "../util/speedCheck";

export const npcAiHard = (battle2, actNumber) => {
  const bt = structuredClone(battle2);

  let playerSkill;
  const playerRemainHp = bt.player.playerRemainHp;
  const fastUser = speedCheck(bt);

  const npcSkill1 = bt.npc.origin.sk1;
  const npcSkill2 = bt.npc.origin.sk2;
  const npcSkill3 = bt.npc.origin.sk3;
  const npcSkill4 = bt.npc.origin.sk4;

  let npcBench = 0;
  const npcFaint1 = bt.npcBench1.faint;
  const npcFaint2 = bt.npcBench2.faint;
  if (npcFaint1 === null) {
    npcBench += 1;
  }
  if (npcFaint2 === null) {
    npcBench += 1;
  }
  let healingSkillNumber;
  if (healingSkill.includes(npcSkill1.name)) {
    healingSkillNumber = 1;
  }
  if (healingSkill.includes(npcSkill2.name)) {
    healingSkillNumber = 2;
  }
  if (healingSkill.includes(npcSkill3.name)) {
    healingSkillNumber = 3;
  }
  if (healingSkill.includes(npcSkill4.name)) {
    healingSkillNumber = 4;
  }

  if (typeof actNumber === "number") {
    // 플레이어가 기술을 쓴 경우
    playerSkill = bt.player.origin["sk" + actNumber];
    const playerPrior = playerSkill.prior;

    bt.turn.atk = "player";
    bt.turn.def = "npc";
    bt.turn.defSN = 1;
    bt.turn.atkSN = actNumber;
    const playerDamage = damageCalculate(bt);

    bt.turn.atk = "npc";
    bt.turn.def = "player";
    bt.turn.defSN = actNumber;

    bt.turn.atkSN = 1;
    let npcDamage1 = damageCalculate(bt);
    if (isNaN(npcDamage1)) npcDamage1 = 0;

    bt.turn.atkSN = 2;
    let npcDamage2 = damageCalculate(bt);
    if (isNaN(npcDamage2)) npcDamage2 = 0;

    bt.turn.atkSN = 3;
    let npcDamage3 = damageCalculate(bt);
    if (isNaN(npcDamage3)) npcDamage3 = 0;

    bt.turn.atkSN = 4;
    let npcDamage4 = damageCalculate(bt);
    if (isNaN(npcDamage4)) npcDamage4 = 0;

    const maxNpcDamage = Math.max(npcDamage1, npcDamage2, npcDamage3, npcDamage4);

    let maxDamageSkill;
    if (maxNpcDamage === npcDamage1) maxDamageSkill = 1;
    else if (maxNpcDamage === npcDamage2) maxDamageSkill = 2;
    else if (maxNpcDamage === npcDamage3) maxDamageSkill = 3;
    else if (maxNpcDamage === npcDamage4) maxDamageSkill = 4;

    // console.log(damage1);
    // console.log(damage2);
    // console.log(damage3);
    // console.log(damage4);

    const npcPrior1 = bt.npc.origin.sk1.prior;
    const npcPrior2 = bt.npc.origin.sk2.prior;
    const npcPrior3 = bt.npc.origin.sk3.prior;
    const npcPrior4 = bt.npc.origin.sk4.prior;

    // 선공으로 끝낼 수 있는 경우
    if (true) {
      if (npcPrior1 > playerPrior || (fastUser === "npc" && npcPrior1 === playerPrior)) {
        if (npcDamage1 >= playerRemainHp) {
          console.log("[선공 - 1번 케이스]");
          return 1;
        }
      }
      if (npcPrior2 > playerPrior || (fastUser === "npc" && npcPrior2 === playerPrior)) {
        if (npcDamage2 >= playerRemainHp) {
          console.log("[선공 - 2번 케이스]");
          return 2;
        }
      }
      if (npcPrior3 > playerPrior || (fastUser === "npc" && npcPrior3 === playerPrior)) {
        if (npcDamage3 >= playerRemainHp) {
          console.log("[선공 - 3번 케이스]");
          return 3;
        }
      }
      if (npcPrior4 > playerPrior || (fastUser === "npc" && npcPrior4 === playerPrior)) {
        if (npcDamage4 >= playerRemainHp) {
          console.log("[선공 - 4번 케이스]");
          return 4;
        }
      }
    }

    //선공이지만 1타는 못내는 경우
    if (fastUser === "npc") {
      if (healingSkillNumber && playerDamage < bt.npc.origin.hp / 2) {
        console.log("회복하면 어쩔건데 케이스");
        return healingSkillNumber;
      }
      if (npcBench === 0) {
        //교체할 얘 없으면 가장 쎈걸로 때리기
        return maxDamageSkill;
      }
    }

    if (npcSkill1.skillEffect) {
    }
  }

  return 1;
};

const healingSkill = ["날개쉬기", "HP회복", "태만함"];
