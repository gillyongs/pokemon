import React, { useState, useEffect, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { AugmentIcon } from "./AugmentIcon";
import { AUGMENT_LIST, getAugmentSelDesc, isCurseAugment, isBuffAugment, isPermanentBuff, isPermanentCurse, isSynergyAugment, isSynergyComponentAugment, isNormalAugment, isReplacementAugment, getAugmentSynergyInfo } from "../../../entity/Augment/AugmentData";
import { rollTeamAugments } from "../../../calc/augmentRoll";
import { testmode, subscribeTestMode } from "../../../config/testMode";
import sampleList from "../../../entity/Pokemon/pokemonSampleList";
import AugmentStatusModal from "./AugmentStatusModal";
import AugmentPokemonPreviewModal from "./AugmentPokemonPreviewModal";
import AugmentSynergyPreviewModal from "./AugmentSynergyPreviewModal";
import AugmentGrantPreviewModal from "./AugmentGrantPreviewModal";
import AugmentNoUnfairMissPreviewModal from "./AugmentNoUnfairMissPreviewModal";
import AugmentSwordEnhanceView from "./select/AugmentSwordEnhanceView";
import AugmentArcaneShadeSwordView from "./select/AugmentArcaneShadeSwordView";
import AugmentStarforceView from "./select/AugmentStarforceView";
import AugmentCubeView from "./select/AugmentCubeView";
import AugmentPowerOfKingView from "./select/AugmentPowerOfKingView";
import AugmentThreeThousandYearsView from "./select/AugmentThreeThousandYearsView";
import AugmentNinjaAppearedView from "./select/AugmentNinjaAppearedView";
import AugmentSoulDiceView from "./select/AugmentSoulDiceView";
import AugmentRouletteView from "./select/AugmentRouletteView";
import AugmentSkillSelectView from "./select/AugmentSkillSelectView";
import AugmentTypeSelectView from "./select/AugmentTypeSelectView";

import { AUGMENT_POKEMON_PREVIEW_MAP, getAugmentGrantInfo } from "./augmentPreviewConstants";
export { AUGMENT_POKEMON_PREVIEW_MAP, getAugmentGrantInfo };

const AugmentSelectModal = ({ team = [], augments = [], targetPokemon = null, initialTarget = null, battle = null, onSelect, onClose, isTestMode: propTestMode = null, isTitanSelection = false }) => {
  const [isTestMode, setIsTestMode] = useState(() => {
    if (typeof propTestMode === "boolean") return propTestMode;
    if (typeof window !== "undefined" && typeof window.testmode === "boolean") return window.testmode;
    return Boolean(testmode);
  });
  const [showAllList, setShowAllList] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (typeof propTestMode === "boolean") {
      setIsTestMode(propTestMode);
    }
  }, [propTestMode]);

  useEffect(() => {
    return subscribeTestMode(({ testmode: tm }) => {
      setIsTestMode(Boolean(tm));
    });
  }, []);
  const [isPeekMode, setIsPeekMode] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [previewInfo, setPreviewInfo] = useState(null);
  const [synergyPreviewInfo, setSynergyPreviewInfo] = useState(null);
  const [grantPreviewInfo, setGrantPreviewInfo] = useState(null);
  const [noUnfairMissPreviewOpen, setNoUnfairMissPreviewOpen] = useState(false);
  const [skillSelectAug, setSkillSelectAug] = useState(null);
  const [typeSelectAug, setTypeSelectAug] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedAugment, setSelectedAugment] = useState(null);
  const [swordEnhanceAug, setSwordEnhanceAug] = useState(null);
  const [arcaneShadeSwordAug, setArcaneShadeSwordAug] = useState(null);
  const [starforceAug, setStarforceAug] = useState(null);
  const [cleanSlateAug, setCleanSlateAug] = useState(null);
  const [cubeAug, setCubeAug] = useState(null);
  const [powerOfKingAug, setPowerOfKingAug] = useState(null);
  const [threeThousandYearsAug, setThreeThousandYearsAug] = useState(null);
  const [ninjaAppearedAug, setNinjaAppearedAug] = useState(null);
  const [soulDiceAug, setSoulDiceAug] = useState(null);
  const [rouletteAug, setRouletteAug] = useState(null);

  const resolvedTeam = team && team.length > 0 ? team : [battle?.player, battle?.playerBench1, battle?.playerBench2].filter(Boolean);

  const getPokeKey = (p, idx) => p?.originalIndex ?? p?.sampleName ?? p?.id ?? idx;

  const getPreviewSample = (augId) => {
    const sampleKey = AUGMENT_POKEMON_PREVIEW_MAP[augId];
    if (!sampleKey) return null;
    return sampleList.getDataBySampleName(sampleKey) || null;
  };

  const handleOpenPreview = (e, augId) => {
    e.stopPropagation();
    if (isPeekMode) {
      setIsPeekMode(false);
    }
    if (augId === "noUnfairMiss") {
      setNoUnfairMissPreviewOpen(true);
      return;
    }
    const sample = getPreviewSample(augId);
    if (sample) {
      setPreviewInfo({ augmentId: augId, pokemon: sample });
      return;
    }
    const synergy = getAugmentSynergyInfo(augId);
    if (synergy) {
      setSynergyPreviewInfo({ augmentId: augId, synergy });
      return;
    }
    const grant = getAugmentGrantInfo(augId);
    if (grant) {
      setGrantPreviewInfo({ augmentId: augId, grant });
      return;
    }
  };

  const [activePokemon, setActivePokemon] = useState(() => {
    if (isTitanSelection) {
      if (initialTarget && resolvedTeam.some((p) => p === initialTarget || p.id === initialTarget.id)) {
        return initialTarget;
      }
      if (targetPokemon && resolvedTeam.some((p) => p === targetPokemon || p.id === targetPokemon.id)) {
        return targetPokemon;
      }
    }
    return resolvedTeam[0] || null;
  });

  const checkEligibility = (aug, pokemon) => {
    if (!pokemon) return false;
    if (isTitanSelection) return true;
    const isSpecialAug = isBuffAugment(aug) || isCurseAugment(aug) || isSynergyAugment(aug);
    const isInstant = aug.cost === "-";
    const normalAugs = (pokemon.augments || []).filter((a) => isNormalAugment(a));
    if (normalAugs.length >= 3 && !isInstant && !isSpecialAug) {
      return false;
    }
    if (pokemon.hasAugment?.(aug.id)) {
      return false;
    }
    if (isReplacementAugment(aug) && (pokemon.hasAugment?.("jinanSangae") || pokemon.hasAugment?.("rudePureLove"))) {
      return false;
    }
    if (typeof aug.isEligible === "function") {
      return aug.isEligible(pokemon, battle, resolvedTeam);
    }
    return true;
  };

  const { allEligible, allIneligible } = useMemo(() => {
    const eligible = [];
    const ineligible = [];
    const trimmed = searchTerm.trim().toLowerCase();
    AUGMENT_LIST.forEach((aug) => {
      if (trimmed && !aug.name.toLowerCase().includes(trimmed)) {
        return;
      }
      if (checkEligibility(aug, activePokemon)) {
        eligible.push(aug);
      } else {
        ineligible.push(aug);
      }
    });
    eligible.sort(compareAugmentNames);
    ineligible.sort(compareAugmentNames);
    return { allEligible: eligible, allIneligible: ineligible };
  }, [activePokemon, searchTerm]);

  // 레지기가스 선택시 고정 증강
  const titanFixedChoices = useMemo(() => {
    return [AUGMENT_LIST.find((a) => a.id === "fastStarter"), AUGMENT_LIST.find((a) => a.id === "hugePower"), AUGMENT_LIST.find((a) => a.id === "randomAbility")].filter(Boolean);
  }, []);

  const [choicesMap] = useState(() => {
    if (isTitanSelection) {
      const activeKey = getPokeKey(activePokemon, 0);
      return { [activeKey]: titanFixedChoices };
    }
    return rollTeamAugments(resolvedTeam, battle);
  });

  const activeKey = getPokeKey(activePokemon, 0);

  const currentChoices = useMemo(() => {
    const rawChoices = isTitanSelection ? titanFixedChoices : choicesMap && choicesMap[activeKey] && choicesMap[activeKey].length > 0 ? choicesMap[activeKey] : augments && augments.length > 0 ? augments : [];
    let list = rawChoices;
    const normalCount = (activePokemon?.augments || []).filter((a) => isNormalAugment(a)).length;
    if (normalCount >= 3 && list.length > 0) {
      const anvilIdx = list.findIndex((a) => a.id === "anvilStat");
      if (anvilIdx > 0) {
        const copy = [...list];
        const [anvil] = copy.splice(anvilIdx, 1);
        copy.unshift(anvil);
        return copy;
      } else if (anvilIdx === -1) {
        const anvilAug = AUGMENT_LIST.find((a) => a.id === "anvilStat");
        if (anvilAug) {
          const copy = [...list];
          if (copy.length >= 3) copy.pop();
          copy.unshift(anvilAug);
          return copy;
        }
      }
    }
    return list;
  }, [isTitanSelection, titanFixedChoices, choicesMap, activeKey, augments, activePokemon]);

  const handleTogglePeek = (e) => {
    e.stopPropagation();
    setIsPeekMode((prev) => !prev);
  };

  const handleContainerClick = (e) => {
    e.stopPropagation();
    if (isPeekMode) {
      setIsPeekMode(false);
    }
  };

  const handleSelectPokemon = (poke) => {
    if (isPeekMode) setIsPeekMode(false);
    if (poke === activePokemon || poke?.id === activePokemon?.id) return;
    setActivePokemon(poke);
    setPreviewInfo(null);
    setSynergyPreviewInfo(null);
    setGrantPreviewInfo(null);
    setSelectedAugment(null); // 다른 포켓몬 선택 시 증강 선택 상태 초기화
    setSearchTerm("");
    setTypeSelectAug(null);
    setSelectedType(null);
    setSkillSelectAug(null);
    setSwordEnhanceAug(null);
    setArcaneShadeSwordAug(null);
    setStarforceAug(null);
    setCleanSlateAug(null);
    setCubeAug(null);
    setPowerOfKingAug(null);
    setThreeThousandYearsAug(null);
    setNinjaAppearedAug(null);
    setSoulDiceAug(null);
    setRouletteAug(null);
  };

  const handleCardClick = (e, aug) => {
    e.stopPropagation();
    if (isPeekMode) {
      setIsPeekMode(false);
      return;
    }
    setSelectedAugment((prev) => (prev?.id === aug.id ? null : aug));
  };

  const handleConfirm = (e, aug = null) => {
    e?.stopPropagation();
    const targetAug = aug || selectedAugment;
    if (!targetAug || !activePokemon) return;

    if ((targetAug.id === "danceOfGarchomp" || targetAug.id === "nameIsSalamence" || targetAug.id === "choiceAndFocus") && activePokemon?.skill) {
      setSkillSelectAug(targetAug);
      return;
    }

    if (targetAug.id === "nullifyGetto") {
      setTypeSelectAug(targetAug);
      setSelectedType(null);
      return;
    }

    if (targetAug.id === "teraBlast") {
      setTypeSelectAug(targetAug);
      setSelectedType(null);
      return;
    }

    if (targetAug.id === "threeThousandYears") {
      setThreeThousandYearsAug(targetAug);
      return;
    }

    if (targetAug.id === "ninjaAppeared") {
      setNinjaAppearedAug(targetAug);
      return;
    }

    if (targetAug.id === "powerOfKing") {
      setPowerOfKingAug(targetAug);
      return;
    }

    if (targetAug.id === "swordEnhance") {
      setSwordEnhanceAug(targetAug);
      return;
    }

    if (targetAug.id === "arcaneShadeSword") {
      setArcaneShadeSwordAug(targetAug);
      return;
    }

    if (targetAug.id === "starforce") {
      setStarforceAug(targetAug);
      return;
    }

    if (targetAug.id === "cleanSlateScroll") {
      setCleanSlateAug(targetAug);
      return;
    }

    if (targetAug.id === "cube") {
      setCubeAug(targetAug);
      return;
    }

    if (targetAug.id === "soulDice") {
      setSoulDiceAug(targetAug);
      return;
    }

    if (["allOrNothing", "russianRoulette", "highRiskHighReturn", "randomAbility", "oddEven"].includes(targetAug.id)) {
      setRouletteAug(targetAug);
      return;
    }

    onSelect(targetAug, { targetPokemon: activePokemon });
  };

  return (
    <>
      <ModalOverlay $isPeek={isPeekMode} onClick={() => setIsPeekMode((prev) => !prev)}>
        <ModalWrapper onClick={(e) => e.stopPropagation()}>
          <ModalContainer $isPeek={isPeekMode} onClick={handleContainerClick}>
            {rouletteAug ? (
              <AugmentRouletteView
                rouletteAug={rouletteAug}
                activePokemon={activePokemon}
                battle={battle}
                onSelect={(aug, payload) => {
                  onSelect(aug, payload);
                  setRouletteAug(null);
                }}
                onCancel={() => setRouletteAug(null)}
              />
            ) : powerOfKingAug ? (
              <AugmentPowerOfKingView
                powerOfKingAug={powerOfKingAug}
                activePokemon={activePokemon}
                onSelect={(aug, opts) => {
                  onSelect(aug, opts);
                  setPowerOfKingAug(null);
                }}
                onCancel={() => setPowerOfKingAug(null)}
              />
            ) : threeThousandYearsAug ? (
              <AugmentThreeThousandYearsView
                threeThousandYearsAug={threeThousandYearsAug}
                activePokemon={activePokemon}
                onSelect={(aug, opts) => {
                  onSelect(aug, opts);
                  setThreeThousandYearsAug(null);
                }}
                onCancel={() => setThreeThousandYearsAug(null)}
              />
            ) : ninjaAppearedAug ? (
              <AugmentNinjaAppearedView
                ninjaAppearedAug={ninjaAppearedAug}
                activePokemon={activePokemon}
                onSelect={(aug, opts) => {
                  onSelect(aug, opts);
                  setNinjaAppearedAug(null);
                }}
                onCancel={() => setNinjaAppearedAug(null)}
              />
            ) : arcaneShadeSwordAug ? (
              <AugmentArcaneShadeSwordView
                arcaneShadeSwordAug={arcaneShadeSwordAug}
                activePokemon={activePokemon}
                onSelect={(aug, opts) => {
                  onSelect(aug, opts);
                  setArcaneShadeSwordAug(null);
                }}
              />
            ) : starforceAug ? (
              <AugmentStarforceView
                starforceAug={starforceAug}
                activePokemon={activePokemon}
                onSelect={(aug, opts) => {
                  onSelect(aug, opts);
                  setStarforceAug(null);
                }}
                onCancel={() => setStarforceAug(null)}
              />
            ) : cleanSlateAug ? (
              <AugmentArcaneShadeSwordView
                arcaneShadeSwordAug={cleanSlateAug}
                activePokemon={activePokemon}
                onSelect={(aug, opts) => {
                  onSelect(aug, opts);
                  setCleanSlateAug(null);
                }}
              />
            ) : cubeAug ? (
              <AugmentCubeView
                cubeAug={cubeAug}
                activePokemon={activePokemon}
                onSelect={(aug, opts) => {
                  onSelect(aug, opts);
                  setCubeAug(null);
                }}
                onCancel={() => setCubeAug(null)}
              />
            ) : swordEnhanceAug ? (
              <AugmentSwordEnhanceView
                swordEnhanceAug={swordEnhanceAug}
                activePokemon={activePokemon}
                onSelect={(aug, opts) => {
                  onSelect(aug, opts);
                  setSwordEnhanceAug(null);
                }}
                onCancel={() => setSwordEnhanceAug(null)}
              />
            ) : soulDiceAug ? (
              <AugmentSoulDiceView
                soulDiceAug={soulDiceAug}
                activePokemon={activePokemon}
                onSelect={(aug, opts) => {
                  onSelect(aug, opts);
                  setSoulDiceAug(null);
                }}
                onCancel={() => setSoulDiceAug(null)}
              />
            ) : skillSelectAug ? (
              <AugmentSkillSelectView
                skillSelectAug={skillSelectAug}
                activePokemon={activePokemon}
                battle={battle}
                selectedType={selectedType}
                isPeekMode={isPeekMode}
                setIsPeekMode={setIsPeekMode}
                onSelect={(aug, opts) => {
                  onSelect(aug, opts);
                  setSkillSelectAug(null);
                  setSelectedType(null);
                }}
                onBack={() => {
                  if (skillSelectAug?.id === "teraBlast") {
                    setTypeSelectAug(skillSelectAug);
                    setSkillSelectAug(null);
                  } else {
                    setSkillSelectAug(null);
                  }
                }}
              />
            ) : typeSelectAug ? (
              <AugmentTypeSelectView
                typeSelectAug={typeSelectAug}
                activePokemon={activePokemon}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                onNext={(type) => {
                  setSelectedType(type);
                  setSkillSelectAug(typeSelectAug);
                  setTypeSelectAug(null);
                }}
                onSelect={(aug, opts) => {
                  onSelect(aug, opts);
                  setTypeSelectAug(null);
                  setSelectedType(null);
                }}
                onCancel={() => {
                  setTypeSelectAug(null);
                  setSelectedType(null);
                }}
              />
            ) : (
              <>
                <HeaderArea>
                  <HeaderTopRow>
                    <TitleGroup>
                      <Title>{isTitanSelection ? "전설의 거인: 특성 증강 선택" : "증강 선택"}</Title>
                      {isTestMode && !isTitanSelection && (
                        <AllListButton
                          type="button"
                          $active={showAllList}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAllList((prev) => !prev);
                            setSelectedAugment(null);
                          }}
                          title={showAllList ? "3개 추첨 모드로 전환" : "모든 증강 목록 보기 (글자순)"}
                        >
                          {showAllList ? "추첨 목록" : "증강 목록"}
                        </AllListButton>
                      )}
                    </TitleGroup>
                    <HeaderRightGroup>
                      {!isTitanSelection && (
                        <StatusButton
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsStatusOpen(true);
                          }}
                          title="현재 팀 증강 현황 보기"
                        >
                          증강 현황
                        </StatusButton>
                      )}
                      <CloseButton
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onClose) onClose();
                        }}
                        title="닫기"
                      >
                        ✕
                      </CloseButton>
                    </HeaderRightGroup>
                  </HeaderTopRow>
                </HeaderArea>

                {resolvedTeam.length > 0 && !isTitanSelection && (
                  <EntryContainer>
                    {resolvedTeam.map((poke, idx) => {
                      const isSelected = activePokemon === poke || activePokemon?.id === poke.id;
                      const count = (poke.augments || []).filter((a) => isNormalAugment(a)).length;
                      const pokeId = poke.uniqueKey;
                      return (
                        <EntryCard
                          key={getPokeKey(poke, idx)}
                          $isSelected={isSelected}
                          $disabled={false}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPokemon(poke);
                          }}
                          title={`${poke.name} (보유 증강 ${count}/3)`}
                        >
                          <EntryPokemonImg
                            src={`/pokemon/img/pokemon/${pokeId}.webp`}
                            alt={poke.name}
                            onError={(e) => {
                              e.currentTarget.src = "/pokemon/img/pokemon/0000.webp";
                            }}
                          />
                          <EntryPokemonName>{poke.name}</EntryPokemonName>
                          <EntryCountBadge $hasAugment={count > 0}>{count}/3</EntryCountBadge>
                        </EntryCard>
                      );
                    })}
                  </EntryContainer>
                )}

                <CardContainer $isAll={showAllList} onClick={() => setSelectedAugment(null)}>
                  {showAllList ? (
                    allEligible.length === 0 && allIneligible.length === 0 ? (
                      <EmptyChoiceText>등록된 증강이 없습니다.</EmptyChoiceText>
                    ) : (
                      <>
                        {allEligible.map((aug, index) => {
                          const isCardSelected = selectedAugment?.id === aug.id;
                          const isCurse = isCurseAugment(aug);
                          const isSynergy = isSynergyAugment(aug);
                          const isBuff = isBuffAugment(aug);
                          const isSynergyComponent = isSynergyComponentAugment(aug);
                          const isReplacement = isReplacementAugment(aug);
                          const previewSample = getPreviewSample(aug.id);
                          const synergyData = getAugmentSynergyInfo(aug.id);
                          const grantData = getAugmentGrantInfo(aug.id);
                          const isNoUnfairMiss = aug.id === "noUnfairMiss";
                          const hasPreview = Boolean(previewSample || synergyData || grantData || isNoUnfairMiss);
                          return (
                            <AugmentCard key={aug.id || index} $isPeek={isPeekMode} $isSelected={isCardSelected} $isBuff={isBuff} $isCurse={isCurse} $isSynergy={isSynergy} onClick={(e) => handleCardClick(e, aug)}>
                              {isSynergy ? <TopRightSynergyBadge $variant="yellow">시너지</TopRightSynergyBadge> : isSynergyComponent ? <TopRightSynergyBadge $variant="blue">시너지</TopRightSynergyBadge> : isReplacement ? <TopRightSynergyBadge $variant="purple">교체</TopRightSynergyBadge> : null}
                              <IconCol>
                                <IconWrapper>
                                  <AugmentIcon id={aug.id} size={38} pokemon={activePokemon} shiftUp={aug.shiftUp} imageOptions={aug.imageOptions} />
                                </IconWrapper>
                                {!isBuff && !isCurse && !isSynergy && aug.cost !== "-" && aug.cost !== undefined && <CostBadge $isLong={String(aug.cost).length >= 3}>{aug.cost ?? 1} cost</CostBadge>}
                              </IconCol>
                              <CardContent>
                                <CardTitleRow>
                                  <CardTitle $nameLength={aug.name?.length || 0}>{aug.name}</CardTitle>
                                  {isCurse ? <CurseBadge>{isPermanentCurse(aug) ? "영구 디버프" : "디버프"}</CurseBadge> : isBuff ? <BuffBadge>{isPermanentBuff(aug) ? "영구 버프" : "버프"}</BuffBadge> : null}
                                </CardTitleRow>
                                <CardDescription>{getAugmentSelDesc(aug, activePokemon, battle)}</CardDescription>
                              </CardContent>
                              {isCardSelected && (
                                <CardActionOverlay
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAugment(null);
                                  }}
                                >
                                  <CardActionButton type="button" $variant="confirm" onClick={(e) => handleConfirm(e, aug)}>
                                    선택
                                  </CardActionButton>
                                  {hasPreview && (
                                    <CardActionButton type="button" $variant="info" onClick={(e) => handleOpenPreview(e, aug.id)} title={isNoUnfairMiss ? "명중률 80~99% 기술 목록 보기" : previewSample ? (aug.id === "eternamax" || aug.id === "blackNight" ? "무한다이맥스 / 무한다이노 상세정보 보기" : `${previewSample.megaData?.name || previewSample.name} 상세정보 보기`) : synergyData ? `${synergyData?.title || "시너지"} 공명 상세정보 보기` : grantData ? `${grantData.modalTitle} 보기` : "상세정보 보기"}>
                                      상세정보
                                    </CardActionButton>
                                  )}
                                </CardActionOverlay>
                              )}
                            </AugmentCard>
                          );
                        })}

                        {allIneligible.length > 0 && (
                          <>
                            <IneligibleDivider>
                              <span>선택 불가 증강 ({allIneligible.length})</span>
                            </IneligibleDivider>
                            {allIneligible.map((aug, index) => {
                              const isCurse = isCurseAugment(aug);
                              const isSynergy = isSynergyAugment(aug);
                              const isBuff = isBuffAugment(aug);
                              const isSynergyComponent = isSynergyComponentAugment(aug);
                              const isReplacement = isReplacementAugment(aug);
                              return (
                                <AugmentCard key={`ineligible-${aug.id || index}`} $isPeek={isPeekMode} $disabled={true} $isBuff={isBuff} $isCurse={isCurse} $isSynergy={isSynergy} onClick={(e) => e.stopPropagation()} title="이 포켓몬은 해당 증강의 선택 조건을 만족하지 않거나 이미 보유 중입니다.">
                                  {isSynergy ? <TopRightSynergyBadge $variant="yellow">시너지</TopRightSynergyBadge> : isSynergyComponent ? <TopRightSynergyBadge $variant="blue">시너지</TopRightSynergyBadge> : isReplacement ? <TopRightSynergyBadge $variant="purple">교체</TopRightSynergyBadge> : null}
                                  <IconCol>
                                    <IconWrapper>
                                      <AugmentIcon id={aug.id} size={38} pokemon={activePokemon} shiftUp={aug.shiftUp} imageOptions={aug.imageOptions} />
                                    </IconWrapper>
                                    {!isBuff && !isCurse && !isSynergy && aug.cost !== "-" && aug.cost !== undefined && <CostBadge $isLong={String(aug.cost).length >= 3}>{aug.cost ?? 1} cost</CostBadge>}
                                  </IconCol>
                                  <CardContent>
                                    <CardTitleRow>
                                      <CardTitle $nameLength={aug.name?.length || 0}>{aug.name}</CardTitle>
                                      {isCurse ? <CurseBadge>{isPermanentCurse(aug) ? "영구 디버프" : "디버프"}</CurseBadge> : isBuff ? <BuffBadge>{isPermanentBuff(aug) ? "영구 버프" : "버프"}</BuffBadge> : null}
                                      <IneligibleBadge>선택 불가</IneligibleBadge>
                                    </CardTitleRow>
                                    <CardDescription>{getAugmentSelDesc(aug, activePokemon, battle)}</CardDescription>
                                  </CardContent>
                                </AugmentCard>
                              );
                            })}
                          </>
                        )}
                      </>
                    )
                  ) : currentChoices.length === 0 ? (
                    <EmptyChoiceText>선택 가능한 증강이 없습니다.</EmptyChoiceText>
                  ) : (
                    currentChoices.map((aug, index) => {
                      const isCardSelected = selectedAugment?.id === aug.id;
                      const isCurse = isCurseAugment(aug);
                      const isSynergy = isSynergyAugment(aug);
                      const isBuff = isBuffAugment(aug);
                      const isSynergyComponent = isSynergyComponentAugment(aug);
                      const isReplacement = isReplacementAugment(aug);
                      const previewSample = getPreviewSample(aug.id);
                      const synergyData = getAugmentSynergyInfo(aug.id);
                      const grantData = getAugmentGrantInfo(aug.id);
                      const isNoUnfairMiss = aug.id === "noUnfairMiss";
                      const hasPreview = Boolean(previewSample || synergyData || grantData || isNoUnfairMiss);
                      return (
                        <AugmentCard key={aug.id || index} $isPeek={isPeekMode} $isSelected={isCardSelected} $isBuff={isBuff} $isCurse={isCurse} $isSynergy={isSynergy} onClick={(e) => handleCardClick(e, aug)}>
                          {isSynergy ? <TopRightSynergyBadge $variant="yellow">시너지</TopRightSynergyBadge> : isSynergyComponent ? <TopRightSynergyBadge $variant="blue">시너지</TopRightSynergyBadge> : isReplacement ? <TopRightSynergyBadge $variant="purple">교체</TopRightSynergyBadge> : null}
                          <IconCol>
                            <IconWrapper>
                              <AugmentIcon id={aug.id} size={38} pokemon={activePokemon} shiftUp={aug.shiftUp} imageOptions={aug.imageOptions} />
                            </IconWrapper>
                            {!isBuff && !isCurse && !isSynergy && aug.cost !== "-" && aug.cost !== undefined && <CostBadge $isLong={String(aug.cost).length >= 3}>{aug.cost ?? 1} cost</CostBadge>}
                          </IconCol>
                          <CardContent>
                            <CardTitleRow>
                              <CardTitle $nameLength={aug.name?.length || 0}>{aug.name}</CardTitle>
                              {isCurse ? <CurseBadge>{isPermanentCurse(aug) ? "영구 디버프" : "디버프"}</CurseBadge> : isBuff ? <BuffBadge>{isPermanentBuff(aug) ? "영구 버프" : "버프"}</BuffBadge> : null}
                            </CardTitleRow>
                            <CardDescription>{getAugmentSelDesc(aug, activePokemon, battle)}</CardDescription>
                          </CardContent>
                          {isCardSelected && (
                            <CardActionOverlay
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAugment(null);
                              }}
                            >
                              <CardActionButton type="button" $variant="confirm" onClick={(e) => handleConfirm(e, aug)}>
                                선택
                              </CardActionButton>
                              {hasPreview && (
                                <CardActionButton type="button" $variant="info" onClick={(e) => handleOpenPreview(e, aug.id)} title={isNoUnfairMiss ? "명중률 80~99% 기술 목록 보기" : previewSample ? (aug.id === "eternamax" || aug.id === "blackNight" ? "무한다이맥스 / 무한다이노 상세정보 보기" : `${previewSample.megaData?.name || previewSample.name} 상세정보 보기`) : synergyData ? `${synergyData?.title || "시너지"} 공명 상세정보 보기` : grantData ? `${grantData.modalTitle} 보기` : "상세정보 보기"}>
                                  상세정보
                                </CardActionButton>
                              )}
                            </CardActionOverlay>
                          )}
                        </AugmentCard>
                      );
                    })
                  )}
                </CardContainer>

                {showAllList && (
                  <SearchContainer onClick={(e) => e.stopPropagation()}>
                    <SearchInput type="text" placeholder="증강 이름으로 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    {searchTerm && (
                      <SearchClearButton
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchTerm("");
                        }}
                        title="검색어 지우기"
                      >
                        ✕
                      </SearchClearButton>
                    )}
                  </SearchContainer>
                )}
              </>
            )}
          </ModalContainer>
          <PeekToggleButton $isPeek={isPeekMode} onClick={handleTogglePeek} title={isPeekMode ? "증강 선택창 선명하게" : "모달 흐리게 (필드 확인)"}>
            {isPeekMode ? "선명하게 보기" : "필드 보기 (흐리게)"}
          </PeekToggleButton>
        </ModalWrapper>
      </ModalOverlay>

      {isStatusOpen && <AugmentStatusModal battle={battle} team={resolvedTeam} onClose={() => setIsStatusOpen(false)} />}
      {previewInfo && <AugmentPokemonPreviewModal augmentId={previewInfo.augmentId} pokemon={previewInfo.pokemon} onClose={() => setPreviewInfo(null)} />}
      {synergyPreviewInfo && <AugmentSynergyPreviewModal synergy={synergyPreviewInfo.synergy} activeAugmentId={synergyPreviewInfo.augmentId} activePokemon={activePokemon} battle={battle} team={resolvedTeam} onClose={() => setSynergyPreviewInfo(null)} />}
      {grantPreviewInfo && <AugmentGrantPreviewModal augmentId={grantPreviewInfo.augmentId} grantInfo={grantPreviewInfo.grant} pokemon={activePokemon} battle={battle} onClose={() => setGrantPreviewInfo(null)} />}
      {noUnfairMissPreviewOpen && <AugmentNoUnfairMissPreviewModal pokemon={activePokemon} battle={battle} onClose={() => setNoUnfairMissPreviewOpen(false)} />}
    </>
  );
};

