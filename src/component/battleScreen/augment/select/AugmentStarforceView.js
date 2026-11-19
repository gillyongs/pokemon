import React, { useState } from "react";
import styled, { keyframes, css } from "styled-components";
import { getArcaneSwordFullName } from "../../../../entity/Augment/AugmentData";
export { getArcaneSwordFullName };

export const getStarforceProb = (currentStar) => {
  if (currentStar >= 25) return 0;
  if (currentStar === 0) return 100;
  if (currentStar >= 1 && currentStar <= 19) {
    return 100 - currentStar * 5;
  }
  if (currentStar === 20) return 3;
  if (currentStar === 21) return 2;
  return 1; // 22, 23, 24성
};

export const isSafeStarforceLevel = (star) => [0, 5, 10, 15, 20].includes(star);

export const getStarforceCost = (currentStar) => (2 * currentStar + 1) * 10000;

const AugmentStarforceView = ({ starforceAug, activePokemon, onSelect, onCancel }) => {
  const swordAug = (activePokemon?.augments || []).find((a) => (typeof a === "string" ? a === "arcaneShadeSword" : a?.id === "arcaneShadeSword"));
  const initialStar = Number(swordAug?.arcaneStarCount ?? activePokemon?.arcaneStarCount ?? 0);
  const scrollCount = Number(swordAug?.arcaneSuccessCount ?? activePokemon?.arcaneSuccessCount ?? 0);
  const hasSoul = Boolean(swordAug?.hasGreatTuskSoul ?? activePokemon?.hasGreatTuskSoul);

  const [currentStar, setCurrentStar] = useState(initialStar);
  const [meso, setMeso] = useState(1000000);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const prob = getStarforceProb(currentStar);
  const cost = getStarforceCost(currentStar);
  const isSafe = isSafeStarforceLevel(currentStar);
  const isMaxStar = currentStar >= 25;
  const canAfford = meso >= cost && !isMaxStar;

  const currentFullName = getArcaneSwordFullName({ starCount: currentStar, hasSoul, scrollCount });

  const handleEnhance = (e) => {
    e?.stopPropagation();
    if (!canAfford || isEnhancing) return;

    setIsEnhancing(true);
    setAnimKey((prev) => prev + 1);

    const roll = Math.random() * 100;
    const isSuccess = roll < prob;

    setTimeout(() => {
      setMeso((prev) => Math.max(0, prev - cost));
      setAttemptCount((prev) => prev + 1);

      if (isSuccess) {
        const nextStar = currentStar + 1;
        setCurrentStar(nextStar);
        setLastResult({
          type: "success",
          text: `🎉 강화 성공! [★${nextStar}]성이 되었습니다!`,
        });
      } else {
        if (isSafe) {
          setLastResult({
            type: "keep",
            text: `🛡️ 강화 실패! [★${currentStar}] 단계가 유지되었습니다.`,
          });
        } else {
          const nextStar = Math.max(0, currentStar - 1);
          setCurrentStar(nextStar);
          setLastResult({
            type: "drop",
            text: `💥 강화 실패... [★${nextStar}]성으로 하락하였습니다.`,
          });
        }
      }

      setIsEnhancing(false);
    }, 350);
  };

  const handleClose = (e) => {
    e?.stopPropagation();
    if (attemptCount === 0) {
      if (onCancel) onCancel();
      return;
    }

    const finalName = getArcaneSwordFullName({ starCount: currentStar, hasSoul, scrollCount });
    if (onSelect) {
      onSelect(starforceAug, {
        targetPokemon: activePokemon,
        arcaneStarCount: currentStar,
        arcaneSwordName: finalName,
      });
    }
  };

  return (
    <WindowFrame>
      {/* Title Bar */}
      <WindowTitleBar>
        <WindowTitleText>EQUIPMENT ENCHANT</WindowTitleText>
      </WindowTitleBar>

      {/* Tabs */}
      <TabsRow>
        <TabButton $active={false}>주문서</TabButton>
        <TabButton $active={true}>스타포스 강화</TabButton>
        <TabButton $active={false}>장비전송</TabButton>
      </TabsRow>

      {/* Yellow Subtitle */}
      <SubtitleText>메소를 사용하여 장비를 강화합니다.</SubtitleText>

      {/* Center Enchant Box */}
      <EnchantArea>
        {/* Left equipment slot */}
        <EquipSlotCol>
          <EquipBox key={animKey} $status={lastResult?.type}>
            <EquipImg src="/pokemon/img/augment/arcaneShadeSword.png" alt="아케인셰이드 투핸드소드" />
            <DashedFrame />
          </EquipBox>
          <StarCountBadge>★ {currentStar}성</StarCountBadge>
        </EquipSlotCol>

        {/* Right Info Box */}
        <InfoCol>
          <TargetStepHeader>{isMaxStar ? "25성 (최대)" : `${currentStar}성  >  ${currentStar + 1}성`}</TargetStepHeader>

          {!isMaxStar ? (
            <>
              <InfoRow>
                <InfoLabel>성공확률:</InfoLabel>
                <InfoValue $color="#38bdf8">{prob.toFixed(1)}%</InfoValue>
              </InfoRow>

              <InfoRow>
                <InfoLabel>실패({isSafe ? "유지" : "하락"})확률:</InfoLabel>
                <InfoValue $color={isSafe ? "#fbbf24" : "#f87171"}>{(100 - prob).toFixed(1)}%</InfoValue>
              </InfoRow>

              <StatPreviewBox>
                <StatPreviewRow>
                  <StatName>공격 :</StatName>
                  <StatGain>+10</StatGain>
                </StatPreviewRow>
                <StatPreviewRow>
                  <StatName>특공 :</StatName>
                  <StatGain>+10</StatGain>
                </StatPreviewRow>
              </StatPreviewBox>
            </>
          ) : (
            <MaxStarText>★ 최고 단계에 도달했습니다! ★</MaxStarText>
          )}

          <CurrentTotalText>
            (총 스탯 보너스: 공격 +{currentStar * 10}, 특공 +{currentStar * 10})
          </CurrentTotalText>
        </InfoCol>
      </EnchantArea>

      {/* Weapon Name Display */}
      <WeaponNameBadge title={currentFullName}>{currentFullName}</WeaponNameBadge>

      {/* Meso Bars */}
      <CostSection>
        <MesoRow>
          <MesoLabelWrap>
            <MesoCoinIcon>●</MesoCoinIcon>
            <span>필요한 메소 :</span>
          </MesoLabelWrap>
          <MesoValueText $highlight={canAfford}>{isMaxStar ? "-" : `${cost.toLocaleString()} 메소`}</MesoValueText>
        </MesoRow>

        <MesoRow>
          <MesoLabelWrap>
            <MesoCoinIcon>●</MesoCoinIcon>
            <span>보유 메소 :</span>
          </MesoLabelWrap>
          <MesoValueText>{meso.toLocaleString()} 메소</MesoValueText>
        </MesoRow>
      </CostSection>

      {/* Result message banner */}
      {lastResult && <ResultBanner $type={lastResult.type}>{lastResult.text}</ResultBanner>}

      {/* Bottom Button Row */}
      <ButtonRow>
        <EnhanceButton type="button" disabled={!canAfford || isEnhancing} onClick={handleEnhance}>
          {isEnhancing ? "강화 중..." : "강화"}
        </EnhanceButton>

        <CloseButton type="button" disabled={isEnhancing} onClick={handleClose}>
          {attemptCount > 0 ? "완료" : "취소"}
        </CloseButton>
      </ButtonRow>
    </WindowFrame>
  );
};

