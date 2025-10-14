import { damageCalculate } from "../util/damageCalculate";
import { typeCheck, typeCheckText, typeCheckAbil } from "../util/typeCheck";
import { damage, attackDamage } from "../function/damage";
import { applySkillEffects, applySkillEffectSerial } from "./skiiEffect";
import { beforeSkillCheck, afterSkillCheck, beforeTurnPass } from "./skillCheck";

export const skillUse = (bt, enqueue) => {
  const skillNumber = bt.turn.atkSN;
  const skKey = `sk${skillNumber}`;
  const atk = bt[bt.turn.atk];
  const def = bt[bt.turn.def];
  const sk = atk.origin[skKey];
  const skillType = sk.stype;

  if (beforeSkillCheck(bt, enqueue) === false) {
    // 스킬명이 뜨기 전에 처리하는 트리거
    //풀죽음, 마비, 혼란, 잠듦, 선도발
    handleAutoFail(bt);
    return;
  }

  // pp 처리
  const ppKey = `pp${skillNumber}`;
  atk[ppKey] -= 1;
  if (def.origin.abil === "프레셔" && atk[ppKey] > 0) {
    atk[ppKey] -= 1;
  }

  // 구애 스킬 고정 처리
  if (atk.item === "구애스카프" || atk.item === "구애머리띠" || atk.item === "구애안경") {
    atk.tempStatus.onlySkill = sk.name;
  }

  // 스킬 사용 텍스트
  const skillUseText = atk.name + "의 " + sk.name + "!";
  enqueue({ battle: bt, text: skillUseText });

  if (afterSkillCheck(bt, enqueue) === false) {
    // 스킬명이 뜬 다음에 처리하는 트리거
    // 사용조건체크(ex 기습), 상대방 기절 여부, 명중, 방어
    // 리베로는 실패해도 발동되기에 타이밍상 여기

    handleAutoFail(bt);
    return;
  }
  //=================================================================================================================

  if (skillType === "atk" || skillType === "catk") {
    //공격기 (물리 or 특수)

    let cri = atk.tempStatus.rank.critical;
    for (const effect of sk.skillEffectList) {
      if (effect.name === "급소") {
        //급소에 맞기쉽다 보정 처리
        cri += 1;
      }
    }
    // 급소 여부 계산
    if (criticalRate(cri)) {
      atk.temp.critical = true;
    }
    // 급소확정
    if (sk.feature?.mustCritical) {
      atk.temp.critical = true;
    }
    // 크리티컬은 데미지 계산 전에만 처리하면 되긴 한데
    // 공격기에만 터지므로 일단 여기 넣음

    let skillDamage = damageCalculate(bt);
    let typeDamage = typeCheckAbil(bt, sk.type, def.type1, def.type2);
    // 0배 여부 체크, "효과가 굉장했다!"" 텍스트 처리에만 사용
    // 상성 관련 데미지 계산은 damageCalculate 안에서 처리
    let typeText = typeCheckText(typeDamage);

    if (typeDamage === 0) {
      atk.temp.miss = true;
      const typeText = bt[bt.turn.def].name + "에겐 효과가 없는 것 같다...";
      enqueue({ battle: bt, text: typeText });
      handleAutoFail(bt);
      return;
    }
    //무효면 부가효과 안터지므로 리턴

    //연속기
    if (sk.feature?.twoFive || sk.feature?.suru) {
      let num = randomTwoFive();
      //2~5회 공격. 확률은 35 35 15 15
      if (sk.feature?.suru) {
        //수류연타는 3회 고정
        num = 3;
      }
      for (let i = 1; i <= num; i++) {
        attackDamage(bt, skillDamage, bt.turn.def, enqueue, null, { num: i, first: i === 1, last: i === num });
        if (i !== num) {
          applySkillEffectSerial(bt, enqueue, [{ name: "연격" }]);
          // 매 타격마다 발생하는 이벤트 모음 -> 철가시, 울맷, 정전기
          // 마지막 타격에만 터지는 효과가 존재하므로 마지막은 따로 적용 (ex: 생구 반동)
        }
        if (def.faint) {
          break;
          // 상대 기절하면 연속기 종료
        }
      }
    } else {
      attackDamage(bt, skillDamage, bt.turn.def, enqueue, typeText);
    }

    applySkillEffects(bt, enqueue, sk.skillEffectList);
    if (sk.feature?.twoFive || sk.feature?.suru) {
      if (typeText) {
        // 연속기의 경우 상성 텍스트는 맨 마지막에
        enqueue({ battle: bt, text: typeText });
      }
    }
  } else if (skillType === "natk") {
    // 상대방 지정 변화기
    // ex: 전기자석파, 트릭, 하품
    // 변화기 중 방어에 막히는거, 상대방 기절했을때 안써지는거

    const natkTypeCheckSkills = ["전기자석파"];
    // 변화기는 타입 상성의 영향을 받지 않는다
    // 근데 전기자석파는 제외
    // 뱀눈초리는 고소트한테 들어가는게 맞음
    let typeDamage = typeCheckAbil(bt, sk.type, def.type1, def.type2);
    if (typeDamage === 0 && natkTypeCheckSkills.includes(sk.name)) {
      const typeText = bt[bt.turn.def].name + "에겐 효과가 없는 것 같다...";
      enqueue({ battle: bt, text: typeText });
      return;
    }
    const noSubstitueSkills = ["앵콜", "도발", "저주", "흑안개", "날려버리기"];
    // 대타출동으로 막을 수 없는 스킬
    // 트릭, 하품, 전기자석파 등은 실패한다

    if (!noSubstitueSkills.includes(sk.name) && bt[bt.turn.def].tempStatus.substitute) {
      enqueue({ battle: bt, text: "하지만 실패했다!" });
      return;
    }

    applySkillEffects(bt, enqueue, sk.skillEffectList);
  } else if (skillType === "buf") {
    // 자기 자신 대상 변화기 (ex: 칼춤, 방어)
    applySkillEffects(bt, enqueue, sk.skillEffectList);
  } else {
    console.error("스킬타입오류");
  }
};

const criticalRate = (input) => {
  let probability = 0;
  if (input !== 0 && input !== 1 && input !== 2 && input !== 3) {
    console.error("급소율 에러 확인 필요");
  }

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
      return true;
  }

  return Math.random() < probability;
};

const handleAutoFail = (bt) => {
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

const randomTwoFive = () => {
  const r = Math.random() * 100; // 0 ~ 99.999...

  if (r < 35) return 2; // 0 ~ 34.999 (35%)
  else if (r < 70) return 3; // 35 ~ 69.999 (35%)
  else if (r < 85) return 4; // 70 ~ 84.999 (15%)
  else return 5; // 85 ~ 99.999 (15%)
};
