import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { ActionButton, ButtonGroup } from "./selectStyles";
export const STAT_KEYS = ["atk", "def", "catk", "cdef", "speed"];

export const STAT_DISPLAY_MAP = {
  atk: { label: "공격", short: "STR", color: "#dc2626" },
  def: { label: "방어", short: "DEX", color: "#2563eb" },
  catk: { label: "특수공격", short: "INT", color: "#9333ea" },
  cdef: { label: "특수방어", short: "LUK", color: "#059669" },
  speed: { label: "스피드", short: "SPD", color: "#d97706" },
};

/**
 * 영혼의 주사위 스탯 롤링 함수
 * 총합 50, 각 스탯(공격, 방어, 특공, 특방, 스피드) 최소 4, 최대 34
 * 별과 막대기(Stars and Bars) 균등 분포 분할 알고리즘 적용
 */
export const rollSoulDiceStats = () => {
  const all = Array.from({ length: 34 }, (_, i) => i + 1);
  for (let i = 0; i < 4; i++) {
    const j = i + Math.floor(Math.random() * (34 - i));
    const t = all[i];
    all[i] = all[j];
    all[j] = t;
  }
  const cuts = all.slice(0, 4).sort((a, b) => a - b);
  const parts = [
    cuts[0] - 1,
    cuts[1] - cuts[0] - 1,
    cuts[2] - cuts[1] - 1,
    cuts[3] - cuts[2] - 1,
    34 - cuts[3],
  ];

  return {
    atk: 4 + parts[0],
    def: 4 + parts[1],
    catk: 4 + parts[2],
    cdef: 4 + parts[3],
    speed: 4 + parts[4],
  };
};

const STAT_CONFIG = [
  { key: "atk", name: "공격" },
  { key: "def", name: "방어" },
  { key: "catk", name: "특수공격" },
  { key: "cdef", name: "특수방어" },
  { key: "speed", name: "스피드" },
];

