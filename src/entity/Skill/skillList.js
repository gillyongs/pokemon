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
  search(name) {
    const item = this.items.find((item) => item.name === name) || this.items.find((item) => item.name === "임시스킬");
    if (item.name === "물수리검+") {
      return { ...item, name: "물수리검" };
    }
    return item;
  }
}

const skillList = new SkillList();
export default skillList;
