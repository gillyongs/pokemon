import React from "react";
import styled from "styled-components";

// 포켓몬 배틀 UI 스타일에 맞춘 룬 & 심볼 SVG 아이콘 세트 (틸/청록 & 골드 & 슬레이트 네이비 테마)
// 전용 증강별 포켓몬 도감번호 매핑
export const DEDICATED_AUGMENT_POKEMON = {
  danceOfGarchomp: "0445",
  danceGarchomp: "0445",
  nameIsSalamence: "0373",
};

// 특정 포켓몬 전용 증강 등에서 스프라이트 높이/위치 보정 옵션 (예: 보만다처럼 가로로 길고 아래로 처진 스프라이트 상향 보정)
export const DEDICATED_AUGMENT_IMAGE_OPTIONS = {
  nameIsSalamence: { shiftUp: true, offsetY: -5.5, scale: 1.15 },
  "0373": { shiftUp: true, offsetY: -5.5, scale: 1.15 },
};

export const AugmentIcon = ({ id, size = 42, pokemon = null, pokemonId = null, shiftUp = false, offsetY = null, scale = null, imageOptions = null }) => {
  const pokeId = pokemonId || DEDICATED_AUGMENT_POKEMON[id] || (pokemon?.origin?.pokemon_id && (id === "danceOfGarchomp" || id === "danceGarchomp" || id === "nameIsSalamence") ? pokemon.origin.pokemon_id : null);

  const augOptions = imageOptions || DEDICATED_AUGMENT_IMAGE_OPTIONS[id] || (pokeId ? DEDICATED_AUGMENT_IMAGE_OPTIONS[pokeId] : null) || {};

  const isShiftUp = shiftUp || augOptions.shiftUp || offsetY !== null;
  const finalOffsetY = offsetY ?? augOptions.offsetY ?? (isShiftUp ? -3.5 : 0);
  const finalScale = scale ?? augOptions.scale ?? (isShiftUp ? 1.1 : 1);

  if (pokeId) {
    return (
      <IconFrame $size={size}>
        <DedicatedFrame $size={size}>
          <DedicatedBg />
          <DedicatedImg
            src={`/pokemon/img/pokemon/${pokeId}.webp`}
            alt="전용 증강"
            $offsetY={finalOffsetY}
            $scale={finalScale}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <DedicatedRing />
        </DedicatedFrame>
      </IconFrame>
    );
  }

  return (
    <IconFrame $size={size}>
      <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* 게임 테마 맞춤 틸/스카이블루 그라데이션 */}
          <linearGradient id="prismGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64ffda" />
            <stop offset="40%" stopColor="#38bdf8" />
            <stop offset="75%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>

          <linearGradient id="prismRing" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#64ffda" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>

          <linearGradient id="augRingTone" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3aa3ac" />
            <stop offset="50%" stopColor="#2884ab" />
            <stop offset="100%" stopColor="#2494b4" />
          </linearGradient>

          {/* 고추기름 레드/오렌지/골드 그라데이션 */}
          <linearGradient id="chiliGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>

          <linearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* 스태프 마법 핑크/퍼플/블루 그라데이션 */}
          {/* 가시갑옷 (LoL Thornmail 테마: 크림슨 레드 배경, 다크 차콜 아머 & 화이트골드 스파이크/복부 플레이트) */}
          <linearGradient id="thornCrimsonBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#be123c" />
            <stop offset="40%" stopColor="#881337" />
            <stop offset="100%" stopColor="#4c0519" />
          </linearGradient>

          <linearGradient id="thornDarkArmorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#56536b" />
            <stop offset="40%" stopColor="#3a384a" />
            <stop offset="100%" stopColor="#22212d" />
          </linearGradient>

          <linearGradient id="thornGoldPlateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fdfbf4" />
            <stop offset="35%" stopColor="#e9e0cb" />
            <stop offset="75%" stopColor="#b8aa89" />
            <stop offset="100%" stopColor="#7a6e51" />
          </linearGradient>

          <linearGradient id="thornSpikeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#f5eedb" />
            <stop offset="70%" stopColor="#cfc2a3" />
            <stop offset="100%" stopColor="#786c52" />
          </linearGradient>

          <linearGradient id="magicStaffGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="45%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          <radialGradient id="magicOrbGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#f472b6" />
            <stop offset="70%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#38bdf8" />
          </radialGradient>

          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#0f172a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#090d16" stopOpacity="0.95" />
          </radialGradient>

          {/* 유희왕 공방 스왑 오브 그라데이션 */}
          <radialGradient id="yugiohAtkOrb" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="40%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#9a3412" />
          </radialGradient>
          <radialGradient id="yugiohDefOrb" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="40%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </radialGradient>

          {/* 유희왕 특공/특방 스왑 오브 그라데이션 */}
          <radialGradient id="yugiohSpaOrb" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fdf4ff" />
            <stop offset="35%" stopColor="#f472b6" />
            <stop offset="70%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6b21a8" />
          </radialGradient>
          <radialGradient id="yugiohSpdOrb" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ecfeff" />
            <stop offset="35%" stopColor="#22d3ee" />
            <stop offset="70%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0c4a6e" />
          </radialGradient>

          {/* 만두 도우 그라데이션 (화이트 스팀 도우 -> 노릇한 골든 브라운) */}
          <linearGradient id="manduDoughGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#fef9c3" />
            <stop offset="70%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* 강철 쇠사슬 메탈 그라데이션 */}
          <linearGradient id="chainMetal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="30%" stopColor="#94a3b8" />
            <stop offset="70%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* 진심 펀치 붉은 오라 */}
          <radialGradient id="seriousPunchRedAura" cx="35%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#ff0038" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#990011" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#1a0005" stopOpacity="0.9" />
          </radialGradient>

          {/* 정면 진심 펀치 3D 입체 그라데이션 */}
          <radialGradient id="fistDarkAura" cx="45%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#3d0307" />
            <stop offset="60%" stopColor="#140102" />
            <stop offset="100%" stopColor="#050001" />
          </radialGradient>
          <radialGradient id="topGoldAura" cx="40%" cy="5%" r="55%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#f97316" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="fistBase3D" cx="42%" cy="26%" r="65%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="35%" stopColor="#dc2626" />
            <stop offset="70%" stopColor="#991b1b" />
            <stop offset="100%" stopColor="#2a0306" />
          </radialGradient>
          <linearGradient id="fingerShade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60070e" />
            <stop offset="25%" stopColor="#f87171" />
            <stop offset="60%" stopColor="#dc2626" />
            <stop offset="90%" stopColor="#881337" />
            <stop offset="100%" stopColor="#2a0306" />
          </linearGradient>
          <linearGradient id="thumbGrad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="35%" stopColor="#ef4444" />
            <stop offset="70%" stopColor="#991b1b" />
            <stop offset="100%" stopColor="#1a0204" />
          </linearGradient>
          <radialGradient id="knuckleSheenRadial" cx="40%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#fca5a5" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>

          {/* 발광 필터 */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* BAN / 무효화 테마 그라데이션 */}
          <linearGradient id="banRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4d6d" />
            <stop offset="45%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>

          <radialGradient id="banDarkBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2e080e" />
            <stop offset="70%" stopColor="#140205" />
            <stop offset="100%" stopColor="#080002" />
          </radialGradient>

          <radialGradient id="banGlowHalo" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="rgba(239, 68, 68, 0)" />
            <stop offset="85%" stopColor="rgba(239, 68, 68, 0.35)" />
            <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
          </radialGradient>

          {/* 실패하면 반역 성공하면 혁명 화살표 그라데이션 */}
          <linearGradient id="redArrowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#b91c1c" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f87171" />
          </linearGradient>
          <linearGradient id="greenArrowGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#86efac" />
          </linearGradient>
          <radialGradient id="revDarkBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#131b2e" />
            <stop offset="70%" stopColor="#0a0f1d" />
            <stop offset="100%" stopColor="#03060c" />
          </radialGradient>

          {/* 무효화 하늘색 X 심볼 그라데이션 */}
          <radialGradient id="nullifySkyAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
            <stop offset="60%" stopColor="#0284c7" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#030712" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="skyBlueXGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64ffda" />
            <stop offset="35%" stopColor="#38bdf8" />
            <stop offset="70%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          {/* 테라버스트 무지개 그라데이션 (테라스탈 6각성) */}
          <linearGradient id="teraRainbowExact" x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="16%" stopColor="#facc15" />
            <stop offset="34%" stopColor="#4ade80" />
            <stop offset="52%" stopColor="#06b6d4" />
            <stop offset="70%" stopColor="#3b82f6" />
            <stop offset="86%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <radialGradient id="teraDarkBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="70%" stopColor="#0b1120" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
          <radialGradient id="teraAuraGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.15" />
            <stop offset="80%" stopColor="#a855f7" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>

          {/* 무한의 대검 (LoL Infinity Edge 스티커 픽토그램 아트) 전용 그라데이션 */}
          <radialGradient id="ieBgGrad" cx="46%" cy="62%" r="48%" fx="44%" fy="66%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="28%" stopColor="#facc15" />
            <stop offset="62%" stopColor="#ca8a04" />
            <stop offset="88%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" />
          </radialGradient>
          <radialGradient id="ieSoftGlow" cx="45%" cy="68%" r="36%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#facc15" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ieBoltFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="55%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="ieSilverLight" x1="20%" y1="15%" x2="70%" y2="70%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <linearGradient id="ieSilverDark" x1="20%" y1="15%" x2="60%" y2="75%">
            <stop offset="0%" stopColor="#7c8696" />
            <stop offset="50%" stopColor="#647080" />
            <stop offset="100%" stopColor="#525d6d" />
          </linearGradient>
          <linearGradient id="ieDarkTrench" x1="25%" y1="20%" x2="65%" y2="75%">
            <stop offset="0%" stopColor="#2b313d" />
            <stop offset="50%" stopColor="#232832" />
            <stop offset="100%" stopColor="#1b1f27" />
          </linearGradient>
          <linearGradient id="ieRuneYellow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff72e" />
            <stop offset="60%" stopColor="#ffea00" />
            <stop offset="100%" stopColor="#facc15" />
          </linearGradient>
          <filter id="ieCyanRingGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="ieRuneSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="ieMainCircleClip">
            <circle cx="50" cy="52.5" r="40.8" />
          </clipPath>

          {/* 라바돈의 죽음모자 (LoL Rabadon's Deathcap 스티커 픽토그램 아트) 전용 그라데이션 */}
          <radialGradient id="rabBgGrad" cx="48%" cy="54%" r="48%" fx="44%" fy="58%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="28%" stopColor="#f97316" />
            <stop offset="60%" stopColor="#c2410c" />
            <stop offset="85%" stopColor="#7c2d12" />
            <stop offset="100%" stopColor="#431407" />
          </radialGradient>
          <linearGradient id="rabFlameOrange" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <linearGradient id="rabFlameYellow" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="rabHatPurple" x1="25%" y1="15%" x2="75%" y2="80%">
            <stop offset="0%" stopColor="#6b4c9a" />
            <stop offset="45%" stopColor="#4c3277" />
            <stop offset="85%" stopColor="#35205a" />
            <stop offset="100%" stopColor="#241342" />
          </linearGradient>
          <linearGradient id="rabHatDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b2363" />
            <stop offset="100%" stopColor="#1e0f38" />
          </linearGradient>
          <radialGradient id="rabMouthGlow" cx="44%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#e8ffff" />
            <stop offset="80%" stopColor="#b8f9ff" />
            <stop offset="100%" stopColor="#7ce8ff" />
          </radialGradient>
          <filter id="rabCyanRingGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="rabCircleClip">
            <circle cx="51" cy="46.5" r="44" />
          </clipPath>

          {/* 공허의 지팡이 (LoL Void Staff 스티커 픽토그램 아트) 전용 그라데이션 */}
          <radialGradient id="voidBgGrad" cx="38%" cy="28%" r="65%">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="32%" stopColor="#5b21b6" />
            <stop offset="68%" stopColor="#2e1065" />
            <stop offset="100%" stopColor="#0f0728" />
          </radialGradient>
          <linearGradient id="voidSwirlLight" x1="15%" y1="65%" x2="70%" y2="15%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.15" />
            <stop offset="45%" stopColor="#e9d5ff" stopOpacity="0.75" />
            <stop offset="80%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id="voidOrbBase" cx="46%" cy="38%" r="55%">
            <stop offset="0%" stopColor="#1e0538" />
            <stop offset="55%" stopColor="#3b0764" />
            <stop offset="85%" stopColor="#7e22ce" />
            <stop offset="100%" stopColor="#d946ef" />
          </radialGradient>
          <radialGradient id="voidMagentaGlow" cx="46%" cy="44%" r="22%">
            <stop offset="0%" stopColor="#ff2bf5" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#e81cff" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="voidMetalGrad" x1="25%" y1="35%" x2="70%" y2="68%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="35%" stopColor="#475569" />
            <stop offset="75%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="voidWoodGrad" x1="50%" y1="60%" x2="80%" y2="90%">
            <stop offset="0%" stopColor="#6b4235" />
            <stop offset="50%" stopColor="#4a2c24" />
            <stop offset="100%" stopColor="#271512" />
          </linearGradient>
          <filter id="voidCyanRingGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="voidCircleClip">
            <circle cx="52.5" cy="50.5" r="39.2" />
          </clipPath>

          {/* 11-2. 가시갑옷 (Thornmail 스티커 배지 1:1 전용 그라데이션 & 필터) */}
          <radialGradient id="tmBgGrad" cx="46%" cy="54%" r="48%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="38%" stopColor="#dc2626" />
            <stop offset="72%" stopColor="#7f1d1d" />
            <stop offset="100%" stopColor="#2a0810" />
          </radialGradient>
          <radialGradient id="tmWarmGlow1" cx="28%" cy="60%" r="28%">
            <stop offset="0%" stopColor="#fde047" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="tmWarmGlow2" cx="76%" cy="56%" r="26%">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#ef4444" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="tmDarkMetal" x1="25%" y1="20%" x2="75%" y2="85%">
            <stop offset="0%" stopColor="#7a6d7a" />
            <stop offset="40%" stopColor="#564b57" />
            <stop offset="80%" stopColor="#38303b" />
            <stop offset="100%" stopColor="#221c26" />
          </linearGradient>
          <linearGradient id="tmDarkShade" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#433946" />
            <stop offset="100%" stopColor="#1c1620" />
          </linearGradient>
          <linearGradient id="tmGoldGrad" x1="20%" y1="25%" x2="80%" y2="75%">
            <stop offset="0%" stopColor="#9e7f56" />
            <stop offset="32%" stopColor="#fff8d6" />
            <stop offset="52%" stopColor="#e7ca91" />
            <stop offset="82%" stopColor="#b08d57" />
            <stop offset="100%" stopColor="#735534" />
          </linearGradient>
          <linearGradient id="tmSpikeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#7c5826" />
          </linearGradient>
          <filter id="tmCyanRingGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="tmCircleClip">
            <circle cx="50.8" cy="50.8" r="44.8" />
          </clipPath>
        </defs>

        {/* 베이스 배경 원 */}
        {id !== "infinityEdge" && id !== "rabadonsDeathcap" && id !== "voidStaff" && id !== "thornmail" && (
          <circle cx="32" cy="32" r="30" fill="url(#bgGlow)" stroke="url(#prismRing)" strokeWidth="1.5" strokeOpacity="0.7" />
        )}

        {/* 1. 억까 방지 (정밀 조준경 + 필중 화살 + 스파클) */}
        {id === "noUnfairMiss" && (
          <g filter="url(#glow)">
            {/* 아치형 외곽 타겟 링 */}
            <path d="M16 32 A16 16 0 0 1 48 32 M48 32 A16 16 0 0 1 16 32" stroke="url(#prismRing)" strokeWidth="2.5" strokeDasharray="18 6" strokeLinecap="round" />
            {/* 십자 조준선 */}
            <path d="M32 10 L32 20 M32 44 L32 54 M10 32 L20 32 M44 32 L54 32" stroke="url(#prismGrad)" strokeWidth="2.5" strokeLinecap="round" />
            {/* 중앙 다이아몬드 타겟 & 직격 화살촉 */}
            <path d="M32 24 L38 32 L32 40 L26 32 Z" fill="url(#prismGrad)" stroke="#ffffff" strokeWidth="1" />
            <circle cx="32" cy="32" r="2.5" fill="#ffffff" />
            {/* ✦ 스파클 */}
            <path d="M48 16 Q48 20 52 20 Q48 20 48 24 Q48 20 44 20 Q48 20 48 16 Z" fill="#fef08a" />
            <path d="M16 46 Q16 49 19 49 Q16 49 16 52 Q16 49 13 49 Q16 49 16 46 Z" fill="#67e8f9" />
          </g>
        )}

        {/* 2. 만두콘은 이왕걸을 슬프게 하지 않게 하려고 버텼다 (노릇노릇 따끈한 교자 만두 & 피어오르는 김 & 스파클) */}
        {id === "mandoocornEndure" && (
          <g filter="url(#glow)">
            {/* 1. 따끈따끈 모락모락 피어오르는 만두 김 (Steam) */}
            <path d="M22 21 C20 16 23 12 21 7" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />
            <path d="M32 18 C30 13 34 9 32 5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.9" />
            <path d="M42 21 C44 16 41 12 43 7" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />

            {/* 2. 하단 은은한 찜기/받침 플레이트 라인 */}
            <path d="M10 50 C18 56 46 56 54 50" stroke="url(#goldGrad)" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.6" />

            {/* 3. 통통하고 노릇노릇한 만두 본체 (Mandu Body) */}
            <path d="M 12 36 C 12 50, 21 53, 32 53 C 43 53, 52 50, 52 36 C 49 31, 46 29, 44 29 C 41 26, 38 25, 35 25.5 C 33 24.5, 31 24.5, 29 25.5 C 26 25, 23 26, 20 29 C 18 29, 15 31, 12 36 Z" fill="url(#manduDoughGrad)" stroke="#ffffff" strokeWidth="1.2" strokeLinejoin="round" />

            {/* 만두피 입체 주름선 (Pleat Creases) */}
            <path d="M 20 29 C 22 32, 23 37, 24 41" stroke="#b45309" strokeWidth="0.9" strokeLinecap="round" opacity="0.35" fill="none" />
            <path d="M 29 25.5 C 30 29, 30.5 35, 30.5 39" stroke="#b45309" strokeWidth="0.9" strokeLinecap="round" opacity="0.35" fill="none" />
            <path d="M 35 25.5 C 34 29, 33.5 35, 33.5 39" stroke="#b45309" strokeWidth="0.9" strokeLinecap="round" opacity="0.35" fill="none" />
            <path d="M 44 29 C 42 32, 41 37, 40 41" stroke="#b45309" strokeWidth="0.9" strokeLinecap="round" opacity="0.35" fill="none" />

            {/* 만두 볼륨 광택 하이라이트 (Steamed Gloss Highlight) */}
            <path d="M 16 38 C 20 45, 44 45, 48 38" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" fill="none" />

            {/* ✦ 갓 쪄낸 만두의 먹음직스러운 스파클 */}
            <path d="M 50 14 Q 50 17 53 17 Q 50 17 50 20 Q 50 17 47 17 Q 50 17 50 14 Z" fill="#fef08a" />
            <path d="M 13 16 Q 13 18.5 15.5 18.5 Q 13 18.5 13 21 Q 13 18.5 10.5 18.5 Q 13 18.5 13 16 Z" fill="#67e8f9" />
            <circle cx="32" cy="12" r="1.2" fill="#ffffff" />
          </g>
        )}

        {/* 3. 도박 중독 (입체 주사위 & 회오리 마법 스파크) */}
        {id === "gamblingAddict" && (
          <g filter="url(#glow)">
            {/* 회전하는 소용돌이 오라 */}
            <path d="M14 26 C16 16 28 10 38 12 M50 38 C48 48 36 54 26 52" stroke="url(#prismRing)" strokeWidth="2.5" strokeLinecap="round" />
            {/* 아이소메트릭 입체 주사위 */}
            {/* 윗면 */}
            <path d="M32 16 L46 23 L32 30 L18 23 Z" fill="url(#prismGrad)" stroke="#ffffff" strokeWidth="1" />
            {/* 좌측면 */}
            <path d="M18 23 L32 30 L32 46 L18 39 Z" fill="#0284c7" fillOpacity="0.85" stroke="#ffffff" strokeWidth="1" />
            {/* 우측면 */}
            <path d="M32 30 L46 23 L46 39 L32 46 Z" fill="#0d9488" fillOpacity="0.85" stroke="#ffffff" strokeWidth="1" />
            {/* 주사위 눈금 점들 */}
            <circle cx="32" cy="23" r="2" fill="#ffffff" />
            <circle cx="23" cy="33" r="1.5" fill="#ffffff" />
            <circle cx="27" cy="39" r="1.5" fill="#ffffff" />
            <circle cx="37" cy="34" r="1.5" fill="#ffffff" />
            <circle cx="41" cy="40" r="1.5" fill="#ffffff" />
            {/* ✦ 스파클 */}
            <path d="M49 14 Q49 17 52 17 Q49 17 49 20 Q49 17 46 17 Q49 17 49 14 Z" fill="#fef08a" />
            <path d="M14 44 Q14 47 17 47 Q14 47 14 50 Q14 47 11 47 Q14 47 14 44 Z" fill="#38bdf8" />
          </g>
        )}

        {/* 4. 돌려 돌려 돌림판 (다채로운 6색 룰렛 휠 & 상단 포인터 지침 & 중앙 몬스터볼 허브 & 회전 오라) */}
        {id === "rouletteWheel" && (
          <g filter="url(#glow)">
            {/* 1. 외곽 역동적인 회전 스핀 화살표 (돌려 돌려~ 회전 모션) */}
            {/* 좌측 하향 회전 가속 라인 */}
            <path d="M12 22 C9 27 9 37 13 45" stroke="url(#prismRing)" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.85" />
            <path d="M10 40 L13 46 L18 43" fill="none" stroke="url(#prismRing)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            {/* 우측 상향 회전 가속 라인 */}
            <path d="M52 46 C55 41 55 31 51 23" stroke="url(#goldGrad)" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.85" />
            <path d="M54 28 L51 22 L46 25" fill="none" stroke="url(#goldGrad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

            {/* 2. 룰렛 휠 6개 다채로운 부채꼴 섹터 (Rainbow Prize Wheel) */}
            <g stroke="#ffffff" strokeWidth="0.9" strokeLinejoin="round">
              {/* 섹터 1 (우상단: 레드) */}
              <path d="M 32 34 L 32 16 A 18 18 0 0 1 47.6 25 Z" fill="#ef4444" />
              {/* 섹터 2 (우측: 앰버 골드) */}
              <path d="M 32 34 L 47.6 25 A 18 18 0 0 1 47.6 43 Z" fill="#f59e0b" />
              {/* 섹터 3 (우하단: 에메랄드 그린) */}
              <path d="M 32 34 L 47.6 43 A 18 18 0 0 1 32 52 Z" fill="#10b981" />
              {/* 섹터 4 (좌하단: 청록/시안) */}
              <path d="M 32 34 L 32 52 A 18 18 0 0 1 16.4 43 Z" fill="#06b6d4" />
              {/* 섹터 5 (좌측: 로열 블루) */}
              <path d="M 32 34 L 16.4 43 A 18 18 0 0 1 16.4 25 Z" fill="#3b82f6" />
              {/* 섹터 6 (좌상단: 퍼플 바이올렛) */}
              <path d="M 32 34 L 16.4 25 A 18 18 0 0 1 32 16 Z" fill="#8b5cf6" />
            </g>

            {/* 3. 휠 황금 외곽 림 & 고정 핀 (Peg Pins) */}
            <circle cx="32" cy="34" r="19.5" fill="none" stroke="url(#goldGrad)" strokeWidth="2.2" />
            <circle cx="32" cy="34" r="18" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.8" />

            {/* 림 둘레의 12개 골드 페그 핀 (탁탁 걸리는 핀) */}
            <circle cx="51.5" cy="34" r="0.9" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />
            <circle cx="48.9" cy="43.8" r="0.9" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />
            <circle cx="41.8" cy="50.9" r="0.9" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />
            <circle cx="32" cy="53.5" r="0.9" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />
            <circle cx="22.2" cy="50.9" r="0.9" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />
            <circle cx="15.1" cy="43.8" r="0.9" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />
            <circle cx="12.5" cy="34" r="0.9" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />
            <circle cx="15.1" cy="24.2" r="0.9" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />
            <circle cx="22.2" cy="17.1" r="0.9" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />
            <circle cx="32" cy="14.5" r="0.9" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />
            <circle cx="41.8" cy="17.1" r="0.9" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />
            <circle cx="48.9" cy="24.2" r="0.9" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />

            {/* 4. 중앙 포켓몬 교체 상징: 미니 몬스터볼 허브 */}
            <circle cx="32" cy="34" r="6" fill="#0f172a" stroke="url(#goldGrad)" strokeWidth="1" />
            <path d="M26.5 34 A5.5 5.5 0 0 1 37.5 34 Z" fill="#ef4444" />
            <path d="M26.5 34 A5.5 5.5 0 0 0 37.5 34 Z" fill="#f8fafc" />
            <line x1="26.5" y1="34" x2="37.5" y2="34" stroke="#0f172a" strokeWidth="1.2" />
            <circle cx="32" cy="34" r="2" fill="#0f172a" />
            <circle cx="32" cy="34" r="1.1" fill="#ffffff" />

            {/* 5. 상단 돌림판 지침 (Indicator Needle / Stopper Pointer) */}
            <rect x="29" y="5" width="6" height="4" rx="1.5" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="0.8" />
            {/* 아래로 향하는 삼각 지침 */}
            <path d="M32 17 L28 8.5 L36 8.5 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="1" strokeLinejoin="round" />
            <circle cx="32" cy="8.5" r="1.3" fill="#ffffff" stroke="#78350f" strokeWidth="0.5" />

            {/* ✦ 럭키 스파클 */}
            <path d="M54 11 Q54 14 57 14 Q54 14 54 17 Q54 14 51 14 Q54 14 54 11 Z" fill="#fef08a" />
            <path d="M10 50 Q10 52.5 12.5 52.5 Q10 52.5 10 55 Q10 52.5 7.5 52.5 Q10 52.5 10 50 Z" fill="#67e8f9" />
            <circle cx="16" cy="12" r="1.3" fill="#f472b6" />
          </g>
        )}

        {/* 5. 오른손엔 방패 왼손엔 검 (유희왕 원작 모티브: 왼편 수호방패, 오른편 직립검, 상하 순환 스왑 화살표, ATK/DEF 스왑 오브) */}
        {id === "swordAndShield" && (
          <g filter="url(#glow)">
            {/* 1. 배경: 기사(Knight) 투구 & 갑옷 실루엣 */}
            <g opacity="0.4">
              {/* 투구 뿔 장식 */}
              <path d="M25 19 C22 14 17 13 14 10 C18 13 22 16 24 18" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              <path d="M39 19 C42 14 47 13 50 10 C46 13 42 16 40 18" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              {/* 기사 투구 & 슬릿 */}
              <path d="M26 21 C26 14 38 14 38 21 L37 27 C37 28 35 29 32 29 C29 29 27 28 27 27 Z" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
              <line x1="28" y1="23" x2="36" y2="23" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
              {/* 어깨 갑옷 & 흉갑 실루엣 */}
              <path d="M20 28 C25 26 39 26 44 28 L46 50 L18 50 Z" fill="#1e293b" stroke="#475569" strokeWidth="0.8" />
            </g>

            {/* 2. 왼편: 든든한 황금/청동 수호 방패 ("오른손엔 방패") */}
            <g>
              <path d="M13 17 C21 17 22 21 22 30 C22 41 13 49 13 49 C13 49 4 41 4 30 C4 21 5 17 13 17 Z" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M13 20 C18.5 20 19.5 23 19.5 30 C19.5 38 13 44.5 13 44.5 C13 44.5 6.5 38 6.5 30 C6.5 23 7.5 20 13 20 Z" fill="#78350f" fillOpacity="0.35" stroke="#fef08a" strokeWidth="0.8" />
              <path d="M13 22 L13 41 M8.5 29 L17.5 29" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.85" />
            </g>

            {/* 3. 오른편: 하늘을 향해 곧게 세운 대검 ("왼손엔 검") */}
            <g>
              <path d="M51 9 L54.5 15 L53.5 41 L48.5 41 L47.5 15 Z" fill="#ffffff" stroke="url(#prismRing)" strokeWidth="1" strokeLinejoin="round" />
              <line x1="51" y1="12" x2="51" y2="40" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M44 41 C47 40 55 40 58 41 L57 43.5 L45 43.5 Z" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="0.8" />
              <line x1="51" y1="43.5" x2="51" y2="50" stroke="#94a3b8" strokeWidth="2.4" strokeLinecap="round" />
              <circle cx="51" cy="51.5" r="2.2" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="0.8" />
            </g>

            {/* 4. 상하 순환 교환 화살표 (원작 시그니처 곡선 화살표) */}
            {/* 상단 화살표 (검/우측 -> 방패/좌측 곡선: 블루/청록) */}
            <g>
              <path d="M43 20 C38 14 28 14 21 19" stroke="#38bdf8" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M22 15 L17 21 L24 23 Z" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.6" strokeLinejoin="round" />
            </g>

            {/* 하단 화살표 (방패/좌측 -> 검/우측 곡선: 오렌지/레드) */}
            <g>
              <path d="M21 44 C26 50 36 50 43 45" stroke="#f97316" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M42 49 L47 43 L40 41 Z" fill="#f97316" stroke="#ffffff" strokeWidth="0.6" strokeLinejoin="round" />
            </g>

            {/* 5. 중앙 공격/방어 스왑 구체 (원작 attack / defense 오브) */}
            {/* 좌측 attack 오브 (오렌지/골드 엠버) */}
            <g>
              <circle cx="23" cy="32" r="7.5" fill="url(#yugiohAtkOrb)" stroke="#ffffff" strokeWidth="1.2" />
              <text x="23" y="34.2" fontSize="5.2" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" fill="#ffffff" textAnchor="middle" letterSpacing="0.2">
                ATK
              </text>
            </g>

            {/* 우측 defense 오브 (블루/시안) */}
            <g>
              <circle cx="41" cy="32" r="7.5" fill="url(#yugiohDefOrb)" stroke="#ffffff" strokeWidth="1.2" />
              <text x="41" y="34.2" fontSize="5.2" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" fill="#ffffff" textAnchor="middle" letterSpacing="0.2">
                DEF
              </text>
            </g>

            {/* 중앙 등호 기호 (=) */}
            <line x1="29.5" y1="30.5" x2="34.5" y2="30.5" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="29.5" y1="33.5" x2="34.5" y2="33.5" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />

            {/* ✦ 스파클 반짝임 */}
            <path d="M51 6 Q51 9 54 9 Q51 9 51 12 Q51 9 48 9 Q51 9 51 6 Z" fill="#fef08a" />
            <path d="M13 13 Q13 15.5 15.5 15.5 Q13 15.5 13 18 Q13 15.5 10.5 15.5 Q13 15.5 13 13 Z" fill="#67e8f9" />
          </g>
        )}

        {/* 6. 오른손엔 방패 왼손엔 스태프 (유희왕 모티브 계승: 왼편 룬 방패, 오른편 직립 마법 스태프, 상하 마법 스왑 화살표, SpA/SpD 스왑 오브) */}
        {id === "specialSwordAndShield" && (
          <g filter="url(#glow)">
            {/* 1. 배경: 대마법사(Archmage) 후드 & 로브 및 마법진 실루엣 */}
            <g opacity="0.45">
              {/* 비전 마법진 룬 링 */}
              <circle cx="32" cy="32" r="26" stroke="#c084fc" strokeWidth="0.8" strokeDasharray="3 3" fill="none" />
              {/* 마법사 후드/두건 */}
              <path d="M26 23 C26 14 32 9 32 9 C32 9 38 14 38 23 L37 27 C37 28 35 29 32 29 C29 29 27 28 27 27 Z" fill="#312e81" stroke="#6366f1" strokeWidth="0.8" />
              {/* 후드 안쪽 신비로운 빛나는 안광 */}
              <circle cx="29.5" cy="22.5" r="0.9" fill="#67e8f9" />
              <circle cx="34.5" cy="22.5" r="0.9" fill="#67e8f9" />
              {/* 로브 & 어깨 망토 실루엣 */}
              <path d="M20 28 C25 26 39 26 44 28 L46 50 L18 50 Z" fill="#1e1b4b" stroke="#4338ca" strokeWidth="0.8" />
            </g>

            {/* 2. 왼편: 신비로운 비전 룬 마법 방패 ("오른손엔 방패") */}
            <g>
              <path d="M13 17 C21 17 22 21 22 30 C22 41 13 49 13 49 C13 49 4 41 4 30 C4 21 5 17 13 17 Z" fill="url(#magicStaffGrad)" stroke="#ffffff" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M13 20 C18.5 20 19.5 23 19.5 30 C19.5 38 13 44.5 13 44.5 C13 44.5 6.5 38 6.5 30 C6.5 23 7.5 20 13 20 Z" fill="#3b0764" fillOpacity="0.45" stroke="#f472b6" strokeWidth="0.8" />
              {/* 방패 중앙 마법 크리스탈 다이아몬드 룬 */}
              <path d="M13 23 L16.5 30 L13 37 L9.5 30 Z" fill="#ffffff" fillOpacity="0.8" stroke="#c084fc" strokeWidth="0.8" />
              <circle cx="13" cy="30" r="1.3" fill="#f472b6" />
            </g>

            {/* 3. 오른편: 하늘을 향해 곧게 세운 마법 스태프 ("왼손엔 스태프") */}
            <g>
              {/* 스태프 샤프트 봉 */}
              <line x1="51" y1="18" x2="51" y2="49" stroke="url(#goldGrad)" strokeWidth="2.4" strokeLinecap="round" />
              <line x1="51" y1="20" x2="51" y2="47" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" />
              {/* 하단 폼멜 */}
              <circle cx="51" cy="51" r="2.2" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="0.8" />
              {/* 상단 크레센트 윙 브라켓 헤드 */}
              <path d="M45 15 C45 9 48 6 51 6 C54 6 57 9 57 15 C55 13 53 12 51 12 C49 12 47 13 45 15 Z" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="0.8" />
              {/* 스태프 최상단 찬란한 마법 구체 */}
              <circle cx="51" cy="14" r="3.8" fill="url(#magicOrbGlow)" stroke="#ffffff" strokeWidth="0.8" />
              <circle cx="49.8" cy="12.8" r="1.1" fill="#ffffff" />
              {/* 회전하는 마법 오라 링 */}
              <ellipse cx="51" cy="14" rx="6.5" ry="2.2" stroke="#67e8f9" strokeWidth="1" fill="none" strokeDasharray="3 1.5" transform="rotate(-15 51 14)" />
            </g>

            {/* 4. 상하 순환 마법 교환 화살표 */}
            {/* 상단 화살표 (스태프/우측 -> 방패/좌측 곡선: 바이올렛/퍼플) */}
            <g>
              <path d="M43 20 C38 14 28 14 21 19" stroke="#c084fc" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M22 15 L17 21 L24 23 Z" fill="#c084fc" stroke="#ffffff" strokeWidth="0.6" strokeLinejoin="round" />
            </g>

            {/* 하단 화살표 (방패/좌측 -> 스태프/우측 곡선: 청록/시안) */}
            <g>
              <path d="M21 44 C26 50 36 50 43 45" stroke="#22d3ee" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M42 49 L47 43 L40 41 Z" fill="#22d3ee" stroke="#ffffff" strokeWidth="0.6" strokeLinejoin="round" />
            </g>

            {/* 5. 중앙 특공/특방 스왑 구체 (SpA / SpD 오브) */}
            {/* 좌측 SpA 오브 (신비로운 마젠타/퍼플) */}
            <g>
              <circle cx="23" cy="32" r="7.5" fill="url(#yugiohSpaOrb)" stroke="#ffffff" strokeWidth="1.2" />
              <text x="23" y="34.2" fontSize="5.0" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" fill="#ffffff" textAnchor="middle" letterSpacing="0.1">
                SpA
              </text>
            </g>

            {/* 우측 SpD 오브 (청아한 시안/애저 블루) */}
            <g>
              <circle cx="41" cy="32" r="7.5" fill="url(#yugiohSpdOrb)" stroke="#ffffff" strokeWidth="1.2" />
              <text x="41" y="34.2" fontSize="5.0" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" fill="#ffffff" textAnchor="middle" letterSpacing="0.1">
                SpD
              </text>
            </g>

            {/* 중앙 등호 기호 (=) */}
            <line x1="29.5" y1="30.5" x2="34.5" y2="30.5" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="29.5" y1="33.5" x2="34.5" y2="33.5" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />

            {/* ✦ 비전 마법 스파클 반짝임 */}
            <path d="M51 4 Q51 7 54 7 Q51 7 51 10 Q51 7 48 7 Q51 7 51 4 Z" fill="#f472b6" />
            <path d="M13 13 Q13 15.5 15.5 15.5 Q13 15.5 13 18 Q13 15.5 10.5 15.5 Q13 15.5 13 13 Z" fill="#67e8f9" />
          </g>
        )}

        {/* 6-2. 크산테 (체력 4700 방어력 329 마저 201: 왼편 황금 물리방어 방패 + 오른편 비전 특수방어 방패 + 상하 통일 화살표 + DEF/SpD 오브) */}
        {id === "ksante" && (
          <g filter="url(#glow)">
            {/* 1. 배경: 거대 중장갑 수호자(크산테) 실루엣 & 불굴의 오라 */}
            <g opacity="0.45">
              <circle cx="32" cy="32" r="26" stroke="#f59e0b" strokeWidth="0.9" strokeDasharray="4 2" fill="none" />
              <path d="M26 21 C26 14 38 14 38 21 L37 27 C37 28 35 29 32 29 C29 29 27 28 27 27 Z" fill="#334155" stroke="#94a3b8" strokeWidth="0.8" />
              <circle cx="29.5" cy="22" r="1.0" fill="#fef08a" />
              <circle cx="34.5" cy="22" r="1.0" fill="#38bdf8" />
              <path d="M18 28 C24 25 40 25 46 28 L48 50 L16 50 Z" fill="#1e293b" stroke="#64748b" strokeWidth="0.9" />
            </g>

            {/* 2. 왼편: 황금 물리 방어(DEF 329) 수호 방패 */}
            <g>
              <path d="M13 17 C21 17 22 21 22 30 C22 41 13 49 13 49 C13 49 4 41 4 30 C4 21 5 17 13 17 Z" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M13 20 C18.5 20 19.5 23 19.5 30 C19.5 38 13 44.5 13 44.5 C13 44.5 6.5 38 6.5 30 C6.5 23 7.5 20 13 20 Z" fill="#78350f" fillOpacity="0.35" stroke="#fef08a" strokeWidth="0.8" />
              <path d="M13 22 L13 41 M8.5 29 L17.5 29" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.85" />
            </g>

            {/* 3. 오른편: 비전 마법 저항(SpD 201) 룬 방패 */}
            <g>
              <path d="M51 17 C59 17 60 21 60 30 C60 41 51 49 51 49 C51 49 42 41 42 30 C42 21 43 17 51 17 Z" fill="url(#magicStaffGrad)" stroke="#ffffff" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M51 20 C56.5 20 57.5 23 57.5 30 C57.5 38 51 44.5 51 44.5 C51 44.5 44.5 38 44.5 30 C44.5 23 45.5 20 51 20 Z" fill="#3b0764" fillOpacity="0.45" stroke="#67e8f9" strokeWidth="0.8" />
              <path d="M51 23 L54.5 30 L51 37 L47.5 30 Z" fill="#ffffff" fillOpacity="0.85" stroke="#38bdf8" strokeWidth="0.8" />
              <circle cx="51" cy="30" r="1.3" fill="#38bdf8" />
            </g>

            {/* 4. 상하 순환 방어/특방 통일 화살표 */}
            <g>
              <path d="M43 20 C38 14 28 14 21 19" stroke="#38bdf8" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M22 15 L17 21 L24 23 Z" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.6" strokeLinejoin="round" />
            </g>
            <g>
              <path d="M21 44 C26 50 36 50 43 45" stroke="#f59e0b" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M42 49 L47 43 L40 41 Z" fill="#f59e0b" stroke="#ffffff" strokeWidth="0.6" strokeLinejoin="round" />
            </g>

            {/* 5. 중앙 방어/특방 통일 구체 (DEF = SpD 오브) */}
            <g>
              <circle cx="23" cy="32" r="7.5" fill="url(#yugiohDefOrb)" stroke="#ffffff" strokeWidth="1.2" />
              <text x="23" y="34.2" fontSize="5.2" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" fill="#ffffff" textAnchor="middle" letterSpacing="0.2">
                DEF
              </text>
            </g>
            <g>
              <circle cx="41" cy="32" r="7.5" fill="url(#yugiohSpdOrb)" stroke="#ffffff" strokeWidth="1.2" />
              <text x="41" y="34.2" fontSize="5.0" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" fill="#ffffff" textAnchor="middle" letterSpacing="0.1">
                SpD
              </text>
            </g>

            {/* 중앙 등호 기호 (=) */}
            <line x1="29.5" y1="30.5" x2="34.5" y2="30.5" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="29.5" y1="33.5" x2="34.5" y2="33.5" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />

            {/* ✦ 스파클 반짝임 */}
            <path d="M51 9 Q51 12 54 12 Q51 12 51 15 Q51 12 48 12 Q51 12 51 9 Z" fill="#67e8f9" />
            <path d="M13 9 Q13 12 16 12 Q13 12 13 15 Q13 12 10 12 Q13 12 13 9 Z" fill="#fef08a" />
          </g>
        )}

        {/* 7. H.H.G.G.H.G.G (모든 능력치를 가장 높은 능력치로 통일 - 올스탯 만점 퍼펙트 육각형 레이더 차트) */}
        {(id === "hhgghgg" || id === "HHGGHGG") && (
          <g filter="url(#glow)">
            {/* 1. 외곽 서클 가이드 */}
            <circle cx="32" cy="32" r="24.5" stroke="url(#prismRing)" strokeWidth="1.2" strokeDasharray="5 3" strokeOpacity="0.5" />

            {/* 2. 동심 육각형 레이더 차트 그리드 라인 (스탯 단계별 정육각형 그리드) */}
            {/* 1단계 (내부) 육각형 */}
            <polygon points="32,24 38.9,28 38.9,36 32,40 25.1,36 25.1,28" fill="none" stroke="url(#prismRing)" strokeWidth="0.8" strokeOpacity="0.35" />
            {/* 2단계 (중간) 육각형 */}
            <polygon points="32,17 45,24.5 45,39.5 32,47 19,39.5 19,24.5" fill="none" stroke="url(#prismRing)" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="4 2" />

            {/* 3. 6방향 능력치 축선 (HP, 공격, 방어, 스피드, 특방, 특공) */}
            <line x1="32" y1="32" x2="32" y2="10" stroke="url(#prismRing)" strokeWidth="1.2" strokeOpacity="0.7" />
            <line x1="32" y1="32" x2="51" y2="21" stroke="url(#prismRing)" strokeWidth="1.2" strokeOpacity="0.7" />
            <line x1="32" y1="32" x2="51" y2="43" stroke="url(#prismRing)" strokeWidth="1.2" strokeOpacity="0.7" />
            <line x1="32" y1="32" x2="32" y2="54" stroke="url(#prismRing)" strokeWidth="1.2" strokeOpacity="0.7" />
            <line x1="32" y1="32" x2="13" y2="43" stroke="url(#prismRing)" strokeWidth="1.2" strokeOpacity="0.7" />
            <line x1="32" y1="32" x2="13" y2="21" stroke="url(#prismRing)" strokeWidth="1.2" strokeOpacity="0.7" />

            {/* 4. 찬란하게 채워진 올스탯 MAX 완벽한 정육각형 (퍼펙트 육각형 스탯 영역) */}
            <polygon points="32,10 51,21 51,43 32,54 13,43 13,21" fill="url(#prismGrad)" fillOpacity="0.38" stroke="url(#goldGrad)" strokeWidth="2.2" strokeLinejoin="round" />

            {/* 내부 찬란한 에너지 육각 층 */}
            <polygon points="32,13 48.5,22.5 48.5,41.5 32,51 15.5,41.5 15.5,22.5" fill="url(#prismGrad)" fillOpacity="0.22" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.8" strokeLinejoin="round" />

            {/* 5. 6개 능력치 정점 노드 (빛나는 6대 스탯 오브) */}
            {/* HP (상단) */}
            <circle cx="32" cy="10" r="2.8" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="1" />
            <circle cx="32" cy="10" r="1.1" fill="#ffffff" />
            {/* 공격 (우상단) */}
            <circle cx="51" cy="21" r="2.8" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="1" />
            <circle cx="51" cy="21" r="1.1" fill="#ffffff" />
            {/* 방어 (우하단) */}
            <circle cx="51" cy="43" r="2.8" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="1" />
            <circle cx="51" cy="43" r="1.1" fill="#ffffff" />
            {/* 스피드 (하단) */}
            <circle cx="32" cy="54" r="2.8" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="1" />
            <circle cx="32" cy="54" r="1.1" fill="#ffffff" />
            {/* 특방 (좌하단) */}
            <circle cx="13" cy="43" r="2.8" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="1" />
            <circle cx="13" cy="43" r="1.1" fill="#ffffff" />
            {/* 특공 (좌상단) */}
            <circle cx="13" cy="21" r="2.8" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="1" />
            <circle cx="13" cy="21" r="1.1" fill="#ffffff" />

            {/* 6. 중앙 정점: 6대 능력치 통합 다이아몬드 코어 룬 */}
            <polygon points="32,25 39,32 32,39 25,32" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="1.4" />
            <polygon points="32,27.5 36.5,32 32,36.5 27.5,32" fill="#ffffff" />

            {/* 7. 찬란한 육각형 광채 스파클 */}
            <path d="M49 11 Q49 15 53 15 Q49 15 49 19 Q49 15 45 15 Q49 15 49 11 Z" fill="#fef08a" />
            <path d="M15 49 Q15 52 18 52 Q15 52 15 55 Q15 52 12 52 Q15 52 15 49 Z" fill="#64ffda" />
            <circle cx="32" cy="3" r="1.4" fill="#fef08a" />
          </g>
        )}

        {/* 8. 춤춰라 한카리아스 (용의 날개/지느러미 & 소용돌이치는 용의 춤 오라) */}
        {(id === "danceOfGarchomp" || id === "danceGarchomp") && (
          <g filter="url(#glow)">
            {/* 용의 기운 소용돌이 테두리 */}
            <path d="M14 36 C10 22 24 12 36 12 C48 12 54 24 50 38 C46 48 34 52 24 50" stroke="#38bdf8" strokeWidth="2" strokeDasharray="14 4" strokeLinecap="round" />
            <path d="M22 18 C28 14 42 16 46 26" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />

            {/* 한카리아스 샤크 핀 / 드래곤 윙 실루엣 */}
            <path d="M32 14 C36 22 46 26 48 34 C42 34 36 30 32 26 C28 30 22 34 16 34 C18 26 28 22 32 14 Z" fill="url(#prismGrad)" stroke="#ffffff" strokeWidth="1.2" strokeLinejoin="round" />

            {/* 용의춤 상승 기류 나선 화살표 */}
            <path d="M22 46 C24 38 32 36 36 32 C40 28 44 24 44 18" stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M40 16 L45 17 L44 22" fill="none" stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            <path d="M42 46 C40 38 32 36 28 32 C24 28 20 24 20 18" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M24 16 L19 17 L20 22" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* 중앙 드래곤 문장 룬 */}
            <circle cx="32" cy="38" r="5" fill="#0f172a" stroke="url(#goldGrad)" strokeWidth="1.5" />
            <path d="M32 35 L34 38 L32 41 L30 38 Z" fill="#f43f5e" />

            {/* ✦ 스파클 */}
            <path d="M48 14 Q48 18 52 18 Q48 18 48 22 Q48 18 44 18 Q48 18 48 14 Z" fill="#fef08a" />
            <path d="M14 44 Q14 47 17 47 Q14 47 14 50 Q14 47 11 47 Q14 47 14 44 Z" fill="#f43f5e" />
          </g>
        )}

        {/* 9. 구애받지않는 (끊어지는 쇠사슬 & 해방의 에너지 스파크) */}
        {/* 10. 할머니의 고추기름 (매운 붉은 고추 & 타오르는 불꽃과 고추기름 방울) */}
        {id === "grandmasChiliOil" && (
          <g filter="url(#glow)">
            {/* 배경 타오르는 화염 아우라 */}
            <path d="M32 10 C38 18 46 24 46 34 C46 44 38 52 32 52 C26 52 18 44 18 34 C18 24 26 18 32 10 Z" fill="url(#flameGrad)" opacity="0.35" />
            {/* 고추 줄기 (초록) */}
            <path d="M30 16 C30 13 32 11 34 10 C35 12 34 15 32 17 Z" fill="#10b981" />
            {/* 매운 고추 실루엣 */}
            <path d="M32 16 C38 18 42 24 42 32 C42 42 34 49 26 51 C24 51 23 49 25 47 C29 43 32 37 32 30 C32 24 30 20 28 17 C29 16 31 16 32 16 Z" fill="url(#chiliGrad)" stroke="#fca5a5" strokeWidth="0.8" />
            {/* 고추 하이라이트 광택 */}
            <path d="M33 20 C36 24 37 30 36 36" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" fill="none" />
            {/* 튀는 고추기름 방울들 */}
            <circle cx="20" cy="30" r="2.2" fill="#ef4444" stroke="#fef08a" strokeWidth="0.6" />
            <circle cx="16" cy="38" r="1.6" fill="#f97316" />
            <circle cx="44" cy="22" r="1.8" fill="#f43f5e" />
            <circle cx="46" cy="38" r="2.4" fill="url(#chiliGrad)" stroke="#fef08a" strokeWidth="0.6" />
            {/* 스파클 & 화염 스파크 */}
            <polygon points="32,24 33.5,27 37,28 33.5,29 32,32 30.5,29 27,28 30.5,27" fill="#fde047" />
            <circle cx="38" cy="14" r="1.2" fill="#fef08a" />
            <circle cx="24" cy="42" r="1" fill="#ffffff" />
          </g>
        )}

        {/* 9. 구애받지않는 (격렬하게 폭발하며 끊어지는 육중한 쇠사슬 - UNCHAINED!) */}
        {id === "unboundChoice" && (
          <g filter="url(#glow)">
            {/* 1. 배경: 사슬이 끊어지며 터져 나오는 해방의 충격파 버스트 (Shockwave) */}
            <polygon points="32,12 35,24 47,17 39,28 52,32 39,36 47,47 35,40 32,52 29,40 17,47 25,36 12,32 25,28 17,17 29,24" fill="url(#flameGrad)" opacity="0.38" />
            <polygon points="32,17 34.5,26.5 43,22 37.5,29 46,32 37.5,35 43,42 34.5,37.5 32,47 29.5,37.5 21,42 26.5,35 18,32 26.5,29 21,22 29.5,26.5" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="0.8" />

            {/* 2. 좌측 쇠사슬 (하단으로 튕겨나가는 육중한 강철 사슬 링크들) */}
            {/* 하단 기저 링크 (좌하단) */}
            <rect x="8" y="44" width="15" height="9" rx="4.5" transform="rotate(-42 15.5 48.5)" fill="url(#chainMetal)" stroke="#ffffff" strokeWidth="0.9" />
            <rect x="11.5" y="46" width="8" height="5" rx="2.5" transform="rotate(-42 15.5 48.5)" fill="#090d16" />

            {/* 중간 교차 링크 */}
            <path d="M 17 41 L 24 33 L 28 37 L 21 45 Z" fill="#64748b" stroke="#f8fafc" strokeWidth="0.9" strokeLinejoin="round" />
            <line x1="20.5" y1="37" x2="24.5" y2="41" stroke="#cbd5e1" strokeWidth="1.2" />

            {/* 격렬하게 뜯겨나간 좌측 반쪽 사슬 (Severed Left Half) */}
            <path d="M 23 37 C 22 30, 27 25, 31 27 L 31.5 30.5 C 29 29, 25 32, 26 36 C 27 40, 30 42, 33 40 L 32.5 43.5 C 27 45, 23 42, 23 37 Z" fill="url(#chainMetal)" stroke="#ffffff" strokeWidth="1" />
            {/* 좌측 파단면의 붉게 달아오른 파편 단면 (Molten Fracture Tips) */}
            <polygon points="31,27 34,26.5 33,29 31.5,30.5" fill="#fef08a" stroke="#f97316" strokeWidth="0.8" />
            <polygon points="33,40 36,41.5 34,44 32.5,43.5" fill="#fef08a" stroke="#f97316" strokeWidth="0.8" />

            {/* 3. 우측 쇠사슬 (상단으로 튕겨나가는 육중한 강철 사슬 링크들) */}
            {/* 격렬하게 뜯겨나간 우측 반쪽 사슬 (Severed Right Half) */}
            <path d="M 41 27 C 42 34, 37 39, 33 37 L 32.5 33.5 C 35 35, 39 32, 38 28 C 37 24, 34 22, 31 24 L 31.5 20.5 C 37 19, 41 22, 41 27 Z" fill="url(#chainMetal)" stroke="#ffffff" strokeWidth="1" />
            {/* 우측 파단면의 붉게 달아오른 파편 단면 (Molten Fracture Tips) */}
            <polygon points="33,37 30,37.5 31,35 32.5,33.5" fill="#fef08a" stroke="#f97316" strokeWidth="0.8" />
            <polygon points="31,24 28,22.5 30,20 31.5,20.5" fill="#fef08a" stroke="#f97316" strokeWidth="0.8" />

            {/* 중간 교차 링크 */}
            <path d="M 36 27 L 43 19 L 47 23 L 40 31 Z" fill="#64748b" stroke="#f8fafc" strokeWidth="0.9" strokeLinejoin="round" />
            <line x1="39.5" y1="23" x2="43.5" y2="27" stroke="#cbd5e1" strokeWidth="1.2" />

            {/* 상단 기저 링크 (우상단) */}
            <rect x="42.5" y="11.5" width="15" height="9" rx="4.5" transform="rotate(-42 50 16)" fill="url(#chainMetal)" stroke="#ffffff" strokeWidth="0.9" />
            <rect x="46" y="13.5" width="8" height="5" rx="2.5" transform="rotate(-42 50 16)" fill="#090d16" />

            {/* 4. 폭발적으로 사방에 비산하는 깨진 사슬 파편들 (Flying Shrapnel) */}
            <polygon points="23,17 27,14 28,18 24,20" fill="url(#chainMetal)" stroke="#fef08a" strokeWidth="0.8" />
            <polygon points="40,11 44,13 43,16 39,14" fill="url(#chainMetal)" stroke="#ffffff" strokeWidth="0.8" />
            <polygon points="18,43 21,46 19,48 16,45" fill="url(#chainMetal)" stroke="#ffffff" strokeWidth="0.8" />
            <polygon points="43,47 47,45 48,49 44,51" fill="url(#chainMetal)" stroke="#fef08a" strokeWidth="0.8" />
            <polygon points="31,9 34,12 31,14 28,11" fill="#cbd5e1" stroke="#f97316" strokeWidth="0.7" />

            {/* 5. 파단점 중심 백색 발광 코어 및 불꽃 스파크 (Core Energy & Sparks) */}
            <circle cx="32" cy="32" r="3.6" fill="#ffffff" />
            <circle cx="32" cy="32" r="1.8" fill="#fef08a" />

            {/* 사방으로 튀는 용융 불꽃 파티클 */}
            <circle cx="20" cy="25" r="1.2" fill="#ffedd5" />
            <circle cx="27" cy="20" r="1.5" fill="#fde047" />
            <circle cx="37" cy="19" r="1.3" fill="#f97316" />
            <circle cx="44" cy="27" r="1.5" fill="#ef4444" />
            <circle cx="43" cy="38" r="1.4" fill="#fde047" />
            <circle cx="37" cy="44" r="1.6" fill="#ffedd5" />
            <circle cx="25" cy="42" r="1.3" fill="#f97316" />
            <circle cx="19" cy="34" r="1.5" fill="#fde047" />

            {/* 6. 끊어진 순간의 격렬한 반동 속도선 (Kinetic Snap Lines) */}
            <line x1="16" y1="56" x2="8" y2="60" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
            <line x1="22" y1="53" x2="15" y2="59" stroke="#67e8f9" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
            <line x1="48" y1="8" x2="56" y2="4" stroke="#facc15" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
            <line x1="42" y1="11" x2="49" y2="5" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />

            {/* ✦ 해방의 섬광 스파클 */}
            <path d="M 53 28 Q 53 31 56 31 Q 53 31 53 34 Q 53 31 50 31 Q 53 31 53 28 Z" fill="#fef08a" />
            <path d="M 11 36 Q 11 39 14 39 Q 11 39 11 42 Q 11 39 8 39 Q 11 39 11 36 Z" fill="#67e8f9" />
          </g>
        )}

        {/* 11. 가시갑옷 (업로드 이미지 1:1 재현: 시안 네온 링 + 크림슨 용암 배경 + 화이트 스티커 아웃라인 + 다크 차콜 & 골드 가시갑옷) */}
        {id === "thornmail" && (
          <g transform="translate(-0.5, -0.5) scale(0.64)">
            {/* 1. 원형 클리핑 내부: 크림슨 레드 에너지 폭풍 & 번개 줄기 배경 */}
            <g clipPath="url(#tmCircleClip)">
              <circle cx="50.8" cy="50.8" r="45.5" fill="url(#tmBgGrad)" />

              {/* 어두운 와류 그림자 결 */}
              <path
                d="M 10 35 C 25 15, 50 8, 75 18 C 60 22, 42 25, 10 35 Z"
                fill="#3b0a14"
                opacity="0.65"
              />
              <path
                d="M 75 45 C 88 55, 92 75, 72 92 C 78 75, 76 58, 68 48 Z"
                fill="#3b0a14"
                opacity="0.65"
              />

              {/* 좌하단 & 우중단 밝은 오렌지-골드 열기 글로우 */}
              <circle cx="50.8" cy="50.8" r="45.5" fill="url(#tmWarmGlow1)" />
              <circle cx="50.8" cy="50.8" r="45.5" fill="url(#tmWarmGlow2)" />

              {/* 상단 번개/에너지 크랙 */}
              <path
                d="M 52 21 L 59.5 16.5 L 56.5 12.2 L 67.5 8 L 59 13.5 L 61.5 17.5 Z"
                fill="#fed7aa"
                opacity="0.85"
              />
              {/* 좌중단~좌하단 지그재그 에너지 번개 줄기 */}
              <path
                d="M 6.5 44 L 12.5 53.5 L 18 55 L 11 55.2 L 6.5 49 Z"
                fill="#fed7aa"
                opacity="0.85"
              />
              <path
                d="M 10.5 68 L 15.8 71.5 L 18.2 66.8 L 26.8 71.5 L 25.5 63.5 L 30.8 62.5 L 31.8 59.5
                   L 29.5 64 L 26.8 64.8 L 28.2 73.2 L 19 68.5 L 16.2 73.2 Z"
                fill="#fca5a5"
                opacity="0.8"
              />
              {/* 우하단 에너지 줄기 */}
              <path
                d="M 73.5 55 L 81.5 57.5 L 86 64 L 83.5 70 L 89.5 72.5 L 85.5 79.5
                   L 83 72 L 85.5 69 L 83.5 63.5 L 79.5 58.8 Z"
                fill="#fca5a5"
                opacity="0.75"
              />
              {/* 하단 불꽃 줄기 */}
              <path
                d="M 30 88.5 C 35 86, 40 86.5, 45 84.5 C 41 87.5, 35 88.5, 30 88.5 Z"
                fill="#fb923c"
                opacity="0.85"
              />

              {/* 내부 불티 & 붉은 꽃잎/파편 파티클들 */}
              <ellipse cx="38" cy="16.5" rx="0.8" ry="1.8" transform="rotate(25 38 16.5)" fill="#fde047" />
              <circle cx="36.8" cy="13.5" r="0.7" fill="#fb923c" />
              <circle cx="21.5" cy="54.2" r="0.9" fill="#fde047" />
              <circle cx="12.2" cy="61.5" r="0.8" fill="#fca5a5" />
              <circle cx="23" cy="82.2" r="1.1" fill="#fb923c" />
              <ellipse cx="53.8" cy="92.2" rx="1.4" ry="0.9" transform="rotate(-25 53.8 92.2)" fill="#fde047" />
              <ellipse cx="71" cy="85.5" rx="0.9" ry="1.5" transform="rotate(30 71 85.5)" fill="#fb923c" />
              <ellipse cx="89.5" cy="43.8" rx="1.3" ry="2.2" fill="#fde047" stroke="#ea580c" strokeWidth="0.6" />
              <path d="M 87.5 52 C 89.5 54, 90.8 57.5, 90 60 C 88.2 58, 87 55, 87.5 52 Z" fill="#ef4444" />
              <ellipse cx="89" cy="56.8" rx="0.8" ry="1.8" transform="rotate(-20 89 56.8)" fill="#fde047" />
            </g>

            {/* 2. 기존 증강 톤에 맞춘 원형 링 */}
            <circle cx="50.8" cy="50.8" r="44.8" fill="none" stroke="url(#augRingTone)" strokeWidth="2.4" />

            {/* 3. 링 바깥 크림슨/오렌지 파편들 (좌상단 & 우상단) */}
            <g>
              <ellipse cx="11.2" cy="11.5" rx="0.9" ry="1.3" transform="rotate(-15 11.2 11.5)" fill="#ea580c" />
              <path d="M 7.2 19.5 C 9.2 21, 10.8 23.5, 9.8 25.5 C 7.8 24.5, 6.8 22, 7.2 19.5 Z" fill="#dc2626" />
              <ellipse cx="83.5" cy="9" rx="1.1" ry="0.8" transform="rotate(30 83.5 9)" fill="#ea580c" />
              <path d="M 92 12 C 94.5 13, 95 16.5, 92.2 19 C 92.5 16.5, 91.5 14, 92 12 Z" fill="#dc2626" />
              <ellipse cx="93" cy="15.5" rx="0.7" ry="1.4" transform="rotate(10 93 15.5)" fill="#fb923c" />
              <path d="M 95.5 26 C 96.2 28, 95 29.8, 93.2 30.2 C 94 28.5, 94.8 27, 95.5 26 Z" fill="#dc2626" />
            </g>

            {/* 4. 가시갑옷 본체 (화이트 스티커 아웃라인 + 다크 플레이트 아머 + 골드 복부/칼라 + 골드 스파이크) */}
            <g>
              {/* [레이어 1] 갑옷 전체 통일된 화이트 스티커 외곽 아웃라인 */}
              <path
                d="M 25.2 13.8
                   L 33 25.8
                   C 34.8 25.2, 36.8 25.5, 38.2 26.2
                   L 39.5 24.8
                   C 41.2 20.5, 46.5 19, 53.5 20.2
                   C 57.5 20.8, 60.8 22.2, 62.8 23.8
                   L 64.8 18.2
                   L 67.5 23.8
                   L 69.2 24.2
                   L 76.8 15.2
                   L 75.8 27.5
                   L 77.2 28.5
                   L 83.5 25.5
                   L 80.5 32.8
                   C 82.5 35.5, 83.8 38.2, 83.8 39.8
                   L 82.2 40.5
                   L 84.8 44.2
                   C 83.5 45.8, 79.5 45.5, 75.2 43.2
                   L 75.2 44.8
                   L 73.5 47.2
                   C 74.2 51.8, 73.8 56.5, 72 60.5
                   L 71.2 64.2
                   L 72.5 64.8
                   L 76.5 64.2
                   L 74.2 70.5
                   L 75.2 73
                   L 76.2 74.2
                   L 74.8 75.2
                   C 75.5 77.8, 74.8 80.2, 73.5 81.8
                   L 70.5 79.8
                   C 68 83.8, 65.2 87.2, 62 89.2
                   C 57.5 87.8, 52.5 84.8, 48.2 81.2
                   L 44.2 85.8
                   C 40.2 84.5, 36.2 81.2, 33.5 77.2
                   L 35.2 74.2
                   L 31.2 68.8
                   L 36 69.8
                   L 36.5 66
                   L 38.5 65.5
                   C 37.8 63.2, 37.5 60.8, 37.8 58.8
                   C 34.2 57.2, 31.5 53.5, 30.2 48.2
                   C 25.8 50.2, 19.5 51.2, 15.2 49.5
                   L 17.5 44.2
                   L 15.8 43.8
                   L 17 39.2
                   L 15.2 38.2
                   C 15.8 35.5, 17.5 33, 19.5 31.2
                   L 17.2 24.5
                   L 24 27.8
                   Z"
                fill="#ffffff"
                stroke="#ffffff"
                strokeWidth="4.2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* [레이어 2] 하단 차콜 허리/골반 아머 & 좌/우 타셋(Tassets) */}
              <g>
                {/* 내부 어두운 몸통 베이스 */}
                <polygon points="30,36 74,36 72,78 62,88 46,80 38,65" fill="#18131d" />

                {/* 중앙 하단 V자 골반 다크 아머 */}
                <path
                  d="M 48.2 73.5
                     L 62.5 79.8
                     L 70.5 71.5
                     L 70.5 79.8
                     C 68 83.8, 65.2 87.2, 62 89.2
                     C 57.5 87.8, 52.5 84.8, 48.2 81.2
                     Z"
                  fill="url(#tmDarkMetal)"
                  stroke="#0b080e"
                  strokeWidth="2.1"
                  strokeLinejoin="round"
                />
                {/* 골반 아머 상단 벨트 스트랩 단차 */}
                <path
                  d="M 49.2 73.5 L 62.2 79.8 L 62 83.2 L 48.5 76.5 Z"
                  fill="#645866"
                  stroke="#0b080e"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                {/* 골반 아머 우측 음영면 */}
                <polygon points="62.2,79.8 70.2,72 69.8,79.5 62,88.5" fill="#2c2430" />

                {/* 우측 허리 타셋 플레이트 + 미니 스파이크 */}
                <polygon
                  points="72.5,66.2 76.5,64.2 74.2,70.5"
                  fill="url(#tmSpikeGrad)"
                  stroke="#0b080e"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <polygon
                  points="74.5,72.8 76.2,74.2 74.5,75.5"
                  fill="url(#tmSpikeGrad)"
                  stroke="#0b080e"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {/* 우측 타셋 본체 */}
                <path
                  d="M 71.2 64.5
                     L 73.2 65.2
                     C 74.5 70.5, 75.5 76.5, 73.5 81.8
                     L 69.8 79.2
                     C 69.8 74.5, 70.2 69.5, 71.2 64.5 Z"
                  fill="url(#tmDarkMetal)"
                  stroke="#0b080e"
                  strokeWidth="2.0"
                  strokeLinejoin="round"
                />
                <path
                  d="M 71.2 64.5 L 73.2 65.2 L 73.5 73.5 L 69.8 73.2 Z"
                  fill="url(#tmGoldGrad)"
                  stroke="#0b080e"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />

                {/* 좌측 허리 타셋 플레이트 */}
                <path
                  d="M 36.5 66
                     L 38.5 65.5
                     L 50.2 74.8
                     L 46.2 84.2
                     L 44.2 85.8
                     C 40.2 84.5, 36.2 81.2, 33.5 77.2
                     L 35.2 74.2
                     Z"
                  fill="url(#tmGoldGrad)"
                  stroke="#0b080e"
                  strokeWidth="2.1"
                  strokeLinejoin="round"
                />
                {/* 좌측 타셋 내부 다크 메탈 면 */}
                <path
                  d="M 36.5 67.5
                     L 46.8 76.2
                     L 42.8 84.8
                     C 39.2 83.2, 36 80.2, 33.8 77
                     Z"
                  fill="url(#tmDarkMetal)"
                  stroke="#0b080e"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                {/* 좌측 타셋 골드 리벳 스터드 */}
                <circle cx="43" cy="76.5" r="1.3" fill="#fef08a" stroke="#0b080e" strokeWidth="0.8" />
                {/* 좌측 타셋 측면 가시 */}
                <path
                  d="M 36.8 71.2
                     L 31.2 68.8
                     L 35.8 75.2
                     C 37.8 75.5, 39.2 73.5, 36.8 71.2 Z"
                  fill="url(#tmSpikeGrad)"
                  stroke="#0b080e"
                  strokeWidth="1.9"
                  strokeLinejoin="round"
                />
              </g>

              {/* [레이어 3] 좌측 겨드랑이 암홀 & 측면 늑골 다크 플레이트 */}
              <g>
                <path
                  d="M 30.2 46
                     L 42.5 43
                     L 46 65
                     L 38.5 65.5
                     C 37.8 63.2, 37.5 60.8, 37.8 58.8
                     C 34.2 57.2, 31.5 53.5, 30.2 46 Z"
                  fill="url(#tmDarkShade)"
                  stroke="#0b080e"
                  strokeWidth="2.1"
                  strokeLinejoin="round"
                />
                {/* 겨드랑이 검은 암홀 내부 구멍 */}
                <path
                  d="M 31 46.5 C 31.5 51.8, 34.5 54.5, 37.2 53.5 C 39.8 52.5, 40.5 47.5, 39.5 43.5 Z"
                  fill="#07050a"
                  stroke="#0b080e"
                  strokeWidth="1.6"
                />
                {/* 암홀 아래 붉은 반사광 하이라이트 */}
                <path
                  d="M 32.5 52.5 C 34 55.2, 36.5 56.5, 39.2 56.2"
                  fill="none"
                  stroke="#f87171"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.75"
                />
                {/* 측면 늑골 분절 라인 */}
                <path
                  d="M 37.8 58.8 C 40.5 58.5, 42.8 57.2, 44.2 55.2"
                  fill="none"
                  stroke="#0b080e"
                  strokeWidth="2.0"
                  strokeLinecap="round"
                />
                <path
                  d="M 38.5 64.2 C 41.8 64.2, 44.5 62.8, 46.2 60.5"
                  fill="none"
                  stroke="#0b080e"
                  strokeWidth="2.0"
                  strokeLinecap="round"
                />
              </g>

              {/* [레이어 4] 복부 2단 골드 쉐브론(Chevron) 플레이트 */}
              <g>
                {/* 하단(2단) 복부 골드 쉐브론 플레이트 */}
                <path
                  d="M 43.8 63.5
                     L 69.8 58.5
                     C 69.8 63.5, 68.2 68.5, 66.2 71.2
                     L 64.2 70.8
                     L 62.5 79.5
                     L 54.5 71.2
                     L 51.5 72.8
                     C 47.8 70.2, 45.2 67, 43.8 63.5 Z"
                  fill="url(#tmGoldGrad)"
                  stroke="#0b080e"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
                <polygon points="51.5,63 55.5,62 55.5,71.2 51.5,72.2" fill="#ffffff" opacity="0.65" />
                <polygon points="62.5,68 69.2,60 66.2,70.8 64.2,70.5 62.5,78.8" fill="#85623a" opacity="0.65" />

                {/* 상단(1단) 복부 골드 쉐브론 플레이트 */}
                <path
                  d="M 41.8 52.8
                     L 45.5 48.2
                     L 73.2 48.5
                     C 73.8 52.8, 73.2 56.8, 71.8 60.2
                     L 69.8 60.2
                     L 64.5 69.8
                     L 54.5 60.8
                     L 50.5 63.2
                     C 46.2 60.5, 43.2 56.8, 41.8 52.8 Z"
                  fill="url(#tmGoldGrad)"
                  stroke="#0b080e"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
                <polygon points="49.5,55.5 55,58.5 55,61.5 50.5,62.8" fill="#fffbeb" opacity="0.7" />
                <polygon points="61.5,58.5 64.5,59.5 64.5,69.2 61.5,66.2" fill="#fffbeb" opacity="0.65" />
                <polygon points="64.5,58.5 72.8,50 71.5,59.8 69.8,59.8 64.5,68.8" fill="#85623a" opacity="0.6" />
              </g>

              {/* [레이어 5] 중앙 다크 차콜 흉갑 (Breastplate) & 골드 넥 칼라 (Gorget) */}
              <g>
                <path
                  d="M 41.5 28.5
                     L 66.5 27.5
                     L 75.2 44.8
                     L 71.2 50.2
                     L 66.5 58.2
                     L 52.8 54.2
                     L 49.5 48.5
                     L 40.5 46.2
                     Z"
                  fill="url(#tmDarkMetal)"
                  stroke="#0b080e"
                  strokeWidth="2.3"
                  strokeLinejoin="round"
                />
                <path
                  d="M 40.8 44.2 L 50.2 46.5 L 53.5 52.2 L 66.2 55.8 L 70.8 48.2 L 74.5 43.5
                     L 75.2 44.8 L 71.2 50.2 L 66.5 58.2 L 52.8 54.2 L 49.5 48.5 L 40.5 46.2 Z"
                  fill="#261f2b"
                />
                <polygon points="65.2,47.5 66.8,47.5 66.8,57.5 65.2,57.5" fill="#8b7d8b" opacity="0.7" />
                <path
                  d="M 50.5 39.5 C 52.5 39.5, 54.5 41.5, 55.2 44 C 53.2 43.5, 51.2 41.5, 50.5 39.5 Z"
                  fill="#8b7d8b"
                  opacity="0.65"
                />
                <ellipse cx="51.2" cy="44.2" rx="1.4" ry="0.7" transform="rotate(25 51.2 44.2)" fill="#8b7d8b" opacity="0.65" />

                {/* 상단 골드 칼라 (High Gold Collar / Gorget) */}
                <path
                  d="M 39.5 24.8
                     C 41.2 20.5, 46.5 19, 53.5 20.2
                     C 61.5 21.5, 67.2 25.5, 67.2 30.5
                     C 67.2 36.5, 66.8 42.8, 65.5 48
                     C 61.2 42.5, 54.5 38.2, 46.5 34.8
                     C 41.5 32.8, 39.2 28.5, 39.5 24.8 Z"
                  fill="url(#tmGoldGrad)"
                  stroke="#0b080e"
                  strokeWidth="2.3"
                  strokeLinejoin="round"
                />
                <path
                  d="M 40.5 25.5 C 40.8 29, 43.5 32, 48.5 34.2 L 49.5 30.5 C 44.5 28.5, 41.8 26, 40.5 25.5 Z"
                  fill="#9a5b42"
                  opacity="0.65"
                />
                <path
                  d="M 48 29.5 C 52.5 31.5, 57.5 33.5, 59.5 36.5 L 61.2 41.5 C 58 37.5, 53 34.5, 48 32.5 Z"
                  fill="#fffbeb"
                  opacity="0.75"
                />

                {/* 칼라 안쪽 어두운 목 구멍 */}
                <path
                  d="M 44.2 24.2
                     C 45.2 21.5, 51.5 21.5, 57.5 23.8
                     C 62.5 25.8, 64.5 28.8, 63.2 31.5
                     C 62.2 33.8, 63.2 37.2, 63.2 39.2
                     C 61.8 39.2, 60.8 36.8, 59.2 33.2
                     C 56.8 31.2, 51.5 29.5, 47.5 27.5
                     C 44.8 26.2, 43.8 25.2, 44.2 24.2 Z"
                  fill="#1b1521"
                  stroke="#0b080e"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </g>

              {/* [레이어 6] 우측 어깨 견갑 (Right Pauldron - 3단 레이어 + 스파이크 3개) */}
              <g>
                <path
                  d="M 74.5 39.5 L 82.2 40.5 L 84.8 44.2 C 82.5 45.5, 78.5 44.8, 74.5 42.5 Z"
                  fill="url(#tmDarkShade)"
                  stroke="#0b080e"
                  strokeWidth="2.0"
                  strokeLinejoin="round"
                />
                <path
                  d="M 71.5 33.5 L 80.5 32.8 C 82.5 35.5, 83.8 38.2, 83.8 39.8 C 80.5 40.5, 77.5 39.5, 74.5 38.2 Z"
                  fill="url(#tmDarkMetal)"
                  stroke="#0b080e"
                  strokeWidth="2.0"
                  strokeLinejoin="round"
                />
                <path
                  d="M 63.5 24.2
                     C 68.5 23.5, 74.5 26.2, 78.5 31.2
                     C 79.5 34.5, 79.8 37.5, 78.5 39.5
                     L 73.2 40.2
                     C 72.5 33.5, 69.2 27.8, 63.5 24.2 Z"
                  fill="url(#tmDarkMetal)"
                  stroke="#0b080e"
                  strokeWidth="2.1"
                  strokeLinejoin="round"
                />
                <polygon points="80.2,34.2 82.8,38.5 79.8,38.8" fill="#dc2626" opacity="0.7" />
                <polygon points="81.2,41.2 83.8,43.8 80.5,43.8" fill="#dc2626" opacity="0.65" />

                {/* 우측 어깨 스파이크 3개 */}
                <path
                  d="M 62.8 23.8 L 64.8 18.2 L 67.5 23.8 C 66 24.5, 64.2 24.5, 62.8 23.8 Z"
                  fill="url(#tmSpikeGrad)"
                  stroke="#0b080e"
                  strokeWidth="2.0"
                  strokeLinejoin="round"
                />
                <path
                  d="M 69.2 24.2 L 76.8 15.2 L 75.8 28.2 C 73.2 27.8, 70.8 26.2, 69.2 24.2 Z"
                  fill="url(#tmSpikeGrad)"
                  stroke="#0b080e"
                  strokeWidth="2.1"
                  strokeLinejoin="round"
                />
                <polygon points="76.2,16.5 75.2,27.5 73.2,26.8" fill="#855832" opacity="0.7" />
                <path
                  d="M 75.5 30.2 L 83.5 25.5 L 79.5 34.5 C 77.2 34.5, 75.2 32.8, 75.5 30.2 Z"
                  fill="url(#tmSpikeGrad)"
                  stroke="#0b080e"
                  strokeWidth="2.1"
                  strokeLinejoin="round"
                />
              </g>

              {/* [레이어 7] 좌측 거대 어깨 견갑 (Left Pauldron - 3단 겹침 플레이트 + 대형 스파이크 3개) */}
              <g>
                <path
                  d="M 17.5 43.5
                     L 36.2 39.5
                     C 35.2 44.5, 30.5 48.2, 24.5 49.5
                     C 20.2 50.2, 16.8 49.8, 15.2 48.8
                     Z"
                  fill="url(#tmDarkShade)"
                  stroke="#0b080e"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
                <path d="M 16.2 48.2 L 18.2 44.2 L 21.5 45.2 L 19.5 48.8 Z" fill="#dc2626" opacity="0.7" />
                <path d="M 17 48.5 C 22.5 49.2, 28.5 47.5, 33.5 43.5" fill="none" stroke="#8b7d8b" strokeWidth="1.3" strokeLinecap="round" />

                <path
                  d="M 17 38.5
                     L 37.5 35.5
                     C 35.5 40.5, 30.2 43.8, 23.5 44.8
                     C 19.2 45.2, 16.5 44.8, 15.8 43.5
                     Z"
                  fill="url(#tmDarkMetal)"
                  stroke="#0b080e"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
                <path d="M 16.8 42.8 L 18.5 39.2 L 21.8 40.2 L 19.8 43.5 Z" fill="#dc2626" opacity="0.7" />
                <path d="M 17.5 43.2 C 23 43.8, 29 42, 34 38.5" fill="none" stroke="#8b7d8b" strokeWidth="1.3" strokeLinecap="round" />

                <path
                  d="M 15.2 38.2
                     C 16.2 33.2, 20.5 28.5, 27.5 26.2
                     C 32.5 24.8, 36.8 25.2, 39.5 27.2
                     C 42.5 31.2, 44.5 36.5, 45.2 41.2
                     L 41.8 42.2
                     C 38.5 39.8, 34.5 38.2, 30.5 38
                     C 25.5 40.2, 20.2 40.8, 15.2 38.2 Z"
                  fill="url(#tmDarkMetal)"
                  stroke="#0b080e"
                  strokeWidth="2.3"
                  strokeLinejoin="round"
                />
                <path
                  d="M 16.5 37.2 C 17.5 34.2, 19.8 31.8, 22.5 30.5 C 21.2 33.5, 19.8 36.2, 18.8 38.2 Z"
                  fill="#dc2626"
                  opacity="0.75"
                />
                <path
                  d="M 25.5 33.5 C 28.5 31.5, 31.5 30.5, 33.8 31.5 C 32.5 33.5, 29.5 34.8, 25.5 33.5 Z"
                  fill="#a396a6"
                  opacity="0.7"
                />
                <path
                  d="M 16.2 38.5 C 21 39.2, 26 38.2, 30.5 36.2 C 35 36.5, 39 38, 42.5 40.2"
                  fill="none"
                  stroke="#0b080e"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                />
                <path
                  d="M 17.5 37.2 C 21.8 37.8, 26.2 36.8, 30.5 34.8 C 34.8 35.2, 38.8 36.8, 42.2 38.8"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity="0.75"
                />

                {/* 좌측 어깨 스파이크 3개 */}
                <path
                  d="M 19.5 31.5 L 17.2 24.5 L 24.2 28 C 23.2 30.2, 21.2 31.5, 19.5 31.5 Z"
                  fill="url(#tmSpikeGrad)"
                  stroke="#0b080e"
                  strokeWidth="2.0"
                  strokeLinejoin="round"
                />
                <path
                  d="M 24.5 29.5
                     L 25.2 13.8
                     L 33.2 26.8
                     C 31.2 30.5, 26.8 31.2, 24.5 29.5 Z"
                  fill="url(#tmSpikeGrad)"
                  stroke="#0b080e"
                  strokeWidth="2.3"
                  strokeLinejoin="round"
                />
                <path d="M 25.2 14.8 L 28.2 30.2 C 26.2 30.2, 25 29.5, 24.7 28.8 Z" fill="#8c5828" opacity="0.85" />
                <polygon points="25.5,14.8 30.8,29.2 28.2,30.2" fill="#fffbeb" opacity="0.9" />

                <path
                  d="M 33.8 32.8
                     L 39.2 25.5
                     L 40.2 34.8
                     C 38.2 36.8, 34.5 35.8, 33.8 32.8 Z"
                  fill="url(#tmSpikeGrad)"
                  stroke="#0b080e"
                  strokeWidth="2.1"
                  strokeLinejoin="round"
                />
                <polygon points="39,26.5 37.5,35.5 35.2,34.5" fill="#fffbeb" opacity="0.85" />
              </g>

              {/* [레이어 8] 스파이크 끝단 골든-오렌지 스타버스트 섬광 */}
              <g>
                <polygon
                  points="25.2,13.8 21.8,7.2 24.6,13.2 29.2,9.8 25.8,13.6 32.5,16.5 25.6,14.5 27.8,20.5 24.8,14.8 20.5,19.8 24.2,14.2 17.8,13.5"
                  fill="#fb923c"
                />
                <circle cx="25.2" cy="14" r="1.3" fill="#ffffff" />

                <polygon points="32.5,28.8 33,29.8 34.2,30.2 33,30.6 32.5,31.8 32,30.6 30.8,30.2 32,29.8" fill="#fde047" />
                <polygon points="36.8,28.2 37.3,29.5 38.8,29.8 37.3,30.2 36.8,31.5 36.3,30.2 34.8,29.8 36.3,29.5" fill="#ffffff" />

                <polygon
                  points="83.5,25.5 85.2,22.2 84,25.2 87.2,24.8 84,25.8 85.8,28.8 83.3,26 80.5,27.2 83,25.5 81.2,23.2"
                  fill="#fde047"
                />
                <circle cx="83.5" cy="25.5" r="0.8" fill="#ffffff" />
              </g>
            </g>
          </g>
        )}

        {/* 12. 진심 펀치 (원작 '진심 펀치' 정면 3D 거대 주먹 & 상단 백라이트 & 사이타마 실루엣) */}
        {id === "onePunchMan" && (
          <g filter="url(#glow)">
            {/* [백업 보관 1: 대각 돌파 펀치 아이콘 - 롤백 요청 시 주석 해제하여 즉시 복원 가능] */}
            {/*
            <g id="backup_fist_side">
              <polygon points="32,6 35,17 46,11 41,21 54,20 44,28 55,34 43,37 50,47 38,43 39,55 32,46 25,55 26,43 14,47 21,37 9,34 20,28 10,20 23,21 18,11 29,17" fill="url(#flameGrad)" opacity="0.4" stroke="url(#goldGrad)" strokeWidth="0.8" />
              <ellipse cx="32" cy="30" rx="26" ry="22" stroke="url(#goldGrad)" strokeWidth="1.6" strokeDasharray="6 4" strokeOpacity="0.8" fill="none" />
              <ellipse cx="32" cy="30" rx="19" ry="16" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="4 4" strokeOpacity="0.6" fill="none" />
              <line x1="32" y1="14" x2="32" y2="4" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="48" y1="20" x2="57" y2="14" stroke="#fef08a" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="16" y1="20" x2="7" y2="14" stroke="#fef08a" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="48" y1="40" x2="57" y2="46" stroke="#f97316" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="16" y1="40" x2="7" y2="46" stroke="#f97316" strokeWidth="2.2" strokeLinecap="round" />
              <rect x="22" y="44" width="20" height="9" rx="3" fill="#991b1b" stroke="#fef08a" strokeWidth="1" />
              <path d="M 20 44 C 26 42, 38 42, 44 44 L 43 47 C 37 45, 27 45, 21 47 Z" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="0.8" />
              <path d="M 19 28 C 17 38, 22 44, 32 44 C 42 44, 47 38, 45 28 C 43 20, 21 20, 19 28 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M 18 27 C 18 22, 23 21, 24 26 L 24 33 C 21 33, 18 31, 18 27 Z" fill="#dc2626" stroke="#ffffff" strokeWidth="1" />
              <path d="M 24 25 C 24 20, 29 19, 30 25 L 30 33 C 27 33, 24 32, 24 25 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
              <path d="M 30 24 C 30 19, 36 19, 37 24 L 37 33 C 34 33, 30 33, 30 24 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
              <path d="M 37 25 C 37 20, 43 21, 44 26 L 43 33 C 40 33, 37 32, 37 25 Z" fill="#dc2626" stroke="#ffffff" strokeWidth="1" />
              <path d="M 19 33 C 19 31, 22 30, 25 31 L 39 33 C 42 34, 43 37, 41 39 C 39 41, 22 41, 20 38 Z" fill="#b91c1c" stroke="#ffffff" strokeWidth="1" />
              <path d="M 27 32 C 27 35, 29 38, 30 40" stroke="#7f1d1d" strokeWidth="1" strokeLinecap="round" />
              <circle cx="21" cy="24" r="1.1" fill="#ffffff" /><circle cx="27" cy="22.5" r="1.3" fill="#ffffff" /><circle cx="33.5" cy="22" r="1.4" fill="#ffffff" /><circle cx="40.5" cy="23.5" r="1.2" fill="#ffffff" />
              <path d="M 32 8 Q 32 11 35 11 Q 32 11 32 14 Q 32 11 29 11 Q 32 11 32 8 Z" fill="#ffffff" />
            </g>
            */}

            {/* [백업 보관 2: 애니메이션 먹선 해칭 정면 주먹 - 롤백 요청 시 주석 해제하여 즉시 복원 가능] */}
            {/*
            <g id="backup_anime_knuckles_hatch">
              <g transform="translate(7, 7) scale(0.78)">
                <rect x="5" y="14" width="37" height="36" rx="8" fill="#e11d48" />
                <line x1="14" y1="16" x2="14" y2="48" stroke="#160205" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="23.5" y1="14" x2="23.5" y2="50" stroke="#160205" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="33" y1="16" x2="33" y2="48" stroke="#160205" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="9.5" y1="20" x2="9.5" y2="44" stroke="#ffb3c1" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="9.5" y1="24" x2="9.5" y2="40" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
                <line x1="18.5" y1="18" x2="18.5" y2="46" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" />
                <line x1="18.5" y1="20" x2="18.5" y2="44" stroke="#fff1f2" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="28" y1="17" x2="28" y2="47" stroke="#ffffff" strokeWidth="3.8" strokeLinecap="round" />
                <line x1="28" y1="19" x2="28" y2="45" stroke="#fff1f2" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="37.5" y1="20" x2="37.5" y2="44" stroke="#ffb3c1" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="37.5" y1="24" x2="37.5" y2="40" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
                <path d="M7 14 L7 8 M10 14 L10 7 M14 15 L14 8 M18 13 L18 6 M21 13 L21 7 M24 13 L24 5 M28 13 L28 6 M31 14 L31 7 M35 14 L35 8 M38 15 L38 9" stroke="#0a0002" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M5 18 L1 18 M5 23 L0 23 M5 28 L1 28 M5 33 L0 33 M5 38 L1 38 M5 43 L0 43 M5 48 L1 48" stroke="#0a0002" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M7 50 L7 56 M11 50 L11 57 M16 50 L16 58 M21 51 L21 58 M26 51 L26 58 M31 50 L31 57 M36 50 L36 56 M39 49 L39 55" stroke="#0a0002" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M13 22 L15 25 M13 29 L15 32 M13 36 L15 39 M22.5 21 L24.5 24 M22.5 28 L24.5 31 M22.5 35 L24.5 38 M32 22 L34 25 M32 29 L34 32 M32 36 L34 39" stroke="#000000" strokeWidth="1" strokeLinecap="round" />
                <path d="M 40 16 C 48 11, 58 14, 61 24 C 63 34, 58 44, 43 45 L 41 40 C 47 38, 51 32, 51 27 C 51 21, 46 17, 40 16 Z" fill="#260106" stroke="#881337" strokeWidth="0.8" />
                <polygon points="44,24 49,21 51,25 46,27" fill="#ffffff" />
                <polygon points="54,26 59,27 60,30 55,30" fill="#ffffff" />
                <circle cx="47.5" cy="24" r="1.6" fill="#ffffff" />
                <circle cx="56.5" cy="28" r="1.4" fill="#ffffff" />
                <path d="M42 20 L38 21 M43 27 L38 28 M43 34 L38 34 M42 40 L37 39" stroke="#0a0002" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M 46 58 L 47 52 C 46 50, 48 49, 49 49 C 50 49, 51 50, 51 52 L 50 58 Z" fill="#000000" />
                <circle cx="49" cy="47.5" r="1.4" fill="#000000" />
                <circle cx="50" cy="52" r="0.9" fill="#facc15" />
              </g>
            </g>
            */}

            {/* 1. 배경 심홍색 대기 & 상단 백라이트 골든 오라 */}
            <circle cx="32" cy="32" r="29" fill="url(#fistDarkAura)" />
            <circle cx="32" cy="32" r="29" fill="url(#topGoldAura)" />

            {/* 2. 주먹 우측 뒤 사이타마 실루엣 (Head & Yellow Suit) */}
            <path d="M 53 23 C 57 20, 61 24, 61 30 C 61 36, 57 40, 53 42 Z" fill="#200508" />
            <path d="M 55 39 L 62 43 L 58 49 L 52 45 Z" fill="#eab308" opacity="0.85" />

            {/* 3. 정면 3D 거대 주먹 베이스 덩어리 (Solid Organic Fist Mass) */}
            <path
              d="M 8 28
                 C 8 21, 14 19, 17 19
                 C 19 19, 20 16, 26 15
                 C 30 14, 38 13, 42 15
                 C 46 16, 50 18, 54 22
                 C 57 27, 57 33, 56 39
                 C 55 44, 52 48, 46 50
                 C 38 52, 25 52, 19 48
                 C 14 45, 8 43, 8 36 Z"
              fill="url(#fistBase3D)"
              stroke="#120102"
              strokeWidth="1"
            />

            {/* 상단 너클 산맥 백라이트 림 (Gold Knuckle Rim) */}
            <path d="M 11 21 C 14 18, 17 19, 19 20 M 21 17 C 24 15, 28 15, 30 17 M 32 15 C 36 13, 41 13.5, 43 16 M 46 17 C 49 18, 52 20, 54 23" stroke="#fef08a" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.9" />

            {/* 4. 네 손가락의 3D 입체 기둥 & 하이라이트 (Organic Fingers) */}
            {/* [소지 (새끼손가락, 좌측)] */}
            <path d="M 9 27 C 8 21, 16 19, 18 20 L 18 40 C 18 41.5, 13 41.5, 10 40.5 C 9 39, 8 34, 9 27 Z" fill="url(#fingerShade)" />
            <ellipse cx="13.5" cy="24" rx="3.5" ry="3" fill="url(#knuckleSheenRadial)" />
            <path d="M 12.5 27 C 12.5 31, 12.5 35, 12 38" stroke="#fca5a5" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />

            {/* [약지] */}
            <path d="M 18 20 C 18 15, 29 14, 29 18 L 29 41 C 29 42.5, 21 42.5, 18 41 Z" fill="url(#fingerShade)" />
            <ellipse cx="24" cy="20" rx="4.5" ry="3.5" fill="url(#knuckleSheenRadial)" />
            <circle cx="23.5" cy="18" r="1.3" fill="#ffffff" />
            <path d="M 23.5 23 C 24 28, 24 34, 23.5 38" stroke="#fca5a5" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
            <path d="M 24 25 L 24 36" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.9" />

            {/* [중지 - 원작의 가장 크고 넓은 중심축] */}
            <path d="M 29 17 C 29 12, 43 12, 43 16 L 43 41 C 43 42.5, 32 42.5, 29 41 Z" fill="url(#fingerShade)" />
            <ellipse cx="36" cy="18" rx="5.5" ry="4" fill="url(#knuckleSheenRadial)" />
            <circle cx="35.5" cy="16" r="1.6" fill="#ffffff" />
            <path d="M 36 21 C 36.5 27, 36.5 34, 36 38" stroke="#fca5a5" strokeWidth="2.8" strokeLinecap="round" opacity="0.85" />
            <path d="M 36.5 23 L 36.5 37" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" opacity="0.95" />

            {/* [검지 - 우측 손가락] */}
            <path d="M 43 16 C 43 13, 54 16, 54 21 L 54 40 C 54 41.5, 46 41.5, 43 40 Z" fill="url(#fingerShade)" />
            <ellipse cx="48.5" cy="21" rx="4.5" ry="3.5" fill="url(#knuckleSheenRadial)" />
            <circle cx="48" cy="19" r="1.4" fill="#ffffff" />
            <path d="M 48.5 24 C 49 29, 48.5 34, 48 38" stroke="#fca5a5" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
            <path d="M 49 26 L 49 36" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.9" />

            {/* 5. 손가락 사이의 자연스러운 깊은 음영 틈새 (Soft Natural Crevices) */}
            <path d="M 18.5 20 C 18.5 26, 18 34, 18 41" stroke="#100102" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 29.5 17 C 29.5 25, 29 34, 29 41" stroke="#0c0102" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M 43 16 C 43 24, 42.5 33, 42.5 41" stroke="#100102" strokeWidth="2.4" strokeLinecap="round" />

            {/* 6. 엄지 손가락 (하단 전체를 가로지르며 손가락들을 단단히 받쳐 쥐는 원작 형태) */}
            <path
              d="M 53 35
                 C 56 40, 54 47, 48 49
                 C 41 51, 27 51, 21 47
                 C 18 45, 18 41, 22 40
                 C 26 39, 37 40, 44 39
                 C 48 38, 51 36, 53 35 Z"
              fill="url(#thumbGrad)"
              stroke="#1f0305"
              strokeWidth="0.8"
            />
            {/* 엄지-손가락 분리선 그림자 */}
            <path d="M 21 41 C 28 43, 38 42.5, 47 39.5" stroke="#0a0001" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            {/* 엄지 하단 반사광 (Bright Orange/White Sheen) */}
            <path d="M 24 48 C 32 50, 43 49.5, 48 45.5" stroke="#f97316" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M 27 47.8 C 34 49.2, 42 48.8, 46 46" stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.9" />

            {/* 7. 진심 펀치 앰비언트 에너지 스파클 (Aura Glints) */}
            <circle cx="10" cy="9" r="1.3" fill="#fef08a" />
            <circle cx="53" cy="8" r="1.4" fill="#ffffff" />
            <path d="M 32 3 Q 32 6 34 6 Q 32 6 32 9 Q 32 6 30 6 Q 32 6 32 3 Z" fill="#ffffff" />
            <circle cx="5" cy="32" r="1.1" fill="#fef08a" />
            <circle cx="58" cy="27" r="1.1" fill="#ffffff" />
          </g>
        )}

        {/* 13. 무효~! 겟또다제 (억까방지 스타일: 검은 바탕 + 크기를 줄인 하늘색 X) */}
        {id === "nullifyGetto" && (
          <g filter="url(#glow)">
            {/* 1. 검은 바탕 베이스 원 & 은은한 하늘색 오라 */}
            <circle cx="32" cy="32" r="29" fill="#040711" />
            <circle cx="32" cy="32" r="28" fill="url(#nullifySkyAura)" />

            {/* 2. 외곽 억까방지 테마 아치형 하늘색 링 */}
            <path d="M16 32 A16 16 0 0 1 48 32 M48 32 A16 16 0 0 1 16 32" stroke="url(#prismRing)" strokeWidth="1.8" strokeDasharray="14 6" strokeLinecap="round" opacity="0.65" />
            <circle cx="32" cy="32" r="25" fill="none" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="0.8" />

            {/* 3. 살짝 키운 34x34 하늘색 앵귤러 X 심볼 */}
            <path
              d="M 32 27 L 44 15 L 49 20 L 37 32 L 49 44 L 44 49 L 32 37 L 20 49 L 15 44 L 27 32 L 15 20 L 20 15 Z"
              fill="url(#skyBlueXGrad)"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />

            {/* 중앙 화이트 스파클 코어 */}
            <circle cx="32" cy="32" r="2" fill="#ffffff" />

            {/* 억까방지와 동일한 스파클 장식 */}
            <path d="M48 16 Q48 19 51 19 Q48 19 48 22 Q48 19 45 19 Q48 19 48 16 Z" fill="#fef08a" />
            <path d="M16 48 Q16 50.5 18.5 50.5 Q16 50.5 16 53 Q16 50.5 13.5 50.5 Q16 50.5 16 48 Z" fill="#67e8f9" />
          </g>
        )}

        {/* 15. 실패하면 반역 성공하면 혁명 (좌측 빨간 하강 화살표 + 우측 초록 상승 화살표, 높이 30% 축소) */}
        {(id === "rebellionOrRevolution" || id === "revolution") && (
          <g filter="url(#glow)">
            {/* 1. 배경 어두운 원 & 섀도우 림 */}
            <circle cx="32" cy="32" r="29" fill="url(#revDarkBg)" />
            <circle cx="32" cy="32" r="27.5" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.8" strokeDasharray="3 2" />

            {/* 좌우 은은한 색상 오라 */}
            <ellipse cx="24.5" cy="32" rx="11" ry="18" fill="#ef4444" fillOpacity="0.14" />
            <ellipse cx="39.5" cy="32" rx="11" ry="18" fill="#22c55e" fillOpacity="0.14" />

            {/* 2. 좌측 빨간 하강 화살표 (▼, 중앙 밀집) */}
            <path
              d="M 20.5 16 L 28.5 16 L 28.5 35 L 32.5 35 L 24.5 48 L 16.5 35 L 20.5 35 Z"
              fill="url(#redArrowGrad)"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <circle cx="24.5" cy="48.5" r="1.3" fill="#fecaca" />

            {/* 3. 우측 초록 상승 화살표 (▲, 중앙 밀집) */}
            <path
              d="M 39.5 16 L 47.5 29 L 43.5 29 L 43.5 48 L 35.5 48 L 35.5 29 L 31.5 29 Z"
              fill="url(#greenArrowGrad)"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <circle cx="39.5" cy="15.5" r="1.3" fill="#bbf7d0" />
          </g>
        )}

        {/* 14. 테라버스트 (업로드 원본 이미지와 100% 동일 형태 + 무지개 그라데이션) */}
        {id === "teraBlast" && (
          <g filter="url(#glow)">
            {/* 1. 배경 어두운 원 + 은은한 오라 */}
            <circle cx="32" cy="32" r="29" fill="url(#teraDarkBg)" />
            <circle cx="32" cy="32" r="28" fill="url(#teraAuraGlow)" />

            {/* 2. 테라스탈 6각성 메인 바디 (외곽 14포인트 - 내부 세로 6각 홀) */}
            <path
              d="M 32 6
                 L 39.7 22.7
                 L 51 18.4
                 L 42 28.2
                 L 42 35.8
                 L 51.1 45.2
                 L 39.7 41.3
                 L 32 58
                 L 24.3 41.3
                 L 12.9 45.2
                 L 22 35.8
                 L 22 28.2
                 L 12.9 18.4
                 L 24.3 22.7 Z
                 M 32 24.3
                 L 35.8 27.6
                 L 35.8 36.4
                 L 32 39.7
                 L 28.2 36.4
                 L 28.2 27.6 Z"
              fill="url(#teraRainbowExact)"
              fillRule="evenodd"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </g>
        )}

        {/* 16. 무한의 대검 (LoL Infinity Edge 스티커 픽토그램 아트) */}
        {id === "infinityEdge" && (
          <g transform="translate(-2.2, -3.9) scale(0.685)">
            {/* 1. 원형 배경 (클리핑 내부) */}
            <g clipPath="url(#ieMainCircleClip)">
              <circle cx="50" cy="52.5" r="41" fill="url(#ieBgGrad)" />
              <circle cx="50" cy="52.5" r="41" fill="url(#ieSoftGlow)" />
            </g>

            {/* 2. 기존 증강 톤에 맞춘 원형 링 */}
            <circle cx="50" cy="52.5" r="40.8" fill="none" stroke="url(#augRingTone)" strokeWidth="2.3" />

            {/* 3. 배경 황금 번개 줄기들 */}
            <g>
              {/* (A) 우측 상단 번개 가지 */}
              <path
                d="M 53.5 13
                   L 58.2 24.5 L 66.2 27.2 L 65.5 29.8 L 73.8 30.8 L 70 40 L 64.8 45.2 L 66.5 58.5
                   L 69.5 46.8 L 78.2 41.8 L 76.5 38.8 L 79.8 29.2 L 73.2 27.2 L 70.8 19.5 L 69.2 24.8 L 62.5 21.5 L 60.2 14 Z"
                fill="url(#ieBoltFill)"
                stroke="#fef08a"
                strokeWidth="1.0"
                strokeLinejoin="miter"
              />
              {/* (B) 우측 중단 번개 가지 & 샤드 */}
              <path
                d="M 72.5 63.5 L 74 53.8 L 80.2 52.5 L 86 42.5 L 83 55.8 L 76 57.5 Z"
                fill="url(#ieBoltFill)"
                stroke="#fef08a"
                strokeWidth="1.0"
                strokeLinejoin="miter"
              />
              <polygon points="79.5,64.2 92.8,58.2 82.2,66.8" fill="url(#ieBoltFill)" stroke="#fef08a" strokeWidth="0.8" />

              {/* (C) 좌측 상단~중단 번개 가지 */}
              <path
                d="M 5.5 30.5
                   L 19.8 47.8 L 19.5 53.2 L 10.8 54.8 L 24.8 58.8 L 26.2 64.8 L 15 66.5 L 24.8 70.2 L 39.2 64.5
                   L 28.5 63.5 L 29.2 56.2 L 22.2 53.8 L 22.8 47.2 Z"
                fill="url(#ieBoltFill)"
                stroke="#fef08a"
                strokeWidth="1.0"
                strokeLinejoin="miter"
              />

              {/* (D) 좌측 하단 번개 가지 & 샤드들 */}
              <polygon points="39.5,67 45.2,71 40.5,72.2" fill="url(#ieBoltFill)" stroke="#fef08a" strokeWidth="0.8" />
              <path
                d="M 13.8 90.5
                   L 27.2 75 L 35.2 76.8 L 46.8 74.5 L 41.2 84.8 L 37.2 81.2 L 25.5 81.5 Z"
                fill="url(#ieBoltFill)"
                stroke="#fef08a"
                strokeWidth="1.0"
                strokeLinejoin="miter"
              />
              <path
                d="M 37.2 95.5
                   L 43.2 85.2 L 49.2 84.5 L 50.2 90 L 45.5 89.5 Z"
                fill="url(#ieBoltFill)"
                stroke="#fef08a"
                strokeWidth="0.9"
                strokeLinejoin="miter"
              />
            </g>

            {/* 4. 대검 본체 (화이트 스티커 아웃라인 + 블랙 윤곽선 + 실버 베벨 + 룬 + 골드 힐트) */}
            <g>
              {/* [레이어 1] 통일된 두꺼운 화이트 스티커 테두리 */}
              <path
                d="M 18.5 14.5
                   C 29 16, 46 22, 58.5 36
                   L 56 40.5
                   C 56.5 49, 61 57, 68.5 63.5
                   C 68 66.5, 68.5 69.5, 70.5 71.5
                   C 72.5 69.5, 74 67.5, 75.5 66
                   C 78 71, 78.5 77.5, 75.5 83
                   L 69.5 87.8
                   C 67 87.5, 65 87.5, 63.5 87.5
                   C 58.5 87, 54 84, 51 80.5
                   C 54.5 80.8, 57.5 80.5, 60 80
                   C 59 77.5, 55.5 75.5, 51.5 74.5
                   C 47 63, 38 52.5, 27.5 52.5
                   C 20.5 40, 17 27, 18.5 14.5 Z"
                fill="#ffffff"
                stroke="#ffffff"
                strokeWidth="5.2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* [레이어 2] 대검 칼날 베이스 & 베벨 */}
              {/* (2-1) 좌측 하단 어두운 스틸 베벨면 */}
              <path
                d="M 18.5 14.5
                   L 23.5 21.5
                   C 23 29, 25 38, 30.5 48.5
                   C 42 51, 53 64, 60.5 76.5
                   L 59 77.5
                   C 56.5 75.5, 54 74.8, 51.5 74.5
                   C 47 63, 38 52.5, 27.5 52.5
                   C 20.5 40, 17 27, 18.5 14.5 Z"
                fill="url(#ieSilverDark)"
              />

              {/* (2-2) 우측 상단 밝은 실버 베벨면 */}
              <path
                d="M 18.5 14.5
                   C 29 16, 46 22, 58.5 36
                   L 56 40.5
                   C 56.5 49, 61 57, 68.5 63.5
                   C 67.8 67, 68.2 70, 70 72.5
                   L 66.5 71.5
                   C 58 61, 52.5 51, 51.5 42
                   L 54.5 36.5
                   C 44 28, 32 23, 23.5 21.5
                   Z"
                fill="url(#ieSilverLight)"
              />

              {/* (2-3) 칼끝 상단 화이트 하이라이트 패싯 */}
              <polygon points="18.5,14.5 35,18.2 25,22 23.5,21.5" fill="#ffffff" opacity="0.85" />

              {/* (2-4) 우측 숄더 안쪽 중간 톤 베벨 패싯 */}
              <path
                d="M 56 40.5
                   C 56.5 49, 61 57, 68.5 63.5
                   L 65.5 66
                   C 59 59, 54.5 50.5, 53.5 41.5
                   Z"
                fill="#e2e8f0"
                opacity="0.75"
              />

              {/* (2-5) 좌측 숄더 능선 음영 선 */}
              <line x1="27.5" y1="52.5" x2="30.5" y2="48.5" stroke="#475569" strokeWidth="1.2" />

              {/* (2-6) 칼날 외곽 굵은 블랙 윤곽선 */}
              <path
                d="M 18.5 14.5
                   C 29 16, 46 22, 58.5 36
                   L 56 40.5
                   C 56.5 49, 61 57, 68.5 63.5
                   C 67.8 67, 68.2 70, 70 72.5
                   L 60.5 78
                   C 58 76, 55 75, 51.5 74.5
                   C 47 63, 38 52.5, 27.5 52.5
                   C 20.5 40, 17 27, 18.5 14.5 Z"
                fill="none"
                stroke="#080a0f"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />

              {/* [레이어 3] 중앙 다크 차콜 트렌치 홈 */}
              <path
                d="M 23.5 21.5
                   C 32 23, 44 28, 54.5 36.5
                   L 51.5 42
                   C 52.5 51, 58 61, 66.5 71.5
                   L 60.5 76.5
                   C 53 64, 42 51, 30.5 48.5
                   C 25 38, 23 29, 23.5 21.5 Z"
                fill="url(#ieDarkTrench)"
                stroke="#080a0f"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />

              {/* [레이어 4] 고대 황금 룬 글리프들 (원작 6개 룬 1:1 정밀 매칭) */}
              <g filter="url(#ieRuneSoftGlow)" fill="url(#ieRuneYellow)">
                {/* 룬 1: 상단 작은 점 + 큰 V자 꺾임 */}
                <polygon points="31.2,28 35,28.8 35.4,30.4 32,30.4" />
                <polygon points="27.2,27.2 30.5,36 38.8,31.2 35.5,31 31.2,32.5" />

                {/* 룬 2: 불꽃/초승달 곡선 룬 */}
                <path d="M 34.5 35.5 C 33.8 38.2, 34 41.2, 35.5 42.3 C 37.2 43, 39.5 41.5, 40 39.5 C 40.3 37.5, 39 35, 38 34.2 L 36.5 37.5 C 36.5 38.6, 35.8 39, 35.4 38 C 35 37, 35 36, 34.5 35.5 Z" />

                {/* 룬 3: 긴 쐐기 훅 + 우측 작은 획 */}
                <polygon points="43,37.2 44.8,40.5 41,44.5 42.6,52 38,44.2 42.5,40.5" />
                <polygon points="45.8,42.5 46.5,45 44.5,46.8 42.8,46.5" />

                {/* 룬 4: 각진 아치형(П) 룬 */}
                <polygon points="45,54.5 46.8,46.8 49,49 50.5,48.2 51.8,52.2 48,56.5 47.3,55.8 49.5,52.2 47.2,50.5" />

                {/* 룬 5: 삼각 점 + 꺾인 쐐기 */}
                <polygon points="52.8,54.5 54.2,57.5 51.5,57.2" />
                <polygon points="50.5,58.2 56.5,60.2 55.5,62 52.8,63.5 51.8,62.8 52.5,60.5 50.5,59" />

                {/* 룬 6: 하단 Y자 획 + 슬래시 + 원형 점 */}
                <polygon points="58,63 59.5,64.8 58,66.5 58.8,68 57.8,68.5 55.8,65.5" />
                <polygon points="61,67.2 61.5,68 58.2,71.2 56.8,70.2" />
                <ellipse cx="61.3" cy="71.6" rx="1.0" ry="1.3" transform="rotate(-30 61.3 71.6)" />
              </g>

              {/* [레이어 5] 하단 골드 힐트 (좌/우 뿔 + 중앙 다이아몬드 가드 + 다크 아몬드 보석) */}
              {/* (5-1) 좌측 골드 뿔 */}
              <path
                d="M 51.2 80.5
                   C 55 81, 58.8 80.5, 61.5 80
                   L 64.5 87.5
                   C 59 87, 54 84, 51.2 80.5 Z"
                fill="#a16207"
                stroke="#080a0f"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <path
                d="M 52.5 80.8 C 55.5 81.2, 58.8 80.8, 61.2 80.3 L 62.5 83.8 C 58.5 83.5, 55 82.2, 52.5 80.8 Z"
                fill="#eab308"
              />

              {/* (5-2) 우측 골드 뿔 */}
              <path
                d="M 75.5 66.2
                   C 78 71, 78.2 77, 75.5 82.8
                   L 71.2 75
                   C 72.5 72, 74 69, 75.5 66.2 Z"
                fill="#ca8a04"
                stroke="#080a0f"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <path
                d="M 75.3 67.5 C 74 70, 72.8 72.5, 71.8 75 L 74.2 79.5 C 75.5 75.5, 75.8 71.5, 75.3 67.5 Z"
                fill="#fde68a"
              />

              {/* (5-3) 중앙 다이아몬드/나뭇잎 골드 가드 */}
              <path
                d="M 63.5 72.5
                   C 69 73, 74 77, 74.8 83.5
                   L 69.5 87.8
                   C 63 86.5, 60 80, 63.5 72.5 Z"
                fill="#eab308"
                stroke="#080a0f"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path
                d="M 63.5 72.5
                   C 60 80, 63 86.5, 69.5 87.8
                   L 71.5 85.5
                   C 66 84, 64 78.5, 65.5 75.5 Z"
                fill="#b45309"
              />
              <path
                d="M 63.8 73.8 C 68.5 74.2, 72.8 77.5, 73.8 82.8 L 71.5 84 C 70.8 79.5, 68 76.8, 65 76 Z"
                fill="#fef08a"
              />
              <path
                d="M 63.5 72.5
                   C 69 73, 74 77, 74.8 83.5
                   L 69.5 87.8
                   C 63 86.5, 60 80, 63.5 72.5 Z"
                fill="none"
                stroke="#080a0f"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />

              {/* (5-4) 중앙 다크 아몬드 보석 */}
              <path
                d="M 65.5 76.5
                   C 69.2 77.5, 71.8 80.5, 72 85.2
                   C 67.2 84.5, 64.5 81, 65.5 76.5 Z"
                fill="#262c36"
                stroke="#080a0f"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
            </g>
          </g>
        )}

        {/* 17. 라바돈의 죽음모자 (LoL Rabadon's Deathcap 스티커 픽토그램 아트) */}
        {id === "rabadonsDeathcap" && (
          <g transform="translate(-0.6, 2.2) scale(0.64)">
            {/* 1. 원형 클리핑 내부: 타오르는 화염 배경 */}
            <g clipPath="url(#rabCircleClip)">
              <circle cx="51" cy="46.5" r="44.5" fill="url(#rabBgGrad)" />

              {/* 좌측 및 상단 큰 오렌지 불꽃 결 */}
              <path
                d="M 8 60
                   C 10 45, 22 36, 26 42
                   C 22 30, 30 16, 39 10
                   C 34 19, 39 24, 46 15
                   C 43 6, 48 2, 54 2
                   L 66 4
                   C 56 12, 52 20, 56 26
                   L 35 65 Z"
                fill="url(#rabFlameOrange)"
                opacity="0.88"
              />
              {/* 우측 및 하단 큰 오렌지 불꽃 결 */}
              <path
                d="M 62 32
                   C 72 22, 82 14, 92 24
                   C 84 26, 86 36, 95 45
                   L 94 68
                   C 82 78, 70 88, 52 90
                   C 58 84, 54 78, 44 82
                   C 36 86, 24 84, 18 76
                   L 45 55 Z"
                fill="url(#rabFlameOrange)"
                opacity="0.85"
              />

              {/* 좌측 하단~중앙 밝은 옐로우/화이트 불꽃 코어 */}
              <path
                d="M 18 68
                   C 18 55, 26 48, 30 36
                   C 31 45, 36 42, 38 34
                   L 44 58
                   L 30 70 Z"
                fill="url(#rabFlameYellow)"
                opacity="0.92"
              />
              {/* 우측 중단~하단 밝은 옐로우/화이트 불꽃 코어 (챙 아래 소용돌이 화염 포함) */}
              <path
                d="M 59 38
                   C 68 35, 76 30, 82 28
                   C 78 36, 84 42, 89 52
                   C 82 50, 78 58, 76 68
                   C 70 74, 58 74, 52 67
                   C 62 69, 72 67, 74 61
                   C 74 56, 65 56, 56 60 Z"
                fill="url(#rabFlameYellow)"
                opacity="0.95"
              />
              {/* 챙 아래 선명한 오렌지 소용돌이 혀 */}
              <path
                d="M 64 67
                   C 72 68, 79 65, 79 59
                   C 83 63, 81 70, 72 72
                   C 66 73, 60 70, 56 66 Z"
                fill="#ea580c"
              />

              {/* 원 안쪽 불티(Embers) 파티클들 */}
              <circle cx="25.5" cy="19" r="1.4" fill="#fef08a" />
              <circle cx="29" cy="24.5" r="1.1" fill="#fde047" />
              <ellipse cx="17" cy="27" rx="1.6" ry="3.2" transform="rotate(30 17 27)" fill="#f97316" />
              <ellipse cx="21.5" cy="46" rx="1.3" ry="2.2" transform="rotate(-25 21.5 46)" fill="#fef08a" />
              <circle cx="23" cy="51.5" r="0.8" fill="#fef08a" />
              <circle cx="74" cy="13.8" r="1.5" fill="#fbbf24" />
              <circle cx="77" cy="16.5" r="0.9" fill="#fef08a" />
              <circle cx="83" cy="21" r="1.1" fill="#fb923c" />
              <circle cx="89" cy="37" r="0.8" fill="#fbbf24" />
              <circle cx="89.8" cy="40.8" r="1.1" fill="#fde047" />
              <ellipse cx="63" cy="77" rx="1.8" ry="1.2" transform="rotate(-30 63 77)" fill="#fef08a" />
              <circle cx="74.5" cy="74" r="0.8" fill="#fde047" />
              <circle cx="68.2" cy="81.2" r="0.6" fill="#fef08a" />
            </g>

            {/* 2. 기존 증강 톤에 맞춘 원형 링 */}
            <circle cx="51" cy="46.5" r="44" fill="none" stroke="url(#augRingTone)" strokeWidth="2.4" />

            {/* 3. 링 바깥 우상단 & 좌하단 불티 스파크 */}
            <g>
              {/* 우상단 불티들 */}
              <ellipse cx="83" cy="8.8" rx="1.0" ry="2.4" transform="rotate(15 83 8.8)" fill="#fb923c" />
              <ellipse cx="89.2" cy="8.5" rx="1.2" ry="4.8" transform="rotate(42 89.2 8.5)" fill="#f97316" />
              <ellipse cx="89.5" cy="15.2" rx="0.9" ry="2.2" transform="rotate(72 89.5 15.2)" fill="#fbbf24" />
              <circle cx="85.8" cy="3.5" r="0.7" fill="#ea580c" />
              <circle cx="93.3" cy="13.2" r="0.6" fill="#f97316" />

              {/* 좌하단 불티들 */}
              <ellipse cx="8.5" cy="71.2" rx="1.8" ry="1.0" transform="rotate(10 8.5 71.2)" fill="#fb923c" />
              <ellipse cx="9.2" cy="76.2" rx="3.2" ry="1.2" transform="rotate(-35 9.2 76.2)" fill="#f97316" />
              <ellipse cx="14.8" cy="77.5" rx="0.7" ry="1.6" transform="rotate(15 14.8 77.5)" fill="#fbbf24" />
              <circle cx="8" cy="66.5" r="0.7" fill="#fbbf24" />
              <circle cx="4.5" cy="70.2" r="0.6" fill="#ea580c" />
              <circle cx="14" cy="81.2" r="0.6" fill="#f97316" />
            </g>

            {/* 4. 라바돈의 죽음모자 본체 (화이트 스티커 아웃라인 + 블랙 윤곽선 + 보라색 모자 + 민트 입) */}
            <g>
              {/* [레이어 1] 통일된 두꺼운 화이트 스티커 외곽 테두리 */}
              <path
                d="M 55 12.5
                   C 60 13, 65 20, 66 25.5
                   C 68 24, 72 22.5, 76 23
                   C 80 24, 83 27.5, 84 32
                   C 80 29, 76 28.5, 73.5 31
                   C 71.5 33.5, 70 36, 66 36.8
                   C 63.5 37, 61.5 36, 60.2 35
                   C 61 36.8, 63 38.2, 64 40
                   C 65.5 43.2, 69 44, 72 45.5
                   C 73 46.8, 76.5 46.5, 78.5 47.8
                   C 80 49.5, 82 51, 85 52.5
                   C 90 55, 93 58.5, 92.5 64
                   C 92 69, 86 71.5, 79 71
                   C 73 70.5, 67.5 68, 65.5 66.5
                   C 71 67, 77 67.5, 82.5 66
                   C 85.5 64.5, 86 60, 82 58
                   C 75 55.5, 65 58, 56 64.5
                   C 48 70.5, 42 77, 32 78
                   C 22 78.5, 16.5 73.5, 14 68
                   C 13 66, 14.5 65, 18 65
                   C 23 64.5, 27 62.5, 30 60
                   C 30.2 57.5, 30.8 55.5, 31.5 54
                   L 34.5 57.5
                   L 36 52
                   L 39 54
                   L 39.8 50
                   L 41 51
                   L 40.5 46.5
                   L 38.2 44
                   L 36.2 47.8
                   L 35.2 44
                   L 33 46
                   C 32.2 44.5, 33.5 41.5, 35.5 40
                   C 34.2 38.5, 35 36.5, 37.5 35
                   C 39.5 31, 40.5 24, 43 20
                   C 46.5 15.5, 51 12.2, 55 12.5 Z"
                fill="#ffffff"
                stroke="#ffffff"
                strokeWidth="5.2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* [레이어 2] 입 안쪽 민트-화이트 발광 영역 */}
              <path
                d="M 35 42
                   L 63 41
                   L 61 54
                   L 46 62
                   L 31 58
                   L 37 49 Z"
                fill="url(#rabMouthGlow)"
              />

              {/* [레이어 3] 입 안쪽 민트색 보조 어금니/속이빨 */}
              <g fill="#7dd3fc" stroke="#08060c" strokeWidth="1.8" strokeLinejoin="round">
                <polygon points="35.2,43.5 36.2,47.8 38.8,43.5" />
                <polygon points="56.5,44 59,41 61.8,44 60.2,49.5 58.2,46" />
                <polygon points="34.5,58.5 36,52 38.8,54.8 36.8,59.5" />
              </g>

              {/* [레이어 4] 모자 상단 몸통 + 꼬깔 + 윗잇몸 & 윗니 */}
              <path
                d="M 55 12.5
                   C 60 13, 65 20, 66 25.5
                   C 68 24, 72 22.5, 76 23
                   C 80 24, 83 27.5, 84 32
                   C 80 29, 76 28.5, 73.5 31
                   C 71.5 33.5, 70 36, 66 36.8
                   C 63.5 37, 61.5 36, 60.2 35
                   C 61 36.8, 63 38.2, 64 40
                   L 61.8 44
                   L 59 41
                   L 56.8 46.5
                   L 54 41.2
                   L 50.2 46.8
                   L 44.5 40.5
                   L 41.8 48
                   L 38.5 43.2
                   L 33 46
                   C 32.2 44.5, 33.5 41.5, 35.5 40
                   C 34.2 38.5, 35 36.5, 37.5 35
                   C 39.5 31, 40.5 24, 43 20
                   C 46.5 15.5, 51 12.2, 55 12.5 Z"
                fill="url(#rabHatPurple)"
              />

              {/* 상단 모자 하이라이트 & 음영 디테일 */}
              <path
                d="M 42 29
                   C 43 23, 46 18, 53 14.5
                   C 56 14, 59 16, 61 20
                   C 56 17.5, 50 18.5, 46.5 23
                   C 44.5 25.5, 43.5 28, 42 29 Z"
                fill="#8b6fc0"
                opacity="0.7"
              />
              <path
                d="M 67.5 26.8
                   C 70.5 24.5, 74.5 24, 78 25.5
                   C 74.5 26, 71 27, 68.5 28.5 Z"
                fill="#8b6fc0"
                opacity="0.65"
              />
              <path
                d="M 36.5 39.5 C 42 36, 48 36.5, 54 38.5 C 50 39.5, 43 39.5, 36.5 39.5 Z"
                fill="#7c5bb0"
                opacity="0.55"
              />

              {/* 크라운 중앙 소용돌이(Swirl) 문양 */}
              <path
                d="M 51 28.8
                   C 52.2 28.8, 52.8 30, 52 31
                   C 50.8 32.2, 48.8 31.5, 48.5 29.8
                   C 48 27.2, 50.5 25.2, 53 25.8
                   C 56 26.5, 57.2 30, 55.8 32.8
                   C 54 35.8, 49.5 36.5, 46.8 34
                   C 44 31.2, 44.8 25.8, 48.5 23.5
                   C 52.2 21.2, 56.8 22.8, 58.2 26.5"
                fill="none"
                stroke="#6d509e"
                strokeWidth="2.1"
                strokeLinecap="round"
              />

              {/* [레이어 5] 모자 하단 턱(아랫니/아랫잇몸) + 넓은 챙(Brim) */}
              <path
                d="M 30 60
                   C 30.2 57.5, 30.8 55.5, 31.5 54
                   L 35.8 59.5
                   L 37.8 54.8
                   L 45.2 60.5
                   L 45.8 54
                   L 51 56
                   L 53 49.8
                   L 56.5 51.8
                   L 58.5 46
                   L 60.2 49.5
                   L 61.8 44
                   L 64 40
                   C 65.5 43.2, 69 44, 72 45.5
                   L 75 47.2
                   C 64 49, 54 57, 46.5 64
                   C 39 65, 33 63, 30 60 Z"
                fill="url(#rabHatDark)"
              />

              {/* 아랫니 보라색 하이라이트 패싯 */}
              <polygon points="31.5,55.5 34.8,59.5 32,60.5" fill="#6b4c9a" />
              <polygon points="37.8,55.5 43.5,60.2 37.5,61" fill="#583c87" />
              <polygon points="46.2,54.8 50.2,56.5 46,60" fill="#583c87" />

              {/* 모자 넓은 챙 (Brim) */}
              <path
                d="M 30 60
                   C 34 64.5, 41 65, 46.5 64
                   C 54 56.5, 64 48.5, 75 47.2
                   L 78.5 47.8
                   C 80 49.5, 82 51, 85 52.5
                   C 90 55, 93 58.5, 92.5 64
                   C 92 69, 86 71.5, 79 71
                   C 73 70.5, 67.5 68, 65.5 66.5
                   C 71 67, 77 67.5, 82.5 66
                   C 85.5 64.5, 86 60, 82 58
                   C 75 55.5, 65 58, 56 64.5
                   C 48 70.5, 42 77, 32 78
                   C 22 78.5, 16.5 73.5, 14 68
                   C 13 66, 14.5 65, 18 65
                   C 23 64.5, 27 62.5, 30 60 Z"
                fill="url(#rabHatPurple)"
              />

              {/* 챙 상단 밝은 보라색 입체 하이라이트 면 */}
              <path
                d="M 16 66.8
                   C 21 66.5, 26 64.5, 29.8 61.5
                   C 31 63.5, 34 65, 37 65.5
                   C 31 70, 22 70.5, 16 66.8 Z"
                fill="#7c5bb0"
                opacity="0.7"
              />
              <path
                d="M 60 56
                   C 68 51.5, 78 51, 86 55
                   C 89 56.5, 90.5 58.8, 90 61
                   C 86 56.5, 76 54, 60 56 Z"
                fill="#7c5bb0"
                opacity="0.65"
              />
              {/* 챙 하단 깊은 그림자 보라색 */}
              <path
                d="M 15.5 69.5
                   C 19 74.5, 24 77.5, 32 77.2
                   C 41 76.2, 47.5 70, 55.5 64
                   C 64.5 57.2, 75 54.8, 82.5 57.5
                   C 86.5 59.5, 86 64.8, 82.5 66.2
                   C 77 67.8, 71 67.2, 65.5 66.5
                   C 68 68.2, 73.5 70.5, 79 71
                   C 85 71.2, 90 69.5, 91.5 65.5
                   C 89 68, 85 69, 80 68.5
                   C 74 68, 70 66.5, 67 65.5
                   C 74 66, 80 65.5, 83.5 63.5
                   C 84.5 61, 83 59, 79 58
                   C 71 56.5, 62 60, 53 67
                   C 45 73, 39 76.5, 31 76.5
                   C 23 76.5, 18 73, 15.5 69.5 Z"
                fill="#231242"
              />

              {/* [레이어 6] 굵고 선명한 카툰 블랙 윤곽선 & 주름 디테일 */}
              <path
                d="M 55 12.5
                   C 60 13, 65 20, 66 25.5
                   C 68 24, 72 22.5, 76 23
                   C 80 24, 83 27.5, 84 32
                   C 80 29, 76 28.5, 73.5 31
                   C 71.5 33.5, 70 36, 66 36.8
                   C 63.5 37, 61.5 36, 60.2 35
                   C 61 36.8, 63 38.2, 64 40
                   L 61.8 44
                   L 59 41
                   L 56.8 46.5
                   L 54 41.2
                   L 50.2 46.8
                   L 44.5 40.5
                   L 41.8 48
                   L 38.5 43.2
                   L 33 46
                   C 32.2 44.5, 33.5 41.5, 35.5 40
                   C 34.2 38.5, 35 36.5, 37.5 35
                   C 39.5 31, 40.5 24, 43 20
                   C 46.5 15.5, 51 12.2, 55 12.5 Z"
                fill="none"
                stroke="#08060c"
                strokeWidth="2.3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              <path
                d="M 38.2 44 L 40.5 46.5 L 41 51 L 39.8 50 L 39 54 L 36 52 L 34.5 57.5"
                fill="none"
                stroke="#08060c"
                strokeWidth="1.9"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              <path
                d="M 31.5 54
                   L 35.8 59.5
                   L 37.8 54.8
                   L 45.2 60.5
                   L 45.8 54
                   L 51 56
                   L 53 49.8
                   L 56.5 51.8
                   L 58.5 46
                   L 60.2 49.5
                   L 61.8 44
                   L 64 40
                   C 65.5 43.2, 69 44, 72 45.5
                   C 73 46.8, 76.5 46.5, 78.5 47.8
                   C 80 49.5, 82 51, 85 52.5
                   C 90 55, 93 58.5, 92.5 64
                   C 92 69, 86 71.5, 79 71
                   C 73 70.5, 67.5 68, 65.5 66.5
                   C 71 67, 77 67.5, 82.5 66
                   C 85.5 64.5, 86 60, 82 58
                   C 75 55.5, 65 58, 56 64.5
                   C 48 70.5, 42 77, 32 78
                   C 22 78.5, 16.5 73.5, 14 68
                   C 13 66, 14.5 65, 18 65
                   C 23 64.5, 27 62.5, 30 60
                   C 30.2 57.5, 30.8 55.5, 31.5 54 Z"
                fill="none"
                stroke="#08060c"
                strokeWidth="2.3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* 모자 주름 & 눈썹 결 블랙 라인 디테일 */}
              <path
                d="M 56.5 23 C 59.5 26, 60.2 31, 60.2 35"
                fill="none"
                stroke="#08060c"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M 65.5 25.5 C 66.5 27.5, 68 28.5, 69.8 28.2"
                fill="none"
                stroke="#08060c"
                strokeWidth="2.0"
                strokeLinecap="round"
              />
              <path
                d="M 37.5 35 C 39.8 34.2, 41.8 34.2, 43.2 34.8"
                fill="none"
                stroke="#08060c"
                strokeWidth="2.0"
                strokeLinecap="round"
              />
              <path
                d="M 55.5 36.8 C 58.5 37.2, 61.5 38.5, 64 40"
                fill="none"
                stroke="#08060c"
                strokeWidth="2.0"
                strokeLinecap="round"
              />
              <path
                d="M 30 60 C 34 64.5, 41 65, 46.5 64 C 54 56.5, 64 48.5, 75 47.2"
                fill="none"
                stroke="#08060c"
                strokeWidth="2.1"
                strokeLinecap="round"
              />
            </g>
          </g>
        )}

        {/* 18. 공허의 지팡이 (LoL Void Staff 스티커 픽토그램 아트) */}
        {id === "voidStaff" && (
          <g transform="translate(-6.4, -5.0) scale(0.732)">
            {/* 1. 원형 클리핑 내부: 공허 성운 & 에너지 소용돌이 배경 */}
            <g clipPath="url(#voidCircleClip)">
              <circle cx="52.5" cy="50.5" r="40" fill="url(#voidBgGrad)" />

              {/* 우측 하단 어두운 공허 그림자 구름 */}
              <path
                d="M 60 35 C 75 30, 92 25, 95 45 L 95 92 L 35 92 C 45 78, 55 62, 60 35 Z"
                fill="#140836"
                opacity="0.7"
              />
              {/* 우측 중단 보라색 성운 빛줄기 */}
              <path
                d="M 55 45 C 70 38, 84 35, 92 38 C 82 48, 72 55, 58 56 Z"
                fill="#4c1d95"
                opacity="0.6"
              />

              {/* 좌상단 밝은 바이올렛 오라 */}
              <ellipse cx="42" cy="24" rx="22" ry="12" transform="rotate(-20 42 24)" fill="#a855f7" opacity="0.45" />
              <ellipse cx="52.5" cy="22" rx="3.2" ry="1.8" fill="#c084fc" opacity="0.55" />
              <circle cx="40.8" cy="16.8" r="1.1" fill="#e9d5ff" opacity="0.7" />
              <circle cx="69" cy="35" r="1.4" fill="#a855f7" opacity="0.5" />

              {/* 좌측 하단에서 상단 우측으로 감아 올라가는 큰 공허 바람 소용돌이 */}
              <path
                d="M 48 80
                   C 30 78, 18 68, 19.5 55
                   C 21 44, 30 38, 38 35
                   L 36 42
                   C 27 46, 23 54, 26 62
                   C 29 70, 39 74, 48 80 Z"
                fill="url(#voidSwirlLight)"
                opacity="0.65"
              />
              {/* 좌측 가장자리 날카로운 백색 소용돌이 스트림 */}
              <path
                d="M 16 58
                   C 17 48, 23 41, 31 37
                   C 25 43, 21 50, 21 58
                   C 21 65, 25 71, 32 75
                   C 23 72, 16 65, 16 58 Z"
                fill="#e9d5ff"
                opacity="0.75"
              />

              {/* 우상단으로 뻗어나가는 넓은 라벤더-화이트 소용돌이 웨이크 */}
              <path
                d="M 56 28
                   C 63 26, 66 21, 63 14
                   L 72 18
                   C 72 25, 67 31, 60 35 Z"
                fill="url(#voidSwirlLight)"
                opacity="0.85"
              />
              {/* 우상단 날카로운 직선 광선 */}
              <polygon points="56,36 81.5,22.5 83,25.5 58,39" fill="#e9d5ff" opacity="0.75" />
              <polygon points="55,36.8 78,24.5 57.5,38.2" fill="#ffffff" opacity="0.9" />
              {/* 우측 중단 보라색 얇은 광선 */}
              <polygon points="55,46.8 76,41 56,48.2" fill="#a855f7" opacity="0.75" />

              {/* 배경 스파클 & 별빛들 */}
              <path
                d="M 23.3 34.5 Q 23.3 37.8 26.5 37.8 Q 23.3 37.8 23.3 41.1 Q 23.3 37.8 20.1 37.8 Q 23.3 37.8 23.3 34.5 Z"
                fill="#f472b6"
              />
              <path
                d="M 21.2 51.5 Q 21.2 53.2 22.9 53.2 Q 21.2 53.2 19.5 53.2 Q 21.2 53.2 21.2 51.5 Z"
                fill="#ffffff"
              />
              <polygon points="46.2,16.1 47.4,17.5 46.2,18.9 45,17.5" fill="#ffffff" />
              <path
                d="M 62.2 22.8 Q 62.2 24.5 63.9 24.5 Q 62.2 24.5 62.2 26.2 Q 62.2 24.5 60.5 24.5 Q 62.2 24.5 62.2 22.8 Z"
                fill="#ffffff"
              />
              <circle cx="21" cy="44.2" r="1.1" fill="#ffffff" />
              <circle cx="19.5" cy="48.8" r="0.6" fill="#e9d5ff" />
            </g>

            {/* 2. 기존 증강 톤에 맞춘 원형 링 */}
            <circle cx="52.5" cy="50.5" r="39.2" fill="none" stroke="url(#augRingTone)" strokeWidth="2.1" />

            {/* 3. 공허의 지팡이 본체 */}
            <g transform="translate(-0.8, -1.0)">
              {/* [레이어 1] 지팡이 하단(금속 헤드 + 나무 자루) 화이트 스티커 외곽 아웃라인 */}
              <path
                d="M 63.2 37.5
                   C 63.8 39.8, 63.5 42, 62.5 43.8
                   C 63.8 45.8, 63.8 48.2, 62.8 50.2
                   C 64.5 51.2, 65.5 52.8, 65.5 54.5
                   C 67.5 55.8, 68.5 58.5, 68 61.5
                   L 71.5 67.2
                   L 73.5 69.2
                   L 76.8 75.8
                   C 79.2 77.5, 79.8 80.5, 78.2 82.8
                   C 76.8 84.6, 74 84.5, 72.2 83.6
                   C 69.8 84.2, 67.5 82.8, 66.2 80.2
                   C 65.2 78.2, 63 76.8, 61.2 74.5
                   C 59.8 72.5, 59.2 70.8, 57.8 69.5
                   L 56 68.2
                   C 53.5 68, 51.2 67.2, 50.2 66
                   L 50.2 62.5
                   C 48 62.8, 46.5 61.8, 46.2 59.5
                   C 44.5 59, 43.5 57.5, 43.5 55.8
                   C 41.2 55.2, 40 53.8, 39.5 52.2
                   L 36.2 49.5
                   Z"
                fill="#ffffff"
                stroke="#ffffff"
                strokeWidth="4.0"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* [레이어 2] 하단 뒤틀린 고목 나무 자루 & 푸른 공허 수정 줄기 */}
              <g>
                <path
                  d="M 56.2 67.5
                     L 67.5 61
                     L 71.5 67.2
                     L 73.5 69.2
                     L 76.8 75.8
                     C 79.2 77.5, 79.8 80.5, 78.2 82.8
                     C 76.8 84.6, 74 84.5, 72.2 83.6
                     C 69.8 84.2, 67.5 82.8, 66.2 80.2
                     C 65.2 78.2, 63 76.8, 61.2 74.5
                     C 59.8 72.5, 59.2 70.8, 57.8 69.5
                     Z"
                  fill="url(#voidWoodGrad)"
                  stroke="#08060c"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />

                {/* 나무 자루 내부 밝은 갈색 결 하이라이트 */}
                <path
                  d="M 59 68 C 61 71.2, 64.2 73.8, 68.2 75.8 C 64.8 72.8, 62.2 70.2, 60.5 67 Z"
                  fill="#855849"
                  opacity="0.75"
                />
                <path
                  d="M 66.2 63.2 C 67.8 66.8, 71 70.5, 74.2 73.8 C 72.5 70, 69.8 66.5, 67.5 62.5 Z"
                  fill="#784b3d"
                  opacity="0.75"
                />
                <path
                  d="M 61 73.5 C 63.5 76, 67.2 78, 69.8 81.2 C 66.8 78.8, 63 77, 61 73.5 Z"
                  fill="#784b3d"
                  opacity="0.7"
                />

                {/* 나무 뿌리 꼬임 블랙 윤곽선 디테일 */}
                <path
                  d="M 63.2 64.5 C 64 67.8, 66.5 71, 71 74.2 C 73 75.8, 74.8 78.5, 76.2 82.2"
                  fill="none"
                  stroke="#08060c"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M 59.2 70.2 C 62.5 72.8, 66.8 74.5, 70.2 77.8 C 71.5 79.5, 72.2 81.5, 72.2 83.2"
                  fill="none"
                  stroke="#08060c"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                {/* 나무 틈새로 빛나는 푸른(시안) 수정 광맥 3줄기 */}
                <polygon
                  points="62.8,63.8 65.2,62.8 66.8,71.2 64,68.2"
                  fill="#38bdf8"
                  stroke="#08060c"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                />
                <polygon
                  points="65.8,73.2 70.2,75.8 71.8,81.2 68.5,77.2"
                  fill="#38bdf8"
                  stroke="#08060c"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                />
                <polygon
                  points="73.8,76.8 76.8,79.5 77.5,83.2 75,80.5"
                  fill="#38bdf8"
                  stroke="#08060c"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                />
              </g>

              {/* [레이어 3] 조각된 다크 메탈 헤드 / 칼라 */}
              <g>
                {/* (3-1) 하단 받침 링 */}
                <path
                  d="M 50.2 61.5
                     L 66.2 53.5
                     C 68 55.2, 68.5 58.2, 67.8 61.2
                     C 64.5 65.5, 58.5 68.2, 50.2 66 Z"
                  fill="url(#voidMetalGrad)"
                  stroke="#08060c"
                  strokeWidth="2.1"
                  strokeLinejoin="round"
                />
                <polygon points="51.2,62.2 56.5,60.5 56.5,65.2 51.2,65" fill="#4a2c3a" opacity="0.8" />
                <polygon points="56.5,60.5 60.5,58.8 60.5,63.8 56.5,65" fill="#94a3b8" opacity="0.7" />

                {/* (3-2) 중단 물결 조각부 */}
                <path
                  d="M 39.5 52.2
                     L 62.5 43.8
                     C 63.8 45.8, 63.8 48.2, 62.8 50.2
                     C 64.5 51.2, 65.5 52.8, 65.5 54.5
                     C 63.5 58.5, 56.5 62.2, 47.2 62.2
                     C 46.2 61.5, 45.8 60.2, 46.2 59.2
                     C 44.5 58.8, 43.5 57.5, 43.5 55.8
                     C 41.2 55.2, 40 53.8, 39.5 52.2 Z"
                  fill="url(#voidMetalGrad)"
                  stroke="#08060c"
                  strokeWidth="2.1"
                  strokeLinejoin="round"
                />

                {/* 중단 조각 물결 하이라이트 & 음영 홈 */}
                <path
                  d="M 52.8 50.5
                     C 52.2 54.5, 52.8 58.8, 55.2 59.5
                     C 57.2 60, 58.2 56.5, 57.5 52.5
                     C 58.8 55.5, 59.2 58.5, 61.2 58.2
                     C 62.8 57.8, 63.2 54.5, 61.8 50.5"
                  fill="none"
                  stroke="#08060c"
                  strokeWidth="2.0"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 54 51.5 C 53.8 54.8, 54.5 57.8, 55.8 58.2"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 59.2 51.2 C 59.8 54, 60.2 56.5, 61.2 56.8"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
                <path
                  d="M 46.5 53.5 L 51.5 52.2 M 46.8 56.8 L 51.2 55.8"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />

                {/* (3-3) 상단 컵 림 */}
                <path
                  d="M 36.2 49.5
                     C 40.5 47.5, 45.8 45.2, 50.8 43.2
                     L 53.8 46.8
                     L 54.2 41.5
                     L 62.2 35.2
                     C 63.2 38.2, 63.2 41.5, 62.2 44.2
                     C 56.5 49.5, 47.5 53.2, 39.5 53.5
                     C 37.5 52.8, 36.2 51.2, 36.2 49.5 Z"
                  fill="url(#voidMetalGrad)"
                  stroke="#08060c"
                  strokeWidth="2.1"
                  strokeLinejoin="round"
                />
                <path
                  d="M 38.5 50.8 C 43.5 50.2, 48.5 48.2, 52.5 46.2"
                  fill="none"
                  stroke="#e879f9"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M 45.5 51.2 C 50 49.8, 54.5 47.8, 58.5 45.2"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </g>

              {/* [레이어 4] 공허의 구슬 (Void Orb) & 마젠타 코어 & 화이트 크레센트 링 */}
              <g>
                <circle cx="43.8" cy="35.8" r="13.5" fill="url(#voidOrbBase)" />
                <circle cx="44.2" cy="36.2" r="9.0" fill="#4c1d95" opacity="0.65" />
                <circle cx="45.2" cy="37.8" r="5.6" fill="#7e22ce" opacity="0.85" />

                {/* 오브 하단 강렬한 네온 마젠타-핑크 코어 발광 */}
                <ellipse cx="44" cy="43" rx="9.5" ry="4.5" transform="rotate(-22 44 43)" fill="url(#voidMagentaGlow)" />

                {/* 오브 정중앙 어두운 공허의 눈동자 */}
                <rect x="43" y="36.8" width="6.8" height="3.6" rx="1.8" transform="rotate(-18 46.4 38.6)" fill="#140524" />

                {/* 오브 좌측 상단 밝은 민트-화이트 타원 반사광 */}
                <ellipse cx="32.4" cy="33.2" rx="2.7" ry="3.2" transform="rotate(-15 32.4 33.2)" fill="#e0f2fe" />

                {/* 오브 외곽을 감싸는 화이트 에너지 소용돌이 고리 & 상단 스파이크 */}
                <path
                  d="M 30.2 43.2
                     C 27.5 36.2, 29.2 28.5, 34.2 25
                     L 31.8 18.2
                     L 36.2 24
                     C 43.5 20.5, 53 22.8, 57.2 29.5
                     C 53 25, 44.5 23, 37.5 26.2
                     C 31.8 28.8, 29.8 35.5, 31.8 42.2 Z"
                  fill="#ffffff"
                />

                {/* 오브 하단을 감싸며 좌우로 뻗어 나가는 화이트-라벤더 소용돌이 고리 */}
                <path
                  d="M 26.2 49.5
                     C 25.8 47.8, 27.5 45.2, 30.2 43.2
                     C 33.2 46.8, 39.2 47.5, 46.2 44.8
                     C 53.2 42, 57.5 36.5, 56.8 30.5
                     C 59.5 28, 62.5 27, 63.5 28.8
                     C 64.2 30.2, 62.5 32.5, 61.5 34
                     C 63.8 35.5, 65.5 37.5, 65.5 39
                     L 62.2 36.8
                     C 57.5 41.2, 50.5 45.2, 42.5 47.8
                     C 38.5 49.2, 35.5 50.2, 34.5 51.5
                     L 36.8 53.8
                     L 38.2 57.2
                     L 32.5 53
                     C 29.5 52.5, 26.8 51.2, 26.2 49.5 Z"
                  fill="#f5f3ff"
                />
                <path
                  d="M 27.5 48.8 C 28.5 46.8, 30.5 45.5, 33 46.5 C 31.5 48.2, 29.2 49.2, 27.5 48.8 Z"
                  fill="#c084fc"
                  opacity="0.55"
                />
                <path
                  d="M 57.5 32.5 C 59.5 30, 61.8 29.2, 62.5 30.5 C 61.8 32.2, 59.5 34.2, 57.2 35.5 Z"
                  fill="#c084fc"
                  opacity="0.55"
                />
              </g>
            </g>
          </g>
        )}
      </svg>
    </IconFrame>
  );
};

