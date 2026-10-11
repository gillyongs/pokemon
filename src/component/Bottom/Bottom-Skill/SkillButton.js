import { useRef } from "react";
import styled from "styled-components";
import { getTypeEffectText } from "../../../util/typeEffectCalculate";

const SkillButton = ({ battle, skillNumber, queueObject, setText, battleStartBySkillButton }) => {
  let pp = battle.player.pp[skillNumber];
  let skill = battle.player.origin.skill[skillNumber];

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

    const player = battle.player;
    const skill = player.origin.skill[skillIndex]; // 실제 스킬 정보
    let pp = battle.player.pp[skillIndex];
    if (!queueObject.queueCheck()) return;

    const reject = (message) => {
      if (!player.auto && !player.charge) {
        //enqueue하기떄문에 역린중에 다른 스킬 누르면 끊김
        queueObject.enqueue({ battle, text: message, skip: true, noLog: true });
        setText?.(message);
      }
      return true;
    };

    // ① PP 소진
    if (pp <= 0) return reject("해당 스킬은 더 이상 사용할 수 없다!");

    // 구애 시리즈로 인해 사용 가능한 스킬이 고정된 경우
    const { onlySkill } = player.tempStatus;
    if (onlySkill && player.item?.startsWith("구애") && onlySkill !== skill.name) {
      return reject(player.item + " 효과로 인해 해당 스킬은 사용할 수 없다!");
    }

    // 연속 사용 불가 스킬 (ex: 블러드문)
    const recentSkill = player.tempStatus.recentSkillUse?.name;
    if (recentSkill === skill.name && skill.feature?.noDouble) {
      return reject("해당 기술은 연속으로 사용할 수 없다!");
    }

    // 돌조 입고 변화기 사용
    if (player.item === "돌격조끼" && (skill.stype === "natk" || skill.stype === "buf")) {
      return reject(player.names + " 돌격조끼 때문에 변화기를 사용할 수 없다!");
    }

    // 도발 상태에서 변화기 사용
    if (player.tempStatus.taunt !== null && (skill.stype === "natk" || skill.stype === "buf")) {
      return reject(player.names + " 도발 때문에 변화기를 사용할 수 없다!");
    }

    // 소리기술금지 상태에서 소리 기술 사용
    if (player.tempStatus.noSound !== null && skill.feature?.sound) {
      return reject(player.names + " 한동안 소리 기술을 사용할 수 없다!");
    }

    // 모든 조건 통과 시 전투 시작
    battleStartBySkillButton(skillIndex);
    // battleStart(battle, skillIndex, npcChoice(battle, skillIndex), queueObject);
  };

  // 꾹 누르기: "~는 무엇을 할까?" 상태(큐가 비어있음)에서만 기술 설명을 보여준다. (로그에는 남지 않음)
  const pressTimer = useRef(null);
  const longPressed = useRef(false);

  const clearPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handlePressStart = () => {
    longPressed.current = false;
    clearPress();
    pressTimer.current = setTimeout(() => {
      if (queueObject.queue.length === 0) {
        longPressed.current = true;
        setText?.(skill.text);
      }
    }, 500);
  };

  return (
    <SKILL
      className={sn}
      $disabled={!queueObject.queueCheck()}
      onPointerDown={handlePressStart}
      onPointerUp={clearPress}
      onPointerLeave={clearPress}
      onPointerCancel={clearPress}
      onContextMenu={(e) => e.preventDefault()}
      onClick={(e) => {
        e.stopPropagation(); // ✅ 상위 onClick(handleDequeue)으로 이벤트 전파 방지
        if (longPressed.current) {
          // 꾹 눌러서 설명을 본 경우에는 기술을 사용하지 않는다
          longPressed.current = false;
          return;
        }
        handleSkillClick(skillNumber);
      }}>
      <ICON src={`/pokemon/img/type/${skill.type}.svg`} alt={skill.name} />
      <NAME skname={skill.name}>{skill.name}</NAME>
      <EFFECT>{getTypeEffectText(battle.player, skill.type, battle.npc.type1, battle.npc.type2, skill.stype)}</EFFECT>
      <PP>
        {pp}/{skill.pp}
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
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  cursor: ${({ $disabled }) => ($disabled ? "default" : "pointer")};

  ${({ $disabled }) =>
    !$disabled &&
    `
    &:active {
      background-color: rgba(255, 255, 255, 0.2);
    }
  `}

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
