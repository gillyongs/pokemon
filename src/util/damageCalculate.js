import { statCalculate } from "../function/statCalculate";
import { typeCheckAbil } from "./typeCheck";
import { getMultiplier } from "../function/statCalculate";
import { noNullItem } from "../entity/Item";

export const damageCalculate = (battle) => {
  //데미지 계산
  statCalculate(battle);
  //랭크업 등 스탯 반영
  const skillNumber = battle.turn.atkSN;
  const attackPokemon = battle[battle.turn.atk];
  const defensePokemon = battle[battle.turn.def];
  const skillKey = `sk${skillNumber}`;
  const sk = attackPokemon.origin[skillKey]; // 시전 스킬

  // 데미지가 고정인 스킬들
  if (sk.feature.oneShot) {
    return defensePokemon.origin.hp;
  }
  if (sk.name === "카타스트로피") {
    return defensePokemon.hp / 2;
  }

  let dtype = "";
  if (sk.stype === "atk") {
    // 물리 공격이면 상대 방어력과 계산
    dtype = "def";
  } else if (sk.stype === "catk") {
    // 특수 공격이면 상대 특방과 계산
    dtype = "cdef";
    if (sk.name === "사이코쇼크") {
      dtype = "def";
    }
  }

  let atkStat = attackPokemon[sk.stype]; // 공격포켓몬의 물리/특수 능력치 (물리 or 특수 = 스킬의 stype)
  if (defensePokemon.abil === "천진") {
    atkStat = attackPokemon.noRankStat[sk.stype];
    // 특성 천진
    // 상대방의 능력치 변화를 무시한다
    // 맞는쪽이 천진이면 공격쪽의 랭크업이 무시된다
  }
  if (sk.name === "바디프레스") {
    // 바디프레스는 공격력 대신 방어력을 사용
    atkStat = attackPokemon.def;
  }

  let defStat = defensePokemon[dtype]; // 방어포켓몬의 방어/특방 능력치
  for (const effect of sk.skillEffectList) {
    if (effect.name === "천진") {
      defStat = defensePokemon.noRankStat[dtype];
      // 성스러운칼 부가효과
      // 상대방의 능력치 변화를 무시한다
    }
  }
  if (attackPokemon.abil === "천진") {
    defStat = defensePokemon.noRankStat[dtype];
    //특성 천진
    // 상대방의 능력치 변화를 무시한다
    // 공격쪽이 천진이면 상대방의 랭크업이 무시된다
  }

  let power = powerCalculate(battle, sk);
  // 위력이 바뀌는 기술은 여기서 처리
  // ex) 해수스파우팅, 탁쳐서 떨구기

  let damage = (22 * power * atkStat) / 50 / defStat; //고정 공식
  if (attackPokemon.status.burn != null && sk.stype === "atk" && attackPokemon.abil !== "근성") {
    // 화상 상태이면 물리 데미지 절반
    damage /= 2;
  }
  const weather = battle.field.weather; // 날씨 보정
  if (weather === "비") {
    if (sk.type === "물") {
      damage *= 1.5;
    }
    if (sk.type === "불") {
      damage *= 0.5;
    }
  }

  const field = battle.field.field; // 필드 보정
  if (field !== null) {
    if (attackPokemon.type1 !== "비행" && attackPokemon.type2 !== "비행" && attackPokemon.abil !== "부유") {
      if (field === "그래스필드" && sk.type === "풀") {
        damage *= 1.3;
      }
      if (field === "일렉트릭필드" && sk.type === "전기") {
        damage *= 1.3;
      }
    }
  }

  damage += 2; // 고정 공식

  if (sk.type === attackPokemon.type1 || sk.type === attackPokemon.type2) {
    // 자속보정
    damage *= 1.5;
  }
  const typeDamege = typeCheckAbil(battle, sk.type, defensePokemon.type1, defensePokemon.type2); // 상성 보정
  damage *= typeDamege;
  if (sk.name === "라이트닝드라이브") {
    // 약점인 기술이 추가 데미지를 준다
    if (typeDamege > 1) {
      damage = (damage * 4) / 3;
    }
  }

  if (attackPokemon.item === "생명의구슬") {
    damage *= 1.3;
  }
  if (attackPokemon.temp.critical) {
    // 치명타
    damage *= 1.5;
  }

  const randomNum = getRandomNumber(); // 랜덤값
  damage = (damage * randomNum) / 100;
  return Math.floor(damage);
};

export const confuseDamageCalculate = (battle) => {
  //혼란 데미지 계산
  //자속보정, 타입 상성, 생구 적용 안됨
  //급소 적용 됨
  //실제 게임에서 화상 뎀감 적용되는지 모르겠어서 일단 넣음
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
  return weightedNumbers.find(({ cumulative }) => randomValue <= cumulative).num;
};

const powerCalculate = (battle, skill) => {
  const atk = battle[battle.turn.atk];
  let power = skill.power;
  const itemName = battle[battle.turn.def].item;
  if (skill.name === "탁쳐서떨구기") {
    // 상대한테 도구가 있고 떨굴 수 있는 아이템이면 위력 1.5배
    if (itemName !== null && !noNullItem.includes(itemName)) power *= 1.5;
  }
  if (skill.name === "해수스파우팅") {
    // 체력비례 데미지
    power = (power * atk.hp) / atk.origin.hp;
  }
  if (skill.name === "객기" && (atk.status.burn || atk.status.mabi || atk.status.poision || atk.status.mpoision)) {
    //화상, 독, 마비일때 위력 2배
    power *= 2;
  }
  if (skill.name === "병상첨병") {
    // 상대가 상태이상이면 위력 2배

    if (statusCheck(battle[battle.turn.def].status)) power *= 2;
  }
  return Math.floor(power);
};

const statusCheck = (status) => {
  return Object.values(status).some((value) => value !== null);
};
