import BattlePokemon from "./PokemonCustom";

class BattlePokemonRepository {
  constructor() {
    this.items = [
      new BattlePokemon(
        "0001",
        "0815",
        "6V",
        6,
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
        "아이언헤드",
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