export default AugmentStarforceView;

/* Keyframes */
const successFlash = keyframes`
  0% { transform: scale(0.95); filter: drop-shadow(0 0 6px #38bdf8); }
  50% { transform: scale(1.05); filter: drop-shadow(0 0 16px #fbbf24); }
  100% { transform: scale(1); filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.4)); }
`;

const failShake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  50% { transform: translateX(4px); }
  75% { transform: translateX(-3px); }
`;

/* Styled Components - Maple Equipment Enchant Theme */
const WindowFrame = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #25201c;
  border: 1.5px solid #4a3e35;
  border-radius: 8px;
  padding: 8px 12px 10px;
  box-sizing: border-box;
  color: #e5e5e5;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-shadow:
    inset 0 0 10px rgba(0, 0, 0, 0.6),
    0 8px 24px rgba(0, 0, 0, 0.8);
  user-select: none;
`;

const WindowTitleBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-bottom: 6px;
`;

const WindowTitleText = styled.span`
  font-size: 0.78rem;
  font-weight: 800;
  color: #fbbf24;
  letter-spacing: 0.5px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.9);
`;

const TabsRow = styled.div`
  display: flex;
  gap: 4px;
  width: 100%;
  margin-bottom: 6px;
`;

const TabButton = styled.div`
  flex: 1;
  text-align: center;
  padding: 4px 0;
  font-size: 0.72rem;
  font-weight: 700;
  border-radius: 4px;

  ${(props) =>
    props.$active
      ? css`
          background: #0284c7;
          color: #ffffff;
          border: 1px solid #38bdf8;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
        `
      : css`
          background: #383029;
          color: #a89c92;
          border: 1px solid #2b2520;
        `}
`;

const SubtitleText = styled.div`
  font-size: 0.72rem;
  font-weight: 600;
  color: #fde047;
  text-align: center;
  margin-bottom: 8px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
`;

const EnchantArea = styled.div`
  display: flex;
  gap: 12px;
  background: #1c1815;
  border: 1px solid #3a3129;
  border-radius: 6px;
  padding: 8px 10px;
  margin-bottom: 6px;
  box-sizing: border-box;
