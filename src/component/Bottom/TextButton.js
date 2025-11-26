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
  text-align: center;
  background-color: rgba(0, 0, 0, 0.7);

  display: flex;
  justify-content: center;
  align-items: center;
`;

const SwitchButton = ({ onClick, innerText }) => {
  return <TextButtonContainer onClick={onClick}>{innerText}</TextButtonContainer>;
};

export default SwitchButton;
