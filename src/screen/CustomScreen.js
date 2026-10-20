import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useRecoilState } from "recoil";
import sampleList from "../entity/Pokemon/SamplePokemon";
import { defaultOption } from "../config/defaultOption";
import { gameOptionState } from "../util/recoilState";
import SampleInfoModal from "../component/customScreen/sampleInfo/SampleInfoModal";
import FilterModal from "../component/customScreen/FilterModal";
import GameOptionModal from "../component/customScreen/GameOptionModal";
import { EntrySaveModal, EntryLoadModal, CustomAlertModal } from "../component/customScreen/EntryFileModal";
import {
  filterSamplePokemons,
  buildCustomSlotEntry,
  resolveSlotPokemonData,
  isValidTeamArray,
  exportTeamToFile,
} from "../util/customEntryUtil";
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
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [gameOption, setGameOption] = useRecoilState(gameOptionState);
  const difficulty = gameOption.difficulty;
  const teamOption = gameOption.teamOption;
  const setDifficulty = (level) => setGameOption((prev) => ({ ...prev, difficulty: level }));
  const setTeamOption = (opt) => setGameOption((prev) => ({ ...prev, teamOption: opt }));

  const listAreaRef = useRef(null);
  const [showTopBtn, setShowTopBtn] = useState(false);

  const [infoModalPokemon, setInfoModalPokemon] = useState(null);
  const [editingSlotIndex, setEditingSlotIndex] = useState(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [loadTargetType, setLoadTargetType] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const fileInputRef = useRef(null);

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

  const filteredSamples = filterSamplePokemons(sampleList.items, {
    searchTerm,
    activeTypes,
    activeLogic,
    activeRoles,
    isMegaFilter,
    isLegendaryFilter,
    isIntimidateFilter,
    isWeatherFilter,
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
    newTeam[emptyIndex] = buildCustomSlotEntry(pokemon, customItem, customAbil, customSkills, customStats);
    setActiveTeam(newTeam);
  };

  const handleUpdateTeamSlot = (slotIndex, pokemon, customItem, customAbil, customSkills, customStats) => {
    if (slotIndex === null || slotIndex === undefined) return;
    const currentTeam = getActiveTeam();
    const newTeam = [...currentTeam];
    newTeam[slotIndex] = buildCustomSlotEntry(pokemon, customItem, customAbil, customSkills, customStats);
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

  const handleExportTeam = (targetType) => {
    exportTeamToFile(targetType, selectedTeam, npcTeam);
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
            const pokemonData = resolveSlotPokemonData(pokemonEntry);
            return (
              <Slot
                key={index}
                className="team-slot"
                data-index={index}
                draggable={!!pokemonId}
                onDragStart={(e) => handleDragStart(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragOver={handleDragOver}
                onTouchStart={(e) => handleTouchStart(e, index)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                $hasData={!!pokemonId}
              >
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
            <FilterButton onClick={() => setIsFilterModalOpen(true)}>
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
        <FilterModal
          activeTypes={activeTypes}
          activeRoles={activeRoles}
          isMegaFilter={isMegaFilter}
          isLegendaryFilter={isLegendaryFilter}
          isIntimidateFilter={isIntimidateFilter}
          isWeatherFilter={isWeatherFilter}
          activeLogic={activeLogic}
          onApply={({ types, roles, isMega, isLegendary, isIntimidate, isWeather, logic }) => {
            setActiveTypes(types);
            setActiveRoles(roles);
            setIsMegaFilter(isMega);
            setIsLegendaryFilter(isLegendary);
            setIsIntimidateFilter(isIntimidate);
            setIsWeatherFilter(isWeather);
            setActiveLogic(logic);
          }}
          onClose={() => setIsFilterModalOpen(false)}
        />
      )}

      {isOptionModalOpen && (
        <GameOptionModal
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          teamOption={teamOption}
          setTeamOption={setTeamOption}
          onClose={() => setIsOptionModalOpen(false)}
        />
      )}

      {isSaveModalOpen && <EntrySaveModal onExport={handleExportTeam} onClose={() => setIsSaveModalOpen(false)} />}

      {isLoadModalOpen && <EntryLoadModal onImportSelect={handleImportSelect} onClose={() => setIsLoadModalOpen(false)} />}

      {alertMessage && <CustomAlertModal message={alertMessage} onClose={() => setAlertMessage(null)} />}

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
