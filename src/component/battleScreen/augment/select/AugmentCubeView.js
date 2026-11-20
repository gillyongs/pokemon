import React, { useState } from "react";
import styled, { keyframes, css } from "styled-components";
import { getArcaneSwordData } from "../../../../entity/Augment/AugmentData";

// 큐브 잠재능력 풀 (15개 옵션)
export const CUBE_POTENTIAL_POOLS = [
  {
    type: "defIgnore",
    label: "몬스터 방어율 무시",
    tiers: [
      { value: 15, text: "몬스터 방어율 무시 : +15%", color: "#c084fc" },
      { value: 30, text: "몬스터 방어율 무시 : +30%", color: "#facc15" },
      { value: 40, text: "몬스터 방어율 무시 : +40%", color: "#4ade80" },
    ],
  },
  {
    type: "atkRate",
    label: "공격 %",
    tiers: [
      { value: 6, text: "공격 : +6%", color: "#c084fc" },
      { value: 9, text: "공격 : +9%", color: "#facc15" },
      { value: 12, text: "공격 : +12%", color: "#4ade80" },
    ],
  },
  {
    type: "catkRate",
    label: "특수공격 %",
    tiers: [
      { value: 6, text: "특수공격 : +6%", color: "#c084fc" },
      { value: 9, text: "특수공격 : +9%", color: "#facc15" },
      { value: 12, text: "특수공격 : +12%", color: "#4ade80" },
    ],
  },
  {
    type: "speedRate",
    label: "스피드 %",
    tiers: [
      { value: 3, text: "스피드 : +3%", color: "#c084fc" },
      { value: 6, text: "스피드 : +6%", color: "#facc15" },
      { value: 9, text: "스피드 : +9%", color: "#4ade80" },
    ],
  },
  {
    type: "defRate",
    label: "방어 %",
    tiers: [
      { value: 6, text: "방어 : +6%", color: "#c084fc" },
      { value: 9, text: "방어 : +9%", color: "#facc15" },
      { value: 12, text: "방어 : +12%", color: "#4ade80" },
    ],
  },
  {
    type: "cdefRate",
    label: "특수방어 %",
    tiers: [
      { value: 6, text: "특수방어 : +6%", color: "#c084fc" },
      { value: 9, text: "특수방어 : +9%", color: "#facc15" },
      { value: 12, text: "특수방어 : +12%", color: "#4ade80" },
    ],
  },
  {
    type: "atkFlat",
    label: "공격 +",
    tiers: [
      { value: 11, text: "공격 : +11", color: "#c084fc" },
      { value: 22, text: "공격 : +22", color: "#facc15" },
      { value: 33, text: "공격 : +33", color: "#4ade80" },
    ],
  },
  {
    type: "catkFlat",
    label: "특수공격 +",
    tiers: [
      { value: 11, text: "특수공격 : +11", color: "#c084fc" },
      { value: 22, text: "특수공격 : +22", color: "#facc15" },
      { value: 33, text: "특수공격 : +33", color: "#4ade80" },
    ],
  },
  {
    type: "defFlat",
    label: "방어 +",
    tiers: [
      { value: 11, text: "방어 : +11", color: "#c084fc" },
      { value: 22, text: "방어 : +22", color: "#facc15" },
      { value: 33, text: "방어 : +33", color: "#4ade80" },
    ],
  },
  {
    type: "cdefFlat",
    label: "특수방어 +",
    tiers: [
      { value: 11, text: "특수방어 : +11", color: "#c084fc" },
      { value: 22, text: "특수방어 : +22", color: "#facc15" },
      { value: 33, text: "특수방어 : +33", color: "#4ade80" },
    ],
  },
  {
    type: "speedFlat",
    label: "스피드 +",
    tiers: [
      { value: 5, text: "스피드 : +5", color: "#c084fc" },
      { value: 11, text: "스피드 : +11", color: "#facc15" },
      { value: 17, text: "스피드 : +17", color: "#4ade80" },
    ],
  },
  {
    type: "damageRate",
    label: "데미지 %",
    tiers: [
      { value: 6, text: "데미지 : +6%", color: "#c084fc" },
      { value: 9, text: "데미지 : +9%", color: "#facc15" },
      { value: 12, text: "데미지 : +12%", color: "#4ade80" },
    ],
  },
  {
    type: "critRate",
    label: "급소 확률 증가 %",
    tiers: [
      { value: 6, text: "급소 확률 증가 : +6%", color: "#c084fc" },
      { value: 9, text: "급소 확률 증가 : +9%", color: "#facc15" },
      { value: 12, text: "급소 확률 증가 : +12%", color: "#4ade80" },
    ],
  },
  {
    type: "poisonRate",
    label: "공격 시 맹독 부여",
    tiers: [5, 10, 15, 20, 25, 30].map((v) => ({
      value: v,
      text: `공격 시 ${v}% 확률로 맹독 부여`,
      color: "#c084fc", // 맹독/빙결 부여는 무조건 보라색
    })),
  },
  {
    type: "freezeRate",
    label: "공격 시 빙결 부여",
    tiers: [5, 10, 15].map((v) => ({
      value: v,
      text: `공격 시 ${v}% 확률로 빙결 부여`,
      color: "#c084fc", // 맹독/빙결 부여는 무조건 보라색
    })),
  },
];

