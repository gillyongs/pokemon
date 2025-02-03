import React from "react";
import styled from "styled-components";

const ChangeButtonContainer = styled.div`
  position: absolute;
  top: 12vh;
  right: 1vw;
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

const ChangeButton = ({ onClick, innerText }) => {
  return (
    <ChangeButtonContainer onClick={onClick}>{innerText}</ChangeButtonContainer>
  );
};

export default ChangeButton;
