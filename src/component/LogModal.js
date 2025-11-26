import React, { useState, useRef } from "react";
import styled from "styled-components";

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  cursor: pointer;
`;

const ModalContainer = styled.div`
  background-color: rgba(25, 25, 25, 0.6);
  width: 420px;
  max-height: 70vh;
  padding: 20px;
  border-radius: 14px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.35);

  overflow-y: auto;

  /* 부드러운 스크롤 */
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;

  /* 스크롤바 UI 커스텀 */
  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(50, 50, 50, 0.4);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(200, 200, 200, 0.35);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(200, 200, 200, 0.55);
  }

  cursor: pointer;
`;

const Title = styled.div`
  font-size: 20px;
  margin-bottom: 12px;
  font-weight: bold;
  color: #fff;
`;

const Item = styled.div`
  padding: 12px;
  margin-bottom: 10px;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 8px;
  white-space: pre-wrap;
  color: #f1f1f1;
`;

export default function LogModal({ log, onClose }) {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef(null);

  const handleScroll = () => {
    setIsScrolling(true);

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  };

  const handleClick = () => {
    if (!isScrolling) onClose();
  };

  return (
    <ModalBackground onClick={handleClick}>
      <ModalContainer onClick={handleClick} onScroll={handleScroll}>
        <Title>로그 보기</Title>

        {log.length === 0 ? <Item>로그가 없습니다.</Item> : log.map((item, index) => <Item key={index}>{item.text}</Item>)}
      </ModalContainer>
    </ModalBackground>
  );
}
