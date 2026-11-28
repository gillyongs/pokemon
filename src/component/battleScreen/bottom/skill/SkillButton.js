import { useRef } from "react";
import styled from "styled-components";
import { getTypeEffectText } from "../../../../calc/typeEffectCalculate";
import { skillTypeCalculate } from "../../../../calc/skillTypeCalculate";
import { isNimbleSkill, isChoiceAndFocusSkill, isZeroSumBuffSkill, isZeroSumNerfSkill } from "../../../../entity/Augment/AugmentData";
import { getSkillUnusableReason } from "../../../../service/skillCheck/skillDisableCheck";
import { AugmentIcon } from "../../augment/AugmentIcon";
import { isEligibleSkillForZCrystal, buildZMoveFromSkill } from "../../../../entity/Skill/ZMove";
import { buildMaxMoveFromSkill, buildMaxGuardFromSkill, getMaxMoveConfigByType } from "../../../../entity/Skill/DymaxMove";
import { TYPE_COLORS } from "../../../../entity/TypeData";

const SkillButton = ({ battle, skillNumber, queueObject, setText, battleStartBySkillButton, zMoveActive = false, zCrystal = null, teraActive = false, teraType = null, dynamaxActive = false, megaSkinType = null }) => {
  let pp = battle.player.pp[skillNumber];
  let skill = battle.player.skill[skillNumber];
  const displayType = skillTypeCalculate(battle, skill, battle.player);
  const enhanceBadges = getSkillEnhanceBadges(battle.player, skill);
  const baseUnusableReason = getSkillUnusableReason(battle.player, skillNumber);
  const unusableReason = dynamaxActive ? (!skill || pp <= 0 ? "해당 기술은 더 이상 사용할 수 없다!" : null) : baseUnusableReason;
  const isUnusable = Boolean(unusableReason);
  const isZTarget = Boolean(zMoveActive && zCrystal && !isUnusable && isEligibleSkillForZCrystal(skill, zCrystal, battle, battle.player));
  const zMoveSkill = isZTarget ? buildZMoveFromSkill(skill, zCrystal, skillNumber) : null;

  let dynamaxMoveSkill = null;
  if (dynamaxActive && !isUnusable && skill && !skill.feature?.isMaxMove && !skill.feature?.isZMove) {
    if (skill.stype === "atk" || skill.stype === "catk") {
      const maxCfg = getMaxMoveConfigByType(displayType);
      if (maxCfg) {
        dynamaxMoveSkill = buildMaxMoveFromSkill({ ...skill, type: displayType }, maxCfg, skillNumber);
      }
    } else {
      dynamaxMoveSkill = buildMaxGuardFromSkill(skill, skillNumber);
    }
  }

  const isTeraBurstPreview = Boolean(teraActive && !isUnusable && skill?.name === "테라버스트" && teraType);
  const isMegaSkinPreview = Boolean(megaSkinType && !isUnusable && displayType === "노말" && skill?.name !== "발버둥");
  const shownSkill = zMoveSkill || dynamaxMoveSkill || skill;
  const shownDisplayType = dynamaxMoveSkill ? shownSkill.type : isTeraBurstPreview ? teraType : isMegaSkinPreview ? megaSkinType : displayType;
  const isDynamaxTarget = Boolean(dynamaxMoveSkill);
  const zTypeColor = isZTarget ? TYPE_COLORS[zCrystal.type] || "#64ffda" : isTeraBurstPreview ? TYPE_COLORS[teraType] || null : null;

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
        setText?.(shownSkill.text);
      }
    }, 500);
  };

  return (
    <SKILL
      className={sn}
      $disabled={!queueObject.queueCheck()}
      $isUnusable={isUnusable}
      $zTypeColor={zTypeColor}
      $isDynamaxTarget={isDynamaxTarget}
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
      <ICON src={`/pokemon/img/type/${shownDisplayType}.svg`} alt={shownSkill.name} />
      <NAME skname={shownSkill.name}>{shownSkill.name}</NAME>
      {enhanceBadges.length > 0 && (
        <ENHANCE_BADGES_ROW>
          {enhanceBadges.map((badge) => (
            <BADGE_ITEM key={badge.id} title={badge.title}>
              {badge.render()}
            </BADGE_ITEM>
          ))}
        </ENHANCE_BADGES_ROW>
      )}
      <EFFECT>{getTypeEffectText(battle, battle.player, shownSkill, shownDisplayType)}</EFFECT>
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
  background-color: ${({ $isUnusable, $zTypeColor }) => ($zTypeColor ? $zTypeColor : $isUnusable ? "rgba(127, 29, 29, 0.78)" : "rgba(0, 0, 0, 0.7)")};
  box-shadow: ${({ $zTypeColor, $isDynamaxTarget }) => ($isDynamaxTarget ? "0 0 10px rgba(244, 63, 94, 0.55)" : $zTypeColor ? `0 0 12px ${$zTypeColor}` : "none")};
  border: ${({ $zTypeColor, $isDynamaxTarget }) => ($isDynamaxTarget ? "2px solid #f43f5e" : $zTypeColor ? "1px solid rgba(255, 255, 255, 0.65)" : "none")};
  box-sizing: border-box;
  transition:
    background-color 0.18s ease,
    box-shadow 0.18s ease;
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
  top: ${({ skname }) => (skname?.length >= 9 ? "13px" : "10px")};
  left: 42px;
  font-size: ${({ skname }) => (skname?.length >= 9 ? "15px" : "20px")};
  white-space: nowrap;
  @media (max-width: 400px) {
    font-size: ${({ skname }) => (skname?.length >= 9 ? "3.7vw" : skname?.length > 5 ? "4.3vw" : "20px")};
    top: ${({ skname }) => (skname?.length >= 9 ? "14px" : skname?.length > 5 ? "12px" : "10px")};
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

  // 3. 제로섬게임 (강화: 위력 1.5배 (초록 +), 실패: 위력 0.5배 (빨간 -))
  if (isZeroSumBuffSkill(pokemon, skill)) {
    badges.push({
      id: "zeroSumGame_buff",
      title: "제로섬게임 (위력 1.5배)",
      render: () => <AugmentIcon key="zeroSumGame_buff" id="zeroSumGame" size={19} sign="+" />,
    });
  } else if (isZeroSumNerfSkill(pokemon, skill)) {
    badges.push({
      id: "zeroSumGame_nerf",
      title: "제로섬게임 (위력 0.5배)",
      render: () => <AugmentIcon key="zeroSumGame_nerf" id="zeroSumGame" size={19} sign="-" />,
    });
  }

  // 4. 치명적인 일격 (확정 급소)
  if (skill.fatalStrike) {
    badges.push({
      id: "fatalStrike",
      title: "치명적인 일격 (확정 급소)",
      render: () => <AugmentIcon key="fatalStrike" id="fatalStrike" size={19} />,
    });
  }

  // 추후 새로운 기술 강화 증강 추가 시 여기에 badges.push(...) 형태로 등록

  return badges;
};
