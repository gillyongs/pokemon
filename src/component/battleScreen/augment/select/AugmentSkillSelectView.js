import React, { useState } from "react";
import styled from "styled-components";
import { josa } from "josa";
import { skillTypeCalculate } from "../../../../calc/skillTypeCalculate";
import { getTypeEffectText } from "../../../../calc/typeEffectCalculate";
import { isAttackSkill } from "../../../../entity/Skill/Skill";
import { getMaxMoveConfig, isEligibleBaseSkillForMaxMove, buildMaxMoveFromSkill } from "../../../../entity/Skill/maxMove";
import skillList from "../../../../entity/Skill/skillList";
import { HeaderArea, HeaderTopRow, Title, SubTitleText, CloseButton, ButtonGroup, ActionButton } from "./selectStyles";

const AugmentSkillSelectView = ({ skillSelectAug, activePokemon, battle, selectedType, isPeekMode, setIsPeekMode, onSelect, onBack }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const maxMoveConfig = getMaxMoveConfig(skillSelectAug);

  const getSubTitle = () => {
    if (maxMoveConfig) {
      return josa(`${maxMoveConfig.moveName}#{으로} 변경할 ${maxMoveConfig.type} 타입 기술을 선택해주세요.`);
    }
    if (skillSelectAug?.id === "choiceAndFocus") {
      return "위력을 1.5배로 강화할 공격 기술을 선택해주세요.";
    }
    if (skillSelectAug?.id === "teraBlast") {
      return `${selectedType || "노말"} 테라버스트와 교체할 기술을 선택해주세요.`;
    }
    if (skillSelectAug?.id === "nameIsSalamence") {
      return "지진과 교체할 기술을 선택해주세요.";
    }
    if (skillSelectAug?.id === "sanctuary") {
      return "생츄어리와 교체할 기술을 선택해주세요.";
    }
    return "용의춤과 교체할 기술을 선택해주세요.";
  };

  const getIncomingSkill = () => {
    if (maxMoveConfig) {
      const selectedBase = selectedSlot ? activePokemon?.skill?.[selectedSlot] : null;
      if (selectedBase && isEligibleBaseSkillForMaxMove(selectedBase, maxMoveConfig)) {
        return buildMaxMoveFromSkill(selectedBase, maxMoveConfig, selectedSlot);
      }
      return {
        name: maxMoveConfig.moveName,
        type: maxMoveConfig.type,
        power: "?",
        stype: null,
        pp: "-",
        isPendingMaxMove: true,
        originText: maxMoveConfig.effectDesc,
      };
    }
    if (skillSelectAug?.id === "teraBlast") {
      const base = skillList.search("테라버스트");
      return base ? { ...base, type: selectedType || "노말" } : null;
    }
    if (skillSelectAug?.id === "sanctuary") {
      return skillList.search("생츄어리");
    }
    if (skillSelectAug?.id === "nameIsSalamence") {
      return skillList.search("지진");
    }
    if (skillSelectAug?.id === "danceOfGarchomp") {
      return skillList.search("용의춤");
    }
    return null;
  };

  const incomingSkill = getIncomingSkill();
  const incomingType = incomingSkill ? (skillSelectAug?.id === "teraBlast" ? selectedType || "노말" : incomingSkill.type) : null;
  const incomingEffectText = incomingSkill && incomingType ? getTypeEffectText(battle, activePokemon, incomingSkill, incomingType) || "" : "";

  const handleConfirm = (e) => {
    e?.stopPropagation();
    if (!selectedSlot) return;
    const prevSkill = activePokemon?.skill?.[selectedSlot];
    onSelect(skillSelectAug, {
      chosenSlot: selectedSlot,
      chosenSkillName: prevSkill?.name || "기존 기술",
      replaceSlot: selectedSlot,
      targetPokemon: activePokemon,
      selectedType: selectedType || "노말",
      replacedSkillName: prevSkill?.name || "기존 기술",
    });
    setSelectedSlot(null);
  };

  const handleBack = (e) => {
    e?.stopPropagation();
    setSelectedSlot(null);
    if (onBack) onBack();
  };

  return (
    <>
      <HeaderArea>
        <HeaderTopRow>
          <Title>{skillSelectAug?.id === "choiceAndFocus" ? "강화할 공격 기술 선택" : "교체할 기술 선택"}</Title>
          <CloseButton onClick={handleBack} title="되돌아가기">
            ✕
          </CloseButton>
        </HeaderTopRow>
        <SubTitleText>{getSubTitle()}</SubTitleText>
      </HeaderArea>

      <SkillGrid>
        {[1, 2, 3, 4].map((slot) => {
          const sk = activePokemon?.skill?.[slot];
          if (!sk) return null;
          const currentPp = activePokemon?.pp?.[slot] ?? sk.pp;
          const displayType = skillTypeCalculate(battle, sk, activePokemon);
          const effectText = getTypeEffectText(battle, activePokemon, sk, displayType) || "";
          const isSelected = selectedSlot === slot;
          const isChoiceAndFocus = skillSelectAug?.id === "choiceAndFocus";
          const isAttack = isAttackSkill(sk);
          const isDisabled = maxMoveConfig ? !isEligibleBaseSkillForMaxMove(sk, maxMoveConfig) : isChoiceAndFocus && !isAttack;
          const disabledReason = maxMoveConfig ? "선택불가" : "선택 불가 (변화기)";
          const skillSubText = maxMoveConfig ? (
            <>
              위력 {sk.power} <StatDivider>•</StatDivider> {sk.stype === "atk" ? "물리" : "특수"}
            </>
          ) : (
            effectText || ""
          );

          return (
            <SkillCard
              key={slot}
              $isSelected={isSelected}
              $isPeek={isPeekMode}
              $disabled={isDisabled}
              onClick={(e) => {
                e.stopPropagation();
                if (isDisabled) return;
                if (isPeekMode) {
                  if (setIsPeekMode) setIsPeekMode(false);
                  return;
                }
                setSelectedSlot(slot);
              }}
            >
              <SkillTopRow>
                <SkillTypeIcon
                  src={`/pokemon/img/type/${displayType}.svg`}
                  alt={displayType}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <SkillName $len={sk.name?.length || 0} title={sk.name}>
                  {sk.name}
                </SkillName>
              </SkillTopRow>
              <SkillEffectText>{isDisabled ? disabledReason : skillSubText}</SkillEffectText>
              <SkillPP>
                {currentPp}/{sk.pp}
              </SkillPP>
            </SkillCard>
          );
        })}
      </SkillGrid>

      {incomingSkill && (
        <IncomingSkillSection>
          <IncomingDividerRow>
            <IncomingDividerLine />
            <IncomingBadge>획득 기술</IncomingBadge>
            <IncomingDividerLine />
          </IncomingDividerRow>

          <IncomingCardWrapper>
            <IncomingSkillCard $isSelected={Boolean(selectedSlot)} title={incomingSkill.originText || incomingSkill.text || ""}>
              <SkillTopRow>
                <SkillTypeIcon
                  src={`/pokemon/img/type/${incomingType}.svg`}
                  alt={incomingType}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <SkillName $len={incomingSkill.name?.length || 0} title={incomingSkill.name}>
                  {incomingSkill.name}
                </SkillName>
              </SkillTopRow>
              <SkillEffectText>
                {maxMoveConfig ? (
                  incomingSkill.isPendingMaxMove ? (
                    <></>
                  ) : (
                    <>
                      위력 {incomingSkill.power} <StatDivider>•</StatDivider> {incomingSkill.stype === "atk" ? "물리" : "특수"}
                    </>
                  )
                ) : (
                  incomingEffectText || (incomingSkill.stype === "buf" ? "변화기" : incomingSkill.power !== "-" ? `위력 ${incomingSkill.power}` : "")
                )}
              </SkillEffectText>
              <SkillPP>
                {incomingSkill.pp}/{incomingSkill.pp}
              </SkillPP>
            </IncomingSkillCard>
          </IncomingCardWrapper>
        </IncomingSkillSection>
      )}

      <ButtonGroup>
        <ActionButton type="button" $variant="back" onClick={handleBack}>
          되돌아가기
        </ActionButton>
        <ActionButton type="button" $variant="confirm" disabled={!selectedSlot} onClick={handleConfirm}>
          {skillSelectAug?.id === "choiceAndFocus" ? "선택" : "교체"}
        </ActionButton>
      </ButtonGroup>
    </>
  );
};

