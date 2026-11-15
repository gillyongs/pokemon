import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { abilObject, noRandomAbil } from "../../../../entity/Ability";
import { HeaderArea, HeaderTopRow, Title, ButtonGroup, ActionButton } from "./selectStyles";

const SLOT_ROW_HEIGHT = 54;

const ODD_EVEN_STAT_LIST = [
  { key: "atk", label: "공격" },
  { key: "catk", label: "특수공격" },
  { key: "def", label: "방어" },
  { key: "cdef", label: "특수방어" },
  { key: "speed", label: "스피드" },
];
const ODD_EVEN_POS_DELTAS = [1, 2, 3, 4, 5, 6];
const ODD_EVEN_NEG_DELTAS = [-1, -2, -3, -4, -5, -6];

const ALL_OR_NOTHING_SLICES = [
  { stat: "atk", label: "공격", sub: "2배" },
  { stat: "catk", label: "특공", sub: "2배" },
  { stat: "atk", label: "공격", sub: "2배" },
  { stat: "catk", label: "특공", sub: "2배" },
  { stat: "atk", label: "공격", sub: "2배" },
  { stat: "catk", label: "특공", sub: "2배" },
];

const HIGH_RISK_SLICES = [
  { result: "buff", label: "버프", sub: "3배" },
  { result: "curse", label: "디버프", sub: "절반" },
  { result: "buff", label: "버프", sub: "3배" },
  { result: "curse", label: "디버프", sub: "절반" },
  { result: "buff", label: "버프", sub: "3배" },
  { result: "curse", label: "디버프", sub: "절반" },
];

const formatDeltaText = (val) => (val > 0 ? `+${val}` : `${val}`);

const getRandomAbilityPool = (pokemon) => {
  const currentAbil = pokemon?.abil?.name || pokemon?.abil;
  return Object.keys(abilObject).filter((a) => !noRandomAbil.includes(a) && a !== currentAbil);
};

const pickRandomFrom = (arr, exclude = null) => {
  const filtered = exclude ? arr.filter((x) => x !== exclude) : arr;
  const source = filtered.length > 0 ? filtered : arr;
  return source[Math.floor(Math.random() * source.length)] || "";
};

const buildInitialAbilityReel = (pokemon) => {
  const pool = getRandomAbilityPool(pokemon);
  const centerAbil = pokemon?.abil?.name || pokemon?.abil || pickRandomFrom(pool);
  const topAbil = pickRandomFrom(pool, centerAbil);
  const bottomAbil = pickRandomFrom(pool, centerAbil);
  return [topAbil, centerAbil, bottomAbil];
};

const buildInitialOddEvenReels = () => {
  const centerStat = ODD_EVEN_STAT_LIST[Math.floor(Math.random() * ODD_EVEN_STAT_LIST.length)];
  const otherStats = ODD_EVEN_STAT_LIST.filter((s) => s.key !== centerStat.key);
  const topStat = otherStats[Math.floor(Math.random() * otherStats.length)];
  const bottomPool = otherStats.filter((s) => s.key !== topStat.key);
  const bottomStat = bottomPool[Math.floor(Math.random() * bottomPool.length)] || topStat;

  const centerDelta = ODD_EVEN_POS_DELTAS[Math.floor(Math.random() * ODD_EVEN_POS_DELTAS.length)];
  const topDelta = ODD_EVEN_NEG_DELTAS[Math.floor(Math.random() * ODD_EVEN_NEG_DELTAS.length)];
  const negRest = ODD_EVEN_NEG_DELTAS.filter((d) => d !== topDelta);
  const bottomDelta = negRest[Math.floor(Math.random() * negRest.length)] ?? topDelta;

  return {
    statItems: [topStat, centerStat, bottomStat],
    deltaItems: [topDelta, centerDelta, bottomDelta],
  };
};

