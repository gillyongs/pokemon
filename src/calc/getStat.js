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
      const successes = Number(aug?.arcaneSuccessCount ?? pokemon?.arcaneSuccessCount ?? 0);
      const hasSoul = Boolean(aug?.hasGreatTuskSoul ?? pokemon?.hasGreatTuskSoul);
      const starCount = Number(aug?.arcaneStarCount ?? pokemon?.arcaneStarCount ?? 0);
      const starBonus = starCount * 10;
      const starPrefix = starCount > 0 ? `[★${starCount}] ` : "";
      const soulPrefix = hasSoul ? "위대한 엄니의 " : "";
      const scrollSuffix = successes > 0 ? ` (+${successes})` : "";
      const name = aug?.arcaneSwordName || `${starPrefix}${soulPrefix}아케인셰이드 투핸드소드${scrollSuffix}`;
      if (statKey === "atk") {
        const bonus = Number(aug?.arcaneBonusAtk ?? pokemon?.arcaneBonusAtk ?? 0) + starBonus;
        if (bonus > 0) {
          val += bonus;
          logText += ` + ${bonus} (${name})`;
        }
      } else if (statKey === "catk") {
        const bonus = Number(aug?.arcaneBonusCatk ?? pokemon?.arcaneBonusCatk ?? 0) + starBonus;
        if (bonus > 0) {
          val += bonus;
          logText += ` + ${bonus} (${name})`;
        }
      } else if (statKey === "speed") {
        const bonus = Number(aug?.arcaneBonusSpeed ?? pokemon?.arcaneBonusSpeed ?? 0);
        if (bonus > 0) {
          val += bonus;
          logText += ` + ${bonus} (${name})`;
        }
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
    }
  }

  // 곱적용 =============================================================
  for (const aug of augments) {
    const augId = typeof aug === "string" ? aug : aug?.id;

    // 위대한 엄니의 소울 (아케인셰이드 투핸드소드 장착 시 공격/특공 +30%)
    if (augId === "arcaneShadeSword" && (aug?.hasGreatTuskSoul || pokemon?.hasGreatTuskSoul)) {
      if (statKey === "atk" || statKey === "catk") {
        val = Math.round(val * 1.3);
        logText += " * 1.3 (위대한 엄니의 소울)";
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
  }

  // 영웅의 메아리: 아군 모든 포켓몬의 공격과 특공 40% 상승
  const hasSelfEcho = pokemon?.hasAugment?.("echoOfHero") || Boolean(pokemon?.hasEchoOfHeroBuff);
  let hasTeamEcho = hasSelfEcho;
  if (!hasTeamEcho && battle) {
    const team = pokemon?.team === "npc" ? [battle.npc, battle.npcBench1, battle.npcBench2] : [battle.player, battle.playerBench1, battle.playerBench2];
    hasTeamEcho = team.some((p) => p?.hasAugment?.("echoOfHero") || p?.hasEchoOfHeroBuff);
  }
  if (hasTeamEcho && (statKey === "atk" || statKey === "catk")) {
    val = Math.round(val * 1.4);
    logText += " * 1.4 (영웅의 메아리)";
  }

  logText += ` = ${val}`;
  try {
    if (pokemon) {
      if (!pokemon.log) pokemon.log = {};
      pokemon.log.getAugmentedStat = logText;
    }
  } catch (e) {}

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
