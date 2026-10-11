import sampleList from "../entity/Pokemon/SamplePokemon";

export const isSupporter = (pokemon) => pokemon?.role === "서포터";
export const isTanker = (pokemon) => pokemon?.role === "물리막이" || pokemon?.role === "특수막이";
export const isAttacker = (pokemon) => pokemon?.role === "물리어태커" || pokemon?.role === "특수어태커";
export const isLegendary = (pokemon) => !!pokemon?.feature?.legendary;
export const isMega = (pokemon) => !!pokemon?.megaData;

/**
 * 포켓몬의 타입이 주어진 타입 집합과 겹치는 개수를 반환합니다.
 */
export const getOverlapCount = (pokemon, typeSet) => {
  let count = 0;
  if (pokemon?.type1 && typeSet.has(pokemon.type1)) count++;
  if (pokemon?.type2 && typeSet.has(pokemon.type2)) count++;
  return count;
};

/**
 * 기존 포켓몬들과 타입이 최소한으로 겹치는(가능하면 0개) 후보들을 필터링합니다.
 */
export const filterByMinTypeOverlap = (candidateList, otherPokemonList) => {
  if (!candidateList || candidateList.length <= 1 || !otherPokemonList || otherPokemonList.length === 0) {
    return candidateList;
  }

  const existingTypes = new Set(
    otherPokemonList.flatMap((p) => [p.type1, p.type2].filter(Boolean))
  );

  if (existingTypes.size === 0) return candidateList;

  // 1) 겹치는 타입이 0개인 후보
  const zeroOverlap = candidateList.filter((p) => getOverlapCount(p, existingTypes) === 0);
  if (zeroOverlap.length > 0) return zeroOverlap;

  // 2) 0개가 없다면 1개만 겹치는 후보
  const oneOverlap = candidateList.filter((p) => getOverlapCount(p, existingTypes) === 1);
  if (oneOverlap.length > 0) return oneOverlap;

  return candidateList;
};

/**
 * 특정 슬롯(targetIndex)에 들어갈 랜덤 포켓몬 ID를 규칙에 따라 선택합니다.
 * 
 * 규칙:
 * 1. 초전설 포켓몬 및 메가진화 포켓몬은 각각 최대 한마리까지만 가능, 도감번호(no) 중복 불가
 * 2. 서포터 역할군은 첫번째 칸(index 0)에만 가능
 * 3. 서포터와 탱커는 합쳐서 2마리 이하 (어태커 최소 1마리)
 * 4. 조건에 부합하는 캐릭터가 없다면 1번 규칙만 유지하고 그 외 포켓몬 중 아무거나 추가
 * 5. 확률 규칙:
 *    - 첫 열(index 0)에 서포터가 올 확률 30%
 *    - 팀에 초전설이 있을 확률 10%
 *    - 팀에 메가진화가 있을 확률 20%
 *    - 탱커와 서포터가 합쳐서 둘일 확률 15%
 * 6. 가능하면 기존 포켓몬과 타입이 겹치지 않게 선택
 */