`;

const EquipSlotCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const EquipBox = styled.div`
  position: relative;
  width: 74px;
  height: 74px;
  background: #0ea5e9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.5);

  ${(props) =>
    props.$status === "success" &&
    css`
      animation: ${successFlash} 0.4s ease;
    `}

  ${(props) =>
    (props.$status === "drop" || props.$status === "keep") &&
    css`
      animation: ${failShake} 0.35s ease;
    `}
`;

const DashedFrame = styled.div`
  position: absolute;
  inset: 3px;
  border: 1.5px dashed rgba(255, 255, 255, 0.75);
  border-radius: 4px;
  pointer-events: none;
`;

const EquipImg = styled.img`
  width: 60px;
  height: 60px;
  object-fit: contain;
  z-index: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6));
`;

const StarCountBadge = styled.div`
  font-size: 0.74rem;
  font-weight: 800;
  color: #fbbf24;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.9);
`;

const InfoCol = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
  gap: 3px;
`;

const TargetStepHeader = styled.div`
  font-size: 0.8rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 2px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.7rem;
`;

const InfoLabel = styled.span`
  color: #cbd5e1;
`;

const InfoValue = styled.span`
  font-weight: 700;
  color: ${(props) => props.$color || "#ffffff"};
`;

const StatPreviewBox = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 3px;
  padding: 3px 6px;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 4px;
`;

const StatPreviewRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
`;

const StatName = styled.span`
  color: #94a3b8;
`;

const StatGain = styled.span`
  color: #4ade80;
  font-weight: 700;
`;

const MaxStarText = styled.div`
  color: #fbbf24;
  font-size: 0.74rem;
  font-weight: 800;
  text-align: center;
  padding: 10px 0;
`;

const CurrentTotalText = styled.div`
  font-size: 0.63rem;
  color: #94a3b8;
  margin-top: 2px;
`;

const WeaponNameBadge = styled.div`
  background: #171412;
  border: 1px solid #332b25;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #fde047;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 6px;
`;

const OptionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 4px;
  margin-bottom: 6px;
`;

const OptionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.66rem;
  color: #a89c92;
`;

const FakeCheckbox = styled.input`
  accent-color: #0284c7;
  cursor: default;
  margin: 0;
`;

const CostSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #191512;
  border: 1px solid #332b25;
  border-radius: 5px;
  padding: 6px 10px;
  margin-bottom: 6px;
`;

const MesoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.72rem;
`;

const MesoLabelWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: #e2e8f0;
`;

const MesoCoinIcon = styled.span`
  color: #eab308;
  font-size: 0.65rem;
`;

const MesoValueText = styled.span`
  font-weight: 700;
  color: ${(props) => (props.$highlight === false ? "#ef4444" : "#ffffff")};
`;

const ResultBanner = styled.div`
  font-size: 0.68rem;
  font-weight: 600;
  text-align: center;
  padding: 3px 6px;
  border-radius: 4px;
  margin-bottom: 6px;

  ${(props) =>
    props.$type === "success" &&
    css`
      background: rgba(34, 197, 94, 0.2);
      border: 1px solid rgba(74, 222, 128, 0.4);
      color: #86efac;
    `}

  ${(props) =>
    props.$type === "keep" &&
    css`
      background: rgba(234, 179, 8, 0.2);
      border: 1px solid rgba(250, 204, 21, 0.4);
      color: #fef08a;
    `}

  ${(props) =>
    props.$type === "drop" &&
    css`
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(248, 113, 113, 0.4);
      color: #fca5a5;
    `}
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: auto;
  width: 100%;
`;

const EnhanceButton = styled.button`
  flex: 1.3;
  padding: 8px 0;
  border-radius: 5px;
  font-size: 0.88rem;
  font-weight: 800;
  font-family: inherit;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  user-select: none;
  transition: all 0.15s ease;

  background: ${(props) => (props.disabled ? "#3f3a35" : "linear-gradient(180deg, #84cc16 0%, #65a30d 100%)")};
  border: 1px solid ${(props) => (props.disabled ? "#2b2520" : "#a3e635")};
  color: ${(props) => (props.disabled ? "#78716c" : "#ffffff")};
  text-shadow: ${(props) => (props.disabled ? "none" : "1px 1px 2px rgba(0, 0, 0, 0.8)")};

  &:hover {
    ${(props) =>
      !props.disabled &&
      `
      background: linear-gradient(180deg, #a3e635 0%, #65a30d 100%);
      transform: translateY(-1px);
    `}
  }

  &:active {
    ${(props) => !props.disabled && `transform: translateY(1px);`}
  }
`;

const CloseButton = styled.button`
  flex: 1;
  padding: 8px 0;
  border-radius: 5px;
  font-size: 0.84rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  user-select: none;
  transition: all 0.15s ease;

  background: linear-gradient(180deg, #52473e 0%, #3a322b 100%);
  border: 1px solid #6b5d52;
  color: #e5e5e5;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);

  &:hover {
    background: linear-gradient(180deg, #63574c 0%, #3a322b 100%);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px);
  }
`;
