import { damageCalculate } from "../util/damageCalculate";
import { typeCheckText, typeCheckAbil } from "../util/typeCheck";
import { attackDamage } from "../function/damage";
import { applySkillEffects, applySkillEffectSerial } from "./skiiEffect";
import { beforeSkillCheck, afterSkillCheck, beforeTurnPass } from "./skillCheck";
import { rank } from "../function/rankStat";
import { random } from "../util/randomCheck";

export const skillUse = (bt, enqueue) => {
  const skillNumber = bt.turn.atkSN;
  const skKey = `sk${skillNumber}`;
  const atk = bt[bt.turn.atk];
  const def = bt[bt.turn.def];
  const sk = atk.origin[skKey];
  const skillType = sk.stype;

  if (beforeSkillCheck(bt, enqueue) === false) {
    // 스킬명이 뜨기 전에 처리하는 트리거
    // 아직 스킬을 사용하지 않았으므로 pp가 소모되지 않는다
    // 풀죽음, 마비, 혼란, 잠듦, 선도발
    handleSkillFail(bt);
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
    // 상대방이 기절해서 스킬 실패해도 고정됨
  }

  // 스킬 사용 텍스트
  const skillUseText = atk.name + "의 " + sk.name + "!";
  enqueue({ battle: bt, text: skillUseText });

  //충전 기술
  // 충전 후 리베로가 발동된다
  if (sk.feature.charge) {
    if (atk.charge) {
      //이미 충전을 한 경우 그냥 지나간다
      atk.charge = null;
      atk.autoSN = null;
    } else {
      const chargeObj = sk.feature.charge;
      enqueue({ battle: bt, text: atk[chargeObj.head] + sk.feature.charge.text });
      // 충전 텍스트 (ex:"제르네아스는 파워를 모으고 있다!", "텅비드에게서 우주의 힘이 넘쳐난다!")

      if (chargeObj.rankUpStat) {
        atk.rankUp(bt, enqueue, chargeObj.rankUpStat, 1);
      }

      if (atk.item === "파워풀허브") {
        atk.item = null;
        enqueue({ battle: bt, text: atk.name + "은 파워풀허브로 힘이 넘쳐흐른다!" });
        enqueue({ battle: bt, text: skillUseText }); // 스킬 텍스트 2번 뜨는게 맞음
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
      atk.temp.jumpKickFail = true;
      const typeText = bt[bt.turn.def].name + "에겐 효과가 없는 것 같다...";
      enqueue({ battle: bt, text: typeText });
      handleSkillFail(bt);
      return;
    }
    // 무효면 부가효과 안터지므로 리턴
    // 리베로는 발동된다

    //연속기
    if (sk.feature?.serial) {
      let num = 9999999;
      if (sk.feature?.twoFive) {
        //2~5회 공격. 확률은 35 35 15 15
        num = randomTwoFive(bt, atk.item);
      } else if (sk.feature?.suru) {
        //수류연타는 3회 고정
        num = 3;
      } else if (sk.feature?.triple) {
        //최대 3회 공격. 본인 명중률에 따라 결정
        num = randomTripple(bt, atk.item, sk.accur);
      }
      for (let i = 1; i <= num; i++) {
        skillDamage = damageCalculate(bt, { serial: i }); // 트리플악셀 위력 재계산
        attackDamage(bt, skillDamage, bt.turn.def, enqueue, null, { num: i, first: i === 1, last: i === num });
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
    // 대타출동으로 막을 수 없는 상대방 대상 변화기 (natk)
    // 트릭, 하품, 뽐내기, 전기자석파, 씨뿌리기 등은 실패한다

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

const randomTwoFive = (battle, item) => {
  const r = Math.random() * 100; // 0 ~ 99.999...

  if (battle[battle.turn.atk].abil === "스킬링크") {
    return 5;
  }

  if (item === "속임수주사위") {
    // 최소 4타 보정
    // 첫 공격은 빗나갈 수 있음
    if (r < 85) return 4; // 70 ~ 84.999 (85%)
    else return 5; // 85 ~ 99.999 (15%) -> 5회 확률은 정확히 모르겠음
  }

  if (r < 35) return 2; // 0 ~ 34.999 (35%)
  else if (r < 70) return 3; // 35 ~ 69.999 (35%)
  else if (r < 85) return 4; // 70 ~ 84.999 (15%)
  else return 5; // 85 ~ 99.999 (15%)
};

const randomTripple = (battle, item, accur) => {
  if (!random(accur)) return 1; // 이미 앞에서 명중 한번 체크 했으므로 최소 1 리턴
  if (!random(accur)) return 2;
  return 3;
};
