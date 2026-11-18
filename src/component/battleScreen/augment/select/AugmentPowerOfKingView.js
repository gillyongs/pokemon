import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { AugmentIcon } from "../AugmentIcon";
import { HeaderArea, HeaderTopRow, Title, SubTitleText, ActionButton } from "./selectStyles";

const MIN_BONUS = 20;
const MAX_BONUS = 200;
const STEP = 20;
const TOTAL_SEGMENTS = 20; // 20개의 세그먼트 (10포인트당 1칸, 20당 2칸씩 깔끔하게 점등)

const AugmentPowerOfKingView = ({
  powerOfKingAug,
  activePokemon,
  onSelect,
  onCancel,
}) => {
  const [bonus, setBonus] = useState(20);
  const isDraggingRef = useRef(false);
  const trackRef = useRef(null);
  const cost = bonus / 20;

  const updateBonusFromClientX = (clientX) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const ratio = offsetX / rect.width;
    // ratio: 0 ~ 1 -> 20 ~ 200
    const rawVal = MIN_BONUS + ratio * (MAX_BONUS - MIN_BONUS);
    const steppedVal = Math.round(rawVal / STEP) * STEP;
    const clampedVal = Math.max(MIN_BONUS, Math.min(MAX_BONUS, steppedVal));
    setBonus(clampedVal);
  };

  const handleTrackMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    updateBonusFromClientX(e.clientX);

    const handleMouseMove = (moveEvent) => {
      if (!isDraggingRef.current) return;
      updateBonusFromClientX(moveEvent.clientX);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleTrackTouchStart = (e) => {
    e.stopPropagation();
    if (e.touches.length === 0) return;
    isDraggingRef.current = true;
    updateBonusFromClientX(e.touches[0].clientX);

    const handleTouchMove = (moveEvent) => {
      if (!isDraggingRef.current || moveEvent.touches.length === 0) return;
      updateBonusFromClientX(moveEvent.touches[0].clientX);
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };

    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
  };

  const handleDecrease = (e) => {
    e?.stopPropagation();
    setBonus((prev) => Math.max(MIN_BONUS, prev - STEP));
  };

  const handleIncrease = (e) => {
    e?.stopPropagation();
    setBonus((prev) => Math.min(MAX_BONUS, prev + STEP));
  };

  const handleMin = (e) => {
    e?.stopPropagation();
    setBonus(MIN_BONUS);
  };

  const handleMax = (e) => {
    e?.stopPropagation();
    setBonus(MAX_BONUS);
  };

  const handleConfirm = (e) => {
    e?.stopPropagation();
    if (onSelect) {
      onSelect(powerOfKingAug, {
        targetPokemon: activePokemon,
        kingStatBonus: bonus,
        kingCost: cost,
      });
    }
  };

  const handleCancel = (e) => {
    e?.stopPropagation();
    if (onCancel) onCancel();
  };

  // 좌우 방향키로 조작 지원
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        setBonus((prev) => Math.max(MIN_BONUS, prev - STEP));
      } else if (e.key === "ArrowRight") {
        setBonus((prev) => Math.min(MAX_BONUS, prev + STEP));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 세그먼트 활성화 개수 (20일 때 2칸, 200일 때 20칸)
  const activeSegmentsCount = Math.round((bonus / MAX_BONUS) * TOTAL_SEGMENTS);

  return (
    <ViewContainer onClick={(e) => e.stopPropagation()}>
      <HeaderArea>
        <HeaderTopRow>
          <Title>그 힘이야말로 왕인 까닭이다</Title>
        </HeaderTopRow>
        <SubTitleText>수치 20당 코스트가 1 증가합니다. (최대 200)</SubTitleText>
      </HeaderArea>

      <ContentBody>
        {/* 상단 증강 정보 및 수치/코스트 요약 카드 */}
        <InfoSummaryCard>
          <AugmentIcon id="powerOfKing" size={56} />
          <SummaryDetails>
            <SummaryTitleRow>
              <SummaryLabel>능력치 증가량</SummaryLabel>
              <CostTag>{cost} cost</CostTag>
            </SummaryTitleRow>
            <StatBonusNumber>+{bonus}</StatBonusNumber>
          </SummaryDetails>
        </InfoSummaryCard>

        {/* 슬라이더 컨트롤러 (드래그 조절 바) */}
        <PokemonSliderContainer>
          <SliderCapsule>
            {/* MIN 버튼 */}
            <TriggerButton type="button" onClick={handleMin} title="최소 수치 (20)">
              <ButtonKeyBadge>MIN</ButtonKeyBadge>
            </TriggerButton>

            {/* 좌측 - 버튼 */}
            <CircleArrowButton
              type="button"
              onClick={handleDecrease}
              disabled={bonus <= MIN_BONUS}
              title="20 감소 (-)"
            >
              <ArrowGlyph>-</ArrowGlyph>
            </CircleArrowButton>

            {/* 중앙 드래그 조절 게이지 바 */}
            <GaugeTrackWrapper
              ref={trackRef}
              onMouseDown={handleTrackMouseDown}
              onTouchStart={handleTrackTouchStart}
              title="드래그하여 수치 조절"
            >
              {/* 세그먼트 게이지 바 */}
              <SegmentList>
                {Array.from({ length: TOTAL_SEGMENTS }, (_, i) => (
                  <SegmentBar key={i} $active={i < activeSegmentsCount} />
                ))}
              </SegmentList>

              {/* 게이지 내부 우측 수치 표시 */}
              <GaugeValueNumber>{bonus}</GaugeValueNumber>
            </GaugeTrackWrapper>

            {/* 우측 + 버튼 */}
            <CircleArrowButton
              type="button"
              onClick={handleIncrease}
              disabled={bonus >= MAX_BONUS}
              title="20 증가 (+)"
            >
              <ArrowGlyph>+</ArrowGlyph>
            </CircleArrowButton>

            {/* MAX 버튼 */}
            <TriggerButton type="button" onClick={handleMax} title="최대 수치 (200)">
              <ButtonKeyBadge>MAX</ButtonKeyBadge>
            </TriggerButton>
          </SliderCapsule>
        </PokemonSliderContainer>
      </ContentBody>

      {/* 푸터 영역 (모달 하단에 고정) */}
      <FooterArea>
        <ActionButton type="button" $variant="back" onClick={handleCancel}>
          취소
        </ActionButton>
        <ActionButton type="button" onClick={handleConfirm}>
          선택 완료 ({cost} Cost)
        </ActionButton>
      </FooterArea>
    </ViewContainer>
  );
};

