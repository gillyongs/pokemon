import skillRequirementSearch from "../../entity/Skill/SkillRequirement";
import { random } from "../../util/randomCheck";
import { confuseDamage } from "../damage/confuseDamage";
import { getAccuracy } from "../../calc/accuracyCalculate";
import { checkSkillDisabled } from "./skillDisableCheck";
import { getSkillFailResult } from "./skillFailCheck";

export const beforeSkillCheck = (bt, enqueue) => {
  // 스킬명이 뜨기 전에 처리하는 트리거
  // 반동(파괴광선) -> 잠듦, 얼음 -> 풀죽음 -> 혼란 -> 마비
  // 선도발, 마비, 얼음으로 행동 불가시 혼란 카운트 세지 않음

  const atk = bt[bt.turn.atk];
  const skill = atk.turn.useSkill;

  atk.tempStatus.glaiveRush = null; // 대검돌격
  atk.tempStatus.destinyBond = false; // 길동무
  //대검돌격 후 얼음뭉치로 선공 -> 대검돌격 디메리트 초기화

  // 파괴광선 반동
  // 어지간하면 제일 먼저
  if (atk.recharge) {
    atk.recharge = null;
    atk.autoSN = null;
    let rechargeText = atk.names("는") + " 반동으로 움직일 수 없다!";
    enqueue(bt, rechargeText, "chk_recharge");
    return false;
  }

  // 잠듦
  if (atk.ailment.sleep > 0) {
    // 잠듦은 행동 기준 카운트 (후공으로 잠들면 다음턴은 확정 수면)
    atk.ailment.sleep -= 1;
    if (atk.ailment.sleep === 0) {
      let wakeUpText = atk.names("는") + " 눈을 떴다!";
      atk.ailment.sleep = null;
      enqueue(bt, wakeUpText, "chk_sleep_wake");
    }
  }
  if (atk.ailment.sleep !== null) {
    enqueue(bt, atk.names("는") + " 쿨쿨 잠들어 있다.", "chk_sleeping");
    return false;
  }

  // 얼음 (영구 동결 - freezeBug)
  if (atk.ailment.freezeBug !== null) {
    let freezeText = atk.names("는") + " 꽁꽁 얼어버려서 움직일 수 없다!";
    enqueue(bt, freezeText, "chk_freeze_bug");
    return false;
  }

  // 얼음
  if (atk.ailment.freeze !== null) {
    if (random(80) && skill.type !== "불꽃") {
      // 얼어붙은 포켓몬이 불꽃타입 기술을 사용하면 얼음이 녹는다
      let freezeText = atk.names("는") + " 얼어버려서 움직일 수 없다!";
      enqueue(bt, freezeText, "chk_frozen");
      return false;
    } else {
      atk.ailment.freeze = null;
      let freezeText = atk.name + "의 얼음이 녹았다!";
      enqueue(bt, freezeText, "chk_thaw");
    }
  }

  // 풀죽음
  if (atk.turn.fullDeath !== null) {
    let fullDeathText = atk.names("는") + " 풀이 죽어 기술을 쓸 수 없다!";
    enqueue(bt, fullDeathText, "chk_flinch");
    return false;
  }

  // 혼란
  // 잠듦, 풀죽음 등으로 행동 하지 못한 턴은 계산 x
  if (atk.tempStatus.confuse === 0) {
    let confuseText = atk.name + "의 혼란이 풀렸다!";
    atk.tempStatus.confuse = null;
    enqueue(bt, confuseText, "chk_confuse_end");
  } else if (atk.tempStatus.confuse && atk.tempStatus.confuse > 0) {
    enqueue(bt, atk.names("는") + " 혼란에 빠져 있다!", "chk_confused");
    atk.tempStatus.confuse -= 1;
    if (random(33)) {
      // 혼란 자해는 마비에 막히지 않음
      confuseDamage(bt, enqueue);
      return false;
    }
  }

  // 혼란이 마비보다 먼저
  // 풀죽음, 잠듦 등으로 행동하지 못한 턴은 혼란이 차감되지 않지만 마비는 차감됨

  if (atk.ailment.mabi !== null) {
    if (random(25)) {
      let mabiText = atk.names("는") + " 몸이 저려서 움직일 수 없다!";
      enqueue(bt, mabiText, "chk_paralyzed");
      return false;
    }
  }

  // 도발, 소리기술금지, 회복봉인, 사슬묶기/저주받은바디로 봉인된 기술 사용
  // 상대의 선공으로 기술 금지를 맞고 해당 기술을 사용한 경우
  // 기술이 실패하며 pp가 소모되지 않고 기술 고정도 되지 않는다.
  if (!checkSkillDisabled(bt, enqueue, atk, skill)) {
    return false;
  }

  return true;
};

// ================================================================================================================================
// ================================================================================================================================

