import React from "react";
import styled, { keyframes, css } from "styled-components";

const AILMENT_TINTS = {
  burn: { color: "red", opacity: 0.42, glow: "rgba(255, 40, 40, 0.55)" },
  sleep: { color: "gray", opacity: 0.5, glow: "rgba(128, 128, 128, 0.5)" },
  freeze: { color: "skyblue", opacity: 0.48, glow: "rgba(135, 206, 235, 0.65)" },
  freezeBug: { color: "skyblue", opacity: 0.48, glow: "rgba(135, 206, 235, 0.65)" },
  mabi: { color: "rgb(190, 186, 36)", opacity: 0.45, glow: "rgba(190, 186, 36, 0.6)" },
  poison: { color: "purple", opacity: 0.45, glow: "rgba(160, 32, 240, 0.55)" },
  mpoison: { color: "rgba(83, 14, 99, 1)", opacity: 0.52, glow: "rgba(110, 20, 135, 0.65)" },
};

const PokemonImage = ({ battle, type }) => {
  const pokemon = type === "npc" ? battle.npc : battle.player;

  const isSubstitute = !!pokemon?.tempStatus?.substitute;
  const isEternamax = !isSubstitute && (pokemon?.uniqueKey === "0890-m");

  const activeAilment =
    !isSubstitute && pokemon?.ailment
      ? Object.entries(pokemon.ailment).find(([, value]) => value != null)?.[0] || null
      : null;

  const pokeImgId = pokemon.img_id || pokemon.uniqueKey;
  const imageSrc = isSubstitute ? `/pokemon/img/background/substitute_${type === "npc" ? "front" : "back"}.webp` : `/pokemon/img/pokemon/${pokeImgId}.webp`;

  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }} aria-hidden="true">
        <defs>
          {Object.entries(AILMENT_TINTS).map(([key, { color, opacity }]) => (
            <filter key={key} id={`ailment-tint-${type}-${key}`} colorInterpolationFilters="sRGB">
              <feFlood floodColor={color} floodOpacity={opacity} result="flood" />
              <feComposite in="flood" in2="SourceAlpha" operator="in" result="tint" />
              <feComposite in="tint" in2="SourceGraphic" operator="over" />
            </filter>
          ))}
        </defs>
      </svg>
      <StyledPokemonImage
        className={type}
        src={imageSrc}
        alt={`${type} Pokemon`}
        $isSubstitute={isSubstitute}
        $isEternamax={isEternamax}
        $ailment={activeAilment}
        $type={type}
      />
    </>
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
  width: ${({ $isEternamax }) => ($isEternamax ? "60vw" : "30vw")};
  height: ${({ $isEternamax }) => ($isEternamax ? "60vw" : "30vw")};
  max-width: ${({ $isEternamax }) => ($isEternamax ? "240px" : "120px")};
  max-height: ${({ $isEternamax }) => ($isEternamax ? "240px" : "120px")};
  position: absolute;
  filter: ${({ $ailment, $type }) =>
    $ailment && AILMENT_TINTS[$ailment]
      ? `url(#ailment-tint-${$type}-${$ailment}) drop-shadow(0 0 5px ${AILMENT_TINTS[$ailment].glow})`
      : "none"};
  transition: filter 0.2s ease;

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
