import { josa } from "josa";
import { applyOnHitEvents } from "../service/onHit.js";

// ====================== 공격 데미지 ======================

// 공격으로 데미지를 줄때
// skillUse에서 공격 데미지
// skillCheck에서 혼란 자해 데미지
// 기준: 특성 탈 까짐, 급소 판정 있음
export function attackDamage(battle, skillDamage, getDamagePokemon, enqueue, typeText, serialAttackObject) {
  const atkPokemon = battle[getDamagePokemon === "npc" ? "player" : "npc"];
  const defPokemon = battle[getDamagePokemon];
  const useSkill = atkPokemon.temp.useSkill;

  atkPokemon.tempStatus.recentSkillUse = useSkill;
  defPokemon.tempStatus.recentSkillGet = useSkill;

  const isNoTextSkill = useSkill.feature?.noText || useSkill.feature?.oneShot;
  // 일격기나 고정데미지 스킬은 상성, 급소 텍스트가 뜨지 않는다
  let atkAbil = battle[battle.turn.atk].abil;
  let atkAbilObj = battle[battle.turn.atk].abilObj;

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
        if (typeText) {
          // 효과가 굉장했다!
          enqueue({ battle, text: (commonText || "") + typeText });
        }
        if (atkPokemon.temp.critical) {
          enqueue({ battle, text: (commonText || "") + "급소에 맞았다!" });
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
      applyOnHitEvents(battle, enqueue, true);
      // 대타출동 상태일땐 대부분의 피격 이벤트 (ex:울멧)가 발동하지 않음
      // 대타출동 상태일때에도 발생하는 이벤트 처리 (풍선)
      return;
    }
  }

  // 특성 "탈" 처리
  let talTrigger = false;
  if (defPokemon.abil === "탈") {
    if (!atkAbilObj.feature?.tgg) {
      //틀깨기
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
  let ogcTrigger = defPokemon.abil === "옹골참" && !atkAbilObj.feature?.tgg;

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
    if (typeText) {
      // 효과가 굉장했다!
      enqueue({ battle, text: (commonText || "") + typeText });
      defaultText = false;
    }
    if (atkPokemon.temp.critical) {
      enqueue({ battle, text: (commonText || "") + "급소에 맞았다!" });
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

    defPokemon.handleFaint(battle, enqueue);

    // 자기과신
    if (atkAbilObj.feature?.swip) {
      let swip = atkAbilObj.feature.swip;
      let abilName = atkAbilObj.name;
      if (abilName === "혼연일체(흑)" || abilName === "혼연일체(백)") {
        abilName = "혼연일체";
      }
      let abiltText = `[특성 ${abilName}]`;
      if (swip === "max") {
        swip = atkPokemon.maxStat();
      }

      atkPokemon.rankUp(battle, enqueue, swip, 1, abiltText);
    }
  } else {
    // 출력 텍스트가 하나도 없을 때
    if (defaultText) {
      enqueue({ battle, text: (commonText || "") + defPokemon.name + "에게 데미지를 주었다!" });
    }

    const noBerrySkill = useSkill.name === "탁쳐서떨구기";
    // 탁떨을 맞고 반피 이하가 되면 열매를 먹기 전에 떨군다
    if (!noBerrySkill) {
      defPokemon.tryBerry(battle, enqueue);
    }
  }

  applyOnHitEvents(battle, enqueue);
}
