import { AUGMENT_LIST, AUGMENT_SYNERGY_MAP, GAMBLE_BONUS_AUGMENT_IDS, hasGamblingAddict, MUTUALLY_EXCLUSIVE_MAP, isNormalAugment, getSynergyThreshold, REPLACEMENT_AUGMENT_IDS, getReplacementAugmentWeight } from "../entity/Augment/AugmentData";

function filterExclusiveAugments(pool, pickedId) {
  if (!pickedId || !Array.isArray(pool)) return pool;
  const blockedIds = MUTUALLY_EXCLUSIVE_MAP[pickedId];
  if (!blockedIds || blockedIds.size === 0) return pool;
  return pool.filter((aug) => !blockedIds.has(aug.id));
}




const isRollableAugmentType = (aug) => {
  if (!aug) return false;
  if (isNormalAugment(aug)) return true;
  return Boolean(aug.buf && aug.cost === "-" && aug.weight !== "-" && aug.isRandom !== false);
};

function getAugmentWeight(aug, pokemon = null, battle = null, replacementPoolCount = 1) {
  if (!aug || aug.weight === "-" || !isRollableAugmentType(aug) || aug.isRandom === false) return 0;

  // 포켓몬 교체 증강 (기기기어르, 전설의 거인, 결혼, 돌림판, 비상 등):
  // 전체 가중치 500 / (n + 1)을 현재 풀에 있는 교체 증강 개수로 균등 분배하여,
  // 교체 증강 전체의 등장 가중치가 교체 증강 개수와 무관하게 500 / (n + 1)로 일정하게 유지되도록 함
  if (REPLACEMENT_AUGMENT_IDS.includes(aug.id)) {
    const totalReplacementWeight = getReplacementAugmentWeight(pokemon);
    if (totalReplacementWeight <= 0) return 0;
    const count = replacementPoolCount > 0 ? replacementPoolCount : 1;
    return totalReplacementWeight / count;
  }

  const rawWeight = typeof aug.weight === "function" ? aug.weight(pokemon, battle) : typeof aug.getWeight === "function" ? aug.getWeight(pokemon, battle) : aug.weight;
  if (rawWeight === "-" || rawWeight === false || rawWeight === null) return 0;
  if (rawWeight === undefined) return 100;
  const weight = Number(rawWeight);
  return Number.isFinite(weight) && weight > 0 ? weight : 0;
}

function pickWeightedIndex(pool, pokemon = null, battle = null) {
  if (!Array.isArray(pool) || pool.length === 0) return -1;
  const replacementPoolCount = pool.filter((aug) => aug && REPLACEMENT_AUGMENT_IDS.includes(aug.id)).length;
  let totalWeight = 0;
  for (const aug of pool) {
    totalWeight += getAugmentWeight(aug, pokemon, battle, replacementPoolCount);
  }
  if (totalWeight <= 0) {
    return Math.floor(Math.random() * pool.length);
  }
  let rand = Math.random() * totalWeight;
  for (let i = 0; i < pool.length; i++) {
    rand -= getAugmentWeight(pool[i], pokemon, battle, replacementPoolCount);
    if (rand < 0) {
      return i;
    }
  }
  return pool.length - 1;
}

function getForcedSynergyAugment(pokemon) {
  if (!pokemon) return null;
  for (const [buffId, requiredIds] of Object.entries(AUGMENT_SYNERGY_MAP)) {
    // 영메는 팀 전체니까 따로 관리
    if (pokemon.hasAugment?.(buffId) || (buffId === "echoOfHero" && pokemon.hasEchoOfHeroBuff)) {
      continue;
    }
    const threshold = typeof getSynergyThreshold === "function" ? getSynergyThreshold(buffId, requiredIds) : requiredIds.length;
    const owned = requiredIds.filter((id) => pokemon.hasAugment?.(id));
    if (owned.length === threshold - 1) {
      const missingCandidates = requiredIds.filter((id) => !pokemon.hasAugment?.(id));
      const found = AUGMENT_LIST.find((a) => missingCandidates.includes(a.id) && (typeof a.isEligible !== "function" || a.isEligible(pokemon)));
      if (found) return found;
    }
  }
  return null;
}


/**
 * 특정 조건을 만족할 때 증강 선택지 최상단(0번 슬롯)에 확정 등장하는 증강 반환
 */
function getPriorityTopAugment(pokemon) {
  if (!pokemon) return null;
  const abilName = pokemon.abil?.name || pokemon.abil;
  const itemName = pokemon.item?.name || pokemon.item;

  // 1. 레지기가스의 특성이 슬로스타트일 때 -> 패스트스타트 (영구 버프)
  if ((pokemon.dexNo === "0486" || pokemon.name?.includes("레지기가스")) && abilName === "슬로스타트" && !pokemon.hasAugment?.("fastStarter")) {
    return AUGMENT_LIST.find((a) => a.id === "fastStarter") || null;
  }

  // 2. 플라엣테 또는 단단지의 지닌 물건이 진화의휘석일 때 -> 진화의 휘석 증강
  const isFloetteOrShuckle =
    pokemon.dexNo === "0670" ||
    pokemon.dexNo === "0213" ||
    pokemon.name?.includes("플라엣테") ||
    pokemon.name?.includes("단단지");
  if (isFloetteOrShuckle && itemName === "진화의휘석" && !pokemon.hasAugment?.("eviolite")) {
    return AUGMENT_LIST.find((a) => a.id === "eviolite") || null;
  }

  return null;
}

