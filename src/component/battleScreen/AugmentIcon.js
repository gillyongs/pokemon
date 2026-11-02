import React from "react";
import styled from "styled-components";

// 포켓몬 배틀 UI 스타일에 맞춘 룬 & 심볼 SVG 아이콘 세트 (틸/청록 & 골드 & 슬레이트 네이비 테마)
export const AugmentIcon = ({ id, size = 42 }) => {
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
        {(id === "swordAndShield" || id === "specialSwordAndShield") && (
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
