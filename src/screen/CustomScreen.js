import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import sampleList from "../entity/Pokemon/SamplePokemon";
import { pokemonList } from "../entity/Pokemon/PokemonTemplate";

const CustomScreen = () => {
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = useState([null, null, null]);
  const [npcTeam, setNpcTeam] = useState([null, null, null]);
  const [activeTab, setActiveTab] = useState("player");
  const [draggedIndex, setDraggedIndex] = useState(null);

  const getActiveTeam = () => (activeTab === "player" ? selectedTeam : npcTeam);
  const setActiveTeam = (newTeam) => {
    if (activeTab === "player") setSelectedTeam(newTeam);
    else setNpcTeam(newTeam);
  };
  
  const handleSelect = (pokemonId) => {
    const currentTeam = getActiveTeam();
    if (currentTeam.includes(pokemonId)) {
      handleRemove(currentTeam.indexOf(pokemonId));
      return;
    }
    const emptyIndex = currentTeam.indexOf(null);
    if (emptyIndex === -1) {
      alert("최대 3마리까지 선택 가능합니다.");
      return;
    }
    const newTeam = [...currentTeam];
    newTeam[emptyIndex] = pokemonId;
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
    const targetSlot = dropTarget?.closest('.team-slot');
    
    if (targetSlot) {
      const targetIndex = parseInt(targetSlot.getAttribute('data-index'));
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
    const team = existingTeam.filter(id => id !== null);
    
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
    const available = pokemonList.filter(id => !currentArr.includes(id));
    
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
    navigate("/battle", { state: { team1, team2, isNew: true } });
  };

  const currentTeam = getActiveTeam();

  return (
    <Container>
      <Header>
        <BackButtonIcon onClick={() => navigate("/")}>&#8592;</BackButtonIcon>
        커스텀 팀 구성
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
            const pokemonData = pokemonId ? sampleList.getItemById(pokemonId) : null;
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
                  <PokemonCard onClick={() => handleRemove(index)}>
                    <RemoveBtn onClick={(e) => { e.stopPropagation(); handleRemove(index); }}>X</RemoveBtn>
                    <ImageWrapper>
                      <img src={`/pokemon/img/pokemon/${pokemonData.pokemon_id}.webp`} alt={pokemonData.name} style={{height: "60px"}} onError={(e) => { e.target.src = "/pokemon/img/pokemon/0000.webp" }} draggable="false" />
                      {pokemonData.item && (
                        <SmallItemImage src={`/pokemon/img/item/${pokemonData.item}.webp`} alt={pokemonData.item} onError={(e) => { e.target.style.display = 'none'; }} draggable="false" />
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
        <StartButton onClick={startBattle}>
          배틀 시작!
        </StartButton>
      </TeamArea>

      <ListArea>
        <SectionTitle>포켓몬 샘플 ({sampleList.items.length}종)</SectionTitle>
        <Grid>
          {sampleList.items.map((pokemon) => {
            const isSelected = currentTeam.includes(pokemon.id);
            return (
              <ListItem 
                key={pokemon.id} 
                $isSelected={isSelected}
                onClick={() => handleSelect(pokemon.id)}
              >
                <ImageWrapper style={{flexShrink: 0}}>
                  <img src={`/pokemon/img/pokemon/${pokemon.pokemon_id}.webp`} alt={pokemon.name} style={{height: "60px", width: "60px", objectFit: "contain"}} onError={(e) => { e.target.src = "/pokemon/img/pokemon/0000.webp" }}/>
                  {pokemon.item && (
                    <SmallItemImage src={`/pokemon/img/item/${pokemon.item}.webp`} alt={pokemon.item} onError={(e) => { e.target.style.display = 'none'; }} />
                  )}
                </ImageWrapper>
                <InfoCol>
                  <PokemonNameList>{pokemon.id}</PokemonNameList>
                  <AbilText>[기술배치] {pokemon.skill[1].name}, {pokemon.skill[2].name}, {pokemon.skill[3].name}, {pokemon.skill[4].name}</AbilText>
                  <AbilText>[특성] {pokemon.abil} : {pokemon.abilObj?.text || "설명 없음"}</AbilText>
                  <AbilText>[아이템] {pokemon.item || "없음"} : {pokemon.itemText || "설명 없음"}</AbilText>
                </InfoCol>
              </ListItem>
            )
          })}
        </Grid>
      </ListArea>
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

const TabContainer = styled.div`
  display: flex;
  background-color: white;
  border-bottom: 2px solid #ddd;
  width: 100%;
`;

const Tab = styled.div`
  flex: 1;
  text-align: center;
  padding: 12px 0;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  color: ${props => props.$active ? "#4caf50" : "#888"};
  border-bottom: ${props => props.$active ? "3px solid #4caf50" : "3px solid transparent"};
  transition: all 0.2s ease;

  &:hover {
    background-color: #f9f9f9;
  }
`;

const TeamArea = styled.div`
  background-color: white;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
  
  @media (max-width: 500px) {
    padding: 10px;
  }
`;

const SectionTitle = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
  
  @media (max-width: 500px) {
    font-size: 1rem;
    margin-bottom: 10px;
  }
`;

const TeamSlots = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 500px) {
    gap: 10px;
    margin-bottom: 10px;
  }
`;

const Slot = styled.div`
  width: 120px;
  height: 140px;
  border: 2px dashed ${props => props.$hasData ? "transparent" : "#ccc"};
  border-radius: 10px;
  background-color: ${props => props.$hasData ? "#e8f5e9" : "#fafafa"};
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  cursor: ${props => props.$hasData ? "grab" : "default"};
  box-shadow: ${props => props.$hasData ? "0 4px 8px rgba(0,0,0,0.1)" : "none"};
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  
  &:hover {
    transform: ${props => props.$hasData ? "translateY(-4px)" : "none"};
    box-shadow: ${props => props.$hasData ? "0 8px 16px rgba(0,0,0,0.15)" : "none"};
  }

  &:active {
    cursor: ${props => props.$hasData ? "grabbing" : "default"};
    transform: ${props => props.$hasData ? "scale(0.95)" : "none"};
  }
  
  @media (max-width: 500px) {
    width: 30vw;
    height: 35vw;
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
  
  > img:first-child {
    height: 60px;
    @media (max-width: 500px) {
      height: 45px !important;
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
  margin-top: 5px;
  font-size: 0.9rem;
  
  @media (max-width: 500px) {
    font-size: 0.75rem;
  }
`;

const RemoveBtn = styled.button`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ff5252;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
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

const StartButton = styled.button`
  padding: 10px 40px;
  font-size: 1.2rem;
  background-color: ${props => props.disabled ? "#ccc" : "#2196f3"};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: ${props => props.disabled ? "not-allowed" : "pointer"};
  font-family: inherit;
  
  &:hover {
    background-color: ${props => props.disabled ? "#ccc" : "#1976d2"};
  }
  
  @media (max-width: 500px) {
    padding: 8px 30px;
    font-size: 1rem;
  }
`;

const ListArea = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f5f5;
  
  @media (max-width: 500px) {
    padding: 10px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 15px;
  
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const ListItem = styled.div`
  background-color: white;
  border: 2px solid ${props => props.$isSelected ? "#4caf50" : "transparent"};
  border-radius: 8px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  opacity: ${props => props.$isSelected ? 0.6 : 1};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
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