const getForcedBeginnerAugment = getForcedSynergyAugment;

/**
 * 포켓몬이 선택 가능한 증강을 가중치 기반 무작위(중복 없이) 추첨합니다.
 * 포켓몬당 증강은 최대 3개까지 보유할 수 있습니다.
 */
export function rollAugments(pokemon, count = 3, battle = null) {
  if (!pokemon) return [];
  const currentCount = Array.isArray(pokemon.augments) ? pokemon.augments.filter((a) => isNormalAugment(a)).length : 0;
  const isFull = currentCount >= 3;
  const team = battle ? [battle.player, battle.playerBench1, battle.playerBench2].filter(Boolean) : [pokemon];

  // 이미 보유한 증강 제외
  const available = AUGMENT_LIST.filter((aug) => {
    if (isFull && aug.cost !== "-") return false;
    if (!isRollableAugmentType(aug) || aug.isRandom === false || aug.weight === "-" || getAugmentWeight(aug, pokemon, battle) <= 0) return false;
    if (pokemon.hasAugment?.(aug.id)) return false;
    if (typeof aug.isEligible === "function" && !aug.isEligible(pokemon, battle, team)) return false;
    return true;
  });
  const priorityTopRaw = getPriorityTopAugment(pokemon);
  const priorityTop = priorityTopRaw && (!isFull || !isNormalAugment(priorityTopRaw)) ? priorityTopRaw : null;
  const forced = getForcedBeginnerAugment(pokemon);
  const selected = [];
  let pool = [...available];

  const filterExclusives = (pickedId) => {
    pool = filterExclusiveAugments(pool, pickedId);
  };

  if (priorityTop) {
    selected.push(priorityTop);
    pool = pool.filter((a) => a.id !== priorityTop.id);
    filterExclusives(priorityTop.id);
  }

  if (isFull) {
    const anvilAug = AUGMENT_LIST.find((a) => a.id === "anvilStat");
    if (anvilAug && selected.length < count && !selected.some((a) => a.id === "anvilStat")) {
      selected.push(anvilAug);
      pool = pool.filter((a) => a.id !== "anvilStat");
      filterExclusives("anvilStat");
    }
  } else if (forced && selected.length < count && !selected.some((a) => a.id === forced.id) && pool.some((a) => a.id === forced.id)) {
    selected.push(forced);
    pool = pool.filter((a) => a.id !== forced.id);
    filterExclusives(forced.id);
  }

  if (selected.length < count && hasGamblingAddict(team) && !selected.some((a) => GAMBLE_BONUS_AUGMENT_IDS.includes(a.id))) {
    const gamblePool = pool.filter((a) => GAMBLE_BONUS_AUGMENT_IDS.includes(a.id));
    if (gamblePool.length > 0) {
      const gIdx = pickWeightedIndex(gamblePool, pokemon, battle);
      const picked = gamblePool[gIdx === -1 ? 0 : gIdx];
      selected.push(picked);
      pool = pool.filter((a) => a.id !== picked.id);
      filterExclusives(picked.id);
    }
  }

  while (selected.length < count && pool.length > 0) {
    const idx = pickWeightedIndex(pool, pokemon, battle);
    if (idx === -1) break;
    const picked = pool[idx];
    selected.push(picked);
    pool.splice(idx, 1);
    filterExclusives(picked.id);
  }

  for (let i = selected.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selected[i], selected[j]] = [selected[j], selected[i]];
  }

  if (isFull) {
    const anvilIdx = selected.findIndex((a) => a.id === "anvilStat");
    if (anvilIdx > 0) {
      const [anvil] = selected.splice(anvilIdx, 1);
      selected.unshift(anvil);
    } else if (anvilIdx === -1) {
      const anvilAug = AUGMENT_LIST.find((a) => a.id === "anvilStat");
      if (anvilAug) {
        if (selected.length >= count) selected.pop();
        selected.unshift(anvilAug);
      }
    }
  }

  if (priorityTop) {
    const pIdx = selected.findIndex((a) => a.id === priorityTop.id);
    if (pIdx > 0) {
      const [pAug] = selected.splice(pIdx, 1);
      selected.unshift(pAug);
    } else if (pIdx === -1) {
      if (selected.length >= count) selected.pop();
      selected.unshift(priorityTop);
    }
  }

  return selected;
}


/**
 * 팀 내 포켓몬별로 서로 다른 3개의 증강을 가중치 기반으로 추첨합니다.
 * 포켓몬마다 중복되지 않는 증강을 우선 배분하여 포켓몬 간 목록이 서로 다르게 구성됩니다.
 * @param {Array} team
 * @returns {Object} { [pokeKey]: augment[] }
 */
