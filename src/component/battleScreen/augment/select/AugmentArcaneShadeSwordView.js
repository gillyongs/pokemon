import React, { useState } from "react";
import styled, { keyframes, css } from "styled-components";
import { HeaderArea, HeaderTopRow, Title, SubTitleText } from "./selectStyles";

export const ARCANE_SCROLLS = [
  {
    id: "100",
    name: "100% 주문서",
    rate: 100,
    atk: 5,
    catk: 5,
    speed: 0,
    label: "공격 +5, 특공 +5",
    color: "#38bdf8",
    borderColor: "#0284c7",
    glowColor: "rgba(56, 189, 248, 0.4)",
  },
  {
    id: "70",
    name: "70% 주문서",
    rate: 70,
    atk: 7,
    catk: 7,
    speed: 0,
    label: "공격 +7, 특공 +7",
    color: "#c084fc",
    borderColor: "#9333ea",
    glowColor: "rgba(192, 132, 252, 0.4)",
  },
  {
    id: "30",
    name: "30% 주문서",
    rate: 30,
    atk: 15,
    catk: 15,
    speed: 0,
    label: "공격 +15, 특공 +15",
    color: "#fbbf24",
    borderColor: "#d97706",
    glowColor: "rgba(251, 191, 36, 0.45)",
  },
  {
    id: "15",
    name: "15% 주문서",
    rate: 15,
    atk: 30,
    catk: 30,
    speed: 3,
    label: "공격 +30, 특공 +30, 스피드 +3",
    color: "#f87171",
    borderColor: "#dc2626",
    glowColor: "rgba(248, 113, 113, 0.45)",
  },
];

