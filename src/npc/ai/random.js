export function npcAiRandom(choices) {
  // 기본 선택지 순서 기준 가중치
  const baseWeights = [20, 20, 20, 20, 10, 10];

  // 실제 존재하는 선택지만 추출
  const validChoices = choices.filter((v) => v !== undefined && v !== null);

  // 실제 선택지 개수에 맞게 가중치 조정
  const weights = baseWeights.slice(0, validChoices.length);

  // 🔹 선택지가 빠졌을 때 가중치 자동 보정
  // → 남은 weight 총합이 100이 되도록 비율 보정
  const total = weights.reduce((a, b) => a + b, 0);
  const normalized = weights.map((w) => (w / total) * 100);

  // 🔹 확률에 따라 랜덤 선택
  const rand = Math.random() * 100;
  let sum = 0;
  for (let i = 0; i < validChoices.length; i++) {
    sum += normalized[i];
    if (rand < sum) {
      return validChoices[i];
    }
  }

  // 혹시 모를 엣지 케이스 (부동소수점 오차)
  return validChoices[validChoices.length - 1];
}
