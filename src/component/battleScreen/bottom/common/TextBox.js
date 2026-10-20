import React from "react";
import { useTransition, animated } from "react-spring";
import styled from "styled-components";

// 텍스트박스 텍스트 자연스럽게 넘기는 css
const FadeInComponent = ({ text }) => {
  const transitions = useTransition(text, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { duration: 100 },
  });

  return transitions((styles, item) => (item ? <StyledText style={styles}>{item}</StyledText> : null));
};

const TextBox = ({ text, onClick }) => {
  return (
    <StyledTextBox textLength={getEffectiveTextLength(text)} onClick={onClick}>
      <StyledTextLayer>
        <FadeInComponent className="text" text={text} />
      </StyledTextLayer>
    </StyledTextBox>
  );
};

export default TextBox;

const StyledText = styled(animated.div)`
  position: absolute;
  top: 3.2vh;
  left: 6vw;
`;

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
  cursor: pointer;
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