const AugmentSoulDiceView = ({ soulDiceAug, activePokemon, onSelect }) => {
  const [stats, setStats] = useState(() => rollSoulDiceStats());
  const [displayStats, setDisplayStats] = useState(() => stats);
  const [isRolling, setIsRolling] = useState(false);
  const [rollCount, setRollCount] = useState(1);
  const [animKey, setAnimKey] = useState(0);

  // 캐릭터 이름 화면 UI 표시용 "zl존" + p.name + "Vv" (실제 p.name은 변경하지 않음)
  const rawBaseName = (activePokemon?.name || "포켓몬").replace(/^zl존/, "").replace(/^상대\s*/, "").replace(/Vv$/, "");
  const displayName = `zl존${rawBaseName}Vv`;

  const rollIntervalRef = useRef(null);

  const handleRollDice = (e) => {
    e?.stopPropagation();
    if (isRolling) return;

    setIsRolling(true);
    setAnimKey((prev) => prev + 1);

    // 주사위 굴리는 동안 45ms마다 숫자가 회전하는 메이플 감성 스크램블 연출
    let frame = 0;
    const finalResult = rollSoulDiceStats();

    if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
    rollIntervalRef.current = setInterval(() => {
      frame++;
      if (frame < 8) {
        setDisplayStats({
          atk: Math.floor(Math.random() * 25) + 4,
          def: Math.floor(Math.random() * 25) + 4,
          catk: Math.floor(Math.random() * 25) + 4,
          cdef: Math.floor(Math.random() * 25) + 4,
          speed: Math.floor(Math.random() * 25) + 4,
        });
      } else {
        clearInterval(rollIntervalRef.current);
        setDisplayStats(finalResult);
        setStats(finalResult);
        setIsRolling(false);
        setRollCount((prev) => prev + 1);
      }
    }, 45);
  };

  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
    };
  }, []);

  const handleConfirm = (e) => {
    e?.stopPropagation();
    if (!soulDiceAug || !activePokemon) return;

    // p.name은 바꾸지 않고, 스탯(soulDiceStats)만 저장 및 적용
    activePokemon.soulDiceStats = stats;

    onSelect(soulDiceAug, {
      targetPokemon: activePokemon,
      soulDiceStats: stats,
    });
  };

  return (
    <Container onClick={(e) => e.stopPropagation()}>
      {/* 표지판 나무 게시판 (위쪽 마진을 늘려 살짝 아래에 위치) */}
      <BoardFrame>
        {/* 네 귀퉁이 메탈 스크롤 장식 */}
        <MetalCorner $pos="tl" />
        <MetalCorner $pos="tr" />
        <MetalCorner $pos="bl" />
        <MetalCorner $pos="br" />

        {/* 상단 패널: 캐릭터 이름 화면 표시 ("zl존" + p.name + "Vv") */}
        <TopPanel>
          <TopHeaderRow>
            <PanelTitleText>캐릭터이름</PanelTitleText>
          </TopHeaderRow>

          <NamePlateBox>
            <PokemonNameText>{displayName}</PokemonNameText>
            <BlinkingCursor>|</BlinkingCursor>
          </NamePlateBox>
        </TopPanel>

        {/* 상/하단 나무판을 연결하는 은색 금속 링 힌지 */}
        <HingeRow>
          <HingeRing />
          <HingeRing />
          <HingeRing />
          <HingeRing />
        </HingeRow>

        {/* 하단 패널: 스탯 양피지와 주사위/GENERATE 버튼 */}
        <BottomPanel>
          <ScrollParchment>
            {/* 좌측 5개 스탯 목록 */}
            <StatsList>
              {STAT_CONFIG.map(({ key, name }) => {
                const val = displayStats[key] ?? 4;
                const isHigh = val >= 18;
                const isSuper = val >= 28;
                const isMin = val === 4;

                return (
                  <StatRow key={key}>
                    <StatSlotLabel>
                      <StatNameKor>{name}</StatNameKor>
                    </StatSlotLabel>
                    <StatNumberBox $isHigh={isHigh} $isSuper={isSuper} $isMin={isMin}>
                      {val}
                    </StatNumberBox>
                  </StatRow>
                );
              })}
            </StatsList>

            {/* 우측 GENERATE!! 버튼 및 빨간색 3D 주사위 */}
            <DiceInteractiveArea>
              {/* 메이플 고유 GENERATE!! 갈색 태그 버튼 */}
              <GenerateBanner type="button" onClick={handleRollDice} disabled={isRolling}>
                GENERATE!!
              </GenerateBanner>

              {/* 빨간색 3D 주사위 */}
              <DiceButton
                type="button"
                key={animKey}
                $isRolling={isRolling}
                onClick={handleRollDice}
                disabled={isRolling}
                title="클릭하여 주사위 굴리기!"
              >
                <DiceSvg viewBox="0 0 100 100">
                  <defs>
                    <radialGradient id="diceTop" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#f87171" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </radialGradient>
                    <linearGradient id="diceLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#b91c1c" />
                    </linearGradient>
                    <linearGradient id="diceRight" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#b91c1c" />
                      <stop offset="100%" stopColor="#7f1d1d" />
                    </linearGradient>
                    <filter id="diceShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#3c1505" floodOpacity="0.45" />
                    </filter>
                  </defs>

                  {/* 3D Isometric 빨간 큐브 */}
                  <g filter="url(#diceShadow)">
                    {/* 상단 윗면 (Top Face) */}
                    <polygon points="50,15 82,32 50,48 18,32" fill="url(#diceTop)" stroke="#991b1b" strokeWidth="1.2" strokeLinejoin="round" />
                    {/* 윗면 중앙 점 (1 pip) */}
                    <ellipse cx="50" cy="32" rx="4.5" ry="3" fill="#ffffff" />
                    <ellipse cx="49" cy="31" rx="3.5" ry="2.2" fill="#f8fafc" />

                    {/* 좌측면 (Left Face) */}
                    <polygon points="18,32 50,48 50,83 18,67" fill="url(#diceLeft)" stroke="#7f1d1d" strokeWidth="1.2" strokeLinejoin="round" />
                    {/* 좌측면 점들 (3 pips 대각선) */}
                    <ellipse cx="28" cy="45" rx="3.8" ry="4.2" fill="#ffffff" />
                    <ellipse cx="34" cy="57" rx="3.8" ry="4.2" fill="#ffffff" />
                    <ellipse cx="40" cy="69" rx="3.8" ry="4.2" fill="#ffffff" />

                    {/* 우측면 (Right Face) */}
                    <polygon points="50,48 82,32 82,67 50,83" fill="url(#diceRight)" stroke="#581313" strokeWidth="1.2" strokeLinejoin="round" />
                    {/* 우측면 점들 (2 pips) */}
                    <ellipse cx="62" cy="55" rx="3.8" ry="4.2" fill="#ffffff" />
                    <ellipse cx="70" cy="67" rx="3.8" ry="4.2" fill="#ffffff" />
                  </g>
                </DiceSvg>
              </DiceButton>

              <RollCountBadge>굴린 횟수: {rollCount}회</RollCountBadge>
            </DiceInteractiveArea>
          </ScrollParchment>
        </BottomPanel>
      </BoardFrame>

      {/* 모달 하단 버튼: 확인 버튼만 배치 */}
      <ButtonGroup>
        <ActionButton type="button" $variant="confirm" onClick={handleConfirm} disabled={isRolling}>
          확인
        </ActionButton>
      </ButtonGroup>
    </Container>
  );
};

