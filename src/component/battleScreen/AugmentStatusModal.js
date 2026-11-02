import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { AugmentIcon } from "./AugmentIcon";
import { getAugmentLogDesc } from "../../entity/Augment/AugmentData";

const AugmentStatusModal = ({ battle, team = [], onClose }) => {
  const resolvedTeam =
    team && team.length > 0
      ? team
      : [battle?.player, battle?.playerBench1, battle?.playerBench2].filter(Boolean);

  const [activePokemon, setActivePokemon] = useState(resolvedTeam[0] || null);

  if (!resolvedTeam || resolvedTeam.length === 0) return null;

  const currentAugments = activePokemon?.augments || [];

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <HeaderArea>
          <HeaderTopRow>
            <Title>증강 현황</Title>
            <CloseButton onClick={onClose} title="닫기">
              ✕
            </CloseButton>
          </HeaderTopRow>
        </HeaderArea>

        {resolvedTeam.length > 0 && (
          <EntryContainer>
            {resolvedTeam.map((poke, idx) => {
              const isSelected = activePokemon === poke || activePokemon?.id === poke.id;
              const pokeId = poke.origin?.pokemon_id || poke.pokemon_id;
              const count = (poke.augments || []).length;
              return (
                <EntryCard
                  key={poke.originalIndex ?? poke.id ?? idx}
                  $isSelected={isSelected}
                  onClick={() => setActivePokemon(poke)}
                  title={`${poke.name} (보유 증강 ${count}/3)`}
                >
                  <EntryPokemonImg
                    src={`/pokemon/img/pokemon/${pokeId}.webp`}
                    alt={poke.name}
                    onError={(e) => {
                      e.currentTarget.src = "/pokemon/img/pokemon/0000.webp";
                    }}
                  />
                  <EntryPokemonName>{poke.name}</EntryPokemonName>
                  <EntryCountBadge $hasAugment={count > 0}>{count}/3</EntryCountBadge>
                </EntryCard>
              );
            })}
          </EntryContainer>
        )}

        <CardContainer>
          {currentAugments.length === 0 ? (
            <EmptyChoiceText>보유 중인 증강이 없습니다.</EmptyChoiceText>
          ) : (
            currentAugments.map((aug, index) => (
              <AugmentCard key={aug.id || index}>
                <IconCol>
                  <IconWrapper>
                    <AugmentIcon id={aug.id} size={38} pokemon={activePokemon} shiftUp={aug.shiftUp} imageOptions={aug.imageOptions} />
                  </IconWrapper>
                  {aug.cost !== "-" && aug.cost !== undefined && (
                    <CostBadge $isLong={String(aug.cost).length >= 3}>{aug.cost ?? 1} cost</CostBadge>
                  )}
                </IconCol>
                <CardContent>
                  <CardTitle>{aug.name}</CardTitle>
                  <CardDescription>{getAugmentLogDesc(aug, activePokemon)}</CardDescription>
                </CardContent>
              </AugmentCard>
            ))
          )}
        </CardContainer>

        <ButtonGroup>
          <CloseActionButton type="button" onClick={onClose}>
            닫기
          </CloseActionButton>
        </ButtonGroup>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default AugmentStatusModal;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10010;
  animation: ${fadeIn} 0.2s ease-out;
  padding: 16px;
  box-sizing: border-box;
  cursor: pointer;

  @media (max-width: 480px) {
    padding: 8px;
  }
`;

const ModalContainer = styled.div`
  background: rgba(15, 20, 28, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 18px 16px;
  width: 100%;
  max-width: 430px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.85);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  cursor: default;

  @media (max-width: 480px) {
    padding: 14px 10px;
    width: 96%;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #64ffda, #38bdf8, #64ffda);
  }
`;

const HeaderArea = styled.div`
  width: 100%;
  margin-bottom: 12px;
`;

const HeaderTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.5px;
`;

const CloseButton = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    color: #fff;
    background: rgba(239, 68, 68, 0.6);
    border-color: rgba(239, 68, 68, 0.8);
  }
`;

const EntryContainer = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
  margin-bottom: 12px;
  box-sizing: border-box;

  @media (max-width: 480px) {
    gap: 6px;
    margin-bottom: 10px;
  }
`;

