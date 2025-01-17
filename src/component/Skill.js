class Skill {
  constructor(name, type, power, accur, pp, touch, atype, dtype, stype) {
    this.name = name;
    this.power = power;
    this.type = type;
    this.accur = accur;
    this.pp = pp;
    this.touch = touch;
    this.atype = atype;
    this.dtype = dtype;
    this.stype = stype;
  }
}

class SkillList {
  constructor() {
    this.items = [
      new Skill("화염볼", "불꽃", 120, 100, 5, false, "atk", "def", true),
      new Skill("무릎차기", "격투", 130, 90, 10, true, "atk", "def", true),
      new Skill("기습", "악", 70, 100, 5, true, "atk", "def", true),
      new Skill("아이언헤드", "강철", 80, 100, 15, true, "atk", "def", true),
    ];
  }
  // ID로 객체 찾기
  search(name) {
    return this.items.find((item) => item.name === name) || null;
  }
}

// 싱글턴 객체 생성 (전역에서 사용 가능)
const skillList = new SkillList();
export default skillList;
