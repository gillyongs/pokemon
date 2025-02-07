import PokemonOriginal from "./PokemonOriginal";
import skillList from "../Skill/Skill";
import { itemText } from "../Item";
class BattlePokemon {
  // prettier-ignore
  constructor(id, pokemon_id, gacha, hps, atks, defs, catks, cdefs, speeds, up, down, sk1, sk2, sk3, sk4, item, abil){
    this._validateParams(id, pokemon_id, gacha, hps, atks, defs, catks, cdefs, speeds, up, down, sk1, sk2, sk3, sk4, item, abil);

    this.id = id;
    this.sk1 = skillList.search(sk1);
    this.sk2 = skillList.search(sk2);
    this.sk3 = skillList.search(sk3);
    this.sk4 = skillList.search(sk4);
    this.item = item;
    this.itemText = itemText[item];
    this.abil = abil;
    this.abilText = abilText[abil];

    const pokemon = PokemonOriginal.getItemById(pokemon_id);
    this.pokemon_id = pokemon.id; //ex) 0815
    this.name = pokemon.name;
    this.names = pokemon.names;
    this.namess = pokemon.namess;
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
      console.error(this.id + " 개체치부여안됨");
    }

    this.hp = Math.floor(this.hp / 2) + 60;
    this.atk = Math.floor(this.atk / 2) + 5;
    this.def = Math.floor(this.def / 2) + 5;
    this.catk = Math.floor(this.catk / 2) + 5;
    this.cdef = Math.floor(this.cdef / 2) + 5;
    this.speed = Math.floor(this.speed / 2) + 5;

    let updowntrigger = 0;
    if (up === "hp" || down === "hp") {
      console.error("성격체력오류");
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
    if (abilText[abil] === null || abilText[abil] === undefined)
      console.error("abilText not find", abil);
    if (itemText[item] === null || itemText[item] === undefined)
      console.error("itemText not find", item);
  }
}

const abilText = {
  리베로: "자신이 사용한 기술과 같은 타입으로 변화한다.",
  심안: "노말타입과 격투타입 기술을 고스트타입에게 맞힐 수 있다. 상대의 회피율 변화를 무시하고 명중률도 떨어지지 않는다.",
  정전기: "자신에게 접촉한 상대를 30% 확률로 마비시킨다.",
  프레셔: "상대가 쓰는 기술의 PP를 많이 줄인다.",
  탈: "탈로 1번 공격을 막을 수 있다.",
  재앙의검:
    "이 특성을 가진 포켓몬을 제외한 모든 포켓몬의 방어를 약하게 만든다.",
  불요의검: "등장했을 때 공격이 1랭크 올라간다.",
  그래스메이커: "전투에 나오면 지형을 그래스필드로 만든다.",
  잔비: "전투에 나오면 날씨를 5턴 간 비로 바꾼다.",
  하드론엔진:
    "등장했을 때 일렉트릭필드를 전개한다. 일렉트릭필드일 때 미래 기관에 의해 특수공격이 1.3배가 된다.",
};

export default BattlePokemon;
