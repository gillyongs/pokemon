import PokemonData from "../entity/Pokemon/PokemonData";

export const getBaseSpeedStat = (pokemon) => {
  if (!pokemon) return 100;
  const pId = pokemon.uniqueKey || pokemon.id;
  if (pId) {
    const speed = PokemonData.getPokemonDataByUniqueKeyAndColumn(pId, "speed");
    if (typeof speed === "number") return speed;
  }
  const name = pokemon.name;
  if (name) {
    const data = PokemonData.items?.find((p) => p.name === name);
    if (data && typeof data.speed === "number") return data.speed;
  }
  return 100;
};

export const criticalCalculate = (input, pokemon = null) => {
  let probability = 0;
  switch (input) {
    case 0:
      if (pokemon?.hasAugment?.("lostTechnologyCritical")) {
        const baseSpeed = getBaseSpeedStat(pokemon);
        probability = baseSpeed / 512;
      } else {
        probability = 1 / 24;
      }
      break;
    case 1:
      if (pokemon?.hasAugment?.("lostTechnologyCritical")) {
        const baseSpeed = getBaseSpeedStat(pokemon);
        probability = baseSpeed / 64;
      } else {
        probability = 1 / 8;
      }
      break;
    case 2:
      probability = 1 / 2;
      break;
    default:
      probability = 1;
      break;
  }

  // 증강 무한의 대검
  if (pokemon?.hasAugment?.("infinityEdge")) {
    probability += 0.25;
  }

  // 증강 징수의 총: 급소 확률 25% 증가
  if (pokemon?.hasAugment?.("collector")) {
    probability += 0.25;
  }

  // 버프 연습이 치명타를 낳는다: 스택당 급소 확률 1% 상승
  if (pokemon?.hasAugment?.("practiceMakesCritical")) {
    const practiceAug = pokemon.augments?.find((a) => a.id === "practiceMakesCritical");
    const stack = Number(pokemon.practiceCritStack ?? practiceAug?.practiceCritStack ?? 0);
    if (stack > 0) {
      probability += stack * 0.01;
    }
  }

  if (probability >= 1) return true;
  return Math.random() < probability;
};
