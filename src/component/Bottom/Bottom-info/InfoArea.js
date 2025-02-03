import React from "react";
import HpBar from "../../HpBar";
import styled from "styled-components";

const InfoArea = ({ pokemon }) => {
  return (
    <>
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

const PokemonName = styled.div`
  position: absolute;
  left: 30vw;
  top: 12vh;
`;

const HpBarWrapper = styled.div`
  position: absolute;
  left: 27vw;
  top: 9vh;
`;
