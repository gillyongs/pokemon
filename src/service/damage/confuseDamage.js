import { confuseDamageCalculate } from "../../calc/damageCalculate";
import { checkEndure } from "./endure";

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

  if (pokemon.hp <= 0) {
    pokemon.hp = 0;
    const endureResult = checkEndure(pokemon, prevHp);
    if (endureResult) {
      // 기합의띠, 옹골참, [증강] 하지만 버텨냈다, 아무일도 없었다, 슬프게하지 않으려고 버텼다!, 에어맨이 쓰러지지않아
      enqueue(battle, endureResult.endureText, "dmg_confuse_endure");
    }
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