export default AugmentPowerOfKingView;

const ViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
`;

const ContentBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  padding: 8px 2px;
`;

const InfoSummaryCard = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px 16px;
  box-sizing: border-box;
`;

const SummaryDetails = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: 14px;
`;

const SummaryTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const SummaryLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: #94a3b8;
`;

const CostTag = styled.span`
  font-size: 0.78rem;
  font-weight: 800;
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.15);
  border: 1px solid rgba(251, 191, 36, 0.4);
  padding: 2px 8px;
  border-radius: 12px;
`;

const StatBonusNumber = styled.span`
  font-size: 1.8rem;
  font-weight: 900;
  color: #ffffff;
  line-height: 1.2;
  margin-top: 2px;
  text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
`;

/* ── 슬라이더 UI ── */
const PokemonSliderContainer = styled.div`
  width: 100%;
  box-sizing: border-box;
`;

const SliderCapsule = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  width: 100%;
  max-width: 100%;
  background: rgba(30, 41, 59, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 6px 8px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 4px 12px rgba(0, 0, 0, 0.35);
  box-sizing: border-box;
  user-select: none;
`;

const TriggerButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: transform 0.15s ease;

  &:hover {
    transform: scale(1.08);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ButtonKeyBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 7px;
  background: rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  font-size: 0.68rem;
  font-weight: 800;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.16);
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const CircleArrowButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    transform: scale(1.08);
    background: rgba(255, 255, 255, 0.18);
    border-color: rgba(255, 255, 255, 0.35);
  }

  &:active:not(:disabled) {
    transform: scale(0.92);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const ArrowGlyph = styled.span`
  color: #f1f5f9;
  font-size: 0.85rem;
  font-weight: 800;
  line-height: 1;
`;

const GaugeTrackWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  height: 32px;
  background: rgba(15, 23, 42, 0.9);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.6);
  padding: 3px 6px;
  cursor: pointer;
  user-select: none;
  touch-action: none;
  box-sizing: border-box;
  overflow: hidden;
`;

const SegmentList = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5px;
  flex: 1;
  min-width: 0;
  height: 18px;
  overflow: hidden;
`;

const SegmentBar = styled.div`
  flex: 1;
  min-width: 0;
  height: 100%;
  border-radius: 1px;
  background: ${(props) => (props.$active ? "#facc15" : "rgba(255, 255, 255, 0.08)")};
  box-shadow: ${(props) => (props.$active ? "0 0 2px rgba(250, 204, 21, 0.4)" : "none")};
  box-sizing: border-box;
`;

const GaugeValueNumber = styled.span`
  font-size: 0.88rem;
  font-weight: 900;
  color: #ffffff;
  width: 32px;
  text-align: right;
  letter-spacing: -0.3px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  margin-left: 4px;
  flex-shrink: 0;
`;

const FooterArea = styled.div`
  display: flex;
  width: 100%;
  gap: 10px;
  padding-top: 12px;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  box-sizing: border-box;
`;
