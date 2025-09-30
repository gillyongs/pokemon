import { recover } from "../function/recover";

// ====================== 공통 유틸 함수 ======================

// HP 감소 적용
function applyDamage(defPokemon, damage) {
  const prevHp = defPokemon.hp;
  defPokemon.hp = Math.max(defPokemon.hp - damage, 0);
  return prevHp - defPokemon.hp; // 실제 입은 데미지
}

// 기절 처리
function handleFaint(defPokemon, enqueue, battle) {
  defPokemon.hp = 0;
  defPokemon.faint = true;
  Object.keys(defPokemon.status).forEach((k) => (defPokemon.status[k] = null));
  enqueue({ battle, text: defPokemon.names + " 쓰러졌다!" });
}

// 자뭉열매 처리
function tryBerry(defPokemon, battle, enqueue) {
  if (defPokemon.item === "자뭉열매" && defPokemon.hp <= defPokemon.origin.hp / 2) {
    defPokemon.item = null;
    recover(battle, Math.floor(defPokemon.origin.hp / 4), defPokemon, enqueue, defPokemon.names + " 자뭉열매로 체력을 회복했다!");
  }
}

// ====================== 공격 외 데미지 ======================
// abil : 스텔스록
// skillCheck: 혼란 자해데미지
// turnEnd: 독, 화상 데미지
// skillEffect: 생구, 무릎차기 빗나감, 반동
export function damage(battle, damageValue, getDamagePokemon, enqueue, text) {
  const defPokemon = battle[getDamagePokemon];
  const actualDamage = applyDamage(defPokemon, Math.floor(damageValue));

  if (text) enqueue({ battle, text });

  if (defPokemon.hp <= 0) {
    handleFaint(defPokemon, enqueue, battle);
  } else {
    tryBerry(defPokemon, battle, enqueue);
  }
}

// ====================== 공격 데미지 ======================

// 공격으로 데미지를 줄때
// skillUse에서만 호출된다
export function attackDamage(battle, skillDamage, getDamagePokemon, enqueue, typeText) {
  const atkPokemon = battle[getDamagePokemon === "npc" ? "player" : "npc"];
  const defPokemon = battle[getDamagePokemon];
  const useSkill = battle[battle.turn.atk].origin["sk" + battle.turn.atkSN];

  let skDamage = Math.floor(skillDamage);

  //실제로 준 데미지
  //반동이나 흡혈 계산에 사용
  let actualGiveDamage = skDamage;

  // 기합의띠 트리거
  const gdTrigger = defPokemon.item === "기합의띠" && defPokemon.hp === defPokemon.origin.hp;

  // 특성 "탈" 처리
  let talTrigger = false;
  if (defPokemon.abil === "탈") {
    talTrigger = true;
    defPokemon.abil = defPokemon.origin.abil = "탈 (사용됨)";
    const talHp = Math.ceil(defPokemon.origin.hp / 8);
    if (skDamage > talHp) {
      skDamage = talHp;
      actualGiveDamage = talHp;
    }
  }

  // HP 차감
  const prevHp = defPokemon.hp;
  defPokemon.hp -= skDamage;
  if (defPokemon.hp <= 0) {
    actualGiveDamage = prevHp;
    defPokemon.hp = gdTrigger ? 1 : 0;
    if (gdTrigger) defPokemon.item = null;
  }

  // 최근 기록
  atkPokemon.temp.recentDamageGive = actualGiveDamage;
  defPokemon.temp.recentDamageGet = actualGiveDamage;
  atkPokemon.tempStatus.recentSkillUse = useSkill;
  defPokemon.tempStatus.recentSkillGet = useSkill;

  // ================= 텍스트 처리 =================
  let textTrigger = true;
  if (talTrigger) {
    enqueue({ battle, text: "탈이 대타가 되었다!" });
    textTrigger = false;
  }

  // 상성 텍스트(ex:효과가 굉장했다!)나 급소여부가 출력되지 않는 '공격기' //
  // 고정 데미지 기술, 일격기
  const noTextSkills = ["카타스트로피"];
  const noTextTrigger = noTextSkills.includes(useSkill.name) || useSkill.feature.oneShot;

  if (!noTextTrigger) {
    if (typeText) {
      // 효과가 굉장했다!
      enqueue({ battle, text: typeText });
      textTrigger = false;
    }

    if (atkPokemon.temp.critical) {
      enqueue({ battle, text: "급소에 맞았다!" });
      textTrigger = false;
    }
  }

  if (gdTrigger && defPokemon.item === null) {
    enqueue({ battle, text: defPokemon.names + " 기합의 띠로 버텼다!" });
    textTrigger = false;
  }

  // ================= 후처리 =================
  if (defPokemon.hp <= 0) {
    handleFaint(defPokemon, enqueue, battle);
  } else {
    // 출력 텍스트가 하나도 없을 때
    if (textTrigger) {
      enqueue({ battle, text: defPokemon.name + "에게 데미지를 주었다!" });
    }
    tryBerry(defPokemon, battle, enqueue);
  }
}
