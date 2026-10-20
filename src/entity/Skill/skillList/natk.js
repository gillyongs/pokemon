import { Skill } from "../Skill.js";

// 상대방 대상 변화기
// natk = 상대방이 기절하면 실패, buf = 상대방이 기절해도 성공
// prettier-ignore
export const natkSkills = [
  new Skill("막말내뱉기", "악", "-", 100, 20, 0, "natk", null, "상대의 공격과 특수공격을 1랭크씩 떨어뜨리고 교체한다.", [{ name: "랭크다수변화", probability: 100, target: "def", stats: [{stat: "atk", value: -1}, {stat: "catk", value: -1}] }, { name: "유턴" }], { sound: true, uturn: true }),
  new Skill("씨뿌리기", "풀", "-", 90, 10, 0, "natk", null, "상대에게 씨를 뿌려 매 턴 상대 최대 HP의 ⅛만큼 빼앗아 회복한다.", [{ name: "씨뿌리기" }], {}),
  new Skill("도발", "악", "-", 100, 20, 0, "natk", null, "상대를 화나게 하여 3턴 동안 데미지를 주는 기술밖에 쓸 수 없게 한다.", [{ name: "도발" }], {}),
  new Skill("트릭", "에스퍼", "-", 100, 10, 0, "natk", null, "상대의 빈틈을 노려 자신과 상대가 지닌 물건을 바꿔치기한다.", [{ name: "트릭" }], {}),

  // 강제교체
  new Skill("울부짖기", "노말", "-", "-", 20, -6, "natk", null, "상대를 도망치게 하여 교대할 포켓몬을 끌어낸다. (우선도 -6)", [{ name: "강제교체" }], { sound: true }),
  new Skill("날려버리기", "노말", "-", "-", 20, -6, "natk", null, "상대를 날려버려서 교대할 포켓몬을 끌어낸다. (우선도 -6)", [{ name: "강제교체" }], {}),

  // 랭크다운
  new Skill("괴전파", "전기", "-", 100, 15, 0, "natk", null, "괴전파를 방출하여 상대의 특수공격을 2랭크 떨어뜨린다.", [{ name: "랭크변화", probability: 100, stat: "catk", target: "def", value: -2 }], {}),
  new Skill("거짓울음", "악", "-", 100, 20, 0, "natk", null, "눈물을 흘려 상대를 곤란하게 만들어 특수방어를 2랭크 떨어뜨린다.", [{ name: "랭크변화", probability: 100, stat: "cdef", target: "def", value: -2 }], {}),
  new Skill("금속음", "강철", "-", 85, 40, 0, "natk", null, "금속을 긁을 때 나는 싫은 소리를 들려주어 상대의 특수방어를 2랭크 떨어뜨린다.", [{ name: "랭크변화", probability: 100, stat: "cdef", target: "def", value: -2 }], { sound: true }),
  new Skill("애교부리기", "페어리", "-", 100, 20, 0, "natk", null, "귀엽게 바라보며 응석을 부려 상대의 공격을 2랭크 떨어뜨린다.", [{ name: "랭크변화", probability: 100, stat: "atk", target: "def", value: -2 }], {}),

  // 상태이상
  new Skill("버섯포자", "풀", "-", 100, 15, 0, "natk", null, "최면 효과가 있는 포자를 뿌려 상대를 잠듦 상태로 만든다.", [{ name: "잠듦", probability: 100, printTextIfFail: true }], { powder: true }),
  new Skill("하품", "노말", "-", "-", 10, 0, "natk", null, "큰 하품으로 졸음을 유도한다. 다음 턴에 상대를 잠듦 상태로 만든다.", [{ name: "하품" }], {}),
  new Skill("전기자석파", "전기", "-", 90, 20, 0, "natk", null, "약한 전격을 날려서 상대를 마비 상태로 만든다.", [{ name: "마비", probability: 100, printTextIfFail: true }], {}),
  new Skill("뱀눈초리", "노말", "-", 100, 30, 0, "natk", null, "배의 무늬로 겁을 주어 상대를 마비 상태로 만든다.", [{ name: "마비", probability: 100, printTextIfFail: true }], {}),
  new Skill("도깨비불", "불꽃", "-", 85, 15, 0, "natk", null, "으스스하고 괴상한 불꽃을 쏘아 상대를 화상 상태로 만든다.", [{ name: "화상", probability: 100, printTextIfFail: true }], {}),
  new Skill("맹독", "독", "-", 90, 10, 0, "natk", null, "상대를 맹독 상태로 만든다. 턴이 진행될수록 독의 데미지가 증가한다.", [{ name: "맹독", probability: 100, printTextIfFail: true }], {}),
];
