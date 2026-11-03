import { AUGMENT_LIST } from "../entity/Augment/AugmentData";

/**
 * 포켓몬이 선택 가능한 증강을 무작위(중복 없이) 추첨합니다.
 * 포켓몬당 증강은 최대 3개까지 보유할 수 있습니다.
 */
export function rollAugments(pokemon, count = 3, battleOrTeam = null) {
  if (!pokemon) return [];
  const currentCount = Array.isArray(pokemon.augments) ? pokemon.augments.length : 0;
  if (currentCount >= 3) return [];

  // 이미 보유한 증강 제외
  const available = AUGMENT_LIST.filter((aug) => {
    if (pokemon.hasAugment?.(aug.id)) return false;
    if (typeof aug.isEligible === "function" && !aug.isEligible(pokemon, battleOrTeam)) return false;
    return true;
  });
  const pool = [...available];
  const selected = [];

  const pickCount = Math.min(count, pool.length);
  for (let i = 0; i < pickCount; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    selected.push(pool[idx]);
    pool.splice(idx, 1);
  }

  return selected;
}

/**
 * 플레이어 팀에서 증강 슬롯(<3)이 남아있는 포켓몬에게 랜덤 증강 1개를 즉시 부여합니다.
 * @param {object} battle
 * @param {object} preferredPokemon
 * @returns {{ target: object, augment: object } | null}
 */
export function grantRandomAugment(battle, preferredPokemon = null) {
  if (!battle) return null;
  const team = [preferredPokemon, battle.player, battle.playerBench1, battle.playerBench2].filter(
    (p, idx, arr) => p && arr.indexOf(p) === idx && (p.augments || []).length < 3
  );

  if (team.length === 0) return null;
  const target = team[0];
  const rolled = rollAugments(target, 1, battle);
  if (!rolled || rolled.length === 0) return null;

  const aug = rolled[0];
  const applied = target.applyAugment(aug, battle);
  if (!applied) return null;

  return { target, augment: aug };
}

/**
 * 팀 내 포켓몬별로 서로 다른 3개의 증강을 추첨합니다.
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
    const currentCount = Array.isArray(poke.augments) ? poke.augments.length : 0;
    if (currentCount >= 3) {
      choicesMap[key] = [];
      return;
    }

    const available = AUGMENT_LIST.filter((aug) => {
      if (poke.hasAugment?.(aug.id)) return false;
      if (typeof aug.isEligible === "function" && !aug.isEligible(poke, battle || team, team)) return false;
      return true;
    });

    const unused = available.filter((a) => !globalPickedIds.has(a.id));
    const already = available.filter((a) => globalPickedIds.has(a.id));

    const shuffle = (arr) => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    const shuffledUnused = shuffle(unused);
    const shuffledAlready = shuffle(already);

    const chosen = [];
    while (chosen.length < 3 && shuffledUnused.length > 0) {
      const pick = shuffledUnused.pop();
      chosen.push(pick);
      globalPickedIds.add(pick.id);
    }
    while (chosen.length < 3 && shuffledAlready.length > 0) {
      chosen.push(shuffledAlready.pop());
    }

    choicesMap[key] = chosen;
  });

  return choicesMap;
}
