import React from "react";
import styled from "styled-components";

// 포켓몬 배틀 UI 스타일에 맞춘 룬 & 심볼 SVG 아이콘 세트 (틸/청록 & 골드 & 슬레이트 네이비 테마)
// 전용 증강별 포켓몬 도감번호 매핑
const DEDICATED_AUGMENT_POKEMON = {
  danceOfGarchomp: "0445",
  nameIsSalamence: "0373",
  fastStarter: "0486",
  legendaryTitan: "0486",
  soaring: "0330-m",
  eternamax: "0890-m",
  blackNight: "0890-m",
  harmfulBird: "0663",
  klinklangGear: "0601",
  magikarpJump: "0129-g",
  mewtwoStrikesBack: "0150-a",
  veteranPrivilege: "0128-a",
  devilOfGen7: "0778",
  evioliteShuckle: "0213",
  ninjaAppeared: "0658",
  libero: "0815",
  protean: "0658",
  intrepidSword: "0888",
  dauntlessShield: "0889",

};

// 특정 포켓몬 전용 증강 등에서 스프라이트 높이/위치 보정 옵션 (예: 보만다처럼 가로로 길고 아래로 처진 스프라이트 상향 보정)
const DEDICATED_AUGMENT_IMAGE_OPTIONS = {
  ninjaAppeared: { shiftUp: true, offsetY: -3.5, scale: 1.15 },
  "0658-a": { shiftUp: true, offsetY: -3.5, scale: 1.15 },
  evioliteShuckle: { shiftUp: true, offsetY: -3.5, scale: 1.15 },
  "0213": { shiftUp: true, offsetY: -3.5, scale: 1.15 },

  "0670": { shiftUp: true, offsetY: -3.5, scale: 1.15 },
  nameIsSalamence: { shiftUp: true, offsetY: -5.5, scale: 1.15 },
  "0373": { shiftUp: true, offsetY: -5.5, scale: 1.15 },
  legendaryTitan: { shiftUp: true, offsetY: -5, scale: 1.15 },
  soaring: { shiftUp: true, offsetY: -3.5, scale: 1.15 },
  "0330-m": { shiftUp: true, offsetY: -3.5, scale: 1.15 },
  fastStarter: { shiftUp: true, offsetY: -5, scale: 1.15 },
  "0486": { shiftUp: true, offsetY: -5, scale: 1.15 },
  eternamax: { shiftUp: false, offsetY: 2.5, scale: 1.02 },
  blackNight: { shiftUp: false, offsetY: 2.5, scale: 1.02 },
  "0890-m": { shiftUp: false, offsetY: 2.5, scale: 1.02 },
  harmfulBird: { shiftUp: true, offsetY: -3.5, offsetX: 2.5, scale: 1.15 },
  "0663": { shiftUp: true, offsetY: -3.5, offsetX: 2.5, scale: 1.15 },
  devilOfGen7: { shiftUp: true, offsetY: -6, offsetX: 2, scale: 1.15 },
  "0778": { shiftUp: true, offsetY: -6, offsetX: 2, scale: 1.15 },
  klinklangGear: { shiftUp: true, offsetY: -3.5, scale: 1.15 },
  "0601": { shiftUp: true, offsetY: -3.5, scale: 1.15 },
  magikarpJump: { shiftUp: true, offsetY: -4.5, scale: 1.35 },
  "0129-g": { shiftUp: true, offsetY: -4.5, scale: 1.35 },
  mewtwoStrikesBack: { shiftUp: true, offsetY: -3.5, scale: 1.15 },
  "0150-a": { shiftUp: true, offsetY: -3.5, scale: 1.15 },
  "0150": { shiftUp: true, offsetY: -3.5, scale: 1.15 },
  veteranPrivilege: { shiftUp: true, offsetY: -3.5, scale: 1.15 },
  "0128-a": { shiftUp: true, offsetY: -3.5, scale: 1.15 },
  "0128": { shiftUp: true, offsetY: -3.5, scale: 1.15 },
  libero: { shiftUp: true, offsetY: -3.5, scale: 1.15 },
  protean: { shiftUp: true, offsetY: -3.5, scale: 1.15 },
  "0815": { shiftUp: true, offsetY: -3.5, scale: 1.15 },
  "0658": { shiftUp: true, offsetY: -3.5, scale: 1.15 },
  "0908": { shiftUp: true, offsetY: -3.5, scale: 1.15 },
  intrepidSword: { shiftUp: true, offsetY: -3.5, scale: 1.15 },
  dauntlessShield: { shiftUp: true, offsetY: -3.5, scale: 1.15 },
  "0888": { shiftUp: true, offsetY: -3.5, scale: 1.15 },
  "0889": { shiftUp: true, offsetY: -3.5, scale: 1.15 },
};