export const getRandomPokemonForSlot = (currentTeam, targetIndex, options = {}) => {
  const {
    forceSupporter,
    allowSupporter,
    forceTanker,
    allowTanker,
    forceAttacker,
    allowAttacker,
    forceLegendary,
    allowLegendary,
    forceMega,
    allowMega,
  } = options;

  const otherPokemon = currentTeam
    .map((id, i) => (i !== targetIndex && id ? sampleList.getDataById(id) : null))
    .filter(Boolean);

  const existingNos = otherPokemon.map((p) => p.no).filter(Boolean);
  const hasLegendary = otherPokemon.some(isLegendary);
  const hasMega = otherPokemon.some(isMega);

  // 1. 규칙 1 필터링: 초전설 최대 1마리, 메가진화 최대 1마리, 도감번호 중복 불가, 동일 샘플 ID 중복 불가
  const rule1Candidates = sampleList.items.filter((p) => {
    if (currentTeam.includes(p.id)) return false;
    if (existingNos.includes(p.no)) return false;
    if (hasLegendary && isLegendary(p)) return false;
    if (hasMega && isMega(p)) return false;
    return true;
  });

  if (rule1Candidates.length === 0) {
    const fallback = sampleList.items.filter((p) => !currentTeam.includes(p.id));
    if (fallback.length > 0) {
      return fallback[Math.floor(Math.random() * fallback.length)].id;
    }
    return sampleList.items[Math.floor(Math.random() * sampleList.items.length)].id;
  }

  // 2. 규칙 2 & 3 필터링
  const supporterOrTankerCount = otherPokemon.filter((p) => isSupporter(p) || isTanker(p)).length;
  const attackerCount = otherPokemon.filter(isAttacker).length;
  const remainingEmptySlots = [0, 1, 2].filter((i) => i !== targetIndex && currentTeam[i] === null).length;

  const validCandidates = rule1Candidates.filter((p) => {
    // 규칙 2: 서포터는 첫번째 칸(index 0)에만 가능
    if (targetIndex !== 0 && isSupporter(p)) {
      return false;
    }

    // 규칙 3: 서포터 + 탱커는 합쳐서 2마리 이하 (어태커 최소 1마리 보장)
    // 3-1) 이미 서포터+탱커가 2마리 이상이면 더 이상 서포터/탱커 불가
    if (supporterOrTankerCount >= 2 && (isSupporter(p) || isTanker(p))) {
      return false;
    }

    // 3-2) 남은 다른 빈 슬롯이 없고 현재 팀에 어태커가 0마리면, 이번 슬롯은 반드시 어태커여야 함
    if (remainingEmptySlots === 0 && attackerCount === 0 && !isAttacker(p)) {
      return false;
    }

    return true;
  });

  const baseCandidates = validCandidates.length > 0 ? validCandidates : rule1Candidates;

  // 3. 확률 및 세부 옵션 제어 (단일 슬롯 호출 시 기본 확률 적용)
  // 3-1. 서포터: 첫 열 30% 확률
  let effectiveForceSupporter = forceSupporter;
  let effectiveAllowSupporter = allowSupporter;

  if (effectiveForceSupporter === undefined && effectiveAllowSupporter === undefined) {
    if (targetIndex === 0) {
      const rollSupporter = Math.random() < 0.30;
      effectiveForceSupporter = rollSupporter;
      effectiveAllowSupporter = rollSupporter;
    } else {
      effectiveForceSupporter = false;
      effectiveAllowSupporter = false;
    }
  }

  // 3-2. 탱커 & 서포터 합 2마리 확률 15% 제어
  let effectiveForceTanker = forceTanker;
  let effectiveAllowTanker = allowTanker;
  let effectiveForceAttacker = forceAttacker;
  let effectiveAllowAttacker = allowAttacker;

  if (
    effectiveForceTanker === undefined &&
    effectiveAllowTanker === undefined &&
    effectiveForceAttacker === undefined &&
    effectiveAllowAttacker === undefined
  ) {
    // 이미 다른 슬롯에 서포터/탱커가 1마리 있는 상태에서 추가로 탱커를 뽑아 2마리를 채울 확률은 15%
    if (supporterOrTankerCount === 1) {
      const rollSecondSupTank = Math.random() < 0.15;
      if (!rollSecondSupTank) {
        effectiveAllowTanker = false;
        effectiveAllowSupporter = false;
        effectiveForceAttacker = true;
      }
    }
  }

  // 3-3. 초전설: 잔여 슬롯 기준 확률 분배
  let effectiveForceLegendary = forceLegendary;
  let effectiveAllowLegendary = allowLegendary;

  if (effectiveForceLegendary === undefined && effectiveAllowLegendary === undefined) {
    if (!hasLegendary) {
      const emptyCount = remainingEmptySlots + 1;
      const rate = 1 - Math.pow(1 - 0.10, 1 / emptyCount);
      const rollLegendary = Math.random() < rate;
      effectiveForceLegendary = rollLegendary;
      effectiveAllowLegendary = rollLegendary;
    } else {
      effectiveForceLegendary = false;
      effectiveAllowLegendary = false;
    }
  }

  // 3-4. 메가진화: 잔여 슬롯 기준 확률 분배
  let effectiveForceMega = forceMega;
  let effectiveAllowMega = allowMega;

  if (effectiveForceMega === undefined && effectiveAllowMega === undefined) {
    if (!hasMega) {
      const emptyCount = remainingEmptySlots + 1;
      const rate = 1 - Math.pow(1 - 0.20, 1 / emptyCount);
      const rollMega = Math.random() < rate;
      effectiveForceMega = rollMega;
      effectiveAllowMega = rollMega;
    } else {
      effectiveForceMega = false;
      effectiveAllowMega = false;
    }
  }

  // 4. 필터링 적용
  let filtered = baseCandidates.filter((p) => {
    if (effectiveForceSupporter && !isSupporter(p)) return false;
    if (effectiveAllowSupporter === false && isSupporter(p)) return false;

    if (effectiveForceTanker && !isTanker(p)) return false;
    if (effectiveAllowTanker === false && isTanker(p)) return false;

    if (effectiveForceAttacker && !isAttacker(p)) return false;
    if (effectiveAllowAttacker === false && isAttacker(p)) return false;

    if (effectiveForceLegendary && !isLegendary(p)) return false;
    if (effectiveAllowLegendary === false && isLegendary(p)) return false;

    if (effectiveForceMega && !isMega(p)) return false;
    if (effectiveAllowMega === false && isMega(p)) return false;

    return true;
  });

  // 조건에 맞는 후보가 없을 경우 단계적 완화
  if (filtered.length === 0) {
    filtered = baseCandidates.filter((p) => {
      if (effectiveAllowSupporter === false && isSupporter(p)) return false;
      if (effectiveAllowTanker === false && isTanker(p)) return false;
      if (effectiveAllowAttacker === false && isAttacker(p)) return false;
      if (effectiveAllowLegendary === false && isLegendary(p)) return false;
      if (effectiveAllowMega === false && isMega(p)) return false;
      return true;
    });
  }

  if (filtered.length === 0) {
    filtered = baseCandidates;
  }

  // 5. 가능하면 기존 포켓몬과 타입이 겹치지 않도록 필터링
  const typeFiltered = filterByMinTypeOverlap(filtered, otherPokemon);
  const candidatesToPick = typeFiltered.length > 0 ? typeFiltered : filtered;

  const chosen = candidatesToPick[Math.floor(Math.random() * candidatesToPick.length)];
  return chosen.id;
};

