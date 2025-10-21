import skillRequirementSearch from "../entity/Skill/SkillRequirement";
import { random } from "../util/randomCheck";
import { confuseDamageCalculate } from "../util/damageCalculate";
import { attackDamage, damage } from "../function/damage";
import { josa } from "josa";

export const beforeSkillCheck = (bt, enqueue) => {
  //스킬명이 뜨기 전에 처리하는 트리거
  // 수면, 마비, 얼음, 풀죽음, 도발, 혼란
  // 수면, 얼음 -> 풀죽음,도발 -> 마비 -> 혼란
  // 수면 상태면 풀죽음, 도발 메시지 안 뜸
  // 수면 깨면 풀죽음, 도발 텍스트 뜸
  // 얼음도 이와 동일한 판정일 것으로 추정
  // 풀죽음 도발 동시에 불가
  // 풀죽거나 도발이면 마비 텍스트 안 뜸
  // 선도발, 마비, 얼음으로 행동 불가시 혼란 카운트 세지 않음

  const atk = bt[bt.turn.atk];
  const useSkill = atk.temp.useSkill;

  if (atk.tempStatus.taunt > 0) {
    //선 도발 맞으면 그 턴 포함 3턴
    //후 도발 맞으면 그 다음턴부터 3턴
    //풀죽음이나 상태이상으로 행동 못해도 턴은 지나갈 것 같음 (추정)
    //선도발로 변화기 막히는건 밑에서 처리
    //도발 풀리는건 turnEnd에서 처리
    atk.tempStatus.taunt -= 1;
  }

  // 수면
  if (atk.status.sleep > 0) {
    // 후 수면 맞으면 그 다음턴은 확정 수면 = 사용자 행동마다 카운트
    // 교체 직후 도발 맞으면 그 턴 포함 3턴이지만
    // 교체 직후 수면 걸리면 그 다음 턴부터 센다
    atk.status.sleep -= 1;
    if (atk.status.sleep === 0) {
      let wakeUpText = atk.names + " 눈을 떴다!";
      atk.status.sleep = null;
      enqueue({ battle: bt, text: wakeUpText });
    }
  }
  if (atk.status.sleep !== null) {
    enqueue({ battle: bt, text: atk.names + " 쿨쿨 잠들어 있다" });
    return false;
  }

  // 얼음
  if (atk.status.freeze !== null) {
    if (random(80) && useSkill.type !== "불꽃") {
      let freezeText = atk.names + " 얼어버려서 움직일 수 없다!";
      enqueue({ battle: bt, text: freezeText });
      return false;
    } else {
      atk.status.freeze = null;
      let freezeText = atk.name + "의 얼음이 녹았다!";
      enqueue({ battle: bt, text: freezeText });
    }
  }

  // 풀죽음
  if (atk.temp.fullDeath !== null) {
    let fullDeathText = atk.names + " 풀이 죽어 기술을 쓸 수 없다!";
    enqueue({ battle: bt, text: fullDeathText });
    return false;
  }

  // 상대 선도발을 맞은 경우
  if (atk.tempStatus.taunt !== null) {
    if (useSkill.stype === "buf" || useSkill.stype === "natk") {
      enqueue({ battle: bt, text: atk.names + " 도발당한 상태라서 " + josa(`${useSkill.name}#{를} `) + "쓸 수 없다!" });
      return false;
    }
  }

  if (atk.status.mabi !== null) {
    if (random(25)) {
      let mabiText = atk.names + " 몸이 저려서 움직일 수 없다!";
      enqueue({ battle: bt, text: mabiText });
      return false;
    }
  }

  if (atk.tempStatus.confuse === 0) {
    let confuseText = atk.name + " 의 혼란이 풀렸다!";
    atk.tempStatus.confuse = null;
    enqueue({ battle: bt, text: confuseText });
  } else if (atk.tempStatus.confuse && atk.tempStatus.confuse > 0) {
    enqueue({ battle: bt, text: atk.names + " 혼란에 빠져있다!" });
    // 혼란은 행동 기준이므로 상태이상이나 풀죽음으로 막히면 턴 수 계산 x
    // 이 텍스트가 뜨는게 기준 같음
    // 선도발로 변화기가 끊겨도 해당 텍스트가 안 뜨기에 카운트 세지 않음
    atk.tempStatus.confuse -= 1;
    if (random(33)) {
      //상대방이 패널티로 기절해도 혼란 자해는 가능하다
      let confuseText = atk.names + " 영문도 모른 채 자신을 공격했다!";
      attackDamage(bt, confuseDamageCalculate(bt), bt.turn.atk, enqueue, confuseText);
      return false;
    }
  }

  return true;
};

// ================================================================================================================================
// ================================================================================================================================
// ================================================================================================================================

