import React, { useState } from "react";
import SkillButton from "./SkillButton"; // 경로에 맞게 수정
import TextBox from "../TextBox";
import SwitchButton from "../SwitchButton";
import FieldButton from "../FieldButton";
import TextButton from "../TextButton";
import LogModal from "../../LogModal";

import styled from "styled-components";

const BottomSectionSkill = ({ battle, text, setText, setBottom, queueObject, battleStartBySkillButton, textSkip, btObj }) => {
  const [logOpen, setLogOpen] = useState(false);
  const [useMega, setUseMega] = useState(false);

  const isMegaEvolveAble = battle.player.isMegaEvolveAble?.(battle);

  return (
    // prettier-ignore
    <div className="bottom-section">
      <TextBox text={text} />

      <SkillButton battle={battle} skillNumber={1} queueObject={queueObject} setText={setText} battleStartBySkillButton={battleStartBySkillButton} />
      
      <SkillButton battle={battle} skillNumber={2} queueObject={queueObject} setText={setText} battleStartBySkillButton={battleStartBySkillButton} />

      <SkillButton battle={battle} skillNumber={3} queueObject={queueObject} setText={setText} battleStartBySkillButton={battleStartBySkillButton} />

      <SkillButton battle={battle} skillNumber={4} queueObject={queueObject} setText={setText} battleStartBySkillButton={battleStartBySkillButton} />

      {isMegaEvolveAble && (
        <MegaButton
          $active={useMega}
          $disabled={!queueObject.queueCheck()}
          onClick={(e) => {
            if (!queueObject.queueCheck()) return;
            e.stopPropagation();
            const nextVal = !useMega;
            setUseMega(nextVal);
            if (btObj?.megaTrigger) {
              btObj.megaTrigger.player = nextVal;
            } else if (battle?.megaTrigger && !Object.isFrozen(battle.megaTrigger)) {
              battle.megaTrigger.player = nextVal;
            }
          }}>
          <MegaIcon src="/pokemon/img/background/mega.webp" alt="mega" />
          <span>메가진화</span>
        </MegaButton>
      )}

      <SwitchButton
        disabled={!queueObject.queueCheck()}
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
        isLog={queueObject.queueCheck()}
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

const MegaButton = styled.div`
  position: absolute;
  top: 49.5vh;
  left: 50%;
  transform: translateX(-50%);
  width: 30vw;
  height: 6vh;
  border-radius: 5px;
  background: ${({ $active }) => ($active ? "linear-gradient(135deg, #ff007f, #7928ca, #0070f3)" : "linear-gradient(135deg, rgba(20, 30, 40, 0.85), rgba(0, 0, 0, 0.7))")};
  border: ${({ $active }) => ($active ? "2px solid #00f0ff" : "1px solid rgba(255, 255, 255, 0.1)")};
  box-shadow: ${({ $active }) => ($active ? "0 0 12px rgba(0, 240, 255, 0.7), 0 0 20px rgba(255, 0, 128, 0.5)" : "0 3px 8px rgba(0, 0, 0, 0.35)")};
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  cursor: ${({ $disabled }) => ($disabled ? "default" : "pointer")};
  z-index: 10;
  user-select: none;
  box-sizing: border-box;
  transition: all 0.2s ease;

  ${({ $disabled, $active }) =>
    !$disabled &&
    `
    &:hover {
      ${!$active ? "border-color: rgba(100, 255, 218, 0.6);" : ""}
    }
    &:active {
      transform: translateX(-50%) scale(0.97);
    }
  `}

  @media (max-width: 400px) {
    font-size: 14px;
  }
`;

const MegaIcon = styled.img`
  width: 20px;
  height: 20px;
  object-fit: contain;
  margin-left: -10px;
  margin-right: 8px;

  @media (max-width: 400px) {
    width: 17px;
    height: 17px;
    margin-left: -10px;
    margin-right: 8 10px;
  }
`;
