// 배틀 중 포켓몬 기술 사용 화면

import React, { useState } from "react";
import SkillButton from "./SkillButton"; // 경로에 맞게 수정
import TextBox from "../common/TextBox";
import SwitchButton from "../common/SwitchButton";
import LogButton from "../common/LogButton";
import LogModal from "../../LogModal";

import styled from "styled-components";

const isSkillUsable = (player, skillIndex) => {
  const skill = player?.origin?.skill?.[skillIndex];
  const pp = player?.pp?.[skillIndex];
  if (!skill) return false;
  if (pp <= 0) return false;

  const { onlySkill } = player.tempStatus || {};
  const hasUnbound = player.hasAugment?.("unboundChoice");
  const isChoiceLocked = Boolean(player.item?.startsWith("구애") && !hasUnbound);
  const isGorillaLocked = Boolean(player.abil === "무아지경" && !hasUnbound);
  if (onlySkill && (isChoiceLocked || isGorillaLocked) && onlySkill !== skill.name) {
    return false;
  }

  const recentSkill = player.tempStatus?.recentSkillUse?.name;
  if (recentSkill === skill.name && skill.feature?.noDouble) {
    return false;
  }

  if (player.item === "돌격조끼" && (skill.stype === "natk" || skill.stype === "buf")) {
    return false;
  }

  if (player.tempStatus?.taunt !== null && (skill.stype === "natk" || skill.stype === "buf")) {
    return false;
  }

  if (player.tempStatus?.noSound !== null && skill.feature?.sound) {
    return false;
  }

  if (player.tempStatus?.disable && player.tempStatus.disable === skill.name) {
    return false;
  }

  return true;
};

const BottomSectionSkill = ({ battle, text, setText, setBottom, queueObject, battleStartBySkillButton, textSkip, btObj }) => {
  const [logOpen, setLogOpen] = useState(false);
  const [useMega, setUseMega] = useState(false);

  const isMegaEvolveAble = battle.player.isMegaEvolveAble?.(battle);
  const isAllSkillsDisabled = ![1, 2, 3, 4].some((num) => isSkillUsable(battle.player, num));

  return (
    // prettier-ignore
    <div className="bottom-section">
      <TextBox
        text={text}
        onClick={(e) => {
          if (queueObject.queue.length > 0) {
            if (queueObject.queue[0]?.autoActTurn) return;
            if (queueObject.queue[0]?.allowAct) {
              queueObject.dequeue();
            }
          }
          const curBattle = btObj || battle;
          if (!curBattle.player.auto && !curBattle.player.charge && !curBattle.player.recharge) {
            setText?.(curBattle.player.origin.names + " 무엇을 할까?");
          }
        }}
      />

      <SkillButton battle={battle} skillNumber={1} queueObject={queueObject} setText={setText} battleStartBySkillButton={battleStartBySkillButton} />
      
      <SkillButton battle={battle} skillNumber={2} queueObject={queueObject} setText={setText} battleStartBySkillButton={battleStartBySkillButton} />

      <SkillButton battle={battle} skillNumber={3} queueObject={queueObject} setText={setText} battleStartBySkillButton={battleStartBySkillButton} />

      <SkillButton battle={battle} skillNumber={4} queueObject={queueObject} setText={setText} battleStartBySkillButton={battleStartBySkillButton} />

      {isAllSkillsDisabled && (
        <StruggleButton
          $disabled={!queueObject.queueCheck()}
          onClick={(e) => {
            e.stopPropagation();
            if (queueObject.queue.length > 0) {
              if (battle.turn.textFreeze) return;
              queueObject.dequeue();
            }
            if (!queueObject.queueCheck()) return;
            battleStartBySkillButton(5);
          }}>
          <span>발버둥</span>
        </StruggleButton>
      )}

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

      {/* <FieldButton
        onClick={() => {
          if (queueObject.queueCheck()) {
            setBottom("field");
          }
        }}
      /> */}

      <LogButton
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

const StruggleButton = styled.div`
  position: absolute;
  top: 34vh;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24vw;
  height: 7vh;
  border-radius: 5px;
  background: linear-gradient(135deg, rgba(160, 35, 35, 0.92), rgba(70, 15, 15, 0.92));
  border: 2px solid rgba(255, 110, 110, 0.85);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  cursor: ${({ $disabled }) => ($disabled ? "default" : "pointer")};
  z-index: 10;
  user-select: none;
  box-sizing: border-box;
  transition: all 0.15s ease;

  ${({ $disabled }) =>
    !$disabled &&
    `
    &:hover {
      border-color: #ff9999;
    }
    &:active {
      transform: translate(-50%, -50%) scale(0.96);
    }
  `}

  @media (max-width: 400px) {
    font-size: 15px;
  }
`;

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
