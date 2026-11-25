import { getPokemonCombatStats, getHigherAtkStat } from "../calc/damageCalculate";
import { attackDamage } from "./damage/damage";
import skillEffectSearch from "../entity/Skill/SkillEffect";
import { beforeSkillCheck, afterSkillCheck } from "./skillCheck/skillCheck";
import { random } from "../util/randomCheck";
import { getAccuracy } from "../calc/accuracyCalculate";
import { skillTypeCalculate } from "../calc/skillTypeCalculate";
import { criticalCalculate } from "../calc/criticalCalculate";
import { josa } from "josa";

export const skillUse = (bt, enqueue) => {
  const skillNumber = bt.turn.atkSN;
  const atk = bt[bt.turn.atk];
  const def = bt[bt.turn.def];
  let skill = atk.turn.useSkill;
  const calculatedType = skillTypeCalculate(bt, skill, atk);
  // 기술 타입이 바뀌는 경우 (웨더볼, 스킨류 특성)
  if (skill && skill.type !== calculatedType) {
    skill = { ...skill, type: calculatedType };
    atk.turn.useSkill = skill;
  }
  const isAdaptiveSkill = skill?.name === "테라버스트" || (atk?.hasAugment?.("lostTechnologyHyperBeam") && skill?.name === "파괴광선");
  if (isAdaptiveSkill) {
    const stats = getPokemonCombatStats(atk, bt);
    skill = { ...skill, stype: getHigherAtkStat(stats.atk, stats.catk) };
    atk.turn.useSkill = skill;
  }
  const skillType = skill.stype;

  let effectsApplied = false;

  try {
    if (beforeSkillCheck(bt, enqueue) === false) {
      // 스킬명이 뜨기 전에 처리하는 트리거
      // 아직 스킬을 사용하지 않았으므로 pp가 소모되지 않는다
      // 상태이상(잠듦/얼음/풀죽음/혼란/마비), 반동(파괴광선)으로 행동 불가 시 메트로놈 스택 유지
      handleSkillFail(bt, false);
      return;
    }

    // 다른 기술 사용 시 이전 연속 사용 스택 초기화
    if (atk.tempStatus.sameSkillName !== skill.name) {
      atk.resetConsecutiveSkill?.();
    }

    // pp 소모 (발버둥은 PP 무제한, 충전 2턴째 발사 시 중복 차감 방지)
    if (!atk.charge && skill.name !== "발버둥") {
      atk.pp[skillNumber] -= 1;
      if (def.abil?.name === "프레셔" && atk.pp[skillNumber] > 0) {
        atk.pp[skillNumber] -= 1;
      }
    }

    // 구애 스킬 고정 처리 (구애 시리즈 또는 무아지경)
    const hasUnbound = atk.hasAugment?.("unboundChoice");
    const isChoiceItem = (atk.item === "구애스카프" || atk.item === "구애머리띠" || atk.item === "구애안경") && !hasUnbound;
    const isGorillaTactics = atk.abil?.name === "무아지경" && !hasUnbound;

    if (!atk.charge && (isChoiceItem || isGorillaTactics) && skill.name !== "발버둥") {
      atk.tempStatus.onlySkill = skill.name;
      // 상대방이 기절해서 스킬 실패해도 고정됨
    }

    // 스킬 사용 텍스트
    const skillUseText = atk.name + "의 " + skill.name + "!";
    enqueue(bt, skillUseText, "use_skill");

    //충전 기술
    // 충전 후 리베로가 발동된다
    if (skill.feature?.charge) {
      if (atk.charge) {
        //이미 충전을 한 경우 그냥 지나간다
        atk.charge = null;
        atk.autoSN = null;
      } else {
        const chargeObj = skill.feature.charge;
        enqueue(bt, (chargeObj.head === "names" ? atk.names("는") : atk.name) + skill.feature.charge.text, "use_charge");
        // 충전 텍스트 (ex:"제르네아스는 파워를 모으고 있다!", "텅비드에게서 우주의 힘이 넘쳐난다!")

        if (chargeObj.rankUpStat) {
          // 랭크업이 있는 충전기술일 경우 (ex:메테오빔)
          atk.rankUp(bt, enqueue, chargeObj.rankUpStat, 1);
        }

        // 날씨에 따른 충전 스킵 *솔라빔, 일렉트로빔)
        const isWeatherSkip = (chargeObj.weatherSkip === "sunny" && bt.isSunny) || (chargeObj.weatherSkip === "rain" && bt.isRainy);

        if (isWeatherSkip) {
          enqueue(bt, skillUseText, "use_charge_weather"); // 스킬 텍스트 2번 뜨는게 맞음
        } else if (atk.item === "파워풀허브") {
          atk.consumeItem();
          enqueue(bt, `${atk.names("는")} 파워풀허브로 힘이 넘쳐흐른다!`, "use_power_herb");
          enqueue(bt, skillUseText, "use_charge_herb"); // 스킬 텍스트 2번 뜨는게 맞음
        } else {
          atk.charge = true;
          atk.autoSN = skillNumber;
          return;
        }
      }
    }

    if (afterSkillCheck(bt, enqueue) === false) {
      // 스킬명이 뜬 다음에 처리하는 트리거
      // 스킬에 실패하더라고 pp는 닳는다
      // 스킬성공여부(기습, 방어), 상대방 기절 여부, 명중, 방어, 타오르는불꽃, 풍선
      // 리베로가 발동되는 조건이 있고 아닌 조건이 있어 중간에 삽입
      handleSkillFail(bt);
      return;
    }
    //=================================================================================================================

    if (skillType === "atk" || skillType === "catk") {
      //공격기 (물리 or 특수)

      // [버프] 연습이 치명타를 낳는다: 공격 시마다 스택 1 누적
      if (atk.hasAugment?.("practiceMakesCritical")) {
        const practiceAug = atk.augments?.find((a) => a.id === "practiceMakesCritical");
        const nextStack = Number(atk.practiceCritStack ?? practiceAug?.practiceCritStack ?? 0) + 1;
        atk.practiceCritStack = nextStack;
        if (practiceAug) {
          practiceAug.practiceCritStack = nextStack;
        }
      }

      // [증강] 한놈만: 맨 처음 공격한 상대 기록
      if (atk.hasAugment("focusOne") && !atk.focusOneTarget) {
        atk.focusOneTarget = def.baseName;
      }

      let cri = atk.tempStatus.rank.critical;
      for (const effect of skill.skillEffectList) {
        if (effect.name === "급소") {
          //급소에 맞기쉽다 보정 처리
          cri += 1;
        }
      }

      if (skill.name === "폴터가이스트") {
        enqueue(bt, josa(`${def.item}#{이}`) + ` ${def.name}에게 덤벼들었다!`, "use_poltergeist");
      }

      // [특성 내용물분출] 공격 받기 전 체력 기록 (연속기는 1타 시작 전 체력)
      if (def.turn) {
        def.turn.hpBeforeAttack = def.hp;
      }

      //연속기
      if (skill.feature?.serial) {
        let num = 9999999; // 연속기 공격 횟수
        const serialType = skill.feature.serial;
        if (serialType === "twoFive") {
          //2~5회 공격. 확률은 35 35 15 15
          num = randomTwoFive(bt, atk.item);
        } else if (serialType === "suru") {
          // 수류연타 3회 고정
          num = 3;
        } else if (serialType === "double") {
          num = 2;
        } else if (serialType === "triple") {
          //최대 3회 공격. 본인 명중률에 따라 결정 (트리플악셀)
          num = randomTriple(bt, atk.item, getAccuracy(bt, skill, atk));
        }
        if (num === 9999999) {
          console.error("연속기 횟수 에러");
        }

        const serialOnHitSkillEffect = ["풀죽음"]; // 연속기의 매 타격마다 부여되는 부가효과
        for (let i = 1; i <= num; i++) {
          atk.turn.critical = null;
          // 급소 여부 계산 (연속기는 매 타격마다 독립 판정)
          if (criticalCalculate(cri, atk)) {
            atk.turn.critical = true;
          }
          // 급소확정
          if (skill.feature?.mustCritical) {
            atk.turn.critical = true;
          }
          attackDamage(bt, enqueue, i);
          if (def.faint || atk.faint) {
            break;
            // 상대 또는 공격자 기절하면 연속기 종료
          }
          const onHitEffects = skill.skillEffectList.filter((effect) => serialOnHitSkillEffect.includes(effect.name));
          applySkillEffects(bt, enqueue, onHitEffects);
        }
        // 그 외에 부가효과 마지막 1회에만 적용 (공격자가 쓰러지지 않은 경우에만)
        if (!atk.faint) {
          const afterSerialEffects = skill.skillEffectList.filter((effect) => !serialOnHitSkillEffect.includes(effect.name));
          applySkillEffects(bt, enqueue, afterSerialEffects);
          effectsApplied = true;
        }
      } else {
        // 연속기 아닌 경우
        atk.turn.critical = null;
        // 급소 여부 계산
        if (criticalCalculate(cri, atk)) {
          atk.turn.critical = true;
        }
        // 급소확정
        if (skill.feature?.mustCritical) {
          atk.turn.critical = true;
        }
        attackDamage(bt, enqueue);
        if (!atk.faint) {
          applySkillEffects(bt, enqueue, skill.skillEffectList);
          effectsApplied = true;
        }
      }
    } else if (skillType === "natk") {
      // 상대방 지정 변화기 (모든 실패/명중 체크는 afterSkillCheck에서 이미 완료됨)
      applySkillEffects(bt, enqueue, skill.skillEffectList);
      effectsApplied = true;
    } else if (skillType === "buf") {
      // 자기 자신 대상 변화기 (ex: 칼춤, 방어)
      applySkillEffects(bt, enqueue, skill.skillEffectList);
      effectsApplied = true;
    } else {
      console.error("스킬타입오류");
    }

    // 기술 사용 성공: 연속 사용 횟수 증가 (도구 소지 여부와 관계없이 누적)
    atk.recordConsecutiveSkill?.(skill.name);
  } finally {
    // 기술이 실제로 발동 시전된 뒤(방어/무효/빗나감으로 조기 종료한 경우)에만 1회 실행
    // (정상 명중 시에는 applySkillEffects 내부에서 순서대로 이미 실행됨)
    if (atk.turn.skillLaunched && !effectsApplied && !atk.faint) {
      applyAfterSkillEffects(bt, enqueue);
    }
  }
};

