import skillEffectSearch from "../entity/Skill/SkillEffect";

export const applySkillEffects = (bt, enqueue) => {
  // skillUser 끝부분에서 호출되는 함수
  const skillEffectList = bt[bt.turn.atk].temp.useSkill?.skillEffectList;

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

export const applySkillEffectSerial = (bt, enqueue, skillEffectList) => {
  // 연속기에서 여러번 실행되는 부가효과 (울맷 etc..) 처리

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
  // 아직은 무릎차기 밖에 없음
  const skillEffectList = bt[bt.turn.atk].temp.useSkill?.skillEffectList;
  if (skillEffectList && typeof skillEffectList[Symbol.iterator] === "function") {
    for (const skillEffect of skillEffectList) {
      if (skillEffect?.name === "빗나감패널티") {
        const skillFunction = skillEffectSearch(skillEffect.name);
        if (typeof skillFunction === "function") {
          skillFunction(bt, enqueue, skillEffect);
        }
      }
    }
  }
};
