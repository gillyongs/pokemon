import React from "react";
import styled from "styled-components";

const GameResultModal = ({ gameResult, onMainMenu, onNextRound }) => {
  if (!gameResult) return null;

  const isWin = gameResult === "win";

  return (
    <ModalOverlay>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalTitle $isWin={isWin}>{isWin ? "승리!" : "패배..."}</ModalTitle>
        <ModalButtonContainer>
          <ModalButton
            onClick={(e) => {
              e.stopPropagation();
              onMainMenu();
            }}
          >
            메인으로
          </ModalButton>
          {isWin && (
            <ModalButton
              $primary
              $isWin={true}
              onClick={(e) => {
                e.stopPropagation();
                onNextRound();
              }}
            >
              다음 라운드
            </ModalButton>
          )}
        </ModalButtonContainer>
      </ModalBox>
    </ModalOverlay>
  );
};

export default GameResultModal;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalBox = styled.div`
  background: rgba(15, 20, 28, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 45px 40px;
  text-align: center;
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.6),
    inset 0 0 20px rgba(255, 255, 255, 0.05);
  animation: fadeInScale 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  min-width: 320px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);

  @keyframes fadeInScale {
    0% {
      transform: scale(0.95);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const ModalTitle = styled.h2`
  font-size: 3.2rem;
  color: ${(props) => (props.$isWin ? "#64ffda" : "#ff5252")};
  margin-top: 0;
  margin-bottom: 35px;
  font-family: "CustomFont", sans-serif;
  text-shadow: 0 0 15px ${(props) => (props.$isWin ? "rgba(100, 255, 218, 0.5)" : "rgba(255, 82, 82, 0.5)")};
  letter-spacing: 2px;
`;

const ModalButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 15px;
`;

const ModalButton = styled.button`
  flex: 1;
  padding: 16px 0;
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
