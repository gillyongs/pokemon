import React from "react";
import FadeInComponent from "./FadeInComponent";

const TextBox = ({ text }) => {
  return (
    <div className="text-box">
      <div className="text-layer">
        <FadeInComponent className="text" text={text} />
      </div>
    </div>
  );
};

export default TextBox;
