import React from "react";
import styled from "styled-components";

const ItemImage = ({ battle, type }) => {
  // npc는 표시하지 않음
  if (type !== "plr") return null;

  const pokemon = battle.player;
  if (!pokemon?.item) return null;

  const imageSrc = `/pokemon/img/item/${pokemon.item}.webp`;

  return <StyledItemImage src={imageSrc} alt={`${pokemon.item}`} />;
};

export default ItemImage;

const StyledItemImage = styled.img`
  position: absolute;
  bottom: -13vh;
  right: 33vw;

  width: 35px;
  height: 35px;

  object-fit: contain;
  opacity: 0.9;
  filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.5));

  /* 🔹 좌우 반전 추가 */
  transform: scaleX(-1);
`;
