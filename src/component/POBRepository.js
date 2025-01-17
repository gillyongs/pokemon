import PokemonOnBattle from "./POB";

class POBRepository {
  constructor() {
    this.items = [new PokemonOnBattle("0001")];
  }
  // ID로 객체 찾기
  getItemById(id) {
    return this.items.find((item) => item.id === id) || null;
  }
  generate(id) {
    const originalItem = this.getItemById(id);
    if (originalItem) {
      return JSON.parse(JSON.stringify(originalItem));
    }
    return null; // ID에 해당하는 객체가 없으면 null 반환
  }
}

// 싱글턴 객체 생성 (전역에서 사용 가능)
const pob = new POBRepository();
export default pob;
