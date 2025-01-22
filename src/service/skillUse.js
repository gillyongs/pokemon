import { damageCalculate } from "../util/damageCalculate";
import { typeCheck } from "../util/typeCheck";
import skillEffectSearch from "../entity/SkillEffect";
import skillRequirementSearch from "../entity/SkillRequirement";
import { random } from "../util/randomCheck";
import { damage } from "./damage";
export const skillUse = (bt, skillNumber, enqueue) => {
  const ppKey = `pp${skillNumber}`;
  const skKey = `sk${skillNumber}`;
  const atk = bt[bt.turn.atk];
  const def = bt[bt.turn.def];
  const sk = atk.origin[skKey];

  if (atk.temp.fullDeath != null) {
    let fullDeathText = atk.names + " 풀이 죽어 기술을 쓸 수 없다!";
    enqueue({ battle: bt, text: fullDeathText });
    return;
  }

  const skillUseText = atk.name + "의 " + sk.name + "!";
  enqueue({ battle: bt, text: skillUseText });

  if (sk.skillRequirement) {
    const skillFunction = skillRequirementSearch(sk.skillRequirement);
    if (typeof skillFunction === "function") {
      const skillCheck = skillFunction(bt, enqueue);
      if (!skillCheck) {
        enqueue({ battle: bt, text: "하지만 실패했다!" });
        return;
      }
    }
  }

  const accurCheck = random(atk.origin[skKey].accur);
  if (accurCheck) {
    let skillDamage = damageCalculate(bt, skillNumber, atk);
    damage(bt, skillDamage, bt.turn.def, enqueue);
    atk[ppKey] -= 1;
  }

  if (!accurCheck) {
    atk.temp.miss = true;
    enqueue({ battle: bt, text: "하지만 빗나갔다!" });
  } else {
    let typeDamage = typeCheck(sk.type, def.type1, def.type2);
    let typeText;
    if (typeDamage === 1) {
      typeText = null;
    } else if (typeDamage === 0) {
      typeText = "효과가 없는 것 같다...";
    } else if (typeDamage > 0 && typeDamage < 1) {
      typeText = "효과가 별로인 것 같다...";
    } else if (typeDamage > 1) {
      typeText = "효과가 굉장했다!";
    }

    if (typeText != null) {
      enqueue({ battle: bt, text: typeText });
    }
  }

  if (Array.isArray(sk.skillEffectList)) {
    sk.skillEffectList.forEach((skillEffect) => {
      if (skillEffect.name) {
        const skillFunction = skillEffectSearch(skillEffect.name);
        if (typeof skillFunction === "function") {
          skillFunction(bt, enqueue, skillEffect);
        }
      }
    });
  }
};
