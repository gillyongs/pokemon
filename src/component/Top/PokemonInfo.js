import React from "react";
import styled from "styled-components";
import HpBar from "../HpBar";

const PokemonInfo = ({ battle, type }) => {
  const pokemon = type === "npc" ? battle.npc : battle.player;

  return (
    <INFO type={type}>
      <NAME>{pokemon.origin.name}</NAME>
      {Object.entries(pokemon.status).map(([key, value]) =>
        value != null ? (
          <STATUS key={key} status={statusMap[key]}>
            {statusKor[key]}
          </STATUS>
        ) : null
      )}

      <HpBar hp={pokemon.hp} maxHp={pokemon.origin.hp} />
    </INFO>
  );
};

const INFO = styled.div`
  position: absolute;
  width: 20vh;
  height: 13.5vh;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 15px;
  ${({ type }) => (type === "npc" ? "top: 3vh; left: 3vw;" : "bottom: 3vh; right: 3vw;")}
`;

const NAME = styled.div`
  position: absolute;
  color: white;
  top: 14px;
  left: 10px;
  font-size: 17px;
`;

const STATUS = styled.div`
  position: absolute;
  color: white;
  top: 13px;
  right: 10px;
  font-size: 15px;
  padding: 2px 4px;
  border-radius: 5px;
  background-color: ${({ status }) => status};
`;

const statusMap = {
  burn: "red",
  sleep: "gray",
  freeze: "skyblue",
  mabi: "rgb(158, 156, 42)",
  poison: "purple",
  mpoison: "rgba(83, 14, 99, 1)",
};

const statusKor = {
  burn: "화상",
  sleep: "잠듦",
  freeze: "얼음",
  mabi: "마비",
  poison: "독",
  mpoison: "맹독",
};

export default PokemonInfo;