export default AugmentSkillSelectView;

const SkillGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  margin-top: 4px;
`;

const IncomingSkillSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 10px;
  box-sizing: border-box;
`;

const IncomingDividerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-bottom: 6px;
`;

const IncomingDividerLine = styled.div`
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(100, 255, 218, 0.25), transparent);
`;

const IncomingBadge = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  color: #64ffda;
  letter-spacing: 0.3px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const IncomingCardWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const IncomingSkillCard = styled.div`
  position: relative;
  width: calc(50% - 5px);
  min-width: 130px;
  background: ${(props) => (props.$isSelected ? "rgba(22, 45, 64, 0.95)" : "rgba(18, 24, 35, 0.85)")};
  border: ${(props) => (props.$isSelected ? "2px solid #64ffda" : "1px solid rgba(255, 255, 255, 0.15)")};
  border-radius: 8px;
  padding: 10px 10px 28px 10px;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  opacity: ${(props) => (props.$isSelected ? 1 : 0.35)};
  filter: ${(props) => (props.$isSelected ? "none" : "grayscale(0.85)")};
  box-sizing: border-box;
  user-select: none;
  transition: all 0.2s ease;
  overflow: hidden;
  box-shadow: ${(props) => (props.$isSelected ? "0 0 14px rgba(100, 255, 218, 0.45), inset 0 0 8px rgba(100, 255, 218, 0.15)" : "0 2px 8px rgba(0, 0, 0, 0.4)")};
