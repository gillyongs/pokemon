// random 함수 정의 및 export
export function random(chance) {
  const random = Math.random() * 100;
  return random < chance;
}
