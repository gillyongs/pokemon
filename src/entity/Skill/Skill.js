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
    skillRequirement,
    text
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
      skillRequirement,
      text
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
    this.skillEffectList.unshift({ name: "공통" });
    this.skillRequirement = skillRequirement;
    let stypes;
    if (stype === "atk") {
      stypes = "물리";
    } else if (stype === "catk") {
      stypes = "특수";
    } else if (stype === "natk" || stype === "buf") {
      stypes = "변화";
    }
    if (stype === "atk" || stype === "catk") {
      this.text = "위력 " + power + " / 명중 " + accur + " / " + stypes;
    } else if (stype === "natk") {
      this.text = "명중 " + accur;
    }
    if (text !== "") {
      this.text += " / " + text;
    }

    if (stype === "buf") {
      this.text = text;
    }
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
    skillRequirement,
    text
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
    if (!Array.isArray(skillEffectList))
      console.error("skillEffectList must be an array", skillEffectList);
    if (
      typeof skillRequirement !== "string" &&
      (skillRequirement !== undefined) & (skillRequirement !== null)
    )
      console.error("skillRequirement must be a string", skillRequirement);
    if (typeof text !== "string") console.error("text must be a string", text);
  }
}

class SkillList {
  constructor() {
    this.items = [
      new Skill(
        "화염볼",
        "불꽃",
        120,
        100,
        5,
        0,
        false,
        "atk",
        [{ name: "화상", probability: 10 }, { name: "얼음치료" }],
        null,
        "10%의 확률로 상대를 화상 상태로 만든다."
      ),
      new Skill(
        "무릎차기",
        "격투",
        130,
        90,
        10,
        0,
        true,
        "atk",
        [{ name: "빗나감패널티" }],
        null,
        "빗나가면 자신이 전체 HP의 ½의 데미지를 입는다."
      ),
      new Skill(
        "기습",
        "악",
        70,
        100,
        5,
        2,
        true,
        "atk",
        [],
        "기습",
        "상대가 쓴 기술이 공격기술이 아니면 실패한다. (우선도 +1)"
      ),
      new Skill(
        "아이언헤드",
        "강철",
        80,
        100,
        15,
        0,
        true,
        "atk",
        [{ name: "풀죽음", probability: 30 }],
        null,
        "30%의 확률로 상대를 풀죽게 만든다."
      ),
      new Skill(
        "섀도볼",
        "고스트",
        80,
        100,
        15,
        0,
        false,
        "catk",
        [
          {
            name: "능력치증감",
            probability: 20,
            abil: "cdef",
            target: "def",
            value: -1,
          },
        ],
        null,
        "20% 확률로 상대의 특수방어를 1랭크 떨어뜨린다."
      ),
      new Skill(
        "다이맥스포",
        "드래곤",
        100,
        100,
        5,
        0,
        false,
        "catk",
        [],
        null,
        ""
      ),
      new Skill(
        "오물웨이브",
        "독",
        95,
        100,
        10,
        0,
        false,
        "catk",
        [{ name: "독", probability: 10 }],
        null,
        "10% 확률로 상대를 독 상태로 만든다."
      ),
      new Skill(
        "화염방사",
        "불꽃",
        90,
        100,
        15,
        0,
        false,
        "catk",
        [{ name: "화상", probability: 10 }],
        null,
        "10% 확률로 상대를 화상 상태로 만든다."
      ),
      new Skill(
        "10만볼트", //스킬명
        "전기", //스킬타입
        90, //위력
        100, //명중률
        15, //pp
        0, //우선도
        false, //접촉
        "catk", //atk catk natk buf
        [{ name: "마비", probability: 10 }],
        null,
        "10%의 확률로 상대를 마비 상태로 만든다."
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
        [{ name: "화상", probability: 10 }],
        null,
        "10% 확률로 상대를 화상 상태로 만든다."
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
        [{ name: "혼란", probability: 30 }],
        null,
        "30% 확률로 상대를 혼란 상태로 만든다."
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
        [{ name: "날개쉬기" }, { name: "회복" }],
        null,
        "최대 HP의 절반만큼 회복한다. 사용한 턴에 비행 타입이 없어진다."
      ),
      new Skill(
        "블러드문", //스킬명
        "노말", //스킬타입
        140, //위력
        100, //명중률
        5, //pp
        0, //우선도
        false, //접촉
        "catk", //atk catk natk buf
        [],
        null,
        "이 기술은 2회 연속으로 사용할 수 없다."
      ),
      new Skill(
        "하이퍼보이스", //스킬명
        "노말", //스킬타입
        90, //위력
        100, //명중률
        10, //pp
        0, //우선도
        false, //접촉
        "catk", //atk catk natk buf
        [],
        null,
        ""
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
        ],
        null,
        "10%의 확률로 상대의 특수방어를 1랭크 떨어뜨린다."
      ),
      new Skill(
        "진공파", //스킬명
        "격투", //스킬타입
        40, //위력
        100, //명중률
        30, //pp
        1, //우선도
        false, //접촉
        "catk", //atk catk natk buf
        [],
        null,
        "우선도 +1"
      ),
      new Skill(
        "칼춤", //스킬명
        "노말", //스킬타입
        0, //위력
        0, //명중률
        20, //pp
        0, //우선도
        false, //접촉
        "buf", //atk catk natk buf
        [
          {
            name: "능력치증감",
            probability: 100,
            abil: "atk",
            target: "atk",
            value: 2,
          },
        ],
        null,
        "자신의 공격을 2랭크 올린다."
      ),
      new Skill(
        "섀도크루", //스킬명
        "고스트", //스킬타입
        70, //위력
        100, //명중률
        15, //pp
        0, //우선도
        true, //접촉
        "atk", //atk catk natk buf
        [{ name: "급소" }],
        null,
        "급소에 맞을 확률이 높다."
      ),
      new Skill(
        "야습", //스킬명
        "고스트", //스킬타입
        40, //위력
        100, //명중률
        30, //pp
        1, //우선도
        true, //접촉
        "atk", //atk catk natk buf
        [],
        null,
        "우선도 +1"
      ),
      new Skill(
        "치근거리기", //스킬명
        "페어리", //스킬타입
        90, //위력
        90, //명중률
        10, //pp
        0, //우선도
        true, //접촉
        "catk", //atk catk natk buf
        [
          {
            name: "능력치증감",
            probability: 10,
            abil: "atk",
            target: "def",
            value: -1,
          },
        ],
        null,
        "10% 확률로 상대의 공격을 떨어뜨린다."
      ),
      new Skill(
        "고드름떨구기", //스킬명
        "얼음", //스킬타입
        85, //위력
        90, //명중률
        10, //pp
        0, //우선도
        false, //접촉
        "atk", //atk catk natk buf
        [{ name: "풀죽음", probability: 30 }],
        null,
        "30%의 확률로 상대를 풀죽게 만든다."
      ),
      new Skill(
        "성스러운칼", //스킬명
        "격투", //스킬타입
        90, //위력
        100, //명중률
        15, //pp
        0, //우선도
        true, //접촉
        "atk", //atk catk natk buf
        [{ name: "천진" }],
        null,
        "상대의 능력 변화에 상관없이 데미지를 준다."
      ),
      new Skill(
        "얼음뭉치", //스킬명
        "얼음", //스킬타입
        40, //위력
        100, //명중률
        30, //pp
        1, //우선도
        false, //접촉
        "atk", //atk catk natk buf
        [],
        null,
        "우선도 +1"
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
