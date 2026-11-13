import { damageCalculate } from "../calc/damageCalculate";
import { getTypeText, typeCheckOnBattle } from "../calc/typeEffectCalculate";
import { attackDamage } from "./damage";
import skillEffectSearch from "../entity/Skill/SkillEffect";
import { beforeSkillCheck, afterSkillCheck } from "./skillCheck";
import { random } from "../util/randomCheck";
import { getAccuracy } from "../calc/accuracyCalculate";
import { skillTypeCalculate } from "../calc/skillTypeCalculate";

export const skillUse = (bt, enqueue) => {
  const skillNumber = bt.turn.atkSN;
  const atk = bt[bt.turn.atk];
  const def = bt[bt.turn.def];
  let skill = atk.turn.useSkill;
  const calculatedType = skillTypeCalculate(bt, skill, atk);
  if (skill && skill.type !== calculatedType) {
    skill = { ...skill, type: calculatedType };
    atk.turn.useSkill = skill;
  }
  const skillType = skill.stype;

  let effectsApplied = false;

  try {
    if (beforeSkillCheck(bt, enqueue) === false) {
      // 스킬명이 뜨기 전에 처리하는 트리거
      // 아직 스킬을 사용하지 않았으므로 pp가 소모되지 않는다
      // 풀죽음, 마비, 혼란, 잠듦, 선도발
      handleSkillFail(bt);
      return;
    }

    // pp 및 구애 고정 처리 (발버둥은 PP 무제한, 충전 2턴째 발사 시 중복 차감 방지)
    if (!atk.charge && skill.name !== "발버둥") {
      atk.pp[skillNumber] -= 1;
      if (def.abil === "프레셔" && atk.pp[skillNumber] > 0) {
        atk.pp[skillNumber] -= 1;
      }
    }

    // 구애 스킬 고정 처리 (구애 시리즈 또는 무아지경)
    const hasUnbound = atk.hasAugment?.("unboundChoice");
    const isChoiceItem = (atk.item === "구애스카프" || atk.item === "구애머리띠" || atk.item === "구애안경") && !hasUnbound;
    const isGorillaTactics = atk.abil === "무아지경" && !hasUnbound;

    if (!atk.charge && (isChoiceItem || isGorillaTactics) && skill.name !== "발버둥") {
      atk.tempStatus.onlySkill = skill.name;
      // 상대방이 기절해서 스킬 실패해도 고정됨
    }

    // 스킬 사용 텍스트
    const skillUseText = atk.name + "의 " + skill.name + "!";
    enqueue({ id: "33cefe63-14a3-45d9-8775-a903464ee681", battle: bt, text: skillUseText });

    //충전 기술
    // 충전 후 리베로가 발동된다
    if (skill.feature.charge) {
      if (atk.charge) {
        //이미 충전을 한 경우 그냥 지나간다
        atk.charge = null;
        atk.autoSN = null;
      } else {
        const chargeObj = skill.feature.charge;
        enqueue({ id: "d55115e1-460f-4120-bdcc-fdee3157b69c", battle: bt, text: atk[chargeObj.head] + skill.feature.charge.text });
        // 충전 텍스트 (ex:"제르네아스는 파워를 모으고 있다!", "텅비드에게서 우주의 힘이 넘쳐난다!")

        if (chargeObj.rankUpStat) {
          // 랭크업이 있는 충전기술일 경우 (ex:메테오빔)
          atk.rankUp(bt, enqueue, chargeObj.rankUpStat, 1);
        }

        // 날씨에 따른 충전 스킵 *솔라빔, 일렉트로빔)
        const isWeatherSkip = (chargeObj.weatherSkip === "sunny" && bt.field.weather.isSunny) || (chargeObj.weatherSkip === "rain" && bt.field.weather.isRainy);

        if (isWeatherSkip) {
          enqueue({ id: "2eadbf55-e934-439a-bb56-133d4f6d4022", battle: bt, text: skillUseText }); // 스킬 텍스트 2번 뜨는게 맞음
        } else if (atk.item === "파워풀허브") {
          atk.item = null;
          enqueue({ id: "5584b7a1-3115-45f1-8b80-9597bed46fd3", battle: bt, text: `${atk.names} 파워풀허브로 힘이 넘쳐흐른다!` });
          enqueue({ id: "b3212fe0-7e8a-4302-8dfe-a239852d0f6f", battle: bt, text: skillUseText }); // 스킬 텍스트 2번 뜨는게 맞음
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

      let cri = atk.tempStatus.rank.critical;
      for (const effect of skill.skillEffectList) {
        if (effect.name === "급소") {
          //급소에 맞기쉽다 보정 처리
          cri += 1;
        }
      }

      let typeDamage = typeCheckOnBattle(bt, skill.type, def.type1, def.type2);
      // 0배 여부 체크, "효과가 굉장했다!"" 텍스트 처리에만 사용
      // 상성 관련 데미지 계산은 damageCalculate 안에서 처리
      let typeText = getTypeText(typeDamage);

      if (typeDamage === 0) {
        atk.turn.jumpKickFail = true;
        const typeText = bt[bt.turn.def].name + "에겐 효과가 없는 것 같다...";
        enqueue({ id: "5a41d8cb-8cce-486e-b039-86d554a09793", battle: bt, text: typeText });
        handleSkillFail(bt);
        return;
      }
      // 무효면 부가효과 안터지므로 리턴
      // 리베로는 발동된다

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
          if (criticalRate(cri, atk)) {
            atk.turn.critical = true;
          }
          // 급소확정
          if (skill.feature?.mustCritical) {
            atk.turn.critical = true;
          }
          let skillDamage = damageCalculate(bt, { serial: i }); // 트리플악셀 위력 재계산
          attackDamage(bt, skillDamage, bt.turn.def, enqueue, null, { num: i, first: i === 1, last: i === num });
          if (def.faint) {
            break;
            // 상대 기절하면 연속기 종료
          }
          const onHitEffects = skill.skillEffectList.filter((effect) => serialOnHitSkillEffect.includes(effect.name));
          applySkillEffects(bt, enqueue, onHitEffects);
        }
        // 그 외에 부가효과 마지막 1회에만 적용
        const afterSerialEffects = skill.skillEffectList.filter((effect) => !serialOnHitSkillEffect.includes(effect.name));
        applySkillEffects(bt, enqueue, afterSerialEffects);
        effectsApplied = true;
        if (typeText) {
          // 연속기의 경우 상성 텍스트는 맨 마지막에 한번만 출력
          enqueue({ id: "d30232f7-cc22-4c55-895c-189dd64bf709", battle: bt, text: typeText });
        }
      } else {
        // 연속기 아닌 경우
        atk.turn.critical = null;
        // 급소 여부 계산
        if (criticalRate(cri, atk)) {
          atk.turn.critical = true;
        }
        // 급소확정
        if (skill.feature?.mustCritical) {
          atk.turn.critical = true;
        }
        let skillDamage = damageCalculate(bt);
        attackDamage(bt, skillDamage, bt.turn.def, enqueue, typeText);
        applySkillEffects(bt, enqueue, skill.skillEffectList);
        effectsApplied = true;
      }
    } else if (skillType === "natk") {
      // 상대방 지정 변화기
      // ex: 전기자석파, 트릭, 하품
      // 변화기 중 방어에 막히는거, 상대방 기절했을때 안써지는거

      if (skill.name === "전기자석파" && (def.type1 === "땅" || def.type2 === "땅")) {
        // 변화기는 타입 상성의 영향을 받지 않는다
        // 근데 전기자석파는 제외
        // 뱀눈초리는 고스트 타입한테 정상적으로 들어감
        const typeText = bt[bt.turn.def].name + "에겐 효과가 없는 것 같다...";
        enqueue({ id: "a1bfc639-8664-4816-8def-a72d936f1b42", battle: bt, text: typeText });
        return;
      }

      if (skill.feature?.powder && (def.type1 === "풀" || def.type2 === "풀" || def.abil === "방진")) {
        // 풀 타입 포켓몬과 방진 특성은 가루 기술 무효
        const typeText = bt[bt.turn.def].name + "에겐 효과가 없는 것 같다...";
        enqueue({ id: "f5bb2e94-9dd0-4041-80c1-ea0488f02f9b", battle: bt, text: typeText });
        return;
      }

      const noSubstituteSkills = ["가드스왑", "날려버리기", "냄새구별", "도발", "멸망의노래", "미라클아이", "봉인", "사슬묶기", "스킬스왑", "앙코르", "역할", "울부짖기", "원념", "원한", "자기암시", "저주", "트집", "하트스왑", "헤롱헤롱", "흑안개"];
      // 대타출동으로 막을 수 없는 상대방 대상 변화기 (natk)
      // 트릭, 하품, 뽐내기, 전기자석파, 씨뿌리기 등은 실패한다

      if (bt[bt.turn.def].tempStatus.substitute) {
        if (noSubstituteSkills.includes(skill.name) || skill.feature.sound || bt[bt.turn.atk].abil === "틈새포착") {
          // 소리 변화기 및 틈새포착 사용자의 변화기는 대타를 뚫는다 ex) 막말내뱉기
        } else {
          enqueue({ id: "942dc7a3-e0d0-4632-80ce-f9a095e38272", battle: bt, text: "하지만 실패했다!" });
          return;
        }
      }

      applySkillEffects(bt, enqueue, skill.skillEffectList);
      effectsApplied = true;
    } else if (skillType === "buf") {
      // 자기 자신 대상 변화기 (ex: 칼춤, 방어)
      applySkillEffects(bt, enqueue, skill.skillEffectList);
      effectsApplied = true;
    } else {
      console.error("스킬타입오류");
    }
  } finally {
    // 기술이 실제로 발동 시전된 뒤(방어/무효/빗나감으로 조기 종료한 경우)에만 1회 실행
    // (정상 명중 시에는 applySkillEffects 내부에서 순서대로 이미 실행됨)
    if (atk.turn.skillLaunched && !effectsApplied) {
      applyAfterSkillEffects(bt, enqueue);
    }
  }
};

