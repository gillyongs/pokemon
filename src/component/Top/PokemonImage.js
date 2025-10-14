import React from "react";
import styled, { keyframes, css } from "styled-components";

const PokemonImage = ({ battle, type }) => {
  const pokemon = type === "npc" ? battle.npc : battle.player;

  const isSubstitute = !!pokemon?.tempStatus?.substitute;

  const imageSrc = isSubstitute ? `/pokemon/img/background/substitute_${type === "npc" ? "front" : "back"}.webp` : `/pokemon/img/pokemon/${pokemon.origin.pokemon_id}.webp`;

  return (
    <StyledPokemonImage
      className={type}
      src={imageSrc}
      alt={`${type} Pokemon`}
      $isSubstitute={isSubstitute} // ✅ $붙이기
    />
  );
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
  width: 30vw;
  height: 30vw;
  max-width: 120px;
  max-height: 120px;
  position: absolute;

  ${({ className, $isSubstitute }) =>
    className === "plr"
      ? css`
          right: 8.5vw;
          top: -3vh;
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
          left: 8.5vw;
          bottom: -3vh;
          animation: ${breath} 3s infinite ease-in-out;

          ${$isSubstitute &&
          css`
            top: -9.5vh;
            bottom: auto; /* bottom 대신 top 적용을 위해 초기화 */
          `}
        `}
`;
