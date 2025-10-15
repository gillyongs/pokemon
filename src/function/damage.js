import { type } from "@testing-library/user-event/dist/type";
import { recover } from "../function/recover";
import { rank } from "./rank";
import { josa } from "josa";
import { applyOnHitEvents } from "../service/applyOnHitEvents.js";

// ====================== 공통 유틸 함수 ======================

// HP 감소 적용
function applyDamage(defPokemon, damage) {
  const prevHp = defPokemon.hp;
  defPokemon.hp = Math.max(defPokemon.hp - damage, 0);
  return prevHp - defPokemon.hp; // 실제 입은 데미지
}

// 기절 처리
function handleFaint(defPokemon, enqueue, battle, atkAbil) {
  defPokemon.hp = 0;
  defPokemon.faint = true;
  Object.keys(defPokemon.status).forEach((k) => (defPokemon.status[k] = null));
  enqueue({ battle, text: defPokemon.names + " 쓰러졌다!" });

  const faintRankUpAbils = {
    "혼연일체(흑)": "catk",
    "혼연일체(백)": "atk",
    자기과신: "atk",
  };
  if (Object.keys(faintRankUpAbils).includes(atkAbil)) {
    let abilName = atkAbil;
    if (abilName.startsWith("혼연일체")) {
      abilName = "혼연일체";
    }
    rank(battle, enqueue, battle[battle.turn.atk], faintRankUpAbils[atkAbil], 1, "[특성 " + abilName + "]");
    return;
  }
}

// 자뭉열매 처리
function tryBerry(defPokemon, battle, enqueue, atkAbil) {
  let noBerryAbil = ["혼연일체(흑)", "혼연일체(백)", "긴장감"];

  if (noBerryAbil.includes(atkAbil)) {
    return;
  }
  if (defPokemon.item === "자뭉열매" && defPokemon.hp <= defPokemon.origin.hp / 2) {
    defPokemon.item = null;
    recover(battle, Math.floor(defPokemon.origin.hp / 4), defPokemon, enqueue, defPokemon.names + " 자뭉열매로 체력을 회복했다!");
  }
}

// ====================== 공격 외 데미지 ======================
// 기준 = 급소 없음, 탈 안 까임, 멀스 적용 안됨(일단 생구는 확실히 적용 안됨)
// abil : 스텔스록
// turnEnd: 독, 화상, 씨뿌리기
// skillEffect: 생구, 무릎차기 빗나감, 반동, 울퉁불퉁멧

export function damage(battle, damageValue, getDamagePokemon, enqueue, text) {
  const defPokemon = battle[getDamagePokemon];
  const actualDamage = applyDamage(defPokemon, Math.floor(damageValue));
  const atkPokemon = battle[getDamagePokemon === "npc" ? "player" : "npc"];
  const atkAbil = atkPokemon.abil;
  if (text) enqueue({ battle, text });

  if (defPokemon.hp <= 0) {
    handleFaint(defPokemon, enqueue, battle);
  } else {
    tryBerry(defPokemon, battle, enqueue, atkAbil);
  }
  return actualDamage;
}

// ====================== 공격 데미지 ======================

