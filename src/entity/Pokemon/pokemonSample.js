import PokemonData from "./PokemonData";
import skillList from "../Skill/skillList";

import { abilObject } from "../Ability";
import { getMegaData } from "./MegaData";

// PokemonData에서 가져온 종족값, 타입에 추가로 노력치, 기술배치, 지닌 도구를 설정한 포켓몬 샘플
// 사용자에 의해 초기 설정값이 변하지만 battle 중에는 변하지 않는 값들을 관리
// pokemonInstance에서 getter로만 접근 가능
class samplePokemon {
  // prettier-ignore
  constructor(sampleName, uniqueKey, evs, up, down, sk1, sk2, sk3, sk4, item, abil, role, tip = ""){

    const pokemon = PokemonData.getPokemonDataByUniqueKey(uniqueKey);
    this.dexNo = pokemon.dexNo; 
    this.uniqueKey = pokemon.uniqueKey; 
    this.name = pokemon.name;
    this.type1 = pokemon.type1;
    this.type2 = pokemon.type2;
    this.feature = pokemon.feature;

    const parsedEvs = parseEvs(evs);
    let { hp: hps, atk: atks, def: defs, catk: catks, cdef: cdefs, speed: speeds } = parsedEvs;
    this.evs = { hp: hps, atk: atks, def: defs, catk: catks, cdef: cdefs, speed: speeds };
    this.nature = { up, down }; // 성격, battle 중에는 안 쓰지만 custom UI에 필요

    this.stat = {
      atk: null,
      def: null,
      catk: null,
      cdef: null,
      speed: null,
    }

    // 노력치 보정 + 개체값, 개체값은 그냥 31로 all 고정
    this.hp = pokemon.hp * 2 + Math.floor(hps / 4) + 31;
    this.stat.atk = pokemon.atk * 2 + Math.floor(atks / 4) + 31;
    this.stat.def = pokemon.def * 2 + Math.floor(defs / 4) + 31;
    this.stat.catk = pokemon.catk * 2 + Math.floor(catks / 4) + 31;
    this.stat.cdef = pokemon.cdef * 2 + Math.floor(cdefs / 4) + 31;
    this.stat.speed = pokemon.speed * 2 + Math.floor(speeds / 4) + 31;

    this.hp = Math.floor(this.hp / 2) + 60;
    this.stat.atk = Math.floor(this.stat.atk / 2) + 5;
    this.stat.def = Math.floor(this.stat.def / 2) + 5;
    this.stat.catk = Math.floor(this.stat.catk / 2) + 5;
    this.stat.cdef = Math.floor(this.stat.cdef / 2) + 5;
    this.stat.speed = Math.floor(this.stat.speed / 2) + 5;

    // 성격 보정
    this.stat[up] = Math.floor(this.stat[up] * 1.1);
    this.stat[down] = Math.floor(this.stat[down] * 0.9);

    // 최강의잉어킹 증강: 체력을 제외한 모든 능력치가 999로 고정
    if (this.abil?.name === "최강의잉어킹") {
      this.stat = {
        atk: 999,
        def: 999,
        catk: 999,
        cdef: 999,
        speed: 999,
      };
    }

    this.role = role;
    this.tip = tip;
    this.item = item;
    this.sampleName = sampleName;

    this.skill = {
      1: { ...skillList.search(sk1), skillNumber: 1 },
      2: { ...skillList.search(sk2), skillNumber: 2 },
      3: { ...skillList.search(sk3), skillNumber: 3 },
      4: { ...skillList.search(sk4), skillNumber: 4 },
      5: { ...skillList.search("발버둥"), skillNumber: 5 },
    };

  
    const baseAbilObj = abilObject[abil] ? { ...abilObject[abil] } : {};
    this.abil = {
      name: abil,
      ...baseAbilObj,
      used: false, // 특성 '탈'과 같은 1회용 특성 사용 여부
    };



    const targetMega = getMegaData(this.uniqueKey, this.item);
    if (targetMega) {
      const megaPokemon = PokemonData.getPokemonDataByUniqueKey(targetMega.megaFormId);
      if (megaPokemon) {
        let mAtk = Math.floor((megaPokemon.atk * 2 + Math.floor(atks / 4) + 31) / 2) + 5;
        let mDef = Math.floor((megaPokemon.def * 2 + Math.floor(defs / 4) + 31) / 2) + 5;
        let mCatk = Math.floor((megaPokemon.catk * 2 + Math.floor(catks / 4) + 31) / 2) + 5;
        let mCdef = Math.floor((megaPokemon.cdef * 2 + Math.floor(cdefs / 4) + 31) / 2) + 5;
        let mSpeed = Math.floor((megaPokemon.speed * 2 + Math.floor(speeds / 4) + 31) / 2) + 5;

        const mStat = { atk: mAtk, def: mDef, catk: mCatk, cdef: mCdef, speed: mSpeed };
        if (mStat[up]) mStat[up] = Math.floor(mStat[up] * 1.1);
        if (mStat[down]) mStat[down] = Math.floor(mStat[down] * 0.9);

        this.megaData = {
          name: megaPokemon.name,
          dexNo: megaPokemon.dexNo,
          uniqueKey: megaPokemon.uniqueKey,
          type1: megaPokemon.type1,
          type2: megaPokemon.type2,
          abil: targetMega.abil,
          stone: targetMega.stone,
          stat: mStat,
        };
        // 메가 진화시 바뀔 스탯을 미리 계산해놓고 메가진화시 값만 바꾼다
      }
    }
  }
}

