import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { abilObject } from "../entity/Ability";
import PokemonData from "../entity/Pokemon/PokemonData";

export const getAbilityListForPokemon = (pokemon) => {
  if (!pokemon) return [];

  // 1. PokemonData에서 원본 도감 데이터 조회
  const rawData = PokemonData.getDataById(pokemon.pokemon_id) || PokemonData.getDataById(pokemon.id) || (pokemon.origin ? PokemonData.getDataById(pokemon.origin.pokemon_id || pokemon.origin.id) : null);

  const rawList = pokemon.abilList || rawData?.abilList || [pokemon.abil];

  // 중복 제거 및 리스트 가공
  const uniqueList = Array.from(new Set(rawList.filter(Boolean)));

  return uniqueList.map((abilName) => {
    const isImplemented = abilObject[abilName] !== undefined && abilObject[abilName] !== null;
    const desc = isImplemented ? abilObject[abilName].text || "효과 설명이 없습니다." : "아직 미구현된 특성입니다.";

    return {
      name: abilName,
      desc,
      isImplemented,
    };
  });
};

export const sortAbilities = (list, currentAbil) => {
  return [...list].sort((a, b) => {
    const aSelected = a.name === currentAbil;
    const bSelected = b.name === currentAbil;
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;

    if (a.isImplemented && !b.isImplemented) return -1;
    if (!a.isImplemented && b.isImplemented) return 1;

    return a.name.localeCompare(b.name, "ko");
  });
};

const AbilSearchModal = ({ pokemon, currentAbil, onSelect, onClose }) => {
  const abilities = useMemo(() => {
    const list = getAbilityListForPokemon(pokemon);
    return sortAbilities(list, currentAbil);
  }, [pokemon, currentAbil]);

  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose} aria-label="닫기">
          ✕
        </CloseButton>

        <HeaderArea>
          <Title>특성 선택</Title>
        </HeaderArea>

        <ListArea>
          <Grid>
            {abilities.map((item) => {
              const isSelected = item.name === currentAbil;
              const isClickable = item.isImplemented;

              return (
                <AbilCard
                  key={item.name}
                  $isSelected={isSelected}
                  $isImplemented={item.isImplemented}
                  onClick={() => {
                    if (!isClickable) return;
                    onSelect(item.name);
                    onClose();
                  }}
                  title={item.isImplemented ? `${item.name}: ${item.desc}` : `${item.name} (미구현 특성으로 선택할 수 없습니다)`}
                >
                  <InfoCol>
                    <NameRow>
                      <AbilName $isImplemented={item.isImplemented}>{item.name}</AbilName>
                    </NameRow>
                    <AbilDesc $isImplemented={item.isImplemented}>{item.desc}</AbilDesc>
                  </InfoCol>
                </AbilCard>
              );
            })}
          </Grid>
        </ListArea>
      </ModalBox>
    </ModalOverlay>
  );
};

export default AbilSearchModal;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1300;
  backdrop-filter: blur(2px);
`;

const ModalBox = styled.div`
  position: relative;
  background: white;
  border-radius: 14px;
  padding: 20px;
  width: 92vw;
  max-width: 550px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  color: #333;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  background: transparent;
  border: none;
  font-size: 1.3rem;
  line-height: 1;
  color: #888;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;

  &:hover {
    color: #333;
    background: #f0f0f0;
  }
`;

const HeaderArea = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
  text-align: left;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  color: #222;
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

const CountText = styled.span`
  font-size: 0.9rem;
  color: #888;
  font-weight: normal;
`;

const ListArea = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: 55vh;
  padding: 4px 4px 4px 2px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
`;

const Grid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
`;

const AbilCard = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border: 1px solid ${({ $isSelected, $isImplemented }) => (!$isImplemented ? "#e0e0e0" : $isSelected ? "#2196f3" : "#eee")};
  background-color: ${({ $isSelected, $isImplemented }) => (!$isImplemented ? "#f8f9fa" : $isSelected ? "#e3f2fd" : "#ffffff")};
  border-radius: 10px;
  cursor: ${({ $isImplemented }) => ($isImplemented ? "pointer" : "not-allowed")};
  opacity: ${({ $isImplemented }) => ($isImplemented ? 1 : 0.6)};
  transition: all 0.15s ease-in-out;
  text-align: left;

  ${({ $isImplemented }) =>
    $isImplemented &&
    `
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
      border-color: #2196f3;
    }
  `}
`;

const InfoCol = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AbilName = styled.span`
  font-size: 1rem;
  font-weight: bold;
  color: ${({ $isImplemented }) => ($isImplemented ? "#222" : "#888")};
`;

const Badge = styled.span`
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
  color: white;
  background-color: ${({ $type }) => ($type === "ready" ? "#4caf50" : "#9e9e9e")};
`;

const AbilDesc = styled.span`
  font-size: 0.82rem;
  color: ${({ $isImplemented }) => ($isImplemented ? "#666" : "#aaa")};
  line-height: 1.35;
`;
