import { josa } from "josa";
class Pokemon {
  constructor(id, name, total, hp, atk, def, catk, cdef, speed, type1, type2) {
    // prettier-ignore
    this._validateParams(id, name, total, hp, atk, def, catk, cdef, speed, type1, type2);
    this.id = id;
    this.name = name;
    this.names = josa(`${name}#{은}`);
    this.namess = josa(`${name}#{을}`);
    this.hp = hp;
    this.atk = atk;
    this.def = def;
    this.catk = catk;
    this.cdef = cdef;
    this.speed = speed;
    this.type1 = type1;
    this.type2 = type2;
  }
  // prettier-ignore
  _validateParams(id, name, total, hp, atk, def, catk, cdef, speed, type1, type2){
    if (typeof id !== "string") console.error("id must be a string", id);
    if (typeof name !== "string") console.error("name must be a string", name);
    if (typeof total !== "number")
      console.error("total must be a number", total);
    if (typeof hp !== "number") console.error("hp must be a number", hp);
    if (typeof atk !== "number") console.error("atk must be a number", atk);
    if (typeof def !== "number") console.error("def must be a number", def);
    if (typeof catk !== "number") console.error("catk must be a number", catk);
    if (typeof cdef !== "number") console.error("cdef must be a number", cdef);
    if (typeof speed !== "number")
      console.error("speed must be a number", speed);
    if (hp + atk + def + catk + cdef + speed !== total) {
      console.error(id + "종족치오류");
    }
    if (typeof type1 !== "string")
      console.error("type1 must be a string", type1);
    if (type2 !== null && typeof type2 !== "string")
      console.error("type2 must be a string or null", type2);
  }
}
// prettier-ignore
class PokemonRepository {
  constructor() {
    this.items = [
      new Pokemon("0815", "에이스번", 530, 80, 116, 75, 65, 75, 119, "불꽃", null),
      new Pokemon("0890", "무한다이노", 690, 140, 85, 95, 145, 95, 130, "독", "드래곤"),
      new Pokemon("0145", "썬더", 580, 90, 90, 85, 125, 90, 100, "전기", "비행"),
      new Pokemon("0901", "다투곰", 555, 113, 70, 120, 135, 65, 52, "땅", "노말"),
      new Pokemon("0778", "따라큐", 476, 55, 90, 80, 50, 105, 96, "고스트", "페어리"),
      new Pokemon("1002", "파오젠", 570, 80, 120, 80, 90, 65, 135, "악", "얼음" ),
      new Pokemon("0888", "자시안", 720, 92, 170, 115, 80, 115, 148, "페어리", "강철" ),
      new Pokemon("0812", "고릴타", 530, 100, 125, 90, 60, 70, 85, "풀", null),
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
