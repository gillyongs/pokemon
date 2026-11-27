import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { abilObject } from "../../../../entity/Ability";
import { drawScoutCandidates } from "../../../../entity/Augment/scoutCandidates";
import { getItemDesc } from "../../../../entity/Item";
import TradeInfoModal from "../../TradeInfoModal";

const AugmentScoutView = ({ scoutAug, team, battle, onSelect, onCancel }) => {
  const [candidates] = useState(() => drawScoutCandidates(team, 10));
  const [phase, setPhase] = useState("field");
  const [isReady, setIsReady] = useState(false);
  const [selectionStep, setSelectionStep] = useState("candidate");
  const [selectedSampleName, setSelectedSampleName] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [isTargetInfoOpen, setIsTargetInfoOpen] = useState(false);
  const [detailText, setDetailText] = useState({ title: "상세 설명", text: "기술·특성·도구를 누르면 설명을 확인할 수 있습니다." });
  const selectedPokemon = candidates.find((candidate) => candidate.sampleName === selectedSampleName) || null;

  useEffect(() => {
    const timers = [window.setTimeout(() => setPhase("zoom"), 1300), window.setTimeout(() => setPhase("silhouette"), 2500), window.setTimeout(() => setPhase("choices"), 4000), window.setTimeout(() => setIsReady(true), 5500)];
    return () => timers.forEach(window.clearTimeout);
  }, []);

  const handleConfirm = () => {
    if (!selectedPokemon || !onSelect) return;
    if (selectionStep === "candidate") {
      setSelectionStep("team");
      return;
    }
    if (!selectedTarget) return;
    onSelect(scoutAug, {
      targetPokemon: selectedTarget,
      selectedSampleName: selectedPokemon.sampleName,
      scoutCandidateNames: candidates.map((candidate) => candidate.sampleName),
    });
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const handleBack = () => {
    setSelectionStep("candidate");
    setSelectedTarget(null);
    setIsTargetInfoOpen(false);
  };

  const pokemonSummary = selectedPokemon && (
    <PokemonSummary>
      <PokemonHeading>
        <PokemonName>{selectedPokemon.name}</PokemonName>
        <TypeList>
          {[selectedPokemon.type1, selectedPokemon.type2].filter(Boolean).map((type) => (
            <TypeIcon key={type} src={`/pokemon/img/type/${type}.svg`} alt={type} title={type} />
          ))}
        </TypeList>
      </PokemonHeading>
      <StatsGrid>
        {[
          ["HP", "hp"],
          ["공격", "atk"],
          ["방어", "def"],
          ["특공", "catk"],
          ["특방", "cdef"],
          ["스피드", "speed"],
        ].map(([label, key]) => {
          const value = (key === "hp" ? selectedPokemon.hp : selectedPokemon.stat?.[key]) ?? "-";
          let natureChange = null;
          if (selectedPokemon.nature?.up === key) natureChange = "up";
          else if (selectedPokemon.nature?.down === key) natureChange = "down";
          return (
            <StatItem key={key}>
              <StatLabel>{label}</StatLabel>
              <NatureIndicator $change={natureChange} title={natureChange === "up" ? "성격 상승" : natureChange === "down" ? "성격 하락" : undefined} aria-label={natureChange === "up" ? "성격 상승" : natureChange === "down" ? "성격 하락" : undefined}>
                {natureChange === "up" ? "⩓" : natureChange === "down" ? "⩔" : ""}
              </NatureIndicator>
              <StatValue>{value}</StatValue>
              <StatMeter>
                <StatFill $value={(Math.min(Number(selectedPokemon.evs?.[key]) || 0, 252) / 252) * 100} />
              </StatMeter>
            </StatItem>
          );
        })}
      </StatsGrid>
      <ItemInfoRow
        type="button"
        aria-label={`지닌물건 ${selectedPokemon.item || "없음"} 설명`}
        onClick={() =>
          setDetailText({
            title: `[지닌물건] ${selectedPokemon.item || "없음"}`,
            text: selectedPokemon.item ? getItemDesc(selectedPokemon.item, selectedPokemon) : "지닌 도구가 없습니다.",
          })
        }
      >
        <ItemLabel>지닌물건</ItemLabel>
        <ItemValueRow>
          <ItemIcon
            src={selectedPokemon.item ? `/pokemon/img/item/${selectedPokemon.item}.webp` : "/pokemon/img/item/null.webp"}
            alt=""
            onError={(event) => {
              if (!event.currentTarget.src.endsWith("/null.webp")) event.currentTarget.src = "/pokemon/img/item/null.webp";
            }}
          />
          <ItemName>{selectedPokemon.item || "없음"}</ItemName>
        </ItemValueRow>
      </ItemInfoRow>
    </PokemonSummary>
  );

  const skillSummary = selectedPokemon && (
    <SkillSummary>
      <SkillHeading>기술배치</SkillHeading>
      {[1, 2, 3, 4].map((slot) => {
        const skill = selectedPokemon.skill?.[slot];
        return (
          <SkillRow
            key={slot}
            type="button"
            onClick={() => {
              const category = skill?.stype === "atk" ? "물리" : skill?.stype === "catk" ? "특수" : "변화";
              const description = skill?.originText || skill?.text || "기술 설명이 없습니다.";
              setDetailText({
                title: `[기술] ${skill?.name || "기술 없음"}`,
                text: `위력 ${skill?.power ?? "-"} · 명중 ${skill?.accur ?? "-"} · PP ${skill?.pp ?? "-"} · ${category}\n${description}`,
              });
            }}
          >
            {skill?.type && (
              <SkillTypeIcon
                src={`/pokemon/img/type/${skill.type}.svg`}
                alt={skill.type}
                title={skill.type}
                onError={(event) => {
                  event.currentTarget.style.visibility = "hidden";
                }}
              />
            )}
            <SkillName>{skill?.name || "기술 없음"}</SkillName>
          </SkillRow>
        );
      })}
      <DetailCard>
        <DetailBadge>특성</DetailBadge>
        <InfoButton
          type="button"
          onClick={() =>
            setDetailText({
              title: `[특성] ${selectedPokemon.abil?.name || "없음"}`,
              text: selectedPokemon.abil?.text || abilObject[selectedPokemon.abil?.name]?.text || "특성 설명이 없습니다.",
            })
          }
        >
          {selectedPokemon.abil?.name || "없음"}
        </InfoButton>
      </DetailCard>
    </SkillSummary>
  );

  return (
    <>
      <ViewWrapper>
        <TopBar>
          <Eyebrow>POKÉMON SCOUT</Eyebrow>
        </TopBar>

        <ScoutScene>
          <SceneCamera $phase={phase}>
            <SceneSky />
            <FarHills />
            <SceneField />
            <MysterySilhouette $visible={!selectedPokemon && (phase === "silhouette" || phase === "choices")}>
              <svg viewBox="0 0 120 150" role="img" aria-label="정체를 알 수 없는 포켓몬의 실루엣">
                <path d="M35 113 31 52 16 15 13 7 28 16 43 41 52 34 63 36 83 11 97 5 92 20 85 48 89 98 105 122 95 143 31 142 20 128Z" fill="#08111f" />
                <path d="M45 42 57 47 69 44 80 38" fill="none" stroke="#08111f" strokeWidth="8" strokeLinecap="round" />
              </svg>
            </MysterySilhouette>
            <Bush $phase={phase}>
              {Array.from({ length: 11 }, (_, index) => (
                <BushLeaf key={index} $index={index} />
              ))}
            </Bush>
            {phase === "silhouette" && !selectedPokemon && (
              <FloatingLeaves aria-hidden="true">
                {Array.from({ length: 6 }, (_, index) => (
                  <FloatingLeaf key={index} $index={index} />
                ))}
              </FloatingLeaves>
            )}
          </SceneCamera>
          {selectedPokemon && (
            <SelectedStage>
              {pokemonSummary}
              <StagePokemon
                src={`/pokemon/img/pokemon/${selectedPokemon.img_id || selectedPokemon.uniqueKey}.webp`}
                alt={selectedPokemon.name}
                onError={(event) => {
                  if (selectedPokemon.img_id && event.currentTarget.src.includes(`/${selectedPokemon.img_id}.webp`)) {
                    event.currentTarget.src = `/pokemon/img/pokemon/${selectedPokemon.uniqueKey}.webp`;
                  } else {
                    event.currentTarget.src = "/pokemon/img/pokemon/0000.webp";
                  }
                }}
              />
              {skillSummary}
            </SelectedStage>
          )}
          {!selectedPokemon && (
            <>
              <SceneLabel $phase={phase}>{phase === "field" ? "수풀을 살펴보는 중..." : phase === "zoom" ? "풀숲에서 인기척이 느껴진다..." : phase === "silhouette" ? "무언가 나타났다!" : "발견한 포켓몬 중 한 마리를 선택하세요"}</SceneLabel>
              <SceneCaption>{phase === "choices" ? "새로운 동료를 선택하세요" : " "}</SceneCaption>
            </>
          )}
        </ScoutScene>

        <ResultsSection>
          {selectionStep === "candidate" ? (
            <ResultsGrid>
              {candidates.map((candidate, index) => {
                const isSelected = selectedSampleName === candidate.sampleName;
                return (
                  <CardSlot key={candidate.sampleName}>
                    <ScoutCard
                      type="button"
                      $selected={isSelected}
                      disabled={!isReady}
                      onClick={() => {
                        setSelectedSampleName(candidate.sampleName);
                        setDetailText({ title: `${candidate.name} 정보`, text: "기술·특성·도구를 누르면 자세한 설명을 확인할 수 있습니다." });
                      }}
                      title={isReady ? `${candidate.name} 선택` : "정찰 중"}
                    >
                      <CardInner $revealed={phase === "choices" || isReady} $delay={index * 100}>
                        <CardBack aria-hidden="true">
                          <BallMark />
                          <QuestionMark>?</QuestionMark>
                        </CardBack>
                        <CardFront>
                          <CardImage
                            src={`/pokemon/img/pokemon/${candidate.img_id || candidate.uniqueKey}.webp`}
                            alt=""
                            onError={(event) => {
                              if (candidate.img_id && event.currentTarget.src.includes(`/${candidate.img_id}.webp`)) {
                                event.currentTarget.src = `/pokemon/img/pokemon/${candidate.uniqueKey}.webp`;
                              } else {
                                event.currentTarget.src = "/pokemon/img/pokemon/0000.webp";
                              }
                            }}
                          />
                          <CardName>{candidate.name}</CardName>
                        </CardFront>
                      </CardInner>
                    </ScoutCard>
                  </CardSlot>
                );
              })}
            </ResultsGrid>
          ) : (
            <TeamSelection>
              <TeamSelectionTitle>교체할 포켓몬을 선택하세요.</TeamSelectionTitle>
              <TeamPokemonGrid>
                {team.map((pokemon, index) => (
                  <TeamPokemonSlot key={pokemon.originalIndex ?? pokemon.id ?? index} $selected={selectedTarget === pokemon}>
                    <TeamPokemonButton type="button" $selected={selectedTarget === pokemon} disabled={!isReady} aria-pressed={selectedTarget === pokemon} aria-label={`교체할 포켓몬 ${pokemon.name} 선택`} onClick={() => setSelectedTarget(pokemon)}>
                      <TeamPokemonImage
                        src={`/pokemon/img/pokemon/${pokemon.img_id || pokemon.uniqueKey || pokemon.dexNo}.webp`}
                        alt=""
                        onError={(event) => {
                          event.currentTarget.src = "/pokemon/img/pokemon/0000.webp";
                        }}
                      />
                      <TeamPokemonName>{pokemon.name}</TeamPokemonName>
                      <TeamHpBar>
                        <TeamHpFill $ratio={Math.max(0, Math.min(100, (pokemon.hp / (pokemon.maxHp || 1)) * 100))} />
                        <TeamHpValue>
                          {pokemon.hp}/{pokemon.maxHp}
                        </TeamHpValue>
                      </TeamHpBar>
                    </TeamPokemonButton>
                    {selectedTarget === pokemon && (
                      <TeamInfoOverlay>
                        <TeamInfoButton type="button" onClick={() => setIsTargetInfoOpen(true)}>
                          상세정보
                        </TeamInfoButton>
                      </TeamInfoOverlay>
                    )}
                  </TeamPokemonSlot>
                ))}
              </TeamPokemonGrid>
            </TeamSelection>
          )}
        </ResultsSection>

        <DescriptionBox>
          <DescriptionTitle>{detailText.title}</DescriptionTitle>
          <DescriptionText>{detailText.text}</DescriptionText>
        </DescriptionBox>

        <Footer>
          <CancelButton type="button" onClick={selectionStep === "team" ? handleBack : handleCancel}>
            {selectionStep === "team" ? "되돌아가기" : "포기"}
          </CancelButton>
          <ConfirmButton type="button" disabled={!selectedPokemon || !isReady || (selectionStep === "team" && !selectedTarget)} onClick={handleConfirm}>
            스카우트
          </ConfirmButton>
        </Footer>
      </ViewWrapper>
      {isTargetInfoOpen && selectedTarget && <TradeInfoModal pokemon={selectedTarget} pokemonList={team} battle={battle} onClose={() => setIsTargetInfoOpen(false)} />}
    </>
  );
};

export default AugmentScoutView;

const revealCard = keyframes`
  0% { opacity: 0.2; transform: perspective(500px) rotateY(180deg) scale(0.82); }
  100% { opacity: 1; transform: perspective(500px) rotateY(0) scale(1); }
`;

const leavesFly = keyframes`
  0% { opacity: 0; transform: translateY(28px) rotate(0deg) scale(0.5); }
  30% { opacity: 0.95; }
  100% { opacity: 0; transform: translateY(-85px) rotate(250deg) scale(1.15); }
`;

const ViewWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100%;
  padding-bottom: 120px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 9px;
  color: #f8fafc;
`;

const ScoutScene = styled.div`
  position: relative;
  height: 200px;
  flex: 0 0 180px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 13px;
  background: #79b958;
  box-shadow:
    inset 0 -15px 25px rgba(20, 83, 45, 0.38),
    0 5px 16px rgba(2, 6, 23, 0.28);
`;

const TopBar = styled.div`
  min-height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Eyebrow = styled.div`
  color: #d9f99d;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.2em;
`;

const SceneCamera = styled.div`
  position: absolute;
  inset: 0;
  transform: ${(props) => {
    if (props.$phase === "zoom" || props.$phase === "silhouette") return "scale(1.48)";
    if (props.$phase === "choices") return "scale(1.12)";
    return "scale(1)";
  }};
  transform-origin: 50% 78%;
  transition: transform 1.438s cubic-bezier(0.18, 0.72, 0.24, 1);
`;

const SceneSky = styled.div`
  position: absolute;
  inset: 0 0 40% 0;
  background: radial-gradient(circle at 71% 21%, rgba(255, 255, 255, 0.8) 0 3px, transparent 4px), radial-gradient(ellipse at 48% 10%, rgba(255, 255, 255, 0.7), transparent 34%), linear-gradient(180deg, #6bbcf0, #c8effc);
`;

const FarHills = styled.div`
  position: absolute;
  left: -4%;
  right: -4%;
  bottom: 34%;
  height: 30%;
  background: radial-gradient(ellipse at 12% 100%, #a67ca5 0 12%, transparent 12.5%), radial-gradient(ellipse at 30% 105%, #b38caf 0 16%, transparent 16.5%), radial-gradient(ellipse at 76% 105%, #ad83a7 0 15%, transparent 15.5%), linear-gradient(180deg, transparent, rgba(128, 113, 127, 0.4));
`;

const SceneField = styled.div`
  position: absolute;
  inset: 55% 0 0;
  background: linear-gradient(174deg, transparent 0 18%, rgba(241, 178, 98, 0.95) 18.5% 42%, transparent 43%), linear-gradient(180deg, #b5d77b 0 25%, #7dbb50 26% 52%, #488540 53%);
`;

const MysterySilhouette = styled.div`
  position: absolute;
  z-index: 3;
  left: 50%;
  bottom: 8%;
  width: 82px;
  height: 112px;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transform: translateX(-50%) translateY(${(props) => (props.$visible ? "0" : "24px")}) scale(${(props) => (props.$visible ? 1 : 0.72)});
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.22));
  transition:
    opacity 0.375s ease,
    transform 0.75s cubic-bezier(0.18, 0.72, 0.24, 1);

  svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }
`;

const SelectedStage = styled.div`
  position: absolute;
  z-index: 5;
  inset: 0;
`;

const StagePokemon = styled.img`
  position: absolute;
  z-index: 1;
  left: 50%;
  bottom: -3%;
  width: 37%;
  height: 86%;
  margin-left: -18.5%;
  object-fit: contain;
  filter: drop-shadow(0 5px 5px rgba(15, 23, 42, 0.45));
  animation: ${revealCard} 0.438s ease-out both;
`;

const Bush = styled.div`
  position: absolute;
  z-index: 4;
  left: 50%;
  bottom: -9%;
  width: 230px;
  height: 100px;
  border-radius: 52% 48% 0 0;
  background: radial-gradient(ellipse at 48% 29%, #93c94b 0 9%, transparent 10%), radial-gradient(ellipse at 32% 57%, #579b36 0 18%, transparent 19%), radial-gradient(ellipse at 69% 52%, #4f9634 0 21%, transparent 22%), radial-gradient(ellipse at 50% 76%, #397b35 0 41%, transparent 42%);
  transform: translateX(-50%) scale(${(props) => (props.$phase === "silhouette" ? 1.08 : 1)});
  transform-origin: center bottom;
  transition: transform 0.625s ease;
`;

const BushLeaf = styled.span`
  position: absolute;
  z-index: 1;
  left: ${(props) => `${[6, 17, 26, 38, 48, 57, 68, 78, 88, 34, 63][props.$index]}%`};
  top: ${(props) => `${[43, 26, 57, 31, 16, 49, 24, 40, 58, 68, 69][props.$index]}%`};
  width: ${(props) => `${[20, 24, 18, 26, 23, 21, 28, 22, 18, 17, 19][props.$index]}px`};
  height: ${(props) => `${[13, 16, 12, 16, 14, 13, 17, 14, 12, 11, 12][props.$index]}px`};
  border-radius: 90% 8% 90% 8%;
  background: ${(props) => ["#3c7c32", "#5a9e3b", "#6eaa3e", "#438b35", "#76b548"][props.$index % 5]};
  transform: rotate(${(props) => `${[-24, 18, 32, -38, 11, 43, -18, 28, -32, 54, -46][props.$index]}deg`});
  box-shadow: inset 2px 1px 2px rgba(221, 255, 176, 0.22);
`;

const FloatingLeaves = styled.div`
  position: absolute;
  z-index: 5;
  inset: 0;
  pointer-events: none;
`;

const FloatingLeaf = styled.i`
  position: absolute;
  left: ${(props) => `${[19, 30, 43, 58, 72, 83][props.$index]}%`};
  bottom: 25%;
  width: 13px;
  height: 20px;
  border-radius: 90% 5% 90% 5%;
  background: ${(props) => (props.$index % 2 ? "#b5d957" : "#6fb849")};
  box-shadow: 0 0 10px rgba(221, 255, 176, 0.65);
  animation: ${leavesFly} 1.438s ease-out ${(props) => `${props.$index * 0.15}s`} both;
`;

const SceneLabel = styled.div`
  position: absolute;
  z-index: 2;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 5px 11px;
  border-radius: 4px;
  background: rgba(15, 23, 42, 0.82);
  color: white;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
`;

const SceneCaption = styled.div`
  position: absolute;
  z-index: 3;
  bottom: 5px;
  left: 0;
  width: 100%;
  color: white;
  font-size: 10px;
  font-weight: 700;
  text-align: center;
  text-shadow: 0 1px 4px rgba(15, 23, 42, 0.85);
`;

const ResultsSection = styled.div`
  flex: 0 0 auto;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
`;

const TeamSelection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TeamSelectionTitle = styled.div`
  color: #d9f99d;
  font-size: 12px;
  font-weight: 900;
  text-align: center;
`;

const TeamPokemonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
`;

const TeamPokemonSlot = styled.div`
  position: relative;
  min-width: 0;
  border: 1px solid ${(props) => (props.$selected ? "#64ffda" : "rgba(255, 255, 255, 0.12)")};
  border-radius: 8px;
  background: ${(props) => (props.$selected ? "rgba(20, 48, 64, 0.95)" : "rgba(255, 255, 255, 0.05)")};
  box-shadow: ${(props) => (props.$selected ? "0 0 10px rgba(100, 255, 218, 0.35)" : "none")};
`;

const TeamPokemonButton = styled.button`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 3px;
  width: 100%;
  min-width: 0;
  min-height: 102px;
  padding: 6px 5px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: #f8fafc;
  cursor: ${(props) => (props.disabled ? "wait" : "pointer")};
  text-align: center;
  box-sizing: border-box;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.06);
  }
