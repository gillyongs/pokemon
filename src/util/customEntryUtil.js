import sampleList from "../entity/Pokemon/SamplePokemon";
import PokemonData from "../entity/Pokemon/PokemonData";
import skillList from "../entity/Skill/skillList";
import { getAbilityListForPokemon } from "../component/customScreen/sampleInfo/AbilSearchModal";
import { getItemListForPokemon } from "../component/customScreen/sampleInfo/ItemSearchModal";
import { getSkillListForPokemon } from "../skill/PokemonSkillList";
import { STAT_KEYS, getNatureInfo, normalizeGacha, calculateStat } from "../component/customScreen/sampleInfo/StatAdjustmentModal";

export const WEATHER_ABILITIES = ["잔비", "가뭄", "진홍빛고동", "모래날림"];
export const WALL_SKILLS = ["리플렉터", "빛의장막", "오로라베일"];

export const isWallPokemon = (pokemon) => {
  if (!pokemon) return false;
  if (pokemon.id && pokemon.id.includes("벽깔이")) return true;
  if (pokemon.skill) {
    const skills = Object.values(pokemon.skill);
    return skills.some((s) => s && WALL_SKILLS.includes(s.name));
  }
  return false;
};

export const isNameMatch = (searchStr, pokemon) => {
  if (!searchStr) return true;

  const s = searchStr.trim().toLowerCase();
  const cleanId = (pokemon.id || "").replace(/\s*[\(（].*?[\)）]/g, "").trim().toLowerCase();
  const cleanName = (pokemon.name || "").replace(/\s*[\(（].*?[\)）]/g, "").trim().toLowerCase();

  if (s === "위협" && (pokemon.abil === "위협" || pokemon.megaData?.abil === "위협")) return true;
  if (s === "날씨" && (WEATHER_ABILITIES.includes(pokemon.abil) || (pokemon.megaData && WEATHER_ABILITIES.includes(pokemon.megaData.abil)))) return true;
  if (s === "초전설" && pokemon.feature?.legendary) return true;
  if ((s === "메가진화" || s === "메가") && pokemon.megaData) return true;

  if (cleanId.includes(s) || cleanName.includes(s)) return true;

  if (s === "다투" && cleanId.includes("달투곰")) return true;
  if (s === "우라" && (cleanId.includes("물라오스") || cleanId.includes("악라오스"))) return true;
  if (s === "버드" && (cleanId.includes("백마렉스") || cleanId.includes("흑마렉스"))) return true;
  if (s === "대검" && cleanId.includes("히검귀")) return true;
  if (s === "페" && cleanId.includes("패리퍼")) return true;

  return false;
};

export const filterSamplePokemons = (
  items,
  { searchTerm, activeTypes, activeLogic, activeRoles, isMegaFilter, isLegendaryFilter, isIntimidateFilter, isWeatherFilter, isWallFilter }
) => {
  return items.filter((pokemon) => {
    const nameMatch = isNameMatch(searchTerm, pokemon);

    let typeMatch = true;
    if (activeTypes.length > 0) {
      if (activeLogic === "OR") {
        typeMatch = activeTypes.includes(pokemon.type1) || activeTypes.includes(pokemon.type2);
      } else {
        typeMatch = activeTypes.every((t) => pokemon.type1 === t || pokemon.type2 === t);
      }
    }

    let roleMatch = true;
    if (activeRoles.length > 0) {
      roleMatch = activeRoles.includes(pokemon.role);
    }

    let megaMatch = true;
    if (isMegaFilter) {
      megaMatch = !!pokemon.megaData;
    }

    let legendaryMatch = true;
    if (isLegendaryFilter) {
      legendaryMatch = !!pokemon.feature?.legendary;
    }

    let intimidateMatch = true;
    if (isIntimidateFilter) {
      intimidateMatch = pokemon.abil === "위협" || pokemon.megaData?.abil === "위협";
    }

    let weatherMatch = true;
    if (isWeatherFilter) {
      weatherMatch = WEATHER_ABILITIES.includes(pokemon.abil) || (pokemon.megaData && WEATHER_ABILITIES.includes(pokemon.megaData.abil));
    }

    let wallMatch = true;
    if (isWallFilter) {
      wallMatch = isWallPokemon(pokemon);
    }

    return nameMatch && typeMatch && roleMatch && megaMatch && legendaryMatch && intimidateMatch && weatherMatch && wallMatch;
  });
};