const criticalRate = (input, pokemon = null) => {
  let probability = 0;
  switch (input) {
    case 0:
      probability = 1 / 24;
      break;
    case 1:
      probability = 1 / 8;
      break;
    case 2:
      probability = 1 / 2;
      break;
    default:
      probability = 1;
      break;
  }

  // 증강 무한의 대검
  if (pokemon?.hasAugment?.("infinityEdge")) {
    probability += 0.25;
  }

  // 버프 연습이 치명타를 낳는다: 스택당 급소 확률 1% 상승
  if (pokemon?.hasAugment?.("practiceMakesCritical")) {
    const practiceAug = pokemon.augments?.find((a) => a.id === "practiceMakesCritical");
    const stack = Number(pokemon.practiceCritStack ?? practiceAug?.practiceCritStack ?? 0);
    if (stack > 0) {
      probability += stack * 0.01;
    }
  }

  if (probability >= 1) return true;
  return Math.random() < probability;
};

const handleSkillFail = (bt) => {
  // 스킬 실패시 처리할 것

  // 역린 정지
  const atk = bt[bt.turn.atk];
  if (atk.auto !== null) {
    if (atk.auto > 1) {
      atk.auto = null;
      atk.autoSN = null;
      // 3턴 역린이 2번째에 끊긴 경우 혼란이 적용되지 않는다
    }
    // 역린이 마지막턴에 끊긴 경우 혼란이 적용된다
  }
};

export const randomTwoFive = (battle, item) => {
  // 2~5회 연속기
  // 기술의 명중여부, 반감열매에 대한 데미지 감소량 계산은 첫 타격에만 계산
  // 참기나 카운터의 반사 데미지 계산은 마지막 타격에만 계산
  // 급소 명중 여부, 부가효과 발생 여부 (왕의징표석, 예리한이빨에 의한 효과 포함)는 매 타격 전부 계산
  // 부가효과는 attackDamage 안에 applyOnHitEvents에서 처리
  const r = Math.random() * 100; // 0 ~ 99.999...

  if (battle[battle.turn.atk].abil === "스킬링크") {
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

export const randomTriple = (battle, item, accur) => {
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

export const applySkillEffects = (bt, enqueue, skillEffectList = bt[bt.turn.atk].turn.useSkill?.skillEffectList) => {
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