export const AugmentIcon = ({ id, size = 42, pokemon = null, pokemonId = null, shiftUp = false, offsetY = null, offsetX = null, scale = null, imageOptions = null, sign = null }) => {
  const pokeId = pokemonId || ((id === "libero" || id === "protean" || id === "intrepidSword" || id === "dauntlessShield") && (pokemon?.uniqueKey || pokemon?.dexNo) ? (pokemon.uniqueKey || pokemon.dexNo) : null) || DEDICATED_AUGMENT_POKEMON[id] || (pokemon?.uniqueKey && (id === "danceOfGarchomp" || id === "nameIsSalamence" || id === "harmfulBird" || id === "devilOfGen7") ? pokemon.uniqueKey : null);

  const augOptions = imageOptions || DEDICATED_AUGMENT_IMAGE_OPTIONS[id] || (pokeId ? DEDICATED_AUGMENT_IMAGE_OPTIONS[pokeId] : null) || {};

  const isShiftUp = shiftUp || augOptions.shiftUp || offsetY !== null;
  const finalOffsetY = offsetY ?? augOptions.offsetY ?? (isShiftUp ? -3.5 : 0);
  const finalOffsetX = offsetX ?? augOptions.offsetX ?? 0;
  const finalScale = scale ?? augOptions.scale ?? (isShiftUp ? 1.1 : 1);

  if (pokeId) {
    return (
      <IconFrame $size={size}>
        <DedicatedFrame $size={size}>
          <DedicatedBg />
          <DedicatedImg
            src={`/pokemon/img/pokemon/${pokeId}.webp`}
            alt="전용 증강"
            $offsetX={finalOffsetX}
            $offsetY={finalOffsetY}
            $scale={finalScale}
            onError={(e) => {
              if (!e.currentTarget.src.endsWith(`/img/pokemon/${pokeId}.webp`)) {
                e.currentTarget.src = `/img/pokemon/${pokeId}.webp`;
              } else {
                e.currentTarget.style.display = "none";
              }
            }}
          />
          <DedicatedRing />
        </DedicatedFrame>
      </IconFrame>
    );
  }

  return (
    <IconFrame $size={size}>
      <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
        <defs>
          {/* 게임 테마 맞춤 틸/스카이블루 그라데이션 */}
          <linearGradient id="prismGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64ffda" />
            <stop offset="40%" stopColor="#38bdf8" />
            <stop offset="75%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>

          {/* 하트 전용 그라데이션 */}
          <linearGradient id="heartPinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff9a9e" />
            <stop offset="45%" stopColor="#f6416c" />
            <stop offset="100%" stopColor="#c31432" />
          </linearGradient>

          <linearGradient id="heartGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff3b0" />
            <stop offset="40%" stopColor="#ffd700" />
            <stop offset="100%" stopColor="#e67e22" />
          </linearGradient>

          <radialGradient id="heartSoftGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff758c" stopOpacity="0.75" />
            <stop offset="60%" stopColor="#ff416c" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ff416c" stopOpacity="0" />
          </radialGradient>

          <clipPath id="geniusLeftClip">
            <rect x="0" y="0" width="21.5" height="64" />
          </clipPath>
          <clipPath id="geniusMidClip">
            <rect x="21.5" y="0" width="21" height="64" />
          </clipPath>
          <clipPath id="geniusRightClip">
            <rect x="42.5" y="0" width="21.5" height="64" />
          </clipPath>

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

          {/* 천하장사 오렌지 머슬 그라데이션 & 글로우 */}
          <linearGradient id="hugePowerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffa726" />
            <stop offset="35%" stopColor="#ff7043" />
            <stop offset="100%" stopColor="#f4511e" />
          </linearGradient>
          <filter id="hugePowerGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.0" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

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

          {/* 민첩한 몸놀림 (깃털) 전용 그라데이션 */}
          <linearGradient id="featherBodyGrad" x1="20%" y1="20%" x2="80%" y2="80%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#f8fafc" />
            <stop offset="80%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#c7d2fe" />
          </linearGradient>
          <linearGradient id="featherUnderGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#93c5fd" />
          </linearGradient>
          <linearGradient id="quillGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="40%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
          <linearGradient id="featherEdgeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
          {/* 선택과 집중 전용 링 그라데이션 (바이올렛-퍼플 테마) */}
          <linearGradient id="choiceFocusRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>

          {/* 제로섬게임 전용 링 그라데이션 (바이올렛-퍼플 테마) */}
          <linearGradient id="zeroSumRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>


          {/* 회복 전용 그라데이션 (에메랄드/그린 테마) */}
          <linearGradient id="recoveryCrossGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="25%" stopColor="#22c55e" />
            <stop offset="70%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#14532d" />
          </linearGradient>
          <linearGradient id="recoveryCrossGradMed" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="35%" stopColor="#22c55e" />
            <stop offset="80%" stopColor="#15803d" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>
          <linearGradient id="recoveryCrossGradSmall" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bef264" />
            <stop offset="40%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
          <radialGradient id="healingAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
          <filter id="recoveryGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#22c55e" floodOpacity="0.6" />
          </filter>

          {/* 영웅의 메아리 전용 그라데이션 및 필터 */}
          <radialGradient id="echoGoldGlow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.65" />
            <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="crownGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="35%" stopColor="#fde047" />
            <stop offset="75%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="heroBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          <filter id="echoGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

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
          {/* 용 사냥꾼 전용 그라데이션 */}
          <linearGradient id="dhDragonAura" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="dhSwordBlade" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#e2e8f0" />
            <stop offset="80%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="dhSwordEdge" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="dhSlashGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="40%" stopColor="#67e8f9" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>

          {/* 최후의 전사 (녹색 마력 섬광 & 번개 대검) 전용 그라데이션 및 필터 */}
          <clipPath id="lwClip">
            <circle cx="32" cy="32" r="30" />
          </clipPath>
          <radialGradient id="lwBgGrad" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#0a2e12" />
            <stop offset="45%" stopColor="#041508" />
            <stop offset="100%" stopColor="#010603" />
          </radialGradient>
          <linearGradient id="lwBladeUpper" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#4d7c0f" />
            <stop offset="25%" stopColor="#84cc16" />
            <stop offset="60%" stopColor="#bef264" />
            <stop offset="90%" stopColor="#ecfccb" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
          <linearGradient id="lwBladeLower" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#0f3d1b" />
            <stop offset="30%" stopColor="#15803d" />
            <stop offset="65%" stopColor="#4d7c0f" />
            <stop offset="100%" stopColor="#84cc16" />
          </linearGradient>
          <linearGradient id="lwGuardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#223326" />
            <stop offset="40%" stopColor="#121e15" />
            <stop offset="100%" stopColor="#060c08" />
          </linearGradient>
          <linearGradient id="lwBronzeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5a2e0a" />
            <stop offset="45%" stopColor="#9a5b13" />
            <stop offset="85%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>
          <radialGradient id="lwGemGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#bef264" />
            <stop offset="65%" stopColor="#65a30d" />
            <stop offset="100%" stopColor="#14532d" />
          </radialGradient>
          <filter id="lwGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="lwHeavyGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="lwRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d9f99d" />
            <stop offset="35%" stopColor="#84cc16" />
            <stop offset="70%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#14532d" />
          </linearGradient>

          {/* 라스트 사무라이 (2번 이미지: 3갈래 광선 베기) & 라스트 맨 스탠딩 (1번 이미지: 명상 사무라이) 전용 그라데이션 */}
          <linearGradient id="lsMainSlashGrad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="15%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#bef264" />
            <stop offset="65%" stopColor="#84cc16" />
            <stop offset="85%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <radialGradient id="lsBgGrad" cx="75%" cy="40%" r="75%">
            <stop offset="0%" stopColor="#0e3516" />
            <stop offset="40%" stopColor="#051909" />
            <stop offset="100%" stopColor="#010502" />
          </radialGradient>
          <radialGradient id="lmsBgGrad" cx="50%" cy="45%" r="70%">
            <stop offset="0%" stopColor="#0d3817" />
            <stop offset="45%" stopColor="#05170a" />
            <stop offset="100%" stopColor="#010603" />
          </radialGradient>

          {/* 우주류 검술 (마스터 이 E: 녹색-청록색 화염 곡도 & 칼등 링) */}
          <radialGradient id="wsBgGrad" cx="35%" cy="40%" r="75%">
            <stop offset="0%" stopColor="#042a20" />
            <stop offset="45%" stopColor="#021610" />
            <stop offset="100%" stopColor="#010705" />
          </radialGradient>
          <linearGradient id="wsFlameGreen" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="45%" stopColor="#22c55e" />
            <stop offset="80%" stopColor="#84cc16" />
            <stop offset="100%" stopColor="#bef264" />
          </linearGradient>
          <linearGradient id="wsFlameCyan" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#0369a1" />
            <stop offset="45%" stopColor="#06b6d4" />
            <stop offset="80%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#67e8f9" />
          </linearGradient>
          <linearGradient id="wsBladeSpine" x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#064e3b" />
            <stop offset="35%" stopColor="#0d5f4c" />
            <stop offset="70%" stopColor="#0e7490" />
            <stop offset="100%" stopColor="#155e75" />
          </linearGradient>
          <linearGradient id="wsBladeEdge" x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="35%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#a5f3fc" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="wsRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ecfccb" />
            <stop offset="35%" stopColor="#bef264" />
            <stop offset="75%" stopColor="#65a30d" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <linearGradient id="wsBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#84cc16" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="fullRestoreBottleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="40%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>

          {/* 오른손엔 방패 왼손엔 검 (유희왕 원작 카드 1:1 완벽 재현) 전용 그라데이션 & 필터 */}
          <clipPath id="ssCircleClip">
            <circle cx="32" cy="32" r="29.2" />
          </clipPath>
          <radialGradient id="vortexBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
          <linearGradient id="bronzeKnight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b45309" />
            <stop offset="35%" stopColor="#92400e" />
            <stop offset="70%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
          <radialGradient id="shieldGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#92400e" />
            <stop offset="50%" stopColor="#5a2408" />
            <stop offset="100%" stopColor="#260e03" />
          </radialGradient>
          <linearGradient id="swordBlade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="30%" stopColor="#d97706" />
            <stop offset="50%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
          <radialGradient id="atkSphere" cx="35%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="18%" stopColor="#fed7aa" />
            <stop offset="42%" stopColor="#f97316" />
            <stop offset="78%" stopColor="#c2410c" />
            <stop offset="100%" stopColor="#6c1a06" />
          </radialGradient>
          <radialGradient id="defSphere" cx="35%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="18%" stopColor="#bfdbfe" />
            <stop offset="42%" stopColor="#3b82f6" />
            <stop offset="78%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#0f2b70" />
          </radialGradient>
          <linearGradient id="topArrowGrad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="50%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="bottomArrowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>

          {/* 과거의 영광 (클래식 게임보이 DMG-01) 전용 그라데이션 */}
          <linearGradient id="dmgBody" x1="20%" y1="10%" x2="80%" y2="90%">
            <stop offset="0%" stopColor="#e5e7e0" />
            <stop offset="45%" stopColor="#dbddd5" />
            <stop offset="100%" stopColor="#c8cac2" />
          </linearGradient>
          <linearGradient id="dmgDepth" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a3a59c" />
            <stop offset="50%" stopColor="#878980" />
            <stop offset="100%" stopColor="#63655c" />
          </linearGradient>
          <linearGradient id="dmgBezel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#696b79" />
            <stop offset="50%" stopColor="#555765" />
            <stop offset="100%" stopColor="#41434f" />
          </linearGradient>
          <linearGradient id="dmgLcd" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a7cc23" />
            <stop offset="40%" stopColor="#9bbc0f" />
            <stop offset="85%" stopColor="#8cad12" />
            <stop offset="100%" stopColor="#75940c" />
          </linearGradient>
          <linearGradient id="dmgBtn" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="35%" stopColor="#be123c" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>
          {/* 신을 제물로 (오벨리스크의 거신병) 전용 그라데이션 */}
          <radialGradient id="obeliskAura" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#0369a1" />
            <stop offset="45%" stopColor="#082f49" />
            <stop offset="85%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
          <linearGradient id="obeliskMuscle" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="40%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#034875" />
          </linearGradient>
          <linearGradient id="obeliskBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="30%" stopColor="#0284c7" />
            <stop offset="70%" stopColor="#075985" />
            <stop offset="100%" stopColor="#082f49" />
          </linearGradient>
          <linearGradient id="obeliskArmDark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="60%" stopColor="#0c4a6e" />
            <stop offset="100%" stopColor="#082f49" />
          </linearGradient>
          <filter id="rubyEyeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* 영혼의 심복 (푸른 눈의 백룡) 전용 테두리 및 배경 그라데이션 */}
          <radialGradient id="soulMinionBg" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#183b6c" />
            <stop offset="60%" stopColor="#0e2c58" />
            <stop offset="100%" stopColor="#07172e" />
          </radialGradient>
          <linearGradient id="soulMinionRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          {/* 신을 제물로 (오벨리스크의 거신병) 전용 배경 및 테두리 그라데이션 */}
          <radialGradient id="sacrificeGodBg" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#183b6c" />
            <stop offset="60%" stopColor="#0e2c58" />
            <stop offset="100%" stopColor="#07172e" />
          </radialGradient>
          <linearGradient id="sacrificeGodRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="45%" stopColor="#0284c7" />
            <stop offset="85%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* 곰 3마리 및 곰 버프 전용 그라데이션 */}
          <radialGradient id="threeBearsBg" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="60%" stopColor="#451a03" />
            <stop offset="100%" stopColor="#1c0d02" />
          </radialGradient>
          <filter id="inversionGlowSun" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#f59e0b" floodOpacity="0.8" />
          </filter>
          <filter id="inversionGlowMega" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#38bdf8" floodOpacity="0.8" />
          </filter>
          <linearGradient id="inversionBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0b1120" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="inversionArrowSun" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <linearGradient id="inversionArrowMega" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="35%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="inversionRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          <linearGradient id="soulDiceRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          <filter id="stickyWebGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#a3e635" floodOpacity="0.75" />
          </filter>
          <radialGradient id="stickyWebBgGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#064e3b" stopOpacity="0.85" />
            <stop offset="65%" stopColor="#022c22" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#02140e" />
          </radialGradient>
          <linearGradient id="stickyWebRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="40%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="stickyWebSilkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#d9f99d" />
            <stop offset="100%" stopColor="#bef264" />
          </linearGradient>

          <linearGradient id="intimidateRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="40%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>

          <linearGradient id="threeBearsRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="40%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <radialGradient id="oneBearBg" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#6c3614" />
            <stop offset="70%" stopColor="#3d1b06" />
            <stop offset="100%" stopColor="#1c0b02" />
          </radialGradient>
          <linearGradient id="oneBearRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          <radialGradient id="twoBearsBg" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#3b3b4f" />
            <stop offset="60%" stopColor="#222233" />
            <stop offset="100%" stopColor="#101018" />
          </radialGradient>
          <linearGradient id="twoBearsRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>

          <radialGradient id="threeBearsBuffBg" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#854d0e" />
            <stop offset="55%" stopColor="#5c330a" />
            <stop offset="100%" stopColor="#251201" />
          </radialGradient>
          <linearGradient id="threeBearsBuffRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#a16207" />
          </linearGradient>
          <linearGradient id="threeBearsHouseRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* 베이스 배경 원 */}
        {id !== "infinityEdge" && id !== "rabadonsDeathcap" && id !== "voidStaff" && id !== "ludensEcho" && id !== "collector" && id !== "practiceMakesCritical" && id !== "thornmail" && id !== "bladeOfTheRuinedKing" && id !== "sunfireAegis" && id !== "warmogsArmor" && id !== "giantAbsorption" && id !== "mejaisSoulstealer" && id !== "lastWarrior" && id !== "lastSamurai" && id !== "lastManStanding" && id !== "wujuStyle" && id !== "soulMinion" && id !== "sacrificeGod" && id !== "highRiskCurse" && id !== "swordAndShield" && id !== "threeBearsHouse" && id !== "threeBears" && id !== "oneBear" && id !== "twoBears" && id !== "threeBearsBuff" && id !== "axeOfDespair" && id !== "powerOfKing" && id !== "threeThousandYears" && id !== "rush" && id !== "growUp" && id !== "spiritVisage" && id !== "geniusOfTransformation" && id !== "butItRefused" && id !== "arcaneShadeSword" && id !== "greatTuskSoul" && id !== "starforce" && id !== "cleanSlateScroll" && id !== "cube" && id !== "choiceAndFocus" && id !== "zeroSumGame" && <circle cx="32" cy="32" r="30" fill="url(#bgGlow)" stroke="url(#prismRing)" strokeWidth="1.5" strokeOpacity="0.7" />}
        {id === "highRiskCurse" && <circle cx="32" cy="32" r="30" fill="url(#banDarkBg)" stroke="url(#banRedGrad)" strokeWidth="1.6" strokeOpacity="0.9" />}

        {/* 최후의 전사 (원본 일러스트 이미지 + 원형 클리핑 & 라임-에메랄드 링 테두리) */}
        {id === "lastWarrior" && (
          <g clipPath="url(#lwClip)">
            <image href="/pokemon/img/augment/lastWarrior.png" x="1" y="1" width="62" height="62" preserveAspectRatio="xMidYMid slice" />
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="url(#lwRingGrad)" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="28.2" fill="none" stroke="#bef264" strokeWidth="0.5" strokeOpacity="0.4" />
          </g>
        )}

        {/* 라스트 사무라이 (원본 일러스트 이미지 + 원형 클리핑 & 라임-에메랄드 링 테두리) */}
        {id === "lastSamurai" && (
          <g clipPath="url(#lwClip)">
            <image href="/pokemon/img/augment/lastSamurai.png" x="1" y="1" width="62" height="62" preserveAspectRatio="xMidYMid slice" />
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="url(#lwRingGrad)" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="28.2" fill="none" stroke="#bef264" strokeWidth="0.5" strokeOpacity="0.4" />
          </g>
        )}

        {/* 라스트 맨 스탠딩 (원본 일러스트 이미지 + 원형 클리핑 & 라임-에메랄드 링 테두리) */}
        {id === "lastManStanding" && (
          <g clipPath="url(#lwClip)">
            <image href="/pokemon/img/augment/lastManStanding.png?v=2" x="1" y="1" width="62" height="62" preserveAspectRatio="xMidYMid slice" />
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="url(#lwRingGrad)" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="28.2" fill="none" stroke="#bef264" strokeWidth="0.5" strokeOpacity="0.4" />
          </g>
        )}

        {/* 우주류 검술 (원본 일러스트 이미지 + 원형 클리핑 & 라임-그린-시안 링 테두리) */}
        {id === "wujuStyle" && (
          <g clipPath="url(#lwClip)">
            <image href="/pokemon/img/augment/wujuStyle.png" x="1" y="1" width="62" height="62" preserveAspectRatio="xMidYMid slice" />
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="url(#wsBorderGrad)" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="28.2" fill="none" stroke="#67e8f9" strokeWidth="0.5" strokeOpacity="0.4" />
          </g>
        )}

        {/* 진화의 휘석 */}
        {id === "eviolite" && (
          <g>
            <circle cx="32" cy="32" r="22" fill="#ec4899" opacity="0.22" filter="url(#glow)" />
            <circle cx="32" cy="32" r="16" fill="#a855f7" opacity="0.28" filter="url(#glow)" />
            <image href="/pokemon/img/item/진화의휘석.webp" x="7" y="7" width="50" height="50" style={{ filter: "drop-shadow(0 0 6px rgba(244, 114, 182, 0.7)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8))" }} />
            <path d="M 49 14 Q 49 16.5 51.5 16.5 Q 49 16.5 49 14 Z" fill="#fdf2f8" opacity="0.95" />
            <circle cx="15" cy="46" r="1.2" fill="#f472b6" opacity="0.85" />
            <circle cx="48" cy="45" r="1" fill="#c084fc" opacity="0.85" />
          </g>
        )}

        {/* 마음의물방울 (라티아스/라티오스 전용 증강) */}
        {id === "soulDew" && (
          <g>
            <circle cx="27" cy="27" r="16" fill="#f43f5e" opacity="0.18" filter="url(#glow)" />
            <circle cx="37" cy="37" r="16" fill="#3b82f6" opacity="0.22" filter="url(#glow)" />
            <image href="/pokemon/img/item/마음의물방울.webp" x="8" y="8" width="48" height="48" style={{ filter: "drop-shadow(0 0 5px rgba(56, 189, 248, 0.6))" }} />
            <path d="M 49 14 Q 49 16.5 51.5 16.5 Q 49 16.5 49 19 Q 49 16.5 49 14 Z" fill="#e0f2fe" opacity="0.95" />
            <circle cx="15" cy="46" r="1.1" fill="#f472b6" opacity="0.85" />
            <circle cx="48" cy="45" r="0.8" fill="#67e8f9" opacity="0.85" />
          </g>
        )}

        {/* 용 사냥꾼 / 드래곤 슬레이어 / 용살자 / 용용 죽겠지 (회색 대검 & 파란 코등이/손잡이 & 붉은 용 엠블럼) */}
        {(id === "dragonHunter" || id === "dragonSlayer" || id === "dragonKiller" || id === "dragonDie") && (
          <g>
            {/* 1. 배후 크림슨 & 플레임 레드 드래곤 마력 아우라 */}
            <circle cx="32" cy="32" r="23" fill="#ef4444" opacity="0.18" filter="url(#glow)" />
            <circle cx="32" cy="24" r="14" fill="#3b82f6" opacity="0.16" filter="url(#glow)" />

            {/* 2. 엠블럼 이미지 */}
            <image href="/pokemon/img/augment/dragonHunter.png" x="5.5" y="5.5" width="53" height="53" style={{ filter: "drop-shadow(0 0 4px rgba(239, 68, 68, 0.45))" }} />

            {/* 3. 파란 코등이/손잡이 보석 광채 & 회색 칼날 엣지 & 붉은 용 스파클 */}
            <path d="M 32 8 Q 32 10.5 34 10.5 Q 32 10.5 32 13 Q 32 10.5 30 10.5 Q 32 10.5 32 8 Z" fill="#60a5fa" opacity="0.95" />
            <path d="M 54 28 Q 54 30 56 30 Q 54 30 54 32 Q 54 30 52 30 Q 54 30 54 28 Z" fill="#ff4d4d" opacity="0.9" />
            <path d="M 10 28 Q 10 30 12 30 Q 10 30 10 32 Q 10 30 8 30 Q 10 30 10 28 Z" fill="#ff4d4d" opacity="0.9" />
            <circle cx="23" cy="41" r="1" fill="#facc15" opacity="0.9" />
            <circle cx="32" cy="55" r="1" fill="#e2e8f0" opacity="0.9" />
          </g>
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

        {/* 3. 인생은 한방 & 모 아니면 도 & 랜덤 특성 & 도박 중독 (입체 주사위 & 회오리 마법 스파크) */}
        {(id === "lifeIsOneShot" || id === "allOrNothing" || id === "randomAbility" || id === "gamblingAddict") && (
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
            <circle cx="36.2" cy="39.1" r="1.5" fill="#ffffff" />
            <circle cx="39" cy="34.5" r="1.5" fill="#ffffff" />
            <circle cx="41.8" cy="29.9" r="1.5" fill="#ffffff" />
            {/* ✦ 스파클 */}
            <path d="M49 14 Q49 17 52 17 Q49 17 49 20 Q49 17 46 17 Q49 17 49 14 Z" fill="#fef08a" />
            <path d="M14 44 Q14 47 17 47 Q14 47 14 50 Q14 47 11 47 Q14 47 14 44 Z" fill="#38bdf8" />
          </g>
        )}

        {/* 순풍 (민첩한 몸놀림 기반 제갈량 깃털부채 백우선 & 가속 모션) */}
        {id === "tailwind" && (
          <g>
            {/* 1. 후면 은은한 하늘빛 오라 & 바람 궤적 (민첩한 몸놀림 스타일) */}
            <g filter="url(#glow)">
              <circle cx="34" cy="28" r="18" fill="#38bdf8" fillOpacity="0.18" />
              <path d="M 9 36 C 11 21 23 11 39 9" stroke="#38bdf8" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.7" strokeDasharray="9 4" />
              <path d="M 23 55 C 37 57 51 49 57 35" stroke="#67e8f9" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.65" strokeDasharray="8 4" />
            </g>

            {/* 2. 제갈량 백우선 본체 (선명한 윤곽선과 5갈래 부챗살로 뭉개짐 없이 또렷한 부채꼴) */}
            <g transform="translate(30.5, 32.5) rotate(42) translate(-32, -32)">
              {/* (A) 최외곽 좌측 깃털 (-46도) */}
              <g transform="translate(32, 42) rotate(-46) scale(0.86) translate(-32, -42)">
                <path d="M 32 42 C 29.5 36, 26.8 27, 26.5 19 C 26.4 14.5, 28.6 10.5, 32 9.5 C 35.4 10.5, 37.6 14.5, 37.5 19 L 35.6 20.5 L 37.2 21.6 C 36.6 28, 34.5 36, 32 42 Z" fill="url(#featherUnderGrad)" stroke="#0284c7" strokeWidth="1.25" strokeLinejoin="round" />
                <path d="M 32 40 L 32 12" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M 32 26 L 28.5 23 M 32 20 L 28.5 17 M 32 27 L 35.5 24" stroke="#60a5fa" strokeWidth="0.75" strokeLinecap="round" opacity="0.75" />
              </g>

              {/* (B) 최외곽 우측 깃털 (+46도) */}
              <g transform="translate(32, 42) rotate(46) scale(0.86) translate(-32, -42)">
                <path d="M 32 42 C 29.5 36, 26.8 27, 26.5 19 C 26.4 14.5, 28.6 10.5, 32 9.5 C 35.4 10.5, 37.6 14.5, 37.5 19 L 35.6 20.5 L 37.2 21.6 C 36.6 28, 34.5 36, 32 42 Z" fill="url(#featherUnderGrad)" stroke="#0284c7" strokeWidth="1.25" strokeLinejoin="round" />
                <path d="M 32 40 L 32 12" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M 32 26 L 28.5 23 M 32 27 L 35.5 24 M 32 20 L 35.5 17" stroke="#60a5fa" strokeWidth="0.75" strokeLinecap="round" opacity="0.75" />
              </g>

              {/* (C) 내측 좌측 깃털 (-23도) */}
              <g transform="translate(32, 42) rotate(-23) scale(0.94) translate(-32, -42)">
                <path d="M 32 42 C 29.5 36, 26.8 27, 26.5 19 C 26.4 14.5, 28.6 10.5, 32 9.5 C 35.4 10.5, 37.6 14.5, 37.5 19 L 35.6 20.5 L 37.2 21.6 C 36.6 28, 34.5 36, 32 42 Z" fill="url(#featherBodyGrad)" stroke="#0284c7" strokeWidth="1.25" strokeLinejoin="round" />
                <path d="M 32 39 C 30.2 33, 28.2 25, 28 18.5 C 28 15, 29.6 11.5, 32 10.8 C 33.5 11.3, 34.8 13.5, 35.2 16.5 C 33.5 23, 32.5 31, 32 39 Z" fill="#ffffff" fillOpacity="0.65" />
                <path d="M 32 40 L 32 11.5" stroke="#38bdf8" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M 32 40 L 32 11.5" stroke="#ffffff" strokeWidth="0.65" strokeLinecap="round" />
                <path d="M 32 27 L 28.3 24 M 32 21 L 28.3 18 M 32 25 L 35.7 22 M 32 19 L 35.5 16" stroke="#93c5fd" strokeWidth="0.75" strokeLinecap="round" opacity="0.85" />
              </g>

              {/* (D) 내측 우측 깃털 (+23도) */}
              <g transform="translate(32, 42) rotate(23) scale(0.94) translate(-32, -42)">
                <path d="M 32 42 C 29.5 36, 26.8 27, 26.5 19 C 26.4 14.5, 28.6 10.5, 32 9.5 C 35.4 10.5, 37.6 14.5, 37.5 19 L 35.6 20.5 L 37.2 21.6 C 36.6 28, 34.5 36, 32 42 Z" fill="url(#featherBodyGrad)" stroke="#0284c7" strokeWidth="1.25" strokeLinejoin="round" />
                <path d="M 32 39 C 30.2 33, 28.2 25, 28 18.5 C 28 15, 29.6 11.5, 32 10.8 C 33.5 11.3, 34.8 13.5, 35.2 16.5 C 33.5 23, 32.5 31, 32 39 Z" fill="#ffffff" fillOpacity="0.65" />
                <path d="M 32 40 L 32 11.5" stroke="#38bdf8" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M 32 40 L 32 11.5" stroke="#ffffff" strokeWidth="0.65" strokeLinecap="round" />
                <path d="M 32 27 L 28.3 24 M 32 21 L 28.3 18 M 32 25 L 35.7 22 M 32 19 L 35.5 16" stroke="#93c5fd" strokeWidth="0.75" strokeLinecap="round" opacity="0.85" />
              </g>

              {/* (E) 정중앙 메인 깃털 (0도) */}
              <g>
                <path d="M 32 42 C 29.3 36, 26.5 27, 26.2 18.5 C 26.1 14, 28.5 9.8, 32 8.8 C 35.5 9.8, 37.9 14, 37.8 18.5 L 35.8 20.2 L 37.5 21.4 C 36.8 28, 34.7 36, 32 42 Z" fill="url(#featherBodyGrad)" stroke="#0284c7" strokeWidth="1.3" strokeLinejoin="round" />
                <path d="M 32 39 C 30 33, 28 24.5, 27.8 18 C 27.8 14.5, 29.5 10.8, 32 10 C 33.6 10.6, 35 13, 35.4 16 C 33.6 22.5, 32.5 31, 32 39 Z" fill="#ffffff" fillOpacity="0.75" />
                <path d="M 32 41 L 32 10.8" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 32 41 L 32 10.8" stroke="#ffffff" strokeWidth="0.75" strokeLinecap="round" />
                <path d="M 32 28 L 28 24.5 M 32 22 L 28 18.5 M 32 16 L 29 13.5 M 32 26 L 36 22.5 M 32 19 L 35.5 16" stroke="#93c5fd" strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
              </g>

              {/* (F) 부채 손잡이 & 부채목 결속부 (민첩한 몸놀림 깃대 톤으로 무난하고 깔끔하게) */}
              <path d="M 32 42.5 L 32 54.5" stroke="#0284c7" strokeWidth="3.4" strokeLinecap="round" />
              <path d="M 32 42.5 L 32 54.5" stroke="#67e8f9" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M 32 42.5 L 32 54.5" stroke="#ffffff" strokeWidth="0.9" strokeLinecap="round" />
              <path d="M 27.2 40.2 Q 32 38 36.8 40.2 L 34.4 43.5 Q 32 42.5 29.6 43.5 Z" fill="url(#featherUnderGrad)" stroke="#0284c7" strokeWidth="1.15" strokeLinejoin="round" />
              <path d="M 28.5 40.8 Q 32 39.2 35.5 40.8" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" fill="none" />
            </g>

            {/* 3. 스파클 파티클 (민첩한 몸놀림과 동일한 골드 & 시안 스파클) */}
            <g filter="url(#glow)">
              <path d="M 52 9 Q 52 12 55 12 Q 52 12 52 15 Q 52 12 49 12 Q 52 12 52 9 Z" fill="#fef08a" />
              <path d="M 13 22 Q 13 24.5 15.5 24.5 Q 13 24.5 13 27 Q 13 24.5 10.5 24.5 Q 13 24.5 13 22 Z" fill="#67e8f9" />
              <circle cx="51" cy="22" r="1.2" fill="#ffffff" opacity="0.9" />
              <circle cx="20" cy="15" r="1.1" fill="#38bdf8" opacity="0.85" />
              <circle cx="45" cy="44" r="1.2" fill="#67e8f9" opacity="0.75" />
              <circle cx="28" cy="50" r="0.9" fill="#ffffff" opacity="0.8" />
            </g>
          </g>
        )}

        {/* 스텔스록 (공중에 부유하는 날카로운 뾰족 암석들과 바위 기운) */}
        {id === "stealthRock" && (
          <g>
            {/* 1. 후면 바위 타입 마력 / 대지 오라 & 스파크 */}
            <g filter="url(#glow)">
              <circle cx="32" cy="32" r="19" fill="#d97706" fillOpacity="0.18" />
              <circle cx="32" cy="32" r="13" fill="#b45309" fillOpacity="0.15" />
              <path d="M 12 36 C 14 20 26 13 46 14" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" strokeDasharray="7 4" />
              <path d="M 18 50 C 34 54 50 46 52 30" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" strokeDasharray="6 4" />
            </g>

            {/* 2. 중앙 메인 날카로운 뾰족 바위 */}
            <g transform="translate(32, 32) rotate(-15) translate(-32, -32)">
              <polygon points="32,10 42,27 38,48 26,48 22,27" fill="#451a03" stroke="#78350f" strokeWidth="1.2" strokeLinejoin="round" />
              <polygon points="32,10 22,27 26,48 32,38" fill="#78350f" stroke="#92400e" strokeWidth="0.8" />
              <polygon points="32,10 42,27 38,48 32,38" fill="#b45309" stroke="#d97706" strokeWidth="0.8" />
              <polygon points="32,10 36,25 32,38 28,25" fill="#f59e0b" />
              <line x1="32" y1="10" x2="32" y2="38" stroke="#fef3c7" strokeWidth="1.1" strokeLinecap="round" opacity="0.9" />
              <line x1="32" y1="10" x2="22" y2="27" stroke="#fde68a" strokeWidth="0.8" opacity="0.75" />
              <line x1="32" y1="10" x2="42" y2="27" stroke="#fde68a" strokeWidth="0.8" opacity="0.75" />
            </g>

            {/* 3. 좌측 공중 부유하는 날카로운 바위 파편 */}
            <g transform="translate(18, 26) rotate(25) translate(-18, -26)">
              <polygon points="18,17 23,26 21,34 15,34 13,26" fill="#78350f" stroke="#92400e" strokeWidth="1" strokeLinejoin="round" />
              <polygon points="18,17 13,26 15,34 18,30" fill="#92400e" />
              <polygon points="18,17 23,26 21,34 18,30" fill="#d97706" />
              <polygon points="18,17 20,25 18,30 16,25" fill="#fbbf24" />
              <line x1="18" y1="17" x2="18" y2="30" stroke="#fef3c7" strokeWidth="0.9" strokeLinecap="round" opacity="0.85" />
            </g>

            {/* 4. 우측 공중 부유하는 날카로운 바위 파편 */}
            <g transform="translate(47, 36) rotate(-35) translate(-47, -36)">
              <polygon points="47,25 53,36 50,45 44,45 41,36" fill="#78350f" stroke="#92400e" strokeWidth="1" strokeLinejoin="round" />
              <polygon points="47,25 41,36 44,45 47,40" fill="#92400e" />
              <polygon points="47,25 53,36 50,45 47,40" fill="#d97706" />
              <polygon points="47,25 49,34 47,40 45,34" fill="#fbbf24" />
              <line x1="47" y1="25" x2="47" y2="40" stroke="#fef3c7" strokeWidth="0.9" strokeLinecap="round" opacity="0.85" />
            </g>

            {/* 5. 주변 궤도를 도는 작은 미세 파편들 */}
            <polygon points="25,48 28,49 26,53 23,51" fill="#b45309" stroke="#d97706" strokeWidth="0.7" />
            <polygon points="44,18 47,20 45,23 42,21" fill="#d97706" stroke="#f59e0b" strokeWidth="0.7" />
            <polygon points="14,42 16,43 15,46 13,44" fill="#92400e" stroke="#b45309" strokeWidth="0.6" />

            {/* 6. 바위 섬광 및 에너지 스파크 */}
            <g filter="url(#glow)">
              <path d="M 32 6 Q 32 8.5 34.5 8.5 Q 32 8.5 32 11 Q 32 8.5 29.5 8.5 Q 32 8.5 32 6 Z" fill="#fef08a" />
              <path d="M 49 14 Q 49 16 51 16 Q 49 16 49 18 Q 49 16 47 16 Q 49 16 49 14 Z" fill="#fbbf24" />
              <circle cx="16" cy="18" r="1.1" fill="#fef3c7" opacity="0.9" />
              <circle cx="51" cy="46" r="1.0" fill="#f59e0b" opacity="0.85" />
              <circle cx="28" cy="54" r="0.9" fill="#fbbf24" opacity="0.8" />
            </g>
          </g>
        )}

        {/* 끈적끈적네트 (블루/아이스 거미줄 일러스트 + 원형 클리핑 & 시안/블루 링) */}
        {id === "stickyWeb" && (
          <g clipPath="url(#lwClip)">
            <image href="/pokemon/img/augment/stickyWeb.png" x="1" y="1" width="62" height="62" preserveAspectRatio="xMidYMid slice" />
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="url(#stickyWebRingGrad)" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="28.2" fill="none" stroke="#7dd3fc" strokeWidth="0.5" strokeOpacity="0.75" />
          </g>
        )}

        {/* 포켓몬과 결혼한 사람이 있었다 (황금 웨딩 링과 빛나는 루비 하트 & 다이아몬드 스파클) */}
        {id === "marriedPokemon" && (
          <g filter="url(#glow)" transform="translate(0, 4.5)">
            {/* 배경 은은한 하트 오라 */}
            <circle cx="32" cy="32" r="26" fill="url(#heartSoftGlow)" />

            {/* 황금빛 웨딩 링 (반지) 후면 */}
            <ellipse cx="32" cy="34" rx="24" ry="11" transform="rotate(-15 32 34)" stroke="url(#heartGoldGrad)" strokeWidth="2.8" fill="none" opacity="0.8" />

            {/* 메인 루비 하트 */}
            <path d="M32 51 C17 40 9 29.5 9 20.5 A 11.5 11.5 0 0 1 32 16 A 11.5 11.5 0 0 1 55 20.5 C 55 29.5 47 40 32 51 Z" fill="url(#heartPinkGrad)" stroke="#ffffff" strokeWidth="1.2" strokeLinejoin="round" />

            {/* 하트 좌상단 부드러운 반사광 하이라이트 */}
            <path d="M17 19.5 C17 15 23 15 27 17 C22 17.5 19 21 17 25 C16.7 22.5 16.8 20.5 17 19.5 Z" fill="#ffffff" fillOpacity="0.55" />

            {/* 황금빛 웨딩 링 (반지) 전면 겹침 입체감 */}
            <path d="M11 39 C18 45 42 43 51 31" stroke="url(#heartGoldGrad)" strokeWidth="2.8" strokeLinecap="round" fill="none" />

            {/* 웨딩 링 보석/다이아몬드 (상단 우측) */}
            <polygon points="50,22 53,18 57,20 54,24" fill="#ffffff" stroke="url(#heartGoldGrad)" strokeWidth="1" />
            {/* 다이아몬드 십자 스파클 */}
            <path d="M53.5 14 Q53.5 19 58.5 19 Q53.5 19 53.5 24 Q53.5 19 48.5 19 Q53.5 19 53.5 14 Z" fill="#ffffff" />
            <circle cx="53.5" cy="19" r="1.5" fill="#fef08a" />

            {/* 주변 흩날리는 미니 하트 */}
            <path d="M13 18 C9 15 7 12 7 9 A 3 3 0 0 1 13 8 A 3 3 0 0 1 19 9 C 19 12 17 15 13 18 Z" fill="url(#heartPinkGrad)" transform="scale(0.65) translate(3, 5)" opacity="0.85" />
            {/* 좌하단 골드 스파클 */}
            <path d="M12 43 Q12 46 15 46 Q12 46 12 49 Q12 46 9 46 Q12 46 12 43 Z" fill="#fef08a" />
          </g>
        )}

        {/* 변환자재 (에이스번, 마스카나, 개굴닌자 가로 3분할 원형 아이콘) */}
        {id === "geniusOfTransformation" && (
          <g>
            <g clipPath="url(#lwClip)">
              {/* 좌측 1/3: 에이스번 */}
              <g clipPath="url(#geniusLeftClip)">
                <rect x="0" y="0" width="21.5" height="64" fill="#3c1419" />
                <image href="/pokemon/img/pokemon/0815.webp" x="-13.5" y="4" width="52" height="52" preserveAspectRatio="xMidYMid meet" />
              </g>
              {/* 중앙 1/3: 마스카나 */}
              <g clipPath="url(#geniusMidClip)">
                <rect x="21.5" y="0" width="21" height="64" fill="#0f3220" />
                <image href="/pokemon/img/pokemon/0908.webp" x="5.5" y="3" width="52" height="52" preserveAspectRatio="xMidYMid meet" />
              </g>
              {/* 우측 1/3: 개굴닌자 */}
              <g clipPath="url(#geniusRightClip)">
                <rect x="42.5" y="0" width="21.5" height="64" fill="#0f2341" />
                <image href="/pokemon/img/pokemon/0658.webp" x="25.5" y="-7" width="54" height="54" preserveAspectRatio="xMidYMid meet" />
              </g>
              {/* 3분할 구분선 */}
              <line x1="21.5" y1="0" x2="21.5" y2="64" stroke="#94a3b8" strokeOpacity="0.85" strokeWidth="1" />
              <line x1="42.5" y1="0" x2="42.5" y2="64" stroke="#94a3b8" strokeOpacity="0.85" strokeWidth="1" />
            </g>
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="url(#prismRing)" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="28.2" fill="none" stroke="#60a5fa" strokeWidth="0.5" strokeOpacity="0.75" />
          </g>
        )}

        {/* 인생의 동반자 (다정하게 포개어진 트윈 하트 & 영혼의 유대 스파클) */}
        {id === "lifePartner" && (
          <g filter="url(#glow)">
            {/* 배경 은은한 웜핑크 오라 */}
            <circle cx="32" cy="32" r="26" fill="url(#heartSoftGlow)" />

            {/* 뒤쪽 골드-코랄 하트 */}
            <path d="M39 48 C27 39 20 31 20 23 A 9.5 9.5 0 0 1 39 19 A 9.5 9.5 0 0 1 56 23 C 56 31 49 39 39 48 Z" fill="url(#heartGoldGrad)" stroke="#ffffff" strokeWidth="1.2" strokeLinejoin="round" opacity="0.95" />

            {/* 앞쪽 루비-로즈 핑크 하트 */}
            <path d="M26 52 C13 42 6 32 6 23.5 A 10.5 10.5 0 0 1 26 19.5 A 10.5 10.5 0 0 1 46 23.5 C 46 32 39 42 26 52 Z" fill="url(#heartPinkGrad)" stroke="#ffffff" strokeWidth="1.2" strokeLinejoin="round" />

            {/* 앞쪽 하트 광택 하이라이트 */}
            <path d="M13 22 C13 18 18 18 22 20 C18 20.5 15 23.5 13 27 C12.8 24.5 12.9 23 13 22 Z" fill="#ffffff" fillOpacity="0.55" />

            {/* 두 하트 사이 중앙 유대 십자 스파클 (영혼의 공명) */}
            <path d="M36 29 Q36 33 40 33 Q36 33 36 37 Q36 33 32 33 Q36 33 36 29 Z" fill="#ffffff" />
            <circle cx="36" cy="33" r="1.5" fill="#fef08a" />

            {/* 상단 쁘띠 하트 */}
            <path d="M48 13 C45 10 43 8 43 6 A 2.2 2.2 0 0 1 48 5 A 2.2 2.2 0 0 1 53 6 C 53 8 51 10 48 13 Z" fill="#ffffff" opacity="0.9" />

            {/* 좌하단/우하단 미세 반짝임 */}
            <path d="M10 44 Q10 46 12 46 Q10 46 10 48 Q10 46 8 46 Q10 46 10 44 Z" fill="#ffe259" />
            <path d="M53 43 Q53 45 55 45 Q53 45 53 47 Q53 45 51 45 Q53 45 53 43 Z" fill="#ffffff" />
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

        {/* 5. 오른손엔 방패 왼손엔 검 (유희왕 원작 카드 일러스트 1:1 완벽 구현) */}
        {id === "swordAndShield" && (
          <g>
            {/* 원형 테두리 내부 클리핑 그룹 */}
            <g clipPath="url(#ssCircleClip)">
              {/* (A) 원작 카드 배경: 짙은 푸른 보텍스 & 방사형 스피드라인 광선 */}
              <rect x="0" y="0" width="64" height="64" fill="url(#vortexBg)" />
              <g opacity="0.38">
                <line x1="32" y1="32" x2="4" y2="10" stroke="#38bdf8" strokeWidth="1.2" />
                <line x1="32" y1="32" x2="60" y2="10" stroke="#38bdf8" strokeWidth="1.2" />
                <line x1="32" y1="32" x2="10" y2="58" stroke="#38bdf8" strokeWidth="1.2" />
                <line x1="32" y1="32" x2="54" y2="58" stroke="#38bdf8" strokeWidth="1.2" />
                <line x1="32" y1="32" x2="2" y2="32" stroke="#60a5fa" strokeWidth="1.4" />
                <line x1="32" y1="32" x2="62" y2="32" stroke="#60a5fa" strokeWidth="1.4" />
                <line x1="32" y1="32" x2="32" y2="2" stroke="#60a5fa" strokeWidth="1.4" />
                <line x1="32" y1="32" x2="32" y2="62" stroke="#60a5fa" strokeWidth="1.4" />
                <line x1="32" y1="32" x2="18" y2="4" stroke="#38bdf8" strokeWidth="1.0" />
                <line x1="32" y1="32" x2="46" y2="4" stroke="#38bdf8" strokeWidth="1.0" />
                <line x1="32" y1="32" x2="18" y2="60" stroke="#38bdf8" strokeWidth="1.0" />
                <line x1="32" y1="32" x2="46" y2="60" stroke="#38bdf8" strokeWidth="1.0" />
              </g>

              {/* (B) 중앙 청동 기사 (Horned Knight) */}
              <g>
                {/* 1. 좌측 방패 (타원형 대형 쉴드) */}
                <ellipse cx="14" cy="34" rx="7.5" ry="17" fill="url(#shieldGrad)" stroke="#b45309" strokeWidth="1.4" transform="rotate(-6 14 34)" />
                <ellipse cx="14" cy="34" rx="5.5" ry="14" fill="none" stroke="#f59e0b" strokeWidth="0.8" opacity="0.75" transform="rotate(-6 14 34)" />
                <path d="M 14 20 L 14 48 M 8.5 34 L 19.5 34" stroke="#d97706" strokeWidth="0.9" opacity="0.7" />

                {/* 2. 우측 대검 (곧게 세운 브로드소드) */}
                <path d="M 51.5 9.5 L 54.5 16 L 53.5 44 L 49.5 44 L 48.5 16 Z" fill="url(#swordBlade)" stroke="#92400e" strokeWidth="0.8" />
                <line x1="51.5" y1="10" x2="51.5" y2="44" stroke="#fef08a" strokeWidth="0.8" opacity="0.85" />
                <path d="M 45.5 44 C 48.5 43 54.5 43 57.5 44 L 56.5 46.5 L 46.5 46.5 Z" fill="#d97706" stroke="#78350f" strokeWidth="0.7" />
                <rect x="50.3" y="46.5" width="2.4" height="6.5" rx="0.5" fill="#451a03" stroke="#260e03" strokeWidth="0.5" />
                <circle cx="51.5" cy="54" r="1.9" fill="#d97706" stroke="#78350f" strokeWidth="0.7" />
                <rect x="48.5" y="47.5" width="6" height="4.5" rx="1.2" fill="#78350f" stroke="#451a03" strokeWidth="0.6" />

                {/* 3. 기사 본체 (흉갑 & 투구) */}
                <path d="M 21 27 C 21 21 26 21 28 27 L 27 34 L 19 32 Z" fill="url(#bronzeKnight)" stroke="#451a03" strokeWidth="0.7" />
                <path d="M 43 27 C 43 21 38 21 36 27 L 37 34 L 45 32 Z" fill="url(#bronzeKnight)" stroke="#451a03" strokeWidth="0.7" />
                <path d="M 25 26 C 28 24 36 24 39 26 L 41 42 C 37 45 27 45 23 42 Z" fill="url(#bronzeKnight)" stroke="#451a03" strokeWidth="0.8" />
                <path d="M 32 26 L 32 42 M 27 33 Q 32 37 37 33 M 28 38 Q 32 41 36 38" fill="none" stroke="#d97706" strokeWidth="0.9" opacity="0.85" />
                <path d="M 22 43 C 26 42 38 42 42 43 L 42 47 C 37 48 27 48 22 47 Z" fill="#291307" stroke="#b45309" strokeWidth="0.6" />
                <polygon points="25,47 23,51 27,48" fill="#d97706" stroke="#451a03" strokeWidth="0.4" />
                <polygon points="32,47 32,52 34,48" fill="#d97706" stroke="#451a03" strokeWidth="0.4" />
                <polygon points="39,47 41,51 37,48" fill="#d97706" stroke="#451a03" strokeWidth="0.4" />

                {/* 기사 뿔 투구 */}
                <path d="M 27 15 C 25 9 19 9 17 6 C 21 10 24 13 26 18 Z" fill="#d97706" stroke="#451a03" strokeWidth="0.6" />
                <path d="M 37 15 C 39 9 45 9 47 6 C 43 10 40 13 38 18 Z" fill="#d97706" stroke="#451a03" strokeWidth="0.6" />
                <path d="M 32 10 L 32 6 L 33 10 Z" fill="#f59e0b" />
                <path d="M 26 18 C 26 12 38 12 38 18 L 38 23 C 38 25 26 25 26 23 Z" fill="url(#bronzeKnight)" stroke="#451a03" strokeWidth="0.7" />
                <rect x="27.5" y="19" width="9" height="4.2" rx="1.2" fill="#1c1917" stroke="#d97706" strokeWidth="0.5" />
                <line x1="29.2" y1="20" x2="29.2" y2="22.2" stroke="#d97706" strokeWidth="0.6" />
                <line x1="31.1" y1="20" x2="31.1" y2="22.2" stroke="#d97706" strokeWidth="0.6" />
                <line x1="32.9" y1="20" x2="32.9" y2="22.2" stroke="#d97706" strokeWidth="0.6" />
                <line x1="34.8" y1="20" x2="34.8" y2="22.2" stroke="#d97706" strokeWidth="0.6" />
              </g>

              {/* (C) 원작 시그니처 굵은 순환 스왑 화살표 */}
              {/* 상단 화살표 (우측 -> 좌측 시계방향: 블루/바이올렛) */}
              <g>
                <path d="M 46 22 C 40 12 28 12 23 20" stroke="url(#topArrowGrad)" strokeWidth="4.4" strokeLinecap="round" fill="none" filter="url(#glow)" />
                <polygon points="25,14 17,21 26,24" fill="#3b82f6" stroke="#ffffff" strokeWidth="0.7" strokeLinejoin="round" />
              </g>

              {/* 하단 화살표 (좌측 -> 우측 시계방향: 오렌지/레드) */}
              <g>
                <path d="M 18 42 C 24 52 36 52 41 44" stroke="url(#bottomArrowGrad)" strokeWidth="4.4" strokeLinecap="round" fill="none" filter="url(#glow)" />
                <polygon points="39,50 47,43 38,40" fill="#ea580c" stroke="#ffffff" strokeWidth="0.7" strokeLinejoin="round" />
              </g>

              {/* (D) 원작 시그니처 3D 광채 스피어 오브 (attack & defense) */}
              {/* 좌측: attack 오렌지 오브 */}
              <g>
                <circle cx="18.5" cy="32.5" r="9.2" fill="url(#atkSphere)" stroke="#ffffff" strokeWidth="0.9" />
                <ellipse cx="17.2" cy="27.5" rx="4.8" ry="2.2" fill="#ffffff" opacity="0.45" />
                <text x="18.5" y="34.0" fontSize="3.6" fontWeight="900" fontFamily="'Arial Black', system-ui, sans-serif" fill="#ffffff" textAnchor="middle" letterSpacing="-0.1">
                  attack
                </text>
              </g>

              {/* 우측: defense 블루 오브 */}
              <g>
                <circle cx="45.5" cy="32.5" r="9.2" fill="url(#defSphere)" stroke="#ffffff" strokeWidth="0.9" />
                <ellipse cx="44.2" cy="27.5" rx="4.8" ry="2.2" fill="#ffffff" opacity="0.45" />
                <text x="45.5" y="34.0" fontSize="3.3" fontWeight="900" fontFamily="'Arial Black', system-ui, sans-serif" fill="#ffffff" textAnchor="middle" letterSpacing="-0.2">
                  defense
                </text>
              </g>
            </g>

            {/* 원형 외곽 림 테두리 */}
            <circle cx="32" cy="32" r="29.2" fill="none" stroke="#38bdf8" strokeWidth="1.6" strokeOpacity="0.9" />
            <circle cx="32" cy="32" r="28.0" fill="none" stroke="#fef08a" strokeWidth="0.5" strokeOpacity="0.5" />
          </g>
        )}

        {/* 6. 과거의 영광 (특수) (수제 벡터 클래식 게임보이 DMG-01) */}
        {(id === "specialSwordAndShield" || id === "lostTechnologyBlizzard" || id === "lostTechnologyPsychic" || id === "lostTechnologyHyperBeam" || id === "lostTechnologyCritical") && (
          <g>
            {/* 1. 후면 레트로 사이버 그린 오라 & 픽셀 비트 빛무리 */}
            <g filter="url(#glow)">
              <circle cx="32" cy="32" r="23" fill="#84cc16" opacity="0.16" />
              <circle cx="32" cy="27" r="14" fill="#a3e635" opacity="0.18" />
              <circle cx="32" cy="32" r="27.5" stroke="#a3e635" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.45" fill="none" />
              <path d="M 8 32 C 8 16 18 8 34 8" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" strokeDasharray="6 4" />
              <path d="M 22 56 C 40 58 56 46 56 28" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" strokeDasharray="6 4" />
            </g>

            {/* 2. 게임보이 콘솔 (11도 역동적 틸트) */}
            <g transform="translate(31.5, 31.5) rotate(-11) translate(-31.5, -31.5)">
              {/* (A) 바닥 드롭 섀도우 */}
              <path d="M 19 8 L 43 8 Q 46 8 46 11 L 46 45 Q 46 48 42 51 L 40 52.5 Q 36 54 32 54 L 19 54 Q 16 54 16 51 L 16 11 Q 16 8 19 8 Z" transform="translate(3, 3)" fill="#000000" opacity="0.55" filter="url(#glow)" />

              {/* (B) 3D 측면 두께 (우측 & 하단) */}
              <path d="M 19 8 L 43 8 Q 46 8 46 11 L 46 45 Q 46 48 42 51 L 40 52.5 Q 36 54 32 54 L 19 54 Q 16 54 16 51 L 16 11 Q 16 8 19 8 Z" transform="translate(2.2, 1.6)" fill="url(#dmgDepth)" />
              {/* 측면 볼륨 조절 다이얼 */}
              <rect x="47.2" y="24" width="1.2" height="6.5" rx="0.6" fill="#3f403b" />
              <line x1="47.8" y1="25.5" x2="47.8" y2="29" stroke="#71736b" strokeWidth="0.4" />

              {/* (C) 본체 전면 케이싱 (둥근 모서리 + 우하단 인체공학적 곡선) */}
              <path d="M 19 8 L 43 8 Q 46 8 46 11 L 46 45 Q 46 48 42 51 L 40 52.5 Q 36 54 32 54 L 19 54 Q 16 54 16 51 L 16 11 Q 16 8 19 8 Z" fill="url(#dmgBody)" stroke="#b5b7af" strokeWidth="0.6" />

              {/* 상단 팩 슬롯 가로 음각 홈 */}
              <line x1="21" y1="9.8" x2="41" y2="9.8" stroke="#a4a69e" strokeWidth="0.7" strokeLinecap="round" />
              <line x1="21" y1="10.4" x2="41" y2="10.4" stroke="#ffffff" strokeWidth="0.3" strokeLinecap="round" opacity="0.8" />

              {/* (D) 스크린 베젤 (다크 그레이 창) */}
              <rect x="18.5" y="13" width="25" height="17.5" rx="2" fill="url(#dmgBezel)" stroke="#373942" strokeWidth="0.5" />

              {/* 베젤 상단 투톤 컬러 라인 (블루 & 마젠타) */}
              <line x1="21.5" y1="14.8" x2="40.5" y2="14.8" stroke="#3b82f6" strokeWidth="0.6" strokeLinecap="round" />
              <line x1="21.5" y1="15.8" x2="40.5" y2="15.8" stroke="#db2777" strokeWidth="0.6" strokeLinecap="round" />

              {/* 배터리 표시 레드 LED 점등 */}
              <circle cx="21.2" cy="20.5" r="1.0" fill="#ef4444" />
              <circle cx="21.2" cy="20.5" r="2.2" fill="#ef4444" opacity="0.55" filter="url(#glow)" />
              <circle cx="20.9" cy="20.2" r="0.35" fill="#ffffff" opacity="0.9" />

              {/* (E) LCD 디스플레이 (올리브 그린 도트 매트릭스) */}
              <rect x="24.8" y="17.5" width="15.2" height="11.2" rx="0.8" fill="url(#dmgLcd)" stroke="#68840c" strokeWidth="0.4" />

              {/* 화면 속 8비트 포켓몬 몬스터볼 그래픽 */}
              <g opacity="0.85">
                <circle cx="32.4" cy="23.1" r="3.4" fill="#306230" stroke="#0f380f" strokeWidth="0.6" />
                <line x1="29" y1="23.1" x2="35.8" y2="23.1" stroke="#0f380f" strokeWidth="0.7" />
                <circle cx="32.4" cy="23.1" r="1.3" fill="#8bac0f" stroke="#0f380f" strokeWidth="0.5" />
                <circle cx="32.4" cy="23.1" r="0.45" fill="#0f380f" />
                <rect x="26.2" y="19" width="3.5" height="0.8" fill="#0f380f" opacity="0.7" />
                <rect x="35" y="26.3" width="3.5" height="0.8" fill="#0f380f" opacity="0.7" />
              </g>

              {/* (F) 닌텐도 게임보이 브랜드 로고 라인 */}
              <g transform="translate(19.5, 33)">
                <rect x="0" y="0" width="6" height="0.8" rx="0.4" fill="#1e3a8a" />
                <rect x="7" y="-0.3" width="10" height="1.4" rx="0.4" fill="#1e3a8a" />
                <rect x="17.5" y="-0.3" width="1.2" height="1.4" rx="0.3" fill="#1e3a8a" />
              </g>

              {/* (G) 십자키 (D-Pad) */}
              <g>
                <rect x="18.5" y="39.2" width="8.2" height="3.0" rx="0.5" fill="#1f2937" stroke="#111827" strokeWidth="0.3" />
                <rect x="21.1" y="36.6" width="3.0" height="8.2" rx="0.5" fill="#1f2937" stroke="#111827" strokeWidth="0.3" />
                <circle cx="22.6" cy="40.7" r="1.15" fill="#111827" stroke="#374151" strokeWidth="0.25" />
                <polygon points="19.5,40.7 20.2,40.1 20.2,41.3" fill="#6b7280" opacity="0.8" />
                <polygon points="25.7,40.7 25.0,40.1 25.0,41.3" fill="#6b7280" opacity="0.8" />
                <polygon points="22.6,37.6 22.0,38.3 23.2,38.3" fill="#6b7280" opacity="0.8" />
                <polygon points="22.6,43.8 22.0,43.1 23.2,43.1" fill="#6b7280" opacity="0.8" />
              </g>

              {/* (H) A & B 마젠타 버튼 (대각선 배치) */}
              <g>
                {/* B 버튼 (좌하단) */}
                <circle cx="34.8" cy="43.2" r="2.35" fill="url(#dmgBtn)" stroke="#4c0519" strokeWidth="0.35" />
                <circle cx="34.4" cy="42.7" r="1.7" fill="none" stroke="#fb7185" strokeWidth="0.4" opacity="0.75" />
                <rect x="33.8" y="46.5" width="2.0" height="0.8" rx="0.4" fill="#1e3a8a" opacity="0.8" />

                {/* A 버튼 (우상단) */}
                <circle cx="40.2" cy="40.4" r="2.35" fill="url(#dmgBtn)" stroke="#4c0519" strokeWidth="0.35" />
                <circle cx="39.8" cy="39.9" r="1.7" fill="none" stroke="#fb7185" strokeWidth="0.4" opacity="0.75" />
                <rect x="39.2" y="43.7" width="2.0" height="0.8" rx="0.4" fill="#1e3a8a" opacity="0.8" />
              </g>

              {/* (I) 셀렉트 & 스타트 버튼 (사선 고무 캡슐) */}
              <g>
                <rect x="-2.4" y="-0.75" width="4.8" height="1.5" rx="0.75" fill="#64748b" stroke="#334155" strokeWidth="0.25" transform="translate(25.5, 48.2) rotate(-26)" />
                <rect x="23.8" y="50.2" width="3.4" height="0.6" rx="0.3" fill="#1e3a8a" opacity="0.7" />

                <rect x="-2.4" y="-0.75" width="4.8" height="1.5" rx="0.75" fill="#64748b" stroke="#334155" strokeWidth="0.25" transform="translate(30.2, 48.2) rotate(-26)" />
                <rect x="28.5" y="50.2" width="3.4" height="0.6" rx="0.3" fill="#1e3a8a" opacity="0.7" />
              </g>

              {/* (J) 스피커 그릴 슬릿 (우하단 6줄 사선 홀) */}
              <g opacity="0.85">
                <line x1="36.5" y1="48.5" x2="38.5" y2="53.5" stroke="#787a72" strokeWidth="0.7" strokeLinecap="round" />
                <line x1="38.0" y1="48.2" x2="40.0" y2="53.0" stroke="#787a72" strokeWidth="0.7" strokeLinecap="round" />
                <line x1="39.5" y1="47.9" x2="41.3" y2="52.2" stroke="#787a72" strokeWidth="0.7" strokeLinecap="round" />
                <line x1="41.0" y1="47.6" x2="42.6" y2="51.2" stroke="#787a72" strokeWidth="0.7" strokeLinecap="round" />
                <line x1="42.5" y1="47.3" x2="43.8" y2="50.2" stroke="#787a72" strokeWidth="0.7" strokeLinecap="round" />
                <line x1="44.0" y1="47.0" x2="44.9" y2="49.0" stroke="#787a72" strokeWidth="0.7" strokeLinecap="round" />
              </g>
            </g>

            {/* 3. 주변 떠다니는 레트로 8비트 사이버 스파클 & 빛무리 */}
            <g filter="url(#glow)">
              <path d="M 53 10 Q 53 13 55.5 13 Q 53 13 53 16 Q 53 13 50.5 13 Q 53 13 53 10 Z" fill="#bef264" />
              <path d="M 12 18 Q 12 20.5 14.5 20.5 Q 12 20.5 12 23 Q 12 20.5 9.5 20.5 Q 12 20.5 12 18 Z" fill="#67e8f9" />
              <circle cx="53" cy="46" r="1.1" fill="#facc15" opacity="0.85" />
              <circle cx="11" cy="45" r="1.0" fill="#bef264" opacity="0.8" />
              <circle cx="22" cy="6" r="0.9" fill="#ffffff" opacity="0.9" />
            </g>
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
        {id === "hhgghgg" && (
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
        {id === "danceOfGarchomp" && (
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
              <path d="M 10 35 C 25 15, 50 8, 75 18 C 60 22, 42 25, 10 35 Z" fill="#3b0a14" opacity="0.65" />
              <path d="M 75 45 C 88 55, 92 75, 72 92 C 78 75, 76 58, 68 48 Z" fill="#3b0a14" opacity="0.65" />

              {/* 좌하단 & 우중단 밝은 오렌지-골드 열기 글로우 */}
              <circle cx="50.8" cy="50.8" r="45.5" fill="url(#tmWarmGlow1)" />
              <circle cx="50.8" cy="50.8" r="45.5" fill="url(#tmWarmGlow2)" />

              {/* 상단 번개/에너지 크랙 */}
              <path d="M 52 21 L 59.5 16.5 L 56.5 12.2 L 67.5 8 L 59 13.5 L 61.5 17.5 Z" fill="#fed7aa" opacity="0.85" />
              {/* 좌중단~좌하단 지그재그 에너지 번개 줄기 */}
              <path d="M 6.5 44 L 12.5 53.5 L 18 55 L 11 55.2 L 6.5 49 Z" fill="#fed7aa" opacity="0.85" />
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
              <path d="M 30 88.5 C 35 86, 40 86.5, 45 84.5 C 41 87.5, 35 88.5, 30 88.5 Z" fill="#fb923c" opacity="0.85" />

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
                <path d="M 49.2 73.5 L 62.2 79.8 L 62 83.2 L 48.5 76.5 Z" fill="#645866" stroke="#0b080e" strokeWidth="1.6" strokeLinejoin="round" />
                {/* 골반 아머 우측 음영면 */}
                <polygon points="62.2,79.8 70.2,72 69.8,79.5 62,88.5" fill="#2c2430" />

                {/* 우측 허리 타셋 플레이트 + 미니 스파이크 */}
                <polygon points="72.5,66.2 76.5,64.2 74.2,70.5" fill="url(#tmSpikeGrad)" stroke="#0b080e" strokeWidth="1.8" strokeLinejoin="round" />
                <polygon points="74.5,72.8 76.2,74.2 74.5,75.5" fill="url(#tmSpikeGrad)" stroke="#0b080e" strokeWidth="1.5" strokeLinejoin="round" />
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
                <path d="M 71.2 64.5 L 73.2 65.2 L 73.5 73.5 L 69.8 73.2 Z" fill="url(#tmGoldGrad)" stroke="#0b080e" strokeWidth="1.6" strokeLinejoin="round" />

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
                <path d="M 31 46.5 C 31.5 51.8, 34.5 54.5, 37.2 53.5 C 39.8 52.5, 40.5 47.5, 39.5 43.5 Z" fill="#07050a" stroke="#0b080e" strokeWidth="1.6" />
                {/* 암홀 아래 붉은 반사광 하이라이트 */}
                <path d="M 32.5 52.5 C 34 55.2, 36.5 56.5, 39.2 56.2" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
                {/* 측면 늑골 분절 라인 */}
                <path d="M 37.8 58.8 C 40.5 58.5, 42.8 57.2, 44.2 55.2" fill="none" stroke="#0b080e" strokeWidth="2.0" strokeLinecap="round" />
                <path d="M 38.5 64.2 C 41.8 64.2, 44.5 62.8, 46.2 60.5" fill="none" stroke="#0b080e" strokeWidth="2.0" strokeLinecap="round" />
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
                <path d="M 50.5 39.5 C 52.5 39.5, 54.5 41.5, 55.2 44 C 53.2 43.5, 51.2 41.5, 50.5 39.5 Z" fill="#8b7d8b" opacity="0.65" />
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
                <path d="M 40.5 25.5 C 40.8 29, 43.5 32, 48.5 34.2 L 49.5 30.5 C 44.5 28.5, 41.8 26, 40.5 25.5 Z" fill="#9a5b42" opacity="0.65" />
                <path d="M 48 29.5 C 52.5 31.5, 57.5 33.5, 59.5 36.5 L 61.2 41.5 C 58 37.5, 53 34.5, 48 32.5 Z" fill="#fffbeb" opacity="0.75" />

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
                <path d="M 74.5 39.5 L 82.2 40.5 L 84.8 44.2 C 82.5 45.5, 78.5 44.8, 74.5 42.5 Z" fill="url(#tmDarkShade)" stroke="#0b080e" strokeWidth="2.0" strokeLinejoin="round" />
                <path d="M 71.5 33.5 L 80.5 32.8 C 82.5 35.5, 83.8 38.2, 83.8 39.8 C 80.5 40.5, 77.5 39.5, 74.5 38.2 Z" fill="url(#tmDarkMetal)" stroke="#0b080e" strokeWidth="2.0" strokeLinejoin="round" />
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
                <path d="M 62.8 23.8 L 64.8 18.2 L 67.5 23.8 C 66 24.5, 64.2 24.5, 62.8 23.8 Z" fill="url(#tmSpikeGrad)" stroke="#0b080e" strokeWidth="2.0" strokeLinejoin="round" />
                <path d="M 69.2 24.2 L 76.8 15.2 L 75.8 28.2 C 73.2 27.8, 70.8 26.2, 69.2 24.2 Z" fill="url(#tmSpikeGrad)" stroke="#0b080e" strokeWidth="2.1" strokeLinejoin="round" />
                <polygon points="76.2,16.5 75.2,27.5 73.2,26.8" fill="#855832" opacity="0.7" />
                <path d="M 75.5 30.2 L 83.5 25.5 L 79.5 34.5 C 77.2 34.5, 75.2 32.8, 75.5 30.2 Z" fill="url(#tmSpikeGrad)" stroke="#0b080e" strokeWidth="2.1" strokeLinejoin="round" />
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
                <path d="M 16.5 37.2 C 17.5 34.2, 19.8 31.8, 22.5 30.5 C 21.2 33.5, 19.8 36.2, 18.8 38.2 Z" fill="#dc2626" opacity="0.75" />
                <path d="M 25.5 33.5 C 28.5 31.5, 31.5 30.5, 33.8 31.5 C 32.5 33.5, 29.5 34.8, 25.5 33.5 Z" fill="#a396a6" opacity="0.7" />
                <path d="M 16.2 38.5 C 21 39.2, 26 38.2, 30.5 36.2 C 35 36.5, 39 38, 42.5 40.2" fill="none" stroke="#0b080e" strokeWidth="1.9" strokeLinecap="round" />
                <path d="M 17.5 37.2 C 21.8 37.8, 26.2 36.8, 30.5 34.8 C 34.8 35.2, 38.8 36.8, 42.2 38.8" fill="none" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />

                {/* 좌측 어깨 스파이크 3개 */}
                <path d="M 19.5 31.5 L 17.2 24.5 L 24.2 28 C 23.2 30.2, 21.2 31.5, 19.5 31.5 Z" fill="url(#tmSpikeGrad)" stroke="#0b080e" strokeWidth="2.0" strokeLinejoin="round" />
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
                <polygon points="25.2,13.8 21.8,7.2 24.6,13.2 29.2,9.8 25.8,13.6 32.5,16.5 25.6,14.5 27.8,20.5 24.8,14.8 20.5,19.8 24.2,14.2 17.8,13.5" fill="#fb923c" />
                <circle cx="25.2" cy="14" r="1.3" fill="#ffffff" />

                <polygon points="32.5,28.8 33,29.8 34.2,30.2 33,30.6 32.5,31.8 32,30.6 30.8,30.2 32,29.8" fill="#fde047" />
                <polygon points="36.8,28.2 37.3,29.5 38.8,29.8 37.3,30.2 36.8,31.5 36.3,30.2 34.8,29.8 36.3,29.5" fill="#ffffff" />

                <polygon points="83.5,25.5 85.2,22.2 84,25.2 87.2,24.8 84,25.8 85.8,28.8 83.3,26 80.5,27.2 83,25.5 81.2,23.2" fill="#fde047" />
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
            <path d="M 32 27 L 44 15 L 49 20 L 37 32 L 49 44 L 44 49 L 32 37 L 20 49 L 15 44 L 27 32 L 15 20 L 20 15 Z" fill="url(#skyBlueXGrad)" stroke="#ffffff" strokeWidth="1.2" strokeLinejoin="round" />

            {/* 중앙 화이트 스파클 코어 */}
            <circle cx="32" cy="32" r="2" fill="#ffffff" />

            {/* 억까방지와 동일한 스파클 장식 */}
            <path d="M48 16 Q48 19 51 19 Q48 19 48 22 Q48 19 45 19 Q48 19 48 16 Z" fill="#fef08a" />
            <path d="M16 48 Q16 50.5 18.5 50.5 Q16 50.5 16 53 Q16 50.5 13.5 50.5 Q16 50.5 16 48 Z" fill="#67e8f9" />
          </g>
        )}

        {/* 14. 테라버스트 (업로드 원본 이미지와 100% 동일 형태 + 원본 민트/에메랄드 단색) */}
        {id === "teraBlast" && (
          <g>
            {/* 1. 테라스탈 6각성 메인 바디 (외곽 18포인트 6각 숄더 + 6각 스파이크 - 내부 세로 6각 홀) */}
            <path
              d="M 32 6
                 L 35.95 19.4
                 L 39.7 23.0
                 L 50.9 18.8
                 L 41.8 28.0
                 L 41.8 36.0
                 L 50.9 45.2
                 L 39.7 41.0
                 L 35.95 44.6
                 L 32 58
                 L 28.05 44.6
                 L 24.3 41.0
                 L 13.1 45.2
                 L 22.2 36.0
                 L 22.2 28.0
                 L 13.1 18.8
                 L 24.3 23.0
                 L 28.05 19.4 Z
                 M 32 23.8
                 L 35.95 27.55
                 L 35.95 36.45
                 L 32 40.2
                 L 28.05 36.45
                 L 28.05 27.55 Z"
              fill="#a3e5db"
              fillRule="evenodd"
              stroke="#2fd1ac"
              strokeWidth="1.25"
              strokeLinejoin="miter"
              strokeMiterlimit="5"
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
              <path d="M 72.5 63.5 L 74 53.8 L 80.2 52.5 L 86 42.5 L 83 55.8 L 76 57.5 Z" fill="url(#ieBoltFill)" stroke="#fef08a" strokeWidth="1.0" strokeLinejoin="miter" />
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
              <path d="M 52.5 80.8 C 55.5 81.2, 58.8 80.8, 61.2 80.3 L 62.5 83.8 C 58.5 83.5, 55 82.2, 52.5 80.8 Z" fill="#eab308" />

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
              <path d="M 75.3 67.5 C 74 70, 72.8 72.5, 71.8 75 L 74.2 79.5 C 75.5 75.5, 75.8 71.5, 75.3 67.5 Z" fill="#fde68a" />

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
              <path d="M 63.8 73.8 C 68.5 74.2, 72.8 77.5, 73.8 82.8 L 71.5 84 C 70.8 79.5, 68 76.8, 65 76 Z" fill="#fef08a" />
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
              <path d="M 36.5 39.5 C 42 36, 48 36.5, 54 38.5 C 50 39.5, 43 39.5, 36.5 39.5 Z" fill="#7c5bb0" opacity="0.55" />

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

              <path d="M 38.2 44 L 40.5 46.5 L 41 51 L 39.8 50 L 39 54 L 36 52 L 34.5 57.5" fill="none" stroke="#08060c" strokeWidth="1.9" strokeLinejoin="round" strokeLinecap="round" />

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
              <path d="M 56.5 23 C 59.5 26, 60.2 31, 60.2 35" fill="none" stroke="#08060c" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M 65.5 25.5 C 66.5 27.5, 68 28.5, 69.8 28.2" fill="none" stroke="#08060c" strokeWidth="2.0" strokeLinecap="round" />
              <path d="M 37.5 35 C 39.8 34.2, 41.8 34.2, 43.2 34.8" fill="none" stroke="#08060c" strokeWidth="2.0" strokeLinecap="round" />
              <path d="M 55.5 36.8 C 58.5 37.2, 61.5 38.5, 64 40" fill="none" stroke="#08060c" strokeWidth="2.0" strokeLinecap="round" />
              <path d="M 30 60 C 34 64.5, 41 65, 46.5 64 C 54 56.5, 64 48.5, 75 47.2" fill="none" stroke="#08060c" strokeWidth="2.1" strokeLinecap="round" />
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
              <path d="M 60 35 C 75 30, 92 25, 95 45 L 95 92 L 35 92 C 45 78, 55 62, 60 35 Z" fill="#140836" opacity="0.7" />
              {/* 우측 중단 보라색 성운 빛줄기 */}
              <path d="M 55 45 C 70 38, 84 35, 92 38 C 82 48, 72 55, 58 56 Z" fill="#4c1d95" opacity="0.6" />

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
              <path d="M 23.3 34.5 Q 23.3 37.8 26.5 37.8 Q 23.3 37.8 23.3 41.1 Q 23.3 37.8 20.1 37.8 Q 23.3 37.8 23.3 34.5 Z" fill="#f472b6" />
              <path d="M 21.2 51.5 Q 21.2 53.2 22.9 53.2 Q 21.2 53.2 19.5 53.2 Q 21.2 53.2 21.2 51.5 Z" fill="#ffffff" />
              <polygon points="46.2,16.1 47.4,17.5 46.2,18.9 45,17.5" fill="#ffffff" />
              <path d="M 62.2 22.8 Q 62.2 24.5 63.9 24.5 Q 62.2 24.5 62.2 26.2 Q 62.2 24.5 60.5 24.5 Q 62.2 24.5 62.2 22.8 Z" fill="#ffffff" />
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
                <path d="M 59 68 C 61 71.2, 64.2 73.8, 68.2 75.8 C 64.8 72.8, 62.2 70.2, 60.5 67 Z" fill="#855849" opacity="0.75" />
                <path d="M 66.2 63.2 C 67.8 66.8, 71 70.5, 74.2 73.8 C 72.5 70, 69.8 66.5, 67.5 62.5 Z" fill="#784b3d" opacity="0.75" />
                <path d="M 61 73.5 C 63.5 76, 67.2 78, 69.8 81.2 C 66.8 78.8, 63 77, 61 73.5 Z" fill="#784b3d" opacity="0.7" />

                {/* 나무 뿌리 꼬임 블랙 윤곽선 디테일 */}
                <path d="M 63.2 64.5 C 64 67.8, 66.5 71, 71 74.2 C 73 75.8, 74.8 78.5, 76.2 82.2" fill="none" stroke="#08060c" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M 59.2 70.2 C 62.5 72.8, 66.8 74.5, 70.2 77.8 C 71.5 79.5, 72.2 81.5, 72.2 83.2" fill="none" stroke="#08060c" strokeWidth="1.8" strokeLinecap="round" />

                {/* 나무 틈새로 빛나는 푸른(시안) 수정 광맥 3줄기 */}
                <polygon points="62.8,63.8 65.2,62.8 66.8,71.2 64,68.2" fill="#38bdf8" stroke="#08060c" strokeWidth="1.1" strokeLinejoin="round" />
                <polygon points="65.8,73.2 70.2,75.8 71.8,81.2 68.5,77.2" fill="#38bdf8" stroke="#08060c" strokeWidth="1.1" strokeLinejoin="round" />
                <polygon points="73.8,76.8 76.8,79.5 77.5,83.2 75,80.5" fill="#38bdf8" stroke="#08060c" strokeWidth="1.1" strokeLinejoin="round" />
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
                <path d="M 54 51.5 C 53.8 54.8, 54.5 57.8, 55.8 58.2" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 59.2 51.2 C 59.8 54, 60.2 56.5, 61.2 56.8" fill="none" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M 46.5 53.5 L 51.5 52.2 M 46.8 56.8 L 51.2 55.8" fill="none" stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round" />

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
                <path d="M 38.5 50.8 C 43.5 50.2, 48.5 48.2, 52.5 46.2" fill="none" stroke="#e879f9" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M 45.5 51.2 C 50 49.8, 54.5 47.8, 58.5 45.2" fill="none" stroke="#cbd5e1" strokeWidth="1.4" strokeLinecap="round" />
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
                <path d="M 27.5 48.8 C 28.5 46.8, 30.5 45.5, 33 46.5 C 31.5 48.2, 29.2 49.2, 27.5 48.8 Z" fill="#c084fc" opacity="0.55" />
                <path d="M 57.5 32.5 C 59.5 30, 61.8 29.2, 62.5 30.5 C 61.8 32.2, 59.5 34.2, 57.2 35.5 Z" fill="#c084fc" opacity="0.55" />
              </g>
            </g>
          </g>
        )}

        {/* 19. 검 강화하기 (대장간 모루 + 황금 강화 대검 + 대장장이 망치 + +UP 스파크) */}
        {id === "swordEnhance" && (
          <g filter="url(#glow)">
            {/* 배경 타오르는 대장간 열기 오라 */}
            <circle cx="32" cy="32" r="24" fill="url(#flameGrad)" opacity="0.22" />

            {/* 하단 다크 스틸 모루 (Anvil) */}
            <path d="M 16 49 L 48 49 L 45 45 L 38 45 L 37 40 L 27 40 L 26 45 L 19 45 Z" fill="#334155" stroke="#94a3b8" strokeWidth="1.1" strokeLinejoin="round" />
            <path d="M 20 40 L 44 40 L 47 36 L 17 36 Z" fill="#475569" stroke="#cbd5e1" strokeWidth="1.1" strokeLinejoin="round" />

            {/* 중앙 대각선으로 빛나는 강화 성검 */}
            <g transform="rotate(-35 32 28)">
              {/* 검신 오라 */}
              <polygon points="32,5 36,13 35,33 29,33 28,13" fill="#fef08a" opacity="0.45" />
              {/* 검신 좌/우 베벨 */}
              <polygon points="32,6 35,12 34.2,33 32,33" fill="url(#prismGrad)" />
              <polygon points="32,6 29,12 29.8,33 32,33" fill="#ffffff" />
              <polygon points="32,6 35,12 34.2,33 29.8,33 29,12" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinejoin="round" />
              {/* 황금 크로스 가드 & 보석 */}
              <path d="M 23 33 L 41 33 L 39 36.5 L 25 36.5 Z" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="0.9" strokeLinejoin="round" />
              <circle cx="32" cy="34.8" r="1.6" fill="#ef4444" stroke="#ffffff" strokeWidth="0.6" />
              {/* 그립 & 폼멜 */}
              <rect x="30.3" y="36.5" width="3.4" height="6.5" rx="1" fill="#78350f" stroke="#fde047" strokeWidth="0.7" />
              <circle cx="32" cy="44.2" r="2.1" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="0.8" />
            </g>

            {/* 우측 상단 타격하는 대장장이 강화 망치 */}
            <g transform="rotate(25 46 20)">
              <rect x="44.5" y="18" width="3" height="15" rx="1.2" fill="#9a3412" stroke="#fed7aa" strokeWidth="0.7" />
              <path d="M 39 12 L 53 12 L 54 18.5 L 38 18.5 Z" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="1" strokeLinejoin="round" />
            </g>

            {/* 타격 지점 강렬한 강화 성공 스파크 & + 아이콘 */}
            <polygon points="33,19 35,14 36.5,18.5 41,17 37.5,20.5 41,24 36.5,22.5 35,27 33,22.5 28.5,24 32,20.5 28.5,17" fill="#fef08a" stroke="#f97316" strokeWidth="0.6" />
            <circle cx="34.8" cy="20.5" r="2.2" fill="#ffffff" />

            {/* 좌상단 '+UP' 강화 엠블럼 */}
            <path d="M 15 15 L 15 21 M 12 18 L 18 18" stroke="#fef08a" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M 22 14 L 25 18 L 23.2 18 L 23.2 22 L 20.8 22 L 20.8 18 L 19 18 Z" fill="#64ffda" />
          </g>
        )}

        {/* 24. 몰락한 왕의 검 */}
        {id === "bladeOfTheRuinedKing" && <image href="/pokemon/img/augment/bladeOfTheRuinedKing.png" x="-2" y="-2" width="68" height="68" />}

        {/* 천하장사 (Huge Power: 주황색 근육 벌크업 실루엣 & 오렌지 발광) */}
        {id === "hugePower" && (
          <g filter="url(#hugePowerGlow)">
            <circle cx="32" cy="32" r="23" fill="#ea580c" opacity="0.15" />
            <path d="M 32.2 16.7 L 30.1 16.8 L 28.8 17.4 L 27.7 18.3 L 26.7 19.8 L 25.9 21.7 L 25.8 23.3 L 26.0 24.4 L 26.4 25.2 L 26.8 25.7 L 26.8 26.2 L 26.4 26.8 L 23.6 27.0 L 19.5 26.8 L 18.5 26.1 L 18.5 25.1 L 19.2 24.1 L 20.7 23.2 L 22.6 22.6 L 23.9 21.5 L 24.6 19.9 L 24.3 18.1 L 22.6 16.2 L 19.8 15.7 L 17.9 16.1 L 17.1 16.7 L 16.2 17.2 L 14.5 19.0 L 12.8 21.3 L 11.8 23.3 L 11.4 24.4 L 10.8 25.5 L 10.2 26.6 L 9.9 27.8 L 9.2 29.2 L 9.0 32.7 L 9.5 35.4 L 10.6 36.4 L 11.8 37.1 L 12.9 37.3 L 14.0 37.6 L 15.4 38.0 L 17.8 38.0 L 20.0 38.4 L 21.9 39.3 L 23.4 40.6 L 24.0 41.9 L 24.1 43.2 L 24.4 44.7 L 24.9 46.3 L 25.5 47.2 L 26.8 48.3 L 30.8 49.0 L 35.8 48.8 L 37.3 48.0 L 38.4 46.9 L 39.1 45.3 L 39.5 43.7 L 39.6 42.3 L 40.0 41.0 L 41.1 39.8 L 43.0 38.7 L 45.1 38.1 L 47.5 38.0 L 49.3 37.7 L 50.4 37.4 L 51.4 37.2 L 52.6 36.7 L 53.8 35.8 L 54.6 33.9 L 54.6 30.1 L 54.0 28.2 L 53.5 27.1 L 53.1 25.8 L 52.4 24.8 L 52.0 23.7 L 51.3 22.1 L 49.8 19.8 L 47.9 17.6 L 46.8 16.8 L 46.0 16.3 L 44.7 15.7 L 41.9 15.8 L 39.8 17.4 L 38.9 18.9 L 39.0 20.0 L 39.5 21.2 L 40.2 22.1 L 41.6 22.8 L 43.5 23.4 L 44.7 24.4 L 45.3 25.5 L 45.0 26.4 L 43.1 26.9 L 38.7 27.0 L 37.1 26.6 L 36.8 26.1 L 36.9 25.6 L 37.4 25.0 L 37.7 24.1 L 37.7 22.4 L 37.3 20.4 L 36.6 19.0 L 35.6 17.9 L 34.5 17.1 L 32.9 16.8 Z" fill="url(#hugePowerGrad)" stroke="#ff3d00" strokeWidth="1.2" strokeLinejoin="round" />
          </g>
        )}

        {/* 26. 민첩한 몸놀림 (깃털 & 바람 궤적 & 스파클) */}
        {id === "nimbleMoves" && (
          <g filter="url(#glow)">
            {/* 1. 바람 궤적 및 우선도 가속 모션 */}
            <path d="M 11 38 C 13 25 24 16 38 14" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" strokeDasharray="9 4" />
            <path d="M 22 52 C 34 54 48 48 54 36" stroke="#67e8f9" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.55" strokeDasharray="8 4" />

            {/* 2. 깃털 본체 (상단 깃 & 입체 주름) */}
            <path d="M 19 46 C 18 41, 19 36, 23 31 C 22 32.5, 22 34, 23.5 35 C 24 29, 28 23, 34 18 C 34 20, 34.5 21.5, 36 22 C 37 18, 42 14, 49 13 C 47 16.5, 45 19, 45 22 C 46 21, 47 21, 48 20.5 C 44.5 25, 41 29, 39 34 C 40.5 33, 42 32.5, 43 32 C 38 38, 32 44, 24 47 Z" fill="url(#featherBodyGrad)" stroke="url(#featherEdgeGrad)" strokeWidth="1.2" strokeLinejoin="round" />

            {/* 하단 깃 (언더 깃) */}
            <path d="M 19 46 C 16 43, 17 38, 20 35 C 19.5 37, 20.5 38.5, 22 39 C 21.5 34, 25 28, 30 24 C 29.5 26.5, 31 28, 32.5 29 C 33 24, 38 18, 49 13 C 43.5 19, 37.5 27, 34 33 C 32 37, 27 42, 21 46 Z" fill="url(#featherUnderGrad)" stroke="url(#featherEdgeGrad)" strokeWidth="1.2" strokeLinejoin="round" />

            {/* 입체 하이라이트 레이어 */}
            <path d="M 23.5 35 C 25 30, 29 24, 34 19 C 34.5 21, 35.5 22, 36 22.5 C 38 18.5, 43 14.5, 48.5 13.5 C 45 18, 41 24, 38 29 C 33 34, 28 39, 23 43 Z" fill="#ffffff" fillOpacity="0.6" />

            {/* 깃털 빗살 결 디테일 */}
            <g stroke="#93c5fd" strokeWidth="0.7" strokeLinecap="round" opacity="0.65">
              <path d="M 27 36 L 23 39" />
              <path d="M 32 31 L 28 34" />
              <path d="M 38 25 L 34 28" />
              <path d="M 43 19 L 39 22" />
              <path d="M 28 31 L 32 28" />
              <path d="M 34 25 L 39 22" />
              <path d="M 40 18 L 44 16" />
            </g>

            {/* 3. 깃대 (Quill & Rachis) */}
            <path d="M 14 51 C 16 48.5 18.5 46.5 21 45" stroke="url(#quillGrad)" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M 14 51 C 16 48.5 18.5 46.5 21 45" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M 20 45 C 28 36 36 25 49 13" stroke="url(#quillGrad)" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M 20 45 C 28 36 36 25 49 13" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" />

            {/* 4. 민첩함 스파클 (골드 & 시안) */}
            <path d="M 52 10 Q 52 13 55 13 Q 52 13 52 16 Q 52 13 49 13 Q 52 13 52 10 Z" fill="#fef08a" />
            <path d="M 15 24 Q 15 26.5 17.5 26.5 Q 15 26.5 15 29 Q 15 26.5 12.5 26.5 Q 15 26.5 15 24 Z" fill="#67e8f9" />
            <circle cx="48" cy="23" r="1.3" fill="#ffffff" opacity="0.9" />
            <circle cx="21" cy="20" r="1.1" fill="#38bdf8" opacity="0.8" />
            <circle cx="43" cy="38" r="1.2" fill="#67e8f9" opacity="0.75" />
            <circle cx="30" cy="48" r="0.9" fill="#ffffff" opacity="0.8" />
          </g>
        )}

        
        {/* 선택과 집중 (타겟 & 체크마크 일러스트 이미지 + 원형 클리핑 & 퍼플 링) */}
        {id === "choiceAndFocus" && (
          <g clipPath="url(#lwClip)">
            <image href="/pokemon/img/augment/choiceAndFocus.png" x="1" y="1" width="62" height="62" preserveAspectRatio="xMidYMid slice" />
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="url(#choiceFocusRingGrad)" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="28.2" fill="none" stroke="#d8b4fe" strokeWidth="0.5" strokeOpacity="0.5" />
          </g>
        )}

        {/* 제로섬게임 (저울 일러스트 이미지 + 원형 클리핑 & 퍼플 링 + 강화(초록 +)/하락(빨간 -) 오버레이) */}
        {id === "zeroSumGame" && (
          <g clipPath="url(#lwClip)">
            <image href="/pokemon/img/augment/zeroSumGame.png" x="1" y="1" width="62" height="62" preserveAspectRatio="xMidYMid slice" />
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="url(#zeroSumRingGrad)" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="28.2" fill="none" stroke="#d8b4fe" strokeWidth="0.5" strokeOpacity="0.5" />
            {(sign === "+" || sign === "up") && (
              <g style={{ filter: "drop-shadow(0 0 3px rgba(34, 197, 94, 0.95))" }}>
                {/* 검은 외곽선으로 골드 저울 및 배경과의 대비 확보 */}
                <line x1="32" y1="19" x2="32" y2="45" stroke="#000000" strokeWidth="9" strokeLinecap="round" />
                <line x1="19" y1="32" x2="45" y2="32" stroke="#000000" strokeWidth="9" strokeLinecap="round" />
                {/* 짧고 두꺼운 초록색 + 바 */}
                <line x1="32" y1="19" x2="32" y2="45" stroke="#22c55e" strokeWidth="5.6" strokeLinecap="round" />
                <line x1="19" y1="32" x2="45" y2="32" stroke="#22c55e" strokeWidth="5.6" strokeLinecap="round" />
              </g>
            )}
            {(sign === "-" || sign === "down") && (
              <g style={{ filter: "drop-shadow(0 0 3px rgba(239, 68, 68, 0.95))" }}>
                {/* 검은 외곽선 */}
                <line x1="19" y1="32" x2="45" y2="32" stroke="#000000" strokeWidth="9" strokeLinecap="round" />
                {/* 짧고 두꺼운 빨간색 - 바 */}
                <line x1="19" y1="32" x2="45" y2="32" stroke="#ef4444" strokeWidth="5.6" strokeLinecap="round" />
              </g>
            )}
          </g>
        )}

        {/* 27. 회복 (3개의 초록 십자가 & 치유 오라 & 스파클) */}
        {id === "recovery" && (
          <g filter="url(#recoveryGlow)">
            {/* 후면 은은한 초록 치유 아우라 */}
            <ellipse cx="20" cy="31" rx="14" ry="14" fill="url(#healingAura)" />
            <ellipse cx="38" cy="43" rx="17" ry="17" fill="url(#healingAura)" />
            <ellipse cx="39" cy="17" rx="10" ry="10" fill="url(#healingAura)" />

            {/* 1. 소형 십자가 (우상단) */}
            <path d="M 37.1 10.5 L 40.9 10.5 L 40.9 14.1 L 44.5 14.1 L 44.5 17.9 L 40.9 17.9 L 40.9 21.5 L 37.1 21.5 L 37.1 17.9 L 33.5 17.9 L 33.5 14.1 L 37.1 14.1 Z" fill="url(#recoveryCrossGradSmall)" stroke="#064e3b" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M 37.6 11.2 L 40.4 11.2 M 34.2 14.6 L 43.8 14.6" stroke="#ecfdf5" strokeWidth="0.7" strokeLinecap="round" opacity="0.9" />

            {/* 2. 중형 십자가 (좌측) */}
            <path d="M 16.8 20 L 23.2 20 L 23.2 25.8 L 29 25.8 L 29 32.2 L 23.2 32.2 L 23.2 38 L 16.8 38 L 16.8 32.2 L 11 32.2 L 11 25.8 L 16.8 25.8 Z" fill="url(#recoveryCrossGradMed)" stroke="#064e3b" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M 17.5 21.6 L 22.5 21.6 M 12 26.6 L 28 26.6" stroke="#dcfce7" strokeWidth="0.9" strokeLinecap="round" opacity="0.9" />
            <path d="M 12 31.4 L 28 31.4 M 17.5 36.4 L 22.5 36.4" stroke="#022c22" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />

            {/* 3. 대형 십자가 (하단 우측) */}
            <path d="M 33.7 29 L 42.3 29 L 42.3 36.7 L 50 36.7 L 50 45.3 L 42.3 45.3 L 42.3 53 L 33.7 53 L 33.7 45.3 L 26 45.3 L 26 36.7 L 33.7 36.7 Z" fill="url(#recoveryCrossGrad)" stroke="#064e3b" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M 34.6 31.3 L 41.4 31.3 M 27.2 37.5 L 48.8 37.5" stroke="#dcfce7" strokeWidth="1.1" strokeLinecap="round" opacity="0.9" />
            <path d="M 27.2 44.5 L 48.8 44.5 M 34.6 51.5 L 41.4 51.5" stroke="#022c22" strokeWidth="1" strokeLinecap="round" opacity="0.6" />

            {/* 치유 스파클 & 광원 입자 (초록빛 회복 반짝임) */}
            <path d="M 10 16 Q 10 18.5 12.5 18.5 Q 10 18.5 10 21 Q 10 18.5 7.5 18.5 Q 10 18.5 10 16 Z" fill="#bef264" opacity="0.85" />
            <path d="M 54 28 Q 54 30.5 56.5 30.5 Q 54 30.5 54 33 Q 54 30.5 51.5 30.5 Q 54 30.5 54 28 Z" fill="#34d399" opacity="0.9" />
            <circle cx="28" cy="14" r="1.1" fill="#ecfdf5" opacity="0.85" />
            <circle cx="16" cy="48" r="1" fill="#86efac" opacity="0.75" />
            <circle cx="53" cy="48" r="1.2" fill="#6ee7b7" opacity="0.8" />
          </g>
        )}

        {/* 25. 태양불꽃방패 */}
        {id === "sunfireAegis" && <image href="/pokemon/img/augment/sunfireAegis.png" x="-2" y="-2" width="68" height="68" />}

        {/* 워모그의 갑옷 */}
        {id === "warmogsArmor" && <image href="/pokemon/img/augment/warmogsArmor.png" x="-2" y="-2" width="68" height="68" />}

        {/* 정령의 형상 */}
        {id === "spiritVisage" && <image href="/pokemon/img/augment/spiritVisage.png" x="-2" y="-2" width="68" height="68" />}

        {/* 거인의 흡수 */}
        {id === "giantAbsorption" && <image href="/pokemon/img/augment/giantAbsorption.png" x="-2" y="-2" width="68" height="68" />}

        {/* 메자이의 영혼약탈자 */}
        {id === "mejaisSoulstealer" && <image href="/pokemon/img/augment/mejaisSoulstealer.png" x="-2" y="-2" width="68" height="68" />}

        {/* 루덴의 메아리 */}
        {id === "ludensEcho" && <image href="/pokemon/img/augment/ludensEcho.png" x="-2" y="-2" width="68" height="68" />}

        {/* 징수의 총 */}
        {id === "collector" && <image href="/pokemon/img/augment/collector.png" x="-2" y="-2" width="68" height="68" />}

        {/* 연습이 치명타를 낳는다 */}
        {id === "practiceMakesCritical" && <image href="/pokemon/img/augment/practiceMakesCritical.png" x="-2" y="-2" width="68" height="68" />}

        {/* 데몬의 도끼 (일러스트 이미지 + 원형 클리핑 & 룬 테두리 링) */}
        {id === "axeOfDespair" && (
          <g clipPath="url(#lwClip)">
            <image href="/pokemon/img/augment/axeOfDespair.png" x="1" y="1" width="62" height="62" preserveAspectRatio="xMidYMid slice" />
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="url(#prismRing)" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="28.2" fill="none" stroke="#64ffda" strokeWidth="0.5" strokeOpacity="0.75" />
          </g>
        )}

        {/* 그 힘이야말로 왕인 까닭이다 (일러스트 이미지 + 원형 클리핑 & 링) */}
        {id === "powerOfKing" && (
          <g clipPath="url(#lwClip)">
            <image href="/pokemon/img/augment/powerOfKing.png" x="1" y="1" width="62" height="62" preserveAspectRatio="xMidYMid slice" />
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="url(#prismRing)" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="28.2" fill="none" stroke="#60a5fa" strokeWidth="0.5" strokeOpacity="0.75" />
          </g>
        )}

        {/* 3000년 만이구나... (AZ 일러스트 이미지 + 원형 클리핑 & 링) */}
        {id === "threeThousandYears" && (
          <g clipPath="url(#lwClip)">
            <image href="/pokemon/img/augment/threeThousandYears.png" x="1" y="1" width="62" height="62" preserveAspectRatio="xMidYMid slice" />
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="url(#prismRing)" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="28.2" fill="none" stroke="#60a5fa" strokeWidth="0.5" strokeOpacity="0.75" />
          </g>
        )}

        {/* 돌진 (멧돼지 일러스트 이미지 + 원형 클리핑 & 링) */}
        {id === "rush" && (
          <g clipPath="url(#lwClip)">
            <image href="/pokemon/img/augment/rush.png" x="1" y="1" width="62" height="62" preserveAspectRatio="xMidYMid slice" />
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="url(#prismRing)" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="28.2" fill="none" stroke="#60a5fa" strokeWidth="0.5" strokeOpacity="0.75" />
          </g>
        )}

        {/* 커져라! (일러스트 이미지 + 원형 클리핑 & 링) */}
        {id === "growUp" && (
          <g clipPath="url(#lwClip)">
            <image href="/pokemon/img/augment/growUp.png" x="1" y="1" width="62" height="62" preserveAspectRatio="xMidYMid slice" />
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="url(#prismRing)" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="28.2" fill="none" stroke="#22c55e" strokeWidth="0.5" strokeOpacity="0.75" />
          </g>
        )}

        {/* 아케인셰이드 투핸드소드 (일러스트 이미지 + 원형 클리핑 & 아케인 보라 링) */}
        {id === "arcaneShadeSword" && (
          <g clipPath="url(#lwClip)">
            <image href="/pokemon/img/augment/arcaneShadeSword.png" x="1" y="1" width="62" height="62" preserveAspectRatio="xMidYMid slice" />
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="url(#prismRing)" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="28.2" fill="none" stroke="#c084fc" strokeWidth="0.5" strokeOpacity="0.8" />
          </g>
        )}

        
        {/* 스타포스 (메이플 스타일 골든 스타 & 별빛 섬광) */}
        {id === "starforce" && (
          <g>
            {/* 심우주 배경 원 */}
            <circle cx="32" cy="32" r="30" fill="url(#starforceBg)" stroke="url(#starforceRing)" strokeWidth="1.8" />
            
            {/* 은하수 성간 먼지 및 작은 별빛들 */}
            <circle cx="16" cy="18" r="1.2" fill="#fde047" opacity="0.85" />
            <circle cx="48" cy="16" r="1.5" fill="#fef08a" opacity="0.9" />
            <circle cx="14" cy="46" r="1" fill="#fde047" opacity="0.75" />
            <circle cx="50" cy="46" r="1.3" fill="#fef08a" opacity="0.85" />
            <circle cx="21" cy="30" r="0.9" fill="#ffffff" opacity="0.7" />
            <circle cx="43" cy="33" r="0.9" fill="#ffffff" opacity="0.7" />
            
            {/* 골든 스타 발광 오라 */}
            <circle cx="32" cy="32" r="19" fill="url(#starforceGlow)" />
            
            {/* 십자 섬광 (Sparkle flare) */}
            <path d="M 32 10 Q 32 32 10 32 Q 32 32 32 54 Q 32 32 54 32 Q 32 32 32 10 Z" fill="#fef08a" opacity="0.4" filter="url(#glow)" />
            
            {/* 메이플 황금 별 베이스 테두리 */}
            <polygon points="32,14 36.8,25 48.5,26.5 40,34.8 42.2,46.5 32,41 21.8,46.5 24,34.8 15.5,26.5 27.2,25" fill="#78350f" stroke="#451a03" strokeWidth="0.8" />
            
            {/* 3D 각진 단면 (Faceted Star) */}
            <polygon points="32,14 32,33 27.2,25" fill="#fef08a" />
            <polygon points="32,33 15.5,26.5 24,34.8" fill="#fde047" />
            <polygon points="32,33 24,34.8 21.8,46.5" fill="#eab308" />
            <polygon points="32,33 32,41 21.8,46.5" fill="#ca8a04" />
            
            <polygon points="32,14 36.8,25 32,33" fill="#fde047" />
            <polygon points="32,33 36.8,25 48.5,26.5" fill="#eab308" />
            <polygon points="32,33 48.5,26.5 40,34.8" fill="#ca8a04" />
            <polygon points="32,33 40,34.8 42.2,46.5" fill="#a16207" />
            <polygon points="32,33 42.2,46.5 32,41" fill="#854d0e" />
            
            {/* 중앙 반짝임 다이아몬드 코어 */}
            <polygon points="32,29 34.5,33 32,37 29.5,33" fill="#ffffff" opacity="0.9" />
            <circle cx="32" cy="33" r="2" fill="#ffffff" filter="url(#glow)" />
            
            {/* 외곽선 골든 링 */}
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="url(#starforceRing)" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="28.2" fill="none" stroke="#fde047" strokeWidth="0.6" strokeOpacity="0.8" />
          </g>
        )}

        {/* 위대한 엄니의 소울 (소울 일러스트 이미지 + 원형 클리핑 & 마젠타 링) */}
        {id === "greatTuskSoul" && (
          <g clipPath="url(#lwClip)">
            <image href="/pokemon/img/augment/greatTuskSoul.png" x="1" y="1" width="62" height="62" preserveAspectRatio="xMidYMid slice" />
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="url(#prismRing)" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="28.2" fill="none" stroke="#f43f5e" strokeWidth="0.5" strokeOpacity="0.8" />
          </g>
        )}

        
        {/* 큐브 (레드 큐브 일러스트 + 원형 클리핑 & 루비 링) */}
        {id === "cube" && (
          <g clipPath="url(#lwClip)">
            <image href="/pokemon/img/augment/cube.png" x="1" y="1" width="62" height="62" preserveAspectRatio="xMidYMid slice" />
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="#e11d48" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="28.2" fill="none" stroke="#fb7185" strokeWidth="0.5" strokeOpacity="0.8" />
          </g>
        )}

        {/* 순백의 주문서 (일러스트 이미지 + 원형 클리핑 & 골드 링) */}
        {id === "cleanSlateScroll" && (
          <g clipPath="url(#lwClip)">
            <image href="/pokemon/img/augment/cleanSlateScroll.png" x="1" y="1" width="62" height="62" preserveAspectRatio="xMidYMid slice" />
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="url(#prismRing)" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="28.2" fill="none" stroke="#fbbf24" strokeWidth="0.5" strokeOpacity="0.8" />
          </g>
        )}

        {/* 하지만 버텨냈다. (붉은 픽셀 하트 + 원형 클리핑 & 레드 링) */}
        {id === "butItRefused" && (
          <g clipPath="url(#lwClip)">
            <image href="/pokemon/img/augment/butItRefused.png" x="1" y="1" width="62" height="62" preserveAspectRatio="xMidYMid slice" />
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="#ef4444" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="28.2" fill="none" stroke="#fca5a5" strokeWidth="0.5" strokeOpacity="0.65" />
          </g>
        )}

        {/* 함께 폭사하자 (일러스트 이미지 + 원형 클리핑 & 퍼플 링) */}
        {id === "letsExplodeTogether" && (
          <g clipPath="url(#lwClip)">
            <image href="/pokemon/img/augment/letsExplodeTogether.png" x="1" y="1" width="62" height="62" preserveAspectRatio="xMidYMid slice" />
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="#8b5cf6" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="28.2" fill="none" stroke="#c084fc" strokeWidth="0.5" strokeOpacity="0.65" />
          </g>
        )}

        {/* 28. 달팽이 세마리 */}
        {id === "threeSnails" && (
          <g>
            {/* 세 달팽이 껍질 뒤편의 은은한 원소 아우라 */}
            <circle cx="32" cy="20" r="14" fill="#22c55e" opacity="0.32" filter="url(#glow)" />
            <circle cx="21" cy="42" r="14" fill="#3b82f6" opacity="0.32" filter="url(#glow)" />
            <circle cx="43" cy="42" r="14" fill="#ef4444" opacity="0.32" filter="url(#glow)" />

            <image href="/pokemon/img/augment/threeSnails.png" x="6.5" y="9" width="51" height="45.6" />

            {/* 반짝이는 원소 스파클 */}
            <path d="M 32 4 Q 32 6.5 34.5 6.5 Q 32 6.5 32 9 Q 32 6.5 29.5 6.5 Q 32 6.5 32 4 Z" fill="#67e8f9" opacity="0.95" />
            <path d="M 57 20 Q 57 22 59 22 Q 57 22 57 24 Q 57 22 55 22 Q 57 22 57 20 Z" fill="#fef08a" opacity="0.9" />
            <path d="M 7 22 Q 7 24 9 24 Q 7 24 7 26 Q 7 24 5 24 Q 7 24 7 22 Z" fill="#34d399" opacity="0.9" />
            <circle cx="18" cy="14" r="0.9" fill="#ffffff" opacity="0.85" />
            <circle cx="48" cy="14" r="0.9" fill="#ffffff" opacity="0.8" />
            <circle cx="32" cy="58" r="1.1" fill="#64ffda" opacity="0.85" />
          </g>
        )}

        {/* 29. 영웅의 메아리 (영웅의 형상 & 황금 왕관 & 메아리 파동 링 & X자 광선) */}
        {id === "echoOfHero" && (
          <g>
            {/* 1. 중앙 골드 광채 아우라 */}
            <circle cx="32" cy="30" r="22" fill="url(#echoGoldGlow)" />

            {/* 2. 대각선 및 8방향 음파 광선 (메이플 원작의 X자 및 십자 광선) */}
            <g stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" filter="url(#echoGlowFilter)">
              <line x1="12" y1="12" x2="22" y2="22" />
              <line x1="52" y1="12" x2="42" y2="22" />
              <line x1="12" y1="50" x2="22" y2="40" />
              <line x1="52" y1="50" x2="42" y2="40" />
            </g>
            <g stroke="#fde047" strokeWidth="1.1" strokeLinecap="round" opacity="0.65" strokeDasharray="3 3">
              <line x1="32" y1="7" x2="32" y2="13" />
              <line x1="32" y1="47" x2="32" y2="53" />
              <line x1="9" y1="30" x2="15" y2="30" />
              <line x1="49" y1="30" x2="55" y2="30" />
            </g>

            {/* 3. 동심원 메아리 파동 링 (Concentric Echo Waves) */}
            <ellipse cx="32" cy="31" rx="20.5" ry="19" stroke="#ffffff" strokeWidth="1.4" strokeDasharray="7 3.5" opacity="0.65" filter="url(#echoGlowFilter)" />
            <ellipse cx="32" cy="31" rx="15" ry="14" stroke="#facc15" strokeWidth="1.6" strokeDasharray="6 3" opacity="0.85" filter="url(#echoGlowFilter)" />
            <circle cx="32" cy="27" r="9.5" fill="#fef08a" opacity="0.2" />
            <circle cx="32" cy="27" r="9.5" stroke="#fef08a" strokeWidth="1.2" opacity="0.8" />

            {/* 4. 황금 왕관 (Golden Crown) */}
            <g filter="url(#echoGlowFilter)">
              <path d="M 26 18.5 L 25.5 13.5 L 28.5 15.5 L 32 11 L 35.5 15.5 L 38.5 13.5 L 38 18.5 Z" fill="url(#crownGrad)" stroke="#78350f" strokeWidth="1" strokeLinejoin="round" />
              <circle cx="25.5" cy="13" r="0.8" fill="#ffffff" />
              <circle cx="32" cy="10.5" r="1.1" fill="#ffffff" />
              <circle cx="38.5" cy="13" r="0.8" fill="#ffffff" />
              <path d="M 27 18 L 37 18" stroke="#fef08a" strokeWidth="0.8" strokeLinecap="round" />
            </g>

            {/* 5. 중앙 영웅의 형상 (양팔 들어올린 흰색 아바타) */}
            <g id="heroFigure">
              {/* 후면 은은한 발광 */}
              <ellipse cx="32" cy="28" rx="6.5" ry="6.5" fill="#ffffff" opacity="0.3" filter="url(#glow)" />

              {/* 좌측 팔 들어올림 */}
              <path d="M 28 34 L 23 34 C 21.5 34, 21.5 33, 21.5 30 L 21.5 27.5 C 21.5 26.5, 22.5 26.5, 23.5 26.5 C 24.5 26.5, 24.5 27.5, 24.5 28.5 L 24.5 31 L 28 31 Z" fill="url(#heroBodyGrad)" stroke="#0f172a" strokeWidth="1.3" strokeLinejoin="round" />
              {/* 우측 팔 들어올림 */}
              <path d="M 36 34 L 41 34 C 42.5 34, 42.5 33, 42.5 30 L 42.5 27.5 C 42.5 26.5, 41.5 26.5, 40.5 26.5 C 39.5 26.5, 39.5 27.5, 39.5 28.5 L 39.5 31 L 36 31 Z" fill="url(#heroBodyGrad)" stroke="#0f172a" strokeWidth="1.3" strokeLinejoin="round" />

              {/* 몸통과 다리 */}
              <path d="M 28 31 L 36 31 L 36 43 L 34 43 L 34 49 L 32.5 49 L 32.5 40 L 31.5 40 L 31.5 49 L 30 49 L 30 43 L 28 43 Z" fill="url(#heroBodyGrad)" stroke="#0f172a" strokeWidth="1.3" strokeLinejoin="round" />

              {/* 머리 */}
              <circle cx="32" cy="24" r="4.8" fill="url(#heroBodyGrad)" stroke="#0f172a" strokeWidth="1.3" />
              <path d="M 30.5 22.5 Q 32 21.5 33.5 22.5" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
            </g>

            {/* 6. 반짝이는 스파클 */}
            <path d="M 12 18 Q 12 21 14.5 21 Q 12 21 12 24 Q 12 21 9.5 21 Q 12 21 12 18 Z" fill="#fef08a" opacity="0.9" />
            <path d="M 52 18 Q 52 21 54.5 21 Q 52 21 52 24 Q 52 21 49.5 21 Q 52 21 52 18 Z" fill="#fef08a" opacity="0.9" />
            <path d="M 32 5 Q 32 7.5 34 7.5 Q 32 7.5 32 10 Q 32 7.5 30 7.5 Q 32 7.5 32 5 Z" fill="#ffffff" opacity="0.95" />
            <circle cx="15" cy="40" r="1.1" fill="#fde047" opacity="0.8" />
            <circle cx="49" cy="40" r="1.1" fill="#fde047" opacity="0.8" />
            <circle cx="32" cy="55" r="1.2" fill="#64ffda" opacity="0.85" />
          </g>
        )}

        {/* 러시안룰렛 (리볼버 6연발 실린더 & 장전된 붉은 탄환) */}
        {id === "russianRoulette" && (
          <g>
            {/* 외곽 리볼버 실린더 금속 본체 */}
            <circle cx="32" cy="32" r="18.5" fill="#1e293b" stroke="url(#chainMetal)" strokeWidth="2.2" />
            <circle cx="32" cy="32" r="16.2" fill="#0f172a" stroke="#475569" strokeWidth="0.9" strokeDasharray="4 4.5" />
            {/* 플루트(실린더 홈) 노치 포인트 */}
            <circle cx="32" cy="13.8" r="1.2" fill="#64748b" />
            <circle cx="47.8" cy="22.9" r="1.2" fill="#64748b" />
            <circle cx="47.8" cy="41.1" r="1.2" fill="#64748b" />
            <circle cx="32" cy="50.2" r="1.2" fill="#64748b" />
            <circle cx="16.2" cy="41.1" r="1.2" fill="#64748b" />
            <circle cx="16.2" cy="22.9" r="1.2" fill="#64748b" />

            {/* 5개의 빈 약실 */}
            <circle cx="41.1" cy="26.75" r="3.6" fill="#05080f" stroke="#475569" strokeWidth="1.2" />
            <circle cx="41.1" cy="37.25" r="3.6" fill="#05080f" stroke="#475569" strokeWidth="1.2" />
            <circle cx="32" cy="42.5" r="3.6" fill="#05080f" stroke="#475569" strokeWidth="1.2" />
            <circle cx="22.9" cy="37.25" r="3.6" fill="#05080f" stroke="#475569" strokeWidth="1.2" />
            <circle cx="22.9" cy="26.75" r="3.6" fill="#05080f" stroke="#475569" strokeWidth="1.2" />

            {/* 12시 방향 장전된 실탄 약실 */}
            <circle cx="32" cy="21.5" r="4.2" fill="url(#banRedGrad)" stroke="#fca5a5" strokeWidth="1.2" filter="url(#glow)" />
            <circle cx="32" cy="21.5" r="1.8" fill="#fde047" />
            <circle cx="32" cy="21.5" r="0.8" fill="#ffffff" />

            {/* 중앙 축 핀 */}
            <circle cx="32" cy="32" r="3.8" fill="url(#chainMetal)" stroke="#0f172a" strokeWidth="1.2" />
            <circle cx="32" cy="32" r="1.4" fill="#94a3b8" />

            {/* 조준 십자 눈금 */}
            <path d="M 32 7 L 32 10.5 M 32 53.5 L 32 57 M 7 32 L 10.5 32 M 53.5 32 L 57 32" stroke="#64ffda" strokeWidth="1.4" strokeLinecap="round" opacity="0.75" />
            <path d="M 32 7 L 32 11" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {/* 홀짝 (홀 1점 크림슨 패 & 짝 2점 시안 패 대비) */}
        {id === "oddEven" && (
          <g>
            {/* 왼쪽 패: 홀 (1) */}
            <g transform="translate(22.5, 34) rotate(-11) translate(-22.5, -34)">
              <rect x="13.5" y="21" width="18" height="26" rx="4" fill="#1e141a" stroke="#f87171" strokeWidth="1.6" />
              <rect x="15.5" y="23" width="14" height="22" rx="2.6" fill="none" stroke="#ef4444" strokeWidth="0.6" strokeOpacity="0.45" />
              <circle cx="22.5" cy="34" r="3.4" fill="url(#banRedGrad)" stroke="#fecaca" strokeWidth="0.8" />
            </g>

            {/* 오른쪽 패: 짝 (2) */}
            <g transform="translate(41.5, 30) rotate(11) translate(-41.5, -30)">
              <rect x="32.5" y="17" width="18" height="26" rx="4" fill="#0f2336" stroke="#38bdf8" strokeWidth="1.6" />
              <rect x="34.5" y="19" width="14" height="22" rx="2.6" fill="none" stroke="#64ffda" strokeWidth="0.6" strokeOpacity="0.45" />
              <circle cx="37.5" cy="25" r="2.7" fill="#64ffda" stroke="#ffffff" strokeWidth="0.7" />
              <circle cx="45.5" cy="35" r="2.7" fill="#64ffda" stroke="#ffffff" strokeWidth="0.7" />
            </g>

            {/* 상하 변동 화살표 힌트 */}
            <path d="M 27 12 L 32 8 L 37 12" fill="none" stroke="#64ffda" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 27 52 L 32 56 L 37 52" fill="none" stroke="#f87171" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}

        {/* 하이리스크 하이리턴 (상승 황금 화살 & 하강 적색 화살 대비) */}
        {id === "highRiskHighReturn" && (
          <g>
            {/* 대각선 분리선 */}
            <line x1="15" y1="49" x2="49" y2="15" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
            {/* 좌상단 하이 리턴: 상승 황금/시안 화살표 */}
            <path d="M 21 31 L 21 16" stroke="url(#goldGrad)" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M 14 23 L 21 14.5 L 28 23" fill="none" stroke="#fef08a" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
            <path d="M 13 13 Q 13 15.5 15.5 15.5 Q 13 15.5 13 18 Q 13 15.5 10.5 15.5 Q 13 15.5 13 13 Z" fill="#64ffda" />
            {/* 우하단 하이 리스크: 하강 크림슨 화살표 */}
            <path d="M 43 33 L 43 48" stroke="url(#banRedGrad)" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M 36 41 L 43 49.5 L 50 41" fill="none" stroke="#f87171" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="51" cy="51" r="1.4" fill="#ef4444" />
          </g>
        )}

        {/* 하이 리턴 (3배 공격 버프: 상승하는 3단 황금-시안 셰브론) */}
        {id === "highRiskBuff" && (
          <g filter="url(#glow)">
            <circle cx="32" cy="34" r="19" fill="#facc15" fillOpacity="0.12" />
            {/* 3중 상승 셰브론 */}
            <path d="M 17 45 L 32 32 L 47 45" fill="none" stroke="#f59e0b" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
            <path d="M 16 35 L 32 21.5 L 48 35" fill="none" stroke="url(#goldGrad)" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 18 24.5 L 32 12 L 46 24.5" fill="none" stroke="#fef08a" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
            {/* 상단 코어 다이아 스파클 */}
            <path d="M 32 6 L 34.5 9.5 L 32 13 L 29.5 9.5 Z" fill="#64ffda" />
            <circle cx="15" cy="18" r="1.3" fill="#fef08a" />
            <circle cx="49" cy="18" r="1.3" fill="#64ffda" />
          </g>
        )}

        {/* 하이 리스크 (0.5배 데미지 저주: 균열된 붉은 하강 인장) */}
        {id === "highRiskCurse" && (
          <g>
            {/* 붉은 저주 육각 씰 & 내부 균열 */}
            <polygon points="32,12 49,21.5 49,42.5 32,52 15,42.5 15,21.5" fill="#180509" stroke="url(#banRedGrad)" strokeWidth="1.8" strokeLinejoin="round" />
            {/* 하강 적색 셰브론 2단 */}
            <path d="M 21 24 L 32 34 L 43 24" fill="none" stroke="#f87171" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 21 34 L 32 44 L 43 34" fill="none" stroke="url(#banRedGrad)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
            {/* 사선 균열 & 저주 불티 */}
            <path d="M 19 16 L 26 24 L 24 28 M 45 48 L 38 40 L 40 36" fill="none" stroke="#fca5a5" strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
            <circle cx="32" cy="16" r="1.3" fill="#ef4444" />
            <circle cx="32" cy="48.5" r="1.3" fill="#f87171" />
          </g>
        )}

        {/* 기력의 조각 (황금 다이아몬드 크리스털 샤드 & 스파클) */}
        {id === "revivePiece" && (
          <g filter="url(#glow)">
            {/* 후광 앰버/골드 오라 */}
            <circle cx="32" cy="32" r="18" fill="#facc15" fillOpacity="0.18" />
            {/* 메인 다이아몬드 크리스털 샤드 (마름모) */}
            {/* 상단 좌측 패싯 (하이라이트) */}
            <polygon points="32,12 32,32 17,32" fill="#fef08a" />
            {/* 상단 우측 패싯 (가장 밝은 면) */}
            <polygon points="32,12 47,32 32,32" fill="#fffbeb" />
            {/* 하단 좌측 패싯 (중간 톤) */}
            <polygon points="17,32 32,32 32,52" fill="#f59e0b" />
            {/* 하단 우측 패싯 (그림자 면) */}
            <polygon points="32,32 47,32 32,52" fill="#d97706" />
            {/* 크리스털 내부 코어 */}
            <polygon points="32,20 41,32 32,44 23,32" fill="#fef08a" fillOpacity="0.75" />
            {/* 중앙 빛줄기 라인 */}
            <line x1="32" y1="12" x2="32" y2="52" stroke="#ffffff" strokeWidth="1.2" opacity="0.9" />
            <line x1="17" y1="32" x2="47" y2="32" stroke="#ffffff" strokeWidth="1.2" opacity="0.9" />
            {/* 외곽선 */}
            <polygon points="32,12 47,32 32,52 17,32" fill="none" stroke="#fef08a" strokeWidth="1.4" strokeLinejoin="round" />
            {/* ✦ 스파클 */}
            <path d="M 16 16 Q 16 19 19 19 Q 16 19 16 22 Q 16 19 13 19 Q 16 19 16 16 Z" fill="#ffffff" />
            <path d="M 48 18 Q 48 21 51 21 Q 48 21 48 24 Q 48 21 45 21 Q 48 21 48 18 Z" fill="#fef08a" />
            <circle cx="48" cy="46" r="1.3" fill="#ffffff" opacity="0.85" />
            <circle cx="15" cy="45" r="1.2" fill="#fde047" opacity="0.8" />
          </g>
        )}

        {/* 기력의 덩어리 (기력의 조각 기반 육망성 크리스털 & 스파클) */}
        {id === "maxRevive" && (
          <g filter="url(#glow)">
            {/* 후광 앰버/골드 오라 */}
            <circle cx="32" cy="32" r="21" fill="#facc15" fillOpacity="0.2" />

            {/* 메인 육망성 크리스털 샤드 (6방향 12패싯) */}
            {/* 1. 상단 뿔: 좌측(하이라이트), 우측(가장 밝은 면) */}
            <polygon points="32,10 25.7,21 32,32" fill="#fef08a" />
            <polygon points="32,10 38.3,21 32,32" fill="#fffbeb" />

            {/* 2. 우상단 뿔: 상단(가장 밝은 면), 하단(하이라이트) */}
            <polygon points="51,21 38.3,21 32,32" fill="#fffbeb" />
            <polygon points="51,21 32,32 44.7,32" fill="#fef08a" />

            {/* 3. 우하단 뿔: 상단(중간 톤 골든 앰버), 하단(그림자 면) */}
            <polygon points="51,43 44.7,32 32,32" fill="#f59e0b" />
            <polygon points="51,43 32,32 38.3,43" fill="#d97706" />

            {/* 4. 하단 뿔: 우측(그림자 면), 좌측(중간 톤) */}
            <polygon points="32,54 38.3,43 32,32" fill="#d97706" />
            <polygon points="32,54 32,32 25.7,43" fill="#f59e0b" />

            {/* 5. 좌하단 뿔: 하단(그림자 면), 상단(중간 톤) */}
            <polygon points="13,43 32,32 25.7,43" fill="#d97706" />
            <polygon points="13,43 19.3,32 32,32" fill="#f59e0b" />

            {/* 6. 좌상단 뿔: 하단(화사한 골드), 상단(하이라이트) */}
            <polygon points="13,21 32,32 19.3,32" fill="#fde047" />
            <polygon points="13,21 25.7,21 32,32" fill="#fef08a" />

            {/* 크리스털 내부 코어 (내부 육각 다이아몬드 코어) */}
            <polygon points="32,22 37.7,26.5 42,32 37.7,37.5 32,42 26.3,37.5 22,32 26.3,26.5" fill="#fef08a" fillOpacity="0.8" />
            <circle cx="32" cy="32" r="2.2" fill="#ffffff" fillOpacity="0.95" />

            {/* 중앙 빛줄기 라인 (3대 능선 축) */}
            <line x1="32" y1="10" x2="32" y2="54" stroke="#ffffff" strokeWidth="1.3" opacity="0.92" strokeLinecap="round" />
            <line x1="13" y1="21" x2="51" y2="43" stroke="#ffffff" strokeWidth="1.3" opacity="0.92" strokeLinecap="round" />
            <line x1="13" y1="43" x2="51" y2="21" stroke="#ffffff" strokeWidth="1.3" opacity="0.92" strokeLinecap="round" />

            {/* 육망성 외곽선 (기력의 조각과 동일 스트로크) */}
            <polygon points="32,10 38.3,21 51,21 44.7,32 51,43 38.3,43 32,54 25.7,43 13,43 19.3,32 13,21 25.7,21" fill="none" stroke="#fef08a" strokeWidth="1.4" strokeLinejoin="round" />

            {/* ✦ 스파클 (기력의 조각 동일 구성) */}
            <path d="M 16 14 Q 16 17 19 17 Q 16 17 16 20 Q 16 17 13 17 Q 16 17 16 14 Z" fill="#ffffff" />
            <path d="M 48 16 Q 48 19 51 19 Q 48 19 48 22 Q 48 19 45 19 Q 48 19 48 16 Z" fill="#fef08a" />
            <circle cx="49" cy="48" r="1.3" fill="#ffffff" opacity="0.85" />
            <circle cx="14" cy="48" r="1.2" fill="#fde047" opacity="0.8" />
          </g>
        )}

        {/* 회복약 (포켓몬 공식 회복약 스프레이 디스펜서 & 에메랄드 힐링 아우라) */}
        {id === "fullRestore" && (
          <g filter="url(#glow)">
            {/* 에메랄드 치유 아우라 헤일로 */}
            <circle cx="32" cy="33" r="23" fill="#10b981" fillOpacity="0.14" />
            <circle cx="32" cy="33" r="17" fill="#34d399" fillOpacity="0.1" />

            {/* 전체 스프레이 용기 바닥 그림자 */}
            <ellipse cx="32" cy="54" rx="16" ry="4.5" fill="#000000" fillOpacity="0.3" />

            {/* 스프레이 보틀 본체 (외곽선 그룹) */}
            <g stroke="#221e14" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round">
              {/* 1. 하단 베이스 받침대 (Bottom Base Plinth) */}
              <polygon points="16,47 28,53 47,43.5 47,39.5 28,49 16,43" fill="#aba685" />
              <polygon points="16,43 28,49 28,53 16,47" fill="#cfcaa6" />
              <polygon points="28,49 47,39.5 47,43.5 28,53" fill="#9e9976" />
              <polygon points="16,43 28,49 47,39.5 45,38 28,47 17.5,41.8" fill="#f7f5e8" />

              {/* 2. 약액 용기 우측 후면 기둥 */}
              <polygon points="40,31 47,27.5 47,39.5 40,43" fill="#aba685" />
              <polygon points="44,27 47,25.5 47,30 44,31.5" fill="#cfcaa6" />

              {/* 3. 중앙 녹색 약액 창 (Liquid Window & Green Medicine) */}
              <polygon points="17.5,31.5 28,36.8 28,47 17.5,41.8" fill="#86efac" />
              <polygon points="28,36.8 40.5,30.5 40.5,40.7 28,47" fill="#15803d" />
              <polygon points="28,38 40.5,31.8 40.5,40.7 28,47" fill="#16a34a" />

              {/* 4. 본체 중상단 케이싱 (Upper Body Casing & Grip Slots) */}
              <polygon points="16,31 28,37 47,27.5 47,26.5 28,36 16,30" fill="#635f44" />
              <polygon points="16,23 28,29 28,37 16,31" fill="#ebe9af" />
              <polygon points="28,29 45,20.5 47,27.5 28,37" fill="#b4b17e" />

              {/* 그립 홈 (Finger Grip Ribs on Right Face) */}
              <polygon points="33,28 35,27 35,32.5 33,33.5" fill="#8a8661" />
              <line x1="33" y1="28" x2="33" y2="33.5" stroke="#f7f5e8" strokeWidth="0.7" />
              <polygon points="37.5,25.8 39.5,24.8 39.5,30.3 37.5,31.3" fill="#8a8661" />
              <line x1="37.5" y1="25.8" x2="37.5" y2="31.3" stroke="#f7f5e8" strokeWidth="0.7" />

              {/* 5. 상단 펌프 헤드 & 노즐 버튼 */}
              <polygon points="32,10.5 42,15.5 45,20.5 35,16" fill="#aba685" />
              <polygon points="19.5,15.5 28.5,20 28.5,28.5 19.5,24" fill="#ebe9af" />
              <polygon points="28.5,20 38,15.2 38,23.8 28.5,28.5" fill="#cfcaa6" />
              <polygon points="19.5,15.5 29,11 38,15.2 28.5,20" fill="#fcfbf2" />

              {/* 노즐 분사구 구멍 */}
              <ellipse cx="23.5" cy="18" rx="1.1" ry="1.4" fill="#221e14" />

              {/* 펌프 분리 홈 */}
              <path d="M 32 12.5 L 34 16 L 33 21" fill="none" stroke="#221e14" strokeWidth="1.3" />
            </g>

            {/* 6. 하이라이트 & 디테일 레이어 */}
            <polygon points="32,36 36.5,33.8 34,42 29.5,44.2" fill="#ffffff" fillOpacity="0.45" />
            <line x1="18.5" y1="32.5" x2="27.5" y2="37" stroke="#ffffff" strokeWidth="1.0" opacity="0.6" strokeLinecap="round" />
            <path d="M 20 15.5 L 29 11 L 37.5 15.2" fill="none" stroke="#ffffff" strokeWidth="1.1" opacity="0.75" strokeLinecap="round" />
            <line x1="28.5" y1="20" x2="28.5" y2="28.5" stroke="#ffffff" strokeWidth="0.9" opacity="0.6" />
            <line x1="28" y1="29" x2="28" y2="37" stroke="#ffffff" strokeWidth="0.9" opacity="0.5" />

            {/* 7. ✦ 힐링 스파클 & 에메랄드 버블 */}
            <path d="M 11 15 Q 11 17.5 13.5 17.5 Q 11 17.5 11 20 Q 11 17.5 8.5 17.5 Q 11 17.5 11 15 Z" fill="#6ee7b7" />
            <path d="M 52 24 Q 52 26.5 54.5 26.5 Q 52 26.5 52 29 Q 52 26.5 49.5 26.5 Q 52 26.5 52 24 Z" fill="#34d399" />
            <circle cx="14" cy="27" r="1.3" fill="#a7f3d0" opacity="0.9" />
            <circle cx="51" cy="43" r="1.2" fill="#6ee7b7" opacity="0.85" />
            <circle cx="12" cy="43" r="1.0" fill="#34d399" opacity="0.8" />
            <circle cx="21" cy="8" r="0.9" fill="#ffffff" opacity="0.9" />
          </g>
        )}

        {/* 모루 능력치 (Stat Anvil / Anvil Shard) */}
        {(id === "anvilStat" || id === "anvilStatBuff") && (
          <g>
            <defs>
              <radialGradient id="anvilBgGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#064e3b" />
                <stop offset="65%" stopColor="#022c22" />
                <stop offset="100%" stopColor="#01140e" />
              </radialGradient>
              <linearGradient id="anvilBodyGrad" x1="20%" y1="15%" x2="85%" y2="85%">
                <stop offset="0%" stopColor="#a3e635" />
                <stop offset="35%" stopColor="#84cc16" />
                <stop offset="70%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
              <linearGradient id="anvilRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#bef264" />
                <stop offset="50%" stopColor="#65a30d" />
                <stop offset="100%" stopColor="#a3e635" />
              </linearGradient>
              <filter id="anvilNeonGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* 외부 어두운 배경 원반 */}
            <circle cx="32" cy="32" r="28" fill="url(#anvilBgGrad)" />

            {/* 내부 방사형 에메랄드 오라 */}
            <circle cx="32" cy="32" r="20" fill="#22c55e" opacity="0.25" filter="url(#anvilNeonGlow)" />

            {/* 외곽 네온 라임 링 */}
            <circle cx="32" cy="32" r="27.5" fill="none" stroke="url(#anvilRimGrad)" strokeWidth="2.5" filter="url(#anvilNeonGlow)" />
            <circle cx="32" cy="32" r="25.5" fill="none" stroke="#bef264" strokeWidth="0.8" opacity="0.8" />

            {/* 중앙 모루 심볼 (Hourglass Anvil Shape) */}
            <g filter="url(#anvilNeonGlow)">
              <path d="M 18 20 C 21 19, 43 19, 46 20 C 47 23, 44 26, 42 27 C 36 30, 36 34, 42 37 C 44 38, 47 41, 46 44 C 43 45, 21 45, 18 44 C 17 41, 20 38, 22 37 C 28 34, 28 30, 22 27 C 20 26, 17 23, 18 20 Z" fill="url(#anvilBodyGrad)" stroke="#d9f99d" strokeWidth="1.2" strokeLinejoin="round" />
              {/* 상단면 하이라이트 */}
              <path d="M 19 21 L 45 21 L 42 25 L 22 25 Z" fill="#fef08a" opacity="0.5" />
              {/* 중앙 허리 음영 */}
              <ellipse cx="32" cy="32" rx="4.5" ry="3" fill="#14532d" opacity="0.6" />
              {/* 우측 하단 황금빛 파편 발광 */}
              <path d="M 32 32 L 42 37 C 44 38, 46 40, 45 43 L 32 44 Z" fill="#facc15" opacity="0.75" />
              {/* 좌측 상단 라임 하이라이트 */}
              <path d="M 19 21 L 32 21 L 32 32 L 22 27 Z" fill="#ecfccb" opacity="0.4" />
              {/* 중앙 엣지 크로스 라인 */}
              <path d="M 22 25 L 32 32 L 42 25 M 32 32 L 32 44 M 22 37 L 32 32 L 42 37" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.4" />
            </g>

            {/* 외부 스파크 / 파편 파티클 */}
            <circle cx="16" cy="17" r="1" fill="#bef264" opacity="0.9" />
            <circle cx="48" cy="18" r="1.2" fill="#facc15" opacity="0.9" />
            <circle cx="49" cy="46" r="1" fill="#bef264" opacity="0.8" />
            <circle cx="15" cy="45" r="0.9" fill="#86efac" opacity="0.8" />
          </g>
        )}
        {/* 신을 제물로 (오벨리스크의 거신병: 순수 SVG 벡터 그래픽 & 거신 강림 링 테두리) */}
        {id === "sacrificeGod" && (
          <g>
            {/* 1. 배경 원 */}
            <circle cx="32" cy="32" r="29.5" fill="url(#sacrificeGodBg)" />

            {/* 2. 거신 강림 푸른 신성 오라 */}
            <circle cx="32" cy="28" r="16" fill="#38bdf8" opacity="0.25" filter="url(#glow)" />
            <circle cx="32" cy="38" r="14" fill="#0284c7" opacity="0.18" filter="url(#glow)" />

            {/* 3. 오벨리스크 순수 SVG 벡터 패스 (원형 테두리 내 최적 스케일링) */}
            <g transform="translate(6.50, 6.70) scale(0.2000)">
              <path fill="#0F213B" opacity=".9" d="M185.5 65l1.5 4.5-3-2 1.5-2.5zM71.5 66l-.5 1.5-.5 1.5-1.5-.5 2.5-2.5zM103.5 66l1.5 2.5h-1l-.5-2.5zM113.5 68l2.5.5.5 2.5 2.5 1.5 2.5 3.5 1.5.5.5 3.5 1.5.5 1 3-2 3 3.5 1.5 2-3 1.5-.5v-4l2.5-4.5 2.5-1.5 1.5-2.5 5-4 2 3 5.5.5-3 2-.5 1.5-1.5.5 1 3-6 4-.5 1.5-6.5 3.5q1 4.5-1.5 5.5l-2-3-2 3-1.5.5q2.5 1.5-1 3l-1 3q3.2 1.8 3 7l-3 7 6.5 15.5 1.5-.5 5-14v-4l-4-6 2-7-2-4 4.5-1.5 1.5.5 1.5-3.5 4-1 .5 1.5-8 6 1 3-2 4-1 3 2 1 4.5 6.5 23 8 9.5-6.5 2-6-3-2-2-5q2.5-1.5-1-3l-2-4 2.5-1.5 3.5 6.5-.5 1.5 1.5.5 1.5 5.5 7 5h8q3.6-2.9 11-2l4.5 3.5.5 1.5 10.5 9.5 2.5 4.5 3.5 1.5 1 3v2q2.1 10.1-2.5 13.5l-.5-12.5-3.5-5.5-14-12-7-1-.5 2.5q4.5 4.5 4 14l3.5 4.5 4.5 2.5 3 14 3.5 5.5 4-3 5.5 2.5-3.5 1.5q-1.2-2.2-2.5.5l-1 4 8 16q-1.5 5.5 1 7v22q-1.5 3-3 0v-24q-2.2-1.3-1-6l-6-12-3.5-3.5-15-4q-3.9 3.6-2.5 12.5 8.3 7.2 13 18l3 11v7l-5 15 5.5 6.5 4-2q4.5 1 3.5 7.5h-1l-.5-2.5-3-1-3 1-5-3-6.5 5.5-.5 9.5-13.5-.5v-19l-1-1q2.5-1.5 1-7l-1-3v-31l-1-3 1-2-1-1v-19l-1-2 1-3-6-4-2.5-3.5-10-4-5.5 24.5 6.5 6.5 1-1 5-3 3.5 7.5 3 15-6 16v4l4 10-4 9-1.5 14.5-75.5-.5-1-14-4-8 5-10-8-22 6.5-21.5 9 6 3.5-7.5-7-13-2.5-9.5-3-2-9.5 6.5v42l-1 1v38q5.4 4.6 6 14l-2.5.5-2.5-8.5-2.5-3.5-10-4-2 2-6.5.5v4l-4.5 5.5-6 3-2.5-1.5 10-7 1-10-7-20-5-35-9-10 5-3v-5l-4.5-9.5-1.5-.5-1.5-6.5-3 1-.5-1.5 7-11L53.5 116l11-6q10.8 1.7 17-1l7.5-7.5 2-10q-2.2-1.2-1-6l1.5-2.5 5-1 1.5 2.5-5 1-1 9 1 3-2 6-6 7v2l5.5 6.5 7 3 10-3 13.5-6.5q3.7-2.3 3-9-2.8-1.7-2-7l-2-2q1.3-2.7 2.5-.5l2.5-1.5-.5-4.5-6-5-3.5-.5-1.5-2.5q-1.2 2.3-2.5-.5l1-2-2-1q.8-3.7-1.5-4.5l-2 1-.5-1.5 2.5-1.5 1.5.5.5-1.5 2 1 1-2zm26.5 48l-2 5 19 12 2 4v1h-2q-8-10-20-15l-4 10 8 3 7 9 4 2 4-1 3-2-1 4-4 2-2 15v1l4-2 5-7v-6l2-8 5-4q5-5 7-14v-4h-2l-5 4h-7l-21-9zm-19 1l-20 9q-8 1-11-2l-4-2v5l3 8 11 8 2 3 4 14 5 5h2q-3-4-2-12l-7-6 1-3 8 4 6-7q4-6 11-8l-4-9q-12 5-19 15h-3l-1-1 6-5v-1l15-11-1-3-2-1zm-50 1l-3 1-5 6-8 17q-1 3-3 0l4-14v-3l-4 2-7 8q-2 13 4 18l9 7h8l6-3q7-6 10-16 2-7-1-8l1-4-2-6q-2-5-9-5zm113 1l-5 10q-1 8 2 12 2 5 11 4l6-7q1-8-2-11l-10-8h-2zm-49 17l-2 2q-2 8 1 12l6 3 3 6 5 3 2-3v-7l-10-11-5-5zm-7 1l-8 10-6 5 1 9 4 1q3-2 3-6l6-4 3-4-1-10-2-1zm-70 30l-4 4v7l1 1v7l1 1 2 17 8 26h5l5-6-6-11-2-8v-10l4-14v-7q-2-4-8-3l-6-4zM193.5 72l1.5 2.5-3.5 1.5-.5-1.5 2-1 .5-1.5zM61.5 73l2.5 1.5-2.5.5v-2zM44.5 75l1.5 3.5-2 1-1-3 1.5-1.5zM71.5 75l1.5.5q.8 4.8-2.5 5.5L68 79.5l.5-1.5 1.5-.5 1.5-2.5zM183.5 75l1.5.5 2 5-1.5.5q-3.6-1.9-2-6zM211.5 75l1.5.5-1.5 4.5-1.5-3.5 1.5-1.5zM89.5 76l1.5 2.5-1.5.5v-3zM164.5 76l2.5.5-.5 3.5-1.5-.5-.5-3.5z" />
              <path fill="#0F213B" opacity=".9" d="M160.5 82l2.5 1.5-.5 1.5-5.5-1.5 3.5-1.5zM48.5 83l2.5 3.5-1.5 2.5-1.5-.5-1-4 1.5-1.5zM207.5 83l1.5.5-1.5 5.5q-2.2-.7-1.5-4.5l1.5-1.5zM103.5 84l4.5 2.5-.5 1.5-6.5-2.5 2.5-1.5zM33.5 85l1.5 2.5h-3l1.5-2.5zM149.5 85l4.5.5-.5 1.5-3 1q-1.5-2.5-3 1l-1.5-1.5 3.5-2.5zM165.5 85l1.5.5 2 6-1.5-.5-2.5-1.5-1-2 1.5-2.5zM222.5 85l1 2-2 1 .5-1.5.5-1.5zM112.5 88l2 1h2l3.5 1.5-1.5 2.5-6.5-3.5.5-1.5zM41.5 90q3.8-.7 4.5 1.5L43.5 93l-1-2-1.5.5.5-1.5zM213.5 90l1.5.5-.5 1.5-1.5-.5-.5 1.5-2.5-1.5 3.5-1.5zM204.5 91l2.5 4.5-3.5.5-.5-3.5 1.5-1.5zM51.5 92l1.5.5 1 2-1.5 2.5-3.5-1.5.5-2.5 2-1z" />
              <path fill="#2F5780" opacity=".8" d="M127.5 4l1.5.5-.5 2.5-1.5-.5.5-2.5zM68.5 45l1.5 1.5-.5 2.5-1.5-1.5.5-2.5zM143.5 59l2.5 1.5-1.5-.5-3 2 2-3zM115.5 60l2.5 1.5-2 1-.5-1.5-1.5.5 1.5-1.5zM130.5 74l2.5.5v2l-.5 1.5-2-4zM124.5 75l-.5 1.5-.5 1.5-.5-1.5 1.5-1.5zM65.5 76l2.5 1.5h-3l.5-1.5zM102.5 76l-1 2-1.5-.5 2.5-1.5zM93.5 85l.5 4.5h-1l.5-4.5zM129.5 90l1 2-2.5-.5 1.5-1.5zM238.5 106l.5 4.5h-1l.5-4.5zM66.5 109l3.5.5-3.5.5v-1zM174.5 121l.5 3.5h-1l.5-3.5zM162.5 125l3.5.5-3.5.5v-1zM96.5 126l3.5.5-3.5.5v-1zM179.5 132l.5 3.5h-1l.5-3.5zM81.5 133l.5 7.5h-1l.5-7.5zM37.5 135l-2.5 3.5.5 1.5-1.5-1.5 3.5-3.5zM134.5 136l5.5 4.5-4.5-3.5-1.5.5-.5 10.5-.5-10.5 1.5-1.5zM130.5 141l.5 6.5h-1l.5-6.5zM166.5 144l10 4 2.5 2.5 2.5 3.5 3.5 1.5-1 4 1 1v19l1 2-1 3 1 1v29l1 1-1 3q2.5 1.5 1 7v2l-.5 20.5-13.5-.5v-10l5-15-4-9v-4l6-16v-4l-5-17-1.5-1.5-6 4-6.5-6.5 1-1 4.5-23.5zM95.5 145l3.5 2.5 2 9 7 15-3.5 5.5-9-6-6.5 22.5 8 23-5 8 4 8 1 15-4.5.5q-3-2-2.5-7.5l-5-8v-36l1-3v-42l1.5-1.5 8-5zM224.5 146l.5 1.5-2 1 1.5-2.5zM153.5 150l.5 8.5h-1l.5-8.5zM110.5 152l.5 6.5h-1l.5-6.5zM220.5 158l4.5.5-4.5.5v-1zM148.5 160l-1 2-1.5-.5 2.5-1.5zM198.5 162l1.5.5-2.5 1.5 1-2zM196.5 166l.5 8.5h-1l.5-8.5zM226.5 185l.5 3.5h-1l.5-3.5zM223.5 187l.5 3.5h-1l.5-3.5zM56.5 189l.5 3.5h-1l.5-3.5zM215.5 234l3.5 2.5-2.5-1.5-1-1zM202.5 236l-.5 1.5-.5 5.5-.5-5.5 1.5-1.5z" />
              <path fill="#69A5D3" opacity=".7" d="M111.5 10l2.5 1.5-.5 1.5-3.5 2.5-1.5 2.5.5-1.5 1-2-.5-1.5q1.3 2.3 2.5-.5l-.5-2.5zM129.5 10l3.5 11.5 2 2-3-2-3-9 .5-2.5zM142.5 12l4 3q1.3-2.2 2.5.5h-2l3 7h-1q-.9-6.6-5.5-9.5l-1-1zM47.5 16l3.5 5.5 1 2-2-1-1.5-2.5-.5 1.5.5 1.5-2.5-3.5 3-1-2-1 .5-1.5zM206.5 16l2.5.5 1 3q-2-1.7-4 2l-1.5 2.5.5-1.5 2-3-.5-3.5zM107.5 19l-.5 1.5-.5 2.5-.5-2.5 1.5-1.5zM103.5 23l.5 4.5h-1l.5-4.5zM152.5 23l.5 4.5h-1l.5-4.5zM136.5 24l3.5.5-3.5.5v-1zM150.5 24l.5 3.5-1.5 2.5-.5-1.5 1.5-4.5zM52.5 25l4.5 5.5-2.5-1.5-1 1-2.5-2.5 3 1-1.5-3.5zM193.5 25l.5 2.5-1.5 1.5-.5-2.5 1.5-1.5zM203.5 25l-1.5 2.5-2 4 3-1-7.5 8.5q-1.8-2.8-3.5 1.5l.5 1.5 2.5-1.5-3.5 3.5q-1.2-2.2-2.5.5l1 1-4.5 4.5-2 1v-2l-5.5 3.5 1.5.5 1.5-.5-5.5 3.5v-2l-2.5 1.5q2.3 1.3-.5 2.5v-2l-5 3-1-3-2.5-.5 2.5-.5 4 1L191 41.5 203.5 25zm-4.5 8l-2 3 2-1v-2zm-12 13l-2 3 3-2-1-1zM83.5 27l1.5.5-.5 2.5-1-3zM190.5 27l.5 2.5-1.5 1.5-.5-2.5 1.5-1.5zM106.5 29l2.5 3.5-4-1 1.5-2.5zM85.5 31l1.5 3.5h-1l-.5-3.5zM148.5 31l-1.5 2.5.5 1.5 1.5-.5-5.5 3.5-1.5-.5q.8-3.7-1.5-4.5l-1.5.5 1.5 2.5-3-2-1 3-.5-2.5.5-1.5-1.5.5 1 6-2.5 1.5-1.5-.5q.9 6.4-3 8l1.5.5 2-3 .5 1.5-4 3-.5-1.5-1.5.5-.5 1.5-1-2 1.5-.5-2-3h1l1.5 2.5 2.5-1.5 1-5-1.5-2.5 1.5-.5-3-1 .5-1.5 5 4q2.8-1.2.5-2.5-1-4.5 1.5-5.5l3 1 2-1 3 4 2.5-1.5 2.5-3.5zM170.5 31l.5 1.5-5.5 10.5.5-1.5 4.5-10.5zM55.5 32h2l3.5 3.5 6.5 8.5 7.5 5.5q-2.2 1.3.5 2.5l1.5-.5-.5-1.5 7 5 5 1 4-1v1l-9 2v-1l1.5-.5-4.5-2.5 1 3q-3.7-2-2-4l-3 1-4.5-3.5 2-1-2.5-1.5-1 2-.5-1.5q2.8-1.7-1.5-3.5l-1.5.5.5 1.5-7-8 4.5 3.5-4.5-5.5-1 1-3.5-3.5-.5-2.5zm2.5 1l-1 2 3 2-2-4zM116.5 32l3.5.5v2l-.5 1.5-1-2-1.5.5.5-1.5-3.5 2.5-.5 1.5-3-1q-1.8 2.8-3.5-1.5l2.5-.5 2 2 5-4zM25.5 33L38 47.5 34.5 45l-1 1-3.5-3.5 4 2-4.5-5.5q-1.7 2.7-3.5-1.5h2L25.5 33zM73.5 34l2.5 1.5-1.5.5-1-2zM121.5 34l.5 3.5-1.5 2.5-.5-1.5 1.5-4.5zM87.5 36q3.2 8.8 10 14l12.5 7.5-2 1 2 1-1.5.5-2-4-2 1-1-3-7-4q-3 1.5 0 3l1.5.5-.5 1.5-3.5-.5 2-1-6-5 .5-1.5 2 3 2 1q3-1.5 0-3-1.2 2.3-2.5-.5 2.5-1.5-1-3l-4-7 .5-1.5zM171.5 36l.5 2.5-1.5 1.5-.5-2.5 1.5-1.5zM230.5 36l-4 5q-1.7-2.7-3.5 1.5l-1 2 .5 1.5q-1.8-2.7-3.5 1.5l.5 1.5 1.5-.5-5 3-3 6 .5 1.5q-1.2-2.2-2.5.5l-1.5 3.5-5.5 2.5q2.3 1.3-.5 2.5l-.5-2.5 1.5-1.5 5.5-3.5q6.6-13.9 17.5-23.5 1.5 2.5 3-1zM124.5 38l.5 2.5-.5 1.5-2.5-1.5 2.5-2.5z" />
              <path fill="#69A5D3" opacity=".7" d="M137.5 38l1.5 2.5-2.5 1.5.5-1.5.5-2.5zM115.5 40q6.2-.7 7.5 3.5l-.5 1.5-2-3-5-1-2.5 1.5 1 4h-1l-1-5 3.5-1.5zM140.5 40l3.5 1.5-2.5.5-1-2zM49.5 41l3.5 2.5-1.5-.5-2-2zM108.5 41l1.5 2.5h-1l-.5-2.5zM134.5 42l-.5 1.5-.5 1.5-.5-1.5 1.5-1.5zM143.5 43l.5 1.5-1.5 2.5-.5-1.5 1.5-2.5zM164.5 44l-6 7-2.5 1.5q2.3 1.2-.5 2.5v-2l-4 2 1-2q7.8-2.7 12-9zM145.5 45l.5 1.5-1.5 2.5-.5-1.5 1.5-2.5z" />
              <path fill="#69A5D3" opacity=".7" d="M166.5 46l-.5 1.5-3.5 4.5-2.5 1.5 3 1-4.5.5-.5-1.5 5-3 .5-1.5 1.5-.5 1.5-2.5zM58.5 47l6 6q1.8-2.8 3.5 1.5L65.5 53l-1 1-6-7zM36.5 49h2l2.5 2.5L48.5 63 61 70.5l-1 3 1.5 2.5-7.5-5.5h3l.5 1.5 2.5-1.5-7.5-4.5-1.5.5.5-1.5-3-1-2 1v-1l1.5-.5-5-3h2L42.5 56q-1.2 2.3-2.5-.5h2L38.5 50l-.5 1.5.5 1.5-2-4zM119.5 50l3.5 2.5-2 1 .5-1.5-3 2-.5-1.5 2-1-.5-1.5zM136.5 50l1 4-3-2v2l-1.5-.5.5 1.5 2.5.5-3.5 1.5-1.5-3.5 5.5-3.5zM144.5 50l1.5 5.5h-1l-.5-5.5zM111.5 51l.5 2.5-1.5 2.5-.5-1.5 1.5-3.5zM114.5 52l2.5 1.5 1 3h-1l-1.5-3.5-1.5.5.5-1.5zM140.5 52l1.5.5-.5 1.5-1.5-.5-1.5 3.5-.5-1.5 2.5-3.5zM10.5 53l2.5 1.5-2.5.5v-2zM124.5 53l-.5 1.5 3 5-.5 2.5-4-6-1 2-1.5-.5.5-2.5 4-2zM245.5 53l.5 1.5-2.5.5v-1l2-1zM113.5 55l3.5 4.5-1.5-.5-1.5-.5-.5-3.5zM142.5 55l.5 1.5q-4.3 2.3-2.5 4.5-3.8-2.3 1.5-4.5l.5-1.5zM149.5 55v2l1.5.5-3 2-1 2 .5 1.5-1.5-1.5.5-2.5 1.5-.5-2-1 3.5-2.5zM190.5 55l-.5 1.5-.5 1.5-.5-1.5 1.5-1.5zM11.5 56l4.5 7.5-2-1-2.5-6.5zM244.5 56l-.5 1.5-4 9 1 2-2.5 3.5.5-1.5 1-3-2 1q-2.1 9.4-8.5 14.5l-4 1v-1q4.8-.2 6.5-3.5L244.5 56zM246.5 56l.5 1.5-2 1 1.5-2.5zM130.5 58l.5 2.5q-1.5 3-3 0l2.5-2.5zM70.5 59l1.5 5.5h-1l-.5-5.5zM118.5 60l3.5 8.5h-1l-1.5-3.5-1.5.5q-1.3 7.8 4 9l-5-4q-1.2-4.7 1-6l-1-2h2l-.5-2.5zM137.5 60l-.5 1.5.5 1.5 1.5-.5-.5 2.5-3.5 1.5-.5 2.5-3.5-6.5 1.5.5 2-1-.5 1.5.5 2.5q4.3-1.7 1.5-3.5l1.5-2.5zM232.5 60l-1 2-4 2 1-2 4-2zM25.5 61l3.5 2.5-1.5-.5-2-2zM114.5 62l.5 5.5-1.5.5.5-1.5.5-4.5zM124.5 62l-2 3-1-2 3-1zM141.5 62l1.5 5.5-1.5.5v-6zM103.5 63l1.5.5-1.5 2.5-3-1-2 1v-1l5-2zM151.5 63l3.5 1.5-2.5 1.5-1-3zM30.5 64l3.5 2.5-1.5-.5-2-2zM14.5 65l2.5 4.5-2-1-.5-3.5zM16.5 65l10 17 7.5 2.5-1.5.5-6-2-3-3-1 2-.5-1.5 1-2L16.5 65zM162.5 66l1.5.5-2.5 1.5 1-2zM201.5 66l-1 2-2.5 1.5 2.5 1.5 1.5-.5-7.5 5.5 2-3 2.5-1.5-2.5-1.5v2q-3-1.5 0-3l5-3zM35.5 67l4 3 1.5-.5q-1.7 3.3-3.5-.5l-2-2zM72.5 67l.5 5.5h-1l.5-5.5zM220.5 67l-1 2-3 2-1-2q1.5 2.5 3-1l2-1zM89.5 68l2 1 1.5-.5q-1.2 2.8-2.5.5l-1.5.5 2 5h-1L88.5 70l-1.5.5 2.5-2.5zM110.5 68l1.5.5-3.5 1.5v-1l2-1zM124.5 68q1.2 2.3 6 1l1.5-.5q-1.2 2.8-6.5 1.5l-1-2zM144.5 68l3.5 1.5-1.5.5-2-2zM43.5 70l2.5 4.5h-3l1-2-.5-2.5zM106.5 70l-1.5 2.5 1 2-2 1 .5-1.5-1.5-.5.5-2.5q1.5 2.5 3-1zM149.5 70q1.8 3.1 3.5 1.5l-.5 1.5-3-3zM183.5 70l1.5 3.5-1.5.5v-4zM212.5 70l.5 1.5-2.5 3.5.5-1.5 1.5-3.5zM169.5 71l1.5 10.5 12.5 21.5q3 3 9 3 4-3 12-2l4 2 11 11q1.9 3.6 8 3l5.5-4.5 4.5-12.5.5 12.5-3 7 3-1q-1.7 4.2-3.5 1.5l-5.5 5.5 1.5.5 2.5-1.5-3 3q2.3 1.3-.5 2.5l-3 1v-1l1.5-.5-2-1 3-2-1.5-.5-4 1-1-2q-1.3 2.3-2.5-.5l.5-1.5-6.5-5.5-5.5-6.5-5-4h-8l-1-1-1 2-8 1-8.5-5.5-4-11-7-11v-3l3.5-10.5zm28.5 37v1h3l-3-1zM65.5 73l4.5 3.5-1.5.5-3-4zM86.5 73L90 83.5v13q-1.9 7.7-7.5 11.5-4 3-12 2l-4-1-8 3L43 125.5l-1.5 2.5-1.5.5 1 2-8.5 9.5q-7.1-.4-10-5l-1 1-3.5-3.5 5 1 .5-2.5q1.5 2.5 7 1l19-22 12-7 15-1 5.5-4.5 5-11v-10l-.5-3.5z" />
              <path fill="#69A5D3" opacity=".7" d="M147.5 73q4-.5 4.5 2.5l-2.5-1.5q-3 .5-2-1zM190.5 73l-2.5 3.5 1.5 1.5 1-2 2.5.5-5.5 4.5 1.5-2.5-1.5-1.5-1.5-.5 4.5-3.5zM155.5 74l.5 3.5h-1l.5-3.5zM182.5 75l.5 5.5h-1l.5-5.5zM47.5 79l2.5 3.5-2-1-.5-2.5zM35.5 85l7.5 3.5-1.5.5-2-1 .5 1.5 1 2-1.5-.5-4.5-1.5 1.5-.5 2 1v-3q-3.8-.2-3-2zM219.5 85l1.5.5-2 1 .5 1.5-2-1-4 2v-1l6-3zM211.5 87v3l-5 2v-1l3.5-1.5 1.5-2.5zM219.5 89l1.5.5-3.5 1.5v-1l2-1zM46.5 90l3.5 1.5-2.5.5-1-2zM93.5 90l.5 6.5h-1l.5-6.5zM128.5 92l.5 2.5 2 32h-1l-2-5 .5-1.5-2.5-1.5 1-3h-2l-1-4 3.5-5.5 1.5.5-.5-1.5-1.5-.5-1-3 1-2h-2l3.5-7.5zM210.5 93l1.5.5-4.5 2.5 1-2 2-1zM46.5 94l2.5 1.5-1.5-.5-1-1zM240.5 107l.5 3.5h-1l.5-3.5zM183.5 119l2.5 1.5.5 1.5 1.5-.5.5 1.5h2l6.5 5.5-1 5h1l.5-1.5.5 4.5h-1l-.5-1.5-.5 2.5.5 1.5-1.5.5 1 1-3.5 3.5-2-1v2l-3.5-.5-.5-1.5-1.5.5-.5-1.5-1.5.5.5-1.5-2.5-1.5 1-2-2-1 1-7-1-2 2-1-.5-1.5 1.5-.5-1-2h2l-.5-3.5zM173.5 121l.5 2.5-.5 3.5-1.5.5 1 3-1.5 2.5-1.5.5 1 1-5.5 5.5q-1.7-2.8-3.5 1.5v2l-.5 4.5-1-5-4.5 1.5 3-3-1-1 1-5-1.5-2.5 2.5-1.5 2-5-2-1 1.5-.5 5 2v-2q5.2-.3 7-4zM86.5 122l1.5.5-1 2 1.5-.5 7.5 2.5-2 1 2.5.5h2l1.5-.5.5-1.5q-.4 6.8 4.5 8.5l-3 2 2 3-.5 1.5 1.5.5-1 5v2l-.5 1.5-.5-1.5.5-1.5-1.5-.5-1.5-3.5-5.5-3.5-.5-1.5q-1.8 2.8-3.5-1.5l.5-1.5-2.5-1.5-1-3 1-2h-2l-.5-6.5zM242.5 127l1.5.5-1.5 4.5v-5zM9.5 128l1.5.5-1 2v18q2.3 1.3 1 6h-1q1.2-4.7-1-6l.5-20.5zM7.5 129l.5 3.5H7l.5-3.5zM244.5 130l.5 4.5h-1l.5-4.5zM225.5 136l.5 7.5h-1l.5-7.5zM247.5 136l.5 4.5h-1l.5-4.5zM245.5 138l.5 4.5h-1l.5-4.5zM39.5 139l.5 2.5-1 3 3 1-2.5 2.5-3.5-2.5-.5 1.5-2 1-2.5-1.5q-1.7 8.7 2.5 11.5h2l1.5-.5.5-2.5 2 3 3.5 2.5-2.5-1.5-3-1-.5 2.5.5 1.5-2 1-1-2 1.5.5-.5-2.5-2 1q-5.1-3.4-3.5-13.5l1.5-3.5 8-4zm-2.5 3l-3 2 1 1 2-1v-2zM236.5 142l1.5 3.5-2-1 .5-2.5zM7.5 144l.5 4.5H7l.5-4.5zM158.5 147l1.5.5 1 6h-1l-.5-1.5-.5 4.5.5 1.5-1.5-.5 1 2-3 1-.5 1.5-2.5-1.5.5-1.5 1 2 .5-3.5-1-3 1-3-.5-1.5 2 1q-1.7-2 2-4zM238.5 147l.5 1.5-7 6q5.4-2.7 3.5-5.5 1.2 2.3 2.5-.5l.5-1.5zM248.5 147l.5 6.5h-1l.5-6.5z" />
              <path fill="#69A5D3" opacity=".7" d="M28.5 148l.5 5.5h-1l.5-5.5zM233.5 148l.5 1.5-2 1 1.5-2.5zM105.5 150l2.5.5-.5 1.5 2-1 .5 2.5-1.5 6.5-2.5-1.5 1-2h-2l1-4h-2l1.5-2.5zM148.5 150l1.5 2.5h-1l-.5-2.5zM23.5 151l3.5 1.5-2.5.5-1-2zM41.5 151l2 1 1.5-.5-2.5 3.5-1-4zM230.5 151l-2.5 3.5.5 1.5q-1.2-2.2-2.5.5l-.5 1.5-.5-1.5 5.5-5.5zM25.5 154q1.8 3.1 3.5 1.5l-1.5 1.5-2-3zM46.5 155l.5 3.5h-1l.5-3.5zM246.5 155l.5 4.5h-1l.5-4.5zM11.5 156l1.5 7.5 6.5 13.5 7-8-2.5 3.5 1 2-4 2 .5 1.5q1.3-2.2 2.5.5l-5 2 1-2-3.5-4.5-1.5.5 1-3q-5.2-6-4.5-15.5zM110.5 159l1.5 5.5-3-2 1.5-3.5zM220.5 162l3.5.5q-1.2 2.8-2.5.5l-1.5.5-.5 1.5-.5-1.5 1.5-1.5zM225.5 163l.5 13.5-1 2 1 2h-1l-2-5h1l.5 1.5.5-3.5-1.5-.5-1.5.5q3.6-1.4 3-7l-1-2 1.5-1.5zM198.5 167l1.5.5 1 2-2 1-.5-3.5zM219.5 167l1.5 2.5-2-1 .5-1.5z" />
              <path fill="#69A5D3" opacity=".7" d="M12.5 168l1.5 2.5-2-1 .5-1.5zM246.5 171l.5 5.5h-1l.5-5.5zM248.5 171l.5 5.5h-1l.5-5.5zM201.5 176l1 2-2 1 .5-1.5.5-1.5zM21.5 181l-2 3-2.5-.5 4.5-2.5zM245.5 182l.5 5.5h-1l.5-5.5zM206.5 184l4.5 3.5 1 2-3.5 1.5 1.5-2.5-1-1-1.5-2.5-1.5.5.5 1.5q-3-1.5 0-3zM247.5 184l.5 4.5h-1l.5-4.5zM217.5 186l.5 2.5-2 1 1.5-3.5zM217.5 192l1.5.5-1 7q2.2 1.3 1 6l-1 4 1 3-2 1 1 3-2 1 1 2h-2l1 3-1.5 3.5-1.5.5 1 3-.5 2.5-3-5q-1.2 2.3-2.5-.5l1-2-1-2h2l-1-2h2l-1-3h1l.5 1.5q3.3-1.7-.5-3.5l.5-1.5 1 2 1.5-.5-.5-3.5-1.5-.5v-8l2-4-1-3 4-1 .5-3.5zm-3.5 12l-1 6h2v-5l-1-1zM244.5 192l.5 4.5h-1l.5-4.5zM246.5 194l.5 3.5h-1l.5-3.5zM67.5 197l.5 4.5h-1l.5-4.5zM227.5 198l.5 8.5h-1l.5-8.5zM243.5 201l.5 3.5h-1l.5-3.5zM245.5 203l.5 3.5h-1l.5-3.5zM242.5 208l.5 5.5h-1l.5-5.5zM226.5 212l-.5 1.5-.5 1.5-.5-1.5 1.5-1.5zM241.5 215l.5 3.5h-1l.5-3.5zM47.5 243l3.5 1.5-2.5.5-1-2zM201.5 243l1 4 18.5.5-19.5.5v-5zM87.5 245l.5 2.5-34.5.5-.5-1.5 1.5.5 32.5-.5.5-1.5zM48.5 246l3.5.5-3.5.5v-1zM53.5 249l34.5.5-34.5.5v-1zM202.5 249l17.5.5-17.5.5v-1z" />
              <path fill="#99CBF7" d="M127.5 8l1.5 1.5 3 12 5.5 6.5q7.3 1.3 8.5-3.5l-1-9h1q4 4 4 12l-5.5 8.5-1.5-.5-2.5-3.5q-5.2-1.2-6.5 1.5l1 5q-2.3 3.7-4.5-1.5l-2-1-1.5.5 1-1v-25l-.5-2.5zM110.5 15l.5 2.5q-2.3 1.3-1 6l3.5 4.5 3 1 6-2 .5 4.5-1.5 2.5q-.7-2.7-5-2l-5 4-5.5-7.5v-5l4.5-8.5zM48.5 18l2.5 1.5L61.5 31l16 12 11 4 1.5-.5q-.5 4 2.5 4.5l3.5 2.5-2.5 1.5-8 1L66 42.5l-14-18-3.5-6.5zM206.5 19l-1.5 2.5Q198 35 187.5 45l-15 10-5 1-7.5-2.5 6-5 .5-1.5 14-5L202 23.5l-.5-1.5 1 1 4-4zM85.5 28l1 3q1.3-2.3 2.5.5h-2L97.5 44l14.5 5.5-2.5 7.5-12-7-5.5-5.5-7-14 .5-2.5zM169.5 32l-.5 1.5q-2.4 11.1-10.5 16.5l-12 7-2.5-7.5q15.7-2.8 23-14l2.5-3.5zM26.5 33Q44.1 40.4 56 53.5L68.5 74l1.5.5-.5 1.5L46 60.5l-5-9L26.5 33zM227.5 33l2.5.5Q217.3 46.8 207.5 63l-21 13-.5-1.5 2-1q6.3-16.2 18.5-26.5L225 35.5l-.5-1.5 3 1v-2z" />
              <path fill="#99CBF7" d="M128.5 39q3.3.8 2.5 5.5l-2.5 3.5-2.5-1.5-1-2 3.5-5.5zM139.5 40l4.5 2.5-3.5 6.5-10 5-1.5-2.5 4-4 2.5-5.5 4-2zM115.5 41q5.1-.6 6.5 2.5l1.5 4.5 1.5.5 2 4q-1.2 2.8-2.5.5L114 47.5l-1-5 2.5-1.5z" />
              <path fill="#99CBF7" d="M115.5 53l2 4 4 1 2-1 3 5q5.1.6 6.5-2.5l-1-2 1.5-.5 2 1 3.5-1.5 1.5-3.5 1.5 3.5-6 5 1 2-.5 1.5 2.5.5-1 3 1 2-5.5 4.5-2-3-5-1-2.5 1.5-1.5 2.5-4.5-4.5q1.3-4.7-1-6l1.5.5 1.5-.5q.8-3.7-1.5-4.5l-4.5-3.5 1.5-3.5zm7.5 9l-3 4q-1 4 2 5l2-1h9l1 1h2q1-6-1-9l-4 1-8-1zM11.5 55l3 2 1.5-.5q-2.8 1.8 1.5 3.5L41 81.5l5.5 6.5 1.5.5-.5 1.5 1.5.5-1.5.5L25 80.5 11.5 55z" />
              <path fill="#99CBF7" d="M128.5 55l1.5 3.5-3 2-1-2 2.5-3.5zM243.5 55l1.5.5L229.5 82l-18 7-1.5-.5-1.5 2.5-1.5-.5 2-1-.5-1.5 8.5-7.5 9.5-10.5L241 57.5l-.5-1.5q1.5 2.5 3-1z" />
              <path fill="#99CBF7" d="M184.5 61l-.5 1.5-1 6v2l-1 10 3.5 1.5 20-14v2l5.5 3.5-9 19v4l3.5.5 21-10q6.2 7.8 8.5 19.5l-1 2h2q-1.6 7-6.5 10.5l-5 1q-9.9-5.1-16-14-3.3-3.2-11-2l-8 2-7.5-4.5-11-20-1-6h2q1.9-9.1 8.5-13.5l4-1zM72.5 62h3l6.5 6.5 3.5 7.5 1.5.5q1.5 17-7.5 23.5-5.8 4.7-18 3-12.2 4.8-19.5 14.5L30.5 132q-5.5 1.5-7-1l-.5 2.5.5 1.5-5.5-7.5 2.5 1.5 1.5-.5-2-7v-7l4-18 5.5-9.5 21 10h3l.5-4.5-9-19 6-4-.5-1.5 18 13 4 1 1.5-3.5L72.5 62zM113.5 63l.5 3.5-9.5 5.5-.5-1.5 2-1-.5-1.5 1 1 5-5 2-1zM142.5 63l7 6 1.5-.5-.5 1.5 1.5.5-.5 1.5-9.5-5.5.5-3.5zM125.5 64l1.5.5-2.5 1.5 1-2zM128.5 64l3.5 1.5.5 1.5 1.5-.5-1.5 2.5-2-4q-3 .5-2-1z" />
              <path fill="#99CBF7" d="M100.5 65l2.5.5-3 12 1.5.5 7-5 3 8q8.4 3.1 13.5 9.5l-1.5 2.5-6-5-14-5L93 81.5l-3-11 10.5-5.5zM153.5 65q8.1.9 12.5 5.5L161.5 82h-4l-15 5-7 6-2.5-3.5 13-10 1-2v-2l.5-1.5 8 4 .5-3.5-2.5-9.5zM122.5 66l1.5 2.5h-1l-.5-2.5zM127.5 73l4.5 3.5-3.5 9.5-1.5-.5 1-1v-10l-.5-1.5zM94.5 85l3.5.5-3.5.5v-1zM161.5 87l2.5 1.5 11 22-5.5 7.5q-2.3 2.7-8 2l-16-6-5.5-3.5-4-6 2.5-6.5 8-6 15-5zM94.5 88h5l14 5 8.5 7.5 2 6-4.5 6.5-17 7-7 1-8.5-6.5-2-4 4-3q6-6.5 5.5-19.5zM129.5 91q2.8 1.3.5 2.5l-.5 7.5-1.5-7.5 1.5-2.5zM130.5 104l.5 16.5h-1l.5-16.5zM197.5 108l3.5.5-3.5.5v-1zM135.5 110l1.5 2.5h-1l-.5-2.5zM126.5 115l1.5 3.5h-1l-.5-3.5zM121.5 117l1.5 3.5-18.5 13.5q-4.5-1-3.5-7.5l20.5-9.5zM139.5 117l22.5 9.5-3.5 6.5h-2L138 119.5l1.5-2.5zM199.5 118l7 3 14.5 13.5 1 8q-2.2 1.3-1 6l2.5.5q3.6-3.9 2.5-12.5l-1-3 1.5.5 5-3 2.5 7.5v9l-2.5 3.5-6.5 5.5-.5 1.5q-6.7-1.2-9 2l-2.5-3.5-3-14-3.5-3.5-4.5-3.5q.3-10.8-5-16l2.5-1.5zM69.5 119q8.6-1.1 10.5 4.5l1 6-1 2 1 1v9q-2.1 9.9-9.5 14.5l-5 3-5 1q-6.7-1.2-10.5-5.5-5.8-5.7-6-17 1.8-7.2 7.5-10.5l2-1 .5 2.5-3 8v6l2.5.5 8.5-17.5 4.5-5.5 2-1zM184.5 120l-.5 1.5-.5 1.5-.5-1.5 1.5-1.5zM131.5 122l1.5 3.5-2-1 .5-2.5zM137.5 124l20.5 15.5 1 2-4.5 4.5h-4l-12-12-4.5-1.5 3.5-8.5zM124.5 125l1.5.5 3 7-3.5 1.5-13 13h-3l-4.5-3.5-.5-2.5-1.5-.5 5-2 2.5-3.5 14-10zM180.5 129l.5 4.5h-1l.5-4.5zM10.5 133l5.5 20.5 9 17-5.5 6.5q-6.1-8.9-8.5-21.5l-.5-22.5zM244.5 135l2.5 14.5-1 3 1 2-1 5q2.5 1.5 1 7l-1 3v2l-2 29-1 1-2 18-1.5 1.5h-17l-1.5-1.5 1.5-4.5 1.5-.5-1-2 2 1 .5 1.5 2-8 1 2 1.5-8.5v-31l-1-3 1-4 7.5-7.5 2.5-1.5q4.6-6.9 4.5-18.5zM128.5 137l1.5 1.5v10l-8 6q-.4 5.6-4.5 7.5l-2.5-2.5-1-6 14.5-16.5zM134.5 137l6.5 5.5 8 9 1 4-2.5 5.5-3.5-1.5q-.4-5.5-4.5-7.5l-5.5-3.5.5-11.5zM195.5 139l-4 5-1.5-.5 5.5-4.5zM38.5 141l7.5 13.5v5l-2.5 1.5-5.5-4.5-.5-1.5-1 3-2-1q-1.2 2.3-2.5-.5-2.3-3.2-1-10l2.5 1.5 1-1 1.5-.5-.5-1.5-1.5-.5.5-1.5 2-1 .5 1.5-1 1 3.5 3.5q3.3-1.7-.5-3.5l-.5-3.5zm4.5 11v3l1-2-1-1zM160.5 143l.5 5.5h-1l-1-2 1.5-3.5zM103.5 147l6.5 5.5-1.5-.5-3-2-1.5.5-.5-3.5zM158.5 148l-2 3-1.5.5-.5 2.5-.5-2.5 4.5-3.5zM159.5 152l.5 4.5-4.5 6.5-3 2 .5-1.5 1.5-6.5.5 3.5-.5 1.5 1.5-.5q3.5-3 3.5-9.5zM109.5 155l1.5 7.5-3-2 1.5-5.5zM106.5 156l1.5 2.5-2-1 .5-1.5zM227.5 160l-.5 1.5-.5 20.5-7.5-16.5 1.5-2.5 2 1 5-4zm-1.5 3l-2 2 1 2q1 4-2 6h2v4h1v-14zM197.5 166l10 2 4.5 2.5 5 9 3 12v20h-1l-1-5q2.2-1.3 1-6l-1-4 1-4-1.5-.5-1 4-3.5.5 1 5-2 1-2-10-9.5-14.5-2.5-1.5q-2.6-3.6-.5-10.5zm1.5 1v4l2-1-1-2-1-1zm11 19l-1 2 1 2h2l-2-4zm8 0l-2 4 2-1v-3zM37.5 167l9.5 7.5v6l4 22 7 23 2 3v9l1 1h-2l-.5 1.5-3 2-3-1-3 1L33 223.5l-10-24-2-11L37.5 167zM57.5 168l7 4h5l2.5 2.5-2 12-2 4-1 11 2 10 6 12-5.5 6.5-3.5-1.5-8-28-4-29 3.5-3.5z" />
              <path fill="#99CBF7" d="M227.5 191l.5 6.5h-1l.5-6.5zM223.5 193l.5 6.5h-1l.5-6.5zM213.5 204l1.5.5-.5 5.5-1.5-.5.5-5.5zM223.5 205l.5 5.5h-1l.5-5.5zM212.5 212l1.5.5-.5 3.5-1.5.5q2.5 1.5-1 3l-1.5 3.5-.5-1.5 3.5-9.5zM217.5 213l1.5.5-.5 2.5-1-3zM216.5 217l1.5.5-3.5 11.5-1.5-2.5 2-1 1-4-1-2h2l-.5-2.5zM219.5 223q3.3 1.8 1.5 8.5l-1.5.5-2-3-1.5-.5 3.5-5.5zM208.5 224l5.5 6.5-1.5-.5-2.5-1.5-1.5-4.5zM73.5 232l10.5 4.5 3 10-32.5.5v-1q7-1.5 10.5-6.5l1.5-6.5 4 1 3-2zM207.5 233l4 2h5l2.5 2.5.5 1.5 1.5.5-.5 7.5-18.5-.5v-9l1.5-1.5 4-3z" />
              <path fill="#E3F2FC" opacity=".8" d="M125.5 7l.5 1.5-2 1 1.5-2.5zM127.5 10l.5 25.5-5.5 4.5q-2.8-1.2-.5-2.5l1-10-2.5-.5-5 2-4.5-3.5-1-7 1.5-4.5 1.5.5-1 4 2.5 5.5 5 1 3.5-2.5 4.5-12.5zM143.5 14l1.5.5 1 10q-1.2 4.7-8.5 3.5l-3-4 5 1-.5-1.5.5-1.5 1.5.5-.5 1.5 3.5-2.5-1-2 1-3-.5-2.5zM48.5 15l3.5 2.5-.5 1.5-3-4zM205.5 16l.5 1.5v2L193.5 32q-9.8 10.7-26 15l-.5-1.5 5.5-7.5 9-2L205 19.5l-1-2 1.5-1.5zM53.5 19l5.5 4.5-3.5-2.5-2-2z" />
              <path fill="#E3F2FC" opacity=".8" d="M201.5 19l1.5.5-2.5 1.5 1-2zM51.5 20l23 16 10 3 2-1v1l-1.5.5 4 7-1.5.5q-23.4-9-36-27zM85.5 26l5.5 4.5.5 1.5 1.5.5-1.5.5-4.5-3.5 4.5 5.5 8 5 8 1 1.5 1.5 2 6-1.5.5q-13-3-19.5-12.5l-4-7 1-1-1.5-2.5zM168.5 28l-4 6 5-4 .5 1.5L158.5 44l-13 5-.5-1.5 3.5-6.5q10.9-.1 15.5-6.5v-2l1.5-2.5 3-2zM26.5 30l2.5 1.5-2.5 1.5v-3zM229.5 30l.5 2.5-2.5 2.5q-16.7 6.3-27.5 18.5L187.5 74l-.5-3.5 3-14 8.5-9.5 13-8 17.5-6.5-3-1 3.5-1.5zM182.5 32l1.5.5-9.5 3.5v-1l8-3zM29.5 34Q53.1 39.4 66 55.5q-.6 4.6 2 6v2l1 10h-1Q61.7 57.3 49.5 47q-8.5-7.5-20-12v-1z" />
              <path fill="#E3F2FC" opacity=".8" d="M40.5 35l4.5 2.5-1.5-.5q-3.8-.3-3-2zM82.5 35l3.5 1.5-2.5.5-1-2zM212.5 36l1.5.5-2.5 1.5 1-2zM145.5 37l-1 2-1.5-.5 2.5-1.5zM106.5 38l3.5 1.5-1.5.5-2-2zM116.5 38l2.5 1.5-1.5-.5-1-1zM48.5 39Q58.8 43.2 65 51.5L58.5 46l-10-6v-1zM127.5 39l.5 2.5q-2 4.5-4 1l1.5-2.5 2-1zM206.5 39l1.5.5-3.5 2.5-.5-1.5 2.5-1.5zM201.5 42l1.5.5L190.5 53l8-9 3-2zM11.5 52Q27.6 58.4 40 68.5l-1.5-.5-24-13 1 2Q29.4 62.6 40 71.5l7 16-6-5L28.5 69 13 55.5q2.3-1.2-.5-2.5l-1.5.5.5-1.5zM243.5 52l1.5.5-.5 1.5q-1.2-2.2-2.5.5l1 1-4.5 4.5L217 79.5l-7.5 8.5-.5-1.5 9.5-17.5L242 55.5l-1.5-.5-5 3-.5-1.5 8.5-4.5zM119.5 53l2.5 1.5-2.5.5v-2zM136.5 53l-1 2-1.5-.5 2.5-1.5zM76.5 56l4.5 2.5-1.5-.5q-3.8.5-3-2z" />
              <path fill="#E3F2FC" opacity=".8" d="M72.5 57l7.5 3.5q5.2 5.2 6 15h-1q-2.5-9.1-9.5-13.5l-4.5-.5-1-3 2.5-1.5zM176.5 57l.5 1.5-.5 1.5 7-3 2.5 1.5-2.5 3.5h-3l-4.5 4.5-4.5 9.5q-2.5-1-1.5-5.5l5-9-3 1 4.5-5.5zM232.5 58l1.5.5L216.5 69l2-3 14-8zM112.5 60l1.5 2.5-8.5 7.5.5-1.5 4.5-7.5 2-1zM143.5 60l3.5 2.5 4 7-6.5-5.5-2.5-1.5 1.5-2.5z" />
              <path fill="#E3F2FC" opacity=".8" d="M82.5 61l3.5 4.5-2-1-1.5-3.5zM209.5 63l1.5 2.5-1.5-.5-3 1v-1l3-2zM96.5 64l-1 2-2 1 1-2 2-1zM123.5 64l7 1 2-1 .5 1.5h-2l1 2-7.5.5.5-1.5-.5-1.5-1.5.5.5-1.5zM44.5 65l1.5.5-4.5 3.5 3-4zM48.5 65l6.5 3.5-1.5.5-5-3v-1z" />
              <path fill="#E3F2FC" opacity=".8" d="M46.5 67q4-.5 4.5 2.5L45.5 73 43 69.5l3.5-2.5zM207.5 67q4.8-.7 5.5 2.5l-2.5 3.5-5.5-3.5 2.5-2.5zM126.5 74l1.5.5-.5 10.5-3.5-7.5 2.5-3.5zM25.5 83l-1 2-2 1 1-2 2-1zM230.5 83l2.5 1.5-1.5-.5-1-1zM161.5 85l1.5 2.5-2.5.5q-14.3 1.7-22 10l-.5-2.5 7.5-5.5 16-5zM24.5 86q3.8-.7 4.5 1.5-9.3 12.2-9 34l2 7-1.5.5-3.5-3.5-2-10 1-3v-2q1.5-15 8.5-24.5zM94.5 86Q112 87 121 96.5l-.5 2.5-7-6-14-5-5.5-.5.5-1.5zM228.5 86q3.8-.7 4.5 1.5l4 10v7l-2.5 4.5-.5-1.5v-2q-1.3-11.2-7-18l1.5-1.5zM21.5 87l-.5 1.5-2.5 4.5.5-1.5 2.5-4.5zM130.5 93l3.5 6.5-2 6 4 6v3l-3.5 9.5-1.5-2.5-.5-28.5zM12.5 129l1.5 2.5h-1l-.5-2.5zM10.5 131q8.2 17.3 20.5 30.5v2l-2 3 4-2-4.5 5.5.5-1.5-.5-1.5-2.5 1.5-.5 1.5-9.5-16.5-5.5-22.5zM243.5 131l.5 11.5q-1.2 7.8-5.5 12.5l-8.5 7.5-1 6 1 1v31l-1.5 8.5-.5-17.5-1-1v-29l12-13 3-11v-5l1.5-1.5zM16.5 136l2.5 5.5h-1l-1.5-5.5z" />
              <path fill="#E3F2FC" opacity=".8" d="M234.5 150l-4 5-.5-1.5 4.5-3.5zM30.5 158l3.5 2.5-.5 2.5-3-5zM36.5 162h2L50 172.5l4 30 8 25v6l-2.5 5.5.5-1.5v-9l-2-3-7-23-4-22v-6l-4.5-4.5-5-3L22 186.5l-1 6 12 31L49.5 242l5-1v1l-6 2L30 224.5q-8.7-15.8-14-35l9.5-13.5 1.5-.5 9.5-13.5zM198.5 163l14 3 3.5 3.5 7 16 1 19-3 17-6.5 9.5-.5-1.5 6-18v-20l-3-12-5.5-9.5-14.5-4.5 1.5-2.5zM26.5 171l.5 1.5-2 1 1.5-2.5zM18.5 179l2.5 1.5-2 1 .5-1.5-1-1zM16.5 184l.5 1.5q-3.1 1.5-2.5 6.5l-.5-4.5 2.5-3.5zM24.5 217l3.5 6.5-2-1-1.5-5.5zM222.5 221l1 1 17.5.5-18 1-.5 9.5v-12zM222.5 239l.5 7.5h-1l.5-7.5z" />
            </g>

            {/* 4. 테두리 링 */}
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="url(#sacrificeGodRingGrad)" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="28.2" fill="none" stroke="#93c5fd" strokeWidth="0.5" strokeOpacity="0.8" />

            {/* 5. 신의 강림 스파클 */}
            <path d="M 49 13 Q 49 15.2 51.2 15.2 Q 49 15.2 49 17.5 Q 49 15.2 46.8 15.2 Q 49 15.2 49 13 Z" fill="#e0f2fe" opacity="0.95" />
            <circle cx="14" cy="48" r="1" fill="#7dd3fc" opacity="0.85" />
            <circle cx="50" cy="46" r="0.8" fill="#ffffff" opacity="0.75" />
            <circle cx="16" cy="16" r="0.7" fill="#bae6fd" opacity="0.8" />
          </g>
        )}
        {/* 영혼의 심복 (푸른 눈의 백룡: 순수 SVG 벡터 그래픽 & 시안-블루 링 테두리) */}
        {id === "soulMinion" && (
          <g>
            {/* 1. 배경 원 */}
            <circle cx="32" cy="32" r="29.5" fill="url(#soulMinionBg)" />

            {/* 2. 중앙 청록 아우라 */}
            <circle cx="32" cy="31" r="16" fill="#38bdf8" opacity="0.22" filter="url(#glow)" />

            {/* 3. 백룡 순수 SVG 벡터 패스 (원형 테두리 내 최적 스케일링) */}
            <g transform="translate(6.92, 6.92) scale(0.1944)">
              <path fill="#6D9ABF" opacity=".2" d="M129.5 3l3.5 1.5-1 2 1 1-9 9-3.5 4.5q-3.5-2 1-4l1.5.5-1-2 9-9v-2L129.5 3zM113.5 9v2l3-1v1l-3 1q-3-1.5 0-3zM110.5 11l1 2-1.5-.5-.5 1.5-1.5-.5-.5 1.5-1-2 4-2zM103.5 14v2l2-1-1 2-4 2-2-1v2l-2-1-1 3q-3.5-2 1-4l7-4zM91.5 21l2.5 1.5q-1.2 2.8-2.5.5l-1.5.5q2.3 1.3-.5 2.5l-2-1q1.7 2-2 4l-.5-2.5 2.5-2.5 4-3zM118.5 21l1 2-2.5-.5 1.5-1.5zM116.5 24l1 2-2.5-.5 1.5-1.5zM183.5 24l6.5.5-7 1-.5 1.5-.5-1.5 1.5-1.5z" />
              <path fill="#6D9ABF" opacity=".2" d="M185.5 26l6.5.5-6.5.5v-1zM83.5 27l.5 2.5-2.5 2.5v-2L78 32.5l1 1-5.5 5.5v-2l-8 7 8-9 10-8zM114.5 27l2.5.5-2.5 3.5-2.5-.5 2.5-3.5zM193.5 32l2.5.5-.5 1.5 9.5 6.5-1.5-.5-1.5.5.5 1.5-1-3-2 1q-3.7-2-2-4l-2 1-2-5zM224.5 40l.5 4.5h-1l.5-4.5zM226.5 41l.5 4.5h-1l.5-4.5zM105.5 42l1.5.5-.5 2.5-1-2-2.5 1.5 2 1-3.5 1.5v-1l1.5-.5-2-1 4.5-2.5zM204.5 44l.5 2.5-2.5 1.5-2-1-1 3-3 2v-2l-2 1 1-2 2-1 2 1 1-3 2-1 1.5.5.5-1.5zM66.5 45l-4 5q-1.2-2.2-2.5.5l1 2-3.5 3.5-1.5-1.5 7.5-8.5q1.5 2.5 3-1zM93.5 48l-1 2-2 1 1-2 2-1zM97.5 48l-1 2-2 1 1-2 2-1zM165.5 48l-1.5 2.5-1.5 3.5.5-1.5q-.5-4 2.5-4.5zM211.5 48l1 4q4.5-1 5.5 1.5h-2l-.5 1.5-1-2-1.5.5 1 2-3 2 .5-1.5 1.5-.5-4-2 3-1-3-1 2-1 .5-2.5z" />
              <path fill="#6D9ABF" opacity=".2" d="M213.5 49l3.5 1.5-3.5.5v-2zM225.5 50l.5 9.5h-1l.5-9.5zM192.5 51q3.5 2-1 4l-1-2-3 2 1-2 2-1 2 1v-2zM227.5 52l.5 10.5h-1l.5-10.5zM195.5 54l1 2-1.5.5 2 1-1.5.5-3.5-1.5 3-1 .5-1.5zM152.5 55l3.5 1.5-1.5 2.5-1.5-.5 1-2-1.5-1.5zM184.5 55l3.5 1.5-1 2 2 1-1.5.5-5-1-2 1-2-1-2 1v-1l3-1 2 1v-2l1.5.5 1.5-2.5zM55.5 56q3 1.5 0 3-1.2-2.2-2.5.5l1 2-3 1 1 2-2.5 3.5-2.5-.5L55.5 56zM149.5 56l2.5 1.5-2.5 1.5v-1l1.5-.5-1.5-1.5zM207.5 56l1.5 4.5h-1l-.5-1.5-2 1v-3l1.5.5.5-1.5zM189.5 57l3.5 1.5-1.5.5-2-2zM164.5 58l5.5.5-5.5.5v-1zM203.5 58l.5 2.5-3 2 2 1-2.5 1.5q-1.2-2.2-2.5.5 2.8 1.8-1.5 3.5l1.5-2.5-1-1 2-2-1.5-1.5-1.5.5.5 1.5-2-1v2l-2.5-1.5 7.5-3.5 1.5.5.5-1.5 1.5.5.5-1.5zM172.5 59l2.5.5-3 1 .5 1.5-5.5-1.5 5.5-1.5zM106.5 61l8.5.5-8.5.5v-1zM102.5 62l1.5.5-1 2 .5 1.5-1.5-.5 1-2-.5-1.5zM96.5 65q-1.6 1.8 1.5 3.5L95.5 71l-1-3-1.5.5 3.5-3.5zM154.5 65l5.5 1.5-2.5.5-3-1v-1zM188.5 65l2.5 1.5-5.5 2.5-2-1v2l-2.5-1.5 3.5-1.5 2 1v-2l2 1v-2zM203.5 65l2 3-3.5-1.5 1.5-1.5zM125.5 66l1.5.5-4.5 1.5v-1l3-1z" />
              <path fill="#6D9ABF" opacity=".2" d="M195.5 66l-1.5 2.5 1 1-2.5 2.5-.5-2.5 3.5-3.5zM46.5 69l2.5.5-2.5 3.5-2.5-.5 2.5-3.5zM141.5 69l1.5.5-3.5 1.5v-1l2-1zM179.5 69l2.5 1.5-5.5 2.5-2.5-1.5 3.5-1.5 2 1v-2zM190.5 70l.5 2.5-.5 1.5-1-2-1.5.5 2.5-2.5zM137.5 71l-1 2-2 1 1-2 2-1zM172.5 72l2.5 1.5-4 2 3 1-5.5.5v-2l-1.5.5-.5 1.5-.5-1.5 2.5-1.5 2 1v-2l2 1v-2zM103.5 73l1 3 1.5-.5-3 1-.5 1.5-.5-1.5 1.5-3.5zM227.5 73l.5 9.5h-1l.5-9.5zM89.5 75l2.5 1.5.5-1.5.5 2.5-2 1 .5 1.5-1.5-.5-2.5 3.5-1.5-.5 1 2-4.5 4.5h-3v-1l1.5-.5-2-1q4.7.2 6-3l2.5-4.5-.5 1.5.5 1.5 1.5-3.5-.5-1.5 1.5.5-.5-2.5zM190.5 75l2.5 3.5-6.5.5v-1q3.8.8 4.5-1.5l-.5-1.5zM129.5 76l-6 7-2.5-.5 2.5-.5 6-6zM195.5 76l1 1h11l1.5-.5-.5 1.5h-12l-1-2zM225.5 76l.5 8.5h-1l.5-8.5zM100.5 77l.5 1.5-6.5.5v-1q4.7 1.3 6-1zM130.5 78l-1 4-1.5-.5 2.5-3.5zM176.5 78l8.5.5-8.5.5v-1zM218.5 78l1 2 1-2 .5 1.5-3.5 1.5.5-1.5.5-1.5zM208.5 79l1.5.5-.5 1.5-3.5-.5 2.5-1.5zM213.5 81l2.5.5-2 1-.5 1.5v-3zM39.5 82l1.5 2.5h-2l1 3h-1l-1-3 1.5-2.5zM131.5 82l2.5 3.5h-1l-1.5-3.5zM117.5 83l1.5.5-2 1 2 1-1.5.5-3.5-1.5 3.5-1.5zM188.5 83l8 1 2.5 1.5-1.5.5-3-1v1l1.5.5-3.5 2.5-1.5-2.5 1-2q-4.4.4-3.5-1.5zM70.5 85l6.5.5-6.5.5v-1zM175.5 85l7.5 1.5-3.5.5-4-1v-1zM67.5 86l1 2 1-1h8v1q-6.8-1.3-10 1v-3zM167.5 86l8.5 1.5-3.5 1.5-1-2-4 1v-2zM104.5 87l1.5.5-2 1 1.5 2.5h-2l-1.5-.5.5-2.5 2-1zM111.5 87l2.5 1.5h-3l.5-1.5zM118.5 87l2.5.5q-1.8 4.2-3.5 1.5l-2.5-.5 3.5-1.5zM188.5 87l.5 1.5-1.5 2.5 2.5.5-4.5 1.5v-1l1.5-.5-.5-2.5-3 1v-1l3-1 1.5.5.5-1.5z" />
              <path fill="#6D9ABF" opacity=".2" d="M170.5 88l-1 2-3.5-.5 4.5-1.5zM99.5 89l1.5.5-.5 2.5-4-1-1 3-1.5-.5 2-1-2-1 3.5-1.5 1.5.5.5-1.5zM177.5 89l3.5.5-7.5 1.5v-1l4-1zM114.5 90q3.5 2-1 4l-2.5-1.5 1.5-.5q1.2 2.3 2.5-.5l-.5-1.5zM193.5 90l3.5 3.5-1 3 1 2-2.5-1.5-2.5-.5 3-1-2-1 .5-4.5zM213.5 90l.5 4.5h-1l.5-4.5zM215.5 90l.5 4.5h-1l.5-4.5zM67.5 91l3.5.5-3 1 3 1q-5.1-.1-6.5 3.5v-3q1.3 2.3 2.5-.5l.5-2.5zM127.5 91l3.5 1.5-2.5.5-1-2zM191.5 91l.5 3.5-2.5.5-.5-1.5 2-1 .5-1.5zM91.5 92l1.5.5-.5 2.5-1-2-2 1v-1l2-1zM109.5 93l.5 1.5-.5 4.5-2.5-.5 2-4 .5-1.5zM135.5 94l5 2 3-1v1l-2.5.5.5 1.5-6-3v-1zM177.5 94l10.5.5-10.5.5v-1zM198.5 94l3.5 1.5-3 2-.5 1.5-.5-2.5 2-1-1.5-1.5zM84.5 95l1.5.5-3.5 1.5v-1l2-1zM90.5 95l.5 1.5-3.5 2.5-2.5-1.5 2.5-1.5 2 1 1-2zM116.5 95l2.5 1.5-.5 1.5-1-2-1-1zM144.5 97l1.5 1.5-.5 2.5q-4.5-2-1-4zM77.5 98l1.5.5-2 1 3.5 1.5 1.5-.5-.5 1.5 2-1v2l2-1-1 2-4-2-2 3 .5-1.5-.5-2.5-2 1v-2l-3 1v-1l4-2zM95.5 98v3L93 99.5l2.5-1.5zM111.5 99l-1 2-2.5-.5 3.5-1.5zM118.5 99l-1.5 2.5-.5 1.5-2 1 .5-1.5.5-2.5q1.5 2.5 3-1zM178.5 99l1 2-2.5-.5 1.5-1.5zM69.5 102l1 3 1.5-.5.5-1.5.5 1.5-3 2-.5 1.5-1-2-1.5-.5 2-1 .5-2.5zM90.5 102l.5 2.5-2.5 1.5v-1l1.5-.5.5-2.5zM146.5 102l1 2 1-2 .5 1.5-2.5 2.5-2.5-.5 2.5-3.5zM59.5 103l1 3 3-1v1l-2.5 1.5 2.5 1.5 1.5-.5-4 3 1-2h-2l.5-1.5-1.5-.5.5-4.5zM80.5 105l-.5 1.5-.5 2.5-1.5-.5-.5-1.5-2 1v-1l5-2zM114.5 105l-1.5 2.5-.5 1.5-1.5.5-.5 1.5-.5-1.5 1.5-2.5 3-2zM198.5 106l1.5 2.5-4.5 2.5-2.5-1.5 1.5-.5 2 1q-1.7-2 2-4zM47.5 107l.5 4.5h-1l.5-4.5zM71.5 107l.5 1.5-2.5 3.5-1.5-.5 3.5-4.5zM182.5 108l2.5 1.5-2 1-.5 1.5-.5-1.5.5-2.5z" />
              <path fill="#6D9ABF" opacity=".2" d="M54.5 109l3.5 1.5v2l.5 1.5 1.5-.5-.5 1.5 4-3-.5 1.5.5 2.5 1-2 1.5 3.5h-1l-.5-1.5-2 1-1-2-2 1q-1.7-3.7-3.5-.5l.5 2.5 1-2 .5 1.5-2.5 1.5-1-2-1.5.5 4-5-1.5-2.5-1.5.5 1 2-2.5.5v-1l1.5-.5-2-1 2.5-1.5zM180.5 111l.5 4.5-1.5 5.5-1.5-4.5q2.8-1.2 2.5-5.5zM99.5 112l1.5.5-.5 1.5 1.5.5-1.5.5-1-3zM109.5 112l-.5 1.5.5 1.5 1.5-.5q-2 3.5-4-1l2.5-1.5zM125.5 112l3.5 1.5-2.5 1.5v-2l-3.5 1.5 2 1-2.5 1.5v-2l-2 1 1-2 4-2zM182.5 113l2 4 1.5.5.5 1.5 6.5.5-7.5.5-1-2-2.5 1.5-.5 1.5-.5-3.5 1.5.5 1.5-.5q-3.1-1.1-1.5-4.5zM199.5 113q3 1.5 1.5 7.5h-1l-.5-6.5-2 4-.5-2.5 2.5-2.5z" />
              <path fill="#6D9ABF" opacity=".2" d="M202.5 114l.5 5.5h-1l.5-5.5zM116.5 117l.5 2.5-3.5 3.5-5 4 2.5-3.5-1-1 2.5-2.5v2l2.5-1.5q-2.7-1.8 1.5-3.5zM164.5 117l3 1 1.5-.5q-1.2 2.8-2.5.5-3 .5-2-1zM192.5 117l3.5 1.5-1.5.5-2-2zM92.5 118l3.5 1.5-1.5.5-2.5-.5.5-1.5zM99.5 119l2 3 2-1v1l-1.5.5-.5 1.5-1-2-1.5.5.5-3.5zM175.5 120l2.5.5-1.5 1.5-2.5-.5 1.5-1.5zM171.5 122l3 2 1.5-.5-4 3v-2l-.5-2.5zM95.5 123l.5 1.5-.5 2.5q-2.7-1.2-.5-2.5l.5-1.5zM199.5 123l.5 2.5-.5 2.5-4.5-1.5 4.5-3.5zM107.5 124l-2.5 3.5.5 3.5-10 9v-2l-1.5-.5 1.5-.5q1.3 2.3 2.5-.5l-2-1 1.5-2.5 1.5-.5q-2.2-1.2.5-2.5l1 1 7-7zm-3.5 5l-6 7 6-5v-2zM181.5 124l1 2-1-1-2.5 1.5.5-1.5 2-1zM158.5 125l2.5.5-2.5 3.5-2.5-.5 2.5-3.5zM97.5 127l1 2h-2l-3 1 1-2 3-1zM24.5 129l.5 4.5h-1l.5-4.5zM164.5 129l-.5 1.5.5 1.5 2.5-1.5-6.5 6.5q-1.2-2.2-2.5.5l-1.5 3.5-1-2-1 2-.5-1.5 3-1-1-2 3-1-.5-1.5-1.5.5q2-3.7 4-2l.5-1.5 1.5.5 1.5-2.5zM154.5 130l2 1 1.5-.5-3.5 2.5v-3zM223.5 130l2.5 4.5 1 2-3.5-.5q-4.5-.5-5 3l2.5-3.5-.5-1.5 2 1 1.5-1.5-.5-3.5zM110.5 131l2.5 1.5-.5 2.5-1-2-1.5.5.5-2.5zM213.5 131l1 2 1.5-.5-.5-1.5 1.5.5-.5 2.5-3-1-1.5.5 1.5-2.5zM115.5 133l4.5 2.5-1.5-.5-1.5.5.5 1.5-2.5-1.5 2-1-1.5-1.5zM144.5 133l2.5 1.5-2.5 1.5v-3zM173.5 133l1.5 2.5-2 1 1-2-3 1 2.5-2.5zM91.5 134h2l1.5.5-.5 1.5h-2l-1-2zM133.5 134l5.5.5-5.5.5v-1zM197.5 134l-.5 1.5-.5 2.5-3.5-1.5 1.5-.5 1.5.5 1.5-2.5zM125.5 135l2.5.5-3 1 3 1-2.5.5-2.5-1.5 2.5-1.5zM23.5 136l.5 4.5h-1l.5-4.5zM25.5 136l.5 4.5h-1l.5-4.5z" />
              <path fill="#6D9ABF" opacity=".2" d="M131.5 136q6.7-1.7 8.5 1.5l-1.5-.5h-7v-1zM182.5 137l6.5.5-8.5 1.5v-1l2-1zM190.5 137l3.5 1.5-2.5.5-1-2zM122.5 138l1.5.5-1.5 6.5v-7zM74.5 139l1 2q-1.7-2.7-3.5 1.5l.5 1.5-2.5-.5 4.5-4.5zM138.5 139l-.5 1.5-.5 1.5-2.5-.5 3.5-2.5zM227.5 139l5.5.5-5.5.5v-1zM120.5 140l.5 4.5h-1l.5-4.5zM56.5 141l1 2-2.5-.5 1.5-1.5zM129.5 141l3.5.5-6.5 2.5 1-2 2-1zM168.5 141l2 1q1.8-2.7 3.5 1.5l-4.5-1.5-1-1zM231.5 141l2 1q1.3-2.2 2.5.5l-3.5-.5-1-1zM166.5 143l-.5 1.5-1.5 3.5-1-2-3 5-.5-3.5 2-1-.5-1.5-1.5.5q1.3-2.7 2.5-.5l2 1 2-3zM193.5 144l-.5 1.5-3.5 5.5.5-1.5 3.5-5.5zM206.5 144l.5 1.5v2l-.5 7.5-1.5-8.5 1.5-2.5zM228.5 144l3 1 2-1v1l-1.5.5.5 1.5-3-1-1.5.5.5-2.5zM71.5 145l-.5 1.5-.5 1.5-1.5.5 1 2-6 1 4-2-1-2 4.5-2.5zM24.5 146l.5 24.5h-1l.5-24.5zM92.5 146l8.5.5-8.5.5v-1zM180.5 146l3.5.5-5.5 1.5v-1l2-1zM197.5 146l-3 4-2.5-.5q1.3-2.7 2.5-.5l3-3zM52.5 147l1 2-2.5-.5 1.5-1.5zM102.5 147l4.5 1.5-1.5.5-3-1v-1zM22.5 148l.5 20.5h-1l.5-20.5zM91.5 148l9.5.5-9.5.5v-1zM204.5 148l.5 2.5q1.8 7.8-2.5 9.5l-.5-1.5q2.8-.7 2-5h-4q2-3.7 4-2l-1-2 1.5-1.5zM233.5 148l1 4 1-3 .5 3.5-1.5.5q-2.7-1.2-1-5zM103.5 149l.5 1.5-2.5 2.5-2.5-.5 4-2 .5-1.5zM167.5 149l3.5 3.5-1.5 1.5.5-1.5-2.5-3.5zM50.5 150l2.5.5-1.5 4.5q-2.7-1.2-.5-2.5l-.5-1.5-1.5.5 1.5-1.5zM81.5 150l2.5 1.5-2.5 1.5v-3zM226.5 150l1.5 4.5h-1l-.5-4.5zM79.5 151l-1.5 2.5 1 1-7.5 7.5-2.5-.5 3.5-3.5q1.3 2.3 2.5-.5l.5-1.5 1.5-.5-1-1 3.5-3.5zM191.5 151l2.5 3.5-1.5.5q-1.2-2.2-2.5.5l.5 1.5 1.5-.5-3 2 .5-1.5-3.5 2.5 1 1-3.5 3.5-.5-2.5-.5-1.5-1.5 1.5.5 3.5-1.5-3.5 4-4 .5-1.5.5 1.5-1.5 2.5 6.5-5.5 1.5-3.5zM222.5 151l.5 1.5-1.5 3.5-.5-2.5 1.5-2.5z" />
              <path fill="#6D9ABF" opacity=".2" d="M188.5 152l-.5 1.5-.5 1.5q-8.3-1.2-13 1v-1l12-1 2-2zM63.5 153l2.5.5-1.5 1.5-2.5-.5 1.5-1.5zM232.5 154l1 2 1.5-.5-.5-1.5 2.5.5-.5 2.5-2 1q-3.6-1.1-2-4zM47.5 155l3.5 1.5-.5 1.5-1-2-4 8-1.5-2.5h2l-1-2h2l-1-2h2l-.5-2.5zM195.5 155l.5 1.5-1.5 4.5-.5-3.5 1.5-2.5zM199.5 155l2.5.5q-2 4.5-4 1l1.5-1.5zM61.5 156l2.5.5-1.5 1.5-2.5-.5 1.5-1.5zM97.5 156l-1 2-3.5-.5 4.5-1.5zM161.5 156h2l4.5 4.5-.5 1.5 2-1 3 2 3-1 1.5 2.5-.5 2.5q-1.2-2.2-2.5.5l.5 1.5q-3.8-2.3 1.5-4.5l-.5-1.5-5 1-1-2-2 1q-2.7-1.3-.5-2.5l-3.5-3.5q-1.8 2.5-2-1zM196.5 158l1.5.5-.5 2.5-1.5-.5.5-2.5zM223.5 158l1.5.5-.5 6.5-1-2-10 10h-2l-3.5-1.5 2.5-.5 2 1v-2l2 1-.5-1.5 7.5-7.5q1.3 2.3 2.5-.5l-.5-3.5zM107.5 159l4.5 1.5-4 1 .5 1.5-2-1-1 3q-3.2-1.7.5-3.5l1.5-2.5zM205.5 159l.5 9.5h-1l.5-9.5z" />
              <path fill="#6D9ABF" opacity=".2" d="M101.5 160l1.5 3.5-2-1 .5-2.5zM58.5 161l2.5.5-2.5 3.5-2.5-.5 2.5-3.5zM67.5 161l2 3 1.5-.5-3 1-.5 1.5-1.5-.5-1-3h1l.5 1.5 1-3zM113.5 161l3 2 1.5-.5-1 2h2l-1.5 1.5-4-5zM199.5 161l1.5 3.5-2 1 1-2-.5-2.5zM203.5 162l.5 5.5h-1l.5-5.5zM89.5 164l6 4 7.5 1.5-3.5.5h-2l-1.5.5.5 1.5q-1.2-2.2-2.5.5l-.5 1.5-2.5-.5.5-2.5 2 1-.5-1.5 1-3-1.5.5-3-4zM161.5 164l1 2-2.5-.5 1.5-1.5zM196.5 166l1 2 1.5-.5-5 3q2.8 1.8-1.5 3.5l-3 1-1.5-.5-.5 1.5-2-1-1 2-.5-2.5 1.5-.5 1.5.5.5-1.5 3 1 1-3v2l2.5-1.5-1-1 3-3 .5-1.5zM225.5 166l3.5 1.5-2.5.5-1.5-.5.5-1.5zM41.5 167l1 2 1-2 .5 1.5-1.5 2.5-1-4zM136.5 167l1.5 2.5-3.5 1.5v-1l1.5-.5.5-2.5zM163.5 167l1 2-2.5-.5 1.5-1.5zM70.5 169l4.5.5-4.5.5v-1zM116.5 169l4.5 1.5-1.5.5-3-1v-1zM156.5 169l.5 1.5-1 2 3 1 3 5-2.5.5-1.5-1.5 1-2-3-1-1-3 1.5-2.5zM76.5 170l-1 2-5.5-.5 6.5-1.5zM113.5 170l3.5 1.5-1.5.5-2-2zM168.5 170v3h-2l-1.5-.5 3.5-2.5zM204.5 170l2.5.5-.5 2.5-2-3zM127.5 171l1.5 2.5-1.5 3.5-.5-2.5v-2l.5-1.5zM230.5 171l2.5.5-4 2 .5 1.5q-1.5-2.5-3 1l-1.5-.5 1.5-2.5 1 1 3-3zM89.5 172l.5 2.5-2.5 2.5 2-5zM113.5 172l-1.5 2.5 2 2-1.5 1.5v-2l-2-1-.5 4.5 1 2h-1l-1-7 4.5-2.5zM66.5 173l-4 5-2.5-.5 4-2-.5-1.5q1.5 2.5 3-1zM75.5 174l1.5 5.5h-1l-.5-5.5zM107.5 174l-1 3 1.5.5-4.5 3.5-2.5-.5 5-3q-2.8-1.7 1.5-3.5z" />
              <path fill="#6D9ABF" opacity=".2" d="M114.5 174l3 1 1.5-.5q-2.5 1.5 1 3l-.5 1.5-2-3q-3.8.5-3-2zM170.5 175l3 1q1.3-2.2 2.5.5-1.2 2.8-2.5.5h-2l-5 5-2-1q1.8 2.5-3 5l-2.5-1.5-.5 2.5-1-2-2.5 1.5 2 1-3 2-.5 1.5-2-1-2 1v-1l1.5-.5.5-2.5 1 2 2.5-1.5-2-1 7-4 .5-2.5 1 3 1-3h2l2 1q2.8-1.2.5-2.5l3.5-3.5zM23.5 176l.5 4.5h-1l.5-4.5zM25.5 176l.5 4.5h-1l.5-4.5zM51.5 178l.5 1.5-1.5 2.5-.5-1.5 1.5-2.5zM121.5 178l1 3 3.5-.5-2.5 4.5-1-3-1 9-1-5-4 4-2.5-.5 3.5-3.5q1.3 2.3 2.5-.5l1.5-7.5zM210.5 178l1.5 2.5-1.5.5q-3-1.5 0-3zM181.5 180l.5 5.5h-1l.5-5.5zM46.5 181l1.5 3.5-1.5 3.5v-7zM179.5 181l.5 3.5-1.5-.5-1.5-.5.5-1.5 1.5.5.5-1.5zM203.5 181l3.5 1.5-3.5 1.5v-1l1.5-.5-1.5-1.5zM57.5 182l1.5 8.5h-1l-.5-3.5-1.5.5 1.5-5.5zM92.5 182l.5 6.5h-1l.5-6.5zM74.5 184l.5 4.5h-1l.5-4.5zM107.5 184l1.5 3.5h-1l-.5-3.5zM197.5 184l.5 2.5-1.5 1.5-.5-2.5 1.5-1.5zM78.5 186l1.5 3.5h-1l-.5-3.5zM174.5 186l1 2 1-2 .5 1.5-1.5 2.5-1-4zM194.5 186l.5 2.5-1.5 1.5-2-1q-2.7 1.3-.5 2.5l-3.5 3.5-.5-1.5 2-1-1-1 3.5-3.5 2 1 1-3zM106.5 187l1.5 6.5h-1l-.5-6.5zM97.5 188l1.5 3.5h-1l-.5-3.5zM53.5 189l2.5.5-1.5 2.5-1-3zM146.5 189l1.5.5-3.5 1.5v-1l2-1zM52.5 191l2 3 1-1q1.8 3.1 3.5 1.5l-1 2 1 3h-1l-1.5-4.5-1 1q-1.7-3.1-3.5-1.5l.5-3.5zM96.5 192l1.5 3.5h-1l-.5-3.5zM112.5 192l2.5.5-3.5 4.5-2.5-.5 3-1-1-2 1.5-1.5zM139.5 192l1.5.5-5 3 .5 1.5-3 1-.5-2.5h1l.5 1.5 1-3 4-2zM183.5 192l1 2 1.5.5-.5 3.5-1.5-.5 1-2-2-1 .5-2.5zM142.5 193l1.5.5-3.5 1.5v-1l2-1zM60.5 194l.5 4.5h-1l.5-4.5zM77.5 194l.5 2.5-2 1 1.5-3.5zM105.5 194l.5 5.5-1 1-.5 10.5-.5-12.5 1.5-4.5zM95.5 195l1.5 5.5h-1l-.5-2.5-1 2-1-2-1 2-.5-1.5 1.5-2.5 1 2 1-3zM130.5 196l1.5.5-.5 2.5-1-3zM49.5 198h2l2.5 2.5-2.5.5-1.5-.5-.5-2.5zM102.5 198l.5 9.5h-1l.5-9.5zM107.5 198l2 1 1.5-.5-2.5 3.5v-2l-1.5-.5.5-1.5zM169.5 198l.5 4.5h-1l.5-4.5z" />
              <path fill="#6D9ABF" opacity=".2" d="M171.5 198l1 3 1.5.5-2 1 .5 1.5q-2.9-1.4-1-6zM55.5 201l2.5.5-1.5 4.5-.5-2.5.5-1.5-3 1v-1l2-1zM34.5 203l.5 5.5h-1l.5-5.5zM142.5 204l-.5 1.5-1.5 2.5.5-1.5 1.5-2.5zM32.5 205l.5 4.5-1.5.5-.5-2.5 1.5-2.5zM128.5 208l.5 2.5-.5 1.5-6 4-1.5-1.5 3.5-3.5 2 1q-1.7-2 2-4zM54.5 209l.5 1.5-1 3 .5 1.5-2.5-.5-1-4h1l.5 1.5 2-3zM82.5 209h2l1.5.5-6.5 5.5-2.5-.5 5.5-5.5zM139.5 209l-.5 1.5-1.5 2.5.5-1.5 1.5-2.5zM86.5 211l3.5 1.5-2.5.5-1-2zM103.5 212l.5 5.5h-1l.5-5.5zM88.5 214l3 1 1.5.5-1.5.5h-2l-1-2zM75.5 215l2.5 1.5-1.5.5-2.5-.5 1.5-1.5zM119.5 215l1.5 2.5-12.5 9.5-1-2h2l2.5-1.5-1-1 3.5-3.5v2l2.5-1.5-1-1 3.5-3.5zM192.5 216l2.5.5-2.5 2.5-2.5-.5 2.5-2.5zM74.5 218l2.5.5.5 4.5 1-5 2 4 1.5.5-4.5 2.5-2-6-6 5 5-6zM96.5 218l5.5 1.5-1.5 3.5q-2.2-4.2-4.5.5 2.3 1.3-.5 2.5l-1.5.5.5 2.5 5-5 1.5 1.5q-1.2 2.8-2.5.5l-3.5 3.5 1.5.5 1.5-.5-3.5 2.5v-2l-2.5-.5 2.5-6.5 4-3 1.5.5-.5-1.5q-4 .8-3-1zM134.5 218l2.5.5-5 4 2.5-4.5zM188.5 219q3.5 2-1 4l-.5-2.5 1.5-1.5zM149.5 220l12.5.5-12.5.5v-1zM185.5 221v3l-2.5-1.5 2.5-1.5z" />
              <path fill="#6D9ABF" opacity=".2" d="M149.5 222l2 1 1-1h9v1q-10.8-2.2-13 4l-2.5-1.5.5-1.5-4.5-.5 4.5-.5 2 3q2.8-1.2.5-2.5l.5-1.5zM52.5 223l4 5-2.5-1.5-1 2q2.7 1.8-1.5 3.5l-.5-2.5 2-2-1-2 .5-2.5zM84.5 223l-.5 3.5-.5 2.5-.5-4.5 1.5-1.5zM34.5 224l5 4h2l1.5-.5-1.5-2.5-1.5-.5 1.5-.5 3 1 1.5.5-1.5.5-1.5-.5.5 1.5 2.5.5-4 2-.5 1.5-1-3-1 2-1.5-.5 1 3-1.5-.5-1.5.5 1 1-5.5 5.5 5.5-8.5 1-3-2.5-1.5v2l-2.5-1.5 1.5-2.5zM68.5 225l-.5 1.5-1.5 2.5.5-1.5 1.5-2.5zM88.5 226l3.5.5-.5 1.5-2-1-.5 4.5.5 1.5-1.5-.5-1-3 1.5-3.5zM170.5 226l1.5.5 1 2-3 1 2 1-7.5 4.5q-1.2-2.2-2.5.5l1 2-3 2 1.5 3.5 3 1 1.5-3.5-4-1 3.5-.5 1.5 2.5-1.5 3.5-2.5.5 3 2-1.5-.5-3.5-1.5 2-1-3-2-.5-2.5-1 3q-5-1-6 2l2-3 3.5-.5-1.5-2.5-7 1v-1l8.5-1.5-6-1 5.5-.5 2 1 5.5-4.5-.5 1.5 2.5-1.5q-2.2-1.2.5-2.5l2 1 1-5zM137.5 228l1.5 1.5-.5 2.5-1.5-1.5.5-2.5zM143.5 228l-1.5 2.5 1 2-4 3 3-3-1-1 2.5-3.5zM49.5 229l.5 1.5-4 3 3.5-4.5zM81.5 229l1.5 2.5-.5 1.5 4-1 .5 2.5-1.5 1.5v-2l-4.5-.5-1-2h2l-.5-2.5zM129.5 229v2l3-1v1q-5.7 1.3-8.5 5.5l-.5 1.5-.5-1.5 2.5-3.5-1.5-.5 2.5-1.5 2 1 1-3zM43.5 230l1.5 3.5-2-1 .5-2.5zM71.5 230l1 2-2.5-.5 1.5-1.5zM24.5 231l1 2-2.5-.5 1.5-1.5zM77.5 232l2.5 1.5-2.5 1.5v-1l1.5-.5-1.5-1.5zM49.5 233l4.5 1.5-5.5.5 1-2zM69.5 233l2.5.5-1.5 1.5-2.5-.5 1.5-1.5zM67.5 236l1 2 1-2 .5 1.5-1.5 3.5-1-5zM114.5 236l3.5 1.5-6.5 3.5-.5-2.5 1.5-1.5v2l3.5-1.5-1.5-1.5zM119.5 236l2.5.5 1 5h-1l-1.5-4.5-1-1zM28.5 237q2.8 1.2.5 2.5l1 2-2.5.5-2-2-2.5 1.5 4-3q-2.2 1.2.5 2.5l1.5-2.5-.5-1.5zM142.5 239l1.5.5-3.5 1.5v-1l2-1z" />
              <path fill="#6D9ABF" opacity=".2" d="M169.5 239l1.5.5-2 1 2 1-1.5.5q-3-1.5 0-3zM108.5 240l.5 2.5-3.5 3.5-2.5-.5 5.5-5.5zM56.5 241l1.5 4.5-3.5 1.5-6.5-.5 7.5-1.5 1.5.5-.5-4.5zM143.5 241l1.5.5-3.5 1.5v-1l2-1zM176.5 241l2.5.5-2 1 1.5 4.5-2.5-2.5v-2l.5-1.5zM186.5 243l5 6h-2l-3.5-3.5.5-2.5zM33.5 244l.5 2.5-2.5 2.5-.5-2.5 2.5-2.5zM64.5 244l1.5 2.5h-3l1.5-2.5zM155.5 244l-1.5 2.5-.5 1.5-.5-1.5 2.5-2.5zM123.5 245l5.5 1.5-4.5.5-1-2zM167.5 246l6.5 5.5-1.5.5-5-6zM29.5 248v3l-1.5-.5-.5 1.5-1-2 3-2zM43.5 248l-1.5 2.5 1 1-2.5 2.5 1.5-2.5-1-1 2.5-2.5zM137.5 248l1.5.5-2 1 2 1-1.5.5-4.5-1.5 4.5-1.5zM142.5 250l5.5 2.5-2.5.5-2-1v2q-4.5-2-1-4zM151.5 250l.5 3.5-2.5.5v-1l1.5-.5.5-2.5zM189.5 251l2.5.5-.5 1.5-2 1v-3zM182.5 254l2.5.5-.5 1.5-2-2z" />
              <path fill="#9ECDF8" opacity=".9" d="M130.5 5l.5 1.5Q115.1 20.6 106.5 42l-15 7-.5-2.5 5-14-1.5-.5Q77.8 41.8 66 56.5q-19.5 23-29 56l-6 29v27l2 1q6.3-29.7 19.5-52.5l5 2 .5-2.5-1-2 2.5 1.5 6 2 .5-1.5-3-6 1.5-.5 9 3-.5-1.5-2-5 1.5-.5 9 4 .5-2.5-2-5 1.5.5 9 3 .5-3.5-2-4 1.5-.5 5.5 3.5v8l3 11-1.5-.5-5-2-.5 1.5 4 8-2.5.5-5-2 .5 1.5v3l4 6-1 3 3.5.5 9-9h2l12.5 6.5 1 8q-2.4 5.1-10.5 4.5-5.3-5.2-17-4-16.1 3.4-23.5 15.5l-.5 1.5-.5-2.5 9-23-7 6q-14 17-22.5 39.5l-.5-3.5 4-18 8-23-2 1q-11 14.5-18 33l-4 13-2 10v9l-1.5 2.5-3.5-12.5-2-18-1-1v-34l6-31 9-25Q52.2 58.2 72.5 39l25-19 15-8 18-7zM219.5 17l1.5 1.5v5l3 13 1 23 1 3v2l-1 25-1 1-1 12-7 24-4 7 4.5.5 6-2 1 2q-5.1-.6-6.5 2.5l-2 5q7.3 6.2 7 20l-8.5 8.5-6 1-1.5-1.5v-14l1-1v-10h-1l-8.5 13.5-1.5-.5-1-4q10-10.5 16-25l4-12 2-17-3-17 7-3-.5-1.5h-8l-1.5-1.5-4-8 4-10 3.5-3.5 8.5-4.5-.5-1.5-8 1-.5-2.5 3-10 2.5-20.5z" />
              <path fill="#9ECDF8" opacity=".9" d="M181.5 18l.5 2.5q-3.9 17.6-15.5 27.5l-12 7-22 6-9 4q-5.3-5.2-17-4-9 1.5-13.5 7.5L82.5 86l-12-1Q64 86.5 61 91.5l-3 7q.8 6.8-1.5 10.5l-3 1-.5-6.5Q56.4 88.4 66.5 80l29-21 13-6 41-12q18.7-7.8 31.5-21.5l.5-1.5z" />
              <path fill="#9ECDF8" opacity=".9" d="M192.5 33l3 4 9.5 6.5q-13.1 9.9-29.5 16.5l-6-2-14.5-.5q13.4-5.1 21-16l2.5-4.5 7 3 4.5-3.5 2.5-3.5zM192.5 54l1 2-6 2 1-2 4-2zM208.5 54l2.5.5-45 21 2 3h-2l.5 1.5 2 1h25v-1l-2.5-.5 5.5-.5 3.5 2.5-25.5 4.5h-7l-2.5 1.5 1.5 2.5h6l16.5 3.5-.5 1.5-1-1h-44l-8.5-2.5q2.8-1.7 2-7l-2-3 10.5-1.5 43-18 14.5-4.5-2-1 1.5-.5 2 1v-2l4-1zM150.5 60h16l3.5 1.5-28.5 7.5q-11 4.5-18 13l-27 8-36 16-.5-5.5 3-8 3.5-3.5 12-1 4 1 8-9q3.2-2.3 10-1l5.5-3.5q2.7-3.3 2-10l1.5-1.5 8 1 7 3 11-5 15-3zM68 91l-2 1-2 3 1 2q0-4 6-3v-2l-3-1z" />
              <path fill="#9ECDF8" opacity=".9" d="M197.5 63l1.5.5-11 9 3 4-16.5.5-3.5-1.5L197.5 63z" />
              <path fill="#9ECDF8" opacity=".9" d="M200.5 65l1.5.5 6 11-11.5.5-5.5-3.5.5-1.5 9-7zM93.5 74l4.5 1.5-4.5.5v-2zM202.5 79l5.5.5q-1.7 2.3-6.5 1.5l1-2zM209.5 82l1.5.5 3 13v12l-5 19q-6.6 15.4-17.5 26.5l.5-1.5q6-8.5 9-20l2-17-4-17 5-1-6.5-2.5-4.5-4.5 1.5-2.5 15-5zM189.5 85l2.5.5-10.5 4.5-6.5-1.5 1.5-1.5h6l7-2zM188.5 89l2.5 1.5-.5 1.5-1-2-2 1 1-2zM131.5 93q9.4 2.1 14.5 8.5.5 4-2.5 4.5l-22 8-13 10 .5-1.5 23-28-.5-1.5zM116.5 97l2.5 1.5-1.5-.5-1.5.5-.5 1.5-.5-1.5 1.5-1.5zM110.5 103q3.8-.7 4.5 1.5l-1.5-.5q-4 .8-3-1zM186.5 117l5.5.5-5.5.5v-1zM164.5 118l3.5 1.5 2 6-13 9q-7.4 9.1-5 28 1.7 10.8 8 17v3l-11.5 6.5-18.5 7.5 1.5 2.5 21-9-4.5 5.5-15.5 24.5-1.5-1.5-1-14q-5.5-7.5-7-19l6.5-12.5 10-4 4.5-4.5q3.3-4.7 2-14l-3.5-6.5-2.5-1.5 3.5-6.5 4-2 8-1 2.5-2.5 6.5-12.5z" />
              <path fill="#9ECDF8" opacity=".9" d="M178.5 119l.5 2.5-2 1 1 2q-3.9 10.1-11.5 16.5l-7 5h-2l-.5-1.5q2.8-9.7 10.5-14.5l8.5-6.5 2.5-4.5zM128.5 137l10.5.5-2.5 3.5h-7l-7.5 6.5-2 10-3.5 5.5q-1.9-3.6-8-3l-1.5.5 5.5-8.5q5.5.5 7.5-2.5l3-5q-1.2-5.2 1.5-6.5l4-1zM230.5 141l3.5 2.5-5.5.5-.5-1.5 2.5-1.5zM168.5 142l2.5 1.5-1.5-.5-2 1 1-2z" />
              <path fill="#9ECDF8" opacity=".9" d="M131.5 143l4.5.5-4.5.5v-1zM139.5 145q5 3.5 4.5 12.5-1.5 6.5-6.5 9.5l-11 5-3.5-2.5 17-18 1-4-1.5-2.5zM104.5 150l4.5 2.5-6.5 10.5-3.5-6.5 5.5-6.5zM223.5 154l1.5 3.5-1.5.5v-4zM192.5 155l1.5.5v5l2 7-6.5 5.5q-5.7.3-8.5 3.5l-2.5 6.5-1.5-5.5 5.5-13.5 9.5-7.5.5-1.5z" />
              <path fill="#9ECDF8" opacity=".9" d="M203.5 159l.5 2.5q-2.2 1.3-1 6l3.5 5.5 3 1 4-1-.5 1.5-1.5 3.5-14 6-13 10q-3.6-4.9-2.5-14.5l1.5-2.5q10.9-1.6 15.5-9.5l4.5-8.5zM85.5 160l3.5 1.5-3.5.5v-2zM100.5 165l4.5.5-4.5.5v-1zM92.5 173l.5 1.5-2 5-1 9q2.8 1.7 1 8l4.5 8.5 4.5-18.5 6.5-8.5 2-1 .5 3.5-3 7q.8 6.8-1.5 10.5l-2.5.5 1 18-3.5.5q-1.2-2.3-6-1l-3.5-2.5q-3.7-2.3-3-9l2-6v-17l-2-4 5.5-4.5zM171.5 177l3.5 1.5 1 3-7 17-.5 4.5-8.5 3.5q-.5 4 2.5 4.5 4.8 2.2 13 1l5-1 4 5 5.5 2.5q-6.2 5.8-17.5 6.5-7.1-6.9-23-5-1.8 2.8-8 1l-2.5-1.5-1-2q8.2-18.8 22.5-31.5l11-9zM76.5 180l.5 5.5h-1l.5-5.5z" />
              <path fill="#9ECDF8" opacity=".9" d="M84.5 180l1.5.5 1 14-4 14-6.5 6.5-8.5 6.5-4.5 7.5-2 1-9.5-7.5.5-2.5 1 3 6 1 1.5-5.5 8-14v-10l-1-2 5.5-8.5 3 14 1.5-1.5 2-9 4.5-7.5zM120.5 186l.5 4.5 7 18-19.5 15.5-1.5-1.5-2-9v-13h1l.5 3.5 1.5-.5q4.3-10.7 12.5-17.5zM57.5 187l1.5 6.5q-2 3.5-4-1l2.5-5.5zM61.5 190l.5 5.5h-1l.5-5.5z" />
              <path fill="#9ECDF8" opacity=".9" d="M53.5 194l4.5 3.5-.5 3.5q-5.7.8-6.5-3.5l2.5-3.5zM182.5 200l1.5.5-3.5 1.5v-1l2-1z" />
              <path fill="#9ECDF8" opacity=".9" d="M50.5 201l5.5 2.5q.6 6.6-3.5 8.5-3.8-3.9-2-11zM74.5 219l1.5.5v4l-8 11q-1.8 9.7-7.5 15.5l-6 1-3.5-1.5.5-1.5 3 1q5.3-1.7 3.5-10.5l-2.5-3.5-5.5-1.5.5-1.5 4-3q2.2 3.8 9 3l2.5-1.5q2.6-7.4 8.5-11.5zM99.5 222l.5 1.5-6 5 .5-2.5 5-4zM152.5 223q13.2-1.7 18.5 4.5l-12.5 9.5q-1.2-2.3-6-1l-15 5-.5-1.5 10.5-12.5 5-4zM35.5 224q4.8-.7 6.5 1.5l-.5 1.5-2 1-4-4zM78.5 224l3.5 1.5q.6 5.1-2.5 6.5l-5.5-1.5 4.5-6.5zM84.5 226l2.5 1.5q1 4.5-1.5 5.5l-3.5-.5 2.5-6.5zM89.5 227l2.5 1.5-1.5 3.5-1.5-.5.5-4.5zM43.5 228l5.5 1.5-2.5 3.5-1-2-3.5-1.5 1.5-1.5z" />
              <path fill="#9ECDF8" opacity=".9" d="M133.5 230q4.8-.7 5.5 2.5l-5 8 2.5 3.5h3l9-4 8-1 1.5 2.5q-4.7-.2-6 3l-1.5 8.5-5-1-10-5h-6l-7.5-2.5q.1-8.4 5.5-11.5l6-3zM50.5 236l3.5 1.5-1.5-.5q-3 .5-2-1zM161.5 240l4.5.5-1.5 3.5-3.5-1.5.5-2.5zM177.5 242h2l1.5.5-2 1 3.5 4.5-5-6zM154.5 252l4.5.5-4.5.5v-1z" />
              <path fill="#E0F1FC" opacity=".9" d="M105.5 13l.5 1.5-2.5 1.5 2-3zM180.5 18l.5 1.5Q168.2 33.2 149.5 41l-29 8-25 10Q76.4 70.4 61 85.5q-7.5 9-8.5 24.5l-4 1-.5-2.5 1-3v-2Q51.9 83.4 64.5 73q13.5-13.5 31-23l20-9 20-6 2-2h3l11-5q1.5 2.5 3-1l15-4 11-5zM169.5 19l2.5.5-3.5 1.5 1-2zM155.5 24l2.5.5-3.5 1.5 1-2zM183.5 27q6.2-1.7 8 1l2-1 1.5 2.5-7.5 9.5-4 1-4.5-2.5 4.5-10.5z" />
              <path fill="#E0F1FC" opacity=".9" d="M96.5 31l-.5 1.5L90.5 50Q75 57.5 64 69.5l-.5 1.5-4.5 3.5q-10 12-14 30v2l1 3-1 3 7 5Q39.2 140.7 32.5 170l-1.5-1.5v-27l6-29q5.6-19.9 15-36Q63.9 55.9 81.5 41l15-10zM121.5 36l2.5.5-3.5 1.5 1-2zM203.5 56l1.5.5-16.5 5.5-43 18-10.5 1.5q2.8 1.7 2 7l-2.5 3.5-.5-2.5v-2l1-2-2.5-3.5-3.5-1.5 8.5-6.5 9-4 15-3 4-2h5l12-4h5l3-2 13-3zM100.5 64l1.5.5-4.5 3.5-.5-1.5 3.5-2.5zM102.5 66l2.5.5-2.5 7.5-4 2-4.5-1.5 3.5-5.5 5-3zM165.5 77l2.5 1.5.5-1.5q1 3 6 2h10l1-1 8.5 2.5-25.5.5-2.5-1.5-.5-2.5zM197.5 79l4.5.5-3.5 1.5-1-2zM126.5 81l-1 2-5 4v-3l1 1 3-3 2-1zM125.5 84q4.5-1 5.5 1.5l-.5 4.5-14.5 5.5.5 1.5-3-1-3 2-.5-1.5L125.5 84zM108.5 89l3.5.5-.5 2.5-3-3zM102.5 91l1.5.5 1 3-1.5-.5-3.5-1.5 2.5-1.5zM128.5 93l3.5 1.5-25.5 30.5-1.5.5-3.5 4.5-1.5-.5L125.5 94l3-1zM94.5 94l1.5.5 1 4-1.5-.5-4.5-2.5 3.5-1.5zM144.5 95l-.5 1.5-.5 1.5-1-2 2-1zM176.5 95l7 2 3-1 4 1h2l3.5 1.5 3 7q-2.6 3.9-8.5 4.5l-2-1h-2l-4.5-1.5v-3l-4.5-8.5-1-1zM85.5 98l1.5.5 1 4-1.5-.5-4.5-1.5.5-1.5 3-1zM116.5 98l1.5.5-1 2 .5 1.5q-2.5-1-1-4zM76.5 102l2.5 3.5-1.5.5-4.5-1.5 3.5-2.5zM111.5 104l2.5.5-1.5 2.5-1-3zM67.5 106l1.5.5 1 2-2.5.5-2.5-1.5 2.5-1.5zM106.5 109l3.5 1.5-1.5 2.5-1.5-.5-.5-3.5z" />
              <path fill="#E0F1FC" opacity=".9" d="M58.5 110l2.5.5-.5 3.5-3.5-2.5 1.5-1.5zM197.5 110l1.5.5 1 2q-3.4 6.1-14.5 4.5l-2.5-1.5-1-3 4.5-.5h2l3 1 6-3zM52.5 113l2.5 1.5-.5 1.5-2.5-1.5.5-1.5zM101.5 115l3.5 2.5-2.5 3.5q-2.5-2-1-6zM122.5 115l-1 2-2 1 1-2 2-1z" />
              <path fill="#E0F1FC" opacity=".9" d="M198.5 117l1.5.5-1 3v2l-1.5 2.5-4 2q-1.5-2.5-3 1l-2-2q-4.7.8-6.5-1.5l-1-2 1.5-3.5q3.5 2.5 11 1l5-3zM96.5 122l4.5 2.5-3.5 2.5-1-5z" />
              <path fill="#E0F1FC" opacity=".9" d="M179.5 127l4 1 1.5-.5-.5 1.5 2 1 2-1 3 1 3-1 3-1 .5 4.5-1.5 2.5-7 3-10-2-2.5-2.5 2.5-6.5zM92.5 129l3.5 2.5-1.5 2.5-3.5-3.5 1.5-1.5zM174.5 136l9 4 4-1 2 1 3-1 2.5.5-3.5 6.5h-2l-3 1-3-1-3-1h-2l-6.5-3.5.5-3.5 1.5-.5.5-1.5zM221.5 136l2.5.5 3 9-1 3v2l-1 2v2l-.5 1.5-1.5-2.5v-2q-.8-6.2-5-9v-3l3.5-3.5zM128.5 143l1 1h8l3.5 3.5-1 4-16.5 17.5-2-1-5 1-.5-1.5 2-1 5-9q-.5-7.5 3-11-2.3-1.2.5-2.5v2l2.5-1.5-.5-1.5zM168.5 143l6 4 7 2h2l5-1q3.3 1.8-.5 3.5l-.5 1.5-9 1-3-1q-6.4-.1-8.5-4.5l-1-4 2.5-1.5zM230.5 146l2.5 1.5-1 4v2l-4.5 12.5-1.5-.5 2-5v-2l-1-2 2-4-1-3 .5-2.5 2-1z" />
              <path fill="#E0F1FC" opacity=".9" d="M162.5 147l1.5.5 4.5 6.5 8 3h4l3.5.5-6.5 4.5-4-1-2 1-7.5-5.5-3-8 1.5-1.5z" />
              <path fill="#E0F1FC" opacity=".9" d="M158.5 152q2.6 6.9 8 11l6 2 3-2 .5 1.5-8.5 6.5-8.5-12.5-.5-6.5zM187.5 155l-.5 1.5.5 1.5 1.5-.5-2.5 2.5-2.5-.5 3.5-4.5zM86.5 157l2.5.5-4.5 1.5v-1l2-1zM92.5 158q5.5-1 6.5 2.5l1 2-4 3-.5 2.5-4-5-4.5-2.5 5.5-2.5zM234.5 158l.5 1.5-1 3q-1.5 7.6-6.5 11.5l-.5-1.5q2.2-8.8 7.5-14.5zM180.5 162l-.5 1.5-.5 2.5-2.5-.5 3.5-3.5zM197.5 162l1.5 2.5-2 1 1-2-.5-1.5zM108.5 163q4.8-.7 5.5 2.5l1 3-5.5 4.5-4-5-4-1-2 1-.5-1.5q7 .5 9.5-3.5z" />
              <path fill="#E0F1FC" opacity=".9" d="M84.5 164q6.2-.7 7.5 3.5l1 2-10 8-5.5 9.5-1.5-.5 1-1v-10l4.5-9.5 3-2zM235.5 165l.5 1.5-2.5 3.5.5-1.5 1.5-3.5zM173.5 168l.5 1.5-4.5 2.5 1-2 3-2zM99.5 170l3 1q4-.5 4.5 2.5l-1.5 2.5-3.5 2.5q-5.4 7.6-7.5 18.5l-2.5-7.5 3-15 4.5-4.5zM67.5 171l-1 2-2 1 1-2 2-1zM120.5 171l4.5 2.5q1 5.5-2.5 6.5l-3-6-3 1-3.5-1.5 1.5-1.5q4.7 1.2 6-1zM70.5 172l4.5.5-1 9 1 2-2 1-5 9 1 1v10l-8 14-1.5 5.5-6.5-1.5-1-3 8-15 2-14-2-9 6.5-7.5 4-2z" />
              <path fill="#E0F1FC" opacity=".9" d="M118.5 175l.5 2.5v6L108.5 198l-.5-6.5q2.3-1.2 1-6l3.5-7.5 6-3zM177.5 184l2.5 1.5-1.5.5-2.5-.5 1.5-1.5zM157.5 186l.5 1.5-4 3 3.5-4.5zM186.5 197l5.5 4.5-2.5-1.5-3-3zM184.5 200l5.5 2.5 4 7-1 2v2l-2.5 4.5q-5.9-.6-8.5-4.5l-1.5-2.5-15 1-5.5-3.5.5-2.5 9-3 5 1 10-4zM190.5 219l1.5.5-3 2 1.5-2.5zM29.5 226l-4 5 1.5-2.5.5-1.5 2-1zM145.5 226l1.5.5-5 4 3.5-4.5z" />
              <path fill="#E0F1FC" opacity=".9" d="M32.5 227h2l2.5 2.5-1.5 2.5-2.5 1.5-.5 1.5-10 6 .5-1.5q1.4-8.1 7.5-11.5l2-1zM38.5 233q5.3-1.2 6.5 1.5l-.5 2.5-5.5 4.5q2.3 1.3-.5 2.5v-2q-5.8.7-8.5 4.5l-1.5 2.5-1.5-.5q2.4-9.6 9.5-14.5l2-1zM47.5 233l.5 2.5-1.5 1.5-.5-2.5 1.5-1.5zM85.5 234l-1 2-2.5-.5 3.5-1.5z" />
              <path fill="#E0F1FC" opacity=".9" d="M48.5 237q4.8-.7 6.5 1.5l1 2-1 2q2.7 1.7-1.5 3.5l-9 1-5.5 4.5-.5 1.5-1.5-.5q2-10 9.5-14.5l2-1zM118.5 237l2.5.5-1.5 6.5-2 1h-4q-5.3-.8-7 2l-.5-1.5 12.5-8.5zM182.5 241l4.5 3.5-2.5-1.5-2-2zM171.5 242l10.5 8.5 2 3-1.5.5-11.5-4.5-1.5-2.5-2.5-1.5 1.5-2.5 3-1zM178.5 242l8.5 4.5 1.5 2.5 2.5 1.5-1.5.5-6.5-2.5-4.5-6.5zM155.5 243l14.5 8.5 2 4-3.5.5-5-3-9.5-1.5-1-3 3-4-.5-1.5zM36.5 244l1 2h-2l-1.5-.5 2.5-1.5z" />
            </g>

            {/* 4. 테두리 링 */}
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="url(#soulMinionRingGrad)" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="28.2" fill="none" stroke="#bae6fd" strokeWidth="0.5" strokeOpacity="0.85" />

            {/* 5. 영혼 마력 스파클 */}
            <path d="M 49 14 Q 49 16.2 51.2 16.2 Q 49 16.2 49 18.5 Q 49 16.2 46.8 16.2 Q 49 16.2 49 14 Z" fill="#e0f2fe" opacity="0.95" />
            <circle cx="14" cy="46" r="1" fill="#7dd3fc" opacity="0.85" />
            <circle cx="48" cy="44" r="0.7" fill="#ffffff" opacity="0.75" />
          </g>
        )}

        {/* 특성의 역전 (Ability Inversion: 볼드 강조 스왑 화살표 & 메가 스파크 코어) */}
        {id === "abilityInversion" && (
          <g>
            {/* 백그라운드 원 & 듀얼 링 */}
            <circle cx="32" cy="32" r="29.5" fill="url(#inversionBgGrad)" stroke="url(#inversionRingGrad)" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="27.5" fill="none" stroke="#1e293b" strokeWidth="0.8" />

            {/* 상단 화살표 (태양/골드 - 시계방향 우측 스왑) */}
            <g filter="url(#inversionGlowSun)">
              <path d="M 12 31 C 12.5 18, 22.5 9.5, 35 9.5 C 41.5 9.5, 47 11.8, 51 15 L 47 20.5 C 43.5 17.8, 39.5 16, 35 16 C 26 16, 19 22.5, 18 30.5 Z" fill="url(#inversionArrowSun)" stroke="#fef08a" strokeWidth="0.5" strokeLinejoin="round" />
              <path d="M 44.5 9 L 57.5 18.5 L 44 26 L 47.8 18.5 Z" fill="url(#inversionArrowSun)" stroke="#ffffff" strokeWidth="0.8" strokeLinejoin="round" />
              <path d="M 16 28 C 19 18, 27 12.8, 36 12.8 C 41 12.8, 46 14.5, 49.5 17.5" fill="none" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
            </g>

            {/* 하단 화살표 (메가/시안 - 시계방향 좌측 스왑) */}
            <g filter="url(#inversionGlowMega)">
              <path d="M 52 33 C 51.5 46, 41.5 54.5, 29 54.5 C 22.5 54.5, 17 52.2, 13 49 L 17 43.5 C 20.5 46.2, 24.5 48, 29 48 C 38 48, 45 41.5, 46 33.5 Z" fill="url(#inversionArrowMega)" stroke="#e0f2fe" strokeWidth="0.5" strokeLinejoin="round" />
              <path d="M 19.5 55 L 6.5 45.5 L 20 38 L 16.2 45.5 Z" fill="url(#inversionArrowMega)" stroke="#ffffff" strokeWidth="0.8" strokeLinejoin="round" />
              <path d="M 48 36 C 45 46, 37 51.2, 28 51.2 C 23 51.2, 18 49.5, 14.5 46.5" fill="none" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
            </g>

            {/* 중앙 메가 스왑 에너지 코어 */}
            <circle cx="32" cy="32" r="5" fill="#0f172a" stroke="#475569" strokeWidth="0.8" />
            <path d="M 32 24 Q 32 32 40 32 Q 32 32 32 40 Q 32 32 24 32 Q 32 32 32 24 Z" fill="#ffffff" />
            <circle cx="32" cy="32" r="1.8" fill="#38bdf8" />
          </g>
        )}

        {/* 영혼의 주사위 (메이플스토리 감성 빨간색 3D 주사위 + 황금 테두리 + 양피지 스크롤 & 별빛 스파클) */}
        {id === "soulDice" && (
          <g filter="url(#glow)">
            <circle cx="32" cy="32" r="29.5" fill="#38bdf8" fillOpacity="0.18" stroke="url(#soulDiceRingGrad)" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="27.5" fill="none" stroke="#fed7aa" strokeWidth="0.6" strokeDasharray="3 2" opacity="0.6" />

            <circle cx="16" cy="18" r="1.4" fill="#fde047" />
            <circle cx="48" cy="15" r="1.2" fill="#ffffff" />
            <circle cx="49" cy="48" r="1.3" fill="#fde047" />
            <circle cx="15" cy="46" r="1.2" fill="#ffffff" />

            <g transform="translate(32 31.5) scale(0.48) translate(-50 -50)">
              <polygon points="50,16 82,32 50,48 18,32" fill="#ef4444" stroke="#991b1b" strokeWidth="2.5" strokeLinejoin="round" />
              <ellipse cx="50" cy="32" rx="5" ry="3.5" fill="#ffffff" />

              <polygon points="18,32 50,48 50,84 18,68" fill="#dc2626" stroke="#7f1d1d" strokeWidth="2.5" strokeLinejoin="round" />
              <ellipse cx="28" cy="45" rx="4" ry="4.6" fill="#ffffff" />
              <ellipse cx="34" cy="58" rx="4" ry="4.6" fill="#ffffff" />
              <ellipse cx="40" cy="71" rx="4" ry="4.6" fill="#ffffff" />

              <polygon points="50,48 82,32 82,68 50,84" fill="#991b1b" stroke="#581313" strokeWidth="2.5" strokeLinejoin="round" />
              <ellipse cx="62" cy="55" rx="4" ry="4.6" fill="#ffffff" />
              <ellipse cx="70" cy="68" rx="4" ry="4.6" fill="#ffffff" />
            </g>

            <path d="M 25 48.5 Q 32 51.5 39 48.5" fill="none" stroke="#d97706" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
          </g>
        )}

        {/* 위협 (사자 일러스트 + 아이스 블루 링) */}
        {id === "intimidate" && (
          <g clipPath="url(#lwClip)">
            <image href="/pokemon/img/augment/intimidate.png" x="1" y="1" width="62" height="62" preserveAspectRatio="xMidYMid slice" />
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="url(#intimidateRingGrad)" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="28.2" fill="none" stroke="#93c5fd" strokeWidth="0.5" strokeOpacity="0.75" />
          </g>
        )}

        {/* 곰은 사람을 찢어 (유저 커스텀 일러스트 + 원형 클리핑 & 아이스 블루 링) */}
        {id === "threeBears" && (
          <g clipPath="url(#lwClip)">
            <image href="/pokemon/img/augment/threeBears.png" x="1" y="1" width="62" height="62" preserveAspectRatio="xMidYMid slice" />
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="url(#threeBearsRingGrad)" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="28.2" fill="none" stroke="#bae6fd" strokeWidth="0.5" strokeOpacity="0.75" />
          </g>
        )}

        {/* 곰 한마리 버프 (발자국 1개 + 브론즈/앰버 링) */}
        {id === "oneBear" && (
          <g>
            <circle cx="32" cy="32" r="29.5" fill="url(#oneBearBg)" />
            <circle cx="32" cy="33" r="16" fill="#f59e0b" opacity="0.15" filter="url(#glow)" />
            {/* 곰 발바닥 (중앙 1개) */}
            <ellipse cx="32" cy="38" rx="8" ry="6" fill="#d97706" />
            <ellipse cx="32" cy="37.5" rx="6.5" ry="4.8" fill="#f59e0b" />
            {/* 발가락 4개 */}
            <circle cx="23" cy="29" r="2.8" fill="#f59e0b" />
            <circle cx="28.5" cy="25" r="3.2" fill="#fbbf24" />
            <circle cx="35.5" cy="25" r="3.2" fill="#fbbf24" />
            <circle cx="41" cy="29" r="2.8" fill="#f59e0b" />
            {/* 상단 별 1개 */}
            <path d="M 32 12 Q 32 14.5 34.5 14.5 Q 32 14.5 32 17 Q 32 14.5 29.5 14.5 Q 32 14.5 32 12 Z" fill="#fef08a" opacity="0.95" />
            {/* 테두리 링 */}
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="url(#oneBearRingGrad)" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="28.2" fill="none" stroke="#fed7aa" strokeWidth="0.5" strokeOpacity="0.75" />
          </g>
        )}

        {/* 곰 두마리 버프 (발자국 2개 + 실버/시안 링) */}
        {id === "twoBears" && (
          <g>
            <circle cx="32" cy="32" r="29.5" fill="url(#twoBearsBg)" />
            <circle cx="32" cy="32" r="16" fill="#38bdf8" opacity="0.18" filter="url(#glow)" />
            {/* 좌측 발바닥 */}
            <g transform="translate(19, 36) scale(0.68)">
              <ellipse cx="0" cy="0" rx="8" ry="6" fill="#38bdf8" />
              <circle cx="-7" cy="-9" r="2.8" fill="#7dd3fc" />
              <circle cx="-2.5" cy="-12" r="3" fill="#bae6fd" />
              <circle cx="3.5" cy="-12" r="3" fill="#bae6fd" />
              <circle cx="8" cy="-9" r="2.8" fill="#7dd3fc" />
            </g>
            {/* 우측 발바닥 */}
            <g transform="translate(45, 36) scale(0.68)">
              <ellipse cx="0" cy="0" rx="8" ry="6" fill="#38bdf8" />
              <circle cx="-7" cy="-9" r="2.8" fill="#7dd3fc" />
              <circle cx="-2.5" cy="-12" r="3" fill="#bae6fd" />
              <circle cx="3.5" cy="-12" r="3" fill="#bae6fd" />
              <circle cx="8" cy="-9" r="2.8" fill="#7dd3fc" />
            </g>
            {/* 상단 별 2개 */}
            <path d="M 24 13 Q 24 15 26 15 Q 24 15 24 17 Q 24 15 22 15 Q 24 15 24 13 Z" fill="#e0f2fe" opacity="0.95" />
            <path d="M 40 13 Q 40 15 42 15 Q 40 15 40 17 Q 40 15 38 15 Q 40 15 40 13 Z" fill="#e0f2fe" opacity="0.95" />
            {/* 테두리 링 */}
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="url(#twoBearsRingGrad)" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="28.2" fill="none" stroke="#bae6fd" strokeWidth="0.5" strokeOpacity="0.8" />
          </g>
        )}

        {/* 곰 세마리가 한 집에 있어 (유저 커스텀 일러스트 + 원형 클리핑 & 아이스 블루 링) */}
        {id === "threeBearsHouse" && (
          <g clipPath="url(#lwClip)">
            <image href="/pokemon/img/augment/threeBearsHouse.png" x="1" y="1" width="62" height="62" preserveAspectRatio="xMidYMid slice" />
            <circle cx="32" cy="32" r="29.5" fill="none" stroke="url(#threeBearsHouseRingGrad)" strokeWidth="1.8" />
            <circle cx="32" cy="32" r="28.2" fill="none" stroke="#bae6fd" strokeWidth="0.5" strokeOpacity="0.75" />
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
    overflow: visible;
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
  transform: ${(props) => (props.$offsetX || props.$offsetY || (props.$scale && props.$scale !== 1) ? `translate(${props.$offsetX || 0}px, ${props.$offsetY || 0}px) scale(${props.$scale || 1})` : "none")};
`;

const DedicatedRing = styled.div`
  position: absolute;
  inset: 1px;
  border-radius: 50%;
  border: 1px dashed rgba(254, 240, 138, 0.6);
  pointer-events: none;
  z-index: 2;
`;
