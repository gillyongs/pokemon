import React from "react";
import FadeInComponent from "../FadeInComponent"; // 경로에 맞게 수정
import SkillButton from "./SkillButton"; // 경로에 맞게 수정
import TextBox from "../TextBox";
import ChangeButton from "../ChangeButton";

const BottomSectionSkill = ({ battle, text, setText, setBottom, queueObject, battleStartBySkillButton }) => {
  return (
    // prettier-ignore
    <div className="bottom-section">
      <TextBox text={text} />

      <SkillButton battle={battle} skillNumber={1} queueObject={queueObject} setText = {setText} battleStartBySkillButton = {battleStartBySkillButton} />
      
      <SkillButton battle={battle} skillNumber={2} queueObject={queueObject} setText = {setText} battleStartBySkillButton = {battleStartBySkillButton} />

      <SkillButton battle={battle} skillNumber={3} queueObject={queueObject} setText = {setText} battleStartBySkillButton = {battleStartBySkillButton} />

      <SkillButton battle={battle} skillNumber={4} queueObject={queueObject} setText = {setText} battleStartBySkillButton = {battleStartBySkillButton} />

      <ChangeButton

        onClick={() => {
          if (queueObject.queueCheck()) {
            setText(" 누구로 교체할까?");
            setBottom("switch");
          }
        }}
        innerText={"교체"}
      />
    </div>
  );
};

export default BottomSectionSkill;
