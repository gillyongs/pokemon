import { getMultiplier } from "./rankStat";

export const STAT_KEYS = ["atk", "def", "catk", "cdef", "speed"];

export const STAT_LABELS = {
  atk: "공격",
  def: "방어",
  catk: "특공",
  cdef: "특방",
  speed: "스피드",
};

export const getAugmentedStat = (pokemon, statKey, battle = null) => {
  const baseStatObj = pokemon?.origin?.stat || pokemon?.stat;
  let val = baseStatObj?.[statKey] ?? 0;
  if (typeof val !== "number") return 0;
  let logText = `${val}(${statKey})`;

  // 최강의잉어킹 특성: 체력을 제외한 모든 능력치(공격, 방어, 특공, 특방, 스피드) 999 고정
  const hasStrongestMagikarp = pokemon?.abil === "최강의잉어킹" || pokemon?.origin?.abil === "최강의잉어킹";
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

  const augments = pokemon?.augments || [];

  // 합적용 ==============================================================================
  for (const aug of augments) {
    const augId = typeof aug === "string" ? aug : aug?.id;

    // 검 강화하기
    if (augId === "swordEnhance" && statKey === "atk") {
      const failed = Boolean(aug?.swordFailed);
      const level = Number(aug?.swordLevel ?? 0);
      const bonusAtk = aug?.swordBonusAtk !== undefined ? Number(aug.swordBonusAtk) : failed ? 0 : 20 + level * 20;
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
    }
  }

  // 곱적용 =============================================================
  for (const aug of augments) {
    const augId = typeof aug === "string" ? aug : aug?.id;

    // 인생의 동반자: 모든 능력치 1.1배
    if (augId === "lifePartner") {
      val = Math.round(val * 1.1);
      logText += " * 1.1 (인생의 동반자)";
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
      const pick = aug?.allOrNothingResult ?? aug?.revolutionResult;
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
  const baseStatObj = pokemon?.origin?.stat || pokemon?.stat;
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