// 초록색 -> 노란색 -> 보라색 순으로 정렬하는 함수
export const sortCubeLinesByColor = (lines = []) => {
  if (!Array.isArray(lines)) return [];
  const colorOrder = {
    "#4ade80": 1, // 초록색
    "#facc15": 2, // 노란색
    "#c084fc": 3, // 보라색
  };
  return [...lines].sort((a, b) => {
    const orderA = colorOrder[a?.color] || 99;
    const orderB = colorOrder[b?.color] || 99;
    return orderA - orderB;
  });
};

export const rollOneCubeLine = () => {
  const pool = CUBE_POTENTIAL_POOLS[Math.floor(Math.random() * CUBE_POTENTIAL_POOLS.length)];
  const picked = pool.tiers[Math.floor(Math.random() * pool.tiers.length)];
  return {
    type: pool.type,
    value: picked.value,
    text: picked.text,
    color: picked.color,
  };
};

export const rollThreeCubeLines = () => {
  const lines = [];
  const isStatusRate = (type) => type === "poisonRate" || type === "freezeRate";

  while (lines.length < 3) {
    const rolled = rollOneCubeLine();
    // 공격 시 맹독/빙결 부여는 중복으로 등장하지 않으며, 서로 동시에 나오지 않음
    if (isStatusRate(rolled.type) && lines.some((l) => isStatusRate(l.type))) {
      continue;
    }
    lines.push(rolled);
  }
  return sortCubeLinesByColor(lines);
};

export const aggregateCubeStats = (lines = []) => {
  const stats = {
    defIgnore: 0,
    atkRate: 0,
    catkRate: 0,
    speedRate: 0,
    defRate: 0,
    cdefRate: 0,
    atkFlat: 0,
    catkFlat: 0,
    defFlat: 0,
    cdefFlat: 0,
    speedFlat: 0,
    damageRate: 0,
    critRate: 0,
    poisonRate: 0,
    freezeRate: 0,
  };

  if (!Array.isArray(lines)) return stats;

  lines.forEach((line) => {
    if (line && line.type && stats[line.type] !== undefined) {
      stats[line.type] += Number(line.value || 0);
    }
  });

  return stats;
};

