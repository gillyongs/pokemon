import React from "react";
import styled, { keyframes, css } from "styled-components";
import { AugmentIcon } from "../augment/AugmentIcon";

const TriggerBanner = ({ banner }) => {
  if (!banner) return null;

  const { side, category, pokemonName, name, pokeImgId, itemName, augmentId, shiftUp, imageOptions } = banner;

  return (
    <BannerWrapper key={`${side}-${category}-${pokemonName}-${name}`} $side={side}>
      <IconBox>
        {category === "item" && <ItemImg src={`/pokemon/img/item/${itemName}.webp`} alt={name} />}
        {category === "ability" && <PokeImg src={`/pokemon/img/pokemon/${pokeImgId}.webp`} alt={pokemonName} />}
        {category === "augment" && <AugmentIcon id={augmentId} size={36} shiftUp={shiftUp} imageOptions={imageOptions} />}
      </IconBox>
      <TextBox>
        <OwnerLine>{pokemonName}의</OwnerLine>
        <TriggerLine>{name}</TriggerLine>
      </TextBox>
    </BannerWrapper>
  );
};

export default TriggerBanner;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-16px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(16px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const BannerWrapper = styled.div`
  position: absolute;
  bottom: 0;
  ${({ $side }) => ($side === "npc" ? "right: 0;" : "left: 0;")}
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 14px 5px 10px;
  min-width: 132px;
  max-width: 48vw;
  min-height: 48px;
  box-sizing: border-box;
  background: linear-gradient(135deg, rgba(22, 22, 50, 0.94) 0%, rgba(44, 28, 72, 0.94) 55%, rgba(18, 18, 42, 0.94) 100%);
  border-top: 1.5px solid rgba(165, 180, 252, 0.38);
  ${({ $side }) =>
    $side === "npc"
      ? css`
          border-left: 1.5px solid rgba(165, 180, 252, 0.38);
          border-top-left-radius: 8px;
          animation: ${slideInRight} 0.16s ease-out;
        `
      : css`
          border-right: 1.5px solid rgba(165, 180, 252, 0.38);
          border-top-right-radius: 8px;
          animation: ${slideInLeft} 0.16s ease-out;
        `}
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.55);
  z-index: 15;
  pointer-events: none;
`;

const IconBox = styled.div`
  width: 38px;
  height: 38px;
  min-width: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ItemImg = styled.img`
  width: 34px;
  height: 34px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6));
`;

const PokeImg = styled.img`
  width: 38px;
  height: 38px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.65));
`;

const TextBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  min-width: 0;
  line-height: 1.25;
`;

const OwnerLine = styled.div`
  color: #e2e8f0;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.85);
`;

const TriggerLine = styled.div`
  color: #ffffff;
  font-size: 14px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.85);
`;
