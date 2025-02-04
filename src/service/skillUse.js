import { damageCalculate } from "../util/damageCalculate";
import { typeCheck, typeCheckText } from "../util/typeCheck";
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
    let skillDamage = damageCalculate(bt, skillNumber, atk);
    if (def.abil === "탈") {
      if (skillDamage > def.origin.hp / 8) {
        skillDamage = def.origin.hp / 8;
      }
      def.abil = "탈 (사용됨)";
      def.origin.abil = "탈 (사용됨)";
      enqueue({ battle: bt, text: "탈이 대타가 되었다!" });
    }
    damage(bt, skillDamage, bt.turn.def, enqueue);
    atk[ppKey] -= 1;
    if (def.origin.abil === "프레셔" && atk[ppKey] > 0) {
      atk[ppKey] -= 1;
    }

    let typeDamage = typeCheck(sk.type, def.type1, def.type2);
    if (typeDamage === 0) {
      atk.temp.miss = true;
    }

    let typeText = typeCheckText(typeDamage);
    if (typeText) {
      enqueue({ battle: bt, text: typeText });
    }
  } else if (skillType === "natk") {
    let typeDamage = typeCheck(sk.type, def.type1, def.type2);
    if (typeDamage === 0) {
      const typeText = bt[bt.turn.def].name + "에겐 효과가 없는 것 같다...";
      enqueue({ battle: bt, text: typeText });
      return;
    }
  }

  applySkillEffects(bt, enqueue, sk.skillEffectList);
};
