import React from "react";
import styled, { keyframes, css } from "styled-components";

const PokemonImage = ({ battle, type }) => {
  const pokemon = type === "npc" ? battle.npc : battle.player;

  const isSubstitute = !!pokemon?.tempStatus?.substitute;
  const isEternamax = !isSubstitute && (pokemon?.origin?.pokemon_id === "0890-m" || pokemon?.pokemon_id === "0890-m");

  const pokeImgId = pokemon?.img_id || pokemon?.origin?.pokemon_id || pokemon?.pokemon_id;
  const imageSrc = isSubstitute ? `/pokemon/img/background/substitute_${type === "npc" ? "front" : "back"}.webp` : `/pokemon/img/pokemon/${pokeImgId}.webp`;

  return <StyledPokemonImage className={type} src={imageSrc} alt={`${type} Pokemon`} $isSubstitute={isSubstitute} $isEternamax={isEternamax} />;
};

export default PokemonImage;

const breath = keyframes`
  0% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-2.5px) scale(1.02); }
  100% { transform: translateY(0) scale(1); }
`;

const breathFlip = keyframes`
  0% { transform: scaleX(-1) translateY(0) scale(1); }
  50% { transform: scaleX(-1) translateY(-2.5px) scale(1.02); }
  100% { transform: scaleX(-1) translateY(0) scale(1); }
`;

const StyledPokemonImage = styled.img`
  width: ${({ $isEternamax }) => ($isEternamax ? "60vw" : "30vw")};
  height: ${({ $isEternamax }) => ($isEternamax ? "60vw" : "30vw")};
  max-width: ${({ $isEternamax }) => ($isEternamax ? "240px" : "120px")};
  max-height: ${({ $isEternamax }) => ($isEternamax ? "240px" : "120px")};
  position: absolute;

  ${({ className, $isSubstitute, $isEternamax }) =>
    className === "plr"
      ? css`
          right: ${$isEternamax ? "1vw" : "8.5vw"};
          top: ${$isEternamax ? "-17vh" : "-3vh"};
          ${!$isSubstitute &&
          css`
            transform: scaleX(-1);
            animation: ${breathFlip} 2s infinite ease-in-out;
          `}
          ${$isSubstitute &&
          css`
            top: 1vh;
            animation: ${breath} 2s infinite ease-in-out;
          `}
          animation-delay: 0.3s;
        `
      : css`
          left: ${$isEternamax ? "3vw" : "8.5vw"};
          bottom: ${$isEternamax ? "10vh" : "-2vh"};
          animation: ${breath} 3s infinite ease-in-out;

          ${$isSubstitute &&
          css`
            top: -9.5vh;
            bottom: auto; /* bottom 대신 top 적용을 위해 초기화 */
          `}
        `}
`;
