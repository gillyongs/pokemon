import React from "react";
import styled from "styled-components";

const FieldButtonContainer = styled.div`
  position: absolute;
  top: 12vh;
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
  width: 30vw;
  height: 6vh;
  border-radius: 5px;
  background: linear-gradient(135deg, rgba(20, 30, 40, 0.85), rgba(0, 0, 0, 0.7));
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  user-select: none;

  &:hover {
    border-color: rgba(100, 255, 218, 0.6);
  }
  &:active {
    transform: translateX(-50%) scale(0.97);
  }

  display: flex;
  justify-content: center;
  align-items: center;
`;

const FieldButton = ({ onClick, innerText = "필드" }) => {
  return <FieldButtonContainer onClick={onClick}>{innerText}</FieldButtonContainer>;
};

export default FieldButton;
