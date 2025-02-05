import BattlePokemonRepository from "./PokemonCustomRepository";
class PokemonOnBattle {
  constructor(id) {
    this.id = id;
    const pokemon = BattlePokemonRepository.getItemById(id);
    this.origin = pokemon;
    this.name = pokemon.name;
    this.names = pokemon.names;
    this.hp = pokemon.hp;
    this.atk = pokemon.atk;
    this.def = pokemon.def;
    this.catk = pokemon.catk;
    this.cdef = pokemon.cdef;
    this.speed = pokemon.speed;
    this.type1 = pokemon.type1;
    this.type2 = pokemon.type2;
    this.item = pokemon.item;
    this.abil = pokemon.abil;
    this.pp1 = pokemon.sk1.pp;
    this.pp2 = pokemon.sk2.pp;
    this.pp3 = pokemon.sk3.pp;
    this.pp4 = pokemon.sk4.pp;
    this.status = {
      burn: null,
      freeze: null,
      poison: null, //독
      mpoison: null, //맹독
      mabi: null,
      sleep: null,
    };
    this.temp = {
      // 매 턴 초기화
      // turnEnd.js에서 초기화된다
      fullDeath: null,
      miss: null,
      roost: null, //날개쉬기
      critical: null,
    };
    this.tempStatus = {
      //교체시 초기화
      rank: {
        atk: 0,
        def: 0,
        catk: 0,
        cdef: 0,
        speed: 0,
        critical: 0,
      },
      confuse: null,
      confuseTurnRemain: null,
    };
    this.faint = null;
  }
}

export function generate(id) {
  return new PokemonOnBattle(id);
}
