/**
 * 포켓몬 메가진화 및 원시회귀 관계 데이터
 * 키: 기본 포켓몬 ID (uniqueKey)
 * 값: 메가진화/원시회귀 정보 배열 (리자몽, 뮤츠 등 여러 폼이 존재하는 포켓몬 지원)
 */
const megaDataList = {
  // 라이츄 (Y)
  "0026": [
    {
      stone: "라이츄나이트Y",
      megaFormId: "0026-y",
      name: "메가라이츄Y",
      abil: "노가드",
    },
  ],
  // 리자몽 (X / Y)
  "0006": [
    {
      stone: "리자몽나이트X",
      megaFormId: "0006-x",
      name: "메가리자몽X",
      abil: "단단한발톱",
    },
    {
      stone: "리자몽나이트Y",
      megaFormId: "0006-y",
      name: "메가리자몽Y",
      abil: "가뭄",
    },
  ],
  // 우츠보트
  "0071": [
    {
      stone: "우츠보트나이트",
      megaFormId: "0071-m",
      name: "메가우츠보트",
      abil: "내용물분출",
    },
  ],
  // 팬텀
  "0094": [
    {
      stone: "팬텀나이트",
      megaFormId: "0094-m",
      name: "메가팬텀",
      abil: "그림자밟기",
    },
  ],
  // 아쿠스타
  "0121": [
    {
      stone: "아쿠스타나이트",
      megaFormId: "0121-m",
      name: "메가아쿠스타",
      abil: "천하장사",
    },
  ],
  // 핫삼
  "0212": [
    {
      stone: "핫삼나이트",
      megaFormId: "0212-m",
      name: "메가핫삼",
      abil: "테크니션",
    },
  ],
  // 무장조
  "0227": [
    {
      stone: "무장조나이트",
      megaFormId: "0227-m",
      name: "메가무장조",
      abil: "굳건한신념",
    },
  ],
  // 마기라스
  "0248": [
    {
      stone: "마기라스나이트",
      megaFormId: "0248-m",
      name: "메가마기라스",
      abil: "모래날림",
    },
  ],
  // 대짱이
  "0260": [
    {
      stone: "대짱이나이트",
      megaFormId: "0260-m",
      name: "메가대짱이",
      abil: "쓱쓱",
    },
  ],
  // 가디안
  "0282": [
    {
      stone: "가디안나이트",
      megaFormId: "0282-m",
      name: "메가가디안",
      abil: "페어리스킨",
    },
  ],
  // 입치트
  "0303": [
    {
      stone: "입치트나이트",
      megaFormId: "0303-m",
      name: "메가입치트",
      abil: "천하장사",
    },
  ],
  // 플라이곤
  "0330": [
    {
      stone: "플라이곤나이트",
      megaFormId: "0330-m",
      name: "메가플라이곤",
      abil: "색안경",
    },
  ],
  // 보만다
  "0373": [
    {
      stone: "보만다나이트",
      megaFormId: "0373-m",
      name: "메가보만다",
      abil: "스카이스킨",
    },
  ],
  // 메타그로스
  "0376": [
    {
      stone: "메타그로스나이트",
      megaFormId: "0376-m",
      name: "메가메타그로스",
      abil: "단단한발톱",
    },
  ],
  // 가이오가 (원시회귀)
  "0382": [
    {
      stone: "쪽빛구슬",
      isPrimal: true,
      megaFormId: "0382-m",
      name: "원시가이오가",
      abil: "시작의바다",
    },
  ],
  // 그란돈 (원시회귀)
  "0383": [
    {
      stone: "주홍구슬",
      isPrimal: true,
      megaFormId: "0383-m",
      name: "원시그란돈",
      abil: "끝의대지",
    },
  ],
  // 레쿠쟈 (화룡점정 보유 시 메가진화)
  "0384": [
    {
      stone: null,
      requiredSkill: "화룡점정",
      megaFormId: "0384-m",
      name: "메가레쿠쟈",
      abil: "델타스트림",
    },
  ],
  // 엘레이드
  "0475": [
    {
      stone: "엘레이드나이트",
      megaFormId: "0475-m",
      name: "메가엘레이드",
      abil: "정신력",
    },
  ],
  // 이어롭
  "0428": [
    {
      stone: "이어롭나이트",
      megaFormId: "0428-m",
      name: "메가이어롭",
      abil: "배짱",
    },
  ],
  // 한카리아스 (일반 / Z)
  "0445": [
    {
      stone: "한카리아스나이트",
      megaFormId: "0445-m",
      name: "메가한카리아스",
      abil: "모래의힘",
    },
    {
      stone: "한카리아스나이트Z",
      megaFormId: "0445-z",
      name: "메가한카리아스Z",
      abil: "부유",
    },
  ],
  // 뮤츠 (X / Y)
  "0150": [
    {
      stone: "뮤츠나이트X",
      megaFormId: "0150-x",
      name: "메가뮤츠X",
      abil: "불굴의마음",
    },
    {
      stone: "뮤츠나이트Y",
      megaFormId: "0150-y",
      name: "메가뮤츠Y",
      abil: "불면",
    },
  ],
  // 드닐레이브
  "0998": [
    {
      stone: "드닐레이브나이트",
      megaFormId: "0998-m",
      name: "메가드닐레이브",
      abil: "열교환",
    },
  ],
  // 킬라플로르
  "0970": [
    {
      stone: "킬라플로르나이트",
      megaFormId: "0970-m",
      name: "메가킬라플로르",
      abil: "적응력",
    },
  ],
  // 개굴닌자
  "0658": [
    {
      stone: "개굴닌자나이트",
      megaFormId: "0658-m",
      name: "메가개굴닌자",
      abil: "적응력",
    },
  ],
  // 플라엣테
  "0670": [
    {
      stone: "플라엣테나이트",
      megaFormId: "0670-m",
      name: "메가플라엣테",
      abil: "페어리오라",
    },
  ],
  // 갑주무사
  "0768": [
    {
      stone: "갑주무사나이트",
      megaFormId: "0768-m",
      name: "메가갑주무사",
      abil: "단단한발톱",
    },
  ],
};

/**
 * 포켓몬 객체를 인자로 받아 지닌 도구(메가스톤/구슬) 또는 보유 기술을 기반으로 해당하는 메가진화/원시회귀 정보를 반환합니다.
 */
export const getMegaData = (p) => {
  if (!p) return null;
  const list = megaDataList[p.uniqueKey];
  if (!list) return null;
  return (
    list.find((entry) => {
      if (entry.requiredSkill) {
        const skills = p.skill || p.skills;
        if (!skills) return false;
        const skillNames = Object.values(skills).map((s) => (typeof s === "object" && s ? s.name : s));
        return skillNames.includes(entry.requiredSkill);
      }
      return Boolean(entry.stone && entry.stone === p.item);
    }) || null
  );
};
