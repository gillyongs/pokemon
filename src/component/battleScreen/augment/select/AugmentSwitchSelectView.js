import React, { useState } from "react";
import styled from "styled-components";
import { HeaderArea, HeaderTopRow, Title, SubTitleText, CloseButton, ButtonGroup, ActionButton } from "./selectStyles";

const AugmentSwitchSelectView = ({ switchSelectAug, activePokemon, battle, onSelect, onBack }) => {
  const [selectedBenchKey, setSelectedBenchKey] = useState(null);

  const benchEntries = ["playerBench1", "playerBench2"].map((key) => ({ key, poke: battle?.[key] })).filter((item) => Boolean(item.poke));

  const handleConfirm = (e) => {
    e?.stopPropagation();
    if (!selectedBenchKey) return;
    onSelect(switchSelectAug, {
      targetBenchKey: selectedBenchKey,
      targetPokemon: activePokemon,
    });
    setSelectedBenchKey(null);
  };

  const handleBack = (e) => {
    e?.stopPropagation();
    setSelectedBenchKey(null);
    if (onBack) onBack();
  };

  return (
    <>
      <HeaderArea>
        <HeaderTopRow>
          <Title>교체 할 포켓몬 선택</Title>
          <CloseButton onClick={handleBack} title="되돌아가기">
            ✕
          </CloseButton>
        </HeaderTopRow>
      </HeaderArea>

      <BenchList>
        {benchEntries.map(({ key, poke }) => {
          const isFainted = Boolean(poke.faint || poke.hp <= 0);
          const isSelected = selectedBenchKey === key;
          const maxHp = poke.maxHp || 1;
          const hpRatio = Math.max(0, Math.min(100, Math.round((poke.hp / maxHp) * 100)));
          const hpColor = hpRatio > 50 ? "#22c55e" : hpRatio > 20 ? "#eab308" : "#ef4444";

          return (
            <BenchCard
              key={key}
              $isSelected={isSelected}
              $disabled={isFainted}
              onClick={(e) => {
                e.stopPropagation();
                if (!isFainted) setSelectedBenchKey(key);
              }}
            >
              <SpriteBox>
                <PokemonImg
                  src={`/pokemon/img/pokemon/${poke.uniqueKey}.webp`}
                  alt={poke.name}
                  $fainted={isFainted}
                  onError={(e) => {
                    e.currentTarget.src = "/pokemon/img/pokemon/0000.webp";
                  }}
                />
              </SpriteBox>
              <InfoCol>
                <TopRow>
                  <PokeName>{poke.name}</PokeName>
                  <TypeRow>
                    {[poke.type1, poke.type2].filter(Boolean).map((type) => (
                      <TypeBadge key={type} src={`/pokemon/img/type/${type}.svg`} alt={type} title={type} />
                    ))}
                  </TypeRow>
                </TopRow>
                <HpBarTrack>
                  <HpBarFill $ratio={hpRatio} $color={hpColor} />
                </HpBarTrack>
                <BottomRow>
                  <HpText>
                    HP {Math.max(0, poke.hp)} / {maxHp}
                  </HpText>
                  <MetaText>
                    {poke.abil?.name || "-"} · {poke.item || "없음"}
                  </MetaText>
                </BottomRow>
              </InfoCol>
              {isFainted && <FaintedBadge>기절</FaintedBadge>}
            </BenchCard>
          );
        })}
      </BenchList>

      <ButtonGroup>
        <ActionButton $variant="back" onClick={handleBack}>
          뒤로가기
        </ActionButton>
        <ActionButton $variant="confirm" disabled={!selectedBenchKey} onClick={handleConfirm}>
          교체하기
        </ActionButton>
      </ButtonGroup>
    </>
  );
};

export default AugmentSwitchSelectView;

const BenchList = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
  width: 100%;
  margin: 0;
`;

const BenchCard = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 12px;
  background: ${(props) => (props.$isSelected ? "rgba(56, 189, 248, 0.16)" : "rgba(15, 23, 42, 0.72)")};
  border: 1.5px solid ${(props) => (props.$isSelected ? "#38bdf8" : "rgba(148, 163, 184, 0.25)")};
  box-shadow: ${(props) => (props.$isSelected ? "0 0 14px rgba(56, 189, 248, 0.28)" : "none")};
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.$disabled ? 0.5 : 1)};
  transition: all 0.18s ease;

  &:hover {
    ${(props) =>
      !props.$disabled &&
      `
      border-color: ${props.$isSelected ? "#38bdf8" : "rgba(148, 163, 184, 0.55)"};
      background: ${props.$isSelected ? "rgba(56, 189, 248, 0.2)" : "rgba(30, 41, 59, 0.85)"};
    `}
  }
`;

const SpriteBox = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
`;

const PokemonImg = styled.img`
  width: 50px;
  height: 50px;
  object-fit: contain;
  filter: ${(props) => (props.$fainted ? "grayscale(100%)" : "none")};
`;

const InfoCol = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const PokeName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #f8fafc;
`;

const TypeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TypeBadge = styled.img`
  width: 18px;
  height: 18px;
`;

const HpBarTrack = styled.div`
  width: 100%;
  height: 7px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.22);
  overflow: hidden;
`;

const HpBarFill = styled.div`
  width: ${(props) => props.$ratio}%;
  height: 100%;
  background: ${(props) => props.$color};
  transition: width 0.2s ease;
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: #cbd5e1;
`;

const HpText = styled.span`
  font-weight: 600;
  color: #e2e8f0;
`;

const MetaText = styled.span`
  color: #94a3b8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FaintedBadge = styled.span`
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  color: #fca5a5;
  font-size: 11px;
  font-weight: 700;
`;
