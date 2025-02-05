import { damageCalculate } from "../util/damageCalculate";
import { typeCheck, typeCheckText, typeCheckAbil } from "../util/typeCheck";
import { damage } from "../function/damage";
import { applySkillEffects } from "./skiiEffect";
import { skillUseCheck, skillFailCheck } from "./skillCheck";

export const skillUse = (bt, enqueue) => {
  const skillNumber = bt.turn.atkSN;
  const ppKey = `pp${skillNumber}`;
  const skKey = `sk${skillNumber}`;
  const atk = bt[bt.turn.atk];
  const def = bt[bt.turn.def];
  const sk = atk.origin[skKey];
  const skillType = bt[bt.turn.atk].origin["sk" + bt.turn.atkSN].stype;

  if (skillUseCheck(bt, enqueue) === false) {
    return;
  }

  const skillUseText = atk.name + "의 " + sk.name + "!";
  enqueue({ battle: bt, text: skillUseText });

  if (skillFailCheck(bt, enqueue) === false) {
    return;
  }

  if (skillType === "atk" || skillType === "catk") {
    let cri = atk.tempStatus.rank.critical;

    for (const effect of sk.skillEffectList) {
      console.log(effect);
      if (effect.name === "급소") {
        cri += 1;
      }
    }

    if (criticalRate(cri)) {
      atk.temp.critical = true;
    }

    let skillDamage = damageCalculate(bt, skillNumber, atk);
    let typeDamage = typeCheckAbil(bt, sk.type, def.type1, def.type2);
    let typeText = typeCheckText(typeDamage);

    atk[ppKey] -= 1;
    if (def.origin.abil === "프레셔" && atk[ppKey] > 0) {
      atk[ppKey] -= 1;
    }

    if (typeDamage === 0) {
      atk.temp.miss = true;
      const typeText = bt[bt.turn.def].name + "에겐 효과가 없는 것 같다...";
      enqueue({ battle: bt, text: typeText });
      return;
    }

    if (def.abil === "탈") {
      if (skillDamage > def.origin.hp / 8) {
        skillDamage = def.origin.hp / 8;
      }
      def.abil = "탈 (사용됨)";
      def.origin.abil = "탈 (사용됨)";
      enqueue({ battle: bt, text: "탈이 대타가 되었다!" });
    }

    damage(bt, skillDamage, bt.turn.def, enqueue, typeText);
  } else if (skillType === "natk") {
    let typeDamage = typeCheckAbil(bt, sk.type, def.type1, def.type2);
    if (typeDamage === 0) {
      const typeText = bt[bt.turn.def].name + "에겐 효과가 없는 것 같다...";
      enqueue({ battle: bt, text: typeText });
      return;
    }
  }

  applySkillEffects(bt, enqueue, sk.skillEffectList);
};

const criticalRate = (input) => {
  let probability = 0;
  if (input !== 0 && input !== 1 && input !== 2 && input !== 3) {
    console.error("급소율 에러 확인 필요");
  }

  switch (input) {
    case 0:
      probability = 1 / 24;
      break;
    case 1:
      probability = 1 / 8;
      break;
    case 2:
      probability = 1 / 2;
      break;
    default:
      return true;
  }

  return Math.random() < probability;
};