export const afterSkillCheck = (bt, enqueue) => {
  // 스킬명이 뜬 다음에 처리하는 트리거
  // 사용조건체크(ex 기습), 상대방 기절 여부, 명중
  // 리베로는 실패해도 발동되기에 타이밍상 여기

  const skillNumber = bt.turn.atkSN;
  const skKey = `sk${skillNumber}`;
  const atk = bt[bt.turn.atk];
  const def = bt[bt.turn.def];
  const sk = atk.origin[skKey];
  const skillType = bt[bt.turn.atk].origin["sk" + bt.turn.atkSN].stype;

  if (sk.skillRequirement) {
    // 기습, 방어 사용조건 체크
    // 상대가 먼저 행동할경우, 추가로 기습은 상대방이 공격기를 쓰지 않았을 경우 실패한다. (행동엔 교체가 포함된다)
    // 스텔스록, 도발, 대타출동 등 대부분의 기술이 실패할 경우 리베로가 발동되지만
    // 기습과 방어는 실패할 경우 리베로가 발동되지 않는다
    const skillFunction = skillRequirementSearch(sk.skillRequirement.name);
    if (typeof skillFunction === "function") {
      const skillCheck = skillFunction(bt, enqueue, sk.skillRequirement);
      if (!skillCheck) {
        enqueue({ battle: bt, text: "하지만 실패했다!" });
        return false;
      }
    }
  }

  if (def.faint === true && skillType !== "buf") {
    // 상대가 이미 기절한 경우
    // 마찬가지로 리베로가 발동하지 않는다
    enqueue({ battle: bt, text: "하지만 실패했다!" });
    return false;
  }

  // ==================================================================================================================

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

  // ==================================================================================================================

  // 방어에 공격이 막힌경우
  // 리베로가 발동된다

  if (def.temp.protect === true && skillType !== "buf") {
    let protectSuccess = true;

    if (atk.abil === "보이지않는주먹" && sk.feature?.touch && atk.item !== "펀치글러브") {
      //특성 보이지않는 주먹 : 접촉기가 방어를 무시한다
      //펀치글러브를 끼면 접촉판정이 사라지므로 해당 특성 적용 안됨
      enqueue({ battle: bt, text: "[특성 보이지않는주먹] " + atk.name + "의 공격은 막을 수 없다!" });
      protectSuccess = false;
    }

    const noProtectSkills = ["날려버리기"]; // 방어로 막을 수 없는 스킬
    if (noProtectSkills.includes(sk.name)) {
      protectSuccess = false;
    }

    if (protectSuccess) {
      //방어로 막은 경우
      atk.temp.jumpKickFail = true;
      enqueue({ battle: bt, text: def.names + " 공격으로부터 몸을 지켰다!" });
      return false;
    }
  }

  // 특성 타오르는불꽃에 불꽃 기술이 막힌 경우엔 발동한다
  // 방어로 막으면 특성 발동하지 않음
  // 대타출동 상태일때 불꽃기술 맞으면 특성 발동함
  if (sk.type === "불꽃" && def.abil === "타오르는불꽃") {
    if (def.tempStatus.flashFire) {
      // 이미 발동된 경우
      enqueue({ battle: bt, text: "[특성 타오르는불꽃] " + def.name + "에겐 효과가 없는 것 같다..." });
    } else {
      def.tempStatus.flashFire = true;
      enqueue({ battle: bt, text: "[특성 타오르는불꽃] " + def.names + " 불꽃의 위력이 올라갔다!" });
    }
    return false;
  }

  // 특성 옹골참에 일격기가 막힌 경우
  // 리베로가 발동된다
  if (sk.feature?.oneShot && def.abil === "옹골참") {
    enqueue({ battle: bt, text: "[특성 옹골참] " + def.name + "에겐 효과가 없는 것 같다..." });
    return false;
  }

  // 스킬이 빗나간 경우
  // 리베로가 발동된다
  const weatherSkill = ["번개", "폭풍"];
  let accurPercent = atk.origin[skKey].accur;
  if (weatherSkill.includes(sk.name) && bt.field.weather === "쾌청") {
    accurPercent = 50;
  }

  let accurCheck = random(accurPercent, true);
  //필중기는 random 안에서 처리

  if (weatherSkill.includes(sk.name) && bt.field.weather === "비") {
    accurCheck = true;
  }

  if (!accurCheck && skillType !== "buf") {
    // 상대방이 대타출동 상태일때 씨뿌리기가 빗나갈 수 있다 (명중해도 실패한다)
    atk.temp.jumpKickFail = true;
    enqueue({ battle: bt, text: "하지만 빗나갔다!" });
    return false;
  }

  return true;
};