const AugmentArcaneShadeSwordView = ({ arcaneShadeSwordAug, activePokemon, onSelect }) => {
  const [selectedScrollId, setSelectedScrollId] = useState("100");
  const [remainingAttempts, setRemainingAttempts] = useState(10);
  const [successCount, setSuccessCount] = useState(0);
  const [bonusAtk, setBonusAtk] = useState(0);
  const [bonusCatk, setBonusCatk] = useState(0);
  const [bonusSpeed, setBonusSpeed] = useState(0);
  const [history, setHistory] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const selectedScroll = ARCANE_SCROLLS.find((s) => s.id === selectedScrollId) || ARCANE_SCROLLS[0];

  const currentSwordTitle = successCount > 0 ? `아케인셰이드 투핸드소드 (+${successCount})` : "아케인셰이드 투핸드소드";

  const handleEnhance = (e) => {
    e?.stopPropagation();
    if (remainingAttempts <= 0 || isEnhancing) return;

    setIsEnhancing(true);
    setAnimKey((prev) => prev + 1);

    const scroll = selectedScroll;
    const roll = Math.random() * 100;
    const isSuccess = roll < scroll.rate;

    setTimeout(() => {
      if (isSuccess) {
        setSuccessCount((prev) => prev + 1);
        setBonusAtk((prev) => prev + scroll.atk);
        setBonusCatk((prev) => prev + scroll.catk);
        setBonusSpeed((prev) => prev + scroll.speed);
        setLastResult({
          success: true,
          scrollName: scroll.name,
          text: `강화 성공! ${scroll.name} 효과: ${scroll.label}`,
        });
        setHistory((prev) => [...prev, { success: true, scrollName: scroll.name }]);
      } else {
        setLastResult({
          success: false,
          scrollName: scroll.name,
          text: `강화 실패... ${scroll.name}의 마력이 사라졌습니다.`,
        });
        setHistory((prev) => [...prev, { success: false, scrollName: scroll.name }]);
      }

      setRemainingAttempts((prev) => prev - 1);
      setIsEnhancing(false);
    }, 100);
  };

  const handleFinish = (e) => {
    e?.stopPropagation();
    if (!arcaneShadeSwordAug || !activePokemon) return;

    const finalName = successCount > 0 ? `아케인셰이드 투핸드소드 (+${successCount})` : "아케인셰이드 투핸드소드";

    onSelect(arcaneShadeSwordAug, {
      targetPokemon: activePokemon,
      arcaneSuccessCount: successCount,
      arcaneBonusAtk: bonusAtk,
      arcaneBonusCatk: bonusCatk,
      arcaneBonusSpeed: bonusSpeed,
      arcaneSwordName: finalName,
    });
  };

  return (
    <Container>
      <HeaderArea>
        <HeaderTopRow>
          <Title>{currentSwordTitle}</Title>
        </HeaderTopRow>
        <SubTitleText>검을 원하는 주문서로 강화할 수 있습니다. (최대 10회)</SubTitleText>
      </HeaderArea>

      <ScrollContent>
        {/* 검 비주얼 & 스탯 현황 박스 */}
        <SwordBox key={animKey} $status={lastResult ? (lastResult.success ? "success" : "fail") : null}>
          <SwordTopRow>
            {/* 좌측: 검 이미지 */}
            <SwordVisualWrap>
              <SwordImg src="/pokemon/img/augment/arcaneShadeSword.png" alt="아케인셰이드 투핸드소드" />
              <SwordAuraRing $status={lastResult ? (lastResult.success ? "success" : "fail") : null} />
            </SwordVisualWrap>

            {/* 우측: 공격, 특공, 스피드 세로 배치 */}
            <StatValuesCol>
              <StatItem $color="#f87171">
                <StatName>공격</StatName>
                <StatValue>+{bonusAtk}</StatValue>
              </StatItem>
              <StatItem $color="#c084fc">
                <StatName>특공</StatName>
                <StatValue>+{bonusCatk}</StatValue>
              </StatItem>
              <StatItem $color="#34d399">
                <StatName>스피드</StatName>
                <StatValue>+{bonusSpeed}</StatValue>
              </StatItem>
            </StatValuesCol>
          </SwordTopRow>

          {/* 10개 강화 슬롯 상태 표시 */}
          <SlotContainer>
            <SlotHeader>
              <span>강화 슬롯</span>
              <SlotCountText>
                성공 <strong>{successCount}</strong> / 남은 횟수 <strong>{remainingAttempts}</strong>
              </SlotCountText>
            </SlotHeader>
            <SlotList>
              {Array.from({ length: 10 }).map((_, idx) => {
                const item = history[idx];
                if (!item) {
                  return <SlotCircle key={idx} $state="empty" title={`슬롯 ${idx + 1}: 미사용`} />;
                }
                return (
                  <SlotCircle key={idx} $state={item.success ? "success" : "fail"} title={`슬롯 ${idx + 1}: ${item.scrollName} (${item.success ? "성공" : "실패"})`}>
                    {item.success ? "★" : "✕"}
                  </SlotCircle>
                );
              })}
            </SlotList>
          </SlotContainer>
        </SwordBox>

        {/* 주문서 선택 UI */}
        <ScrollSelectSection>
          <SectionTitle>주문서 선택</SectionTitle>
          <ScrollGrid>
            {ARCANE_SCROLLS.map((scroll) => {
              const isSelected = selectedScrollId === scroll.id;
              const isDisabled = remainingAttempts <= 0 || isEnhancing;
              return (
                <ScrollCard
                  key={scroll.id}
                  $isSelected={isSelected}
                  $color={scroll.color}
                  $borderColor={scroll.borderColor}
                  $glowColor={scroll.glowColor}
                  $disabled={isDisabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isDisabled) {
                      setSelectedScrollId(scroll.id);
                    }
                  }}
                >
                  <ScrollCardHeader>
                    <ScrollName $color={scroll.color}>{scroll.name}</ScrollName>
                  </ScrollCardHeader>
                  <ScrollDesc>{scroll.label}</ScrollDesc>
                </ScrollCard>
              );
            })}
          </ScrollGrid>
        </ScrollSelectSection>
      </ScrollContent>

      {/* 맨 밑 버튼 1개: 진행 중에는 '강화하기', 끝나면 '완료' */}
      <FooterArea>
        {remainingAttempts > 0 ? (
          <EnhanceButton type="button" disabled={isEnhancing} onClick={handleEnhance}>
            {isEnhancing ? "주문서 마력 주입 중..." : `강화하기`}
          </EnhanceButton>
        ) : (
          <FinishButton type="button" onClick={handleFinish}>
            완료
          </FinishButton>
        )}
      </FooterArea>
    </Container>
  );
};

