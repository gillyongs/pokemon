import { typeCheckAbil } from "./typeCheck";
import { getMultiplier } from "../function/rankStat";
import { noNullItem } from "../entity/Item";
import { flyingCheck } from "./flyingCheck";

export const damageCalculate = (battle) => {
  // 데미지를 "계산"만 해서 주는 함수
  // battle 객체 내부의 값을 바꾸지 않는다 (log 제외)
  // => 지닌 아이템, 특성이 바뀌는 기합의띠, 탈은 damage 함수에서 처리한다
  //랭크업 등 스탯 반영
  const attackPokemon = battle[battle.turn.atk];
  const defensePokemon = battle[battle.turn.def];

  const skillNumber = battle.turn.atkSN;
  const skillKey = `sk${skillNumber}`;
  const sk = attackPokemon.origin[skillKey]; // 시전 스킬

  const atkAbil = attackPokemon.abil;
  const defAbil = defensePokemon.abil;

  const noTggAtk = !attackPokemon.abilObj.feature?.tgg;

  // 데미지가 고정인 스킬들 ===============================================================================================

  if (sk.feature.oneShot) {
    //일격기
    return defensePokemon.origin.hp;
  }
  if (sk.name === "카타스트로피") {
    return defensePokemon.hp / 2;
  }

  // 스탯 ================================================================================================================

  // 공격에 반영할 스탯을 정한다.
  // 공격과 특공, 방어와 특방중 사용할 능력치를 결정한다
  // 사이코쇼크는 특수기이지만 방어력을, 바디프레스는 공격력 대신 방어력을, 속임수는 자신 대신 상대방의 공격력을 사용한다

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

  // 랭크업 ================================================================================================================
  // 랭크변화를 적용후 랭크와 관련된 요소 (천진, 급소, 성스러운칼)를 처리한다
  // 천진: 모든 랭크변화를 무시한다.
  // 급소: 시전자에게 불리한 랭크변화만 무시한다
  // 성스러운칼: 상대방의 랭크변화를 무시한다

  let noRankAtkStat = attackPokemon.origin.stat[attackStat];
  let rankNumAtk = attackPokemon.tempStatus.rank[attackStat];
  let rankUpAtk = getMultiplier(rankNumAtk);
  let atkStat = noRankAtkStat * rankUpAtk;
  if (defAbil === "천진") {
    if (noTggAtk) {
      atkStat = noRankAtkStat;
    }
    // 특성 천진
    // 상대방의 능력치 변화를 무시한다
    // 맞는쪽이 천진이면 공격쪽의 랭크변화가 무시된다 (ex: 무한 용성군)
  }
  if (attackPokemon.temp.critical && rankNumAtk < 0) {
    atkStat = noRankAtkStat;
    // 급소에 맞았을 경우 공격측에게 불리한 랭크다운이 무시된다
    // 랭크업은 적용된다
  }

  // 방어포켓몬의 방어/특방 능력치
  let noRankDefStat = defensePokemon.origin.stat[defenseStat];
  let rankNumDef = attackPokemon.tempStatus.rank[attackStat];
  let rankUpDef = getMultiplier(rankNumDef);
  let defStat = noRankDefStat * rankUpDef;

  // 성스러운칼 부가효과
  // 상대방의 능력치 변화를 무시한다
  for (const effect of sk.skillEffectList) {
    if (effect.name === "천진") {
      defStat = noRankDefStat;
    }
  }

  // 특성 천진
  // 상대방의 능력치 변화를 무시한다
  // 공격쪽이 천진이면 상대방의 랭크업이 무시된다
  if (attackPokemon.abil === "천진") {
    defStat = noRankDefStat;
  }
  // 급소에 맞았을 경우 방어측에게 유리한 랭크업이 무시된다
  if (attackPokemon.temp.critical && defensePokemon.tempStatus.rank[defenseStat] > 0) {
    defStat = noRankDefStat;
  }

  // 속임수 ================================================================================================================

  if (sk.name === "속임수") {
    atkStat = defensePokemon.origin.stat.atk * getMultiplier(defensePokemon.tempStatus.rank.atk);
    if (defensePokemon.abil === "천진") {
      atkStat = defensePokemon.origin.stat.atk;
    }
    // 속임수는 상대방의 공격력을 사용하여 공격한다.
    // 상대방의 랭크업은 적용하되, 상대방의 아이템, 특성, 화상은 적용하지 않는다
    // 본인의 아이템, 특성, 화상은 적용한다
    // 천진몬이 속임수 사용할때엔 영향이 없다 (상대방의 방어력 랭크변화를 무시하므로)
    // 천진몬에게 속임수 사용시 천진몬의 랭크변화를 제거한 공격력을 가져온다
  }

  // 스탯 보정 ======================================================================================================
  let atkStr = atkStat + "(" + attackStat + ")";
  let defStr = defStat + "(" + defenseStat + ")";

  // 공격 (atk) ===================================
  if (attackStat === "atk") {
    if (attackPokemon.item === "구애머리띠") {
      atkStat *= 1.5;
      atkStr += " * 1.5 (구애머리띠)";
    }

    const isStatus = Object.values(attackPokemon.status).some((v) => v !== null);
    if (atkAbil === "근성" && isStatus) {
      atkStat *= 1.5;
      atkStr += " * 1.5 (근성)";
    }

    if (attackPokemon.status.burn !== null && attackStat === "atk" && attackPokemon.abil !== "근성") {
      // 화상 상태이면 공격력 절반
      atkStat *= 0.5;
      atkStr += " * 0.5 (화상)";
    }

    if (attackPokemon.tempStatus.protosynthesis === "atk") {
      atkStat *= 1.3;
      atkStr += " * 1.3 (고대활성)";
    }

    if (defAbil === "재앙의목간" && atkAbil !== "재앙의목간") {
      if (noTggAtk) {
        // 공격, 특공을 떨구는 목간, 그릇만 틀깨기가 적용된다.
        // (틀깨기는 상태 특성에 영향을 받지 않고 '공격'할 수 있는 특성이다)
        atkStat *= 0.75;
        atkStr += " * 0.75 (재앙의목간)";
      }
    }
    if (attackPokemon.abil === "진홍빛고동" && battle.field.weather === "쾌청") {
      atkStat *= 1.3;
      atkStr += " * 1.3 (진홍빛고동)";
    }
  }

  // 특공 (catk) ===================================
  if (attackStat === "catk") {
    if (attackPokemon.item === "구애안경") {
      atkStat *= 1.5;
      atkStr += " * 1.5 (구애안경)";
    }
    if (defAbil === "재앙의그릇" && atkAbil !== "재앙의그릇") {
      if (noTggAtk) {
        atkStat *= 0.75;
        atkStr += " * 0.75 (재앙의그릇)";
      }
    }
    if (attackPokemon.tempStatus.protosynthesis === "catk") {
      atkStat *= 1.3;
      atkStr += " * 1.3 (고대활성)";
    }
    if (attackPokemon.abil === "하드론엔진" && battle.field.field === "일렉트릭필드") {
      atkStat *= 1.3;
      atkStr += " * 1.3 (하드론엔진)";
    }
  }

  // 특방 (cdef) ===================================
  if (defenseStat === "def") {
    if (defensePokemon.tempStatus.protosynthesis === "def") {
      defStat *= 1.3;
      defStr += " * 1.3 (고대활성)";
    }
    if (atkAbil === "재앙의검" && defAbil !== "재앙의검") {
      defStat *= 0.75;
      defStr += " * 0.75 (재앙의검)";
    }
  }

  // 특방 (cdef) ===================================
  if (defenseStat === "cdef") {
    if (defensePokemon.item === "돌격조끼") {
      defStat *= 1.5;
      defStr += " * 1.5 (돌격조끼)";
    }
    if (defensePokemon.tempStatus.protosynthesis === "cdef") {
      defStat *= 1.3;
      defStr += " * 1.3 (고대활성)";
    }
    if (atkAbil === "재앙의구슬" && defAbil !== "재앙의구슬") {
      defStat *= 0.75;
      defStr += " * 0.75 (재앙의구슬)";
    }
  }

  // 위력 ======================================================================================================

  let power = powerCalculate(battle, sk);
  // 위력이 바뀌는 기술은 여기서 처리
  // ex) 해수스파우팅, 탁쳐서 떨구기

  // 고정공식 ======================================================================================================

  let damage = (22 * power * atkStat) / 50 / defStat; //고정 공식
  attackPokemon.log.damage1 = "22 * " + power + "(위력) * [" + atkStr + "] / 50 / [" + defStr + "]";

  // 날씨 ==========================================================
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

  // 필드 ==========================================================

  const field = battle.field.field;
  if (field !== null) {
    if (!flyingCheck(battle, attackPokemon)) {
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

  // 아이템 ==========================================================

  if (sk.feature?.punch && attackPokemon.item === "펀치글러브") {
    damage *= 1.1;
    attackPokemon.log.damage1 += " * 1.1 (펀치글러브)";
  }

  // ======================================================================  [고정 공식] ========================================
  // ===========================================================================================================================
  // ===========================================================================================================================

  damage = Math.floor(damage);
  attackPokemon.log.damage1 += " = " + damage;
  damage += 2; // 고정 공식 (데미지 계산식의 유일한 덧셈)
  attackPokemon.log.damage2 = damage;

  // 자속보정 ===============================================================
  if (sk.type === attackPokemon.type1 || sk.type === attackPokemon.type2) {
    damage *= 1.5;
    attackPokemon.log.damage2 += " * 1.5 (자속보정)";
  }

  // 상성보정 ================================================================
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

  // 생명의 구슬 ================================================================

  if (attackPokemon.item === "생명의구슬") {
    damage *= 1.3;
    attackPokemon.log.damage2 += " * 1.3 (생구)";
  }

  // 급소 =============================================================================
  if (attackPokemon.temp.critical) {
    damage *= 1.5;
    attackPokemon.log.damage2 += " * 1.5 (급소)";
  }

  // 특성 ===============================================================================

  if (defAbil === "멀티스케일" && defensePokemon.hp === defensePokemon.origin.hp) {
    if (noTggAtk) {
      damage *= 0.5;
      attackPokemon.log.damage2 += " * 0.5 (멀티스케일)";
    }
    // 멀티스케일은 공격 데미지에만 적용된다
    // 혼란 자해 데미지에 적용 안되다함 (위키피셜)
    // 생구에 멀스 적용 안됨
    // 고정 데미지 기술(일격기, 카운터, 지구던지기, 카타스트로피)도 적용 안 됨
  }

  if ((atkAbil === "페어리오라" || defAbil === "페어리오라") && sk.type === "페어리") {
    // 틀깨기 적용 안됨
    damage = (damage * 4) / 3;
    attackPokemon.log.damage2 += " * 4/3 (페어리오라)";
  }

  if ((atkAbil === "다크오라" || defAbil === "다크오라") && sk.type === "악") {
    damage = (damage * 4) / 3;
    attackPokemon.log.damage2 += " * 4/3 (다크오라)";
  }

  // 랜덤값 ======================================================================================================

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
    def = pokemon.origin[def];
    // 급소에 맞았을 경우 방어측에게 유리한 랭크업이 무시된다
  }
  if (pokemon.temp.critical && pokemon.tempStatus.rank[atk] < 0) {
    atk = pokemon.origin[atk];
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
  if (skill.name === "객기" && (atk.status.burn || atk.status.mabi || atk.status.poison || atk.status.mpoison)) {
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
