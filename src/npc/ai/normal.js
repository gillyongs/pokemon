import { damageCalculate } from "../../util/damageCalculate";

export function npcAiNormal(choices, battle) {
  const sk1 = battle.npc.origin.sk1;
  const sk2 = battle.npc.origin.sk2;
  const sk3 = battle.npc.origin.sk3;
  const sk4 = battle.npc.origin.sk4;
  let npcDamage1;
  let npcDamage2;
  let npcDamage3;
  let npcDamage4;

  const bt = structuredClone(battle);
  bt.turn.atk = "npc";
  bt.turn.def = "player";

  if (isAttack(sk1.stype)) {
    bt.turn.atkSN = 1;
    npcDamage1 = damageCalculate(bt);
    if (isNaN(npcDamage1)) npcDamage1 = 0;
  }

  if (isAttack(sk2.stype)) {
    bt.turn.atkSN = 2;
    npcDamage2 = damageCalculate(bt);
    if (isNaN(npcDamage2)) npcDamage2 = 0;
  }

  if (isAttack(sk3.stype)) {
    bt.turn.atkSN = 3;
    npcDamage3 = damageCalculate(bt);
    if (isNaN(npcDamage3)) npcDamage3 = 0;
  }

  if (isAttack(sk4.stype)) {
    bt.turn.atkSN = 4;
    npcDamage4 = damageCalculate(bt);
    if (isNaN(npcDamage4)) npcDamage4 = 0;
  }

  console.log(npcDamage1);
  console.log(npcDamage2);
  console.log(npcDamage3);
  console.log(npcDamage4);
}

function isAttack(stype) {
  if (stype === "atk" || stype === "catk") {
    return true;
  }
  return false;
}
