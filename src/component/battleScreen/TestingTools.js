import React, { useState } from "react";
import styled from "styled-components";
import DebugLogModal from "./DebugLogModal";

const TestingTools = ({ visible, onBack, onSkip, isDebugOpen, setIsDebugOpen }) => {
  const [internalDebugOpen, setInternalDebugOpen] = useState(false);
  const isModalOpen = typeof isDebugOpen === "boolean" ? isDebugOpen : internalDebugOpen;
  const setModalOpen = typeof setIsDebugOpen === "function" ? setIsDebugOpen : setInternalDebugOpen;

  if (!visible) return null;

  return (
    <>
      <BottomRightActionContainer>
        <TestBackButton
          onClick={(e) => {
            e.stopPropagation();
            if (onBack) onBack();
          }}
        >
          뒤로가기
        </TestBackButton>
        <TestDebugButton
          onClick={(e) => {
            e.stopPropagation();
            setModalOpen(true);
          }}
        >
          디버깅
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
  bottom: 12px;
  right: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 100;
`;

const TestBackButton = styled.div`
  padding: 6px 14px;
  border-radius: 6px;
  background: linear-gradient(135deg, rgba(71, 85, 105, 0.85), rgba(51, 65, 85, 0.85));
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, rgba(100, 116, 139, 0.95), rgba(71, 85, 105, 0.95));
    border-color: rgba(255, 255, 255, 0.6);
    transform: scale(1.05);
    box-shadow: 0 6px 14px rgba(71, 85, 105, 0.4);
  }
`;

const TestDebugButton = styled.div`
  padding: 6px 14px;
  border-radius: 6px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.85), rgba(2, 132, 199, 0.85));
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, rgba(56, 189, 248, 0.95), rgba(3, 105, 161, 0.95));
    border-color: rgba(255, 255, 255, 0.6);
    transform: scale(1.05);
    box-shadow: 0 6px 14px rgba(14, 165, 233, 0.4);
  }
`;

const TestSkipButton = styled.div`
  padding: 6px 16px;
  border-radius: 6px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.85), rgba(185, 28, 28, 0.85));
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, rgba(248, 113, 113, 0.95), rgba(220, 38, 38, 0.95));
    border-color: rgba(255, 255, 255, 0.6);
    transform: scale(1.05);
    box-shadow: 0 6px 14px rgba(239, 68, 68, 0.4);
  }
`;
