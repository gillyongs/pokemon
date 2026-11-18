import { atkSkills } from "./skillList/atk.js";
import { catkSkills } from "./skillList/catk.js";
import { natkSkills } from "./skillList/natk.js";
import { bufSkills } from "./skillList/buf.js";

export const allSkills = [...atkSkills, ...catkSkills, ...natkSkills, ...bufSkills];

// 싱글턴 객체
class SkillList {
  constructor() {
    this.items = allSkills;
  }
  search(name, abil = null) {
    const abilName = typeof abil === "object" ? abil?.name : abil;
    if (name === "물수리검" && abilName === "유대진화") {
      const bondSkill = this.items.find((item) => item.name === "물수리검(유대진화)");
      if (bondSkill) {
        return { ...bondSkill, name: "물수리검" };
      }
    }
    return this.items.find((item) => item.name === name) || this.items.find((item) => item.name === "임시스킬");
  }
  getDataById(name, abil = null) {
    if (!name) return null;
    return this.search(name, abil);
  }
}

const skillList = new SkillList();
export default skillList;