/**
 * 기존 팀(배열)에서 빈 슬롯(null)을 규칙에 맞는 랜덤 포켓몬으로 채웁니다.
 * - 첫 열에 서포터가 올 확률: 30%
 * - 팀에 초전설이 있을 확률: 10%
 * - 팀에 메가진화가 있을 확률: 20%
 * - 탱커와 서포터가 합쳐서 둘일 확률: 15%
 */
export const fillRandomTeam = (existingTeam = [null, null, null], teamSize = 3) => {
  const team = [...existingTeam];
  while (team.length < teamSize) {
    team.push(null);
  }

  const emptyIndices = [];
  for (let i = 0; i < teamSize; i++) {
    if (team[i] === null) emptyIndices.push(i);
  }

  if (emptyIndices.length === 0) return team;

  const existingPokemons = team.filter(Boolean).map((id) => sampleList.getDataById(id));
  const hasExistingLegendary = existingPokemons.some(isLegendary);
  const hasExistingMega = existingPokemons.some(isMega);
  const existingSupporters = existingPokemons.filter(isSupporter).length;
  const existingTankers = existingPokemons.filter(isTanker).length;
  const existingSupTank = existingSupporters + existingTankers;

  const shouldAddLegendary = !hasExistingLegendary && Math.random() < 0.10;
  const shouldAddMega = !hasExistingMega && Math.random() < 0.20;
  const shouldSlot0BeSupporter = emptyIndices.includes(0) && existingSupporters === 0 && Math.random() < 0.30;
  const shouldTotalSupTankBeTwo = Math.random() < 0.15;

  // 슬롯별 역할 계획
  const plannedRoles = {}; // slotIndex => "서포터" | "탱커" | "어태커"

  if (emptyIndices.includes(0)) {
    plannedRoles[0] = shouldSlot0BeSupporter ? "서포터" : null;
  }

  // 탱커 및 서포터 수 결정
  const totalSupTankTarget = shouldTotalSupTankBeTwo ? 2 : (shouldSlot0BeSupporter || existingSupTank >= 1 ? 1 : (Math.random() < 0.4 ? 1 : 0));
  let remainingTankersToPlace = Math.max(0, totalSupTankTarget - existingSupTank - (shouldSlot0BeSupporter ? 1 : 0));

  const slotsNeedingRole = emptyIndices.filter((idx) => plannedRoles[idx] === null || plannedRoles[idx] === undefined);
  // 셔플하여 탱커 배정
  const shuffledSlots = [...slotsNeedingRole].sort(() => Math.random() - 0.5);

  for (const slotIdx of shuffledSlots) {
    if (remainingTankersToPlace > 0) {
      plannedRoles[slotIdx] = "탱커";
      remainingTankersToPlace--;
    } else {
      plannedRoles[slotIdx] = "어태커";
    }
  }

  // 특수 슬롯 배정 계획 (초전설, 메가진화)
  let legendarySlot = null;
  let megaSlot = null;

  // 메가진화는 어태커 슬롯에 우선 배정
  const emptyAttackerSlots = emptyIndices.filter((idx) => plannedRoles[idx] === "어태커");
  const shuffledAttackerSlots = [...emptyAttackerSlots].sort(() => Math.random() - 0.5);

  if (shouldAddMega && shuffledAttackerSlots.length > 0) {
    megaSlot = shuffledAttackerSlots.pop();
  }

  // 초전설은 남은 어태커 또는 탱커 슬롯에 배정 (서포터 제외)
  const remainingSlotsForLegendary = emptyIndices.filter(
    (idx) => plannedRoles[idx] !== "서포터" && idx !== megaSlot
  ).sort(() => Math.random() - 0.5);

  if (shouldAddLegendary && remainingSlotsForLegendary.length > 0) {
    legendarySlot = remainingSlotsForLegendary.pop();
  }

  for (let i = 0; i < teamSize; i++) {
    if (team[i] === null) {
      const role = plannedRoles[i];
      const options = {
        forceSupporter: role === "서포터",
        allowSupporter: role === "서포터",
        forceTanker: role === "탱커",
        allowTanker: role === "탱커",
        forceAttacker: role === "어태커",
        allowAttacker: role === "어태커",
        forceLegendary: i === legendarySlot,
        allowLegendary: i === legendarySlot,
        forceMega: i === megaSlot,
        allowMega: i === megaSlot,
      };
      team[i] = getRandomPokemonForSlot(team, i, options);
    }
  }

  return team;
};

/**
 * 3마리 포켓몬 팀을 규칙에 따라 랜덤 생성합니다.
 */
export const getRandomTeam = (teamSize = 3) => {
  return fillRandomTeam([null, null, null], teamSize);
};