const handleSkillFail = (bt, resetMetronome = true) => {
  // 스킬 실패시 처리할 것
  const atk = bt[bt.turn.atk];
  if (atk?.tempStatus) {
    atk.tempStatus.protectUse = null;
  }
  if (resetMetronome && !atk?.hasAugment?.("doubleMetronome")) {
    atk.resetConsecutiveSkill?.();
  }

  // 역린 정지
  if (atk.auto !== null) {
    if (atk.auto > 1) {
      atk.auto = null;
      atk.autoSN = null;
      // 3턴 역린이 2번째에 끊긴 경우 혼란이 적용되지 않는다
    }
    // 역린이 마지막턴에 끊긴 경우 혼란이 적용된다
  }
};

const randomTwoFive = (battle, item) => {
  // 2~5회 연속기
  // 기술의 명중여부, 반감열매에 대한 데미지 감소량 계산은 첫 타격에만 계산
  // 참기나 카운터의 반사 데미지 계산은 마지막 타격에만 계산
  // 급소 명중 여부, 부가효과 발생 여부 (왕의징표석, 예리한이빨에 의한 효과 포함)는 매 타격 전부 계산
  // 부가효과는 attackDamage 안에 applyOnHitEvents에서 처리
  const r = Math.random() * 100; // 0 ~ 99.999...

  if (battle[battle.turn.atk].abil?.name === "스킬링크") {
    return 5;
  }

  if (item === "속임수주사위") {
    // 최소 4타 보정
    // 첫 공격은 빗나갈 수 있음
    if (r < 85)
      return 4; // 70 ~ 84.999 (85%)
    else return 5; // 85 ~ 99.999 (15%) -> 5회 확률은 정확히 모르겠음
  }

  if (r < 35)
    return 2; // 0 ~ 34.999 (35%)
  else if (r < 70)
    return 3; // 35 ~ 69.999 (35%)
  else if (r < 85)
    return 4; // 70 ~ 84.999 (15%)
  else return 5; // 85 ~ 99.999 (15%)
};

