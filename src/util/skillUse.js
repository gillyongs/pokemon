import { damageCalculate } from "./damageCalculate";
import { typeCheck } from "./typeCheck";
import skillEffectSearch from "../entity/SkilleEffect";

export const skillUse = (bt, skillNumber, enqueue) => {
  const ppKey = `pp${skillNumber}`;
  const skKey = `sk${skillNumber}`;
  const atk = bt[bt.atk];
  const def = bt[bt.def];
  const sk = atk.origin[skKey];
  if (atk.temp.fullDeath != null) {
    let fullDeathText = atk.origin.names + " 풀이 죽어 기술을 쓸 수 없다!";
    if (bt.atk == "npc") {
      fullDeathText = "상대 " + fullDeathText;
    }
    enqueue({ battle: bt, text: fullDeathText });
    return;
  }

  let skillDamage = damageCalculate(bt, skillNumber, atk);
  def.hp -= skillDamage;
  if (def.hp < 0) {
    def.hp = 0;
  }
  atk[ppKey] -= 1;
  const skillUseText = atk.origin.name + "의 " + sk.name;
  enqueue({ battle: bt, text: skillUseText });

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
  if (Array.isArray(sk.skillEffectList)) {
    sk.skillEffectList.forEach((skillEffect) => {
      const skillFunction = skillEffectSearch(skillEffect);
      if (typeof skillFunction === "function") {
        skillFunction(bt, enqueue);
      }
    });
  }
};
