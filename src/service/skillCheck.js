import skillRequirementSearch from "../entity/Skill/SkillRequirement";
import { random } from "../util/randomCheck";
import { confuseDamageCalculate } from "../calc/damageCalculate";
import { attackDamage } from "./damage";
import { josa } from "josa";

export const getSkillUnusableReason = (pokemon, skillIndex) => {
  const skill = pokemon?.skill?.[skillIndex];
  const pp = pokemon?.pp?.[skillIndex];

  if (!skill || pp <= 0) {
    return "해당 기술은 더 이상 사용할 수 없다!";
  }

  // 구애 시리즈 또는 무아지경으로 인해 사용 가능한 스킬이 고정된 경우
  const { onlySkill } = pokemon.tempStatus || {};
  const hasUnbound = pokemon.hasAugment?.("unboundChoice");
  const isChoiceLocked = Boolean(pokemon.item?.startsWith("구애") && !hasUnbound);
  const isGorillaLocked = Boolean(pokemon.abil?.name === "무아지경" && !hasUnbound);
  if (onlySkill && (isChoiceLocked || isGorillaLocked) && onlySkill !== skill.name) {
    const lockSource = isGorillaLocked ? "특성 무아지경" : pokemon.item;
    return `${lockSource} 효과로 인해 해당 기술은 사용할 수 없다!`;
  }

  // 연속 사용 불가 스킬 (ex: 블러드문)
  const recentSkill = pokemon.tempStatus?.recentSkillUse?.name;
  if (recentSkill === skill.name && skill.feature?.noDouble) {
    return "해당 기술은 연속으로 사용할 수 없다!";
  }

  // 돌격조끼 입고 변화기 사용
  if (pokemon.item === "돌격조끼" && (skill.stype === "natk" || skill.stype === "buf")) {
    return `${pokemon.names("는")} 돌격조끼 때문에 변화기를 사용할 수 없다!`;
  }

  // 도발 상태에서 변화기 사용
  if (pokemon.tempStatus?.taunt !== null && (skill.stype === "natk" || skill.stype === "buf")) {
    return `${pokemon.names("는")} 도발 때문에 변화기를 사용할 수 없다!`;
  }

  // 소리기술금지 상태에서 소리 기술 사용
  if (pokemon.tempStatus?.noSound !== null && skill.feature?.sound) {
    return `${pokemon.names("는")} 한동안 소리 기술을 사용할 수 없다!`;
  }

  // 회복봉인 상태에서 회복 기술 사용
  if (pokemon.tempStatus?.healBlock !== null && skill.feature?.heal) {
    return `${pokemon.names("는")} 회복 봉인 효과로 회복 기술을 사용할 수 없다!`;
  }

  // 사슬묶기/저주받은바디로 봉인된 기술 사용
  if (pokemon.tempStatus?.disable && pokemon.tempStatus.disable === skill.name) {
    return "해당 기술은 봉인되어 사용할 수 없다!";
  }

  return null;
};

export const isSkillUsable = (pokemon, skillIndex) => !getSkillUnusableReason(pokemon, skillIndex);

