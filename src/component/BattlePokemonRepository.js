import BattlePokemon from "./BattlePokemon";

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
