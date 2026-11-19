import { josa } from "josa";
import { applyOnHitEvents } from "./onHit.js";

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
    if (useSkill.feature?.sound || atkPokemon.abil?.name === "틈새포착") {
      // 소리 기술이나 틈새포착 특성은 대타를 뚫는다
    } else {
      defPokemon.turn.substitute = true;
      defPokemon.turn.lastHitSubstitute = true; // 대타출동을 깨뜨린 공격의 부가효과도 막기위해 별도로 명시

      enqueue(battle, (commonText || "") + josa(`${defPokemon.name}#{를} `) + "대신하여 대타가 공격을 받았다!", "dmg_sub_hit");

      if (!isNoTextSkill) {
        if (typeText) {
          // 효과가 굉장했다!
          enqueue(battle, (commonText || "") + typeText, "dmg_sub_type");
        }
        if (atkPokemon.turn.critical) {
          enqueue(battle, (commonText || "") + "급소에 맞았다!", "dmg_sub_crit");
        }
      }
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
  // 기합의띠 트리거
  let gdTrigger = defPokemon.item === "기합의띠";

  // 옹골참 트리거
  let ogcTrigger = defPokemon.abil?.name === "옹골참" && !atkPokemon.abil?.feature?.tgg;

  let noOneShot = defPokemon.hp === defPokemon.maxHp && (gdTrigger || ogcTrigger);

  let ogcTextTrigger = false;
  let gdTextTrigger = false;
  let mandooTextTrigger = false;
  let refusedTextTrigger = false;

  // HP 차감
  const prevHp = defPokemon.hp;
  defPokemon.hp -= skDamage;
  if (defPokemon.hp <= 0) {
    actualGiveDamage = prevHp;
    defPokemon.hp = 0;
    if (defPokemon.turn?.butItRefused) {
      // 이번 턴 '하지만 버텨냈다.' 이미 활성화 중 -> 모든 데미지를 HP 1로 버팀
      defPokemon.hp = 1;
      actualGiveDamage = Math.max(0, prevHp - 1);
      refusedTextTrigger = true;
    } else if (noOneShot) {
      // 옹골참 또는 기띠
      defPokemon.hp = 1;
      if (ogcTrigger) {
        // 옹골참
        ogcTextTrigger = true;
        // 옹골참 기띠가 동시에 있으면 옹골참이 먼저 쓰인다
      } else if (gdTrigger) {
        gdTextTrigger = true;
        defPokemon.consumeItem();
      }

      actualGiveDamage -= 1;
    } else if (defPokemon.hasAugment?.("butItRefused") && !defPokemon.agument?.butItRefusedUsed) {
      // [증강] 하지만 버텨냈다.: 기절할 공격을 HP 1로 버티고 해당 턴 기절 면역 활성화
      defPokemon.hp = 1;
      actualGiveDamage = Math.max(0, prevHp - 1);
      if (defPokemon.turn) defPokemon.turn.butItRefused = true;
      if (defPokemon.agument) defPokemon.agument.butItRefusedUsed = true;
      refusedTextTrigger = true;
    } else if (defPokemon.hasAugment?.("mandoocornEndure")) {
      // 30% 확률로 HP 1로 버팀
      if (Math.random() < 0.3) {
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
    enqueue(battle, (commonText || "") + "탈이 대타가 되었다!", "dmg_disguise");
    defaultText = false;
  }

  // 상성 텍스트(ex:효과가 굉장했다!)나 급소여부가 출력되지 않는 '공격기' //
  // 고정 데미지 기술, 일격기

  if (!isNoTextSkill) {
    const isDeltaStreamWeaken = Boolean(battle?.isDeltaStream && (defPokemon.type1 === "비행" || defPokemon.type2 === "비행") && ["전기", "얼음", "바위"].includes(useSkill.type));
    if (isDeltaStreamWeaken) {
      enqueue(battle, (commonText || "") + "수수께끼의 난기류가 공격을 약하게 만들었다!", "dmg_delta_weaken");
      defaultText = false;
    }
    if (typeText) {
      // 효과가 굉장했다!
      enqueue(battle, (commonText || "") + typeText, "dmg_type_text");
      defaultText = false;
    }
    if (atkPokemon.turn.critical) {
      enqueue(battle, (commonText || "") + "급소에 맞았다!", "dmg_crit");
      defaultText = false;
    }
  }

  if (ogcTextTrigger) {
    enqueue(battle, (commonText || "") + "[특성 옹골참] " + defPokemon.names("는") + " 옹골참으로 버텼다!", "dmg_sturdy");
    defaultText = false;
  }

  if (gdTextTrigger) {
    enqueue(battle, (commonText || "") + defPokemon.names("는") + " 기합의 띠로 버텼다!", "dmg_focus_sash");
    defaultText = false;
  }

  if (mandooTextTrigger) {
    enqueue(battle, (commonText || "") + defPokemon.names("는") + " 플레이어를 슬프게 하지 않으려고 버텼다!", "dmg_mandoo_endure");
    defaultText = false;
  }

  if (refusedTextTrigger) {
    enqueue(battle, (commonText || "") + "하지만 버텨냈다!", "dmg_but_it_refused");
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
    if (!isConfuseSelfHit && atkPokemon.hasAugment?.("collector") && !atkPokemon.faint && defPokemon.hp <= defPokemon.maxHp * 0.05) {
      if (defPokemon.turn?.butItRefused) {
        defPokemon.hp = Math.max(1, defPokemon.hp);
        enqueue(battle, "하지만 버텨냈다!", "dmg_but_it_refused_collector");
      } else if (defPokemon.hasAugment?.("butItRefused") && !defPokemon.agument?.butItRefusedUsed) {
        defPokemon.hp = Math.max(1, defPokemon.hp);
        if (defPokemon.turn) defPokemon.turn.butItRefused = true;
        if (defPokemon.agument) defPokemon.agument.butItRefusedUsed = true;
        enqueue(battle, "하지만 버텨냈다!", "dmg_but_it_refused_collector");
      } else {
        executedByCollector = true;
        defPokemon.hp = 0;
        enqueue(battle, `[증강 징수의 총] ${defPokemon.names("는")} 처형당했다!`, "dmg_collector");
      }
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
      enqueue(battle, "일격필살!", "dmg_ohko");
    }
    if (serialAttackObject) {
      if (typeText) {
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
    if (!isConfuseSelfHit && !defPokemon.faint && defPokemon.team === "npc" && battle?.turn?.atk === "player" && !atkPokemon.faint && atkPokemon.turn) {
      atkPokemon.turn.knockedOutNpcThisTurn = true;
    }

    defPokemon.handleFaint(battle, enqueue);

    // 자기과신
    if (atkPokemon.abil?.feature?.swip) {
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
  }

  if (!isConfuseSelfHit) {
    applyOnHitEvents(battle, enqueue, false, talTrigger);
    // 혼란 자해는 피격 이벤트가 발생하지 않음 (풍선도 안 터짐)
  }
}
