import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { AugmentIcon } from "./AugmentIcon";

const AugmentModal = ({ augments = [], targetPokemon = null, onSelect, onClose }) => {
  const [isPeekMode, setIsPeekMode] = useState(false);

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
    onSelect(aug);
  };

  return (
    <ModalOverlay $isPeek={isPeekMode} onClick={() => setIsPeekMode((prev) => !prev)}>
      <ModalWrapper onClick={(e) => e.stopPropagation()}>
      <ModalContainer $isPeek={isPeekMode} onClick={handleContainerClick}>
        <HeaderArea>
          <HeaderTopRow>
            <Title>
              {targetPokemon ? `${targetPokemon.name}의 증강 선택` : "아수라장 증강 선택"}
            </Title>
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
          <SubTitle>
            {isPeekMode
              ? "클릭하면 다시 증강 선택이 활성화됩니다"
              : "하나의 증강을 선택하여 강화하세요! (바깥 클릭 시 필드 확인)"}
          </SubTitle>
        </HeaderArea>

        <CardContainer>
          {augments.map((aug, index) => (
            <AugmentCard
              key={aug.id || index}
              $isPeek={isPeekMode}
              onClick={(e) => handleCardClick(e, aug)}
            >
              <IconWrapper>
                <AugmentIcon id={aug.id} size={42} />
              </IconWrapper>
              <CardContent>
                <CardTopRow>
                  <CardTitle>{aug.name}</CardTitle>
                  <CostBadge>값 {aug.cost || 1} pt</CostBadge>
                </CardTopRow>
                <CardDescription>{aug.desc}</CardDescription>
              </CardContent>
            </AugmentCard>
          ))}
        </CardContainer>
        </ModalContainer>
        <PeekToggleButton
          $isPeek={isPeekMode}
          onClick={handleTogglePeek}
          title={isPeekMode ? "증강 선택창 선명하게" : "모달 흐리게 (필드 확인)"}
        >
          {isPeekMode ? "👁 선명하게 보기" : "👁 필드 보기 (흐리게)"}
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
  transition: opacity 0.2s ease, border-color 0.2s ease;
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

const SubTitle = styled.div`
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 5px;
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const IconWrapper = styled.div`
  margin-right: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, filter 0.2s ease;
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

const CardTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 3px;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
  word-break: keep-all;
  line-height: 1.3;
`;

const CostBadge = styled.span`
  font-size: 0.72rem;
  font-weight: bold;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.35);
  flex-shrink: 0;
  margin-left: 6px;
`;

const CardDescription = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: #cbd5e1;
  line-height: 1.4;
  word-break: keep-all;
`;
