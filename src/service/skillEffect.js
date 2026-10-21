import skillEffectSearch from "../entity/Skill/SkillEffect";

export const applySkillEffects = (bt, enqueue, skillEffectList = bt[bt.turn.atk].turn.useSkill?.skillEffectList) => {
  // skillUse 끝부분에서 호출되는 함수
  // 기술 내부에 존재하는 부가효과 함수 배열을 순회하며 부가효과 함수를 실행한다
  // 연속기의 경우 일부 부가효과만 적용되기에 전용 skillEffectList를 인자로 받는다

  if (skillEffectList && typeof skillEffectList[Symbol.iterator] === "function") {
    for (const skillEffect of skillEffectList) {
      if (skillEffect?.name) {
        const skillFunction = skillEffectSearch(skillEffect.name);
        if (typeof skillFunction === "function") {
          skillFunction(bt, enqueue, skillEffect);
        }
      }
    }
  }
};

export const skillEffectsAfter = (bt, enqueue) => {
  // 대부분의 부가효과는 스킬 명중시에만 발동하기에
  // skillUse 끝부분에서 처리함
  // 스킬이 빗나갔을때에도 발동되는 부가효과만 여기서 처리.
  // 무릎차기 빗나감, 자폭
  const skillEffectList = bt[bt.turn.atk].turn.useSkill?.skillEffectList;
  if (skillEffectList && typeof skillEffectList[Symbol.iterator] === "function") {
    for (const skillEffect of skillEffectList) {
      if (skillEffect?.name === "빗나감패널티") {
        const skillFunction = skillEffectSearch(skillEffect.name);
        if (typeof skillFunction === "function") {
          skillFunction(bt, enqueue, skillEffect);
        }
      }
      if (skillEffect?.name === "자폭" && !bt[bt.turn.atk].faint) {
        const skillFunction = skillEffectSearch(skillEffect.name);
        if (typeof skillFunction === "function") {
          skillFunction(bt, enqueue, skillEffect);
        }
      }
    }
  }
};
