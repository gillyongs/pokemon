import skillRequirementSearch from "../entity/Skill/SkillRequirement";
import { random } from "../util/randomCheck";
import { confuseDamageCalculate } from "../util/damageCalculate";
import { getAccuracy } from "../function/accuracyCalculate";
import { attackDamage } from "../function/damage";
import { josa } from "josa";

export const beforeSkillCheck = (bt, enqueue) => {
  // 스킬명이 뜨기 전에 처리하는 트리거
  // 반동(파괴광선) -> 잠듦, 얼음 -> 풀죽음 -> 혼란 -> 마비
  // 선도발, 마비, 얼음으로 행동 불가시 혼란 카운트 세지 않음

  const atk = bt[bt.turn.atk];
  const useSkill = atk.turn.useSkill;
  if (atk.tempStatus.glaiveRush) {
    //대검돌격 후 얼음뭉치로 선공 -> 대검돌격 디메리트 초기화
    atk.tempStatus.glaiveRush = null;
  }

  // 파괴광선 반동
  // 어지간하면 제일 먼저
  if (atk.recharge) {
    atk.recharge = null;
    atk.autoSN = null;
    let rechargeText = atk.names + " 반동으로 움직일 수 없다!";
    enqueue({ battle: bt, text: rechargeText });
    return false;
  }

  // 잠듦
  if (atk.ailment.sleep > 0) {
    // 후 잠듦 맞으면 그 다음턴은 확정 잠듦 = 사용자 행동마다 카운트
    // 교체 직후 도발 맞으면 그 턴 포함 3턴이지만
    // 교체 직후 잠듦 걸리면 그 다음 턴부터 센다
    atk.ailment.sleep -= 1;
    if (atk.ailment.sleep === 0) {
      let wakeUpText = atk.names + " 눈을 떴다!";
      atk.ailment.sleep = null;
      enqueue({ battle: bt, text: wakeUpText });
    }
  }
  if (atk.ailment.sleep !== null) {
    enqueue({ battle: bt, text: atk.names + " 쿨쿨 잠들어 있다" });
    return false;
  }

  // 얼음
  if (atk.ailment.freeze !== null) {
    if (random(80) && useSkill.type !== "불꽃") {
      let freezeText = atk.names + " 얼어버려서 움직일 수 없다!";
      enqueue({ battle: bt, text: freezeText });
      return false;
    } else {
      atk.ailment.freeze = null;
      let freezeText = atk.name + "의 얼음이 녹았다!";
      enqueue({ battle: bt, text: freezeText });
    }
  }

  // 풀죽음
  if (atk.turn.fullDeath !== null) {
    let fullDeathText = atk.names + " 풀이 죽어 기술을 쓸 수 없다!";
    enqueue({ battle: bt, text: fullDeathText });
    return false;
  }

  // 혼란
  // 잠듦, 풀죽음 등으로 행동 하지 못한 턴은 계산 x
  if (atk.tempStatus.confuse === 0) {
    let confuseText = atk.name + " 의 혼란이 풀렸다!";
    atk.tempStatus.confuse = null;
    enqueue({ battle: bt, text: confuseText });
  } else if (atk.tempStatus.confuse && atk.tempStatus.confuse > 0) {
    enqueue({ battle: bt, text: atk.names + " 혼란에 빠져있다!" });

    atk.tempStatus.confuse -= 1;
    if (random(33)) {
      // 혼란 자해는 마비에 막히지 않음
      let confuseText = atk.names + " 영문도 모른 채 자신을 공격했다!";
      attackDamage(bt, confuseDamageCalculate(bt), bt.turn.atk, enqueue, confuseText);
      return false;
    }
  }

  // 혼란이 마비보다 먼저
  // 풀죽음, 잠듦 등으로 행동하지 못한 턴은 혼란이 차감되지 않지만 마비는 차감됨

  if (atk.ailment.mabi !== null) {
    if (random(25)) {
      let mabiText = atk.names + " 몸이 저려서 움직일 수 없다!";
      enqueue({ battle: bt, text: mabiText });
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

  const atk = bt[bt.turn.atk];
  const def = bt[bt.turn.def];
  const skill = atk.turn.useSkill;
  const skillType = skill.stype;

  if (skill.requirement) {
    // 기습, 방어 사용조건 체크
    // 상대가 먼저 행동할경우, 추가로 기습은 상대방이 공격기를 쓰지 않았을 경우 실패한다. (행동엔 교체가 포함된다)
    // 스텔스록, 도발, 대타출동 등 대부분의 기술이 실패할 경우 리베로가 발동되지만
    // 기습과 방어는 실패할 경우 리베로가 발동되지 않는다
    const skillFunction = skillRequirementSearch(skill.requirement.name);
    if (typeof skillFunction === "function") {
      const skillCheck = skillFunction(bt, enqueue, skill.requirement);
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

  // 상대 선도발을 맞은 턴에 변화기를 쓴 경우
  if (atk.tempStatus.taunt !== null) {
    if (skill.stype === "buf" || skill.stype === "natk") {
      enqueue({ battle: bt, text: atk.names + " 도발당한 상태라서 " + josa(`${skill.name}#{를} `) + "쓸 수 없다!" });
      return false;
    }
  }

  // 상대 선 지옥찌르기를 맞은 턴에 소리 기술을 쓴 경우
  if (skill.feature?.sound && atk.tempStatus.noSound) {
    enqueue({ battle: bt, text: atk.names + " 소리 기술을 사용할 수 없다!" });
    return false;
  }

  // 짓궃은마음 포켓몬이 악타입에게 변화기를 쓴 경우
  if (atk.abil === "짓궂은마음" && skillType === "natk" && (def.type1 === "악" || def.type2 === "악")) {
    enqueue({ battle: bt, text: def.name + "에겐 효과가 없는 것 같다..." });
    return false;
  }

  // ==================================================================================================================

  if (atk.abil === "리베로" || atk.abil === "변환자재") {
    if (skill.type === atk.type1 && atk.type2 === null) {
      //사용자 타입이랑 스킬 타입 같으면 발동 안함
    } else {
      atk.type1 = skill.type;
      atk.type2 = null;
      enqueue({
        battle: bt,
        text: `[${atk.abil}] ` + atk.names + " " + skill.type + " 타입이 됐다!",
      });
    }
  }

  // ==================================================================================================================

  // 방어에 공격이 막힌경우
  // 리베로가 발동된다

  if (def.turn.protect === true && skillType !== "buf") {
    let protectSuccess = true;

    if (atk.abil === "보이지않는주먹" && skill.feature?.touch && atk.item !== "펀치글러브") {
      //특성 보이지않는 주먹 : 접촉기가 방어를 무시한다
      //펀치글러브를 끼면 접촉판정이 사라지므로 해당 특성 적용 안됨
      enqueue({ battle: bt, text: "[특성 보이지않는주먹] " + atk.name + "의 공격은 막을 수 없다!" });
      protectSuccess = false;
    }

    if (skill.feature?.feint) {
      // 페인트: 방어를 뚫고 공격한다
      def.turn.protect = null;
      enqueue({ battle: bt, text: `${def.name}의 방어가 해제되었다!` });
      protectSuccess = false;
    }

    const noProtectSkills = ["날려버리기", "울부짖기"]; // 방어로 막을 수 없는 스킬
    if (noProtectSkills.includes(skill.name)) {
      protectSuccess = false;
    }

    if (protectSuccess) {
      //방어로 막은 경우
      atk.turn.jumpKickFail = true;
      enqueue({ battle: bt, text: def.names + " 공격으로부터 몸을 지켰다!" });

      // 니들가드(spikyShield): 직접 접촉 공격한 상대에게 최대 체력 1/8 데미지
      // 펀치글러브 착용 시 접촉 판정이 사라져 피해 없음
      const isTouch = Boolean(skill.feature?.touch && atk.item !== "펀치글러브");
      if (def.turn?.spikyShield && isTouch && !atk.faint) {
        const spikyDmg = Math.floor(atk.origin.hp / 8);
        const spikyText = `${atk.names} 가시에 찔려 데미지를 입었다!`;
        atk.getDamage(bt, enqueue, spikyDmg, spikyText);
      }

      return false;
    }
  }

  // 특성 타오르는불꽃에 불꽃 기술이 막힌 경우 리베로가 발동한다
  // 방어로 막으면 특성 발동하지 않음
  // 대타출동 상태일때 불꽃기술 맞으면 특성 발동함
  if (skill.type === "불꽃" && skill.type !== "buf" && def.abil === "타오르는불꽃" && atk.abilObj.feature?.tgg !== true) {
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
  if (skill.feature?.oneShot && def.abil === "옹골참") {
    enqueue({ battle: bt, text: "[특성 옹골참] " + def.name + "에겐 효과가 없는 것 같다..." });
    return false;
  }

  // 스킬이 빗나간 경우
  // 리베로가 발동된다
  let accurPercent = getAccuracy(bt, skill, atk);

  let accurCheck = random(accurPercent, true);
  //필중기는 random 안에서 처리

  if (!accurCheck && skillType !== "buf") {
    // 상대방이 대타출동 상태일때 씨뿌리기가 빗나갈 수 있다 (명중해도 실패한다)
    atk.turn.jumpKickFail = true;
    enqueue({ battle: bt, text: "하지만 빗나갔다!" });
    return false;
  }

  return true;
};
