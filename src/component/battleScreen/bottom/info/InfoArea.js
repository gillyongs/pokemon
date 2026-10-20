import React from "react";
import HpBar from "../../HpBar";
import styled from "styled-components";

const InfoArea = ({ pokemon }) => {
  return (
    <>
      <HeaderCard />
      <PokemonName>{pokemon.origin.name}</PokemonName>
      <PokemonImage
        src={`/pokemon/img/pokemon/${pokemon.origin.pokemon_id}.webp`}
        alt="benchinfoImage"
      />
      <HpBarWrapper>
        <HpBar hp={pokemon.hp} maxHp={pokemon.origin.hp} />
      </HpBarWrapper>
    </>
  );
};

export default InfoArea;

// Styled Components

const PokemonImage = styled.img`
  position: absolute;
  left: 2vh;
  top: 10.5vh;
  width: 12vh;
`;

const HeaderCard = styled.div`
  position: absolute;
  left: 1vw;
  top: 10.5vh;
  width: 66vw;
  height: 12vh;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(20, 30, 40, 0.85), rgba(0, 0, 0, 0.7));
  border: 1px solid rgba(100, 255, 218, 0.18);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);
  box-sizing: border-box;
`;

const PokemonName = styled.div`
  position: absolute;
  left: 30vw;
  top: 12vh;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
`;

const HpBarWrapper = styled.div`
  position: absolute;
  left: 27vw;
  top: 9vh;
`;