export const buildCustomSlotEntry = (pokemon, customItem, customAbil, customSkills, customStats) => {
  const rawPokemon = sampleList.getDataById(pokemon.id) || pokemon;
  const finalItem = customItem !== undefined ? customItem : rawPokemon.item;
  const finalAbil = customAbil !== undefined ? customAbil : rawPokemon.abil;
  const isItemChanged = finalItem !== rawPokemon.item;
  const isAbilChanged = finalAbil !== rawPokemon.abil;

  const defaultSkills = {
    1: rawPokemon.skill?.[1]?.name,
    2: rawPokemon.skill?.[2]?.name,
    3: rawPokemon.skill?.[3]?.name,
    4: rawPokemon.skill?.[4]?.name,
  };
  const finalSkills = customSkills || defaultSkills;
  const isSkillsChanged = [1, 2, 3, 4].some((slot) => finalSkills[slot] && finalSkills[slot] !== defaultSkills[slot]);

  const isStatChanged = Boolean(
    customStats &&
      (customStats.hp !== rawPokemon.hp ||
        customStats.stat?.atk !== rawPokemon.stat?.atk ||
        customStats.stat?.def !== rawPokemon.stat?.def ||
        customStats.stat?.catk !== rawPokemon.stat?.catk ||
        customStats.stat?.cdef !== rawPokemon.stat?.cdef ||
        customStats.stat?.speed !== rawPokemon.stat?.speed)
  );

  if (isItemChanged || isAbilChanged || isSkillsChanged || isStatChanged) {
    return {
      id: rawPokemon.id,
      item: finalItem,
      abil: finalAbil,
      skills: finalSkills,
      ...(isStatChanged
        ? {
            stat: customStats.stat,
            hp: customStats.hp,
            evs: customStats.evs,
            nature: customStats.nature,
            gacha: customStats.gacha,
            megaData: customStats.megaData,
          }
        : {}),
    };
  }

  return rawPokemon.id;
};

export const resolveSlotPokemonData = (pokemonEntry) => {
  const pokemonId = typeof pokemonEntry === "object" && pokemonEntry ? pokemonEntry.id : pokemonEntry;
  if (!pokemonId) return null;

  const rawPokemonData = sampleList.getDataById(pokemonId);
  if (!rawPokemonData) return null;

  const customItem = typeof pokemonEntry === "object" && pokemonEntry ? pokemonEntry.item : null;
  const customAbil = typeof pokemonEntry === "object" && pokemonEntry ? pokemonEntry.abil : null;
  const customSkills = typeof pokemonEntry === "object" && pokemonEntry ? pokemonEntry.skills : null;

  const itemVal = customItem !== null && customItem !== undefined ? (customItem === "없음" ? "" : customItem) : rawPokemonData.item;
  const abilVal = customAbil !== null && customAbil !== undefined ? customAbil : rawPokemonData.abil;
  let skillsVal = rawPokemonData.skill;
  if (customSkills) {
    skillsVal = {
      1: customSkills[1] ? { ...skillList.search(customSkills[1]), skillNumber: 1 } : rawPokemonData.skill[1],
      2: customSkills[2] ? { ...skillList.search(customSkills[2]), skillNumber: 2 } : rawPokemonData.skill[2],
      3: customSkills[3] ? { ...skillList.search(customSkills[3]), skillNumber: 3 } : rawPokemonData.skill[3],
      4: customSkills[4] ? { ...skillList.search(customSkills[4]), skillNumber: 4 } : rawPokemonData.skill[4],
    };
  }
  const statVal = typeof pokemonEntry === "object" && pokemonEntry?.stat ? { ...rawPokemonData.stat, ...pokemonEntry.stat } : rawPokemonData.stat;
  const hpVal = typeof pokemonEntry === "object" && pokemonEntry?.hp !== undefined ? pokemonEntry.hp : rawPokemonData.hp;
  const evsVal = typeof pokemonEntry === "object" && pokemonEntry?.evs ? pokemonEntry.evs : rawPokemonData.evs;
  const natureVal = typeof pokemonEntry === "object" && pokemonEntry?.nature ? pokemonEntry.nature : rawPokemonData.nature;
  const gachaVal = typeof pokemonEntry === "object" && pokemonEntry?.gacha ? pokemonEntry.gacha : rawPokemonData.gacha;
  const megaDataVal = typeof pokemonEntry === "object" && pokemonEntry?.megaData ? pokemonEntry.megaData : rawPokemonData.megaData;

  return {
    ...rawPokemonData,
    item: itemVal,
    abil: abilVal,
    skill: skillsVal,
    stat: statVal,
    hp: hpVal,
    evs: evsVal,
    nature: natureVal,
    gacha: gachaVal,
    megaData: megaDataVal,
  };
};

