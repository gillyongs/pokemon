import React from "react";
import styled, { keyframes } from "styled-components";
import { AugmentIcon } from "./AugmentIcon";

const AugmentModal = ({ augments = [], onSelect }) => {
  if (!augments || augments.length === 0) return null;

  return (
    <ModalOverlay>
      <ModalContainer>
        <HeaderArea>
          <Title>아수라장 증강 선택</Title>
        </HeaderArea>

        <CardContainer>
          {augments.map((aug, index) => (
            <AugmentCard key={aug.id || index} onClick={() => onSelect(aug)}>
              <IconWrapper>
                <AugmentIcon id={aug.id} size={44} />
              </IconWrapper>
              <CardContent>
                <CardTitle>{aug.name}</CardTitle>
                <CardDescription>{aug.desc}</CardDescription>
              </CardContent>
            </AugmentCard>
          ))}
        </CardContainer>
      </ModalContainer>
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
  background-color: rgba(15, 15, 25, 0.85);
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
  background: linear-gradient(135deg, #1f1b2e 0%, #161224 100%);
  border: 1.5px solid #5a4a78;
  border-radius: 16px;
  padding: 18px 16px;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #ff416c, #8a2387, #e066ff, #ff4b2b);
  }
`;

const HeaderArea = styled.div`
  text-align: center;
  margin-bottom: 14px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.5px;
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
  background: linear-gradient(90deg, #2a223f 0%, #1e1730 100%);
  border: 1.2px solid #4a3e68;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:hover {
    transform: translateY(-2px);
    border-color: #ff66aa;
    background: linear-gradient(90deg, #372c54 0%, #251c3d 100%);
    box-shadow: 0 4px 14px rgba(255, 102, 170, 0.25);

    ${IconWrapper} {
      transform: scale(1.08);
      filter: drop-shadow(0 0 8px rgba(232, 121, 249, 0.6));
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
  margin: 0 0 3px 0;
  font-size: 0.96rem;
  font-weight: 700;
  color: #ffffff;
  word-break: keep-all;
  line-height: 1.3;
`;

const CardDescription = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: #c9c3dc;
  line-height: 1.35;
  word-break: keep-all;
`;
