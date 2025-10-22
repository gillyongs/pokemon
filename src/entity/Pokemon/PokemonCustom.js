import PokemonOriginal from "./PokemonOriginal";
import skillList from "../Skill/Skill";
import { itemText } from "../Item";
import { abilObject } from "../Abillity";
//배틀용 포켓몬 객체
//원본(PokemonOriginal)에서 노력치, 스킬, 지닌 도구를 설정한다
//ReadOnly, 불변값으로 Pokemon 객체가 origin으로 지니고있는다
class BattlePokemon {
  // prettier-ignore
  constructor(id, pokemon_id, gacha, hps, atks, defs, catks, cdefs, speeds, up, down, sk1, sk2, sk3, sk4, item, abil){
    this._validateParams(id, pokemon_id, gacha, hps, atks, defs, catks, cdefs, speeds, up, down, sk1, sk2, sk3, sk4, item, abil);

    this.id = id;
    pokemonList.push(id)
    this.sk1 = skillList.search(sk1);
    this.sk2 = skillList.search(sk2);
    this.sk3 = skillList.search(sk3);
    this.sk4 = skillList.search(sk4);
    this.item = item;
    this.itemText = itemText[item];
    this.abil = abil;
    this.abilObj = abilObject[abil] ? abilObject[abil] : {}
    this.abilObj.name = abil

    const pokemon = PokemonOriginal.getItemById(pokemon_id);
    this.pokemon_id = pokemon.id; //ex) 0815
    this.name = pokemon.name;
    this.names = pokemon.names;
    this.namess = pokemon.namess;
    this.type1 = pokemon.type1;
    this.type2 = pokemon.type2;
    this.feature = pokemon.feature

    this.stat = {
      atk: null,
      def: null,
      catk: null,
      cdef: null,
      speed: null,
    }
    this.hp = pokemon.hp * 2 + Math.floor(hps / 4);
    this.stat.atk = pokemon.atk * 2 + Math.floor(atks / 4);
    this.stat.def = pokemon.def * 2 + Math.floor(defs / 4);
    this.stat.catk = pokemon.catk * 2 + Math.floor(catks / 4);
    this.stat.cdef = pokemon.cdef * 2 + Math.floor(cdefs / 4);
    this.stat.speed = pokemon.speed * 2 + Math.floor(speeds / 4);

    const gachaStats = {
      "6V": ["hp", "atk", "def", "catk", "cdef", "speed"],
      "5V1S": ["hp", "atk", "def", "catk", "cdef"], // 스피드 제외
      "5V1A": ["hp", "def", "catk", "cdef", "speed"], // 공격 제외
      "4V": ["hp", "def", "catk", "cdef"], // 공격 제외
    };

    if (gachaStats[gacha]) {
      gachaStats[gacha].forEach((stat) => {
        if(stat === "hp"){
          this[stat]+=31
        }
        else{
          this.stat[stat] += 31;
        }
      });

    } else {
      console.error(this.id + " 개체치부여안됨");
    }

    this.hp = Math.floor(this.hp / 2) + 60;
    this.stat.atk = Math.floor(this.stat.atk / 2) + 5;
    this.stat.def = Math.floor(this.stat.def / 2) + 5;
    this.stat.catk = Math.floor(this.stat.catk / 2) + 5;
    this.stat.cdef = Math.floor(this.stat.cdef / 2) + 5;
    this.stat.speed = Math.floor(this.stat.speed / 2) + 5;


    let updowntrigger = 0;
    if (up === "hp" || down === "hp") {
      console.error("성격체력오류");
    }
    if (this.stat[up]) {
      this.stat[up] = Math.floor(this.stat[up] * 1.1);
      updowntrigger += 1;
    }

    if (this.stat[down]) {
      this.stat[down] = Math.floor(this.stat[down] * 0.9);
      updowntrigger += 1;
    }

    if (updowntrigger !== 2) {
      console.error(this.id + " 성격처리오류");
    }

  }
  // prettier-ignore
  _validateParams(id, pokemon_id, gacha, hps, atks, defs, catks, cdefs, speeds, up, down, sk1, sk2, sk3, sk4, item, abil){
    if (typeof id !== "string") console.error("id must be a string", id);
    if (typeof pokemon_id !== "string")
      console.error("pokemon_id must be a string", pokemon_id);
    if (!["6V", "5V1A", "5V1S", "4V"].includes(gacha))
      console.error("gacha must be one of '6V', '5V1A', '5V1S', '4V'", gacha);
    //                                    물리 특수    트릭룸 물리  특수
    if (typeof hps !== "number") console.error("hps must be a number", hps);
    if (typeof atks !== "number") console.error("atks must be a number", atks);
    if (typeof defs !== "number") console.error("defs must be a number", defs);
    if (typeof catks !== "number")
      console.error("catks must be a number", catks);
    if (typeof cdefs !== "number")
      console.error("cdefs must be a number", cdefs);
    if (typeof speeds !== "number")
      console.error("speeds must be a number", speeds);
    if (hps + atks + catks + defs + cdefs + speeds !== 508) {
      console.error(id + "노력치 오류");
            console.error(hps + atks + catks + defs + cdefs + speeds );
    }
    if (!["atk", "def", "catk", "cdef", "speed"].includes(up))
      console.error(
        "up must be one of 'atk', 'def', 'catk', 'cdef', 'speed'",
        up
      );
    if (!["atk", "def", "catk", "cdef", "speed"].includes(down))
      console.error(
        "up must be one of 'atk', 'def', 'catk', 'cdef', 'speed'",
        down
      );
    if (typeof sk1 !== "string") console.error("sk1 must be a string", sk1);
    if (typeof sk2 !== "string") console.error("sk2 must be a string", sk2);
    if (typeof sk3 !== "string") console.error("sk3 must be a string", sk3);
    if (typeof sk4 !== "string") console.error("sk4 must be a string", sk4);
    if (typeof skillList.search(sk1) !== "object")
      console.error("sk1 skill not exist", skillList.search(sk1));
    if (typeof skillList.search(sk2) !== "object")
      console.error("sk2 skill not exist", skillList.search(sk2));
    if (typeof skillList.search(sk3) !== "object")
      console.error("sk3 skill not exist", skillList.search(sk3));
    if (typeof skillList.search(sk4) !== "object")
      console.error("sk4 skill not exist", skillList.search(sk4));

    if (typeof item !== "string") console.error("item must be a string", item);
    if (typeof abil !== "string") console.error("abil must be a string", abil);
    if (abilObject[abil] === null || abilObject[abil] === undefined)
      console.error("abilText not find", abil);
    if (itemText[item] === null || itemText[item] === undefined)
      console.error("itemText not find", item);
  }
}

export const pokemonList = [];

export default BattlePokemon;
