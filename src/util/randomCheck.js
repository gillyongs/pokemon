// random 함수 정의 및 export
export function random(chance, skillAccur) {
  if (skillAccur && chance === "-") {
    // 필중기
    return 1;
  }
  const random = Math.random() * 100;
  return random < chance;
}
