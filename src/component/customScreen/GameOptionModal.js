import React from "react";
import styled from "styled-components";

const GameOptionModal = ({ difficulty, setDifficulty, teamOption, setTeamOption, onClose }) => {
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>게임 옵션</ModalTitle>
          <CloseIcon onClick={onClose}>✕</CloseIcon>
        </ModalHeader>
        <ModalSubTitle>난이도</ModalSubTitle>
        <DifficultyContainer>
          {["이지", "노말", "하드"].map((level) => (
            <DifficultyButton key={level} $active={difficulty === level} onClick={() => setDifficulty(level)}>
              {level}
            </DifficultyButton>
          ))}
        </DifficultyContainer>
        <DifficultyDescription>
          {difficulty === "이지" && "기초적인 포켓몬배틀이다."}
          {difficulty === "노말" && "매 라운드마다 적의 체력이 0.1배 증가합니다."}
          {difficulty === "하드" && "매 라운드마다 적의 모든 능력치가 0.1배 증가합니다."}
        </DifficultyDescription>
        <ModalSubTitle style={{ marginTop: "20px" }}>팀 옵션</ModalSubTitle>
        <DifficultyContainer>
          {["랜덤", "고정", "트레이드"].map((opt) => (
            <DifficultyButton key={opt} $active={teamOption === opt} onClick={() => setTeamOption(opt)}>
              {opt}
            </DifficultyButton>
          ))}
        </DifficultyContainer>
        <DifficultyDescription>
          {teamOption === "랜덤" && "매 라운드마다 팀 엔트리가 랜덤하게 바뀝니다."}
          {teamOption === "고정" && "팀 엔트리가 바뀌지 않습니다."}
          {teamOption === "트레이드" && "매 라운드마다 상대 팀 엔트리에서 한명을 교환할 수 있습니다."}
        </DifficultyDescription>
      </ModalContent>
    </ModalOverlay>
  );
};

export default GameOptionModal;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 320px;
  max-width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  margin-right: auto;
`;

const ModalSubTitle = styled.div`
  font-size: 0.95rem;
  font-weight: bold;
  color: #555;
`;

const CloseIcon = styled.div`
  cursor: pointer;
  font-size: 1.2rem;
  color: #aaa;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #666;
  }
`;

const DifficultyContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  margin-bottom: 20px;
`;

const DifficultyButton = styled.div`
  flex: 1;
  text-align: center;
  padding: 10px 0;
  border: 1px solid ${(props) => (props.$active ? "#4caf50" : "#ccc")};
  background-color: ${(props) => (props.$active ? "#4caf50" : "#fff")};
  color: ${(props) => (props.$active ? "#fff" : "#333")};
  border-radius: 6px;
  cursor: pointer;
  font-weight: ${(props) => (props.$active ? "bold" : "normal")};

  &:hover {
    background-color: ${(props) => (props.$active ? "#4caf50" : "#f5f5f5")};
  }
`;

const DifficultyDescription = styled.div`
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 6px;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
`;
