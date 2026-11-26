export const isAilmentCheck = (pokemon) => {
  const ailmentObj = pokemon.ailment;
  // 상태이상이 하나라도 걸려있으면 true 반환
  return Object.values(ailmentObj).some((v) => v !== null);
};

// 상태이상 부여 가능 체크
export function ailmentAbleCheck(battle, ailment, pokemon, attacker = null) {
  const isBurn = ailment === "화상" || ailment === "burn";
  const isMabi = ailment === "마비" || ailment === "mabi";
  const isFreeze = ailment === "얼음" || ailment === "freeze" || ailment === "freezeBug";
  const isPoison = ailment === "독" || ailment === "맹독" || ailment === "poison" || ailment === "mpoison";
  const isSleep = ailment === "수면" || ailment === "sleep" || ailment === "잠듦";

  const atkStr = battle?.turn?.atk;
  const atkPokemon = attacker || (atkStr ? battle[atkStr] : null);
  const opponentOfTarget = battle ? (pokemon === battle.player ? battle.npc : pokemon === battle.npc ? battle.player : null) : null;
  const burnInflicter = attacker || opponentOfTarget || atkPokemon;

  // 이미 다른 상태이상이 걸려있는지 체크
  if (isAilmentCheck(pokemon)) {
    const isOpponentInflicted = Boolean(burnInflicter && burnInflicter !== pokemon);

    if (isBurn) {
      // [증강] 태양의 호흡, 초고열 글라디우스 추가 화상 중첩
      const burnStack = getBurnStack(pokemon);
      const canStackBurn = burnStack > 0 && burnStack < 13 && isOpponentInflicted && Boolean(burnInflicter.hasAugment?.("sunBreathing"));
      const canGladiusExtraBurn = burnStack > 0 && isOpponentInflicted && Boolean(burnInflicter.hasAugment?.("superheatedGladius"));
      if (!canStackBurn && !canGladiusExtraBurn) {
        return false;
      }
    } else if (isFreeze) {
      const hasOtherAilmentThanFreeze = Object.entries(pokemon.ailment).some(([status, value]) => status !== "freeze" && value !== null);
      const canStackFreeze = ailment !== "freezeBug" && Number(pokemon.ailment.freeze) > 0 && !hasOtherAilmentThanFreeze && isOpponentInflicted && Boolean(burnInflicter.hasAugment?.("ekzahar"));
      if (!canStackFreeze) {
        return false;
      }
    } else {
      return false;
    }
  }

  // 미스트필드 상태이면 땅에 붙어있는 포켓몬은 상태이상에 걸리지 않는다
  if (battle?.field?.terrain?.isMistyField && !pokemon.isFlying?.(battle)) {
    return false;
  }

  let t1 = pokemon.type1;
  let t2 = pokemon.type2;

  if (isBurn) {
    if (t1 === "불꽃" || t2 === "불꽃") {
      // 물,얼음 타입 화상 걸리는거 맞음
      return false;
    }
    if (pokemon.abil?.name === "열교환" || pokemon.abil?.name === "수포") {
      // 특성이 열교환, 수포인 화상에 걸리지 않는다
      // 상대방이 틀깨기면 걸리기는 하는데 어차피 즉시 회복되므로 걍 생략함
      return false;
    }
  }

  if (isMabi) {
    // 땅 타입 마비 걸리는거 맞음. "전기자석파"가 무효인거임
    if (t1 === "전기" || t2 === "전기") {
      return false;
    }
    if (pokemon.abil?.name === "유연") {
      return false;
    }
  }

  if (isFreeze) {
    if (t1 === "얼음" || t2 === "얼음") {
      return false;
    }
    // 추가 조건: 쾌청 상태면 얼지 않는다
    if (battle?.isSunny) {
      return false;
    }
  }

  if (isPoison) {
    // 특성 부식: 상대가 독, 강철 타입이라도 독/맹독 상태로 만들 수 있다
    const hasCorrosion = atkPokemon?.abil?.name === "부식";
    // 독, 강철 타입은 독에 걸리지 않는다 (부식 특성 제외)
    if (!hasCorrosion && (t1 === "독" || t2 === "독" || t1 === "강철" || t2 === "강철")) {
      return false;
    }
  }

  if (isSleep) {
    if (pokemon.abil?.name === "의기양양" || pokemon.abil?.name === "불면") {
      return false;
    }
    // 일렉트릭필드면 잠들지 않는다
    // 지금 잠듦 기술 부가효과랑 하품밖에 없어서 isFlying의 2번쨰 인자 isSkill에 true 해놓음[부유-틀깨기 적용여부]
    if (battle?.field?.terrain?.isElectricField && !pokemon.isFlying?.(battle, true)) {
      return false;
    }
  }

  return true;
}