`;

const IncomingNewPill = styled.span`
  font-size: 0.6rem;
  font-weight: 800;
  color: #0f172a;
  background: #64ffda;
  padding: 1px 4px;
  border-radius: 3px;
  letter-spacing: 0.5px;
  line-height: 1.2;
  flex-shrink: 0;
`;

const SkillCard = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
  background: ${(props) => (props.$isSelected ? "rgba(22, 45, 64, 0.95)" : "rgba(18, 24, 35, 0.85)")};
  border: ${(props) => (props.$isSelected ? "2px solid #64ffda" : "1px solid rgba(255, 255, 255, 0.15)")};
  border-radius: 8px;
  padding: 10px 10px 28px 10px;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.$disabled ? 0.35 : 1)};
  filter: ${(props) => (props.$disabled ? "grayscale(0.85)" : "none")};
  box-sizing: border-box;
  user-select: none;
  transition: all 0.2s ease;
  overflow: hidden;
  box-shadow: ${(props) => (props.$isSelected ? "0 0 14px rgba(100, 255, 218, 0.45), inset 0 0 8px rgba(100, 255, 218, 0.15)" : "0 2px 8px rgba(0, 0, 0, 0.4)")};

  &:hover {
    transform: ${(props) => (props.$isPeek || props.$disabled ? "none" : "translateY(-2px)")};
    border-color: ${(props) => (props.$disabled ? "rgba(255, 255, 255, 0.15)" : props.$isSelected ? "#64ffda" : "rgba(100, 255, 218, 0.5)")};
    background: ${(props) => (props.$disabled ? "rgba(18, 24, 35, 0.85)" : props.$isSelected ? "rgba(22, 45, 64, 0.98)" : "rgba(20, 30, 44, 0.8)")};
  }

  &:active {
    transform: ${(props) => (props.$disabled ? "none" : "scale(0.98)")};
  }
`;

const SkillTopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-width: 0;
`;

const SkillTypeIcon = styled.img`
  width: 26px;
  height: 26px;
  border-radius: 5px;
  object-fit: contain;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
`;

const SkillName = styled.span`
  flex: 1;
  min-width: 0;
  font-size: ${({ $len }) => ($len >= 7 ? "0.78rem" : $len >= 6 ? "0.84rem" : "0.95rem")};
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.2px;
`;

const SkillEffectText = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: #ffffff;
  margin-top: 6px;
  min-height: 18px;
  line-height: 1.2;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  width: 100%;
  min-width: 0;
  word-break: break-all;
`;

const StatDivider = styled.span`
  color: #ccc;
  font-size: 0.7rem;
`;

const SkillPP = styled.div`
  position: absolute;
  bottom: 5px;
  right: 5px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #ffffff;
  background-color: #665f5f;
  border-radius: 4px;
  padding: 1px 5px;
  letter-spacing: 0.5px;
  line-height: 1.3;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
`;
