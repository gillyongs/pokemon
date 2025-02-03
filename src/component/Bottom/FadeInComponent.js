import React from "react";
import { useTransition, animated } from "react-spring";
import styled from "styled-components";

const FadeInComponent = ({ text }) => {
  const transitions = useTransition(text, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { duration: 100 },
  });

  return transitions((styles, item) =>
    item ? <StyledText style={styles}>{item}</StyledText> : null
  );
};

export default FadeInComponent;

const StyledText = styled(animated.div)`
  position: absolute;
  top: 3.2vh;
  left: 6vw;
`;
