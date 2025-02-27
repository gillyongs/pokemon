// prettier-ignore
class Skill { 
  constructor(name, type, power, accur, pp, prior, touch, stype, skillRequirement, text, skillEffectList){
    this._validateParams(name, type, power, accur, pp, prior, touch, stype, skillEffectList, skillRequirement, text);

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
  _validateParams(name, type, power, accur, pp, prior, touch, stype, skillEffectList, skillRequirement, text){
    if (typeof name !== "string") console.error("name must be a string", name);
    if (typeof type !== "string") console.error("type must be a string", type);
    if (stype !== "buf" && typeof power !== "number")
      console.error("atack skill power must be a number", power);
    if (stype !== "buf" && typeof accur !== "number")
      console.error("atack skill accur must be a number", accur);
    if (stype === "buf" && typeof power !== "string")
      console.error("buf skill power must be a NaN", power);
    if (stype === "buf" && typeof accur !== "string")
      console.error("buf skill accur must be a NaN", accur);
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

// prettier-ignore
class SkillList {
  constructor() {
    this.items = [
      new Skill("화염볼", "불꽃", 120, 100, 5, 0, false, "atk", null, "10%의 확률로 상대를 화상 상태로 만든다.", 
        [{ name: "화상", probability: 10 }, { name: "얼음치료" }]),

      new Skill("무릎차기", "격투", 130, 90, 10, 0, true, "atk", null, "빗나가면 자신이 전체 HP의 ½의 데미지를 입는다.",
        [{ name: "빗나감패널티" }] ),

      new Skill("기습", "악", 70, 100, 5, 2, true, "atk", "기습", "상대가 쓴 기술이 공격기술이 아니면 실패한다. (우선도 +1)",
        [], ),

      new Skill("아이언헤드", "강철", 80, 100, 15, 0, true, "atk", null, "30%의 확률로 상대를 풀죽게 만든다.",
        [{ name: "풀죽음", probability: 30 }] ),

      new Skill("섀도볼", "고스트", 80, 100, 15, 0, false, "catk", null, "20% 확률로 상대의 특수방어를 1랭크 떨어뜨린다.",
        [{ name: "능력치증감", probability: 20, abil: "cdef", target: "def", value: -1 }], ),

      new Skill("다이맥스포", "드래곤", 100, 100, 5, 0, false, "catk", null, "",
        [],),

      new Skill("오물웨이브", "독", 95, 100, 10, 0, false, "catk", null, "10% 확률로 상대를 독 상태로 만든다.",
        [{ name: "독", probability: 10 }],),

      new Skill("화염방사", "불꽃", 90, 100, 15, 0, false, "catk", null, "10% 확률로 상대를 화상 상태로 만든다.",
        [{ name: "화상", probability: 10 }],),
        
      new Skill("10만볼트", "전기", 90, 100, 15, 0, false, "catk", null, "10%의 확률로 상대를 마비 상태로 만든다.",
        [{ name: "마비", probability: 10 }], ),

      new Skill("열풍", "불꽃", 95, 90, 10, 0, false, "catk", null, "10% 확률로 상대를 화상 상태로 만든다.",
        [{ name: "화상", probability: 10 }], ),

      new Skill("폭풍", "비행", 110, 70, 10, 0, false, "catk", null, "30% 확률로 상대를 혼란 상태로 만든다.",
        [{ name: "혼란", probability: 30 }], ),

      new Skill("날개쉬기", "비행", "-", "-", 5, 0, false, "buf", null, "최대 HP의 절반만큼 회복한다. 사용한 턴에 비행 타입이 없어진다.",
        [{ name: "날개쉬기" }, { name: "회복" }], ),

      new Skill("블러드문", "노말", 140, 100, 5, 0, false, "catk", null, "이 기술은 2회 연속으로 사용할 수 없다.",
        [], ),

      new Skill("하이퍼보이스", "노말", 90, 100, 10, 0, false, "catk",  null, "",
        []),

      new Skill("대지의힘", "땅", 90, 100, 10, 0, false, "catk", null, "10%의 확률로 상대의 특수방어를 1랭크 떨어뜨린다.",
        [{ name: "능력치증감", probability: 10, abil: "cdef", target: "def", value: -1 }], ),

      new Skill("진공파", "격투", 40, 100, 30, 1, false, "catk", null, "우선도 +1",
        [], ),

      new Skill("칼춤", "노말", "-", "-", 20, 0, false, "buf", null, "자신의 공격을 2랭크 올린다.",
        [{ name: "능력치증감", probability: 100, abil: "atk", target: "atk", value: 2 }],),

      new Skill("섀도크루", "고스트", 70, 100, 15, 0, true, "atk", null, "급소에 맞을 확률이 높다.",
        [{ name: "급소" }], ),

      new Skill("야습", "고스트", 40, 100, 30, 1, true, "atk", null, "우선도 +1",
        [], ),

      new Skill("치근거리기", "페어리", 90, 90, 10, 0, true, "catk", null, "10% 확률로 상대의 공격을 떨어뜨린다.",
        [{ name: "능력치증감", probability: 10, abil: "atk", target: "def", value: -1 }], ),
        
      new Skill("고드름떨구기", "얼음", 85, 90, 10, 0, false, "atk", null, "30%의 확률로 상대를 풀죽게 만든다.",
        [{ name: "풀죽음", probability: 30 }], ),
      
      new Skill("성스러운칼", "격투", 90, 100, 15, 0, true, "atk", null, "상대의 능력 변화에 상관없이 데미지를 준다.",
        [{ name: "천진" }], ),
      
      new Skill("얼음뭉치", "얼음", 40, 100, 30, 1, false, "atk", null, "우선도 +1",
        [], ),
      
      new Skill("거수참", "강철", 100, 100, 5, 0, true, "atk", null, "",
        [], ),

      new Skill("인파이트", "격투", 120, 100, 5, 0, true, "atk", null, "사용 후 사용자의 방어와 특수방어가 1랭크 떨어진다.",
        [{ name: "능력치증감", probability: 100, abil: "def", target: "atk", value: -1 }, { name: "능력치증감", probability: 100, abil: "cdef", target: "atk", value: -1 }]),
      
      new Skill("드럼어택", "풀", 80, 100, 10, 0, false, "atk", null, "상대의 스피드를 1랭크 떨어뜨린다.",
        [{ name: "능력치증감", probability: 100, abil: "speed", target: "def", value: -1 }], ),

      new Skill("그래스슬라이더", "풀", 55, 100, 20, 777, true, "atk",  null, "그래스필드일 때 우선도 +1",
        []),

      new Skill("탁쳐서떨구기", "악", 65, 100, 20, 0, true, "atk",  null, "상대가 지닌 물건이 있으면 없애고 추가 데미지를 준다.",
        [{name: "탁떨"}]),

      new Skill("유턴", "벌레", 70, 100, 20, 0, true, "atk",  null, "공격 후 다른 포켓몬과 교체한다.",
        [{name: "유턴"}]),

      new Skill("해수스파우팅", "물", 150, 100, 5, 0, false, "catk", null, "자신의 HP가 적을수록 기술의 위력이 떨어진다.",
        [],),

      new Skill("근원의파동", "물", 110, 85, 10, 0, false, "catk", null, "",
        [],),

      new Skill("번개", "전기", 110, 70, 10, 0, false, "catk", null, "30%의 확률로 상대를 마비 상태로 만든다. 비가 내리면 반드시 명중한다.",
        [{ name: "마비", probability: 30 }], ),

      new Skill("냉동빔", "얼음", 90, 100, 10, 0, false, "catk", null, "10% 확률로 상대를 얼음 상태로 만든다.",
        [{ name: "얼음", probability: 10 }], ),
      
      new Skill("볼트체인지", "전기", 70, 100, 20, 0, false, "catk",  null, "공격 후 다른 포켓몬과 교체한다.",
        [{name: "유턴"}]),

      new Skill("매지컬샤인", "페어리", 80, 100, 10, 0, false, "catk", null, "",
        [],),

      new Skill("용성군", "드래곤", 130, 90, 5, 0, false, "catk", null, "사용 후 사용자의 특수공격이 2랭크 떨어진다.",
        [{ name: "능력치증감", probability: 100, abil: "catk", target: "atk", value: -2 }]),
      
      new Skill("라이트닝드라이브", "전기", 100, 100, 5, 0, false, "catk", null, "약점인 상대에게는 위력이 더욱 올라간다.",
        [],),
        
      

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