const AugmentCubeView = ({ cubeAug, activePokemon, onSelect, onCancel }) => {
  const { cubeLines: initialLines } = getArcaneSwordData(activePokemon);

  // 처음 들어갈 때 옵션이 없으면 '-'로 표시 (있다면 초록-노랑-보라 순으로 정렬)
  const [lines, setLines] = useState(initialLines ? sortCubeLinesByColor(initialLines) : null);
  const [cubesLeft, setCubesLeft] = useState(10);
  const [hasRolled, setHasRolled] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const handleRoll = (e) => {
    e?.stopPropagation();
    if (cubesLeft <= 0 || isRolling) return;

    setIsRolling(true);
    setAnimKey((prev) => prev + 1);

    setTimeout(() => {
      // 초록색 - 노란색 - 보라색 순으로 정렬된 3줄 획득
      const rolled = rollThreeCubeLines();
      setLines(rolled);
      setCubesLeft((prev) => Math.max(0, prev - 1));
      setHasRolled(true);
      setIsRolling(false);
    }, 100);
  };

  const handleLeftAction = (e) => {
    e?.stopPropagation();
    if (isRolling) return;

    // 롤을 한 번도 안 돌렸으면 취소
    if (!hasRolled) {
      if (onCancel) onCancel();
      return;
    }

    // 롤을 돌렸으면 완료(적용)
    const sortedLines = sortCubeLinesByColor(lines);
    if (onSelect) {
      onSelect(cubeAug, {
        targetPokemon: activePokemon,
        cubeLines: sortedLines,
        cubeStats: aggregateCubeStats(sortedLines),
      });
    }
  };

  const sortedDisplayLines = sortCubeLinesByColor(lines);

  return (
    <WindowFrame>
      {/* Title Bar (Maple Enchant Header) */}
      <WindowTitleBar>
        <CubeTitleIcon src="/pokemon/img/augment/cube.png" alt="큐브" />
        <TitleTextCol>
          <TitleLine>아이템의 잠재능력을 재설정합니다.</TitleLine>
        </TitleTextCol>
      </WindowTitleBar>

      {/* Center Chamber (Maple Enchant Chamber & 3D Isometric Cube) */}
      <ChamberArea>
        <RadiatingSunburst />
        <ChamberOrnateFrame>
          <FiligreeRail $pos="top" />
          <FiligreeRail $pos="bottom" />
          <FiligreePillar $side="left" />
          <FiligreePillar $side="right" />
        </ChamberOrnateFrame>

        {/* Center 3D Isometric Cube (Stationary, motionless at rest) */}
        <CubeContainer key={animKey} $rolling={isRolling}>
          <Isometric3DCubeSvg />
          <EquipWrap>
            <EquipImage src="/pokemon/img/augment/arcaneShadeSword.png" alt="아케인셰이드 투핸드소드" />
          </EquipWrap>
          {isRolling && <FlashOverlay />}
        </CubeContainer>
      </ChamberArea>

      {/* RESULT Panel (result, 레전더리 글자 제외) */}
      <ResultBox>
        <LinesContainer>
          {!lines || lines.length === 0 ? (
            <>
              <PotentialLine $empty>-</PotentialLine>
              <PotentialLine $empty>-</PotentialLine>
              <PotentialLine $empty>-</PotentialLine>
            </>
          ) : (
            sortedDisplayLines.map((line, idx) => (
              <PotentialLine key={idx} $color={line.color}>
                {line.text}
              </PotentialLine>
            ))
          )}
        </LinesContainer>
      </ResultBox>

      {/* Bottom Button Row: 취소를 좌측에, 한번 더 돌리기를 우측에 배치 */}
      <ButtonRow>
        <LeftButton type="button" disabled={isRolling} onClick={handleLeftAction} $isConfirm={hasRolled}>
          {hasRolled ? "완료" : "취소"}
        </LeftButton>

        <RightButton type="button" disabled={cubesLeft <= 0 || isRolling} onClick={handleRoll}>
          {cubesLeft <= 0 ? "큐브 소진 (0/10)" : isRolling ? "설정 중..." : hasRolled ? `한 번 더 돌리기 (${cubesLeft}/10)` : `큐브 사용 (${cubesLeft}/10)`}
        </RightButton>
      </ButtonRow>
    </WindowFrame>
  );
};

export default AugmentCubeView;

