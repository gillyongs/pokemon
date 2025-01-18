import BattlePokemonRepository from "./PokemonCustomRepository";
class PokemonOnBattle {
  constructor(id) {
    this.id = id;
    const pokemon = BattlePokemonRepository.getItemById(id);
    this.origin = pokemon;
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
      poison: null,
      mabi: null,
      sleep: null,
    };
    this.temp = {
      fullDeath: null,
    };
  }
}

export function generate(id) {
  return new PokemonOnBattle(id);
}
