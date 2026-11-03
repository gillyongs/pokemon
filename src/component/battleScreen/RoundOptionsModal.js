import React from "react";
import styled from "styled-components";

const RoundOptionsModal = ({ isOpen, onClose, difficulty = "노말", round = 1, teamOption = "선택" }) => {
  if (!isOpen) return null;

  const multiplier = (1.0 + (round - 1) * 0.1).toFixed(1);

  return (
    <ModalOverlay
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalTitle>현재 게임 옵션</ModalTitle>
        <OptionContent>
          <p>
            <strong>난이도:</strong> {difficulty}
            {difficulty === "노말" && ` (상대 포켓몬 HP 배율 ${multiplier}배)`}
            {difficulty === "하드" && ` (상대 포켓몬 능력치 배율 ${multiplier}배)`}
          </p>
          <p>
            <strong>팀 옵션:</strong> {teamOption}
          </p>
        </OptionContent>
        <ModalButtonContainer>
          <ModalButton
            $primary
            $isWin={true}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            닫기
          </ModalButton>
        </ModalButtonContainer>
      </ModalBox>
    </ModalOverlay>
  );
};

export default RoundOptionsModal;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  backdrop-filter: blur(4px);
`;

const ModalBox = styled.div`
  background: rgba(15, 20, 28, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 20px;
  width: 300px;
  text-align: center;
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.6),
    inset 0 0 20px rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
`;

const ModalTitle = styled.h3`
  color: #fff;
  margin-bottom: 20px;
  margin-top: 0;
  font-family: "CustomFont", sans-serif;
`;

const OptionContent = styled.div`
  color: #ddd;
  text-align: left;
  line-height: 1.8;
  font-size: 1.1rem;

  p {
    margin: 8px 0;
  }
`;

const ModalButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const ModalButton = styled.button`
  flex: 1;
  padding: 12px 0;
  font-size: 1.1rem;
  font-family: "CustomFont", sans-serif;
  border: 1px solid ${(props) => (props.$primary ? (props.$isWin ? "rgba(100, 255, 218, 0.5)" : "rgba(255, 82, 82, 0.5)") : "rgba(255, 255, 255, 0.2)")};
  border-radius: 12px;
  cursor: pointer;
  background: ${(props) => (props.$primary ? (props.$isWin ? "rgba(100, 255, 218, 0.1)" : "rgba(255, 82, 82, 0.1)") : "rgba(255, 255, 255, 0.05)")};
  color: ${(props) => (props.$primary ? (props.$isWin ? "#64ffda" : "#ff5252") : "#e0e0e0")};
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) => (props.$primary ? (props.$isWin ? "rgba(100, 255, 218, 0.25)" : "rgba(255, 82, 82, 0.25)") : "rgba(255, 255, 255, 0.15)")};
    transform: translateY(-2px);
    box-shadow: 0 5px 15px ${(props) => (props.$primary ? (props.$isWin ? "rgba(100, 255, 218, 0.2)" : "rgba(255, 82, 82, 0.2)") : "rgba(0, 0, 0, 0.3)")};
  }

  &:active {
    transform: translateY(0);
  }
`;
