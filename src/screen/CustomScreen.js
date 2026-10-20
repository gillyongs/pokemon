import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useRecoilState } from "recoil";
import sampleList from "../entity/Pokemon/SamplePokemon";
import PokemonData from "../entity/Pokemon/PokemonData";
import { pokemonList, POKEMON_ROLES } from "../entity/Pokemon/PokemonTemplate";
import { abilObject } from "../entity/Ability";
import { defaultOption } from "../config/defaultOption";
import { gameOptionState } from "../util/recoilState";
import SampleInfoModal from "../component/customScreen/SampleInfoModal";
import { getAbilityListForPokemon } from "../component/customScreen/AbilSearchModal";
import { getItemListForPokemon } from "../component/customScreen/ItemSearchModal";
import { getSkillListForPokemon } from "../skill/PokemonSkillList";
import { STAT_KEYS, getNatureInfo, normalizeGacha, calculateStat } from "../component/customScreen/StatAdjustmentModal";
import skillList from "../entity/Skill/skillList";
import { fillRandomTeam, getRandomPokemonForSlot } from "../util/randomTeam";
import { testmode } from "../config/testMode";

const CustomScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTeam, setSelectedTeam] = useState(() => location.state?.team1 || [null, null, null]);
  const [npcTeam, setNpcTeam] = useState(() => location.state?.team2 || [null, null, null]);
  const [activeTab, setActiveTab] = useState("player");
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTypes, setActiveTypes] = useState([]);
  const [activeLogic, setActiveLogic] = useState("OR");
  const [activeRoles, setActiveRoles] = useState([]);
  const [isMegaFilter, setIsMegaFilter] = useState(false);
  const [isLegendaryFilter, setIsLegendaryFilter] = useState(false);
  const [isIntimidateFilter, setIsIntimidateFilter] = useState(false);
  const [isWeatherFilter, setIsWeatherFilter] = useState(false);
  const [tempSelectedTypes, setTempSelectedTypes] = useState([]);
  const [tempSelectedRoles, setTempSelectedRoles] = useState([]);
  const [tempIsMegaFilter, setTempIsMegaFilter] = useState(false);
  const [tempIsLegendaryFilter, setTempIsLegendaryFilter] = useState(false);
  const [tempIsIntimidateFilter, setTempIsIntimidateFilter] = useState(false);
  const [tempIsWeatherFilter, setTempIsWeatherFilter] = useState(false);
  const [tempLogic, setTempLogic] = useState("OR");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [gameOption, setGameOption] = useRecoilState(gameOptionState);
  const difficulty = gameOption.difficulty;
  const teamOption = gameOption.teamOption;
  const setDifficulty = (level) => setGameOption((prev) => ({ ...prev, difficulty: level }));
  const setTeamOption = (opt) => setGameOption((prev) => ({ ...prev, teamOption: opt }));
  const [typeColors, setTypeColors] = useState({});

  const listAreaRef = useRef(null);
  const [showTopBtn, setShowTopBtn] = useState(false);

  const [infoModalPokemon, setInfoModalPokemon] = useState(null);
  const [editingSlotIndex, setEditingSlotIndex] = useState(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [loadTargetType, setLoadTargetType] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch("/pokemon/img/type/typeColor.json")
      .then((res) => res.json())
      .then((data) => setTypeColors(data))
      .catch((err) => console.error("Failed to load type colors", err));
  }, []);

  const handleScroll = (e) => {
    if (e.target.scrollTop > 100) {
      setShowTopBtn(true);
    } else {
      setShowTopBtn(false);
    }
  };

  const scrollToTop = () => {
    if (listAreaRef.current) {
      listAreaRef.current.scrollTo({ top: 0, behavior: "auto" });
    }
  };

  const openFilterModal = () => {
    setTempSelectedTypes(activeTypes);
    setTempSelectedRoles(activeRoles);
    setTempIsMegaFilter(isMegaFilter);
    setTempIsLegendaryFilter(isLegendaryFilter);
    setTempIsIntimidateFilter(isIntimidateFilter);
    setTempIsWeatherFilter(isWeatherFilter);
    setTempLogic(activeLogic);
    setIsFilterModalOpen(true);
  };

  const handleGlobalReset = () => {
    setSearchTerm("");
    setActiveTypes([]);
    setActiveRoles([]);
    setIsMegaFilter(false);
    setIsLegendaryFilter(false);
    setIsIntimidateFilter(false);
    setIsWeatherFilter(false);
    setActiveLogic("OR");
  };

  const toggleRole = (role) => {
    if (tempSelectedRoles.includes(role)) {
      setTempSelectedRoles(tempSelectedRoles.filter((r) => r !== role));
    } else {
      setTempSelectedRoles([...tempSelectedRoles, role]);
    }
  };

  const toggleType = (type) => {
    if (tempSelectedTypes.includes(type)) {
      setTempSelectedTypes(tempSelectedTypes.filter((t) => t !== type));
    } else {
      setTempSelectedTypes([...tempSelectedTypes, type]);
    }
  };

  const WEATHER_ABILITIES = ["잔비", "가뭄", "진홍빛고동", "모래날림"];

  const isNameMatch = (searchStr, pokemon) => {
    if (!searchStr) return true;

    const s = searchStr.trim().toLowerCase();
    const t = pokemon.id.toLowerCase();

    if (s === "위협" && (pokemon.abil === "위협" || pokemon.megaData?.abil === "위협")) return true;
    if (s === "날씨" && (WEATHER_ABILITIES.includes(pokemon.abil) || (pokemon.megaData && WEATHER_ABILITIES.includes(pokemon.megaData.abil)))) return true;
    if (s === "초전설" && pokemon.feature?.legendary) return true;
    if ((s === "메가진화" || s === "메가") && pokemon.megaData) return true;

    if (t.includes(s)) return true;

    if (s === "다투" && t.includes("달투곰")) return true;
    if (s === "우라" && (t.includes("물라오스") || t.includes("악라오스"))) return true;
    if (s === "버드" && (t.includes("백마렉스") || t.includes("흑마렉스"))) return true;
    if (s === "대검" && t.includes("히검귀")) return true;
    if (s === "페" && t.includes("패리퍼")) return true;

    return false;
  };

  const filteredSamples = sampleList.items.filter((pokemon) => {
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

    return nameMatch && typeMatch && roleMatch && megaMatch && legendaryMatch && intimidateMatch && weatherMatch;
  });

  const getActiveTeam = () => (activeTab === "player" ? selectedTeam : npcTeam);
  const setActiveTeam = (newTeam) => {
    if (activeTab === "player") setSelectedTeam(newTeam);
    else setNpcTeam(newTeam);
  };

  const handleSelect = (pokemonId) => {
    const currentTeam = getActiveTeam();
    const existingIndex = currentTeam.findIndex((entry) => (typeof entry === "object" && entry ? entry.id : entry) === pokemonId);
    if (existingIndex !== -1) {
      handleRemove(existingIndex);
      return;
    }
    const emptyIndex = currentTeam.indexOf(null);
    if (emptyIndex === -1) {
      return;
    }
    const newTeam = [...currentTeam];
    newTeam[emptyIndex] = pokemonId;
    setActiveTeam(newTeam);
  };

  const handleAddToActiveTeam = (pokemon, customItem, customAbil, customSkills, customStats) => {
    const currentTeam = getActiveTeam();
    const existingIndex = currentTeam.findIndex((entry) => (typeof entry === "object" && entry ? entry.id : entry) === pokemon.id);
    if (existingIndex !== -1) return;
    const emptyIndex = currentTeam.indexOf(null);
    if (emptyIndex === -1) return;
    const newTeam = [...currentTeam];
    const finalItem = customItem !== undefined ? customItem : pokemon.item;
    const finalAbil = customAbil !== undefined ? customAbil : pokemon.abil;
    const isItemChanged = finalItem !== pokemon.item;
    const isAbilChanged = finalAbil !== pokemon.abil;

    const defaultSkills = {
      1: pokemon.skill?.[1]?.name,
      2: pokemon.skill?.[2]?.name,
      3: pokemon.skill?.[3]?.name,
      4: pokemon.skill?.[4]?.name,
    };
    const finalSkills = customSkills || defaultSkills;
    const isSkillsChanged = [1, 2, 3, 4].some((slot) => finalSkills[slot] && finalSkills[slot] !== defaultSkills[slot]);

    const isStatChanged = Boolean(customStats && (customStats.hp !== pokemon.hp || customStats.stat?.atk !== pokemon.stat?.atk || customStats.stat?.def !== pokemon.stat?.def || customStats.stat?.catk !== pokemon.stat?.catk || customStats.stat?.cdef !== pokemon.stat?.cdef || customStats.stat?.speed !== pokemon.stat?.speed));

    if (isItemChanged || isAbilChanged || isSkillsChanged || isStatChanged) {
      newTeam[emptyIndex] = {
        id: pokemon.id,
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
    } else {
      newTeam[emptyIndex] = pokemon.id;
    }
    setActiveTeam(newTeam);
  };

  const handleUpdateTeamSlot = (slotIndex, pokemon, customItem, customAbil, customSkills, customStats) => {
    if (slotIndex === null || slotIndex === undefined) return;
    const currentTeam = getActiveTeam();
    const newTeam = [...currentTeam];
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

    const isStatChanged = Boolean(customStats && (customStats.hp !== rawPokemon.hp || customStats.stat?.atk !== rawPokemon.stat?.atk || customStats.stat?.def !== rawPokemon.stat?.def || customStats.stat?.catk !== rawPokemon.stat?.catk || customStats.stat?.cdef !== rawPokemon.stat?.cdef || customStats.stat?.speed !== rawPokemon.stat?.speed));

    if (isItemChanged || isAbilChanged || isSkillsChanged || isStatChanged) {
      newTeam[slotIndex] = {
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
    } else {
      newTeam[slotIndex] = rawPokemon.id;
    }
    setActiveTeam(newTeam);
  };

  const handleRemove = (index) => {
    const currentTeam = getActiveTeam();
    const newTeam = [...currentTeam];
    newTeam[index] = null;
    setActiveTeam(newTeam);
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("index", index);
  };

  const handleDrop = (e, targetIndex) => {
    const sourceIndex = parseInt(e.dataTransfer.getData("index"));
    if (sourceIndex === targetIndex || isNaN(sourceIndex)) return;
    const currentTeam = getActiveTeam();
    const newTeam = [...currentTeam];
    const temp = newTeam[sourceIndex];
    newTeam[sourceIndex] = newTeam[targetIndex];
    newTeam[targetIndex] = temp;
    setActiveTeam(newTeam);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleTouchStart = (e, index) => {
    const currentTeam = getActiveTeam();
    if (!currentTeam[index]) return;
    setDraggedIndex(index);
    // document.body.style.overflow = "hidden"; // Prevent scrolling while dragging
  };

  const handleTouchMove = (e) => {
    if (draggedIndex !== null) {
      e.preventDefault(); // Prevent native mobile scrolling while holding a pokemon
    }
  };

  const handleTouchEnd = (e) => {
    // document.body.style.overflow = "auto";
    if (draggedIndex === null) return;
    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetSlot = dropTarget?.closest(".team-slot");

    if (targetSlot) {
      const targetIndex = parseInt(targetSlot.getAttribute("data-index"));
      if (!isNaN(targetIndex) && targetIndex !== draggedIndex) {
        const currentTeam = getActiveTeam();
        const newTeam = [...currentTeam];
        const temp = newTeam[draggedIndex];
        newTeam[draggedIndex] = newTeam[targetIndex];
        newTeam[targetIndex] = temp;
        setActiveTeam(newTeam);
      }
    }
    setDraggedIndex(null);
  };

  const getRandomTeamWithExisting = (existingTeam, teamSize = 3) => {
    return fillRandomTeam(existingTeam, teamSize);
  };

  const handleRandomPick = (index) => {
    const currentArr = activeTab === "player" ? selectedTeam : npcTeam;
    const randomId = getRandomPokemonForSlot(currentArr, index);

    if (randomId) {
      const newTeam = [...currentArr];
      newTeam[index] = randomId;

      if (activeTab === "player") {
        setSelectedTeam(newTeam);
      } else {
        setNpcTeam(newTeam);
      }
    }
  };

  const startBattle = () => {
    const team1 = getRandomTeamWithExisting(selectedTeam, 3);
    const team2 = getRandomTeamWithExisting(npcTeam, 3);
    navigate("/battle", { state: { team1, team2, isNew: true, difficulty, teamOption, round: defaultOption.round, fromCustom: true } });
  };

  const handleTestSetup = () => {
    let testTeam = ["칠색조", "에이스번", "다투곰"];
    if (selectedTeam[0] === "가이오가") {
      setSelectedTeam(testTeam);
      setNpcTeam(["가이오가", npcTeam[1], npcTeam[2]]);
    } else {
      setSelectedTeam(["가이오가", selectedTeam[1], selectedTeam[2]]);
      setNpcTeam(testTeam);
    }
    setActiveTab("player");
  };

  const isValidEntrySlot = (slot) => {
    if (slot === null) return true;
    if (typeof slot === "string") return Boolean(sampleList.getDataById(slot));
    if (typeof slot !== "object" || Array.isArray(slot) || typeof slot.id !== "string") return false;

    const rawPokemon = sampleList.getDataById(slot.id);
    if (!rawPokemon) return false;

    // 1. 특성 검증: 해당 포켓몬이 가질 수 있는 구현된 특성인지 확인
    if (slot.abil !== undefined && slot.abil !== null) {
      if (typeof slot.abil !== "string") return false;
      const validAbils = getAbilityListForPokemon(rawPokemon).filter((a) => a.isImplemented).map((a) => a.name);
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
      const learnableSkills = getSkillListForPokemon(rawPokemon).filter((s) => s.isImplemented).map((s) => s.name);
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

  const isValidTeamArray = (arr) => {
    if (!Array.isArray(arr) || arr.length !== 3) return false;
    if (!arr.every(isValidEntrySlot)) return false;

    // 팀 내 중복 포켓몬 검증
    const ids = arr.filter(Boolean).map((entry) => (typeof entry === "object" ? entry.id : entry));
    if (new Set(ids).size !== ids.length) return false;

    return true;
  };

  const handleExportTeam = (targetType) => {
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
    setIsSaveModalOpen(false);
  };

  const handleImportSelect = (targetType) => {
    setLoadTargetType(targetType);
    setIsLoadModalOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".txt")) {
      setAlertMessage("파일이 올바르지 않습니다");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        const parsed = JSON.parse(text);

        if (loadTargetType === "player") {
          const teamData = Array.isArray(parsed) ? parsed : parsed?.team || parsed?.playerTeam;
          if (!isValidTeamArray(teamData)) throw new Error("Invalid player team");
          setSelectedTeam(teamData);
          setActiveTab("player");
        } else if (loadTargetType === "npc") {
          const teamData = Array.isArray(parsed) ? parsed : parsed?.team || parsed?.npcTeam;
          if (!isValidTeamArray(teamData)) throw new Error("Invalid npc team");
          setNpcTeam(teamData);
          setActiveTab("npc");
        } else if (loadTargetType === "all") {
          if (!isValidTeamArray(parsed?.playerTeam) || !isValidTeamArray(parsed?.npcTeam)) {
            throw new Error("Invalid all team");
          }
          setSelectedTeam(parsed.playerTeam);
          setNpcTeam(parsed.npcTeam);
        } else {
          throw new Error("Unknown target type");
        }
      } catch (err) {
        setAlertMessage("파일이 올바르지 않습니다");
      }
    };
    reader.onerror = () => {
      setAlertMessage("파일이 올바르지 않습니다");
    };
    reader.readAsText(file);
  };

  const currentTeam = getActiveTeam();

  return (
    <Container>
      <Header>
        <BackButtonIcon onClick={() => navigate("/")}>&#8592;</BackButtonIcon>팀 구성
        {testmode && <TestButton onClick={handleTestSetup}>빠른구성</TestButton>}
      </Header>
      <TabContainer>
        <Tab $active={activeTab === "player"} onClick={() => setActiveTab("player")}>
          내 엔트리
        </Tab>
        <Tab $active={activeTab === "npc"} onClick={() => setActiveTab("npc")}>
          상대 엔트리
        </Tab>
      </TabContainer>

      <TeamArea>
        <TeamSlots>
          {[0, 1, 2].map((index) => {
            const pokemonEntry = currentTeam[index];
            const pokemonId = typeof pokemonEntry === "object" && pokemonEntry ? pokemonEntry.id : pokemonEntry;
            const customItem = typeof pokemonEntry === "object" && pokemonEntry ? pokemonEntry.item : null;
            const customAbil = typeof pokemonEntry === "object" && pokemonEntry ? pokemonEntry.abil : null;
            const customSkills = typeof pokemonEntry === "object" && pokemonEntry ? pokemonEntry.skills : null;
            const rawPokemonData = pokemonId ? sampleList.getDataById(pokemonId) : null;
            let pokemonData = rawPokemonData;
            if (rawPokemonData) {
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

              pokemonData = {
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
            }
            return (
              <Slot key={index} className="team-slot" data-index={index} draggable={!!pokemonId} onDragStart={(e) => handleDragStart(e, index)} onDrop={(e) => handleDrop(e, index)} onDragOver={handleDragOver} onTouchStart={(e) => handleTouchStart(e, index)} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} $hasData={!!pokemonId}>
                {pokemonData ? (
                  <PokemonCard
                    onClick={() => {
                      setEditingSlotIndex(index);
                      setInfoModalPokemon(pokemonData);
                    }}
                  >
                    <RemoveBtn
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(index);
                      }}
                    >
                      X
                    </RemoveBtn>
                    <ImageWrapper>
                      <img
                        src={`/pokemon/img/pokemon/${pokemonData.megaData?.pokemon_id || pokemonData.pokemon_id}.webp`}
                        alt={pokemonData.name}
                        style={{ height: "60px" }}
                        onError={(e) => {
                          e.target.src = "/pokemon/img/pokemon/0000.webp";
                        }}
                        draggable="false"
                      />
                      {pokemonData.item && (
                        <SmallItemImage
                          src={`/pokemon/img/item/${pokemonData.item}.webp`}
                          alt={pokemonData.item}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                          draggable="false"
                        />
                      )}
                    </ImageWrapper>
                    <PokemonName>{pokemonData.id}</PokemonName>
                  </PokemonCard>
                ) : (
                  <EmptySlot onClick={() => handleRandomPick(index)}>
                    <PlusIcon>?</PlusIcon>
                    <EmptySlotText>랜덤</EmptySlotText>
                  </EmptySlot>
                )}
              </Slot>
            );
          })}
        </TeamSlots>
        <ActionArea>
          <LeftActionGroup>
            <IconActionButton onClick={() => setIsSaveModalOpen(true)} title="샘플 저장" aria-label="샘플 저장">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </IconActionButton>
            <IconActionButton onClick={() => setIsLoadModalOpen(true)} title="샘플 불러오기" aria-label="샘플 불러오기">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </IconActionButton>
            <input ref={fileInputRef} type="file" accept="text/plain,.txt" style={{ display: "none" }} onChange={handleFileChange} />
          </LeftActionGroup>
          <StartButton onClick={startBattle}>배틀 시작!</StartButton>
          <OptionButton onClick={() => setIsOptionModalOpen(true)}>게임 옵션</OptionButton>
        </ActionArea>
      </TeamArea>

      <ListArea ref={listAreaRef} onScroll={handleScroll}>
        {showTopBtn && (
          <TopButton onClick={scrollToTop}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </TopButton>
        )}
        <SectionHeader>
          <SectionTitle>포켓몬 샘플 ({filteredSamples.length}종)</SectionTitle>
          <SearchWrapper>
            <InputContainer>
              <SearchInput
                type="search"
                enterKeyHint="search"
                placeholder="이름 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  // 모바일 키보드의 '이동'(Enter) 버튼을 누르면 키보드 닫기
                  if (e.key === "Enter") e.target.blur();
                }}
              />
              {searchTerm && <ClearInputButton onClick={() => setSearchTerm("")}>✕</ClearInputButton>}
            </InputContainer>
            <FilterButton onClick={openFilterModal}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
            </FilterButton>
            <FilterButton onClick={handleGlobalReset}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
            </FilterButton>
          </SearchWrapper>
        </SectionHeader>
        <Grid>
          {filteredSamples.map((pokemon) => {
            const isSelected = currentTeam.some((entry) => (typeof entry === "object" && entry ? entry.id : entry) === pokemon.id);
            return (
              <ListItem key={pokemon.id} $isSelected={isSelected} onClick={() => handleSelect(pokemon.id)}>
                <ImageWrapper style={{ flexShrink: 0 }}>
                  <img
                    src={`/pokemon/img/pokemon/${pokemon.megaData?.pokemon_id || pokemon.pokemon_id}.webp`}
                    alt={pokemon.name}
                    style={{ height: "60px", width: "60px", objectFit: "contain" }}
                    onError={(e) => {
                      e.target.src = "/pokemon/img/pokemon/0000.webp";
                    }}
                  />
                  {pokemon.item && (
                    <SmallItemImage
                      src={`/pokemon/img/item/${pokemon.item}.webp`}
                      alt={pokemon.item}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                </ImageWrapper>
                <InfoCol>
                  <PokemonNameList>{pokemon.id}</PokemonNameList>
                  <SkillGrid>
                    {[1, 2, 3, 4].map((num) => {
                      const skill = pokemon.skill?.[num];
                      if (!skill) return null;
                      return (
                        <SkillBox key={num}>
                          <SkillTypeIcon
                            src={`/pokemon/img/type/${skill.type}.svg`}
                            alt={skill.type}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          <SkillNameText>{skill.name}</SkillNameText>
                        </SkillBox>
                      );
                    })}
                  </SkillGrid>
                </InfoCol>
                <DetailButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSlotIndex(null);
                    setInfoModalPokemon(pokemon);
                  }}
                >
                  샘플 수정
                </DetailButton>
              </ListItem>
            );
          })}
        </Grid>
      </ListArea>
      {isFilterModalOpen && (
        <ModalOverlay onClick={() => setIsFilterModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>포켓몬 검색</ModalTitle>
              <LogicSwitch onClick={() => setTempLogic(tempLogic === "OR" ? "AND" : "OR")}>
                <LogicOption $active={tempLogic === "OR"}>OR</LogicOption>
                <LogicOption $active={tempLogic === "AND"}>AND</LogicOption>
              </LogicSwitch>
              <CloseIcon onClick={() => setIsFilterModalOpen(false)}>✕</CloseIcon>
            </ModalHeader>
            <SectionTitleRow>
              <ModalSubTitle>타입</ModalSubTitle>
              <SectionResetButton onClick={() => setTempSelectedTypes([])}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
              </SectionResetButton>
            </SectionTitleRow>
            <TypeGrid>
              <TypeButton $active={tempSelectedTypes.length === 0} onClick={() => setTempSelectedTypes([])}>
                전체
              </TypeButton>
              {POKEMON_TYPES.map((type) => (
                <TypeButton key={type} $active={tempSelectedTypes.includes(type)} $color={typeColors[type]} onClick={() => toggleType(type)}>
                  {type}
                </TypeButton>
              ))}
            </TypeGrid>

            <SectionTitleRow>
              <ModalSubTitle>역할군</ModalSubTitle>
              <SectionResetButton onClick={() => setTempSelectedRoles([])}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
              </SectionResetButton>
            </SectionTitleRow>
            <RoleGrid>
              <TypeButton $active={tempSelectedRoles.length === 0} onClick={() => setTempSelectedRoles([])}>
                전체
              </TypeButton>
              {POKEMON_ROLES.map((role) => (
                <TypeButton key={role} $active={tempSelectedRoles.includes(role)} onClick={() => toggleRole(role)}>
                  {role}
                </TypeButton>
              ))}
            </RoleGrid>

            <SectionTitleRow>
              <ModalSubTitle>기타</ModalSubTitle>
              <SectionResetButton
                onClick={() => {
                  setTempIsMegaFilter(false);
                  setTempIsLegendaryFilter(false);
                  setTempIsIntimidateFilter(false);
                  setTempIsWeatherFilter(false);
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
              </SectionResetButton>
            </SectionTitleRow>
            <EtcRow>
              <CheckboxLabel>
                <CheckboxInput type="checkbox" checked={tempIsMegaFilter} onChange={(e) => setTempIsMegaFilter(e.target.checked)} />
                메가진화
              </CheckboxLabel>
              <CheckboxLabel>
                <CheckboxInput type="checkbox" checked={tempIsLegendaryFilter} onChange={(e) => setTempIsLegendaryFilter(e.target.checked)} />
                초전설
              </CheckboxLabel>
              <CheckboxLabel>
                <CheckboxInput type="checkbox" checked={tempIsIntimidateFilter} onChange={(e) => setTempIsIntimidateFilter(e.target.checked)} />
                위협
              </CheckboxLabel>
              <CheckboxLabel>
                <CheckboxInput type="checkbox" checked={tempIsWeatherFilter} onChange={(e) => setTempIsWeatherFilter(e.target.checked)} />
                날씨
              </CheckboxLabel>
            </EtcRow>

            <ModalFooter>
              <SearchButton
                onClick={() => {
                  setActiveTypes(tempSelectedTypes);
                  setActiveRoles(tempSelectedRoles);
                  setIsMegaFilter(tempIsMegaFilter);
                  setIsLegendaryFilter(tempIsLegendaryFilter);
                  setIsIntimidateFilter(tempIsIntimidateFilter);
                  setIsWeatherFilter(tempIsWeatherFilter);
                  setActiveLogic(tempLogic);
                  setIsFilterModalOpen(false);
                }}
              >
                검색
              </SearchButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
      {isOptionModalOpen && (
        <ModalOverlay onClick={() => setIsOptionModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>게임 옵션</ModalTitle>
              <CloseIcon onClick={() => setIsOptionModalOpen(false)}>✕</CloseIcon>
            </ModalHeader>
            <ModalSubTitle>난이도</ModalSubTitle>
            <DifficultyContainer>
              {["이지", "노말", "하드"].map((level) => (
                <DifficultyButton key={level} $active={difficulty === level} onClick={() => setDifficulty(level)}>
                  {level}
                </DifficultyButton>
              ))}
            </DifficultyContainer>
            <DifficultyDescription>
              {difficulty === "이지" && "기초적인 포켓몬배틀이다."}
              {difficulty === "노말" && "매 라운드마다 적의 체력이 0.1배 증가합니다."}
              {difficulty === "하드" && "매 라운드마다 적의 모든 능력치가 0.1배 증가합니다."}
            </DifficultyDescription>
            <ModalSubTitle style={{ marginTop: "20px" }}>팀 옵션</ModalSubTitle>
            <DifficultyContainer>
              {["랜덤", "고정", "트레이드"].map((opt) => (
                <DifficultyButton key={opt} $active={teamOption === opt} onClick={() => setTeamOption(opt)}>
                  {opt}
                </DifficultyButton>
              ))}
            </DifficultyContainer>
            <DifficultyDescription>
              {teamOption === "랜덤" && "매 라운드마다 팀 엔트리가 랜덤하게 바뀝니다."}
              {teamOption === "고정" && "팀 엔트리가 바뀌지 않습니다."}
              {teamOption === "트레이드" && "매 라운드마다 상대 팀 엔트리에서 한명을 교환할 수 있습니다."}
            </DifficultyDescription>
          </ModalContent>
        </ModalOverlay>
      )}
      {isSaveModalOpen && (
        <ModalOverlay onClick={() => setIsSaveModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>샘플 저장</ModalTitle>
              <CloseIcon onClick={() => setIsSaveModalOpen(false)}>✕</CloseIcon>
            </ModalHeader>
            <EntryActionList>
              <EntryActionButton onClick={() => handleExportTeam("player")}>내 엔트리만 저장</EntryActionButton>
              <EntryActionButton onClick={() => handleExportTeam("npc")}>상대 엔트리만 저장</EntryActionButton>
              <EntryActionButton onClick={() => handleExportTeam("all")}>전체 엔트리 저장</EntryActionButton>
            </EntryActionList>
          </ModalContent>
        </ModalOverlay>
      )}
      {isLoadModalOpen && (
        <ModalOverlay onClick={() => setIsLoadModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>샘플 불러오기</ModalTitle>
              <CloseIcon onClick={() => setIsLoadModalOpen(false)}>✕</CloseIcon>
            </ModalHeader>
            <EntryActionList>
              <EntryActionButton onClick={() => handleImportSelect("player")}>내 엔트리 불러오기</EntryActionButton>
              <EntryActionButton onClick={() => handleImportSelect("npc")}>상대 엔트리 불러오기</EntryActionButton>
              <EntryActionButton onClick={() => handleImportSelect("all")}>전체 엔트리 불러오기</EntryActionButton>
            </EntryActionList>
          </ModalContent>
        </ModalOverlay>
      )}
      {alertMessage && (
        <ModalOverlay onClick={() => setAlertMessage(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ width: "280px", textAlign: "center" }}>
            <div style={{ fontSize: "1rem", fontWeight: "bold", color: "#333", margin: "12px 0 20px 0" }}>{alertMessage}</div>
            <SearchButton onClick={() => setAlertMessage(null)}>확인</SearchButton>
          </ModalContent>
        </ModalOverlay>
      )}
      {infoModalPokemon && (
        <SampleInfoModal
          pokemon={infoModalPokemon}
          onClose={() => {
            setInfoModalPokemon(null);
            setEditingSlotIndex(null);
          }}
          onAdd={
            editingSlotIndex !== null
              ? (pokemon, customItem, customAbil, customSkills, customStats) => handleUpdateTeamSlot(editingSlotIndex, pokemon, customItem, customAbil, customSkills, customStats)
              : handleAddToActiveTeam
          }
          isFull={
            editingSlotIndex !== null
              ? false
              : !getActiveTeam().includes(null) || getActiveTeam().some((entry) => (typeof entry === "object" && entry ? entry.id : entry) === infoModalPokemon.id)
          }
          submitText={editingSlotIndex !== null ? "수정" : "팀에 추가"}
        />
      )}
    </Container>
  );
};

export default CustomScreen;

const POKEMON_TYPES = ["노말", "불꽃", "물", "풀", "전기", "얼음", "격투", "독", "땅", "비행", "에스퍼", "벌레", "바위", "고스트", "드래곤", "악", "강철", "페어리"];

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 320px;
  max-width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  margin-right: auto;
`;

const SectionTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ModalSubTitle = styled.div`
  font-size: 0.95rem;
  font-weight: bold;
  color: #555;
`;

const DifficultyContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  margin-bottom: 20px;
`;

const DifficultyButton = styled.div`
  flex: 1;
  text-align: center;
  padding: 10px 0;
  border: 1px solid ${(props) => (props.$active ? "#4caf50" : "#ccc")};
  background-color: ${(props) => (props.$active ? "#4caf50" : "#fff")};
  color: ${(props) => (props.$active ? "#fff" : "#333")};
  border-radius: 6px;
  cursor: pointer;
  font-weight: ${(props) => (props.$active ? "bold" : "normal")};

  &:hover {
    background-color: ${(props) => (props.$active ? "#4caf50" : "#f5f5f5")};
  }
`;

const DifficultyDescription = styled.div`
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 6px;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const SectionResetButton = styled.button`
  background-color: #4caf50;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  width: 28px;
  height: 28px;

  &:hover {
    background-color: #43a047;
  }
`;

const LogicSwitch = styled.div`
  display: flex;
  background-color: #f0f0f0;
  border-radius: 20px;
  overflow: hidden;
  margin-right: 15px;
  cursor: pointer;
`;

const LogicOption = styled.div`
  padding: 4px 12px;
  font-size: 0.8rem;
  font-weight: bold;
  background-color: ${(props) => (props.$active ? "#4caf50" : "transparent")};
  color: ${(props) => (props.$active ? "white" : "#666")};
  transition: all 0.2s;
`;

const CloseIcon = styled.div`
  cursor: pointer;
  font-size: 1.2rem;
  color: #aaa;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #666;
  }
`;

const TypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 20px;
`;

const RoleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 20px;
`;

const EtcRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 4px 2px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: #333;
  cursor: pointer;
  user-select: none;
`;

const CheckboxInput = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #4caf50;
`;

const TypeButton = styled.button`
  padding: 8px 0;
  border: 1px solid ${(props) => (props.$active ? props.$color || "#4caf50" : "#ccc")};
  background-color: ${(props) => (props.$active ? props.$color || "#4caf50" : "#fff")};
  color: ${(props) => (props.$active ? "#fff" : "#333")};
  border-radius: 6px;
  cursor: pointer;
  font-weight: ${(props) => (props.$active ? "bold" : "normal")};
  font-size: 0.85rem;
  transition: all 0.2s;

  &:hover {
    filter: ${(props) => (props.$active ? "brightness(0.9)" : "none")};
    background-color: ${(props) => (props.$active ? props.$color || "#4caf50" : "#f5f5f5")};
  }
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 10px;
`;

const SearchButton = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #43a047;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0f0f0;
  font-family: "CustomFont", sans-serif;
  overflow: hidden;
`;

const Header = styled.h2`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #4caf50;
  color: white;
  margin: 0;
  padding: 15px 0;
  position: relative;
`;

const BackButtonIcon = styled.div`
  position: absolute;
  left: 20px;
  cursor: pointer;
  font-size: 1.5rem;
  font-weight: bold;

  &:hover {
    color: #e0e0e0;
  }
`;

const TestButton = styled.div`
  position: absolute;
  right: 20px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: normal;
  background: rgba(0, 0, 0, 0.2);
  padding: 5px 10px;
  border-radius: 4px;

  &:hover {
    background: rgba(0, 0, 0, 0.4);
  }
`;

const TabContainer = styled.div`
  display: flex;
  background-color: white;
  border-bottom: 2px solid #ddd;
  width: 100%;
`;

const Tab = styled.div`
  flex: 1;
  text-align: center;
  padding: 10px 0;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: bold;
  color: ${(props) => (props.$active ? "#4caf50" : "#888")};
  border-bottom: ${(props) => (props.$active ? "3px solid #4caf50" : "3px solid transparent")};
  transition: all 0.2s ease;

  &:hover {
    background-color: #f9f9f9;
  }
`;

const TeamArea = styled.div`
  background-color: white;
  padding: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;

  @media (max-width: 500px) {
    padding: 8px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
  padding: 20px 20px 10px 20px;
  position: sticky;
  top: 0;
  background-color: #f5f5f5;
  z-index: 10;
  border-bottom: 1px solid #ddd;

  @media (max-width: 500px) {
    padding: 10px 10px 8px 10px;
  }
`;

const SectionTitle = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  line-height: 36px;

  @media (max-width: 500px) {
    font-size: 1rem;
    line-height: 32px;
  }
`;

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  color: #555;
  padding: 0;

  &:hover {
    background-color: #f5f5f5;
  }

  @media (max-width: 500px) {
    width: 32px;
    height: 32px;
  }
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const ClearInputButton = styled.button`
  position: absolute;
  right: 6px;
  background: none;
  border: none;
  color: #999;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #666;
  }
`;

const SearchInput = styled.input`
  padding: 0 28px 0 12px;
  height: 36px;
  box-sizing: border-box;
  font-size: 0.95rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
  width: 120px;

  &:focus {
    border-color: #4caf50;
  }

  @media (max-width: 500px) {
    width: 110px;
    height: 32px;
    padding: 0 24px 0 8px;
    font-size: 0.85rem;
  }

  &::-webkit-search-cancel-button {
    -webkit-appearance: none;
    display: none;
  }
`;

const TeamSlots = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;

  @media (max-width: 500px) {
    gap: 6px;
    margin-bottom: 8px;
  }
`;

const Slot = styled.div`
  width: 105px;
  height: 95px;
  border: 2px dashed ${(props) => (props.$hasData ? "transparent" : "#ccc")};
  border-radius: 10px;
  background-color: ${(props) => (props.$hasData ? "#e8f5e9" : "#fafafa")};
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  cursor: ${(props) => (props.$hasData ? "grab" : "default")};
  box-shadow: ${(props) => (props.$hasData ? "0 4px 8px rgba(0,0,0,0.1)" : "none")};
  transition:
    transform 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;

  &:hover {
    transform: ${(props) => (props.$hasData ? "translateY(-4px)" : "none")};
    box-shadow: ${(props) => (props.$hasData ? "0 8px 16px rgba(0,0,0,0.15)" : "none")};
  }

  &:active {
    cursor: ${(props) => (props.$hasData ? "grabbing" : "default")};
    transform: ${(props) => (props.$hasData ? "scale(0.95)" : "none")};
  }

  @media (max-width: 500px) {
    width: 29vw;
    height: 25vw;
  }
`;

const PokemonCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -5px;

  > img:first-child {
    height: 64px;
    @media (max-width: 500px) {
      height: 48px !important;
    }
  }
`;

const SmallItemImage = styled.img`
  position: absolute;
  bottom: -2px;
  right: -5px;
  width: 20px !important;
  height: 20px !important;
  object-fit: contain;
  filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.5));

  @media (max-width: 500px) {
    width: 15px !important;
    height: 15px !important;
    right: -2px;
  }
`;

const PokemonName = styled.div`
  font-weight: bold;
  margin-top: 2px;
  font-size: 0.9rem;

  @media (max-width: 500px) {
    font-size: 0.75rem;
  }
`;

const RemoveBtn = styled.button`
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: #ff5252;
  color: white;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 11px;
  font-weight: bold;
  z-index: 5;
`;

const EmptySlot = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  cursor: pointer;

  &:hover {
    color: #4caf50;
  }
`;

const PlusIcon = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #ccc;
  margin-bottom: 5px;

  ${EmptySlot}:hover & {
    color: #4caf50;
  }
`;

const EmptySlotText = styled.div`
  color: #aaa;
  font-size: 0.9rem;

  ${EmptySlot}:hover & {
    color: #4caf50;
  }

  @media (max-width: 500px) {
    font-size: 0.7rem;
  }
`;

const ActionArea = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const LeftActionGroup = styled.div`
  position: absolute;
  left: 0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const IconActionButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 34px;
  height: 32px;
  padding: 0;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  color: #333;

  &:hover {
    background-color: #e0e0e0;
  }

  @media (max-width: 500px) {
    width: 30px;
    height: 28px;
  }
`;

const EntryActionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 5px;
`;

const EntryActionButton = styled.button`
  width: 100%;
  padding: 12px 0;
  background-color: #f8f9fa;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: bold;
  font-family: inherit;
  color: #333;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: #e8f5e9;
    border-color: #4caf50;
    color: #2e7d32;
  }
`;

const OptionButton = styled.button`
  position: absolute;
  right: 0;
  padding: 6px 12px;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  color: #333;

  &:hover {
    background-color: #e0e0e0;
  }
`;

const StartButton = styled.button`
  padding: 8px 32px;
  font-size: 1rem;
  background-color: ${(props) => (props.disabled ? "#ccc" : "#2196f3")};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  font-family: inherit;

  &:hover {
    background-color: ${(props) => (props.disabled ? "#ccc" : "#1976d2")};
  }

  @media (max-width: 500px) {
    padding: 6px 24px;
    font-size: 0.85rem;
  }
`;

const ListArea = styled.div`
  flex: 1;
  padding: 0;
  padding-bottom: 80px;
  overflow-y: auto;
  background-color: #f5f5f5;

  @media (max-width: 500px) {
    padding: 0;
    padding-bottom: 80px;
  }
`;

const TopButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 50;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 28px;
    height: 28px;
  }

  &:hover {
    background-color: #43a047;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 15px;
  padding: 15px 20px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 10px;
  }
`;

const ListItem = styled.div`
  background-color: white;
  border: 2px solid ${(props) => (props.$isSelected ? "#4caf50" : "transparent")};
  border-radius: 8px;
  padding: 8px 10px 8px 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  opacity: ${(props) => (props.$isSelected ? 0.6 : 1)};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const InfoCol = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const PokemonNameList = styled.div`
  font-weight: bold;
  font-size: 0.95rem;
  margin-bottom: 4px;
`;

const SkillGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  width: 100%;

  @media (max-width: 500px) {
    gap: 3px;
  }
`;

const DetailButton = styled.button`
  aspect-ratio: 1 / 1;
  height: 100%;
  max-height: 82px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f7ff;
  color: #1976d2;
  border: 1px solid #bbdefb;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  padding: 0 4px;
  align-self: stretch;
  white-space: nowrap;
  transition: all 0.15s ease-in-out;

  &:hover {
    background-color: #e3f2fd;
    border-color: #1976d2;
  }

  @media (max-width: 500px) {
    font-size: 0.72rem;
    padding: 0 2px;
  }
`;

const SkillBox = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 6px;
  height: 28px;
  background-color: #f8f9fa;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  min-width: 0;
  overflow: hidden;
  box-sizing: border-box;

  @media (max-width: 500px) {
    gap: 3px;
    padding: 0 4px;
    height: 24px;
  }
`;

const SkillTypeIcon = styled.img`
  width: 17px;
  height: 17px;
  border-radius: 3px;
  object-fit: contain;
  flex-shrink: 0;
  display: block;

  @media (max-width: 500px) {
    width: 14px;
    height: 14px;
  }
`;

const SkillNameText = styled.span`
  flex: 1;
  display: inline-flex;
  align-items: center;
  line-height: 1;
  font-size: 0.8rem;
  font-weight: bold;
  color: #2b2b2b;
  white-space: nowrap;

  @media (max-width: 500px) {
    font-size: 0.51rem;
  }
`;

const AbilText = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-top: 2px;
`;