export function rollTeamAugments(team, battle = null) {
  if (!Array.isArray(team)) return {};
  const choicesMap = {};
  const globalPickedIds = new Set();

  team.forEach((poke, idx) => {
    if (!poke) return;
    const key = poke.originalIndex ?? poke.id ?? idx;
    const currentCount = Array.isArray(poke.augments) ? poke.augments.filter((a) => isNormalAugment(a)).length : 0;
    const isFull = currentCount >= 3;

    const available = AUGMENT_LIST.filter((aug) => {
      if (isFull && aug.cost !== "-") return false;
      if (!isRollableAugmentType(aug) || aug.isRandom === false || aug.weight === "-" || getAugmentWeight(aug, poke, battle) <= 0) return false;
      if (poke.hasAugment?.(aug.id)) return false;
      if (typeof aug.isEligible === "function" && !aug.isEligible(poke, battle, team)) return false;
      return true;
    });

    const priorityTopRaw = getPriorityTopAugment(poke);
    const priorityTop = priorityTopRaw && (!isFull || !isNormalAugment(priorityTopRaw)) ? priorityTopRaw : null;
    const forced = getForcedBeginnerAugment(poke);
    const chosen = [];
    if (priorityTop) {
      chosen.push(priorityTop);
    }
    if (isFull) {
      const anvilAug = AUGMENT_LIST.find((a) => a.id === "anvilStat");
      if (anvilAug && chosen.length < 3 && !chosen.some((a) => a.id === "anvilStat")) {
        chosen.push(anvilAug);
      }
    } else if (forced && chosen.length < 3 && !chosen.some((a) => a.id === forced.id) && available.some((a) => a.id === forced.id)) {
      chosen.push(forced);
      globalPickedIds.add(forced.id);
    }

    let unused = available.filter((a) => !globalPickedIds.has(a.id) && !chosen.some((c) => c.id === a.id));
    let already = available.filter((a) => globalPickedIds.has(a.id) && !chosen.some((c) => c.id === a.id));

    const filterExclusives = (pickedId) => {
      unused = filterExclusiveAugments(unused, pickedId);
      already = filterExclusiveAugments(already, pickedId);
    };

    if (chosen.length > 0) {
      chosen.forEach((c) => filterExclusives(c.id));
    }

    if (chosen.length < 3 && hasGamblingAddict(team) && !chosen.some((a) => GAMBLE_BONUS_AUGMENT_IDS.includes(a.id))) {
      const gambleUnused = unused.filter((a) => GAMBLE_BONUS_AUGMENT_IDS.includes(a.id));
      const gambleAlready = already.filter((a) => GAMBLE_BONUS_AUGMENT_IDS.includes(a.id));
      if (gambleUnused.length > 0) {
        const gIdx = pickWeightedIndex(gambleUnused, poke, battle || team);
        const picked = gambleUnused[gIdx === -1 ? 0 : gIdx];
        chosen.push(picked);
        globalPickedIds.add(picked.id);
        const uIdx = unused.findIndex((a) => a.id === picked.id);
        if (uIdx !== -1) unused.splice(uIdx, 1);
        filterExclusives(picked.id);
      } else if (gambleAlready.length > 0) {
        const gIdx = pickWeightedIndex(gambleAlready, poke, battle || team);
        const picked = gambleAlready[gIdx === -1 ? 0 : gIdx];
        chosen.push(picked);
        const aIdx = already.findIndex((a) => a.id === picked.id);
        if (aIdx !== -1) already.splice(aIdx, 1);
        filterExclusives(picked.id);
      }
    }

    while (chosen.length < 3 && unused.length > 0) {
      const idx = pickWeightedIndex(unused, poke, battle || team);
      if (idx === -1) break;
      const [pick] = unused.splice(idx, 1);
      chosen.push(pick);
      globalPickedIds.add(pick.id);
      filterExclusives(pick.id);
    }
    while (chosen.length < 3 && already.length > 0) {
      const idx = pickWeightedIndex(already, poke, battle || team);
      if (idx === -1) break;
      const [pick] = already.splice(idx, 1);
      chosen.push(pick);
      filterExclusives(pick.id);
    }

    for (let i = chosen.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chosen[i], chosen[j]] = [chosen[j], chosen[i]];
    }

    if (isFull) {
      const anvilIdx = chosen.findIndex((a) => a.id === "anvilStat");
      if (anvilIdx > 0) {
        const [anvil] = chosen.splice(anvilIdx, 1);
        chosen.unshift(anvil);
      } else if (anvilIdx === -1) {
        const anvilAug = AUGMENT_LIST.find((a) => a.id === "anvilStat");
        if (anvilAug) {
          if (chosen.length >= 3) chosen.pop();
          chosen.unshift(anvilAug);
        }
      }
    }

    if (priorityTop) {
      const pIdx = chosen.findIndex((a) => a.id === priorityTop.id);
      if (pIdx > 0) {
        const [pAug] = chosen.splice(pIdx, 1);
        chosen.unshift(pAug);
      } else if (pIdx === -1) {
        if (chosen.length >= 3) chosen.pop();
        chosen.unshift(priorityTop);
      }
    }

    choicesMap[key] = chosen;
  });

  return choicesMap;
}
