import { damageCalculate } from "../util/damageCalculate";
import { typeCheck, typeCheckText, typeCheckAbil } from "../util/typeCheck";
import { damage } from "../function/damage";
import { applySkillEffects } from "./skiiEffect";
import { skillUseCheck, skillFailCheck } from "./skillCheck";

export const skillUse = (bt, enqueue) => {
  const skillNumber = bt.turn.atkSN;
  const ppKey = `pp${skillNumber}`;
  const skKey = `sk${skillNumber}`;
  const atk = bt[bt.turn.atk];
  const def = bt[bt.turn.def];
  const sk = atk.origin[skKey];
  const skillType = bt[bt.turn.atk].origin["sk" + bt.turn.atkSN].stype;

  if (skillUseCheck(bt, enqueue) === false) {
    // 스킬명이 뜨기 전에 처리하는 트리거
    // 풀죽음 마비 혼란
    return;
  }

  const skillUseText = atk.name + "의 " + sk.name + "!";
  atk[ppKey] -= 1;
  if (def.origin.abil === "프레셔" && atk[ppKey] > 0) {
    atk[ppKey] -= 1;
  }
  if (
    atk.item === "구애스카프" ||
    atk.item === "구애머리띠" ||
    atk.item === "구애안경"
  ) {
    atk.tempStatus.onlySkill = sk.name;
  }
  enqueue({ battle: bt, text: skillUseText });

  if (skillFailCheck(bt, enqueue) === false) {
    // 스킬명이 뜬 다음에 처리하는 트리거
    // 사용조건체크(ex 기습), 상대방 기절 여부, 명중
    // 리베로는 실패해도 발동되기에 타이밍상 여기
    return;
  }

  if (skillType === "atk" || skillType === "catk") {
    //공격기 (물리 or 특수)

    let cri = atk.tempStatus.rank.critical;
    for (const effect of sk.skillEffectList) {
      if (effect.name === "급소") {
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
    let typeText = typeCheckText(typeDamage);

    if (typeDamage === 0) {
      atk.temp.miss = true;
      const typeText = bt[bt.turn.def].name + "에겐 효과가 없는 것 같다...";
      enqueue({ battle: bt, text: typeText });
      return;
    }
    //무효면 부가효과 안터지므로 리턴

    if (def.abil === "탈") {
      if (skillDamage > def.origin.hp / 8) {
        skillDamage = def.origin.hp / 8;
      }
      def.abil = "탈 (사용됨)";
      def.origin.abil = "탈 (사용됨)";
      enqueue({ battle: bt, text: "탈이 대타가 되었다!" });
    }
    // 탈은 상성 0배인지 확인 후 데미지 들어가기 전에 처리해야하므로 타이밍상 여기

    damage(bt, skillDamage, bt.turn.def, enqueue, typeText);
  } else if (skillType === "natk") {
    // 도깨비불 같은 상대방 지정 변화기
    let typeDamage = typeCheckAbil(bt, sk.type, def.type1, def.type2);
    if (typeDamage === 0) {
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