export default AugmentSoulDiceView;

// --- CSS Animations ---
const blinkAnim = keyframes`
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
`;

const diceRollAnim = keyframes`
  0% { transform: scale(1) rotate(0deg); }
  20% { transform: scale(1.15) rotate(-35deg) translateY(-8px); }
  45% { transform: scale(0.9) rotate(45deg) translateY(4px); }
  70% { transform: scale(1.1) rotate(-15deg) translateY(-4px); }
  85% { transform: scale(0.95) rotate(10deg); }
  100% { transform: scale(1) rotate(0deg); }
`;

// --- Styled Components ---

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  user-select: none;
`;

const BoardFrame = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 380px;
  background: linear-gradient(180deg, #b86214 0%, #9e4f0c 40%, #853e08 80%, #682e04 100%);
  border: 3.5px solid #3c1905;
  border-radius: 12px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    inset 0 -2px 0 rgba(0, 0, 0, 0.45),
    0 8px 24px rgba(0, 0, 0, 0.4);
  padding: 10px 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 26px;
  margin-bottom: auto;
`;

const MetalCorner = styled.div`
  position: absolute;
  width: 16px;
  height: 16px;
  pointer-events: none;
  z-index: 2;

  ${(props) => {
    switch (props.$pos) {
      case "tl":
        return css`
          top: 2px;
          left: 2px;
          border-top: 3px solid #e2e8f0;
          border-left: 3px solid #e2e8f0;
          border-top-left-radius: 6px;
        `;
      case "tr":
        return css`
          top: 2px;
          right: 2px;
          border-top: 3px solid #cbd5e1;
          border-right: 3px solid #cbd5e1;
          border-top-right-radius: 6px;
        `;
      case "bl":
        return css`
          bottom: 2px;
          left: 2px;
          border-bottom: 3px solid #94a3b8;
          border-left: 3px solid #94a3b8;
          border-bottom-left-radius: 6px;
        `;
      case "br":
        return css`
          bottom: 2px;
          right: 2px;
          border-bottom: 3px solid #64748b;
          border-right: 3px solid #64748b;
          border-bottom-right-radius: 6px;
        `;
      default:
        return "";
    }
  }}

  &::after {
    content: "";
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #f8fafc;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
    ${(props) => (props.$pos.includes("t") ? "top: 2px;" : "bottom: 2px;")}
    ${(props) => (props.$pos.includes("l") ? "left: 2px;" : "right: 2px;")}
  }
`;

const TopPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: rgba(0, 0, 0, 0.12);
  border-radius: 6px;
  padding: 6px 8px;