const randomTriple = (battle, item, accur) => {
  let finalAccur = accur;
  if (!random(finalAccur)) return 1; // 이미 앞에서 명중 한번 체크 했으므로 최소 1 리턴
  if (!random(finalAccur)) return 2;
  return 3;
};

const AFTER_EFFECT_NAMES = ["빗나감패널티", "자폭", "철제광선반동"];

const applyAfterSkillEffects = (bt, enqueue) => {
  // 기술이 실제로 발동 시전된 뒤 방어/무효/빗나감으로 조기 종료한 경우에만 실행
  // 무릎차기 빗나감, 자폭, 철제광선
  // 목숨걸기는 명중했을때만 쓰러짐
  const skillEffectList = bt[bt.turn.atk].turn.useSkill?.skillEffectList;
  if (skillEffectList && typeof skillEffectList[Symbol.iterator] === "function") {
    for (const skillEffect of skillEffectList) {
      if (AFTER_EFFECT_NAMES.includes(skillEffect?.name) && !bt[bt.turn.atk].faint) {
        const skillFunction = skillEffectSearch(skillEffect.name);
        if (typeof skillFunction === "function") {
          skillFunction(bt, enqueue, skillEffect);
        }
      }
    }
  }
};

const applySkillEffects = (bt, enqueue, skillEffectList = bt[bt.turn.atk].turn.useSkill?.skillEffectList) => {
  // 기술 내부에 존재하는 부가효과 함수 배열을 순회하며 부가효과 함수를 실행한다
  // 연속기의 경우 일부 부가효과만 적용되기에 전용 skillEffectList를 인자로 받는다

  if (skillEffectList && typeof skillEffectList[Symbol.iterator] === "function") {
    for (const skillEffect of skillEffectList) {
      if (skillEffect?.name) {
        const skillFunction = skillEffectSearch(skillEffect.name);
        if (typeof skillFunction === "function") {
          skillFunction(bt, enqueue, skillEffect);
        }
      }
    }
  }
};
