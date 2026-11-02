import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { AugmentIcon } from "./AugmentIcon";
import { getAugmentDesc } from "../../entity/Augment/AugmentData";
import { getTypeEffectText } from "../../util/typeEffectCalculate";

const AugmentModal = ({ augments = [], targetPokemon = null, battle = null, onSelect, onClose }) => {
  const [isPeekMode, setIsPeekMode] = useState(false);
  const [skillSelectAug, setSkillSelectAug] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  if (!augments || augments.length === 0) return null;

  const handleTogglePeek = (e) => {
    e.stopPropagation();
    setIsPeekMode((prev) => !prev);
  };

  const handleContainerClick = (e) => {
    e.stopPropagation();
    if (isPeekMode) {
      setIsPeekMode(false);
    }
  };

  const handleCardClick = (e, aug) => {
    e.stopPropagation();
    if (isPeekMode) {
      setIsPeekMode(false);
      return;
    }
    if ((aug.id === "danceOfGarchomp" || aug.id === "danceGarchomp") && targetPokemon?.origin?.skill) {
      setSkillSelectAug(aug);
      setSelectedSlot(null);
      return;
    }
    onSelect(aug);
  };

  return (
    <ModalOverlay $isPeek={isPeekMode} onClick={() => setIsPeekMode((prev) => !prev)}>
      <ModalWrapper onClick={(e) => e.stopPropagation()}>
        <ModalContainer $isPeek={isPeekMode} onClick={handleContainerClick}>
          {skillSelectAug ? (
            <>
              <HeaderArea>
                <HeaderTopRow>
                  <Title>교체할 기술 선택</Title>
                  <CloseButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSlot(null);
                      setSkillSelectAug(null);
                    }}
                    title="되돌아가기"
                  >
                    ✕
                  </CloseButton>
                </HeaderTopRow>
                <SubTitleText>용의춤과 교체할 기술을 선택해주세요.</SubTitleText>
              </HeaderArea>

              <SkillGrid>
                {[1, 2, 3, 4].map((slot) => {
                  const sk = targetPokemon?.origin?.skill?.[slot];
                  if (!sk) return null;
                  const currentPp = targetPokemon?.pp?.[slot] ?? sk.pp;
                  const effectText = battle?.npc
                    ? getTypeEffectText(targetPokemon, sk.type, battle.npc.type1, battle.npc.type2, sk.stype, sk.name)
                    : "";
                  const isSelected = selectedSlot === slot;
                  return (
                    <SkillCard
                      key={slot}
                      $isSelected={isSelected}
                      $isPeek={isPeekMode}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isPeekMode) {
                          setIsPeekMode(false);
                          return;
                        }
                        setSelectedSlot(slot);
                      }}
                    >
                      <SkillTopRow>
                        <SkillTypeIcon
                          src={`/pokemon/img/type/${sk.type}.svg`}
                          alt={sk.type}
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
                <ActionButton
                  type="button"
                  $variant="back"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSlot(null);
                    setSkillSelectAug(null);
                  }}
                >
                  되돌아가기
                </ActionButton>
                <ActionButton
                  type="button"
                  $variant="confirm"
                  disabled={!selectedSlot}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!selectedSlot) return;
                    onSelect(skillSelectAug, { replaceSlot: selectedSlot });
                  }}
                >
                  교체
                </ActionButton>
              </ButtonGroup>
            </>
          ) : (
            <>
              <HeaderArea>
                <HeaderTopRow>
                  <Title>{targetPokemon ? `증강 선택 (${targetPokemon.name})` : "아수라장 증강 선택"}</Title>
                  {onClose && (
                    <CloseButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                      }}
                      title="선택하지 않고 닫기"
                    >
                      ✕
                    </CloseButton>
                  )}
                </HeaderTopRow>
              </HeaderArea>

              <CardContainer>
                {augments.map((aug, index) => (
                  <AugmentCard key={aug.id || index} $isPeek={isPeekMode} onClick={(e) => handleCardClick(e, aug)}>
                    <IconCol>
                      <IconWrapper>
                        <AugmentIcon id={aug.id} size={38} pokemon={targetPokemon} />
                      </IconWrapper>
                      {aug.cost !== "-" && aug.cost !== undefined && <CostBadge>{aug.cost ?? 1} cost</CostBadge>}
                    </IconCol>
                    <CardContent>
                      <CardTitle>{aug.name}</CardTitle>
                      <CardDescription>{getAugmentDesc(aug, targetPokemon)}</CardDescription>
                    </CardContent>
                  </AugmentCard>
                ))}
              </CardContainer>
            </>
          )}
        </ModalContainer>
        <PeekToggleButton $isPeek={isPeekMode} onClick={handleTogglePeek} title={isPeekMode ? "증강 선택창 선명하게" : "모달 흐리게 (필드 확인)"}>
          {isPeekMode ? "선명하게 보기" : "필드 보기 (흐리게)"}
        </PeekToggleButton>
      </ModalWrapper>
    </ModalOverlay>
  );
};

export default AugmentModal;

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
  background-color: ${(props) => (props.$isPeek ? "rgba(0, 0, 0, 0.05)" : "rgba(0, 0, 0, 0.6)")};
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  animation: ${fadeIn} 0.2s ease-out;
  padding: 16px;
  box-sizing: border-box;
  transition: background-color 0.2s ease;
  cursor: ${(props) => (props.$isPeek ? "default" : "pointer")};