export default AugmentSelectModal;

// 증강 이름 정렬 비교 함수 (" 로 시작하는 항목은 맨 뒤로 배치)
const compareAugmentNames = (a, b) => {
  const nameA = typeof a === "string" ? a : a?.name || "";
  const nameB = typeof b === "string" ? b : b?.name || "";
  const aQuote = nameA.startsWith('"') || nameA.startsWith("“");
  const bQuote = nameB.startsWith('"') || nameB.startsWith("“");

  if (aQuote && !bQuote) return 1;
  if (!aQuote && bQuote) return -1;
  return nameA.localeCompare(nameB, "ko");
};

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${(props) => (props.$isPeek ? "rgba(0, 0, 0, 0.05)" : "rgba(0, 0, 0, 0.6)")};
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  animation: ${fadeIn} 0.2s ease-out;
  padding: 16px;
  box-sizing: border-box;
  transition: background-color 0.2s ease;
  cursor: ${(props) => (props.$isPeek ? "default" : "pointer")};

  @media (max-width: 480px) {
    padding: 8px;
  }
`;

const ModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 430px;
  gap: 12px;
  position: relative;
  z-index: 10001;

  @media (max-width: 480px) {
    width: 96%;
    gap: 8px;
  }
`;

const PeekToggleButton = styled.button`
  background: ${(props) => (props.$isPeek ? "rgba(15, 20, 28, 0.95)" : "rgba(15, 20, 28, 0.9)")};
  border: 1px solid ${(props) => (props.$isPeek ? "#64ffda" : "rgba(255, 255, 255, 0.25)")};
  border-radius: 20px;
  color: ${(props) => (props.$isPeek ? "#64ffda" : "#cbd5e1")};
  font-size: 0.85rem;
  font-weight: 600;
  padding: 8px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.7);
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    background: rgba(25, 35, 50, 0.98);
    border-color: #64ffda;
    color: #64ffda;
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(100, 255, 218, 0.25);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const ModalContainer = styled.div`
  height: 65vh;
  max-height: 65vh;
  background: rgba(15, 20, 28, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 18px 16px;
  width: 100%;
  max-width: 430px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  opacity: ${(props) => (props.$isPeek ? 0.15 : 1)};
  transition:
    opacity 0.2s ease,
    border-color 0.2s ease;
  cursor: ${(props) => (props.$isPeek ? "pointer" : "default")};

  @media (max-width: 480px) {
    padding: 14px 10px;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #64ffda, #38bdf8, #64ffda);
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
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.5px;
`;

const HeaderRightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusButton = styled.button`
  background: rgba(100, 255, 218, 0.1);
  border: 1px solid rgba(100, 255, 218, 0.35);
  border-radius: 6px;
  color: #64ffda;
  font-size: 0.78rem;
  font-weight: 700;
  font-family: inherit;
  padding: 4px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  white-space: nowrap;

  &:hover {
    background: rgba(100, 255, 218, 0.2);
    border-color: #64ffda;
    color: #ffffff;
    box-shadow: 0 0 10px rgba(100, 255, 218, 0.3);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const CloseButton = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    color: #fff;
    background: rgba(239, 68, 68, 0.6);
    border-color: rgba(239, 68, 68, 0.8);
  }
`;

const EntryContainer = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
  margin-bottom: 12px;
  box-sizing: border-box;

  @media (max-width: 480px) {
    gap: 6px;
    margin-bottom: 10px;
  }
`;

const EntryCard = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 4px;
  background: ${(props) => (props.$isSelected ? "rgba(20, 48, 64, 0.95)" : "rgba(255, 255, 255, 0.05)")};
  border: ${(props) => (props.$isSelected ? "2px solid #64ffda" : "1px solid rgba(255, 255, 255, 0.12)")};
  border-radius: 8px;
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.$disabled ? 0.45 : 1)};
  transition: all 0.2s ease;
  box-shadow: ${(props) => (props.$isSelected ? "0 0 10px rgba(100, 255, 218, 0.35)" : "none")};
  user-select: none;
  min-width: 0;

  @media (max-width: 480px) {
    padding: 6px 2px;
  }

  &:hover {
    ${(props) =>
      !props.$disabled &&
      !props.$isSelected &&
      `
      background: rgba(255, 255, 255, 0.09);
      border-color: rgba(100, 255, 218, 0.4);
    `}
  }
