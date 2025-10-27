import { Skill } from "../Skill.js";

// buf = 자신 대상 변화기
// natk = 상대방이 기절하면 실패, buf = 상대방이 기절해도 성공
// 방어 가능 여부와 판정이 비슷하나 날려버리기는 방어를 뚫는다
export const bufSkills = [
  new Skill("방어", "노말", "-", "-", 10, 4, "buf", { name: "방어" }, "상대의 공격을 전혀 받지 않는다. 연속으로 쓰면 실패하기 쉽다. (우선도 +4)", [{ name: "방어" }], {}),

  new Skill("대타출동", "노말", "-", "-", 10, 0, "buf", null, "자신의 HP를 ¼ 깎아서 분신을 만든다. 분신은 자신의 대타가 된다.", [{ name: "대타출동" }], {}),

  new Skill("트릭룸", "에스퍼", "-", "-", 5, -7, "buf", null, "이상한 공간을 만든다. 5턴 동안 느린 포켓몬부터 행동할 수 있다. (우선도 -7)", [{ name: "트릭룸" }]),

  //pp 서로 다른게 맞음
  new Skill("리플렉터", "에스퍼", "-", "-", 20, 0, "buf", null, "5턴 동안 이상한 장막을 쳐서 상대로부터 받는 물리공격의 데미지를 약하게 한다.", [{ name: "리플렉터" }]),
  new Skill("빛의장막", "에스퍼", "-", "-", 30, 0, "buf", null, "5턴 동안 이상한 장막을 쳐서 상대로부터 받는 특수공격의 데미지를 약하게 한다.", [{ name: "빛의장막" }]),

  // 장판 =================================================
  new Skill("스텔스록", "바위", "-", "-", 20, 0, "buf", null, "상대의 주위에 바위를 띄워 교체되어 나온 상대 포켓몬에게 데미지를 준다.", [{ name: "스텔스록" }], {}),
  new Skill("독압정", "독", "-", "-", 20, 0, "buf", null, "상대의 발밑에 독 압정을 뿌려 교체로 나온 상대 포켓몬에게 독을 퍼지게 한다. 2번 깔았을 경우 맹독을 퍼지게 한다.", [{ name: "독압정" }], {}),

  // 회복 =================================================

  new Skill("HP회복", "노말", "-", "-", 5, 0, "buf", null, "최대 HP의 절반만큼 회복한다.", [{ name: "회복" }]),
  new Skill("알낳기", "노말", "-", "-", 5, 0, "buf", null, "최대 HP의 절반만큼 회복한다.", [{ name: "회복" }]),
  new Skill("아침햇살", "노말", "-", "-", 5, 0, "buf", null, "사용자의 HP를 회복한다. 날씨에 따라 회복량이 변한다.", [{ name: "아침햇살" }]),
  new Skill("달빛", "페어리", "-", "-", 5, 0, "buf", null, "사용자의 HP를 회복한다. 날씨에 따라 회복량이 변한다.", [{ name: "아침햇살" }]),
  new Skill("날개쉬기", "비행", "-", "-", 5, 0, "buf", null, "최대 HP의 절반만큼 회복한다. 사용한 턴에 비행 타입이 없어진다.", [{ name: "날개쉬기" }, { name: "회복" }], {}),

  // 유사 회복 =================================================

  new Skill("치유소원", "에스퍼", "-", "-", 10, 0, "buf", null, "자신은 기절하지만 교대하여 나오는 포켓몬의 상태 이상과 HP를 회복한다.", [{ name: "치유소원" }]),
  new Skill("초승달춤", "에스퍼", "-", "-", 10, 0, "buf", null, "자신은 기절하지만 교대하여 나오는 포켓몬의 상태 이상과 HP, PP 회복한다.", [{ name: "초승달춤" }]),
  new Skill("희망사항", "노말", "-", "-", 10, 0, "buf", null, "다음 턴에 자신 또는 교체한 포켓몬의 HP를 최대 HP의 ½만큼 회복한다.", [{ name: "희망사항" }]),

  // 랭크업 =================================================

  new Skill("칼춤", "노말", "-", "-", 20, 0, "buf", null, "자신의 공격을 2랭크 올린다.", [{ name: "능력치증감", probability: 100, abil: "atk", target: "atk", value: 2 }]),
  new Skill("철벽", "강철", "-", "-", 20, 0, "buf", null, "자신의 방어를 2랭크 올린다.", [{ name: "능력치증감", probability: 100, abil: "def", target: "atk", value: 2 }]),
  new Skill("나쁜음모", "악", "-", "-", 20, 0, "buf", null, "자신의 특수공격을 2랭크 올린다.", [{ name: "능력치증감", probability: 100, abil: "catk", target: "atk", value: 2 }]),
  new Skill("용의춤", "드래곤", "-", "-", 20, 0, "buf", null, "자신의 공격과 스피드를 1랭크 올린다.", [
    { name: "능력치증감", probability: 100, abil: "atk", target: "atk", value: 1 },
    { name: "능력치증감", probability: 100, abil: "speed", target: "atk", value: 1 },
  ]),
  new Skill("명상", "에스퍼", "-", "-", 20, 0, "buf", null, "자신의 특수공격과 특수방어를 1랭크 올린다.", [
    { name: "능력치증감", probability: 100, abil: "catk", target: "atk", value: 1 },
    { name: "능력치증감", probability: 100, abil: "cdef", target: "atk", value: 1 },
  ]),
  // prettier-ignore
  new Skill("껍질깨기", "노말", "-", "-", 15, 0, "buf", null,
    "자신의 방어와 특수방어를 1랭크 떨어뜨리고 공격과 특수공격, 스피드를 2랭크 올린다.",
    [ { name: "능력치증감", probability: 100, abil: "def", target: "atk", value: -1 },
      { name: "능력치증감", probability: 100, abil: "cdef", target: "atk", value: -1 },
      { name: "능력치증감", probability: 100, abil: "atk", target: "atk", value: 2 },
      { name: "능력치증감", probability: 100, abil: "catk", target: "atk", value: 2 },
      { name: "능력치증감", probability: 100, abil: "speed", target: "atk", value: 2 },
    ], {}
  ),

  // prettier-ignore
  new Skill("지오컨트롤", "페어리", "-", "-", 10, 0, "buf", null,
    "1턴째에 에너지를 흡수하여 2턴째에 특수공격, 특수방어, 스피드를 2랭크 올린다.",
    [{ name: "능력치증감", probability: 100, abil: "catk", target: "atk", value: 2 },
      { name: "능력치증감", probability: 100, abil: "cdef", target: "atk", value: 2 },
      { name: "능력치증감", probability: 100, abil: "speed", target: "atk", value: 2 },
    ], { charge: { text: " 파워를 모으고 있다!", head: "names" } }
  ),
];
