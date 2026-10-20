import React from "react";
import styled from "styled-components";

export const EntrySaveModal = ({ onExport, onClose }) => (
  <ModalOverlay onClick={onClose}>
    <ModalContent onClick={(e) => e.stopPropagation()}>
      <ModalHeader>
        <ModalTitle>샘플 저장</ModalTitle>
        <CloseIcon onClick={onClose}>✕</CloseIcon>
      </ModalHeader>
      <EntryActionList>
        <EntryActionButton onClick={() => onExport("player")}>내 엔트리만 저장</EntryActionButton>
        <EntryActionButton onClick={() => onExport("npc")}>상대 엔트리만 저장</EntryActionButton>
        <EntryActionButton onClick={() => onExport("all")}>전체 엔트리 저장</EntryActionButton>
      </EntryActionList>
    </ModalContent>
  </ModalOverlay>
);

export const EntryLoadModal = ({ onImportSelect, onClose }) => (
  <ModalOverlay onClick={onClose}>
    <ModalContent onClick={(e) => e.stopPropagation()}>
      <ModalHeader>
        <ModalTitle>샘플 불러오기</ModalTitle>
        <CloseIcon onClick={onClose}>✕</CloseIcon>
      </ModalHeader>
      <EntryActionList>
        <EntryActionButton onClick={() => onImportSelect("player")}>내 엔트리 불러오기</EntryActionButton>
        <EntryActionButton onClick={() => onImportSelect("npc")}>상대 엔트리 불러오기</EntryActionButton>
        <EntryActionButton onClick={() => onImportSelect("all")}>전체 엔트리 불러오기</EntryActionButton>
      </EntryActionList>
    </ModalContent>
  </ModalOverlay>
);

export const CustomAlertModal = ({ message, onClose }) => (
  <ModalOverlay onClick={onClose}>
    <ModalContent onClick={(e) => e.stopPropagation()} style={{ width: "280px", textAlign: "center" }}>
      <div style={{ fontSize: "1rem", fontWeight: "bold", color: "#333", margin: "12px 0 20px 0" }}>{message}</div>
      <ConfirmButton onClick={onClose}>확인</ConfirmButton>
    </ModalContent>
  </ModalOverlay>
);

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

const EntryActionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 5px;
`;

const EntryActionButton = styled.button`
  width: 100%;
  padding: 12px 0;
  background-color: #f8f9fa;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: bold;
  font-family: inherit;
  color: #333;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: #e8f5e9;
    border-color: #4caf50;
    color: #2e7d32;
  }
`;

const ConfirmButton = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #43a047;
  }
`;