const IconFrame = styled.div`
  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  filter: drop-shadow(0 0 6px rgba(100, 255, 218, 0.35));
  transition:
    transform 0.2s ease,
    filter 0.2s ease;

  svg {
    display: block;
  }
`;

const DedicatedFrame = styled.div`
  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-sizing: border-box;
  background: radial-gradient(circle, #1e293b 0%, #0f172a 70%, #090d16 100%);
  border: 1.5px solid #38bdf8;
  box-shadow:
    0 0 8px rgba(56, 189, 248, 0.5),
    inset 0 0 6px rgba(100, 255, 218, 0.3);
`;

const DedicatedBg = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 30%, rgba(100, 255, 218, 0.15), transparent 70%);
  pointer-events: none;
`;

const DedicatedImg = styled.img`
  width: 90%;
  height: 90%;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6));
  z-index: 1;
  user-select: none;
  -webkit-user-drag: none;
  transform: ${(props) => (props.$offsetY || (props.$scale && props.$scale !== 1) ? `translateY(${props.$offsetY || 0}px) scale(${props.$scale || 1})` : "none")};
`;

const DedicatedRing = styled.div`
  position: absolute;
  inset: 1px;
  border-radius: 50%;
  border: 1px dashed rgba(254, 240, 138, 0.6);
  pointer-events: none;
  z-index: 2;
`;
