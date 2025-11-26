import React, { useState } from "react";
import SkillButton from "./SkillButton"; // 경로에 맞게 수정
import TextBox from "../TextBox";
import SwitchButton from "../SwitchButton";
import FieldButton from "../FieldButton";
import TextButton from "../TextButton";
import LogModal from "../../LogModal";

const BottomSectionSkill = ({ battle, text, setText, setBottom, queueObject, battleStartBySkillButton, textSkip }) => {
  const [logOpen, setLogOpen] = useState(false);
  return (
    // prettier-ignore
    <div className="bottom-section">
      <TextBox text={text} />

      <SkillButton battle={battle} skillNumber={1} queueObject={queueObject} setText = {setText} battleStartBySkillButton = {battleStartBySkillButton} />
      
      <SkillButton battle={battle} skillNumber={2} queueObject={queueObject} setText = {setText} battleStartBySkillButton = {battleStartBySkillButton} />

      <SkillButton battle={battle} skillNumber={3} queueObject={queueObject} setText = {setText} battleStartBySkillButton = {battleStartBySkillButton} />

      <SkillButton battle={battle} skillNumber={4} queueObject={queueObject} setText = {setText} battleStartBySkillButton = {battleStartBySkillButton} />

      <SwitchButton
        onClick={() => {
          if (queueObject.queueCheck()) {
            setText(" 누구로 교체할까?");
            setBottom("switch");
          }
        }}
        innerText={"교체"}
      />

      <FieldButton
        onClick={() => {
          if (queueObject.queueCheck()) {
            setBottom("field");
          }
        }}
      />

      <TextButton
        onClick={(e) => {
          if (queueObject.queueCheck()) {
            setLogOpen(true);
          }else{
            e.stopPropagation();
            textSkip();
          }
        }}
        innerText={queueObject.queueCheck() ? "로그" : "스킵"}
      />

      {logOpen && (
        <LogModal
          log={queueObject.log}
          onClose={() => setLogOpen(false)}
        />
      )}
    </div>
  );
};

export default BottomSectionSkill;