`;

const EntryPokemonImg = styled.img`
  width: 28px;
  height: 28px;
  object-fit: contain;
  flex-shrink: 0;
`;

const EntryPokemonName = styled.span`
  font-size: 0.8rem;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 0.74rem;
  }
`;

const EntryCountBadge = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  color: ${(props) => (props.$hasAugment ? "#64ffda" : "#94a3b8")};
  background: ${(props) => (props.$hasAugment ? "rgba(100, 255, 218, 0.12)" : "rgba(255, 255, 255, 0.06)")};
  padding: 1px 5px;
  border-radius: 4px;
  line-height: 1.2;
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 6px 4px 6px 2px;
  margin-bottom: 4px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.04);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(100, 255, 218, 0.35);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(100, 255, 218, 0.65);
  }
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AllListButton = styled.button`
  background: ${(props) => (props.$active ? "rgba(100, 255, 218, 0.2)" : "rgba(255, 255, 255, 0.08)")};
  border: 1px solid ${(props) => (props.$active ? "rgba(100, 255, 218, 0.6)" : "rgba(255, 255, 255, 0.2)")};
  border-radius: 6px;
  color: ${(props) => (props.$active ? "#64ffda" : "#cbd5e1")};
  font-size: 0.76rem;
  font-weight: 700;
  font-family: inherit;
  padding: 4px 9px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  white-space: nowrap;

  &:hover {
    background: rgba(100, 255, 218, 0.25);
    border-color: #64ffda;
    color: #ffffff;
    box-shadow: 0 0 10px rgba(100, 255, 218, 0.3);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const IneligibleDivider = styled.div`
  display: flex;
  align-items: center;
  margin: 12px 0 6px;
  width: 100%;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.12);
  }

  span {
    padding: 0 10px;
    font-size: 0.72rem;
    font-weight: 700;
    color: #f87171;
    letter-spacing: -0.2px;
  }
`;

const BuffBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1px 6px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.18);
  border: 1px solid rgba(56, 189, 248, 0.5);
  border-radius: 4px;
  letter-spacing: 0.5px;
