export const isAilmentCheck = (pokemon) => {
  const ailmentObj = pokemon.ailment;
  // 상태이상이 하나라도 걸려있으면 true 반환
  return Object.values(ailmentObj).some((v) => v !== null);
};

const faintCheck = (pokemon) => pokemon.faint;

// 상태이상 부여 가능 체크
export function ailmentAbleCheck(battle, ailment, pokemon) {
  // 이미 다른 상태이상이 있으면 불가
  if (isAilmentCheck(pokemon)) {
    return false;
  }

  let t1 = pokemon.type1;
  let t2 = pokemon.type2;

  const isBurn = ailment === "화상" || ailment === "burn";
  const isMabi = ailment === "마비" || ailment === "mabi";
  const isFreeze = ailment === "얼음" || ailment === "freeze";
  const isPoison = ailment === "독" || ailment === "맹독" || ailment === "poison" || ailment === "mpoison";
  const isSleep = ailment === "수면" || ailment === "sleep" || ailment === "잠듦";

  const atkStr = battle?.turn?.atk;
  const atkPokemon = atkStr ? battle[atkStr] : null;

  if (isBurn) {
    if (t1 === "불꽃" || t2 === "불꽃") {
      // 물,얼음 타입 화상 걸리는거 맞음
      return false;
    }
    const isTgg = atkPokemon?.abilObj?.feature?.tgg || false;
    if (pokemon.abil === "수포" && !isTgg) {
      // 특성 수포는 화상에 걸리지 않는다 (틀깨기 무시 여부 반영)

      return false;
    }
  }

  if (isMabi) {
    // 땅 타입 마비 걸리는거 맞음. "전기자석파"가 무효인거임
    if (t1 === "전기" || t2 === "전기") {
      return false;
    }
  }

  if (isFreeze) {
    if (t1 === "얼음" || t2 === "얼음") {
      return false;
    }
    // 추가 조건: 쾌청 상태면 얼지 않는다
    if (battle?.field?.weather?.isSunny) {
      return false;
    }
  }

  if (isPoison) {
    // 독, 강철 타입은 독에 걸리지 않는다
    if (t1 === "독" || t2 === "독" || t1 === "강철" || t2 === "강철") {
      return false;
    }
  }

  if (isSleep) {
    // 추가 조건: 일렉트릭필드면 자지 않는다
    // 지금 잠듦 하품밖에 없어서 isFlying의 isSkill에 true 해놓음[부유-틀깨기 적용여부]
    if (battle?.field?.terrain?.isElectricField && !pokemon.isFlying(battle, true)) {
      return false;
    }
  }

  return true;
}

// 상태이상 공통 부여 함수
export const applyAilment = (ailment, battle, get, enqueue, printTextIfFail, textOption) => {
  const pokemon = get === "player" ? battle.player : battle.npc;

  // 혼란: 부가효과(skillEffect.js), 역린종료(turnEnd/skillEvent.js)
  if (ailment === "혼란" || ailment === "confuse") {
    // 이미 혼란에 걸려있는지 체크
    if (pokemon.tempStatus.confuse !== null) return;
    // 기절 체크
    if (faintCheck(pokemon)) return;

    // 1 ~ 3턴
    pokemon.tempStatus.confuse = Math.floor(Math.random() * 3) + 1;
    const confuseText = textOption || `${pokemon.names} 혼란에 빠졌다!`;
    enqueue({ battle, text: confuseText });
    return;
  }

  // 기절 체크
  if (faintCheck(pokemon)) {
    if (printTextIfFail) enqueue({ battle, text: printTextIfFail === true ? "하지만 실패했다!" : printTextIfFail });
    return;
  }

  // 상태 적용 가능 여부 체크
  if (!ailmentAbleCheck(battle, ailment, pokemon)) {
    if (printTextIfFail) enqueue({ battle, text: printTextIfFail === true ? "하지만 실패했다!" : printTextIfFail });
    return;
  }

  // 상태 적용
  let text = "";
  if (ailment === "마비" || ailment === "mabi") {
    pokemon.ailment.mabi = true;
    text = (textOption === "특성" ? "[특성 효과] " : "") + `${pokemon.names} 마비되어 기술을 쓰기 어려워졌다!`;
  }

  // 화상: 부가효과(skillEffect.js), 화염구슬(turnEnd/ailmentEvent.js)
  if (ailment === "화상" || ailment === "burn") {
    pokemon.ailment.burn = true;
    text = textOption === "화염구슬" ? `${pokemon.names} 화염구슬로 화상을 입었다!` : `${pokemon.names} 화상을 입었다!`;
  }

  // 독: 부가효과(skillEffect.js), 독압정(field.js)
  if (ailment === "독" || ailment === "poison") {
    pokemon.ailment.poison = true;
    text = `${pokemon.name}은(는) 독에 걸렸다!`;
  }
  // 맹독: 부가효과(skillEffect.js), 맹독압정(field.js)
  if (ailment === "맹독" || ailment === "mpoison") {
    pokemon.ailment.mpoison = 1; // 맹독 카운터 시작
    text = `${pokemon.name}은(는) 맹독에 걸렸다!`;
  }

  // 맹독: 부가효과(skillEffect.js)
  if (ailment === "얼음" || ailment === "freeze") {
    pokemon.ailment.freeze = true;
    text = `${pokemon.names} 얼어붙었다!`;
  }

  // 잠듦: 하품(trunEnd/skillEvent.js)
  if (ailment === "잠듦" || ailment === "수면" || ailment === "sleep") {
    //잠듦이 맞는데 수면이랑 헷갈릴까봐...
    pokemon.ailment.sleep = Math.floor(Math.random() * 3) + 2; // 2 ~ 4턴 잠듦
    text = `${pokemon.names} 잠들어버렸다!`;
  }

  // 출력 텍스트
  enqueue({ battle, text });
};
