import React from "react";
import styled from "styled-components";

// 포켓몬 배틀 UI 스타일에 맞춘 룬 & 심볼 SVG 아이콘 세트 (틸/청록 & 골드 & 슬레이트 네이비 테마)
// 전용 증강별 포켓몬 도감번호 매핑
export const DEDICATED_AUGMENT_POKEMON = {
  danceOfGarchomp: "0445",
  danceGarchomp: "0445",
};

export const AugmentIcon = ({ id, size = 42, pokemon = null, pokemonId = null }) => {
  const pokeId = pokemonId || DEDICATED_AUGMENT_POKEMON[id] || (pokemon?.origin?.pokemon_id && (id === "danceOfGarchomp" || id === "danceGarchomp") ? pokemon.origin.pokemon_id : null);

  if (pokeId) {
    return (
      <IconFrame $size={size}>
        <DedicatedFrame $size={size}>
          <DedicatedBg />
          <DedicatedImg
            src={`/pokemon/img/pokemon/${pokeId}.webp`}
            alt="전용 증강"
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

          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* 스태프 마법 핑크/퍼플/블루 그라데이션 */}
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

          {/* 발광 필터 */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 베이스 배경 원 */}
        <circle cx="32" cy="32" r="30" fill="url(#bgGlow)" stroke="url(#prismRing)" strokeWidth="1.5" strokeOpacity="0.7" />

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

        {/* 2. 만두콘은 이왕걸을 슬프게 하지 않게 하려고 버텼다 (수호의 하트 & 방패 & 불굴의 오라) */}
        {id === "mandoocornEndure" && (
          <g filter="url(#glow)">
            {/* 수호의 날개형 아치 테두리 */}
            <path d="M14 42 C12 28 22 14 32 12 C42 14 52 28 50 42 C44 50 32 54 32 54 C32 54 20 50 14 42 Z" stroke="url(#prismRing)" strokeWidth="2" fill="rgba(100, 255, 218, 0.12)" strokeLinejoin="round" />
            {/* 견고한 중앙 하트 (버팀의 상징) */}
            <path d="M32 44 C26 38 20 34 20 27 C20 22 24 19 28 20 C30 21 31.5 23 32 25 C32.5 23 34 21 36 20 C40 19 44 22 44 27 C44 34 38 38 32 44 Z" fill="url(#prismGrad)" stroke="#ffffff" strokeWidth="1.2" />
            {/* 중앙 HP 1을 상징하는 빛나는 십자/플러스 마크 */}
            <path d="M32 27 L32 35 M28 31 L36 31" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            {/* ✦ 스파클 */}
            <path d="M46 14 Q46 18 50 18 Q46 18 46 22 Q46 18 42 18 Q46 18 46 14 Z" fill="#64ffda" />
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

        {/* 4. 돌려 돌려 돌림판 (순환 룰렛 휠 & 마법 순환 화살표) */}
        {id === "rouletteWheel" && (
          <g filter="url(#glow)">
            {/* 순환 회전 화살표 링 */}
            <path d="M32 12 A20 20 0 1 1 14 38" stroke="url(#prismRing)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M11 31 L14 39 L22 37" fill="none" stroke="url(#prismRing)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* 내부 룰렛 나침반 다이얼 */}
            <circle cx="32" cy="32" r="14" stroke="url(#goldGrad)" strokeWidth="1.5" fill="rgba(15, 23, 42, 0.6)" />
            {/* 룰렛 분할선 (8방향 살) */}
            <path d="M32 18 L32 46 M18 32 L46 32 M22 22 L42 42 M42 22 L22 42" stroke="url(#prismGrad)" strokeWidth="1.2" strokeOpacity="0.7" />
            {/* 중앙 신비로운 물음표 룬 */}
            <path d="M29 27 C29 25 30.5 24 32 24 C33.5 24 35 25 35 26.5 C35 28.5 32 29.5 32 32 M32 36 L32 37" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            {/* ✦ 스파클 */}
            <path d="M48 14 Q48 18 52 18 Q48 18 48 22 Q48 18 44 18 Q48 18 48 14 Z" fill="#fef08a" />
          </g>
        )}

        {/* 5. 오른손엔 방패 왼손엔 검 (대검 & 카이트 실드 교차 스왑) */}
        {id === "swordAndShield" && (
          <g filter="url(#glow)">
            {/* 힘의 아치 테두리 */}
            <path d="M18 50 C12 40 14 22 26 14 M38 14 C50 22 52 40 46 50" stroke="url(#prismRing)" strokeWidth="2" strokeLinecap="round" />
            {/* 왼쪽 방패 */}
            <path d="M26 22 C32 22 34 26 34 32 C34 40 26 46 26 46 C26 46 18 40 18 32 C18 26 20 22 26 22 Z" fill="url(#prismGrad)" stroke="#ffffff" strokeWidth="1.2" strokeLinejoin="round" />
            {/* 방패 내부 엠블럼 */}
            <path d="M26 26 L26 40 M21 31 L31 31" stroke="#0d1722" strokeWidth="1.5" strokeLinecap="round" />
            {/* 오른쪽을 향해 교차하는 빛나는 대검 */}
            <g transform="rotate(40 38 32)">
              {/* 검신 */}
              <path d="M38 12 L41 16 L40 40 L38 43 L36 40 L35 16 Z" fill="#ffffff" stroke="url(#goldGrad)" strokeWidth="1" />
              {/* 코등이 & 손잡이 */}
              <path d="M33 40 L43 40 M38 40 L38 48 M36 49 L40 49" stroke="url(#goldGrad)" strokeWidth="1.8" strokeLinecap="round" />
            </g>
            {/* ✦ 스파클 */}
            <path d="M48 16 Q48 19 51 19 Q48 19 48 22 Q48 19 45 19 Q48 19 48 16 Z" fill="#fef08a" />
            <path d="M15 17 Q15 20 18 20 Q15 20 15 23 Q15 20 12 20 Q15 20 15 17 Z" fill="#67e8f9" />
          </g>
        )}

        {/* 6. 오른손엔 방패 왼손엔 스태프 (마법 지팡이 & 룬 방패 교차) */}
        {id === "specialSwordAndShield" && (
          <g filter="url(#glow)">
            {/* 신비로운 마법 아치 테두리 */}
            <path d="M16 48 C10 38 14 20 28 14 M36 12 C48 18 54 36 48 48" stroke="url(#magicStaffGrad)" strokeWidth="2" strokeLinecap="round" />
            {/* 왼쪽 마법 방패 */}
            <path d="M25 22 C31 22 33 26 33 32 C33 40 25 46 25 46 C25 46 17 40 17 32 C17 26 19 22 25 22 Z" fill="url(#prismGrad)" stroke="#ffffff" strokeWidth="1.2" strokeLinejoin="round" />
            {/* 방패 내부 마법 크리스탈 룬 */}
            <path d="M25 26 L29 32 L25 38 L21 32 Z" fill="#0f172a" stroke="#c084fc" strokeWidth="1.2" />
            <circle cx="25" cy="32" r="1.5" fill="#f472b6" />

            {/* 오른쪽을 향해 교차하는 마법 스태프 */}
            <g transform="rotate(38 39 32)">
              {/* 스태프 봉 (Shaft) */}
              <line x1="39" y1="18" x2="39" y2="47" stroke="url(#goldGrad)" strokeWidth="2.4" strokeLinecap="round" />
              <line x1="39" y1="20" x2="39" y2="45" stroke="#ffffff" strokeWidth="0.9" strokeLinecap="round" />
              {/* 스태프 하단 폼멜 (Pommel) */}
              <circle cx="39" cy="48" r="2" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="0.8" />

              {/* 스태프 상단 윙 브라켓 (Wings/Crescent Head) */}
              <path d="M33 16 C33 11 36 8 39 8 C42 8 45 11 45 16 C43 14 41 13 39 13 C37 13 35 14 33 16 Z" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="0.8" />
              <path d="M31 20 C32 15 35 11 39 11 C43 11 46 15 47 20 C44 17 42 16 39 16 C36 16 34 17 31 20 Z" fill="url(#magicStaffGrad)" />

              {/* 찬란한 마법 구체 (Orb) */}
              <circle cx="39" cy="15" r="4.2" fill="url(#magicOrbGlow)" stroke="#ffffff" strokeWidth="0.8" />
              <circle cx="37.8" cy="13.8" r="1.2" fill="#ffffff" />

              {/* 회전하는 마법 오라 링 */}
              <ellipse cx="39" cy="15" rx="7.2" ry="2.6" stroke="url(#prismRing)" strokeWidth="1.2" fill="none" strokeDasharray="3 2" transform="rotate(-20 39 15)" />
            </g>

            {/* ✦ 마법 스파클 */}
            <path d="M50 14 Q50 18 54 18 Q50 18 50 22 Q50 18 46 18 Q50 18 50 14 Z" fill="#f472b6" />
            <path d="M38 8 Q38 11 41 11 Q38 11 38 14 Q38 11 35 11 Q38 11 38 8 Z" fill="#c084fc" />
            <path d="M14 18 Q14 21 17 21 Q14 21 14 24 Q14 21 11 21 Q14 21 14 18 Z" fill="#67e8f9" />
          </g>
        )}

        {/* 7. H.H.G.G.H.G.G (모든 능력치를 가장 높은 능력치로 통일 - 전능의 헥사곤 스타 & 프리즘 젬) */}
        {(id === "hhgghgg" || id === "HHGGHGG") && (
          <g filter="url(#glow)">
            {/* 외곽 회전 마법진 링 */}
            <circle cx="32" cy="32" r="23" stroke="url(#prismRing)" strokeWidth="1.2" strokeDasharray="6 4" strokeOpacity="0.8" />
            <circle cx="32" cy="32" r="19" stroke="url(#goldGrad)" strokeWidth="1" strokeOpacity="0.6" />

            {/* 6방향(모든 능력치)으로 뻗어나가는 헥사그램 / 육각 별자리 라인 */}
            {/* 정삼각형 1 (상단) */}
            <polygon points="32,11 48,39 16,39" stroke="url(#goldGrad)" strokeWidth="1.8" fill="rgba(254, 240, 138, 0.08)" strokeLinejoin="round" />
            {/* 정삼각형 2 (하단) */}
            <polygon points="32,53 48,25 16,25" stroke="url(#prismRing)" strokeWidth="1.8" fill="rgba(100, 255, 218, 0.08)" strokeLinejoin="round" />

            {/* 각 꼭짓점 6개(능력치 노드)의 빛나는 오브 */}
            <circle cx="32" cy="11" r="2.4" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="0.8" />
            <circle cx="48" cy="25" r="2.4" fill="url(#prismGrad)" stroke="#ffffff" strokeWidth="0.8" />
            <circle cx="48" cy="39" r="2.4" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="0.8" />
            <circle cx="32" cy="53" r="2.4" fill="url(#prismGrad)" stroke="#ffffff" strokeWidth="0.8" />
            <circle cx="16" cy="39" r="2.4" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="0.8" />
            <circle cx="16" cy="25" r="2.4" fill="url(#prismGrad)" stroke="#ffffff" strokeWidth="0.8" />

            {/* 중앙으로 모여드는 6방향 에너지 광선 */}
            <line x1="32" y1="11" x2="32" y2="32" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.7" />
            <line x1="48" y1="25" x2="32" y2="32" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.7" />
            <line x1="48" y1="39" x2="32" y2="32" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.7" />
            <line x1="32" y1="53" x2="32" y2="32" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.7" />
            <line x1="16" y1="39" x2="32" y2="32" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.7" />
            <line x1="16" y1="25" x2="32" y2="32" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.7" />

            {/* 중앙 정점: 모든 수치를 통일하는 찬란한 다이아몬드 크리스탈 */}
            <polygon points="32,24 40,32 32,40 24,32" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="1.5" />
            <polygon points="32,27 37,32 32,37 27,32" fill="#ffffff" />

            {/* ✦ 화려한 스파클 */}
            <path d="M49 13 Q49 17 53 17 Q49 17 49 21 Q49 17 45 17 Q49 17 49 13 Z" fill="#fef08a" />
            <path d="M15 47 Q15 50 18 50 Q15 50 15 53 Q15 50 12 50 Q15 50 15 47 Z" fill="#64ffda" />
            <path d="M49 48 Q49 51 52 51 Q49 51 49 54 Q49 51 46 51 Q49 51 49 48 Z" fill="#38bdf8" />
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
`;

const DedicatedRing = styled.div`
  position: absolute;
  inset: 1px;
  border-radius: 50%;
  border: 1px dashed rgba(254, 240, 138, 0.6);
  pointer-events: none;
  z-index: 2;
`;
