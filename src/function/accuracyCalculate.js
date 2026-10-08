export function getAccuracy(skill, attacker) {
  let accur = skill.accur;

  // 복안 명중률 1.3배 보정
  // 일격기엔 적용되지 않는다
  if (attacker.abil === "복안" && typeof accur === "number" && !skill.feature?.oneShot) {
    accur = Math.floor(accur * 1.3);
  }

  return accur;
}
