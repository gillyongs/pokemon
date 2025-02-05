import { statCalculate } from "../function/statCalculate";
import { typeCheckAbil } from "./typeCheck";
import { getMultiplier } from "../function/statCalculate";
export const damageCalculate = (battle) => {
  statCalculate(battle);
  const skillNumber = battle.turn.atkSN;
  const atk = battle[battle.turn.atk];
  const def = battle[battle.turn.def];
  const skillKey = `sk${skillNumber}`;
  const sk = atk.origin[skillKey];

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
    }
  }

  let damage = (22 * sk.power * atkStat) / 50 / defStat;
  if (atk.status.burn != null && sk.stype === "atk") {
    damage /= 2;
  }
  damage += 2;
  if (sk.type === atk.type1 || sk.type === atk.type2) {
    damage *= 1.5;
  }
  damage *= typeCheckAbil(battle, sk.type, def.type1, def.type2);
  if (atk.item === "생명의구슬") {
    damage *= 1.3;
  }

  const randomNum = getRandomNumber();
  damage = (damage * randomNum) / 100;
  return Math.floor(damage);
};

export const confuseDamageCalculate = (battle) => {
  const pokemon = battle[battle.turn.atk];
  let damage = (22 * 40 * pokemon.atk) / 50 / pokemon.def;
  if (pokemon.status.burn != null) {
    damage /= 2;
  }
  damage += 2;
  return Math.floor(damage);
};

const getRandomNumber = () => {
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