// 공격으로 데미지를 줄때
// skillUse에서 공격 데미지
// skillCheck에서 혼란 자해 데미지
// 기준: 특성 탈 까짐, 급소 판정 있음
export function attackDamage(battle, skillDamage, getDamagePokemon, enqueue, typeText, serialAttackObject) {
  const atkPokemon = battle[getDamagePokemon === "npc" ? "player" : "npc"];
  const defPokemon = battle[getDamagePokemon];
  const useSkill = battle[battle.turn.atk].origin["sk" + battle.turn.atkSN];
  atkPokemon.tempStatus.recentSkillUse = useSkill;
  defPokemon.tempStatus.recentSkillGet = useSkill;
  const noTextSkills = ["카타스트로피"];
  const noTextTrigger = noTextSkills.includes(useSkill.name) || useSkill.feature.oneShot;
  let atkAbil = battle[battle.turn.atk].abil;

  let commonText = null;
  if (serialAttackObject) {
    commonText = "(" + serialAttackObject.num + "타) ";
  }

  let skDamage = Math.floor(skillDamage);

  //실제로 준 데미지
  //반동이나 흡혈 계산에 사용
  let actualGiveDamage = skDamage;

  // 대타출동
  if (defPokemon.tempStatus.substitute) {
    if (!useSkill.feature?.sound) {
      // 소리 기술은 대타를 뚫는다
      enqueue({ battle, text: (commonText || "") + josa(`${defPokemon.name}#{를} `) + "대신하여 대타가 공격을 받았다!" });

      if (!noTextTrigger) {
        if (atkPokemon.temp.critical) {
          enqueue({ battle, text: (commonText || "") + "급소에 맞았다!" });
        }
        if (typeText) {
          // 효과가 굉장했다!
          enqueue({ battle, text: (commonText || "") + typeText });
        }
      }
      if (defPokemon.tempStatus.substituteHp <= skDamage) {
        // 대타출동 인형 체력보다 데미지가 큰 경우
        actualGiveDamage = defPokemon.tempStatus.substituteHp;
        defPokemon.tempStatus.substitute = null;
        defPokemon.tempStatus.substituteHp = null;
        enqueue({ battle, text: defPokemon.name + "의 대타는 사라져 버렸다..." });
      } else {
        defPokemon.tempStatus.substituteHp -= skDamage;
      }
      return;
    }
  }

  // 특성 "탈" 처리
  let talTrigger = false;
  if (defPokemon.abil === "탈") {
    if (atkAbil !== "틀깨기" && atkAbil !== "테라볼티지" && atkAbil !== "터보블레이즈") {
      talTrigger = true;
      defPokemon.abil = defPokemon.origin.abil = "탈 (사용됨)";
      const talHp = Math.floor(defPokemon.origin.hp / 8);
      if (skDamage > talHp) {
        skDamage = talHp;
        actualGiveDamage = talHp;
      }
    }
  }
  // 기합의띠 트리거
  const gdTrigger = defPokemon.item === "기합의띠" && defPokemon.hp === defPokemon.origin.hp;
  // HP 차감
  const prevHp = defPokemon.hp;
  defPokemon.hp -= skDamage;
  if (defPokemon.hp <= 0) {
    actualGiveDamage = prevHp;
    defPokemon.hp = gdTrigger ? 1 : 0;
    if (gdTrigger) {
      defPokemon.item = null;
      actualGiveDamage -= 1;
    }
  }

  // 최근 기록
  atkPokemon.temp.recentDamageGive = actualGiveDamage;
  defPokemon.temp.recentDamageGet = actualGiveDamage;

  // ================= 텍스트 처리 =================
  let textTrigger = true;
  if (talTrigger) {
    enqueue({ battle, text: (commonText || "") + "탈이 대타가 되었다!" });
    textTrigger = false;
  }

  // 상성 텍스트(ex:효과가 굉장했다!)나 급소여부가 출력되지 않는 '공격기' //
  // 고정 데미지 기술, 일격기

  if (!noTextTrigger) {
    if (atkPokemon.temp.critical) {
      enqueue({ battle, text: (commonText || "") + "급소에 맞았다!" });
      textTrigger = false;
    }
    if (typeText) {
      // 효과가 굉장했다!
      enqueue({ battle, text: (commonText || "") + typeText });
      textTrigger = false;
    }
  }

  if (gdTrigger && defPokemon.item === null) {
    enqueue({ battle, text: (commonText || "") + defPokemon.names + " 기합의 띠로 버텼다!" });
    textTrigger = false;
  }

  // ================= 후처리 =================

  if (defPokemon.hp <= 0) {
    if (useSkill.feature?.oneShot) {
      //일격기 성공 텍스트
      enqueue({ battle, text: "일격필살!" });
    }
    if (textTrigger && serialAttackObject) {
      //연속기일때 텍스트 없으면 출력
      enqueue({ battle, text: (commonText || "") + defPokemon.name + "에게 데미지를 주었다!" });
    }
    handleFaint(defPokemon, enqueue, battle, atkAbil);
  } else {
    // 출력 텍스트가 하나도 없을 때
    if (textTrigger) {
      enqueue({ battle, text: (commonText || "") + defPokemon.name + "에게 데미지를 주었다!" });
    }
    tryBerry(defPokemon, battle, enqueue, atkAbil);
  }

  applyOnHitEvents(battle, enqueue);
}