`;

const TopHeaderRow = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const PanelTitleText = styled.span`
  font-size: 13px;
  font-weight: 800;
  color: #fff4d1;
  text-shadow:
    1px 1px 0 #3e1905,
    -1px -1px 0 #853e08;
  letter-spacing: 0.5px;
`;

const NamePlateBox = styled.div`
  display: flex;
  align-items: center;
  background: #502107;
  border: 2px solid #2e1103;
  border-radius: 4px;
  padding: 4px 10px;
  box-shadow: inset 2px 2px 4px rgba(0, 0, 0, 0.55);
`;

const PokemonNameText = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #fed7aa;
  letter-spacing: 0.5px;
`;

const BlinkingCursor = styled.span`
  color: #fbbf24;
  font-weight: 900;
  font-size: 14px;
  margin-left: 4px;
  animation: ${blinkAnim} 0.9s infinite;
`;

const HingeRow = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 2px 16px;
`;

const HingeRing = styled.div`
  width: 10px;
  height: 12px;
  background: linear-gradient(90deg, #94a3b8 0%, #f8fafc 45%, #64748b 100%);
  border: 1.5px solid #1e293b;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
`;

const BottomPanel = styled.div`
  width: 100%;
`;

const ScrollParchment = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(180deg, #fefbf0 0%, #faefd2 55%, #eeddb4 100%);
  border: 2px solid #b5925e;
  border-radius: 6px;
  padding: 8px 10px;
  box-shadow:
    inset 1px 1px 3px rgba(0, 0, 0, 0.18),
    0 2px 6px rgba(0, 0, 0, 0.3);
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -4px;
    left: 4px;
    right: 4px;
    height: 4px;
    background: #eedcb2;
    border-radius: 0 0 4px 4px;
    border-bottom: 1.5px solid #9c7b47;
    border-left: 1.5px solid #9c7b47;
    border-right: 1.5px solid #9c7b47;
  }
`;

const StatsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
`;

const StatRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StatSlotLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ecdcb3;
  border: 1.2px solid #c7af7b;
  border-radius: 3px;
  padding: 2px 6px;
  width: 68px;
  box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.1);
`;

const StatNameKor = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #5c2b07;
`;

const StatNumberBox = styled.div`
  font-size: 15px;
  font-weight: 900;
  font-family: "Courier New", Courier, monospace, sans-serif;
  color: ${(props) => (props.$isSuper ? "#b91c1c" : props.$isHigh ? "#c2410c" : props.$isMin ? "#854d0e" : "#3b1a04")};
  text-shadow: ${(props) => (props.$isSuper ? "0 0 4px rgba(239, 68, 68, 0.4)" : "none")};
  min-width: 24px;
  text-align: right;
  transition: all 0.15s ease;
`;

const DiceInteractiveArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 108px;
  flex-shrink: 0;
`;

const GenerateBanner = styled.button`
  background: linear-gradient(180deg, #78350f 0%, #451a03 100%);
  border: 1.5px solid #2e1002;
  border-radius: 12px;
  padding: 3px 9px;
  font-size: 11px;
  font-weight: 900;
  font-style: italic;
  color: #fef08a;
  text-shadow: 1px 1px 0 #1c0901;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    0 2px 4px rgba(0, 0, 0, 0.35);
  transform: rotate(-3deg);
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    transform: rotate(-3deg) scale(1.08);
    background: linear-gradient(180deg, #9a3412 0%, #5c1d04 100%);
    color: #ffffff;
  }

  &:active:not(:disabled) {
    transform: rotate(-3deg) scale(0.95);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DiceButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;

  ${(props) =>
    props.$isRolling &&
    css`
      animation: ${diceRollAnim} 0.4s ease-in-out infinite;
    `}

  &:hover:not(:disabled) {
    transform: scale(1.08) translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: scale(0.94);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const DiceSvg = styled.svg`
  width: 100%;
  height: 100%;
`;

const RollCountBadge = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: #78350f;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid #d4be88;
  border-radius: 8px;
  padding: 1px 6px;
`;
