import {
  confuseDamageCalculate,
  damageCalculate,
} from "../util/damageCalculate";
import { typeCheck } from "../util/typeCheck";
import skillEffectSearch from "../entity/SkillEffect";
import skillRequirementSearch from "../entity/SkillRequirement";
import { random } from "../util/randomCheck";
import { damage } from "./damage";
export const skillUse = (bt, enqueue) => {
  const skillNumber = bt.turn.atkSN;
  const ppKey = `pp${skillNumber}`;
  const skKey = `sk${skillNumber}`;
  const atk = bt[bt.turn.atk];
  const def = bt[bt.turn.def];
  const sk = atk.origin[skKey];
  const skillType = bt[bt.turn.atk].origin["sk" + bt.turn.atkSN].stype;

  if (atk.temp.fullDeath != null) {
    let fullDeathText = atk.names + " 풀이 죽어 기술을 쓸 수 없다!";
    enqueue({ battle: bt, text: fullDeathText });
    return;
  }

  if (atk.status.mabi != null) {
    if (random(25)) {
      let mabiText = atk.names + " 몸이 저려서 움직일 수 없다!";
      enqueue({ battle: bt, text: mabiText });
      return;
    }
  }

  if (atk.tempStatus.confuseTurnRemain === 0) {
    let confuseText = atk.name + " 의 혼란이 풀렸다!";
    atk.tempStatus.confuseTurnRemain = null;
    atk.tempStatus.confuse = null;
    enqueue({ battle: bt, text: confuseText });
  } else if (atk.tempStatus.confuse != null) {
    enqueue({ battle: bt, text: atk.names + " 혼란에 빠져있다!" });
    atk.tempStatus.confuseTurnRemain -= 1;
    if (random(33)) {
      let confuseText = atk.names + " 영문도 모른 채 자신을 공격했다!";
      enqueue({ battle: bt, text: confuseText });
      damage(bt, confuseDamageCalculate(bt), bt.turn.atk, enqueue);
      return;
    }
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
  } else if (bt[bt.turn.def].faint === true) {
    enqueue({ battle: bt, text: "하지만 실패했다!" });
    return;
  }

  const accurCheck = random(atk.origin[skKey].accur);
  if (!accurCheck && skillType !== "buf") {
    atk.temp.miss = true;
    enqueue({ battle: bt, text: "하지만 빗나갔다!" });
    return;
  }

  if (skillType === "atk" || skillType === "catk") {
    let skillDamage = damageCalculate(bt, skillNumber, atk);
    damage(bt, skillDamage, bt.turn.def, enqueue);
    atk[ppKey] -= 1;

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
  } else if (skillType === "natk") {
    let typeDamage = typeCheck(sk.type, def.type1, def.type2);
    if (typeDamage === 0) {
      const typeText = bt[bt.turn.def].name + "에겐 효과가 없는 것 같다...";
      enqueue({ battle: bt, text: typeText });
    }
    return;
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