export const beforeSkillCheck = (bt, enqueue) => {
  // 스킬명이 뜨기 전에 처리하는 트리거
  // 반동(파괴광선) -> 잠듦, 얼음 -> 풀죽음 -> 혼란 -> 마비
  // 선도발, 마비, 얼음으로 행동 불가시 혼란 카운트 세지 않음

  const atk = bt[bt.turn.atk];
  const useSkill = atk.turn.useSkill;

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
    // 후 잠듦 맞으면 그 다음턴은 확정 잠듦 = 사용자 행동마다 카운트
    // 교체 직후 도발 맞으면 그 턴 포함 3턴이지만
    // 교체 직후 잠듦 걸리면 그 다음 턴부터 센다
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
    if (random(80) && useSkill.type !== "불꽃") {
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
      let confuseText = atk.names("는") + " 영문도 모른 채 자신을 공격했다!";
      attackDamage(bt, confuseDamageCalculate(bt), bt.turn.atk, enqueue, confuseText);
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
        enqueue(bt, "하지만 실패했다!", "chk_req_fail");
        return false;
      }
    }
  }

  if (def.faint === true && skillType !== "buf") {
    // 상대가 이미 기절한 경우
    // 마찬가지로 리베로가 발동하지 않는다
    enqueue(bt, "하지만 실패했다!", "chk_def_faint");
    return false;
  }

  // 상대 선도발을 맞은 턴에 변화기를 쓴 경우
  if (atk.tempStatus.taunt !== null) {
    if (skill.stype === "buf" || skill.stype === "natk") {
      enqueue(bt, atk.names("는") + " 도발당한 상태라서 " + josa(`${skill.name}#{를} `) + "쓸 수 없다!", "chk_taunt_block");
      return false;
    }
  }

  // 상대 선 지옥찌르기를 맞은 턴에 소리 기술을 쓴 경우
  if (skill.feature?.sound && atk.tempStatus.noSound) {
    enqueue(bt, atk.names("는") + " 소리 기술을 사용할 수 없다!", "chk_nosound_block");
    return false;
  }

  // 사이코노이즈(회복 봉인) 상태에서 회복 기술을 쓴 경우
  if (skill.feature?.heal && atk.tempStatus?.healBlock) {
    enqueue(bt, atk.names("는") + " 회복 봉인 효과로 " + josa(`${skill.name}#{를} `) + "쓸 수 없다!", "chk_heal_block");
    return false;
  }

  // 사슬묶기로 봉인된 기술을 쓴 경우
  if (atk.tempStatus.disable && atk.tempStatus.disable === skill.name) {
    enqueue(bt, atk.names("는") + " 기술이 봉인되어 있어서 " + josa(`${skill.name}#{를} `) + "쓸 수 없다!", "chk_disable_block");
    return false;
  }

  // 짓궃은마음 포켓몬이 악타입에게 변화기를 쓴 경우
  if (atk.abil?.name === "짓궂은마음" && skillType === "natk" && (def.type1 === "악" || def.type2 === "악")) {
    enqueue(bt, def.name + "에겐 효과가 없는 것 같다...", "chk_prankster_dark");
    return false;
  }

  // ==================================================================================================================

  // 기술 시전 직전 체크 통과: 이후 단계(방어/무효/빗나감 포함)부터는 기술이 발동된 것으로 간주
  atk.turn.skillLaunched = true;

  const hasInfiniteTypeChange = Boolean(
    (atk.abil?.name === "리베로" && atk.hasAugment?.("libero")) ||
    (atk.abil?.name === "변환자재" && atk.hasAugment?.("protean"))
  );

  if ((atk.abil?.name === "리베로" || atk.abil?.name === "변환자재") && (!atk.abil?.used || hasInfiniteTypeChange)) {
    if (skill.type === atk.type1 && atk.type2 === null) {
      //사용자 타입이랑 스킬 타입 같으면 발동 안함
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

  // 폭우(시작의바다): 불꽃 타입 공격기 무효화
  if (bt?.isHeavyRain && (skillType === "atk" || skillType === "catk") && skill.type === "불꽃") {
    atk.turn.jumpKickFail = true;
    enqueue(bt, "강한 비의 영향으로 불꽃타입의 공격이 사라졌다!", "chk_heavy_rain_fire");
    return false;
  }

  // 큰가뭄(끝의대지): 물 타입 공격기 무효화
  if (bt?.isHarshSun && (skillType === "atk" || skillType === "catk") && skill.type === "물") {
    atk.turn.jumpKickFail = true;
    enqueue(bt, "강한 햇살의 영향으로 물타입의 공격이 증발했다!", "chk_harsh_sun_water");
    return false;
  }

  // 방어에 공격이 막힌경우
  // 리베로가 발동된다

  if (def.turn.protect === true && skillType !== "buf") {
    let protectSuccess = true;

    if (atk.abil?.name === "보이지않는주먹" && skill.feature?.touch && atk.item !== "펀치글러브") {
      //특성 보이지않는 주먹 : 접촉기가 방어를 무시한다
      //펀치글러브를 끼면 접촉판정이 사라지므로 해당 특성 적용 안됨
      enqueue(bt, "[특성 보이지않는주먹] " + atk.name + "의 공격은 막을 수 없다!", "chk_unseen_fist");
      protectSuccess = false;
    }

    if (skill.feature?.feint) {
      // 페인트: 방어를 뚫고 공격한다
      def.turn.protect = null;
      enqueue(bt, `${def.name}의 방어가 해제되었다!`, "chk_feint_break");
      protectSuccess = false;
    }

    const noProtectSkills = ["날려버리기", "울부짖기"]; // 방어로 막을 수 없는 스킬
    if (noProtectSkills.includes(skill.name)) {
      protectSuccess = false;
    }

    if (protectSuccess) {
      //방어로 막은 경우
      atk.turn.jumpKickFail = true;
      enqueue(bt, def.names("는") + " 공격으로부터 몸을 지켰다!", "chk_protect_block");

      // 니들가드(spikyShield): 직접 접촉 공격한 상대에게 최대 체력 1/8 데미지
      // 펀치글러브 착용 시 접촉 판정이 사라져 피해 없음
      const isTouch = Boolean(skill.feature?.touch && atk.item !== "펀치글러브");
      if (def.turn?.spikyShield && isTouch && !atk.faint) {
        const spikyDmg = Math.floor(atk.maxHp / 8);
        const spikyText = `${atk.names("는")} 가시에 찔려 데미지를 입었다!`;
        atk.getDamage(bt, enqueue, spikyDmg, spikyText);
      }

      return false;
    }
  }

  // 특성 피뢰침에 전기 기술이 막힌 경우 (전기 무효 + 특공 1랭크 상승)
  if (skill.type === "전기" && skill.stype !== "buf" && def.abil?.name === "피뢰침" && atk.abil?.feature?.tgg !== true) {
    def.rankUp(bt, enqueue, "catk", 1, "[특성 피뢰침]");
    return false;
  }

  // 특성 타오르는불꽃에 불꽃 기술이 막힌 경우 리베로가 발동한다
  // 방어로 막으면 특성 발동하지 않음
  // 대타출동 상태일때 불꽃기술 맞으면 특성 발동함
  // buf (쾌청)은 발동 안함, 도깨비불 (natk)는 발동함
  if (skill.type === "불꽃" && skill.stype !== "buf" && def.abil?.name === "타오르는불꽃" && atk.abil?.feature?.tgg !== true) {
    if (def.tempStatus.flashFire) {
      // 이미 발동된 경우
      enqueue(bt, "[특성 타오르는불꽃] " + def.name + "에겐 효과가 없는 것 같다...", "chk_flash_fire_immune");
    } else {
      def.tempStatus.flashFire = true;
      enqueue(bt, "[특성 타오르는불꽃] " + def.names("는") + " 불꽃의 위력이 올라갔다!", "chk_flash_fire_boost");
    }
    return false;
  }

  // 특성 옹골참에 일격기가 막힌 경우
  // 리베로가 발동된다
  if (skill.feature?.oneShot && def.abil?.name === "옹골참") {
  }

  if (skill.name === "절대영도" && (def.type1 === "얼음" || def.type2 === "얼음")) {
    // 얼음타입 포켓몬에게 절대영도를 쓰는 경우
    enqueue(bt, def.name + "에겐 효과가 없는 것 같다...", "chk_sheer_cold_ice");
    return false;
  }

  // [증강] 인생은 한방: 공격 기술이 50% 확률로 실패
  if (atk?.hasAugment?.("lifeIsOneShot") && (skillType === "atk" || skillType === "catk")) {
    if (!random(50)) {
      atk.turn.jumpKickFail = true;
      enqueue(bt, "[증강 인생은 한방] 하지만 실패했다!", "chk_life_oneshot_fail");
      return false;
    }
  }

  return true;
};
