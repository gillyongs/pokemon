import { statCalculate } from "../function/statCalculate";
import { typeCheckAbil } from "./typeCheck";
import { getMultiplier } from "../function/statCalculate";
import { noNullItem } from "../entity/Item";

export const damageCalculate = (battle) => {
  //데미지 계산
  statCalculate(battle);
  const skillNumber = battle.turn.atkSN;
  const atk = battle[battle.turn.atk];
  const def = battle[battle.turn.def];
  const skillKey = `sk${skillNumber}`;
  const sk = atk.origin[skillKey]; // 시전 스킬

  let dtype = "";
  if (sk.stype === "atk") {
    dtype = "def";
  } else if (sk.stype === "catk") {
    dtype = "cdef";
  }

  let atkStat = atk[sk.stype];
  let defStat = def[dtype];
  for (const effect of sk.skillEffectList) {
    if (effect.name === "천진") {
      defStat *= getMultiplier(-def.tempStatus.rank[dtype]);
      // 사용자 랭크업을 무시하는 기술
      // 랭크 반영된 수치에 역계산을 한다
    }
  }

  let power = powerCalculate(battle, sk);
  // 위력이 바뀌는 기술은 여기서 처리
  // 그래스슬라이더, 해수스파우팅

  let damage = (22 * power * atkStat) / 50 / defStat;
  if (atk.status.burn != null && sk.stype === "atk") {
    damage /= 2;
  }
  const weather = battle.field.weather;
  if (weather === "비") {
    if (sk.type === "물") {
      damage *= 1.5;
    }
    if (sk.type === "불") {
      damage *= 0.5;
    }
  }
  const field = battle.field.field;
  if (field !== null) {
    if (atk.type1 !== "비행" && atk.type2 !== "비행" && atk.abil !== "부유") {
      if (field === "그래스필드" && sk.type === "풀") {
        damage *= 1.3;
      }
      if (field === "일렉트릭필드" && sk.type === "전기") {
        damage *= 1.3;
      }
    }
  }
  damage += 2;
  if (sk.type === atk.type1 || sk.type === atk.type2) {
    damage *= 1.5;
  }
  const typeDamege = typeCheckAbil(battle, sk.type, def.type1, def.type2);
  damage *= typeDamege;
  if (sk.name === "라이트닝드라이브") {
    if (typeDamege > 1) {
      damage = (damage * 4) / 3;
    }
  }

  if (atk.item === "생명의구슬") {
    damage *= 1.3;
  }
  if (atk.temp.critical) {
    damage *= 1.5;
  }

  const randomNum = getRandomNumber();
  damage = (damage * randomNum) / 100;
  return Math.floor(damage);
};

export const confuseDamageCalculate = (battle) => {
  //혼란 데미지 계산
  //자속보정, 타입 상성, 생구 적용 안됨
  //급소 적용 됨
  //화상 뎀감 적용되는지 모르겠음
  const pokemon = battle[battle.turn.atk];
  let damage = (22 * 40 * pokemon.atk) / 50 / pokemon.def;
  if (pokemon.status.burn != null) {
    damage /= 2;
  }
  damage += 2;
  if (pokemon.temp.critical) {
    damage *= 1.5;
  }
  const randomNum = getRandomNumber();
  damage = (damage * randomNum) / 100;
  return Math.floor(damage);
};

const getRandomNumber = () => {
  // 데미지 보정 난수
  const numbers = [
    { num: 85, prob: 7.69 },
    { num: 86, prob: 5.13 },
    { num: 87, prob: 7.69 },
    { num: 88, prob: 5.13 },
    { num: 89, prob: 7.69 },
    { num: 90, prob: 7.69 },
    { num: 91, prob: 5.13 },
    { num: 92, prob: 7.69 },
    { num: 93, prob: 5.13 },
    { num: 94, prob: 7.69 },
    { num: 95, prob: 5.13 },
    { num: 96, prob: 7.69 },
    { num: 97, prob: 5.13 },
    { num: 98, prob: 7.69 },
    { num: 99, prob: 5.13 },
    { num: 100, prob: 2.56 },
  ];

  // 확률 누적 배열 생성
  let cumulative = 0;
  const weightedNumbers = numbers.map(({ num, prob }) => {
    cumulative += prob;
    return { num, cumulative };
  });

  // 0~100 사이의 랜덤 값
  const randomValue = Math.random() * 100;

  // 랜덤 값이 속하는 숫자 찾기
  return weightedNumbers.find(({ cumulative }) => randomValue <= cumulative)
    .num;
};

const powerCalculate = (battle, skill) => {
  const atk = battle[battle.turn.atk];
  let power = skill.power;
  const itemName = battle[battle.turn.def].item;
  if (skill.name === "탁쳐서떨구기") {
    if (itemName !== null && !noNullItem.includes(itemName)) power *= 1.5;
  }
  if (skill.name === "해수스파우팅") {
    power = (power * atk.hp) / atk.origin.hp;
  }
  return Math.floor(power);
};
