import Pokemon from "./Pokemon";

class PokemonRepository {
  constructor() {
    this.items = [
      new Pokemon("0815", "에이스번", 80, 116, 75, 65, 75, 119, "불꽃", null),
    ];
  }
  // ID로 객체 찾기
  getItemById(id) {
    return this.items.find((item) => item.id === id) || null;
  }
}

// 싱글턴 객체 생성 (전역에서 사용 가능)
const pokemonRepository = new PokemonRepository();
export default pokemonRepository;
