import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { AugmentIcon } from "./AugmentIcon";
import { getAugmentText } from "../../../entity/Augment/AugmentData";

// 다음 라운드로 넘길 증강 선택 모달

const AugmentCarryoverModal = ({ battle, round = 1, onConfirm }) => {
  // 라운드 * 3 값 (1라운드: 3pt, 2라운드: 6pt, 3라운드: 9pt...)
  const maxPoints = (round || 1) * 3;

  // 팀 포켓몬 목록 (배틀 중 교체/기절로 슬롯이 바뀌어도 원래 엔트리 순서인 originalIndex 기준으로 매핑)
  const teamMembers = [battle?.player, battle?.playerBench1, battle?.playerBench2]
    .filter(Boolean)
    .map((poke, fallbackIdx) => ({
      poke,
      index: poke.originalIndex ?? fallbackIdx,
    }))
    .sort((a, b) => a.index - b.index);

  // 모든 보유 증강 플랫 리스트 [{ pokeIndex, pokemonName, augment, uniqueKey }]
  const allOwnedAugments = [];
  teamMembers.forEach(({ poke, index }) => {
    (poke.augments || []).forEach((aug, augIdx) => {
      if (aug.buf) return;
      allOwnedAugments.push({
        pokeIndex: index,
        pokemon: poke,
        pokemonName: poke.name,
        augment: aug,
        uniqueKey: `${index}-${aug.id}-${augIdx}`,
      });
    });
  });

  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [errorMessage, setErrorMessage] = useState("");

  // 현재 선택된 총 포인트 계산
  const currentCost = allOwnedAugments.reduce((sum, item) => {
    if (selectedKeys.has(item.uniqueKey)) {
      return sum + (item.augment.cost ?? 1);
    }
    return sum;
  }, 0);

  const toggleSelect = (item) => {
    setErrorMessage("");
    const isSelected = selectedKeys.has(item.uniqueKey);
    const itemCost = item.augment.cost ?? 1;

    if (isSelected) {
      const next = new Set(selectedKeys);
      next.delete(item.uniqueKey);
      setSelectedKeys(next);
    } else {
      if (currentCost + itemCost > maxPoints) {
        setErrorMessage("최대치를 초과하여 더이상 선택할 수 없습니다!");
        return;
      }
      const next = new Set(selectedKeys);
      next.add(item.uniqueKey);
      setSelectedKeys(next);
    }
  };

  const handleComplete = () => {
    // 포켓몬별로 선택된 증강 맵핑 { 0: [aug...], 1: [...], 2: [...] }
    const carriedMap = { 0: [], 1: [], 2: [] };
    // 버프는 무조건 같이 넘어감
    teamMembers.forEach(({ poke, index }) => {
      (poke.augments || []).forEach((aug) => {
        if (aug.buf) {
          carriedMap[index].push({
            id: aug.id,
            name: aug.name,
            cost: aug.cost,
            buf: true,
            dragonKillCount: aug.dragonKillCount ?? poke.dragonKillCount ?? 0,
          });
        }
      });
    });
    allOwnedAugments.forEach((item) => {
      if (selectedKeys.has(item.uniqueKey)) {
        carriedMap[item.pokeIndex].push({
          id: item.augment.id,
          name: item.augment.name,
          cost: item.augment.cost,
          replacedSlot: item.augment.replacedSlot,
          selectedType: item.augment.selectedType,
          revolutionResult: item.augment.revolutionResult,
          replacedSkillName: item.augment.replacedSkillName,
          swordLevel: item.augment.swordLevel,
          swordFailed: item.augment.swordFailed,
          swordBonusAtk: item.augment.swordBonusAtk,
          swordName: item.augment.swordName,
          pickedAbility: item.augment.pickedAbility || (item.augment.id === "randomAbility" ? item.pokemon?.abil : undefined),
          targetSlot: item.augment.targetSlot,
          enhancedSkillName: item.augment.enhancedSkillName,
          baseSkillName: item.augment.baseSkillName,
        });
      }
    });
    onConfirm(carriedMap);
  };

  return (
    <ModalOverlay>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <HeaderArea>
          <Title>다음 라운드 증강 유지</Title>
          <SubTitle>*남은 코스트는 이월되지 않습니다.</SubTitle>
        </HeaderArea>

        <PointBar>
          <PointText>
            사용 코스트: <HighlightText>{currentCost}</HighlightText> / {maxPoints}
          </PointText>
        </PointBar>

        {errorMessage && <AlertBox>{errorMessage}</AlertBox>}

        <CardScrollArea>
          {allOwnedAugments.length === 0 ? (
            <EmptyText>현재 보유 중인 증강이 없습니다.</EmptyText>
          ) : (
            teamMembers.map(({ poke, index }) => {
              const pokeAugs = allOwnedAugments.filter((item) => item.pokeIndex === index);
              if (pokeAugs.length === 0) return null;
              return (
                <PokemonSection key={index}>
                  <PokeSectionTitle>{poke.name}</PokeSectionTitle>
                  <AugmentGrid>
                    {pokeAugs.map((item) => {
                      const isSelected = selectedKeys.has(item.uniqueKey);
                      return (
                        <AugmentCard key={item.uniqueKey} $selected={isSelected} onClick={() => toggleSelect(item)}>
                          <CardHeader>
                            <IconWrapper>
                              <AugmentIcon id={item.augment.id} size={30} />
                            </IconWrapper>
                            <CardMeta>
                              <AugName>{item.augment.shortName || item.augment.name}</AugName>
                              {item.augment.cost !== "-" && item.augment.cost !== undefined && <CostTag $selected={isSelected}>{item.augment.cost ?? 1} cost</CostTag>}
                            </CardMeta>
                            <CheckIndicator $selected={isSelected}>{isSelected ? "✓" : ""}</CheckIndicator>
                          </CardHeader>
                          <AugDesc>{getAugmentText(item.augment, item.pokemon)}</AugDesc>
                        </AugmentCard>
                      );
                    })}
                  </AugmentGrid>
                </PokemonSection>
              );
            })
          )}
        </CardScrollArea>

        <FooterArea>
          <ConfirmButton onClick={handleComplete}>
            선택 완료
          </ConfirmButton>
        </FooterArea>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default AugmentCarryoverModal;

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
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10001;
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
  max-width: 460px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
  box-sizing: border-box;
  color: #fff;
`;

const HeaderArea = styled.div`
  text-align: center;
  margin-bottom: 12px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: bold;
  color: #64ffda;
  letter-spacing: 0.5px;
`;

const SubTitle = styled.div`
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 5px;
`;

const PointBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 10px;
`;

const PointText = styled.span`
  font-size: 0.9rem;
  font-weight: bold;
  color: #e2e8f0;
`;

const HighlightText = styled.span`
  color: #64ffda;
  font-size: 1.05rem;
`;


const AlertBox = styled.div`
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  font-size: 0.8rem;
  padding: 6px 10px;
  border-radius: 6px;
  margin-bottom: 10px;
  text-align: center;
`;

const CardScrollArea = styled.div`
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 4px;
  margin-bottom: 14px;
  max-height: 50vh;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(100, 255, 218, 0.3);
    border-radius: 4px;
  }
`;

const PokemonSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const PokeSectionTitle = styled.div`
  font-size: 0.85rem;
  font-weight: bold;
  color: #cbd5e1;
  padding-left: 2px;
`;

const AugmentGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AugmentCard = styled.div`
  background: ${(props) => (props.$selected ? "rgba(20, 36, 50, 0.8)" : "rgba(0, 0, 0, 0.45)")};
  border: 1px solid ${(props) => (props.$selected ? "rgba(100, 255, 218, 0.6)" : "rgba(255, 255, 255, 0.1)")};
  border-left: 3px solid ${(props) => (props.$selected ? "#64ffda" : "rgba(255, 255, 255, 0.2)")};
  border-radius: 8px;
  padding: 8px 10px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: rgba(100, 255, 218, 0.6);
    background: ${(props) => (props.$selected ? "rgba(24, 44, 60, 0.85)" : "rgba(255, 255, 255, 0.06)")};
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconWrapper = styled.div`
  flex-shrink: 0;
`;

const CardMeta = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const AugName = styled.span`
  font-size: 0.88rem;
  font-weight: bold;
  color: #fff;
`;

const CostTag = styled.span`
  font-size: 0.68rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(100, 255, 218, 0.08);
  color: #64ffda;
  border: 1px solid rgba(100, 255, 218, 0.25);
`;

const CheckIndicator = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  background: ${(props) => (props.$selected ? "#64ffda" : "rgba(255, 255, 255, 0.08)")};
  color: ${(props) => (props.$selected ? "#0f141c" : "transparent")};
  border: 1px solid ${(props) => (props.$selected ? "#64ffda" : "rgba(255, 255, 255, 0.2)")};
`;

const AugDesc = styled.div`
  font-size: 0.75rem;
  color: #cbd5e1;
  margin-top: 4px;
  line-height: 1.35;
  word-break: keep-all;
`;

const EmptyText = styled.div`
  text-align: center;
  color: #94a3b8;
  padding: 24px 0;
  font-size: 0.85rem;
`;

const FooterArea = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ConfirmButton = styled.button`
  width: 100%;
  padding: 11px;
  border-radius: 8px;
  border: 1px solid rgba(100, 255, 218, 0.5);
  background: rgba(100, 255, 218, 0.12);
  color: #64ffda;
  font-size: 0.98rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(100, 255, 218, 0.25);
    box-shadow: 0 4px 14px rgba(100, 255, 218, 0.2);
  }
`;
