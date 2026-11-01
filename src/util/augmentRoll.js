import { AUGMENT_LIST } from "../entity/Augment/AugmentData";

/**
 * 포켓몬이 선택 가능한 증강을 무작위(중복 없이) 추첨합니다.
 * 포켓몬당 증강은 최대 3개까지 보유할 수 있습니다.
 */
export function rollAugments(pokemon, count = 3) {
  if (!pokemon) return [];
  const currentCount = Array.isArray(pokemon.augments) ? pokemon.augments.length : 0;
  if (currentCount >= 3) return [];

  // 이미 보유한 증강 제외
  const available = AUGMENT_LIST.filter((aug) => !pokemon.hasAugment?.(aug.id));
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
  const rolled = rollAugments(target, 1);
  if (!rolled || rolled.length === 0) return null;

  const aug = rolled[0];
  const applied = target.applyAugment(aug, battle);
  if (!applied) return null;

  return { target, augment: aug };
}
