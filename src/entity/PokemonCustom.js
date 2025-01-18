import PokemonOriginal from "./PokemonOriginal";
import skillList from "./Skill";
class BattlePokemon {
  constructor(
    id,
    pokemon_id,
    gacha,
    hps,
    atks,
    defs,
    catks,
    cdefs,
    speeds,
    up,
    down,
    sk1,
    sk2,
    sk3,
    sk4,
    item,
    abil
  ) {
    this.id = id;
    this.sk1 = skillList.search(sk1);
    this.sk2 = skillList.search(sk2);
    this.sk3 = skillList.search(sk3);
    this.sk4 = skillList.search(sk4);
    this.item = item;
    this.abil = abil;

    const pokemon = PokemonOriginal.getItemById(pokemon_id);
    this.pokemon_id = pokemon.id; //0815
    this.name = pokemon.name;
    this.names = pokemon.names;
    this.type1 = pokemon.type1;
    this.type2 = pokemon.type2;

    this.hp = pokemon.hp * 2 + Math.floor(hps / 4);
    this.atk = pokemon.atk * 2 + Math.floor(atks / 4);
    this.def = pokemon.def * 2 + Math.floor(defs / 4);
    this.catk = pokemon.catk * 2 + Math.floor(catks / 4);
    this.cdef = pokemon.cdef * 2 + Math.floor(cdefs / 4);
    this.speed = pokemon.speed * 2 + Math.floor(speeds / 4);

    const gachaStats = {
      "6V": ["hp", "atk", "def", "catk", "cdef", "speed"],
      "5V1S": ["hp", "atk", "def", "catk", "cdef"], // 스피드 제외
      "5V1A": ["hp", "def", "catk", "cdef", "speed"], // 공격 제외
      "4V": ["hp", "def", "catk", "cdef"], // 공격 제외
    };

    if (gachaStats[gacha]) {
      gachaStats[gacha].forEach((stat) => {
        this[stat] += 31;
      });
    } else {
      console.log(this.id + " 개체치부여안됨");
    }

    this.hp = Math.floor(this.hp / 2) + 60;
    this.atk = Math.floor(this.atk / 2) + 5;
    this.def = Math.floor(this.def / 2) + 5;
    this.catk = Math.floor(this.catk / 2) + 5;
    this.cdef = Math.floor(this.cdef / 2) + 5;
    this.speed = Math.floor(this.speed / 2) + 5;

    let updowntrigger = 0;
    if (up == "hp" || down == "hp") {
      console.log("성격체력오류");
    }
    if (this[up]) {
      this[up] = Math.floor(this[up] * 1.1);
      updowntrigger += 1;
    }

    if (this[down]) {
      this[down] = Math.floor(this[down] * 0.9);
      updowntrigger += 1;
    }

    if (updowntrigger !== 2) {
      console.log(this.id + " 성격처리오류");
    }
  }
}

export default BattlePokemon;