/* Isometric 3D Glowing Glass Cube (정육면체) */
const Isometric3DCubeSvg = () => (
  <svg width="154" height="136" viewBox="0 0 170 150" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", pointerEvents: "none" }}>
    <defs>
      {/* Top Face Gradient */}
      <linearGradient id="cubeTopGrad" x1="85" y1="10" x2="85" y2="58" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
      </linearGradient>
      {/* Left Face Gradient */}
      <linearGradient id="cubeLeftGrad" x1="26" y1="36" x2="85" y2="138" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.38" />
        <stop offset="100%" stopColor="#0369a1" stopOpacity="0.12" />
      </linearGradient>
      {/* Right Face Gradient */}
      <linearGradient id="cubeRightGrad" x1="144" y1="36" x2="85" y2="138" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.32" />
        <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.1" />
      </linearGradient>
      {/* Cube Outer Glow Filter */}
      <filter id="cubeOuterGlow" x="-25%" y="-25%" width="150%" height="150%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Back Hexagon Glow Backdrop */}
    <polygon points="85,10 144,36 144,112 85,138 26,112 26,36" fill="rgba(56, 189, 248, 0.16)" filter="url(#cubeOuterGlow)" />

    {/* Left Face (Isometric 3D) */}
    <polygon points="26,36 85,62 85,138 26,112" fill="url(#cubeLeftGrad)" stroke="#7dd3fc" strokeWidth="1.8" strokeLinejoin="round" />

    {/* Right Face (Isometric 3D) */}
    <polygon points="85,62 144,36 144,112 85,138" fill="url(#cubeRightGrad)" stroke="#7dd3fc" strokeWidth="1.8" strokeLinejoin="round" />

    {/* Top Face (Isometric 3D) */}
    <polygon points="85,10 144,36 85,62 26,36" fill="url(#cubeTopGrad)" stroke="#bae6fd" strokeWidth="2" strokeLinejoin="round" />

    {/* Center Leading Vertical Edge */}
    <line x1="85" y1="62" x2="85" y2="138" stroke="#bae6fd" strokeWidth="1.8" strokeLinecap="round" />

    {/* Inner subtle grid lines on top face */}
    <line x1="55.5" y1="23" x2="114.5" y2="49" stroke="rgba(224, 242, 254, 0.28)" strokeWidth="1" />
    <line x1="114.5" y1="23" x2="55.5" y2="49" stroke="rgba(224, 242, 254, 0.28)" strokeWidth="1" />

    {/* Inner Item Placement Slot (Maple dashed pink guide) */}
    <rect x="61" y="54" width="48" height="48" rx="2" fill="none" stroke="rgba(244, 114, 182, 0.65)" strokeWidth="1.2" strokeDasharray="3 3" />
  </svg>
);

/* Keyframes */
const rollSpin = keyframes`
  0% {
    transform: scale(0.92) rotate(-8deg);
    filter: brightness(1.5) drop-shadow(0 0 35px #38bdf8);
  }
  50% {
    transform: scale(1.08) rotate(8deg);
    filter: brightness(2) drop-shadow(0 0 45px #67e8f9);
  }
  100% {
    transform: scale(1) rotate(0deg);
    filter: brightness(1) drop-shadow(0 0 20px #38bdf8);
  }
`;

const flashFade = keyframes`
  0% { opacity: 0.9; }
  100% { opacity: 0; }
`;

/* Styled Components - Maple Cube Enchant Theme */
const WindowFrame = styled.div`
  display: flex;
  flex-direction: column;
  width: 410px;
  max-width: 95vw;
  background: #111a2e;
  border: 2px solid #526488;
  border-radius: 8px;
  box-shadow:
    0 14px 40px rgba(0, 0, 0, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    0 0 20px rgba(56, 189, 248, 0.15);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Malgun Gothic", sans-serif;
  overflow: hidden;
  user-select: none;
`;

const WindowTitleBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: linear-gradient(180deg, #6ba5bd 0%, #467b93 60%, #356377 100%);
  border-bottom: 2px solid #234657;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
`;

const CubeTitleIcon = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  padding: 1px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.35);
  object-fit: contain;
`;

const TitleTextCol = styled.div`
  display: flex;
  flex-direction: column;
`;

const TitleLine = styled.span`
  color: #0c202d;
  font-size: 13.5px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.3px;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.35);
`;

const ChamberArea = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px 12px 6px;
  background: radial-gradient(circle at 50% 50%, #1e5884 0%, #103454 45%, #081d33 80%, #051424 100%);
  border-bottom: 2px solid #1a2f4c;
  overflow: hidden;
  min-height: 142px;
`;

const RadiatingSunburst = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 440px;
  height: 180px;
  transform: translate(-50%, -50%);
  background: radial-gradient(ellipse at center, rgba(56, 189, 248, 0.35) 0%, rgba(14, 165, 233, 0.12) 50%, transparent 75%), repeating-conic-gradient(from 0deg, rgba(125, 211, 252, 0.07) 0deg 10deg, transparent 10deg 20deg);
  pointer-events: none;
`;

const ChamberOrnateFrame = styled.div`
  position: absolute;
  inset: 4px 8px;
  pointer-events: none;
  border: 1px solid rgba(125, 211, 252, 0.25);
  box-shadow: inset 0 0 16px rgba(56, 189, 248, 0.15);
`;

const FiligreeRail = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, transparent 0%, rgba(224, 242, 254, 0.4) 15%, rgba(224, 242, 254, 0.8) 50%, rgba(224, 242, 254, 0.4) 85%, transparent 100%);
  ${({ $pos }) => ($pos === "top" ? "top: 0;" : "bottom: 0;")}

  &::before, &::after {
    content: "";
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #e0f2fe;
    box-shadow: 0 0 6px #38bdf8;
    top: -1px;
  }
  &::before {
    left: 4px;
  }
  &::after {
    right: 4px;
  }
`;

const FiligreePillar = styled.div`
  position: absolute;
  top: 4px;
  bottom: 4px;
  width: 8px;
  ${({ $side }) => ($side === "left" ? "left: 4px;" : "right: 4px;")}
  background: repeating-linear-gradient(180deg, rgba(125, 211, 252, 0.4) 0px 4px, transparent 4px 8px);
  border-${({ $side }) => $side}: 1px solid rgba(224, 242, 254, 0.5);
`;

const CubeContainer = styled.div`
  position: relative;
  width: 154px;
  height: 136px;
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ $rolling }) =>
    $rolling &&
    css`
      animation: ${rollSpin} 0.32s ease-out;
    `}
