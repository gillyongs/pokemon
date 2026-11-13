import React from "react";
import styled, { keyframes } from "styled-components";
import { AugmentIcon } from "./AugmentIcon";

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const AugmentSynergyPreviewModal = ({ synergy, activeAugmentId = null, activePokemon = null, onClose }) => {
  if (!synergy) return null;

  const { buffAugment, requiredAugments = [], emoji, title } = synergy;

  // Count how many required augments activePokemon currently owns
  const ownedCount = requiredAugments.filter((a) => Boolean(activePokemon?.hasAugment?.(a.id))).length;
  const isSynergyActive = Boolean(activePokemon?.hasAugment?.(buffAugment?.id) || ownedCount === 3);

  return (
    <ModalOverlay
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <HeaderArea>
          <HeaderTopRow>
            <TitleRow>
              <SynergyEmoji>{emoji}</SynergyEmoji>
              <TitleCol>
                <SynergyTitle>{title}</SynergyTitle>
              </TitleCol>
            </TitleRow>
            <CloseButton type="button" onClick={onClose} title="닫기">
              ✕
            </CloseButton>
          </HeaderTopRow>
          <HeaderNotice>아래 증강을 모두 획득하면 추가 시너지가 활성화됩니다.</HeaderNotice>
        </HeaderArea>

        <RequiredGrid>
          {requiredAugments.map((aug) => {
            const isOwned = Boolean(activePokemon?.hasAugment?.(aug.id));
            const isViewing = aug.id === activeAugmentId;
            return (
              <AugmentRowCard key={aug.id} $isOwned={isOwned} $isViewing={isViewing}>
                <IconCol>
                  <AugmentIcon id={aug.id} size={36} pokemon={activePokemon} shiftUp={aug.shiftUp} imageOptions={aug.imageOptions} />
                  {aug.cost !== "-" && aug.cost !== undefined && <CostTag>{aug.cost} cost</CostTag>}
                </IconCol>
                <AugmentMeta>
                  <AugNameRow>
                    <AugName>{aug.name}</AugName>
                    <StatusBadge $isOwned={isOwned} $isViewing={isViewing}>
                      {isOwned ? "✓ 보유 중" : isViewing ? "선택 중" : "미보유"}
                    </StatusBadge>
                  </AugNameRow>
                  <AugDesc>{aug.desc}</AugDesc>
                </AugmentMeta>
              </AugmentRowCard>
            );
          })}
        </RequiredGrid>

        <ConnectorRow>
          <ConnectorLine />
          <ConnectorBadge>✨ 공명 달성 시 활성화 ✨</ConnectorBadge>
          <ConnectorLine />
        </ConnectorRow>

        {buffAugment && (
          <BuffRewardCard $active={isSynergyActive}>
            <BuffHeader>
              <IconCol>
                <AugmentIcon id={buffAugment.id} size={40} pokemon={activePokemon} shiftUp={buffAugment.shiftUp} imageOptions={buffAugment.imageOptions} />
              </IconCol>
              <BuffMeta>
                <BuffNameRow>
                  <BuffName>{buffAugment.name}</BuffName>
                  <BuffPill>시너지</BuffPill>
                  {isSynergyActive && <BuffActiveTag>★ 현재 활성화됨</BuffActiveTag>}
                </BuffNameRow>
                <BuffDesc>{buffAugment.desc}</BuffDesc>
              </BuffMeta>
            </BuffHeader>
          </BuffRewardCard>
        )}

        <FooterRow>
          <ConfirmCloseButton type="button" onClick={onClose}>
            닫기
          </ConfirmCloseButton>
        </FooterRow>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default AugmentSynergyPreviewModal;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.76);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10020;
  animation: ${fadeIn} 0.16s ease-out;
  padding: 14px;
  box-sizing: border-box;
  cursor: pointer;

  @media (max-width: 480px) {
    padding: 8px;
  }
`;

const ModalContainer = styled.div`
  background: rgba(15, 23, 42, 0.98);
  border: 1.5px solid rgba(100, 255, 218, 0.35);
  border-radius: 14px;
  padding: 18px 20px 16px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 16px 36px rgba(0, 0, 0, 0.9),
    0 0 24px rgba(100, 255, 218, 0.2);
  position: relative;
  box-sizing: border-box;
  cursor: default;
  color: #e2e8f0;
  animation: ${slideUp} 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #64ffda, #a855f7, #ffd700);
    border-radius: 14px 14px 0 0;
  }

  @media (max-width: 480px) {
    padding: 14px 12px 14px;
    max-height: 94vh;
  }
`;

const HeaderArea = styled.div`
  width: 100%;
  margin-bottom: 12px;
`;

const HeaderTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 6px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SynergyEmoji = styled.span`
  font-size: 1.7rem;
  line-height: 1;
  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.4));
