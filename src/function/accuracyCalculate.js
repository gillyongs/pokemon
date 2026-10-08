// 명중률 계산
export function getAccuracy(bt, skill, attacker) {
  let accur = skill.accur;

  // 필중
  if (accur === "-") {
    return 100; //ai 가중치 계산에 사용하므로 100 리턴해줘야함
  }

  // 비바라기 번개 폭풍 필중
  const weatherSkill = ["번개", "폭풍"];
  if (weatherSkill.includes(skill.name) && bt.field.weather.isRainy) {
    return 100;
  }

  // 쾌청 번개 폭풍 보정
  if (weatherSkill.includes(skill.name) && bt.field.weather.isSunny) {
    accur = 50;
  }

  // 복안 명중률 1.3배 보정
  // 일격기엔 적용되지 않는다
  if (attacker.abil === "복안" && typeof accur === "number" && !skill.feature?.oneShot) {
    accur = Math.floor(accur * 1.3);
  }

  return accur;
}
