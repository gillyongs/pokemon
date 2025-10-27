import { Skill } from "../Skill.js";

// 특수 공격기

export const catkSkills = [
  new Skill("볼트체인지", "전기", 70, 100, 20, 0, "catk", null, "공격 후 다른 포켓몬과 교체한다.", [{ name: "유턴" }], { uturn: true }), //접촉아님
  new Skill("미러코트", "에스퍼", "-", 100, 20, -5, "catk", { name: "반사", stat: "catk" }, "상대에게 받은 특수공격의 데미지를 2배로 만들어 그 상대에게 돌려준다. (우선도-5)", [], { reflect: true }),
  new Skill("클리어스모그", "독", 50, "-", 15, 0, "catk", null, "특수한 진흙 덩어리를 내던져서 상대의 능력 변화를 원래대로 돌린다.", [{ name: "능력치초기화" }], {}),
  new Skill("메테오빔", "바위", 120, 90, 10, 0, "catk", null, "1턴째에 특수공격을 1랭크 올리고 2턴째에 상대를 공격한다.", [], { charge: { head: "name", text: "에게서 우주의 힘이 넘쳐난다!", rankUpStat: "catk" } }),
  new Skill("데스윙", "비행", 80, 100, 10, 0, "catk", null, "준 데미지의 ¾만큼 HP를 회복한다.", [{ name: "흡수" }]),
  new Skill("마그마스톰", "불꽃", 100, 75, 5, 0, "catk", null, "세차게 타오르는 불꽃 속에 4~5턴 동안 상대를 가두어 공격한다.", [{ name: "구속", skillName: "마그마스톰", text: "마그마의 소용돌이에 갇혔다!" }], {}),
  new Skill("병상첨병", "고스트", 65, 100, 10, 0, "catk", null, "상태이상인 상대에게 데미지가 2배가 된다.", [], {}),
  new Skill("카타스트로피", "악", "-", 90, 10, 0, "catk", null, "파멸적인 재앙에 휩쓸리게 하여 상대의 HP를 절반으로 만든다.", [], { noText: true }),
  new Skill("어시스트파워", "에스퍼", 20, 100, 10, 0, "catk", null, "자신의 능력이 올라가 있는 만큼 위력이 오른다.", [], {}),
  new Skill("블러드문", "노말", 140, 100, 5, 0, "catk", null, "이 기술은 2회 연속으로 사용할 수 없다.", [], { noDouble: true }),
  new Skill("하이퍼보이스", "노말", 90, 100, 10, 0, "catk", null, "시끄럽게 울리는 큰 진동을 상대에게 전달하여 공격한다.", [], { sound: true }),

  // 선공기
  new Skill("진공파", "격투", 40, 100, 30, 1, "catk", null, "우선도 +1", []),

  // 능력치 증감 (상대)
  new Skill("섀도볼", "고스트", 80, 100, 15, 0, "catk", null, "20% 확률로 상대의 특수방어를 1랭크 떨어뜨린다.", [{ name: "능력치증감", probability: 20, abil: "cdef", target: "def", value: -1 }], {}),
  new Skill("기합구슬", "격투", 120, 70, 5, 0, "catk", null, "10%의 확률로 상대의 특수방어를 떨어뜨린다.", [{ name: "능력치증감", probability: 10, abil: "cdef", target: "def", value: -1 }], {}),
  new Skill("대지의힘", "땅", 90, 100, 10, 0, "catk", null, "10%의 확률로 상대의 특수방어를 1랭크 떨어뜨린다.", [{ name: "능력치증감", probability: 10, abil: "cdef", target: "def", value: -1 }]),
  new Skill("문포스", "페어리", 95, 100, 15, 0, "catk", null, "30% 확률로 상대의 특수공격을 1랭크 떨어뜨린다.", [{ name: "능력치증감", probability: 30, abil: "catk", target: "def", value: -1 }], {}),
  new Skill("에너지볼", "풀", 90, 100, 10, 0, "catk", null, "10% 확률로 상대의 특수방어를 1랭크 떨어뜨린다.", [{ name: "능력치증감", probability: 10, abil: "cdef", target: "def", value: -1 }], {}),
  // 능력치 증감 (자신)
  new Skill("오버히트", "불꽃", 130, 90, 5, 0, "catk", null, "사용 후 사용자의 특수공격이 2랭크 떨어진다.", [{ name: "능력치증감", probability: 100, abil: "catk", target: "atk", value: -2 }]),
  new Skill("용성군", "드래곤", 130, 90, 5, 0, "catk", null, "사용 후 사용자의 특수공격이 2랭크 떨어진다.", [{ name: "능력치증감", probability: 100, abil: "catk", target: "atk", value: -2 }]),
  new Skill("리프스톰", "풀", 130, 90, 5, 0, "catk", null, "사용 후 사용자의 특수공격이 2랭크 떨어진다.", [{ name: "능력치증감", probability: 100, abil: "catk", target: "atk", value: -2 }]),

  // 상태이상 =========================
  new Skill("트라이어택", "노말", 80, 100, 10, 0, "catk", null, "20% 확률로 상대를 마비, 화상 또는 얼음 상태로 만든다.", [{ name: "트라이어택", probability: 20 }], {}),
  // 화상
  new Skill("불대문자", "불꽃", 110, 80, 5, 0, "catk", null, "10% 확률로 상대를 화상 상태로 만든다.", [{ name: "화상", probability: 10 }], {}),
  new Skill("열풍", "불꽃", 95, 90, 10, 0, "catk", null, "10% 확률로 상대를 화상 상태로 만든다.", [{ name: "화상", probability: 10 }], {}),
  new Skill("화염방사", "불꽃", 90, 100, 15, 0, "catk", null, "10% 확률로 상대를 화상 상태로 만든다.", [{ name: "화상", probability: 10 }], {}),
  // 독
  new Skill("오물웨이브", "독", 95, 100, 10, 0, "catk", null, "10% 확률로 상대를 독 상태로 만든다.", [{ name: "독", probability: 10 }], {}),
  // 마비
  new Skill("10만볼트", "전기", 90, 100, 15, 0, "catk", null, "10%의 확률로 상대를 마비 상태로 만든다.", [{ name: "마비", probability: 10 }], {}),
  new Skill("번개", "전기", 110, 70, 10, 0, "catk", null, "30%의 확률로 상대를 마비 상태로 만든다. 비가 내리면 반드시 명중한다.", [{ name: "마비", probability: 30 }]),
  // 혼란
  new Skill("폭풍", "비행", 110, 70, 10, 0, "catk", null, "30% 확률로 상대를 혼란 상태로 만든다.", [{ name: "혼란", probability: 30 }], {}),
  // 얼음
  new Skill("냉동빔", "얼음", 90, 100, 10, 0, "catk", null, "10% 확률로 상대를 얼음 상태로 만든다.", [{ name: "얼음", probability: 10 }]),
  // 풀죽음
  new Skill("에어슬래시", "비행", 75, 95, 15, 0, "catk", null, "30%의 확률로 상대를 풀죽게 만든다.", [{ name: "풀죽음", probability: 30 }], {}),
  new Skill("악의파동", "악", 80, 100, 15, 0, "catk", null, "20%의 확률로 상대를 풀죽게 만든다.", [{ name: "풀죽음", probability: 20 }], {}),

  // 위력변화
  new Skill("사이코쇼크", "에스퍼", 80, 100, 10, 0, "catk", null, "물리적인 데미지를 준다.", [], {}),
  new Skill("라이트닝드라이브", "전기", 100, 100, 5, 0, "catk", null, "약점인 상대에게는 위력이 더욱 올라간다.", []),
  new Skill("해수스파우팅", "물", 150, 100, 5, 0, "catk", null, "자신의 HP가 적을수록 기술의 위력이 떨어진다.", []),

  new Skill("근원의파동", "물", 110, 85, 10, 0, "catk", null, "파랗게 빛나는 무수한 광선으로 모든 상대를 공격한다.", []),
  new Skill("다이맥스포", "드래곤", 100, 100, 5, 0, "catk", null, "상대가 다이맥스 중이면 데미지가 2배가 된다.", [], {}),
  new Skill("파워젬", "바위", 80, 100, 20, 0, "catk", null, "보석처럼 반짝이는 빛을 발사하여 상대를 공격한다.", [], {}),
  new Skill("풀묶기", "풀", 90, 100, 20, 0, "catk", null, "풀을 휘감아서 상대를 쓰러뜨린다.", [], {}),
  new Skill("매지컬샤인", "페어리", 80, 100, 10, 0, "catk", null, "강력한 빛을 내어 상대에게 데미지를 준다.", []),
  new Skill("아스트랄비트", "고스트", 120, 100, 5, 0, "catk", null, "수많은 작은 영체를 상대에게 부딪쳐서 공격한다.", [], {}),
];
