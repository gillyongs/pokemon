import React from "react";
import styled from "styled-components";

const TextButtonContainer = styled.div`
  position: absolute;
  top: 12vh;
  left: 1vw;
  font-size: 20px;
  width: 30vw;
  height: 6vh;
  border-radius: 5px;
  background: ${({ $isLog }) => ($isLog ? "rgba(0, 0, 0, 0.7)" : "linear-gradient(135deg, rgba(20, 30, 40, 0.85), rgba(0, 0, 0, 0.7))")};
  border: ${({ $isLog }) => ($isLog ? "none" : "1px solid rgba(255, 255, 255, 0.1)")};
  box-shadow: ${({ $isLog }) => ($isLog ? "none" : "0 3px 8px rgba(0, 0, 0, 0.35)")};
  box-sizing: border-box;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  ${({ $isLog }) => !$isLog && `
    &:hover {
      border-color: rgba(100, 255, 218, 0.6);
    }
    &:active {
      transform: scale(0.97);
    }
  `}

  display: flex;
  justify-content: center;
  align-items: center;
`;

const SwitchButton = ({ onClick, innerText, isLog }) => {
  return <TextButtonContainer $isLog={isLog} onClick={onClick}>{innerText}</TextButtonContainer>;
};

export default SwitchButton;
