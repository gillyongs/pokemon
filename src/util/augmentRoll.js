import { AUGMENT_LIST } from "../entity/Augment/AugmentData";

/**
 * 포켓몬이 선택 가능한 증강 3개를 무작위(중복 없이) 추첨합니다.
 */
export function rollAugments(pokemon, count = 3) {
  // 이미 보유한 증강 제외
  const available = AUGMENT_LIST.filter((aug) => !pokemon?.hasAugment?.(aug.id));
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