`;

const ModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 430px;
  gap: 12px;
  position: relative;
  z-index: 10001;
`;

const PeekToggleButton = styled.button`
  background: ${(props) => (props.$isPeek ? "rgba(15, 20, 28, 0.95)" : "rgba(15, 20, 28, 0.9)")};
  border: 1px solid ${(props) => (props.$isPeek ? "#64ffda" : "rgba(255, 255, 255, 0.25)")};
  border-radius: 20px;
  color: ${(props) => (props.$isPeek ? "#64ffda" : "#cbd5e1")};
  font-size: 0.85rem;
  font-weight: 600;
  padding: 8px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.7);
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    background: rgba(25, 35, 50, 0.98);
    border-color: #64ffda;
    color: #64ffda;
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(100, 255, 218, 0.25);
  }

  &:active {
    transform: translateY(1px);
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
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  opacity: ${(props) => (props.$isPeek ? 0.15 : 1)};
  transition:
    opacity 0.2s ease,
    border-color 0.2s ease;
  cursor: ${(props) => (props.$isPeek ? "pointer" : "default")};

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
  margin-bottom: 14px;
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
  flex: 1;
`;

const CloseButton = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-left: 8px;

  &:hover {
    color: #fff;
    background: rgba(239, 68, 68, 0.6);
    border-color: rgba(239, 68, 68, 0.8);
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const IconCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  flex-shrink: 0;
  gap: 4px;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.2s ease,
    filter 0.2s ease;
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
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:hover {
    transform: ${(props) => (props.$isPeek ? "none" : "translateY(-2px)")};
    border-color: rgba(100, 255, 218, 0.5);
    border-left: 4px solid #64ffda;
    background: rgba(20, 30, 44, 0.75);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);

    ${IconWrapper} {
      transform: ${(props) => (props.$isPeek ? "none" : "scale(1.05)")};
      filter: drop-shadow(0 0 6px rgba(100, 255, 218, 0.4));
    }
  }

  &:active {
    transform: scale(0.98);
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
`;

const CostBadge = styled.span`
  font-size: 0.68rem;
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(100, 255, 218, 0.08);
  color: #64ffda;
  border: 1px solid rgba(100, 255, 218, 0.25);
  white-space: nowrap;
`;

const CardDescription = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: #cbd5e1;
  line-height: 1.4;
  word-break: keep-all;
`;

const SubTitleText = styled.p`
  margin: 6px 0 0 0;
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.4;
  word-break: keep-all;
`;

const SkillGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  margin-top: 4px;
`;

const SkillCard = styled.div`
  position: relative;
  background: ${(props) => (props.$isSelected ? "rgba(18, 38, 54, 0.95)" : "rgba(0, 0, 0, 0.6)")};
  border: ${(props) => (props.$isSelected ? "2px solid #64ffda" : "1px solid rgba(255, 255, 255, 0.15)")};
  border-radius: 8px;
  padding: 10px 10px 28px 10px;
  min-height: 84px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  cursor: pointer;
  box-sizing: border-box;
  user-select: none;
  transition: all 0.2s ease;
  box-shadow: ${(props) =>
    props.$isSelected
      ? "0 0 14px rgba(100, 255, 218, 0.45), inset 0 0 8px rgba(100, 255, 218, 0.15)"
      : "0 2px 8px rgba(0, 0, 0, 0.4)"};

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
  gap: 8px;
  width: 100%;
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
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.3px;
`;

const SkillEffectText = styled.div`
  font-size: 0.78rem;
  font-weight: 600;
  color: #f1f5f9;
  margin-top: 6px;
  min-height: 18px;
  line-height: 1.2;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
`;

const SkillPP = styled.div`
  position: absolute;
  bottom: 6px;
  right: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #ffffff;
  background-color: #555050;
  border-radius: 4px;
  padding: 1px 5px;
  letter-spacing: 0.5px;
  line-height: 1.3;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
`;

const ButtonGroup = styled.div`
  display: flex;
  width: 100%;
  gap: 10px;
  margin-top: 14px;
  box-sizing: border-box;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 10px 0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  transition: all 0.2s ease;
  user-select: none;

  ${(props) =>
    props.$variant === "back"
      ? `
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #cbd5e1;
    cursor: pointer;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.35);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(1px);
    }
  `
      : `
    background: ${
      props.disabled
        ? "rgba(255, 255, 255, 0.05)"
        : "linear-gradient(135deg, #0d9488, #0284c7)"
    };
    border: ${
      props.disabled
        ? "1px solid rgba(255, 255, 255, 0.1)"
        : "1px solid #64ffda"
    };
    color: ${props.disabled ? "#64748b" : "#ffffff"};
    cursor: ${props.disabled ? "not-allowed" : "pointer"};
    box-shadow: ${
      props.disabled ? "none" : "0 0 12px rgba(100, 255, 218, 0.35)"
    };

    &:hover {
      ${
        !props.disabled &&
        `
        background: linear-gradient(135deg, #14b8a6, #0284c7);
        box-shadow: 0 0 16px rgba(100, 255, 218, 0.55);
        transform: translateY(-1px);
      `
      }
    }

    &:active {
      ${!props.disabled && `transform: translateY(1px);`}
    }
  `}
`;