export const isValidEntrySlot = (slot) => {
  if (slot === null) return true;
  if (typeof slot === "string") return Boolean(sampleList.getDataById(slot));
  if (typeof slot !== "object" || Array.isArray(slot) || typeof slot.id !== "string") return false;

  const rawPokemon = sampleList.getDataById(slot.id);
  if (!rawPokemon) return false;

  // 1. 특성 검증: 해당 포켓몬이 가질 수 있는 구현된 특성인지 확인
  if (slot.abil !== undefined && slot.abil !== null) {
    if (typeof slot.abil !== "string") return false;
    const validAbils = getAbilityListForPokemon(rawPokemon)
      .filter((a) => a.isImplemented)
      .map((a) => a.name);
    if (!validAbils.includes(slot.abil) && slot.abil !== rawPokemon.abil) {
      return false;
    }
  }

  // 2. 도구 검증: 존재하는 도구이자 해당 포켓몬이 장착 가능한 도구인지 확인 (전용 도구 제한 포함)
  if (slot.item !== undefined && slot.item !== null) {
    if (typeof slot.item !== "string") return false;
    if (slot.item !== "" && slot.item !== "없음") {
      const validItems = getItemListForPokemon(rawPokemon).map((i) => i.name);
      if (!validItems.includes(slot.item) && slot.item !== rawPokemon.item) {
        return false;
      }
    }
  }

  // 3. 기술 검증: 해당 포켓몬이 배울 수 있는 구현된 기술인지, 중복은 없는지 확인
  if (slot.skills !== undefined && slot.skills !== null) {
    if (typeof slot.skills !== "object" || Array.isArray(slot.skills)) return false;
    const learnableSkills = getSkillListForPokemon(rawPokemon)
      .filter((s) => s.isImplemented)
      .map((s) => s.name);
    const chosenSkills = [];
    for (const num of [1, 2, 3, 4]) {
      const skName = slot.skills[num] ?? slot.skills[String(num)];
      if (skName !== undefined && skName !== null && skName !== "") {
        if (typeof skName !== "string") return false;
        if (!learnableSkills.includes(skName)) return false;
        if (chosenSkills.includes(skName)) return false;
        chosenSkills.push(skName);
      }
    }
    if (chosenSkills.length === 0) return false;
  }

  // 4. 능력치(노력치, 성격, 개체값, 실능치) 범위 및 일치 여부 검증
  const hasCustomStatFields = slot.evs !== undefined || slot.nature !== undefined || slot.gacha !== undefined || slot.hp !== undefined || slot.stat !== undefined;
  if (hasCustomStatFields) {
    const evs = slot.evs || rawPokemon.evs || { hp: 0, atk: 0, def: 0, catk: 0, cdef: 0, speed: 0 };
    if (typeof evs !== "object" || Array.isArray(evs)) return false;

    let totalEv = 0;
    for (const k of STAT_KEYS) {
      const v = evs[k];
      if (typeof v !== "number" || !Number.isInteger(v) || v < 0 || v > 252) return false;
      totalEv += v;
    }
    if (totalEv > 508) return false;

    const nature = slot.nature || rawPokemon.nature || { up: null, down: null };
    if (typeof nature !== "object" || Array.isArray(nature)) return false;
    const validNatureKeys = [null, undefined, "atk", "def", "catk", "cdef", "speed"];
    if (!validNatureKeys.includes(nature.up) || !validNatureKeys.includes(nature.down)) return false;
    const natureInfo = getNatureInfo(nature.up, nature.down);
    if (!natureInfo.isValid) return false;

    const rawGacha = slot.gacha || rawPokemon.gacha || "6V";
    if (!["6V", "5V0A", "5V0S", "4V0A0S", "5V1A", "5V1S", "4V"].includes(rawGacha)) return false;
    const gacha = normalizeGacha(rawGacha);

    const baseData = PokemonData.getDataById(rawPokemon.pokemon_id) || PokemonData.getDataById(rawPokemon.id);
    if (!baseData) return false;

    const isSpeed0 = gacha === "5V0S" || gacha === "4V0A0S";
    const isAtk0 = gacha === "5V0A" || gacha === "4V0A0S";
    const ivs = {
      hp: 31,
      atk: isAtk0 ? 0 : 31,
      def: 31,
      catk: 31,
      cdef: 31,
      speed: isSpeed0 ? 0 : 31,
    };
    const isUp = (key) => nature.up === key && nature.down !== key;
    const isDown = (key) => nature.down === key && nature.up !== key;

    const expectedHp = calculateStat(baseData.hp, ivs.hp, evs.hp, true);
    const expectedStat = {
      atk: calculateStat(baseData.atk, ivs.atk, evs.atk, false, isUp("atk"), isDown("atk")),
      def: calculateStat(baseData.def, ivs.def, evs.def, false, isUp("def"), isDown("def")),
      catk: calculateStat(baseData.catk, ivs.catk, evs.catk, false, isUp("catk"), isDown("catk")),
      cdef: calculateStat(baseData.cdef, ivs.cdef, evs.cdef, false, isUp("cdef"), isDown("cdef")),
      speed: calculateStat(baseData.speed, ivs.speed, evs.speed, false, isUp("speed"), isDown("speed")),
    };

    if (slot.hp !== undefined && slot.hp !== expectedHp && slot.hp !== rawPokemon.hp) {
      return false;
    }
    if (slot.stat !== undefined) {
      if (typeof slot.stat !== "object" || Array.isArray(slot.stat)) return false;
      for (const k of ["atk", "def", "catk", "cdef", "speed"]) {
        if (slot.stat[k] !== expectedStat[k] && slot.stat[k] !== rawPokemon.stat?.[k]) {
          return false;
        }
      }
    }
  }

  return true;
};