`;

const TeamInfoOverlay = styled.div`
  position: absolute;
  z-index: 1;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  pointer-events: none;
`;

const TeamInfoButton = styled.button`
  padding: 6px 12px;
  border: 1px solid rgba(125, 211, 252, 0.8);
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.78);
  color: #64ffda;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
  pointer-events: auto;
  box-shadow:
    0 2px 10px rgba(0, 0, 0, 0.6),
    0 0 8px rgba(100, 255, 218, 0.25);

  &:hover {
    background: rgba(100, 255, 218, 0.9);
    color: #0f172a;
  }
`;

const TeamPokemonImage = styled.img`
  width: 56px;
  height: 56px;
  object-fit: contain;
`;

const TeamPokemonName = styled.span`
  max-width: 100%;
  overflow: hidden;
  font-size: 11px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
`;

const TeamHpBar = styled.div`
  position: relative;
  width: 100%;
  height: 16px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.8);
  background: #e2e8f0;
  box-sizing: border-box;
`;

const TeamHpFill = styled.div`
  width: ${(props) => `${props.$ratio}%`};
  height: 100%;
  background: ${(props) => (props.$ratio <= 25 ? "#ff4747" : props.$ratio <= 50 ? "#ffd447" : "#81ff47")};
  transition: width 0.313s ease;
