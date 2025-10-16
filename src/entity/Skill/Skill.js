// prettier-ignore
class Skill { 
  constructor(name, type, power, accur, pp, prior, stype, skillRequirement, text, skillEffectList, feature){
    this._validateParams(name, type, power, accur, pp, prior, stype, skillEffectList, skillRequirement, text);

    this.name = name;
    this.power = power;
    this.type = type;
    this.accur = accur;
    let ppp = Math.floor(pp / 5) * 3 + pp;
    this.pp = ppp;
    this.prior = prior;
    this.stype = stype; //atk = 물리공격, catk = 특수공격, natk = 상대방 대상 변화기, buf = 자신 대상 변화기
    // natk = 상대방이 기절하면 실패, buf = 상대방이 기절해도 성공
    // 방어 가능 여부와 판정이 비슷하나 날려버리기는 방어를 뚫는다
    this.skillEffectList = skillEffectList;
    this.skillEffectList.push({ name: "공통" });
    this.skillRequirement = skillRequirement;
    this.feature = feature
    if(!feature){
      this.feature = {}
    }
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
  _validateParams(name, type, power, accur, pp, prior, stype, skillEffectList, skillRequirement, text){
    if(name === '임시스킬'){return}
    if (typeof name !== "string") console.error("name must be a string", name);
    if (typeof type !== "string") console.error("type must be a string", type);
    if ((stype === "atk" || stype === "catk") && typeof power !== "number" && power !== '-'){
      console.error("atack skill power must be a number", power);
      console.error(name)
    }
    if (stype !== "buf" && typeof accur !== "number" && accur !== '-'){
      console.error("atack skill accur must be a number", accur);
      console.error(name)
    }
    if (stype === "buf" && typeof power !== "string"){
      console.error("buf skill power must be a NaN", power);
      console.error(name)
    }

    if (stype === "buf" && typeof accur !== "string"){
      console.error("buf skill accur must be a NaN", accur);
      console.error(name)
    }

    if (typeof pp !== "number") {
      console.error("pp must be a number", pp);
      console.error(name)
    }
    if (typeof prior !== "number"){
      console.error("prior must be a number", prior);
      console.error(name)
    }
      
    if (!["atk", "catk", "natk", "buf"].includes(stype)){
      console.error("stype must be one of 'atk', 'catk', 'natk', 'buf'", stype);
      console.error(name)
    }
      
    if (!Array.isArray(skillEffectList)){
      console.error("skillEffectList must be an array", skillEffectList);
      console.error(name)
    }
      
    if (
      typeof skillRequirement !== "string" &&
      (skillRequirement !== undefined) & (skillRequirement !== null)
    ){
      console.error("skillRequirement must be a string", skillRequirement);
      console.error(name)
    }
      
    if (typeof text !== "string"){
        console.error(name)
      console.error("text must be a string", text);
    }
  }
}

// prettier-ignore
class SkillList {
  constructor() {
    this.items = [
      
      new Skill("임시스킬", "노말", 
        80+'위력', 100+'명중률', 15+'pp', 0+'우선도', 
        "atk"+"물리특수", null, "임시스킬",
        [], {} ),

      new Skill("화염볼", "불꽃", 
        120, 100, 5, 0, 
        "atk", null, 
        "10%의 확률로 상대를 화상 상태로 만든다.", 
        [{ name: "화상", probability: 10 }], {}),
      
      new Skill("기합구슬", "격투", 
        120, 70, 5, 0, 
        "catk", null, 
        "10%의 확률로 상대의 특수방어를 떨어뜨린다.", 
        [{ name: "능력치증감", probability: 10, abil: "cdef", target: "def", value: -1 }], {}),

      new Skill("무릎차기", "격투", 
        130, 90, 10, 0, 
        "atk", null, 
        "빗나가면 자신이 전체 HP의 ½의 데미지를 입는다.",
        [{ name: "빗나감패널티" }], 
        {touch:true}),

      new Skill("기습", "악", 
        70, 100, 5, 2,
        "atk", "기습", 
        "상대가 쓴 기술이 공격기술이 아니면 실패한다. (우선도 +1)",
        [], {touch:true}),

      new Skill("아이언헤드", "강철",
        80, 100, 15, 0, 
        "atk", null, 
        "30%의 확률로 상대를 풀죽게 만든다.",
        [{ name: "풀죽음", probability: 30 }], 
        {touch:true}),

      new Skill("폭포오르기", "물",
        80, 100, 15, 0, 
        "atk", null, 
        "30%의 확률로 상대를 풀죽게 만든다.",
        [{ name: "풀죽음", probability: 20 }], 
        {touch:true}),

      new Skill("섀도볼", "고스트", 
        80, 100, 15, 0, 
        "catk", null, 
        "20% 확률로 상대의 특수방어를 1랭크 떨어뜨린다.",
        [{ name: "능력치증감", probability: 20, abil: "cdef", target: "def", value: -1 }], {}),

      new Skill("다이맥스포", "드래곤", 
        100, 100, 5, 0, 
        "catk", null, "상대가 다이맥스 중이면 데미지가 2배가 된다.",
        [],{}),

     new Skill("크로스썬더", "전기", 
        100, 100, 5, 0, 
        "atk", null, "크로스플레임과 동시에 사용하면 데미지가 2배가 된다.",
        [],{}),

      new Skill("파워젬", "바위", 
        80, 100, 20, 0, 
        "catk", null, "보석처럼 반짝이는 빛을 발사하여 상대를 공격한다.",
        [],{}),

      new Skill("오물웨이브", "독", 
        95, 100, 10, 0, 
        "catk", null, 
        "10% 확률로 상대를 독 상태로 만든다.",
        [{ name: "독", probability: 10 }], {}),

      new Skill("화염방사", "불꽃", 
        90, 100, 15, 0, 
        "catk", null, 
        "10% 확률로 상대를 화상 상태로 만든다.",
        [{ name: "화상", probability: 10 }], {}),
        
      new Skill("10만볼트", "전기", 
        90, 100, 15, 0, 
        "catk", null, 
        "10%의 확률로 상대를 마비 상태로 만든다.",
        [{ name: "마비", probability: 10 }], {}),

      new Skill("열풍", "불꽃",
        95, 90, 10, 0, 
        "catk", null, 
        "10% 확률로 상대를 화상 상태로 만든다.",
        [{ name: "화상", probability: 10 }], {}),

      new Skill("폭풍", "비행", 
        110, 70, 10, 0, 
        "catk", null, 
        "30% 확률로 상대를 혼란 상태로 만든다.",
        [{ name: "혼란", probability: 30 }], {}),

      new Skill("날개쉬기", "비행", 
        "-", "-", 5, 0,
        "buf", null, 
        "최대 HP의 절반만큼 회복한다. 사용한 턴에 비행 타입이 없어진다.",
        [{ name: "날개쉬기" }, { name: "회복" }], {}),

      new Skill("블러드문", "노말", 
        140, 100, 5, 0, 
        "catk", null, 
        "이 기술은 2회 연속으로 사용할 수 없다.",
        [], {}),

      new Skill("하이퍼보이스", "노말", 
        90, 100, 10, 0,  
        "catk",  null, 
        "시끄럽게 울리는 큰 진동을 상대에게 전달하여 공격한다.",
        [], {sound: true}),

      new Skill("대지의힘", "땅", 
        90, 100, 10, 0,  
        "catk", null, 
        "10%의 확률로 상대의 특수방어를 1랭크 떨어뜨린다.",
        [{ name: "능력치증감", probability: 10, abil: "cdef", target: "def", value: -1 }], ),

      new Skill("진공파", "격투", 
        40, 100, 30, 1,  
        "catk", null, 
        "우선도 +1",
        [], ),

      new Skill("아쿠아제트", "물", 
        40, 100, 20, 1,  
        "atk", null, 
        "우선도 +1",
        [], {touch:true}),

      new Skill("풀묶기", "풀", 
        90, 100, 20, 0,  
        "catk", null, 
        "풀을 휘감아서 상대를 쓰러뜨린다.",
        [], {}),

      new Skill("칼춤", "노말", 
        "-", "-", 20, 0,  
        "buf", null, 
        "자신의 공격을 2랭크 올린다.",
        [{ name: "능력치증감", probability: 100, abil: "atk", target: "atk", value: 2 }],),

      new Skill("용의춤", "드래곤", 
        "-", "-", 20, 0,  
        "buf", null, 
        "자신의 공격과 스피드를 1랭크 올린다.",
        [{ name: "능력치증감", probability: 100, abil: "atk", target: "atk", value: 1 },
          { name: "능력치증감", probability: 100, abil: "speed", target: "atk", value: 1 }],),
        
      new Skill("섀도크루", "고스트", 
        70, 100, 15, 0,  
        "atk", null, 
        "급소에 맞을 확률이 높다.",
        [{ name: "급소" }], {touch:true} ),

      new Skill("야습", "고스트", 
        40, 100, 30, 1,  
        "atk", null, 
        "우선도 +1",
        [], {touch:true}  ),

      new Skill("신속", "노말", 
        80, 100, 5, 2,  
        "atk", null, 
        "우선도 +2",
        [], {touch:true}  ),

      new Skill("치근거리기", "페어리", 
        90, 90, 10, 0,  
        "atk", null, 
        "10% 확률로 상대의 공격을 1랭크 떨어뜨린다.",
        [{ name: "능력치증감", probability: 10, abil: "atk", target: "def", value: -1 }],{touch:true} ),
        
      new Skill("고드름떨구기", "얼음", 
        85, 90, 10, 0,  
        "atk", null, 
        "30%의 확률로 상대를 풀죽게 만든다.",
        [{ name: "풀죽음", probability: 30 }], ),
      
      new Skill("성스러운칼", "격투", 
        90, 100, 15, 0,  
        "atk", null, 
        "상대의 능력 변화에 상관없이 데미지를 준다.",
        [{ name: "천진" }],{touch:true} ),
      
      new Skill("얼음뭉치", "얼음", 
        40, 100, 30, 1,  
        "atk", null, 
        "우선도 +1",
        [], ),
      
      new Skill("거수참", "강철", 
        100, 100, 5, 0,  
        "atk", null, "다이맥스한 상대에게 2배 데미지를 준다",
        [],{touch:true} ),

      new Skill("인파이트", "격투", 
        120, 100, 5, 0,  
        "atk", null, 
        "사용 후 사용자의 방어와 특수방어가 1랭크 떨어진다.",
        [{ name: "능력치증감", probability: 100, abil: "def", target: "atk", value: -1 }, 
          { name: "능력치증감", probability: 100, abil: "cdef", target: "atk", value: -1 }]
        ,{touch:true}),
      
      new Skill("드럼어택", "풀", 
        80, 100, 10, 0,  
        "atk", null, 
        "상대의 스피드를 1랭크 떨어뜨린다.",
        [{ name: "능력치증감", probability: 100, abil: "speed", target: "def", value: -1 }], ),

      new Skill("그래스슬라이더", "풀", 
        55, 100, 20, 777,  
        "atk",  null, 
        "그래스필드일 때 우선도 +1",
        [], {touch:true}),

      new Skill("탁쳐서떨구기", "악", 
        65, 100, 20, 0,  
        "atk",  null, 
        "상대가 지닌 물건이 있으면 없애고 추가 데미지를 준다.",
        [{name: "탁떨"}], {touch:true}),

      new Skill("유턴", "벌레", 
        70, 100, 20, 0,  
        "atk",  null, 
        "공격 후 다른 포켓몬과 교체한다.",
        [{name: "유턴"}], {touch:true}),

      new Skill("해수스파우팅", "물", 
        150, 100, 5, 0,  
        "catk", null, 
        "자신의 HP가 적을수록 기술의 위력이 떨어진다.",
        [],),

      new Skill("근원의파동", "물", 
        110, 85, 10, 0,  
        "catk", null, 
        "파랗게 빛나는 무수한 광선으로 모든 상대를 공격한다.",
        [],),

      new Skill("번개", "전기", 
        110, 70, 10, 0,  
        "catk", null, 
        "30%의 확률로 상대를 마비 상태로 만든다. 비가 내리면 반드시 명중한다.",
        [{ name: "마비", probability: 30 }], ),

      new Skill("냉동빔", "얼음", 
        90, 100, 10, 0,  
        "catk", null, 
        "10% 확률로 상대를 얼음 상태로 만든다.",
        [{ name: "얼음", probability: 10 }], ),
      
      new Skill("볼트체인지", "전기", 
        70, 100, 20, 0,  
        "catk",  null, 
        "공격 후 다른 포켓몬과 교체한다.",
        [{name: "유턴"}]),

      new Skill("매지컬샤인", "페어리", 
        80, 100, 10, 0,  
        "catk", null, 
        "강력한 빛을 내어 상대에게 데미지를 준다.",
        [],),

      new Skill("용성군", "드래곤", 
        130, 90, 5, 0,  
        "catk", null, 
        "사용 후 사용자의 특수공격이 2랭크 떨어진다.",
        [{ name: "능력치증감", probability: 100, abil: "catk", target: "atk", value: -2 }]),
      
      new Skill("리프스톰", "풀", 
        130, 90, 5, 0,  
        "catk", null, 
        "사용 후 사용자의 특수공격이 2랭크 떨어진다.",
        [{ name: "능력치증감", probability: 100, abil: "catk", target: "atk", value: -2 }]),

      new Skill("라이트닝드라이브", "전기", 
        100, 100, 5, 0,  
        "catk", null, 
        "약점인 상대에게는 위력이 더욱 올라간다.",
        [],),

      new Skill("바디프레스", "격투", 
        80, 100, 15, 0,  
        "atk", null, 
        "몸을 부딪쳐서 공격한다. 방어가 높을수록 주는 데미지가 올라간다.",
        [], {touch:true}),

      new Skill("철벽", "강철", 
        "-", "-", 20, 0,  
        "buf", null, 
        "자신의 방어를 2랭크 올린다.",
        [{ name: "능력치증감", probability: 100, abil: "def", target: "atk", value: 2 }],),

      new Skill("거수탄", "강철", 
        100, 100, 5, 0,  
        "atk", null, 
        "온몸을 강하고 튼튼한 방패로 바꾼 다음 기세 좋게 부딪혀서 공격한다.",
        [], {touch:true}),

      new Skill("깨물어부수기", "악", 
        80, 100, 15, 0,  
        "atk", null, 
        "20% 확률로 상대의 방어를 1랭크 떨어뜨린다.",
        [{ name: "능력치증감", probability: 20, abil: "def", target: "def", value: -1 }],
      {touch:true} ),

      new Skill("성스러운불꽃", "불꽃", 
        100, 95, 5, 0,  
        "atk", null, 
        "50%의 확률로 상대를 화상 상태로 만든다.", 
        [{ name: "화상", probability: 50 }]),

      new Skill("지진", "땅", 
        100, 100, 10, 0,  
        "atk", null, 
        "자신의 주위에 있는 포켓몬을 공격한다.",
        [],),

      new Skill("HP회복", "노말", 
        "-", "-", 5, 0,  
        "buf", null, 
        "최대 HP의 절반만큼 회복한다.",
        [{ name: "회복" }], ),

      new Skill("브레이브버드", "비행", 
        120, 100, 15, 0,  
        "atk", null, 
        "자신도 대상에게 준 피해의 ⅓만큼 반동 피해를 받는다.",
        [{name: "반동"}], {touch:true}),  
      
      new Skill("개척하기", "풀", 
        50, 100, 20, 0,  
        "atk", null, 
        "자신의 스피드를 1랭크 올린다.",
        [{ name: "능력치증감", probability: 100, abil: "speed", target: "atk", value: 1 }], {touch:true}),

      new Skill("암석봉인", "바위", 
        60, 95, 15, 0,  
        "atk", null, 
        "상대방의 스피드를 1랭크 떨어뜨다.",
        [{ name: "능력치증감", probability: 100, abil: "speed", target: "def", value: -1 }], {}),

      new Skill("객기", "노말", 
        70, 100, 20, 0,  
        "atk", null, 
        "자신이 독, 마비, 화상 상태일 때 기술의 위력이 2배가 된다.",
        [], {touch:true} ),


       new Skill("웨이브태클", "물", 
        120, 100, 10, 0,  
        "atk", null, 
        "자신도 대상에게 준 피해의 ⅓만큼 반동 피해를 받는다.",
        [{name: "반동"}], {touch:true}),  

      new Skill("하품", "노말", 
        "-", "-", 10, 0,  
        "natk", null, 
        "큰 하품으로 졸음을 유도한다. 다음 턴에 상대를 잠듦 상태로 만든다.",
        [{name: "하품"}],{}),    

      new Skill("방어", "노말", 
        "-", "-", 10, 4,  
        "buf", "방어", 
        "상대의 공격을 전혀 받지 않는다. 연속으로 쓰면 실패하기 쉽다. (우선도 +4)",
        [{name: "방어"}],{}),    
      
      new Skill("땅가르기", "땅", 
        "-", 30, 5, 0,  
        "atk", null, 
        "땅이 갈라진 곳에 상대를 떨어뜨려 공격한다. 맞으면 일격에 기절한다.",
        [],{oneShot: true}),  
      
      new Skill("카타스트로피", "악", 
        "-", 90, 10, 0,  
        "catk", null, 
        "파멸적인 재앙에 휩쓸리게 하여 상대의 HP를 절반으로 만든다.",
        [],{}),    

      new Skill("스텔스록", "바위", 
        "-", "-", 20, 0,  
        "buf", null, 
        "상대의 주위에 바위를 띄워 교체되어 나온 상대 포켓몬에게 데미지를 준다.",
        [{name: "스텔스록"}],{}),    

      new Skill("독압정", "독", 
        "-", "-", 20, 0,  
        "buf", null, 
        "상대의 발밑에 독 압정을 뿌려 교체로 나온 상대 포켓몬에게 독을 퍼지게 한다. 2번 깔았을 경우 맹독을 퍼지게 한다.",
        [{name: "독압정"}],{}),    

      new Skill("날려버리기", "노말", 
        "-", "-", 20, -6,  
        "natk", null, 
        "상대를 날려버려서 교대할 포켓몬을 끌어낸다. (우선도 -6)",
        [{name: "강제교체"}],{}),    

      new Skill("악의파동", "악",
        80, 100, 15, 0, 
        "catk", null, 
        "20%의 확률로 상대를 풀죽게 만든다.",
        [{ name: "풀죽음", probability: 20 }], 
        {}),

      new Skill("오버히트", "불꽃", 
        130, 90, 5, 0,  
        "catk", null, 
        "사용 후 사용자의 특수공격이 2랭크 떨어진다.",
        [{ name: "능력치증감", probability: 100, abil: "catk", target: "atk", value: -2 }]),

        
      new Skill("불대문자", "불꽃", 
        110, 80, 5, 0, 
        "catk", null, 
        "10% 확률로 상대를 화상 상태로 만든다.",
        [{ name: "화상", probability: 10 }], {}),
      
      new Skill("문포스", "페어리", 
        95, 100, 15, 0,  
        "catk", null, 
        "30% 확률로 상대의 특수공격을 1랭크 떨어뜨린다.",
        [{ name: "능력치증감", probability: 30, abil: "catk", target: "def", value: -1 }],{} ),

      new Skill("전기자석파", "전기", 
        "-", 90, 20, 0,  
        "natk", null, 
        "약한 전격을 날려서 상대를 마비 상태로 만든다.",
        [{ name: "마비", probability: 100, failText:true }], {}),

        
      new Skill("뱀눈초리", "노말", 
        "-", 100, 30, 0,  
        "natk", null, 
        "배의 무늬로 겁을 주어 상대를 마비 상태로 만든다.",
        [{ name: "마비", probability: 100, failText:true  }], {}),


      new Skill("씨뿌리기", "풀", 
        "-", 90, 10, 0,  
        "natk", null, 
        "상대에게 씨를 뿌려 매 턴 상대 최대 HP의 ⅛만큼 빼앗아 회복한다.",
        [{ name: "씨뿌리기"}], {}),

      
      new Skill("대타출동", "노말", 
        "-", "-", 10, 0,  
        "buf", null, 
        "자신의 HP를 ¼ 깎아서 분신을 만든다. 분신은 자신의 대타가 된다.",
        [{ name: "대타출동"}], {}),

      new Skill("병상첨병", "고스트", 
        65, 100, 10, 0, 
        "catk", null, "상태이상인 상대에게 데미지가 2배가 된다.",
        [],{}),
       
      new Skill("도발", "악", 
        "-", 100, 20, 0,  
        "natk", null, 
        "상대를 화나게 하여 3턴 동안 데미지를 주는 기술밖에 쓸 수 없게 한다.",
        [{ name: "도발" }], {}),

      new Skill("아스트랄비트", "고스트", 
        120, 100, 5, 0, 
        "catk", null, "수많은 작은 영체를 상대에게 부딪쳐서 공격한다.",
        [],{}),

      new Skill("나쁜음모", "악", 
        "-", "-", 20, 0,  
        "buf", null, 
        "자신의 특수공격을 2랭크 올린다.",
        [{ name: "능력치증감", probability: 100, abil: "catk", target: "atk", value: 2 }],),
      
      new Skill("사이코쇼크", "에스퍼", 
        80, 100, 10, 0, 
        "catk", null, 
        "물리적인 데미지를 준다.",
        [],{}),
      
      new Skill("트릭", "에스퍼", 
        "-", 100, 10, 0,  
        "natk", null, 
        "상대의 빈틈을 노려 자신과 상대가 지닌 물건을 바꿔치기한다.",
        [{ name: "트릭" }], {}),
       
      new Skill("블리자드랜스", "얼음", 
        120, 100, 5, 0, 
        "atk", null, "눈보라를 두른 얼음의 창을 상대에게 던져서 공격한다.",
        [],{}),

      new Skill("10만마력", "땅", 
        95, 95, 10, 0, 
        "atk", null, "온몸을 써서 상대를 맹렬히 공격한다.",
        [],{touch:true}),

      new Skill("트릭룸", "에스퍼", 
        "-", "-", 5, -7,  
        "buf", null, 
        "이상한 공간을 만든다. 5턴 동안 느린 포켓몬부터 행동할 수 있다. (우선도 -7)",
        [{ name: "트릭룸" }], ),
      
      new Skill("플레어드라이브", "불꽃", 
        120, 100, 15, 0,  
        "atk", null, 
        "대상에게 준 피해의 ⅓만큼 반동 피해를 받는다. 10% 확률로 상대를 화상 상태로 만든다",
        [{name: "반동"}, { name: "화상", probability: 10 }], {touch:true}),  

      new Skill("역린", "드래곤", 
        120, 100, 10, 0,  
        "atk", null, 
        "2~3턴 동안 마구 난동 부려서 공격한다. 난동 부린 뒤에는 혼란에 빠진다.",
        [{name: "자동"}], {touch:true}),  

      new Skill("수류연타", "물", 
        25, 100, 5, 0, 
        "atk", null, "물 흐르듯 3회의 연격을 날린다. 반드시 급소에 맞는다.",
        [], {touch:true, punch:true, suru:true, mustCritical: true}),

      new Skill("고드름침", "얼음", 
        25, 100, 30, 0, 
        "atk", null, "2-5회 동안 연속으로 쓴다",
        [], {twoFive:true}),

      new Skill("스케일샷", "드래곤", 
        25, 90, 20, 0, 
        "atk", null, "2-5회 동안 연속으로 쓴다. 스피드가 1랭크 올라가지만 방어가 1랭크 떨어진다.",
        [{ name: "능력치증감", probability: 100, abil: "speed", target: "atk", value: 1 },
          { name: "능력치증감", probability: 100, abil: "def", target: "atk", value: -1 }
        ], {twoFive:true}),
      new Skill("킬러스핀", "독", 
        30, 100, 15, 0, 
        "atk", null, "상대를 독 상태로 만들고 아군의 필드 및 교체불가, 씨뿌리기 효과를 제거한다",
        [{ name: "독", probability: 100 }, {name:"스핀"}],{}),

      new Skill("지오컨트롤", "페어리", 
        "-", "-", 10, 0,  
        "buf", null, 
        "1턴째에 에너지를 흡수하여 2턴째에 특수공격, 특수방어, 스피드를 2랭크 올린다.",
        [{ name: "능력치증감", probability: 100, abil: "catk", target: "atk", value: 2 },
          { name: "능력치증감", probability: 100, abil: "cdef", target: "atk", value: 2 },
          { name: "능력치증감", probability: 100, abil: "speed", target: "atk", value: 2 }],{charge: {text:" 파워를 모으고 있다!", head:"names"}}),

      new Skill("메테오빔", "바위", 
        120, 90, 10, 0,  
        "catk", null, 
        "1턴째에 특수공격을 1랭크 올리고 2턴째에 상대를 공격한다.",
        [],{charge: { head:"name", text:"에게서 우주의 힘이 넘쳐난다!", rankUpStat:"catk"}}),
        
      new Skill("데스윙", "비행",
        80, 100, 10, 0, 
        "catk", null, 
        "준 데미지의 ¾만큼 HP를 회복한다.",
        [{ name: "흡수" }], 
        ),
        
      new Skill("속임수", "악",
        95, 100, 14, 0, 
        "atk", null, 
        "상대방의 공격력으로 데미지를 계산한다.",
        [], 
        ),
    ];
  }
  // ID로 객체 찾기
  search(name) {
    return this.items.find((item) => item.name === name) || this.items.find((item) => item.name === "임시스킬");
  }
}

// 싱글턴 객체 생성 (전역에서 사용 가능)
const skillList = new SkillList();
export default skillList;
