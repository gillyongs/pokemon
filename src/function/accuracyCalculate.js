// 명중률 계산
export function getAccuracy(bt, skill, attacker) {
  let accur = skill.accur;

  // 대검돌격 필중 보정
  const defender = bt[bt.turn?.def];
  if (defender?.tempStatus?.glaiveRush) {
    return 100;
  }

  // 노가드 특성: 공격자 또는 방어자가 노가드면 필중
  if (attacker?.abil === "노가드" || defender?.abil === "노가드") {
    return 100;
  }

  // 억까 방지 증강: 원래 기술 명중률이 80% 이상이면 필중
  if (attacker?.hasAugment?.("noUnfairMiss") && typeof skill.accur === "number" && skill.accur >= 80) {
    return 100;
  }

  // 필중
  if (accur === "-") {
    // 도박 중독이더라도 필중기가 공격기면 50%로 절반 처리
    if (attacker?.hasAugment?.("gamblingAddict") && (skill.stype === "atk" || skill.stype === "catk")) {
      return 50;
    }
    return 100; //ai 가중치 계산에 사용하므로 100 리턴해줘야함
  }

  // 설경 눈보라 필중
  if (skill.name === "눈보라" && bt.field.weather.isSnow) {
    return 100;
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

  // 도박 중독 증강: 모든 공격기 명중률 절반
  if (attacker?.hasAugment?.("gamblingAddict") && (skill.stype === "atk" || skill.stype === "catk") && typeof accur === "number") {
    accur = Math.floor(accur / 2);
  }

  return accur;
}
