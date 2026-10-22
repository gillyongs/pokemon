import { Skill } from "../Skill.js";

// 특수 공격기
// prettier-ignore
export const catkSkills = [
  new Skill("볼트체인지", "전기", 70, 100, 20, 0, "catk", null, "공격 후 다른 포켓몬과 교체한다.", [{ name: "유턴" }], { uturn: true }), //접촉아님
  new Skill("미러코트", "에스퍼", "-", 100, 20, -5, "catk", { name: "반사", stat: "catk" }, "상대에게 받은 특수공격의 데미지를 2배로 만들어 그 상대에게 돌려준다. (우선도-5)", [], { counter: true }),
  new Skill("클리어스모그", "독", 50, "-", 15, 0, "catk", null, "상대의 능력 변화를 원래대로 돌린다.", [{ name: "능력치초기화" }], {}),
  new Skill("메테오빔", "바위", 120, 90, 10, 0, "catk", null, "1턴째에 특수공격을 1랭크 올리고 2턴째에 상대를 공격한다.", [], { charge: { head: "name", text: "에게서 우주의 힘이 넘쳐난다!", rankUpStat: "catk" } }),
  new Skill("솔라빔", "풀", 120, 100, 10, 0, "catk", null, "1턴째에 빛을 모으고 2턴째에 상대를 공격한다. 쾌청이면 즉시 공격한다.", [], { charge: { head: "names", text: " 빛을 흡수했다!", weatherSkip: "sunny" } }),
  new Skill("일렉트로빔", "전기", 130, 100, 10, 0, "catk", null, "1턴째에 특수공격을 올리고 2턴째에 상대를 공격한다. 비가 내리면 즉시 공격한다.", [], { charge: { head: "names", text: " 전기를 모으고 있다!", rankUpStat: "catk", weatherSkip: "rain" } }),
  new Skill("물거품아리아", "물", 90, 100, 10, 0, "catk", null, "노래 부르는 것으로 많은 벌룬을 방출한다. 기술에 맞으면 화상이 낫는다.", [{ name: "화상치료" }], { sound: true }),
  new Skill("마그마스톰", "불꽃", 100, 75, 5, 0, "catk", null, "불꽃 속에 4~5턴 동안 상대를 가두어 공격한다. 상대는 교체할 수 없고 매 턴 HP의 ⅛의 피해를 입는다.", [{ name: "구속", skillName: "마그마스톰", text: "마그마의 소용돌이에 갇혔다!" }], {}),
  new Skill("회오리불꽃", "불꽃", 35, 85, 15, 0, "catk", null, "불꽃 속에 4~5턴 동안 상대를 가두어 공격한다. 상대는 교체할 수 없고 매 턴 HP의 ⅛의 피해를 입는다.", [{ name: "구속", skillName: "회오리불꽃", text: "불꽃의 소용돌이에 갇혔다!" }], {}),
  new Skill("카타스트로피", "악", "-", 90, 10, 0, "catk", null, "파멸적인 재앙에 휩쓸리게 하여 상대의 HP를 절반으로 만든다.", [], { noText: true }),
  new Skill("자연의분노", "페어리", "-", 90, 10, 0, "catk", null, "자연의 분노를 상대에게 부딪쳐 상대의 HP를 절반으로 만든다.", [], { noText: true }),
  new Skill("목숨걸기", "격투", "-", 100, 5, 0, "catk", null, "자신은 기절하지만 자신의 현재 HP만큼 상대에게 데미지를 준다.", [{ name: "목숨걸기" }], { noText: true }),
  new Skill("웨더볼", "노말", 50, 100, 10, 0, "catk", null, "날씨에 따라 기술의 타입과 위력이 바뀐다.", [], {}),
  new Skill("어시스트파워", "에스퍼", 20, 100, 10, 0, "catk", null, "자신의 능력이 올라가 있는 만큼 위력이 오른다.", [], {}),
  new Skill("일렉트릭볼", "전기", "-", 100, 10, 0, "catk", null, "자신이 상대보다 빠를수록 위력이 올라간다.", [], {}),
  new Skill("블러드문", "노말", 140, 100, 5, 0, "catk", null, "이 기술은 2회 연속으로 사용할 수 없다.", [], { noDouble: true }),
  new Skill("사이코쇼크", "에스퍼", 80, 100, 10, 0, "catk", null, "물리적인 데미지를 준다.", [], {}),

  // 흡수
  new Skill("데스윙", "비행", 80, 100, 10, 0, "catk", null, "준 데미지의 ¾만큼 HP를 회복한다.", [{ name: "흡수", ratio: 0.75 }]),
  new Skill("드레인키스", "페어리", 50, 100, 10, 0, "catk", null, "준 데미지의 ¾만큼 HP를 회복한다.", [{ name: "흡수", ratio: 0.75 }], { touch: true }),
  new Skill("기가드레인", "풀", 75, 100, 10, 0, "catk", null, "준 데미지의 절반만큼 HP를 회복한다.", [{ name: "흡수", ratio: 0.5 }], {}),

  // 선공기
  new Skill("진공파", "격투", 40, 100, 30, 1, "catk", null, "우선도 +1", []),

  // 랭크 변화 (상대)
  new Skill("바크아웃", "악", 55, 95, 15, 0, "catk", null, "상대의 특수공격을 1랭크 떨어뜨린다.", [{ name: "랭크변화", probability: 100, stat: "catk", target: "def", value: -1 }], { sound: true }),
  new Skill("매지컬플레임", "불꽃", 75, 100, 10, 0, "catk", null, "상대의 특수공격을 1랭크 떨어뜨린다.", [{ name: "랭크변화", probability: 100, stat: "catk", target: "def", value: -1 }], {}),
  new Skill("얼다바람", "얼음", 55, 95, 15, 0, "catk", null, "상대의 스피드를 1랭크 떨어뜨린다.", [{ name: "랭크변화", probability: 100, stat: "speed", target: "def", value: -1 }], {}),
  new Skill("머드샷", "땅", 55, 95, 15, 0, "catk", null, "상대의 스피드를 1랭크 떨어뜨린다.", [{ name: "랭크변화", probability: 100, stat: "speed", target: "def", value: -1 }], {}),

  new Skill("문포스", "페어리", 95, 100, 15, 0, "catk", null, "30% 확률로 상대의 특수공격을 1랭크 떨어뜨린다.", [{ name: "랭크변화", probability: 30, stat: "catk", target: "def", value: -1 }], {}),
  new Skill("파멸의빛", "페어리", 140, 90, 5, 0, "catk", null, "자신도 대상에게 준 피해의 ½만큼 반동 피해를 받는다.", [{ name: "반동", ratio: 2 }], { rebound: true }),
  new Skill("섀도볼", "고스트", 80, 100, 15, 0, "catk", null, "20% 확률로 상대의 특수방어를 1랭크 떨어뜨린다.", [{ name: "랭크변화", probability: 20, stat: "cdef", target: "def", value: -1 }], {}),
  new Skill("기합구슬", "격투", 120, 70, 5, 0, "catk", null, "10%의 확률로 상대의 특수방어를 떨어뜨린다.", [{ name: "랭크변화", probability: 10, stat: "cdef", target: "def", value: -1 }], {}),
  new Skill("대지의힘", "땅", 90, 100, 10, 0, "catk", null, "10%의 확률로 상대의 특수방어를 1랭크 떨어뜨린다.", [{ name: "랭크변화", probability: 10, stat: "cdef", target: "def", value: -1 }]),
  new Skill("사이코키네시스", "에스퍼", 90, 100, 10, 0, "catk", null, "10% 확률로 상대의 특수방어를 1랭크 떨어뜨린다.", [{ name: "랭크변화", probability: 10, stat: "cdef", target: "def", value: -1 }], {}),
  new Skill("에너지볼", "풀", 90, 100, 10, 0, "catk", null, "10% 확률로 상대의 특수방어를 1랭크 떨어뜨린다.", [{ name: "랭크변화", probability: 10, stat: "cdef", target: "def", value: -1 }], {}),
  new Skill("러스터캐논", "강철", 80, 100, 10, 0, "catk", null, "10% 확률로 상대의 특수방어를 1랭크 떨어뜨린다.", [{ name: "랭크변화", probability: 10, stat: "cdef", target: "def", value: -1 }], {}),
  new Skill("벌레의야단법석", "벌레", 90, 100, 10, 0, "catk", null, "10% 확률로 상대의 특수방어를 1랭크 떨어뜨린다.", [{ name: "랭크변화", probability: 10, stat: "cdef", target: "def", value: -1 }], { sound: true }),

  // 랭크 변화 (자신)
  new Skill("오버히트", "불꽃", 130, 90, 5, 0, "catk", null, "사용 후 사용자의 특수공격이 2랭크 떨어진다.", [{ name: "랭크변화", probability: 100, stat: "catk", target: "atk", value: -2 }]),
  new Skill("용성군", "드래곤", 130, 90, 5, 0, "catk", null, "사용 후 사용자의 특수공격이 2랭크 떨어진다.", [{ name: "랭크변화", probability: 100, stat: "catk", target: "atk", value: -2 }]),
  new Skill("리프스톰", "풀", 130, 90, 5, 0, "catk", null, "사용 후 사용자의 특수공격이 2랭크 떨어진다.", [{ name: "랭크변화", probability: 100, stat: "catk", target: "atk", value: -2 }]),

  new Skill("불꽃춤", "불꽃", 80, 100, 10, 0, "catk", null, "50% 확률로 자신의 특수공격을 1랭크 올린다.", [{ name: "랭크변화", probability: 50, stat: "catk", target: "atk", value: 1 }], {}),
  new Skill("원시의힘", "바위", 60, 100, 5, 0, "catk", null, "10% 확률로 자신의 모든 능력을 1랭크씩 올린다.", [{name: "랭크변화",probability: 10,target: "atk",stat: "all",value: 1,},]),

  // 상태이상 =======================================================================================
  new Skill("트라이어택", "노말", 80, 100, 10, 0, "catk", null, "20% 확률로 상대를 마비, 화상 또는 얼음 상태로 만든다.", [{ name: "트라이어택", probability: 20 }], {}),
  // 화상
  new Skill("불대문자", "불꽃", 110, 80, 5, 0, "catk", null, "10% 확률로 상대를 화상 상태로 만든다.", [{ name: "화상", probability: 10 }], {}),
  new Skill("열풍", "불꽃", 95, 90, 10, 0, "catk", null, "10% 확률로 상대를 화상 상태로 만든다.", [{ name: "화상", probability: 10 }], {}),
  new Skill("화염방사", "불꽃", 90, 100, 15, 0, "catk", null, "10% 확률로 상대를 화상 상태로 만든다.", [{ name: "화상", probability: 10 }], {}),
  new Skill("열탕", "물", 80, 100, 15, 0, "catk", null, "30% 확률로 상대를 화상 상태로 만든다.", [{ name: "화상", probability: 30 }], {}),
  new Skill("분연", "불꽃", 80, 100, 15, 0, "catk", null, "30% 확률로 상대를 화상 상태로 만든다.", [{ name: "화상", probability: 30 }], {}),
  new Skill("열사의대지", "땅", 70, 100, 10, 0, "catk", null, "30% 확률로 상대를 화상 상태로 만든다.", [{ name: "화상", probability: 30 }], {}),
  // 독
  new Skill("오물폭탄", "독", 90, 100, 10, 0, "catk", null, "30% 확률로 상대를 독 상태로 만든다.", [{ name: "독", probability: 30 }], {}),
  new Skill("오물웨이브", "독", 95, 100, 10, 0, "catk", null, "10% 확률로 상대를 독 상태로 만든다.", [{ name: "독", probability: 10 }], {}),
  // 마비
  new Skill("10만볼트", "전기", 90, 100, 15, 0, "catk", null, "10%의 확률로 상대를 마비 상태로 만든다.", [{ name: "마비", probability: 10 }], {}),
  new Skill("방전", "전기", 80, 100, 15, 0, "catk", null, "30% 확률로 상대를 마비 상태로 만든다.", [{ name: "마비", probability: 30 }], {}),
  new Skill("번개", "전기", 110, 70, 10, 0, "catk", null, "30%의 확률로 상대를 마비 상태로 만든다. 비가 내리면 반드시 명중한다.", [{ name: "마비", probability: 30 }]),
  // 혼란
  new Skill("폭풍", "비행", 110, 70, 10, 0, "catk", null, "30% 확률로 상대를 혼란 상태로 만든다.", [{ name: "혼란", probability: 30 }], {}),
  // 얼음
  new Skill("냉동빔", "얼음", 90, 100, 10, 0, "catk", null, "10% 확률로 상대를 얼음 상태로 만든다.", [{ name: "얼음", probability: 10 }]),
  new Skill("눈보라", "얼음", 110, 70, 5, 0, "catk", null, "10% 확률로 상대를 얼음 상태로 만든다.", [{ name: "얼음", probability: 10 }], {}),
  new Skill("프리즈드라이", "얼음", 70, 100, 20, 0, "catk", null, "급격히 냉각시켜 공격한다. 10% 확률로 상대를 얼음 상태로 만들며, 물 타입 포켓몬에게도 효과가 굉장하다.", [{ name: "얼음", probability: 10 }], {}),
  // 풀죽음
  new Skill("에어슬래시", "비행", 75, 95, 15, 0, "catk", null, "30%의 확률로 상대를 풀죽게 만든다.", [{ name: "풀죽음", probability: 30 }], { slice: true }),
  new Skill("악의파동", "악", 80, 100, 15, 0, "catk", null, "20%의 확률로 상대를 풀죽게 만든다.", [{ name: "풀죽음", probability: 20 }], {}),


  // HP 비례 위력
  new Skill("해수스파우팅", "물", 150, 100, 5, 0, "catk", null, "자신의 HP가 적을수록 기술의 위력이 떨어진다.", [], { hpScale: true }),
  new Skill("드래곤에너지", "드래곤", 150, 100, 5, 0, "catk", null, "자신의 HP가 적을수록 기술의 위력이 떨어진다.", [], { hpScale: true }),
  new Skill("분화", "불꽃", 150, 100, 5, 0, "catk", null, "자신의 HP가 적을수록 기술의 위력이 떨어진다.", [], { hpScale: true }),

  // 위력변화
  new Skill("라이트닝드라이브", "전기", 100, 100, 5, 0, "catk", null, "약점인 상대에게는 위력이 1.3배 증가한다", [], { touch: true, weakBonus: true }),
  new Skill("병상첨병", "고스트", 65, 100, 10, 0, "catk", null, "상태이상인 상대에게 위력이 2배가 된다.", [], {}),

  // 반동 휴식
  new Skill("파괴광선", "노말", 150, 90, 5, 0, "catk", null, "빛의 광선으로 상대를 공격한다. 다음 턴에는 움직일 수 없다.", [{ name: "반동휴식" }]),
  new Skill("하이드로캐논", "물", 150, 90, 5, 0, "catk", null, "물 대포로 상대를 공격한다. 다음 턴에는 움직일 수 없다.", [{ name: "반동휴식" }]),
  new Skill("블래스트번", "불꽃", 150, 90, 5, 0, "catk", null, "폭발의 불꽃으로 상대를 공격한다. 다음 턴에는 움직일 수 없다.", [{ name: "반동휴식" }]),
  new Skill("하드플랜트", "풀", 150, 90, 5, 0, "catk", null, "뿌리를 내뻗어 공격한다. 다음 턴에는 움직일 수 없다.", [{ name: "반동휴식" }]),

  // 반동
  new Skill("철제광선", "강철", 140, 95, 5, 0, "catk", null, "자신의 최대 HP의 절반을 깎아 공격한다.", [{ name: "철제광선반동" }], {}),

  // 기타 =========================================================================
  new Skill("하이드로펌프", "물", 110, 80, 5, 0, "catk", null, "맹렬한 기세로 대량의 물을 상대에게 발사하여 공격한다.", []),
  new Skill("파동탄", "격투", 80, "-", 20, 0, "catk", null, "반드시 명중하는 파동탄을 발사한다.", [], {}),
  new Skill("파도타기", "물", 90, 100, 15, 0, "catk", null, "큰 파도로 자기 주위에 있는 모든 포켓몬을 공격한다.", [], {}),
  new Skill("근원의파동", "물", 110, 85, 10, 0, "catk", null, "파랗게 빛나는 무수한 광선으로 모든 상대를 공격한다.", []),
  new Skill("용의파동", "드래곤", 85, 100, 10, 0, "catk", null, "커다란 입에서 충격파를 일으켜 상대를 공격한다.", [], {}),
  new Skill("다이맥스포", "드래곤", 100, 100, 5, 0, "catk", null, "상대가 다이맥스 중이면 데미지가 2배가 된다.", [], {}),
  new Skill("파워젬", "바위", 80, 100, 20, 0, "catk", null, "보석처럼 반짝이는 빛을 발사하여 상대를 공격한다.", [], {}),
  new Skill("풀묶기", "풀", 90, 100, 20, 0, "catk", null, "풀을 휘감아서 상대를 쓰러뜨린다.", [], {}),
  new Skill("매지컬샤인", "페어리", 80, 100, 10, 0, "catk", null, "강력한 빛을 내어 상대에게 데미지를 준다.", []),
  new Skill("아스트랄비트", "고스트", 120, 100, 5, 0, "catk", null, "수많은 작은 영체를 상대에게 부딪쳐서 공격한다.", [], {}),
  new Skill("하이퍼보이스", "노말", 90, 100, 10, 0, "catk", null, "시끄럽게 울리는 큰 진동을 상대에게 전달하여 공격한다.", [], { sound: true }),
];
