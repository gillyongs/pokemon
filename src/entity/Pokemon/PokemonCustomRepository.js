import BattlePokemon from "./PokemonCustom";

class BattlePokemonRepository {
  constructor() {
    this.items = [
      new BattlePokemon(
        "0001",
        "0815",
        "6V",
        4,
        252,
        0,
        0,
        0,
        252,
        "speed",
        "catk",
        "화염볼",
        "무릎차기",
        "기습",
        "칼춤",
        "생명의구슬",
        "리베로"
      ),
      new BattlePokemon(
        "0002",
        "0890",
        "5V1A",
        0,
        0,
        4,
        252,
        0,
        252,
        "speed",
        "atk",
        "다이맥스포",
        "오물웨이브",
        "화염방사",
        "섀도볼",
        "생명의구슬",
        "프레셔"
      ),
      new BattlePokemon(
        "0003",
        "0145",
        "5V1A",
        0,
        0,
        4,
        252,
        0,
        252,
        "speed",
        "atk",
        "10만볼트",
        "열풍",
        "폭풍",
        "날개쉬기",
        "생명의구슬",
        "정전기"
      ),
      new BattlePokemon(
        "0004",
        "0901",
        "5V1A",
        212,
        0,
        4,
        196,
        4,
        92,
        "catk",
        "atk",
        "블러드문",
        "하이퍼보이스",
        "대지의힘",
        "진공파",
        "돌격조끼",
        "심안"
      ),
      new BattlePokemon(
        "0005",
        "0778",
        "5V1A",
        4,
        252,
        0,
        0,
        0,
        252,
        "speed",
        "atk",
        "야습",
        "칼춤",
        "섀도크루",
        "치근거리기",
        "생명의구슬",
        "탈"
      ),
      new BattlePokemon(
        "0006",
        "1002",
        "6V",
        0, // 체력 H
        188, // 공격 A
        68, // 방어 B
        0, // 특공 C
        0, // 특방 D
        252, // 스피드 S
        "speed",
        "catk",
        "고드름떨구기",
        "기습",
        "성스러운칼",
        "얼음뭉치",
        "기합의띠",
        "재앙의검"
      ),
    ];
  }
  // ID로 객체 찾기
  getItemById(id) {
    return this.items.find((item) => item.id === id) || null;
  }
}

// 싱글턴 객체 생성 (전역에서 사용 가능)
const bpr = new BattlePokemonRepository();
export default bpr;