`;

const TitleCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
`;

const SynergyTitle = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.3px;

  @media (max-width: 480px) {
    font-size: 1.05rem;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const HeaderNotice = styled.p`
  margin: 4px 0 0 0;
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.45;

  strong {
    color: #ffd700;
  }
`;

const RequiredGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 10px;
`;

const AugmentRowCard = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  background: ${(props) => (props.$isViewing ? "rgba(34, 56, 82, 0.85)" : props.$isOwned ? "rgba(22, 45, 40, 0.65)" : "rgba(15, 23, 42, 0.6)")};
  border: ${(props) => (props.$isViewing ? "1.5px solid #64ffda" : props.$isOwned ? "1px solid rgba(100, 255, 218, 0.4)" : "1px solid rgba(255, 255, 255, 0.08)")};
  box-shadow: ${(props) => (props.$isViewing ? "0 0 10px rgba(100, 255, 218, 0.3)" : "none")};
  transition: all 0.2s ease;
`;

const IconCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
`;

const CostTag = styled.span`
  font-size: 0.65rem;
  color: #64ffda;
  background: rgba(100, 255, 218, 0.1);
  padding: 1px 4px;
  border-radius: 3px;
  white-space: nowrap;
`;

const AugmentMeta = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  text-align: left;
`;

const AugNameRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 2px;
`;

const AugName = styled.span`
  font-size: 0.86rem;
  font-weight: 700;
  color: #ffffff;
  word-break: keep-all;
`;

const StatusBadge = styled.span`
  font-size: 0.68rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  white-space: nowrap;
  ${(props) =>
    props.$isOwned
      ? `
      background: rgba(100, 255, 218, 0.18);
      color: #64ffda;
      border: 1px solid rgba(100, 255, 218, 0.45);
    `
      : props.$isViewing
        ? `
      background: rgba(255, 215, 0, 0.18);
      color: #ffd700;
      border: 1px solid rgba(255, 215, 0, 0.45);
    `
        : `
      background: rgba(148, 163, 184, 0.1);
      color: #64748b;
      border: 1px solid rgba(148, 163, 184, 0.2);
    `}
`;

const AugDesc = styled.p`
  margin: 0;
  font-size: 0.74rem;
  color: #94a3b8;
  line-height: 1.35;
  word-break: keep-all;
`;

const ConnectorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 6px 0 10px;
`;

const ConnectorLine = styled.div`
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.5), rgba(255, 215, 0, 0.1));
`;

const ConnectorBadge = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  color: #ffd700;
  letter-spacing: 0.3px;
  white-space: nowrap;
`;

const BuffRewardCard = styled.div`
  padding: 12px;
  border-radius: 10px;
  background: ${(props) => (props.$active ? "linear-gradient(135deg, rgba(50, 42, 16, 0.95) 0%, rgba(22, 45, 64, 0.95) 100%)" : "linear-gradient(135deg, rgba(30, 24, 48, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)")};
  border: ${(props) => (props.$active ? "1.5px solid #ffd700" : "1.5px solid rgba(192, 132, 252, 0.45)")};
  box-shadow: ${(props) => (props.$active ? "0 0 16px rgba(255, 215, 0, 0.3), inset 0 0 8px rgba(255, 215, 0, 0.15)" : "0 4px 12px rgba(0, 0, 0, 0.4)")};
  margin-bottom: 14px;
  text-align: left;
`;

const BuffHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const BuffMeta = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const BuffNameRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 4px;
`;

const BuffName = styled.h3`
  margin: 0;
  font-size: 0.98rem;
  font-weight: 800;
  color: #fef08a;
  word-break: keep-all;
`;

const BuffPill = styled.span`
  font-size: 0.68rem;
  font-weight: 700;
  color: #ffd700;
  background: rgba(255, 215, 0, 0.15);
  border: 1px solid rgba(255, 215, 0, 0.4);
  padding: 1px 6px;
  border-radius: 4px;
`;

const BuffActiveTag = styled.span`
  font-size: 0.68rem;
  font-weight: 800;
  color: #64ffda;
  background: rgba(100, 255, 218, 0.2);
  border: 1px solid #64ffda;
  padding: 1px 6px;
  border-radius: 4px;
`;

const BuffDesc = styled.p`
  margin: 0;
  font-size: 0.78rem;
  color: #cbd5e1;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: keep-all;
`;

const FooterRow = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
`;

const ConfirmCloseButton = styled.button`
  padding: 8px 24px;
  background: rgba(100, 255, 218, 0.14);
  border: 1.5px solid #64ffda;
  border-radius: 8px;
  color: #64ffda;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #64ffda;
    color: #0f172a;
    box-shadow: 0 0 12px rgba(100, 255, 218, 0.5);
  }
`;
