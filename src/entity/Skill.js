class Skill {
  constructor(
    name,
    type,
    power,
    accur,
    pp,
    touch,
    atype,
    dtype,
    stype,
    skillEffectList
  ) {
    this.name = name;
    this.power = power;
    this.type = type;
    this.accur = accur;
    this.pp = pp;
    this.touch = touch;
    this.atkCatk = atype;
    this.defCdef = dtype;
    this.atkNatk = stype;
    this.skillEffectList = skillEffectList;
  }
}

class SkillList {
  constructor() {
    this.items = [
      new Skill("화염볼", "불꽃", 120, 100, 5, false, "atk", "def", "atk", [
        { name: "화상", probability: 100 },
        { name: "얼음치료" },
      ]),
      new Skill("무릎차기", "격투", 130, 90, 10, true, "atk", "def", "atk", [
        { name: "빗나감패널티" },
      ]),
      new Skill("기습", "악", 70, 100, 5, true, "atk", "def", true),
      new Skill("아이언헤드", "강철", 80, 100, 15, true, "atk", "def", "atk", [
        { name: "풀죽음", probability: 30 },
      ]),
      new Skill("섀도볼", "고스트", 80, 100, 15, false, "catk", "cdef", "atk", [
        {
          name: "능력치증감",
          probability: 20,
          abil: "cdef",
          target: "def",
          value: -1,
        },
      ]),
      new Skill(
        "다이맥스포",
        "드래곤",
        100,
        100,
        5,
        false,
        "catk",
        "cdef",
        true
      ),
      new Skill("오물웨이브", "독", 95, 100, 10, false, "catk", "cdef", "atk", [
        { name: "독", probability: 100 },
      ]),
      new Skill("화염방사", "불꽃", 90, 100, 15, false, "catk", "cdef", "atk", [
        { name: "화상", probability: 10 },
      ]),
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
