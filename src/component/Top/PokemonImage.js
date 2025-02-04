import React from "react";
import styled, { keyframes } from "styled-components";

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

const breath = keyframes`
  0% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-2.5px) scale(1.02);
  }
  100% {
    transform: translateY(0) scale(1);
  }
`;

// 플레이어(반전) 캐릭터의 호흡 애니메이션
const breathFlip = keyframes`
  0% {
    transform: scaleX(-1) translateY(0) scale(1);
  }
  50% {
    transform: scaleX(-1) translateY(-2.5px) scale(1.02);
  }
  100% {
    transform: scaleX(-1) translateY(0) scale(1);
  }
`;

const StyledPokemonImage = styled.img`
  width: 30vw;
  height: 30vw;
  max-width: 120px;
  max-height: 120px;
  position: absolute;

  animation: ${breathFlip} 3s infinite ease-in-out;

  &.plr {
    transform: scaleX(-1);
    right: 8.5vw;
    top: -3vh;
    animation: ${breathFlip} 2s infinite ease-in-out;
    animation-delay: 0.3s;
  }

  &.npc {
    left: 8.5vw;
    bottom: -3vh;
    animation: ${breath} 3s infinite ease-in-out;
  }
`;
