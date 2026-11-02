import React from "react";
import styled, { keyframes } from "styled-components";
import { AugmentIcon } from "./AugmentIcon";
import { getAugmentDesc } from "../../entity/Augment/AugmentData";

const AugmentStatusModal = ({ battle, onClose }) => {
  if (!battle) return null;

  const team = [battle.player, battle.playerBench1, battle.playerBench2].filter(Boolean);

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <HeaderArea>
          <Title>보유 증강 현황</Title>
          <CloseIcon onClick={onClose}>✕</CloseIcon>
        </HeaderArea>

        <TeamList>
          {team.map((pokemon, idx) => {
            const augments = pokemon.augments || [];
            return (
              <PokemonCard key={pokemon.id || idx}>
                <PokemonHeader>
                  <PokemonName>{pokemon.names || pokemon.name}</PokemonName>
                  <AugmentCountBadge>
                    증강 {augments.length} / 3
                  </AugmentCountBadge>
                </PokemonHeader>

                {augments.length === 0 ? (
                  <EmptyText>보유 중인 증강이 없습니다.</EmptyText>
                ) : (
                  <AugmentList>
                    {augments.map((aug, aIdx) => (
                      <AugmentItem key={aug.id || aIdx}>
                        <IconWrapper>
                          <AugmentIcon id={aug.id} size={30} />
                        </IconWrapper>
                        <AugmentInfo>
                          <AugmentTopRow>
                            <AugmentName>{aug.name}</AugmentName>
                            {aug.cost !== "-" && aug.cost !== undefined && (
                              <CostBadge>값 {aug.cost ?? 1} pt</CostBadge>
                            )}
                          </AugmentTopRow>
                          <AugmentDesc>{getAugmentDesc(aug, pokemon)}</AugmentDesc>
                        </AugmentInfo>
                      </AugmentItem>
                    ))}
                  </AugmentList>
                )}
              </PokemonCard>
            );
          })}
        </TeamList>

        <CloseButton onClick={onClose}>닫기</CloseButton>
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
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  animation: ${fadeIn} 0.2s ease-out;
  padding: 16px;
  box-sizing: border-box;
`;

const ModalContainer = styled.div`
  background: rgba(15, 20, 28, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 20px 22px;
  width: 90vw;
  max-width: 440px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
  box-sizing: border-box;
  color: #fff;
  overflow: hidden;
`;

const HeaderArea = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: bold;
  color: #64ffda;
  letter-spacing: 0.5px;
`;

const CloseIcon = styled.div`
  font-size: 1rem;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;

  &:hover {
    color: #fff;
    background: rgba(239, 68, 68, 0.6);
    border-color: rgba(239, 68, 68, 0.8);
  }
`;

const TeamList = styled.div`
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 4px;
  flex: 1;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(100, 255, 218, 0.3);
    border-radius: 4px;
  }
`;

const PokemonCard = styled.div`
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 10px 12px;
`;

const PokemonHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const PokemonName = styled.span`
  font-size: 0.95rem;
  font-weight: bold;
  color: #f1f5f9;
`;

const AugmentCountBadge = styled.span`
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  background: rgba(100, 255, 218, 0.12);
  color: #64ffda;
  border: 1px solid rgba(100, 255, 218, 0.25);
  font-weight: bold;
`;

const EmptyText = styled.div`
  font-size: 0.8rem;
  color: #94a3b8;
  text-align: center;
  padding: 8px 0;
`;

const AugmentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const AugmentItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: rgba(255, 255, 255, 0.04);
  border-left: 3px solid #64ffda;
  border-radius: 6px;
  padding: 8px 10px;
`;

const IconWrapper = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AugmentInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const AugmentTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
`;

const AugmentName = styled.span`
  font-size: 0.85rem;
  font-weight: bold;
  color: #ffffff;
`;

const CostBadge = styled.span`
  font-size: 0.7rem;
  font-weight: bold;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.35);
`;

const AugmentDesc = styled.span`
  font-size: 0.75rem;
  color: #cbd5e1;
  line-height: 1.35;
  word-break: keep-all;
`;

const CloseButton = styled.button`
  width: 100%;
  margin-top: 14px;
  padding: 10px 0;
  font-size: 1rem;
  font-weight: bold;
  border: 1px solid rgba(100, 255, 218, 0.5);
  border-radius: 8px;
  cursor: pointer;
  background: rgba(100, 255, 218, 0.1);
  color: #64ffda;
  transition: all 0.25s ease;

  &:hover {
    background: rgba(100, 255, 218, 0.25);
    box-shadow: 0 4px 14px rgba(100, 255, 218, 0.2);
  }
`;