export default samplePokemon;

// 노력치 파싱
function parseEvs(evs) {
  if (Array.isArray(evs)) {
    return {
      hp: evs[0] ?? 0,
      atk: evs[1] ?? 0,
      def: evs[2] ?? 0,
      catk: evs[3] ?? 0,
      cdef: evs[4] ?? 0,
      speed: evs[5] ?? 0,
    };
  }

  if (typeof evs === "string") {
    const statKeyMap = {
      H: "hp",
      A: "atk",
      B: "def",
      C: "catk",
      D: "cdef",
      S: "speed",
    };
    const cleanStr = evs.trim().toUpperCase();

    // 패턴 1: "HA252", "CS252", "HB252", "AS252", "HD252", "HC252", "BD252" 등 또는 세부 4스탯 포함 형태 ("HA252S4" 등)
    const match252 = cleanStr.match(/^([HABCDS]{2})252(?:\s*([HABCDS])(\d+))?$/);
    if (match252) {
      const s1 = match252[1][0];
      const s2 = match252[1][1];
      const result = { hp: 0, atk: 0, def: 0, catk: 0, cdef: 0, speed: 0 };
      result[statKeyMap[s1]] = 252;
      result[statKeyMap[s2]] = 252;

      let extraStat = match252[2];
      let extraVal = match252[3] ? parseInt(match252[3], 10) : 4;

      if (!extraStat) {
        if (![s1, s2].includes("H")) extraStat = "H";
        else if (![s1, s2].includes("B")) extraStat = "B";
        else extraStat = "D";
      }
      result[statKeyMap[extraStat]] = (result[statKeyMap[extraStat]] || 0) + extraVal;
      return result;
    }

    // 패턴 2: "H252A252B4", "H252 A252 B4" 등 개별 지정
    const individualMatches = [...cleanStr.matchAll(/([HABCDS])(\d+)/g)];
    if (individualMatches.length > 0) {
      const result = { hp: 0, atk: 0, def: 0, catk: 0, cdef: 0, speed: 0 };
      for (const m of individualMatches) {
        const key = statKeyMap[m[1]];
        if (key) {
          result[key] = parseInt(m[2], 10);
        }
      }
      return result;
    }
  }

  console.error("유효하지 않은 노력치 포맷입니다:", evs);
  return { hp: 0, atk: 0, def: 0, catk: 0, cdef: 0, speed: 0 };
}
