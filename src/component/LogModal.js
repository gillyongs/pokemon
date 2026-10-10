import React, { useEffect, useRef } from "react";
import styled from "styled-components";

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

// 컨테이너는 스크롤되지 않고, 내부 LogList만 스크롤된다.
const ModalContainer = styled.div`
  background: rgba(15, 20, 28, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 90vw;
  max-width: 450px;
  max-height: 70vh;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  font-size: 1.6rem;
  margin-top: 0;
  margin-bottom: 15px;
  font-weight: bold;
  color: #64ffda;
  text-align: center;
  font-family: "CustomFont", sans-serif;
  letter-spacing: 1px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 15px;
  flex-shrink: 0;
`;

const LogList = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(100, 255, 218, 0.3);
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(100, 255, 218, 0.5);
  }
`;

const TurnIndicator = styled.div`
  text-align: center;
  color: #64ffda;
  font-weight: bold;
  font-size: 1.1rem;
  margin: 20px 0;
  letter-spacing: 1px;
`;

const Item = styled.div`
  padding: 12px 15px;
  margin-bottom: 12px;
  background: rgba(0, 0, 0, 0.5);
  border-left: 4px solid #64ffda;
  border-radius: 4px;
  white-space: pre-wrap;
  color: #fff;
  font-size: 0.95rem;
  line-height: 1.5;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
`;

const CloseButton = styled.button`
  flex-shrink: 0;
  width: 100%;
  margin-top: 15px;
  padding: 12px 0;
  font-size: 1.1rem;
  font-family: "CustomFont", sans-serif;
  font-weight: bold;
  border: 1px solid rgba(100, 255, 218, 0.5);
  border-radius: 8px;
  cursor: pointer;
  background: rgba(100, 255, 218, 0.1);
  color: #64ffda;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(100, 255, 218, 0.25);
    box-shadow: 0 5px 15px rgba(100, 255, 218, 0.2);
  }
`;

export default function LogModal({ log, onClose }) {
  const listRef = useRef(null);

  // 로그를 열 때 항상 맨 아래(가장 최근 로그)로 이동
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, []);

  return (
    <ModalBackground onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Title>로그 보기</Title>

        <LogList ref={listRef}>
          {log.length === 0 ? (
            <Item>로그가 없습니다.</Item>
          ) : (
            log.map((item, index) => 
              item.isTurnLog ? (
                <TurnIndicator key={index}>{item.text}</TurnIndicator>
              ) : (
                <Item key={index}>{item.text}</Item>
              )
            )
          )}
        </LogList>

        <CloseButton onClick={onClose}>닫기</CloseButton>
      </ModalContainer>
    </ModalBackground>
  );
}
