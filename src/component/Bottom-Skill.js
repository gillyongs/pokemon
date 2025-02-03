import React from "react";
import FadeInComponent from "./FadeInComponent"; // 경로에 맞게 수정
import SkillButton from "./SkillButton"; // 경로에 맞게 수정
import TextBox from "./TextBox";

const BottomSectionSkill = ({
  battle,
  text,
  handleSkillClick,
  setBottom,
  queueCheck,
}) => {
  return (
    <div className="bottom-section">
      <TextBox text={text} />

      <SkillButton
        battle={battle}
        skillNumber={1}
        onClick={() => handleSkillClick(1)}
      />

      <SkillButton
        battle={battle}
        skillNumber={2}
        onClick={() => handleSkillClick(2)}
      />

      <SkillButton
        battle={battle}
        skillNumber={3}
        onClick={() => handleSkillClick(3)}
      />

      <SkillButton
        battle={battle}
        skillNumber={4}
        onClick={() => handleSkillClick(4)}
      />

      <div
        className="change"
        onClick={() => {
          if (queueCheck()) {
            setBottom("switch");
          }
        }}
      >
        교체
      </div>
    </div>
  );
};

export default BottomSectionSkill;
