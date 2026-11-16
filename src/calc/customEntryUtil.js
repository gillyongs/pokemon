import sampleList from "../entity/Pokemon/pokemonSampleList";
import PokemonData from "../entity/Pokemon/PokemonData";
import { getAbilityListForPokemon } from "../component/customScreen/sampleInfo/AbilSearchModal";
import { getItemListForPokemon } from "../component/customScreen/sampleInfo/ItemSearchModal";
import { getSkillListForPokemon } from "../entity/Skill/PokemonSkillList";
import { STAT_KEYS, getNatureInfo, calculateStat } from "../component/customScreen/sampleInfo/StatAdjustmentModal";

const WEATHER_ABILITIES = ["잔비", "가뭄", "진홍빛고동", "모래날림"];
const WALL_SKILLS = ["리플렉터", "빛의장막", "오로라베일"];

const isWallPokemon = (pokemon) => {
  if (!pokemon) return false;
  const sName = pokemon.sampleName || pokemon.id;
  if (sName && sName.includes("벽깔이")) return true;
  if (pokemon.skill) {
    const skills = Object.values(pokemon.skill);
    return skills.some((s) => s && WALL_SKILLS.includes(s.name));
  }
  return false;
};

const isNameMatch = (searchStr, pokemon) => {
  if (!searchStr) return true;

  const s = searchStr.trim().toLowerCase();
  const cleanId = (pokemon.sampleName || pokemon.id || "").replace(/\s*[(（].*?[)）]/g, "").trim().toLowerCase();
  const cleanName = (pokemon.name || "").replace(/\s*[(（].*?[)）]/g, "").trim().toLowerCase();

  const pAbil = pokemon.abil?.name || pokemon.abil;
  if (s === "위협" && (pAbil === "위협" || pokemon.megaData?.abil === "위협")) return true;
  if (s === "날씨" && (WEATHER_ABILITIES.includes(pAbil) || (pokemon.megaData && WEATHER_ABILITIES.includes(pokemon.megaData.abil)))) return true;
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
    const pAbil = pokemon.abil?.name || pokemon.abil;
    if (isIntimidateFilter) {
      intimidateMatch = pAbil === "위협" || pokemon.megaData?.abil === "위협";
    }

    let weatherMatch = true;
    if (isWeatherFilter) {
      weatherMatch = WEATHER_ABILITIES.includes(pAbil) || (pokemon.megaData && WEATHER_ABILITIES.includes(pokemon.megaData.abil));
    }

    let wallMatch = true;
    if (isWallFilter) {
      wallMatch = isWallPokemon(pokemon);
    }

    return nameMatch && typeMatch && roleMatch && megaMatch && legendaryMatch && intimidateMatch && weatherMatch && wallMatch;
  });
};

export const buildCustomSlotEntry = (pokemon, customItem, customAbil, customSkills, customStats) => {
  const rawPokemon = sampleList.getDataBySampleName(pokemon.sampleName || pokemon.id) || pokemon;
  const rawAbilName = rawPokemon.abil?.name || rawPokemon.abil;
  const finalItem = customItem !== undefined ? customItem : rawPokemon.item;
  const finalAbil = customAbil !== undefined ? customAbil : rawAbilName;
  const isItemChanged = finalItem !== rawPokemon.item;
  const isAbilChanged = finalAbil !== rawAbilName;

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
      sampleName: rawPokemon.sampleName || rawPokemon.id,
      id: rawPokemon.sampleName || rawPokemon.id,
      item: finalItem,
      abil: finalAbil,
      skills: finalSkills,
      ...(isStatChanged
        ? {
            stat: customStats.stat,
            hp: customStats.hp,
            evs: customStats.evs,
            nature: customStats.nature,
            megaData: customStats.megaData,
          }
        : {}),
    };
  }

  return rawPokemon.sampleName || rawPokemon.id;
};

// 슬롯 엔트리를 완성된 샘플 객체로 변환 (커스텀 반영)
export const resolveSlotPokemonData = (pokemonEntry) => sampleList.buildSample(pokemonEntry);

const isValidEntrySlot = (slot) => {
  if (slot === null) return true;
  if (typeof slot === "string") return Boolean(sampleList.getDataBySampleName(slot));
  const slotSampleName = slot.sampleName || slot.id;
  if (typeof slot !== "object" || Array.isArray(slot) || typeof slotSampleName !== "string") return false;

  const rawPokemon = sampleList.getDataBySampleName(slotSampleName);
  if (!rawPokemon) return false;

  // 1. 특성 검증: 해당 포켓몬이 가질 수 있는 구현된 특성인지 확인
  if (slot.abil !== undefined && slot.abil !== null) {
    if (typeof slot.abil !== "string") return false;
    const validAbils = getAbilityListForPokemon(rawPokemon)
      .filter((a) => a.isImplemented)
      .map((a) => a.name);
    if (!validAbils.includes(slot.abil) && slot.abil !== (rawPokemon.abil?.name || rawPokemon.abil)) {
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
  const hasCustomStatFields = slot.evs !== undefined || slot.nature !== undefined || slot.hp !== undefined || slot.stat !== undefined;
  if (hasCustomStatFields) {
    const evs = slot.evs || rawPokemon.evs || { hp: 0, atk: 0, def: 0, catk: 0, cdef: 0, speed: 0 };
    if (typeof evs !== "object" || Array.isArray(evs)) return false;

    let totalEv = 0;
    for (const k of STAT_KEYS) {
      const v = evs[k];
      if (typeof v !== "number" || !Number.isInteger(v) || v < 0 || v > 252) return false;
      totalEv += v;
    }
    const maxAllowed = 508;
    if (totalEv > maxAllowed) return false;

    const nature = slot.nature || rawPokemon.nature || { up: null, down: null };
    if (typeof nature !== "object" || Array.isArray(nature)) return false;
    const validNatureKeys = [null, undefined, "atk", "def", "catk", "cdef", "speed"];
    if (!validNatureKeys.includes(nature.up) || !validNatureKeys.includes(nature.down)) return false;
    const natureInfo = getNatureInfo(nature.up, nature.down);
    if (!natureInfo.isValid) return false;

    const baseData = PokemonData.getPokemonDataByUniqueKey(rawPokemon.uniqueKey);
    if (!baseData) return false;

    const ivs = {
      hp: 31,
      atk: 31,
      def: 31,
      catk: 31,
      cdef: 31,
      speed: 31,
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
  const ids = arr.filter(Boolean).map((entry) => (typeof entry === "object" ? entry.sampleName || entry.id : entry));
  if (new Set(ids).size !== ids.length) return false;

  // 팀 내 동일 도감번호 중복 검증
  const nos = arr
    .filter(Boolean)
    .map((entry) => {
      const idKey = typeof entry === "object" ? entry.sampleName || entry.id : entry;
      const raw = sampleList.getDataBySampleName(idKey);
      return raw?.dexNo || raw?.no || raw?.uniqueKey;
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
