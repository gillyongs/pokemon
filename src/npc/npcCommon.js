export const npcCommon = (battle, actNumber) => {
  // 자동기술(역린)이나 충전기술(메테오빔) 사용
  if (battle.npc?.auto !== null || battle.npc?.charge !== null) {
    return [battle.npc.autoSN];
  }

  const sk1 = battle.npc.origin.sk1;
  const sk2 = battle.npc.origin.sk2;
  const sk3 = battle.npc.origin.sk3;
  const sk4 = battle.npc.origin.sk4;

  let arr = [1, 2, 3, 4, "npcBench1", "npcBench2"];

  // 기절한 포켓몬으로 교체 막기
  if (battle.npcBench1?.faint) arr = arr.filter((v) => v !== "npcBench1");
  if (battle.npcBench2?.faint) arr = arr.filter((v) => v !== "npcBench2");

  // 구애시리즈 스킬 고정 처리
  const onlySkill = battle.npc?.tempStatus?.onlySkill;
  if ([1, 2, 3, 4].includes(onlySkill)) {
    arr = arr.filter((v) => v === onlySkill || typeof v === "string");
  }

  // 연속 사용 불가 스킬 체크 (블러드문 등)
  const recentSkill = battle.npc?.tempStatus?.recentSkillUse?.name;
  const skills = [sk1, sk2, sk3, sk4];

  skills.forEach((sk, i) => {
    const num = i + 1;
    if (recentSkill === sk?.name && sk?.feature?.noDouble) {
      arr = arr.filter((v) => v !== num);
    }
  });

  // 도발 or 돌격조끼 상태 시 변화기(natk/buf) 제외
  const taunt = battle.npc.tempStatus.taunt !== null;
  const doljo = battle.npc.item === "돌격조끼";
  if (taunt || doljo) {
    skills.forEach((sk, i) => {
      const num = i + 1;
      if (sk?.stype === "natk" || sk?.stype === "buf") {
        arr = arr.filter((v) => v !== num);
      }
    });
  }

  // PP 0 이하 스킬 제외
  skills.forEach((sk, i) => {
    const num = i + 1;
    if (sk?.pp <= 0) {
      arr = arr.filter((v) => v !== num);
    }
  });

  return arr;
};
