class Pokemon {
  constructor(id, name, names, hp, atk, def, catk, cdef, speed, type1, type2) {
    this.id = id;
    this.name = name;
    this.names = names;
    this.hp = hp;
    this.atk = atk;
    this.def = def;
    this.catk = catk;
    this.cdef = cdef;
    this.speed = speed;
    this.type1 = type1;
    this.type2 = type2;
  }
}

class PokemonRepository {
  constructor() {
    this.items = [
      new Pokemon(
        "0815",
        "에이스번",
        "에이스번은",
        80,
        116,
        75,
        65,
        75,
        1190,
        "불꽃",
        null
      ),
      new Pokemon(
        "0890",
        "무한다이노",
        "무한다이노는",
        140,
        85,
        95,
        145,
        95,
        130,
        "독",
        "드래곤"
      ),
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
