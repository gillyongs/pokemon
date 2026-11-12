import { hpCalculate } from "../util/hpCalculate";
import { josa } from "josa";
import { applyOnHitEvents } from "../service/onHit.js";

// ====================== 공격 데미지 ======================

// 공격으로 데미지를 줄때
// skillUse에서 공격 데미지
// skillCheck에서 혼란 자해 데미지
// 기준: 특성 탈 까짐, 급소 판정 있음
export function attackDamage(battle, skillDamage, getDamagePokemon, enqueue, typeText, serialAttackObject) {
  const isConfuseSelfHit = getDamagePokemon === battle?.turn?.atk;
  const atkPokemon = battle[getDamagePokemon === "npc" ? "player" : "npc"];
  const defPokemon = battle[getDamagePokemon];
  const useSkill = atkPokemon.turn.useSkill;
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
    if (useSkill.feature?.sound || atkPokemon.abil === "틈새포착") {
      // 소리 기술이나 틈새포착 특성은 대타를 뚫는다
    } else {
      defPokemon.turn.substitute = true;
      defPokemon.turn.lastHitSubstitute = true; // 대타출동을 깨뜨린 공격의 부가효과도 막기위해 별도로 명시

      enqueue({ id: "80a18710-3b5b-4a73-91c7-7e8e0bbeee0d", battle, text: (commonText || "") + josa(`${defPokemon.name}#{를} `) + "대신하여 대타가 공격을 받았다!" });

      if (!isNoTextSkill) {
        if (typeText) {
          // 효과가 굉장했다!
          enqueue({ id: "ae60a301-c5b2-4a6e-aac6-e14055462374", battle, text: (commonText || "") + typeText });
        }
        if (atkPokemon.turn.critical) {
          enqueue({ id: "4ab645b9-29cc-4902-9fa9-e7e70b95ef79", battle, text: (commonText || "") + "급소에 맞았다!" });
        }
      }
      if (defPokemon.tempStatus.substituteHp <= skDamage) {
        // 대타출동 인형 체력보다 데미지가 큰 경우
        actualGiveDamage = defPokemon.tempStatus.substituteHp;
        defPokemon.tempStatus.substitute = null;
        defPokemon.tempStatus.substituteHp = null;
        enqueue({ id: "e267b6b5-b9ab-4e32-8b34-4c45e6e9d9f0", battle, text: defPokemon.name + "의 대타는 사라져 버렸다..." });
      } else {
        defPokemon.tempStatus.substituteHp -= skDamage;
      }
      atkPokemon.turn.recentDamageGive = actualGiveDamage;
      // defPokemon.turn.recentDamageGet = actualGiveDamage;
      // 대타출동을 때렸을때 반동, 흡수 (recentDamageGive)는 정상 작동 (대타출동체력으로 계산)
      // 대타출동 상태로 카운터 사용시 실패
      if (!isConfuseSelfHit) {
        applyOnHitEvents(battle, enqueue, true);
      }
      // 대타출동 상태일땐 대부분의 피격 이벤트 (ex:울멧)가 발동하지 않음
      // 대타출동 상태일때에도 발생하는 이벤트 처리 (풍선)
      return;
    }
  }

  defPokemon.turn.lastHitSubstitute = false;

  // 특성 "탈" 처리
  let talTrigger = false;
  if (defPokemon.abil === "탈") {
    if (!atkAbilObj.feature?.tgg) {
      //틀깨기
      talTrigger = true;
      //트레이스 특성때문에 포켓몬 교체시 abil을 origin.abil 값으로 바꾸므로 origin.abil도 바꿔줘야함
      defPokemon.abil = "탈 (사용됨)";
      defPokemon.origin.abil = "탈 (사용됨)";
      const talHp = Math.floor(hpCalculate(defPokemon) / 8);
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

  let noOneShot = defPokemon.hp === hpCalculate(defPokemon) && (gdTrigger || ogcTrigger);

  let ogcTextTrigger = false;
  let gdTextTrigger = false;
  let mandooTextTrigger = false;

  // HP 차감
  const prevHp = defPokemon.hp;
  defPokemon.hp -= skDamage;
  if (defPokemon.hp <= 0) {
    actualGiveDamage = prevHp;
    defPokemon.hp = noOneShot ? 1 : 0;
    if (noOneShot) {
      // 옹골참 또는 기띠
      if (ogcTrigger) {
        // 옹골참
        ogcTextTrigger = true;
        // 옹골참 기띠가 동시에 있으면 옹골참이 먼저 쓰인다
      } else if (gdTrigger) {
        gdTextTrigger = true;
        defPokemon.item = null;
      }

      actualGiveDamage -= 1;
    } else if (defPokemon.hasAugment?.("mandoocornEndure")) {
      // 10% 확률로 HP 1로 버팀
      if (Math.random() < 0.1) {
        defPokemon.hp = 1;
        actualGiveDamage = prevHp - 1;
        mandooTextTrigger = true;
      }
    }
  }

  // 최근 기록
  atkPokemon.turn.recentDamageGive = actualGiveDamage; // 반동, 흡수
  defPokemon.turn.recentDamageGet = actualGiveDamage; // 카운터
  if (actualGiveDamage > 0 && defPokemon.turn) {
    defPokemon.turn.damagedThisTurn = true; // 워모그
  }
  defPokemon.tempStatus.hitCount = (defPokemon.tempStatus.hitCount || 0) + 1; // 분노의주먹

  // ================= 텍스트 처리 =================
  let defaultText = true;
  if (talTrigger) {
    enqueue({ id: "1032cc24-b340-43e9-a8b5-1b9a158f34e5", battle, text: (commonText || "") + "탈이 대타가 되었다!" });
    defaultText = false;
  }

  // 상성 텍스트(ex:효과가 굉장했다!)나 급소여부가 출력되지 않는 '공격기' //
  // 고정 데미지 기술, 일격기

  if (!isNoTextSkill) {
    if (typeText) {
      // 효과가 굉장했다!
      enqueue({ id: "1ade4efe-3baf-400a-9f3e-102d8f1db3a8", battle, text: (commonText || "") + typeText });
      defaultText = false;
    }
    if (atkPokemon.turn.critical) {
      enqueue({ id: "03dad601-d7df-4e96-bed2-f9ea2177aef1", battle, text: (commonText || "") + "급소에 맞았다!" });
      defaultText = false;
    }
  }

  if (ogcTextTrigger) {
    enqueue({ id: "d13b5f2a-c639-454b-a99b-3cda35125184", battle, text: (commonText || "") + "[특성 옹골참] " + defPokemon.names + " 옹골참으로 버텼다!" });
    defaultText = false;
  }

  if (gdTextTrigger) {
    enqueue({ id: "c5586860-fd7d-43fd-9e5a-2b01d89fa561", battle, text: (commonText || "") + defPokemon.names + " 기합의 띠로 버텼다!" });
    defaultText = false;
  }

  if (mandooTextTrigger) {
    enqueue({ id: "68433131-04e8-41e0-8cc4-c13dcc8b93a4", battle, text: (commonText || "") + defPokemon.names + " 플레이어를 슬프게 하지 않으려고 버텼다!" });
    defaultText = false;
  }

  // ================= 후처리 =================

  let executedByCollector = false;

  if (defPokemon.hp > 0) {
    // 쓰러지지 않은 경우
    if (defaultText) {
      // 출력 텍스트가 하나도 없을 때
      enqueue({ id: "463e5193-4b0b-4468-94d2-2c3a7421f6fe", battle, text: (commonText || "") + defPokemon.name + "에게 데미지를 주었다!" });
      defaultText = false;
    }

    // [증강] 징수의 총: 상대 포켓몬의 체력이 5% 이하일 경우 처형
    if (!isConfuseSelfHit && atkPokemon.hasAugment?.("collector") && !atkPokemon.faint && defPokemon.hp <= hpCalculate(defPokemon) * 0.05) {
      executedByCollector = true;
      defPokemon.hp = 0;
      enqueue({ id: "5d3c74a2-8e14-4d9a-b7c1-904c011ec702", battle, text: `[증강 징수의 총] ${defPokemon.names} 처형당했다!` });
    }

    if (defPokemon.hp > 0) {
      const noBerrySkill = useSkill.name === "탁쳐서떨구기";
      // 탁떨을 맞고 반피 이하가 되면 열매를 먹기 전에 떨군다
      if (!noBerrySkill) {
        defPokemon.tryBerry(battle, enqueue);
      }
    }
  }

  if (defPokemon.hp <= 0) {
    if (useSkill.feature?.oneShot && !executedByCollector) {
      //일격기 성공 텍스트
      enqueue({ id: "7b865133-6bb6-456d-b080-dceacb589196", battle, text: "일격필살!" });
    }
    if (serialAttackObject) {
      if (typeText) {
        //연속기일때 텍스트 없으면 출력
        enqueue({ id: "9cd84b54-3c72-4ac9-81ef-d2a076c499e7", battle, text: typeText });
      }
      if (defaultText) {
        //연속기일때 텍스트 없으면 출력
        enqueue({ id: "04fa1546-dec5-489e-b336-b23323ed15e9", battle, text: (commonText || "") + defPokemon.name + "에게 데미지를 주었다!" });
      }
    }
    // 길동무
    // handleFaint에서 tempStatus가 초기화되므로 faint 처리 전에 battle.turn에 기록 (발동은 SkillEffect 공통에서 처리)
    if (defPokemon.tempStatus?.destinyBond && !atkPokemon.faint && battle?.turn) {
      battle.turn.destinyBondUser = defPokemon.names;
    }

    // 용용 죽겠지 버프: 드래곤 타입 포켓몬 처치 횟수 누적 (handleFaint 스냅샷에 즉시 반영되도록 직전에 처리)
    const isDefDragon = defPokemon.type1 === "드래곤" || defPokemon.type2 === "드래곤";
    if (atkPokemon.hasAugment?.("dragonDie") && isDefDragon && !atkPokemon.faint) {
      const nextCount = Number(atkPokemon.dragonKillCount ?? atkPokemon.augments?.find((a) => a.id === "dragonDie")?.dragonKillCount ?? 0) + 1;
      atkPokemon.dragonKillCount = nextCount;
      const dragonDieAug = atkPokemon.augments?.find((a) => a.id === "dragonDie");
      if (dragonDieAug) {
        dragonDieAug.dragonKillCount = nextCount;
      }
    }

    // 메자이의 영혼약탈자 버프: 적을 직접 쓰러뜨릴 때마다 중첩 1 증가 (handleFaint 스냅샷에 즉시 반영되도록 직전에 처리)
    if (atkPokemon.hasAugment?.("mejaisSoulstealer") && !atkPokemon.faint) {
      const mejaiAug = atkPokemon.augments?.find((a) => a.id === "mejaisSoulstealer");
      const nextStack = Number(atkPokemon.mejaiStack ?? mejaiAug?.mejaiStack ?? 0) + 1;
      atkPokemon.mejaiStack = nextStack;
      if (mejaiAug) {
        mejaiAug.mejaiStack = nextStack;
      }
    }

    // 공격기로 적 포켓몬을 쓰러뜨린 경우 기록 (턴 종료까지 해당 포켓몬 생존 시 증강 선택용)
    if (!isConfuseSelfHit && !defPokemon.faint && defPokemon.team === "npc" && battle?.turn?.atk === "player" && !atkPokemon.faint && atkPokemon.turn) {
      atkPokemon.turn.knockedOutNpcThisTurn = true;
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

    // 드래곤 슬레이어 증강: 드래곤 타입 포켓몬을 쓰러뜨리면 모든 능력이 1랭크 상승
    if (atkPokemon.hasAugment?.("dragonSlayer") && isDefDragon && !atkPokemon.faint) {
      atkPokemon.rankUp(battle, enqueue, "all", 1, "[증강 드래곤 슬레이어]");
    }
  }

  if (!isConfuseSelfHit) {
    applyOnHitEvents(battle, enqueue);
    // 혼란 자해는 피격 이벤트가 발생하지 않음 (풍선도 안 터짐)
  }
}