export const isValidTeamArray = (arr) => {
  if (!Array.isArray(arr) || arr.length !== 3) return false;
  if (!arr.every(isValidEntrySlot)) return false;

  // 팀 내 중복 포켓몬 검증
  const ids = arr.filter(Boolean).map((entry) => (typeof entry === "object" ? entry.id : entry));
  if (new Set(ids).size !== ids.length) return false;

  // 팀 내 동일 도감번호 중복 검증
  const nos = arr
    .filter(Boolean)
    .map((entry) => {
      const raw = sampleList.getDataById(typeof entry === "object" ? entry.id : entry);
      return raw?.no || raw?.pokemon_id;
    })
    .filter(Boolean);
  if (new Set(nos).size !== nos.length) return false;

  return true;
};

export const exportTeamToFile = (targetType, selectedTeam, npcTeam) => {
  let payload;
  let fileName;
  if (targetType === "player") {
    payload = { type: "single", team: selectedTeam };
    fileName = "my_entry.txt";
  } else if (targetType === "npc") {
    payload = { type: "single", team: npcTeam };
    fileName = "npc_entry.txt";
  } else {
    payload = { type: "all", playerTeam: selectedTeam, npcTeam };
    fileName = "all_entry.txt";
  }

  const content = JSON.stringify(payload, null, 2);
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
