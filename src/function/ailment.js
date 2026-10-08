// 포켓몬의 상태이상 여부 리턴
// 하품(skillEffect.js) 병상첨병(damageCalculate.js), 초승달춤/치유소원(field.js)에서 사용
export const isAilmentCheck = (pokemon) => {
  const status = pokemon.status;
  // 상태이상이 하나라도 걸려있으면 true 반환
  return Object.values(status).some((v) => v !== null);
};

// 상태이상 부여 가능 체크
export function ailmentAbleCheck(battle, status, pokemon) {
  // 이미 다른 상태이상이 있으면 불가
  if (isAilmentCheck(pokemon)) {
    return false;
  }

  let t1 = pokemon.type1;
  let t2 = pokemon.type2;

  const isBurn = status === "화상" || status === "burn";
  const isMabi = status === "마비" || status === "mabi";
  const isFreeze = status === "얼음" || status === "freeze";
  const isPoison = status === "독" || status === "맹독" || status === "poison" || status === "mpoison";
  const isSleep = status === "잠듦" || status === "수면" || status === "sleep"; //잠듦이 맞는데 혹시나 헷갈릴까봐...

  const atkStr = battle?.turn?.atk;
  const atkPokemon = atkStr ? battle[atkStr] : null;

  if (isBurn) {
    if (t1 === "불꽃" || t2 === "불꽃") {
      // 물 타입 화상 걸리는거 맞음
      return false;
    }
    const isTgg = atkPokemon?.abilObj?.feature?.tgg || false;
    if (pokemon.abil === "수포" && !isTgg) {
      // 특성 수포는 화상에 걸리지 않는다 (단, 틀깨기는 제외. 근데 턴 종료시 회복됨)
      return false;
    }
  }

  if (isMabi) {
    // 땅 타입은 마비 걸리는거 맞음
    if (t1 === "전기" || t2 === "전기") {
      return false;
    }
  }

  if (isFreeze) {
    if (t1 === "얼음" || t2 === "얼음") {
      return false;
    }
    //  쾌청 상태면 얼지 않는다
    if (battle?.field?.weather?.isSunny) {
      return false;
    }
  }

  if (isPoison) {
    if (t1 === "독" || t2 === "독" || t1 === "강철" || t2 === "강철") {
      return false;
    }
  }

  if (isSleep) {
    // 일렉트릭필드면 잠들지 않는다
    if (battle?.field?.terrain?.isElectricField) {
      return false;
    }
  }

  return true;
}

// 상태이상 공통 부여 함수
// 부가효과(skillEffect.js), 독압정(field.js), 정전기(onHit.js),
// 화염구슬(ailmentEvent.js), 역린 후 혼란 / 하품 (skillEvent.js) 에서 사용
export const applyAilment = (ailment, battle, get, enqueue, printTextIfFail, originText) => {
  const pokemon = get === "player" ? battle.player : battle.npc;

  // 기절 체크
  if (pokemon.faint) {
    if (printTextIfFail) enqueue({ battle, text: "하지만 실패했다!" });
    return;
  }

  // 혼란: 부가효과(skillEffect.js), 역린 종료 후 (skillEvent.js) 에서 사용
  if (ailment === "혼란" || ailment === "confuse") {
    // 이미 혼란에 걸려있는지 체크
    if (pokemon.tempStatus.confuse !== null) return;

    // 1 ~ 3턴
    pokemon.tempStatus.confuse = Math.floor(Math.random() * 3) + 1;
    const confuseText = originText || `${pokemon.names} 혼란에 빠졌다!`;
    // originText: ~는 몹시 지쳐서 혼란에 빠졌다
    enqueue({ battle, text: confuseText });
    return;
  }

  // 상태 적용 가능 여부 체크
  if (!ailmentAbleCheck(battle, ailment, pokemon)) {
    if (printTextIfFail) enqueue({ battle, text: "하지만 실패했다!" });
    return;
  }

  // 상태이상 적용 ============================================================
  let text = "";

  // 마비: 부가효과(skillEffect.js), 특성 정전기 (onHit.js) 에서 사용
  if (ailment === "마비" || ailment === "mabi") {
    pokemon.status.mabi = true;
    text = originText || `${pokemon.names} 마비되어 기술을 쓰기 어려워졌다!`;
    // originText: [특성 정전기] ~는 마비되어 기술을 쓰기 어려워졌다!
  }

  // 화상: 부가효과(skillEffect.js), 화염구슬 (ailmentEvent.js) 에서 사용
  if (ailment === "화상" || ailment === "burn") {
    pokemon.status.burn = true;
    text = originText || `${pokemon.names} 화상을 입었다!`;
    // originText: ~는 화염구슬로 화상을 입었다!`
  }

  // 독: 부가효과(skillEffect.js), 독압정(filed.js)에서 사용
  if (ailment === "독" || ailment === "poison") {
    pokemon.status.poison = true;
    text = originText || `${pokemon.name}은(는) 독에 걸렸다!`;
    // originText: ~는 독압정을 밟고 독에 걸렸다!`
  }

  // 맹독: 부가효과(skillEffect.js), 맹독압정(filed.js)에서 사용
  if (ailment === "맹독" || ailment === "mpoison") {
    pokemon.status.mpoison = 1; // 맹독 카운터 시작
    text = originText || `${pokemon.name}은(는) 맹독에 걸렸다!`;
    // originText: ~는 독압정을 밟고 맹독에 걸렸다!`
  }

  // 얼음: 부가효과(skillEffect.js)에 유일하게 존재
  if (ailment === "얼음" || ailment === "freeze") {
    pokemon.status.freeze = true;
    text = originText || `${pokemon.names} 얼어붙었다!`;
  }

  // 수면: 아직은 하품 (skillEvent.js)에만 존재
  if ((ailment === "수면", ailment === "잠듦" || ailment === "sleep")) {
    pokemon.status.sleep = Math.floor(Math.random() * 3) + 2; // 2 ~ 4턴
    text = originText || `${pokemon.names} 잠들어버렸다!`;
  }

  // 출력 텍스트
  enqueue({ battle, text });
};