export default AugmentArcaneShadeSwordView;

/* Keyframes */
const successFlash = keyframes`
  0% { transform: scale(0.97); filter: drop-shadow(0 0 4px #fbbf24); }
  50% { transform: scale(1.03); filter: drop-shadow(0 0 14px #c084fc); }
  100% { transform: scale(1); filter: drop-shadow(0 0 6px rgba(192, 132, 252, 0.4)); }
`;

const failShake = keyframes`
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
`;

const auraPulse = keyframes`
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.03); }
`;

/* Styled Components */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
`;

const ScrollContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  overflow-y: auto;
  gap: 10px;
  padding-right: 2px;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(168, 85, 247, 0.3);
    border-radius: 4px;
  }
`;

const SwordBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: radial-gradient(circle at 50% 30%, rgba(59, 7, 100, 0.35) 0%, rgba(15, 23, 42, 0.75) 100%);
  border: 1.5px solid ${(props) => (props.$status === "success" ? "#c084fc" : props.$status === "fail" ? "#f87171" : "rgba(168, 85, 247, 0.4)")};
  border-radius: 12px;
  padding: 10px 14px;
  box-sizing: border-box;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease;

  ${(props) =>
    props.$status === "success" &&
    css`
      animation: ${successFlash} 0.4s ease;
      box-shadow: 0 0 16px rgba(192, 132, 252, 0.5);
    `}

  ${(props) =>
    props.$status === "fail" &&
    css`
      animation: ${failShake} 0.35s ease;
      box-shadow: 0 0 14px rgba(248, 113, 113, 0.4);
    `}
`;

const SwordTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  width: 100%;
  margin-bottom: 8px;
`;

const SwordVisualWrap = styled.div`
  position: relative;
  width: 76px;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const SwordImg = styled.img`
  width: 70px;
  height: 70px;
  object-fit: contain;
  z-index: 2;
  user-select: none;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6));
`;

const SwordAuraRing = styled.div`
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  border: 1.5px solid ${(props) => (props.$status === "success" ? "#fbbf24" : props.$status === "fail" ? "#f87171" : "#a855f7")};
  opacity: 0.6;
  animation: ${auraPulse} 2.5s infinite ease-in-out;
  pointer-events: none;
  box-shadow: inset 0 0 10px ${(props) => (props.$status === "success" ? "rgba(251, 191, 36, 0.4)" : props.$status === "fail" ? "rgba(248, 113, 113, 0.4)" : "rgba(168, 85, 247, 0.3)")};
`;

const StatValuesCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  max-width: 160px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px 10px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid ${(props) => props.$color || "#94a3b8"};
  border-radius: 6px;
  box-sizing: border-box;
`;

const StatName = styled.span`
  color: #94a3b8;
  font-size: 0.68rem;
  font-weight: 500;
`;

const StatValue = styled.span`
  color: #f1f5f9;
  font-weight: 700;
  font-size: 0.75rem;
`;

const SlotContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SlotHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.7rem;
  color: #94a3b8;
  padding: 0 2px;
`;

const SlotCountText = styled.span`
  strong {
    color: #e2e8f0;
  }
`;

const SlotList = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 4px 6px;
  background: rgba(10, 14, 26, 0.6);
  border-radius: 6px;
  box-sizing: border-box;
`;

const SlotCircle = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.68rem;
  font-weight: 700;
  transition: all 0.2s ease;

  ${(props) =>
    props.$state === "empty" &&
    css`
      border: 1px dashed rgba(148, 163, 184, 0.4);
      background: rgba(255, 255, 255, 0.03);
      color: transparent;
    `}

  ${(props) =>
    props.$state === "success" &&
    css`
      border: 1px solid #c084fc;
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(217, 119, 6, 0.3));
      color: #fbbf24;
      box-shadow: 0 0 6px rgba(251, 191, 36, 0.6);
    `}

  ${(props) =>
    props.$state === "fail" &&
    css`
      border: 1px solid #f87171;
      background: rgba(239, 68, 68, 0.25);
      color: #f87171;
    `}