`;

const TeamHpValue = styled.span`
  position: absolute;
  inset: 0 5px 0 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: #0f172a;
  font-size: 11px;
  font-weight: 900;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.65);
`;

const CardSlot = styled.div`
  position: relative;
  min-width: 0;
  box-sizing: border-box;
`;

const ScoutCard = styled.button`
  width: 100%;
  min-width: 0;
  height: 62px;
  padding: 0;
  overflow: hidden;
  border: 2px solid ${(props) => (props.$selected ? "#ffe968" : "rgba(238, 230, 255, 0.92)")};
  border-radius: 7px;
  background: ${(props) => (props.$selected ? "linear-gradient(145deg, #eaff83, #78e34f)" : "linear-gradient(145deg, #f5f6f7, #dfe2e6)")};
  box-shadow: ${(props) => (props.$selected ? "0 0 12px rgba(217, 249, 157, 0.75)" : "0 2px 6px rgba(2, 6, 23, 0.25)")};
  cursor: ${(props) => (props.disabled ? "wait" : "pointer")};
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    border-color: ${(props) => (props.$selected ? "#ffe968" : "#dfceff")};
  }
`;

const CardInner = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s ease ${(props) => `${props.$delay}ms`};
  transform: ${(props) => (props.$revealed ? "rotateY(180deg)" : "rotateY(0)")};
`;

