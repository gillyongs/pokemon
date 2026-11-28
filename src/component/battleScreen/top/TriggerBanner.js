import React from "react";
import styled, { keyframes, css } from "styled-components";
import { AugmentIcon } from "../augment/AugmentIcon";
import { getItemImageSrc } from "../../../entity/Item";

const TriggerBanner = ({ banner }) => {
  if (!banner) return null;

  const { side, category, pokemonName, name, pokeImgId, itemName, augmentId, shiftUp, imageOptions } = banner;

  return (
    <BannerWrapper key={`${side}-${category}-${pokemonName}-${name}`} $side={side}>
      <IconBox>
        {category === "item" && <ItemImg src={getItemImageSrc(itemName)} alt={name} />}
        {category === "ability" && <PokeImg src={`/pokemon/img/pokemon/${pokeImgId}.webp`} alt={pokemonName} />}
        {category === "augment" && <AugmentIcon id={augmentId} size={36} shiftUp={shiftUp} imageOptions={imageOptions} />}
      </IconBox>
      <TextBox>
        <OwnerLine>{pokemonName}의</OwnerLine>
        <TriggerLine $len={name ? name.length : 0}>{name}</TriggerLine>
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
  bottom: 0.8vh;
  ${({ $side }) => ($side === "npc" ? "right: 0;" : "left: 0;")}
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 14px 5px 10px;
  min-width: 132px;
  max-width: 48vw;
  min-height: 48px;
  box-sizing: border-box;
  background-color: rgba(0, 0, 0, 0.7);
  ${({ $side }) =>
    $side === "npc"
      ? css`
          border-top-left-radius: 5px;
          border-bottom-left-radius: 5px;
          animation: ${slideInRight} 0.16s ease-out;
        `
      : css`
          border-top-right-radius: 5px;
          border-bottom-right-radius: 5px;
          animation: ${slideInLeft} 0.16s ease-out;
        `}
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

const getTriggerFontSize = (len) => {
  if (len >= 15) return "9.5px";
  if (len >= 12) return "11px";
  if (len >= 9) return "12px";
  if (len >= 7) return "13px";
  return "14px";
};

const TriggerLine = styled.div`
  color: #ffffff;
  font-size: ${({ $len }) => getTriggerFontSize($len)};
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.85);
`;
