import skillEffectSearch from "../entity/Skill/SkillEffect";

export const applySkillEffects = (bt, enqueue) => {
  const skillEffectList =
    bt[bt.turn.atk].origin["sk" + bt.turn.atkSN].skillEffectList;
  if (Array.isArray(skillEffectList)) {
    skillEffectList.forEach((skillEffect) => {
      if (skillEffect.name) {
        const skillFunction = skillEffectSearch(skillEffect.name);
        if (typeof skillFunction === "function") {
          skillFunction(bt, enqueue, skillEffect);
        }
      }
    });
  }
};

export const skillEffectsAfter = (bt, enqueue) => {
  const skillEffectList =
    bt[bt.turn.atk].origin["sk" + bt.turn.atkSN].skillEffectList;
  if (Array.isArray(skillEffectList)) {
    skillEffectList.forEach((skillEffect) => {
      if (skillEffect.name === "빗나감패널티") {
        const skillFunction = skillEffectSearch(skillEffect.name);
        if (typeof skillFunction === "function") {
          skillFunction(bt, enqueue, skillEffect);
        }
      }
    });
  }
};
