import React from "react";
import { useTransition, animated } from "react-spring";

const FadeInComponent = ({ text }) => {
  const transitions = useTransition(text, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { duration: 100 },
  });

  return transitions((styles, item) =>
    item ? (
      <animated.div style={styles} className="text">
        {item}
      </animated.div>
    ) : null
  );
};

export default FadeInComponent;
