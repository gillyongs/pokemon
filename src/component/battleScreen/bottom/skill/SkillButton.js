import { useRef } from "react";
import styled from "styled-components";
import { getTypeEffectText } from "../../../../calc/typeEffectCalculate";
import { skillTypeCalculate } from "../../../../calc/skillTypeCalculate";
import { isNimbleSkill, isChoiceAndFocusSkill, isZeroSumBuffSkill, isZeroSumNerfSkill } from "../../../../entity/Augment/AugmentData";
import { getSkillUnusableReason } from "../../../../service/skillDisableCheck";
import { AugmentIcon } from "../../augment/AugmentIcon";

const SkillButton = ({ battle, skillNumber, queueObject, setText, battleStartBySkillButton }) => {
  let pp = battle.player.pp[skillNumber];
  let skill = battle.player.skill[skillNumber];
  const displayType = skillTypeCalculate(battle, skill, battle.player);
  const enhanceBadges = getSkillEnhanceBadges(battle.player, skill);
  const isUnusable = Boolean(getSkillUnusableReason(battle.player, skillNumber));

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
    if (!queueObject.queueCheck()) return;

    const reject = (message) => {
      // 텍스트박스에 기술 사용 불가 메세지 띄우기
      if (!player.auto && !player.charge && !player.recharge) {
        // 역린, 충전 중에 enqueue되는거 방지
        queueObject.enqueue(battle, message, "btn_skill_reject", { allowAct: true, noLog: true });
        setText?.(message);
      }
      return true;
    };

    const unusableReason = getSkillUnusableReason(player, skillIndex);
    if (unusableReason) return reject(unusableReason);

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
      if (queueObject.queueCheck()) {
        longPressed.current = true;
        setText?.(skill.text);
      }
    }, 500);
  };

  return (
    <SKILL
      className={sn}
      $disabled={!queueObject.queueCheck()}
      $isUnusable={isUnusable}
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
      }}
    >
      <ICON src={`/pokemon/img/type/${displayType}.svg`} alt={skill.name} />
      <NAME skname={skill.name}>{skill.name}</NAME>
      {enhanceBadges.length > 0 && (
        <ENHANCE_BADGES_ROW>
          {enhanceBadges.map((badge) => (
            <BADGE_ITEM key={badge.id} title={badge.title}>
              {badge.render()}
            </BADGE_ITEM>
          ))}
        </ENHANCE_BADGES_ROW>
      )}
      <EFFECT>{getTypeEffectText(battle, battle.player, skill, displayType)}</EFFECT>
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
  background-color: ${({ $isUnusable }) => ($isUnusable ? "rgba(127, 29, 29, 0.78)" : "rgba(0, 0, 0, 0.7)")};
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  cursor: ${({ $disabled }) => ($disabled ? "default" : "pointer")};

  ${({ $disabled, $isUnusable }) =>
    !$disabled &&
    `
    &:active {
      background-color: ${$isUnusable ? "rgba(160, 40, 40, 0.85)" : "rgba(255, 255, 255, 0.2)"};
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

const ENHANCE_BADGES_ROW = styled.div`
  position: absolute;
  bottom: 4px;
  left: 5px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  pointer-events: none;
`;

const BADGE_ITEM = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.7));
`;

// 기술 강화 증강 뱃지 목록 조회 (앞으로 추가될 강화 증강을 순서대로 배열로 확장 가능)
export const getSkillEnhanceBadges = (pokemon, skill) => {
  if (!pokemon || !skill) return [];
  const badges = [];

  // 1. 민첩한 몸놀림 (우선도 +1)
  if (skill.nimbleMoves || isNimbleSkill(pokemon, skill)) {
    badges.push({
      id: "nimbleMoves",
      title: "민첩한 몸놀림 (우선도 +1)",
      render: () => <AugmentIcon key="nimbleMoves" id="nimbleMoves" size={19} />,
    });
  }

  // 2. 선택과 집중 (위력 1.5배)
  if (isChoiceAndFocusSkill(pokemon, skill)) {
    badges.push({
      id: "choiceAndFocus",
      title: "선택과 집중 (위력 1.5배)",
      render: () => <AugmentIcon key="choiceAndFocus" id="choiceAndFocus" size={19} />,
    });
  }

  // 3. 제로섬게임 (강화: 위력 2배 (초록 +), 실패: 위력 0.5배 (빨간 -))
  if (isZeroSumBuffSkill(pokemon, skill)) {
    badges.push({
      id: "zeroSumGame_buff",
      title: "제로섬게임 (위력 2배)",
      render: () => <AugmentIcon key="zeroSumGame_buff" id="zeroSumGame" size={19} sign="+" />,
    });
  } else if (isZeroSumNerfSkill(pokemon, skill)) {
    badges.push({
      id: "zeroSumGame_nerf",
      title: "제로섬게임 (위력 0.5배)",
      render: () => <AugmentIcon key="zeroSumGame_nerf" id="zeroSumGame" size={19} sign="-" />,
    });
  }

  // 추후 새로운 기술 강화 증강 추가 시 여기에 badges.push(...) 형태로 등록

  return badges;
};
