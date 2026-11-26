import { getMultiplier } from "./rankStat";

export const getAugmentedStat = (pokemon, statKey, battle = null) => {
  const baseStatObj = pokemon?.stat;
  let val = baseStatObj?.[statKey] ?? 0;
  if (typeof val !== "number") return 0;
  let logText = `${val}(${statKey})`;

  // 최강의잉어킹 특성: 체력을 제외한 모든 능력치(공격, 방어, 특공, 특방, 스피드) 999 고정
  const hasStrongestMagikarp = (pokemon?.abil?.name || pokemon?.abil) === "최강의잉어킹";
  if (hasStrongestMagikarp && STAT_KEYS.includes(statKey)) {
    val = 999;
    logText = `999(${statKey}: 최강의잉어킹)`;
  }

  // 기기기어르 기어메이킹 / 기어 중첩: 중첩 * 20 만큼 HP 제외 모든 능력치(atk, def, catk, cdef, speed) 상승
  const gearStack = Number(pokemon?.gearStack || 0);
  if (gearStack > 0 && STAT_KEYS.includes(statKey)) {
    const gearBonus = gearStack * 20;
    val += gearBonus;
    logText += ` + ${gearBonus} (기어 ${gearStack}중첩)`;
  }

  // 모루 능력치: 능력치 파편으로 오르는 누적 능력치
  const anvilBonus = Number(pokemon?.anvilStats?.[statKey] ?? 0);
  if (anvilBonus > 0 && STAT_KEYS.includes(statKey)) {
    val += anvilBonus;
    logText += ` + ${anvilBonus} (모루 능력치)`;
  }

  // 전관예우 특성: 모든 노력치 최대화(252) 적용 -> (252 - 현재 노력치)에 해당하는 스탯 추가 (0일 때 +32)
  const abilName = pokemon.abil?.name || pokemon.abil;
  if (abilName === "전관예우" && STAT_KEYS.includes(statKey)) {
    const evs = pokemon.evs || {};
    const currentEv = Number(evs[statKey] ?? 0);
    const remainingEv = Math.max(0, 252 - currentEv);
    const bonusStat = Math.round(remainingEv / 8);
    if (bonusStat > 0) {
      val += bonusStat;
      logText += ` + ${bonusStat} (전관예우)`;
    }
  }

  const augments = pokemon?.augments || [];

  // 합적용 ==============================================================================
  for (const aug of augments) {
    const augId = typeof aug === "string" ? aug : aug?.id;

    // 아케인셰이드 투핸드소드
    if (augId === "arcaneShadeSword") {
      const cubeStats = pokemon?.cubeStats;

      // 1. 아케인 주문서 능력치
      let arcaneBonus = 0;
      if (statKey === "atk") arcaneBonus = Number(pokemon?.arcaneScrollAtk || 0);
      else if (statKey === "catk") arcaneBonus = Number(pokemon?.arcaneScrollCatk || 0);
      else if (statKey === "speed") arcaneBonus = Number(pokemon?.arcaneScrollSpeed || 0);

      if (arcaneBonus > 0) {
        val += arcaneBonus;
        logText += ` + ${arcaneBonus} (주흔작)`;
      }

      // 2. 스타포스 능력치 (공격, 특공만 증가)
      if (statKey === "atk" || statKey === "catk") {
        const starBonus = Number(pokemon?.arcaneStarCount || 0) * 10;
        if (starBonus > 0) {
          val += starBonus;
          logText += ` + ${starBonus} (스타포스)`;
        }
      }

      // 3. 잠재능력 (합적용)
      const flatMap = {
        atk: cubeStats?.atkFlat,
        catk: cubeStats?.catkFlat,
        def: cubeStats?.defFlat,
        cdef: cubeStats?.cdefFlat,
        speed: cubeStats?.speedFlat,
      };
      const flatBonus = Number(flatMap[statKey] || 0);
      if (flatBonus > 0) {
        val += flatBonus;
        logText += ` + ${flatBonus} (잠재)`;
      }
    } else if (augId === "swordEnhance" && (statKey === "atk" || statKey === "catk")) {
      const failed = Boolean(aug?.swordFailed ?? pokemon?.swordFailed);
      const level = Number(aug?.swordLevel ?? pokemon?.swordLevel ?? 0);
      const bonusAtk = aug?.swordBonusAtk !== undefined ? Number(aug.swordBonusAtk) : pokemon?.swordBonusAtk !== undefined ? Number(pokemon.swordBonusAtk) : failed ? 0 : 20 + level * 20;
      if (bonusAtk > 0) {
        val += bonusAtk;
        logText += ` + ${bonusAtk} (검 강화하기)`;
      }

      // 메자이의 영혼약탈자: 중첩당 특수공격 +20
    } else if (augId === "mejaisSoulstealer" && statKey === "catk") {
      const stack = Number(pokemon?.mejaiStack ?? aug?.mejaiStack ?? 0);
      const bonusCatk = stack * 20;
      if (bonusCatk > 0) {
        val += bonusCatk;
        logText += ` + ${bonusCatk} (메자이 ${stack}중첩)`;
      }
    } else if (augId === "soulDice") {
      const diceStats = aug?.soulDiceStats;
      const bonus = Number(diceStats?.[statKey] ?? 0);
      if (bonus > 0) {
        val += bonus;
        logText += ` + ${bonus} (영혼의 주사위)`;
      }
    } else if (augId === "axeOfDespair" && statKey === "atk") {
      val += 100;
      logText += ` + 100 (데몬의 도끼)`;
    } else if (augId === "rush" && statKey === "atk") {
      val += 70;
      logText += ` + 70 (돌진)`;
    } else if (augId === "powerOfKing" && (statKey === "atk" || statKey === "catk")) {
      const bonus = Number(aug?.kingStatBonus ?? pokemon?.kingStatBonus ?? 20);
      if (bonus > 0) {
        val += bonus;
        logText += ` + ${bonus} (그 힘이야말로 왕인 까닭이다)`;
      }
    } else if (augId === "holyElfBlessing" && (statKey === "def" || statKey === "cdef")) {
      val += 200;
      logText += ` + 200 (홀리엘프)`;
    } else if (augId === "salamandra" && (pokemon?.type1 === "불꽃" || pokemon?.type2 === "불꽃") && (statKey === "atk" || statKey === "catk")) {
      val += 70;
      logText += ` + 70 (사라만도라)`;
    } else if (augId === "brionac" && (pokemon?.type1 === "얼음" || pokemon?.type2 === "얼음" || pokemon?.type1 === "드래곤" || pokemon?.type2 === "드래곤") && (statKey === "atk" || statKey === "catk")) {
      val += 70;
      logText += ` + 70 (빙룡창 브류나크)`;
    } else if (augId === "flamingKatana") {
      if (statKey === "atk") {
        val += 65;
        logText += ` + 65 (화염의 카타나)`;
      } else if (statKey === "catk") {
        val += 40;
        logText += ` + 40 (화염의 카타나)`;
      } else if (statKey === "speed") {
        val += 17;
        logText += ` + 17 (화염의 카타나)`;
      }
    } else if (augId === "sunfireCape" && (pokemon?.type1 === "불꽃" || pokemon?.type2 === "불꽃") && (statKey === "def" || statKey === "cdef")) {
      val += 70;
      logText += ` + 70 (태양불꽃망토)`;
    }
  }

  // 헤이스트: 파티 전원의 스피드가 40 증가
  if (pokemon?.hasAugmentOnTeam?.("haste", battle) && statKey === "speed") {
    val += 40;
    logText += ` + 40 (헤이스트)`;
  }

  // 물의 조종자: 모든 아군 물타입 포켓몬의 방어와 특수방어가 200 증가
  if (pokemon?.hasAugmentOnTeam("waterOmotics", battle) && (pokemon?.type1 === "물" || pokemon?.type2 === "물") && (statKey === "def" || statKey === "cdef")) {
    val += 200;
    logText += ` + 200 (물의 조종자)`;
  }

  // 암석거인: 모든 아군 바위타입 포켓몬의 방어와 특수방어가 200 증가
  if (pokemon?.hasAugmentOnTeam("giantSoldierOfStone", battle) && (pokemon?.type1 === "바위" || pokemon?.type2 === "바위") && (statKey === "def" || statKey === "cdef")) {
    val += 200;
    logText += ` + 200 (암석거인)`;
  }

  // 곱적용 =============================================================
  for (const aug of augments) {
    const augId = typeof aug === "string" ? aug : aug?.id;

    // 위대한 엄니의 소울 (아케인셰이드 투핸드소드 장착 시 공격/특공 +30%)
    if (augId === "arcaneShadeSword" && pokemon?.hasGreatTuskSoul) {
      if (statKey === "atk" || statKey === "catk") {
        val = Math.round(val * 1.3);
        logText += " * 1.3 (위대한 엄니의 소울)";
      }
    }

    // 아케인셰이드 투핸드소드 잠재능력 (% 증가)
    if (augId === "arcaneShadeSword") {
      const cubeStats = pokemon?.cubeStats;
      const rateMap = {
        atk: cubeStats?.atkRate,
        catk: cubeStats?.catkRate,
        def: cubeStats?.defRate,
        cdef: cubeStats?.cdefRate,
        speed: cubeStats?.speedRate,
      };
      const rateBonus = Number(rateMap[statKey] || 0);
      if (rateBonus > 0) {
        val = Math.round(val * (1 + rateBonus / 100));
        logText += ` * ${(1 + rateBonus / 100).toFixed(2)} (잠재)`;
      }
    }

    // 인생의 동반자: 모든 능력치 1.1배
    if (augId === "lifePartner") {
      val = Math.round(val * 1.1);
      logText += " * 1.1 (인생의 동반자)";
    }

    // 영혼의 심복: 모든 능력치 1.5배
    if (augId === "soulMinion") {
      val = Math.round(val * 1.5);
      logText += " * 1.5 (영혼의 심복)";
    }

    // 진안상애: 모든 능력치 1.3배
    if (augId === "jinanSangae") {
      val = Math.round(val * 1.3);
      logText += " * 1.3 (진안상애)";
    }

    // 포잘알: 모든 능력치 1.3배
    if (augId === "pokemonQuizExpert") {
      val = Math.round(val * 1.3);
      logText += " * 1.3 (포잘알)";
    }

    // 폭주하는 힘: 적을 쓰러뜨린 후 다음 턴까지 모든 능력치 1.5배
    if (augId === "rampagingPower" && Number(pokemon?.tempStatus?.rampagingPower) > 0) {
      val = Math.round(val * 1.5);
      logText += " * 1.5 (폭주하는 힘)";
    }

    // 곰 세마리가 한 집에 있어
    if (augId === "threeBearsHouse") {
      const mult = getBearMultiplier(pokemon, battle);
      val = Math.round(val * mult);
      logText += ` * ${mult} (곰 세마리가 한 집에 있어)`;
    }

    // 라바돈의 죽음 모자
    if (augId === "rabadonsDeathcap") {
      if (statKey === "catk") {
        val = Math.round(val * 1.3);
        logText += " * 1.3 (라바돈)";
      }
    }
    // 모 아니면 도
    else if (augId === "allOrNothing") {
      const pick = aug?.allOrNothingResult;
      if (pick === "atk") {
        if (statKey === "atk") {
          val = Math.round(val * 2);
          logText += " * 2 (모 아니면 도)";
        } else if (statKey === "catk") {
          val = Math.max(1, Math.floor(val / 2));
          logText += " / 2 (모 아니면 도)";
        }
      } else if (pick === "catk") {
        if (statKey === "catk") {
          val = Math.round(val * 2);
          logText += " * 2 (모 아니면 도)";
        } else if (statKey === "atk") {
          val = Math.max(1, Math.floor(val / 2));
          logText += " / 2 (모 아니면 도)";
        }
      }
    }
    // 아픈 건 싫으니까 방어력에 올인하려고 합니다.
    else if (augId === "allInDefense") {
      if (statKey === "def" || statKey === "cdef") {
        val = Math.round(val * 2);
        logText += " * 2 (방어력 올인)";
      } else if (statKey === "atk" || statKey === "catk" || statKey === "speed") {
        val = Math.max(1, Math.floor(val / 2));
        logText += " / 2 (방어력 올인)";
      }
    }
    // 리미터 해제: 공격, 특수공격, 스피드 1.5배
    else if (augId === "limiterRemoval") {
      if (statKey === "atk" || statKey === "catk" || statKey === "speed") {
        val = Math.round(val * 1.5);
        logText += " * 1.5 (리미터 해제)";
      }
    }
    // 드래곤 로어: HP가 절반 이상일 때 스피드 2배 증가
    else if (augId === "dragonRoar") {
      if (statKey === "speed") {
        const curHp = pokemon.hp;
        const maxHp = pokemon?.maxHp;
        const halfHp = Math.round(maxHp / 2);
        if (curHp >= halfHp) {
          val = Math.round(val * 2);
          logText += " * 2 (드래곤 로어)";
        }
      }
    }
  }

  // 영웅의 메아리: 아군 모든 포켓몬의 공격과 특공 40% 상승
  if (pokemon?.hasAugmentOnTeam?.("echoOfHero", battle) && (statKey === "atk" || statKey === "catk")) {
    val = Math.round(val * 1.4);
    logText += " * 1.4 (영웅의 메아리)";
  }

  // 메이플 용사: 파티 전원의 모든 능력치 15% 증가
  if (pokemon?.hasAugmentOnTeam?.("mapleWarrior", battle)) {
    val = Math.round(val * 1.15);
    logText += " * 1.15 (메이플 용사)";
  }

  // 천년 방패: 모든 아군 포켓몬의 방어와 특수방어 2배
  if (pokemon?.hasAugmentOnTeam?.("millenniumShield", battle) && (statKey === "def" || statKey === "cdef")) {
    val = Math.round(val * 2);
    logText += " * 2 (천년방패)";
  }

  // 방어구 부수기: 피격 포켓몬의 방어와 특수방어 스택당 5% 감소 (최대 15스택 = 75%)
  const armorBreakStacks = Number(pokemon?.tempStatus?.armorBreak || 0);
  if (armorBreakStacks > 0 && (statKey === "def" || statKey === "cdef")) {
    const reductionPercent = Math.min(75, armorBreakStacks * 5);
    val = Math.max(1, Math.round(val * (1 - reductionPercent / 100)));
    logText += ` * ${(1 - reductionPercent / 100).toFixed(2)} (방어구 부수기 -${reductionPercent}%)`;
  }

  logText += ` = ${val}`;
  pokemon.log.getStat[statKey] = logText;

  return val;
};

