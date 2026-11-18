import React, { useState } from "react";
import styled from "styled-components";
import { skillTypeCalculate } from "../../../../calc/skillTypeCalculate";
import { getTypeEffectText } from "../../../../calc/typeEffectCalculate";
import { HeaderArea, HeaderTopRow, Title, SubTitleText, CloseButton, ButtonGroup, ActionButton } from "./selectStyles";

const AugmentSkillSelectView = ({
  skillSelectAug,
  activePokemon,
  battle,
  selectedType,
  isPeekMode,
  setIsPeekMode,
  onSelect,
  onBack,
}) => {
  const [selectedSlot, setSelectedSlot] = useState(null);

  const getSubTitle = () => {
    if (skillSelectAug?.id === "teraBlast") {
      return `[${selectedType || "노말"}] 테라버스트와 교체할 기술을 선택해주세요.`;
    }
    if (skillSelectAug?.id === "nameIsSalamence") {
      return "지진과 교체할 기술을 선택해주세요.";
    }
    return "용의춤과 교체할 기술을 선택해주세요.";
  };

  const handleConfirm = (e) => {
    e?.stopPropagation();
    if (!selectedSlot) return;
    const prevSkill = activePokemon?.skill?.[selectedSlot];
    onSelect(skillSelectAug, {
      replaceSlot: selectedSlot,
      targetPokemon: activePokemon,
      selectedType: selectedType || "노말",
      replacedSkillName: prevSkill?.name || "기존 기술",
    });
    setSelectedSlot(null);
  };

  const handleBack = (e) => {
    e?.stopPropagation();
    setSelectedSlot(null);
    if (onBack) onBack();
  };

  return (
    <>
      <HeaderArea>
        <HeaderTopRow>
          <Title>교체할 기술 선택</Title>
          <CloseButton onClick={handleBack} title="되돌아가기">
            ✕
          </CloseButton>
        </HeaderTopRow>
        <SubTitleText>{getSubTitle()}</SubTitleText>
      </HeaderArea>

      <SkillGrid>
        {[1, 2, 3, 4].map((slot) => {
          const sk = activePokemon?.skill?.[slot];
          if (!sk) return null;
          const currentPp = activePokemon?.pp?.[slot] ?? sk.pp;
          const displayType = skillTypeCalculate(battle, sk, activePokemon);
          const effectText = getTypeEffectText(battle, activePokemon, sk, displayType) || "";
          const isSelected = selectedSlot === slot;
          return (
            <SkillCard
              key={slot}
              $isSelected={isSelected}
              $isPeek={isPeekMode}
              onClick={(e) => {
                e.stopPropagation();
                if (isPeekMode) {
                  if (setIsPeekMode) setIsPeekMode(false);
                  return;
                }
                setSelectedSlot(slot);
              }}
            >
              <SkillTopRow>
                <SkillTypeIcon
                  src={`/pokemon/img/type/${displayType}.svg`}
                  alt={displayType}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <SkillName title={sk.name}>{sk.name}</SkillName>
              </SkillTopRow>
              <SkillEffectText>{effectText || ""}</SkillEffectText>
              <SkillPP>
                {currentPp}/{sk.pp}
              </SkillPP>
            </SkillCard>
          );
        })}
      </SkillGrid>

      <ButtonGroup>
        <ActionButton type="button" $variant="back" onClick={handleBack}>
          되돌아가기
        </ActionButton>
        <ActionButton type="button" $variant="confirm" disabled={!selectedSlot} onClick={handleConfirm}>
          교체
        </ActionButton>
      </ButtonGroup>
    </>
  );
};

export default AugmentSkillSelectView;

const SkillGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  margin-top: 4px;
`;

const SkillCard = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
  background: ${(props) => (props.$isSelected ? "rgba(22, 45, 64, 0.95)" : "rgba(18, 24, 35, 0.85)")};
  border: ${(props) => (props.$isSelected ? "2px solid #64ffda" : "1px solid rgba(255, 255, 255, 0.15)")};
  border-radius: 8px;
  padding: 10px 10px 28px 10px;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  cursor: pointer;
  box-sizing: border-box;
  user-select: none;
  transition: all 0.2s ease;
  overflow: hidden;
  box-shadow: ${(props) => (props.$isSelected ? "0 0 14px rgba(100, 255, 218, 0.45), inset 0 0 8px rgba(100, 255, 218, 0.15)" : "0 2px 8px rgba(0, 0, 0, 0.4)")};

  &:hover {
    transform: ${(props) => (props.$isPeek ? "none" : "translateY(-2px)")};
    border-color: ${(props) => (props.$isSelected ? "#64ffda" : "rgba(100, 255, 218, 0.5)")};
    background: ${(props) => (props.$isSelected ? "rgba(22, 45, 64, 0.98)" : "rgba(20, 30, 44, 0.8)")};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const SkillTopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-width: 0;
`;

const SkillTypeIcon = styled.img`
  width: 26px;
  height: 26px;
  border-radius: 5px;
  object-fit: contain;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
`;

const SkillName = styled.span`
  flex: 1;
  min-width: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.2px;
`;

const SkillEffectText = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: #ffffff;
  margin-top: 6px;
  min-height: 18px;
  line-height: 1.2;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  width: 100%;
  min-width: 0;
  word-break: break-all;
`;

const SkillPP = styled.div`
  position: absolute;
  bottom: 5px;
  right: 5px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #ffffff;
  background-color: #665f5f;
  border-radius: 4px;
  padding: 1px 5px;
  letter-spacing: 0.5px;
  line-height: 1.3;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
`;