`;

const ResultBanner = styled.div`
  width: 100%;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.73rem;
  line-height: 1.35;
  text-align: center;
  box-sizing: border-box;
  word-break: keep-all;

  ${(props) =>
    props.$status === "success" &&
    css`
      background: rgba(168, 85, 247, 0.15);
      border: 1px solid rgba(192, 132, 252, 0.4);
      color: #e9d5ff;
    `}

  ${(props) =>
    props.$status === "fail" &&
    css`
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(248, 113, 113, 0.4);
      color: #fca5a5;
    `}

  ${(props) =>
    props.$status === "finish" &&
    css`
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(52, 211, 153, 0.4);
      color: #a7f3d0;
    `}
`;

const ScrollSelectSection = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 6px;
`;

const SectionTitle = styled.div`
  font-size: 0.76rem;
  font-weight: 700;
  color: #cbd5e1;
  padding-left: 2px;
`;

const ScrollGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
`;

const ScrollCard = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.$disabled ? 0.55 : 1)};
  transition: all 0.2s ease;
  user-select: none;
  box-sizing: border-box;

  background: ${(props) => (props.$isSelected ? "rgba(30, 27, 75, 0.85)" : "rgba(15, 23, 42, 0.65)")};

  border: 1.5px solid ${(props) => (props.$isSelected ? props.$color : "rgba(255, 255, 255, 0.12)")};

  box-shadow: ${(props) => (props.$isSelected ? `0 0 10px ${props.$glowColor}` : "none")};

  &:hover {
    ${(props) =>
      !props.$disabled &&
      !props.$isSelected &&
      `
      background: rgba(25, 33, 56, 0.8);
      border-color: rgba(255, 255, 255, 0.25);
      transform: translateY(-1px);
    `}
  }
`;

const ScrollCardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 3px;
`;

const ScrollName = styled.span`
  font-size: 0.78rem;
  font-weight: 700;
  color: ${(props) => props.$color || "#f1f5f9"};
`;

const ScrollDesc = styled.span`
  font-size: 0.6rem;
  letter-spacing: -0.2px;
  color: #94a3b8;
  line-height: 1.3;
  word-break: keep-all;
`;

const FooterArea = styled.div`
  width: 100%;
  margin-top: auto;
  padding-top: 10px;
  box-sizing: border-box;
`;

const EnhanceButton = styled.button`
  width: 100%;
  padding: 11px 0;
  border-radius: 8px;
  font-size: 0.92rem;
  font-weight: 700;
  font-family: inherit;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  user-select: none;
  transition: all 0.2s ease;

  background: ${(props) => (props.disabled ? "rgba(100, 116, 139, 0.3)" : "linear-gradient(135deg, #7c3aed, #9333ea)")};
  border: 1px solid ${(props) => (props.disabled ? "rgba(255, 255, 255, 0.1)" : "#c084fc")};
  color: ${(props) => (props.disabled ? "#94a3b8" : "#ffffff")};
  box-shadow: ${(props) => (props.disabled ? "none" : "0 0 14px rgba(168, 85, 247, 0.45)")};

  &:hover {
    ${(props) =>
      !props.disabled &&
      `
      background: linear-gradient(135deg, #8b5cf6, #a855f7);
      box-shadow: 0 0 18px rgba(192, 132, 252, 0.65);
      transform: translateY(-1px);
    `}
  }

  &:active {
    ${(props) => !props.disabled && `transform: translateY(1px);`}
  }
`;

const FinishButton = styled.button`
  width: 100%;
  padding: 11px 0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;

  background: linear-gradient(135deg, #059669, #10b981);
  border: 1px solid #6ee7b7;
  color: #ffffff;
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.5);

  &:hover {
    background: linear-gradient(135deg, #047857, #059669);
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.7);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px);
  }
`;
