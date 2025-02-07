import React from "react";
import styled from "styled-components";
import { typeCheckConsole } from "../../../util/typeCheck";
import { battleStart } from "../../../service/battleStart";
import { npcChoice } from "../../../function/npc";

const SkillButton = ({
  battle,
  skillNumber,
  queueObject,
  pokemon,
  setText,
}) => {
  const skill = "sk" + skillNumber;
  const pp = "pp" + skillNumber;
  let sk;
  if (!pokemon) {
    sk = battle.player.origin[skill];
  } else {
    sk = pokemon.origin[skill];
  }
  const sn = getNumberText(skillNumber);

  const handleSkillClick = (skillIndex) => {
    const onlySkill = battle.player.tempStatus.onlySkill;
    if (onlySkill) {
      if (onlySkill !== sk.name) {
        setText("해당 스킬은 사용할 수 없다!");
        return;
      }
    }
    if (queueObject.queueCheck()) {
      battleStart(
        battle,
        skillIndex,
        npcChoice(battle, skillIndex),
        queueObject
      );
    }
  };

  return (
    <SKILL
      className={sn}
      onClick={() => {
        handleSkillClick(skillNumber);
      }}
    >
      <ICON src={`/pokemon/img/type/${sk.type}.svg`} alt={sk.name} />
      <NAME skname={sk.name}>{sk.name}</NAME>
      <EFFECT>
        {typeCheckConsole(sk.type, battle.npc.type1, battle.npc.type2)}
      </EFFECT>
      <PP>
        {battle.player[pp]}/{sk.pp}
      </PP>
    </SKILL>
  );
};

const getNumberText = (value) => {
  switch (value) {
    case 1:
      return "one";
    case 2:
      return "two";
    case 3:
      return "three";
    case 4:
      return "four";
    default:
      return "Invalid value"; // 값이 1~4가 아닌 경우
  }
};

export default SkillButton;

const SKILL = styled.div`
  position: absolute;
  width: 47vw;
  height: 13vh;
  border-radius: 5px;
  background-color: rgba(0, 0, 0, 0.7);

  &.one {
    top: 20vh;
    left: 1vw;
  }
  &.two {
    top: 20vh;
    right: 1vw;
  }
  &.three {
    top: 35vh;
    left: 1vw;
  }
  &.four {
    top: 35vh;
    right: 1vw;
  }
`;

const ICON = styled.img`
  position: absolute;
  width: 30px;
  height: 30px;
  top: 5px;
  left: 5px;
  border-radius: 5px;
`;

const NAME = styled.div`
  position: absolute;
  top: 10px;
  left: 42px;
  font-size: "20px";
  @media (max-width: 400px) {
    font-size: ${({ skname }) => (skname.length > 5 ? "4.3vw" : "20px")};
    top: ${({ skname }) => (skname.length > 5 ? "12px" : "10px")};
  }
`;

const EFFECT = styled.div`
  position: absolute;
  top: 45px;
  left: 7px;
  font-size: 15px;
`;

const PP = styled.div`
  position: absolute;
  bottom: 4px;
  right: 3px;
  font-size: 15px;
  background-color: #665f5f;
  border-radius: 5px;
`;
