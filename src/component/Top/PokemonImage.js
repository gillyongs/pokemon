import React from "react";
import styled from "styled-components";

const PokemonImage = ({ battle, type }) => {
  const pokemon = type === "npc" ? battle.npc : battle.player;

  return (
    <StyledPokemonImage
      className={type}
      src={`/pokemon/img/pokemon/${pokemon.origin.pokemon_id}.webp`}
      alt={`${type} Pokemon`}
    />
  );
};

export default PokemonImage;

const StyledPokemonImage = styled.img`
  width: 30vw;
  height: 30vw;
  max-width: 120px;
  max-height: 120px;
  position: absolute;
  transform: rotate(-20deg);

  &.plr {
    transform: scaleX(-1);
    right: 8.5vw;
    top: -3vh;
  }

  &.npc {
    left: 8.5vw;
    bottom: -3vh;
  }
`;
