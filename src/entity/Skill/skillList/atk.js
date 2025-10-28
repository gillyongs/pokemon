import { Skill } from "../Skill.js";

// 물리 공격기
export const atkSkills = [
  new Skill("임시스킬", "노말", 80 + "위력", 100 + "명중률", 15 + "pp", 0 + "우선도", "atk" + "물리특수", null, "임시스킬", [], {}),

  new Skill("유턴", "벌레", 70, 100, 20, 0, "atk", null, "공격 후 다른 포켓몬과 교체한다.", [{ name: "유턴" }], { touch: true, uturn: true }),

  new Skill("퀵턴", "물", 60, 100, 20, 0, "atk", null, "공격 후 다른 포켓몬과 교체한다.", [{ name: "유턴" }], { touch: true, uturn: true }),

  new Skill("탁쳐서떨구기", "악", 65, 100, 20, 0, "atk", null, "상대가 지닌 물건이 있으면 없애고 추가 데미지를 준다.", [{ name: "탁떨" }], { touch: true }),

  new Skill("사이코팽", "에스퍼", 85, 100, 10, 0, "atk", null, "상대 진영에 빛의장막이나 리플렉터가 존재한다면 파괴할 수 있다.", [{ name: "벽부수기" }], { touch: true, bite: true, wallBreaker: true }),

  new Skill("역린", "드래곤", 120, 100, 10, 0, "atk", null, "2~3턴 동안 마구 난동 부려서 공격한다. 난동 부린 뒤에는 혼란에 빠진다.", [{ name: "자동" }], { touch: true }),

  new Skill("킬러스핀", "독", 30, 100, 15, 0, "atk", null, "상대를 독 상태로 만들고 아군 필드의 해로운 효과 및 구속, 씨뿌리기 효과를 제거한다", [{ name: "독", probability: 100 }, { name: "스핀" }], {}),

  new Skill("기습", "악", 70, 100, 5, 2, "atk", { name: "기습" }, "상대가 쓴 기술이 공격기술이 아니면 실패한다. (우선도 +1)", [], { touch: true }),

  // 선공기 =================================================================================================================
  new Skill("그래스슬라이더", "풀", 55, 100, 20, "change", "atk", null, "그래스필드일 때 우선도 +1", [], { touch: true }),
  new Skill("신속", "노말", 80, 100, 5, 2, "atk", null, "우선도 +2", [], { touch: true }),
  new Skill("얼음뭉치", "얼음", 40, 100, 30, 1, "atk", null, "우선도 +1", []),
  new Skill("야습", "고스트", 40, 100, 30, 1, "atk", null, "우선도 +1", [], { touch: true }),
  new Skill("아쿠아제트", "물", 40, 100, 20, 1, "atk", null, "우선도 +1", [], { touch: true }),
  new Skill("전광석화", "노말", 40, 100, 30, 1, "atk", null, "우선도 +1", [], { touch: true }),

  // 연속기 =================================================================================================================
  new Skill("트리플악셀", "얼음", 20, 90, 10, 0, "atk", null, "최대 3회 연속으로 공격한다. 기술이 명중할 때마다 위력이 올라간다.", [], { triple: true, serial: true, touch: true }),
  new Skill("수류연타", "물", 25, 100, 5, 0, "atk", null, "물 흐르듯 3회의 연격을 날린다. 반드시 급소에 맞는다.", [], { touch: true, punch: true, suru: true, mustCritical: true, serial: true }),
  new Skill("고드름침", "얼음", 25, 100, 30, 0, "atk", null, "2-5회 동안 연속으로 쓴다", [], { twoFive: true, serial: true }),
  new Skill("록블라스트", "바위", 25, 90, 10, 0, "atk", null, "2-5회 동안 연속으로 쓴다", [], { twoFive: true, serial: true }),
  // prettier-ignore
  new Skill("스케일샷", "드래곤", 25, 90, 20, 0, "atk", null,
    "2-5회 동안 연속으로 쓴다. 스피드가 1랭크 올라가지만 방어가 1랭크 떨어진다.",
    [ { name: "능력치증감", probability: 100, abil: "speed", target: "atk", value: 1 },
      { name: "능력치증감", probability: 100, abil: "def", target: "atk", value: -1 },
    ], { twoFive: true, serial: true }
  ),

  // 능력치 증감 (자신) =================================================================================================================
  new Skill("개척하기", "풀", 50, 100, 20, 0, "atk", null, "자신의 스피드를 1랭크 올린다.", [{ name: "능력치증감", probability: 100, abil: "speed", target: "atk", value: 1 }], { touch: true }),
  // prettier-ignore
  new Skill("인파이트", "격투", 120, 100, 5, 0, "atk", null,
    "사용 후 사용자의 방어와 특수방어가 1랭크 떨어진다.",
    [ { name: "능력치증감", probability: 100, abil: "def", target: "atk", value: -1 },
      { name: "능력치증감", probability: 100, abil: "cdef", target: "atk", value: -1 },
    ],{ touch: true }
  ),

  // 능력치 증감 (상대)
  new Skill("암석봉인", "바위", 60, 95, 15, 0, "atk", null, "상대방의 스피드를 1랭크 떨어뜨다.", [{ name: "능력치증감", probability: 100, abil: "speed", target: "def", value: -1 }], {}),
  new Skill("드럼어택", "풀", 80, 100, 10, 0, "atk", null, "상대의 스피드를 1랭크 떨어뜨린다.", [{ name: "능력치증감", probability: 100, abil: "speed", target: "def", value: -1 }]),
  new Skill("깨물어부수기", "악", 80, 100, 15, 0, "atk", null, "20% 확률로 상대의 방어를 1랭크 떨어뜨린다.", [{ name: "능력치증감", probability: 20, abil: "def", target: "def", value: -1 }], { touch: true, bite: true }),
  new Skill("아쿠아브레이크", "물", 85, 100, 10, 0, "atk", null, "20% 확률로 상대의 방어를 1랭크 떨어뜨린다.", [{ name: "능력치증감", probability: 20, abil: "def", target: "def", value: -1 }], { touch: true }),
  new Skill("치근거리기", "페어리", 90, 90, 10, 0, "atk", null, "10% 확률로 상대의 공격을 1랭크 떨어뜨린다.", [{ name: "능력치증감", probability: 10, abil: "atk", target: "def", value: -1 }], { touch: true }),

  //위력 변화 =================================================================================================================
  new Skill("속임수", "악", 95, 100, 15, 0, "atk", null, "상대방의 공격력으로 데미지를 계산한다.", []),
  new Skill("성묘", "고스트", 50, 100, 10, 0, "atk", null, "쓰러진 같은 편 포켓몬이 많을수록 기술의 위력이 올라간다.", [{}], {}),
  new Skill("아가미물기", "물", 85, 100, 10, 0, "atk", null, "상대보다 먼저 기술을 사용하면 위력이 2배가 된다.", [], { bite: true, touch: true }),
  new Skill("바디프레스", "격투", 80, 100, 15, 0, "atk", null, "몸을 부딪쳐서 공격한다. 방어가 높을수록 주는 데미지가 올라간다.", [], { touch: true }),
  new Skill("성스러운칼", "격투", 90, 100, 15, 0, "atk", null, "상대의 능력 변화에 상관없이 데미지를 준다.", [{ name: "천진" }], { touch: true }),
  new Skill("객기", "노말", 70, 100, 20, 0, "atk", null, "자신이 독, 마비, 화상 상태일 때 기술의 위력이 2배가 된다.", [], { touch: true }),

  // 위려 고정
  new Skill("땅가르기", "땅", "-", 30, 5, 0, "atk", null, "땅이 갈라진 곳에 상대를 떨어뜨려 공격한다. 맞으면 일격에 기절한다.", [], { oneShot: true }),
  new Skill("지구던지기", "격투", "-", 100, 20, 0, "atk", null, "자신의 레벨과 똑같은 데미지를 상대에게 준다.", [], { noText: true, touch: true }),

  // 반동
  new Skill("브레이브버드", "비행", 120, 100, 15, 0, "atk", null, "자신도 대상에게 준 피해의 ⅓만큼 반동 피해를 받는다.", [{ name: "반동" }], { touch: true, rebound: true }),
  new Skill("이판사판태클", "노말", 120, 100, 15, 0, "atk", null, "자신도 대상에게 준 피해의 ⅓만큼 반동 피해를 받는다.", [{ name: "반동" }], { touch: true, rebound: true }),
  new Skill("웨이브태클", "물", 120, 100, 10, 0, "atk", null, "자신도 대상에게 준 피해의 ⅓만큼 반동 피해를 받는다.", [{ name: "반동" }], { touch: true, rebound: true }),
  new Skill("무릎차기", "격투", 130, 90, 10, 0, "atk", null, "빗나가면 자신이 전체 HP의 ½의 데미지를 입는다.", [{ name: "빗나감패널티" }], { touch: true, rebound: true }),

  // 상태이상 =================================================================================================================

  // 화상
  new Skill("화염볼", "불꽃", 120, 100, 5, 0, "atk", null, "10%의 확률로 상대를 화상 상태로 만든다.", [{ name: "화상", probability: 10 }], {}),
  new Skill("성스러운불꽃", "불꽃", 100, 95, 5, 0, "atk", null, "50%의 확률로 상대를 화상 상태로 만든다.", [{ name: "화상", probability: 50 }]),
  new Skill("플레어드라이브", "불꽃", 120, 100, 15, 0, "atk", null, "대상에게 준 피해의 ⅓만큼 반동 피해를 받는다. 10% 확률로 상대를 화상 상태로 만든다", [{ name: "반동" }, { name: "화상", probability: 10 }], { touch: true, rebound: true }),
  // 독
  new Skill("독찌르기", "독", 80, 100, 20, 0, "atk", null, "30% 확률로 상대를 독 상태로 만든다.", [{ name: "독", probability: 30 }], { touch: true }),
  // 풀죽음
  new Skill("아이언헤드", "강철", 80, 100, 15, 0, "atk", null, "30%의 확률로 상대를 풀죽게 만든다.", [{ name: "풀죽음", probability: 30 }], { touch: true }),
  new Skill("고드름떨구기", "얼음", 85, 90, 10, 0, "atk", null, "30%의 확률로 상대를 풀죽게 만든다.", [{ name: "풀죽음", probability: 30 }]),
  new Skill("폭포오르기", "물", 80, 100, 15, 0, "atk", null, "20%의 확률로 상대를 풀죽게 만든다.", [{ name: "풀죽음", probability: 20 }], { touch: true }),
  // 급소
  new Skill("섀도크루", "고스트", 70, 100, 15, 0, "atk", null, "급소에 맞을 확률이 높다.", [{ name: "급소" }], { touch: true }),

  new Skill("지진", "땅", 100, 100, 10, 0, "atk", null, "자신의 주위에 있는 포켓몬을 공격한다.", []),
  new Skill("크로스썬더", "전기", 100, 100, 5, 0, "atk", null, "크로스플레임과 동시에 사용하면 데미지가 2배가 된다.", [], {}),
  new Skill("블리자드랜스", "얼음", 120, 100, 5, 0, "atk", null, "눈보라를 두른 얼음의 창을 상대에게 던져서 공격한다.", [], {}),
  new Skill("10만마력", "땅", 95, 95, 10, 0, "atk", null, "온몸을 써서 상대를 맹렬히 공격한다.", [], { touch: true }),
  new Skill("헤비봄버", "강철", 120, 100, 10, 0, "atk", null, "무거운 몸으로 상대에게 부딪쳐 공격한다. ", [], { touch: true }),
  new Skill("거수참", "강철", 100, 100, 5, 0, "atk", null, "다이맥스한 상대에게 2배 데미지를 준다", [], { touch: true }),
  new Skill("거수탄", "강철", 100, 100, 5, 0, "atk", null, "온몸을 강하고 튼튼한 방패로 바꾼 다음 기세 좋게 부딪혀서 공격한다.", [], { touch: true }),
];
