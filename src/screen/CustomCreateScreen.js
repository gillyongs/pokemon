import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import pokemonRepository from "../entity/Pokemon/PokemonOriginal";

const RadarChart = ({ stats }) => {
  const maxStat = 255;
  const radius = 33; 
  const center = 57; // 114x114 svg
  
  const getPoint = (value, angleIndex) => {
    // 0:HP, 1:Atk, 2:Def, 3:Speed, 4:SpDef, 5:SpAtk
    const angleDeg = -90 + angleIndex * 60;
    const angleRad = (Math.PI / 180) * angleDeg;
    const r = (value / maxStat) * radius;
    return `${center + r * Math.cos(angleRad)},${center + r * Math.sin(angleRad)}`;
  };

  const points = [
    getPoint(stats.hp, 0),
    getPoint(stats.atk, 1),
    getPoint(stats.def, 2),
    getPoint(stats.speed, 3),
    getPoint(stats.cdef, 4),
    getPoint(stats.catk, 5),
  ].join(" ");

  const bgPoints = [
    getPoint(maxStat, 0),
    getPoint(maxStat, 1),
    getPoint(maxStat, 2),
    getPoint(maxStat, 3),
    getPoint(maxStat, 4),
    getPoint(maxStat, 5),
  ].join(" ");

  const getLabelPoint = (angleIndex, offset) => {
    const angleDeg = -90 + angleIndex * 60;
    const angleRad = (Math.PI / 180) * angleDeg;
    const r = radius + offset;
    return {
      x: center + r * Math.cos(angleRad),
      y: center + r * Math.sin(angleRad)
    };
  };

  const labels = [
    { name: "HP", val: stats.hp, idx: 0 },
    { name: "공격", val: stats.atk, idx: 1 },
    { name: "방어", val: stats.def, idx: 2 },
    { name: "스피드", val: stats.speed, idx: 3 },
    { name: "특방", val: stats.cdef, idx: 4 },
    { name: "특공", val: stats.catk, idx: 5 }
  ];

  return (
    <svg width="114" height="114" viewBox="0 0 114 114">
      <polygon points={bgPoints} fill="#f0f0f0" stroke="#ccc" strokeWidth="1" />
      {[0, 1, 2, 3, 4, 5].map(i => {
         const pt = getPoint(maxStat, i).split(",");
         return <line key={i} x1={center} y1={center} x2={pt[0]} y2={pt[1]} stroke="#ccc" strokeWidth="1" />
      })}
      <polygon points={points} fill="rgba(76, 175, 80, 0.5)" stroke="#4caf50" strokeWidth="1.5" />
      
      {labels.map((lbl) => {
        const pt = getLabelPoint(lbl.idx, 15);
        return (
          <text key={lbl.name} x={pt.x} y={pt.y + 3} fontSize="8.5" textAnchor="middle" fill="#555" fontWeight="bold">
            {lbl.name} {lbl.val}
          </text>
        );
      })}
    </svg>
  );
};

const CustomCreateScreen = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPokemon = pokemonRepository.items.filter((p) =>
    p.name.includes(searchTerm)
  );

  const handleSelect = (pokemon) => {
    console.log("Selected original pokemon:", pokemon);
    alert(`${pokemon.name}을(를) 선택했습니다. 스탯, 특성, 스킬을 셋팅하는 화면은 곧 추가될 예정입니다!`);
  };

  return (
    <Container>
      <Header>포켓몬 선택</Header>
      
      <SearchContainer>
        <SearchInput 
          type="text" 
          placeholder="포켓몬 이름 검색..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <BackButton onClick={() => navigate(-1)}>뒤로 가기</BackButton>
      </SearchContainer>

      <ListArea>
        <Grid>
          {filteredPokemon.map((pokemon) => (
            <ListItem key={pokemon.id} onClick={() => handleSelect(pokemon)}>
              <img 
                src={`/pokemon/img/pokemon/${pokemon.id}.webp`} 
                alt={pokemon.name} 
                style={{height: "60px", width: "60px", objectFit: "contain"}} 
                onError={(e) => { e.target.src = "/pokemon/img/pokemon/0000.webp" }}
              />
              <InfoCol>
                <PokemonName>{pokemon.name}</PokemonName>
                <Types>
                  <TypeBadge>{pokemon.type1}</TypeBadge>
                  {pokemon.type2 && pokemon.type2 !== "없음" && <TypeBadge>{pokemon.type2}</TypeBadge>}
                </Types>
              </InfoCol>
              
              <ChartWrapper>
                <RadarChart stats={{ hp: pokemon.hp, atk: pokemon.atk, def: pokemon.def, catk: pokemon.catk, cdef: pokemon.cdef, speed: pokemon.speed }} />
              </ChartWrapper>
            </ListItem>
          ))}
        </Grid>
      </ListArea>
    </Container>
  );
};

export default CustomCreateScreen;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0f0f0;
  font-family: "CustomFont", sans-serif;
`;

const Header = styled.h2`
  text-align: center;
  background-color: #4caf50;
  color: white;
  margin: 0;
  padding: 15px 0;
`;

const SearchContainer = styled.div`
  display: flex;
  padding: 20px;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  gap: 15px;
  z-index: 10;
  
  @media (max-width: 500px) {
    padding: 10px;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 15px;
  font-size: 1rem;
  border: 2px solid #ccc;
  border-radius: 8px;
  outline: none;
  font-family: inherit;
  
  &:focus {
    border-color: #4caf50;
  }
`;

const BackButton = styled.button`
  padding: 10px 20px;
  background-color: #ccc;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  font-size: 1rem;
  
  &:hover {
    background-color: #999;
  }
`;

const ListArea = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  
  @media (max-width: 500px) {
    padding: 10px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
  
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const ListItem = styled.div`
  background-color: white;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s, border 0.2s;
  position: relative; /* For ChartWrapper absolute positioning */
  overflow: visible;
  min-height: 90px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    border: 2px solid #4caf50;
  }
`;

const ChartWrapper = styled.div`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  
  @media (max-width: 500px) {
    right: 5px;
    transform: translateY(-50%) scale(0.9);
  }
`;

const InfoCol = styled.div`
  display: flex;
  flex-direction: column;
`;

const PokemonName = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 5px;
`;

const Types = styled.div`
  display: flex;
  gap: 5px;
  margin-bottom: 5px;
`;

const TypeBadge = styled.div`
  background-color: #e0e0e0;
  color: #333;
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: bold;
`;

const StatText = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 5px;
`;

const BaseStats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const StatBox = styled.div`
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 2px 4px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  gap: 3px;

  span {
    color: #888;
    font-weight: bold;
    font-size: 0.65rem;
  }
`;