const AugmentRouletteView = ({ rouletteAug, activePokemon, battle, onSelect, onCancel }) => {
  const [rouletteSpinning, setRouletteSpinning] = useState(false);
  const [rouletteRotation, setRouletteRotation] = useState(0);
  const [rouletteResult, setRouletteResult] = useState(null);
  const [slotReelItems, setSlotReelItems] = useState([]);
  const [slotOffsetY, setSlotOffsetY] = useState(0);
  const [slotTransitionEnabled, setSlotTransitionEnabled] = useState(false);
  const [oddEvenStatItems, setOddEvenStatItems] = useState([]);
  const [oddEvenDeltaItems, setOddEvenDeltaItems] = useState([]);
  const [oddEvenStatOffsetY, setOddEvenStatOffsetY] = useState(0);
  const [oddEvenDeltaOffsetY, setOddEvenDeltaOffsetY] = useState(0);
  const [oddEvenStatSettled, setOddEvenStatSettled] = useState(false);

  const rouletteTimerRef = useRef(null);
  const oddEvenStatTimerRef = useRef(null);
  const slotRafRef = useRef(null);

  const clearSlotTimers = () => {
    if (rouletteTimerRef.current) {
      clearTimeout(rouletteTimerRef.current);
      rouletteTimerRef.current = null;
    }
    if (oddEvenStatTimerRef.current) {
      clearTimeout(oddEvenStatTimerRef.current);
      oddEvenStatTimerRef.current = null;
    }
    if (slotRafRef.current) {
      cancelAnimationFrame(slotRafRef.current);
      slotRafRef.current = null;
    }
  };

  useEffect(() => {
    if (rouletteAug?.id === "randomAbility") {
      setSlotReelItems(buildInitialAbilityReel(activePokemon));
    } else if (rouletteAug?.id === "oddEven") {
      const init = buildInitialOddEvenReels();
      setOddEvenStatItems(init.statItems);
      setOddEvenDeltaItems(init.deltaItems);
    }
    return () => {
      clearSlotTimers();
    };
  }, [rouletteAug, activePokemon]);

  const handleSpinRoulette = (e) => {
    e?.stopPropagation();
    if (!rouletteAug || rouletteSpinning || rouletteResult) return;

    if (rouletteAug.id === "randomAbility") {
      const pool = getRandomAbilityPool(activePokemon);
      if (pool.length === 0) return;
      const picked = pool[Math.floor(Math.random() * pool.length)];

      const currentWindow = slotReelItems.length >= 3 ? [slotReelItems[0], slotReelItems[1], slotReelItems[2]] : buildInitialAbilityReel(activePokemon);

      const totalSpinSteps = 44;
      const reel = new Array(totalSpinSteps + 3);
      reel[0] = pickRandomFrom(pool, picked);
      reel[1] = picked;
      for (let i = 2; i < totalSpinSteps; i++) {
        reel[i] = pickRandomFrom(pool, reel[i - 1]);
      }
      reel[totalSpinSteps] = currentWindow[0];
      reel[totalSpinSteps + 1] = currentWindow[1];
      reel[totalSpinSteps + 2] = currentWindow[2];

      const startOffsetY = -totalSpinSteps * SLOT_ROW_HEIGHT;

      setSlotTransitionEnabled(false);
      setSlotReelItems(reel);
      setSlotOffsetY(startOffsetY);
      setRouletteSpinning(true);

      if (slotRafRef.current) {
        cancelAnimationFrame(slotRafRef.current);
      }
      slotRafRef.current = requestAnimationFrame(() => {
        slotRafRef.current = requestAnimationFrame(() => {
          setSlotTransitionEnabled(true);
          setSlotOffsetY(0);
          slotRafRef.current = null;
        });
      });

      if (rouletteTimerRef.current) {
        clearTimeout(rouletteTimerRef.current);
      }
      rouletteTimerRef.current = setTimeout(() => {
        setRouletteSpinning(false);
        setRouletteResult(picked);
        rouletteTimerRef.current = null;
      }, 3150);
      return;
    }

    if (rouletteAug.id === "oddEven") {
      const pickedStat = ODD_EVEN_STAT_LIST[Math.floor(Math.random() * ODD_EVEN_STAT_LIST.length)];
      const allDeltas = [...ODD_EVEN_NEG_DELTAS, ...ODD_EVEN_POS_DELTAS];
      const pickedDelta = allDeltas[Math.floor(Math.random() * allDeltas.length)];

      const fallbackInit = buildInitialOddEvenReels();
      const curStatWin = oddEvenStatItems.length >= 3 ? oddEvenStatItems.slice(0, 3) : fallbackInit.statItems;
      const curDeltaWin = oddEvenDeltaItems.length >= 3 ? oddEvenDeltaItems.slice(0, 3) : fallbackInit.deltaItems;

      const statSteps = 36;
      const statReel = new Array(statSteps + 3);
      const pickOtherStat = (excludeKey) => {
        const candidates = ODD_EVEN_STAT_LIST.filter((s) => s.key !== excludeKey);
        return candidates[Math.floor(Math.random() * candidates.length)];
      };
      statReel[0] = pickOtherStat(pickedStat.key);
      statReel[1] = pickedStat;
      for (let i = 2; i < statSteps; i++) {
        statReel[i] = pickOtherStat(statReel[i - 1].key);
      }
      statReel[statSteps] = curStatWin[0];
      statReel[statSteps + 1] = curStatWin[1];
      statReel[statSteps + 2] = curStatWin[2];

      const targetIsPos = pickedDelta > 0;
      const winCenterIsPos = curDeltaWin[1] > 0;
      const deltaSteps = targetIsPos === winCenterIsPos ? 44 : 45;
      const needPosAt = (idx) => (idx % 2 === 1 ? targetIsPos : !targetIsPos);
      const pickSignDelta = (isPos, excludeVal = null) => {
        const pool = isPos ? ODD_EVEN_POS_DELTAS : ODD_EVEN_NEG_DELTAS;
        const filtered = excludeVal !== null ? pool.filter((d) => d !== excludeVal) : pool;
        const source = filtered.length > 0 ? filtered : pool;
        return source[Math.floor(Math.random() * source.length)];
      };

      const deltaReel = new Array(deltaSteps + 3);
      deltaReel[0] = pickSignDelta(needPosAt(0));
      deltaReel[1] = pickedDelta;
      for (let i = 2; i < deltaSteps; i++) {
        deltaReel[i] = pickSignDelta(needPosAt(i), deltaReel[i - 2]);
      }
      deltaReel[deltaSteps] = curDeltaWin[0];
      deltaReel[deltaSteps + 1] = curDeltaWin[1];
      deltaReel[deltaSteps + 2] = curDeltaWin[2];

      setSlotTransitionEnabled(false);
      setOddEvenStatSettled(false);
      setOddEvenStatItems(statReel);
      setOddEvenDeltaItems(deltaReel);
      setOddEvenStatOffsetY(-statSteps * SLOT_ROW_HEIGHT);
      setOddEvenDeltaOffsetY(-deltaSteps * SLOT_ROW_HEIGHT);
      setRouletteSpinning(true);

      clearSlotTimers();
      slotRafRef.current = requestAnimationFrame(() => {
        slotRafRef.current = requestAnimationFrame(() => {
          setSlotTransitionEnabled(true);
          setOddEvenStatOffsetY(0);
          setOddEvenDeltaOffsetY(0);
          slotRafRef.current = null;
        });
      });

      oddEvenStatTimerRef.current = setTimeout(() => {
        setOddEvenStatSettled(true);
        oddEvenStatTimerRef.current = null;
      }, 2650);

      rouletteTimerRef.current = setTimeout(() => {
        setRouletteSpinning(false);
        setRouletteResult({ statKey: pickedStat.key, statLabel: pickedStat.label, delta: pickedDelta });
        rouletteTimerRef.current = null;
      }, 3300);
      return;
    }

    let pick = null;
    let hitAngle = 0;

    if (rouletteAug.id === "russianRoulette") {
      pick = Math.random() < 0.5 ? "player" : "npc";
      hitAngle = pick === "npc" ? 30 + Math.random() * 120 : 210 + Math.random() * 120;
    } else if (rouletteAug.id === "doOrDie") {
      pick = Math.random() < 0.1 ? "success" : "fail";
      hitAngle = pick === "success" ? 78 + Math.random() * 24 : 118 + Math.random() * 304;
    } else if (rouletteAug.id === "highRiskHighReturn") {
      pick = Math.random() < 0.5 ? "buff" : "curse";
      const matchingSlices = pick === "buff" ? [0, 2, 4] : [1, 3, 5];
      const chosenSliceIdx = matchingSlices[Math.floor(Math.random() * matchingSlices.length)];
      hitAngle = chosenSliceIdx * 60 + 10 + Math.random() * 40;
    } else {
      pick = Math.random() < 0.5 ? "atk" : "catk";
      const matchingSlices = pick === "atk" ? [0, 2, 4] : [1, 3, 5];
      const chosenSliceIdx = matchingSlices[Math.floor(Math.random() * matchingSlices.length)];
      hitAngle = chosenSliceIdx * 60 + 10 + Math.random() * 40;
    }

    const alignRotation = (360 - (hitAngle % 360)) % 360;
    const extraTurns = (5 + Math.floor(Math.random() * 3)) * 360;
    const finalRotation = extraTurns + alignRotation;

    setRouletteSpinning(true);
    setRouletteRotation(finalRotation);

    if (rouletteTimerRef.current) {
      clearTimeout(rouletteTimerRef.current);
    }
    rouletteTimerRef.current = setTimeout(() => {
      setRouletteSpinning(false);
      setRouletteResult(pick);
      rouletteTimerRef.current = null;
    }, 2950);
  };

  const handleApplyRoulette = (e) => {
    e?.stopPropagation();
    if (!rouletteAug || !activePokemon || !rouletteResult) return;
    const payload = { targetPokemon: activePokemon };
    if (rouletteAug.id === "russianRoulette") {
      payload.faintTarget = rouletteResult;
    } else if (rouletteAug.id === "doOrDie") {
      payload.doOrDieSuccess = rouletteResult === "success";
    } else if (rouletteAug.id === "highRiskHighReturn") {
      payload.highRiskResult = rouletteResult;
    } else if (rouletteAug.id === "randomAbility") {
      payload.pickedAbility = rouletteResult;
    } else if (rouletteAug.id === "oddEven") {
      payload.statKey = rouletteResult.statKey;
      payload.delta = rouletteResult.delta;
    } else {
      payload.targetStat = rouletteResult;
    }
    onSelect(rouletteAug, payload);
  };

  const handleCancel = (e) => {
    e?.stopPropagation();
    if (rouletteSpinning || rouletteResult) return;
    clearSlotTimers();
    if (onCancel) onCancel();
  };

  const getRouletteOutcomeText = () => {
    if (!rouletteAug || !rouletteResult) return "";
    if (rouletteAug.id === "russianRoulette") {
      const targetName = rouletteResult === "npc" ? battle?.npc?.name || "상대 포켓몬" : battle?.player?.name || activePokemon?.name || "내 포켓몬";
      return `${targetName} 기절!`;
    }
    if (rouletteAug.id === "doOrDie") {
      return rouletteResult === "success" ? "성공! 상대 대기 포켓몬 전부 기절" : "실패...";
    }
    if (rouletteAug.id === "highRiskHighReturn") {
      return rouletteResult === "buff" ? "하이 리턴! 모든 공격 데미지 3배" : "하이 리스크... 모든 공격 데미지 절반";
    }
    if (rouletteAug.id === "randomAbility") {
      const prevAbil = activePokemon?.abil?.name || activePokemon?.abil;
      return prevAbil ? `${prevAbil} → ${rouletteResult}` : `획득 특성: ${rouletteResult}`;
    }
    if (rouletteAug.id === "oddEven") {
      return `${rouletteResult.statLabel} ${formatDeltaText(rouletteResult.delta)} 랭크!`;
    }
    return rouletteResult === "atk" ? "공격 2배, 특수공격 절반" : "특수공격 2배, 공격 절반";
  };

  const renderRouletteSvg = () => {
    const cx = 110;
    const cy = 110;
    const r = 98;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const formatWheelLabel = (name) => {
      if (!name) return "";
      return name.length > 8 ? `${name.slice(0, 7)}..` : name;
    };

    if (rouletteAug?.id === "russianRoulette") {
      const playerPoke = battle?.player || activePokemon;
      const npcPoke = battle?.npc;
      const playerPokeId = playerPoke?.uniqueKey || "0025";
      const npcPokeId = npcPoke?.uniqueKey || "0000";
      const playerLabel = formatWheelLabel(playerPoke?.name || "내 포켓몬");
      const npcLabel = formatWheelLabel(npcPoke?.name || "상대");

      return (
        <svg viewBox="0 0 220 220" width="212" height="212" xmlns="http://www.w3.org/2000/svg">
          <circle cx={cx} cy={cy} r="105" fill="#182130" stroke="#475569" strokeWidth="2.5" />
          <path d={`M ${cx} ${cy} L ${cx} ${cy + r} A ${r} ${r} 0 0 1 ${cx} ${cy - r} Z`} fill="#2b5b9e" stroke="#0f172a" strokeWidth="2" />
          <path d={`M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} Z`} fill="#c94a4a" stroke="#0f172a" strokeWidth="2" />
          <g>
            <circle cx="60" cy="96" r="23" fill="rgba(15, 23, 42, 0.55)" stroke="rgba(191, 219, 254, 0.45)" strokeWidth="1.2" />
            <image href={`/pokemon/img/pokemon/${playerPokeId}.webp`} x="42" y="78" width="36" height="36" preserveAspectRatio="xMidYMid meet" />
            <text x="60" y="133" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="700">
              {playerLabel}
            </text>
          </g>
          <g>
            <circle cx="160" cy="96" r="23" fill="rgba(15, 23, 42, 0.55)" stroke="rgba(254, 202, 202, 0.45)" strokeWidth="1.2" />
            <image href={`/pokemon/img/pokemon/${npcPokeId}.webp`} x="142" y="78" width="36" height="36" preserveAspectRatio="xMidYMid meet" />
            <text x="160" y="133" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="700">
              {npcLabel}
            </text>
          </g>
          <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#0f172a" strokeWidth="2.5" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0f172a" strokeWidth="2" />
        </svg>
      );
    }

    if (rouletteAug?.id === "doOrDie") {
      const startDeg = 72;
      const endDeg = 108;
      const x1 = cx + r * Math.sin(toRad(startDeg));
      const y1 = cy - r * Math.cos(toRad(startDeg));
      const x2 = cx + r * Math.sin(toRad(endDeg));
      const y2 = cy - r * Math.cos(toRad(endDeg));
      const successPath = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
      const failPath = `M ${cx} ${cy} L ${x2.toFixed(2)} ${y2.toFixed(2)} A ${r} ${r} 0 1 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;

      return (
        <svg viewBox="0 0 220 220" width="212" height="212" xmlns="http://www.w3.org/2000/svg">
          <circle cx={cx} cy={cy} r="105" fill="#182130" stroke="#475569" strokeWidth="2.5" />
          <path d={failPath} fill="#334155" stroke="#0f172a" strokeWidth="2" />
          <path d={successPath} fill="#0d9488" stroke="#0f172a" strokeWidth="2" />
          <g transform={`rotate(90 ${cx} ${cy})`}>
            <text x={cx} y={cy - 68} textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="800">
              성공
            </text>
            <text x={cx} y={cy - 53} textAnchor="middle" fill="rgba(248,250,252,0.9)" fontSize="10.5" fontWeight="700">
              10%
            </text>
          </g>
          <g>
            <text x="60" y="106" textAnchor="middle" fill="#e2e8f0" fontSize="15" fontWeight="700">
              실패
            </text>
            <text x="60" y="124" textAnchor="middle" fill="rgba(226,232,240,0.8)" fontSize="12.5" fontWeight="700">
              90%
            </text>
          </g>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0f172a" strokeWidth="2" />
        </svg>
      );
    }

    const slices = rouletteAug?.id === "highRiskHighReturn" ? HIGH_RISK_SLICES : ALL_OR_NOTHING_SLICES;

    return (
      <svg viewBox="0 0 220 220" width="212" height="212" xmlns="http://www.w3.org/2000/svg">
        <circle cx={cx} cy={cy} r="105" fill="#182130" stroke="#475569" strokeWidth="2.5" />
        {slices.map((slice, idx) => {
          const startDeg = idx * 60;
          const endDeg = (idx + 1) * 60;
          const midDeg = startDeg + 30;
          const x1 = cx + r * Math.sin(toRad(startDeg));
          const y1 = cy - r * Math.cos(toRad(startDeg));
          const x2 = cx + r * Math.sin(toRad(endDeg));
          const y2 = cy - r * Math.cos(toRad(endDeg));
          const d = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
          const fill = rouletteAug?.id === "highRiskHighReturn" ? (slice.result === "buff" ? "#0f766e" : "#c94a4a") : slice.stat === "atk" ? "#c94a4a" : "#3a6ec4";

          return (
            <g key={idx}>
              <path d={d} fill={fill} stroke="#0f172a" strokeWidth="2" />
              <g transform={`rotate(${midDeg} ${cx} ${cy})`}>
                <text x={cx} y={cy - 60} textAnchor="middle" fill="#f8fafc" fontSize="14" fontWeight="700">
                  {slice.label}
                </text>
                <text x={cx} y={cy - 42} textAnchor="middle" fill="rgba(248,250,252,0.9)" fontSize="13" fontWeight="700">
                  {slice.sub}
                </text>
              </g>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0f172a" strokeWidth="2" />
      </svg>
    );
  };

  return (
    <>
      <HeaderArea>
        <HeaderTopRow>
          <Title>{rouletteAug.shortName || rouletteAug.name}</Title>
        </HeaderTopRow>
      </HeaderArea>

      {rouletteAug.id === "oddEven" ? (
        <AbilitySlotStage>
          <OddEvenPairRow>
            {/* 좌측: 스탯 룰렛 */}
            <AbilitySlotFrame $compact>
              <AbilitySlotViewport>
                <AbilitySlotCenterHighlight $settled={Boolean(rouletteResult) || oddEvenStatSettled} />
                <AbilitySlotTrack
                  style={{
                    transform: `translateY(${oddEvenStatOffsetY}px)`,
                    transition: slotTransitionEnabled ? "transform 2.6s cubic-bezier(0.08, 0.9, 0.14, 1)" : "none",
                  }}
                >
                  {oddEvenStatItems.map((item, idx) => {
                    const isCenterRest = (!rouletteSpinning || oddEvenStatSettled) && idx === 1;
                    const isWinner = (Boolean(rouletteResult) || oddEvenStatSettled) && idx === 1;
                    return (
                      <AbilitySlotRow key={`stat-${item.key}-${idx}`} $compact $isCenter={isCenterRest} $isWinner={isWinner} $isSpinning={rouletteSpinning && !oddEvenStatSettled}>
                        {item.label}
                      </AbilitySlotRow>
                    );
                  })}
                </AbilitySlotTrack>
                <AbilitySlotFadeOverlay />
              </AbilitySlotViewport>

              <AbilitySlotPointerLeft aria-hidden="true">
                <svg viewBox="0 0 24 20" width="24" height="20" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="2,2 22,10 2,18" fill="#f8f1d8" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" />
                  <circle cx="7" cy="10" r="2.5" fill="#64748b" stroke="#0f172a" strokeWidth="1" />
                </svg>
              </AbilitySlotPointerLeft>
              <AbilitySlotPointerRight aria-hidden="true">
                <svg viewBox="0 0 24 20" width="24" height="20" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="22,2 2,10 22,18" fill="#f8f1d8" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" />
                  <circle cx="17" cy="10" r="2.5" fill="#64748b" stroke="#0f172a" strokeWidth="1" />
                </svg>
              </AbilitySlotPointerRight>
            </AbilitySlotFrame>

            {/* 우측: 수치 룰렛 (+1, -6, ...) */}
            <AbilitySlotFrame $compact>
              <AbilitySlotViewport>
                <AbilitySlotCenterHighlight $settled={Boolean(rouletteResult)} />
                <AbilitySlotTrack
                  style={{
                    transform: `translateY(${oddEvenDeltaOffsetY}px)`,
                    transition: slotTransitionEnabled ? "transform 3.25s cubic-bezier(0.08, 0.9, 0.14, 1)" : "none",
                  }}
                >
                  {oddEvenDeltaItems.map((val, idx) => {
                    const isCenterRest = !rouletteSpinning && idx === 1;
                    const isWinner = Boolean(rouletteResult) && isCenterRest;
                    return (
                      <AbilitySlotRow key={`delta-${val}-${idx}`} $compact $isCenter={isCenterRest} $isWinner={isWinner} $isSpinning={rouletteSpinning} $deltaSign={val > 0 ? "pos" : "neg"}>
                        {formatDeltaText(val)}
                      </AbilitySlotRow>
                    );
                  })}
                </AbilitySlotTrack>
                <AbilitySlotFadeOverlay />
              </AbilitySlotViewport>

              <AbilitySlotPointerLeft aria-hidden="true">
                <svg viewBox="0 0 24 20" width="24" height="20" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="2,2 22,10 2,18" fill="#f8f1d8" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" />
                  <circle cx="7" cy="10" r="2.5" fill="#64748b" stroke="#0f172a" strokeWidth="1" />
                </svg>
              </AbilitySlotPointerLeft>
              <AbilitySlotPointerRight aria-hidden="true">
                <svg viewBox="0 0 24 20" width="24" height="20" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="22,2 2,10 22,18" fill="#f8f1d8" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" />
                  <circle cx="17" cy="10" r="2.5" fill="#64748b" stroke="#0f172a" strokeWidth="1" />
                </svg>
              </AbilitySlotPointerRight>
            </AbilitySlotFrame>
          </OddEvenPairRow>

          {rouletteResult && <RouletteOutcomeText>{getRouletteOutcomeText()}</RouletteOutcomeText>}
        </AbilitySlotStage>
      ) : rouletteAug.id === "randomAbility" ? (
        <AbilitySlotStage>
          <AbilitySlotFrame>
            <AbilitySlotViewport>
              <AbilitySlotCenterHighlight $settled={Boolean(rouletteResult)} />
              <AbilitySlotTrack
                style={{
                  transform: `translateY(${slotOffsetY}px)`,
                  transition: slotTransitionEnabled ? "transform 3.1s cubic-bezier(0.08, 0.9, 0.14, 1)" : "none",
                }}
              >
                {slotReelItems.map((abilName, idx) => {
                  const isCenterRest = !rouletteSpinning && idx === 1;
                  const isWinner = Boolean(rouletteResult) && isCenterRest;
                  return (
                    <AbilitySlotRow key={`${abilName}-${idx}`} $isCenter={isCenterRest} $isWinner={isWinner} $isSpinning={rouletteSpinning}>
                      {abilName}
                    </AbilitySlotRow>
                  );
                })}
              </AbilitySlotTrack>
              <AbilitySlotFadeOverlay />
            </AbilitySlotViewport>

            <AbilitySlotPointerLeft aria-hidden="true">
              <svg viewBox="0 0 28 24" width="28" height="24" xmlns="http://www.w3.org/2000/svg">
                <polygon points="2,2 26,12 2,22" fill="#f8f1d8" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" />
                <circle cx="8" cy="12" r="3" fill="#64748b" stroke="#0f172a" strokeWidth="1" />
              </svg>
            </AbilitySlotPointerLeft>
            <AbilitySlotPointerRight aria-hidden="true">
              <svg viewBox="0 0 28 24" width="28" height="24" xmlns="http://www.w3.org/2000/svg">
                <polygon points="26,2 2,12 26,22" fill="#f8f1d8" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" />
                <circle cx="20" cy="12" r="3" fill="#64748b" stroke="#0f172a" strokeWidth="1" />
              </svg>
            </AbilitySlotPointerRight>
          </AbilitySlotFrame>

          {rouletteResult && (
            <>
              <RouletteOutcomeText>{getRouletteOutcomeText()}</RouletteOutcomeText>
              {abilObject[rouletteResult]?.text && <AbilitySlotDescText>{abilObject[rouletteResult].text}</AbilitySlotDescText>}
            </>
          )}
        </AbilitySlotStage>
      ) : (
        <RouletteStageContainer>
          <RouletteWheelBox>
            <RoulettePointer aria-hidden="true">
              <svg viewBox="0 0 20 18" width="18" height="16" xmlns="http://www.w3.org/2000/svg">
                <polygon points="10,17 1,1 19,1" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </RoulettePointer>
            <RouletteDisc style={{ transform: `rotate(${rouletteRotation}deg)` }}>{renderRouletteSvg()}</RouletteDisc>
            <RouletteHub />
          </RouletteWheelBox>

          {rouletteResult && <RouletteOutcomeText>{getRouletteOutcomeText()}</RouletteOutcomeText>}
        </RouletteStageContainer>
      )}

      <ButtonGroup>
        {!rouletteResult ? (
          <>
            <ActionButton type="button" $variant="back" disabled={rouletteSpinning} onClick={handleCancel}>
              되돌아가기
            </ActionButton>
            <ActionButton type="button" $variant="confirm" disabled={rouletteSpinning} onClick={handleSpinRoulette}>
              {rouletteSpinning ? "돌아가는 중..." : "룰렛 돌리기"}
            </ActionButton>
          </>
        ) : (
          <ActionButton type="button" $variant="confirm" onClick={handleApplyRoulette}>
            확인
          </ActionButton>
        )}
      </ButtonGroup>
    </>
  );
};

export default AugmentRouletteView;

const RouletteStageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 12px;
  width: 100%;
  padding: 8px 0 10px;
`;

const RouletteWheelBox = styled.div`
  position: relative;
  width: 212px;
  height: 212px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.55));
`;

const RoulettePointer = styled.div`
  position: absolute;
  top: -7px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  user-select: none;
`;

const RouletteDisc = styled.div`
  width: 212px;
  height: 212px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: center center;
  transition: transform 2.9s cubic-bezier(0.1, 0.88, 0.16, 1);
  will-change: transform;
`;

const RouletteHub = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 26px;
  height: 26px;
  border-radius: 50%;
  z-index: 3;
  background: #1e293b;
  border: 2.5px solid #94a3b8;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.65);
  pointer-events: none;

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #e2e8f0;
  }
`;

const RouletteOutcomeText = styled.div`
  font-size: 0.94rem;
  font-weight: 700;
  color: #f8fafc;
  text-align: center;
  margin-top: 2px;
`;

const AbilitySlotStage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 12px;
  width: 100%;
  padding: 10px 0 12px;
`;

const OddEvenPairRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
`;

const AbilitySlotFrame = styled.div`
  position: relative;
  width: ${(props) => (props.$compact ? "auto" : "min(340px, 100%)")};
  flex: ${(props) => (props.$compact ? "1 1 0" : "none")};
  max-width: ${(props) => (props.$compact ? "184px" : "none")};
  min-width: 0;
  padding: ${(props) => (props.$compact ? "8px" : "10px")};
  border-radius: 14px;
  background: linear-gradient(180deg, #b8564d 0%, #8e3b35 100%);
  border: 2px solid #2b1817;
  box-shadow:
    inset 0 2px 3px rgba(255, 220, 200, 0.28),
    inset 0 -3px 6px rgba(0, 0, 0, 0.45),
    0 10px 22px rgba(0, 0, 0, 0.55);
`;

const AbilitySlotViewport = styled.div`
  position: relative;
  width: 100%;
  height: 162px;
  overflow: hidden;
  border-radius: 9px;
  background: linear-gradient(180deg, #121822 0%, #273242 50%, #121822 100%);
  border: 2px solid #0b0f17;
  box-shadow:
    inset 0 10px 18px rgba(0, 0, 0, 0.72),
    inset 0 -10px 18px rgba(0, 0, 0, 0.72);
`;

const AbilitySlotCenterHighlight = styled.div`
  position: absolute;
  top: 54px;
  left: 0;
  right: 0;
  height: 54px;
  pointer-events: none;
  z-index: 1;
  background: ${(props) => (props.$settled ? "linear-gradient(90deg, rgba(253, 224, 71, 0.06) 0%, rgba(253, 224, 71, 0.16) 50%, rgba(253, 224, 71, 0.06) 100%)" : "linear-gradient(90deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.02) 100%)")};
  border-top: 1px solid ${(props) => (props.$settled ? "rgba(253, 224, 71, 0.45)" : "rgba(255, 255, 255, 0.14)")};
  border-bottom: 1px solid ${(props) => (props.$settled ? "rgba(253, 224, 71, 0.45)" : "rgba(255, 255, 255, 0.14)")};
  transition: all 0.25s ease;
`;

const AbilitySlotTrack = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  will-change: transform;
`;

const AbilitySlotRow = styled.div`
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${(props) => (props.$compact ? "0 20px" : "0 34px")};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 800;
  letter-spacing: 0.03em;
  user-select: none;
  font-size: ${(props) => (props.$compact ? (props.$isWinner ? "1.18rem" : props.$isCenter ? "1.08rem" : props.$isSpinning ? "1.04rem" : "0.88rem") : props.$isWinner ? "1.32rem" : props.$isCenter ? "1.2rem" : props.$isSpinning ? "1.14rem" : "0.95rem")};
  color: ${(props) => {
    if (props.$deltaSign === "pos") {
      return props.$isWinner ? "#6ee7b7" : props.$isCenter || props.$isSpinning ? "#86efac" : "rgba(134, 239, 172, 0.48)";
    }
    if (props.$deltaSign === "neg") {
      return props.$isWinner ? "#fca5a5" : props.$isCenter || props.$isSpinning ? "#f87171" : "rgba(248, 113, 113, 0.48)";
    }
    return props.$isWinner ? "#fef08a" : props.$isCenter || props.$isSpinning ? "#f8fafc" : "rgba(226, 232, 240, 0.45)";
  }};
  text-shadow: ${(props) => {
    if (props.$isWinner && props.$deltaSign === "pos") {
      return "0 0 12px rgba(110, 231, 183, 0.65), 0 2px 4px rgba(0, 0, 0, 0.9)";
    }
    if (props.$isWinner && props.$deltaSign === "neg") {
      return "0 0 12px rgba(248, 113, 113, 0.65), 0 2px 4px rgba(0, 0, 0, 0.9)";
    }
    return props.$isWinner ? "0 0 12px rgba(253, 224, 71, 0.65), 0 2px 4px rgba(0, 0, 0, 0.9)" : "0 2px 4px rgba(0, 0, 0, 0.85)";
  }};
  transform: ${(props) => (props.$isWinner ? "scale(1.04)" : "scale(1)")};
  transition:
    color 0.2s ease,
    font-size 0.2s ease,
    transform 0.2s ease;
`;

const AbilitySlotFadeOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(10, 14, 20, 0.78) 0%, rgba(10, 14, 20, 0.22) 30%, rgba(10, 14, 20, 0) 40%, rgba(10, 14, 20, 0) 60%, rgba(10, 14, 20, 0.22) 70%, rgba(10, 14, 20, 0.78) 100%);
`;

const AbilitySlotPointerLeft = styled.div`
  position: absolute;
  left: -4px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.65));
`;

const AbilitySlotPointerRight = styled.div`
  position: absolute;
  right: -4px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.65));
`;

const AbilitySlotDescText = styled.div`
  max-width: 340px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.25);
  font-size: 0.85rem;
  line-height: 1.45;
  color: #cbd5e1;
  text-align: center;
`;
