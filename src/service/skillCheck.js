import skillRequirementSearch from "../entity/Skill/SkillRequirement";
import { random } from "../util/randomCheck";
import { confuseDamage } from "./confuseDamage";
import { josa } from "josa";
import { typeCheckOnBattle } from "../calc/typeEffectCalculate";
import { getAccuracy } from "../calc/accuracyCalculate";

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
    // 잠듦은 행동 기준 카운트 (후공으로 잠들면 다음턴은 화겆ㅇ 수면)
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

  // 상대의 선공으로 기술 금지를 맞고 해당 기술을 사용한 경우
  // 기술이 실패하며 pp가 소모되지 않고 기술 고정도 되지 않는다.

  // 상대 선도발을 맞고 변화기를 쓴 경우
  if (atk.tempStatus.taunt !== null) {
    if (skill.stype === "buf" || skill.stype === "natk") {
      enqueue(bt, atk.names("는") + " 도발당한 상태라서 " + josa(`${skill.name}#{를} `) + "쓸 수 없다!", "chk_taunt_block");
      return false;
    }
  }

  // 상대 선 지옥찌르기를 맞은 턴에 소리 기술을 쓴 경우
  if (skill.feature?.sound && atk.tempStatus.noSound) {
    enqueue(bt, atk.names("는") + " 소리 기술이 금지당해 " + josa(`${skill.name}#{를} `) + "쓸 수 없다!", "chk_nosound_block");
    return false;
  }

  // 선 회복봉인기술을 맞고 회복 기술을 쓴 경우
  if (skill.feature?.heal && atk.tempStatus?.healBlock) {
    enqueue(bt, atk.names("는") + " 회복 봉인 효과로 " + josa(`${skill.name}#{를} `) + "쓸 수 없다!", "chk_heal_block");
    return false;
  }

  // 사슬묶기로 봉인된 기술을 쓴 경우
  if (atk.tempStatus.disable && atk.tempStatus.disable === skill.name) {
    enqueue(bt, atk.names("는") + " 기술이 봉인되어 있어서 " + josa(`${skill.name}#{를} `) + "쓸 수 없다!", "chk_disable_block");
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

  // 짓궃은마음 포켓몬이 악타입에게 변화기를 쓴 경우
  if (atk.abil?.name === "짓궂은마음" && skillType === "natk" && (def.type1 === "악" || def.type2 === "악")) {
    enqueue(bt, def.name + "에겐 효과가 없는 것 같다...", "chk_prankster_dark");
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

  // 상성 무효 (0배) 판정 (공격 기술)
  if (skillType === "atk" || skillType === "catk") {
    const typeDamage = typeCheckOnBattle(bt, skill, atk, def);
    if (typeDamage === 0) {
      atk.turn.jumpKickFail = true;
      const typeText = bt[bt.turn.def].name + "에겐 효과가 없는 것 같다...";
      enqueue(bt, typeText, "use_type_immune");
      return false;
    }
  }

  // 상대방 지정 변화기 (natk) 실패 판정
  if (skillType === "natk") {
    // 전기자석파 vs 땅 타입
    if (skill.name === "전기자석파" && (def.type1 === "땅" || def.type2 === "땅")) {
      const typeText = bt[bt.turn.def].name + "에겐 효과가 없는 것 같다...";
      enqueue(bt, typeText, "use_twave_ground");
      return false;
    }

    // 가루 기술 vs 풀 타입 및 방진 특성
    if (skill.feature?.powder && (def.type1 === "풀" || def.type2 === "풀" || def.abil?.name === "방진")) {
      const typeText = bt[bt.turn.def].name + "에겐 효과가 없는 것 같다...";
      enqueue(bt, typeText, "use_powder_immune");
      return false;
    }

    // 대타출동으로 막을 수 없는 상대방 대상 변화기 (natk)
    const noSubstituteSkills = ["가드스왑", "날려버리기", "냄새구별", "도발", "멸망의노래", "미라클아이", "봉인", "사슬묶기", "스킬스왑", "앙코르", "역할", "울부짖기", "원념", "원한", "자기암시", "저주", "트집", "하트스왑", "헤롱헤롱", "흑안개"];
    if (def.tempStatus?.substitute) {
      if (noSubstituteSkills.includes(skill.name) || skill.feature?.sound || atk.abil?.name === "틈새포착") {
        // 소리 변화기 및 틈새포착 사용자의 변화기는 대타를 뚫는다 ex) 막말내뱉기
      } else {
        enqueue(bt, "하지만 실패했다!", "use_natk_sub_fail");
        return false;
      }
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
