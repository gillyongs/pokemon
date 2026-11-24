import { confuseDamageCalculate } from "../../calc/damageCalculate";

/**
 * 혼란 자해 데미지 처리
 * - 공격자(atk)가 자기 자신을 공격
 * - 상성/급소 판정 및 텍스트 없음
 * - 피격 이벤트(onHit) 없음 (풍선, 울퉁불퉁멧, 철가시 미발동)
 * - 징수의 총/처치 증강/반사 특성 등 공격 관련 부가효과 없음
 */
export function confuseDamage(battle, enqueue) {
  const pokemon = battle[battle.turn.atk];
  if (!pokemon || pokemon.faint) return;

  enqueue(battle, pokemon.names("는") + " 영문도 모른 채 자신을 공격했다!", "chk_confuse_hit");

  let damage = Math.floor(confuseDamageCalculate(battle));

  // 탈 특성 처리
  if (pokemon.abil?.name === "탈" && !pokemon.abil?.usedOnce) {
    pokemon.abil.usedOnce = true;
    if (pokemon.originalAbil) pokemon.originalAbil.usedOnce = true;
    enqueue(battle, "탈이 대타가 되었다!", "dmg_disguise");
    if (pokemon.hasAugment?.("devilOfGen7")) {
      damage = 0;
    } else {
      const talHp = Math.floor(pokemon.maxHp / 8);
      damage = Math.min(damage, talHp);
    }
  }

  const prevHp = pokemon.hp;
  pokemon.hp -= damage;

  let endured = false;
  let endureText = null;

  if (pokemon.hp <= 0) {
    pokemon.hp = 0;

    // 기절 방지 판정
    const gdTrigger = pokemon.item === "기합의띠";
    const ogcTrigger = pokemon.abil?.name === "옹골참";
    const noOneShot = prevHp === pokemon.maxHp && (gdTrigger || ogcTrigger);

    if (pokemon.turn?.butItRefused) {
      pokemon.hp = 1;
      endured = true;
      endureText = "하지만 버텨냈다!";
    } else if (noOneShot) {
      pokemon.hp = 1;
      endured = true;
      if (ogcTrigger) {
        endureText = "[특성 옹골참] " + pokemon.names("는") + " 옹골참으로 버텼다!";
      } else if (gdTrigger) {
        endureText = pokemon.names("는") + " 기합의 띠로 버텼다!";
        pokemon.consumeItem();
      }
    } else if (pokemon.hasAugment?.("mandoocornEndure") && Math.random() < 0.3) {
      pokemon.hp = 1;
      endured = true;
      endureText = pokemon.names("는") + " 플레이어를 슬프게 하지 않으려고 버텼다!";
    } else if (pokemon.hasAugment?.("butItRefused") && !pokemon.agument?.butItRefusedUsed) {
      pokemon.hp = 1;
      if (pokemon.turn) pokemon.turn.butItRefused = true;
      if (pokemon.agument) pokemon.agument.butItRefusedUsed = true;
      endured = true;
      endureText = `[증강 하지만 버텨냈다] ${pokemon.names("는")} 버텨냈다!`;
    } else if (pokemon.hasAugment?.("nothingHappened") && !pokemon.agument?.nothingHappenedUsed) {
      pokemon.hp = 1;
      if (!pokemon.agument) pokemon.agument = {};
      pokemon.agument.nothingHappenedUsed = true;
      endured = true;
      endureText = `[증강 아무일도 없었다] ${pokemon.names("는")} 버텨냈다!`;
    } else if (pokemon.hasAugment?.("airmanGaTaosenai") && Number(pokemon.airmanRemainCount ?? 20) > 0) {
      pokemon.hp = 1;
      const nextRemain = Math.max(0, Number(pokemon.airmanRemainCount ?? 20) - 1);
      pokemon.airmanRemainCount = nextRemain;
      const airmanAug = pokemon.augments?.find((a) => a.id === "airmanGaTaosenai");
      if (airmanAug) {
        airmanAug.airmanRemainCount = nextRemain;
      }
      endured = true;
      endureText = `[버프 에어맨이 쓰러지지 않아] ${pokemon.names("는")} 버텨냈다!`;
    }
  }

  if (endured && endureText) {
    enqueue(battle, endureText, "dmg_confuse_endure");
  }

  if (damage > 0 && pokemon.turn) {
    pokemon.turn.damagedThisTurn = true; // 워모그
  }
  pokemon.tempStatus.hitCount = (pokemon.tempStatus.hitCount || 0) + 1; // 분노의주먹

  if (pokemon.hp > 0) {
    pokemon.tryJamung(battle, enqueue);
  } else {
    pokemon.handleFaint(battle, enqueue);
  }
}
