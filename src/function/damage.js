import { type } from "@testing-library/user-event/dist/type";
import { recover } from "../function/recover";
import { rank } from "./rank";
import { josa } from "josa";
import { applyOnHitEvents } from "../service/applyOnHitEvents.js";

// ====================== 공통 유틸 함수 ======================

const noTextSkills = ["카타스트로피"];

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
}

// 자뭉열매 처리
function tryBerry(defPokemon, battle, enqueue, atkAbil, noBerrySkill) {
  let noBerryAbil = ["혼연일체(흑)", "혼연일체(백)", "긴장감"];

  if (noBerryAbil.includes(atkAbil)) {
    return;
  }

  if (noBerrySkill) {
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

  const isNoTextSkill = noTextSkills.includes(useSkill.name) || useSkill.feature.oneShot;
  // 일격기나 고정데미지 스킬은 상성, 급소 텍스트가 뜨지 않는다
  let atkAbil = battle[battle.turn.atk].abil;

  let commonText = null;
  if (serialAttackObject) {
    commonText = "(" + serialAttackObject.num + "타) ";
  }

  let skDamage = Math.floor(skillDamage);

  //실제로 준 데미지
  //반동이나 흡수 계산에 사용
  let actualGiveDamage = skDamage;

  // 대타출동
  if (defPokemon.tempStatus.substitute) {
    if (!useSkill.feature?.sound) {
      // 소리 기술은 대타를 뚫는다
      enqueue({ battle, text: (commonText || "") + josa(`${defPokemon.name}#{를} `) + "대신하여 대타가 공격을 받았다!" });

      if (!isNoTextSkill) {
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
      atkPokemon.temp.recentDamageGive = actualGiveDamage;
      defPokemon.temp.recentDamageGet = actualGiveDamage;

      return;
      // 대타출동 상태일땐 피격 이벤트 (ex:울멧)이 발동하지 않음
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
  let gdTrigger = defPokemon.item === "기합의띠";

  // 옹골참 트리거
  let ogcTrigger = defPokemon.abil === "옹골참" && atkAbil !== "틀깨기" && atkAbil !== "테라볼티지" && atkAbil !== "터보블레이즈";

  let noOneShot = defPokemon.hp === defPokemon.origin.hp && (gdTrigger || ogcTrigger);

  let ogcTextTrigger = false;
  let gdTextTrigger = false;

  // HP 차감
  const prevHp = defPokemon.hp;
  defPokemon.hp -= skDamage;
  if (defPokemon.hp <= 0) {
    actualGiveDamage = prevHp;
    defPokemon.hp = noOneShot ? 1 : 0;
    if (noOneShot) {
      if (ogcTrigger) {
        // 옹골참
        ogcTextTrigger = true;
        // 옹골참 기띠가 동시에 있으면 옹골참이 먼저 쓰인다
        // 기합의띠로 버텼다! 텍스트 안 뜨게 false 처리
      } else if (gdTrigger) {
        gdTextTrigger = true;
        defPokemon.item = null;
      }

      actualGiveDamage -= 1;
    }
  }

  // 최근 기록
  atkPokemon.temp.recentDamageGive = actualGiveDamage;
  defPokemon.temp.recentDamageGet = actualGiveDamage;

  // ================= 텍스트 처리 =================
  let defaultText = true;
  if (talTrigger) {
    enqueue({ battle, text: (commonText || "") + "탈이 대타가 되었다!" });
    defaultText = false;
  }

  // 상성 텍스트(ex:효과가 굉장했다!)나 급소여부가 출력되지 않는 '공격기' //
  // 고정 데미지 기술, 일격기

  if (!isNoTextSkill) {
    if (atkPokemon.temp.critical) {
      enqueue({ battle, text: (commonText || "") + "급소에 맞았다!" });
      defaultText = false;
    }
    if (typeText) {
      // 효과가 굉장했다!
      enqueue({ battle, text: (commonText || "") + typeText });
      defaultText = false;
    }
  }

  if (ogcTextTrigger) {
    enqueue({ battle, text: (commonText || "") + "[특성 옹골참] " + defPokemon.names + " 옹골참으로 버텼다!" });
    defaultText = false;
  }

  if (gdTextTrigger) {
    enqueue({ battle, text: (commonText || "") + defPokemon.names + " 기합의 띠로 버텼다!" });
    defaultText = false;
  }

  // ================= 후처리 =================

  if (defPokemon.hp <= 0) {
    if (useSkill.feature?.oneShot) {
      //일격기 성공 텍스트
      enqueue({ battle, text: "일격필살!" });
    }
    if (serialAttackObject) {
      if (typeText) {
        //연속기일때 텍스트 없으면 출력
        enqueue({ battle, text: typeText });
      }
      if (defaultText) {
        //연속기일때 텍스트 없으면 출력
        enqueue({ battle, text: (commonText || "") + defPokemon.name + "에게 데미지를 주었다!" });
      }
    }

    handleFaint(defPokemon, enqueue, battle, atkAbil);

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
    }
  } else {
    // 출력 텍스트가 하나도 없을 때
    if (defaultText) {
      enqueue({ battle, text: (commonText || "") + defPokemon.name + "에게 데미지를 주었다!" });
    }

    const noBerrySkill = useSkill.name === "탁쳐서떨구기";
    // 탁떨을 맞고 반피 이하가 되면 열매를 먹기 전에 떨군다
    tryBerry(defPokemon, battle, enqueue, atkAbil, noBerrySkill);
  }

  applyOnHitEvents(battle, enqueue);
}
