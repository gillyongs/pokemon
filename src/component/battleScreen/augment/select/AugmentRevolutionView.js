import React, { useState } from "react";
import styled from "styled-components";
import { AugmentIcon } from "../AugmentIcon";
import { getRevolutionSuccessProbability } from "../../../../entity/Augment/AugmentData";
import { HeaderArea, HeaderTopRow, Title, SubTitleText, ActionButton } from "./selectStyles";

const MIN_COST = 0;
const MAX_COST = 18;

const AugmentRevolutionView = ({ revolutionAug, activePokemon, onSelect, onCancel }) => {
  const [cost, setCost] = useState(0);
  const successProbability = getRevolutionSuccessProbability(cost);

  const handleCostChange = (nextCost) => {
    setCost(Math.max(MIN_COST, Math.min(MAX_COST, Number(nextCost) || 0)));
  };

  const handleConfirm = (e) => {
    e?.stopPropagation();
    onSelect?.(revolutionAug, {
      targetPokemon: activePokemon,
      revolutionCost: cost,
      revolutionProbability: successProbability,
    });
  };

  const handleCancel = (e) => {
    e?.stopPropagation();
    onCancel?.();
  };

  return (
    <ViewContainer onClick={(e) => e.stopPropagation()}>
      <RevolutionHeaderArea>
        <HeaderTopRow>
          <Title>
            실패하면 반역, <br />
            성공하면 혁명 아닙니까!
          </Title>
        </HeaderTopRow>
        <SubTitleText>
          코스트 1당 성공 확률이 5% 증가합니다.
          <br />
          성공시 모든 능력치가 1.5배, 실패시 0.7배가 됩니다.
        </SubTitleText>
      </RevolutionHeaderArea>

      <ContentBody>
        <InfoSummaryCard>
          <AugmentIcon id="revolution" size={56} />
          <SummaryDetails>
            <SummaryTitleRow>
              <SummaryLabel>성공 확률</SummaryLabel>
              <CostTag>{cost} Cost</CostTag>
            </SummaryTitleRow>
            <ProbabilityNumber>{successProbability}%</ProbabilityNumber>
          </SummaryDetails>
        </InfoSummaryCard>

        <CostControl>
          <ControlButton type="button" onClick={() => handleCostChange(MIN_COST)} aria-label="최소 코스트">
            MIN
          </ControlButton>
          <ControlButton type="button" onClick={() => handleCostChange(cost - 1)} disabled={cost <= MIN_COST} aria-label="코스트 감소">
            −
          </ControlButton>
          <RangeArea>
            <RangeLabels>
              <span>코스트 {cost}</span>
              <span>성공 {successProbability}%</span>
            </RangeLabels>
            <CostRange type="range" min={MIN_COST} max={MAX_COST} step="1" value={cost} onChange={(e) => handleCostChange(e.target.value)} aria-label="혁명 성공 확률 코스트" />
          </RangeArea>
          <ControlButton type="button" onClick={() => handleCostChange(cost + 1)} disabled={cost >= MAX_COST} aria-label="코스트 증가">
            +
          </ControlButton>
          <ControlButton type="button" onClick={() => handleCostChange(MAX_COST)} aria-label="최대 코스트">
            MAX
          </ControlButton>
        </CostControl>
      </ContentBody>

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

export default AugmentRevolutionView;

const ViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  padding-top: 8px;
`;

const RevolutionHeaderArea = styled(HeaderArea)`
  margin-bottom: 4px;
`;

const ContentBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 16px;
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  padding: 45px 2px 10px;
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

const ProbabilityNumber = styled.span`
  font-size: 1.8rem;
  font-weight: 900;
  color: #ffffff;
  line-height: 1.2;
  margin-top: 2px;
  text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
`;

const OutcomeRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`;

const OutcomeCard = styled.div`
  min-width: 0;
  padding: 12px 10px;
  border-radius: 10px;
  background: ${(props) => (props.$success ? "rgba(13, 148, 136, 0.14)" : "rgba(220, 38, 38, 0.12)")};
  border: 1px solid ${(props) => (props.$success ? "rgba(45, 212, 191, 0.35)" : "rgba(248, 113, 113, 0.3)")};
`;

const OutcomeLabel = styled.div`
  color: #cbd5e1;
  font-size: 0.75rem;
  font-weight: 700;
`;

const OutcomeValue = styled.div`
  margin-top: 5px;
  color: #f8fafc;
  font-size: 0.84rem;
  font-weight: 800;
`;

const CostControl = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  background: rgba(30, 41, 59, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
`;

const ControlButton = styled.button`
  flex: 0 0 auto;
  min-width: 30px;
  height: 30px;
  padding: 0 7px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #f1f5f9;
  background: rgba(255, 255, 255, 0.08);
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

const RangeArea = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
`;

const RangeLabels = styled.div`
  display: flex;
  justify-content: space-between;
  color: #cbd5e1;
  font-size: 0.68rem;
  font-weight: 700;
`;

const CostRange = styled.input`
  width: 100%;
  height: 18px;
  margin: 0;
  accent-color: #38bdf8;
  cursor: pointer;
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
