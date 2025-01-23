import skillRequirementSearch from "../entity/SkillRequirement";
import { random } from "../util/randomCheck";
import { confuseDamageCalculate } from "../util/damageCalculate";
import { damage } from "./damage";

export const skillUseCheck = (bt, enqueue) => {
  const atk = bt[bt.turn.atk];
  if (atk.temp.fullDeath != null) {
    let fullDeathText = atk.names + " 풀이 죽어 기술을 쓸 수 없다!";
    enqueue({ battle: bt, text: fullDeathText });
    return false;
  }

  if (atk.status.mabi != null) {
    if (random(25)) {
      let mabiText = atk.names + " 몸이 저려서 움직일 수 없다!";
      enqueue({ battle: bt, text: mabiText });
      return false;
    }
  }

  if (atk.tempStatus.confuseTurnRemain === 0) {
    let confuseText = atk.name + " 의 혼란이 풀렸다!";
    atk.tempStatus.confuseTurnRemain = null;
    atk.tempStatus.confuse = null;
    enqueue({ battle: bt, text: confuseText });
  } else if (atk.tempStatus.confuse != null) {
    if (typeof atk.tempStatus.confuseTurnRemain !== "number") {
      console.error(
        "confuseTurnRemain is not a number",
        atk.tempStatus.confuseTurnRemain
      );
    }
    enqueue({ battle: bt, text: atk.names + " 혼란에 빠져있다!" });
    atk.tempStatus.confuseTurnRemain -= 1;
    if (random(33)) {
      let confuseText = atk.names + " 영문도 모른 채 자신을 공격했다!";
      enqueue({ battle: bt, text: confuseText });
      damage(bt, confuseDamageCalculate(bt), bt.turn.atk, enqueue);
      return false;
    }
  }

  return true;
};

export const skillFailCheck = (bt, enqueue) => {
  const skillNumber = bt.turn.atkSN;
  const skKey = `sk${skillNumber}`;
  const atk = bt[bt.turn.atk];
  const def = bt[bt.turn.def];
  const sk = atk.origin[skKey];
  const skillType = bt[bt.turn.atk].origin["sk" + bt.turn.atkSN].stype;

  if (sk.skillRequirement) {
    const skillFunction = skillRequirementSearch(sk.skillRequirement);
    if (typeof skillFunction === "function") {
      const skillCheck = skillFunction(bt, enqueue);
      if (!skillCheck) {
        enqueue({ battle: bt, text: "하지만 실패했다!" });
        return false;
      }
    }
  }

  if (def.faint === true) {
    //상대가 이미 기절한 경우
    enqueue({ battle: bt, text: "하지만 실패했다!" });
    return false;
  }

  const accurCheck = random(atk.origin[skKey].accur);
  if (!accurCheck && skillType !== "buf") {
    atk.temp.miss = true;
    enqueue({ battle: bt, text: "하지만 빗나갔다!" });
    return false;
  }

  return true;
};
