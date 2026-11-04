import React, { useState, useEffect, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { AugmentIcon } from "./AugmentIcon";
import { AUGMENT_LIST, compareAugmentNames } from "../../../entity/Augment/AugmentData";
import { getSwordEnhanceTier, getSwordEnhanceProb } from "../../../entity/Augment/swordEnhance";
import { ALL_POKEMON_TYPES, TYPE_COLORS, isNoEffect, getTypeEffectText } from "../../../util/typeEffectCalculate";
import { getWeatherBallType } from "../../../util/weatherBall";
import { rollTeamAugments } from "../../../util/augmentRoll";
import { testmode, subscribeTestMode } from "../../../config/testMode";
import AugmentStatusModal from "./AugmentStatusModal";

const AugmentModal = ({ team = [], augments = [], targetPokemon = null, initialTarget = null, battle = null, onSelect, onClose, isTestMode: propTestMode = null, isTitanSelection = false }) => {
  const [isTestMode, setIsTestMode] = useState(() => {
    if (typeof propTestMode === "boolean") return propTestMode;
    if (typeof window !== "undefined" && typeof window.testmode === "boolean") return window.testmode;
    return Boolean(testmode);
  });
  const [showAllList, setShowAllList] = useState(false);

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
  const [skillSelectAug, setSkillSelectAug] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [typeSelectAug, setTypeSelectAug] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedAugment, setSelectedAugment] = useState(null);
  const [swordEnhanceAug, setSwordEnhanceAug] = useState(null);
  const [swordLevel, setSwordLevel] = useState(0);
  const [swordFailed, setSwordFailed] = useState(false);
  const [swordAnimKey, setSwordAnimKey] = useState(0);
  const [swordLastResult, setSwordLastResult] = useState(null);

  const resolvedTeam = team && team.length > 0 ? team : [battle?.player, battle?.playerBench1, battle?.playerBench2].filter(Boolean);

  const getPokeKey = (p, idx) => p?.originalIndex ?? p?.id ?? idx;

  const [activePokemon, setActivePokemon] = useState(() => {
    if (initialTarget && resolvedTeam.some((p) => p === initialTarget || p.id === initialTarget.id)) {
      return initialTarget;
    }
    if (targetPokemon && resolvedTeam.some((p) => p === targetPokemon || p.id === targetPokemon.id)) {
      return targetPokemon;
    }
    return resolvedTeam.find((p) => (p.augments || []).length < 3) || resolvedTeam[0] || null;
  });

  const checkEligibility = (aug, pokemon) => {
    if (!pokemon) return false;
    if (isTitanSelection) return true;
    const maxLimit = 3;
    if ((pokemon.augments || []).length >= maxLimit) return false;
    if (pokemon.hasAugment?.(aug.id) || (pokemon.augments || []).some((a) => a.id === aug.id)) {
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
    AUGMENT_LIST.forEach((aug) => {
      if (checkEligibility(aug, activePokemon)) {
        eligible.push(aug);
      } else {
        ineligible.push(aug);
      }
    });
    eligible.sort(compareAugmentNames);
    ineligible.sort(compareAugmentNames);
    return { allEligible: eligible, allIneligible: ineligible };
  }, [activePokemon]);

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
  const currentChoices = isTitanSelection ? titanFixedChoices : choicesMap && choicesMap[activeKey] && choicesMap[activeKey].length > 0 ? choicesMap[activeKey] : augments && augments.length > 0 ? augments : [];

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
    const isFull = (poke.augments || []).length >= 3;
    if (isFull) return;
    if (poke === activePokemon || poke?.id === activePokemon?.id) return;
    setActivePokemon(poke);
    setSelectedAugment(null); // 다른 포켓몬 선택 시 증강 선택 상태 초기화
    setTypeSelectAug(null);
    setSelectedType(null);
    setSkillSelectAug(null);
    setSelectedSlot(null);
    setSwordEnhanceAug(null);
    setSwordLevel(0);
    setSwordFailed(false);
    setSwordLastResult(null);
  };

  const handleCardClick = (e, aug) => {
    e.stopPropagation();
    if (isPeekMode) {
      setIsPeekMode(false);
      return;
    }
    setSelectedAugment((prev) => (prev?.id === aug.id ? null : aug));
  };

  const handleConfirm = (e) => {
    e?.stopPropagation();
    if (!selectedAugment || !activePokemon) return;

    if ((selectedAugment.id === "danceOfGarchomp" || selectedAugment.id === "nameIsSalamence") && activePokemon?.origin?.skill) {
      setSkillSelectAug(selectedAugment);
      setSelectedSlot(null);
      return;
    }

    if (selectedAugment.id === "nullifyGetto") {
      setTypeSelectAug(selectedAugment);
      setSelectedType(null);
      return;
    }

    if (selectedAugment.id === "teraBlast") {
      setTypeSelectAug(selectedAugment);
      setSelectedType(null);
      return;
    }

    if (selectedAugment.id === "swordEnhance") {
      setSwordEnhanceAug(selectedAugment);
      setSwordLevel(0);
      setSwordFailed(false);
      setSwordLastResult(null);
      setSwordAnimKey(0);
      return;
    }

    onSelect(selectedAugment, { targetPokemon: activePokemon });
  };

  const currentSwordTier = getSwordEnhanceTier(swordLevel);
  const currentSwordProb = getSwordEnhanceProb(swordLevel);
  const currentSwordBonusAtk = swordFailed ? 0 : 20 + swordLevel * 20;

  const handleTryEnhance = (e) => {
    e?.stopPropagation();
    if (swordFailed) return;
    const prob = getSwordEnhanceProb(swordLevel);
    const roll = Math.random() * 100;
    setSwordAnimKey((prev) => prev + 1);
    if (roll < prob) {
      setSwordLevel((prev) => prev + 1);
      setSwordLastResult("success");
    } else {
      setSwordFailed(true);
      setSwordLastResult("fail");
    }
  };

  const handleStopEnhance = (e) => {
    e?.stopPropagation();
    if (!swordEnhanceAug || !activePokemon) return;
    const finalTier = getSwordEnhanceTier(swordLevel);
    const finalBonusAtk = swordFailed ? 0 : 20 + swordLevel * 20;
    onSelect(swordEnhanceAug, {
      targetPokemon: activePokemon,
      swordLevel,
      swordFailed,
      swordBonusAtk: finalBonusAtk,
      swordName: finalTier.name,
    });
    setSwordEnhanceAug(null);
    setSwordLevel(0);
    setSwordFailed(false);
    setSwordLastResult(null);
  };

  const renderSwordSvg = (level, failed) => {
    const tier = getSwordEnhanceTier(level);
    if (failed) {
      return (
        <svg viewBox="0 0 120 120" width="128" height="128" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="failBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="60" cy="60" r="52" fill="url(#failBg)" />
          {/* 깨진 검 파편들 */}
          <polygon points="36,24 48,18 44,34 32,32" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          <polygon points="74,20 86,28 76,38 68,28" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
          <polygon points="48,42 64,36 58,52 44,48" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          <polygon points="24,52 34,46 32,58" fill="#94a3b8" />
          <polygon points="84,50 94,56 82,62" fill="#94a3b8" />
          {/* 부러진 하단 검신 + 코등이 + 자루 */}
          <g transform="rotate(-25 60 78)">
            <polygon points="53,56 58,62 63,54 67,60 67,74 53,74" fill="#475569" stroke="#94a3b8" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M 40 74 L 80 74 L 76 81 L 44 81 Z" fill="#78350f" stroke="#d97706" strokeWidth="1.8" strokeLinejoin="round" />
            <rect x="56" y="81" width="8" height="18" rx="2" fill="#451a03" stroke="#92400e" strokeWidth="1.5" />
            <circle cx="60" cy="102" r="4.5" fill="#78350f" stroke="#d97706" strokeWidth="1.5" />
          </g>
          {/* 균열 번개 선 */}
          <path d="M 35 38 L 52 50 L 46 62 L 68 70" stroke="#f87171" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      );
    }

    const isDagger = level === 0;
    const isWooden = level === 1;
    const isBroad = level >= 5 && level < 12;
    const isGreat = level >= 12;

    return (
      <svg viewBox="0 0 120 120" width="128" height="128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="swordAuraGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={tier.edgeColor} stopOpacity={level >= 10 ? "0.55" : level >= 5 ? "0.32" : "0.12"} />
            <stop offset="60%" stopColor={tier.bladeColor} stopOpacity={level >= 10 ? "0.28" : "0.08"} />
            <stop offset="100%" stopColor={tier.bladeColor} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bladeLinear" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tier.edgeColor} />
            <stop offset="55%" stopColor={tier.bladeColor} />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>

        {/* 단계별 후광 & 마법진 오라 */}
        <circle cx="60" cy="60" r="52" fill="url(#swordAuraGrad)" />
        {level >= 8 && <circle cx="60" cy="60" r="44" stroke={tier.edgeColor} strokeWidth="1.2" strokeDasharray="5 4" strokeOpacity="0.55" />}
        {level >= 15 && <circle cx="60" cy="60" r="49" stroke={tier.bladeColor} strokeWidth="1.5" strokeDasharray="10 5" strokeOpacity="0.7" />}

        <g transform="rotate(-35 60 60)">
          {/* 고강화 날개/화염 오라 (10강 이상) */}
          {level >= 10 && <path d="M 60 10 C 75 28, 82 50, 74 74 C 68 62, 66 45, 60 10 Z M 60 10 C 45 28, 38 50, 46 74 C 52 62, 54 45, 60 10 Z" fill={tier.bladeColor} opacity="0.35" />}

          {/* 검신 (단검 / 일반검 / 대검 단계별 크기 및 형태 변화) */}
          {isDagger ? (
            <>
              <polygon points="60,34 66,46 65,74 60,74" fill="url(#bladeLinear)" />
              <polygon points="60,34 54,46 55,74 60,74" fill={tier.edgeColor} />
              <polygon points="60,34 66,46 65,74 55,74 54,46" fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeLinejoin="round" />
            </>
          ) : isGreat ? (
            <>
              <polygon points="60,10 71,24 68,46 71,52 68,74 60,74" fill="url(#bladeLinear)" />
              <polygon points="60,10 49,24 52,46 49,52 52,74 60,74" fill={tier.edgeColor} />
              <polygon points="60,10 71,24 68,46 71,52 68,74 52,74 49,52 52,46 49,24" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinejoin="round" />
              {/* 대검 중앙 코어 룬 라인 */}
              <line x1="60" y1="20" x2="60" y2="70" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
            </>
          ) : (
            <>
              <polygon points={isBroad ? "60,14 68,26 67,74 60,74" : "60,18 66,28 65,74 60,74"} fill="url(#bladeLinear)" />
              <polygon points={isBroad ? "60,14 52,26 53,74 60,74" : "60,18 54,28 55,74 60,74"} fill={tier.edgeColor} />
              <polygon points={isBroad ? "60,14 68,26 67,74 53,74 52,26" : "60,18 66,28 65,74 55,74 54,28"} fill="none" stroke={isWooden ? "#78350f" : "#ffffff"} strokeWidth="1.6" strokeLinejoin="round" />
              {level >= 4 && <line x1="60" y1="24" x2="60" y2="70" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />}
            </>
          )}

          {/* 크로스 가드 (코등이) */}
          {isGreat ? <path d="M 36 70 L 60 75 L 84 70 L 78 81 L 60 79 L 42 81 Z" fill={tier.hiltColor} stroke="#fef08a" strokeWidth="1.8" strokeLinejoin="round" /> : <path d="M 42 73 L 78 73 L 75 80 L 45 80 Z" fill={tier.hiltColor} stroke="#fef08a" strokeWidth="1.5" strokeLinejoin="round" />}

          {/* 가드 중앙 보석 (3강 이상) */}
          {level >= 3 && <circle cx="60" cy="76.5" r={isGreat ? "3.6" : "2.6"} fill={tier.edgeColor} stroke="#ffffff" strokeWidth="1" />}

          {/* 그립 (손잡이) & 폼멜 */}
          <rect x="56.5" y="80" width="7" height="17" rx="2" fill="#451a03" stroke="#fde047" strokeWidth="1.3" />
          <circle cx="60" cy="100" r="4.5" fill={tier.hiltColor} stroke="#fef08a" strokeWidth="1.5" />
        </g>

        {/* 강화 단계별 스파클 이펙트 */}
        {level >= 1 && (
          <>
            <path d="M 28 28 Q 28 33 33 33 Q 28 33 28 38 Q 28 33 23 33 Q 28 33 28 28 Z" fill="#fef08a" />
            <path d="M 90 36 Q 90 40 94 40 Q 90 40 90 44 Q 90 40 86 40 Q 90 40 90 36 Z" fill="#64ffda" />
          </>
        )}
        {level >= 6 && (
          <>
            <path d="M 84 78 Q 84 83 89 83 Q 84 83 84 88 Q 84 83 79 83 Q 84 83 84 78 Z" fill={tier.edgeColor} />
            <circle cx="30" cy="76" r="2.2" fill="#ffffff" />
            <circle cx="88" cy="24" r="2" fill="#fde047" />
          </>
        )}
      </svg>
    );
  };

  return (
    <>
      <ModalOverlay $isPeek={isPeekMode} onClick={() => setIsPeekMode((prev) => !prev)}>
        <ModalWrapper onClick={(e) => e.stopPropagation()}>
          <ModalContainer $isPeek={isPeekMode} onClick={handleContainerClick}>
            {swordEnhanceAug ? (
              <>
                <HeaderArea>
                  <HeaderTopRow>
                    <Title>검 강화하기</Title>
                  </HeaderTopRow>
                  <SubTitleText>{activePokemon?.name ? `${activePokemon.name}에게 부여할 검을 강화하세요! (실패 시 공격력 +0)` : "검을 강화하여 공격력을 높이세요! (실패 시 공격력 +0)"}</SubTitleText>
                </HeaderArea>

                <SwordEnhanceContainer>
                  <SwordVisualBox key={swordAnimKey} $status={swordLastResult} $failed={swordFailed}>
                    {renderSwordSvg(swordLevel, swordFailed)}
                    {swordLastResult === "success" && !swordFailed && <SwordStatusBadge $success>강화 성공! (+20)</SwordStatusBadge>}
                    {swordFailed && <SwordStatusBadge $success={false}>강화 실패... (파괴됨)</SwordStatusBadge>}
                  </SwordVisualBox>

                  <SwordInfoBox>
                    <SwordTitleText $failed={swordFailed}>{swordFailed ? `파괴된 ${currentSwordTier.name} (+${swordLevel}강 실패)` : `+${swordLevel} ${currentSwordTier.name}`}</SwordTitleText>
                    <SwordAtkBonusText $failed={swordFailed}>
                      현재 공격력 증가량: <strong>+{currentSwordBonusAtk}</strong>
                    </SwordAtkBonusText>
                    <SwordProbBadge $prob={currentSwordProb} $failed={swordFailed}>
                      {swordFailed ? "강화 실패로 더 이상 강화할 수 없습니다" : `강화 성공 확률: ${currentSwordProb}%`}
                    </SwordProbBadge>
                  </SwordInfoBox>
                </SwordEnhanceContainer>

                <ButtonGroup>
                  <ActionButton type="button" $variant="back" onClick={handleStopEnhance}>
                    그만하기 (+{currentSwordBonusAtk} 적용)
                  </ActionButton>
                  <ActionButton type="button" $variant="confirm" disabled={swordFailed} onClick={handleTryEnhance}>
                    강화하기 ({currentSwordProb}%)
                  </ActionButton>
                </ButtonGroup>
              </>
            ) : skillSelectAug ? (
              <>
                <HeaderArea>
                  <HeaderTopRow>
                    <Title>교체할 기술 선택</Title>
                    <CloseButton
                      onClick={(e) => {
                        e.stopPropagation();
                        if (skillSelectAug?.id === "teraBlast") {
                          setTypeSelectAug(skillSelectAug);
                          setSkillSelectAug(null);
                          setSelectedSlot(null);
                        } else {
                          setSelectedSlot(null);
                          setSkillSelectAug(null);
                        }
                      }}
                      title="되돌아가기"
                    >
                      ✕
                    </CloseButton>
                  </HeaderTopRow>
                  <SubTitleText>{skillSelectAug?.id === "teraBlast" ? `[${selectedType || "노말"}] 테라버스트와 교체할 기술을 선택해주세요.` : skillSelectAug?.id === "nameIsSalamence" ? "지진과 교체할 기술을 선택해주세요." : "용의춤과 교체할 기술을 선택해주세요."}</SubTitleText>
                </HeaderArea>

                <SkillGrid>
                  {[1, 2, 3, 4].map((slot) => {
                    const sk = activePokemon?.origin?.skill?.[slot];
                    if (!sk) return null;
                    const currentPp = activePokemon?.pp?.[slot] ?? sk.pp;
                    const displayType = sk.name === "웨더볼" ? getWeatherBallType(battle?.field?.weather) : sk.type;
                    const effectText = battle?.npc ? getTypeEffectText(activePokemon, displayType, battle.npc.type1, battle.npc.type2, sk.stype, sk.name) : "";
                    const isSelected = selectedSlot === slot;
                    return (
                      <SkillCard
                        key={slot}
                        $isSelected={isSelected}
                        $isPeek={isPeekMode}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isPeekMode) {
                            setIsPeekMode(false);
                            return;
                          }
                          setSelectedSlot(slot);
                        }}
                      >
                        <SkillTopRow>
                          <SkillTypeIcon
                            src={`/pokemon/img/type/${displayType}.svg`}
                            alt={sk.type}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          <SkillName title={sk.name}>{sk.name}</SkillName>
                        </SkillTopRow>
                        <SkillEffectText>{effectText || ""}</SkillEffectText>
                        <SkillPP>
                          {currentPp}/{sk.pp}
                        </SkillPP>
                      </SkillCard>
                    );
                  })}
                </SkillGrid>

                <ButtonGroup>
                  <ActionButton
                    type="button"
                    $variant="back"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (skillSelectAug?.id === "teraBlast") {
                        setTypeSelectAug(skillSelectAug);
                        setSkillSelectAug(null);
                        setSelectedSlot(null);
                      } else {
                        setSelectedSlot(null);
                        setSkillSelectAug(null);
                      }
                    }}
                  >
                    되돌아가기
                  </ActionButton>
                  <ActionButton
                    type="button"
                    $variant="confirm"
                    disabled={!selectedSlot}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!selectedSlot) return;
                      onSelect(skillSelectAug, {
                        replaceSlot: selectedSlot,
                        targetPokemon: activePokemon,
                        selectedType: selectedType || "노말",
                      });
                      setSelectedSlot(null);
                      setSkillSelectAug(null);
                      setSelectedType(null);
                    }}
                  >
                    교체
                  </ActionButton>
                </ButtonGroup>
              </>
            ) : typeSelectAug ? (
              <>
                <HeaderArea>
                  <HeaderTopRow>
                    <Title>{typeSelectAug?.id === "teraBlast" ? "테라버스트 타입 선택" : "무효 타입 선택"}</Title>
                    <CloseButton
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedType(null);
                        setTypeSelectAug(null);
                      }}
                      title="취소"
                    >
                      ✕
                    </CloseButton>
                  </HeaderTopRow>
                  <SubTitleText>{typeSelectAug?.id === "teraBlast" ? (activePokemon?.name ? `${activePokemon.name}의 테라버스트에 부여할 타입을 선택해주세요.` : "테라버스트의 타입을 선택해주세요.") : activePokemon?.name ? `${activePokemon.name}에게 추가할 무효 타입을 선택해주세요.` : "무효화할 타입을 선택해주세요."}</SubTitleText>
                </HeaderArea>

                <TypeGridContainer>
                  <TypeGrid>
                    {ALL_POKEMON_TYPES.map((tName) => {
                      const t1 = activePokemon?.origin?.type1 || activePokemon?.type1;
                      const t2 = activePokemon?.origin?.type2 || activePokemon?.type2;
                      const isDisabled = typeSelectAug?.id === "teraBlast" ? false : Boolean(t1 && isNoEffect(tName, t1, t2));
                      const isSelected = selectedType === tName;
                      const typeCol = TYPE_COLORS[tName] || "#64ffda";
                      return (
                        <TypeCard
                          key={tName}
                          $isSelected={isSelected}
                          $isDisabled={isDisabled}
                          $typeColor={typeCol}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isDisabled) return;
                            setSelectedType((prev) => (prev === tName ? null : tName));
                          }}
                          title={typeSelectAug?.id === "teraBlast" ? `${tName} 타입 테라버스트 선택` : isDisabled ? `${tName} 타입은 이미 무효화되어 있습니다` : `${tName} 타입 무효화 선택`}
                        >
                          <TypeIconImg
                            src={`/pokemon/img/type/${tName}.svg`}
                            alt={tName}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          <TypeNameText>{tName}</TypeNameText>
                          {isDisabled ? <TypeNullBadge>무효</TypeNullBadge> : isSelected ? <TypeSelectedCheck>✓</TypeSelectedCheck> : null}
                        </TypeCard>
                      );
                    })}
                  </TypeGrid>
                </TypeGridContainer>

                <ButtonGroup>
                  <ActionButton
                    type="button"
                    $variant="back"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedType(null);
                      setTypeSelectAug(null);
                    }}
                  >
                    취소
                  </ActionButton>
                  <ActionButton
                    type="button"
                    $variant="confirm"
                    disabled={!selectedType}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!selectedType) return;
                      if (typeSelectAug?.id === "teraBlast") {
                        setSkillSelectAug(typeSelectAug);
                        setTypeSelectAug(null);
                        setSelectedSlot(null);
                        return;
                      }
                      onSelect(typeSelectAug, { targetPokemon: activePokemon, selectedType });
                      setSelectedType(null);
                      setTypeSelectAug(null);
                    }}
                  >
                    {typeSelectAug?.id === "teraBlast" ? "다음" : "선택"}
                  </ActionButton>
                </ButtonGroup>
              </>
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
                      const isFull = (poke.augments || []).length >= 3;
                      const pokeId = poke.origin?.pokemon_id || poke.pokemon_id;
                      return (
                        <EntryCard
                          key={getPokeKey(poke, idx)}
                          $isSelected={isSelected}
                          $disabled={isFull}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPokemon(poke);
                          }}
                          title={isFull ? `${poke.name} (증강 3개 보유 완료)` : poke.name}
                        >
                          <EntryPokemonImg
                            src={`/pokemon/img/pokemon/${pokeId}.webp`}
                            alt={poke.name}
                            onError={(e) => {
                              e.currentTarget.src = "/pokemon/img/pokemon/0000.webp";
                            }}
                          />
                          <EntryPokemonName>{poke.name}</EntryPokemonName>
                          {isFull && <EntryFullBadge>3/3</EntryFullBadge>}
                        </EntryCard>
                      );
                    })}
                  </EntryContainer>
                )}

                <CardContainer $isAll={showAllList}>
                  {showAllList ? (
                    allEligible.length === 0 && allIneligible.length === 0 ? (
                      <EmptyChoiceText>등록된 증강이 없습니다.</EmptyChoiceText>
                    ) : (
                      <>
                        {allEligible.map((aug, index) => {
                          const isCardSelected = selectedAugment?.id === aug.id;
                          return (
                            <AugmentCard key={aug.id || index} $isPeek={isPeekMode} $isSelected={isCardSelected} onClick={(e) => handleCardClick(e, aug)}>
                              <IconCol>
                                <IconWrapper>
                                  <AugmentIcon id={aug.id} size={38} pokemon={activePokemon} shiftUp={aug.shiftUp} imageOptions={aug.imageOptions} />
                                </IconWrapper>
                                {aug.cost !== "-" && aug.cost !== undefined && <CostBadge $isLong={String(aug.cost).length >= 3}>{aug.cost ?? 1} cost</CostBadge>}
                              </IconCol>
                              <CardContent>
                                <CardTitle>{aug.name}</CardTitle>
                                <CardDescription>{aug.desc}</CardDescription>
                              </CardContent>
                            </AugmentCard>
                          );
                        })}

                        {allIneligible.length > 0 && (
                          <>
                            <IneligibleDivider>
                              <span>선택 불가 증강 ({allIneligible.length})</span>
                            </IneligibleDivider>
                            {allIneligible.map((aug, index) => (
                              <AugmentCard key={`ineligible-${aug.id || index}`} $isPeek={isPeekMode} $disabled={true} onClick={(e) => e.stopPropagation()} title="이 포켓몬은 해당 증강의 선택 조건을 만족하지 않거나 이미 보유 중입니다.">
                                <IconCol>
                                  <IconWrapper>
                                    <AugmentIcon id={aug.id} size={38} pokemon={activePokemon} shiftUp={aug.shiftUp} imageOptions={aug.imageOptions} />
                                  </IconWrapper>
                                  {aug.cost !== "-" && aug.cost !== undefined && <CostBadge $isLong={String(aug.cost).length >= 3}>{aug.cost ?? 1} cost</CostBadge>}
                                </IconCol>
                                <CardContent>
                                  <CardTitleRow>
                                    <CardTitle>{aug.name}</CardTitle>
                                    <IneligibleBadge>선택 불가</IneligibleBadge>
                                  </CardTitleRow>
                                  <CardDescription>{aug.desc}</CardDescription>
                                </CardContent>
                              </AugmentCard>
                            ))}
                          </>
                        )}
                      </>
                    )
                  ) : currentChoices.length === 0 ? (
                    <EmptyChoiceText>선택 가능한 증강이 없습니다.</EmptyChoiceText>
                  ) : (
                    currentChoices.map((aug, index) => {
                      const isCardSelected = selectedAugment?.id === aug.id;
                      return (
                        <AugmentCard key={aug.id || index} $isPeek={isPeekMode} $isSelected={isCardSelected} onClick={(e) => handleCardClick(e, aug)}>
                          <IconCol>
                            <IconWrapper>
                              <AugmentIcon id={aug.id} size={38} pokemon={activePokemon} shiftUp={aug.shiftUp} imageOptions={aug.imageOptions} />
                            </IconWrapper>
                            {aug.cost !== "-" && aug.cost !== undefined && <CostBadge $isLong={String(aug.cost).length >= 3}>{aug.cost ?? 1} cost</CostBadge>}
                          </IconCol>
                          <CardContent>
                            <CardTitle>{aug.name}</CardTitle>
                            <CardDescription>{aug.desc}</CardDescription>
                          </CardContent>
                        </AugmentCard>
                      );
                    })
                  )}
                </CardContainer>

                <ButtonGroup>
                  <ConfirmButton type="button" disabled={!selectedAugment} onClick={handleConfirm}>
                    선택
                  </ConfirmButton>
                </ButtonGroup>
              </>
            )}
          </ModalContainer>
          <PeekToggleButton $isPeek={isPeekMode} onClick={handleTogglePeek} title={isPeekMode ? "증강 선택창 선명하게" : "모달 흐리게 (필드 확인)"}>
            {isPeekMode ? "선명하게 보기" : "필드 보기 (흐리게)"}
          </PeekToggleButton>
        </ModalWrapper>
      </ModalOverlay>

      {isStatusOpen && <AugmentStatusModal battle={battle} team={resolvedTeam} onClose={() => setIsStatusOpen(false)} />}
    </>
  );
};

