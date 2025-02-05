import skillRequirementSearch from "../entity/Skill/SkillRequirement";
import { random } from "../util/randomCheck";
import { confuseDamageCalculate } from "../util/damageCalculate";
import { damage } from "../function/damage";

export const skillUseCheck = (bt, enqueue) => {
  //스킬명이 뜨기 전에 처리하는 트리거
  //풀죽음, 마비, 혼란
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
      damage(bt, confuseDamageCalculate(bt), bt.turn.atk, enqueue, confuseText);
      return false;
    }
  }

  return true;
};

export const skillFailCheck = (bt, enqueue) => {
  // 스킬명이 뜬 다음에 처리하는 트리거
  // 사용조건체크(ex 기습), 상대방 기절 여부, 명중
  // 리베로는 실패해도 발동되기에 타이밍상 여기
  const skillNumber = bt.turn.atkSN;
  const skKey = `sk${skillNumber}`;
  const atk = bt[bt.turn.atk];
  const def = bt[bt.turn.def];
  const sk = atk.origin[skKey];
  const skillType = bt[bt.turn.atk].origin["sk" + bt.turn.atkSN].stype;

  if (atk.abil === "리베로") {
    if (sk.type === atk.type1 && atk.type2 === null) {
      //사용자 타입이랑 스킬 타입 같으면 리베로 발동 안함
    } else {
      atk.type1 = sk.type;
      atk.type2 = null;
      enqueue({
        battle: bt,
        text: "[리베로] " + atk.names + " " + sk.type + " 타입이 됐다!",
      });
    }
  }

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
