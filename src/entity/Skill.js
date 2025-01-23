class Skill {
  constructor(
    name,
    type,
    power,
    accur,
    pp,
    prior,
    touch,
    stype,
    skillEffectList,
    skillRequirement
  ) {
    this._validateParams(
      name,
      type,
      power,
      accur,
      pp,
      prior,
      touch,
      stype,
      skillEffectList,
      skillRequirement
    );

    this.name = name;
    this.power = power;
    this.type = type;
    this.accur = accur;
    let ppp = Math.floor(pp / 5) * 3 + pp;
    this.pp = ppp;
    this.prior = prior;
    this.touch = touch;
    this.stype = stype; //atk = 물리공격, catk = 특수공격, natk = 상대방 대상 변화기, buf = 자신 대상 변화기
    this.skillEffectList = skillEffectList;
    this.skillRequirement = skillRequirement;
  }
  _validateParams(
    name,
    type,
    power,
    accur,
    pp,
    prior,
    touch,
    stype,
    skillEffectList,
    skillRequirement
  ) {
    if (typeof name !== "string") console.error("name must be a string", name);
    if (typeof type !== "string") console.error("type must be a string", type);
    if (typeof power !== "number")
      console.error("power must be a number", power);
    if (typeof accur !== "number")
      console.error("accur must be a number", accur);
    if (typeof pp !== "number") console.error("pp must be a number", pp);
    if (typeof prior !== "number")
      console.error("prior must be a number", prior);
    if (typeof touch !== "boolean")
      console.error("touch must be a boolean", touch);
    if (!["atk", "catk", "natk", "buf"].includes(stype))
      console.error("stype must be one of 'atk', 'catk', 'natk', 'buf'", stype);
    if (
      !Array.isArray(skillEffectList) &&
      skillEffectList !== undefined &&
      skillEffectList !== null
    )
      console.error("skillEffectList must be an array", skillEffectList);
    if (
      typeof skillRequirement !== "string" &&
      (skillRequirement !== undefined) & (skillRequirement !== null)
    )
      console.error("skillRequirement must be a string", skillRequirement);
  }
}

class SkillList {
  constructor() {
    this.items = [
      new Skill("화염볼", "불꽃", 120, 100, 5, 0, false, "atk", [
        { name: "화상", probability: 10 },
        { name: "얼음치료" },
      ]),
      new Skill("무릎차기", "격투", 130, 9, 10, 0, true, "atk", [
        { name: "빗나감패널티" },
      ]),
      new Skill("기습", "악", 70, 100, 5, 1, true, "atk", null, "기습"),
      new Skill("아이언헤드", "강철", 80, 100, 15, 0, true, "atk", [
        { name: "풀죽음", probability: 30 },
      ]),
      new Skill("섀도볼", "고스트", 80, 100, 15, 0, false, "catk", [
        {
          name: "능력치증감",
          probability: 20,
          abil: "cdef",
          target: "def",
          value: -1,
        },
      ]),
      new Skill("다이맥스포", "드래곤", 100, 100, 5, 0, false, "catk"),
      new Skill("오물웨이브", "독", 95, 100, 10, 0, false, "catk", [
        { name: "독", probability: 10 },
      ]),
      new Skill("화염방사", "불꽃", 90, 100, 15, 0, false, "catk", [
        { name: "화상", probability: 10 },
      ]),
      new Skill(
        "10만볼트", //스킬명
        "전기", //스킬타입
        90, //위력
        100, //명중률
        15, //pp
        0, //우선도
        false, //접촉
        "catk", //atk catk natk buf
        [{ name: "마비", probability: 10 }]
      ),
      new Skill(
        "열풍", //스킬명
        "불꽃", //스킬타입
        95, //위력
        90, //명중률
        10, //pp
        0, //우선도
        false, //접촉
        "catk", //atk catk natk buf
        [{ name: "화상", probability: 10 }]
      ),
      new Skill(
        "폭풍", //스킬명
        "비행", //스킬타입
        110, //위력
        70, //명중률
        10, //pp
        0, //우선도
        false, //접촉
        "catk", //atk catk natk buf
        [{ name: "혼란", probability: 30 }]
      ),
      new Skill(
        "날개쉬기", //스킬명
        "비행", //스킬타입
        0, //위력
        0, //명중률
        5, //pp
        0, //우선도
        false, //접촉
        "buf", //atk catk natk buf
        [{ name: "날개쉬기" }, { name: "회복" }]
      ),
      new Skill(
        "블러드문", //스킬명
        "노말", //스킬타입
        140, //위력
        100, //명중률
        5, //pp
        0, //우선도
        false, //접촉
        "catk" //atk catk natk buf
      ),
      new Skill(
        "하이퍼보이스", //스킬명
        "노말", //스킬타입
        90, //위력
        100, //명중률
        10, //pp
        0, //우선도
        false, //접촉
        "catk" //atk catk natk buf
      ),
      new Skill(
        "대지의힘", //스킬명
        "땅", //스킬타입
        90, //위력
        100, //명중률
        10, //pp
        0, //우선도
        false, //접촉
        "catk", //atk catk natk buf
        [
          {
            name: "능력치증감",
            probability: 10,
            abil: "cdef",
            target: "def",
            value: -1,
          },
        ]
      ),
      new Skill(
        "진공파", //스킬명
        "격투", //스킬타입
        40, //위력
        100, //명중률
        30, //pp
        1, //우선도
        false, //접촉
        "catk" //atk catk natk buf
      ),
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