`;

const TopRightSynergyBadge = styled.span`
  position: absolute;
  top: 5px;
  right: 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1.5px 7px;
  font-size: 0.72rem;
  font-weight: 700;
  color: ${(props) => (props.$variant === "blue" ? "#60a5fa" : props.$variant === "purple" ? "#c084fc" : "#ffd700")};
  background: ${(props) => (props.$variant === "blue" ? "rgba(37, 99, 235, 0.2)" : props.$variant === "purple" ? "rgba(168, 85, 247, 0.2)" : "rgba(255, 215, 0, 0.18)")};
  border: 1px solid ${(props) => (props.$variant === "blue" ? "rgba(96, 165, 250, 0.55)" : props.$variant === "purple" ? "rgba(192, 132, 252, 0.55)" : "rgba(255, 215, 0, 0.5)")};
  border-radius: 4px;
  letter-spacing: 0.5px;
  z-index: 2;
  pointer-events: none;
`;

const CurseBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1px 6px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #f87171;
  background: rgba(239, 68, 68, 0.18);
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 4px;
  letter-spacing: 0.5px;
`;

const IneligibleBadge = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  color: #f87171;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 4px;
  padding: 1px 5px;
  margin-left: 6px;
  flex-shrink: 0;
`;

const CardTitleRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 4px;
  padding-right: 52px;

  @media (max-width: 480px) {
    margin-bottom: 2px;
  }
`;

const CardActionOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 7px;
  z-index: 5;
  animation: ${fadeIn} 0.15s ease-out;
`;

const CardActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  width: 100px;
  padding: 10px 0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  box-sizing: border-box;
  transition: all 0.2s ease;
  background: rgba(15, 23, 42, 0.95);
  color: #64ffda;
  border: 1.5px solid #64ffda;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6);

  &:hover {
    background: #64ffda;
    color: #0f172a;
    box-shadow: 0 4px 18px rgba(100, 255, 218, 0.6);
    transform: scale(1.04);
  }

  &:active {
    transform: scale(0.97);
  }

  @media (max-width: 480px) {
    min-height: 38px;
    width: 86px;
    font-size: 0.86rem;
    padding: 8px 0;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  margin-top: 8px;
  box-sizing: border-box;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 38px;
  background: rgba(15, 23, 42, 0.85);
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #f8fafc;
  font-size: 0.9rem;
  padding: 0 34px 0 12px;
  box-sizing: border-box;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: #64ffda;
    box-shadow: 0 0 10px rgba(100, 255, 218, 0.3);
  }

  &::placeholder {
    color: #64748b;
  }
`;

const SearchClearButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 0.95rem;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #f8fafc;
  }
`;

const EmptyChoiceText = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: #94a3b8;
  padding: 24px 0;
  text-align: center;
`;

const IconCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 50px;
  min-width: 50px;
  margin-right: 14px;
  flex-shrink: 0;
  gap: 4px;

  @media (max-width: 480px) {
    width: 44px;
    min-width: 44px;
    margin-right: 10px;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.2s ease,
    filter 0.2s ease;
`;

const AugmentCard = styled.div`
  position: relative;
  width: 100%;
  background: ${(props) => (props.$disabled ? "rgba(15, 23, 42, 0.35)" : props.$isCurse ? (props.$isSelected ? "rgba(68, 22, 26, 0.96)" : "rgba(239, 68, 68, 0.12)") : props.$isSynergy ? (props.$isSelected ? "rgba(50, 42, 16, 0.98)" : "rgba(255, 215, 0, 0.12)") : props.$isBuff ? (props.$isSelected ? "rgba(14, 45, 68, 0.98)" : "rgba(56, 189, 248, 0.12)") : props.$isSelected ? "rgba(22, 45, 64, 0.98)" : "rgba(0, 0, 0, 0.45)")};
  border: ${(props) => (props.$disabled ? "1px solid rgba(255, 255, 255, 0.06)" : props.$isCurse ? (props.$isSelected ? "1.5px solid #ef4444" : "1px solid rgba(239, 68, 68, 0.45)") : props.$isSynergy ? (props.$isSelected ? "1.5px solid #ffd700" : "1px solid rgba(255, 215, 0, 0.4)") : props.$isBuff ? (props.$isSelected ? "1.5px solid #38bdf8" : "1px solid rgba(56, 189, 248, 0.45)") : props.$isSelected ? "1.5px solid #64ffda" : "1px solid rgba(255, 255, 255, 0.1)")};
  border-left: 4px solid ${(props) => (props.$disabled ? "#475569" : props.$isCurse ? "#ef4444" : props.$isSynergy ? "#ffd700" : props.$isBuff ? "#38bdf8" : props.$isSelected ? "#38bdf8" : "#64ffda")};
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  pointer-events: ${(props) => (props.$disabled ? "none" : "auto")};
  opacity: ${(props) => (props.$disabled ? 0.45 : 1)};
  filter: ${(props) => (props.$disabled ? "grayscale(0.65)" : "none")};
  transition: all 0.2s ease;
  box-sizing: border-box;
  box-shadow: ${(props) => (props.$isSelected ? (props.$isCurse ? "0 0 14px rgba(239, 68, 68, 0.45), inset 0 0 8px rgba(239, 68, 68, 0.15)" : props.$isSynergy ? "0 0 14px rgba(255, 215, 0, 0.45), inset 0 0 8px rgba(255, 215, 0, 0.15)" : props.$isBuff ? "0 0 14px rgba(56, 189, 248, 0.45), inset 0 0 8px rgba(56, 189, 248, 0.15)" : "0 0 14px rgba(100, 255, 218, 0.45), inset 0 0 8px rgba(100, 255, 218, 0.15)") : "none")};

  @media (max-width: 480px) {
    padding: 10px 10px;
  }

  ${(props) =>
    !props.$disabled &&
    `
    &:hover {
      transform: none;
      border-color: ${props.$isSelected ? (props.$isCurse ? "#ef4444" : props.$isSynergy ? "#ffd700" : props.$isBuff ? "#38bdf8" : "#64ffda") : props.$isCurse ? "rgba(239, 68, 68, 0.7)" : props.$isSynergy ? "rgba(255, 215, 0, 0.7)" : props.$isBuff ? "rgba(56, 189, 248, 0.7)" : "rgba(100, 255, 218, 0.5)"};
      border-left: 4px solid ${props.$isCurse ? "#ef4444" : props.$isSynergy ? "#ffd700" : props.$isBuff ? "#38bdf8" : "#64ffda"};
      background: ${props.$isSelected ? (props.$isCurse ? "rgba(68, 22, 26, 0.98)" : props.$isSynergy ? "rgba(50, 42, 16, 0.98)" : props.$isBuff ? "rgba(14, 45, 68, 0.98)" : "rgba(22, 45, 64, 0.98)") : props.$isCurse ? "rgba(68, 22, 26, 0.3)" : props.$isSynergy ? "rgba(50, 42, 16, 0.3)" : props.$isBuff ? "rgba(14, 45, 68, 0.3)" : "rgba(20, 30, 44, 0.75)"};
      box-shadow: 0 4px 12px ${props.$isCurse ? "rgba(239, 68, 68, 0.25)" : props.$isSynergy ? "rgba(255, 215, 0, 0.25)" : props.$isBuff ? "rgba(56, 189, 248, 0.25)" : "rgba(0, 0, 0, 0.4)"};

      ${IconWrapper} {
        transform: ${props.$isPeek ? "none" : "scale(1.05)"};
        filter: drop-shadow(
          0 0 6px ${props.$isCurse ? "rgba(239, 68, 68, 0.5)" : props.$isSynergy ? "rgba(255, 215, 0, 0.5)" : props.$isBuff ? "rgba(56, 189, 248, 0.5)" : "rgba(100, 255, 218, 0.4)"}
        );
      }
    }

    &:active {
      transform: ${props.$isSelected ? "none" : "scale(0.98)"};
    }
  `}
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  flex: 1;
  min-width: 0;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: ${(props) => {
    const len = props.$nameLength ?? (typeof props.children === "string" ? props.children.length : 0);
    if (len >= 20) return "0.76rem";
    if (len >= 13) return "0.83rem";
    if (len >= 9) return "0.89rem";
    return "0.95rem";
  }};
  font-weight: 700;
  color: #ffffff;
  word-break: keep-all;
  white-space: pre-line;
  line-height: ${(props) => {
    const len = props.$nameLength ?? (typeof props.children === "string" ? props.children.length : 0);
    return len >= 13 ? "1.22" : "1.3";
  }};

  @media (max-width: 480px) {
    font-size: ${(props) => {
      const len = props.$nameLength ?? (typeof props.children === "string" ? props.children.length : 0);
      if (len >= 20) return "0.70rem";
      if (len >= 13) return "0.76rem";
      if (len >= 9) return "0.81rem";
      return "0.86rem";
    }};
    letter-spacing: -0.3px;
  }
`;

const CostBadge = styled.span`
  min-width: 48px;
  width: auto;
  padding: 0 5px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: ${(props) => (props.$isLong ? "0.61rem" : "0.68rem")};
  letter-spacing: ${(props) => (props.$isLong ? "-0.4px" : "normal")};
  font-weight: 600;
  border-radius: 4px;
  background: rgba(100, 255, 218, 0.08);
  color: #64ffda;
  border: 1px solid rgba(100, 255, 218, 0.25);
  white-space: nowrap;
  text-align: center;
  box-sizing: border-box;

  @media (max-width: 480px) {
    width: 44px;
    min-width: 44px;
    max-width: 44px;
    height: 16px;
    font-size: ${(props) => (props.$isLong ? "0.58rem" : "0.64rem")};
  }
`;

const CardDescription = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: #cbd5e1;
  line-height: 1.4;
  word-break: keep-all;
  white-space: pre-wrap;

  @media (max-width: 480px) {
    font-size: 0.76rem;
    line-height: 1.35;
  }
`;