// 상태이상 공통 부여 함수
export const applyAilment = (ailment, battle, get, enqueue, textOption, attacker = null) => {
  const pokemon = get === "player" ? battle.player : battle.npc;

  // 기절 체크
  if (pokemon.faint) {
    return;
  }

  // 혼란: 부가효과(skillEffect.js), 역린종료(turnEnd/skillEvent.js)
  if (ailment === "혼란" || ailment === "confuse") {
    // 이미 혼란에 걸려있는지 체크
    if (pokemon.tempStatus.confuse !== null) return;
    if (battle?.field?.terrain?.isMistyField && (!pokemon.isFlying || !pokemon.isFlying(battle, true))) return;

    // 1 ~ 3턴
    pokemon.tempStatus.confuse = Math.floor(Math.random() * 3) + 1;
    const confuseText = textOption || `${pokemon.names("는")} 혼란에 빠졌다!`;
    enqueue(battle, confuseText, "ail_confuse");
    return;
  }

  // 상태이상 적용 가능 여부 체크
  if (!ailmentAbleCheck(battle, ailment, pokemon, attacker)) {
    return;
  }

  // 상태이상 적용
  let text = "";
  if (ailment === "마비" || ailment === "mabi") {
    pokemon.ailment.mabi = true;
    text = textOption || `${pokemon.names("는")} 마비되어 기술을 쓰기 어려워졌다!`;
  }

  // 화상: 부가효과(skillEffect.js), 화염구슬(turnEnd/ailmentEvent.js), 초고열 글라디우스(skillUse.js)
  if (ailment === "화상" || ailment === "burn") {
    const prevStack = getBurnStack(pokemon);
    if (prevStack >= 1) {
      const atkStr = battle?.turn?.atk;
      const atkPokemon = attacker || (atkStr ? battle[atkStr] : null);
      const opponentOfTarget = battle ? (pokemon === battle.player ? battle.npc : pokemon === battle.npc ? battle.player : null) : null;
      const burnInflicter = attacker || opponentOfTarget || atkPokemon;
      const isOpponentInflicted = Boolean(burnInflicter && burnInflicter !== pokemon);
      const hasSunBreathing = isOpponentInflicted && Boolean(burnInflicter.hasAugment?.("sunBreathing"));
      const hasSuperheatedGladius = isOpponentInflicted && Boolean(burnInflicter.hasAugment?.("superheatedGladius"));

      const prefixMatch = typeof textOption === "string" ? textOption.match(/^(\[[^\]]+\]\s*)/) : null;
      const prefix = prefixMatch ? prefixMatch[1] : "";

      if (hasSunBreathing && prevStack < 13) {
        pokemon.ailment.burn = Math.min(13, prevStack + 1);
        enqueue(battle, `${prefix}${pokemon.name}의 화상이 강해졌다!`, "ail_apply");
      }

      if (hasSuperheatedGladius && !pokemon.faint) {
        const extraBurnDamage = Math.floor(pokemon.maxHp * 0.1);
        const gladiusText = `${prefix}${pokemon.names("는")} 추가 화상 데미지를 입었다!`;
        pokemon.getDamage(battle, enqueue, extraBurnDamage, gladiusText);
      }
      return;
    } else {
      pokemon.ailment.burn = 1;
      text = textOption || `${pokemon.names("는")} 화상을 입었다!`;
    }
  }

  // 독: 부가효과(skillEffect.js), 독압정(field.js)
  if (ailment === "독" || ailment === "poison") {
    pokemon.ailment.poison = true;
    text = `${pokemon.names("는")} 독에 걸렸다!`;
  }
  // 맹독: 부가효과(skillEffect.js), 맹독압정(field.js)
  if (ailment === "맹독" || ailment === "mpoison") {
    pokemon.ailment.mpoison = 1; // 맹독 카운터 시작
    text = `${pokemon.names("는")} 맹독에 걸렸다!`;
  }

  // 얼음: 부가효과(skillEffect.js)
  if (ailment === "얼음" || ailment === "freeze") {
    const previousFreeze = Number(pokemon.ailment.freeze) || 0;
    const addedFreeze = getFreezeDuration();
    pokemon.ailment.freeze = previousFreeze + addedFreeze;
    if (previousFreeze > 0) {
      const prefixMatch = typeof textOption === "string" ? textOption.match(/^(\[[^\]]+\]\s*)/) : null;
      const prefix = prefixMatch ? prefixMatch[1] : "";
      text = `${prefix}${pokemon.names("는")} 한층 더 깊게 얼어붙었다!`;
    } else {
      pokemon.tempStatus.trishulaFrost = 0; // 서리 스택 초기화
      text = textOption || `${pokemon.names("는")} 얼어붙었다!`;
    }
  }
  if (ailment === "freezeBug") {
    pokemon.tempStatus.trishulaFrost = 0;
    pokemon.ailment.freezeBug = true;
    text = textOption || `${pokemon.names("는")} 꽁꽁 얼어붙었다!`;
  }

  // 잠듦: 하품(trunEnd/skillEvent.js)
  if (ailment === "잠듦" || ailment === "수면" || ailment === "sleep") {
    //잠듦이 맞는데 수면이랑 헷갈릴까봐...
    pokemon.ailment.sleep = Math.floor(Math.random() * 3) + 2; // 2 ~ 4턴 잠듦
    text = `${pokemon.names("는")} 잠들어 버렸다!`;
  }

  // 출력 텍스트
  enqueue(battle, text, "ail_apply");
};

const getBurnStack = (pokemon) => {
  const burn = pokemon.ailment.burn;
  if (!burn) return 0;
  return typeof burn === "number" ? Math.min(13, Math.max(1, burn)) : 1;
};

const getFreezeDuration = () => {
  const roll = Math.random();
  if (roll < 0.25) return 1;
  if (roll < 0.5) return 2;
  return 3;
};
