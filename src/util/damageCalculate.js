import { statCalculate } from "../function/statCalculate";
import { typeCheckAbil } from "./typeCheck";
import { getMultiplier } from "../function/statCalculate";
import { noNullItem } from "../entity/Item";
import { flyingCheck } from "./flyingCheck";

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

  let attackStat = sk.stype;
  let defenseStat = "";
  if (attackStat === "atk") {
    // 물리 공격이면 상대 방어력과 계산
    defenseStat = "def";
  } else if (attackStat === "catk") {
    // 특수 공격이면 상대 특방과 계산
    defenseStat = "cdef";
    if (sk.name === "사이코쇼크") {
      defenseStat = "def";
    }
  }

  if (sk.name === "바디프레스") {
    // 바디프레스는 공격력 대신 방어력을 사용
    attackStat = "def";
  }

  let atkStat = attackPokemon[attackStat]; // 공격포켓몬의 물리/특수 능력치 (물리 or 특수 = 스킬의 stype)
  if (defensePokemon.abil === "천진") {
    atkStat = attackPokemon.noRankStat[attackStat];
    // 특성 천진
    // 상대방의 능력치 변화를 무시한다
    // 맞는쪽이 천진이면 공격쪽의 랭크업이 무시된다 (ex: 무한 용성군)
  }
  if (attackPokemon.temp.critical && attackPokemon.tempStatus.rank[attackStat] < 0) {
    atkStat = attackPokemon.noRankStat[attackStat];
    // 급소에 맞았을 경우 공격측에게 불리한 랭크다운이 무시된다
    // 랭크업은 적용된다
  }

  let defStat = defensePokemon[defenseStat]; // 방어포켓몬의 방어/특방 능력치
  for (const effect of sk.skillEffectList) {
    if (effect.name === "천진") {
      defStat = defensePokemon.noRankStat[defenseStat];
      // 성스러운칼 부가효과
      // 상대방의 능력치 변화를 무시한다
    }
  }
  if (attackPokemon.abil === "천진") {
    defStat = defensePokemon.noRankStat[defenseStat];
    //특성 천진
    // 상대방의 능력치 변화를 무시한다
    // 공격쪽이 천진이면 상대방의 랭크업이 무시된다
  }
  if (attackPokemon.temp.critical && defensePokemon.tempStatus.rank[defenseStat] > 0) {
    defStat = defensePokemon.noRankStat[defenseStat];
    // 급소에 맞았을 경우 방어측에게 유리한 랭크업이 무시된다
  }

  let power = powerCalculate(battle, sk);
  // 위력이 바뀌는 기술은 여기서 처리
  // ex) 해수스파우팅, 탁쳐서 떨구기

  let damage = (22 * power * atkStat) / 50 / defStat; //고정 공식
  attackPokemon.log.damage1 = "22 * " + power + "(위력) * " + atkStat + "(" + attackStat + ") / 50 / " + defStat + "(" + defenseStat + ")";
  if (attackPokemon.status.burn != null && attackStat === "atk" && attackPokemon.abil !== "근성") {
    // 화상 상태이면 물리 데미지 절반
    damage /= 2;
    attackPokemon.log.damage1 += " / 2 (화상)";
  }
  const weather = battle.field.weather; // 날씨 보정
  if (weather === "비") {
    if (sk.type === "물") {
      damage *= 1.5;
      attackPokemon.log.damage1 += " * 1.5 (비+물)";
    }
    if (sk.type === "불꽃") {
      damage *= 0.5;
      attackPokemon.log.damage1 += " / 2 (비+불꽃)";
    }
  }
  if (weather === "쾌청") {
    if (sk.type === "불꽃") {
      damage *= 1.5;
      attackPokemon.log.damage1 += " * 1.5 (쾌청+불)";
    }
    if (sk.type === "물") {
      damage *= 0.5;
      attackPokemon.log.damage1 += " / 2 (쾌청+물)";
    }
  }

  const field = battle.field.field; // 필드 보정
  if (field !== null) {
    if (flyingCheck(battle, attackPokemon)) {
      if (field === "그래스필드" && sk.type === "풀") {
        damage *= 1.3;
        attackPokemon.log.damage1 += " * 1.3 (그래스필드+풀)";
      }
      if (field === "일렉트릭필드" && sk.type === "전기") {
        damage *= 1.3;
        attackPokemon.log.damage1 += " * 1.3 (일렉트릭필드+전기)";
      }
    }

    if (field === "그래스필드" && sk.name === "지진") {
      damage *= 0.5; //비행여부 상관없이 적용됨
      attackPokemon.log.damage1 += " * 0.5 (그래스필드+지진)";
    }
  }
  damage = Math.floor(damage);
  attackPokemon.log.damage1 += " = " + damage;
  // attackPokemon.log.damage2 = damage + " + 2";
  damage += 2; // 고정 공식
  attackPokemon.log.damage2 = damage;
  if (sk.type === attackPokemon.type1 || sk.type === attackPokemon.type2) {
    // 자속보정
    damage *= 1.5;
    attackPokemon.log.damage2 += " * 1.5 (자속보정)";
  }
  const typeDamege = typeCheckAbil(battle, sk.type, defensePokemon.type1, defensePokemon.type2); // 상성 보정
  damage *= typeDamege;
  attackPokemon.log.damage2 += " * " + typeDamege + "(상성보정)";
  if (sk.name === "라이트닝드라이브") {
    // 약점인 기술이 추가 데미지를 준다
    if (typeDamege > 1) {
      damage = (damage * 4) / 3;
      attackPokemon.log.damage2 += " * 4/3 (라이트닝드라이브 약점추가보정)";
    }
  }

  if (attackPokemon.item === "생명의구슬") {
    damage *= 1.3;
    attackPokemon.log.damage2 += " * 1.3 (생구)";
  }
  if (attackPokemon.temp.critical) {
    // 급소
    damage *= 1.5;
    attackPokemon.log.damage2 += " * 1.5 (급소)";
  }

  const randomNum = getRandomNumber(); // 랜덤값
  damage = (damage * randomNum) / 100;
  attackPokemon.log.damage2 += " * " + randomNum + "(랜덤값) / 100 = " + Math.floor(damage);
  console.log(attackPokemon.log.damage1);
  console.log(attackPokemon.log.damage2);
  return Math.floor(damage);
};

export const confuseDamageCalculate = (battle) => {
  //혼란 자해 데미지 계산
  //자속보정, 타입 상성, 생구, 화상 적용 안됨
  //랭크업 적용됨, 천진은 적용 안됨
  //급소 적용 됨
  const pokemon = battle[battle.turn.atk];
  let atk = pokemon.atk;
  let def = pokemon.def;
  if (pokemon.temp.critical && pokemon.tempStatus.rank[def] > 0) {
    def = pokemon.noRankStat[def];
    // 급소에 맞았을 경우 방어측에게 유리한 랭크업이 무시된다
  }
  if (pokemon.temp.critical && pokemon.tempStatus.rank[atk] < 0) {
    atk = pokemon.noRankStat[atk];
    // 급소에 맞았을 경우 공격측에게 불리한 랭크다운이 무시된다
    // 랭크업은 적용된다
  }
  let damage = (22 * 40 * atk) / 50 / def;
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