const EntryCard = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 4px;
  background: ${(props) =>
    props.$isSelected ? "rgba(20, 48, 64, 0.95)" : "rgba(255, 255, 255, 0.05)"};
  border: ${(props) =>
    props.$isSelected ? "2px solid #64ffda" : "1px solid rgba(255, 255, 255, 0.12)"};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${(props) => (props.$isSelected ? "0 0 10px rgba(100, 255, 218, 0.35)" : "none")};
  user-select: none;
  min-width: 0;

  @media (max-width: 480px) {
    padding: 6px 2px;
  }

  &:hover {
    ${(props) =>
      !props.$isSelected &&
      `
      background: rgba(255, 255, 255, 0.09);
      border-color: rgba(100, 255, 218, 0.4);
    `}
  }
`;

const EntryPokemonImg = styled.img`
  width: 28px;
  height: 28px;
  object-fit: contain;
  flex-shrink: 0;
`;

const EntryPokemonName = styled.span`
  font-size: 0.8rem;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 0.74rem;
  }
`;

const EntryCountBadge = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  color: ${(props) => (props.$hasAugment ? "#64ffda" : "#94a3b8")};
  background: ${(props) =>
    props.$hasAugment ? "rgba(100, 255, 218, 0.12)" : "rgba(255, 255, 255, 0.06)"};
  padding: 1px 5px;
  border-radius: 4px;
  line-height: 1.2;
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  min-height: 120px;
  max-height: 50vh;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(100, 255, 218, 0.3);
    border-radius: 4px;
  }
`;

const EmptyChoiceText = styled.div`
  font-size: 0.85rem;
  color: #94a3b8;
  padding: 32px 0;
  text-align: center;
  width: 100%;
`;

const IconCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 50px;
  min-width: 50px;
  margin-right: 14px;
  flex-shrink: 0;
  gap: 4px;

  @media (max-width: 480px) {
    width: 44px;
    min-width: 44px;
    margin-right: 10px;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AugmentCard = styled.div`
  width: 100%;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 4px solid #64ffda;
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
  transition: all 0.2s ease;

  @media (max-width: 480px) {
    padding: 10px 10px;
  }

  &:hover {
    border-color: rgba(100, 255, 218, 0.5);
    background: rgba(20, 30, 44, 0.75);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  flex: 1;
  min-width: 0;
`;

const CardTitle = styled.h3`
  margin: 0 0 4px 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
  word-break: keep-all;
  line-height: 1.3;

  @media (max-width: 480px) {
    font-size: 0.86rem;
    letter-spacing: -0.3px;
    margin-bottom: 2px;
  }
`;

const CostBadge = styled.span`
  min-width: 48px;
  width: auto;
  padding: 0 5px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: ${(props) => (props.$isLong ? "0.61rem" : "0.68rem")};
  letter-spacing: ${(props) => (props.$isLong ? "-0.4px" : "normal")};
  font-weight: 600;
  border-radius: 4px;
  background: rgba(100, 255, 218, 0.08);
  color: #64ffda;
  border: 1px solid rgba(100, 255, 218, 0.25);
  white-space: nowrap;
  text-align: center;
  box-sizing: border-box;

  @media (max-width: 480px) {
    width: 44px;
    min-width: 44px;
    max-width: 44px;
    height: 16px;
    font-size: ${(props) => (props.$isLong ? "0.58rem" : "0.64rem")};
  }
`;

const CardDescription = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: #cbd5e1;
  line-height: 1.4;
  word-break: keep-all;
  white-space: pre-wrap;

  @media (max-width: 480px) {
    font-size: 0.76rem;
    line-height: 1.35;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  width: 100%;
  margin-top: 14px;
  box-sizing: border-box;
`;

const CloseActionButton = styled.button`
  width: 100%;
  padding: 10px 0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  font-family: inherit;
  transition: all 0.2s ease;
  user-select: none;
  background: linear-gradient(135deg, #0d9488, #0284c7);
  border: 1px solid #64ffda;
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 0 12px rgba(100, 255, 218, 0.35);

  &:hover {
    background: linear-gradient(135deg, #14b8a6, #0284c7);
    box-shadow: 0 0 16px rgba(100, 255, 218, 0.55);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px);
  }
`;
