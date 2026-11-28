import React from "react";
import styled from "styled-components";
import { ALL_POKEMON_TYPES, TYPE_COLORS } from "../../../../entity/TypeData";
import { isNoEffect } from "../../../../calc/typeEffectCalculate";
import { HeaderArea, HeaderTopRow, Title, SubTitleText, CloseButton, ButtonGroup, ActionButton } from "./selectStyles";

const AugmentTypeSelectView = ({
  typeSelectAug,
  activePokemon,
  selectedType,
  setSelectedType,
  onNext,
  onSelect,
  onCancel,
}) => {
  const isHiddenPower = typeSelectAug?.id === "hiddenPower";
  const isTerastal = typeSelectAug?.id === "terastal";
  const isAllTypeSelect = isHiddenPower || isTerastal;

  const getSubTitle = () => {
    if (isTerastal) {
      return activePokemon?.name ? `${activePokemon.name}의 테라스탈 타입을 선택해주세요.` : "테라스탈 타입을 선택해주세요.";
    }
    if (isHiddenPower) {
      return activePokemon?.name ? `${activePokemon.name}의 잠재파워에 부여할 타입을 선택해주세요.` : "잠재파워의 타입을 선택해주세요.";
    }
    return activePokemon?.name ? `${activePokemon.name}에게 추가할 무효 타입을 선택해주세요.` : "무효화할 타입을 선택해주세요.";
  };

  const handleConfirm = (e) => {
    e?.stopPropagation();
    if (!selectedType) return;
    if (isHiddenPower || isTerastal) {
      if (onNext) onNext(selectedType);
    } else {
      if (onSelect) {
        onSelect(typeSelectAug, { targetPokemon: activePokemon, selectedType });
      }
    }
  };

  const handleCancel = (e) => {
    e?.stopPropagation();
    if (onCancel) onCancel();
  };

  return (
    <>
      <HeaderArea>
        <HeaderTopRow>
          <Title>{isTerastal ? "테라스탈 타입 선택" : isHiddenPower ? "잠재파워 타입 선택" : "무효 타입 선택"}</Title>
          <CloseButton onClick={handleCancel} title="취소">
            ✕
          </CloseButton>
        </HeaderTopRow>
        <SubTitleText>{getSubTitle()}</SubTitleText>
      </HeaderArea>

      <TypeGridContainer>
        <TypeGrid>
          {ALL_POKEMON_TYPES.map((tName) => {
            const t1 = activePokemon?.type1;
            const t2 = activePokemon?.type2;
            const isDisabled = isAllTypeSelect ? false : Boolean(t1 && isNoEffect(tName, t1, t2));
            const isSelected = selectedType === tName;
            const typeCol = TYPE_COLORS[tName] || "#64ffda";
            return (
              <TypeCard
                key={tName}
                $isSelected={isSelected}
                $isDisabled={isDisabled}
                $typeColor={typeCol}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isDisabled) return;
                  setSelectedType((prev) => (prev === tName ? null : tName));
                }}
                title={
                  isTerastal
                    ? `${tName} 타입 테라스탈 선택`
                    : isHiddenPower
                      ? `${tName} 타입 잠재파워 선택`
                      : isDisabled
                        ? `${tName} 타입은 이미 무효화되어 있습니다`
                        : `${tName} 타입 무효화 선택`
                }
              >
                <TypeIconImg
                  src={`/pokemon/img/type/${tName}.svg`}
                  alt={tName}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <TypeNameText>{tName}</TypeNameText>
                {isDisabled ? <TypeNullBadge>무효</TypeNullBadge> : isSelected ? <TypeSelectedCheck>✓</TypeSelectedCheck> : null}
              </TypeCard>
            );
          })}
        </TypeGrid>
      </TypeGridContainer>

      <ButtonGroup>
        <ActionButton type="button" $variant="back" onClick={handleCancel}>
          취소
        </ActionButton>
        <ActionButton type="button" $variant="confirm" disabled={!selectedType} onClick={handleConfirm}>
          {isAllTypeSelect ? "다음" : "선택"}
        </ActionButton>
      </ButtonGroup>
    </>
  );
};

export default AugmentTypeSelectView;

const TypeGridContainer = styled.div`
  width: 100%;
  flex: 1;
  min-height: 0;
  max-height: 52vh;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 2px;
  margin-top: 4px;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(100, 255, 218, 0.3);
    border-radius: 4px;
  }
`;

const TypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    gap: 5px;
  }
`;

const TypeCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  padding: 8px 8px;
  min-height: 38px;
  box-sizing: border-box;
  border-radius: 7px;
  user-select: none;
  transition: all 0.2s ease;

  background: ${(props) => (props.$isDisabled ? "rgba(10, 15, 22, 0.5)" : props.$isSelected ? "rgba(22, 45, 64, 0.98)" : "rgba(18, 24, 35, 0.75)")};
  border: ${(props) => (props.$isDisabled ? "1px dashed rgba(255, 255, 255, 0.1)" : props.$isSelected ? "2px solid #64ffda" : "1px solid rgba(255, 255, 255, 0.12)")};
  border-left: ${(props) => (props.$isDisabled ? "3px solid rgba(148, 163, 184, 0.3)" : props.$isSelected ? "3px solid #64ffda" : `3px solid ${props.$typeColor || "#64ffda"}`)};
  opacity: ${(props) => (props.$isDisabled ? 0.38 : 1)};
  cursor: ${(props) => (props.$isDisabled ? "not-allowed" : "pointer")};
  box-shadow: ${(props) => (props.$isSelected ? "0 0 12px rgba(100, 255, 218, 0.45), inset 0 0 6px rgba(100, 255, 218, 0.15)" : "none")};

  &:hover {
    ${(props) =>
      !props.$isDisabled &&
      `
      transform: translateY(-1px);
      border-color: ${props.$isSelected ? "#64ffda" : "rgba(100, 255, 218, 0.5)"};
      background: ${props.$isSelected ? "rgba(22, 45, 64, 0.98)" : "rgba(25, 38, 54, 0.85)"};
    `}
  }

  &:active {
    ${(props) => !props.$isDisabled && "transform: scale(0.98);"}
  }

  @media (max-width: 480px) {
    padding: 6px 5px;
    gap: 4px;
    min-height: 34px;
  }
`;

const TypeIconImg = styled.img`
  width: 20px;
  height: 20px;
  object-fit: contain;
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 17px;
    height: 17px;
  }
`;

const TypeNameText = styled.span`
  font-size: 0.82rem;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;

  @media (max-width: 480px) {
    font-size: 0.74rem;
  }
`;

const TypeNullBadge = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.08);
  padding: 1px 4px;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
  line-height: 1.2;

  @media (max-width: 480px) {
    font-size: 0.58rem;
    padding: 1px 2px;
  }
`;

const TypeSelectedCheck = styled.span`
  font-size: 0.8rem;
  font-weight: 800;
  color: #64ffda;
  margin-left: auto;
  flex-shrink: 0;
  line-height: 1;
`;
