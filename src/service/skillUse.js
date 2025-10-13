import { damageCalculate } from "../util/damageCalculate";
import { typeCheck, typeCheckText, typeCheckAbil } from "../util/typeCheck";
import { damage, attackDamage } from "../function/damage";
import { applySkillEffects } from "./skiiEffect";
import { beforeSkillCheck, afterSkillCheck } from "./skillCheck";

export const skillUse = (bt, enqueue) => {
  const skillNumber = bt.turn.atkSN;
  const ppKey = `pp${skillNumber}`;
  const skKey = `sk${skillNumber}`;
  const atk = bt[bt.turn.atk];
  const def = bt[bt.turn.def];
  const sk = atk.origin[skKey];
  const skillType = bt[bt.turn.atk].origin["sk" + bt.turn.atkSN].stype;

  if (beforeSkillCheck(bt, enqueue) === false) {
    // 스킬명이 뜨기 전에 처리하는 트리거
    //풀죽음, 마비, 혼란, 잠듦, 도발
    return;
  }

  const skillUseText = atk.name + "의 " + sk.name + "!";
  atk[ppKey] -= 1;
  if (def.origin.abil === "프레셔" && atk[ppKey] > 0) {
    atk[ppKey] -= 1;
  }
  if (atk.item === "구애스카프" || atk.item === "구애머리띠" || atk.item === "구애안경") {
    atk.tempStatus.onlySkill = sk.name;
  }
  enqueue({ battle: bt, text: skillUseText });

  if (afterSkillCheck(bt, enqueue) === false) {
    // 스킬명이 뜬 다음에 처리하는 트리거
    // 사용조건체크(ex 기습), 상대방 기절 여부, 명중
    // 리베로는 실패해도 발동되기에 타이밍상 여기
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
    if (criticalRate(cri)) {
      atk.temp.critical = true;
    }
    // 크리티컬은 데미지 계산 전에만 처리하면 되긴 한데
    // 공격기에만 터지므로 일단 여기 넣음

    let skillDamage = damageCalculate(bt);
    let typeDamage = typeCheckAbil(bt, sk.type, def.type1, def.type2);
    // 0배 여부 체크, 효과가 굉장했다! 텍스트 처리에만 사용
    //상성 관련 데미지 계산은 damageCalculate 안에서 처리
    let typeText = typeCheckText(typeDamage);

    if (typeDamage === 0) {
      atk.temp.miss = true;
      const typeText = bt[bt.turn.def].name + "에겐 효과가 없는 것 같다...";
      enqueue({ battle: bt, text: typeText });
      return;
    }
    //무효면 부가효과 안터지므로 리턴

    attackDamage(bt, skillDamage, bt.turn.def, enqueue, typeText);

    if (sk.feature.oneShot) {
      //일격기 성공 텍스트
      enqueue({ battle: bt, text: "일격필살!" });
    }
  } else if (skillType === "natk") {
    // 도깨비불 같은 상대방 지정 변화기
    // 변화기 중 방어에 막히는거, 상대방 기절했을때 안써지는거

    const natkTypeCheckSkills = ["전기자석파"];
    // 변화기는 타입 상성의 영향을 받지 않는다
    // 근데 전기자석파는 제외
    let typeDamage = typeCheckAbil(bt, sk.type, def.type1, def.type2);
    if (typeDamage === 0 && natkTypeCheckSkills.includes(sk.name)) {
      const typeText = bt[bt.turn.def].name + "에겐 효과가 없는 것 같다...";
      enqueue({ battle: bt, text: typeText });
      return;
    }
  }

  applySkillEffects(bt, enqueue, sk.skillEffectList);
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
