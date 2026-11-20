import { useRef } from "react";
import styled from "styled-components";
import { getTypeEffectText } from "../../../../calc/typeEffectCalculate";
import { skillTypeCalculate } from "../../../../calc/skillTypeCalculate";
import { isNimbleSkill } from "../../../../entity/Augment/AugmentData";
import { getSkillUnusableReason } from "../../../../service/skillCheck";

const SkillButton = ({ battle, skillNumber, queueObject, setText, battleStartBySkillButton }) => {
  let pp = battle.player.pp[skillNumber];
  let skill = battle.player.skill[skillNumber];
  const displayType = skillTypeCalculate(battle, skill, battle.player);
  const isNimble = Boolean(skill.nimbleMoves || isNimbleSkill(battle.player, skill));

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
      {isNimble && (
        <WING_BADGE title="민첩한 몸놀림 (우선도 +1)">
          <svg width="16" height="16" viewBox="8 8 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="nimbleFeatherGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="nimbleFeatherBody" x1="20%" y1="20%" x2="80%" y2="80%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="45%" stopColor="#f8fafc" />
                <stop offset="80%" stopColor="#e0f2fe" />
                <stop offset="100%" stopColor="#c7d2fe" />
              </linearGradient>
              <linearGradient id="nimbleFeatherUnder" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="50%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#93c5fd" />
              </linearGradient>
              <linearGradient id="nimbleQuill" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="40%" stopColor="#bae6fd" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
              <linearGradient id="nimbleFeatherEdge" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>
            <g filter="url(#nimbleFeatherGlow)">
              {/* 1. 바람 궤적 및 우선도 가속 모션 */}
              <path d="M 11 38 C 13 25 24 16 38 14" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" strokeDasharray="9 4" />
              <path d="M 22 52 C 34 54 48 48 54 36" stroke="#67e8f9" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.55" strokeDasharray="8 4" />

              {/* 2. 깃털 본체 (상단 깃 & 입체 주름) */}
              <path d="M 19 46 C 18 41, 19 36, 23 31 C 22 32.5, 22 34, 23.5 35 C 24 29, 28 23, 34 18 C 34 20, 34.5 21.5, 36 22 C 37 18, 42 14, 49 13 C 47 16.5, 45 19, 45 22 C 46 21, 47 21, 48 20.5 C 44.5 25, 41 29, 39 34 C 40.5 33, 42 32.5, 43 32 C 38 38, 32 44, 24 47 Z" fill="url(#nimbleFeatherBody)" stroke="url(#nimbleFeatherEdge)" strokeWidth="1.2" strokeLinejoin="round" />

              {/* 하단 깃 (언더 깃) */}
              <path d="M 19 46 C 16 43, 17 38, 20 35 C 19.5 37, 20.5 38.5, 22 39 C 21.5 34, 25 28, 30 24 C 29.5 26.5, 31 28, 32.5 29 C 33 24, 38 18, 49 13 C 43.5 19, 37.5 27, 34 33 C 32 37, 27 42, 21 46 Z" fill="url(#nimbleFeatherUnder)" stroke="url(#nimbleFeatherEdge)" strokeWidth="1.2" strokeLinejoin="round" />

              {/* 입체 하이라이트 레이어 */}
              <path d="M 23.5 35 C 25 30, 29 24, 34 19 C 34.5 21, 35.5 22, 36 22.5 C 38 18.5, 43 14.5, 48.5 13.5 C 45 18, 41 24, 38 29 C 33 34, 28 39, 23 43 Z" fill="#ffffff" fillOpacity="0.6" />

              {/* 깃털 빗살 결 디테일 */}
              <g stroke="#93c5fd" strokeWidth="0.7" strokeLinecap="round" opacity="0.65">
                <path d="M 27 36 L 23 39" />
                <path d="M 32 31 L 28 34" />
                <path d="M 38 25 L 34 28" />
                <path d="M 43 19 L 39 22" />
                <path d="M 28 31 L 32 28" />
                <path d="M 34 25 L 39 22" />
                <path d="M 40 18 L 44 16" />
              </g>

              {/* 3. 깃대 (Quill & Rachis) */}
              <path d="M 14 51 C 16 48.5 18.5 46.5 21 45" stroke="url(#nimbleQuill)" strokeWidth="2.6" strokeLinecap="round" />
              <path d="M 14 51 C 16 48.5 18.5 46.5 21 45" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" />
              <path d="M 20 45 C 28 36 36 25 49 13" stroke="url(#nimbleQuill)" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M 20 45 C 28 36 36 25 49 13" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" />

              {/* 4. 민첩함 스파클 (골드 & 시안) */}
              <path d="M 52 10 Q 52 13 55 13 Q 52 13 52 16 Q 52 13 49 13 Q 52 13 52 10 Z" fill="#fef08a" />
              <path d="M 15 24 Q 15 26.5 17.5 26.5 Q 15 26.5 15 29 Q 15 26.5 12.5 26.5 Q 15 26.5 15 24 Z" fill="#67e8f9" />
              <circle cx="48" cy="23" r="1.3" fill="#ffffff" opacity="0.9" />
              <circle cx="21" cy="20" r="1.1" fill="#38bdf8" opacity="0.8" />
              <circle cx="43" cy="38" r="1.2" fill="#67e8f9" opacity="0.75" />
              <circle cx="30" cy="48" r="0.9" fill="#ffffff" opacity="0.8" />
            </g>
          </svg>
        </WING_BADGE>
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

const WING_BADGE = styled.div`
  position: absolute;
  bottom: 4px;
  left: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;