`;

const EquipWrap = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -6px;
`;

const EquipImage = styled.img`
  width: 66px;
  height: 66px;
  object-fit: contain;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.65));
`;

const FlashOverlay = styled.div`
  position: absolute;
  inset: -15px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(56, 189, 248, 0.7) 40%, transparent 75%);
  border-radius: 50%;
  pointer-events: none;
  animation: ${flashFade} 0.32s ease-out forwards;
  z-index: 5;
`;

const ResultBox = styled.div`
  margin: 10px 14px 8px;
  background: #09172a;
  border: 2px solid #38bdf8;
  border-radius: 8px;
  padding: 10px 14px;
  box-shadow:
    inset 0 2px 8px rgba(0, 0, 0, 0.65),
    0 0 12px rgba(56, 189, 248, 0.2);
`;

const LinesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
  background: rgba(4, 11, 20, 0.75);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 6px;
  padding: 10px 14px;
  min-height: 80px;
  justify-content: center;
`;

const PotentialLine = styled.div`
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.2px;
  line-height: 1.35;
  color: ${({ $color, $empty }) => ($empty ? "#64748b" : $color || "#ffffff")};
  text-align: ${({ $empty }) => ($empty ? "center" : "left")};
  text-shadow:
    0 1px 3px rgba(0, 0, 0, 0.9),
    0 0 6px ${({ $color }) => ($color ? `${$color}44` : "transparent")};
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 6px 14px 12px;
`;

/* 좌측 버튼 (취소 / 완료) */
const LeftButton = styled.button`
  flex: 1;
  padding: 10px 0;
  font-size: 13.5px;
  font-weight: 800;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease-in-out;

  ${({ $isConfirm }) =>
    $isConfirm
      ? css`
          background: linear-gradient(180deg, #10b981 0%, #059669 50%, #047857 100%);
          border: 1px solid #34d399;
          color: #ffffff;
          box-shadow:
            0 3px 6px rgba(0, 0, 0, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);

          &:hover:not(:disabled) {
            background: linear-gradient(180deg, #34d399 0%, #10b981 50%, #059669 100%);
            box-shadow: 0 0 12px rgba(52, 211, 153, 0.6);
          }
        `
      : css`
          background: linear-gradient(180deg, #64748b 0%, #475569 50%, #334155 100%);
          border: 1px solid #94a3b8;
          color: #f1f5f9;
          box-shadow:
            0 3px 6px rgba(0, 0, 0, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);

          &:hover:not(:disabled) {
            background: linear-gradient(180deg, #94a3b8 0%, #64748b 50%, #475569 100%);
          }
        `}

  &:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

/* 우측 버튼 (한 번 더 돌리기) */
const RightButton = styled.button`
  flex: 1.6;
  padding: 10px 0;
  font-size: 13.5px;
  font-weight: 900;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  background: linear-gradient(180deg, #a3e635 0%, #84cc16 50%, #65a30d 100%);
  border: 1px solid #bef264;
  color: #1e3a0f;
  box-shadow:
    0 3px 6px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.45);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4);

  &:hover:not(:disabled) {
    background: linear-gradient(180deg, #bef264 0%, #a3e635 50%, #84cc16 100%);
    box-shadow: 0 0 14px rgba(163, 230, 53, 0.7);
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  }

  &:disabled {
    background: linear-gradient(180deg, #475569 0%, #334155 100%);
    border: 1px solid #64748b;
    color: #94a3b8;
    text-shadow: none;
    box-shadow: none;
    cursor: not-allowed;
    opacity: 0.65;
  }
`;
