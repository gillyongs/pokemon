import React, { useState } from "react";
import styled from "styled-components";
import DebugLogModal from "./DebugLogModal";

const TestingTools = ({ visible, onBack, onSkip, onOpenAugment, isDebugOpen, setIsDebugOpen }) => {
  const [internalDebugOpen, setInternalDebugOpen] = useState(false);
  const isModalOpen = typeof isDebugOpen === "boolean" ? isDebugOpen : internalDebugOpen;
  const setModalOpen = typeof setIsDebugOpen === "function" ? setIsDebugOpen : setInternalDebugOpen;

  if (!visible) return null;

  return (
    <>
      <BottomRightActionContainer>
        <TestAugmentButton
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenAugment) onOpenAugment();
          }}
        >
          증강
        </TestAugmentButton>
        <TestBackButton
          onClick={(e) => {
            e.stopPropagation();
            if (onBack) onBack();
          }}
        >
          취소
        </TestBackButton>
        <TestDebugButton
          onClick={(e) => {
            e.stopPropagation();
            setModalOpen(true);
          }}
        >
          로그
        </TestDebugButton>
        <TestSkipButton
          onClick={(e) => {
            e.stopPropagation();
            if (onSkip) onSkip(e);
          }}
        >
          스킵
        </TestSkipButton>
      </BottomRightActionContainer>
      {isModalOpen && <DebugLogModal onClose={() => setModalOpen(false)} />}
    </>
  );
};

export default TestingTools;

const BottomRightActionContainer = styled.div`
  position: fixed;
  bottom: 10px;
  right: 12px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  z-index: 100;
`;

const BaseTestButton = styled.div`
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  font-size: 13px;
  font-weight: bold;
  color: #fff;
  cursor: pointer;
  user-select: none;
  text-align: center;
  transition: all 0.2s ease;
`;

const TestAugmentButton = styled(BaseTestButton)`
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.88), rgba(5, 150, 105, 0.88));

  &:hover {
    background: linear-gradient(135deg, rgba(52, 211, 153, 0.95), rgba(16, 185, 129, 0.95));
    border-color: rgba(255, 255, 255, 0.6);
    transform: scale(1.04);
  }
`;

const TestBackButton = styled(BaseTestButton)`
  background: linear-gradient(135deg, rgba(71, 85, 105, 0.85), rgba(51, 65, 85, 0.85));

  &:hover {
    background: linear-gradient(135deg, rgba(100, 116, 139, 0.95), rgba(71, 85, 105, 0.95));
    border-color: rgba(255, 255, 255, 0.6);
    transform: scale(1.04);
  }
`;

const TestDebugButton = styled(BaseTestButton)`
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.85), rgba(2, 132, 199, 0.85));

  &:hover {
    background: linear-gradient(135deg, rgba(56, 189, 248, 0.95), rgba(3, 105, 161, 0.95));
    border-color: rgba(255, 255, 255, 0.6);
    transform: scale(1.04);
  }
`;

const TestSkipButton = styled(BaseTestButton)`
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.85), rgba(185, 28, 28, 0.85));

  &:hover {
    background: linear-gradient(135deg, rgba(248, 113, 113, 0.95), rgba(220, 38, 38, 0.95));
    border-color: rgba(255, 255, 255, 0.6);
    transform: scale(1.04);
  }
`;