export default AugmentModal;

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

const EntryFullBadge = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  color: #f87171;
  background: rgba(239, 68, 68, 0.2);
  padding: 1px 4px;
  border-radius: 4px;
  line-height: 1;
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;

  ${(props) =>
    props.$isAll &&
    `
    max-height: 52vh;
    overflow-y: auto;
    padding-right: 4px;
    margin-bottom: 4px;

    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.25);
      border-radius: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(100, 255, 218, 0.35);
      border-radius: 4px;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: rgba(100, 255, 218, 0.65);
    }
  `}
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
`;

const EmptyChoiceText = styled.div`
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
  width: 100%;
  background: ${(props) => (props.$disabled ? "rgba(15, 23, 42, 0.35)" : props.$isSelected ? "rgba(22, 45, 64, 0.98)" : "rgba(0, 0, 0, 0.45)")};
  border: ${(props) => (props.$disabled ? "1px solid rgba(255, 255, 255, 0.06)" : props.$isSelected ? "1.5px solid #64ffda" : "1px solid rgba(255, 255, 255, 0.1)")};
  border-left: 4px solid ${(props) => (props.$disabled ? "#475569" : props.$isSelected ? "#38bdf8" : "#64ffda")};
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
  box-shadow: ${(props) => (props.$isSelected ? "0 0 14px rgba(100, 255, 218, 0.45), inset 0 0 8px rgba(100, 255, 218, 0.15)" : "none")};

  @media (max-width: 480px) {
    padding: 10px 10px;
  }

  ${(props) =>
    !props.$disabled &&
    `
    &:hover {
      transform: ${props.$isPeek ? "none" : "translateY(-2px)"};
      border-color: ${props.$isSelected ? "#64ffda" : "rgba(100, 255, 218, 0.5)"};
      border-left: 4px solid #64ffda;
      background: ${props.$isSelected ? "rgba(22, 45, 64, 0.98)" : "rgba(20, 30, 44, 0.75)"};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);

      ${IconWrapper} {
        transform: ${props.$isPeek ? "none" : "scale(1.05)"};
        filter: drop-shadow(0 0 6px rgba(100, 255, 218, 0.4));
      }
    }

    &:active {
      transform: scale(0.98);
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
  margin: 0 0 4px 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
  word-break: keep-all;
  line-height: 1.3;

  @media (max-width: 480px) {
    font-size: 0.86rem;
    letter-spacing: -0.3px;
    margin-bottom: 2px;
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

const SubTitleText = styled.p`
  margin: 6px 0 0 0;
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.4;
  word-break: keep-all;
`;

const SkillGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  margin-top: 4px;
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
  cursor: pointer;
  box-sizing: border-box;
  user-select: none;
  transition: all 0.2s ease;
  overflow: hidden;
  box-shadow: ${(props) => (props.$isSelected ? "0 0 14px rgba(100, 255, 218, 0.45), inset 0 0 8px rgba(100, 255, 218, 0.15)" : "0 2px 8px rgba(0, 0, 0, 0.4)")};

  &:hover {
    transform: ${(props) => (props.$isPeek ? "none" : "translateY(-2px)")};
    border-color: ${(props) => (props.$isSelected ? "#64ffda" : "rgba(100, 255, 218, 0.5)")};
    background: ${(props) => (props.$isSelected ? "rgba(22, 45, 64, 0.98)" : "rgba(20, 30, 44, 0.8)")};
  }

  &:active {
    transform: scale(0.98);
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
  font-size: 0.95rem;
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

const ButtonGroup = styled.div`
  display: flex;
  width: 100%;
  gap: 10px;
  margin-top: 14px;
  box-sizing: border-box;
`;

const ConfirmButton = styled.button`
  width: 100%;
  padding: 10px 0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  font-family: inherit;
  transition: all 0.2s ease;
  user-select: none;

  background: ${(props) => (props.disabled ? "rgba(255, 255, 255, 0.05)" : "linear-gradient(135deg, #0d9488, #0284c7)")};
  border: ${(props) => (props.disabled ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #64ffda")};
  color: ${(props) => (props.disabled ? "#64748b" : "#ffffff")};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  box-shadow: ${(props) => (props.disabled ? "none" : "0 0 12px rgba(100, 255, 218, 0.35)")};

  &:hover {
    ${(props) =>
      !props.disabled &&
      `
      background: linear-gradient(135deg, #14b8a6, #0284c7);
      box-shadow: 0 0 16px rgba(100, 255, 218, 0.55);
      transform: translateY(-1px);
    `}
  }

  &:active {
    ${(props) => !props.disabled && `transform: translateY(1px);`}
  }
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 10px 0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  font-family: inherit;
  transition: all 0.2s ease;
  user-select: none;

  ${(props) =>
    props.$variant === "back"
      ? `
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #cbd5e1;
    cursor: pointer;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.35);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(1px);
    }
  `
      : `
    background: ${props.disabled ? "rgba(255, 255, 255, 0.05)" : "linear-gradient(135deg, #0d9488, #0284c7)"};
    border: ${props.disabled ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #64ffda"};
    color: ${props.disabled ? "#64748b" : "#ffffff"};
    cursor: ${props.disabled ? "not-allowed" : "pointer"};
    box-shadow: ${props.disabled ? "none" : "0 0 12px rgba(100, 255, 218, 0.35)"};

    &:hover {
      ${
        !props.disabled &&
        `
        background: linear-gradient(135deg, #14b8a6, #0284c7);
        box-shadow: 0 0 16px rgba(100, 255, 218, 0.55);
        transform: translateY(-1px);
      `
      }
    }

    &:active {
      ${!props.disabled && `transform: translateY(1px);`}
    }
  `}
`;

const TypeGridContainer = styled.div`
  width: 100%;
  max-height: 52vh;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 2px;
  margin-top: 4px;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(100, 255, 218, 0.3);
    border-radius: 4px;
  }
`;

const TypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    gap: 5px;
  }
`;

const TypeCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  padding: 8px 8px;
  min-height: 38px;
  box-sizing: border-box;
  border-radius: 7px;
  user-select: none;
  transition: all 0.2s ease;

  background: ${(props) => (props.$isDisabled ? "rgba(10, 15, 22, 0.5)" : props.$isSelected ? "rgba(22, 45, 64, 0.98)" : "rgba(18, 24, 35, 0.75)")};

  border: ${(props) => (props.$isDisabled ? "1px dashed rgba(255, 255, 255, 0.1)" : props.$isSelected ? "2px solid #64ffda" : "1px solid rgba(255, 255, 255, 0.12)")};

  border-left: ${(props) => (props.$isDisabled ? "3px solid rgba(148, 163, 184, 0.3)" : props.$isSelected ? "3px solid #64ffda" : `3px solid ${props.$typeColor || "#64ffda"}`)};

  opacity: ${(props) => (props.$isDisabled ? 0.38 : 1)};
  cursor: ${(props) => (props.$isDisabled ? "not-allowed" : "pointer")};

  box-shadow: ${(props) => (props.$isSelected ? "0 0 12px rgba(100, 255, 218, 0.45), inset 0 0 6px rgba(100, 255, 218, 0.15)" : "none")};

  &:hover {
    ${(props) =>
      !props.$isDisabled &&
      `
      transform: translateY(-1px);
      border-color: ${props.$isSelected ? "#64ffda" : "rgba(100, 255, 218, 0.5)"};
      background: ${props.$isSelected ? "rgba(22, 45, 64, 0.98)" : "rgba(25, 38, 54, 0.85)"};
    `}
  }

  &:active {
    ${(props) => !props.$isDisabled && "transform: scale(0.98);"}
  }

  @media (max-width: 480px) {
    padding: 6px 5px;
    gap: 4px;
    min-height: 34px;
  }
`;

const TypeIconImg = styled.img`
  width: 20px;
  height: 20px;
  object-fit: contain;
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 17px;
    height: 17px;
  }
`;

const TypeNameText = styled.span`
  font-size: 0.82rem;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;

  @media (max-width: 480px) {
    font-size: 0.74rem;
  }
`;

const TypeNullBadge = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.08);
  padding: 1px 4px;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
  line-height: 1.2;

  @media (max-width: 480px) {
    font-size: 0.58rem;
    padding: 1px 2px;
  }
`;

const TypeSelectedCheck = styled.span`
  font-size: 0.8rem;
  font-weight: 800;
  color: #64ffda;
  margin-left: auto;
  flex-shrink: 0;
  line-height: 1;
`;

const swordSuccessPop = keyframes`
  0% { transform: scale(0.92); }
  50% { transform: scale(1.06); }
  100% { transform: scale(1); }
`;

const swordFailShake = keyframes`
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-7px) rotate(-2deg); }
  40% { transform: translateX(7px) rotate(2deg); }
  60% { transform: translateX(-5px) rotate(-1deg); }
  80% { transform: translateX(5px) rotate(1deg); }
`;

const SwordEnhanceContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 6px 0 4px;
`;

const SwordVisualBox = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 18px;
  background: ${(props) => (props.$failed ? "radial-gradient(circle, rgba(127, 29, 29, 0.35) 0%, rgba(15, 23, 42, 0.9) 100%)" : "radial-gradient(circle, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)")};
  border: 1.5px solid ${(props) => (props.$failed ? "rgba(239, 68, 68, 0.55)" : "rgba(100, 255, 218, 0.4)")};
  box-shadow: ${(props) => (props.$failed ? "0 0 18px rgba(239, 68, 68, 0.25)" : "0 0 18px rgba(56, 189, 248, 0.2), inset 0 0 15px rgba(100, 255, 218, 0.1)")};
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${(props) => (props.$status === "fail" ? swordFailShake : props.$status === "success" ? swordSuccessPop : "none")} 0.35s ease;
`;

const SwordStatusBadge = styled.div`
  position: absolute;
  bottom: 8px;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  color: ${(props) => (props.$success ? "#090d16" : "#ffffff")};
  background: ${(props) => (props.$success ? "linear-gradient(135deg, #64ffda 0%, #38bdf8 100%)" : "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)")};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
`;

const SwordInfoBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 14px;
  box-sizing: border-box;
`;

const SwordTitleText = styled.div`
  font-size: 1.15rem;
  font-weight: 800;
  color: ${(props) => (props.$failed ? "#f87171" : "#fef08a")};
  text-shadow: 0 0 10px ${(props) => (props.$failed ? "rgba(239, 68, 68, 0.35)" : "rgba(250, 204, 21, 0.35)")};
  text-align: center;
`;

const SwordAtkBonusText = styled.div`
  font-size: 0.9rem;
  color: ${(props) => (props.$failed ? "#94a3b8" : "#e2e8f0")};
  text-align: center;

  strong {
    color: ${(props) => (props.$failed ? "#f87171" : "#64ffda")};
    font-weight: 800;
  }

  span {
    font-size: 0.8rem;
    color: #94a3b8;
  }
`;

const SwordProbBadge = styled.div`
  margin-top: 2px;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 800;
  color: ${(props) => (props.$failed ? "#fca5a5" : props.$prob >= 60 ? "#64ffda" : props.$prob >= 30 ? "#fde047" : "#fb923c")};
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.12);
`;