export const getHighestStatInfo = (pokemon, battle = null) => {
  const baseStatObj = pokemon?.stat;
  if (!baseStatObj) return null;

  let best = null;
  for (const statKey of STAT_KEYS) {
    if (typeof baseStatObj[statKey] !== "number") continue;
    const augmented = getAugmentedStat(pokemon, statKey, battle);
    const rank = Number(pokemon?.tempStatus?.rank?.[statKey] ?? 0);
    const effective = augmented * getMultiplier(rank);
    if (!best || effective > best.effective) {
      best = {
        statKey,
        label: STAT_LABELS[statKey],
        augmented,
        rank,
        effective,
        displayValue: Math.floor(effective),
      };
    }
  }
  return best;
};

const BEAR_DEX = ["0614", "0760", "0892", "0901"];

const getBearMultiplier = (pokemon, battle) => {
  if (!battle) return 1.1;
  const team = pokemon?.team === "npc" ? [battle.npc, battle.npcBench1, battle.npcBench2] : [battle.player, battle.playerBench1, battle.playerBench2];
  const count = team.filter((p) => p && BEAR_DEX.includes(p.dexNo)).length;

  return count >= 3 ? 1.5 : count === 2 ? 1.3 : 1.1;
};

export const STAT_KEYS = ["atk", "def", "catk", "cdef", "speed"];

export const STAT_LABELS = {
  atk: "공격",
  def: "방어",
  catk: "특공",
  cdef: "특방",
  speed: "스피드",
};
