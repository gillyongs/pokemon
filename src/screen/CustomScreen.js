import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import sampleList from "../entity/Pokemon/SamplePokemon";
import { pokemonList, POKEMON_ROLES } from "../entity/Pokemon/PokemonTemplate";
import { defaultOption } from "../config/defaultOption";
import SampleInfoModal from "../component/SampleInfoModal";

const CustomScreen = () => {
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = useState([null, null, null]);
  const [npcTeam, setNpcTeam] = useState([null, null, null]);
  const [activeTab, setActiveTab] = useState("player");
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTypes, setActiveTypes] = useState([]);
  const [activeLogic, setActiveLogic] = useState("OR");
  const [activeRoles, setActiveRoles] = useState([]);
  const [tempSelectedTypes, setTempSelectedTypes] = useState([]);
  const [tempSelectedRoles, setTempSelectedRoles] = useState([]);
  const [tempLogic, setTempLogic] = useState("OR");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [difficulty, setDifficulty] = useState(defaultOption.difficulty);
  const [teamOption, setTeamOption] = useState(defaultOption.teamOption);
  const [typeColors, setTypeColors] = useState({});

  const listAreaRef = useRef(null);
  const [showTopBtn, setShowTopBtn] = useState(false);

  const [infoModalPokemon, setInfoModalPokemon] = useState(null);
  const pressTimer = useRef(null);
  const isLongPress = useRef(false);

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
    setTempLogic(activeLogic);
    setIsFilterModalOpen(true);
  };

  const handleGlobalReset = () => {
    setSearchTerm("");
    setActiveTypes([]);
    setActiveRoles([]);
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

  const isNameMatch = (searchStr, pokemonName) => {
    if (!searchStr) return true;

    const s = searchStr.trim().toLowerCase();
    const t = pokemonName.toLowerCase();

    if (t.includes(s)) return true;

    if (s === "다투곰" && t.includes("달투곰")) return true;
    if (s === "우라오스" && (t.includes("물라오스") || t.includes("악라오스"))) return true;
    if (s === "버드렉스" && (t.includes("백마렉스") || t.includes("흑마렉스"))) return true;
    if (s === "대검귀" && t.includes("히검귀")) return true;

    return false;
  };

  const filteredSamples = sampleList.items.filter((pokemon) => {
    const nameMatch = isNameMatch(searchTerm, pokemon.id);

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

    return nameMatch && typeMatch && roleMatch;
  });

  const getActiveTeam = () => (activeTab === "player" ? selectedTeam : npcTeam);
  const setActiveTeam = (newTeam) => {
    if (activeTab === "player") setSelectedTeam(newTeam);
    else setNpcTeam(newTeam);
  };

  const handleSelect = (pokemonId) => {
    if (isLongPress.current) return;
    const currentTeam = getActiveTeam();
    if (currentTeam.includes(pokemonId)) {
      handleRemove(currentTeam.indexOf(pokemonId));
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

  const handlePointerDown = (pokemon) => {
    isLongPress.current = false;
    pressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setInfoModalPokemon(pokemon);
      pressTimer.current = null;
    }, 450);
  };

  const handlePointerUpOrLeave = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
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
    // 기존에 선택된 팀의 ID들 (문자열 배열)
    const team = existingTeam.filter((id) => id !== null);

    while (team.length < teamSize) {
      const randomIndex = Math.floor(Math.random() * pokemonList.length);
      const selectedPokemonId = pokemonList[randomIndex]; // 문자열 ID

      // 이미 포함되어 있지 않으면 추가
      if (!team.includes(selectedPokemonId)) {
        team.push(selectedPokemonId);
      }
    }
    return team;
  };

  const handleRandomPick = (index) => {
    const currentArr = activeTab === "player" ? selectedTeam : npcTeam;
    const available = pokemonList.filter((id) => !currentArr.includes(id));

    if (available.length > 0) {
      const randomId = available[Math.floor(Math.random() * available.length)];
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
    navigate("/battle", { state: { team1, team2, isNew: true, difficulty, teamOption, round: defaultOption.round } });
  };

  const handleTestSetup = () => {
    if (selectedTeam[0] === "가이오가") {
      setSelectedTeam(["윈디", "에이스번", "다투곰"]);
      setNpcTeam(["가이오가", npcTeam[1], npcTeam[2]]);
    } else {
      setSelectedTeam(["가이오가", selectedTeam[1], selectedTeam[2]]);
      setNpcTeam(["윈디", "에이스번", "다투곰"]);
    }
    setActiveTab("player");
  };

  const currentTeam = getActiveTeam();

  return (
    <Container>
      <Header>
        <BackButtonIcon onClick={() => navigate("/")}>&#8592;</BackButtonIcon>팀 구성
        <TestButton onClick={handleTestSetup}>테스트</TestButton>
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
            const pokemonId = currentTeam[index];
            const pokemonData = pokemonId ? sampleList.getDataById(pokemonId) : null;
            return (
              <Slot key={index} className="team-slot" data-index={index} draggable={!!pokemonId} onDragStart={(e) => handleDragStart(e, index)} onDrop={(e) => handleDrop(e, index)} onDragOver={handleDragOver} onTouchStart={(e) => handleTouchStart(e, index)} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} $hasData={!!pokemonId}>
                {pokemonData ? (
                  <PokemonCard onClick={() => handleRemove(index)}>
                    <RemoveBtn
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(index);
                      }}>
                      X
                    </RemoveBtn>
                    <ImageWrapper>
                      <img
                        src={`/pokemon/img/pokemon/${pokemonData.pokemon_id}.webp`}
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
                    <PokemonName>{pokemonData.name}</PokemonName>
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
            const isSelected = currentTeam.includes(pokemon.id);
            return (
              <ListItem 
                key={pokemon.id} 
                $isSelected={isSelected} 
                onClick={() => handleSelect(pokemon.id)}
                onPointerDown={() => handlePointerDown(pokemon)}
                onPointerUp={handlePointerUpOrLeave}
                onPointerLeave={handlePointerUpOrLeave}
                onPointerCancel={handlePointerUpOrLeave}
              >
                <ImageWrapper style={{ flexShrink: 0 }}>
                  <img
                    src={`/pokemon/img/pokemon/${pokemon.pokemon_id}.webp`}
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
                  <AbilText>
                    [기술배치] {pokemon.skill[1].name}, {pokemon.skill[2].name}, {pokemon.skill[3].name}, {pokemon.skill[4].name}
                  </AbilText>
                  <AbilText>
                    [특성] {pokemon.abil} : {pokemon.abilObj?.text || "설명 없음"}
                  </AbilText>
                  <AbilText>
                    [아이템] {pokemon.item || "없음"} : {pokemon.itemText || "설명 없음"}
                  </AbilText>
                </InfoCol>
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

            <ModalFooter>
              <SearchButton
                onClick={() => {
                  setActiveTypes(tempSelectedTypes);
                  setActiveRoles(tempSelectedRoles);
                  setActiveLogic(tempLogic);
                  setIsFilterModalOpen(false);
                }}>
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
            <ModalSubTitle style={{ marginTop: '20px' }}>팀 옵션</ModalSubTitle>
            <DifficultyContainer>
              {["고정", "랜덤", "트레이드"].map((opt) => (
                <DifficultyButton 
                  key={opt} 
                  $active={teamOption === opt}
                  onClick={() => setTeamOption(opt)}
                >
                  {opt}
                </DifficultyButton>
              ))}
            </DifficultyContainer>
            <DifficultyDescription>
              {teamOption === "고정" && "팀 엔트리가 바뀌지 않습니다."}
              {teamOption === "랜덤" && "매 라운드마다 팀 엔트리가 랜덤하게 바뀝니다."}
              {teamOption === "트레이드" && "매 라운드마다 상대 팀 엔트리에서 한명을 교환할 수 있습니다."}
            </DifficultyDescription>
          </ModalContent>
        </ModalOverlay>
      )}
      {infoModalPokemon && <SampleInfoModal pokemon={infoModalPokemon} onClose={() => setInfoModalPokemon(null)} />}
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
  top: -4px;
  right: -4px;
  background-color: #ff5252;
  color: white;
  border: none;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 10px;
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
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
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
`;

const PokemonNameList = styled.div`
  font-weight: bold;
  font-size: 0.95rem;
`;

const AbilText = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-top: 2px;
`;