const CardBack = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: #59616c;
  background: linear-gradient(145deg, #f5f6f7, #dfe2e6);
  backface-visibility: hidden;
`;

const BallMark = styled.div`
  position: relative;
  width: 28px;
  height: 28px;
  border: 2px solid #252525;
  border-radius: 50%;
  background: linear-gradient(180deg, #ed4545 0 46%, #252525 47% 54%, #fff 55% 100%);
  box-shadow: 0 1px 3px rgba(80, 57, 28, 0.35);

  &::after {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    border: 2px solid #252525;
    border-radius: 50%;
    background: #fff;
    content: "";
    transform: translate(-50%, -50%);
  }
`;

const QuestionMark = styled.div`
  font-size: 19px;
  font-weight: 900;
`;

const CardFront = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3px;
  transform: rotateY(180deg);
  backface-visibility: hidden;
`;

const CardImage = styled.img`
  width: 78%;
  height: 68%;
  object-fit: contain;
`;

const CardName = styled.div`
  width: 100%;
  overflow: hidden;
  color: #0f172a;
  font-size: clamp(8px, 2.2vw, 10px);
  font-weight: 800;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PokemonSummary = styled.div`
  position: absolute;
  z-index: 2;
  top: 13%;
  bottom: 5%;
  left: 1.5%;
  width: 32%;
  min-width: 0;
  padding: 5px;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto minmax(0, 1fr);
  gap: 5px;
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid rgba(205, 200, 255, 0.9);
  border-radius: 7px;
  background: linear-gradient(145deg, rgba(91, 87, 164, 0.96), rgba(54, 59, 119, 0.96));
  box-shadow:
    inset 0 1px 4px rgba(224, 222, 255, 0.35),
    0 2px 6px rgba(12, 21, 53, 0.38);
  animation: ${revealCard} 0.35s ease-out both;
`;

const PokemonHeading = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  width: 100%;
  min-width: 0;
  align-self: start;
`;

const PokemonName = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: #fff;
  font-size: 9px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TypeList = styled.div`
  display: flex;
  flex: 0 0 auto;
  gap: 2px;
`;

const TypeIcon = styled.img`
  width: 14px;
  height: 14px;
  object-fit: contain;
`;

const StatsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  align-self: center;
  transform: translateY(-4px);
`;

const StatItem = styled.div`
  min-width: 0;
  display: grid;
  grid-template-columns: 31px 10px 22px minmax(0, 1fr);
  align-items: center;
  gap: 1px;
  padding: 1px;
  border-radius: 3px;
  background: rgba(40, 43, 102, 0.55);
`;

const StatLabel = styled.span`
  overflow: hidden;
  color: #e2e4ff;
  font-size: 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const NatureIndicator = styled.span`
  color: ${(props) => (props.$change === "up" ? "#ff8e52" : props.$change === "down" ? "#58d9f2" : "transparent")};
  font-size: 9px;
  font-weight: 900;
  line-height: 1;
  text-align: center;
`;

const StatValue = styled.span`
  color: #fff;
  font-size: 8px;
  font-weight: 800;
`;

const StatMeter = styled.span`
  height: 5px;
  overflow: hidden;
  border-radius: 3px;
  background: rgba(16, 24, 66, 0.75);
`;

const StatFill = styled.span`
  display: block;
  width: ${(props) => `${props.$value}%`};
  height: 100%;
  border-radius: inherit;
  background: #ff9d3d;
`;

const ItemInfoRow = styled.button`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  min-width: 0;
  align-self: end;
  padding: 0;
  border: 0;
  background: transparent;
  color: #e2e4ff;
  cursor: pointer;
  font-family: inherit;
  font-size: 8px;
  text-align: left;
`;

const ItemValueRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
`;

const ItemIcon = styled.img`
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  object-fit: contain;
`;

const ItemName = styled.span`
  overflow: hidden;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ItemLabel = styled.span`
  flex: 0 0 auto;
  color: #d3d5ff;
`;

const DetailCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 3px;
  min-width: 0;
  margin-top: auto;
  padding-top: 5px;
`;

const DetailBadge = styled.span`
  align-self: flex-start;
  min-width: 24px;
  padding: 2px 6px;
  border: 1px solid rgba(207, 240, 255, 0.9);
  border-radius: 8px;
  background: linear-gradient(180deg, #39c7e2, #267fda);
  box-shadow: 0 1px 3px rgba(13, 36, 74, 0.28);
  color: #fff;
  font-size: 8px;
  font-weight: 800;
  text-align: center;
`;

const InfoButton = styled.button`
  width: ${(props) => (props.$plain ? "auto" : "100%")};
  min-width: 0;
  overflow: hidden;
  min-height: ${(props) => (props.$plain ? "0" : "21px")};
  padding: ${(props) => (props.$plain ? "0" : "3px 6px")};
  border: ${(props) => (props.$plain ? "0" : "1px solid rgba(224, 232, 245, 0.95)")};
  border-radius: ${(props) => (props.$plain ? "0" : "6px")};
  background: ${(props) => (props.$plain ? "transparent" : "linear-gradient(180deg, #fff, #e6edf7)")};
  box-shadow: ${(props) => (props.$plain ? "none" : "0 1px 2px rgba(19, 38, 73, 0.24)")};
  color: ${(props) => (props.$plain ? "#fff" : "#24334e")};
  font: inherit;
  font-size: ${(props) => (props.$large ? "10px" : "8px")};
  line-height: 1.2;
  font-weight: 700;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    color: #2563eb;
    text-decoration: underline;
  }
`;

const SkillSummary = styled.div`
  position: absolute;
  z-index: 2;
  top: 10%;
  bottom: 5%;
  right: 1.5%;
  width: 29%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  animation: ${revealCard} 0.35s ease-out both;
`;

const SkillHeading = styled.div`
  margin: 0 0 4px;
  color: #fff;
  font-size: 10px;
  font-weight: 900;
  text-align: center;
  text-shadow: 0 1px 3px rgba(9, 25, 71, 0.8);
`;

const SkillRow = styled.button`
  width: 100%;
  min-height: 22px;
  display: grid;
  grid-template-columns: 14px minmax(0, 1fr);
  align-items: center;
  gap: 3px;
  margin-bottom: 3px;
  padding: 0 4px;
  border: 1px solid rgba(213, 229, 250, 0.9);
  border-radius: 4px;
  background: linear-gradient(180deg, rgba(250, 253, 255, 0.94), rgba(212, 226, 245, 0.94));
  box-shadow: 0 1px 2px rgba(19, 38, 73, 0.24);
  text-align: left;
  cursor: pointer;

  &:hover {
    background: #fff;
  }
`;

const SkillTypeIcon = styled.img`
  width: 13px;
  height: 13px;
  border-radius: 3px;
  object-fit: contain;
`;

const SkillName = styled.span`
  overflow: hidden;
  color: #24334e;
  font-size: 9px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DescriptionBox = styled.div`
  position: absolute;
  right: 0;
  bottom: 58px;
  left: 0;
  min-height: 54px;
  padding: 8px 10px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 7px;
  background: rgba(9, 16, 29, 0.78);
  box-sizing: border-box;
`;

const DescriptionTitle = styled.div`
  margin-bottom: 3px;
  color: #d9f99d;
  font-size: 10px;
  font-weight: 900;
`;

const DescriptionText = styled.div`
  color: #e2e8f0;
  font-size: 10px;
  line-height: 1.4;
  white-space: pre-wrap;
`;

const Footer = styled.div`
  position: absolute;
  z-index: 20;
  bottom: 0;
  right: 0;
  left: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: auto;
  padding: 8px 0 2px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0), rgba(15, 23, 42, 0.98) 25%);
`;

const CancelButton = styled.button`
  width: 100%;
  min-width: 0;
  min-height: 38px;
  box-sizing: border-box;
  border: 1px solid rgba(203, 213, 225, 0.65);
  border-radius: 9px;
  background: linear-gradient(110deg, #64748b, #475569);
  color: #f8fafc;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
`;

const ConfirmButton = styled.button`
  width: 100%;
  min-width: 0;
  min-height: 38px;
  box-sizing: border-box;
  border: 1px solid #ecfccb;
  border-radius: 9px;
  background: ${(props) => (props.disabled ? "rgba(71, 85, 105, 0.8)" : "linear-gradient(110deg, #a3e635, #22c55e)")};
  color: ${(props) => (props.disabled ? "#cbd5e1" : "#102a16")};
  font-size: 13px;
  font-weight: 900;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  box-shadow: ${(props) => (props.disabled ? "none" : "0 4px 14px rgba(74, 222, 128, 0.24)")};
`;
