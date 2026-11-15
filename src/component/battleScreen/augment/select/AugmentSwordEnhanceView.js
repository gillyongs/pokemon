import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { getSwordEnhanceTier, getSwordEnhanceProb } from "../../../../entity/Augment/swordEnhance";
import { HeaderArea, HeaderTopRow, Title, SubTitleText, ButtonGroup, ActionButton } from "./selectStyles";

const AugmentSwordEnhanceView = ({ swordEnhanceAug, activePokemon, onSelect, onCancel }) => {
  const [swordLevel, setSwordLevel] = useState(0);
  const [swordFailed, setSwordFailed] = useState(false);
  const [swordAnimKey, setSwordAnimKey] = useState(0);
  const [swordLastResult, setSwordLastResult] = useState(null);

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
      <HeaderArea>
        <HeaderTopRow>
          <Title>검 강화하기</Title>
        </HeaderTopRow>
        <SubTitleText>
          {activePokemon?.name
            ? `${activePokemon.name}의 검을 강화하세요! (실패 시 공격/특공 +0)`
            : "검을 강화하여 공격과 특수공격을 높이세요! (실패 시 +0)"}
        </SubTitleText>
      </HeaderArea>

      <SwordEnhanceContainer>
        <SwordVisualBox key={swordAnimKey} $status={swordLastResult} $failed={swordFailed}>
          {renderSwordSvg(swordLevel, swordFailed)}
          {swordLastResult === "success" && !swordFailed && <SwordStatusBadge $success>강화 성공! (+20)</SwordStatusBadge>}
          {swordFailed && <SwordStatusBadge $success={false}>강화 실패... (파괴됨)</SwordStatusBadge>}
        </SwordVisualBox>

        <SwordInfoBox>
          <SwordTitleText $failed={swordFailed}>
            {swordFailed ? `파괴된 ${currentSwordTier.name} (+${swordLevel}강 실패)` : `+${swordLevel} ${currentSwordTier.name}`}
          </SwordTitleText>
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
  );
};

export default AugmentSwordEnhanceView;

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
  justify-content: center;
  flex: 1;
  gap: 14px;
  padding: 6px 0 4px;
  width: 100%;
`;

const SwordVisualBox = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 18px;
  background: ${(props) =>
    props.$failed
      ? "radial-gradient(circle, rgba(127, 29, 29, 0.35) 0%, rgba(15, 23, 42, 0.9) 100%)"
      : "radial-gradient(circle, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)"};
  border: 1.5px solid ${(props) => (props.$failed ? "rgba(239, 68, 68, 0.55)" : "rgba(100, 255, 218, 0.4)")};
  box-shadow: ${(props) =>
    props.$failed
      ? "0 0 18px rgba(239, 68, 68, 0.25)"
      : "0 0 18px rgba(56, 189, 248, 0.2), inset 0 0 15px rgba(100, 255, 218, 0.1)"};
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