// 스킬 사용 전 체크 (beforeSkillCheck) 후
// pp소모, 구애 고정 처리, 기술 사용 텍스트 출력한 다음
// 스킬 사용 후 체크 (afterSkillCheck) 를 진행

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
    // 기술별 특수 조건 체크 (기습, 방어, 카운터, 만나자마자, 폴터가이스트)
    // 스텔스록, 도발, 대타출동 등 대부분의 기술이 실패할 경우 리베로가 발동되지만
    // 해당 기술들은 실패할 경우 리베로가 발동되지 않는다

    // pp도 소모되고 구애 고정도 되는데 리베로만 발동 안함
    // 조건이 지맘대로라 고증 지키려면 일일히 체크해야됨
    const skillFunction = skillRequirementSearch(skill.requirement.name);
    if (typeof skillFunction === "function") {
      const skillCheck = skillFunction(bt, enqueue, skill.requirement);
      if (!skillCheck) {
        enqueue(bt, "하지만 실패했다!", "chk_req_fail");
        return false;
      }
    }
  }

  if (def.faint === true && skillType !== "buf") {
    // 상대가 이미 기절한 경우
    // 무릎차기 디메리트를 받지 않는다.
    // 리베로가 발동하지 않는다
    // 사용 기술이 자폭이면 놀랍게도 리베로가 발동된다함. 근데 어차피 리베로 배우는 포켓몬중 자폭/대폭발 배우는 포켓몬 없음
    enqueue(bt, "하지만 실패했다!", "chk_def_faint");
    return false;
  }

  // 증강 "하지만 버텨냈다"가 발동한 턴에는 기절하지 않음 -> 목숨걸기, 자폭, 대폭발 실패
  if (atk.turn?.butItRefused && (skill.skillEffectList?.some((e) => e.name === "자폭" || e.name === "목숨걸기") || ["목숨걸기", "자폭", "대폭발"].includes(skill.name))) {
    enqueue(bt, "하지만 실패했다!", "chk_suicide_but_it_refused");
    return false;
  }

  // ==================================================================================================================

  // 기술 "시전" 여부
  // 기술을 사용 헀으므로 방어에 막히거나 기술이 빗나가더라도 자폭이나 철제광선 디메리트를 받는다.
  atk.turn.skillLaunched = true;

  // 무한 리베로/변환자재 증강
  const hasInfiniteTypeChange = Boolean((atk.abil?.name === "리베로" && atk.hasAugment?.("libero")) || (atk.abil?.name === "변환자재" && atk.hasAugment?.("protean")));

  if ((atk.abil?.name === "리베로" || atk.abil?.name === "변환자재") && (!atk.abil?.used || hasInfiniteTypeChange)) {
    if (skill.type === atk.type1 && atk.type2 === null) {
      // 사용자 타입이랑 스킬 타입 같으면 발동 안함
      // 에이스번이 불꽃볼 쓰면 발동 안함
      // 풀,악 복합타입이 풀스킬 쓰면 단일 풀타입 됨
    } else {
      if (!hasInfiniteTypeChange) {
        atk.abil.used = true;
      }
      atk.type1 = skill.type;
      atk.type2 = null;
      enqueue(bt, `[${atk.abil?.name}] ` + atk.names("는") + " " + skill.type + " 타입이 됐다!", "chk_libero");
    }
  }

  // ==================================================================================================================

  // 일반 기술 실패 및 무효 판정 (skillFailCheck에서 통합 관리)
  const failResult = getSkillFailResult(bt, bt.turn.atk, skill, { skipPreLibero: true });
  if (failResult) {
    if (failResult.jumpKickFail) {
      atk.turn.jumpKickFail = true;
    }
    if (failResult.text) {
      enqueue(bt, failResult.text, failResult.code || "chk_fail");
    }
    if (failResult.onFail) {
      failResult.onFail(bt, enqueue);
    }
    return false;
  }

  // 방어 관통 / 해제 연출 (보이지않는주먹, 페인트)
  if (def.turn.protect === true && skillType !== "buf") {
    if (atk.abil?.name === "보이지않는주먹" && skill.feature?.touch && atk.item !== "펀치글러브") {
      enqueue(bt, "[특성 보이지않는주먹] " + atk.name + "의 공격은 막을 수 없다!", "chk_unseen_fist");
    }
    if (skill.feature?.feint) {
      def.turn.protect = null;
      enqueue(bt, `${def.name}의 방어가 해제되었다!`, "chk_feint_break");
    }
  }

  // [증강] 인생은 한방: 공격 기술이 50% 확률로 실패
  // 랜덤성이므로 최대한 마지막에 체크
  if (atk?.hasAugment?.("lifeIsOneShot") && (skillType === "atk" || skillType === "catk")) {
    if (!random(50)) {
      atk.turn.jumpKickFail = true;
      enqueue(bt, "[증강 인생은 한방] 하지만 실패했다!", "chk_life_oneshot_fail");
      return false;
    }
  }

  // 명중 여부 체크 =================================================================================
  // 모든 실패 여부를 체크한 다음 마지막에 처리한다
  // 필중기는 random 안에서 처리
  if (skillType !== "buf") {
    const accurPercent = getAccuracy(bt, skill, atk);
    const accurCheck = random(accurPercent, true);
    if (!accurCheck) {
      if (skillType === "atk" || skillType === "catk") {
        atk.turn.jumpKickFail = true;
      }
      enqueue(bt, "하지만 빗나갔다!", "chk_miss");
      return false;
    }
  }

  return true;
};
