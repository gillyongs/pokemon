import React, { useState } from "react";
import styled from "styled-components";

const DEFAULT_DESCRIPTION = "게임의 난이도 및 옵션을 설정할 수 있습니다.";

const OPTION_DESCRIPTIONS = {
  이지: "기본적인 포켓몬 배틀입니다",
  노말: "매 라운드마다 적의 체력이 0.1배 증가합니다.",
  하드: "매 라운드마다 적의 모든 능력치가 0.1배 증가합니다.",
  랜덤: "매 라운드마다 팀 엔트리가 랜덤하게 바뀝니다.",
  고정: "팀 엔트리가 바뀌지 않습니다.",
  트레이드: "매 라운드마다 상대 팀 엔트리에서 한명을 교환할 수 있습니다.",
  아수라장: `배틀 시작시 랜덤한 증강을 선택할 수 있습니다. 
  상대 포켓몬을 쓰러뜨리면 증강을 하나 더 얻습니다. 
  다음 라운드로 넘어갈때 하나의 증강을 가져갈 수 있습니다.`,
};

const GameOptionModal = ({ difficulty, setDifficulty, teamOption, setTeamOption, mayhemMode, setMayhemMode, onClose }) => {
  const [description, setDescription] = useState(DEFAULT_DESCRIPTION);

  const handleDifficultySelect = (level) => {
    setDifficulty(level);
    setDescription(OPTION_DESCRIPTIONS[level] || DEFAULT_DESCRIPTION);
  };

  const handleTeamOptionSelect = (opt) => {
    setTeamOption(opt);
    setDescription(OPTION_DESCRIPTIONS[opt] || DEFAULT_DESCRIPTION);
  };

  const handleMayhemSelect = (value) => {
    setMayhemMode?.(value);
    setDescription(value ? OPTION_DESCRIPTIONS.아수라장 : OPTION_DESCRIPTIONS.이지);
  };

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
            <DifficultyButton key={level} $active={difficulty === level} onClick={() => handleDifficultySelect(level)}>
              {level}
            </DifficultyButton>
          ))}
        </DifficultyContainer>

        <ModalSubTitle>팀 옵션</ModalSubTitle>
        <DifficultyContainer>
          {["랜덤", "고정", "트레이드"].map((opt) => (
            <DifficultyButton key={opt} $active={teamOption === opt} onClick={() => handleTeamOptionSelect(opt)}>
              {opt}
            </DifficultyButton>
          ))}
        </DifficultyContainer>

        <ModalSubTitle>아수라장 모드</ModalSubTitle>
        <DifficultyContainer>
          {[
            { label: "OFF", value: false },
            { label: "ON", value: true },
          ].map((item) => (
            <DifficultyButton key={item.label} $active={Boolean(mayhemMode) === item.value} onClick={() => handleMayhemSelect(item.value)}>
              {item.label}
            </DifficultyButton>
          ))}
        </DifficultyContainer>

        <OptionDescription>{description}</OptionDescription>
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
  margin-top: 8px;
  margin-bottom: 16px;
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

const OptionDescription = styled.div`
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 6px;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  min-height: 48px;
  display: flex;
  align-items: center;
  word-break: keep-all;
`;
