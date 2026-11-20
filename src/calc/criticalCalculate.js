import PokemonData from "../entity/Pokemon/PokemonData";

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

  // 아케인셰이드 투핸드소드 큐브 잠재능력: 급소 확률 증가
  const cubeStats = pokemon?.cubeStats;
  if (cubeStats?.critRate > 0) {
    probability += cubeStats.critRate / 100;
  }

  if (probability >= 1) return true;
  return Math.random() < probability;
};

// 포켓몬의 스피드 종족값을 가져오는 함수
// 과거 1세대 급소 확률 계산 증강
const getBaseSpeedStat = (pokemon) => {
  if (!pokemon) return 100;
  const pId = pokemon.uniqueKey || pokemon.id;
  if (pId) {
    const speed = PokemonData.getPokemonDataByUniqueKeyAndColumn(pId, "speed");
    if (typeof speed === "number") return speed;
  }
};
