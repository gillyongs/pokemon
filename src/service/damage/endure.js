/**
 * 간접 피해(반동, 상태이상, 장판, 도구 등)에 대한 버티기 판정
 * - 자폭, 초승달춤 등엔 발동하지 않지만 길동무엔 예외적으로 발동
 * - (이미 발동된) 하지만 버텨냈다, [증강] 아무일도 없었다, [버프] 에어맨이 쓰러지지 않아
 *
 * @param {Object} pokemon - 버티기 판정을 받을 포켓몬
 * @returns {{ endureText: string, endureKey: string } | null} 버텼을 경우 텍스트/키 객체, 아니면 null
 */
export function checkPassiveEndure(pokemon) {
  let endureText = null;
  let endureKey = null;

  if (pokemon.turn?.butItRefused) {
    endureText = "하지만 버텨냈다!";
    endureKey = "poke_but_it_refused";
  } else if (pokemon.hasAugment?.("nothingHappened") && !pokemon.agument?.nothingHappenedUsed) {
    pokemon.agument.nothingHappenedUsed = true;
    endureText = `[증강 아무일도 없었다] ${pokemon.names("는")} 버텨냈다!`;
    endureKey = "poke_nothing_happened";
  } else if (pokemon.hasAugment?.("airmanGaTaosenai") && Number(pokemon.airmanRemainCount ?? 20) > 0) {
    const nextRemain = Math.max(0, Number(pokemon.airmanRemainCount ?? 20) - 1);
    pokemon.airmanRemainCount = nextRemain;
    const airmanAug = pokemon.augments?.find((a) => a.id === "airmanGaTaosenai");
    if (airmanAug) {
      airmanAug.airmanRemainCount = nextRemain;
    }
    endureText = `[버프 에어맨이 쓰러지지 않아] ${pokemon.names("는")} 버텨냈다!`;
    endureKey = "poke_airman";
  }

  if (endureText) {
    pokemon.hp = 1;
    return { endureText, endureKey };
  }

  return null;
}

/**
 * 직접 공격 및 혼란 자해 피해에 대한 모든 버티기 판정
 * - (혼란에 기띠 발동되는거 맞음)
 * - (이미 발동된) 하지만 버텨냈다 -> [특성] 옹골참 -> [도구] 기합의띠
 * - [증강] 슬프게 하지 않으려고 버텼다 (30%) -> 하지만 버텨냈다 (첫 발동) -> 아무일도 없었다 -> 에어맨이 쓰러지지 않아
 *
 * @param {Object} defPokemon - 피격 포켓몬
 * @param {number} prevHp - 피격 직전 체력
 * @param {Object|null} [atkPokemon=null] - 공격 포켓몬 (혼란 자해 시 생략 가능)
 * @returns {{ endureText: string, endureKey: string } | null} 버텼을 경우 텍스트/키 객체, 아니면 null
 */
export function checkEndure(defPokemon, prevHp, atkPokemon = null) {
  if (!defPokemon) return null;

  const isFullHp = prevHp === defPokemon.maxHp;
  const hasSturdy = isFullHp && defPokemon.abil?.name === "옹골참" && !atkPokemon?.abil?.feature?.tgg;
  const hasFocusSash = isFullHp && defPokemon.item === "기합의띠";

  let endureText = null;
  let endureKey = null;

  if (defPokemon.turn?.butItRefused) {
    // 이번 턴 '하지만 버텨냈다.' 이미 활성화 중 -> 모든 데미지를 HP 1로 버팀
    endureText = "하지만 버텨냈다!";
    endureKey = "dmg_but_it_refused";
  } else if (hasSturdy || hasFocusSash) {
    // 옹골참 또는 기띠 (동시에 있으면 옹골참이 먼저 쓰인다)
    if (hasSturdy) {
      endureText = "[특성 옹골참] " + defPokemon.names("는") + " 옹골참으로 버텼다!";
      endureKey = "dmg_sturdy";
    } else {
      endureText = `[아이템 기합의띠] ${defPokemon.names("는")} 기합의 띠로 버텼다!`;
      endureKey = "dmg_focus_sash";
      defPokemon.consumeItem();
    }
  } else if (defPokemon.hasAugment?.("mandoocornEndure") && Math.random() < 0.3) {
    // [증강] 슬프게 하지 않게 하려고 버텼다! (30% 확률로 HP 1로 버팀)
    endureText = `[증강 슬프게 하지 않게 하려고 버텼다!] ${defPokemon.names("는")} 플레이어를 슬프게 하지 않으려고 버텼다!`;
    endureKey = "dmg_mandoo_endure";
  } else if (defPokemon.hasAugment?.("butItRefused") && !defPokemon.agument?.butItRefusedUsed) {
    // [증강] 하지만 버텨냈다.: 기절할 공격을 HP 1로 버티고 해당 턴 기절 면역 활성화
    if (defPokemon.turn) defPokemon.turn.butItRefused = true;
    if (!defPokemon.agument) defPokemon.agument = {};
    defPokemon.agument.butItRefusedUsed = true;
    endureText = `[증강 하지만 버텨냈다] ${defPokemon.names("는")} 버텨냈다!`;
    endureKey = "dmg_but_it_refused";
  } else {
    return checkPassiveEndure(defPokemon);
  }

  if (endureText) {
    defPokemon.hp = 1;
    return { endureText, endureKey };
  }

  return null;
}
