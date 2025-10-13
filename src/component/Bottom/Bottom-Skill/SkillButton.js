import React from "react";
import styled from "styled-components";
import { typeCheckConsole } from "../../../util/typeCheck";
import { battleStart } from "../../../service/battleStart";
import { npcChoice } from "../../../function/npc";

const SkillButton = ({ battle, skillNumber, queueObject, pokemon, setText }) => {
  const skill = "sk" + skillNumber;
  const pp = "pp" + skillNumber;
  let sk;
  if (!pokemon) {
    sk = battle.player.origin[skill];
  } else {
    sk = pokemon.origin[skill];
  }
  const sn = getNumberText(skillNumber);

  const handleDequeue = () => {
    if (queueObject.queue.length > 0) {
      if (battle.turn.textFreeze) {
        return;
      }
      queueObject.dequeue();
    }
  };

  const handleSkillClick = (skillIndex) => {
    handleDequeue();
    //dequeue를 한 다음에 스킬 버튼 실행해야하는데
    //dequeue를 전체로 박아놨더니 스킬버튼 실행 후 dequeue해서 에러 발생
    //stopPropagation 해놓고 dequeue를 추가로 앞에 넣음
    if (queueObject.queueCheck()) {
      const onlySkill = battle.player.tempStatus.onlySkill;
      // 스카프 등으로 사용 가능한 스킬이 고정된 경우
      if (onlySkill && battle.player.item && battle.player.item.startsWith("구애")) {
        if (onlySkill !== sk.name) {
          if (battle.player.auto) {
            return;
            //enqueue하기떄문에 역린중에 다른 스킬 누르면 끊김
          }
          queueObject.enqueue({ battle, text: "아이템 효과로 인해 해당 스킬은 사용할 수 없다!", skip: true });
          setText("해당 스킬은 사용할 수 없다!");
          return;
        }
      }
      const doubleSkill = battle.player.tempStatus.recentSkillUse?.name;
      // 두번 연속 사용 불가 스킬 (블러드문)
      if (doubleSkill) {
        if (doubleSkill === sk.name && sk.name === "블러드문") {
          if (battle.player.auto) {
            return;
          }
          queueObject.enqueue({ battle, text: "해당 스킬은 연속으로 사용할 수 없다!", skip: true });
          return;
        }
      }

      if (battle.player.tempStatus.taunt !== null) {
        if (sk.stype === "natk" || sk.stype === "buf") {
          queueObject.enqueue({ battle, text: "도발 때문에 해당 스킬은 사용할 수 없다!", skip: true });
          return;
        }
      }

      battleStart(battle, skillIndex, npcChoice(battle, skillIndex), queueObject);
    }
  };

  return (
    <SKILL
      className={sn}
      onClick={(e) => {
        e.stopPropagation(); // ✅ 상위 onClick(handleDequeue)으로 이벤트 전파 방지
        handleSkillClick(skillNumber);
      }}>
      <ICON src={`/pokemon/img/type/${sk.type}.svg`} alt={sk.name} />
      <NAME skname={sk.name}>{sk.name}</NAME>
      <EFFECT>{typeCheckConsole(sk.type, battle.npc.type1, battle.npc.type2, sk.stype)}</EFFECT>
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
