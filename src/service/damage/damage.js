import { josa } from "josa";
import { applyOnHitEvents } from "../onHit.js";
import { isAttackSkill } from "../../entity/Skill/Skill.js";
import { damageCalculate } from "../../calc/damageCalculate.js";
import { getTypeText, typeCheckOnBattle } from "../../calc/typeEffectCalculate.js";
import { checkEndure } from "./endure.js";
export { confuseDamage } from "./confuseDamage.js";

// ====================== 공격 데미지 ======================

// 공격으로 데미지를 줄때
// skillUse에서 호출
export function attackDamage(battle, enqueue, num) {
  const skillDamage = damageCalculate(battle, num);

  const atkPokemon = battle[battle.turn.atk];
  const defPokemon = battle[battle.turn.def];
  const useSkill = atkPokemon.turn.useSkill;

  // 상성 텍스트 계산
  const typeDamage = typeCheckOnBattle(battle, useSkill, atkPokemon, defPokemon);
  const typeText = getTypeText(typeDamage);

  if (useSkill) {
    atkPokemon.tempStatus.recentSkillUse = useSkill;
    defPokemon.tempStatus.recentSkillGet = useSkill;
  }

  let commonText = num ? `(${num}타) ` : null;

  // 상성 텍스트(ex: 효과가 굉장했다!), 급소, 난기류 텍스트 출력 (대타출동 / 본체 공통)
  // 일격기나 고정데미지 스킬(!isAttackSkill)은 상성, 급소 텍스트가 뜨지 않는다
  const enqueueSkillEffectiveness = (isSubstitute = false) => {
    if (!isAttackSkill(useSkill)) return false;

    let hasOutput = false;
    const isDeltaStreamWeaken = Boolean(battle?.isDeltaStream && (defPokemon.type1 === "비행" || defPokemon.type2 === "비행") && ["전기", "얼음", "바위"].includes(useSkill?.type));
    if (isDeltaStreamWeaken) {
      enqueue(battle, (commonText || "") + "수수께끼의 난기류가 공격을 약하게 만들었다!", "dmg_delta_weaken");
      hasOutput = true;
    }
    if (typeText && !num) {
      // 효과가 굉장했다! (단발기는 피격 시 바로 출력, 연속기는 마지막 타격 또는 기절 시 1회 출력)
      enqueue(battle, (commonText || "") + typeText, isSubstitute ? "dmg_sub_type" : "dmg_type_text");
      hasOutput = true;
    }
    if (atkPokemon.turn.critical) {
      enqueue(battle, (commonText || "") + "급소에 맞았다!", isSubstitute ? "dmg_sub_crit" : "dmg_crit");
      hasOutput = true;
    }
    return hasOutput;
  };

  let skDamage = Math.floor(skillDamage);

  //실제로 준 데미지
  //반동이나 흡수 계산에 사용
  let actualGiveDamage = skDamage;

  // 대타출동
  if (defPokemon.tempStatus.substitute) {
    if (useSkill?.feature?.sound || atkPokemon.abil?.name === "틈새포착") {
      // 소리 기술이나 틈새포착 특성은 대타를 뚫는다
    } else {
      defPokemon.turn.substitute = true;
      defPokemon.turn.lastHitSubstitute = true; // 대타출동을 깨뜨린 공격의 부가효과도 막기위해 별도로 명시

      enqueue(battle, (commonText || "") + josa(`${defPokemon.name}#{를} `) + "대신하여 대타가 공격을 받았다!", "dmg_sub_hit");

      enqueueSkillEffectiveness(true);
      if (defPokemon.tempStatus.substituteHp <= skDamage) {
        // 대타출동 인형 체력보다 데미지가 큰 경우
        actualGiveDamage = defPokemon.tempStatus.substituteHp;
        defPokemon.tempStatus.substitute = null;
        defPokemon.tempStatus.substituteHp = null;
        enqueue(battle, defPokemon.name + "의 대타는 사라져 버렸다...", "dmg_sub_break");
      } else {
        defPokemon.tempStatus.substituteHp -= skDamage;
      }
      atkPokemon.turn.recentDamageGive = actualGiveDamage;
      // defPokemon.turn.recentDamageGet = actualGiveDamage;
      // 대타출동을 때렸을때 반동, 흡수 (recentDamageGive)는 정상 작동 (대타출동체력으로 계산)
      // 대타출동 상태로 카운터 사용시 실패
      applyOnHitEvents(battle, enqueue, true);
      // 대타출동 상태일땐 대부분의 피격 이벤트 (ex:울멧)가 발동하지 않음
      // 대타출동 상태일때에도 발생하는 이벤트 처리 (풍선)
      return;
    }
  }

  defPokemon.turn.lastHitSubstitute = false;

  // 특성 "탈" 처리
  let talTrigger = false;
  if (defPokemon.abil?.name === "탈" && !defPokemon.abil?.usedOnce) {
    if (!atkPokemon.abil?.feature?.tgg) {
      //틀깨기
      talTrigger = true;
      defPokemon.abil.usedOnce = true;
      if (defPokemon.originalAbil) defPokemon.originalAbil.usedOnce = true;
      if (defPokemon.hasAugment?.("devilOfGen7")) {
        skDamage = 0;
        actualGiveDamage = 0;
      } else {
        const talHp = Math.floor(defPokemon.maxHp / 8);
        if (skDamage > talHp) {
          skDamage = talHp;
          actualGiveDamage = talHp;
        }
      }
    }
  }
  let endureResult = null;

  // HP 차감
  const prevHp = defPokemon.hp;
  defPokemon.hp -= skDamage;
  if (defPokemon.hp <= 0) {
    actualGiveDamage = prevHp;
    defPokemon.hp = 0;

    endureResult = checkEndure(defPokemon, prevHp, atkPokemon);
    if (endureResult) {
      // 버티기 체크
      // 기합의띠, 옹골참, [증강] 하지만 버텨냈다, 아무일도 없었다, 슬프게하지 않으려고 버텼다!, 에어맨이 쓰러지지않아
      actualGiveDamage = Math.max(0, prevHp - 1);
    }
  }

  // 최근 기록
  atkPokemon.turn.recentDamageGive = actualGiveDamage; // 반동, 흡수
  defPokemon.turn.recentDamageGet = actualGiveDamage; // 카운터
  if (actualGiveDamage > 0 && defPokemon.turn) {
    defPokemon.turn.damagedThisTurn = true; // 워모그
  }
  defPokemon.tempStatus.hitCount = (defPokemon.tempStatus.hitCount || 0) + 1; // 분노의주먹

  // [증강 방어구 부수기] 적을 공격하여 데미지를 줄 때마다 적의 방어와 특수방어 5% 감소 (최대 15스택)
  if (actualGiveDamage > 0 && atkPokemon.hasAugment?.("armorBreak")) {
    if (!defPokemon.tempStatus.armorBreak) {
      defPokemon.tempStatus.armorBreak = 1;
    } else {
      defPokemon.tempStatus.armorBreak = Math.min(15, defPokemon.tempStatus.armorBreak + 1);
    }
  }

  // ================= 텍스트 처리 =================
  let defaultText = true;
  if (talTrigger) {
    enqueue(battle, "[특성 탈] " + (commonText || "") + "탈이 대타가 되었다!", "dmg_disguise", { triggerSide: battle.turn.def });
    defaultText = false;
  }

  if (enqueueSkillEffectiveness(false)) {
    defaultText = false;
  }

  if (endureResult) {
    enqueue(battle, (commonText || "") + endureResult.endureText, endureResult.endureKey);
    defaultText = false;
  }

  // ================= 후처리 =================

  let executedByCollector = false;

  if (defPokemon.hp > 0) {
    // 쓰러지지 않은 경우
    if (defaultText) {
      // 출력 텍스트가 하나도 없을 때
      enqueue(battle, (commonText || "") + defPokemon.name + "에게 데미지를 주었다!", "dmg_default");
      defaultText = false;
    }

    // [증강] 징수의 총: 상대 포켓몬의 체력이 5% 이하일 경우 처형
    if (atkPokemon.hasAugment?.("collector") && !atkPokemon.faint && defPokemon.hp <= defPokemon.maxHp * 0.05) {
      executedByCollector = true;
      defPokemon.hp = 0;
      enqueue(battle, `[증강 징수의 총] ${defPokemon.names("는")} 처형당했다!`, "dmg_collector");
    }

    if (defPokemon.hp > 0) {
      if (useSkill?.skillEffectList?.some((e) => e.name === "회복봉인") && defPokemon.tempStatus.healBlock === null) {
        defPokemon.tempStatus.healBlock = "ready";
      }
      const noBerrySkill = useSkill?.name === "탁쳐서떨구기";
      // 탁떨을 맞고 반피 이하가 되면 열매를 먹기 전에 떨군다
      if (!noBerrySkill) {
        defPokemon.tryJamung(battle, enqueue);
      }
    }
  }

  if (defPokemon.hp <= 0) {
    if (useSkill?.feature?.oneShot && !executedByCollector) {
      //일격기 성공 텍스트
      enqueue(battle, "일격필살!", "dmg_ohko");
    }
    if (num) {
      if (typeText && isAttackSkill(useSkill)) {
        //연속기일때 텍스트 없으면 출력
        enqueue(battle, typeText, "dmg_serial_ko_type");
      }
      if (defaultText) {
        //연속기일때 텍스트 없으면 출력
        enqueue(battle, (commonText || "") + defPokemon.name + "에게 데미지를 주었다!", "dmg_serial_ko_default");
      }
    }
    // 길동무
    // handleFaint에서 tempStatus가 초기화되므로 faint 처리 전에 battle.turn에 기록 (발동은 SkillEffect 공통에서 처리)
    if (defPokemon.tempStatus?.destinyBond && !atkPokemon.faint && battle?.turn) {
      battle.turn.destinyBondUser = defPokemon.names("는");
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
    if (!defPokemon.faint && defPokemon.team === "npc" && battle.turn.atk === "player" && !atkPokemon.faint && atkPokemon.turn) {
      atkPokemon.turn.knockedOutNpcThisTurn = true;
    }

    defPokemon.handleFaint(battle, enqueue);

    // [특성 내용물분출 / 증강 함께 폭사하자] 상대의 공격기를 맞고 기절했을 때 공격 시작 전 체력만큼 데미지 반사
    const innardsDamage = defPokemon.turn.hpBeforeAttack;
    if (typeof innardsDamage === "number" && innardsDamage > 0) {
      if (atkPokemon && !atkPokemon.faint && defPokemon.abil?.name === "내용물분출") {
        const innardsText = `[특성 내용물분출] ${atkPokemon.name}은 데미지를 입었다!`;
        atkPokemon.getDamage(battle, enqueue, innardsDamage, innardsText);
      }
      if (atkPokemon && !atkPokemon.faint && defPokemon.hasAugment?.("letsExplodeTogether")) {
        const explodeText = `[증강 함께 폭사하자] ${atkPokemon.name}은 데미지를 입었다!`;
        atkPokemon.getDamage(battle, enqueue, innardsDamage, explodeText);
      }
    }

    // 자기과신
    if (atkPokemon.abil?.feature?.swip && !atkPokemon.faint) {
      let swip = atkPokemon.abil.feature.swip;
      let abilName = atkPokemon.abil.name;
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

    // 폭주하는 힘 증강: 적을 쓰러뜨렸을 경우 다음 턴까지 모든 능력치가 1.5배 증가
    if (atkPokemon.hasAugment?.("rampagingPower") && !atkPokemon.faint) {
      atkPokemon.tempStatus.rampagingPower = 2;
      enqueue(battle, `[증강 폭주하는 힘] ${atkPokemon.names("는")} 폭주하여 일시적으로 모든 능력치가 증가한다!`, "rampaging_power_start");
    }
  }

  applyOnHitEvents(battle, enqueue, false, talTrigger);
}
