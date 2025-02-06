import React from "react";
import styled from "styled-components";
import FadeInComponent from "./FadeInComponent";

const TextBox = ({ text }) => {
  return (
    <StyledTextBox textLength={getEffectiveTextLength(text)}>
      <StyledTextLayer>
        <FadeInComponent className="text" text={text} />
      </StyledTextLayer>
    </StyledTextBox>
  );
};

export default TextBox;

const StyledTextBox = styled.div`
  position: absolute;
  height: 10vh;
  width: 100vw;
  top: 0px;
  left: 0px;
  background-image: url("/pokemon/img/background/text.png");
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-color: rgba(0, 0, 0, 0.5);
  font-size: ${(props) => (props.textLength >= 35 ? "4vw" : "4.8vw")};

  @media (min-width: 500px) {
    font-size: ${(props) =>
      props.textLength >= 35 ? "22px" : "25px"}; /* 최대 크기 조정 */
  }
`;

const StyledTextLayer = styled.div`
  position: absolute;
  height: 5vh;
  width: 94vw;
  top: -7px;
`;

const getEffectiveTextLength = (text) => {
  return text.replace(/[ .!,/]/g, "").length;
};
